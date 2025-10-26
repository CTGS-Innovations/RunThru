#!/usr/bin/env python3
"""
Audio Corruption Detection
Analyzes dialogue WAV files to detect corruption/garbled audio
Uses signal processing to distinguish speech from noise
"""

import os
import numpy as np
from pathlib import Path
import json
from scipy.io import wavfile

def analyze_wav_file(filepath):
    """
    Analyze a WAV file for corruption indicators

    Returns:
        dict with metrics: duration, file_size, signal_strength, spectral_flatness, is_suspicious
    """
    try:
        # Read WAV file (supports both PCM and float formats)
        framerate, audio_array = wavfile.read(str(filepath))

        # Convert to mono if stereo
        if audio_array.ndim == 2:
            audio_array = audio_array.mean(axis=1)

        # Normalize to -1.0 to 1.0
        if audio_array.dtype == np.int16:
            audio_normalized = audio_array.astype(np.float32) / 32768.0
        elif audio_array.dtype == np.float32:
            audio_normalized = audio_array  # Already float
        else:
            # Handle other formats
            audio_normalized = audio_array.astype(np.float32)
            if np.max(np.abs(audio_normalized)) > 1.0:
                audio_normalized = audio_normalized / np.max(np.abs(audio_normalized))

        # Calculate duration
        duration = len(audio_normalized) / float(framerate)

        # Calculate metrics
        file_size = os.path.getsize(filepath)

        # 1. RMS Energy (signal strength)
        rms_energy = np.sqrt(np.mean(audio_normalized**2))

        # 2. Zero-crossing rate (noise has high ZCR)
        zero_crossings = np.sum(np.abs(np.diff(np.sign(audio_normalized)))) / (2 * len(audio_normalized))

        # 3. Spectral flatness (speech is low, noise is high)
        # Use FFT to get frequency spectrum
        fft = np.fft.rfft(audio_normalized)
        magnitude = np.abs(fft)

        # Avoid log(0) by adding small epsilon
        epsilon = 1e-10
        geometric_mean = np.exp(np.mean(np.log(magnitude + epsilon)))
        arithmetic_mean = np.mean(magnitude)
        spectral_flatness = geometric_mean / (arithmetic_mean + epsilon)

        # 4. File size efficiency (bytes per second)
        bytes_per_second = file_size / duration if duration > 0 else 0

        # Expected bytes/sec for 24kHz float32 WAV: ~96KB/sec (4 bytes per sample)
        # If way higher, might be corrupted (long periods of noise)
        expected_bps = 96000  # 24kHz * 4 bytes (float32)
        size_ratio = bytes_per_second / expected_bps

        # Detect suspicious files
        is_suspicious = (
            spectral_flatness > 0.5 or  # Very flat spectrum = noise
            zero_crossings > 0.3 or     # High zero-crossing = noise
            rms_energy < 0.01 or        # Very quiet = might be silence/corruption
            size_ratio > 1.5            # File much larger than expected
        )

        return {
            'filepath': str(filepath.name),
            'duration_seconds': round(duration, 2),
            'file_size_mb': round(file_size / (1024 * 1024), 2),
            'rms_energy': round(rms_energy, 4),
            'zero_crossing_rate': round(zero_crossings, 4),
            'spectral_flatness': round(spectral_flatness, 4),
            'bytes_per_second': round(bytes_per_second, 0),
            'size_ratio': round(size_ratio, 2),
            'is_suspicious': is_suspicious,
            'reason': get_suspicion_reason(spectral_flatness, zero_crossings, rms_energy, size_ratio)
        }

    except Exception as e:
        return {
            'filepath': str(filepath.name),
            'error': str(e),
            'is_suspicious': True,
            'reason': f'Failed to analyze: {str(e)}'
        }

def get_suspicion_reason(spectral_flatness, zero_crossing, rms_energy, size_ratio):
    """Generate human-readable reason for suspicion"""
    reasons = []

    if spectral_flatness > 0.5:
        reasons.append(f'High spectral flatness ({spectral_flatness:.2f}) - likely noise')
    if zero_crossing > 0.3:
        reasons.append(f'High zero-crossing rate ({zero_crossing:.2f}) - erratic signal')
    if rms_energy < 0.01:
        reasons.append(f'Very low energy ({rms_energy:.4f}) - silent or corrupted')
    if size_ratio > 1.5:
        reasons.append(f'File too large ({size_ratio:.1f}x expected) - inefficient encoding or long noise')

    return ' | '.join(reasons) if reasons else 'OK'

def main():
    # Path to dialogue audio directory
    dialogue_dir = Path('/home/corey/projects/RunThru-backend/backend/public/audio/6f2c2aa7-5198-47e1-94ea-8e2663bb388d/dialogue')

    if not dialogue_dir.exists():
        print(f"❌ Directory not found: {dialogue_dir}")
        return

    print(f"🔍 Analyzing audio files in: {dialogue_dir}")
    print(f"=" * 80)

    # Analyze all WAV files
    wav_files = sorted(dialogue_dir.glob('*.wav'))
    results = []

    for wav_file in wav_files:
        result = analyze_wav_file(wav_file)
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

        # Sort by spectral flatness (most suspicious first)
        suspicious_sorted = sorted(suspicious, key=lambda x: x.get('spectral_flatness', 0), reverse=True)

        for result in suspicious_sorted:
            print(f"\n{result['filepath']}")
            print(f"  Duration: {result.get('duration_seconds', 'N/A')}s")
            print(f"  Size: {result.get('file_size_mb', 'N/A')} MB")
            print(f"  Spectral flatness: {result.get('spectral_flatness', 'N/A')}")
            print(f"  Zero-crossing: {result.get('zero_crossing_rate', 'N/A')}")
            print(f"  RMS energy: {result.get('rms_energy', 'N/A')}")
            print(f"  Size ratio: {result.get('size_ratio', 'N/A')}x")
            print(f"  ⚠️  {result.get('reason', 'Unknown issue')}")

    # Save results to JSON
    output_file = Path(__file__).parent / 'analysis_results.json'
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
    print()

    # Print top 5 most suspicious
    if suspicious:
        print(f"\n🔴 TOP 5 MOST SUSPICIOUS:")
        print(f"=" * 80)
        for i, result in enumerate(suspicious_sorted[:5], 1):
            print(f"{i}. {result['filepath']} - {result.get('reason', 'Unknown')}")

if __name__ == '__main__':
    main()
