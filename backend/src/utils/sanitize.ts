/**
 * Sanitizes a character name for use in filenames
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 *
 * @param name - Character name (e.g., "NARRATOR ONE", "ZOMBIE 1")
 * @returns Sanitized filename-safe string (e.g., "narrator-one", "zombie-1")
 */
export function sanitizeCharacterName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // "NARRATOR ONE" → "narrator-one"
    .replace(/[^a-z0-9-]/g, '');  // Remove special chars
}

/**
 * Generates a dialogue audio filename
 * Format: {character-name}-line-{index}.wav
 *
 * @param character - Character name
 * @param lineIndex - Global line index (1-based)
 * @returns Filename (e.g., "narrator-one-line-1.wav")
 */
export function getDialogueFilename(character: string, lineIndex: number): string {
  const sanitized = sanitizeCharacterName(character);
  return `${sanitized}-line-${lineIndex}.wav`;
}

/**
 * Generates a character card audio filename
 * Format: {character-name}.wav
 *
 * @param character - Character name
 * @returns Filename (e.g., "narrator-one.wav")
 */
export function getCharacterCardFilename(character: string): string {
  const sanitized = sanitizeCharacterName(character);
  return `${sanitized}.wav`;
}
