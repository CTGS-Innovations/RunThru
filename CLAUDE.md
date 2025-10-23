# RunThru Backend

## 🎯 Focus Area
This worktree contains **backend API and TTS service**. Frontend is in the `RunThru-frontend/` worktree.

## Tech Stack

### API Server
- **Runtime**: Node.js 20 LTS
- **Framework**: Express 4
- **Language**: TypeScript 5
- **Database**: SQLite (better-sqlite3) - fast, synchronous, perfect for local deployment
- **WebSocket**: ws (for v2.0 multiplayer)
- **Validation**: Zod
- **Testing**: Jest + Supertest

### TTS Service
- **Runtime**: Python 3.11
- **Framework**: FastAPI
- **ML Framework**: PyTorch 2.x + CUDA 12.1
- **TTS Engines**:
  - **Index TTS** - Emotion-aware, rich prosody, slower (~2-3s/line)
  - **Chatterbox TTS** - Fast, high quality, consistent (~0.5-1s/line)
- **Audio Processing**: torchaudio
- **GPU**: NVIDIA RTX 3090 (24GB VRAM)

## Directory Structure
```
backend/
├── src/
│   ├── server.ts                 # Express app entry point
│   ├── config/
│   │   ├── database.ts           # SQLite connection
│   │   ├── env.ts                # Environment variables
│   │   └── logger.ts             # Winston logger
│   ├── routes/
│   │   ├── index.ts              # Route aggregator
│   │   ├── auth.routes.ts        # PIN verification
│   │   ├── scripts.routes.ts     # Script CRUD
│   │   ├── sessions.routes.ts    # Rehearsal sessions
│   │   └── audio.routes.ts       # Audio file serving
│   ├── services/
│   │   ├── scriptParser.service.ts    # Markdown → JSON
│   │   ├── ttsClient.service.ts       # HTTP client for TTS service
│   │   ├── sessionManager.service.ts  # Session CRUD
│   │   ├── audioCache.service.ts      # Cache management
│   │   └── emotionMapper.service.ts   # Stage directions → TTS params
│   ├── models/
│   │   ├── Script.model.ts       # SQLite queries for scripts
│   │   ├── Session.model.ts      # SQLite queries for sessions
│   │   └── AudioCache.model.ts   # Audio cache metadata
│   ├── middleware/
│   │   ├── auth.middleware.ts    # PIN verification
│   │   ├── errorHandler.middleware.ts
│   │   ├── validator.middleware.ts    # Zod schema validation
│   │   └── cors.middleware.ts
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types
│   └── utils/
│       ├── errors.ts             # Custom error classes
│       └── helpers.ts
├── Dockerfile
├── package.json
└── tsconfig.json

tts-service/
├── main.py                       # FastAPI entry point
├── config.py                     # Configuration
├── adapters/
│   ├── base.py                   # TTSAdapter abstract class
│   ├── index_tts.py              # Index TTS implementation
│   ├── chatterbox.py             # Chatterbox implementation
│   └── utils.py
├── models/
│   └── emotion.py                # Emotion parameter models
├── utils/
│   ├── audio.py                  # Audio processing
│   └── cache.py                  # Model cache management
├── Dockerfile
└── requirements.txt
```

## Data Storage
All data stored in `../data/` (shared with main worktree):
- `data/database/runthru.db` - SQLite database
- `data/scripts/` - Uploaded markdown files
- `data/audio-cache/` - Generated WAV files (organized by script ID)
- `data/models/` - TTS model weights (Index TTS + Chatterbox checkpoints)

## Database Schema
```sql
-- Scripts table
CREATE TABLE scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  markdown_source TEXT NOT NULL,
  parsed_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  current_scene_index INTEGER DEFAULT 0,
  current_line_index INTEGER DEFAULT 0,
  user_role TEXT,
  voice_assignments TEXT,
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
```

## API Endpoints
```typescript
// Authentication
POST   /api/auth/verify           // Verify PIN code

// Scripts
GET    /api/scripts                // List all scripts
POST   /api/scripts                // Upload new script
GET    /api/scripts/:id            // Get script details
PATCH  /api/scripts/:id            // Update script
DELETE /api/scripts/:id            // Delete script

// Sessions
POST   /api/sessions               // Create rehearsal session
GET    /api/sessions/:id           // Get session state
PATCH  /api/sessions/:id           // Update session state
POST   /api/sessions/:id/generate  // Generate audio (SSE)

// Audio
GET    /api/audio/:scriptId/:lineId // Stream audio file
```

