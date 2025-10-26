#!/usr/bin/env python3
"""
Test cfg_weight=0.7 across all characters
Sample multiple dialogue lines per character to validate the configuration
"""

import os
import json
import sqlite3
import torchaudio as ta
from chatterbox import ChatterboxTTS

print("🎭 Testing cfg_weight=0.7 Across All Characters")
print("=" * 70)
print()

# Initialize Chatterbox
device = "cuda:0"
print(f"Loading Chatterbox model (device: {device})...")
model = ChatterboxTTS.from_pretrained(device=device)
print("✅ Model loaded!")
print()

# Output directory
output_dir = "/home/corey/projects/RunThru-backend/backend/public/audio/test-cfg-0.7-all-characters"
os.makedirs(output_dir, exist_ok=True)
print(f"📁 Output directory: {output_dir}")
print()

# Get dialogue lines from database
script_id = '6f2c2aa7-5198-47e1-94ea-8e2663bb388d'
session_id = '0edca75a-c108-45a8-9f56-25ce1617b62b'
db_path = '/home/corey/projects/RunThru-backend/backend/database/runthru.db'

print("📊 Loading dialogue from database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get parsed script
cursor.execute("SELECT parsed_json FROM scripts WHERE id = ?", (script_id,))
result = cursor.fetchone()
parsed_script = json.loads(result[0])

# Get voice assignments
cursor.execute("""
    SELECT character_id, voice_preset_id
    FROM voice_assignments
    WHERE session_id = ?
""", (session_id,))
voice_assignments = {row[0]: row[1] for row in cursor.fetchall()}
conn.close()

# Extract dialogue by character
dialogue_by_character = {}
line_index = 0
for item in parsed_script.get('content', []):
    if item.get('type') == 'dialogue':
        line_index += 1
        character = item.get('character', '').upper()
        text = item.get('text', '')

        if character not in dialogue_by_character:
            dialogue_by_character[character] = []

        dialogue_by_character[character].append({
            'line_index': line_index,
            'text': text,
            'word_count': len(text.split())
        })

print(f"✅ Found {len(dialogue_by_character)} characters")
print()

# Sample 2-3 lines per character (mix of short and long)
test_samples = []
for character, lines in dialogue_by_character.items():
    # Get short line (1-5 words)
    short_lines = [l for l in lines if l['word_count'] <= 5]
    if short_lines:
        test_samples.append((character, short_lines[0]))

    # Get medium line (6-20 words)
    medium_lines = [l for l in lines if 6 <= l['word_count'] <= 20]
    if medium_lines:
        test_samples.append((character, medium_lines[0]))

    # Get long line (20+ words) if available
    long_lines = [l for l in lines if l['word_count'] > 20]
    if long_lines and len(long_lines) > 0:
        test_samples.append((character, long_lines[0]))

print(f"📝 Testing {len(test_samples)} dialogue samples:")
print()

# Voice preset mapping
voice_preset_paths = {
    'narrator-male': '/home/corey/projects/RunThru-backend/tts-service/reference-voices/narrator-male.wav',
    'narrator-female': '/home/corey/projects/RunThru-backend/tts-service/reference-voices/narrator-female.wav',
    'teen-boy': '/home/corey/projects/RunThru-backend/tts-service/reference-voices/teen-boy.wav',
    'teen-girl': '/home/corey/projects/RunThru-backend/tts-service/reference-voices/teen-girl.wav',
    'zombie-grumbly': '/home/corey/projects/RunThru-backend/tts-service/reference-voices/zombie-grumbly.wav',
}

results = []

for character, dialogue in test_samples:
    text = dialogue['text']
    line_index = dialogue['line_index']
    word_count = dialogue['word_count']

    # Get voice assignment
    voice_preset_id = voice_assignments.get(character, 'teen-boy')
    voice_path = voice_preset_paths.get(voice_preset_id)

    if not voice_path or not os.path.exists(voice_path):
        print(f"⚠️  Skipping {character} line {line_index} - voice not found: {voice_preset_id}")
        continue

    # Truncate text for display
    display_text = text[:50] + '...' if len(text) > 50 else text

    print(f"{character} (line {line_index}, {word_count} words):")
    print(f"  Text: \"{display_text}\"")
    print(f"  Voice: {voice_preset_id}")

    # Test with cfg_weight=0.7
    try:
        print(f"  Generating with cfg=0.7...", end=" ")

        wav = model.generate(
            text,
            audio_prompt_path=voice_path,
            exaggeration=0.5,
            cfg_weight=0.7
        )

        # Save
        filename = f"{character.lower().replace(' ', '-')}-line-{line_index}-cfg-0.7.wav"
        output_path = os.path.join(output_dir, filename)
        ta.save(output_path, wav, model.sr)

        duration = wav.shape[1] / model.sr
        file_size = os.path.getsize(output_path) / (1024 * 1024)

        # Estimate expected duration (2 words/sec for TTS)
        expected_min = word_count / 3.0
        expected_max = word_count / 1.5
        duration_ratio = duration / expected_max if expected_max > 0 else 1.0

        status = "✅" if duration_ratio <= 2.0 else "⚠️"
        print(f"{status} {duration:.2f}s ({file_size:.2f}MB)")

        results.append({
            'character': character,
            'line_index': line_index,
            'text': text,
            'word_count': word_count,
            'voice': voice_preset_id,
            'duration': duration,
            'file_size_mb': file_size,
            'expected_max': expected_max,
            'duration_ratio': duration_ratio,
            'filename': filename
        })

    except Exception as e:
        print(f"❌ FAILED: {e}")

    print()

print("=" * 70)
print("📊 SUMMARY")
print("=" * 70)
print()
print(f"Configuration: exaggeration=0.5, cfg_weight=0.7")
print(f"Total samples: {len(results)}")
print()

# Group by character
by_character = {}
for r in results:
    char = r['character']
    if char not in by_character:
        by_character[char] = []
    by_character[char].append(r)

print(f"{'Character':<15} {'Samples':<10} {'Avg Duration':<15} {'Status'}")
print("-" * 70)

for character in sorted(by_character.keys()):
    samples = by_character[character]
    avg_duration = sum(s['duration'] for s in samples) / len(samples)
    max_ratio = max(s['duration_ratio'] for s in samples)

    status = "✅ All OK" if max_ratio <= 2.0 else "⚠️ Some long"

    print(f"{character:<15} {len(samples):<10} {avg_duration:>8.2f}s       {status}")

print()

# Flag suspicious results
suspicious = [r for r in results if r['duration_ratio'] > 2.0]
if suspicious:
    print("⚠️  SUSPICIOUS FILES (duration > 2x expected):")
    print()
    for r in suspicious:
        print(f"  {r['filename']}")
        print(f"    {r['word_count']} words → {r['duration']:.2f}s (expected max {r['expected_max']:.2f}s)")
        print(f"    \"{r['text'][:80]}...\"")
        print()
else:
    print("✅ All files within acceptable duration range!")

print()
print(f"🎧 Files saved to: {output_dir}")
print()
print("Listen via backend server:")
print(f"  http://localhost:4000/audio/test-cfg-0.7-all-characters/")
