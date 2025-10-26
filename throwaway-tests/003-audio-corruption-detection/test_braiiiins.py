#!/usr/bin/env python3
"""
Test ONE dialogue: "Braiiiins." with different cfg_weight settings
Focus on finding what works for this specific phonetic text
"""

import os
import torchaudio as ta
from chatterbox import ChatterboxTTS

print("🧟 Testing 'Braiiiins.' with Different cfg_weight Settings")
print("=" * 60)
print()

# The EXACT dialogue text from the script
DIALOGUE_TEXT = "Braiiiins."
print(f"Testing text: \"{DIALOGUE_TEXT}\"")
print()

# Initialize Chatterbox
device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Output directory (in backend public for easy access)
output_dir = "/home/corey/projects/RunThru-backend/backend/public/audio/test-zombie-cfg"
os.makedirs(output_dir, exist_ok=True)
print(f"📁 Output directory: {output_dir}")
print()

# Zombie voice reference
zombie_voice = "/home/corey/projects/RunThru-backend/tts-service/reference-voices/zombie-grumbly.wav"

# Test different cfg_weight values (keeping exaggeration constant)
print("Testing different cfg_weight values:")
print("  (keeping exaggeration=0.5)")
print()

test_configs = [
    ("cfg-0.0", 0.5, 0.0),
    ("cfg-0.2", 0.5, 0.2),
    ("cfg-0.3", 0.5, 0.3),
    ("cfg-0.5", 0.5, 0.5),  # Current default
    ("cfg-0.7", 0.5, 0.7),
]

results = []

for name, exaggeration, cfg_weight in test_configs:
    print(f"  Testing {name} (exag={exaggeration}, cfg={cfg_weight})...", end=" ")

    try:
        # Generate audio
        wav = model.generate(
            DIALOGUE_TEXT,
            audio_prompt_path=zombie_voice,
            exaggeration=exaggeration,
            cfg_weight=cfg_weight
        )

        # Save to file
        output_path = f"{output_dir}/braiiiins-{name}.wav"
        ta.save(output_path, wav, model.sr)

        # Get stats
        duration = wav.shape[1] / model.sr
        file_size = os.path.getsize(output_path) / (1024 * 1024)

        status = "✅ OK" if duration < 5.0 else "⚠️  LONG"
        print(f"{status} ({duration:.2f}s, {file_size:.2f}MB)")

        results.append({
            'name': name,
            'exaggeration': exaggeration,
            'cfg_weight': cfg_weight,
            'duration': duration,
            'file_size_mb': file_size,
            'path': output_path
        })

    except Exception as e:
        print(f"❌ FAILED: {e}")

print()
print("=" * 60)
print("📊 RESULTS")
print("=" * 60)
print()
print(f"Text: \"{DIALOGUE_TEXT}\"")
print(f"Expected duration: 0.5-2.0s (for 1 word)")
print()
print(f"{'Config':<15} {'cfg_weight':<12} {'Duration':<12} {'Size':<12} {'Status'}")
print("-" * 60)

for r in results:
    status = "✅ OK" if r['duration'] < 5.0 else "⚠️  TOO LONG"
    print(f"{r['name']:<15} {r['cfg_weight']:<12} {r['duration']:>6.2f}s      {r['file_size_mb']:>6.2f}MB    {status}")

print()
print(f"🎧 Files saved to: {output_dir}")
print()
print("Access via backend server:")
for r in results:
    filename = os.path.basename(r['path'])
    print(f"  http://localhost:4000/audio/test-zombie-cfg/{filename}")
