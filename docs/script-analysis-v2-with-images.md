# Script Analysis Service v2 - With Character Portraits

## Overview
Use OpenAI's **GPT-5 mini** (text analysis) + **GPT-image-1** (character portraits) to generate rich theater metadata and personalized character images.

---

## 💰 Cost Breakdown (Per Script)

Based on **actual 2025 OpenAI pricing**:

### Text Analysis (GPT-5 mini)
- **Script-level analysis**: ~10,000 input tokens, ~500 output
  - Cost: ($0.25 × 0.01) + ($2.00 × 0.0005) = **$0.003**

- **Character analysis** (11 characters): ~5,500 input, ~2,000 output
  - Cost: ($0.25 × 0.0055) + ($2.00 × 0.002) = **$0.005**

- **Scene analysis** (12 scenes): ~8,000 input, ~1,500 output
  - Cost: ($0.25 × 0.008) + ($2.00 × 0.0015) = **$0.005**

**Text Analysis Total: ~$0.013 per script**

### Character Portraits (GPT-image-1)
- **11 characters × medium quality**: 11 × $0.04 = **$0.44**

**Image Generation Total: $0.44 per script**

---

## 🎯 Total Cost Per Script

**Standard Processing**: ~**$0.45 per script**

**With Batch API (50% discount)**: ~**$0.22 per script**

### For 100 scripts/month:
- Standard: **$45/month**
- Batch: **$22.50/month**

---

## 🎨 What We Get

### 1. Character Portraits (Instead of Emojis!)
**GPT-image-1** generates custom images for each character:

```json
{
  "characterName": "NARRATOR 1",
  "portrait": {
    "imageUrl": "https://...",
    "base64": "iVBORw0KGgo...",
    "prompt": "A charismatic young storyteller with expressive eyes and a mischievous smile, wearing casual modern clothes, digital art style, vibrant colors, theater lighting"
  },
  "description": "Quick-witted storyteller who breaks the fourth wall",
  "roleType": "Lead",
  "skillsNeeded": ["Comedy Timing", "Direct Address", "Storytelling"]
}
```

**Portrait Styles:**
- **Digital art** (vivid, theatrical)
- **Consistent style** across all characters
- **Age-appropriate** for script context
- **1024x1024 medium quality** (perfect for cards)

### 2. Script Metadata
```json
{
  "genre": ["Comedy", "Horror Parody"],
  "style": ["Ensemble Cast", "Physical Comedy", "Breaking Fourth Wall"],
  "estimatedRuntime": 45,
  "themes": ["Survival", "Teamwork", "Satire"],
  "tone": "Comedic with moments of tension"
}
```

### 3. Character Analysis
```json
{
  "characterName": "ZOMBIE",
  "description": "Not your typical mindless zombie - has personality, comedic timing, and surprising depth",
  "roleType": "Featured",
  "skillsNeeded": ["Physical Comedy", "Vocal Work", "Monster Acting"],
  "characterArc": "Evolves from scary threat to sympathetic character",
  "personalityTraits": ["Hungry", "Misunderstood", "Darkly Funny"]
}
```

### 4. Scene Context
```json
{
  "sceneNumber": 3,
  "sceneName": "The Basement Discovery",
  "sceneEmoji": "🏚️",
  "location": "Basement",
  "description": "The group discovers a zombie trapped in the basement",
  "mood": "Tense with comedic relief",
  "objectivesByCharacter": {
    "NARRATOR 1": "Warn the group about danger",
    "ZOMBIE": "Express hunger in darkly comedic way"
  }
}
```

---

## 🏗️ Implementation Strategy

### Phase 1: Text Analysis Only (Sprint 4)
Run text analysis immediately, generate portraits asynchronously.

**Workflow:**
1. User uploads script → Parse markdown
2. **Queue text analysis** (GPT-5 mini) → Returns in ~10-30s
3. **Queue character portraits** (GPT-image-1) → Returns in ~60-90s
4. Show script library immediately (with loading states)
5. Portraits populate as they complete

### Phase 2: Batch Processing (Sprint 5+)
Use Batch API to cut costs in half.

**Batch Workflow:**
1. User uploads script → Parse markdown
2. Queue **batch job** (all analysis + portraits)
3. Process overnight (up to 24 hours)
4. Show "Analyzing..." status in UI
5. Complete batch → Update database → Notify user

---

## 📸 Character Portrait Prompts

