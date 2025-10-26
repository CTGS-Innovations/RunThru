# 🎭 RunThru

**Interactive rehearsal platform for teen actors to practice lines with AI scene partners**

RunThru helps theater students prepare for auditions and performances by providing an AI-powered rehearsal companion. Upload your script, choose your role, and rehearse with realistic AI voices that bring your scene partners to life.

---

## ✨ Features

### ✅ Implemented (MVP Phase 1 - Sprints 1-4)

- **📄 Script Upload & Parsing**
  - Drag-and-drop markdown script upload
  - Intelligent parser extracts characters, dialogue, stage directions
  - Supports complex scripts (tested with 400+ line plays)

- **🎨 AI-Powered Script Analysis** (via OpenAI)
  - Character descriptions, arcs, and breakout moments
  - Scene mood analysis and objectives
  - AI-generated character portraits (gpt-image-1)
  - Genre detection and runtime estimation

- **🎮 Gaming-Inspired Character Selection**
  - Video game-style hero picker interface
  - Character cards with portraits, taglines, and stats
  - Role badges (Lead/Featured/Ensemble)
  - Quest aesthetic for engagement

- **🎙️ Voice Assignment System**
  - 8 preset voices (teen-male, wise-elder, cheerful-kid, etc.)
  - Fine-tune controls (gender, emotion, age sliders)
  - Random voice assignment with shuffle option
  - Voice preview generation (coming in Sprint 5)

### 🚧 In Progress (Sprint 5)

- **🔊 Audio Generation & Caching**
  - GPU-accelerated TTS (Index TTS + Chatterbox)
  - Batch audio generation with progress tracking
  - Emotion mapping for dynamic performances
  - Audio cache service for instant playback

### 📋 Roadmap (Sprint 6+)

- **▶️ Rehearsal Playback Mode**
  - Word-level audio synchronization
  - Line-by-line navigation
  - Skip/repeat controls
  - Practice mode with prompts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand + React Query
- **Icons**: Lucide React

### Backend
- **API Server**: Node.js 20 + Express + TypeScript
- **Database**: SQLite 3 (better-sqlite3)
- **TTS Service**: Python 3.11 + FastAPI
- **AI Integration**: OpenAI API (GPT-4o-mini + gpt-image-1)

### TTS Engines
- **Index TTS**: High-quality voice cloning (GPU-accelerated)
- **Chatterbox**: Fast prosody control with emotion parameters
- **Hardware**: NVIDIA RTX 3090 (24GB VRAM)

---

## 🚀 Quick Start

### 🐳 Docker Deployment (Recommended)

**The easiest way to run RunThru is with Docker Compose.** This handles all dependencies, GPU passthrough, and service orchestration automatically.

#### Prerequisites
- **Docker** 20.10+ and Docker Compose 2.0+
- **NVIDIA Docker Runtime** (for GPU support)
- **NVIDIA GPU** with 8GB+ VRAM (tested on RTX 3090)
- **OpenAI API Key** (for script analysis + portraits)

#### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/RunThru.git
cd RunThru

# 2. Create environment file
cp .env.example .env
# Edit .env and set your PIN_CODE and OPENAI_API_KEY

# 3. Create data directories
mkdir -p data/{database,scripts,audio-cache,logs,models}

# 4. Build and start services
docker-compose up -d

# 5. Check status
docker-compose ps
docker-compose logs -f

# 6. Open the app
# Visit http://localhost:3000
```

**📖 For complete Docker documentation, GPU setup, troubleshooting, and production deployment, see [DOCKER.md](./DOCKER.md)**

---

### 💻 Manual Development Setup

For local development without Docker:

#### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+
- **GPU** (optional, but recommended for TTS)
- **OpenAI API Key** (for script analysis + portraits)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/RunThru.git
cd RunThru
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend API:**
```bash
cd backend
npm install
```

**TTS Service:**
```bash
cd tts-service
pip install -r requirements.txt
```

### 3. Download TTS Models (~6GB)

```bash
./download-tts-models.sh
```

Models will be saved to `backend/tts-service/index-tts/checkpoints/`

### 4. Configure Environment

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-key-here
PORT=4000
NODE_ENV=development
DATABASE_PATH=./database/runthru.db
TTS_SERVICE_URL=http://localhost:5000
```

### 5. Start Development Servers

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - TTS Service:**
```bash
cd tts-service
python main.py
# Runs on http://localhost:5000
```

**Terminal 3 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

### 6. Open the App

Visit **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
RunThru/
├── src/                         # Frontend (Next.js)
│   ├── app/                     # App Router pages
│   │   ├── scripts/             # Script library & detail
│   │   └── rehearsal/           # Rehearsal player (Sprint 6)
│   ├── components/
│   │   ├── script/              # ScriptUploader, ScriptCard
│   │   ├── session/             # CharacterCard, VoiceSliders
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # React Query hooks
│   ├── lib/                     # API client, utilities
│   └── types/                   # TypeScript definitions
│
├── backend/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   │   ├── scriptParser.service.ts
│   │   │   ├── scriptAnalysis.service.ts
│   │   │   ├── characterPortrait.service.ts
│   │   │   ├── session.service.ts
│   │   │   └── voicePreset.service.ts
│   │   └── models/              # Data models
│   ├── database/                # SQLite database & migrations
│   ├── public/portraits/        # AI-generated character images
│   └── config/                  # Voice presets config
│
└── tts-service/                 # Python TTS service (FastAPI)
    ├── main.py                  # FastAPI server
    ├── adapters/                # TTS engine adapters
    │   ├── index_tts_adapter.py
    │   └── chatterbox_adapter.py (coming soon)
    ├── reference-voices/        # Voice preset audio files
    └── index-tts/               # Index TTS models (~6GB)
