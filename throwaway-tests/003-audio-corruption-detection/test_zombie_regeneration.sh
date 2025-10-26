#!/bin/bash
# Test zombie audio regeneration - is corruption random or consistent?

SCRIPT_ID="6f2c2aa7-5198-47e1-94ea-8e2663bb388d"
SESSION_ID="0edca75a-c108-45a8-9f56-25ce1617b62b"
AUDIO_DIR="/home/corey/projects/RunThru-backend/backend/public/audio/$SCRIPT_ID/dialogue"

echo "🧟 Testing Zombie Audio Regeneration"
echo "====================================="
echo ""

FILES=("zombie-line-2.wav" "zombie-line-4.wav")

# Show current state
echo "📊 Current file sizes:"
for file in "${FILES[@]}"; do
    if [ -f "$AUDIO_DIR/$file" ]; then
        SIZE=$(du -h "$AUDIO_DIR/$file" | cut -f1)
        echo "  $file: $SIZE"
    else
        echo "  $file: NOT FOUND"
    fi
done
echo ""

# Backup
BACKUP_DIR="/tmp/zombie-test-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "💾 Backing up to: $BACKUP_DIR"
for file in "${FILES[@]}"; do
    if [ -f "$AUDIO_DIR/$file" ]; then
        cp "$AUDIO_DIR/$file" "$BACKUP_DIR/"
    fi
done
echo ""

# Delete
echo "🗑️  Deleting files..."
for file in "${FILES[@]}"; do
    rm -f "$AUDIO_DIR/$file"
    echo "  ✓ Deleted $file"
done
echo ""

# Regenerate
echo "🎙️  Regenerating via API..."
echo "  (This will regenerate only the 2 deleted files, others use cache)"
echo ""

curl -X POST "http://localhost:4000/api/sessions/$SESSION_ID/generate-dialogue-audio" \
    -H "Content-Type: application/json" 2>/dev/null

echo ""
echo ""

# Show new state
echo "📊 New file sizes:"
for file in "${FILES[@]}"; do
    if [ -f "$AUDIO_DIR/$file" ]; then
        SIZE=$(du -h "$AUDIO_DIR/$file" | cut -f1)
        echo "  $file: $SIZE"
    else
        echo "  $file: FAILED TO GENERATE"
    fi
done
echo ""

echo "✅ Done! Backup saved to: $BACKUP_DIR"
echo ""
echo "Run analysis to check if corruption reoccurred:"
echo "  cd /home/corey/projects/RunThru-backend/tts-service"
echo "  source venv/bin/activate"
echo "  python3 ../throwaway-tests/003-audio-corruption-detection/analyze_audio_enhanced.py | grep -A5 'zombie-line-[24]'"
