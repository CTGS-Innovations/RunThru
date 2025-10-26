#!/bin/bash
# Test different cfg_weight and exaggeration settings for zombie voice
# Based on Chatterbox docs: expressive speech needs lower cfg_weight

echo "🧟 Testing cfg_weight Configurations for Zombie Voice"
echo "====================================================="
echo ""

# Create test directory
TEST_DIR="/tmp/zombie-cfg-test"
mkdir -p "$TEST_DIR"

echo "📁 Output directory: $TEST_DIR"
echo ""

# Reference audio (zombie voice)
ZOMBIE_VOICE="/home/corey/projects/RunThru-backend/tts-service/reference_audio/zombie_grumbly.wav"

# Test configurations
# Format: "name|exaggeration|cfg_weight"
CONFIGS=(
    "current-settings|0.5|0.5"          # Current default
    "docs-expressive|0.7|0.3"           # Docs recommendation for expressive
    "high-exag-low-cfg|0.8|0.2"         # Even more expressive
    "low-exag-high-cfg|0.3|0.7"         # Calm speech
    "zero-cfg|0.5|0.0"                  # No style transfer (docs mention this)
)

# Test texts (the corrupted zombie lines)
declare -A TEST_TEXTS
TEST_TEXTS["line-269"]="Braiiiins."
TEST_TEXTS["line-287"]="Agreed."

for line_name in "${!TEST_TEXTS[@]}"; do
    text="${TEST_TEXTS[$line_name]}"

    echo "📝 Testing: $line_name - \"$text\""
    echo ""

    for config in "${CONFIGS[@]}"; do
        IFS='|' read -r name exag cfg <<< "$config"

        echo "  🎙️  $name (exag=$exag, cfg=$cfg)..."

        curl -X POST http://localhost:5000/synthesize \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"$text\",
                \"character\": \"zombie\",
                \"engine\": \"chatterbox\",
                \"voice_id\": \"$ZOMBIE_VOICE\",
                \"emotion\": {
                    \"intensity\": $exag,
                    \"valence\": \"neutral\"
                }
            }" \
            --output "$TEST_DIR/${line_name}-${name}.wav" \
            2>/dev/null

        if [ -f "$TEST_DIR/${line_name}-${name}.wav" ]; then
            SIZE=$(du -h "$TEST_DIR/${line_name}-${name}.wav" | cut -f1)
            echo "      ✅ Generated: $SIZE"
        else
            echo "      ❌ Failed"
        fi
    done

    echo ""
done

echo "📊 Results Summary:"
echo "=================="
echo ""

for line_name in "${!TEST_TEXTS[@]}"; do
    echo "$line_name - \"${TEST_TEXTS[$line_name]}\":"
    ls -lh "$TEST_DIR/${line_name}"-*.wav 2>/dev/null | awk '{print "  " $9 " - " $5}'
    echo ""
done

echo "🎧 Files saved to: $TEST_DIR"
echo ""
echo "Analyze durations with Python:"
cat << 'EOF'
python3 << 'PYTHON'
from scipy.io import wavfile
import os
import glob

test_dir = "/tmp/zombie-cfg-test"
for wav_file in sorted(glob.glob(f"{test_dir}/*.wav")):
    framerate, audio = wavfile.read(wav_file)
    duration = len(audio) / float(framerate)
    size_mb = os.path.getsize(wav_file) / (1024 * 1024)

    filename = os.path.basename(wav_file)
    status = "✅ OK" if duration < 5.0 else f"⚠️  LONG ({duration:.1f}s)"

    print(f"{filename:40s} {duration:5.2f}s {size_mb:5.2f}MB {status}")
PYTHON
EOF
