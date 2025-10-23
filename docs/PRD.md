# 🎭 RunThru – Product Requirements Document (PRD)

**Version:** 2.0
**Owner:** Corey Gorman
**Last Updated:** 2025-10-23
**Target:** Teen actors & theater groups

---

## 1. Executive Summary

**RunThru** is a modern, kid-friendly rehearsal platform that helps teen actors practice their lines with AI-powered scene partners. Built for your daughter's theater group, it turns script practice from tedious memorization into an interactive, engaging experience.

### Key Value Propositions
- 🎤 **Practice anywhere**: Desktop, tablet, or phone - rehearse solo or with friends
- 🤖 **AI scene partners**: High-quality TTS voices with emotional depth read other characters
- 📱 **Zero setup friction**: Upload a script, pick your role, start rehearsing in under 2 minutes
- 🎨 **Teen-friendly design**: Clean, modern interface with dark mode and playful accents
- 🔐 **Family-safe**: PIN-protected access, local hosting, no data collection

---

## 2. Goals & Non-Goals

### 🎯 Primary Goals (MVP - v1.0)
1. Enable solo rehearsal with AI voices for missing roles
2. Support markdown script upload with automatic character detection
3. Provide emotion-aware TTS with swappable engines (Index TTS + Chatterbox)
4. Build responsive UI that works on phones, tablets, and desktops
5. Allow basic script editing and management (library of saved scripts)
6. Deploy via Docker + Cloudflare Tunnel for secure remote access

### 🎯 Secondary Goals (v2.0+)
- Multi-user rehearsal sessions with real-time sync
- Pro Mode: Hide user's lines for memory practice
- Director Mode: Coach/observer role with notes
- Voice customization per character
- Session recording and playback

### 🚫 Non-Goals
- Full theatrical production management (props, blocking, costumes)
- AI script generation or line rewriting
- Live video streaming
- Social features (likes, comments, sharing)
- Commercial monetization

---

## 3. Target Users

| Persona | Age | Primary Use Case | Pain Point Solved |
|---------|-----|------------------|-------------------|
| **Teen Actor** | 13-18 | Memorize lines for school play | No one home to practice with |
| **Drama Student** | 13-18 | Rehearse monologues/scenes | Friends not always available |
| **Theater Parent** | 35-50 | Help child practice | Don't know the other lines well |
| **Drama Teacher** | 30-55 | Assign remote practice | Students need structured solo work |

### User Story: Sarah (16, playing Juliet)
> "I have rehearsal tomorrow but my mom doesn't know the script. With RunThru, I can practice the balcony scene with an AI Romeo that actually sounds natural. I can replay lines I'm stuck on and time my cues perfectly."

---

## 4. Core Features

### 4.1 Script Management

#### Script Upload
- **Input formats**: Markdown (.md), plain text (.txt)
- **Parsing logic**:
  - Character names: ALL CAPS or `**CHARACTER:**` format
  - Stage directions: Text in parentheses `(angrily)`, `(softly)`
  - Scene markers: `## Act 1, Scene 2` or `### Scene 3`
  - Dialogue: Text following character names

**Example Input:**
```markdown
## Act 2, Scene 2 - The Balcony

ROMEO
But, soft! What light through yonder window breaks?
It is the east, and Juliet is the sun.

JULIET (softly)
O Romeo, Romeo! Wherefore art thou Romeo?
```

**Parsed Output:**
```json
{
  "title": "Romeo and Juliet",
  "scenes": [
    {
      "id": "act2-scene2",
      "title": "Act 2, Scene 2 - The Balcony",
      "lines": [
        {
          "character": "ROMEO",
          "text": "But, soft! What light through yonder window breaks? It is the east, and Juliet is the sun.",
          "emotion": "neutral"
        },
        {
          "character": "JULIET",
          "text": "O Romeo, Romeo! Wherefore art thou Romeo?",
          "emotion": "soft",
          "stageDirection": "softly"
        }
      ]
    }
  ],
  "characters": ["ROMEO", "JULIET"]
}
```

#### Script Library
- View all saved scripts in a grid/list
- Each script shows: title, character count, total lines, last practiced
- Actions: Open, Edit, Duplicate, Delete
- Search/filter by title or character name

#### Basic Inline Editing
- Fix typos in character names or dialogue
- Add/remove stage directions
- Adjust scene breaks
- Changes auto-save locally
- Option to "Reset to original" markdown

