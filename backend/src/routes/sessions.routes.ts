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
    const { id} = req.params;

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

// ============================================================================
// GET /api/sessions/:id/playback
// Get current playback state (for polling)
// ============================================================================

router.get('/:id/playback', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get session
    const db = getDatabase();
    const session = db.prepare(`
      SELECT script_id, is_active
      FROM sessions
      WHERE id = ?
    `).get(id) as { script_id: string; is_active: number } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No session found with id: ${id}`
      });
    }

    // Check if session is active (not ended by host)
    if (session.is_active === 0) {
      return res.status(410).json({
        error: 'Session ended',
        message: 'This session has been ended by the host'
      });
    }

    // Get script
    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    // Import playback service
    const { playbackService } = require('../services/playback.service');
    const playbackInfo = playbackService.getPlaybackState(id, parsedScript);

    res.json({
      playback: playbackInfo
    });
  } catch (error) {
    console.error('Error fetching playback state:', error);
    res.status(500).json({
      error: 'Failed to fetch playback state',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/play
// Start/resume playback
// ============================================================================

router.post('/:id/play', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get session and script
    const db = getDatabase();
    const session = db.prepare(`
      SELECT script_id
      FROM sessions
      WHERE id = ?
    `).get(id) as { script_id: string } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    const { playbackService } = require('../services/playback.service');
    const playbackInfo = playbackService.setPlaybackState(id, 'playing', parsedScript);

    res.json({
      playback: playbackInfo
    });
  } catch (error) {
    console.error('Error starting playback:', error);
    res.status(500).json({
      error: 'Failed to start playback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/advance
// Advance to next line
// ============================================================================

router.post('/:id/advance', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'participantId is required'
      });
    }

    // Get session and script
    const db = getDatabase();
    const session = db.prepare(`
      SELECT script_id
      FROM sessions
      WHERE id = ?
    `).get(id) as { script_id: string } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    const { playbackService } = require('../services/playback.service');
    const playbackInfo = playbackService.advanceLine(id, participantId, parsedScript);

    res.json({
      playback: playbackInfo
    });
  } catch (error) {
    console.error('Error advancing line:', error);

    if (error instanceof Error && error.message.includes('already complete')) {
      return res.status(400).json({
        error: 'Playback complete',
        message: error.message
      });
    }

    if (error instanceof Error && error.message.includes('current speaker')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to advance line',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/previous
// Go back one line (host only)
// ============================================================================

router.post('/:id/previous', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'participantId is required'
      });
    }

    // Get session and script
    const db = getDatabase();

    // Verify host permission
    const participant = db.prepare(`
      SELECT is_host FROM participants
      WHERE id = ? AND session_id = ? AND is_host = 1
    `).get(participantId, id);

    if (!participant) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the host can rewind'
      });
    }

    const session = db.prepare(`
      SELECT script_id, current_line_index
      FROM sessions
      WHERE id = ?
    `).get(id) as { script_id: string; current_line_index: number } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    // Can't go before line 0
    if (session.current_line_index <= 0) {
      return res.status(400).json({
        error: 'Already at beginning',
        message: 'Cannot go back from first line'
      });
    }

    const { playbackService } = require('../services/playback.service');
    const newIndex = session.current_line_index - 1;
    const playbackInfo = playbackService.jumpToLine(id, newIndex, parsedScript);

    res.json({
      playback: playbackInfo
    });
  } catch (error) {
    console.error('Error going to previous line:', error);
    res.status(500).json({
      error: 'Failed to go to previous line',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/pause
// Pause playback
// ============================================================================

router.post('/:id/pause', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get session and script
    const db = getDatabase();
    const session = db.prepare(`
      SELECT script_id
      FROM sessions
      WHERE id = ?
    `).get(id) as { script_id: string } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    const { playbackService } = require('../services/playback.service');
    const playbackInfo = playbackService.setPlaybackState(id, 'paused', parsedScript);

    res.json({
      playback: playbackInfo
    });
  } catch (error) {
    console.error('Error pausing playback:', error);
    res.status(500).json({
      error: 'Failed to pause playback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/reset
// Reset playback to beginning
// ============================================================================

router.post('/:id/reset', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'participantId is required'
      });
    }

    // Get session and script
    const db = getDatabase();
    const session = db.prepare(`
      SELECT script_id
      FROM sessions
      WHERE id = ?
    `).get(id) as { script_id: string } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const script = db.prepare(`
      SELECT parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as { parsed_json: string } | undefined;

    if (!script) {
      return res.status(404).json({
        error: 'Script not found'
      });
    }

    const parsedScript: ParsedScript = JSON.parse(script.parsed_json);

    const { playbackService } = require('../services/playback.service');
    const playbackInfo = playbackService.resetPlayback(id, participantId, parsedScript);

    res.json({
      playback: playbackInfo
    });
  } catch (error) {
    console.error('Error resetting playback:', error);
    res.status(500).json({
      error: 'Failed to reset playback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/end
// End session (host only) - kicks all participants out
// ============================================================================

router.post('/:id/end', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'participantId is required'
      });
    }

    // Get session and verify host
    const db = getDatabase();

    // Verify host permission
    const participant = db.prepare(`
      SELECT is_host FROM participants
      WHERE id = ? AND session_id = ? AND is_host = 1
    `).get(participantId, id);

    if (!participant) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the host can end the session'
      });
    }

    // Mark session as inactive (ended)
    db.prepare(`
      UPDATE sessions
      SET is_active = 0,
          last_state_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      error: 'Failed to end session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// POST /api/sessions/:id/generate-dialogue-audio
// Generate full dialogue audio for all lines in a session
// Uses session's voice assignments
// ============================================================================

router.post('/:id/generate-dialogue-audio', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify session exists
    const db = getDatabase();
    const session = db.prepare(`
      SELECT id, script_id
      FROM sessions
      WHERE id = ?
    `).get(id) as { id: string; script_id: string } | undefined;

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Import DialogueAudioService
    const { DialogueAudioService } = require('../services/dialogueAudio.service');
    const dialogueAudioService = new DialogueAudioService();

    console.log(`🎬 Starting dialogue audio generation for session ${id}`);

    // Generate audio with progress tracking
    let lastProgress = 0;
    const results = await dialogueAudioService.generateForSession(
      id,
      (current: number, total: number) => {
        const progress = Math.floor((current / total) * 100);
        if (progress >= lastProgress + 10) {
          console.log(`📊 Progress: ${current}/${total} (${progress}%)`);
          lastProgress = progress;
        }
      }
    );

    console.log(`✅ Dialogue audio generation complete: ${results.length} files`);

    res.json({
      success: true,
      sessionId: id,
      generated: results.length,
      totalTime: results.reduce((sum: number, r: any) => sum + r.generationTime, 0),
      files: results
    });
  } catch (error) {
    console.error('Error generating dialogue audio:', error);
    res.status(500).json({
      error: 'Failed to generate dialogue audio',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// DEPRECATED: Character card audio moved to script-level
// Use: POST /api/scripts/:id/generate-card-audio instead
// ============================================================================

export default router;
