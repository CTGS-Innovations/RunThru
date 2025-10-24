// Script types
export interface Script {
  id: string
  title: string
  markdownSource: string
  parsed: ParsedScript
  analysis?: ScriptAnalysis  // OpenAI analysis (Sprint 4)
  analyzedAt?: string
  analysisCost?: number
  createdAt: string
  updatedAt: string
}

export interface ParsedScript {
  title: string
  author?: string
  characters: Character[]  // Array of Character objects, not strings
  scenes: Scene[]
  content: any[]  // ScriptElement array from backend
}

export interface Scene {
  id: string
  title: string
  lines: Line[]
}

export interface Line {
  id: string
  character: string
  text: string
  emotion?: EmotionType
  stageDirection?: string
}

export type EmotionType =
  | 'neutral'
  | 'angry'
  | 'sad'
  | 'excited'
  | 'soft'
  | 'fearful'

// Session types
export interface RehearsalSession {
  id: string
  scriptId: string
  currentSceneIndex: number
  currentLineIndex: number
  userRole: string[]
  voiceAssignments: Record<string, string>
  ttsEngine: 'index-tts' | 'chatterbox'
  createdAt: string
  lastAccessedAt: string
}

// TTS types
export interface VoiceInfo {
  id: string
  name: string
  gender: 'M' | 'F' | 'N'
  ageRange?: string
  preview?: string
}

export interface EmotionParams {
  intensity: number  // 0.0-1.0
  valence: 'positive' | 'negative' | 'neutral'
}

// Sprint 3: Voice Assignment Types
export interface VoicePreset {
  id: string
  name: string
  description: string
  defaultParams: {
    gender: number  // 0-100
    emotion: number  // 0-100
    age: number     // 0-100
  }
}

export interface VoiceAssignment {
  characterId: string
  voicePresetId: string
  gender: number
  emotion: number
  age: number
}

export interface Character {
  name: string
  lineCount: number
  firstAppearance: number
  aliases?: string[]
}

export interface Session {
  id: string
  scriptId: string
  selectedCharacter: string
  voiceAssignments: VoiceAssignment[]
  createdAt: string
}

// Sprint 4: OpenAI Analysis Types
export interface ScriptAnalysis {
  scriptLevel: ScriptMetadata
  characters: CharacterAnalysisWithPortrait[]
  scenes: SceneAnalysis[]
  analyzedAt: string
}

export interface ScriptMetadata {
  genre: string[]
  style: string[]
  estimatedRuntime: number
  themes: string[]
  tone: string
}

export interface BreakoutSceneBasic {
  sceneNumber: number
  sceneName: string
  lineCount: number
}

export interface CharacterAnalysisWithPortrait {
  characterName: string
  description: string
  tagline: string  // 2-3 word descriptor (e.g., "Brave Survivor")
  roleType: 'Lead' | 'Featured' | 'Ensemble'
  skillsNeeded: string[]
  characterArc: string
  journeyStart: string  // Starting emotional state
  journeyEnd: string    // Ending emotional state
  personalityTraits: string[]
  estimatedAge?: string
  // Power Stats (40-100, biased upward for encouragement)
  stagePresence: number
  emotionalRange: number
  energyLevel: number
  // Breakout moments (top 3 scenes by line count)
  breakoutScenes: BreakoutSceneBasic[]
  // Portrait from DALL-E
  portrait: CharacterPortrait
}

export interface CharacterPortrait {
  imageUrl: string
  prompt: string
  revisedPrompt?: string
}

export interface SceneAnalysis {
  sceneNumber: number
  sceneName: string
  sceneEmoji: string
  location: string
  description: string
  mood: string
  objectivesByCharacter: Record<string, string>
}

// ============================================================================
// SPRINT 5: Enhanced Multi-Pass Analysis Types
// ============================================================================

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
  actStructure: Record<string, {
    scenes: number[]
    summary: string
  }>
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

// Pass 2: Enhanced Character Analysis (extends current CharacterAnalysisWithPortrait)
export interface EnhancedCharacterAnalysis extends CharacterAnalysisWithPortrait {
  // Enhanced fields
  profile?: {
    voiceType: string
    physicalType: string
  }

  calculatedStats?: {
    stagePresence: CalculatedStat
    emotionalRange: CalculatedStat
    energyLevel: CalculatedStat
    lineComplexity?: CalculatedStat
    comedyVsDrama?: {
      comedy: number
      drama: number
      note: string
    }
  }

  scenePresence?: ScenePresence[]

  enhancedBreakoutScenes?: BreakoutScene[]

  characterArcDetailed?: {
    arcType: string
    turningPoints: TurningPoint[]
    growthMilestones: string[]
  }

  skillsDetailed?: {
    acting: ActingSkill[]
    technical: TechnicalSkill[]
  }

  personalityDetailed?: {
    strengths: string[]
    flaws: string[]
    motivations: string[]
    fears: string[]
    quirks: string[]
  }

  relationshipsDetailed?: Relationship[]

  auditionGuide?: AuditionGuide

  castingNotes?: CastingNotes

  rehearsalFocus?: RehearsalFocus
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

// Enhanced Script type with multi-pass analysis
export interface ScriptWithEnhancedAnalysis extends Script {
  scriptIntelligence?: ScriptIntelligence
  ensembleAnalysis?: EnsembleAnalysis
  productionGuide?: ProductionGuide
  enhancedAnalysisVersion?: number
  enhancedAnalysisCost?: number
}
