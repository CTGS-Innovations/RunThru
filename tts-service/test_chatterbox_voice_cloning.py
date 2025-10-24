#!/usr/bin/env python3
"""
Quick test: Chatterbox voice cloning with reference audio
"""

import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from adapters.chatterbox_adapter import ChatterboxAdapter
from adapters.base import EmotionParams

print("🎤 Testing Chatterbox Voice Cloning")
print("=" * 50)

# Initialize adapter
print("⏳ Loading Chatterbox...")
adapter = ChatterboxAdapter(model_dir=".", device="cuda:0")
print("✅ Chatterbox loaded")

# Test with reference voice
reference_voice = "/home/corey/projects/RunThru-backend/tts-service/reference-voices/teen-male.wav"

if not os.path.exists(reference_voice):
    print(f"❌ Reference voice not found: {reference_voice}")
    sys.exit(1)

print(f"   Using reference: {reference_voice}")
print()

# Generate test audio
print("⏳ Generating test audio with voice cloning...")
text = "NARRATOR ONE... Here!"
emotion = EmotionParams(intensity=0.5, valence="neutral")

import asyncio
audio_bytes = asyncio.run(adapter.synthesize(
    text=text,
    voice_id=reference_voice,
    emotion=emotion
))

# Save output
output_path = "/home/corey/projects/RunThru/data/test-character-card.wav"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'wb') as f:
    f.write(audio_bytes)

file_size = len(audio_bytes) / 1024
print(f"✅ Audio generated: {output_path}")
print(f"   Size: {file_size:.1f}KB")
print()
print("🎯 Test complete! Play with: mpv " + output_path)
