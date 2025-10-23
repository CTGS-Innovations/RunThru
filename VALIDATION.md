# 🧪 Infrastructure Validation Guide

Before scaffolding the application, we validate that all infrastructure components work correctly. This catches issues early when they're easy to fix.

---

## 📋 Validation Checklist

```
✅ Prerequisites Validated
├─ ✅ Git worktrees configured
├─ ✅ Development tools installed (Node.js, Python, Docker)
├─ ⏳ GPU accessible and working
├─ ⏳ TTS models downloaded
├─ ⏳ TTS inference works
├─ ⏳ Docker GPU passthrough works
└─ ⏳ Data directories created
```

---

## 🚀 Step-by-Step Validation

### Step 1: Validate Basic Infrastructure

**Run:**
```bash
cd /home/corey/projects/RunThru
./validate-infrastructure.sh
```

**What it checks:**
- ✅ Git worktrees exist
- ✅ TASKS.md symlinks work
- ✅ GPU is accessible (nvidia-smi)
- ✅ Node.js 20+ installed
- ✅ Python 3.11+ installed
- ✅ Docker installed
- ✅ nvidia-docker runtime available
- ✅ Data directory structure
- ✅ Disk space (>= 20GB available)

**Expected output:**
```
✅ All critical checks passed!

Next steps:
1. Download TTS models (if not already done):
   ./download-tts-models.sh

2. Run TTS validation:
   ./validate-tts.py
```

---

### Step 2: Download TTS Models (~6GB, 5-10 minutes)

**Run:**
```bash
./download-tts-models.sh
```

**What it does:**
1. **Creates Python virtual environment** at `/home/corey/projects/RunThru-backend/tts-service/venv/`
2. Installs HuggingFace CLI (in venv)
3. Installs PyTorch with CUDA 12.1 support (in venv)
4. Downloads Index TTS models (~6GB) to `data/models/index-tts/`
5. Installs Chatterbox TTS (in venv)

**Why virtual environment?**
Modern Linux distros use PEP 668 to prevent breaking system Python packages. A venv keeps TTS dependencies isolated and clean.

**Expected output:**
```
✅ All TTS models downloaded successfully!

Model locations:
  - Index TTS: data/models/index-tts (5.8GB)
  - Chatterbox: (installed via pip)
```

**Note:** This is the slowest step. Good time for a coffee break!

---

### Step 3: Validate TTS Inference

**Run (choose one):**

**Option A:** Direct execution
```bash
./validate-tts.py
```

**Option B:** Using venv helper
```bash
./run-in-venv.sh python validate-tts.py
```

**Option C:** Activate venv manually
```bash
source /home/corey/projects/RunThru-backend/tts-service/venv/bin/activate
python validate-tts.py
deactivate
```

**What it tests:**
1. PyTorch can see your GPU
2. Index TTS models load correctly
3. Can generate audio with Index TTS
4. VRAM usage is acceptable (< 10GB)
5. Generation speed is reasonable (< 5s per line)
6. Chatterbox works (optional)

**Expected output:**
```
✅ TTS Validation Complete!

Summary:
  - GPU: NVIDIA GeForce RTX 3090
  - Index TTS: Working (6.2GB VRAM)
  - Generation speed: ~2.3s per line

Test audio files:
  - data/test-index-tts.wav
  - data/test-chatterbox.wav

🎯 Ready to proceed with scaffolding!
```

**Critical:** Listen to the test audio files!
```bash
# Play test audio (Linux)
aplay data/test-index-tts.wav

# Or open in file manager and double-click
```

**What to listen for:**
- Audio should be clear (not distorted)
- Speech should be natural-sounding
- No crackling or artifacts

---

### Step 4: Validate Docker GPU Passthrough (Optional)

**Run:**
```bash
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi
```

**Expected output:**
Should show your RTX 3090 inside the container.

**Why optional?**
- Not needed for development (you'll run TTS service natively)
- Only needed for production deployment (docker-compose)
- Can validate later before deployment

---

## 🚨 Troubleshooting

### Issue: "CUDA not available"

**Symptoms:**
```
❌ CUDA not available - TTS will be SLOW
```

**Solutions:**
1. Check GPU is visible: `nvidia-smi`
2. Check CUDA drivers: `nvidia-smi | grep "CUDA Version"`
3. Reinstall PyTorch with CUDA:
   ```bash
   pip3 install --force-reinstall torch torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

---

### Issue: "Index TTS models not found"

**Symptoms:**
```
❌ Index TTS config.yaml not found
```

**Solutions:**
1. Run download script: `./download-tts-models.sh`
2. Check manually:
   ```bash
   ls -la data/models/index-tts/
   # Should see config.yaml and model files
   ```
3. If download failed, try manual download:
   ```bash
   pip install huggingface-hub
   huggingface-cli download IndexTeam/IndexTTS-2 --local-dir=data/models/index-tts
   ```

---

### Issue: "Out of memory" during TTS validation

**Symptoms:**
```
torch.cuda.OutOfMemoryError: CUDA out of memory
```

**Solutions:**
1. Check VRAM usage: `nvidia-smi`
2. Close other GPU processes
3. Try with smaller FP16 precision (already enabled in script)
4. If still fails: Your 3090 should have 24GB, check what's using it

---

### Issue: "Audio file generated but no sound"

**Symptoms:**
File exists but is silent or corrupted.

**Solutions:**
1. Check file size: `ls -lh data/test-index-tts.wav`
   - Should be > 100KB
2. Check audio with: `file data/test-index-tts.wav`
   - Should say "WAVE audio"
3. Try different text in validate-tts.py
4. Check model download is complete:
   ```bash
   du -sh data/models/index-tts/
   # Should be ~6GB
   ```

---

### Issue: "nvidia-docker not available"

**Symptoms:**
```
⚠️  nvidia-docker runtime not available
```

**Solutions:**
1. Install nvidia-docker:
   ```bash
   # Ubuntu/Debian
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
     sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   sudo apt-get update && sudo apt-get install -y nvidia-docker2
   sudo systemctl restart docker
   ```
2. Test: `docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi`

---

## ✅ Validation Complete Checklist

Before proceeding to scaffolding, verify:

- [x] `./validate-infrastructure.sh` passes
- [x] `./download-tts-models.sh` completes successfully
- [x] `./validate-tts.py` generates audio
- [x] Test audio files sound natural (listened to them)
- [x] VRAM usage is acceptable (< 10GB)
- [x] Generation speed is reasonable (< 5s per line)

**Optional (for production deployment):**
- [ ] Docker GPU passthrough works
- [ ] Can run `docker-compose up` successfully

---

## 🎯 Next Steps

Once all validation passes:

1. **Update TASKS.md:**
   ```markdown
   - [x] Validate infrastructure (GPU, TTS, Docker)
   - [ ] 🔄 IN PROGRESS: Scaffold frontend
   ```

2. **Tell Claude to proceed:**
   > "All validation passed. Ready to scaffold frontend and backend."

3. **Claude will scaffold** the application structure in parallel worktrees

---

## 📊 Expected Performance Metrics

After validation, you should see:

| Metric | Target | Your Result |
|--------|--------|-------------|
| GPU | RTX 3090 24GB | ? |
| Index TTS load time | < 30s | ? |
| Index TTS VRAM usage | < 10GB | ? |
| Audio generation (80 chars) | < 5s | ? |
| Audio quality | Natural-sounding | ? |

Fill in "Your Result" column as you validate, and document in TASKS.md if targets aren't met.

---

*This validation ensures a smooth development experience. Issues caught here are easy to fix; issues caught during feature development are disruptive.*