### Template
```
Create a character portrait for a theater production:

Character: {characterName}
Description: {characterDescription}
Age: {estimatedAge}
Personality: {personalityTraits}
Role: {roleType}

Style: Digital art, theatrical lighting, vibrant colors, expressive, portrait orientation
Quality: Medium
Background: Subtle theater stage backdrop with soft lighting
Mood: {characterMood}

The image should capture their personality and be suitable for a teen theater app.
```

### Example Prompts

**NARRATOR 1:**
```
Create a character portrait for a theater production:

Character: Narrator 1 - Quick-witted storyteller
Age: 16-18 years old
Personality: Sarcastic, energetic, self-aware
Role: Lead narrator who breaks the fourth wall

Style: Digital art, theatrical spotlight lighting, vibrant warm colors (amber/orange), expressive face with mischievous smile, confident pose
Quality: Medium (1024x1024)
Background: Soft theater stage backdrop with golden spotlight
Mood: Playful and engaging, direct eye contact with viewer

The portrait should feel like they're about to tell you an amazing story.
```

**ZOMBIE:**
```
Create a character portrait for a theater production:

Character: Zombie - Comedic monster with personality
Age: Indeterminate (undead)
Personality: Hungry, misunderstood, darkly funny
Role: Featured antagonist with surprising depth

Style: Digital art, eerie green theatrical lighting, horror-comedy aesthetic, exaggerated features, theatrical makeup style
Quality: Medium (1024x1024)
Background: Dark basement with dramatic shadows
Mood: Scary but comedic, over-the-top horror

The portrait should be theatrical zombie makeup, not realistic gore - suitable for teen comedy.
```

---

## 🔄 Service Architecture

```typescript
// backend/src/services/scriptAnalysis.service.ts

import OpenAI from 'openai';

interface ScriptAnalysisResult {
  scriptLevel: ScriptMetadata;
  characters: CharacterAnalysisWithPortrait[];
  scenes: SceneAnalysis[];
  analyzedAt: string;
  tokensUsed: number;
  imageGenerationCost: number;
}

class ScriptAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeScript(script: ParsedScript): Promise<ScriptAnalysisResult> {
    // Run text analysis in parallel
    const [scriptLevel, characters, scenes] = await Promise.all([
      this.analyzeScriptLevel(script),
      this.analyzeCharacters(script),
      this.analyzeScenes(script),
    ]);

    // Generate character portraits in parallel (after we have descriptions)
    const charactersWithPortraits = await this.generateCharacterPortraits(characters);

    return {
      scriptLevel,
      characters: charactersWithPortraits,
      scenes,
      analyzedAt: new Date().toISOString(),
      tokensUsed: /* track this */,
      imageGenerationCost: characters.length * 0.04, // $0.04 per medium-quality image
    };
  }

  private async generateCharacterPortraits(
    characters: CharacterAnalysis[]
  ): Promise<CharacterAnalysisWithPortrait[]> {
    // Generate all portraits in parallel (GPT-image-1 is fast!)
    const portraitPromises = characters.map(char =>
      this.generateCharacterPortrait(char)
    );

    const portraits = await Promise.all(portraitPromises);

    return characters.map((char, i) => ({
      ...char,
      portrait: portraits[i],
    }));
  }

  private async generateCharacterPortrait(
    character: CharacterAnalysis
  ): Promise<CharacterPortrait> {
    const prompt = this.buildPortraitPrompt(character);

    const response = await this.openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: 'medium', // $0.04 per image
      n: 1,
      response_format: 'b64_json', // Get base64 to store in DB
    });

    const imageData = response.data[0];

    // Store in our storage (S3, local filesystem, etc.)
    const storedUrl = await this.storeImage(imageData.b64_json, character.characterName);

    return {
      imageUrl: storedUrl,
      base64: imageData.b64_json,
      prompt: prompt,
      revisedPrompt: imageData.revised_prompt,
    };
  }

  private buildPortraitPrompt(character: CharacterAnalysis): string {
    return `Create a character portrait for a theater production:

Character: ${character.characterName}
Description: ${character.description}
Personality: ${character.personalityTraits.join(', ')}
Role: ${character.roleType}

Style: Digital art, theatrical lighting, vibrant colors, expressive, portrait orientation
Quality: Medium
Background: Subtle theater stage backdrop with soft lighting
Mood: ${this.inferMoodFromTraits(character.personalityTraits)}

