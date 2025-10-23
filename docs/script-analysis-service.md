# Script Analysis Service - Design Spec

## Overview
Use OpenAI GPT-4 to analyze uploaded scripts and generate rich theater metadata for the UI.

## Why This Works
- **One-time cost**: Run analysis once during upload, cache results forever
- **Smart fallbacks**: If API fails, UI degrades gracefully (shows basic data only)
- **Theater expertise**: GPT-4 knows theater terminology, can identify genres, suggest emojis
- **Scales to any script**: Romeo & Juliet to zombie comedy to radio plays

---

## What We Analyze

### 1. Script-Level Metadata
**Input**: Full script markdown
**Output**:
```json
{
  "genre": ["Comedy", "Horror Parody"],
  "style": ["Ensemble Cast", "Physical Comedy", "Breaking Fourth Wall"],
  "estimatedRuntime": 45,
  "themes": ["Survival", "Teamwork", "Satire"],
  "audience": "Teen/Young Adult",
  "tone": "Comedic with moments of tension"
}
```

**Prompt**:
```
Analyze this theater script and provide:
1. Primary genre(s) (Comedy, Drama, Tragedy, Horror, etc.)
2. Performance style tags (Ensemble, Two-Hander, Musical, Physical Comedy, etc.)
3. Estimated runtime in minutes (based on page count/dialogue density)
4. Major themes
5. Target audience
6. Overall tone

Return as JSON.

Script:
[full markdown]
```

---

### 2. Character Analysis
**Input**: Character name + all their lines
**Output** (per character):
```json
{
  "characterName": "NARRATOR 1",
  "emoji": "🎤",
  "description": "Quick-witted storyteller who breaks the fourth wall and guides the audience through chaos with sardonic humor",
  "roleType": "Lead",
  "skillsNeeded": ["Comedy Timing", "Direct Address", "Storytelling", "Audience Interaction"],
  "characterArc": "Grows from detached observer to invested participant",
  "personalityTraits": ["Sarcastic", "Energetic", "Self-aware"]
}
```

**Prompt**:
```
Analyze this character from a theater script:

Character Name: NARRATOR 1
Lines: [all their dialogue]
Scenes: [scene numbers/names they appear in]

Provide:
1. Best emoji to represent this character (single emoji, consider name/role/personality)
2. 1-2 sentence character description (personality, function in story)
3. Role type: Lead, Supporting, Featured, Ensemble
4. Skills needed to play this role (max 4): e.g., "Comedy Timing", "Physical Comedy", "Vocal Range", "Emotional Depth"
5. Brief character arc (how they change)
6. 3 personality traits

Return as JSON.
```

---

### 3. Scene Analysis
**Input**: Scene heading + content
**Output** (per scene):
```json
{
  "sceneNumber": 3,
  "sceneName": "The Basement Discovery",
  "sceneEmoji": "🏚️",
  "location": "Basement",
  "description": "The group discovers a zombie trapped in the basement. Tension builds as they debate what to do.",
  "mood": "Tense with comedic relief",
  "objectivesByCharacter": {
    "NARRATOR 1": "Warn the group about the danger",
    "ZOMBIE": "Express hunger in a darkly comedic way",
    "GIRL": "Question the group's plan",
    "BOY": "Provide comic relief through fear"
  },
  "charactersPresent": ["NARRATOR 1", "NARRATOR 2", "ZOMBIE", "GIRL", "BOY"]
}
```

**Prompt**:
```
Analyze this scene from a theater script:

Scene Heading: ## Scene 3
Content: [scene markdown]

Provide:
1. A compelling scene name/title (beyond just "Scene 3")
2. Best emoji to represent the scene location/mood
3. Location (if identifiable)
4. 1-2 sentence description of what happens
5. Overall mood/tone of the scene
6. Objective for each character in the scene (what they want)
7. List of characters present

Return as JSON.
```

---

### 4. Beat Analysis (Optional - Sprint 5+)
**Input**: Individual dialogue line + context
**Output**:
```json
{
  "lineId": "line-23",
  "beat": "Warning",
  "motivation": "You're trying to save their lives",
  "suggestedBlockingHint": "Step forward, dramatic gesture toward audience",
  "emotionalIntensity": 8
}
```

**Note**: This might be too heavy (1 API call per line = expensive). Consider:
- Only analyze "key lines" (every 10th line? User-flagged?)
- Run in background after upload
- Make optional feature for advanced users

---

## Implementation Plan

### Phase 1: Script & Character Analysis (Sprint 4)
1. **Service**: `backend/src/services/scriptAnalysis.service.ts`
2. **Database**: Add `analysis` JSONB column to `scripts` table
3. **Trigger**: Run analysis after successful script upload
4. **Storage**: Cache all results in database
5. **API**: Add GET `/api/scripts/:id/analysis` endpoint

### Phase 2: Scene Analysis (Sprint 5)
1. Extend analysis service
2. Add `scene_analysis` table (or embed in script analysis JSON)
3. Use during rehearsal to show scene context

### Phase 3: Beat Analysis (Future)
1. Optional premium feature?
2. Run on-demand when user opens rehearsal mode
3. Cache per session

---

## Service Architecture

