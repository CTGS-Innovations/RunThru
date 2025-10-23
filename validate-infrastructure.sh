#!/bin/bash
#
# RunThru Infrastructure Validation Script
# Run this BEFORE scaffolding to validate all prerequisites
#

set -e  # Exit on error

echo "🎭 RunThru Infrastructure Validation"
echo "===================================="
echo ""

# Track failures
FAILED=0

# Helper functions
check_pass() {
    echo "✅ $1"
}

check_fail() {
    echo "❌ $1"
    FAILED=1
}

check_warn() {
    echo "⚠️  $1"
}

# =============================================================================
# 1. Git Worktrees
# =============================================================================
echo "📁 Checking Git Worktrees..."

if [ -d "/home/corey/projects/RunThru" ] && [ -d "/home/corey/projects/RunThru-frontend" ] && [ -d "/home/corey/projects/RunThru-backend" ]; then
    check_pass "All three worktrees exist"
else
    check_fail "Missing worktree directories"
fi

if [ -L "/home/corey/projects/RunThru-frontend/TASKS.md" ] && [ -L "/home/corey/projects/RunThru-backend/TASKS.md" ]; then
    check_pass "TASKS.md symlinks exist"
else
    check_fail "TASKS.md symlinks missing"
fi

echo ""

# =============================================================================
# 2. GPU & CUDA
# =============================================================================
echo "🎮 Checking GPU & CUDA..."

if command -v nvidia-smi &> /dev/null; then
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n1)
    GPU_MEMORY=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader | head -n1)
    check_pass "GPU detected: $GPU_NAME ($GPU_MEMORY)"
else
    check_fail "nvidia-smi not found - GPU may not be available"
fi

echo ""

# =============================================================================
# 3. Development Tools
# =============================================================================
echo "🛠️  Checking Development Tools..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        check_pass "Node.js $NODE_VERSION (>= 20)"
    else
        check_warn "Node.js $NODE_VERSION (recommend >= 20)"
    fi
else
    check_fail "Node.js not found"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm $NPM_VERSION"
else
    check_fail "npm not found"
fi

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    check_pass "$PYTHON_VERSION"
else
    check_fail "Python 3 not found"
fi

# pip
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version | awk '{print $2}')
    check_pass "pip $PIP_VERSION"
else
    check_fail "pip3 not found"
fi

echo ""

# =============================================================================
# 4. Docker
# =============================================================================
echo "🐳 Checking Docker..."

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    check_pass "Docker $DOCKER_VERSION"

    # Check if Docker daemon is running
    if docker ps &> /dev/null; then
        check_pass "Docker daemon is running"
    else
        check_warn "Docker daemon may not be running"
    fi
else
    check_warn "Docker not found (optional for development, required for deployment)"
fi

# Check nvidia-docker
if docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi &> /dev/null 2>&1; then
    check_pass "nvidia-docker runtime works"
else
    check_warn "nvidia-docker runtime not available (required for TTS service in Docker)"
fi

echo ""

# =============================================================================
# 5. Data Directory Structure
# =============================================================================
echo "📦 Checking Data Directories..."

DATA_DIR="/home/corey/projects/RunThru/data"

if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory structure..."
    mkdir -p "$DATA_DIR"/{models,scripts,audio-cache,database}
fi

if [ -d "$DATA_DIR" ]; then
    check_pass "Data directory exists: $DATA_DIR"

    # Check disk space (need ~20GB for models + cache)
    AVAILABLE_GB=$(df -BG "$DATA_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_GB" -ge 20 ]; then
        check_pass "Disk space: ${AVAILABLE_GB}GB available (>= 20GB needed)"
    else
        check_warn "Disk space: ${AVAILABLE_GB}GB available (recommend >= 20GB)"
    fi

    # Check write permissions
    if touch "$DATA_DIR/test.txt" 2>/dev/null; then
        rm "$DATA_DIR/test.txt"
        check_pass "Write permissions OK"
    else
        check_fail "Cannot write to data directory"
    fi
else
    check_fail "Cannot create data directory"
fi

echo ""

# =============================================================================
# 6. TTS Models (Optional - download separately)
# =============================================================================
echo "🤖 Checking TTS Models..."

INDEX_TTS_DIR="$DATA_DIR/models/index-tts"
if [ -d "$INDEX_TTS_DIR" ] && [ -f "$INDEX_TTS_DIR/config.yaml" ]; then
    check_pass "Index TTS models found"
else
    check_warn "Index TTS models not found (run download script to get them)"
    echo "   To download: huggingface-cli download IndexTeam/IndexTTS-2 --local-dir=$INDEX_TTS_DIR"
fi

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "===================================="
if [ $FAILED -eq 0 ]; then
    echo "✅ All critical checks passed!"
    echo ""
    echo "Next steps:"
    echo "1. Download TTS models (if not already done):"
    echo "   ./download-tts-models.sh"
    echo ""
    echo "2. Run TTS validation:"
    echo "   ./validate-tts.sh"
    echo ""
    echo "3. Begin scaffolding:"
    echo "   Tell Claude to proceed with scaffolding"
else
    echo "❌ Some checks failed. Please fix issues before proceeding."
    exit 1
fi
