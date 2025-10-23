# TTS Voice Parameter Control

**Date**: 2025-10-23
**Sprint**: 3 (Voice Assignment)

## Summary

**Use Chatterbox** for Sprint 3 voice control.

## Chatterbox Parameters

```python
model.generate(
    text,
    audio_prompt_path="voice_sample.wav",  # Speaker identity
    exaggeration=0.5,                       # Emotion intensity (0.0-1.0)
    cfg_weight=0.5                          # Style control
)
```

## Slider Mapping (0-100 → Chatterbox params)

1. **Gender Slider (0-100)**:
   - Implementation: Use different reference audio files (male/female voices)
   - 0-33: Female voice samples
   - 34-66: Neutral voice samples
   - 67-100: Male voice samples

2. **Emotion Slider (0-100)**:
   - Map directly to `exaggeration` parameter
   - Formula: `exaggeration = emotion_slider / 100.0`
   - 0 → calm (0.0), 50 → neutral (0.5), 100 → intense (1.0)

3. **Age Slider (0-100)**:
   - Post-processing with audio effects
   - Young (0-33): Speed up slightly (1.1x), pitch up (+2 semitones)
   - Adult (34-66): No modification
   - Elder (67-100): Slow down (0.9x), pitch down (-2 semitones)

## Voice Presets → Chatterbox Params

| Preset | Reference Audio | Exaggeration | Speed | Pitch |
|--------|----------------|--------------|-------|-------|
| Teen Male | male_teen.wav | 0.5 | 1.0x | 0 |
| Teen Female | female_teen.wav | 0.5 | 1.0x | 0 |
| Angry Teen | male_teen.wav | 0.8 | 1.0x | 0 |
| Cheerful Kid | female_kid.wav | 0.7 | 1.1x | +2 |
| Wise Elder | male_elder.wav | 0.3 | 0.9x | -2 |
| Mysterious Narrator | male_adult.wav | 0.4 | 1.0x | 0 |
| Angry Monster | male_adult.wav | 0.95 | 0.9x | -3 |
| Scared Character | female_teen.wav | 0.85 | 1.1x | +1 |

## Implementation

### TTS Service Endpoint
```python
POST /synthesize-preview
{
  "text": "Hi, my name is ZOMBIE. Braaaains!",
  "gender": 50,
  "emotion": 80,
  "age": 50
}
```

Response: Audio file URL

### Next Steps
1. Collect/create 8 reference audio files (male/female/kid/elder)
2. Implement audio post-processing (pitch/speed with librosa)
3. Add preview generation endpoint
4. Test all 8 presets

**Status**: Ready to implement
