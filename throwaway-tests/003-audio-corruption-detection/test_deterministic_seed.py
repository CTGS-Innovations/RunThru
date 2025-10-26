#!/usr/bin/env python3
"""
Test if setting random seed makes Chatterbox TTS deterministic
Generate same text multiple times with fixed seed to check consistency
"""

import os
import torch
import torchaudio as ta
from chatterbox import ChatterboxTTS

print("🎲 Testing Deterministic Generation with Manual Seed")
print("=" * 70)
print()

# Initialize Chatterbox
device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Output directory
output_dir = "/home/corey/projects/RunThru-backend/backend/public/audio/test-deterministic-seed"
os.makedirs(output_dir, exist_ok=True)
print(f"📁 Output directory: {output_dir}")
print()

# Test configuration
CFG_WEIGHT = 0.7
EXAGGERATION = 0.5
TEST_TEXT = "Help!"
SEED = 42  # Fixed seed for reproducibility

print(f"Configuration:")
print(f"  Text: \"{TEST_TEXT}\"")
print(f"  Seed: {SEED}")
print(f"  exaggeration: {EXAGGERATION}")
print(f"  cfg_weight: {CFG_WEIGHT}")
print()

# Test voices
voices_dir = "/home/corey/projects/RunThru-backend/tts-service/reference-voices"
test_voices = {
    'zombie-grumbly': os.path.join(voices_dir, 'zombie-grumbly.wav'),
    'teen-female': os.path.join(voices_dir, 'teen-female.wav'),
    'adult-male': os.path.join(voices_dir, 'adult-male.wav'),
}

print("=" * 70)
print("TEST 1: Fixed Seed, Multiple Generations")
print("=" * 70)
print("Testing if same seed produces identical outputs")
print()

for voice_name, voice_path in test_voices.items():
    print(f"🎤 {voice_name.upper()}")
    print("-" * 70)

    durations = []
    checksums = []

    for i in range(1, 4):
        try:
            # Set seed before EACH generation
            torch.manual_seed(SEED)
            torch.cuda.manual_seed(SEED)
            torch.cuda.manual_seed_all(SEED)  # For multi-GPU

            # Generate audio
            wav = model.generate(
                TEST_TEXT,
                audio_prompt_path=voice_path,
                exaggeration=EXAGGERATION,
                cfg_weight=CFG_WEIGHT
            )

            # Save
            filename = f"{voice_name}-seeded-{i}.wav"
            output_path = os.path.join(output_dir, filename)
            ta.save(output_path, wav, model.sr)

            # Stats
            duration = wav.shape[1] / model.sr
            file_size = os.path.getsize(output_path) / (1024 * 1024)

            # Calculate checksum (hash of audio tensor)
            import hashlib
            wav_bytes = wav.cpu().numpy().tobytes()
            checksum = hashlib.md5(wav_bytes).hexdigest()[:8]

            durations.append(duration)
            checksums.append(checksum)

            print(f"  Generation {i}: {duration:.2f}s ({file_size:.2f}MB) - checksum: {checksum}")

        except Exception as e:
            print(f"  Generation {i}: ❌ FAILED - {e}")

    # Check if all outputs are IDENTICAL
    print()
    if len(checksums) == 3:
        if len(set(checksums)) == 1:
            print(f"  ✅ DETERMINISTIC - All 3 outputs are IDENTICAL (checksum: {checksums[0]})")
        else:
            print(f"  ⚠️  NON-DETERMINISTIC - Outputs differ:")
            for i, cs in enumerate(checksums, 1):
                print(f"      Generation {i}: {cs}")

            # Check duration consistency
            avg_duration = sum(durations) / len(durations)
            max_deviation = max(abs(d - avg_duration) for d in durations)
            consistency = (max_deviation / avg_duration * 100) if avg_duration > 0 else 0
            print(f"  Duration variation: {consistency:.1f}%")

    print()

print()
print("=" * 70)
print("TEST 2: Different Seeds, Different Outputs")
print("=" * 70)
print("Testing if different seeds produce different outputs")
print()

voice_name = 'zombie-grumbly'
voice_path = test_voices[voice_name]

print(f"🎤 {voice_name.upper()}")
print("-" * 70)

seeds = [42, 123, 999]
seed_checksums = []

for seed in seeds:
    try:
        # Set different seed
        torch.manual_seed(seed)
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

        # Generate audio
        wav = model.generate(
            TEST_TEXT,
            audio_prompt_path=voice_path,
            exaggeration=EXAGGERATION,
            cfg_weight=CFG_WEIGHT
        )

        # Save
        filename = f"{voice_name}-seed-{seed}.wav"
        output_path = os.path.join(output_dir, filename)
        ta.save(output_path, wav, model.sr)

        # Stats
        duration = wav.shape[1] / model.sr

        # Calculate checksum
        import hashlib
        wav_bytes = wav.cpu().numpy().tobytes()
        checksum = hashlib.md5(wav_bytes).hexdigest()[:8]

        seed_checksums.append((seed, checksum))

        print(f"  Seed {seed:3d}: {duration:.2f}s - checksum: {checksum}")

    except Exception as e:
        print(f"  Seed {seed:3d}: ❌ FAILED - {e}")

print()
if len(seed_checksums) == 3:
    if len(set(cs for _, cs in seed_checksums)) == 3:
        print(f"  ✅ WORKING - Different seeds produce different outputs")
    else:
        print(f"  ⚠️  Seeds don't affect output - all checksums identical")

print()
print("=" * 70)
print("🎯 CONCLUSIONS")
print("=" * 70)
print()

print("🎧 Files saved to: {output_dir}")
print(f"   Access via: http://localhost:4000/audio/test-deterministic-seed/")
print()
print("If deterministic:")
print("  ✅ Same seed = identical outputs → We can ensure consistency!")
print("  ✅ Set seed before each voice switch to get predictable results")
print("  ✅ Can regenerate exact same audio by using same seed")
print()
print("If non-deterministic:")
print("  ⚠️  Seed doesn't help → Model has other sources of randomness")
print("  ⚠️  May need to accept 10-20% variation in output")
print("  ⚠️  cfg_weight=0.7 still helps prevent corruption")
