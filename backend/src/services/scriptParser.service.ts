/**
 * Script Parser Service
 * Converts markdown scripts to structured JSON
 *
 * Universal parser that handles:
 * - Traditional plays (Shakespeare, Tennessee Williams)
 * - Modern plays (this project's zombie apocalypse script)
 * - Musicals, one-acts, experimental theater
 *
 * See: .claude/docs/script-schema.md for design rationale
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ParsedScript {
  // Metadata
  title: string;
  subtitle?: string;
  author?: string;

  // Front matter (acknowledgments, cast lists, etc.)
  frontMatter: FrontMatterBlock[];

  // The actual script content
  content: ScriptElement[];

  // Extracted metadata for UI
  characters: Character[];
  scenes: SceneMetadata[];
}

export interface FrontMatterBlock {
  type: 'acknowledgments' | 'cast_list' | 'production_notes' | 'other';
  heading?: string;
  content: string;
  lineNumber: number;
}

export type ScriptElement = Scene | Dialogue | StageDirection;

export interface Scene {
  type: 'scene';
  id: string;
  level: number;  // 1 = Act, 2 = Scene, 3 = Subscene
  title: string;
  lineNumber: number;
}

export interface Dialogue {
  type: 'dialogue';
  id: string;
  character: string;
  text: string;
  direction?: string;       // "(angrily)", "(to the audience)"
  isOffstage?: boolean;
  lineNumber: number;
}

export interface StageDirection {
  type: 'stage_direction';
  id: string;
  text: string;
  scope: 'standalone' | 'inline';
  relatedLineId?: string;
  lineNumber: number;
}

export interface Character {
  name: string;
  lineCount: number;
  firstAppearance: number;
  aliases?: string[];
}

export interface SceneMetadata {
  id: string;
  title: string;
  level: number;
  lineRange: [number, number];
  characterCount: number;
  dialogueCount: number;
}

// ============================================================================
// Parser Implementation
// ============================================================================

export class ScriptParserService {
  private sceneCounter = 0;
  private dialogueCounter = 0;
  private directionCounter = 0;

  /**
   * Parse markdown script into structured format
   */
  parse(markdown: string): ParsedScript {
    this.resetCounters();

    const lines = markdown.split('\n');

    // Extract metadata from first lines
    const { title, subtitle, author, contentStartLine } = this.extractMetadata(lines);

    // Separate front matter from script content
    const firstSceneLine = this.findFirstScene(lines, contentStartLine);
    const frontMatter = this.parseFrontMatter(lines, contentStartLine, firstSceneLine);

    // Parse script content
    const content = this.parseContent(lines, firstSceneLine);

    // Extract character metadata
    const characters = this.extractCharacters(content);

    // Extract scene metadata
    const scenes = this.extractScenes(content);

    return {
      title,
      subtitle,
      author,
      frontMatter,
      content,
      characters,
      scenes,
    };
  }

  // ==========================================================================
  // Metadata Extraction
  // ==========================================================================

  private extractMetadata(lines: string[]): {
    title: string;
    subtitle?: string;
    author?: string;
    contentStartLine: number;
  } {
    let title = 'Untitled Script';
    let subtitle: string | undefined;
    let author: string | undefined;
    let contentStartLine = 0;

    // Look for title in first few lines (markdown heading or plain text)
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();

      // Check for markdown heading (# Title)
      if (line.startsWith('# ')) {
        title = line.replace(/^#\s+/, '').trim();
        contentStartLine = i + 1;
        continue;
      }

      // Check for subtitle (## Subtitle)
      if (line.startsWith('## ') && !subtitle) {
        subtitle = line.replace(/^##\s+/, '').trim();
        contentStartLine = i + 1;
        continue;
      }

      // Check for author (by [Name])
      const authorMatch = line.match(/^(?:\*\*)?by\s+(.+?)(?:\*\*)?$/i);
      if (authorMatch) {
        author = authorMatch[1].trim();
        contentStartLine = i + 1;
        continue;
      }

      // Stop when we hit content
      if (line.startsWith('###') || line.startsWith('**')) {
        break;
      }
    }

    return { title, subtitle, author, contentStartLine };
  }

  private findFirstScene(lines: string[], startFrom: number): number {
    for (let i = startFrom; i < lines.length; i++) {
      const line = lines[i].trim();
      // Scene markers are headings (###, ##, #)
      if (line.match(/^#{1,3}\s+/)) {
        return i;
      }
    }
    return startFrom;
  }

  private parseFrontMatter(
    lines: string[],
    start: number,
    end: number
  ): FrontMatterBlock[] {
    const blocks: FrontMatterBlock[] = [];
    let currentBlock: FrontMatterBlock | null = null;

    for (let i = start; i < end; i++) {
      const line = lines[i].trim();

      // Check for heading markers
      if (line.match(/^#{3,}\s+/)) {
        // Save previous block
        if (currentBlock) {
          blocks.push(currentBlock);
        }

        // Start new block
        const heading = line.replace(/^#{3,}\s+/, '').trim();
        const type = this.classifyFrontMatterType(heading);

        currentBlock = {
          type,
          heading,
          content: '',
          lineNumber: i + 1,
        };
      } else if (currentBlock && line) {
        // Add to current block
        currentBlock.content += (currentBlock.content ? '\n' : '') + line;
      }
    }

    // Save final block
    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  private classifyFrontMatterType(heading: string): FrontMatterBlock['type'] {
    const lower = heading.toLowerCase();
    if (lower.includes('acknowledgment')) return 'acknowledgments';
    if (lower.includes('cast')) return 'cast_list';
    if (lower.includes('note') || lower.includes('production')) return 'production_notes';
    return 'other';
  }

  // ==========================================================================
  // Content Parsing
  // ==========================================================================

  private parseContent(lines: string[], startFrom: number): ScriptElement[] {
    const content: ScriptElement[] = [];
    let currentCharacter: string | null = null;
    let i = startFrom;

    while (i < lines.length) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Skip empty lines
      if (!line) {
        i++;
        continue;
      }

      // Check for scene marker (### Scene Name)
      if (line.match(/^#{1,3}\s+/)) {
        const scene = this.parseScene(line, lineNumber);
        content.push(scene);
        currentCharacter = null;
        i++;
        continue;
      }

      // Check for dialogue (**CHARACTER:** text)
      const dialogueMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
      if (dialogueMatch) {
        const dialogue = this.parseDialogue(
          dialogueMatch[1],
          dialogueMatch[2],
          lineNumber
        );
        content.push(dialogue);
        currentCharacter = dialogue.character;
        i++;
        continue;
      }

      // Check for stage direction (*(text)*)
      if (line.startsWith('*(') && line.endsWith(')*')) {
        const direction = this.parseStageDirection(line, lineNumber);
        content.push(direction);
        currentCharacter = null;
        i++;
        continue;
      }

      // Check for multi-paragraph dialogue (continuation)
      if (currentCharacter && !line.startsWith('*')) {
        // This is a continuation of the previous dialogue
        const lastElement = content[content.length - 1];
        if (lastElement.type === 'dialogue') {
          lastElement.text += '\n\n' + line;
        }
        i++;
        continue;
      }

      // Unknown line - skip
      i++;
    }

    return content;
  }

  private parseScene(line: string, lineNumber: number): Scene {
    const levelMatch = line.match(/^(#{1,3})\s+/);
    const level = levelMatch ? levelMatch[1].length : 3;
    const title = line.replace(/^#{1,3}\s+/, '').trim();

    this.sceneCounter++;
    return {
      type: 'scene',
      id: `scene-${this.sceneCounter}`,
      level,
      title,
      lineNumber,
    };
  }

  private parseDialogue(
    characterRaw: string,
    textRaw: string,
    lineNumber: number
  ): Dialogue {
    // Extract inline direction (e.g., "NARRATOR 1: *(To the audience:)* text")
    let direction: string | undefined;
    let isOffstage = false;
    let text = textRaw;

    const directionMatch = text.match(/^\*\((.+?)(?::)?\)\*\s*(.*)$/);
    if (directionMatch) {
      direction = directionMatch[1].trim();
      text = directionMatch[2].trim();

      // Check if offstage
      if (direction.toLowerCase().includes('offstage')) {
        isOffstage = true;
      }
    }

    // Handle character variants (e.g., "JIMMY (JAMIE)")
    const character = characterRaw.replace(/\s*\(.+?\)\s*$/, '').trim();

    this.dialogueCounter++;
    return {
      type: 'dialogue',
      id: `line-${this.dialogueCounter}`,
      character,
      text,
      direction,
      isOffstage,
      lineNumber,
    };
  }

  private parseStageDirection(line: string, lineNumber: number): StageDirection {
    // Remove the wrapping *( )*
    const text = line.replace(/^\*\(/, '').replace(/\)\*$/, '').trim();

    // Check if this is a production note (starts with \*)
    // Production notes have \* inside: *(\*If guns not allowed...)*
    // For MVP, we treat them the same as stage directions

    this.directionCounter++;
    return {
      type: 'stage_direction',
      id: `direction-${this.directionCounter}`,
      text,
      scope: 'standalone',
      lineNumber,
    };
  }

  // ==========================================================================
  // Metadata Extraction
  // ==========================================================================

  private extractCharacters(content: ScriptElement[]): Character[] {
    const characterMap = new Map<string, {
      lineCount: number;
      firstAppearance: number;
    }>();

    for (const element of content) {
      if (element.type === 'dialogue') {
        const existing = characterMap.get(element.character);
        if (existing) {
          existing.lineCount++;
        } else {
          characterMap.set(element.character, {
            lineCount: 1,
            firstAppearance: element.lineNumber,
          });
        }
      }
    }

    return Array.from(characterMap.entries())
      .map(([name, data]) => ({
        name,
        lineCount: data.lineCount,
        firstAppearance: data.firstAppearance,
      }))
      .sort((a, b) => a.firstAppearance - b.firstAppearance);
  }

  private extractScenes(content: ScriptElement[]): SceneMetadata[] {
    const scenes: SceneMetadata[] = [];
    let currentScene: SceneMetadata | null = null;
    const characterSet = new Set<string>();

    for (const element of content) {
      if (element.type === 'scene') {
        // Save previous scene
        if (currentScene) {
          currentScene.characterCount = characterSet.size;
          scenes.push(currentScene);
          characterSet.clear();
        }

        // Start new scene
        currentScene = {
          id: element.id,
          title: element.title,
          level: element.level,
          lineRange: [element.lineNumber, element.lineNumber],
          characterCount: 0,
          dialogueCount: 0,
        };
      } else if (currentScene) {
        // Update scene metadata
        currentScene.lineRange[1] = element.lineNumber;

        if (element.type === 'dialogue') {
          currentScene.dialogueCount++;
          characterSet.add(element.character);
        }
      }
    }

    // Save final scene
    if (currentScene) {
      currentScene.characterCount = characterSet.size;
      scenes.push(currentScene);
    }

    return scenes;
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private resetCounters(): void {
    this.sceneCounter = 0;
    this.dialogueCounter = 0;
    this.directionCounter = 0;
  }
}
