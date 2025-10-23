#!/bin/bash
#
# Download TTS Models for RunThru
# This downloads Index TTS and Chatterbox models
#

set -e

echo "🤖 Downloading TTS Models for RunThru"
echo "======================================"
echo ""

DATA_DIR="/home/corey/projects/RunThru/data/models"
mkdir -p "$DATA_DIR"

# =============================================================================
# 1. Install HuggingFace CLI (if not already installed)
# =============================================================================
echo "📦 Installing HuggingFace CLI..."
pip3 install -q huggingface-hub[cli]
echo "✅ HuggingFace CLI installed"
echo ""

# =============================================================================
# 2. Download Index TTS Models (~6GB)
# =============================================================================
echo "⬇️  Downloading Index TTS models (~6GB, may take 5-10 minutes)..."
echo "Target: $DATA_DIR/index-tts"
echo ""

if [ -d "$DATA_DIR/index-tts/config.yaml" ]; then
    echo "⚠️  Index TTS models already exist. Skipping download."
else
    huggingface-cli download IndexTeam/IndexTTS-2 --local-dir="$DATA_DIR/index-tts"
    echo "✅ Index TTS models downloaded"
fi

echo ""

# =============================================================================
# 3. Install Chatterbox TTS
# =============================================================================
echo "📦 Installing Chatterbox TTS..."
pip3 install -q chatterbox-tts
echo "✅ Chatterbox TTS installed"
echo ""

# =============================================================================
# 4. Install PyTorch with CUDA support
# =============================================================================
echo "📦 Installing PyTorch with CUDA 12.1..."
pip3 install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
echo "✅ PyTorch installed"
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
echo "Model locations:"
echo "  - Index TTS: $DATA_DIR/index-tts"
echo "  - Chatterbox: (installed via pip)"
echo ""
echo "Next step:"
echo "  Run validation: ./validate-tts.sh"