The image should capture their personality and be suitable for a teen theater app.
Teen-appropriate, theatrical style, no realistic gore or violence.`;
  }

  private async analyzeScriptLevel(script: ParsedScript): Promise<ScriptMetadata> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-5-mini', // Cheaper for analysis
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
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  // ... similar for analyzeCharacters, analyzeScenes
}
```

---

## 📦 Database Schema Updates

```sql
-- Add analysis column to scripts table (JSONB for flexibility)
ALTER TABLE scripts ADD COLUMN analysis JSONB;
ALTER TABLE scripts ADD COLUMN analysis_tokens_used INTEGER DEFAULT 0;
ALTER TABLE scripts ADD COLUMN analysis_cost_usd DECIMAL(10,4) DEFAULT 0;
ALTER TABLE scripts ADD COLUMN analyzed_at DATETIME;

-- Optional: Separate table for character portraits (if large)
CREATE TABLE character_portraits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  script_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_base64 TEXT, -- Optional: store inline for offline use
  prompt TEXT,
  revised_prompt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  UNIQUE(script_id, character_name)
);

-- Index for fast lookups
CREATE INDEX idx_portraits_script ON character_portraits(script_id);
```

---

## 🎨 Frontend UI Updates

### Character Card (with portrait!)

```tsx
<Card className="card-hover">
  <div className="relative">
    {/* Character Portrait - replaces emoji! */}
    <img
      src={character.portrait.imageUrl}
      alt={character.characterName}
      className="w-full aspect-square object-cover rounded-t-3xl"
    />

    {/* Role badge overlay */}
    {character.roleType === 'Lead' && (
      <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-red-500 px-3 py-1 rounded-full">
        🌟 LEAD
      </div>
    )}
  </div>

  {/* Character info */}
  <div className="p-6">
    <h3 className="text-3xl font-black">{character.characterName}</h3>
    <p className="text-sm text-gray-300 mt-2">{character.description}</p>

    {/* Theater stats */}
    <div className="space-y-2 mt-4">
      <div className="flex justify-between">
        <span className="text-gray-400">Lines:</span>
        <span className="font-bold text-yellow-400">{character.lineCount}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Scenes:</span>
        <span className="font-bold">{character.sceneCount}</span>
      </div>
    </div>

    {/* Skills */}
    <div className="flex flex-wrap gap-1 mt-4">
      {character.skillsNeeded.map(skill => (
        <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-xs">
          {skill}
        </span>
      ))}
    </div>
  </div>
</Card>
```

---

## 🚀 Migration Path

### Sprint 4: Basic Implementation
1. Implement text analysis (GPT-5 mini)
2. Generate portraits synchronously (user waits ~60-90s)
3. Fallback to emoji if image generation fails
4. Store portraits in database

### Sprint 5: Optimization
1. Switch to Batch API (50% cost savings)
2. Generate portraits asynchronously (background job)
3. Show loading states in UI
4. Cache portraits forever

### Future: Advanced Features
1. **Regenerate portrait** button (if user doesn't like it)
2. **Style selector** (realistic, cartoon, sketch, etc.)
3. **Pose/expression variants** (happy, serious, action)
4. **Scene illustrations** (not just characters)

---

## 💡 Smart Fallbacks

```typescript
// If image generation fails
{
  "portrait": {
    "imageUrl": null,
    "fallbackEmoji": "🎭", // Show emoji instead
    "error": "Image generation failed",
  }
}
```

**UI Behavior:**
- If `portrait.imageUrl` exists → Show character portrait
- If `portrait.imageUrl` is null → Show fallback emoji (like before)
- If entire analysis fails → Show basic UI (current Sprint 3 behavior)

---

## 🎯 Example Output

For "10 Ways to Survive Zombie Apocalypse":

**Cost Breakdown:**
- Text analysis: $0.013
- 11 character portraits (medium): $0.44
- **Total: $0.45** (or $0.22 with Batch API)

**What You Get:**
- Genre tags, runtime estimate, themes
- 11 custom character portraits (theater-style digital art)
- Character descriptions, skills needed, arcs
- 12 scene descriptions with objectives
- All cached forever in database

---

## ✅ Recommendation

**Use Standard Processing for MVP** ($0.45/script):
- Fast results (user sees portraits in ~90 seconds)
- Good user experience during upload
- Can switch to Batch later for cost optimization

**Switch to Batch API later** ($0.22/script):
- Once you have many users
- Process uploads overnight
- 50% cost savings at scale

---

**This is WAY better than emojis!** Character portraits make the app feel professional and personalized. Should I update the mockups to show portrait images instead of emojis?