```typescript
// backend/src/services/scriptAnalysis.service.ts

import OpenAI from 'openai';

interface ScriptAnalysisResult {
  scriptLevel: ScriptMetadata;
  characters: CharacterAnalysis[];
  scenes: SceneAnalysis[];
  analyzedAt: string;
  tokensUsed: number;
}

class ScriptAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeScript(script: ParsedScript): Promise<ScriptAnalysisResult> {
    // Run all analyses in parallel
    const [scriptLevel, characters, scenes] = await Promise.all([
      this.analyzeScriptLevel(script),
      this.analyzeCharacters(script),
      this.analyzeScenes(script),
    ]);

    return {
      scriptLevel,
      characters,
      scenes,
      analyzedAt: new Date().toISOString(),
      tokensUsed: /* track this */,
    };
  }

  private async analyzeScriptLevel(script: ParsedScript): Promise<ScriptMetadata> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper model is fine for this
      messages: [
        {
          role: 'system',
          content: 'You are a theater expert analyzing scripts. Return valid JSON only.',
        },
        {
          role: 'user',
          content: this.buildScriptLevelPrompt(script),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temp for consistency
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async analyzeCharacters(script: ParsedScript): Promise<CharacterAnalysis[]> {
    // Batch analyze all characters in one call (more efficient)
    const characterPrompts = script.characters.map(char => ({
      name: char.name,
      lines: this.getCharacterLines(script, char.name),
      scenes: this.getCharacterScenes(script, char.name),
    }));

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a theater casting director. Analyze these characters and return JSON.',
        },
        {
          role: 'user',
          content: this.buildCharactersPrompt(characterPrompts),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    return JSON.parse(response.choices[0].message.content).characters;
  }

  private async analyzeScenes(script: ParsedScript): Promise<SceneAnalysis[]> {
    // Similar to characters - batch process
    // ...
  }

  // Helper methods to build prompts
  private buildScriptLevelPrompt(script: ParsedScript): string {
    return `Analyze this theater script...`;
  }
}

export const scriptAnalysisService = new ScriptAnalysisService();
```

---

## Database Schema Updates

```sql
-- Add analysis column to scripts table
ALTER TABLE scripts ADD COLUMN analysis JSONB;
ALTER TABLE scripts ADD COLUMN analysis_tokens_used INTEGER DEFAULT 0;
ALTER TABLE scripts ADD COLUMN analyzed_at DATETIME;

-- Index for querying
CREATE INDEX idx_scripts_analyzed ON scripts(analyzed_at);
```

---

## Cost Estimation

**Example**: 10 Ways to Survive Zombie Apocalypse
- **Script tokens**: ~8,000 tokens (full markdown)
- **GPT-4o-mini pricing**: $0.150 / 1M input tokens, $0.600 / 1M output tokens
- **Estimated cost per script**: $0.01 - $0.05

**For 100 scripts/month**: ~$5/month in OpenAI costs

---

## Error Handling & Fallbacks

```typescript
// If OpenAI fails, degrade gracefully
{
  "scriptLevel": {
    "genre": [], // Empty - UI shows "Unknown Genre"
    "estimatedRuntime": null, // UI hides runtime
  },
  "characters": [
    {
      "characterName": "NARRATOR 1",
      "emoji": "🎭", // Default emoji
      "description": "", // UI hides description
      "roleType": "Ensemble", // Default
      "skillsNeeded": [], // UI hides skills
    }
  ]
}
```

**UI Behavior**:
- If `analysis` is null → Show basic UI (like current Sprint 3)
- If `analysis.characters[X].description` is empty → Hide that card section
- If `analysis.scriptLevel.genre` is empty → Hide genre tags

---

## API Endpoints

```typescript
// Get script with analysis
GET /api/scripts/:id
Response: {
  ...scriptData,
  analysis: {
    scriptLevel: { ... },
    characters: [ ... ],
    scenes: [ ... ]
  }
}

// Trigger re-analysis (if user uploads new version)
POST /api/scripts/:id/analyze
Response: { message: 'Analysis queued', estimatedTime: '30s' }

// Check analysis status
GET /api/scripts/:id/analysis/status
Response: { status: 'completed' | 'pending' | 'failed', tokensUsed: 1234 }
```

---

## Integration Points

### Sprint 4: Audio Generation
- Use character emojis in UI
- Show character descriptions during voice assignment
- Use scene mood/tone to suggest voice emotions

### Sprint 5: Rehearsal Playback
- Show scene context at top (name, description, objective)
- Display beat/motivation hints for lines
- Use character skills to suggest practice exercises

---

## Open Questions

1. **When to run analysis?**
   - Option A: Synchronously during upload (user waits ~10-30s)
   - Option B: Asynchronously after upload (user sees "Analyzing..." status)
   - **Recommendation**: Option B - queue analysis, show progress

2. **Re-analysis triggers?**
   - If user uploads same script again?
   - If analysis schema changes (we add new fields)?
   - Manual "Re-analyze" button?

3. **Character emoji fallback logic?**
   - If OpenAI suggests invalid emoji?
   - If emoji doesn't render on all platforms?
   - **Recommendation**: Validate emoji, fallback to 🎭

4. **Privacy/content policy?**
   - Scripts might contain copyrighted material
   - OpenAI terms: OK for processing, not training (if opted out)
   - **Recommendation**: Add disclaimer during upload

---

## Next Steps

1. **Prototype** the analysis prompts with GPT-4o-mini
2. **Test** with 3-5 different scripts (comedy, drama, Shakespeare)
3. **Refine** prompts based on output quality
4. **Implement** ScriptAnalysisService in Sprint 4
5. **Update** frontend UI to consume analysis data

---

**Does this approach work for you?** Should I create the prototype prompts and test them with some sample scripts?