---

### 4.2 Role Selection & Voice Assignment

#### Character Selection Flow
1. Display detected characters with line counts
2. User selects **their role(s)** (can play multiple characters)
3. System assigns AI voices to remaining characters

#### Emotion Detection
- Parse stage directions: `(angrily)`, `(whispered)`, `(excited)`
- Map to Index TTS emotion parameters:
  - **Angry** → `emo_alpha=0.8`, high intensity
  - **Soft/Whisper** → `emo_alpha=0.4`, low intensity
  - **Excited/Happy** → `emo_alpha=0.7`, positive valence
  - **Sad** → `emo_alpha=0.6`, negative valence

#### Voice Preview
- Each character gets auto-assigned voice from available pool
- User can click "Preview" to hear sample line
- Option to manually reassign voices from dropdown

---

### 4.3 Rehearsal Modes

#### Solo Mode (MVP)
**Description**: User performs one role, AI reads all others

**Features**:
- Linear playback: script advances line-by-line
- **Your lines** highlighted in distinct color (e.g., amber)
- **AI lines** play automatically with visual indicator
- Manual controls:
  - ▶️ Play current line
  - ⏸️ Pause
  - ⏮️ Previous line
  - ⏭️ Next line
  - 🔁 Replay current line
- Scene jump: Skip to any scene via dropdown
- Progress indicator: "Line 24 / 156"

**UI Layout**:
```
┌─────────────────────────────────────┐
│ Romeo and Juliet - Act 2, Scene 2   │ <- Header
├─────────────────────────────────────┤
│ Progress: ████████░░░░ 24/156       │
├─────────────────────────────────────┤
│                                     │
│  [ROMEO] (AI - Speaking...)         │ <- Active line
│  "But soft! What light through      │
│   yonder window breaks?"            │
│                                     │
│  [JULIET] (YOU - Next)              │ <- Your upcoming line
│  "O Romeo, Romeo! Wherefore..."    │
│                                     │
├─────────────────────────────────────┤
│    ⏮️  ⏸️  ▶️  ⏭️  🔁             │ <- Controls
└─────────────────────────────────────┘
```

#### Team Mode (v2.0)
- WebSocket-based real-time sync
- Multiple users each control their character
- One user acts as "leader" (controls play/pause)
- Late join support

#### Pro Mode (v2.0)
- User's lines are **hidden** until it's their turn
- Practice from memory
- Option to reveal if stuck
- Timing feedback: "✅ On cue!" or "⏱️ 2s late"

#### Director Mode (v2.0)
- Observer role (no character assigned)
- Can pause/resume for entire group
- Add timestamped notes
- Export session recording with notes

---

### 4.4 Text-to-Speech System

#### Architecture: Modular Adapter Pattern

**Design Goal**: Support multiple TTS engines without changing frontend code

**Python TTS Service** (FastAPI):
```python
class TTSAdapter(ABC):
    @abstractmethod
    def synthesize(self, text: str, character: str, emotion: dict) -> bytes:
        """Generate audio bytes for given text with emotion parameters"""
        pass

    @abstractmethod
    def list_voices(self) -> List[VoiceInfo]:
        """Return available voices for character assignment"""
        pass

class IndexTTSAdapter(TTSAdapter):
    """Uses Index TTS with emotion vectors and emo_alpha"""
    pass

class ChatterboxAdapter(TTSAdapter):
    """Uses Chatterbox TTS with audio prompts"""
    pass
```

#### Supported Engines

| Engine | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Index TTS** | Rich emotion control, voice cloning, high quality | Slower (~2-3s per line) | Emotional scenes, dramatic moments |
| **Chatterbox** | Fast (~500ms), great quality, simple API | Less emotion control | Quick rehearsals, long scripts |

**Default**: Index TTS (prioritize quality for MVP)
**Fallback**: Chatterbox (if Index TTS fails or is too slow)

#### Pre-Generation Strategy
**When**: User clicks "Start Rehearsal"
**Process**:
1. Show blocking progress modal: "Generating AI voices... 🎤"
2. Send entire script to TTS service
3. TTS service processes each line sequentially
4. Returns audio files + metadata
5. Backend caches to `data/audio-cache/<script-id>/<line-id>.wav`
6. Progress updates via SSE (Server-Sent Events)
7. When complete, load rehearsal UI with cached audio

