import fs from 'fs/promises';
import path from 'path';
import { TTSClientService } from './ttsClient.service';
import { getDatabase } from './database.service';
import { getDialogueFilename } from '../utils/sanitize';
import voicePresets from '../config/voice-presets.json';

/**
 * Dialogue Audio Service
 * Generates full script dialogue audio for rehearsal playback
 * Uses session-specific voice assignments and stores audio per session
 */
export class DialogueAudioService {
  private ttsClient: TTSClientService;
  private audioDir: string;

  constructor() {
    this.ttsClient = new TTSClientService();
    this.audioDir = path.join(__dirname, '../../public/audio');
  }

  /**
   * Generate dialogue audio for all lines in a session
   * Uses session's voice assignments and stores in session-specific directory
   *
   * @param sessionId - Session ID
   * @param onProgress - Optional callback for progress updates (lineIndex, totalLines)
   * @returns Array of {lineIndex, character, audioUrl, generationTime}
   */
  async generateForSession(
    sessionId: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<Array<{
    lineIndex: number;
    character: string;
    audioUrl: string;
    generationTime: number;
  }>> {
    // 1. Get session + script + voice assignments
    const db = getDatabase();
    const session = db.prepare(`
      SELECT s.id, s.script_id, s.selected_character
      FROM sessions s
      WHERE s.id = ?
    `).get(sessionId) as any;

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const script = db.prepare(`
      SELECT id, parsed_json
      FROM scripts
      WHERE id = ?
    `).get(session.script_id) as any;

    if (!script) {
      throw new Error(`Script not found: ${session.script_id}`);
    }

    const parsedScript = JSON.parse(script.parsed_json);

    // 2. Get voice assignments from database
    const voiceAssignments = db.prepare(`
      SELECT character_id, voice_preset_id, gender, emotion, age
      FROM voice_assignments
      WHERE session_id = ?
    `).all(sessionId) as any[];

    const voiceMap = new Map(
      voiceAssignments.map(va => [va.character_id, va])
    );

    // 3. Extract all dialogue lines from parsed script
    const dialogueLines = this.extractDialogueLines(parsedScript);
    console.log(`📝 Extracted ${dialogueLines.length} dialogue lines for session ${sessionId}`);

    // 4. Create dialogue subdirectory (script-level, not session-level)
    const scriptAudioDir = path.join(this.audioDir, session.script_id);
    const dialogueDir = path.join(scriptAudioDir, 'dialogue');
    await fs.mkdir(dialogueDir, { recursive: true });

    // 5. Generate audio for each line (with parallelization)
    const results = [];
    const batchSize = 5; // Generate 5 lines at once

    for (let i = 0; i < dialogueLines.length; i += batchSize) {
      const batch = dialogueLines.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (line) => {
          const { lineIndex, character, text } = line;
          const voiceAssignment = voiceMap.get(character);

          if (!voiceAssignment) {
            console.warn(`⚠️  No voice assignment for character: ${character} (line ${lineIndex})`);
            return null;
          }

          try {
            const startTime = Date.now();

            // Check if file already exists (cache)
            const filename = getDialogueFilename(character, lineIndex);
            const filepath = path.join(dialogueDir, filename);

            let audioBuffer: Buffer;
            try {
              await fs.access(filepath);
              console.log(`♻️  Reusing existing audio for line ${lineIndex} (${character})`);
              audioBuffer = await fs.readFile(filepath);
            } catch {
              // File doesn't exist, generate new audio
              audioBuffer = await this.generateDialogueAudio(
                text,
                character,
                voiceAssignment
              );
              await fs.writeFile(filepath, audioBuffer);
              console.log(`✅ Generated line ${lineIndex} (${character}): ${Date.now() - startTime}ms`);
            }

            const generationTime = Date.now() - startTime;
            const audioUrl = `/audio/${session.script_id}/dialogue/${filename}`;

            return {
              lineIndex,
              character,
              audioUrl,
              generationTime
            };
          } catch (error) {
            console.error(`❌ Failed to generate audio for line ${lineIndex} (${character}):`, error);
            return null;
          }
        })
      );

      // Filter out nulls and add to results
      results.push(...batchResults.filter(r => r !== null));

      // Report progress
      if (onProgress) {
        onProgress(results.length, dialogueLines.length);
      }
    }

