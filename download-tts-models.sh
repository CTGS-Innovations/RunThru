#!/bin/bash
#
# Download TTS Models for RunThru
# Official installation methods per Index TTS and Chatterbox docs
#

set -e

echo "🤖 Downloading TTS Models for RunThru"
echo "======================================"
echo ""

# Directories
BACKEND_DIR="/home/corey/projects/RunThru-backend/tts-service"
INDEX_TTS_DIR="$BACKEND_DIR/index-tts"
VENV_DIR="$BACKEND_DIR/venv"
MODELS_DIR="/home/corey/projects/RunThru/data/models"

mkdir -p "$BACKEND_DIR"
mkdir -p "$MODELS_DIR"

# =============================================================================
# 1. Verify Python 3.11
# =============================================================================
echo "🔍 Verifying Python 3.11..."
if ! command -v python3.11 &> /dev/null; then
    echo "❌ Error: Python 3.11 is required but not found"
    echo "Install with: sudo apt install -y python3.11 python3.11-venv python3.11-dev"
    exit 1
fi
PYTHON_VERSION=$(python3.11 --version)
echo "✅ $PYTHON_VERSION found"
echo ""

# =============================================================================
# 2. Install Index TTS (uses uv, creates its own .venv)
# =============================================================================
echo "📦 Installing Index TTS..."
echo "Per official docs: Index TTS REQUIRES 'uv' package manager"
echo "Reference: https://github.com/index-tts/index-tts#installation"
echo ""

cd "$BACKEND_DIR"

# Clone repo if needed
if [ ! -d "$INDEX_TTS_DIR" ]; then
    echo "📥 Cloning Index TTS repository..."
    git clone https://github.com/index-tts/index-tts.git
    cd "$INDEX_TTS_DIR"
    echo "✅ Repository cloned"
else
    echo "✅ Repository already exists"
    cd "$INDEX_TTS_DIR"
fi

# Install uv if not already available
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv package manager..."
    python3.11 -m pip install -U uv
    echo "✅ uv installed"
else
    echo "✅ uv already installed"
fi

# Sync dependencies (creates .venv automatically)
echo "📦 Installing Index TTS dependencies with uv..."
echo "This creates .venv and installs correct versions..."
uv sync --all-extras
echo "✅ Index TTS dependencies installed"
echo ""

# Download models
echo "⬇️  Downloading Index TTS models (~6GB)..."
if [ -d "$INDEX_TTS_DIR/checkpoints/config.yaml" ]; then
    echo "⚠️  Models already downloaded"
else
    echo "📥 Installing huggingface-cli via uv..."
    uv tool install "huggingface_hub[cli]"

    echo "📥 Downloading IndexTTS-2 models..."
    "$HOME/.local/bin/hf" download IndexTeam/IndexTTS-2 --local-dir="$INDEX_TTS_DIR/checkpoints"
    echo "✅ Models downloaded"
fi
echo ""

# =============================================================================
# 3. Install Chatterbox TTS (separate venv, Python 3.11)
# =============================================================================
echo "📦 Installing Chatterbox TTS..."
echo "Per official docs: Python 3.11 on Debian 11"
echo "Reference: https://github.com/resemble-ai/chatterbox#installation"
echo ""

# Create Python 3.11 venv for Chatterbox
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating Python 3.11 virtual environment for Chatterbox..."
    python3.11 -m venv "$VENV_DIR"
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate and install
source "$VENV_DIR/bin/activate"
echo "✅ Virtual environment activated"

echo "📦 Upgrading pip and build tools..."
pip install -q --upgrade pip setuptools wheel

echo "📦 Installing numpy (required for pkuseg build)..."
pip install numpy

echo "📦 Installing chatterbox-tts (with --no-build-isolation for pkuseg)..."
# pkuseg has a broken setup.py that imports numpy during build
# We need to disable build isolation so it can see our installed numpy
pip install --no-build-isolation chatterbox-tts
echo "✅ Chatterbox TTS installed"

deactivate
echo ""

# =============================================================================
# 4. Verify Installation
# =============================================================================
echo "🔍 Verifying installations..."
echo ""

# Check Index TTS
if [ -f "$INDEX_TTS_DIR/checkpoints/config.yaml" ]; then
    INDEX_SIZE=$(du -sh "$INDEX_TTS_DIR/checkpoints" | awk '{print $1}')
    echo "✅ Index TTS: checkpoints ($INDEX_SIZE)"
else
    echo "❌ Index TTS: config.yaml not found"
fi

if [ -d "$INDEX_TTS_DIR/.venv" ]; then
    echo "✅ Index TTS: .venv created by uv"
else
    echo "❌ Index TTS: .venv not found"
fi

# Check Chatterbox
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
    if python -c "import chatterbox" 2>/dev/null; then
        echo "✅ Chatterbox TTS: installed and importable"
    else
        echo "❌ Chatterbox TTS: not importable"
    fi
    deactivate
else
    echo "❌ Chatterbox TTS: venv not found"
fi

echo ""
echo "===================================="
echo "✅ TTS Setup Complete!"
echo ""
echo "Installation paths:"
echo "  - Index TTS: $INDEX_TTS_DIR"
echo "  - Index TTS venv: $INDEX_TTS_DIR/.venv (managed by uv)"
echo "  - Chatterbox venv: $VENV_DIR"
echo ""
echo "Usage:"
echo "  Index TTS:    cd $INDEX_TTS_DIR && uv run <script>"
echo "  Chatterbox:   source $VENV_DIR/bin/activate"
echo ""
echo "Next steps:"
echo "  1. Test Index TTS:    cd $INDEX_TTS_DIR && uv run indextts/infer_v2.py"
echo "  2. Test Chatterbox:   source $VENV_DIR/bin/activate && python -c 'from chatterbox.tts import ChatterboxTTS'"
echo "  3. Run validation:    ./validate-tts.sh"
echo ""
