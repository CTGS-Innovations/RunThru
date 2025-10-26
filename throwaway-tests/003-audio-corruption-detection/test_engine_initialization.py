#!/usr/bin/env python3
"""
Test if TTS engine has initialization/state issues
Generate same text multiple times to check for consistency
"""

import os
import torchaudio as ta
from chatterbox import ChatterboxTTS

print("🔬 Testing TTS Engine Initialization & State")
print("=" * 70)
print()

# Initialize Chatterbox
device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Output directory
output_dir = "/home/corey/projects/RunThru-backend/backend/public/audio/test-engine-state"
os.makedirs(output_dir, exist_ok=True)
print(f"📁 Output directory: {output_dir}")
print()

# Test configuration
CFG_WEIGHT = 0.7
EXAGGERATION = 0.5
TEST_TEXT = "Help!"

print(f"Configuration: exaggeration={EXAGGERATION}, cfg_weight={CFG_WEIGHT}")
print(f"Test text: \"{TEST_TEXT}\"")
print()

# Test voices
voices_dir = "/home/corey/projects/RunThru-backend/tts-service/reference-voices"
test_voices = {
    'zombie-grumbly': os.path.join(voices_dir, 'zombie-grumbly.wav'),
    'teen-female': os.path.join(voices_dir, 'teen-female.wav'),
    'adult-male': os.path.join(voices_dir, 'adult-male.wav'),
}

print("=" * 70)
print("TEST 1: Same Voice, Multiple Generations")
print("=" * 70)
print("Testing if consecutive generations with same voice are consistent")
print()

for voice_name, voice_path in test_voices.items():
    print(f"🎤 {voice_name.upper()}")
    print("-" * 70)

    durations = []

    for i in range(1, 4):
        try:
            # Generate audio
            wav = model.generate(
                TEST_TEXT,
                audio_prompt_path=voice_path,
                exaggeration=EXAGGERATION,
                cfg_weight=CFG_WEIGHT
            )

            # Save
            filename = f"{voice_name}-help-{i}.wav"
            output_path = os.path.join(output_dir, filename)
            ta.save(output_path, wav, model.sr)

            # Stats
            duration = wav.shape[1] / model.sr
            file_size = os.path.getsize(output_path) / (1024 * 1024)
            durations.append(duration)

            print(f"  Generation {i}: {duration:.2f}s ({file_size:.2f}MB)")

        except Exception as e:
            print(f"  Generation {i}: ❌ FAILED - {e}")

    # Check consistency
    if len(durations) == 3:
        avg_duration = sum(durations) / len(durations)
        max_deviation = max(abs(d - avg_duration) for d in durations)
        consistency = (max_deviation / avg_duration * 100) if avg_duration > 0 else 0

        print()
        print(f"  Average duration: {avg_duration:.2f}s")
        print(f"  Max deviation: {max_deviation:.2f}s ({consistency:.1f}%)")

        if consistency < 10:
            print(f"  ✅ CONSISTENT - variations within 10%")
        elif consistency < 25:
            print(f"  ⚠️  SOMEWHAT VARIABLE - variations 10-25%")
        else:
            print(f"  🚨 HIGHLY VARIABLE - variations >25%")

    print()

print()
print("=" * 70)
print("TEST 2: Voice Switching")
print("=" * 70)
print("Testing if switching between voices causes state pollution")
print()

# Generate in a pattern: Voice A → Voice B → Voice A → Voice C → Voice A
sequence = [
    ('zombie-grumbly', 'zombie-1'),
    ('teen-female', 'teen-1'),
    ('zombie-grumbly', 'zombie-2'),  # Same as first, should match zombie-1
    ('adult-male', 'adult-1'),
    ('zombie-grumbly', 'zombie-3'),  # Same as first, should match zombie-1
]

switch_results = []

for voice_name, label in sequence:
    voice_path = test_voices[voice_name]

    print(f"  {label:12s} ({voice_name})", end=" → ")

    try:
        wav = model.generate(
            TEST_TEXT,
            audio_prompt_path=voice_path,
            exaggeration=EXAGGERATION,
            cfg_weight=CFG_WEIGHT
        )

        filename = f"switch-{label}.wav"
        output_path = os.path.join(output_dir, filename)
        ta.save(output_path, wav, model.sr)

        duration = wav.shape[1] / model.sr
        file_size = os.path.getsize(output_path) / (1024 * 1024)

        print(f"{duration:.2f}s ({file_size:.2f}MB)")

        switch_results.append({
            'voice': voice_name,
            'label': label,
            'duration': duration,
            'filename': filename
        })

    except Exception as e:
        print(f"❌ FAILED - {e}")

print()

# Compare zombie-grumbly results (should be similar if no state pollution)
zombie_results = [r for r in switch_results if r['voice'] == 'zombie-grumbly']
if len(zombie_results) == 3:
    print("Zombie voice consistency check:")
    print(f"  zombie-1 (first):  {zombie_results[0]['duration']:.2f}s")
    print(f"  zombie-2 (after teen-female): {zombie_results[1]['duration']:.2f}s")
    print(f"  zombie-3 (after adult-male):  {zombie_results[2]['duration']:.2f}s")

    durations = [r['duration'] for r in zombie_results]
    avg = sum(durations) / len(durations)
    max_dev = max(abs(d - avg) for d in durations)
    consistency = (max_dev / avg * 100) if avg > 0 else 0

    print()
    if consistency < 10:
        print(f"  ✅ NO STATE POLLUTION - zombie results consistent ({consistency:.1f}% variation)")
    else:
        print(f"  ⚠️  POSSIBLE STATE POLLUTION - zombie results vary by {consistency:.1f}%")

print()
print("=" * 70)
print("🎯 CONCLUSIONS")
print("=" * 70)
print()

print("🎧 Files saved to: {output_dir}")
print(f"   Access via: http://localhost:4000/audio/test-engine-state/")
print()
print("Listen and compare:")
print("  1. Within same voice (help-1 vs help-2 vs help-3) - are they identical?")
print("  2. Zombie voice across switches - does quality degrade?")
print("  3. First generation vs later ones - is first one different?")
