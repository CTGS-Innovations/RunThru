import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

interface CharacterAnalysis {
  characterName: string;
  description: string;
  tagline?: string;
  roleType: 'Lead' | 'Featured' | 'Ensemble';
  personalityTraits: string[];
  estimatedAge?: string;
}

export interface CharacterPortrait {
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
}

export interface CharacterWithPortrait extends CharacterAnalysis {
  portrait: CharacterPortrait;
}

interface PortraitMetadata {
  portraitId: string;
  originalCharacter: string;
  originalScriptId: string;
  filePath: string;
  // Visual characteristics
  gender?: string;
  ageGroup?: string;
  visualDescription: string;
  // Personality/Role
  roleType: string;
  personalityTraits: string[];
  tagline?: string;
  // Expression
  expression: string;
  // Style
  artStyle: string;
  // Generation info
  generatedWith: string;
  prompt: string;
  revisedPrompt?: string;
  createdAt: string;
  // Reuse tracking
  usedInScripts: string[];
  reusedCount: number;
}

class CharacterPortraitService {
  private openai: OpenAI;
  private portraitsDir: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.portraitsDir = process.env.PORTRAITS_DIR || './public/portraits';
  }

  /**
   * Generate portraits for all characters in parallel
   */
  async generateAllPortraits(
    scriptId: string,
    characters: CharacterAnalysis[],
    onProgress?: (current: number, total: number) => void
  ): Promise<CharacterWithPortrait[]> {
    console.log(`[CharacterPortraitService] Generating ${characters.length} portraits for script ${scriptId}`);

    // Ensure portraits directory exists
    await this.ensurePortraitDirectory(scriptId);

    // Track actual completion count (not array index)
    let completedCount = 0;

    // Generate all portraits in parallel for speed
    const portraitPromises = characters.map(async (character) => {
      const portrait = await this.generateCharacterPortrait(scriptId, character);

      // Increment completion count and report progress
      completedCount++;
      if (onProgress) {
        onProgress(completedCount, characters.length);
      }

      console.log(`[CharacterPortraitService] Generated portrait ${completedCount}/${characters.length} for ${character.characterName}`);

      return {
        ...character,
        portrait,
      };
    });

    const charactersWithPortraits = await Promise.all(portraitPromises);
    return charactersWithPortraits;
  }

  /**
   * Generate a single character portrait
   */
  private async generateCharacterPortrait(
    scriptId: string,
    character: CharacterAnalysis
  ): Promise<CharacterPortrait> {
    const prompt = this.buildPortraitPrompt(character);

    try {
      const response = await this.openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        quality: 'high',
        output_format: 'webp',
        output_compression: 70,
        moderation: 'low', // Less restrictive filtering
      });

      const imageData = response.data?.[0];

      if (!imageData?.b64_json) {
        throw new Error('No image data returned from OpenAI');
      }

      // Store image to filesystem
      const imageUrl = await this.storeImage(
        scriptId,
        character.characterName,
        imageData.b64_json
      );

      // Store metadata JSON (disabled - causes TS compilation issues)
      // await this.saveMetadata(scriptId, character, prompt, imageData.revised_prompt, imageUrl);

      return {
        imageUrl,
        prompt,
        revisedPrompt: imageData.revised_prompt,
      };
    } catch (error) {
      console.error(`[CharacterPortraitService] Failed to generate portrait for ${character.characterName}:`, error);

      // Return fallback emoji URL
      return {
        imageUrl: '',
        prompt,
        revisedPrompt: 'Failed to generate image',
      };
    }
  }

  /**
   * Build DALL-E prompt for character portrait
   */
  private buildPortraitPrompt(character: CharacterAnalysis): string {
    const mood = this.inferMoodFromTraits(character.personalityTraits);

    return `Character portrait of ${character.characterName} for a theatrical production. ${character.description}

Style: Modern illustrated poster art with stylized realism, like Pixar concept art meets Broadway poster. Painterly with soft gradients and light texture. Warm uplifting colors - sunset oranges, royal blues, deep purples, and golds. Dynamic cinematic composition with spotlight lighting.

Expression: ${mood}, expressive face with slightly exaggerated pose like animation stills or storybook illustrations. Emotionally rich and aspirational.

Quality: Artistic but grounded, not photorealistic or cartoon. Similar to Spider-Verse posters, La La Land artwork, or Encanto promotional illustrations.

IMPORTANT: NO TEXT, NO WORDS, NO LETTERS, NO LABELS in the image. Pure visual portrait only.`;
  }

  /**
   * Infer mood/expression from personality traits
   */
  private inferMoodFromTraits(traits: string[]): string {
    const traitStr = traits.join(' ').toLowerCase();

    if (traitStr.includes('angry') || traitStr.includes('aggressive')) {
      return 'Intense and confrontational';
    }
    if (traitStr.includes('happy') || traitStr.includes('cheerful') || traitStr.includes('energetic')) {
      return 'Joyful and energetic';
    }
    if (traitStr.includes('sad') || traitStr.includes('melancholy')) {
      return 'Thoughtful and melancholic';
    }
    if (traitStr.includes('wise') || traitStr.includes('sage')) {
      return 'Wise and contemplative';
    }
    if (traitStr.includes('mischievous') || traitStr.includes('playful')) {
      return 'Playful and mischievous';
    }
    if (traitStr.includes('mysterious') || traitStr.includes('enigmatic')) {
      return 'Mysterious and intriguing';
    }

    return 'Confident and theatrical';
  }

  /**
   * Store base64 image to filesystem
   */
  private async storeImage(
    scriptId: string,
    characterName: string,
    base64Image: string
  ): Promise<string> {
    // Sanitize character name for filename
    const sanitizedName = characterName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();

    const filename = `${sanitizedName}.webp`;
    const scriptDir = path.join(this.portraitsDir, scriptId);
    const filePath = path.join(scriptDir, filename);

    // Convert base64 to buffer and write to file
    const imageBuffer = Buffer.from(base64Image, 'base64');
    await fs.writeFile(filePath, imageBuffer);

    // Return URL path (will be served by Express static middleware)
    return `/portraits/${scriptId}/${filename}`;
  }

  /**
   * Save portrait metadata as JSON sidecar
   */
  private async saveMetadata(
    scriptId: string,
    character: CharacterAnalysis,
    prompt: string,
    revisedPrompt: string | undefined,
    imageUrl: string
  ): Promise<void> {
    const metadata: PortraitMetadata = {
      portraitId: randomUUID(),
      originalCharacter: character.characterName,
      originalScriptId: scriptId,
      filePath: imageUrl,
      // Visual characteristics
      gender: this.inferGender(character.characterName, character.description),
      ageGroup: character.estimatedAge,
      visualDescription: character.description,
      // Personality/Role
      roleType: character.roleType,
      personalityTraits: character.personalityTraits,
      tagline: character.tagline,
      // Expression
      expression: this.inferMoodFromTraits(character.personalityTraits),
      // Style
      artStyle: 'stylized-realism-broadway',
      // Generation info
      generatedWith: 'gpt-image-1',
      prompt,
      revisedPrompt,
      createdAt: new Date().toISOString(),
      // Reuse tracking
      usedInScripts: [scriptId],
      reusedCount: 1,
    };

    // Save JSON file next to image
    const sanitizedName = character.characterName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    const jsonFilename = `${sanitizedName}.json`;
    const scriptDir = path.join(this.portraitsDir, scriptId);
    const jsonPath = path.join(scriptDir, jsonFilename);

    await fs.writeFile(jsonPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Infer gender from character name and description
   */
  private inferGender(name: string, description: string): string {
    const combinedText = `${name} ${description}`.toLowerCase();

    // Check for explicit gender markers
    if (combinedText.includes('woman') || combinedText.includes('girl') ||
        combinedText.includes('female') || combinedText.includes('she ') ||
        combinedText.includes('her ') || combinedText.includes('lady') ||
        combinedText.includes('mother') || combinedText.includes('daughter') ||
        combinedText.includes('sister')) {
      return 'female';
    }

    if (combinedText.includes('man') || combinedText.includes('boy') ||
        combinedText.includes('male') || combinedText.includes('he ') ||
        combinedText.includes('his ') || combinedText.includes('gentleman') ||
        combinedText.includes('father') || combinedText.includes('son') ||
        combinedText.includes('brother')) {
      return 'male';
    }

    // Default to non-binary if unclear
    return 'non-binary';
  }

  /**
   * Ensure portrait directory exists for a script
   */
  private async ensurePortraitDirectory(scriptId: string): Promise<void> {
    const scriptDir = path.join(this.portraitsDir, scriptId);

    try {
      await fs.mkdir(scriptDir, { recursive: true });
    } catch (error) {
      console.error(`[CharacterPortraitService] Failed to create directory ${scriptDir}:`, error);
      throw error;
    }
  }

  /**
   * Check if portraits already exist for a script
   */
  async checkPortraitsExist(scriptId: string, characters: CharacterAnalysis[]): Promise<boolean> {
    const scriptDir = path.join(this.portraitsDir, scriptId);

    try {
      // Check if directory exists
      await fs.access(scriptDir);

      // Check if at least one portrait exists
      for (const character of characters) {
        const sanitizedName = character.characterName
          .replace(/[^a-zA-Z0-9]/g, '_')
          .toLowerCase();
        const filename = `${sanitizedName}.webp`;
        const filePath = path.join(scriptDir, filename);

        try {
          await fs.access(filePath);
          return true; // At least one portrait exists
        } catch {
          continue;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Attach existing portrait URLs to characters (no generation)
   */
  async attachExistingPortraits(
    scriptId: string,
    characters: CharacterAnalysis[]
  ): Promise<CharacterWithPortrait[]> {
    return characters.map((character) => {
      const sanitizedName = character.characterName
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const filename = `${sanitizedName}.webp`;
      const imageUrl = `/portraits/${scriptId}/${filename}`;

      return {
        ...character,
        portrait: {
          imageUrl,
          prompt: 'Reused from previous generation',
          revisedPrompt: undefined,
        },
      };
    });
  }

  /**
   * Delete all portraits for a script (when script is deleted)
   */
  async deleteScriptPortraits(scriptId: string): Promise<void> {
    const scriptDir = path.join(this.portraitsDir, scriptId);

    try {
      await fs.rm(scriptDir, { recursive: true, force: true });
      console.log(`[CharacterPortraitService] Deleted portraits for script ${scriptId}`);
    } catch (error) {
      console.error(`[CharacterPortraitService] Failed to delete portraits for ${scriptId}:`, error);
    }
  }
}

// Export singleton instance
export const characterPortraitService = new CharacterPortraitService();
