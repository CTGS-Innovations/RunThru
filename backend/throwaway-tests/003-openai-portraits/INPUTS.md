# OpenAI Portrait Generation - Available Inputs

## What We Have From Parsed Scripts

### Script-Level Data
```typescript
{
  title: string;              // "10 Ways to Survive a Zombie Apocalypse"
  subtitle?: string;          // Optional subtitle
  author?: string;            // Script author
  frontMatter: [...];         // Acknowledgments, cast lists, production notes
}
```

### Character Data
```typescript
{
  name: string;               // "NARRATOR 1", "ZOMBIE", "GIRL 1"
  lineCount: number;          // Total dialogue lines (e.g., 85)
  firstAppearance: number;    // Line number where they first appear
  aliases?: string[];         // Alternate names (e.g., ["NARRATOR 1", "NARRATOR1"])
}
```

### Dialogue Samples (Per Character)
```typescript
{
  character: string;          // "NARRATOR 1"
  text: string;               // Actual dialogue text
  direction?: string;         // "(angrily)", "(to the audience)"
  isOffstage?: boolean;       // Speaking from offstage
}
```

### Scene Context
```typescript
{
  title: string;              // "Scene 1: The Beginning"
  level: number;              // 1=Act, 2=Scene, 3=Subscene
  characterCount: number;     // How many characters in this scene
  dialogueCount: number;      // Total dialogue lines
}
```

## What We DON'T Have (Yet)

- ❌ Character age (need to infer from dialogue/script style)
- ❌ Character personality traits (need OpenAI to analyze)
- ❌ Character descriptions (need OpenAI to analyze)
- ❌ Character relationships (need OpenAI to analyze)
- ❌ Script genre/tone (need OpenAI to analyze)
- ❌ Character emotions/mood (can infer from directions)

## OpenAI Analysis Pipeline

### Step 1: Text Analysis (GPT-4o-mini)
**Input**: ParsedScript with all above data
**Output**:
- Script metadata (genre, themes, tone, estimated runtime)
- Character analysis (descriptions, personality traits, role type, skills needed)
- Scene analysis (mood, objectives, locations)

**Cost**: ~$0.013 per script

### Step 2: Portrait Generation (DALL-E 3)
**Input**: Character analysis from Step 1
**Output**: 1024x1024 portrait image (base64)

**Cost**: $0.04 per image × N characters

## Test Strategy

### Goal
Validate that character portraits:
1. Match the script's style/genre
2. Look appropriate for teen theater app
3. Are distinct and recognizable
4. Work across different script types

### Test Scripts
1. **Zombie Apocalypse** (comedy/horror, 11 characters) - Already have
2. **Shakespeare excerpt** (classic tragedy, 2-3 characters) - Generate with AI
3. **Modern drama excerpt** (contemporary, 2-3 characters) - Generate with AI

### What to Measure
- ✅ Portrait quality (theatrical, teen-appropriate)
- ✅ Style consistency across characters in same script
- ✅ Style variation across different script genres
- ✅ Prompt effectiveness (does description → image work well?)
- ✅ Cost per script (should be ~$0.45 for 11 characters)
- ✅ Generation time (should be ~60-90 seconds for 11 characters)

### Success Criteria
- Portraits look theatrical (not photorealistic)
- Teen-appropriate (no gore, violence, etc.)
- Characters are distinguishable
- Style matches script tone
- Prompts are working as intended

## Next Steps
1. Run test with Zombie script (11 characters)
2. Review 2-3 sample portraits
3. Iterate on prompt if needed
4. Test with variety (different genres)
5. Document findings in `RESULTS.md`
