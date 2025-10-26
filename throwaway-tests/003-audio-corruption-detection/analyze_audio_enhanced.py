#!/usr/bin/env python3
"""
Enhanced Audio Corruption Detection
Analyzes dialogue WAV files by comparing actual duration to expected duration
based on the dialogue text content.

Key insight: A 3MB file for "Help!" is corruption, but a 3MB file for a
65-second monologue is normal. We need to know WHAT the audio should contain.
"""

import os
import sys
import sqlite3
import numpy as np
from pathlib import Path
import json
from scipy.io import wavfile

def estimate_expected_duration(text: str) -> tuple[float, float]:
    """
    Estimate expected audio duration based on dialogue text.

    Returns (min_duration, max_duration) in seconds.

    Assumptions:
    - Average speaking rate: 120-180 words/minute (2-3 words/sec)
    - TTS tends to be slower (pauses, emphasis)
    - Short lines have overhead (min ~0.5s for even one word)
    """
    # Count words
    words = text.split()
    word_count = len(words)

    # Character count (for very short utterances)
    char_count = len(text.strip())

    # Short utterances (1-3 words)
    if word_count <= 3:
        # Minimum 0.3s per word, max 2s per word (with pauses/emphasis)
        min_duration = word_count * 0.3
        max_duration = word_count * 2.0
        return (max(min_duration, 0.5), max(max_duration, 1.5))

    # Longer dialogue
    # TTS speaking rate: ~1.5-3 words/second (slower than human)
    min_duration = word_count / 3.0  # Fast TTS
    max_duration = word_count / 1.5  # Slow, dramatic TTS

    # Add buffer for very long monologues (they tend to have more pauses)
    if word_count > 50:
        max_duration *= 1.5

    return (min_duration, max_duration)


