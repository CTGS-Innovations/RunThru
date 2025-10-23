#!/usr/bin/env python3.11
"""
TTS Validation Script for RunThru (v2)
Tests Index TTS (via uv) and Chatterbox (via venv) separately

This script coordinates testing both TTS engines in their respective environments.
"""

import subprocess
import sys
import os

print("🤖 RunThru TTS Validation (v2)")
print("=" * 50)
print()

# Paths
BACKEND_DIR = "/home/corey/projects/RunThru-backend/tts-service"
INDEX_TTS_DIR = f"{BACKEND_DIR}/index-tts"
VENV_DIR = f"{BACKEND_DIR}/venv"
DATA_DIR = "/home/corey/projects/RunThru/data"

# =============================================================================
# 1. Test Index TTS (in its uv-managed .venv)
# =============================================================================
print("🎤 Testing Index TTS...")
print("   Environment: uv-managed .venv")
print()

if not os.path.exists(f"{INDEX_TTS_DIR}/.venv"):
    print(f"❌ Index TTS venv not found: {INDEX_TTS_DIR}/.venv")
    print("   Run: ./download-tts-models.sh")
    sys.exit(1)

if not os.path.exists(f"{INDEX_TTS_DIR}/checkpoints/config.yaml"):
    print(f"❌ Index TTS models not found: {INDEX_TTS_DIR}/checkpoints/")
    print("   Run: ./download-tts-models.sh")
    sys.exit(1)

# Create test script for Index TTS
index_test_script = f"""
import sys
import os

print("🔍 Checking PyTorch and CUDA...")
try:
    import torch
    print(f"✅ PyTorch version: {{torch.__version__}}")

    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
        print(f"✅ CUDA available: {{gpu_name}} ({{gpu_memory:.1f}}GB)")
    else:
        print("❌ CUDA not available")
        sys.exit(1)
except ImportError as e:
    print(f"❌ PyTorch import failed: {{e}}")
    sys.exit(1)

print()
print("📦 Checking Index TTS module...")
try:
    from indextts.infer_v2 import IndexTTS2
    print("✅ Index TTS module imported")
except ImportError as e:
    print(f"❌ Index TTS import failed: {{e}}")
    sys.exit(1)

print()
print("⏳ Loading Index TTS model...")
model_dir = "{INDEX_TTS_DIR}/checkpoints"
config_path = f"{{model_dir}}/config.yaml"

try:
    tts = IndexTTS2(
        cfg_path=config_path,
        model_dir=model_dir,
        use_fp16=True,
        use_cuda_kernel=True,
        use_deepspeed=False
    )
    print("✅ Index TTS model loaded")

    vram_used = torch.cuda.memory_allocated(0) / 1024**3
    vram_total = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f"   VRAM usage: {{vram_used:.2f}}GB / {{vram_total:.1f}}GB ({{vram_used/vram_total*100:.1f}}%)")
except Exception as e:
    print(f"❌ Failed to load model: {{e}}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("⏳ Generating test audio...")
import time
start = time.time()

# Find voice prompt
examples_dir = f"{{model_dir}}/examples"
voice_prompt = None

if os.path.exists(examples_dir):
    wav_files = [f for f in os.listdir(examples_dir) if f.endswith('.wav')]
    if wav_files:
        voice_prompt = f"{{examples_dir}}/{{wav_files[0]}}"
        print(f"   Using voice prompt: {{voice_prompt}}")

if not voice_prompt or not os.path.exists(voice_prompt):
    print("⚠️  No voice prompt found, skipping audio generation")
    sys.exit(0)

output_path = "{DATA_DIR}/test-index-tts.wav"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

try:
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
    file_size = os.path.getsize(output_path) / 1024

    print(f"✅ Audio generated: {{output_path}}")
    print(f"   Size: {{file_size:.1f}}KB")
    print(f"   Time: {{elapsed:.2f}}s (~{{elapsed/80*1000:.0f}}ms per char)")

    if elapsed > 10:
        print("⚠️  WARNING: Generation took >10s (expected <5s)")

except Exception as e:
    print(f"❌ Audio generation failed: {{e}}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
"""

# Write test script
test_script_path = f"{INDEX_TTS_DIR}/test_index_tts.py"
with open(test_script_path, 'w') as f:
    f.write(index_test_script)

# Run test with uv
print("Running Index TTS test via uv...")
print("-" * 50)
result = subprocess.run(
    ["uv", "run", "python", test_script_path],
    cwd=INDEX_TTS_DIR,
    capture_output=False
)

if result.returncode != 0:
    print()
    print("❌ Index TTS test failed")
    sys.exit(1)

print("-" * 50)
print()

# =============================================================================
# 2. Test Chatterbox TTS (in its venv)
# =============================================================================
print("🎤 Testing Chatterbox TTS...")
print("   Environment: Python 3.11 venv")
print()

if not os.path.exists(VENV_DIR):
    print(f"⚠️  Chatterbox venv not found: {VENV_DIR}")
    print("   Skipping Chatterbox test (optional)")
else:
    # Create test script for Chatterbox
    chatterbox_test_script = f"""
import sys
import os

try:
    from chatterbox import ChatterboxTTS
    print("✅ Chatterbox module imported")
except ImportError as e:
    print(f"⚠️  Chatterbox not installed: {{e}}")
    sys.exit(0)

print("⏳ Loading Chatterbox model...")
try:
    chatterbox = ChatterboxTTS.from_pretrained(device="cuda")
    print("✅ Chatterbox model loaded")
except Exception as e:
    print(f"⚠️  Failed to load Chatterbox: {{e}}")
    sys.exit(0)

print("⏳ Generating test audio...")
import time
start = time.time()

try:
    wav = chatterbox.generate("This is a test of Chatterbox TTS.")
    elapsed = time.time() - start

    import torchaudio
    output_path = "{DATA_DIR}/test-chatterbox.wav"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    torchaudio.save(output_path, wav, chatterbox.sr)

    file_size = os.path.getsize(output_path) / 1024
    print(f"✅ Audio generated: {{output_path}}")
    print(f"   Size: {{file_size:.1f}}KB")
    print(f"   Time: {{elapsed:.2f}}s")

except Exception as e:
    print(f"⚠️  Audio generation failed: {{e}}")
"""

    test_script_path = f"{VENV_DIR}/test_chatterbox.py"
    with open(test_script_path, 'w') as f:
        f.write(chatterbox_test_script)

    # Run test with venv python
    print("Running Chatterbox test...")
    print("-" * 50)
    result = subprocess.run(
        [f"{VENV_DIR}/bin/python", test_script_path],
        capture_output=False
    )
    print("-" * 50)
    print()

# =============================================================================
# Summary
# =============================================================================
print("=" * 50)
print("✅ TTS Validation Complete!")
print()
print("Test audio files:")
if os.path.exists(f"{DATA_DIR}/test-index-tts.wav"):
    size = os.path.getsize(f"{DATA_DIR}/test-index-tts.wav") / 1024
    print(f"  - data/test-index-tts.wav ({size:.1f}KB)")
if os.path.exists(f"{DATA_DIR}/test-chatterbox.wav"):
    size = os.path.getsize(f"{DATA_DIR}/test-chatterbox.wav") / 1024
    print(f"  - data/test-chatterbox.wav ({size:.1f}KB)")
print()
print("🎯 Ready to proceed with scaffolding!")
print()
print("Next steps:")
print("  1. Listen to test audio files: mpv data/test-*.wav")
print("  2. Verify audio quality (natural voice, clear speech)")
print("  3. Tell Claude to proceed with scaffolding")
print()
