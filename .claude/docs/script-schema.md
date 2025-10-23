# Script JSON Schema Design

## Philosophy: Universal & Flexible

This schema is designed to handle ANY theatrical script format:
- Traditional plays (Shakespeare, Tennessee Williams, etc.)
- Modern plays (this example)
- Musicals
- One-acts
- Experimental theater

**Principle**: Don't enforce a specific structure. Let the data dictate the structure.

---

## The Ideal JSON Structure

```typescript
interface Script {
  // Metadata
  title: string;                    // "10 Ways to Survive the Zombie Apocalypse"
  subtitle?: string;                // "A Comedy (We Hope)"
  author?: string;                  // "Don Zolidis"

  // Front matter (optional, preserved but not used for rehearsal)
  frontMatter?: FrontMatterBlock[]; // Acknowledgments, cast lists, etc.

  // The actual script content
  content: ScriptElement[];         // Flexible array of scenes, dialogue, stage directions

  // Extracted metadata for UI
  characters: Character[];          // All speaking roles found in the script
  scenes: SceneMetadata[];          // Quick navigation to scenes
}

interface FrontMatterBlock {
  type: 'acknowledgments' | 'cast_list' | 'production_notes' | 'other';
  heading?: string;                 // "### Acknowledgments"
  content: string;                  // Raw markdown content
}

interface ScriptElement {
  type: 'scene' | 'dialogue' | 'stage_direction';
  // ... type-specific fields below
}

// Scene markers
interface Scene extends ScriptElement {
  type: 'scene';
  id: string;                       // Generated: "scene-1", "scene-2"
  level: number;                    // 1 = Act, 2 = Scene, 3 = Subscene (from markdown heading level)
  title: string;                    // "Opening Scene", "Method I: Sacrifice the Weak"
  lineNumber: number;               // Line number in original markdown (for debugging)
}

// Dialogue lines
interface Dialogue extends ScriptElement {
  type: 'dialogue';
  id: string;                       // Generated: "line-1", "line-2", etc.
  character: string;                // "GIRL", "NARRATOR 1", "JIMMY"
  text: string;                     // The actual dialogue (can be multi-paragraph)

  // Optional modifiers
  direction?: string;               // "(angrily)", "(to the audience)", "(offstage)"
  isOffstage?: boolean;             // Extracted from "(Offstage:)" marker

  lineNumber: number;               // Line number in original markdown

  // Audio generation (added during Sprint 4: Audio Generation)
  audioUrl?: string;                // "/api/audio/session-123/line-45.wav"
  audioGenerated?: boolean;         // Has this line been generated?
  audioDuration?: number;           // Duration in seconds (for playback timing)
}

// Stage directions (blocking, props, etc.)
interface StageDirection extends ScriptElement {
  type: 'stage_direction';
  id: string;                       // Generated: "direction-1", etc.
  text: string;                     // "GIRL runs across the stage and hides"

  // Context
  scope: 'standalone' | 'inline';   // Standalone paragraph vs mid-dialogue
  relatedLineId?: string;           // If inline, which dialogue line?

  lineNumber: number;
}

// Character metadata (for voice assignment UI)
interface Character {
  name: string;                     // "GIRL", "NARRATOR 1"
  lineCount: number;                // Total lines in script
  firstAppearance: number;          // Line number of first dialogue

  // Variants (for flexible matching)
  aliases?: string[];               // ["JIMMY", "JAMIE"] (same character, different gender)

  // Voice assignment (stored per session, not in script JSON)
  // This is set during Sprint 3: Role Selection & Voice Assignment
}

// Voice configuration (stored in session, not script)
interface VoiceConfig {
  characterName: string;            // "GIRL", "ZOMBIE 1"

  // Simple sliders (kid-friendly controls)
  gender: 'male' | 'female';        // Voice gender
  emotion: 'neutral' | 'happy' | 'sad' | 'angry';  // Emotional tone
  age?: 'child' | 'teen' | 'adult'; // Age range (optional)

  // OR use a preset voice (advanced)
  presetVoiceId?: string;           // "voice-123" from TTS service
}

// Scene metadata (for navigation)
interface SceneMetadata {
  id: string;                       // "scene-1"
  title: string;                    // "Opening Scene"
  level: number;                    // Heading level (1-3)
  lineRange: [number, number];      // [44, 125] - start/end line numbers
  characterCount: number;           // How many characters appear in this scene?
  dialogueCount: number;            // How many lines of dialogue?
}
```

---

## Example: Parsing "Opening Scene"

**Input Markdown** (lines 44-125):
```markdown
### Opening Scene

*(A ruined, nightmarish landscape.)*

**GIRL:** Go go go go!

*(GIRL runs across the stage and hides behind something.)*

You can do it! Come on!
```

**Output JSON**:
```json
{
  "content": [
    {
      "type": "scene",
      "id": "scene-1",
      "level": 3,
      "title": "Opening Scene",
      "lineNumber": 44
    },
    {
      "type": "stage_direction",
      "id": "direction-1",
      "text": "A ruined, nightmarish landscape.",
      "scope": "standalone",
      "lineNumber": 46
    },
    {
      "type": "dialogue",
      "id": "line-1",
      "character": "GIRL",
      "text": "Go go go go!",
      "lineNumber": 48
    },
    {
      "type": "stage_direction",
      "id": "direction-2",
      "text": "GIRL runs across the stage and hides behind something.",
      "scope": "standalone",
      "lineNumber": 50
    },
    {
      "type": "dialogue",
      "id": "line-2",
      "character": "GIRL",
      "text": "You can do it! Come on!",
      "lineNumber": 52
    }
  ]
}
```

