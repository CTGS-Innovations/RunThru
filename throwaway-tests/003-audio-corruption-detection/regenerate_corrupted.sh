#!/bin/bash
# Regenerate corrupted zombie audio files
# Deletes corrupted files and re-runs generation (uses cache for unchanged files)

SCRIPT_ID="6f2c2aa7-5198-47e1-94ea-8e2663bb388d"
SESSION_ID="0edca75a-c108-45a8-9f56-25ce1617b62b"
AUDIO_DIR="/home/corey/projects/RunThru-backend/backend/public/audio/$SCRIPT_ID/dialogue"

echo "🔧 Regenerating Corrupted Zombie Audio Files"
echo "=============================================="
echo ""

# List of corrupted files
CORRUPTED_FILES=(
    "zombie-line-2.wav"
    "zombie-1-line-269.wav"
    "zombie-1-line-287.wav"
)

echo "📋 Files to regenerate:"
for file in "${CORRUPTED_FILES[@]}"; do
    if [ -f "$AUDIO_DIR/$file" ]; then
        SIZE=$(du -h "$AUDIO_DIR/$file" | cut -f1)
        DURATION=$(ffprobe -i "$AUDIO_DIR/$file" -show_entries format=duration -v quiet -of csv="p=0" 2>/dev/null || echo "unknown")
        echo "  - $file ($SIZE, ${DURATION}s)"
    else
        echo "  - $file (not found)"
    fi
done
echo ""

# Backup corrupted files (in case we need to investigate)
BACKUP_DIR="/tmp/runthru-corrupted-audio-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "💾 Backing up corrupted files to: $BACKUP_DIR"
for file in "${CORRUPTED_FILES[@]}"; do
    if [ -f "$AUDIO_DIR/$file" ]; then
        cp "$AUDIO_DIR/$file" "$BACKUP_DIR/"
        echo "  ✓ Backed up $file"
    fi
done
echo ""

# Delete corrupted files
echo "🗑️  Deleting corrupted files..."
for file in "${CORRUPTED_FILES[@]}"; do
    if [ -f "$AUDIO_DIR/$file" ]; then
        rm "$AUDIO_DIR/$file"
        echo "  ✓ Deleted $file"
    fi
done
echo ""

# Regenerate by calling the API endpoint
# The service will only regenerate missing files (cached files are reused)
echo "🎙️  Calling TTS service to regenerate missing files..."
echo "  Endpoint: POST /api/sessions/$SESSION_ID/generate-dialogue-audio"
echo ""

curl -X POST "http://localhost:4000/api/sessions/$SESSION_ID/generate-dialogue-audio" \
    -H "Content-Type: application/json" \
    -s | jq -r '
        if .success then
            "✅ Generation complete!\n" +
            "  Total files: \(.generated)\n" +
            "  Time: \((.totalTime / 1000) | floor)s\n\n" +
            "📄 Regenerated files:\n" +
            (
                .files
                | map(select(.audioUrl | contains("zombie-line-2") or contains("zombie-1-line-269") or contains("zombie-1-line-287")))
                | .[]
                | "  - \(.audioUrl | split("/")[-1]): \((.generationTime / 1000) | floor)s"
            )
        else
            "❌ Generation failed: \(.error // "Unknown error")"
        end
    '

echo ""
echo "✅ Done! Re-run analysis to verify:"
echo "   cd /home/corey/projects/RunThru-backend/tts-service"
echo "   source venv/bin/activate"
echo "   python3 /home/corey/projects/RunThru/throwaway-tests/003-audio-corruption-detection/analyze_audio_enhanced.py"
