#!/usr/bin/env python3
"""
Test if padding short dialogue with leading periods improves audio quality
Testing "Help!" vs ".Help!" vs "..Help!" across all voices with cfg_weight=0.7
"""

import os
import torchaudio as ta
from chatterbox import ChatterboxTTS

print("🔬 Testing Short Dialogue Padding with cfg_weight=0.7")
print("=" * 70)
print()

# Initialize Chatterbox
device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Output directory
output_dir = "/home/corey/projects/RunThru-backend/backend/public/audio/test-short-padding-cfg7"
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

# Test variations of "Help!"
test_texts = [
    ("no-padding", "Help!"),
    ("one-period", ".Help!"),
    ("two-periods", "..Help!"),
]

# Fixed config
CFG_WEIGHT = 0.7
EXAGGERATION = 0.5

print(f"Configuration: exaggeration={EXAGGERATION}, cfg_weight={CFG_WEIGHT}")
print(f"Testing {len(voices)} voices × {len(test_texts)} variations = {len(voices) * len(test_texts)} files")
print()

results = []

for voice_name, voice_path in sorted(voices.items()):
    print(f"🎤 {voice_name.upper()}")
    print("-" * 70)

    if not os.path.exists(voice_path):
        print(f"  ⚠️  Voice file not found: {voice_path}")
        print()
        continue

    for variant_name, text in test_texts:
        print(f"  {variant_name:15s} \"{text}\"", end=" → ")

        try:
            # Generate audio
            wav = model.generate(
                text,
                audio_prompt_path=voice_path,
                exaggeration=EXAGGERATION,
                cfg_weight=CFG_WEIGHT
            )

            # Save
            filename = f"{voice_name}-{variant_name}.wav"
            output_path = os.path.join(output_dir, filename)
            ta.save(output_path, wav, model.sr)

            # Stats
            duration = wav.shape[1] / model.sr
            file_size = os.path.getsize(output_path) / (1024 * 1024)

            print(f"{duration:.2f}s ({file_size:.2f}MB)")

            results.append({
                'voice': voice_name,
                'variant': variant_name,
                'text': text,
                'duration': duration,
                'file_size_mb': file_size,
                'filename': filename
            })

        except Exception as e:
            print(f"❌ FAILED - {e}")

    print()

print("=" * 70)
print("📊 COMPARISON: Impact of Leading Periods")
print("=" * 70)
print()

for voice_name in sorted(voices.keys()):
    voice_results = [r for r in results if r['voice'] == voice_name]
    if len(voice_results) != 3:
        continue

    no_pad = next((r for r in voice_results if r['variant'] == 'no-padding'), None)
    one_period = next((r for r in voice_results if r['variant'] == 'one-period'), None)
    two_periods = next((r for r in voice_results if r['variant'] == 'two-periods'), None)

    if no_pad and one_period and two_periods:
        diff_one = one_period['duration'] - no_pad['duration']
        diff_two = two_periods['duration'] - no_pad['duration']

        print(f"{voice_name.upper()}:")
        print(f"  No padding:   {no_pad['duration']:.2f}s")
        print(f"  One period:   {one_period['duration']:.2f}s (diff: {diff_one:+.2f}s)")
        print(f"  Two periods:  {two_periods['duration']:.2f}s (diff: {diff_two:+.2f}s)")
        print()

print("=" * 70)
print("🎯 SUMMARY")
print("=" * 70)
print()

# Calculate average impact
avg_durations = {
    'no-padding': [],
    'one-period': [],
    'two-periods': []
}

for variant in ['no-padding', 'one-period', 'two-periods']:
    variant_results = [r for r in results if r['variant'] == variant]
    if variant_results:
        avg_durations[variant] = sum(r['duration'] for r in variant_results) / len(variant_results)

print(f"Average durations across all voices:")
print(f"  No padding:   {avg_durations['no-padding']:.2f}s")
print(f"  One period:   {avg_durations['one-period']:.2f}s")
print(f"  Two periods:  {avg_durations['two-periods']:.2f}s")
print()

# Determine if padding helps
if avg_durations['one-period'] > avg_durations['no-padding']:
    diff = avg_durations['one-period'] - avg_durations['no-padding']
    print(f"✅ Leading periods ADD duration (+{diff:.2f}s average)")
    print(f"   This may help if short dialogue sounds rushed/clipped")
elif avg_durations['one-period'] < avg_durations['no-padding']:
    diff = avg_durations['no-padding'] - avg_durations['one-period']
    print(f"⚠️  Leading periods REDUCE duration (-{diff:.2f}s average)")
    print(f"   Unexpected - periods usually add pause time")
else:
    print(f"➖ Leading periods have NO EFFECT on duration")
    print(f"   Model may be stripping leading punctuation")

print()
print(f"🎧 Files saved to: {output_dir}")
print(f"   Access via: http://localhost:4000/audio/test-short-padding-cfg7/")
print()
print("Listen to samples and compare:")
print("  - Does padding make it sound more natural?")
print("  - Is there noticeable silence/pause before 'Help!'?")
print("  - Which version sounds best?")