---

## Edge Cases We're Handling

### 1. Character Name Variations

**Examples from the script**:
- `**NARRATOR 1:**` → character: "NARRATOR 1"
- `**ZOMBIE 2:**` → character: "ZOMBIE 2"
- `**JIMMY (JAMIE):**` → character: "JIMMY", aliases: ["JAMIE"]

**Rule**: Extract everything before the colon, strip markdown, handle parenthetical variants.

### 2. Inline Stage Directions

**Example**:
```markdown
**NARRATOR 1:** *(To the audience:)* And that's why you don't see many old people...
```

**Parsed**:
```json
{
  "type": "dialogue",
  "character": "NARRATOR 1",
  "direction": "To the audience",
  "text": "And that's why you don't see many old people..."
}
```

### 3. Multi-Paragraph Dialogue

**Example** (lines 806-807):
```markdown
**CHRISTY:** Have a seat. Before you devour me...

So you see, your desire to consume us...
```

**Rule**: If a paragraph doesn't start with `**CHARACTER:**`, it continues the previous character's dialogue.

### 4. Production Notes

**Example** (line 856):
```markdown
*(\*If guns are not allowed in your production...)*
```

**Rule**:
- Asterisk inside parentheses = production note (metadata, not stage direction)
- Store in `frontMatter` or ignore (director's notes, not needed for rehearsal)

### 5. Offstage Dialogue

**Example** (line 644):
```markdown
**JIMMY:** *(Offstage:)* Ah Zombies!
```

**Parsed**:
```json
{
  "type": "dialogue",
  "character": "JIMMY",
  "direction": "Offstage",
  "isOffstage": true,
  "text": "Ah Zombies!"
}
```

### 6. Front Matter

**Example** (lines 8-41): Acknowledgments and cast lists

**Rule**:
- Everything before the first scene marker goes into `frontMatter[]`
- Preserve as-is (markdown), don't parse
- Not used for rehearsal, but available for reference

---

## Parser Strategy

### Phase 1: Classify Blocks
1. **Identify front matter** - Everything before first scene
2. **Identify scenes** - Markdown headings (`###`, `##`, `#`)
3. **Identify character dialogue** - Lines starting with `**CHARACTER:**`
4. **Identify stage directions** - Lines starting with `*(`
5. **Handle continuation dialogue** - Plain text following dialogue

### Phase 2: Extract Metadata
1. **Character list** - Collect all unique character names, count lines
2. **Scene index** - Build navigation metadata
3. **Validate** - Ensure all required fields are present

### Phase 3: Generate IDs
1. Scenes: `scene-1`, `scene-2`, etc.
2. Dialogue: `line-1`, `line-2`, etc.
3. Directions: `direction-1`, `direction-2`, etc.

---

## Why This Schema is Universal

1. **No assumptions about structure** - Works for Acts/Scenes, Methods, or freeform
2. **Flexible character names** - Handles numbers, variants, parentheticals
3. **Preserves intent** - Stage directions vs dialogue vs production notes
4. **Navigation-friendly** - Scene metadata allows quick jumps
5. **Rehearsal-optimized** - Easy to filter to one character's lines
6. **Extensible** - Can add emotions, blocking, etc. later

---

## Next Steps

1. **Review this schema** - Does it make sense for your use case?
2. **Test with edge cases** - Do you have other script formats to test?
3. **Build the parser** - TypeScript service that converts markdown → this JSON
4. **Validate output** - Throwaway test with 5-10 real scripts

---

## Decisions Made (2025-10-23)

### 1. Character Variants
**Decision**: `JIMMY (JAMIE)` = Same character, one voice
- Parenthetical notes are for gender-swapped casting flexibility
- User assigns one voice per character name

### 2. Front Matter
**Decision**: Parse and store everything
- Acknowledgments, cast lists, production notes → all preserved
- Display in UI as reference material
- Helps students understand context and production history

### 3. Production Notes
**Decision**: Store as metadata, display on screen
- Notes like `*(\*If guns not allowed...)*` are helpful context
- Display alongside stage directions
- Not spoken, just visual reference

### 4. Multi-Paragraph Dialogue
**Decision**: One turn, all paragraphs together
- If paragraph doesn't start with `**CHARACTER:**`, it continues previous dialogue
- User reads all paragraphs, then clicks "Continue" once
- Keeps rehearsal flow smooth

### 5. Stage Directions
**Decision**: Display on screen, NOT spoken
- Visual cues only (for MVP)
- Helps actors understand blocking and context
- Faster than generating narrator audio for every direction

### 6. Audio Generation Strategy
**Decision**: Batch pre-generation, NOT real-time
- Parse script → User assigns voices → Generate ALL audio files upfront
- During rehearsal: Play pre-generated WAV files in sequence
- Benefits: No latency, can cache between sessions, smooth playback

### 7. Voice Assignment
**Decision**: Simple sliders + smart defaults
- Sliders: Gender (male/female), Emotion (neutral/happy/sad/angry), Age (child/teen/adult)
- Auto-assign voices based on character names (GIRL → female teen, ZOMBIE → male angry)
- User can override individually or bulk-assign (all ZOMBIES same voice)
- Critical for scripts with 30-50 characters

### 8. Narrator Characters
**Clarification**: NARRATOR 1, NARRATOR 2 are speaking roles
- Treat like any other character (assign voice, generate audio)
- Not a separate "system narrator" - they're part of the play

### 9. Ensemble Characters
**Decision**: User assigns voice(s) to character
- "ZOMBIES" can have one voice OR multiple voices assigned
- For MVP: One voice per character name (simpler)
- Future: Multiple voices for ensemble effect
