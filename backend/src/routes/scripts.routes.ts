import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { getDatabase } from '../services/database.service';
import { ScriptParserService } from '../services/scriptParser.service';
import { scriptAnalysisService } from '../services/scriptAnalysis.service';
import { characterPortraitService } from '../services/characterPortrait.service';
import { uploadProgressService } from '../services/uploadProgress.service';

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
// GET /api/scripts/upload-progress/:uploadId
// SSE endpoint for real-time upload progress
// ============================================================================

router.get('/upload-progress/:uploadId', (req: Request, res: Response) => {
  const { uploadId } = req.params;
  console.log(`[GET /upload-progress] New SSE connection for upload: ${uploadId}`);

  uploadProgressService.registerConnection(uploadId, res);
});

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
// Upload and parse new script (with OpenAI analysis)
// ============================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const { markdown, uploadId } = req.body;

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

    // Step 1: Parse markdown
    console.log('[POST /scripts] Parsing markdown...');
    if (uploadId) uploadProgressService.updateStage(uploadId, 1, 'active', 'Reading...');

    const parsed = parser.parse(markdown);
    console.log(`[POST /scripts] Parsed script: ${parsed.characters.length} characters, ${parsed.scenes.length} scenes`);

    if (uploadId) {
      uploadProgressService.updateStage(
        uploadId,
        1,
        'complete',
        `${parsed.characters.length} chars, ${parsed.scenes.length} scenes`
      );
    }

    // Generate ID
    const id = randomUUID();
    const now = new Date().toISOString();

    // Step 2: Run OpenAI analysis (only if API key is configured)
    let analysis = null;
    let analysisCost = 0;
    let tokensUsed = 0;
    let analyzedAt = null;

    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('[POST /scripts] Running OpenAI text analysis...');
        if (uploadId) {
          uploadProgressService.updateStage(uploadId, 2, 'active', 'Analyzing...', 0);
          uploadProgressService.updateStage(uploadId, 3, 'active', '0/' + parsed.characters.length, 0);
        }

        const textAnalysis = await scriptAnalysisService.analyzeScript(parsed);
        console.log(`[POST /scripts] Text analysis complete (${textAnalysis.tokensUsed} tokens, $${textAnalysis.textAnalysisCost})`);

        if (uploadId) {
          uploadProgressService.updateStage(uploadId, 2, 'complete', 'Complete', 100);
        }

        // Step 3: Generate character portraits
        console.log(`[POST /scripts] Generating ${textAnalysis.characters.length} character portraits...`);
        const charactersWithPortraits = await characterPortraitService.generateAllPortraits(
          id,
          textAnalysis.characters,
          (current, total) => {
            console.log(`[POST /scripts] Portrait progress: ${current}/${total}`);
            if (uploadId) {
              const percent = Math.round((current / total) * 100);
              uploadProgressService.updateStage(uploadId, 3, 'active', `${current}/${total}`, percent);
            }
          }
        );
        console.log(`[POST /scripts] All portraits generated`);

        if (uploadId) {
          uploadProgressService.updateStage(uploadId, 3, 'complete', 'Complete', 100);
        }

        // Calculate portrait costs ($0.04 per image for dall-e-3 standard quality)
        const portraitCost = textAnalysis.characters.length * 0.04;
        analysisCost = textAnalysis.textAnalysisCost + portraitCost;
        tokensUsed = textAnalysis.tokensUsed;
        analyzedAt = new Date().toISOString();

        // Build complete analysis object
        analysis = {
          scriptLevel: textAnalysis.scriptLevel,
          characters: charactersWithPortraits,
          scenes: textAnalysis.scenes,
          analyzedAt: textAnalysis.analyzedAt,
        };

        console.log(`[POST /scripts] Total OpenAI cost: $${analysisCost.toFixed(4)}`);
      } catch (analysisError) {
        console.error('[POST /scripts] OpenAI analysis failed:', analysisError);
        // Continue without analysis - script still works
        analysis = null;
      }
    } else {
      console.log('[POST /scripts] Skipping OpenAI analysis (no API key configured)');
    }

    // Step 4: Store in database
    if (uploadId) uploadProgressService.updateStage(uploadId, 4, 'active', 'Saving...');

    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO scripts (
        id, title, markdown_source, parsed_json,
        analysis, analysis_tokens_used, analysis_cost_usd, analyzed_at,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      parsed.title,
      markdown,
      JSON.stringify(parsed),
      analysis ? JSON.stringify(analysis) : null,
      tokensUsed,
      analysisCost,
      analyzedAt,
      now,
      now
    );

    if (uploadId) {
      uploadProgressService.updateStage(uploadId, 4, 'complete', 'Complete');
      uploadProgressService.complete(uploadId);
    }

    // Return created script
    res.status(201).json({
      id,
      title: parsed.title,
      characterCount: parsed.characters.length,
      sceneCount: parsed.scenes.length,
      createdAt: now,
      parsed,
      analysis,
      analyzedAt,
      analysisCost: analysisCost > 0 ? analysisCost : undefined,
    });
  } catch (error) {
    console.error('Error creating script:', error);

    // Report error to progress stream
    if (req.body.uploadId) {
      uploadProgressService.error(req.body.uploadId, 'Upload failed');
    }

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
    const analysis = script.analysis ? JSON.parse(script.analysis) : null;

    res.json({
      id: script.id,
      title: script.title,
      markdown: script.markdown_source,
      parsed,
      analysis,
      analyzedAt: script.analyzed_at,
      analysisCost: script.analysis_cost_usd,
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
// POST /api/scripts/:id/refresh-analysis
// Re-run OpenAI analysis but keep existing portraits (cheap refresh)
// ============================================================================

router.post('/:id/refresh-analysis', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Get existing script
    const script = db.prepare(`
      SELECT * FROM scripts WHERE id = ?
    `).get(id) as any;

    if (!script) {
      return res.status(404).json({
        error: 'Not found',
        message: `Script with id ${id} not found`,
      });
    }

    // Parse script
    const parsed = JSON.parse(script.parsed_json);

    // Re-run OpenAI text analysis (cheap: ~$0.01)
    let analysis = null;
    let analysisCost = 0;
    let tokensUsed = 0;
    let portraitsReused = false;

    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('[POST /scripts/:id/refresh-analysis] Running OpenAI text analysis...');
        const textAnalysis = await scriptAnalysisService.analyzeScript(parsed);
        console.log(`[POST /scripts/:id/refresh-analysis] Text analysis complete (${textAnalysis.tokensUsed} tokens, $${textAnalysis.textAnalysisCost})`);

        // Check if portraits already exist on filesystem
        console.log(`[POST /scripts/:id/refresh-analysis] Checking for existing portraits...`);
        const portraitsExist = await characterPortraitService.checkPortraitsExist(id, textAnalysis.characters);

        let charactersWithPortraits;
        if (portraitsExist) {
          // Reuse existing portraits (free!)
          console.log(`[POST /scripts/:id/refresh-analysis] Reusing existing portraits`);
          charactersWithPortraits = await characterPortraitService.attachExistingPortraits(id, textAnalysis.characters);
          portraitsReused = true;
        } else {
          // Generate new portraits (expensive, but only if needed)
          console.log(`[POST /scripts/:id/refresh-analysis] No portraits found, generating new ones...`);
          charactersWithPortraits = await characterPortraitService.generateAllPortraits(id, textAnalysis.characters);
          portraitsReused = false;
        }

        // Calculate portrait cost (only if generated new ones)
        const portraitCost = portraitsReused ? 0 : textAnalysis.characters.length * 0.04;
        analysisCost = textAnalysis.textAnalysisCost + portraitCost;
        tokensUsed = textAnalysis.tokensUsed;

        // Build complete analysis object
        analysis = {
          scriptLevel: textAnalysis.scriptLevel,
          characters: charactersWithPortraits,
          scenes: textAnalysis.scenes,
          analyzedAt: textAnalysis.analyzedAt,
        };

        console.log(`[POST /scripts/:id/refresh-analysis] Total cost: $${analysisCost.toFixed(4)} (portraits: ${portraitsReused ? 'reused' : 'generated'})`);
      } catch (analysisError) {
        console.error('[POST /scripts/:id/refresh-analysis] Analysis failed:', analysisError);
        return res.status(500).json({
          error: 'Analysis failed',
          message: analysisError instanceof Error ? analysisError.message : 'Unknown error',
        });
      }
    } else {
      return res.status(400).json({
        error: 'OpenAI not configured',
        message: 'OPENAI_API_KEY not set',
      });
    }

    // Update database
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE scripts
      SET analysis = ?,
          analysis_tokens_used = ?,
          analysis_cost_usd = ?,
          analyzed_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(analysis),
      tokensUsed,
      analysisCost,
      now,
      now,
      id
    );

    res.json({
      success: true,
      message: 'Analysis refreshed successfully',
      cost: analysisCost,
      portraitsReused,
    });
  } catch (error) {
    console.error('Error refreshing analysis:', error);
    res.status(500).json({
      error: 'Failed to refresh analysis',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// DELETE /api/scripts/:id
// Delete script (and cascade to sessions/audio)
// ============================================================================

router.delete('/:id', async (req: Request, res: Response) => {
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

    // Delete character portraits (if any)
    try {
      await characterPortraitService.deleteScriptPortraits(id);
    } catch (portraitError) {
      console.error('Error deleting portraits:', portraitError);
      // Continue with script deletion even if portrait cleanup fails
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
