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
