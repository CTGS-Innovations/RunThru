# Enhanced Multi-Pass Character Analysis

**Sprint**: Sprint 5 - Enhanced Character Cards
**Status**: In Progress
**Cost per Script**: ~$1.80 (one-time)
**Value**: Professional dramaturg-level character analysis

## Overview

Transform character cards from basic stats into comprehensive actor preparation guides by implementing a multi-pass OpenAI analysis system.

## Architecture

### Pass 1: Script Intelligence ($0.15)
**Input**: Full script markdown
**Output**: `ScriptIntelligence` object
**Purpose**: Understand the play's structure, themes, and scene-by-scene breakdown

**Key Data**:
- Genre, style, tone, themes
- Technical requirements (props, sets, effects)
- Scene map with mood, energy, characters present
- Act structure breakdown

### Pass 2: Character Deep Dive ($0.15 per character)
**Input**: Full script + Pass 1 data + character name
**Output**: `EnhancedCharacterAnalysis` object
**Purpose**: Comprehensive per-character analysis with calculated stats

**Key Data**:
- Calculated stats (stage presence, emotional range, energy level) with methodology
- Scene-by-scene tracking (objectives, emotions, physical demands)
- Enhanced breakout scenes with WHY and preparation tips
- Character arc with turning points
- Skills required with proficiency levels
- Relationship dynamics
- Audition guide
- Rehearsal roadmap

### Pass 3: Ensemble Analysis ($0.10)
**Input**: All character analyses
**Output**: `EnsembleAnalysis` object
**Purpose**: Map relationships and group dynamics

**Key Data**:
- Core ensemble vs supporting roles
- Leadership structure
- Conflict points
- Alliance shifts
- Scene partner frequency

### Pass 4: Production Guide ($0.05)
**Input**: Script + all analyses
**Output**: `ProductionGuide` object
**Purpose**: Director's notes and technical guidance

**Key Data**:
- Pacing recommendations
- Technical challenges
- Audience experience notes

## Data Model

### Enhanced TypeScript Types

