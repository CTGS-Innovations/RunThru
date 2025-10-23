/**
 * Script Parser Service
 * Converts markdown scripts to structured JSON
 */

export interface Line {
  id: string;
  character: string;
  text: string;
  emotion?: string;
  stageDirection?: string;
}

export interface Scene {
  id: string;
  title: string;
  lines: Line[];
}

export interface ParsedScript {
  title: string;
  characters: string[];
  scenes: Scene[];
}

export class ScriptParserService {
  /**
   * Parse markdown script into structured format
   */
  parse(markdown: string): ParsedScript {
    // TODO: Implement full parsing logic
    // For now, return stub
    return {
      title: 'Sample Script',
      characters: ['CHARACTER_1', 'CHARACTER_2'],
      scenes: [
        {
          id: 'scene-1',
          title: 'Scene 1',
          lines: [
            {
              id: 'line-1',
              character: 'CHARACTER_1',
              text: 'Hello world',
              emotion: 'neutral',
            },
          ],
        },
      ],
    };
  }
}
