import fs from 'fs/promises';
import path from 'path';
import { TTSClientService } from './ttsClient.service';
import { getDatabase } from './database.service';
import voicePresets from '../config/voice-presets.json';

/**
 * Character Card Audio Service
 * Generates short audio clips for each character using Chatterbox TTS
 * Used for: Character selection preview + rehearsal timing tests
 */
export class CharacterCardAudioService {
  private ttsClient: TTSClientService;
  private audioDir: string;

  constructor() {
    this.ttsClient = new TTSClientService();
    this.audioDir = path.join(__dirname, '../../public/audio');
  }

  /**
   * Generate character card audio for all characters in a script
   * Uses script-level storage for reusability across all sessions
   *
   * @param scriptId - Script ID
   * @param voiceAssignments - Map of character name to voice assignment
   * @returns Array of {characterName, audioUrl, generationTime}
   */
  async generateForScript(
    scriptId: string,
    voiceAssignments: Map<string, any>
  ): Promise<Array<{
    characterName: string;
    audioUrl: string;
    generationTime: number;
  }>> {
    // 1. Get script + characters
    const db = getDatabase();
    const script = db.prepare(`
      SELECT id, parsed_json
      FROM scripts
      WHERE id = ?
    `).get(scriptId) as any;

    if (!script) {
      throw new Error(`Script not found: ${scriptId}`);
    }

    const parsedScript = JSON.parse(script.parsed_json);
    const characters = parsedScript.characters || [];

    // 2. Create character-cards subdirectory (script-level, not session-level)
    const scriptAudioDir = path.join(this.audioDir, scriptId);
    const characterCardsDir = path.join(scriptAudioDir, 'character-cards');
    await fs.mkdir(characterCardsDir, { recursive: true });

    // 3. Generate audio for each character
    const results = [];

    for (const character of characters) {
      const characterName = character.name;
      const voiceAssignment = voiceAssignments.get(characterName);

      if (!voiceAssignment) {
        console.warn(`No voice assignment for character: ${characterName}`);
        continue;
      }

      try {
        const startTime = Date.now();

        // Check if file already exists (reuse across sessions)
        const filename = `${this.sanitizeFilename(characterName)}-catchphrase.wav`;
        const filepath = path.join(characterCardsDir, filename);

        let audioBuffer: Buffer;
        try {
          await fs.access(filepath);
          console.log(`♻️  Reusing existing audio for ${characterName}`);
          audioBuffer = await fs.readFile(filepath);
        } catch {
          // File doesn't exist, generate new audio
          audioBuffer = await this.generateCharacterCardAudio(
            characterName,
            voiceAssignment
          );
          await fs.writeFile(filepath, audioBuffer);
          console.log(`✅ Generated card audio for ${characterName} (${Date.now() - startTime}ms)`);
        }

        const generationTime = Date.now() - startTime;
        const audioUrl = `/audio/${scriptId}/character-cards/${filename}`;

        results.push({
          characterName,
          audioUrl,
          generationTime
        });
      } catch (error) {
        console.error(`Failed to generate audio for ${characterName}:`, error);
        // Continue with other characters even if one fails
      }
    }

    return results;
  }

  /**
   * Generate a single character card audio clip
   * Format: "{Character Name}... {catchphrase}"
   *
   * @param characterName - Character name
   * @param voiceAssignment - Voice assignment from database
   * @returns Audio buffer (WAV)
   */
  private async generateCharacterCardAudio(
    characterName: string,
    voiceAssignment: any
  ): Promise<Buffer> {
    // Get voice preset details
    const preset = voicePresets.find((p: any) => p.id === voiceAssignment.voice_preset_id);

    if (!preset) {
      throw new Error(`Voice preset not found: ${voiceAssignment.voice_preset_id}`);
    }

    // Map voice preset to reference audio file
    const referenceAudioPath = this.resolveReferenceAudioPath(preset.referenceAudioPath);

    // Generate catchphrase based on character name and preset
    const catchphrase = this.generateCatchphrase(characterName, preset);

    // Convert character name to proper case for TTS (avoids letter-by-letter pronunciation)
    const properCaseName = this.toProperCase(characterName);
    const text = `${properCaseName}. ${catchphrase}`;

    // Call TTS service with Chatterbox engine
    const audioBuffer = await this.ttsClient.synthesize({
      text,
      character: characterName,
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
   * Generate a catchphrase for a character based on their name and voice preset
   * Catchphrases are taken from actual script dialogue for authenticity
   *
   * @param characterName - Character name
   * @param preset - Voice preset
   * @returns Catchphrase string
   */
  private generateCatchphrase(characterName: string, preset: any): string {
    const name = characterName.toUpperCase();

    // Character-specific catchphrases from "10 Ways to Survive the Zombie Apocalypse"
    if (name.includes('NARRATOR') && name.includes('1')) return 'Sacrifice the weak!';
    if (name.includes('NARRATOR') && name.includes('2')) return 'Makes sense!';
    if (name.includes('NARRATOR')) return 'Here!'; // Fallback for generic NARRATOR

    if (name.includes('ZOMBIE')) return 'Braiiiins';
    if (name.includes('GIRL')) return 'Go go go go!';
    if (name.includes('JIMMY') || name.includes('JAMIE')) return 'I love you!';
    if (name.includes('SUSAN')) return "We're all gonna die!";
    if (name.includes('SAM')) return 'Who put you in charge?';
    if (name.includes('CHRISTY')) return 'Leave me behind';

    // Generic fallbacks for other scripts
    if (preset.id.includes('angry')) return 'Bring it on!';
    if (preset.id.includes('cheerful')) return 'Hi there!';
    if (preset.id.includes('wise')) return 'Listen well.';
    if (preset.id.includes('mysterious')) return 'Interesting...';
    if (preset.id.includes('scared')) return 'Watch out!';

    // Default
    return 'Ready!';
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
   * Convert all-caps character name to proper case for TTS
   * Prevents TTS from spelling out letters (NARRATOR → Narrator)
   *
   * @param name - Character name (e.g., "NARRATOR ONE")
   * @returns Proper case name (e.g., "Narrator One")
   */
  private toProperCase(name: string): string {
    return name
      .split(' ')
      .map(word => {
        // Handle numbers (ONE, TWO, etc.)
        if (/^\d+$/.test(word)) return word;

        // Capitalize first letter, lowercase rest
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Sanitize filename (remove special characters)
   *
   * @param name - Character name
   * @returns Safe filename
   */
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
