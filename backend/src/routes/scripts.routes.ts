import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getDatabase } from '../services/database.service';
import { ScriptParserService } from '../services/scriptParser.service';

const router = Router();
const parser = new ScriptParserService();

// ============================================================================
// Types
// ============================================================================

interface Script {
  id: string;
  title: string;
  markdownSource: string;
  parsedJson: string;
  createdAt: string;
  updatedAt: string;
}

interface ScriptListItem {
  id: string;
  title: string;
  characterCount: number;
  sceneCount: number;
  createdAt: string;
}

// ============================================================================
// GET /api/scripts
// List all scripts (sorted by created_at DESC)
// ============================================================================

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const scripts = db.prepare(`
      SELECT id, title, parsed_json, created_at
      FROM scripts
      ORDER BY created_at DESC
    `).all() as Array<{ id: string; title: string; parsed_json: string; created_at: string }>;

    // Transform to list items with metadata
    const scriptList: ScriptListItem[] = scripts.map((script) => {
      const parsed = JSON.parse(script.parsed_json);
      return {
        id: script.id,
        title: script.title,
        characterCount: parsed.characters?.length || 0,
        sceneCount: parsed.scenes?.length || 0,
        createdAt: script.created_at,
      };
    });

    res.json({ scripts: scriptList });
  } catch (error) {
    console.error('Error listing scripts:', error);
    res.status(500).json({
      error: 'Failed to list scripts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// POST /api/scripts
// Upload and parse new script
// ============================================================================

router.post('/', (req: Request, res: Response) => {
  try {
    const { markdown } = req.body;

    // Validation
    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'markdown field is required and must be a string',
      });
    }

    if (markdown.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'markdown cannot be empty',
      });
    }

    // Parse markdown
    const parsed = parser.parse(markdown);

    // Generate ID
    const id = randomUUID();
    const now = new Date().toISOString();

    // Store in database
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO scripts (id, title, markdown_source, parsed_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      parsed.title,
      markdown,
      JSON.stringify(parsed),
      now,
      now
    );

    // Return created script
    res.status(201).json({
      id,
      title: parsed.title,
      characterCount: parsed.characters.length,
      sceneCount: parsed.scenes.length,
      createdAt: now,
      parsed,
    });
  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({
      error: 'Failed to create script',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// GET /api/scripts/:id
// Get script by ID with full parsed data
// ============================================================================

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const script = db.prepare(`
      SELECT *
      FROM scripts
      WHERE id = ?
    `).get(id) as any;

    if (!script) {
      return res.status(404).json({
        error: 'Not found',
        message: `Script with id ${id} not found`,
      });
    }

    // Parse JSON and return full script
    // Note: SQLite returns column names in snake_case
    const parsed = JSON.parse(script.parsed_json);

    res.json({
      id: script.id,
      title: script.title,
      markdown: script.markdown_source,
      parsed,
      createdAt: script.created_at,
      updatedAt: script.updated_at,
    });
  } catch (error) {
    console.error('Error retrieving script:', error);
    res.status(500).json({
      error: 'Failed to retrieve script',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// DELETE /api/scripts/:id
// Delete script (and cascade to sessions/audio)
// ============================================================================

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if script exists
    const script = db.prepare(`
      SELECT id FROM scripts WHERE id = ?
    `).get(id);

    if (!script) {
      return res.status(404).json({
        error: 'Not found',
        message: `Script with id ${id} not found`,
      });
    }

    // Delete script (cascades to sessions and audio_cache)
    db.prepare(`
      DELETE FROM scripts WHERE id = ?
    `).run(id);

    res.json({
      success: true,
      message: 'Script deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({
      error: 'Failed to delete script',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
