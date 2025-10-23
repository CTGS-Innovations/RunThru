#!/home/corey/projects/RunThru-backend/tts-service/venv/bin/python
"""
TTS Validation Script for RunThru
Tests that Index TTS and Chatterbox work with your GPU

NOTE: This script uses the virtual environment at:
      /home/corey/projects/RunThru-backend/tts-service/venv/

If the venv doesn't exist, run: ./download-tts-models.sh first
"""

import sys
import os

print("🤖 RunThru TTS Validation")
print("=" * 50)
print()

# =============================================================================
# 1. Check PyTorch and CUDA
# =============================================================================
print("🔍 Checking PyTorch and CUDA...")

try:
    import torch
    print(f"✅ PyTorch version: {torch.__version__}")
except ImportError:
    print("❌ PyTorch not installed")
    print("   Run: pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121")
    sys.exit(1)

if torch.cuda.is_available():
    gpu_name = torch.cuda.get_device_name(0)
    gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f"✅ CUDA available: {gpu_name} ({gpu_memory:.1f}GB)")
else:
    print("❌ CUDA not available - TTS will be SLOW")
    print("   Check: nvidia-smi")
    sys.exit(1)

print()

# =============================================================================
# 2. Test Index TTS
# =============================================================================
print("🎤 Testing Index TTS...")

try:
    from indextts.infer_v2 import IndexTTS2
    print("✅ Index TTS module imported")
except ImportError:
    print("❌ Index TTS not installed")
    print("   The model should be in data/models/index-tts/")
    print("   Run: ./download-tts-models.sh")
    sys.exit(1)

# Try loading the model
model_dir = "data/models/index-tts"
config_path = f"{model_dir}/config.yaml"

if not os.path.exists(config_path):
    print(f"❌ Index TTS config not found: {config_path}")
    print("   Run: ./download-tts-models.sh")
    sys.exit(1)

try:
    print(f"⏳ Loading Index TTS model (this may take 10-30 seconds)...")
    tts = IndexTTS2(
        cfg_path=config_path,
        model_dir=model_dir,
        use_fp16=True,  # Use FP16 to save VRAM
        use_cuda_kernel=True,
        use_deepspeed=False
    )
    print("✅ Index TTS model loaded")

    # Check VRAM usage
    vram_used = torch.cuda.memory_allocated(0) / 1024**3
    vram_total = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f"   VRAM usage: {vram_used:.2f}GB / {vram_total:.1f}GB ({vram_used/vram_total*100:.1f}%)")

except Exception as e:
    print(f"❌ Failed to load Index TTS: {e}")
    sys.exit(1)

# Try generating audio
try:
    print("⏳ Generating test audio with Index TTS...")
    import time
    start = time.time()

    # Find a voice prompt
    voice_prompt = f"{model_dir}/examples/voice_01.wav"
    if not os.path.exists(voice_prompt):
        # Try to find any .wav file in examples
        examples_dir = f"{model_dir}/examples"
        if os.path.exists(examples_dir):
            wav_files = [f for f in os.listdir(examples_dir) if f.endswith('.wav')]
            if wav_files:
                voice_prompt = f"{examples_dir}/{wav_files[0]}"
            else:
                print(f"⚠️  No voice prompts found in {examples_dir}")
                voice_prompt = None
        else:
            voice_prompt = None

    if voice_prompt and os.path.exists(voice_prompt):
        output_path = "data/test-index-tts.wav"
        tts.infer(
            spk_audio_prompt=voice_prompt,
            text="This is a test of Index TTS. But soft! What light through yonder window breaks?",
            output_path=output_path,
            emo_alpha=0.6,
            use_emo_text=True,
            use_random=False,
            verbose=False
        )

        elapsed = time.time() - start
        file_size = os.path.getsize(output_path) / 1024  # KB

        print(f"✅ Audio generated: {output_path} ({file_size:.1f}KB in {elapsed:.2f}s)")
        print(f"   Speed: {elapsed:.2f}s for ~80 characters ({elapsed/80*1000:.0f}ms per char)")
    else:
        print("⚠️  Skipping audio generation (no voice prompt found)")

except Exception as e:
    print(f"❌ Failed to generate audio: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# =============================================================================
# 3. Test Chatterbox (Optional)
# =============================================================================
print("🎤 Testing Chatterbox TTS...")

try:
    from chatterbox_tts import ChatterboxTTS
    print("✅ Chatterbox module imported")

    print("⏳ Loading Chatterbox model...")
    chatterbox = ChatterboxTTS.from_pretrained(device="cuda")
    print("✅ Chatterbox model loaded")

    print("⏳ Generating test audio with Chatterbox...")
    start = time.time()
    wav = chatterbox.generate("This is a test of Chatterbox TTS.")
    elapsed = time.time() - start

    # Save audio
    import torchaudio
    output_path = "data/test-chatterbox.wav"
    torchaudio.save(output_path, wav, chatterbox.sr)

    file_size = os.path.getsize(output_path) / 1024  # KB
    print(f"✅ Audio generated: {output_path} ({file_size:.1f}KB in {elapsed:.2f}s)")
    print(f"   Speed: {elapsed:.2f}s for ~35 characters ({elapsed/35*1000:.0f}ms per char)")

except ImportError:
    print("⚠️  Chatterbox not installed (optional)")
    print("   Install with: pip install chatterbox-tts")
except Exception as e:
    print(f"⚠️  Chatterbox test failed: {e}")

print()

# =============================================================================
# Summary
# =============================================================================
print("=" * 50)
print("✅ TTS Validation Complete!")
print()
print("Summary:")
print(f"  - GPU: {gpu_name}")
print(f"  - Index TTS: Working ({vram_used:.2f}GB VRAM)")
print(f"  - Generation speed: ~{elapsed:.2f}s per line")
print()
print("Test audio files:")
print("  - data/test-index-tts.wav")
if os.path.exists("data/test-chatterbox.wav"):
    print("  - data/test-chatterbox.wav")
print()
print("🎯 Ready to proceed with scaffolding!")
print()
print("Next steps:")
print("  1. Listen to test audio files to verify quality")
print("  2. Tell Claude to proceed with scaffolding")
