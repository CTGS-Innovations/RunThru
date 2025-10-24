import OpenAI from 'openai';
import type { ParsedScript, Character, ScriptElement, SceneMetadata, Dialogue } from './scriptParser.service';

// Analysis result types
interface ScriptMetadata {
  genre: string[];
  style: string[];
  estimatedRuntime: number;
  themes: string[];
  tone: string;
}

interface BreakoutScene {
  sceneNumber: number;
  sceneName: string;
  lineCount: number;
}

interface CharacterAnalysis {
  characterName: string;
  description: string;
  tagline: string; // 2-3 word descriptor (e.g., "Brave Survivor")
  roleType: 'Lead' | 'Featured' | 'Ensemble';
  skillsNeeded: string[];
  characterArc: string;
  journeyStart: string; // Starting emotional state
  journeyEnd: string; // Ending emotional state
  personalityTraits: string[];
  estimatedAge?: string;
  // Power Stats (0-100)
  stagePresence: number; // How prominent/visible in the show
  emotionalRange: number; // Variety of emotions required
  energyLevel: number; // Physical demands (stillness → high energy)
  // Breakout moments (calculated from data, not AI)
  breakoutScenes: BreakoutScene[];
}

interface SceneAnalysis {
  sceneNumber: number;
  sceneName: string;
  sceneEmoji: string;
  location: string;
  description: string;
  mood: string;
  objectivesByCharacter: Record<string, string>;
}

export interface ScriptAnalysisResult {
  scriptLevel: ScriptMetadata;
  characters: CharacterAnalysis[];
  scenes: SceneAnalysis[];
  analyzedAt: string;
  tokensUsed: number;
  textAnalysisCost: number;
}

class ScriptAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main orchestrator - analyzes script and returns all metadata
   */
  async analyzeScript(script: ParsedScript): Promise<ScriptAnalysisResult> {
    const startTime = Date.now();

    // Run text analysis in parallel for speed
    const [scriptLevel, characters, scenes] = await Promise.all([
      this.analyzeScriptLevel(script),
      this.analyzeCharacters(script),
      this.analyzeScenes(script),
    ]);

    // Calculate breakout scenes from actual line counts (not AI guess)
    const charactersWithBreakouts = this.calculateBreakoutScenes(script, characters);

    const endTime = Date.now();
    const durationSeconds = (endTime - startTime) / 1000;

    console.log(`[ScriptAnalysisService] Analysis complete in ${durationSeconds}s`);

    // Estimate tokens and cost (rough approximation)
    const estimatedInputTokens = Math.ceil(
      (JSON.stringify(script).length / 4) * 2.5 // 3 API calls
    );
    const estimatedOutputTokens = Math.ceil(
      (JSON.stringify({ scriptLevel, characters, scenes }).length / 4)
    );

    // GPT-4o-mini pricing (2025): $0.15 per 1M input, $0.60 per 1M output
    const textAnalysisCost =
      (estimatedInputTokens / 1_000_000) * 0.15 +
      (estimatedOutputTokens / 1_000_000) * 0.60;

    return {
      scriptLevel,
      characters: charactersWithBreakouts,
      scenes,
      analyzedAt: new Date().toISOString(),
      tokensUsed: estimatedInputTokens + estimatedOutputTokens,
      textAnalysisCost: parseFloat(textAnalysisCost.toFixed(4)),
    };
  }

  /**
   * Calculate breakout scenes for each character (top 3 scenes by line count)
   */
  private calculateBreakoutScenes(
    script: ParsedScript,
    characters: CharacterAnalysis[]
  ): CharacterAnalysis[] {
    return characters.map((char) => {
      // Count lines per scene for this character
      const linesByScene = script.scenes.map((scene, sceneIndex) => {
        const lineCount = script.content.filter(
          (element: ScriptElement): element is Dialogue =>
            element.type === 'dialogue' &&
            element.character === char.characterName &&
            this.isLineInScene(element, scene, script.content)
        ).length;

        return {
          sceneNumber: sceneIndex + 1,
          sceneName: scene.title,
          lineCount,
        };
      });

      // Sort by line count descending, take top 3, filter out scenes with 0 lines
      const breakoutScenes = linesByScene
        .filter((scene) => scene.lineCount > 0)
        .sort((a, b) => b.lineCount - a.lineCount)
        .slice(0, 3);

      return {
        ...char,
        breakoutScenes,
      };
    });
  }

  /**
   * Check if a dialogue line belongs to a specific scene
   */
  private isLineInScene(
    dialogue: Dialogue,
    scene: SceneMetadata,
    content: ScriptElement[]
  ): boolean {
    // Find the index of this dialogue in content
    const dialogueIndex = content.findIndex((el) => el.id === dialogue.id);
    if (dialogueIndex === -1) return false;

    // Check if dialogue line number is within scene's line range
    return (
      dialogue.lineNumber >= scene.lineRange[0] &&
      dialogue.lineNumber <= scene.lineRange[1]
    );
  }

  /**
   * Analyze script-level metadata (genre, runtime, themes, tone)
   */
  private async analyzeScriptLevel(script: ParsedScript): Promise<ScriptMetadata> {
    const prompt = `You are a theater expert analyzing scripts for young performers.

Analyze this script and extract high-level metadata.

Script Title: ${script.title || 'Untitled'}
Script Author: ${script.author || 'Unknown'}
Character Count: ${script.characters.length}
Scene Count: ${script.scenes.length}
Total Lines: ${script.content.filter((c: ScriptElement) => c.type === 'dialogue').length}

First 500 lines of content:
${JSON.stringify(script.content.slice(0, 500))}

Return a JSON object with:
{
  "genre": ["MUST choose from: comedy, drama, musical, historical, fantasy, science-fiction, mystery, thriller, romance, adventure, horror-lite"],
  "style": ["MUST choose from: realism, absurdism, physical-theater, musical-theater, classical, contemporary, experimental, ensemble"],
  "estimatedRuntime": number (in minutes),
  "themes": ["MUST choose from: friendship, family, courage, identity, justice, love, betrayal, redemption, coming-of-age, good-vs-evil, perseverance, acceptance, change, loss, hope, teamwork, honesty, loyalty, sacrifice, discovery"],
  "tone": "MUST choose ONE: comedic, serious, dark-comedy, lighthearted, dramatic, whimsical, inspirational, adventurous, mysterious, heartwarming"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a theater expert. Return valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Analyze all characters in the script
   */
  private async analyzeCharacters(script: ParsedScript): Promise<CharacterAnalysis[]> {
    const charactersInfo = script.characters.map((char: Character) => ({
      name: char.name,
      lineCount: char.lineCount,
      firstAppearance: char.firstAppearance,
    }));

    // Get sample dialogue for each character
    const dialogueSamples = script.characters.map((char: Character) => {
      const lines = script.content
        .filter((c: ScriptElement): c is Dialogue => c.type === 'dialogue' && c.character === char.name)
        .slice(0, 5)
        .map((c: Dialogue) => c.text);
      return { name: char.name, sampleLines: lines };
    });

    const prompt = `You are a theater expert analyzing characters for young performers.

Analyze these characters and provide detailed metadata for each.

Characters:
${JSON.stringify(charactersInfo, null, 2)}

Sample Dialogue:
${JSON.stringify(dialogueSamples, null, 2)}

IMPORTANT - Skills Analysis:
Analyze each character's actual dialogue and actions in the script. ONLY include skills they ACTUALLY need.
Choose up to 3 skills from this list, based on what the character DOES in the script:
- singing
- dancing
- stage-combat
- physical-comedy
- dramatic-monologue
- rapid-dialogue
- vocal-range (shouting, whispering, etc.)
- emotional-crying
- dialect
- improvisation
- voice-acting
- mime
- acrobatics
- puppetry
- ensemble-choreography
- fourth-wall-breaking
- character-transformation (playing multiple roles)
- comic-timing
- deadpan-delivery
- narration
Return EMPTY array if no specialized skills needed (basic acting is assumed).

For each character, return a JSON array with objects containing:
{
  "characterName": "CHARACTER NAME",
  "description": "Visual appearance and personality - DO NOT include age, age-related terms, or numeric ages",
  "tagline": "2-3 word catchy descriptor (e.g., 'Brave Survivor', 'Comic Foil', 'Unlikely Hero')",
  "roleType": "Lead" | "Featured" | "Ensemble",
  "skillsNeeded": ["Array of 0-3 skills from list above, based on script content"],
  "characterArc": "How the character evolves (2-3 sentences max)",
  "journeyStart": "Starting emotional state (1-2 words, e.g., 'Scared', 'Arrogant', 'Lost')",
  "journeyEnd": "Ending emotional state (1-2 words, e.g., 'Leader', 'Humble', 'Found')",
  "personalityTraits": ["MUST choose 3-5 from: brave, kind, clever, funny, loyal, curious, shy, confident, creative, determined, honest, playful, serious, mysterious, energetic, calm, stubborn, wise, rebellious, protective, cheerful, thoughtful, ambitious, caring, mischievous"],
  "estimatedAge": "ONLY use: young, middle-aged, old, or elderly",
  "stagePresence": number 40-100 (bias upward - most characters are important! How prominent/visible they are throughout the show),
  "emotionalRange": number 50-100 (all theater roles require emotional skill! Variety of emotions: comedy, drama, anger, joy, etc.),
  "energyLevel": number 30-100 (theater is active! Physical demands - 30=stillness, 60=moderate movement, 100=high energy/action)
}

Criteria for roleType:
- Lead: 50+ lines or central to plot
- Featured: 20-49 lines or important supporting role
- Ensemble: <20 lines

Return the JSON array only.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a theater expert. Return valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"characters": []}');
    const characters = result.characters || [];

    // Override role type based on actual data (not AI guessing)
    characters.forEach((char: CharacterAnalysis) => {
      const scriptChar = script.characters.find((c: Character) => c.name === char.characterName);
      const lineCount = scriptChar?.lineCount || 0;

      // Rule: 40+ lines AND 70+ stage presence = Lead
      if (lineCount > 40 && char.stagePresence > 70) {
        char.roleType = 'Lead';
      }
      // Otherwise use line count thresholds
      else if (lineCount >= 50) {
        char.roleType = 'Lead';
      } else if (lineCount >= 20) {
        char.roleType = 'Featured';
      } else {
        char.roleType = 'Ensemble';
      }
    });

    return characters;
  }

  /**
   * Analyze all scenes in the script
   */
  private async analyzeScenes(script: ParsedScript): Promise<SceneAnalysis[]> {
    const scenesInfo = script.scenes.map((scene: SceneMetadata, index: number) => ({
      sceneNumber: index + 1,
      heading: scene.title,
      lineCount: scene.dialogueCount,
    }));

    // Get first few lines of script content for context (simplified - just use first 10 elements)
    const sceneSamples = script.scenes.map((scene: SceneMetadata, index: number) => {
      // Get a sample of content - just use first 10 script elements for simplicity
      const sceneContent = script.content.slice(0, 10);
      return { sceneNumber: index + 1, heading: scene.title, content: sceneContent };
    });

    const prompt = `You are a theater expert analyzing scenes for young performers.

Analyze these scenes and provide metadata for each.

Scenes Overview:
${JSON.stringify(scenesInfo, null, 2)}

Scene Content (first 10 lines each):
${JSON.stringify(sceneSamples, null, 2)}

For each scene, return a JSON array with objects containing:
{
  "sceneNumber": number,
  "sceneName": "Short descriptive name (2-4 words)",
  "sceneIcon": "MUST choose ONE: action, romance, comedy, drama, mystery, conflict, celebration, sadness, fear, discovery, surprise, tension, friendship, betrayal, reunion, goodbye",
  "location": "where it takes place",
  "description": "Brief description of what happens (1-2 sentences)",
  "mood": "MUST choose ONE: happy, sad, tense, calm, angry, romantic, mysterious, playful, serious, fearful, hopeful, excited, melancholic, peaceful, chaotic",
  "objectivesByCharacter": {
    "CHARACTER_NAME": "what they want in this scene (1 sentence)"
  }
}

Return the JSON array only.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a theater expert. Return valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"scenes": []}');
    return result.scenes || [];
  }
}

// Export singleton instance
export const scriptAnalysisService = new ScriptAnalysisService();
