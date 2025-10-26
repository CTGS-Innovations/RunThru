#!/usr/bin/env python3
"""
Test different cfg_weight and exaggeration settings for zombie voice
Based on Chatterbox docs: expressive speech needs lower cfg_weight
"""

import os
import sys
import torchaudio as ta
from chatterbox import ChatterboxTTS

# Initialize Chatterbox
print("🧟 Testing cfg_weight Configurations for Zombie Voice")
print("=" * 60)
print()

device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Test directory
test_dir = "/tmp/zombie-cfg-test"
os.makedirs(test_dir, exist_ok=True)
print(f"📁 Output directory: {test_dir}")
print()

# Zombie voice reference audio
zombie_voice = "/home/corey/projects/RunThru-backend/tts-service/reference-voices/zombie-grumbly.wav"

# Test configurations
# Format: (name, exaggeration, cfg_weight)
configs = [
    ("current-settings", 0.5, 0.5),       # Current default
    ("docs-expressive", 0.7, 0.3),        # Docs recommendation
    ("high-exag-low-cfg", 0.8, 0.2),      # Very expressive
    ("low-exag-high-cfg", 0.3, 0.7),      # Calm speech
    ("zero-cfg", 0.5, 0.0),               # No style transfer
]

# Test texts (the corrupted zombie lines)
test_texts = {
    "line-269": "Braiiiins.",
    "line-287": "Agreed.",
}

results = []

for line_name, text in test_texts.items():
    print(f"📝 Testing: {line_name} - \"{text}\"")
    print()

    for name, exaggeration, cfg_weight in configs:
        print(f"  🎙️  {name} (exag={exaggeration}, cfg={cfg_weight})...", end=" ")

        try:
            # Generate with Chatterbox
            wav = model.generate(
                text,
                audio_prompt_path=zombie_voice,
                exaggeration=exaggeration,
                cfg_weight=cfg_weight
            )

            # Save to file
            output_path = f"{test_dir}/{line_name}-{name}.wav"
            ta.save(output_path, wav, model.sr)

            # Check file size and duration
            file_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            duration = wav.shape[1] / model.sr

            print(f"✅ {duration:.2f}s ({file_size:.2f}MB)")

            results.append({
                'line': line_name,
                'text': text,
                'config': name,
                'exaggeration': exaggeration,
                'cfg_weight': cfg_weight,
                'duration': duration,
                'file_size_mb': file_size,
                'path': output_path
            })

        except Exception as e:
            print(f"❌ FAILED: {e}")

    print()

# Summary
print()
print("=" * 60)
print("📊 RESULTS SUMMARY")
print("=" * 60)
print()

for line_name, text in test_texts.items():
    print(f"{line_name} - \"{text}\":")
    print(f"  {'Config':<25} {'Duration':>10} {'Size':>10} {'Status'}")
    print(f"  {'-'*25} {'-'*10} {'-'*10} {'-'*20}")

    line_results = [r for r in results if r['line'] == line_name]
    for r in line_results:
        status = "✅ OK" if r['duration'] < 5.0 else f"⚠️  LONG"
        print(f"  {r['config']:<25} {r['duration']:>8.2f}s {r['file_size_mb']:>8.2f}MB {status}")

    print()

print(f"🎧 All files saved to: {test_dir}")
print()

# Find best configuration (shortest duration that's still reasonable)
print("🏆 RECOMMENDATIONS:")
print()

for line_name, text in test_texts.items():
    line_results = [r for r in results if r['line'] == line_name and r['duration'] < 5.0]
    if line_results:
        # Sort by duration (shortest first)
        line_results.sort(key=lambda x: x['duration'])
        best = line_results[0]
        print(f"{line_name}: Use \"{best['config']}\"")
        print(f"  exaggeration={best['exaggeration']}, cfg_weight={best['cfg_weight']}")
        print(f"  → {best['duration']:.2f}s (vs expected 0.5-2.0s for 1 word)")
        print()
