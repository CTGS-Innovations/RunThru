/**
 * SessionService
 * Manages rehearsal sessions and voice assignments
 */

import { randomUUID } from 'crypto';
import { getDatabase } from './database.service';
import { VoiceAssignment } from '../models/types';
import { voicePresetService } from './voicePreset.service';
import { ParsedScript, Character } from './scriptParser.service';

interface CreateSessionInput {
  scriptId: string;
  selectedCharacter: string;
}

interface SessionData {
  id: string;
  scriptId: string;
  selectedCharacter: string;
  voiceAssignments: VoiceAssignment[];
  createdAt: string;
}

interface UpdateVoiceInput {
  characterId: string;
  voicePresetId?: string;
  gender?: number;
  emotion?: number;
  age?: number;
}

class SessionService {
  /**
   * Create a new rehearsal session with random voice assignments
   */
  async createSession(input: CreateSessionInput, parsedScript: ParsedScript): Promise<SessionData> {
    const db = getDatabase();
    const sessionId = randomUUID();

    // Validate that selected character exists in script
    const characterExists = parsedScript.characters.some(
      char => char.name === input.selectedCharacter
    );
    if (!characterExists) {
      throw new Error(`Character "${input.selectedCharacter}" not found in script`);
    }

    // Generate random voice assignments for ALL characters in the script
    const voiceAssignments = this.randomAssignVoices(parsedScript.characters);

    // Start transaction
    const insertSession = db.prepare(`
      INSERT INTO sessions (id, script_id, selected_character, tts_engine)
      VALUES (?, ?, ?, 'chatterbox')
    `);

    const insertVoiceAssignment = db.prepare(`
      INSERT INTO voice_assignments (session_id, character_id, voice_preset_id, gender, emotion, age)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      // Insert session
      insertSession.run(sessionId, input.scriptId, input.selectedCharacter);

      // Insert all voice assignments
      for (const assignment of voiceAssignments) {
        insertVoiceAssignment.run(
          sessionId,
          assignment.characterId,
          assignment.voicePresetId,
          assignment.gender,
          assignment.emotion,
          assignment.age
        );
      }

      console.log(`✅ Created session ${sessionId} with ${voiceAssignments.length} voice assignments`);

      return {
        id: sessionId,
        scriptId: input.scriptId,
        selectedCharacter: input.selectedCharacter,
        voiceAssignments,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID with all voice assignments
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const db = getDatabase();

    // Get session
    const session = db.prepare(`
      SELECT id, script_id, selected_character, created_at
      FROM sessions
      WHERE id = ?
    `).get(sessionId) as any;

    if (!session) {
      return null;
    }

    // Get voice assignments
    const voiceAssignments = db.prepare(`
      SELECT character_id, voice_preset_id, gender, emotion, age
      FROM voice_assignments
      WHERE session_id = ?
      ORDER BY character_id
    `).all(sessionId) as any[];

    return {
      id: session.id,
      scriptId: session.script_id,
      selectedCharacter: session.selected_character,
      voiceAssignments: voiceAssignments.map(va => ({
        characterId: va.character_id,
        voicePresetId: va.voice_preset_id,
        gender: va.gender,
        emotion: va.emotion,
        age: va.age
      })),
      createdAt: session.created_at
    };
  }

  /**
   * Update a single character's voice assignment
   */
  async updateVoiceAssignment(sessionId: string, update: UpdateVoiceInput): Promise<VoiceAssignment> {
    const db = getDatabase();

    // Get current assignment
    const current = db.prepare(`
      SELECT voice_preset_id, gender, emotion, age
      FROM voice_assignments
      WHERE session_id = ? AND character_id = ?
    `).get(sessionId, update.characterId) as any;

    if (!current) {
      throw new Error(`No voice assignment found for character "${update.characterId}" in session ${sessionId}`);
    }

    // Merge updates with current values
    const updated = {
      voicePresetId: update.voicePresetId || current.voice_preset_id,
      gender: update.gender !== undefined ? update.gender : current.gender,
      emotion: update.emotion !== undefined ? update.emotion : current.emotion,
      age: update.age !== undefined ? update.age : current.age
    };

    // If preset changed, validate it exists
    if (update.voicePresetId && !voicePresetService.isValidPresetId(update.voicePresetId)) {
      throw new Error(`Invalid voice preset ID: ${update.voicePresetId}`);
    }

    // Update database
    db.prepare(`
      UPDATE voice_assignments
      SET voice_preset_id = ?, gender = ?, emotion = ?, age = ?, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ? AND character_id = ?
    `).run(
      updated.voicePresetId,
      updated.gender,
      updated.emotion,
      updated.age,
      sessionId,
      update.characterId
    );

    console.log(`✅ Updated voice for character "${update.characterId}" in session ${sessionId}`);

    return {
      characterId: update.characterId,
      voicePresetId: updated.voicePresetId,
      gender: updated.gender,
      emotion: updated.emotion,
      age: updated.age
    };
  }

  /**
   * Re-randomize all voice assignments for a session
   */
  async shuffleVoices(sessionId: string, parsedScript: ParsedScript): Promise<VoiceAssignment[]> {
    const db = getDatabase();

    // Generate new random assignments
    const newAssignments = this.randomAssignVoices(parsedScript.characters);

    // Update all assignments in database
    const updateStmt = db.prepare(`
      UPDATE voice_assignments
      SET voice_preset_id = ?, gender = ?, emotion = ?, age = ?, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ? AND character_id = ?
    `);

    try {
      for (const assignment of newAssignments) {
        updateStmt.run(
          assignment.voicePresetId,
          assignment.gender,
          assignment.emotion,
          assignment.age,
          sessionId,
          assignment.characterId
        );
      }

      console.log(`✅ Shuffled voices for session ${sessionId}`);
      return newAssignments;
    } catch (error) {
      console.error('❌ Failed to shuffle voices:', error);
      throw error;
    }
  }

  /**
   * Randomly assign voice presets to characters
   * Pure random strategy (no keyword detection - per @corey decision)
   */
  private randomAssignVoices(characters: Character[]): VoiceAssignment[] {
    return characters.map(character => {
      // Get random preset
      const preset = voicePresetService.getRandomPreset();

      return {
        characterId: character.name,
        voicePresetId: preset.id,
        gender: preset.gender,      // Use preset defaults
        emotion: preset.emotion,
        age: preset.age
      };
    });
  }
}

// Export singleton instance
export const sessionService = new SessionService();