```

---

## 🎯 Development Workflow

This project uses **git worktrees** for parallel development and **Docker** for deployment.

### Development vs Deployment

**Development** (git worktrees for parallel work):
- **Frontend** worktree (`/RunThru-frontend`) → `feature/frontend` branch
- **Backend** worktree (`/RunThru-backend`) → `feature/backend` branch
- Work on frontend and backend simultaneously without conflicts

**Deployment** (Docker from main branch):
- **Main** worktree (`/RunThru`) → `main` branch only
- All Docker configs (Dockerfile, docker-compose.yml) live here
- Merge feature branches → build Docker images → deploy anywhere

### Working with Worktrees

```bash
# List all worktrees
git worktree list

# Develop in frontend worktree
cd /path/to/RunThru-frontend
git checkout feature/frontend
# Make changes, commit to feature/frontend

# Develop in backend worktree
cd /path/to/RunThru-backend
git checkout feature/backend
# Make changes, commit to feature/backend

# When ready to deploy: merge to main and build
cd /path/to/RunThru
git checkout main
git merge feature/frontend
git merge feature/backend
docker-compose build
docker-compose up -d
```

### Why This Pattern?

- **Development worktrees** = Fast iteration, no branch switching
- **Main worktree** = Production-ready, Dockerized, portable
- **Separation** = Dev dependencies stay in dev worktrees, Docker only pulls from main

---

## 🧪 Testing

### Health Checks

```bash
# Backend API
curl http://localhost:4000/api/health

# TTS Service
curl http://localhost:5000/health
```

### Upload a Test Script

1. Go to **http://localhost:3000/scripts**
2. Click "Upload Script" or drag a `.md` file
3. AI analysis runs automatically (~90 seconds for 10-character script)
4. See character portraits and metadata

### Test Script Example

Use the included test script:
```bash
cat data/scripts/zombie-apocalypse.md
```

---

## 💰 Cost Estimates

**Per Script Upload** (with OpenAI integration):
- Text Analysis (GPT-4o-mini): ~$0.009
- Character Portraits (gpt-image-1, 11 characters): ~$0.44
- **Total**: ~$0.45 per script

**Runtime Costs**: $0 (runs locally on your GPU)

---

## 🏗️ Sprint Progress

| Sprint | Status | Description |
|--------|--------|-------------|
| 1 - Infrastructure | ✅ Complete | Git worktrees, scaffolding, TTS validation |
| 2 - Script Upload | ✅ Complete | Parser, API, upload UI |
| 3 - Role Selection | ✅ Complete | Character cards, voice system, gaming UX |
| 4 - OpenAI Integration | ✅ Complete | Analysis, portraits, metadata |
| 5 - Audio Generation | 🟡 Ready | Batch TTS, caching, emotion mapping |
| 6 - Rehearsal Playback | ⏸️ Planned | Player UI, word-sync, navigation |

**Overall Progress**: 80% (4/6 sprints complete)

---

## 📖 Documentation

- **[DOCKER.md](./DOCKER.md)**: 🐳 Docker deployment guide (GPU setup, production config)
- **[CLAUDE.md](./CLAUDE.md)**: Project context for AI development
- **[TASKS.md](./TASKS.md)**: Detailed task tracking & progress
- **[docs/PRD.md](./docs/PRD.md)**: Product requirements
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: Technical design
- **[VALIDATION.md](./VALIDATION.md)**: Infrastructure validation guide

---

## 🎨 Design Philosophy

**"Pokemon card energy, not homework energy"**

Every interaction should feel like starting an epic adventure. The UI uses:
- Gaming-inspired character selection (hero picker aesthetic)
- Achievement-style stats and progress
- Quest language ("Assemble Your Cast", "Launch Rehearsal")
- Gradient glows, sparkle icons, and bold CTAs
- Mobile-first responsive design (375px → desktop)

**Target Audience**: Teen actors (13-18) practicing for school plays and community theater.

---

## 🤝 Contributing

This is a father-daughter project built with Claude Code. Development follows a structured sprint model with integration checkpoints.

**Key Principles**:
1. Data-driven decisions (use `throwaway-tests/` for benchmarks)
2. Human-in-the-loop (present options, don't assume)
3. Context hygiene (use specialized subagents for research)
4. Teen-friendly UX (exciting, not boring)

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **Index TTS**: High-quality voice cloning engine
- **Chatterbox**: Fast prosody-controlled TTS
- **shadcn/ui**: Beautiful component library
- **OpenAI**: GPT-4o-mini for analysis, gpt-image-1 for portraits

---

## 📬 Contact

Questions or feedback? Open an issue or reach out!

**Built with ❤️ for theater students everywhere** 🎭
