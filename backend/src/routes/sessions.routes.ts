/**
 * Session Routes
 * API endpoints for rehearsal sessions and voice assignments
 */

import { Router, Request, Response } from 'express';
import { getDatabase } from '../services/database.service';
import { sessionService } from '../services/session.service';
import { voicePresetService } from '../services/voicePreset.service';
import { ParsedScript } from '../services/scriptParser.service';
import { getLobbyService } from '../services/lobby.service';

const router = Router();

// ============================================================================
// GET /api/voices
// List all available voice presets
// ============================================================================

router.get('/voices', (req: Request, res: Response) => {
  try {
    const presets = voicePresetService.getAllPresets();

    res.json({
      presets: presets.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        defaultParams: {
          gender: p.gender,
          emotion: p.emotion,
          age: p.age
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching voice presets:', error);
    res.status(500).json({
      error: 'Failed to fetch voice presets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions
// Create new rehearsal session with random voice assignments
// ============================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const { scriptId, selectedCharacter } = req.body;

    // Validation
    if (!scriptId || typeof scriptId !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'scriptId is required and must be a string'
      });
    }

    if (!selectedCharacter || typeof selectedCharacter !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'selectedCharacter is required and must be a string'
      });
    }

    // Get script from database
    const db = getDatabase();
    const script = db.prepare(`
      SELECT id, parsed_json
      FROM scripts
      WHERE id = ?
    `).get(scriptId) as { id: string; parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found',
        message: `No script found with id: ${scriptId}`
      });
    }

    // Parse script JSON
    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    // Create session with random voice assignments
    const session = await sessionService.createSession(
      { scriptId, selectedCharacter },
      parsedScript
    );

    res.status(201).json({
      session: {
        id: session.id,
        scriptId: session.scriptId,
        selectedCharacter: session.selectedCharacter,
        voiceAssignments: session.voiceAssignments,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);

    if (error instanceof Error && error.message.includes('not found in script')) {
      return res.status(400).json({
        error: 'Invalid character',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// GET /api/sessions/:id
// Get session state with voice assignments
// ============================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await sessionService.getSession(id);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No session found with id: ${id}`
      });
    }

    // Also fetch script metadata for convenience
    const db = getDatabase();
    const script = db.prepare(`
      SELECT id, title, parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.scriptId) as { id: string; title: string; parsed_json: string } | undefined;

    const parsedScript: ParsedScript | null = script ? JSON.parse(script.parsed_json) : null;

    res.json({
      session: {
        id: session.id,
        scriptId: session.scriptId,
        selectedCharacter: session.selectedCharacter,
        voiceAssignments: session.voiceAssignments,
        createdAt: session.createdAt
      },
      script: parsedScript ? {
        id: script!.id,
        title: script!.title,
        characters: parsedScript.characters,
        scenes: parsedScript.scenes
      } : null
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      error: 'Failed to fetch session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/shuffle
// Re-randomize all voice assignments
// ============================================================================

router.post('/:id/shuffle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get session to verify it exists
    const session = await sessionService.getSession(id);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No session found with id: ${id}`
      });
    }

    // Get script
    const db = getDatabase();
    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.scriptId) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found',
        message: 'Script associated with this session no longer exists'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    // Shuffle voices
    const newAssignments = await sessionService.shuffleVoices(id, parsedScript);

    res.json({
      voiceAssignments: newAssignments
    });
  } catch (error) {
    console.error('Error shuffling voices:', error);
    res.status(500).json({
      error: 'Failed to shuffle voices',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// PUT /api/sessions/:id/voice
// Update a single character's voice assignment
// ============================================================================

router.put('/:id/voice', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { characterId, voicePresetId, gender, emotion, age } = req.body;

    // Validation
    if (!characterId || typeof characterId !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'characterId is required and must be a string'
      });
    }

    // Validate parameter ranges if provided
    if (gender !== undefined && (typeof gender !== 'number' || gender < 0 || gender > 100)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'gender must be a number between 0 and 100'
      });
    }

    if (emotion !== undefined && (typeof emotion !== 'number' || emotion < 0 || emotion > 100)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'emotion must be a number between 0 and 100'
      });
    }

    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 100)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'age must be a number between 0 and 100'
      });
    }

    // Update voice assignment
    const updatedAssignment = await sessionService.updateVoiceAssignment(id, {
      characterId,
      voicePresetId,
      gender,
      emotion,
      age
    });

    res.json({
      voiceAssignment: updatedAssignment
    });
  } catch (error) {
    console.error('Error updating voice assignment:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: error.message
      });
    }

    if (error instanceof Error && error.message.includes('Invalid voice preset')) {
      return res.status(400).json({
        error: 'Invalid voice preset',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update voice assignment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// GET /api/sessions/:id/config
// Get frozen session config for rehearsal page (multiplayer)
// ============================================================================

router.get('/:id/config', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lobbyService = getLobbyService();
    const config = lobbyService.getSessionConfig(id);

    if (!config) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session not found or not yet started'
      });
    }

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching session config:', error);
    res.status(500).json({
      error: 'Failed to fetch session config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