    console.log(`🎉 Generated ${results.length}/${dialogueLines.length} dialogue audio files`);
    return results as any;
  }

  /**
   * Extract all dialogue lines from parsed script
   * Returns array of {lineIndex, character, text}
   *
   * @param parsedScript - Parsed script JSON
   * @returns Array of dialogue lines
   */
  private extractDialogueLines(parsedScript: any): Array<{
    lineIndex: number;
    character: string;
    text: string;
  }> {
    const lines: Array<{ lineIndex: number; character: string; text: string }> = [];
    let globalLineIndex = 1;

    for (const item of parsedScript.content) {
      if (item.type === 'dialogue') {
        lines.push({
          lineIndex: globalLineIndex++,
          character: item.character,
          text: item.text
        });
      }
    }

    return lines;
  }

  /**
   * Generate audio for a single dialogue line
   *
   * @param text - Dialogue text
   * @param character - Character name
   * @param voiceAssignment - Voice assignment from database
   * @returns Audio buffer (WAV)
   */
  private async generateDialogueAudio(
    text: string,
    character: string,
    voiceAssignment: any
  ): Promise<Buffer> {
    // Get voice preset details
    const preset = voicePresets.find((p: any) => p.id === voiceAssignment.voice_preset_id);

    if (!preset) {
      throw new Error(`Voice preset not found: ${voiceAssignment.voice_preset_id}`);
    }

    // Map voice preset to reference audio file
    const referenceAudioPath = this.resolveReferenceAudioPath(preset.referenceAudioPath);

    // Call TTS service with Chatterbox engine
    const audioBuffer = await this.ttsClient.synthesize({
      text,
      character,
      engine: 'chatterbox',
      voiceId: referenceAudioPath,
      emotion: {
        intensity: voiceAssignment.emotion / 100, // 0-100 → 0.0-1.0
        valence: voiceAssignment.emotion > 60 ? 'positive' : 'neutral'
      }
    });

    return audioBuffer;
  }

  /**
   * Resolve reference audio path (may be relative or absolute)
   *
   * @param referenceAudioPath - Path from voice preset config
   * @returns Absolute path to reference audio file
   */
  private resolveReferenceAudioPath(referenceAudioPath: string): string {
    // If path is relative, resolve from project root
    if (!path.isAbsolute(referenceAudioPath)) {
      return path.resolve(
        __dirname,
        '../../../tts-service',
        referenceAudioPath
      );
    }
    return referenceAudioPath;
  }

  /**
   * Get dialogue audio URL for a specific line
   * Used by playback service to construct URLs
   *
   * @param scriptId - Script ID (dialogue audio is script-level, not session-level)
   * @param character - Character name
   * @param lineIndex - Line index (1-based)
   * @returns Audio URL
   */
  getDialogueAudioUrl(scriptId: string, character: string, lineIndex: number): string {
    const filename = getDialogueFilename(character, lineIndex);
    return `/audio/${scriptId}/dialogue/${filename}`;
  }

  /**
   * Check if dialogue audio exists for a script
   *
   * @param scriptId - Script ID (dialogue audio is script-level, not session-level)
   * @returns True if dialogue directory exists and has files
   */
  async hasDialogueAudio(scriptId: string): Promise<boolean> {
    const dialogueDir = path.join(this.audioDir, scriptId, 'dialogue');
    try {
      const files = await fs.readdir(dialogueDir);
      return files.length > 0;
    } catch {
      return false;
    }
  }
}