```typescript
// Pass 1: Script Intelligence
export interface ScriptIntelligence {
  genre: string[]
  style: string[]
  estimatedRuntime: number
  themes: string[]
  tone: string
  technicalRequirements: {
    props: string[]
    sets: string[]
    specialEffects: string[]
  }
  targetAudience: string
  contentWarnings: string[]
  sceneMap: SceneIntelligence[]
  actStructure: {
    [key: string]: {
      scenes: number[]
      summary: string
    }
  }
}

export interface SceneIntelligence {
  sceneNumber: number
  title: string
  location: string
  timeOfDay: string
  mood: string
  energy: 'Low' | 'Medium' | 'High'
  charactersPresent: string[]
  plotBeats: string[]
  stakes: string
  pacingNote: string
}

// Pass 2: Enhanced Character Analysis
export interface EnhancedCharacterAnalysis {
  characterName: string

  profile: {
    tagline: string
    roleType: 'Lead' | 'Featured' | 'Ensemble'
    description: string
    ageRange: string
    voiceType: string
    physicalType: string
    estimatedAge?: string
  }

  calculatedStats: {
    stagePresence: CalculatedStat
    emotionalRange: CalculatedStat
    energyLevel: CalculatedStat
    lineComplexity: CalculatedStat
    comedyVsDrama: {
      comedy: number
      drama: number
      note: string
    }
  }

  scenePresence: ScenePresence[]

  breakoutScenes: BreakoutScene[]

  characterArc: {
    journeyStart: string
    journeyEnd: string
    arcType: string
    turningPoints: TurningPoint[]
    growthMilestones: string[]
  }

  skillsRequired: {
    acting: ActingSkill[]
    technical: TechnicalSkill[]
  }

  personality: {
    traits: string[]
    strengths: string[]
    flaws: string[]
    motivations: string[]
    fears: string[]
    quirks: string[]
  }

  relationships: Relationship[]

  auditionGuide: AuditionGuide

  castingNotes: CastingNotes

  rehearsalFocus: RehearsalFocus

  portrait: CharacterPortrait
}

export interface CalculatedStat {
  score: number
  calculation: string
  percentile?: string
  details?: any
}

export interface ScenePresence {
  sceneNumber: number
  sceneName: string
  present: boolean
  lineCount: number
  emotionalState: string
  objective: string
  physicalDemands: 'Low' | 'Medium' | 'High' | 'Very High'
  vocalDemands: string
  keyMoment?: string
  characterGrowth?: string
  relationshipFocus?: string[]
}

export interface BreakoutScene {
  sceneNumber: number
  sceneName: string
  type: 'Action Showcase' | 'Emotional Peak' | 'Comic Moment' | 'Climactic Hero Moment'
  why: string
  objective: string
  emotionalJourney: string
  skillsShowcased: string[]
  preparationTips: string
  auditionPotential: string
  iconicLine?: string
}

export interface TurningPoint {
  sceneNumber: number
  description: string
  internalShift: string
}

export interface ActingSkill {
  skill: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  scenes: number[]
  specifics: string
}

export interface TechnicalSkill {
  skill: string
  challenge: string
  tips: string
}

export interface Relationship {
  character: string
  dynamic: string
  scenesShared: number
  evolution: string
  keyScenes: number[]
  chemistry?: string
  preparationTips?: string
}

export interface AuditionGuide {
  bestSceneForAudition: {
    sceneNumber: number
    sceneName: string
    why: string
    preparation: string[]
  }
  coldReadTips: string[]
  callbackPrep: string[]
  characterQuestions: string[]
}

export interface CastingNotes {
  idealFor: string[]
  challenges: string[]
  growthOpportunities: string[]
  notIdealFor: string[]
}

export interface RehearsalFocus {
  earlyRehearsals: string[]
  midRehearsals: string[]
  finalRehearsals: string[]
}

// Pass 3: Ensemble Analysis
export interface EnsembleAnalysis {
  coreEnsemble: string[]
  supportingCharacters: string[]
  antagonists: string[]
  groupDynamics: {
    leadershipStructure: string
    conflictPoints: string[]
    allianceShifts: string[]
  }
  scenePartnerFrequency: Record<string, number>
}

// Pass 4: Production Guide
export interface ProductionGuide {
  pacingRecommendations: string
  technicalChallenges: string[]
  audienceExperience: string
}
```

## Database Schema Changes

Add new columns to `scripts` table:
```sql
ALTER TABLE scripts ADD COLUMN enhanced_analysis_version INTEGER DEFAULT 1;
ALTER TABLE scripts ADD COLUMN script_intelligence TEXT; -- JSON
ALTER TABLE scripts ADD COLUMN ensemble_analysis TEXT; -- JSON
ALTER TABLE scripts ADD COLUMN production_guide TEXT; -- JSON
ALTER TABLE scripts ADD COLUMN enhanced_analysis_cost REAL; -- Track actual cost
```

Character analysis stays in existing `analysis` column but uses enhanced structure.

## OpenAI Prompts

### Pass 1: Script Intelligence Prompt
```
You are an expert theatrical dramaturg analyzing a script for a high school theater production.

Analyze this script and provide comprehensive structural and thematic intelligence.

Script:
{scriptMarkdown}

Return a JSON object with this structure:
{
  "genre": ["array of genres"],
  "style": ["array of theatrical styles"],
  "estimatedRuntime": number (in minutes),
  "themes": ["array of major themes"],
  "tone": "description of overall tone",
  "technicalRequirements": {
    "props": ["array of key props"],
    "sets": ["array of set pieces/locations"],
    "specialEffects": ["array of special effects needed"]
  },
  "targetAudience": "description",
  "contentWarnings": ["array of content warnings"],
  "sceneMap": [
    {
      "sceneNumber": number,
      "title": "scene title",
      "location": "where it takes place",
      "timeOfDay": "morning/afternoon/evening/night",
      "mood": "emotional mood",
      "energy": "Low/Medium/High",
      "charactersPresent": ["array of character names"],
      "plotBeats": ["key plot points in this scene"],
      "stakes": "what's at stake",
      "pacingNote": "pacing guidance"
    }
  ],
  "actStructure": {
    "act1": { "scenes": [array of scene numbers], "summary": "act summary" },
    "act2": { "scenes": [], "summary": "" }
  }
}
```