def get_all_dialogue_from_script(db_path: str, script_id: str) -> dict:
    """
    Query database to get parsed script JSON and extract all dialogue.

    Returns dict mapping (character, line_index) -> dialogue_text
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Query scripts table for parsed_json
        cursor.execute("""
            SELECT parsed_json
            FROM scripts
            WHERE id = ?
        """, (script_id,))

        result = cursor.fetchone()
        conn.close()

        if not result:
            print(f"⚠️  Script not found: {script_id}")
            return {}

        # Parse JSON
        import json
        parsed_script = json.loads(result[0])

        # Extract dialogue lines (same logic as DialogueAudioService)
        dialogue_map = {}
        line_index = 1

        for item in parsed_script.get('content', []):
            if item.get('type') == 'dialogue':
                character = item.get('character', '')
                text = item.get('text', '')
                # Store with uppercase character name (database format)
                dialogue_map[(character.upper(), line_index)] = text
                line_index += 1

        print(f"✅ Loaded {len(dialogue_map)} dialogue lines from database")
        return dialogue_map

    except Exception as e:
        print(f"⚠️  Database query failed: {e}")
        import traceback
        traceback.print_exc()
        return {}


def parse_filename(filename: str) -> tuple[str, int] | None:
    """
    Parse filename to extract character and line index.

    Expected format: {character}-line-{index}.wav
    Example: "jimmy-line-17.wav" → ("jimmy", 17)
    """
    try:
        # Remove .wav extension
        name = filename.replace('.wav', '')

        # Split by '-line-'
        parts = name.split('-line-')
        if len(parts) != 2:
            return None

        character = parts[0]
        line_index = int(parts[1])

        return (character, line_index)
    except:
        return None


def analyze_wav_file(filepath: Path, dialogue_text: str | None = None):
    """
    Analyze a WAV file for corruption indicators.

    If dialogue_text is provided, compares actual duration to expected duration.

    Returns:
        dict with metrics including duration_ratio (actual/expected)
    """
    try:
        # Read WAV file
        framerate, audio_array = wavfile.read(str(filepath))

        # Convert to mono if stereo
        if audio_array.ndim == 2:
            audio_array = audio_array.mean(axis=1)

        # Normalize to -1.0 to 1.0
        if audio_array.dtype == np.int16:
            audio_normalized = audio_array.astype(np.float32) / 32768.0
        elif audio_array.dtype == np.float32:
            audio_normalized = audio_array
        else:
            audio_normalized = audio_array.astype(np.float32)
            if np.max(np.abs(audio_normalized)) > 1.0:
                audio_normalized = audio_normalized / np.max(np.abs(audio_normalized))

        # Calculate duration
        actual_duration = len(audio_normalized) / float(framerate)

        # Calculate basic metrics
        file_size = os.path.getsize(filepath)
        rms_energy = np.sqrt(np.mean(audio_normalized**2))
        zero_crossings = np.sum(np.abs(np.diff(np.sign(audio_normalized)))) / (2 * len(audio_normalized))

        # Spectral flatness
        fft = np.fft.rfft(audio_normalized)
        magnitude = np.abs(fft)
        epsilon = 1e-10
        geometric_mean = np.exp(np.mean(np.log(magnitude + epsilon)))
        arithmetic_mean = np.mean(magnitude)
        spectral_flatness = geometric_mean / (arithmetic_mean + epsilon)

        # Enhanced analysis: Compare to expected duration
        duration_ratio = None
        expected_min = None
        expected_max = None
        word_count = None

        if dialogue_text:
            word_count = len(dialogue_text.split())
            expected_min, expected_max = estimate_expected_duration(dialogue_text)

            # Calculate ratio (how far off are we?)
            if actual_duration < expected_min:
                # Audio is TOO SHORT
                duration_ratio = actual_duration / expected_min
            elif actual_duration > expected_max:
                # Audio is TOO LONG
                duration_ratio = actual_duration / expected_max
            else:
                # Audio is within expected range
                duration_ratio = 1.0

        # Detect suspicious files
        is_suspicious = False
        reasons = []

        # Signal-based suspicion (original logic)
        if spectral_flatness > 0.5:
            is_suspicious = True
            reasons.append(f'High spectral flatness ({spectral_flatness:.2f}) - noise-like')
        if zero_crossings > 0.3:
            is_suspicious = True
            reasons.append(f'High zero-crossing ({zero_crossings:.2f}) - erratic signal')
        if rms_energy < 0.01:
            is_suspicious = True
            reasons.append(f'Low energy ({rms_energy:.4f}) - silent/corrupted')

        # Duration-based suspicion (NEW - the key enhancement!)
        if duration_ratio is not None:
            if duration_ratio > 3.0:
                # Audio is 3x+ longer than expected = likely corruption/repetition
                is_suspicious = True
                reasons.append(f'WAY TOO LONG ({duration_ratio:.1f}x expected) - possible corruption or repetition')
            elif duration_ratio < 0.3:
                # Audio is <30% of expected length = truncated/corrupted
                is_suspicious = True
                reasons.append(f'TOO SHORT ({duration_ratio:.1f}x expected) - truncated or missing content')
            elif duration_ratio > 2.0:
                # Audio is 2-3x longer than expected = worth investigating
                reasons.append(f'Longer than expected ({duration_ratio:.1f}x) - check quality')

        return {
            'filepath': str(filepath.name),
            'dialogue_text': dialogue_text[:50] + '...' if dialogue_text and len(dialogue_text) > 50 else dialogue_text,
            'word_count': int(word_count) if word_count else None,
            'actual_duration': float(round(actual_duration, 2)),
            'expected_min': float(round(expected_min, 2)) if expected_min else None,
            'expected_max': float(round(expected_max, 2)) if expected_max else None,
            'duration_ratio': float(round(duration_ratio, 2)) if duration_ratio else None,
            'file_size_mb': float(round(file_size / (1024 * 1024), 2)),
            'rms_energy': float(round(rms_energy, 4)),
            'zero_crossing_rate': float(round(zero_crossings, 4)),
            'spectral_flatness': float(round(spectral_flatness, 4)),
            'is_suspicious': bool(is_suspicious),
            'reason': ' | '.join(reasons) if reasons else 'OK'
        }

    except Exception as e:
        return {
            'filepath': str(filepath.name),
            'error': str(e),
            'is_suspicious': True,
            'reason': f'Failed to analyze: {str(e)}'
        }


def main():
    # Paths
    script_id = '6f2c2aa7-5198-47e1-94ea-8e2663bb388d'
    dialogue_dir = Path(f'/home/corey/projects/RunThru-backend/backend/public/audio/{script_id}/dialogue')
    db_path = Path('/home/corey/projects/RunThru-backend/backend/database/runthru.db')

    if not dialogue_dir.exists():
        print(f"❌ Directory not found: {dialogue_dir}")
        return

    print(f"🔍 Enhanced Audio Corruption Analysis")
    print(f"=" * 80)
    print(f"Directory: {dialogue_dir}")
    print(f"Database: {db_path if db_path.exists() else 'N/A'}")
    print(f"=" * 80)
    print()

    # Load all dialogue from database
    dialogue_map = {}
    if db_path.exists():
        dialogue_map = get_all_dialogue_from_script(str(db_path), script_id)
    else:
        print(f"⚠️  Database not found - falling back to signal-only analysis")

    # Analyze all WAV files
    wav_files = sorted(dialogue_dir.glob('*.wav'))
    results = []

    for wav_file in wav_files:
        # Parse filename to get character and line_index
        parsed = parse_filename(wav_file.name)

        dialogue_text = None
        if parsed and dialogue_map:
            character, line_index = parsed
            # Database uses uppercase character names, filename uses lowercase
            character_upper = character.upper().replace('-', ' ')
            # Look up dialogue in map
            dialogue_text = dialogue_map.get((character_upper, line_index))
            if not dialogue_text:
                # Try without space conversion (some characters might not have spaces)
                dialogue_text = dialogue_map.get((character.upper(), line_index))

        # Analyze with dialogue context
        result = analyze_wav_file(wav_file, dialogue_text)
        results.append(result)

    # Separate suspicious and clean files
    suspicious = [r for r in results if r.get('is_suspicious', False)]
    clean = [r for r in results if not r.get('is_suspicious', False)]

    print(f"\n📊 SUMMARY")
    print(f"=" * 80)
    print(f"Total files: {len(results)}")
    print(f"Clean files: {len(clean)}")
    print(f"Suspicious files: {len(suspicious)}")
    print()

    if suspicious:
        print(f"\n⚠️  SUSPICIOUS FILES ({len(suspicious)}):")
        print(f"=" * 80)

        # Sort by duration_ratio (most abnormal first)
        suspicious_sorted = sorted(
            suspicious,
            key=lambda x: abs(x.get('duration_ratio', 1.0) - 1.0) if x.get('duration_ratio') else 0,
            reverse=True
        )

        for result in suspicious_sorted:
            print(f"\n{result['filepath']}")
            if result.get('dialogue_text'):
                print(f"  Text: \"{result['dialogue_text']}\"")
                print(f"  Words: {result.get('word_count', 'N/A')}")
            print(f"  Actual duration: {result.get('actual_duration', 'N/A')}s")
            if result.get('expected_min'):
                print(f"  Expected: {result['expected_min']}-{result['expected_max']}s")
            if result.get('duration_ratio'):
                print(f"  Ratio: {result['duration_ratio']}x expected")
            print(f"  Size: {result.get('file_size_mb', 'N/A')} MB")
            print(f"  ⚠️  {result.get('reason', 'Unknown issue')}")

    # Save results to JSON
    output_file = Path(__file__).parent / 'enhanced_analysis_results.json'
    with open(output_file, 'w') as f:
        json.dump({
            'summary': {
                'total': len(results),
                'clean': len(clean),
                'suspicious': len(suspicious)
            },
            'suspicious_files': suspicious,
            'all_results': results
        }, f, indent=2)

    print(f"\n✅ Full results saved to: {output_file}")

    # Print top 5 most suspicious
    if suspicious:
        print(f"\n🔴 TOP 5 MOST SUSPICIOUS (by duration ratio):")
        print(f"=" * 80)
        for i, result in enumerate(suspicious_sorted[:5], 1):
            ratio = result.get('duration_ratio', 'N/A')
            print(f"{i}. {result['filepath']} - {ratio}x expected - {result.get('reason', 'Unknown')}")


if __name__ == '__main__':
    main()
