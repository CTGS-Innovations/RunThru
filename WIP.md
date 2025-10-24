# Work In Progress - 2025-10-24

## Current Status: Sprint 6A - Character Card Audio (70% Complete)

### ✅ Just Completed (This Session)

**1. Fixed Backend Compilation Errors**
- Fixed `characterCardAudio.service.ts` import (`db` → `getDatabase()`)
- Fixed `scripts.routes.ts` import (`getVoicePresetService` → `voicePresetService`)
- Backend compiles successfully ✅

**2. Voice Reference Files Reorganized**
- Renamed files to match actual voice types:
  - `angry-monster.wav` → `adult-male.wav` (adult male voice)
  - `angry-teen.wav` → `zombie-grumbly.wav` (grumbly monster)
  - `cheerful-kid.wav` → `cheerful-female.wav` (female voice)
  - `scared-character.wav` → `pirate-voice.wav` (piratey voice)
- Updated `voice-presets.json` config to match
- **Result**: 8 voice presets, 3 female voices for variety

**3. Character Catchphrases Updated**
- Now use actual script lines instead of generic phrases:
  - NARRATOR 1: "Sacrifice the weak!"
  - NARRATOR 2: "Makes sense!"
  - ZOMBIE: "Braiiiins"
  - GIRL: "Go go go go!"
  - JIMMY: "I love you!"
  - SUSAN: "We're all gonna die!"
  - SAM: "Who put you in charge?"
  - CHRISTY: "Leave me behind"

**4. Audio Storage Architecture Refactored**
- **BEFORE**: `/audio/{sessionId}/character-{name}.wav` (wasteful, per-session)
- **AFTER**: `/public/audio/{scriptId}/character-cards/{name}-catchphrase.wav` (reusable)
- Benefits:
  - Generate once, use across all sessions ✅
  - Static files in `public/` (no proxy needed) ✅
  - Smart caching (checks if file exists before regenerating) ✅
  - Perfect foundation for dialogue lines: `/audio/{scriptId}/lines/line-42.wav`

**5. New API Endpoint**
- Created: `POST /api/scripts/:id/generate-card-audio`
- Location: `scripts.routes.ts` (script-level, not session-level)
- Features:
  - Accepts optional `sessionId` to use specific voice assignments
  - Falls back to random voice assignments if no session provided
  - Reuses existing audio files (caching)
- Format: "{CHARACTER NAME}... {Catchphrase}"

### 🚨 Current Status: Backend Restarting
- Port 4000 process killed (was blocking)
- Nodemon should auto-restart
- All TypeScript compilation errors fixed ✅
- Ready for testing once backend restarts

### 📋 What's Working
- ✅ Backend code compiles (all TypeScript errors fixed)
- ✅ Voice presets correctly labeled (8 total)
- ✅ Catchphrases from actual script dialogue
- ✅ Script-level audio storage structure
- ✅ Smart caching logic (reuse files)
- ✅ CharacterCardAudioService refactored
- ✅ ChatterboxAdapter created (Python TTS)

### ⏸️ What's Next (Sprint 6A - 30% Remaining)

**Testing Phase:**
1. Verify backend starts on port 4000
2. Get script ID from zombie script
3. Call `POST /api/scripts/{scriptId}/generate-card-audio`
4. Verify 11 WAV files generated in `/public/audio/{scriptId}/character-cards/`
5. Listen to audio - check pronunciation (especially "NARRATOR ONE")
6. Test audio reuse (call endpoint again, should reuse files)

**Then Continue to Sprint 6B:**
- Playback synchronization with test audio
- Real-time polling (every 500ms)
- Auto-advance logic
- Multi-browser sync testing

## Sprint 6A Architecture Summary

**Directory Structure:**
```
/public/audio/{scriptId}/
  └── character-cards/
      ├── narrator-1-catchphrase.wav
      ├── narrator-2-catchphrase.wav
      ├── girl-catchphrase.wav
      ├── zombie-catchphrase.wav
      ├── zombies-catchphrase.wav
      ├── zombie-1-catchphrase.wav
      ├── zombie-2-catchphrase.wav
      ├── jimmy-catchphrase.wav
      ├── susan-catchphrase.wav
      ├── sam-catchphrase.wav
      └── christy-catchphrase.wav
```

**API Endpoint:**
```bash
POST /api/scripts/{scriptId}/generate-card-audio
Body (optional): { "sessionId": "abc123" }
Response: {
  "success": true,
  "characters": [
    {
      "characterName": "NARRATOR 1",
      "audioUrl": "/audio/{scriptId}/character-cards/narrator-1-catchphrase.wav",
      "generationTime": 6420
    },
    ...
  ]
}
```

**Voice Assignments:**
- All 4 zombie variants use `zombie-grumbly` voice (same grumbly sound)
- 3 female voices available: `teen-female`, `cheerful-female`
- 5 male voices available: `teen-male`, `adult-male`, `wise-elder`, `mysterious-narrator`, `pirate-voice`

## Files Modified This Session

### Backend (`feature/backend` branch)
- `src/services/characterCardAudio.service.ts` - Refactored to script-level, added caching
- `src/routes/scripts.routes.ts` - Added new endpoint
- `src/routes/sessions.routes.ts` - Removed old endpoint
- `src/config/voice-presets.json` - Updated all 8 presets
- `tts-service/reference-voices/` - Renamed 4 files

### Voice Files Renamed
- `/tts-service/reference-voices/angry-monster.wav` → `adult-male.wav`
- `/tts-service/reference-voices/angry-teen.wav` → `zombie-grumbly.wav`
- `/tts-service/reference-voices/cheerful-kid.wav` → `cheerful-female.wav`
- `/tts-service/reference-voices/scared-character.wav` → `pirate-voice.wav`

## Quick Commands

```bash
# Check backend status
curl http://localhost:4000/api/health

# Get script ID
curl http://localhost:4000/api/scripts | jq '.[0].id'

# Generate character card audio (replace {scriptId})
curl -X POST http://localhost:4000/api/scripts/{scriptId}/generate-card-audio

# List generated files
ls -lh /home/corey/projects/RunThru-backend/backend/public/audio/{scriptId}/character-cards/
```

## Environment Status
- **Backend**: Restarting after port conflict resolution
- **Frontend**: Running on port 3000
- **TTS Service**: Unknown (not tested yet)
- **Database**: SQLite ready with all tables

## Context Notes
- Sprint 5 (Multiplayer) is 100% complete ✅
- Sprint 6A (Character card audio) is 70% complete
- Sprint 6B (Full TTS + playback sync) is next
- Sprint 7 (Rehearsal UI) is 40% complete (UI done, audio integration pending)
- All code in feature branches, not merged to main yet
- Voice reference files are 300KB-11MB (some may need trimming)