**Benefit**: Zero latency during rehearsal, smooth playback

#### Audio Caching
- Cache key: `{script_id}_{line_id}_{tts_engine}_{voice_id}_{emotion_hash}`
- Cache invalidation: On script edit affecting specific line
- Storage: Local filesystem (Docker volume)
- Format: WAV 24kHz mono (optimized for speech)

---

### 4.5 Rehearsal Interface

#### Visual Design
- **Color Palette** (kid-friendly, professional):
  - Background: Dark charcoal (#1a1a1a)
  - User's lines: Amber highlight (#ffbf00)
  - AI lines: Cyan accent (#00d9ff)
  - Scene headers: Magenta (#ff006e)
  - Text: Off-white (#f5f5f5)
- **Typography**:
  - Headers: Bold sans-serif (Inter, Poppins)
  - Dialogue: Readable serif or mono (Source Serif, Roboto Mono)
  - Large text size for mobile readability (18px base)

#### Animations
- AI speaking: Gentle pulsing glow around text
- Line transition: Smooth fade-in/fade-out
- Audio playback: Waveform animation
- Button feedback: Scale + color change on tap

#### Accessibility
- High contrast mode
- Keyboard shortcuts (Space = play/pause, Arrow keys = navigate)
- Screen reader support for line content
- Adjustable text size

---

### 4.6 Session Persistence

#### What Gets Saved
- Current script ID
- Current scene and line index
- User's selected role(s)
- Voice assignments
- Playback settings (speed, volume)

#### Auto-Resume
- On page reload, show modal: "Resume 'Romeo & Juliet' from Act 2, Scene 2?"
- Quick restart option

#### Session History (v2.0)
- Log each rehearsal: date, duration, script, role
- Display in "My Progress" dashboard
- Export history as CSV

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌─────────────────────────────────────────────────────┐
│                  Internet / Users                    │
└─────────────────┬───────────────────────────────────┘
                  │
          ┌───────▼────────┐
          │  Cloudflare     │  (Public HTTPS endpoint)
          │    Tunnel       │  (PIN-protected access)
          └───────┬────────┘
                  │
    ┌─────────────▼──────────────┐
    │   Docker Host (Local GPU)  │
    │                            │
    │  ┌──────────────────────┐ │
    │  │  Next.js Frontend    │ │  (Port 3000)
    │  │  - React UI          │ │
    │  │  - Tailwind CSS      │ │
    │  └──────────┬───────────┘ │
    │             │              │
    │  ┌──────────▼───────────┐ │
    │  │  Node.js API Server  │ │  (Port 4000)
    │  │  - Express + WS      │ │
    │  │  - SQLite DB         │ │
    │  │  - Script parser     │ │
    │  └──────────┬───────────┘ │
    │             │              │
    │  ┌──────────▼───────────┐ │
    │  │  Python TTS Service  │ │  (Port 5000)
    │  │  - FastAPI           │ │
    │  │  - CUDA (RTX 3090)   │ │
    │  │  - Index TTS         │ │
    │  │  - Chatterbox TTS    │ │
    │  └──────────────────────┘ │
    │                            │
    │  Volumes:                  │
    │  - data/scripts/           │
    │  - data/audio-cache/       │
    │  - data/database/          │
    │  - data/models/            │
    └────────────────────────────┘
```

### 5.2 Component Details

#### Frontend (Next.js 15)
**Tech**: React 18, Next.js 15 App Router, Tailwind CSS, TypeScript
**Responsibilities**:
- User interface and interaction
- Script upload and display
- Audio playback via Web Audio API
- Session state management (React Context + Zustand)
- API communication

**Key Libraries**:
- `wavesurfer.js` - Audio waveform visualization
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icon library
- `zustand` - Lightweight state management
- `zod` - Runtime type validation

#### Backend API (Node.js)
**Tech**: Express, TypeScript, SQLite (better-sqlite3), WebSocket (ws)
**Responsibilities**:
- REST API for CRUD operations
- Script parsing (Markdown → JSON)
- Session management
- Audio file serving
- TTS service client
- Simple PIN authentication

**Key Endpoints**:
```typescript
POST   /api/auth/verify           // Verify PIN
GET    /api/scripts                // List all scripts
POST   /api/scripts                // Upload new script
GET    /api/scripts/:id            // Get script details
PATCH  /api/scripts/:id            // Update script
DELETE /api/scripts/:id            // Delete script
POST   /api/sessions               // Create rehearsal session
GET    /api/sessions/:id           // Get session state
POST   /api/sessions/:id/generate  // Trigger TTS generation (SSE)
GET    /api/audio/:scriptId/:lineId // Stream audio file
```

#### TTS Service (Python)
**Tech**: FastAPI, PyTorch, CUDA, Index TTS, Chatterbox
**Responsibilities**:
- Load TTS models on startup
- Generate speech from text with emotion parameters
- Return audio bytes (WAV format)
- Cache model weights in GPU memory

**Key Endpoints**:
```python
POST /synthesize
{
  "text": "But soft! What light through yonder window breaks?",
  "character": "ROMEO",
  "engine": "index-tts",  # or "chatterbox"
  "voice_id": "voice_01",
  "emotion": {
    "intensity": 0.7,
    "valence": "positive"
  }
}

Response: Binary WAV audio data

GET /voices?engine=index-tts
[
  {"id": "voice_01", "name": "Male Young", "gender": "M"},
  {"id": "voice_02", "name": "Female Teen", "gender": "F"}
]

GET /health  # GPU status, memory usage
```

### 5.3 Data Model

#### Database Schema (SQLite)

```sql
-- Scripts table
CREATE TABLE scripts (
  id TEXT PRIMARY KEY,                    -- UUID
  title TEXT NOT NULL,
  markdown_source TEXT NOT NULL,          -- Original markdown
  parsed_json TEXT NOT NULL,              -- JSON structure
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  current_scene_index INTEGER DEFAULT 0,
  current_line_index INTEGER DEFAULT 0,
  user_role TEXT,                         -- JSON array of character names
  voice_assignments TEXT,                 -- JSON map {character: voiceId}
  tts_engine TEXT DEFAULT 'index-tts',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Audio cache metadata
CREATE TABLE audio_cache (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  line_id TEXT NOT NULL,
  tts_engine TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  emotion_hash TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Session history (v2.0)
CREATE TABLE rehearsal_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  started_at DATETIME,
  ended_at DATETIME,
  lines_completed INTEGER DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

#### TypeScript Types (Shared)

```typescript
// Script types
interface Script {
  id: string;
  title: string;
  markdownSource: string;
  parsed: ParsedScript;
  createdAt: string;
  updatedAt: string;
}

interface ParsedScript {
  title: string;
  characters: string[];
  scenes: Scene[];
}

interface Scene {
  id: string;
  title: string;
  lines: Line[];
}

interface Line {
  id: string;
  character: string;
  text: string;
  emotion?: EmotionType;
  stageDirection?: string;
}

type EmotionType = 'neutral' | 'angry' | 'sad' | 'excited' | 'soft' | 'fearful';

// Session types
interface RehearsalSession {
  id: string;
  scriptId: string;
  currentSceneIndex: number;
  currentLineIndex: number;
  userRole: string[];
  voiceAssignments: Record<string, string>; // character -> voiceId
  ttsEngine: 'index-tts' | 'chatterbox';
  createdAt: string;
  lastAccessedAt: string;
}

// TTS types
interface VoiceInfo {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'N';
  ageRange?: string;
  preview?: string; // URL to sample audio
}

interface TTSRequest {
  text: string;
  character: string;
  engine: 'index-tts' | 'chatterbox';
  voiceId: string;
  emotion: EmotionParams;
}

interface EmotionParams {
  intensity: number; // 0.0-1.0 (maps to emo_alpha)
  valence: 'positive' | 'negative' | 'neutral';
}
```

### 5.4 Deployment

#### Docker Compose Setup

```yaml
version: '3.9'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_PATH=/data/database/runthru.db
      - TTS_SERVICE_URL=http://tts-service:5000
      - PIN_CODE=${PIN_CODE}
    volumes:
      - ./data:/data

  tts-service:
    build: ./tts-service
    ports:
      - "5000:5000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
    volumes:
      - ./data/models:/models

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
    depends_on:
      - frontend

volumes:
  data:
```

#### Cloudflare Tunnel Config

```yaml
# cloudflare-tunnel.yml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: runthru.example.com
    service: http://frontend:3000
    originRequest:
      noTLSVerify: true
  - service: http_status:404
```

---

## 6. User Flows

### 6.1 First-Time User Flow

```
1. Visit runthru.example.com
   ↓
2. Enter PIN code (provided by you)
   ↓
3. Welcome screen:
   - "Start New Rehearsal"
   - "Open Script Library"
   ↓
4. Click "Start New Rehearsal"
   ↓
5. Upload script (drag-drop or file picker)
   ↓
6. System parses markdown
   → Shows preview: "Found 12 characters, 156 lines"
   ↓
7. Character selection:
   - List of characters with line counts
   - User clicks their role (e.g., "JULIET - 45 lines")
   ↓
8. Voice assignment:
   - System auto-assigns voices to other characters
   - User can preview and change voices
   - Toggle emotion detection on/off
   ↓
9. Click "Generate AI Voices"
   ↓
10. Progress modal: "Generating... 🎤 78%"
    (Shows estimated time remaining)
    ↓
11. Rehearsal screen loads
    ↓
12. User reads highlighted lines, AI plays others
    ↓
13. Navigate with controls or keyboard
    ↓
14. Click "Save & Exit" when done
    → Session saved to library
```

### 6.2 Returning User Flow

```
1. Visit runthru.example.com
   ↓
2. Enter PIN (remembered via cookie)
   ↓
3. Script library:
   - "Romeo & Juliet" (Last: 2 hours ago)
   - "Hamlet" (Last: 3 days ago)
   ↓
4. Click "Romeo & Juliet"
   ↓
5. Modal: "Resume from Act 2, Scene 2?" or "Start Over"
   ↓
6. Rehearsal loads instantly (audio already cached)
```

---

## 7. UI/UX Design Specifications

### 7.1 Design Principles
1. **Clarity over cleverness**: Large text, obvious buttons
2. **Speed**: Every action completes in <500ms (except TTS generation)
3. **Forgiveness**: Easy undo, confirm destructive actions
4. **Delight**: Subtle animations, encouraging feedback

### 7.2 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | <640px | Single column, full-width buttons |
| Tablet | 640-1024px | Two columns (script + controls) |
| Desktop | >1024px | Three columns (script + controls + notes) |

### 7.3 Key Screens (Wireframes)

#### Welcome Screen
```
┌───────────────────────────────────┐
│        🎭 RunThru                 │
│   Practice lines like a pro       │
│                                   │
│  ┌─────────────────────────────┐ │
│  │  Start New Rehearsal        │ │
│  └─────────────────────────────┘ │
│                                   │
│  ┌─────────────────────────────┐ │
│  │  📚 Script Library (4)      │ │
│  └─────────────────────────────┘ │
│                                   │
│  Recent:                          │
│  • Romeo & Juliet (2 hrs ago)     │
│  • Hamlet (3 days ago)            │
└───────────────────────────────────┘
```

#### Rehearsal Screen (Mobile)
```
┌───────────────────────────────────┐
│ Romeo & Juliet   Act 2, Scene 2  │
│ ═══════════════════  [24/156]     │
│                                   │
│ 🎤 ROMEO (AI is speaking...)      │
│ "But soft! What light through     │
│  yonder window breaks?"           │
│                                   │
│ 🎭 JULIET (YOU - Get ready!)      │
│ "O Romeo, Romeo! Wherefore art    │
│  thou Romeo?"                     │
│                                   │
│ 📝 Stage direction: softly        │
│                                   │
├───────────────────────────────────┤
│  ⏮️   ⏸️   ▶️   ⏭️   🔁        │
│           [Scene ▼]               │
└───────────────────────────────────┘
```

---

## 8. Success Metrics (MVP)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Setup time** | <2 min from upload to rehearsal | Track timestamps in logs |
| **Parsing accuracy** | >95% characters detected correctly | Manual QA on 20 test scripts |
| **TTS generation speed** | <30s for 50-line scene | Time endpoint responses |
| **Audio quality** | "Sounds natural" rating >4/5 | User survey (your daughter + friends) |
| **Mobile usability** | Can rehearse full scene on phone | Usability test on iPhone/Android |
| **Session persistence** | 100% resume accuracy | QA: reload mid-scene |

---

## 9. Open Questions & Decisions Needed

### Technical
- [ ] Which TTS engine for MVP default? (Index TTS vs Chatterbox)
- [ ] Max script length? (Limit to 500 lines to avoid long generation?)
- [ ] Audio format: WAV vs MP3 (quality vs size tradeoff)
- [ ] Should we pre-load next 5 audio files for smoother playback?

### UX
- [ ] Should "Replay" button replay AI or user line?
- [ ] Show visual timer during user's line? (to practice pacing)
- [ ] Allow adjusting TTS speed (0.8x - 1.2x)?
- [ ] Keyboard shortcuts: display cheat sheet on first load?

### Content
- [ ] Include sample scripts? (Romeo & Juliet balcony scene, etc.)
- [ ] Age-appropriate content filtering? (flag mature themes)
- [ ] Support multiple languages? (Spanish, French for language classes)

---

## 10. MVP Scope (Phase 1 - Next 2-4 Weeks)

### ✅ In Scope
- Docker Compose setup with all services
- Script upload, parsing, and basic editing
- Script library (list, view, delete)
- Solo rehearsal mode with pre-generated audio
- Index TTS integration with emotion detection
- Responsive UI (mobile + desktop)
- PIN authentication
- Cloudflare Tunnel deployment guide
- Session auto-save and resume

### ❌ Out of Scope (Future)
- Team/multiplayer mode
- Pro Mode (hidden lines)
- Voice customization UI
- Session recording/export
- In-app script editor (rich text)
- User accounts (beyond PIN)
- Analytics dashboard

---

## 11. Phase 2 Features (v2.0 - Month 2-3)

1. **Team Mode**
   - WebSocket real-time sync
   - 2-4 users in same session
   - Character lock (one actor per role)

2. **Pro Mode**
   - Hide user's lines until it's their turn
   - "Reveal hint" button if stuck
   - Timing accuracy feedback

3. **Voice Customization**
   - Upload custom voice samples for cloning
   - Adjust pitch/speed per character
   - Save voice presets

4. **Enhanced Analytics**
   - Practice time per session
   - Most-practiced scenes
   - Progress over time chart

---

## 12. Technical Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| TTS generation too slow | High | Medium | Use Chatterbox as fast fallback; pre-generate in chunks |
| GPU out of memory | High | Low | Limit concurrent generation; use FP16 precision |
| Script parsing errors | Medium | Medium | Provide manual character tagging UI; show preview before generating |
| Cloudflare Tunnel unstable | Low | Low | Document local-only mode (access via LAN IP) |
| Kids can't figure out UI | High | Low | Usability test with target users early |

---

## Appendix A: Script Parsing Examples

### Example 1: Traditional Format
```markdown
ROMEO
But, soft! What light through yonder window breaks?

JULIET
O Romeo, Romeo! Wherefore art thou Romeo?
```

**Parsed**:
```json
{
  "lines": [
    {"character": "ROMEO", "text": "But, soft! What light..."},
    {"character": "JULIET", "text": "O Romeo, Romeo!..."}
  ]
}
```

### Example 2: Modern Format
```markdown
**ROMEO**: But, soft! What light through yonder window breaks?

**JULIET**: O Romeo, Romeo! Wherefore art thou Romeo?
```

**Parsed**: Same as above

### Example 3: With Stage Directions
```markdown
ROMEO (excitedly)
But, soft! What light through yonder window breaks?

JULIET enters from above.

JULIET (softly)
O Romeo, Romeo!
```

**Parsed**:
```json
{
  "lines": [
    {
      "character": "ROMEO",
      "text": "But, soft! What light...",
      "emotion": "excited",
      "stageDirection": "excitedly"
    },
    {
      "character": "STAGE_DIRECTION",
      "text": "JULIET enters from above."
    },
    {
      "character": "JULIET",
      "text": "O Romeo, Romeo!",
      "emotion": "soft",
      "stageDirection": "softly"
    }
  ]
}
```

---

## Appendix B: Emotion Mapping

| Stage Direction | Index TTS `emo_alpha` | Valence |
|-----------------|----------------------|---------|
| (angrily), (furious) | 0.8 | negative |
| (sadly), (crying) | 0.6 | negative |
| (excitedly), (joyfully) | 0.7 | positive |
| (softly), (whispered) | 0.4 | neutral |
| (fearfully), (scared) | 0.7 | negative |
| (neutrally), no direction | 0.3 | neutral |

---

**End of PRD v2.0**

*Next Steps*: Review with your daughter, gather feedback on UI mockups, then proceed to ARCHITECTURE.md for implementation details.*
