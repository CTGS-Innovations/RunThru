#!/usr/bin/env python3
"""
Test cfg_weight=0.7 vs 0.5 across ALL reference voices
Sample dialogue for each voice type to validate the configuration works universally
"""

import os
import torchaudio as ta
from chatterbox import ChatterboxTTS

print("🎭 Testing cfg_weight Across All Reference Voices")
print("=" * 70)
print()

# Initialize Chatterbox
device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Output directory
output_dir = "/home/corey/projects/RunThru-backend/backend/public/audio/test-all-voices-cfg"
os.makedirs(output_dir, exist_ok=True)
print(f"📁 Output directory: {output_dir}")
print()

# All reference voices
voices_dir = "/home/corey/projects/RunThru-backend/tts-service/reference-voices"
voices = {
    'adult-male': os.path.join(voices_dir, 'adult-male.wav'),
    'cheerful-female': os.path.join(voices_dir, 'cheerful-female.wav'),
    'mysterious-narrator': os.path.join(voices_dir, 'mysterious-narrator.wav'),
    'pirate-voice': os.path.join(voices_dir, 'pirate-voice.wav'),
    'teen-female': os.path.join(voices_dir, 'teen-female.wav'),
    'teen-male': os.path.join(voices_dir, 'teen-male.wav'),
    'wise-elder': os.path.join(voices_dir, 'wise-elder.wav'),
    'zombie-grumbly': os.path.join(voices_dir, 'zombie-grumbly.wav'),
}

# Test dialogue samples (variety of lengths)
test_samples = [
    ("short", "Help!", 1),
    ("medium", "What are you doing here?", 5),
    ("long", "I never thought I'd see the day when something like this would actually happen to us.", 17),
]

# Test configurations
configs = [
    ("cfg-0.5", 0.5),  # Current default
    ("cfg-0.7", 0.7),  # Proposed new default
]

print(f"Testing {len(voices)} voices × {len(test_samples)} samples × {len(configs)} configs = {len(voices) * len(test_samples) * len(configs)} total files")
print()

results = []

for voice_name, voice_path in sorted(voices.items()):
    print(f"🎤 {voice_name.upper()}")
    print("-" * 70)

    if not os.path.exists(voice_path):
        print(f"  ⚠️  Voice file not found: {voice_path}")
        print()
        continue

    for sample_type, text, word_count in test_samples:
        print(f"  {sample_type.title()}: \"{text}\" ({word_count} words)")

        for config_name, cfg_weight in configs:
            try:
                # Generate audio
                wav = model.generate(
                    text,
                    audio_prompt_path=voice_path,
                    exaggeration=0.5,
                    cfg_weight=cfg_weight
                )

                # Save
                filename = f"{voice_name}-{sample_type}-{config_name}.wav"
                output_path = os.path.join(output_dir, filename)
                ta.save(output_path, wav, model.sr)

                # Stats
                duration = wav.shape[1] / model.sr
                file_size = os.path.getsize(output_path) / (1024 * 1024)

                # Expected duration (TTS: 1.5-3 words/sec)
                expected_min = word_count / 3.0
                expected_max = word_count / 1.5
                duration_ratio = duration / expected_max if expected_max > 0 else 1.0

                status = "✅" if duration_ratio <= 2.0 else "⚠️"

                print(f"    {config_name}: {status} {duration:.2f}s ({file_size:.2f}MB)")

                results.append({
                    'voice': voice_name,
                    'sample_type': sample_type,
                    'text': text,
                    'word_count': word_count,
                    'cfg_weight': cfg_weight,
                    'duration': duration,
                    'file_size_mb': file_size,
                    'duration_ratio': duration_ratio,
                    'filename': filename
                })

            except Exception as e:
                print(f"    {config_name}: ❌ FAILED - {e}")

        print()

    print()

print("=" * 70)
print("📊 COMPARISON: cfg=0.5 vs cfg=0.7")
print("=" * 70)
print()

# Compare cfg=0.5 vs cfg=0.7
for voice_name in sorted(voices.keys()):
    voice_results = [r for r in results if r['voice'] == voice_name]
    if not voice_results:
        continue

    print(f"{voice_name.upper()}:")

    for sample_type in ['short', 'medium', 'long']:
        sample_results = [r for r in voice_results if r['sample_type'] == sample_type]
        if len(sample_results) != 2:
            continue

        cfg_05 = next((r for r in sample_results if r['cfg_weight'] == 0.5), None)
        cfg_07 = next((r for r in sample_results if r['cfg_weight'] == 0.7), None)

        if cfg_05 and cfg_07:
            diff = cfg_07['duration'] - cfg_05['duration']
            diff_pct = (diff / cfg_05['duration']) * 100 if cfg_05['duration'] > 0 else 0

            # Check if either is corrupted
            status_05 = "✅" if cfg_05['duration_ratio'] <= 2.0 else "⚠️ CORRUPT"
            status_07 = "✅" if cfg_07['duration_ratio'] <= 2.0 else "⚠️ CORRUPT"

            print(f"  {sample_type.title():8s}: cfg=0.5 {cfg_05['duration']:.2f}s {status_05}  |  cfg=0.7 {cfg_07['duration']:.2f}s {status_07}  |  diff: {diff:+.2f}s ({diff_pct:+.1f}%)")

    print()

# Summary
print("=" * 70)
print("🎯 VERDICT")
print("=" * 70)
print()

corrupted_05 = [r for r in results if r['cfg_weight'] == 0.5 and r['duration_ratio'] > 2.0]
corrupted_07 = [r for r in results if r['cfg_weight'] == 0.7 and r['duration_ratio'] > 2.0]

print(f"cfg_weight=0.5 (current): {len(corrupted_05)} corrupted files out of {len([r for r in results if r['cfg_weight'] == 0.5])}")
print(f"cfg_weight=0.7 (proposed): {len(corrupted_07)} corrupted files out of {len([r for r in results if r['cfg_weight'] == 0.7])}")
print()

if len(corrupted_07) == 0 and len(corrupted_05) > 0:
    print("✅ RECOMMENDATION: Use cfg_weight=0.7 as default (fixes corruption)")
elif len(corrupted_07) == 0 and len(corrupted_05) == 0:
    print("✅ RECOMMENDATION: Both work, cfg_weight=0.7 is safe to use")
elif len(corrupted_07) > len(corrupted_05):
    print("⚠️  WARNING: cfg_weight=0.7 introduces MORE corruption")
else:
    print("⚠️  MIXED RESULTS: Review individual files")

print()
print(f"🎧 Files saved to: {output_dir}")
print(f"   Access via: http://localhost:4000/audio/test-all-voices-cfg/")