### Pass 2: Character Deep Dive Prompt
```
You are an expert acting coach and dramaturg preparing a comprehensive character analysis for a teenage actor auditioning for a role.

Script Context:
{scriptIntelligence}

Full Script:
{scriptMarkdown}

Character to Analyze: {characterName}

Provide an exhaustive character analysis that includes:

1. CALCULATED STATS (based on actual script content):
   - Stage Presence: Calculate as (scenes present / total scenes) × (avg lines per scene factor)
   - Emotional Range: Count distinct emotions used across all scenes
   - Energy Level: Assess physical + vocal demands
   - Line Complexity: Average words per line, longest monologue

2. SCENE-BY-SCENE TRACKING:
   For each scene the character appears in, identify:
   - Emotional state
   - Objective (what they want)
   - Physical demands (Low/Medium/High/Very High)
   - Vocal demands
   - Key moments or character growth

3. BREAKOUT SCENES:
   Identify 2-4 scenes where this character truly shines. For each:
   - Why is it a breakout scene?
   - What skills does it showcase?
   - Preparation tips for actors
   - Is it good for auditions?

4. CHARACTER ARC:
   - Journey start → end states
   - Turning points with scene numbers
   - Growth milestones

5. SKILLS REQUIRED:
   List specific acting skills needed with proficiency levels and which scenes require them

6. RELATIONSHIPS:
   Analyze key relationships with other characters

7. AUDITION GUIDE:
   Best scenes for auditions, cold read tips, callback prep

8. CASTING NOTES:
   Who is this role ideal for? What are the challenges?

Return detailed JSON matching the EnhancedCharacterAnalysis type structure.
```

### Pass 3: Ensemble Analysis Prompt
```
You are analyzing ensemble dynamics for a theatrical production.

All Character Analyses:
{allCharacterAnalyses}

Identify:
- Core ensemble vs supporting roles
- Leadership structures
- Conflict points between characters
- Alliance shifts throughout the play
- Most frequent scene partnerships

Return JSON matching EnsembleAnalysis structure.
```

## Implementation Plan

### Phase 1: Backend (Sprint 5A)
1. Update types in `/types/index.ts`
2. Create new prompts in `/backend/src/services/openai/prompts/`
3. Update `/backend/src/services/scriptAnalysisService.ts`:
   - Add `analyzeScriptEnhanced()` method
   - Orchestrate 4-pass analysis
   - Handle retries and errors
4. Update database migrations
5. Add new endpoint: `POST /api/scripts/:id/analyze-enhanced`

### Phase 2: Frontend (Sprint 5B)
1. Update CharacterCard to show enhanced data
2. Add expandable sections for detailed info
3. Add tooltips for calculated stats
4. Create "Audition Prep" view
5. Create "Rehearsal Guide" view

### Phase 3: Testing & Refinement (Sprint 5C)
1. Test on multiple scripts
2. Refine prompts based on output quality
3. Optimize costs if needed
4. Add progress indicators for long analysis

## Migration Strategy

- Existing scripts keep current analysis
- New "Analyze Enhanced" button for users who want upgrade
- Store version number to handle future enhancements
- Backward compatible with simple analysis

## Success Metrics

- Analysis completion rate: >95%
- Data quality: Manual review of 10 scripts
- Actor satisfaction: Survey after using enhanced cards
- Cost per script: <$2.00
- Analysis time: <5 minutes for 10-character script

## Next Steps

1. ✅ Create design document (this file)
2. Update TypeScript types
3. Create OpenAI prompts
4. Implement backend service
5. Test on Zombie Apocalypse script
6. Update frontend CharacterCard
7. User testing with teen actors
