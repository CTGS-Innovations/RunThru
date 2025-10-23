/**
 * TypeScript type definitions for RunThru backend
 */

export interface Script {
  id: string;
  title: string;
  markdownSource: string;
  parsedJson: string; // Stringified ParsedScript
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  scriptId: string;
  currentSceneIndex: number;
  currentLineIndex: number;
  userRole: string; // JSON array of character names
  voiceAssignments: string; // JSON map {character: voiceId}
  ttsEngine: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface AudioCache {
  id: string;
  scriptId: string;
  lineId: string;
  ttsEngine: string;
  voiceId: string;
  emotionHash: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

export interface VoicePreset {
  id: string;
  name: string;
  description: string;
  gender: number;        // 0-100 (0 = female, 100 = male)
  emotion: number;       // 0-100 (0 = calm, 100 = excited)
  age: number;           // 0-100 (0 = young, 100 = old)
  referenceAudioPath: string;
}

export interface VoiceAssignment {
  characterId: string;
  voicePresetId: string;
  gender: number;        // 0-100 (customized from preset)
  emotion: number;       // 0-100 (customized from preset)
  age: number;           // 0-100 (customized from preset)
}

export interface SessionWithVoices extends Omit<Session, 'voiceAssignments'> {
  voiceAssignments: VoiceAssignment[];  // Parsed from JSON string
}
