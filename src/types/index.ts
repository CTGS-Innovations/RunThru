// Script types
export interface Script {
  id: string
  title: string
  markdownSource: string
  parsed: ParsedScript
  createdAt: string
  updatedAt: string
}

export interface ParsedScript {
  title: string
  characters: string[]
  scenes: Scene[]
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
