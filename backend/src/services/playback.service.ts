/**
 * PlaybackService
 * Manages rehearsal playback state and line progression
 */

import { getDatabase } from './database.service';
import { ParsedScript, Dialogue } from './scriptParser.service';

export type PlaybackState = 'playing' | 'paused' | 'waiting_for_user';

export interface PlaybackInfo {
  sessionId: string;
  currentLineIndex: number;
  playbackState: PlaybackState;
  currentLine: EnrichedDialogueLine | null;
  nextLine: EnrichedDialogueLine | null;
  totalLines: number;
  isComplete: boolean;
}

export interface EnrichedDialogueLine extends Dialogue {
  isAI: boolean;
  playerName?: string;
  audioUrl?: string;
}

class PlaybackService {
  /**
   * Get current playback state for a session
   */
  getPlaybackState(sessionId: string, script: ParsedScript): PlaybackInfo {
    const db = getDatabase();

    const session = db.prepare(`
      SELECT current_line_index, playback_state, script_id
      FROM sessions
      WHERE id = ?
    `).get(sessionId) as { current_line_index: number; playback_state: PlaybackState; script_id: string } | undefined;

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Get participants for player name lookup
    const participants = db.prepare(`
      SELECT player_name, character_name, is_ai
      FROM participants
      WHERE session_id = ?
    `).all(sessionId) as Array<{
      player_name: string;
      character_name: string | null;
      is_ai: number | boolean;
    }>;

    // Get all dialogue lines from script content
    const dialogueLines = script.content.filter(item => item.type === 'dialogue') as Dialogue[];
    const totalLines = dialogueLines.length;
    const currentIndex = session.current_line_index;

    // Helper: Sanitize character name for file path
    const sanitizeCharacterName = (name: string): string => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    // Enrich lines with participant info
    const enrichLine = (line: Dialogue | null, lineIndex: number): EnrichedDialogueLine | null => {
      if (!line) return null;

      const participant = participants.find(p => p.character_name === line.character);
      const isAI = participant ? Boolean(participant.is_ai) : true;

      // Generate dialogue audio URL (full line audio)
      const sanitizedName = sanitizeCharacterName(line.character);
      const audioUrl = `/audio/${sessionId}/dialogue/${sanitizedName}-line-${lineIndex + 1}.wav`;

      return {
        ...line,
        isAI,
        playerName: participant && !isAI ? participant.player_name : undefined,
        audioUrl,
      };
    };

    const currentLine = currentIndex < totalLines ? enrichLine(dialogueLines[currentIndex], currentIndex) : null;
    const nextLine = currentIndex + 1 < totalLines ? enrichLine(dialogueLines[currentIndex + 1], currentIndex + 1) : null;
    const isComplete = currentIndex >= totalLines;

    return {
      sessionId,
      currentLineIndex: currentIndex,
      playbackState: session.playback_state,
      currentLine,
      nextLine,
      totalLines,
      isComplete,
    };
  }

  /**
   * Advance to the next line
   * Requires either current speaker OR host permission
   */
  advanceLine(sessionId: string, participantId: number, script: ParsedScript): PlaybackInfo {
    const db = getDatabase();

    // Get participant info
    const participant = db.prepare(`
      SELECT is_host, character_name FROM participants
      WHERE id = ? AND session_id = ?
    `).get(participantId, sessionId) as {
      is_host: number | boolean;
      character_name: string | null;
    } | undefined;

    if (!participant) {
      throw new Error('Participant not found');
    }

    const isHost = Boolean(participant.is_host);

    // Get current state
    const currentState = this.getPlaybackState(sessionId, script);

    if (currentState.isComplete) {
      throw new Error('Playback is already complete');
    }

    // Permission check: must be current speaker OR host
    const isCurrentSpeaker =
      currentState.currentLine && participant.character_name === currentState.currentLine.character;

    if (!isCurrentSpeaker && !isHost) {
      throw new Error('Only the current speaker or host can advance');
    }

    // Increment line index
    const newIndex = currentState.currentLineIndex + 1;

    db.prepare(`
      UPDATE sessions
      SET current_line_index = ?,
          last_state_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newIndex, sessionId);

    // Return updated state
    return this.getPlaybackState(sessionId, script);
  }

  /**
   * Set playback state (playing/paused)
   */
  setPlaybackState(sessionId: string, state: PlaybackState, script: ParsedScript): PlaybackInfo {
    const db = getDatabase();

    db.prepare(`
      UPDATE sessions
      SET playback_state = ?,
          last_state_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(state, sessionId);

    return this.getPlaybackState(sessionId, script);
  }

  /**
   * Jump to a specific line (host only)
   */
  jumpToLine(sessionId: string, targetLineIndex: number, script: ParsedScript): PlaybackInfo {
    const db = getDatabase();

    const dialogueLines = script.content.filter(item => item.type === 'dialogue');

    if (targetLineIndex < 0 || targetLineIndex >= dialogueLines.length) {
      throw new Error(`Invalid line index: ${targetLineIndex}`);
    }

    db.prepare(`
      UPDATE sessions
      SET current_line_index = ?,
          last_state_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(targetLineIndex, sessionId);

    return this.getPlaybackState(sessionId, script);
  }

  /**
   * Reset playback to beginning (host only)
   */
  resetPlayback(sessionId: string, participantId: number, script: ParsedScript): PlaybackInfo {
    const db = getDatabase();

    // Verify host
    const participant = db.prepare(`
      SELECT is_host FROM participants
      WHERE id = ? AND session_id = ? AND is_host = 1
    `).get(participantId, sessionId);

    if (!participant) {
      throw new Error('Only the host can rewind');
    }

    db.prepare(`
      UPDATE sessions
      SET current_line_index = 0,
          playback_state = 'playing',
          last_state_update = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(sessionId);

    return this.getPlaybackState(sessionId, script);
  }
}

export const playbackService = new PlaybackService();
