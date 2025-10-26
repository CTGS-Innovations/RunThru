#!/bin/bash
# Generate multiple variations of "brains" with zombie voice
# Test if normal spelling works better than "Braiiiins"

echo "🧟 Generating Zombie 'Brains' Variations"
echo "========================================"
echo ""

# Create test directory
TEST_DIR="/tmp/zombie-brains-test"
mkdir -p "$TEST_DIR"

echo "📁 Output directory: $TEST_DIR"
echo ""

# Generate 3 variations using the TTS service
# We'll call the TTS service directly with different emotion/intensity settings

for i in 1 2 3; do
    echo "🎙️  Generating variation $i..."

    # Call TTS service with zombie voice
    # Variation 1: Normal emotion
    # Variation 2: Higher intensity
    # Variation 3: Lower intensity

    INTENSITY="0.5"
    VALENCE="neutral"

    if [ $i -eq 2 ]; then
        INTENSITY="0.8"
        VALENCE="negative"
    elif [ $i -eq 3 ]; then
        INTENSITY="0.3"
        VALENCE="neutral"
    fi

    curl -X POST http://localhost:5000/synthesize \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"brains\",
            \"character\": \"zombie\",
            \"engine\": \"chatterbox\",
            \"voice_id\": \"/home/corey/projects/RunThru-backend/tts-service/reference_audio/zombie_grumbly.wav\",
            \"emotion\": {
                \"intensity\": $INTENSITY,
                \"valence\": \"$VALENCE\"
            }
        }" \
        --output "$TEST_DIR/brains-variation-$i.wav" \
        2>/dev/null

    if [ -f "$TEST_DIR/brains-variation-$i.wav" ]; then
        SIZE=$(du -h "$TEST_DIR/brains-variation-$i.wav" | cut -f1)
        echo "  ✅ Generated: $SIZE"
    else
        echo "  ❌ Failed"
    fi
done

echo ""
echo "📊 Results:"
ls -lh "$TEST_DIR"/*.wav 2>/dev/null | awk '{print "  " $9 " - " $5}'

echo ""
echo "🎧 Files saved to: $TEST_DIR"
echo ""
echo "To analyze durations:"
echo "  for f in $TEST_DIR/*.wav; do echo \"\$f:\"; ffprobe -i \"\$f\" -show_entries format=duration -v quiet -of csv=\"p=0\"; done"
