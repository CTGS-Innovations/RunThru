import { Router, Request, Response } from 'express';
import { getLobbyService } from '../services/lobby.service';
import { validatePIN } from '../middleware/auth.middleware';
import { getDatabase } from '../services/database.service';

const router = Router();

/**
 * POST /api/lobbies/create
 *
 * Create a new multiplayer lobby
 * Requires PIN authentication
 */
router.post('/create', validatePIN, async (req: Request, res: Response) => {
  try {
    const { scriptId, creatorName } = req.body;

    // Validate input
    if (!scriptId || !creatorName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'scriptId and creatorName are required',
      });
      return;
    }

    // Validate script exists
    const db = getDatabase();
    const script = db.prepare('SELECT id FROM scripts WHERE id = ?').get(scriptId);
    if (!script) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Script not found',
      });
      return;
    }

    // Create lobby
    const lobbyService = getLobbyService();
    const lobby = lobbyService.createLobby(scriptId, creatorName);

    res.status(201).json({
      success: true,
      lobby,
    });
  } catch (error: any) {
    console.error('Error creating lobby:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * POST /api/lobbies/:token/join
 *
 * Join a lobby as a participant
 * No PIN required (shareable link is the auth)
 */
router.post('/:token/join', (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { playerName } = req.body;

    // Validate input
    if (!playerName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'playerName is required',
      });
      return;
    }

    // Join lobby
    const lobbyService = getLobbyService();
    const result = lobbyService.joinLobby(token, playerName);

    res.status(200).json({
      success: true,
      participant: result,
    });
  } catch (error: any) {
    console.error('Error joining lobby:', error);

    if (error.message.includes('not found') || error.message.includes('expired')) {
      res.status(410).json({
        error: 'Gone',
        message: error.message,
      });
      return;
    }

    if (error.message.includes('already started')) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * GET /api/lobbies/:token/participants
 *
 * Get all participants in a lobby
 * Used for polling (every 2 seconds)
 */
router.get('/:token/participants', (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const lobbyService = getLobbyService();
    const participants = lobbyService.getParticipants(token);

    res.status(200).json({
      success: true,
      participants,
    });
  } catch (error: any) {
    console.error('Error getting participants:', error);

    if (error.message.includes('not found') || error.message.includes('expired')) {
      res.status(410).json({
        error: 'Gone',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/lobbies/:token/select
 *
 * Select a character for a participant
 */
router.put('/:token/select', (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { participantId, characterName } = req.body;

    // Validate input
    if (!participantId || !characterName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'participantId and characterName are required',
      });
      return;
    }

    const lobbyService = getLobbyService();
    const participant = lobbyService.selectCharacter(token, participantId, characterName);

    res.status(200).json({
      success: true,
      participant,
    });
  } catch (error: any) {
    console.error('Error selecting character:', error);

    if (error.message.includes('not found') || error.message.includes('expired')) {
      res.status(410).json({
        error: 'Gone',
        message: error.message,
      });
      return;
    }

    if (error.message.includes('already taken')) {
      res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
      return;
    }

    if (error.message.includes('Cannot change character')) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * POST /api/lobbies/:token/start
 *
 * Start rehearsal (host only)
 * Auto-assigns AI to unselected characters
 */
router.post('/:token/start', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { hostParticipantId } = req.body;

    // Validate input
    if (!hostParticipantId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'hostParticipantId is required',
      });
      return;
    }

    // Get session to fetch script
    const lobbyService = getLobbyService();
    const session = lobbyService.getLobbyByToken(token);
    if (!session) {
      res.status(410).json({
        error: 'Gone',
        message: 'Lobby not found or expired',
      });
      return;
    }

    // Get script characters
    const db = getDatabase();
    const script = db.prepare('SELECT parsed_json FROM scripts WHERE id = ?').get(session.scriptId) as { parsed_json: string } | undefined;
    if (!script) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Script not found',
      });
      return;
    }

    const parsedScript = JSON.parse(script.parsed_json);
    const scriptCharacters = parsedScript.characters.map((c: any) => c.name);

    // Start rehearsal
    const result = lobbyService.startRehearsal(token, hostParticipantId, scriptCharacters);

    res.status(200).json({
      success: true,
      rehearsal: result,
    });
  } catch (error: any) {
    console.error('Error starting rehearsal:', error);

    if (error.message.includes('not found') || error.message.includes('expired')) {
      res.status(410).json({
        error: 'Gone',
        message: error.message,
      });
      return;
    }

    if (error.message.includes('already started')) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
      return;
    }

    if (error.message.includes('Only the host')) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

/**
 * GET /api/lobbies/:token
 *
 * Get lobby info (for validation)
 */
router.get('/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const lobbyService = getLobbyService();
    const session = lobbyService.getLobbyByToken(token);

    if (!session) {
      res.status(410).json({
        error: 'Gone',
        message: 'Lobby not found or expired',
      });
      return;
    }

    res.status(200).json({
      success: true,
      lobby: session,
    });
  } catch (error: any) {
    console.error('Error getting lobby:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

export default router;
