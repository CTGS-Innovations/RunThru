import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { getDatabase } from './database.service';

interface Participant {
  id: number;
  sessionId: string;
  playerName: string;
  characterName: string | null;
  isAI: boolean;
  isHost: boolean;
  isReady: boolean;
  joinedAt: string;
}

interface LobbySession {
  id: string;
  scriptId: string;
  shareableToken: string;
  expiresAt: string;
  isActive: boolean;
  startedAt: string | null;
  createdAt: string;
}

interface SessionConfig {
  sessionId: string;
  scriptId: string;
  participants: Array<{
    playerName: string;
    characterName: string;
    isAI: boolean;
  }>;
  startedAt: string;
}

/**
 * Lobby Service
 *
 * Manages multiplayer lobbies:
 * - Create lobby with shareable token
 * - Participant join/select character
 * - Host start rehearsal with AI auto-fill
 */
export class LobbyService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new multiplayer lobby
   *
   * @param scriptId - Script ID to rehearse
   * @param creatorName - Name of the lobby creator (becomes host)
   * @returns Lobby info with shareable token and expiry
   */
  createLobby(scriptId: string, creatorName: string): {
    sessionId: string;
    token: string;
    lobbyUrl: string;
    expiresAt: string;
    participantId: number;
  } {
    const sessionId = randomUUID();
    const shareableToken = randomUUID();
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours from now

    // Create session with shareable token
    const insertSession = this.db.prepare(`
      INSERT INTO sessions (
        id, script_id, shareable_token, expires_at, is_active, created_at, last_accessed_at
      ) VALUES (?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `);
    insertSession.run(sessionId, scriptId, shareableToken, expiresAt);

    // Create first participant (creator, host)
    const insertParticipant = this.db.prepare(`
      INSERT INTO participants (
        session_id, player_name, is_host, joined_at
      ) VALUES (?, ?, 1, datetime('now'))
    `);
    const result = insertParticipant.run(sessionId, creatorName);
    const participantId = result.lastInsertRowid as number;

    return {
      sessionId,
      token: shareableToken,
      lobbyUrl: `/lobby/${shareableToken}`,
      expiresAt,
      participantId,
    };
  }

  /**
   * Get lobby session by shareable token
   *
   * @param token - Shareable token (UUID)
   * @returns Lobby session or null if not found/expired
   */
  getLobbyByToken(token: string): LobbySession | null {
    const stmt = this.db.prepare(`
      SELECT
        id, script_id as scriptId, shareable_token as shareableToken,
        expires_at as expiresAt, is_active as isActive, started_at as startedAt,
        created_at as createdAt
      FROM sessions
      WHERE shareable_token = ?
    `);
    const row = stmt.get(token) as any;

    if (!row) {
      return null;
    }

    // Check if expired
    if (new Date(row.expiresAt) < new Date()) {
      return null;
    }

    // Convert SQLite numeric boolean to actual boolean
    return {
      ...row,
      isActive: Boolean(row.isActive),
    } as LobbySession;
  }

  /**
   * Join a lobby as a participant
   *
   * @param token - Shareable token
   * @param playerName - Participant's name
   * @returns Participant ID and session ID
   */
  joinLobby(token: string, playerName: string): { participantId: number; sessionId: string } {
    const session = this.getLobbyByToken(token);

    if (!session) {
      throw new Error('Lobby not found or expired');
    }

    if (session.isActive) {
      throw new Error('Lobby already started');
    }

    // Create participant
    const insertParticipant = this.db.prepare(`
      INSERT INTO participants (
        session_id, player_name, is_host, joined_at
      ) VALUES (?, ?, 0, datetime('now'))
    `);
    const result = insertParticipant.run(session.id, playerName);

    return {
      participantId: result.lastInsertRowid as number,
      sessionId: session.id,
    };
  }

  /**
   * Get all participants in a lobby
   *
   * @param token - Shareable token
   * @returns Array of participants
   */
  getParticipants(token: string): Participant[] {
    const session = this.getLobbyByToken(token);

    if (!session) {
      throw new Error('Lobby not found or expired');
    }

    const stmt = this.db.prepare(`
      SELECT
        id, session_id as sessionId, player_name as playerName,
        character_name as characterName, is_ai as isAI, is_host as isHost,
        is_ready as isReady, joined_at as joinedAt
      FROM participants
      WHERE session_id = ?
      ORDER BY is_host DESC, joined_at ASC
    `);

    const rows = stmt.all(session.id) as any[];

    // Convert SQLite numeric booleans (0/1) to actual booleans
    return rows.map(row => ({
      ...row,
      isAI: Boolean(row.isAI),
      isHost: Boolean(row.isHost),
      isReady: Boolean(row.isReady),
    })) as Participant[];
  }

  /**
   * Select a character for a participant
   *
   * @param token - Shareable token
   * @param participantId - Participant ID
   * @param characterName - Character to assign
   * @returns Updated participant
   */
  selectCharacter(token: string, participantId: number, characterName: string): Participant {
    const session = this.getLobbyByToken(token);

    if (!session) {
      throw new Error('Lobby not found or expired');
    }

    if (session.isActive) {
      throw new Error('Cannot change character after lobby started');
    }

    try {
      // Update participant (UNIQUE constraint prevents duplicates)
      const updateStmt = this.db.prepare(`
        UPDATE participants
        SET character_name = ?, is_ready = 1
        WHERE id = ? AND session_id = ?
      `);
      updateStmt.run(characterName, participantId, session.id);

      // Return updated participant
      const selectStmt = this.db.prepare(`
        SELECT
          id, session_id as sessionId, player_name as playerName,
          character_name as characterName, is_ai as isAI, is_host as isHost,
          is_ready as isReady, joined_at as joinedAt
        FROM participants
        WHERE id = ?
      `);
      const row = selectStmt.get(participantId) as any;

      // Convert SQLite numeric booleans to actual booleans
      return {
        ...row,
        isAI: Boolean(row.isAI),
        isHost: Boolean(row.isHost),
        isReady: Boolean(row.isReady),
      } as Participant;
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint')) {
        throw new Error('Character already taken');
      }
      throw error;
    }
  }

  /**
   * Start rehearsal (host only)
   * - Auto-assigns AI to unselected characters
   * - Activates the session
   *
   * @param token - Shareable token
   * @param hostParticipantId - Host participant ID (for validation)
   * @returns Rehearsal URL
   */
  startRehearsal(
    token: string,
    hostParticipantId: number,
    scriptCharacters: string[]
  ): { rehearsalUrl: string; sessionId: string } {
    const session = this.getLobbyByToken(token);

    if (!session) {
      throw new Error('Lobby not found or expired');
    }

    if (session.isActive) {
      throw new Error('Rehearsal already started');
    }

    // Validate host
    const hostStmt = this.db.prepare(`
      SELECT id FROM participants
      WHERE id = ? AND session_id = ? AND is_host = 1
    `);
    const host = hostStmt.get(hostParticipantId, session.id);

    if (!host) {
      throw new Error('Only the host can start the rehearsal');
    }

    // Get assigned characters
    const participantsStmt = this.db.prepare(`
      SELECT character_name FROM participants
      WHERE session_id = ? AND character_name IS NOT NULL
    `);
    const assignedCharacters = (participantsStmt.all(session.id) as { character_name: string }[]).map(
      (p) => p.character_name
    );

    // Find unassigned characters
    const unassignedCharacters = scriptCharacters.filter(
      (char) => !assignedCharacters.includes(char)
    );

    // Auto-assign AI to unselected characters
    const insertAI = this.db.prepare(`
      INSERT INTO participants (
        session_id, player_name, character_name, is_ai, is_host, is_ready, joined_at
      ) VALUES (?, 'AI', ?, 1, 0, 1, datetime('now'))
    `);

    for (const character of unassignedCharacters) {
      insertAI.run(session.id, character);
    }

    // Activate session
    const activateStmt = this.db.prepare(`
      UPDATE sessions
      SET is_active = 1, started_at = datetime('now')
      WHERE id = ?
    `);
    activateStmt.run(session.id);

    return {
      rehearsalUrl: `/rehearsal/${session.id}`,
      sessionId: session.id,
    };
  }

  /**
   * Get session config for rehearsal page
   *
   * @param sessionId - Session ID
   * @returns Session config with participants
   */
  getSessionConfig(sessionId: string): SessionConfig | null {
    const sessionStmt = this.db.prepare(`
      SELECT id, script_id as scriptId, started_at as startedAt
      FROM sessions
      WHERE id = ? AND is_active = 1
    `);
    const session = sessionStmt.get(sessionId) as
      | { id: string; scriptId: string; startedAt: string }
      | undefined;

    if (!session) {
      return null;
    }

    const participantsStmt = this.db.prepare(`
      SELECT
        player_name as playerName,
        character_name as characterName,
        is_ai as isAI
      FROM participants
      WHERE session_id = ? AND character_name IS NOT NULL
      ORDER BY is_ai ASC, joined_at ASC
    `);
    const rows = participantsStmt.all(sessionId) as Array<{
      playerName: string;
      characterName: string;
      isAI: number;  // SQLite returns 0 or 1
    }>;

    // Convert SQLite numeric boolean to actual boolean
    const participants = rows.map(row => ({
      ...row,
      isAI: Boolean(row.isAI),
    }));

    return {
      sessionId: session.id,
      scriptId: session.scriptId,
      participants,
      startedAt: session.startedAt,
    };
  }
}

// Singleton instance
let lobbyService: LobbyService | null = null;

export function getLobbyService(): LobbyService {
  if (!lobbyService) {
    lobbyService = new LobbyService();
  }
  return lobbyService;
}
