#!/bin/bash
#
# Helper script to run commands in the TTS virtual environment
# Usage: ./run-in-venv.sh <command> [args...]
#

VENV_DIR="/home/corey/projects/RunThru-backend/tts-service/venv"

if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Virtual environment not found: $VENV_DIR"
    echo ""
    echo "Run this first:"
    echo "  ./download-tts-models.sh"
    exit 1
fi

# Activate venv and run command
source "$VENV_DIR/bin/activate"
exec "$@"
