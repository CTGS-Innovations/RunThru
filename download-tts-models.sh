#!/bin/bash
#
# Download TTS Models for RunThru
# This downloads Index TTS and Chatterbox models
# Uses a virtual environment to avoid system package conflicts
#

set -e

echo "🤖 Downloading TTS Models for RunThru"
echo "======================================"
echo ""

DATA_DIR="/home/corey/projects/RunThru/data/models"
VENV_DIR="/home/corey/projects/RunThru-backend/tts-service/venv"

mkdir -p "$DATA_DIR"
mkdir -p "$(dirname "$VENV_DIR")"

# =============================================================================
# 1. Create Python Virtual Environment
# =============================================================================
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo "✅ Virtual environment created: $VENV_DIR"
else
    echo "✅ Virtual environment already exists: $VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"
echo "✅ Virtual environment activated"
echo ""

# =============================================================================
# 2. Install HuggingFace CLI (in venv)
# =============================================================================
echo "📦 Installing HuggingFace CLI..."
pip install -q --upgrade pip
pip install -q huggingface-hub[cli]
echo "✅ HuggingFace CLI installed"
echo ""

# =============================================================================
# 3. Install PyTorch with CUDA support (in venv)
# =============================================================================
echo "📦 Installing PyTorch with CUDA 12.1..."
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
echo "✅ PyTorch installed"
echo ""

# =============================================================================
# 4. Download Index TTS Models (~6GB)
# =============================================================================
echo "⬇️  Downloading Index TTS models (~6GB, may take 5-10 minutes)..."
echo "Target: $DATA_DIR/index-tts"
echo ""

if [ -f "$DATA_DIR/index-tts/config.yaml" ]; then
    echo "⚠️  Index TTS models already exist. Skipping download."
else
    # Clone the repo to get the code
    echo "📥 Cloning Index TTS repository..."
    cd "$(dirname "$VENV_DIR")"
    if [ ! -d "index-tts" ]; then
        git clone https://github.com/index-tts/index-tts.git
        cd index-tts
        pip install -e .
    fi

    # Download model weights
    cd "$DATA_DIR"
    huggingface-cli download IndexTeam/IndexTTS-2 --local-dir="$DATA_DIR/index-tts"
    echo "✅ Index TTS models downloaded"
fi

echo ""

# =============================================================================
# 5. Install Chatterbox TTS (in venv)
# =============================================================================
echo "📦 Installing Chatterbox TTS..."
pip install chatterbox-tts
echo "✅ Chatterbox TTS installed"
echo ""

# =============================================================================
# 5. Verify Models
# =============================================================================
echo "🔍 Verifying downloads..."

if [ -f "$DATA_DIR/index-tts/config.yaml" ]; then
    INDEX_SIZE=$(du -sh "$DATA_DIR/index-tts" | awk '{print $1}')
    echo "✅ Index TTS: $INDEX_SIZE"
else
    echo "❌ Index TTS config.yaml not found"
    exit 1
fi

echo ""
echo "===================================="
echo "✅ All TTS models downloaded successfully!"
echo ""
echo "Virtual environment: $VENV_DIR"
echo ""
echo "Model locations:"
echo "  - Index TTS: $DATA_DIR/index-tts"
echo "  - Chatterbox: (installed in venv)"
echo ""
echo "To use the TTS environment:"
echo "  source $VENV_DIR/bin/activate"
echo ""
echo "Next step:"
echo "  Run validation: ./validate-tts.py"
