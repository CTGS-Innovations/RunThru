# 🏗️ RunThru - Technical Architecture

**Version:** 2.0
**Last Updated:** 2025-10-23

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [File Structure](#file-structure)
6. [Implementation Details](#implementation-details)
7. [Deployment](#deployment)
8. [Performance Optimization](#performance-optimization)
9. [Security](#security)

---

## System Overview

RunThru is a **local-hosted, GPU-accelerated** application deployed via Docker Compose and exposed via Cloudflare Tunnel. The architecture prioritizes:
- **Simplicity**: SQLite, filesystem storage, minimal external dependencies
- **Performance**: Pre-generated audio, GPU acceleration, efficient caching
- **Maintainability**: Modular TTS adapters, TypeScript types, clean separation of concerns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Tunnel                        │
│              (Public HTTPS: runthru.example.com)            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Docker Compose Stack                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Frontend Container                      │  │
│  │  - Next.js 15 (React 18)                            │  │
│  │  - Tailwind CSS                                      │  │
│  │  - Web Audio API                                     │  │
│  │  - Port: 3000                                        │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │ HTTP/WS                               │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │              Backend Container                       │  │
│  │  - Node.js + Express + TypeScript                   │  │
│  │  - SQLite (better-sqlite3)                          │  │
│  │  - WebSocket (ws)                                   │  │
│  │  - Script Parser                                     │  │
│  │  - Port: 4000                                        │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │ HTTP                                  │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │            TTS Service Container                     │  │
│  │  - Python 3.11 + FastAPI                            │  │
│  │  - PyTorch + CUDA 12.1                              │  │
│  │  - Index TTS (emotion-aware)                        │  │
│  │  - Chatterbox TTS (fast)                            │  │
│  │  - GPU: NVIDIA RTX 3090                             │  │
│  │  - Port: 5000                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Shared Volumes:                                            │
│  - ./data/database/runthru.db (SQLite)                     │
│  - ./data/scripts/ (Uploaded markdown files)                │
│  - ./data/audio-cache/ (Generated WAV files)                │
│  - ./data/models/ (TTS model weights)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Styling |
| **Zustand** | 4.x | State management |
| **Zod** | 3.x | Schema validation |
| **WaveSurfer.js** | 7.x | Audio waveform visualization |
| **Lucide React** | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x LTS | JavaScript runtime |
| **Express** | 4.x | Web framework |
| **TypeScript** | 5.x | Type safety |
| **better-sqlite3** | Latest | SQLite driver (sync, fast) |
| **ws** | 8.x | WebSocket library |
| **zod** | 3.x | Schema validation |

### TTS Service
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11 | Runtime |
| **FastAPI** | Latest | API framework |
| **PyTorch** | 2.x + CUDA 12.1 | Deep learning |
| **Index TTS** | Latest | Emotion-aware TTS |
| **Chatterbox** | Latest | Fast high-quality TTS |
| **torchaudio** | Latest | Audio processing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker Compose** | Container orchestration |
| **Cloudflare Tunnel** | Secure public access |
| **NVIDIA Docker Runtime** | GPU passthrough |

---

## Component Architecture

### 1. Frontend (Next.js)

#### Directory Structure
```
frontend/src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home/Welcome page
│   ├── globals.css               # Tailwind + custom styles
│   ├── login/
│   │   └── page.tsx              # PIN entry
│   ├── scripts/
│   │   ├── page.tsx              # Script library
│   │   ├── new/
│   │   │   └── page.tsx          # Upload new script
│   │   └── [id]/
│   │       ├── page.tsx          # Script detail/edit
│   │       └── setup/
│   │           └── page.tsx      # Role/voice assignment
│   └── rehearsal/
│       └── [sessionId]/
│           └── page.tsx          # Active rehearsal
├── components/
│   ├── ui/                       # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ProgressBar.tsx
│   ├── script/
│   │   ├── ScriptUploader.tsx    # Drag-drop upload
│   │   ├── ScriptList.tsx        # Library grid
│   │   ├── CharacterSelector.tsx # Role selection
│   │   └── VoiceAssigner.tsx     # Voice preview & assignment
│   ├── rehearsal/
│   │   ├── LineDisplay.tsx       # Current/next line view
│   │   ├── AudioPlayer.tsx       # Playback controls
│   │   ├── SceneNavigator.tsx    # Jump to scene
│   │   └── ProgressIndicator.tsx # Visual progress
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx           # (v2.0 - notes panel)
├── lib/
│   ├── api.ts                    # API client (fetch wrapper)
│   ├── audio.ts                  # Web Audio utilities
│   ├── parser.ts                 # Client-side validation
│   └── utils.ts                  # General helpers
├── hooks/
│   ├── useAuth.ts                # PIN authentication
│   ├── useScripts.ts             # Script CRUD
│   ├── useRehearsalSession.ts    # Session state
│   ├── useAudioQueue.ts          # Audio playback queue
│   └── useKeyboardShortcuts.ts   # Hotkeys
├── stores/
│   ├── authStore.ts              # Auth state (Zustand)
│   ├── sessionStore.ts           # Rehearsal state
│   └── audioStore.ts             # Playback state
└── types/
    ├── script.ts
    ├── session.ts
    ├── audio.ts
    └── api.ts
```

#### Key Components

**LineDisplay.tsx**
```tsx
interface LineDisplayProps {
  lines: Line[];
  currentIndex: number;
  userRole: string[];
}

export function LineDisplay({ lines, currentIndex, userRole }: LineDisplayProps) {
  const currentLine = lines[currentIndex];
  const nextLine = lines[currentIndex + 1];
  const isUserLine = userRole.includes(currentLine.character);

  return (
    <div className="space-y-6">
      {/* Current line */}
      <div className={cn(
        "p-6 rounded-lg border-2 transition-all",
        isUserLine
          ? "bg-amber-500/10 border-amber-500"
          : "bg-cyan-500/10 border-cyan-500"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-bold">
            {currentLine.character}
          </span>
          {!isUserLine && (
            <span className="text-xs text-cyan-400 animate-pulse">
              🎤 AI is speaking...
            </span>
          )}
        </div>
        <p className="text-lg leading-relaxed">
          {currentLine.text}
        </p>
        {currentLine.stageDirection && (
          <p className="text-sm text-gray-400 mt-2">
            ({currentLine.stageDirection})
          </p>
        )}
      </div>

      {/* Next line preview */}
      {nextLine && (
        <div className="opacity-50 p-4 rounded border border-gray-700">
          <div className="text-sm font-bold mb-2">
            {nextLine.character} (Next)
          </div>
          <p className="text-sm">
            {nextLine.text.slice(0, 100)}...
          </p>
        </div>
      )}
    </div>
  );
}
```

**AudioPlayer.tsx**
```tsx
import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function AudioPlayer({ audioUrl, autoPlay, onEnded }: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#00d9ff',
      progressColor: '#ffbf00',
      height: 60,
      barWidth: 2,
      barGap: 1,
    });

    wavesurfer.current.load(audioUrl);

    if (autoPlay) {
      wavesurfer.current.on('ready', () => {
        wavesurfer.current?.play();
      });
    }

    wavesurfer.current.on('finish', () => {
      onEnded?.();
    });

    return () => wavesurfer.current?.destroy();
  }, [audioUrl, autoPlay, onEnded]);

  return (
    <div className="space-y-4">
      <div ref={waveformRef} className="rounded-lg overflow-hidden" />
      <div className="flex gap-2 justify-center">
        <button onClick={() => wavesurfer.current?.playPause()}>
          ▶️ Play/Pause
        </button>
        <button onClick={() => wavesurfer.current?.setTime(0)}>
          🔁 Restart
        </button>
      </div>
    </div>
  );
}
```

#### State Management Strategy

**Zustand Stores**:
```typescript
// stores/sessionStore.ts
import { create } from 'zustand';

interface SessionState {
  sessionId: string | null;
  script: ParsedScript | null;
  currentSceneIndex: number;
  currentLineIndex: number;
  userRole: string[];
  isPlaying: boolean;

  // Actions
  setSession: (session: RehearsalSession) => void;
  nextLine: () => void;
  prevLine: () => void;
  jumpToLine: (sceneIndex: number, lineIndex: number) => void;
  togglePlayback: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  script: null,
  currentSceneIndex: 0,
  currentLineIndex: 0,
  userRole: [],
  isPlaying: false,

  setSession: (session) => set({
    sessionId: session.id,
    script: session.script,
    userRole: session.userRole,
  }),

  nextLine: () => set((state) => {
    const scene = state.script?.scenes[state.currentSceneIndex];
    if (!scene) return state;

    if (state.currentLineIndex + 1 < scene.lines.length) {
      return { currentLineIndex: state.currentLineIndex + 1 };
    } else if (state.currentSceneIndex + 1 < state.script!.scenes.length) {
      return {
        currentSceneIndex: state.currentSceneIndex + 1,
        currentLineIndex: 0,
      };
    }
    return state;
  }),

  prevLine: () => set((state) => {
    if (state.currentLineIndex > 0) {
      return { currentLineIndex: state.currentLineIndex - 1 };
    } else if (state.currentSceneIndex > 0) {
      const prevScene = state.script?.scenes[state.currentSceneIndex - 1];
      return {
        currentSceneIndex: state.currentSceneIndex - 1,
        currentLineIndex: prevScene ? prevScene.lines.length - 1 : 0,
      };
    }
    return state;
  }),

  jumpToLine: (sceneIndex, lineIndex) =>
    set({ currentSceneIndex: sceneIndex, currentLineIndex: lineIndex }),

  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));
```

---

### 2. Backend API (Node.js)

#### Directory Structure
```
backend/src/
├── server.ts                     # Express app entry
├── config/
│   ├── database.ts               # SQLite connection
│   ├── env.ts                    # Environment variables
│   └── logger.ts                 # Winston logger
├── routes/
│   ├── index.ts                  # Route aggregator
│   ├── auth.routes.ts            # POST /api/auth/verify
│   ├── scripts.routes.ts         # CRUD for scripts
│   ├── sessions.routes.ts        # Rehearsal session management
│   └── audio.routes.ts           # GET /api/audio/:id
├── services/
│   ├── scriptParser.service.ts   # Markdown → JSON
│   ├── ttsClient.service.ts      # HTTP client for TTS service
│   ├── sessionManager.service.ts # Session CRUD
│   ├── audioCache.service.ts     # Cache management
│   └── emotionMapper.service.ts  # Stage directions → emotion params
├── models/
│   ├── Script.model.ts           # SQLite queries
│   ├── Session.model.ts
│   └── AudioCache.model.ts
├── middleware/
│   ├── auth.middleware.ts        # Verify PIN
│   ├── errorHandler.middleware.ts
│   ├── validator.middleware.ts   # Zod schema validation
│   └── cors.middleware.ts
├── types/
│   ├── index.ts
│   └── express.d.ts              # Extended Express types
└── utils/
    ├── errors.ts                 # Custom error classes
    └── helpers.ts
```

#### Key Implementations

**scriptParser.service.ts**
```typescript
import { ParsedScript, Scene, Line } from '../types';

export class ScriptParserService {
  /**
   * Parse markdown script into structured JSON
   */
  parse(markdown: string): ParsedScript {
    const lines = markdown.split('\n');
    const scenes: Scene[] = [];
    let currentScene: Scene | null = null;
    let currentCharacter: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Scene header: ## Act 1, Scene 2
      if (line.startsWith('##')) {
        if (currentScene) scenes.push(currentScene);
        currentScene = {
          id: `scene-${scenes.length}`,
          title: line.replace(/^#+\s*/, ''),
          lines: [],
        };
        continue;
      }

      // Character name: ROMEO or **ROMEO:**
      const charMatch = line.match(/^([A-Z][A-Z\s]+)$|^\*\*([A-Z][A-Z\s]+)\*\*:?/);
      if (charMatch) {
        currentCharacter = (charMatch[1] || charMatch[2]).trim();
        continue;
      }

      // Stage direction: (angrily) or STAGE_DIRECTION
      const stageDirMatch = line.match(/^\((.+)\)$/);
      if (stageDirMatch) {
        const emotion = this.parseEmotion(stageDirMatch[1]);
        // Attach to next line or previous line
        continue;
      }

      // Dialogue line
      if (line && currentCharacter && currentScene) {
        const emotion = this.extractEmotion(line);
        currentScene.lines.push({
          id: `line-${currentScene.lines.length}`,
          character: currentCharacter,
          text: line.replace(/\s*\(.+\)\s*/, ''), // Remove inline directions
          emotion: emotion.type,
          stageDirection: emotion.direction,
        });
      }
    }

    if (currentScene) scenes.push(currentScene);

    const characters = this.extractCharacters(scenes);

    return {
      title: this.extractTitle(markdown),
      characters,
      scenes,
    };
  }

  private extractEmotion(text: string): { type: string; direction?: string } {
    const match = text.match(/\(([^)]+)\)/);
    if (!match) return { type: 'neutral' };

    const direction = match[1].toLowerCase();
    const type = this.mapEmotionType(direction);
    return { type, direction };
  }

  private mapEmotionType(direction: string): string {
    if (/angry|furious|rage/.test(direction)) return 'angry';
    if (/sad|crying|tearful/.test(direction)) return 'sad';
    if (/excited|joyful|happy/.test(direction)) return 'excited';
    if (/soft|whisper|quiet/.test(direction)) return 'soft';
    if (/fear|scared|terrified/.test(direction)) return 'fearful';
    return 'neutral';
  }

  private extractCharacters(scenes: Scene[]): string[] {
    const chars = new Set<string>();
    scenes.forEach(scene => {
      scene.lines.forEach(line => chars.add(line.character));
    });
    return Array.from(chars).sort();
  }

  private extractTitle(markdown: string): string {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1] : 'Untitled Script';
  }
}
```

**ttsClient.service.ts**
```typescript
import axios from 'axios';
import { EmotionParams, TTSRequest } from '../types';

export class TTSClientService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.TTS_SERVICE_URL || 'http://tts-service:5000';
  }

  /**
   * Generate audio for a single line
   */
  async synthesize(request: TTSRequest): Promise<Buffer> {
    const response = await axios.post(`${this.baseURL}/synthesize`, request, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30s timeout
    });

    return Buffer.from(response.data);
  }

  /**
   * Batch generate audio for entire script
   * Returns progress via callback
   */
  async batchSynthesize(
    lines: Line[],
    voiceAssignments: Record<string, string>,
    engine: string,
    onProgress: (current: number, total: number) => void
  ): Promise<Map<string, Buffer>> {
    const audioMap = new Map<string, Buffer>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const voiceId = voiceAssignments[line.character];

      if (!voiceId) {
        throw new Error(`No voice assigned to ${line.character}`);
      }

      const emotion = this.mapEmotion(line.emotion || 'neutral');

      const audio = await this.synthesize({
        text: line.text,
        character: line.character,
        engine,
        voiceId,
        emotion,
      });

      audioMap.set(line.id, audio);
      onProgress(i + 1, lines.length);
    }

    return audioMap;
  }

  /**
   * List available voices
   */
  async listVoices(engine: string): Promise<VoiceInfo[]> {
    const response = await axios.get(`${this.baseURL}/voices`, {
      params: { engine },
    });
    return response.data;
  }

  private mapEmotion(emotionType: string): EmotionParams {
    const emotionMap: Record<string, EmotionParams> = {
      neutral: { intensity: 0.3, valence: 'neutral' },
      angry: { intensity: 0.8, valence: 'negative' },
      sad: { intensity: 0.6, valence: 'negative' },
      excited: { intensity: 0.7, valence: 'positive' },
      soft: { intensity: 0.4, valence: 'neutral' },
      fearful: { intensity: 0.7, valence: 'negative' },
    };

    return emotionMap[emotionType] || emotionMap.neutral;
  }
}
```

**sessions.routes.ts**
```typescript
import { Router } from 'express';
import { SessionManagerService } from '../services/sessionManager.service';
import { TTSClientService } from '../services/ttsClient.service';
import { AudioCacheService } from '../services/audioCache.service';

const router = Router();
const sessionManager = new SessionManagerService();
const ttsClient = new TTSClientService();
const audioCache = new AudioCacheService();

/**
 * POST /api/sessions
 * Create new rehearsal session
 */
router.post('/', async (req, res) => {
  const { scriptId, userRole, voiceAssignments, ttsEngine } = req.body;

  const session = await sessionManager.create({
    scriptId,
    userRole,
    voiceAssignments,
    ttsEngine,
  });

  res.json({ session });
});

/**
 * POST /api/sessions/:id/generate
 * Generate audio for all lines (SSE endpoint)
 */
router.post('/:id/generate', async (req, res) => {
  const { id } = req.params;
  const session = await sessionManager.getById(id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const script = await scriptManager.getById(session.scriptId);
  const allLines = script.parsed.scenes.flatMap(s => s.lines);

  try {
    const audioMap = await ttsClient.batchSynthesize(
      allLines,
      session.voiceAssignments,
      session.ttsEngine,
      (current, total) => {
        // Send progress update
        res.write(`data: ${JSON.stringify({ current, total })}\n\n`);
      }
    );

    // Save audio files
    for (const [lineId, audioBuffer] of audioMap) {
      await audioCache.save({
        scriptId: session.scriptId,
        lineId,
        ttsEngine: session.ttsEngine,
        audioBuffer,
      });
    }

    res.write(`data: ${JSON.stringify({ status: 'complete' })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
```

---

### 3. TTS Service (Python)

#### Directory Structure
```
tts-service/
├── main.py                       # FastAPI app entry
├── config.py                     # Configuration
├── requirements.txt
├── adapters/
│   ├── __init__.py
│   ├── base.py                   # TTSAdapter ABC
│   ├── index_tts.py              # Index TTS implementation
│   └── chatterbox.py             # Chatterbox implementation
├── models/
│   └── emotion.py                # Emotion parameter models
└── utils/
    ├── audio.py                  # Audio processing utils
    └── cache.py                  # Model cache management
```

#### Key Implementations

**base.py**
```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel

class VoiceInfo(BaseModel):
    id: str
    name: str
    gender: str
    age_range: str = "adult"
    preview_url: str | None = None

class EmotionParams(BaseModel):
    intensity: float  # 0.0-1.0
    valence: str      # 'positive', 'negative', 'neutral'

class TTSRequest(BaseModel):
    text: str
    character: str
    engine: str
    voice_id: str
    emotion: EmotionParams

class TTSAdapter(ABC):
    """Base class for TTS engine adapters"""

    @abstractmethod
    def __init__(self, model_dir: str, device: str):
        pass

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        voice_id: str,
        emotion: EmotionParams
    ) -> bytes:
        """Generate audio bytes (WAV format)"""
        pass

    @abstractmethod
    def list_voices(self) -> List[VoiceInfo]:
        """Return available voices"""
        pass

    @abstractmethod
    def warmup(self) -> None:
        """Load models into GPU memory"""
        pass
```

**index_tts.py**
```python
import torch
import torchaudio
from indextts.infer_v2 import IndexTTS2
from .base import TTSAdapter, VoiceInfo, EmotionParams
import io

class IndexTTSAdapter(TTSAdapter):
    def __init__(self, model_dir: str, device: str):
        self.device = device
        self.model = IndexTTS2(
            cfg_path=f"{model_dir}/index-tts/config.yaml",
            model_dir=f"{model_dir}/index-tts",
            use_fp16=True,  # Save VRAM on 3090
            use_cuda_kernel=True,
            use_deepspeed=False
        )

        # Load voice prompt samples
        self.voice_prompts = self._load_voice_prompts(model_dir)

    async def synthesize(
        self,
        text: str,
        voice_id: str,
        emotion: EmotionParams
    ) -> bytes:
        """Generate audio using Index TTS"""

        # Map emotion params to Index TTS emo_alpha
        emo_alpha = emotion.intensity

        # Get voice prompt audio
        voice_prompt_path = self.voice_prompts.get(voice_id)
        if not voice_prompt_path:
            raise ValueError(f"Unknown voice_id: {voice_id}")

        # Generate speech
        output_wav = self.model.infer(
            spk_audio_prompt=voice_prompt_path,
            text=text,
            output_path=None,  # Return in-memory
            emo_alpha=emo_alpha,
            use_emo_text=True,
            use_random=False,
            verbose=False
        )

        # Convert to bytes (WAV format)
        buffer = io.BytesIO()
        torchaudio.save(
            buffer,
            output_wav,
            sample_rate=24000,
            format="wav"
        )
        buffer.seek(0)
        return buffer.read()

    def list_voices(self) -> List[VoiceInfo]:
        """Return available voice prompts"""
        return [
            VoiceInfo(
                id="voice_01",
                name="Male Young",
                gender="M",
                age_range="teen"
            ),
            VoiceInfo(
                id="voice_02",
                name="Female Young",
                gender="F",
                age_range="teen"
            ),
            VoiceInfo(
                id="voice_07",
                name="Male Adult",
                gender="M",
                age_range="adult"
            ),
            VoiceInfo(
                id="voice_10",
                name="Female Adult",
                gender="F",
                age_range="adult"
            ),
        ]

    def warmup(self) -> None:
        """Preload model into GPU"""
        dummy_text = "This is a warmup test."
        self.model.infer(
            spk_audio_prompt=self.voice_prompts["voice_01"],
            text=dummy_text,
            output_path=None,
            verbose=False
        )

    def _load_voice_prompts(self, model_dir: str) -> Dict[str, str]:
        """Load mapping of voice IDs to audio files"""
        return {
            "voice_01": f"{model_dir}/index-tts/examples/voice_01.wav",
            "voice_02": f"{model_dir}/index-tts/examples/voice_02.wav",
            "voice_07": f"{model_dir}/index-tts/examples/voice_07.wav",
            "voice_10": f"{model_dir}/index-tts/examples/voice_10.wav",
        }
```

**chatterbox.py**
```python
import torch
import torchaudio
from chatterbox_tts import ChatterboxTTS
from .base import TTSAdapter, VoiceInfo, EmotionParams
import io

class ChatterboxAdapter(TTSAdapter):
    def __init__(self, model_dir: str, device: str):
        self.device = device
        self.model = ChatterboxTTS.from_pretrained(device=device)
        self.voice_samples = self._load_voice_samples(model_dir)

    async def synthesize(
        self,
        text: str,
        voice_id: str,
        emotion: EmotionParams
    ) -> bytes:
        """Generate audio using Chatterbox"""

        # Chatterbox doesn't have direct emotion control,
        # but we can use different voice samples for different emotions
        voice_sample_path = self.voice_samples.get(voice_id)

        if voice_sample_path and emotion.intensity > 0.5:
            # Use audio prompt for voice conversion
            wav = self.model.generate(
                text,
                audio_prompt_path=voice_sample_path
            )
        else:
            # Use default voice
            wav = self.model.generate(text)

        # Convert to bytes
        buffer = io.BytesIO()
        torchaudio.save(
            buffer,
            wav,
            sample_rate=self.model.sr,
            format="wav"
        )
        buffer.seek(0)
        return buffer.read()

    def list_voices(self) -> List[VoiceInfo]:
        """Return available voices"""
        return [
            VoiceInfo(
                id="default",
                name="Default Voice",
                gender="N",
                age_range="adult"
            ),
            VoiceInfo(
                id="sample_01",
                name="Voice Sample 1",
                gender="M",
                age_range="teen"
            ),
        ]

    def warmup(self) -> None:
        """Warm up model"""
        self.model.generate("Warmup test.")

    def _load_voice_samples(self, model_dir: str) -> Dict[str, str]:
        return {
            "sample_01": f"{model_dir}/chatterbox/samples/sample_01.wav",
        }
```

**main.py**
```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from adapters.base import TTSRequest
from adapters.index_tts import IndexTTSAdapter
from adapters.chatterbox import ChatterboxAdapter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RunThru TTS Service")

# Initialize adapters
MODEL_DIR = "/models"
DEVICE = "cuda:0"

adapters = {
    "index-tts": IndexTTSAdapter(MODEL_DIR, DEVICE),
    "chatterbox": ChatterboxAdapter(MODEL_DIR, DEVICE),
}

@app.on_event("startup")
async def startup():
    """Warm up models on startup"""
    logger.info("Warming up TTS models...")
    for name, adapter in adapters.items():
        logger.info(f"Warming up {name}...")
        adapter.warmup()
    logger.info("All models ready!")

@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    """Generate speech audio"""

    adapter = adapters.get(request.engine)
    if not adapter:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine: {request.engine}"
        )

    try:
        audio_bytes = await adapter.synthesize(
            text=request.text,
            voice_id=request.voice_id,
            emotion=request.emotion
        )

        return Response(
            content=audio_bytes,
            media_type="audio/wav"
        )
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/voices")
async def list_voices(engine: str):
    """List available voices for an engine"""

    adapter = adapters.get(engine)
    if not adapter:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine: {engine}"
        )

    return adapter.list_voices()

@app.get("/health")
async def health_check():
    """Check service health and GPU status"""
    import torch

    return {
        "status": "healthy",
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "gpu_memory_used_gb": round(torch.cuda.memory_allocated(0) / 1e9, 2),
        "engines": list(adapters.keys()),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

---

## Data Flow

### 1. Script Upload Flow
```
User uploads markdown
    ↓
Frontend validates file
    ↓
POST /api/scripts
    ↓
Backend parses markdown → JSON
    ↓
Save to database + filesystem
    ↓
Return script ID
    ↓
Redirect to script detail page
```

### 2. Session Creation & Audio Generation Flow
```
User selects script + role
    ↓
POST /api/sessions
    ↓
Backend creates session record
    ↓
POST /api/sessions/:id/generate (SSE)
    ↓
Backend fetches all lines
    ↓
For each line:
    ├─ POST /synthesize to TTS service
    ├─ Receive WAV audio bytes
    ├─ Save to data/audio-cache/:scriptId/:lineId.wav
    ├─ Send progress event to frontend
    └─ Update audio_cache table
    ↓
Send completion event
    ↓
Frontend loads rehearsal UI
```

### 3. Rehearsal Playback Flow
```
User clicks ▶️ Play
    ↓
Frontend checks current line
    ↓
Is it user's line?
  ├─ Yes: Highlight, wait for user to advance
  └─ No: Fetch audio from cache
      ↓
      GET /api/audio/:scriptId/:lineId
      ↓
      Backend streams WAV file
      ↓
      Frontend plays via Web Audio API
      ↓
      On audio end: Auto-advance to next line
      ↓
      Repeat
```

---

## Deployment

### Docker Compose Configuration

**docker-compose.yml**
```yaml
version: '3.9'

services:
  # Frontend - Next.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: runthru-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend
    restart: unless-stopped

  # Backend - Node.js API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: runthru-backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/database/runthru.db
      - TTS_SERVICE_URL=http://tts-service:5000
      - PIN_CODE=${PIN_CODE}
      - AUDIO_CACHE_DIR=/data/audio-cache
      - SCRIPTS_DIR=/data/scripts
    volumes:
      - ./data:/data
    depends_on:
      - tts-service
    restart: unless-stopped

  # TTS Service - Python GPU
  tts-service:
    build:
      context: ./tts-service
      dockerfile: Dockerfile
    container_name: runthru-tts
    ports:
      - "5000:5000"
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - MODEL_DIR=/models
    volumes:
      - ./data/models:/models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

  # Cloudflare Tunnel
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: runthru-tunnel
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
    environment:
      - TUNNEL_TOKEN=${CF_TUNNEL_TOKEN}
    depends_on:
      - frontend
    restart: unless-stopped

volumes:
  data:
    driver: local
```

**Frontend Dockerfile**
```dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

**Backend Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

**TTS Service Dockerfile**
```dockerfile
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

# Install Python 3.11
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

EXPOSE 5000

CMD ["python3", "main.py"]
```

**requirements.txt**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
torch==2.1.0+cu121 --extra-index-url https://download.pytorch.org/whl/cu121
torchaudio==2.1.0+cu121 --extra-index-url https://download.pytorch.org/whl/cu121
chatterbox-tts==0.1.0
git+https://github.com/index-tts/index-tts.git
pydantic==2.5.0
```

---

## Performance Optimization

### 1. Audio Caching Strategy
- **Cache key**: `{script_id}_{line_id}_{engine}_{voice_id}_{emotion_hash}`
- **Storage**: Filesystem (faster than DB for binary data)
- **Expiration**: Never (until script edited or deleted)
- **Preloading**: Frontend prefetches next 5 audio files during playback

### 2. TTS Service Optimization
- **FP16 inference**: Reduce VRAM usage by 50% on 3090
- **Model warmup**: Load models into GPU memory on startup
- **Batch processing**: Process multiple lines in parallel (if GPU memory allows)
- **Voice prompt caching**: Keep prompt embeddings in memory

### 3. Frontend Optimization
- **Code splitting**: Lazy-load rehearsal components
- **Audio preloading**: `<audio>` elements with preload="auto"
- **Debounced navigation**: Prevent rapid button clicks
- **Service worker**: Cache static assets (v2.0)

### 4. Database Optimization
- **Indexes**: On `scripts.id`, `sessions.script_id`, `audio_cache.script_id`
- **Pragmas**: `PRAGMA journal_mode=WAL` for concurrent reads
- **Connection pooling**: Reuse SQLite connections

---

## Security

### 1. Authentication
- **PIN code**: Simple shared secret (stored in env var)
- **Cookie-based**: HttpOnly cookie after successful PIN entry
- **Expiration**: 30-day cookie lifetime

### 2. Input Validation
- **Zod schemas**: Validate all API inputs
- **File upload limits**: Max 10MB for script files
- **Rate limiting**: 100 req/min per IP (using express-rate-limit)

### 3. Cloudflare Tunnel
- **No exposed ports**: Only Cloudflare Tunnel has public access
- **HTTPS only**: Auto-provisioned SSL certificate
- **Access policies**: Optional Cloudflare Access for additional auth

### 4. Docker Security
- **Non-root user**: Run containers as `node` user
- **Read-only filesystem**: Where possible
- **Secrets management**: Use `.env` file (never commit)

---

## Monitoring & Logging

### Logging Strategy
```typescript
// backend/src/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '/data/logs/backend.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});
```

### Health Checks
```yaml
# docker-compose.yml (add to each service)
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

**End of ARCHITECTURE.md**

*Next: Review with team, set up local development environment, begin implementation with frontend scaffold.*