## TTS Service Endpoints
```python
# Generate speech
POST /synthesize
{
  "text": "But soft! What light...",
  "character": "ROMEO",
  "engine": "index-tts",  # or "chatterbox"
  "voice_id": "voice_01",
  "emotion": {
    "intensity": 0.7,
    "valence": "positive"
  }
}

# List available voices
GET /voices?engine=index-tts

# Health check
GET /health
```

## Script Parser Logic
Converts markdown to structured JSON:

**Input formats supported:**
1. Traditional: `CHARACTER NAME` on own line, dialogue below
2. Modern: `**CHARACTER NAME:**` dialogue on same line
3. Stage directions: `(emotion)` inline or `CHARACTER (emotion)`

**Emotion detection:**
- `(angrily)` → intensity: 0.8, valence: negative
- `(softly)` → intensity: 0.4, valence: neutral
- `(excited)` → intensity: 0.7, valence: positive

See `docs/ARCHITECTURE.md` for detailed parsing examples.

## Development

### API Server
```bash
cd backend
npm install
npm run dev  # Runs on localhost:4000
```

### TTS Service
```bash
cd tts-service
pip install -r requirements.txt

# Download models
hf download IndexTeam/IndexTTS-2 --local-dir=../data/models/index-tts
pip install chatterbox-tts

# Run service
python main.py  # Runs on localhost:5000
```

### Docker (Full Stack)
```bash
cd ..  # Go to main worktree
docker-compose up
```

## TTS Adapter Pattern
The TTS service uses an adapter pattern for swappable engines:

```python
class TTSAdapter(ABC):
    @abstractmethod
    async def synthesize(text: str, voice_id: str, emotion: EmotionParams) -> bytes:
        """Generate audio (WAV format)"""
        pass
```

**Default: Index TTS** (emotion control, high quality)
**Fallback: Chatterbox** (speed, consistency)

Can switch engines via API without changing frontend code.

## Task Tracking
**Check TASKS.md** (symlinked from main) at start of session:
- See current sprint and your backend/TTS tasks
- Mark tasks [x] as you complete them
- Commit: `git add TASKS.md && git commit -m "tasks: Complete X"`
- Notify @corey when you hit 🔍 CHECKPOINT markers

**TASKS.md is shared** across all three worktrees - updates here are visible everywhere.

## Context Strategy
When working in this backend worktree:

1. **Use backend-specialist for research**:
   ```
   use backend-specialist to analyze the script parser requirements
   ```

2. **Use tts-specialist for TTS work**:
   ```
   use tts-specialist to design the emotion mapping strategy
   ```

3. **Plans saved to** `.claude/docs/` (symlinked from main)

4. **Update TASKS.md** as you complete tasks

5. **Use /clear between features** to keep context clean

6. **DO NOT modify frontend code** - that's in RunThru-frontend/

## Key Rules
- ✅ Build API endpoints, services, and TTS integrations
- ✅ Use SQLite for data persistence (simple, fast, local)
- ✅ Validate all inputs with Zod schemas
- ✅ Handle errors gracefully (useful messages for frontend)
- ✅ Cache audio files efficiently (filesystem > database for binary)
- ✅ Optimize TTS inference (FP16, batch where possible)
- ❌ Do NOT modify frontend components
- ❌ Do NOT change UI/UX decisions
- ❌ Do NOT skip error handling (teens will encounter edge cases)

## Performance Considerations
- **Script parsing**: Should complete in <100ms for typical script
- **Audio generation**: Batch processing with progress updates (SSE)
- **Audio caching**: Check cache before calling TTS service
- **Database**: Use indexes, prepared statements, WAL mode
- **TTS**: Use FP16 inference, keep models in GPU memory

## Notes for Claude
- This is local deployment with GPU - optimize for that, not cloud
- Prioritize quality over speed (pre-generation strategy allows this)
- Error messages should be helpful (teens + parents will see them)
- Log performance metrics (helpful for throwaway tests)
- The user has 50 years experience - present options, validate with data
