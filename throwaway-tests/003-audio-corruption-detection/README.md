# Audio Corruption Detection Test

## Purpose
Analyze generated dialogue WAV files to detect corrupted/garbled audio using **context-aware** analysis.

## Key Insight
**Original test was too myopic** - it analyzed audio signals without considering what the audio *should* contain:
- A 3MB file for "Help!" (1 word) = **CORRUPTION**
- A 3MB file for a 65-word monologue = **NORMAL**

**Enhanced test** compares actual duration to expected duration based on dialogue text.

## Metrics Used

### 1. Duration-Based Detection (NEW - Primary Method)
Compares actual audio length to expected length based on dialogue text:

- **Expected duration**: Estimated from word count
  - Short lines (1-3 words): 0.3-2 seconds per word
  - Longer dialogue: 1.5-3 words/second (TTS is slower than humans)
  - Long monologues: Add 50% buffer for dramatic pauses

- **Duration ratio**: `actual / expected`
  - `< 0.3x`: **TOO SHORT** - truncated/corrupted
  - `0.3x - 2.0x`: **NORMAL** - within TTS variance
  - `2.0x - 3.0x`: **INVESTIGATE** - might be overly dramatic
  - `> 3.0x`: **CORRUPTION** - likely repetition or noise

### 2. Signal-Based Detection (Secondary - Original Method)

1. **Spectral Flatness** (0-1): Measures how "noise-like" the audio is
   - Speech: 0.1-0.3 (peaks in certain frequencies)
   - Noise/corruption: >0.5 (flat across all frequencies)

2. **Zero-Crossing Rate**: How often the signal crosses zero
   - Speech: 0.05-0.15 (smooth transitions)
   - Noise: >0.3 (erratic, rapid changes)

3. **RMS Energy**: Overall signal strength
   - Normal: 0.1-0.5
   - Corrupted/silent: <0.01

## Usage

```bash
cd throwaway-tests/003-audio-corruption-detection

# Install dependencies (numpy, scipy for audio analysis)
pip install -r requirements.txt

# Run original signal-only analysis
python3 analyze_audio.py

# Run enhanced context-aware analysis (RECOMMENDED)
python3 analyze_audio_enhanced.py
```

## Enhanced Analysis Features

The enhanced test (`analyze_audio_enhanced.py`):
1. **Queries database** to get actual dialogue text for each audio file
2. **Estimates expected duration** based on word count and TTS speaking rate
3. **Flags anomalies** where duration ratio is way off (too short or too long)
4. **Provides context** in output (shows dialogue text + word count)

Example output:
```
⚠️  SUSPICIOUS FILES:

zombie-line-2.wav
  Text: "Help! Somebody help me! I'm trapped..."
  Words: 65
  Actual duration: 65.2s
  Expected: 22-44s
  Ratio: 1.5x expected  ← NORMAL (within variance)

jimmy-line-5.wav
  Text: "No"
  Words: 1
  Actual duration: 45.0s
  Ratio: 22.5x expected  ← CORRUPTION!
```

## Expected Output

- Summary: Total files, clean files, suspicious files
- List of suspicious files with metrics
- Saved JSON report: `analysis_results.json`

## Decision Criteria

If multiple files are flagged as suspicious:
- Check spectral flatness >0.5 → likely garbled/noise
- Check size ratio >2.0 → inefficient encoding or long noise segments
- Regenerate flagged files with adjusted TTS parameters

## Cleanup

After making decisions based on results, delete this directory:
```bash
rm -rf throwaway-tests/003-audio-corruption-detection/
```
