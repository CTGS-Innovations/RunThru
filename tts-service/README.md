# RunThru TTS Service

Python FastAPI service for text-to-speech synthesis using Index TTS and Chatterbox.

## Setup for Main Worktree

This directory uses **symlinks** to share resources with the backend worktree:

```bash
venv/        → ../../RunThru-backend/tts-service/venv/
index-tts/   → ../../RunThru-backend/tts-service/index-tts/
```

### Why Symlinks?

1. **No duplication**: Avoids copying 20GB of TTS models
2. **Single source**: Python dependencies managed in backend worktree only
3. **Integration testing**: Main worktree can run TTS without full setup

### Running the Service

```bash
cd /home/corey/projects/RunThru/tts-service
source venv/bin/activate
python main.py
```

Server starts on http://localhost:5000

### Development

**⚠️ Important**: Don't develop TTS features in main worktree!

For TTS development:
```bash
cd /home/corey/projects/RunThru-backend/tts-service
# Work here, then merge to main
```

## Endpoints

- `GET /` - Service info
- `GET /health` - Health check + GPU status
- `POST /synthesize` - Generate speech from text
- `GET /voices?engine=index-tts` - List available voices

## Configuration

Copy `.env.example` to `.env` and adjust:

```bash
PORT=5000
CUDA_VISIBLE_DEVICES=0
MODEL_DIR=./index-tts
LOG_LEVEL=INFO
```

## Tech Stack

- **Framework**: FastAPI
- **TTS Engines**: Index TTS, Chatterbox (planned)
- **Audio**: PyTorch, NumPy, SciPy
- **GPU**: CUDA 12.1 (RTX 3090)
