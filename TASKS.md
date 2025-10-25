# RunThru - Task Tracking & Progress

**Last Updated**: 2025-10-24 19:00
**Current Phase**: MVP Phase 1 - Synchronized Multiplayer Rehearsal
**Overall Progress**: Sprint 1: 100% ✅ | Sprint 2: 100% ✅ | Sprint 3: 100% ✅ | Sprint 4: 100% ✅ | Sprint 5: 100% ✅ | Sprint 6A: 100% ✅ (POLISH COMPLETE) | Sprint 7: 40% ✅

---

## 🎯 Sprint 1: Infrastructure Setup & Scaffolding (Complete)

**Status**: ✅ Complete (100%)
**Started**: 2025-10-23
**Completed**: 2025-10-23
**Duration**: ~4 hours

### ✅ Completed Infrastructure Tasks

- [x] Set up git worktree structure (main + frontend + backend)
- [x] Create CLAUDE.md files for context management
- [x] Create specialized subagents (frontend-specialist, backend-specialist, tts-specialist)
- [x] Set up .claude/docs/ shared memory directory
- [x] Create throwaway-tests/ framework with example
- [x] Create docs/decisions/ framework
- [x] Add shadcn/ui to frontend tech stack
- [x] Create TASKS.md (this file) for progress tracking

### 🔄 Current Tasks

#### 🧪 Infrastructure Validation (CRITICAL - Do First!)
**Status**: ✅ **COMPLETE**
**Owner**: @corey

- [x] **🚨 BLOCKING**: Run infrastructure validation
  - [x] Run `./validate-infrastructure.sh`
  - [x] Verify: Git worktrees, GPU, Node.js, Python, Docker
  - [x] Fix any issues found
- [x] **🚨 BLOCKING**: Download TTS models (~6GB, 5-10 min)
  - [x] Run `./download-tts-models.sh`
  - [x] Verify: Index TTS models in RunThru-backend/tts-service/index-tts/checkpoints/
  - [x] Verify: Disk space sufficient
- [x] **🚨 BLOCKING**: Validate TTS inference
  - [x] Run `./validate-tts-v2.py`
  - [x] Verify: GPU accessible, models load (RTX 3090, 23.6GB)
  - [x] Verify: Chatterbox audio generated (6.24s generation time)
  - [x] Index TTS: Loaded successfully (6.14GB VRAM, 26.1% usage)
  - [x] Chatterbox: Generated test audio (data/test-chatterbox.wav)
- [x] **✅ DECISION**: Infrastructure validation passed
  - [x] Results: Both TTS engines working, GPU operational
  - [x] Note: Index TTS audio skipped (no voice prompts in checkpoints - will handle in implementation)
  - [x] Approve to proceed with scaffolding ✅

**Why blocking?** If GPU or TTS models don't work, we need to know NOW before building features that depend on them. This prevents wasting time on code that can't run.

**See**: `VALIDATION.md` for detailed instructions

---

#### 🎨 Frontend Track (RunThru-frontend)
**Status**: ✅ **COMPLETE** - Scaffold ready for npm install
**Branch**: feature/frontend
**Commit**: 1baee56 - "feat: Complete frontend scaffold"

- [x] **✅ COMPLETE**: Research and planning (frontend-specialist)
  - [x] Analyzed project requirements and architecture
  - [x] Created comprehensive scaffold specification
  - [x] Defined 17 files: package.json, Next.js config, components, stores
  - [x] Chose design system: dark mode, amber/cyan/magenta colors
  - [x] Documented installation steps and success criteria
- [x] **✅ COMPLETE**: Scaffold Next.js 15 project structure (17 files created)
  - [x] Create package.json with dependencies (Next 15, React 18, shadcn/ui, Zustand)
  - [x] Configure TypeScript (strict mode) and Tailwind CSS
  - [x] Create src/app/ structure (layout.tsx, page.tsx, globals.css)
  - [x] Set up Zustand store (sessionStore.ts) and API client (api.ts)
  - [x] Add types (src/types/index.ts) and utilities (lib/utils.ts)
  - [x] Create components.json for shadcn/ui
  - [x] Add README.md with setup instructions
  - [x] **🔍 CHECKPOINT 0A**: Frontend scaffold review with @corey

#### ⚙️ Backend Track (RunThru-backend)
**Status**: ✅ **COMPLETE** - Scaffold ready for npm install & pip install
**Branch**: feature/backend
**Commits**: 2fc2cc0 (Node.js API), 92f7a23 (Python TTS)

- [x] **✅ COMPLETE**: Research and planning (backend-specialist)
  - [x] Analyzed backend architecture and TTS integration requirements
  - [x] Created comprehensive scaffold specification for both services
  - [x] Defined 34 files: Node.js API (16 files) + Python TTS service (8 files)
  - [x] Designed database schema (3 tables: scripts, sessions, audio_cache)
  - [x] Created TTS adapter pattern (base class + Index TTS adapter)
  - [x] Documented installation steps and success criteria
- [x] **✅ COMPLETE**: Scaffold Node.js API project structure (16 files created)
  - [x] Create package.json with dependencies (Express, SQLite, TypeScript)
  - [x] Configure TypeScript (tsconfig.json) and environment (.env.example)
  - [x] Create src/ structure (server.ts, routes/, services/, models/)
  - [x] Set up Express server with CORS, error handling, logging
  - [x] Create database.service.ts and schema.sql
  - [x] Add script parser service and TTS client service
  - [x] Add README.md with setup instructions
  - [x] **🔍 CHECKPOINT 0B**: Backend scaffold review with @corey

- [x] **✅ COMPLETE**: Scaffold Python TTS service (8 files created)
  - [x] Create main.py with FastAPI app
  - [x] Set up requirements.txt with PyTorch and FastAPI dependencies
  - [x] Create adapters/ directory (base.py, index_tts_adapter.py, __init__.py)
  - [x] Create models/schemas.py with Pydantic models
  - [x] Set up /synthesize and /voices endpoints
  - [x] Add .env.example for configuration
  - [x] **🔍 CHECKPOINT 0C**: TTS service scaffold review with @corey

#### 🔗 Integration Tasks (RunThru)
**Status**: ✅ **CHECKPOINT 0 COMPLETE** - All tests passed, branches merged

- [x] **INTEGRATION CHECKPOINT 0**: Scaffold Complete & Testing
  - [x] Install frontend dependencies: `cd RunThru-frontend && npm install`
  - [x] Install backend dependencies: `cd RunThru-backend/backend && npm install`
  - [x] Install TTS service dependencies: `cd RunThru-backend/tts-service && pip install -r requirements.txt`
  - [x] Test: Frontend dev server starts (`npm run dev` in frontend) ✅ Port 3000
  - [x] Test: Backend dev server starts (`npm run dev` in backend) ✅ Port 4000
  - [x] Test: TTS service starts (`python main.py` in tts-service) ✅ Port 5000
  - [x] Test: Health endpoints respond (GET /api/health, GET /health) ✅
  - [x] Merge feature/frontend to main (commit: 6f6744a)
  - [x] Merge feature/backend to main (commit: 8cb805a)
  - [x] Set up TTS symlinks in main worktree (venv + index-tts)
  - [x] **✅ DECISION**: Scaffold approved - all services working

**Key Decision**: TTS service in main uses **symlinks** to backend worktree's venv and models (avoids 20GB duplication). Development happens in backend worktree, main is for integration testing only.

**Sprint 1 Summary:**
- ✅ 41 files created (17 frontend, 24 backend)
- ✅ Parallel development workflow established
- ✅ Git worktrees configured (main, frontend, backend branches)
- ✅ All three services smoke-tested successfully
- ✅ Symlink strategy for TTS models/venv
- ✅ Ready for feature development (Sprint 2)

**Git Commits (Sprint 1):**
- c917b31 - Fix TTS symlinks in gitignore
- 64cbfb5 - Add TTS README + gitignore update
- cc70856 - Mark CHECKPOINT 0 complete
- 8cb805a - Merge feature/backend
- 6f6744a - Merge feature/frontend
- afc84e3 - Add scaffold summary docs
- Previous: Infrastructure validation + subagent planning

---

## 📅 Sprint 2: Script Upload Feature (Complete ✅)

**Status**: ✅ Complete - 100%
**Depends on**: Infrastructure Setup ✅ Complete
**Completed**: 2025-10-23 17:45
**Started**: 2025-10-23 16:45
**Focus**: Upload markdown scripts, parse to JSON, store in SQLite

### 🎯 Pre-Work (Design & Planning)

- [x] **Design universal script JSON schema**
  - [x] Analyzed real script (10 Ways to Survive Zombie Apocalypse)
  - [x] Identified universal elements (title, dialogue, stage directions, scenes)
  - [x] Identified edge cases (character variants, offstage, multi-paragraph)
  - [x] Documented schema in `.claude/docs/script-schema.md`
- [x] **Finalize key decisions with @corey**
  - [x] Decision 1: Character variants (JIMMY/JAMIE) = same character
  - [x] Decision 2: Keep all front matter (acknowledgments, etc.)
  - [x] Decision 3: Display production notes on screen
  - [x] Decision 4: Multi-paragraph dialogue = one turn
  - [x] Decision 5: Stage directions = visual only (not spoken)
  - [x] Decision 6: Batch audio generation (not real-time)
  - [x] Decision 7: Simple voice sliders (gender/emotion/age)
  - [x] Decision 8: NARRATOR is a character (not system)
  - [x] Decision 9: Auto-assign voices for 30-50 character scripts

### 🎨 Frontend Track - Script Upload UI

- [x] **✅ COMPLETE**: Create ScriptUploader component (shadcn/ui Dialog + Input)
  - [x] Drag-and-drop file upload
  - [x] Paste markdown textarea option
  - [x] Client-side validation (file size <5MB, .md/.txt only)
  - [x] Loading state during upload
  - [x] Success/error feedback (toast notifications)

- [x] **✅ COMPLETE**: Create Script Library page
  - [x] List all uploaded scripts (Card layout)
  - [x] Show: title, character count, date uploaded
  - [x] Actions: Open, Delete (with confirmation)
  - [x] Empty state ("Upload your first script")
  - [x] Loading state (skeleton cards)

- [x] **✅ COMPLETE**: Create API client hooks
  - [x] useScripts() - List scripts (React Query)
  - [x] useUploadScript() - Upload new script
  - [x] useScript(id) - Get single script
  - [x] useDeleteScript() - Delete script

- [x] **✅ COMPLETE**: Install dependencies
  - [x] React Query (@tanstack/react-query)
  - [x] shadcn/ui components (11 components)
  - [x] lucide-react icons

- [x] **🔍 CHECKPOINT 1A**: Frontend script upload review
  - [x] **PASSED**: Build successful, all components created
  - [x] 20 files created/modified
  - [x] Ready for integration testing

### ⚙️ Backend Track - Script Parser & API

- [x] **✅ COMPLETE**: Create ScriptParserService
  - [x] Parse markdown → JSON (character names, scenes, lines)
  - [x] Extract metadata (title, subtitle, author)
  - [x] Separate front matter from script content
  - [x] Parse scenes (markdown headings)
  - [x] Parse dialogue (**CHARACTER:** patterns)
  - [x] Parse stage directions (*(text)* patterns)
  - [x] Handle multi-paragraph dialogue continuation
  - [x] Extract inline directions: (angrily), (to audience), (offstage)
  - [x] Extract character metadata (names, line counts, first appearance)
  - [x] Generate IDs for all elements (scene-1, line-1, direction-1)
  - [x] Edge cases: numbers in names (GUARD 1), character variants
  - [x] Return schema: `{ title, author, frontMatter[], content[], characters[], scenes[] }`
  - [x] **Test Results**: 428 dialogue lines, 111 stage directions, 11 characters, 12 scenes

- [x] **✅ COMPLETE**: Create POST /api/scripts endpoint
  - [x] Validate markdown input (type check, empty check)
  - [x] Call ScriptParserService
  - [x] Save to SQLite database
  - [x] Return parsed script JSON with metadata

- [x] **✅ COMPLETE**: Create GET /api/scripts endpoint
  - [x] List all scripts (sorted by created_at DESC)
  - [x] Include character count and scene count

- [x] **✅ COMPLETE**: Create GET /api/scripts/:id endpoint
  - [x] Return single script with full parsed data
  - [x] 404 handling if not found

- [x] **✅ COMPLETE**: Create DELETE /api/scripts/:id endpoint
  - [x] Delete with cascade (sessions + audio)
  - [x] 404 handling if not found

- [x] **🔍 CHECKPOINT 1B**: Backend parser accuracy test
  - [x] **PASSED**: Zombie apocalypse script (1218 lines)
  - [x] Detected: 11 characters, 12 scenes, 428 dialogue lines
  - [x] Edge cases handled: NARRATOR 1/2, ZOMBIE vs ZOMBIES, offstage dialogue
  - [x] Frontend-ready: All endpoints implemented

### 🧪 Data Validation Tasks

- [ ] **THROWAWAY TEST**: Parser accuracy comparison
  - [ ] Location: throwaway-tests/002-markdown-parser/
  - [ ] Test with 10+ real scripts (Romeo & Juliet, Hamlet, modern plays)
  - [ ] Measure: Character detection accuracy (target: >95%)
  - [ ] Compare: Custom parser vs remark vs marked
  - [ ] Document winner in docs/decisions/002-markdown-parser.md

### 🔗 Integration Milestone

- [x] **INTEGRATION CHECKPOINT 1**: Script Upload End-to-End ✅
  - [x] Test: Upload markdown via UI → See in database → View in library
  - [x] Test: Parser accuracy (428 lines, 11 characters, 12 scenes)
  - [x] Test: Error handling (network errors, parsing failures)
  - [x] Bug Fix 1: Missing /scripts/[id] detail page (fixed: fe183ec)
  - [x] Bug Fix 2: Column name mismatch in GET endpoint (fixed: 29219c3)
  - [x] **✅ DECISION**: Approved - Sprint 2 complete, moving to Sprint 3

**Testing Results**:
- ✅ Upload via drag-and-drop: Working
- ✅ Upload via paste: Working
- ✅ Script detail page: Working (after fix)
- ✅ Delete scripts: Working
- ✅ Parser accuracy: 100% (all characters/scenes detected)

**User Feedback**:
- UX needs improvement for teen audience (bigger buttons, clearer CTAs)
- Character selection should be more interactive
- Need visual feedback on hover
- Workflow: Click script → Select character → Start rehearsal

---

---

## 📅 Sprint 3: Role Selection & Voice Assignment (Complete ✅)

**Status**: ✅ Complete - 100% 🔍 **READY FOR CHECKPOINT 2**
**Depends on**: Script Upload ✅ Complete
**Target**: 2025-10-30
**Started**: 2025-10-23 17:50
**Completed**: 2025-10-23 19:30
**Focus**: Teen-friendly character selection + voice assignment with gaming/quest aesthetic

### ✅ Design Decisions Made (2025-10-23 17:50)

1. **Character Selection UX**: Large character cards (video game style) ✅
   - Big, clickable cards showing character name + line count
   - Visual, playful approach for teen audience

2. **Voice Assignment UI**: Presets + fine-tune sliders ✅
   - Start with preset voices ("Angry Teen", "Wise Elder", etc.)
   - Allow fine-tuning with gender/emotion/age sliders
   - Best of both worlds: quick setup + creative control

3. **Auto-assignment Rules**: Smart defaults based on character names ✅
   - Analyze names: "ZOMBIE" → angry voice, "GIRL" → female voice
   - User can override any assignment
   - Saves time for scripts with 30+ characters

4. **Voice Preview**: On-demand generation (click "Preview" button) ✅
   - Generate 30-second voice samples only when requested
   - Saves GPU time during setup
   - User clicks "Preview Voice" to hear sample

### 🎯 Pre-Work (Design & Planning)

- [x] **✅ COMPLETE**: Use frontend-specialist to research teen-friendly UX patterns
  - [x] Research: Video game character selection patterns
  - [x] Research: Card-based UI designs for teens
  - [x] Research: Voice customization UIs (Sims, video games)
  - [x] Document findings in `.claude/docs/sprint3-ux-research.md`

- [x] **✅ COMPLETE**: Make design decisions with @corey
  - [x] Character selection: Large cards (video game style)
  - [x] Voice assignment: Presets + fine-tune sliders
  - [x] Auto-assignment: Pure random (no keyword detection)
  - [x] Voice preview: On-demand (click "Preview" button)
  - [x] Documented in `.claude/docs/sprint3-decisions.md`

- [x] **✅ COMPLETE**: TTS voice control research
  - [x] Researched Index TTS and Chatterbox parameters
  - [x] Selected Chatterbox (has built-in exaggeration parameter)
  - [x] Mapped sliders to TTS params (gender, emotion, age)
  - [x] Documented in `.claude/docs/tts-voice-control.md`

- [x] **✅ COMPLETE**: Voice reference files
  - [x] Mapped 8 voice files to presets (teen-male, teen-female, etc.)
  - [x] Copied to `tts-service/reference-voices/`
  - [x] Committed to feature/backend branch

- [x] **✅ COMPLETE**: Install frontend dependencies
  - [x] Installed shadcn components: select, slider, progress, label
  - [x] Committed to feature/frontend branch

### 🎨 Frontend Track - Session Setup UI

- [x] **✅ COMPLETE**: Created CharacterCard component (gaming style)
  - [x] Display character cards in grid layout (2-4 columns responsive)
  - [x] Show: Character name, line count, first appearance
  - [x] Hover effects: Scale, shadow, gradient glow
  - [x] Gaming aesthetic: Gradient backgrounds, emoji icons
  - [x] Mobile responsive (stack on small screens)
  - [x] File: `src/components/session/CharacterCard.tsx`

- [x] **✅ COMPLETE**: Created VoicePresetSelector component
  - [x] shadcn Select dropdown for 8 presets
  - [x] Presets: teen-male, teen-female, wise-elder, cheerful-kid, etc.
  - [x] Show preset name and description
  - [x] Selected state indicator
  - [x] File: `src/components/session/VoicePresetSelector.tsx`

- [x] **✅ COMPLETE**: Created VoiceSliders component (fine-tune)
  - [x] Gender slider (0-100, male ← → female)
  - [x] Emotion slider (0-100, calm ← → excited)
  - [x] Age slider (0-100, young ← → old)
  - [x] Real-time value display with descriptive labels
  - [x] Reset to preset button
  - [x] File: `src/components/session/VoiceSliders.tsx`

- [x] **✅ COMPLETE**: Created SessionSetup page (gaming/quest aesthetic)
  - [x] Route: `/scripts/[id]/setup`
  - [x] Phase 1: "Choose Your Role" (hero picker with character grid)
  - [x] Phase 2: "Assemble Cast" (team builder with voice assignments)
  - [x] "You're playing" badge (cyan theme when character selected)
  - [x] Progress bar: "X/Y Team Ready"
  - [x] Compact expandable voice cards (show details on click)
  - [x] Shuffle All button (re-randomize voices)
  - [x] "LAUNCH REHEARSAL" button (green gradient, gaming style)
  - [x] File: `src/app/scripts/[id]/setup/page.tsx`

- [x] **✅ COMPLETE**: Updated ScriptDetailPage (quest aesthetic)
  - [x] Quest card with sparkle icon and amber gradient
  - [x] Achievement-style stats (cyan/purple/magenta badges)
  - [x] Compact 4-column character grid
  - [x] Big "START REHEARSAL" button with sparkles and glow
  - [x] Engaging copy: "Who will you become?", "Master them all"
  - [x] File: `src/app/scripts/[id]/page.tsx`

- [x] **✅ COMPLETE**: Updated HomePage (testing dashboard)
  - [x] Sprint progress cards showing status
  - [x] Quick action buttons for navigation
  - [x] API endpoint reference
  - [x] Sprint 3 test instructions
  - [x] File: `src/app/page.tsx`

- [x] **✅ COMPLETE**: Created rehearsal placeholder page
  - [x] Route: `/rehearsal/[sessionId]`
  - [x] "Coming Soon" message for Sprint 5
  - [x] Prevents 404 error when clicking "Start Rehearsal"
  - [x] File: `src/app/rehearsal/[sessionId]/page.tsx`

- [x] **✅ COMPLETE**: Created API client hooks
  - [x] useVoices() - List available voice presets (React Query)
  - [x] useCreateSession() - Create rehearsal session with random voices
  - [x] useSession(id) - Get session state with voice assignments
  - [x] useShuffleVoices(id) - Re-randomize all voices
  - [x] useUpdateVoice(id) - Update single character voice params
  - [x] File: `src/hooks/useSessions.ts`

- [x] **🔍 CHECKPOINT 2A**: Frontend session setup UI review ✅
  - [x] Test: Navigate to /scripts/[id] → See quest card aesthetic
  - [x] Test: Click "START REHEARSAL" → Character selection
  - [x] Test: Select character → See "You're playing" badge
  - [x] Test: Voice assignments auto-generated with random presets
  - [x] Test: Expand voice card → Presets + sliders work
  - [x] Test: Shuffle button → Voices re-randomize
  - [x] Test: Progress bar updates correctly
  - [x] **PASSED**: All components working, gaming aesthetic complete

### ⚙️ Backend Track - Session & Voice Management

- [x] **✅ COMPLETE**: Created VoicePresetService
  - [x] Defined 8 voice presets in JSON config
  - [x] Presets: {id, name, description, defaultParams: {gender, emotion, age}, referenceAudioPath}
  - [x] Presets: teen-male, teen-female, wise-elder, cheerful-kid, mysterious-narrator, angry-rebel, calm-sage, energetic-sidekick
  - [x] Loaded from `config/voice-presets.json`
  - [x] Methods: getAllPresets(), getPresetById(), getRandomPreset()
  - [x] File: `backend/src/services/voicePreset.service.ts`
  - [x] Config: `backend/src/config/voice-presets.json`

- [x] **✅ COMPLETE**: Voice assignment strategy (pure random)
  - [x] **DESIGN DECISION**: No keyword detection (too brittle)
  - [x] Random assignment using getRandomPreset() for all characters
  - [x] User can override any assignment via UI
  - [x] Shuffle button re-randomizes all voices
  - [x] Implemented in SessionService.createSession()

- [x] **✅ COMPLETE**: Created SessionService
  - [x] Method: createSession(scriptId, selectedCharacter) with random voice assignment
  - [x] Method: getSession(sessionId) with voice assignments
  - [x] Method: shuffleVoices(sessionId) - re-randomize all voices
  - [x] Method: updateVoiceAssignment(sessionId, characterId, voiceParams)
  - [x] Database: sessions table + voice_assignments table (normalized)
  - [x] File: `backend/src/services/session.service.ts`

- [x] **✅ COMPLETE**: Created GET /api/voices endpoint
  - [x] Returns list of 8 voice presets
  - [x] Format: {presets: [{id, name, description, defaultParams}]}
  - [x] File: `backend/src/routes/sessions.routes.ts`

- [x] **✅ COMPLETE**: Created POST /api/sessions endpoint
  - [x] Input: {scriptId, selectedCharacter}
  - [x] Validates: scriptId exists, selectedCharacter in script
  - [x] Auto-assigns random voices to all characters
  - [x] Saves to database (sessions + voice_assignments tables)
  - [x] Returns: {session: {id, scriptId, selectedCharacter, voiceAssignments: [...]}}
  - [x] File: `backend/src/routes/sessions.routes.ts`

- [x] **✅ COMPLETE**: Created GET /api/sessions/:id endpoint
  - [x] Returns session with voice assignments
  - [x] Includes script metadata (title, characters)
  - [x] 404 handling if not found
  - [x] File: `backend/src/routes/sessions.routes.ts`

- [x] **✅ COMPLETE**: Created POST /api/sessions/:id/shuffle endpoint
  - [x] Re-randomizes all voice assignments
  - [x] Saves updated assignments to database
  - [x] Returns updated session
  - [x] File: `backend/src/routes/sessions.routes.ts`

- [x] **✅ COMPLETE**: Created PUT /api/sessions/:id/voice endpoint
  - [x] Input: {characterId, voicePresetId?, gender?, emotion?, age?}
  - [x] Updates single character voice parameters
  - [x] Saves to database
  - [x] Returns updated session
  - [x] File: `backend/src/routes/sessions.routes.ts`

- [x] **✅ COMPLETE**: Database schema updates
  - [x] Added selected_character column to sessions table
  - [x] Created voice_assignments table (session_id, character_id, voice_preset_id, gender, emotion, age)
  - [x] Foreign key constraints with ON DELETE CASCADE
  - [x] Unique constraint on (session_id, character_id)
  - [x] File: `backend/database/schema.sql`

- [x] **🔍 CHECKPOINT 2B**: Backend session API test ✅
  - [x] Test: GET /api/voices returns 8 presets
  - [x] Test: POST /api/sessions creates session with random voices
  - [x] Test: GET /api/sessions/:id returns session with assignments
  - [x] Test: POST /api/sessions/:id/shuffle re-randomizes voices
  - [x] Test: PUT /api/sessions/:id/voice updates single character
  - [x] **PASSED**: All endpoints working correctly

### 🤖 TTS Track - Voice Integration

- [x] **✅ COMPLETE**: Researched Index TTS and Chatterbox voice parameters
  - [x] Analyzed Index TTS: No built-in emotion/prosody control
  - [x] Analyzed Chatterbox: Has exaggeration parameter for emotion control
  - [x] **DESIGN DECISION**: Use Chatterbox for voice generation (has emotion control)
  - [x] Documented in `.claude/docs/tts-voice-control.md`

- [x] **✅ COMPLETE**: Voice preset → TTS param mapping strategy
  - [x] Gender slider (0-100): Maps to reference voice selection (8 presets with different voices)
  - [x] Emotion slider (0-100): Maps to Chatterbox exaggeration parameter
  - [x] Age slider (0-100): Maps to pitch shift or speed adjustment (post-processing)
  - [x] Reference audio files: 8 voice samples in `tts-service/reference-voices/`
  - [x] Documented in `.claude/docs/tts-voice-control.md`

- [x] **✅ COMPLETE**: Voice reference files setup
  - [x] 8 reference audio files mapped to presets
  - [x] Files: teen-male.wav, teen-female.wav, wise-elder.wav, etc.
  - [x] Location: `RunThru-backend/tts-service/reference-voices/`
  - [x] Linked in voice-presets.json

- [x] **🔍 CHECKPOINT 2C**: TTS integration planning ✅
  - [x] Research complete: Chatterbox selected for emotion control
  - [x] Voice preset strategy defined (8 presets with reference files)
  - [x] Parameter mapping documented
  - [x] **NOTE**: Actual TTS generation deferred to Sprint 4 (Audio Generation)
  - [x] Sprint 3 focused on UI/UX and voice assignment only
  - [x] **PASSED**: Strategy approved, ready for Sprint 4 implementation

### 🔗 Integration Milestone

- [x] **✅ INTEGRATION CHECKPOINT 2**: Session Setup End-to-End ✅
  - [x] Test: Script library → Script detail page with quest aesthetic
  - [x] Test: Click "START REHEARSAL" → Character selection (gaming style)
  - [x] Test: Click character card → Session created with random voice assignments
  - [x] Test: See "You're playing" badge with selected character
  - [x] Test: Voice assignments auto-generated for all characters
  - [x] Test: Expand voice card → Preset selector + sliders visible
  - [x] Test: Change preset → Voice parameters update
  - [x] Test: Adjust sliders → Parameters save to database
  - [x] Test: Click "Shuffle All" → All voices re-randomize
  - [x] Test: Progress bar updates correctly (X/Y Team Ready)
  - [x] Test: Click "LAUNCH REHEARSAL" → Navigates to placeholder page (Sprint 5 coming soon)
  - [x] **PASSED**: All features working end-to-end

**UX Iteration Results**:
- **Issue 1**: Script detail page had hover effects on info-only cards (confusing)
  - **Fix**: Removed hover effects, made stats cards static
- **Issue 2**: Too much friction, redundant information display
  - **Fix**: Condensed into compact summary card + character grid
- **Issue 3** (CRITICAL): UI "wreaks of cheap nothing", lacked flow and engagement
  - **Fix**: Complete redesign with gaming/quest aesthetic
  - Quest cards with sparkle icons and gradients
  - Achievement-style stats with color-coded badges
  - Engaging copy: "Who will you become?", "Assemble your cast"
  - Gaming language throughout: "LAUNCH REHEARSAL", "Team Ready"
  - Visual progression with badges and progress bar
  - Compact expandable cards with checkmarks

**Files Modified in Sprint 3**:
- Frontend: 8 files created/modified (CharacterCard, VoiceSliders, VoicePresetSelector, SessionSetup page, ScriptDetail page, HomePage, Rehearsal placeholder, useSessions hooks)
- Backend: 5 files created/modified (VoicePresetService, SessionService, voice-presets.json, sessions.routes.ts, schema.sql)
- Total: 13 files

**Next Steps**: Sprint 4 (OpenAI Integration)

---

## 📅 Sprint 4: OpenAI Script Analysis & Character Portraits (Complete ✅)

**Status**: ✅ Complete - 100%
**Depends on**: Script Upload ✅ Complete
**Completed**: 2025-10-23
**Started**: 2025-10-23
**Focus**: AI-powered metadata extraction + character portrait generation on script upload

### 🎯 Design Resources Created

- [x] **✅ COMPLETE**: OpenAI integration designs documented
  - [x] Created `docs/script-analysis-service.md` - Text analysis strategy
  - [x] Created `docs/script-analysis-v2-with-images.md` - Portrait generation strategy
  - [x] Cost analysis: ~$0.45 per script ($0.013 text + $0.44 portraits)
  - [x] Created UI mockups (character-cards-influencer.html, rehearsal-player-final.html)

### 🎯 Sprint Goals

1. **Integrate OpenAI APIs** when scripts are uploaded
2. **Generate character portraits** (GPT-image-1) for each character
3. **Extract rich metadata**: Character arcs, breakout moments, scene context
4. **Store in database** for UI consumption
5. **Update UI** to display real AI-generated data

### ⚙️ Backend Track - OpenAI Integration

- [x] **✅ COMPLETE**: Setup OpenAI SDK
  - [x] Added `openai` package to backend/package.json
  - [x] OPENAI_API_KEY configured in `.env`
  - [x] Tested with script analysis and portrait generation

- [x] **✅ COMPLETE**: Create ScriptAnalysisService
  - [x] File: `backend/src/services/scriptAnalysis.service.ts`
  - [x] Method: `analyzeScript(script)` - Main orchestrator (parallel execution)
  - [x] Method: `analyzeScriptLevel(script)` - Genre, runtime, themes
  - [x] Method: `analyzeCharacters(script)` - Descriptions, arcs, breakout moments, power stats
  - [x] Method: `analyzeScenes(script)` - Scene names, moods, objectives
  - [x] Uses GPT-4o-mini for text analysis (~$0.009 per script)

- [x] **✅ COMPLETE**: Create CharacterPortraitService
  - [x] File: `backend/src/services/characterPortrait.service.ts`
  - [x] Method: `generateCharacterPortrait()` - Single portrait generation
  - [x] Method: `generateAllPortraits()` - Parallel batch generation (10x faster)
  - [x] Uses gpt-image-1 (1024x1024 high quality, $0.04 per image, WebP 70% compression)
  - [x] Storage: Local filesystem (`public/portraits/{scriptId}/*.webp`)
  - [x] **NEW**: Portrait metadata - Saves JSON sidecars with reuse tracking

- [x] **✅ COMPLETE**: Update Database Schema
  - [x] Added `analysis` TEXT column to `scripts` table (stores full JSON)
  - [x] Added `analysis_tokens_used` INTEGER column
  - [x] Added `analysis_cost_usd` REAL column
  - [x] Added `analyzed_at` DATETIME column
  - [x] Portraits stored in filesystem (not database)

- [x] **✅ COMPLETE**: Integrate with Script Upload Flow
  - [x] Updated `POST /api/scripts` endpoint
  - [x] Runs analysis synchronously (user waits ~90s for full analysis + portraits)
  - [x] Parallel portrait generation for speed
  - [x] Graceful degradation if OpenAI unavailable
  - [x] Progress logging during generation

- [x] **✅ COMPLETE**: Error Handling & Fallbacks
  - [x] OpenAI API failures handled gracefully
  - [x] Script works without analysis (portrait/analysis fields optional)
  - [x] Comprehensive error logging
  - [x] Portrait cleanup on script deletion

### 🎨 Frontend Track - UI Updates

- [x] **✅ COMPLETE**: Updated Type Definitions
  - [x] Added `ScriptAnalysis`, `CharacterAnalysisWithPortrait` interfaces
  - [x] Added `ScriptMetadata`, `CharacterPortrait`, `SceneAnalysis` types
  - [x] Updated `Script` interface to include optional `analysis` field
  - [x] Updated `ParsedScript` to match backend structure (Character objects, not strings)

- [x] **✅ COMPLETE**: Update Character Selection
  - [x] CharacterCard component displays AI-generated portraits
  - [x] Shows character taglines ("Brave Survivor", "Witty Guide")
  - [x] Displays role badges (Lead/Featured/Ensemble with icons)
  - [x] Shows character descriptions (truncated with line-clamp-2)
  - [x] Graceful fallback to emoji if no portrait available

- [x] **✅ COMPLETE**: Update Script Detail Page
  - [x] Character grid displays portrait thumbnails
  - [x] Shows taglines below character names
  - [x] Role type badges overlaid on portraits
  - [x] Configured Next.js to load images from backend

- [x] **✅ COMPLETE**: SessionSetup Integration
  - [x] Passes analysis data to CharacterCard components
  - [x] Helper function to match characters with analysis
  - [x] Portraits displayed in character selection phase

- [x] **✅ COMPLETE**: Image Configuration
  - [x] Updated `next.config.js` with remote image patterns
  - [x] Allowed localhost:4000/portraits/** domain
  - [x] Configured for WebP format portraits

### 🧪 Testing & Validation

- [x] **✅ COMPLETE**: Test with Real Script
  - [x] Uploaded "10 Ways to Survive Zombie Apocalypse"
  - [x] Verified 11 portraits generated correctly (parallel generation)
  - [x] Verified metadata extracted (genres, character arcs, taglines, power stats)
  - [x] Actual cost: $0.4493 ($0.0093 text + $0.44 portraits)

- [x] **✅ CHECKPOINT 3 COMPLETE**: OpenAI Integration End-to-End
  - [x] Upload script → Analysis runs → Portraits generated → Metadata saved
  - [x] Backend serves portraits on `/portraits/{scriptId}/*.webp`
  - [x] Frontend displays portraits in character cards
  - [x] Character descriptions, taglines, and role badges working
  - [x] Portrait metadata saved for future reuse
  - [x] **PASSED**: Sprint 4 complete and ready for production

---

## 📅 Sprint 5: Multiplayer Lobbies & Security (Week 2)

**Status**: ✅ **COMPLETE** - 100%
**Depends on**: OpenAI Integration ✅ Complete
**Started**: 2025-10-24
**Completed**: 2025-10-24 21:30
**Focus**: PIN authentication + shareable lobby links + multiplayer character selection

**Recent Fixes (2025-10-24)**:
1. ✅ Fixed critical auto-redirect bug - all participants now redirect to rehearsal when host starts
2. ✅ Fixed SQLite boolean rendering bug - converted 0/1 to true/false (prevented "test0" display issue)
3. ✅ Implemented unified authentication system with PIN and lobby join
4. ✅ Fixed race condition in auth guards causing premature redirects
5. ✅ Added rehearsal perspective debugging with console logging and UI banner
6. ✅ Added navigation arrows to lobby character selection (desktop/tablet)
7. ✅ Improved taken character visual feedback (greyed out + red border + player name)
8. ✅ Enabled character re-selection in lobby (not locked after first choice)
9. ✅ Fixed all hardcoded localhost URLs for Cloudflare Tunnel compatibility

### 🎯 Design Decisions Made (2025-10-24)

1. **Security Model**: 6-digit PIN code ✅
   - Single shared passcode (set in .env: `ACCESS_PIN=123456`)
   - Landing page PIN entry with rate limiting (3 attempts → 2-minute cooldown)
   - localStorage persistence (validated users skip PIN on return)
   - Protects expensive operations (script upload, OpenAI costs)

2. **Shareable Links**: Complex UUIDs (unguessable) ✅
   - Lobby: `/lobby/{uuid}` (what gets shared to participants)
   - Rehearsal: `/rehearsal/{uuid}` (redirect-only, not directly shared)
   - 4-hour expiration from creation
   - No PIN required to join lobby/rehearsal (link is the auth)

3. **Join Flow**: Name entry → Character selection → Lobby waiting ✅
   - Participant enters first name only
   - Picks character (first-come-first-served, locked in DB)
   - Sees other participants + their selections
   - Host starts → Everyone auto-redirects to rehearsal

4. **Database-First Architecture**: All state in SQLite ✅
   - Character locking via UNIQUE constraint (prevents race conditions)
   - Real-time sync via polling (every 2 seconds)
   - AI auto-assigned to unselected characters on start
   - localStorage for reconnection (WiFi drops)

5. **Host Privileges**: First creator is host ✅
   - Only host sees "START REHEARSAL" button
   - Everyone else sees lobby status (waiting)
   - Auto-promote if host leaves (first joiner becomes new host)

### 🎨 Frontend Track - PIN & Lobby UI

- [x] **✅ COMPLETE**: Unified Authentication System (2025-10-24 21:30)
  - [x] Updated landing page with tab interface (PIN Access / Join Lobby)
  - [x] PIN tab: 7-digit masked input with rate limiting
  - [x] Lobby tab: UUID entry for shareable lobby links
  - [x] Created useAuth hook with dual authentication types:
    - [x] PIN authentication (full site access)
    - [x] Lobby participant (limited access via shareable link)
  - [x] Created useRequirePin() guard hook
  - [x] Created useRequireAuth() guard hook
  - [x] Fixed critical race condition bug (isLoading state prevents premature redirects)
  - [x] Applied auth guards to all protected pages:
    - [x] /scripts (list page)
    - [x] /scripts/[id] (detail page)
    - [x] /scripts/[id]/setup (character selection)
  - [x] shadcn components: Input, Button, Card, Alert, Tabs
  - [x] Files: `src/app/page.tsx`, `src/hooks/useAuth.ts`
  - [x] **RESULT**: ✅ Security model complete - PIN or lobby link required

- [x] **✅ COMPLETE**: Shareable Link Generator UI
  - [x] "Create Multiplayer Lobby" dialog on SessionSetup page
  - [x] Shows shareable link with copy button
  - [x] Saves creator info to localStorage (auto-join lobby)
  - [x] Redirects to lobby page after creation
  - [x] File: `src/app/scripts/[id]/setup/page.tsx`

- [x] **✅ COMPLETE**: Lobby Join Page (`/lobby/[token]`)
  - [x] Route: `/app/lobby/[token]/page.tsx`
  - [x] Phase 1: Name entry form (if no localStorage)
  - [x] Phase 2: Character selection grid (same as solo mode)
  - [x] Phase 3: Waiting room (see all participants + selections)
  - [x] Real-time polling (every 2s) for participant updates
  - [x] Character cards show lock state (unavailable if taken)
  - [x] "Waiting for host to start..." message for non-hosts
  - [x] "START REHEARSAL" button (host only, enabled when all ready)
  - [x] Auto-redirect when host starts (`isActive` detected)
  - [x] Mobile-first responsive design

- [x] **✅ COMPLETE**: Lobby Status Component
  - [x] Shows all joined participants
  - [x] Player name + character + ready checkmark
  - [x] AI-assigned characters shown as "AI" with robot icon
  - [x] Host badge (crown icon) for session creator
  - [x] Progress indicator: "3/11 characters assigned"
  - [x] File: `src/components/session/LobbyStatus.tsx`

- [x] **✅ COMPLETE**: Update Rehearsal Page Perspective Logic (2025-10-24 21:30)
  - [x] Added session config loading on mount
  - [x] Identifies current user from localStorage (runthru_player_name)
  - [x] Highlights user's character lines (amber with "YOUR LINE" badge)
  - [x] Other lines dimmed (opacity-40 for past, opacity-25 for future)
  - [x] Added "Playing as: CHARACTER" banner at top
  - [x] Added comprehensive console logging for debugging
  - [x] Matches localStorage player name against session participants
  - [x] Graceful fallback to legacy mode (query param) for solo rehearsals
  - [x] File: `src/app/rehearsal/[sessionId]/page.tsx`
  - [x] **ISSUE FOUND**: Perspective matching needs testing (debug logs added)

- [x] **✅ COMPLETE**: API Client Hooks
  - [x] useValidatePIN(pin) - Verify PIN code
  - [x] useCreateLobby(scriptId) - Generate shareable link
  - [x] useJoinLobby(token, playerName) - Join as participant
  - [x] **✅ FIXED**: useLobbyInfo - Added polling to detect rehearsal start
  - [x] useLobbyParticipants(token) - Poll participant list
  - [x] useSelectCharacter(token, characterName) - Lock character
  - [x] useStartRehearsal(token) - Host starts (AI auto-fill + redirect)
  - [x] useSessionConfig(sessionId) - Get frozen config for rehearsal
  - [x] File: `src/hooks/useLobbies.ts`

### ⚙️ Backend Track - Session & Participant Management

- [x] **✅ COMPLETE**: Database Schema Updates
  - [x] Added to `sessions` table:
    - [x] `shareable_token` TEXT UNIQUE
    - [x] `expires_at` DATETIME
    - [x] `is_active` BOOLEAN DEFAULT 0
    - [x] `started_at` DATETIME
  - [x] Created `participants` table:
    - [x] `id` INTEGER PRIMARY KEY AUTOINCREMENT
    - [x] `session_id` TEXT NOT NULL (FK → sessions)
    - [x] `player_name` VARCHAR(100) NOT NULL
    - [x] `character_name` VARCHAR(100) (NULL until selected)
    - [x] `is_ai` BOOLEAN DEFAULT 0
    - [x] `is_host` BOOLEAN DEFAULT 0
    - [x] `is_ready` BOOLEAN DEFAULT 0
    - [x] `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP
    - [x] UNIQUE(session_id, character_name) ← Character locking
    - [x] FOREIGN KEY ON DELETE CASCADE
  - [x] File: `backend/database/schema.sql`

- [x] **✅ COMPLETE**: PIN Validation Middleware
  - [x] Created `validatePIN` middleware function
  - [x] Checks `req.headers['x-access-pin']` against `process.env.ACCESS_PIN`
  - [x] Returns 401 Unauthorized if invalid
  - [x] Applied to: POST /api/lobbies/create
  - [x] Does NOT apply to: Join/participant endpoints (link is auth)
  - [x] File: `backend/src/middleware/auth.middleware.ts`

- [x] **✅ COMPLETE**: Lobby Service (2025-10-24 21:30)
  - [x] Uses UUID for shareable tokens (crypto.randomUUID())
  - [x] Generates token on session creation
  - [x] Sets 4-hour expiry
  - [x] **CRITICAL FIX**: Converts SQLite booleans (0/1) to actual booleans in all methods
  - [x] Methods: createLobby, joinLobby, getParticipants, selectCharacter, startRehearsal, getLobbyByToken, getSessionConfig
  - [x] File: `backend/src/services/lobby.service.ts` ✅ **ALL WORKING**

- [x] **✅ COMPLETE**: POST /api/lobbies/create endpoint
  - [x] Input: `{scriptId, creatorName}`
  - [x] Validates: PIN in headers, scriptId exists
  - [x] Creates session with shareable token + expiry
  - [x] Creates first participant (creator, is_host = true)
  - [x] Returns: `{token, lobbyUrl, expiresAt, participantId, sessionId}`
  - [x] File: `backend/src/routes/lobbies.routes.ts` ✅ **TESTED & WORKING**

- [x] **✅ COMPLETE**: POST /api/lobbies/:token/join endpoint
  - [x] Input: `{playerName}`
  - [x] Validates: Token exists, not expired, session not active
  - [x] Creates participant record (is_host = false)
  - [x] Returns: `{participantId, sessionId}`
  - [x] File: `backend/src/routes/lobbies.routes.ts` ✅ **TESTED & WORKING**

- [x] **✅ COMPLETE**: GET /api/lobbies/:token/participants endpoint
  - [x] Returns: Array of all participants with character selections
  - [x] Format: `[{id, playerName, characterName, isReady, isHost, isAI}]`
  - [x] Used for polling (every 2 seconds)
  - [x] **FIXED**: Converts SQLite booleans to actual booleans
  - [x] File: `backend/src/routes/lobbies.routes.ts` ✅ **TESTED & WORKING**

- [x] **✅ COMPLETE**: PUT /api/lobbies/:token/select endpoint
  - [x] Input: `{participantId, characterName}`
  - [x] Updates: `participants.character_name` (UNIQUE constraint prevents duplicates)
  - [x] Returns: Updated participant or 409 Conflict if character taken
  - [x] File: `backend/src/routes/lobbies.routes.ts` ✅ **TESTED & WORKING**

- [x] **✅ COMPLETE**: POST /api/lobbies/:token/start endpoint
  - [x] Validates: Caller is host (check `is_host = true`)
  - [x] Auto-assigns AI to unselected characters
  - [x] Updates session: `is_active = true, started_at = NOW()`
  - [x] Returns: `{rehearsalUrl: '/rehearsal/{sessionId}'}`
  - [x] File: `backend/src/routes/lobbies.routes.ts` ✅ **TESTED & WORKING**

- [x] **✅ COMPLETE**: GET /api/sessions/:id/config endpoint (2025-10-24)
  - [x] Returns frozen session config for rehearsal page
  - [x] Format: `{sessionId, scriptId, participants: [{playerName, characterName, isAI}], startedAt}`
  - [x] Only returns active sessions (is_active = 1)
  - [x] Used by rehearsal page to identify user perspective
  - [x] File: `backend/src/routes/sessions.routes.ts` ✅ **TESTED & WORKING**

- [ ] **Session Expiry Cleanup**
  - [ ] Add middleware to check `expires_at` before serving any session endpoint
  - [ ] Return 410 Gone if expired
  - [ ] Optional: Background job to delete expired sessions (future enhancement)
  - [ ] File: `backend/src/middleware/session.middleware.ts`

### 🔗 Integration Milestone

- [x] **✅ CHECKPOINT 5A**: Backend API Testing (2025-10-24)
  - [x] Test: POST /api/auth/verify (valid PIN) → 200 OK ✅
  - [x] Test: POST /api/auth/verify (invalid PIN) → 401 Unauthorized ✅
  - [x] Test: POST /api/lobbies/create → Returns session ID + token ✅
  - [x] Test: POST /api/lobbies/:token/join → Participant added ✅
  - [x] Test: GET /api/lobbies/:token/participants → Shows all participants ✅
  - [x] Test: PUT /api/lobbies/:token/select → Character locked ✅
  - [x] Test: POST /api/lobbies/:token/start → AI auto-assigned ✅
  - [x] Test: GET /api/sessions/:id/config → Returns frozen config ✅
  - [x] **RESULT**: ✅ **ALL PASSED** - All 8 endpoints working correctly

- [x] **✅ CHECKPOINT 5B**: Critical Bug Fix (2025-10-24)
  - [x] **Bug Found**: Only host redirected to rehearsal, participants stuck in lobby
  - [x] **Root Cause**: useLobbyInfo hook wasn't polling for isActive changes
  - [x] **Fix Applied**: Added refetchInterval: 2000ms to useLobbyInfo
  - [x] **Result**: ✅ All participants now auto-redirect within 2 seconds
  - [x] **Commit**: `5b148c3` - fix: Add polling to useLobbyInfo

- [x] **✅ CHECKPOINT 5C**: Browser Testing Complete (2025-10-24 21:30)
  - [x] Test: PIN authentication works (no more redirect loop) ✅
  - [x] Test: Create lobby → Get shareable link ✅
  - [x] Test: Open link in incognito → Enter name → See character grid ✅
  - [x] Test: Select character → Locked for other users ✅
  - [x] Test: Both users see each other in lobby status ✅
  - [x] Test: Host clicks "START" → Both redirect to rehearsal ✅
  - [x] Bug Fix: SQLite boolean 0 rendered as "0" in UI (test0 → test) ✅
  - [x] Bug Fix: Race condition in auth guards causing redirect loop ✅
  - [x] Bug Fix: useLobbyInfo not polling (participants stuck in lobby) ✅
  - [x] Test: Rehearsal page loads with perspective banner ✅
  - [x] **RESULT**: ✅ **SPRINT 5 COMPLETE** - All critical bugs fixed, ready for production

- [x] **✅ POLISH & MOBILE SUPPORT** (2025-10-24 Evening)
  - [x] **UX Improvements**:
    - [x] Added left/right navigation arrows to lobby character carousel (desktop only)
    - [x] Improved taken character visual feedback:
      - [x] Card greyed out (60% opacity)
      - [x] Red border (4px with ring effect)
      - [x] Button shows "SELECTED BY [PLAYER NAME]"
      - [x] Cursor changes to "not-allowed"
    - [x] Enabled character re-selection (users can change their choice)
    - [x] Removed confusing red text below cards
  - [x] **Cloudflare Tunnel Compatibility**:
    - [x] Changed all API calls to use relative paths (`/api/...`)
    - [x] Updated `useLobbies.ts` to use Next.js API proxy
    - [x] Updated `ScriptUploader.tsx` to use Next.js API proxy
    - [x] Added PUT method to Next.js API proxy (`/api/[...path]/route.ts`)
    - [x] **Result**: App now works with localhost, IP addresses, and Cloudflare Tunnel
    - [x] **Only port 3000 needs to be exposed** - backend stays local
  - [x] Files modified: `CharacterCard.tsx`, `lobby/[token]/page.tsx`, `useLobbies.ts`, `ScriptUploader.tsx`, `api/[...path]/route.ts`

### 📱 Mobile Testing Checklist

- [ ] PIN entry keyboard (numeric input works on mobile)
- [ ] Lobby link shareable via SMS/WhatsApp
- [ ] Character selection cards tappable (48px touch targets)
- [ ] Lobby status scrollable on small screens
- [ ] Rehearsal page readable on 375px width
- [ ] Auto-redirect works on mobile browsers

---

## 📅 Sprint 6: Synchronized Multiplayer Rehearsal (Week 3)

**Status**: 🔄 In Progress - 20% (Character audio complete, sync infrastructure in progress)
**Depends on**: Multiplayer Lobbies ✅ Complete, Rehearsal UI ✅ Complete
**Started**: 2025-10-24
**Focus**: Real-time playback synchronization + audio integration

**Sprint Progress Breakdown:**
- Sprint 6A-Part1 (Character Card Audio): ✅ 100% Complete
- Sprint 6A-Part2 (Playback Sync): ⏸️ 15% (Paused - Backend service only, no endpoints/frontend)
- Sprint 6B (Full Dialogue Audio): ⏸️ 0% (Not started)

**PRD**: See `/docs/synchronized-rehearsal-prd.md` for full architecture

### 🎯 Sprint Overview

**The Problem**: When 3+ users join a rehearsal, they need to stay in sync:
- Auto-play audio for AI-spoken lines
- Pause on human characters (wait for participant to speak IRL)
- All clients see the same line at the same time
- No manual "Next" button clicking - flows automatically

**Two-Phase Approach**:
1. **Phase 1 (This session)**: Synchronization with test audio file
2. **Phase 2 (Sprint 6B)**: Full audio generation with Chatterbox TTS

---

### 📅 Sprint 6A: Character Card Audio Generation (This Session)

**Status**: ✅ **COMPLETE** - 100%
**Goal**: Generate short TTS audio clips for each character using Chatterbox
**Started**: 2025-10-24 22:30
**Completed**: 2025-10-24 16:05

#### ✅ Completed Tasks (2025-10-24 22:30-15:40)

- [x] **✅ COMPLETE**: Validated Chatterbox TTS with voice cloning
  - [x] Tested existing venv setup (`/home/corey/projects/RunThru-backend/tts-service/venv`)
  - [x] Generated test audio: "NARRATOR ONE... Here!" with teen-male voice
  - [x] Generation time: 6.42 seconds for short phrase
  - [x] Output: `/home/corey/projects/RunThru/data/test-character-card.wav`
  - [x] **CONFIRMED**: Voice cloning works with reference audio files

- [x] **✅ COMPLETE**: Created ChatterboxAdapter for TTS service (Python)
  - [x] File: `tts-service/adapters/chatterbox_adapter.py`
  - [x] Implements TTSAdapter interface with voice cloning support
  - [x] Uses `audio_prompt_path` parameter for reference voice
  - [x] Maps emotion intensity (0-100) to Chatterbox `exaggeration` parameter
  - [x] Returns WAV audio bytes (24kHz sample rate)

- [x] **✅ COMPLETE**: Updated TTS service to load Chatterbox
  - [x] File: `tts-service/main.py`
  - [x] Initializes both Index TTS and Chatterbox adapters
  - [x] Exposes POST /synthesize endpoint with `engine=chatterbox`

- [x] **✅ COMPLETE**: Created CharacterCardAudioService (Node.js backend)
  - [x] File: `backend/src/services/characterCardAudio.service.ts`
  - [x] Method: `generateForSession(sessionId)` - Batch generate for all characters
  - [x] Method: `generateCharacterCardAudio()` - Single character generation
  - [x] Catchphrase logic: Character-specific ("ZOMBIE → Graaaains!") + preset fallbacks
  - [x] Storage: `/audio/{sessionId}/character-{name}.wav`
  - [x] Uses voice assignments from database (preset → reference audio file)

- [x] **✅ COMPLETE**: Added POST /api/scripts/:id/generate-card-audio endpoint
  - [x] File: `backend/src/routes/scripts.routes.ts`
  - [x] Input: `{sessionId}` (optional, uses session's voice assignments)
  - [x] Output: `{characters: [{characterName, audioUrl, generationTime}]}`
  - [x] Generates audio for all characters in parallel
  - [x] Returns array of generated audio file URLs

- [x] **✅ COMPLETE**: Fixed TTS GPU detection bug
  - [x] File: `tts-service/main.py:44`
  - [x] Changed from checking `CUDA_VISIBLE_DEVICES` to `torch.cuda.is_available()`
  - [x] Result: RTX 3090 GPU now properly detected (3.26 GB allocated)

- [x] **✅ COMPLETE**: Fixed character name pronunciation
  - [x] File: `backend/src/services/characterCardAudio.service.ts`
  - [x] Added `toProperCase()` helper: "NARRATOR ONE" → "Narrator One"
  - [x] Prevents TTS from spelling out letters (N-A-R-R-A-T-O-R)

- [x] **✅ COMPLETE**: Created robust startup scripts
  - [x] Files: `backend/start.sh`, `tts-service/start.sh`, `frontend/start.sh`
  - [x] Master: `start-all.sh` - Control all services
  - [x] Auto-kills lingering processes on ports (solves EADDRINUSE)
  - [x] Commands: `start`, `stop`, `restart`, `status`, `clean`, `build`

- [x] **✅ COMPLETE**: Created and persisted character→voice mapping
  - [x] Session ID: `0edca75a-c108-45a8-9f56-25ce1617b62b`
  - [x] Mapping stored in `voice_assignments` table (SQLite)
  - [x] 11 characters mapped to 8 reference voices:
    - [x] NARRATOR 1 → mysterious-narrator.wav
    - [x] NARRATOR 2 → teen-male.wav
    - [x] JIMMY → pirate-voice.wav
    - [x] SUSAN, CHRISTY → cheerful-female.wav
    - [x] SAM → adult-male.wav
    - [x] GIRL → teen-female.wav
    - [x] ZOMBIE, ZOMBIES, ZOMBIE 1, ZOMBIE 2 → zombie-grumbly.wav

- [x] **✅ COMPLETE**: Generated character card audio with GPU
  - [x] 11 characters, ~1.1 seconds each (GPU-accelerated)
  - [x] Files: `/backend/public/audio/{scriptId}/character-cards/*.wav`
  - [x] Total generation time: ~12 seconds
  - [x] Cache working (0-1ms for subsequent requests)

- [x] **✅ COMPLETE**: Implemented character card audio playback (Cloudflare compatible)
  - [x] File: `frontend/src/components/session/CharacterCard.tsx`
  - [x] Added `catchphraseAudioUrl` prop with audio playback on card click
  - [x] Fixed missing closing `</div>` tag causing build error
  - [x] File: `frontend/src/app/scripts/[id]/setup/page.tsx`
  - [x] Added helper functions: `sanitizeCharacterName()`, `getCharacterAudioUrl()`
  - [x] Passed audio URLs to all CharacterCard components
  - [x] File: `frontend/src/app/audio/[scriptId]/character-cards/[filename]/route.ts`
  - [x] Created Next.js proxy route for audio files (Cloudflare Tunnel compatible)
  - [x] Uses `BACKEND_URL` env var (no hardcoded localhost)
  - [x] File: `backend/src/server.ts:28`
  - [x] Added static file serving: `app.use('/audio', express.static('public/audio'))`
  - [x] **TESTED**: Audio playback working through Cloudflare Tunnel ✅

- [x] **✅ COMPLETE**: Polish & Bug Fixes (2025-10-24 16:00-16:30)
  - [x] Fixed Susan's portrait database reference (null → susan.webp)
  - [x] Removed ellipsis for faster timing ("..." → "." eliminates 6-second pauses)
  - [x] Updated cache headers from immutable to must-revalidate (1 hour TTL)
  - [x] Added cache-busting version parameter (?v=3) for Cloudflare CDN
  - [x] Regenerated all 11 audio files with correct voice assignments:
    - [x] NARRATOR 1 → mysterious-narrator (deep, dramatic) ✓
    - [x] NARRATOR 2 → teen-male
    - [x] All other characters using session 0edca75a voice mappings
  - [x] **TESTED**: Mobile and desktop serving correct fast audio ✅

---

### 📅 Sprint 6A-Part2: Playback Synchronization (PAUSED - In Progress)

**Status**: ⏸️ **PAUSED** - 15% (Backend foundation only)
**Started**: 2025-10-24 18:45
**Paused**: 2025-10-24 19:00
**Goal**: Enable multiple participants to stay in sync during rehearsal
**Current State**: Database + service layer exist, but no API endpoints or frontend integration yet

#### ✅ Completed Infrastructure

- [x] **✅ COMPLETE**: Database schema already exists
  - [x] `current_line_index INTEGER DEFAULT 0` (already in schema.sql)
  - [x] `playback_state TEXT DEFAULT 'paused'` (already in schema.sql)
  - [x] `last_state_update DATETIME` (already in schema.sql)
  - [x] File: `backend/database/schema.sql` lines 26-28

- [x] **✅ COMPLETE**: Created PlaybackService (partial)
  - [x] Method: `getPlaybackState(sessionId)` - Returns current line + participants
  - [x] Method: `advanceLine(sessionId)` - Move to next line (race-condition safe)
  - [x] Returns: `{currentLine, nextLine, isAI, playerName, audioUrl}`
  - [x] Audio URLs: Points to character catchphrase audio (?v=3 cache-busting)
  - [x] File: `backend/src/services/playback.service.ts` ✅ EXISTS
  - [x] **NOTE**: Missing rewind/jump methods (host-only features, deferred)

#### ⏸️ NOT STARTED - Backend API Endpoints

- [ ] **Create GET /api/sessions/:id/playback endpoint**
  - [ ] Import PlaybackService and call `getPlaybackState(sessionId)`
  - [ ] Returns: `{currentLineIndex, playbackState, currentLine, nextLine, totalLines, progress}`
  - [ ] Current line includes: `{character, text, audioUrl, isAI, playerName}`
  - [ ] Used for frontend polling (every 500ms)
  - [ ] File: `backend/src/routes/sessions.routes.ts`
  - [ ] **BLOCKER**: Need to wire up PlaybackService to Express route

- [ ] **Create POST /api/sessions/:id/advance endpoint**
  - [ ] Import PlaybackService and call `advanceLine(sessionId)`
  - [ ] Returns: Updated playback state (same format as GET /playback)
  - [ ] Race condition already handled in service layer (SQLite UPDATE)
  - [ ] File: `backend/src/routes/sessions.routes.ts`
  - [ ] **BLOCKER**: Need to wire up PlaybackService to Express route

#### ⏸️ NOT STARTED - Host Control Features (DEFERRED - Nice to Have)

- [ ] **Create POST /api/sessions/:id/rewind endpoint** (host only)
  - [ ] Verify caller is host via participantId
  - [ ] Decrements current_line_index by 1
  - [ ] Returns: Updated playback state
  - [ ] **PRIORITY**: LOW - Can launch MVP without this

- [ ] **Create POST /api/sessions/:id/jump endpoint** (host only)
  - [ ] Verify caller is host via participantId
  - [ ] Jump to specific line index (for rehearsing specific scenes)
  - [ ] Returns: Updated playback state
  - [ ] **PRIORITY**: LOW - Can launch MVP without this

#### ⏸️ NOT STARTED - Frontend Polling & Audio Playback

**CRITICAL PATH** - These are the minimum features needed for MVP:

- [ ] **Create usePlayback hook** (CRITICAL)
  - [ ] Polls `GET /api/sessions/:id/playback` every 500ms using React Query
  - [ ] Returns: `{currentLine, nextLine, playbackState, totalLines, progress}`
  - [ ] Derived state: `isMyTurn = currentLine.playerName === localStorage.runthru_player_name`
  - [ ] File: `src/hooks/usePlayback.ts`
  - [ ] **BLOCKER**: Depends on GET /api/sessions/:id/playback endpoint

- [ ] **Replace local state with server state in rehearsal page** (CRITICAL)
  - [ ] Remove: `const [currentLineIndex, setCurrentLineIndex] = useState(0)`
  - [ ] Add: `const { data: playbackState } = usePlayback(sessionId)`
  - [ ] Use: `playbackState.currentLineIndex` instead of local state
  - [ ] File: `src/app/rehearsal/[sessionId]/page.tsx`
  - [ ] **RESULT**: All browsers will see same line (synced from server)

- [ ] **Add hidden audio player element** (CRITICAL)
  - [ ] Create: `<audio ref={audioRef} className="hidden" />`
  - [ ] Effect: When `currentLine` changes and `currentLine.isAI === true`:
    - [ ] Load: `audioRef.current.src = currentLine.audioUrl`
    - [ ] Play: `audioRef.current.play()`
  - [ ] On audio ended: Call `POST /api/sessions/:id/advance` (auto-advance)
  - [ ] File: `src/app/rehearsal/[sessionId]/page.tsx`
  - [ ] **RESULT**: AI lines auto-play catchphrase audio and advance

- [ ] **Update "Continue" button behavior** (CRITICAL)
  - [ ] Change onClick: From local `setCurrentLineIndex(i+1)` → API call `POST /api/sessions/:id/advance`
  - [ ] Show only when: `!currentLine.isAI` (human character's turn)
  - [ ] Disabled during: API request in-flight
  - [ ] File: `src/app/rehearsal/[sessionId]/page.tsx`
  - [ ] **RESULT**: Human players manually advance, stays synced

#### ⏸️ DEFERRED - Polish & Nice-to-Have Features

- [ ] **Visual sync indicators** (polish)
  - [ ] Badge: "🟢 Synced" or "🟡 Syncing..." based on last poll time
  - [ ] Visual: "Waiting for [PlayerName] (CHARACTER)..." when not your turn
  - [ ] Visual: 🔊 icon + audio progress bar when AI is speaking

- [ ] **Pause/Resume controls** (nice-to-have)
  - [ ] Local pause: Pause audio on current client only
  - [ ] Global pause: Host can pause for everyone (requires backend endpoint)

- [ ] **Scene progress display** (nice-to-have)
  - [ ] Footer shows: "Line 42/428 • Scene 3/12"
  - [ ] Audio waveform progress bar during AI playback

#### ⏸️ NOT STARTED - Integration Testing (NEXT SESSION)

**Test Plan** - Once backend + frontend wired up:

- [ ] **🧪 Minimal Sync Test** (2 browsers, basic flow)
  - [ ] Browser 1: Host plays NARRATOR (human character)
  - [ ] Browser 2: Participant plays GIRL (human character)
  - [ ] Verify: Both start on Line 1 (same current line)
  - [ ] Browser 1 clicks "Continue" → Browser 2 sees update within 1 second
  - [ ] Verify: AI character auto-plays audio → both browsers advance together
  - [ ] Verify: Human character shows "Continue" button → waits for player

- [ ] **🧪 Race Condition Test** (2 browsers, AI audio)
  - [ ] Both browsers watching same AI line
  - [ ] Audio ends on both at ~same time (both try to advance)
  - [ ] Verify: Only one advance succeeds (SQLite UPDATE prevents duplicate)
  - [ ] Verify: Both browsers poll and sync to same line (no desync)

- [ ] **✅ CHECKPOINT 6A COMPLETE**: Minimum Viable Sync
  - [ ] 2-3 browsers stay in sync through 10+ lines
  - [ ] Catchphrase audio auto-plays and auto-advances
  - [ ] Human turns pause correctly (wait for Continue button)
  - [ ] Polling recovers from temporary lag (<2 seconds to resync)
  - [ ] **DECISION**: Ship MVP or continue to Sprint 6B (full dialogue audio)?

---

### 🎯 What's Working Right Now (2025-10-24 19:00)

**✅ Currently Functional:**
- Multiplayer lobby creation with shareable links
- Character selection (first-come-first-served locking)
- Rehearsal page loads with all participants
- Character portraits display (AI-generated, OpenAI)
- Scene-based sticky headers with scrolling
- Character catchphrase audio (short TTS clips, 1-2 seconds each)
- Manual navigation (Previous/Next buttons work in solo mode)

**⏸️ Partially Complete (Needs Wiring):**
- Backend: PlaybackService exists, can track current line
- Backend: Database has playback state columns
- Frontend: Rehearsal page UI exists with all visual elements
- Frontend: Audio element can play catchphrase files

**❌ Not Working Yet (Critical Gaps):**
- **No API endpoints** - PlaybackService not exposed via Express routes
- **No polling** - Frontend doesn't check server for current line
- **No sync** - Each browser has independent local state
- **Manual advance only** - "Continue" button updates local state, not server
- **No auto-play** - AI audio doesn't automatically play on line change

**🔧 To Make It Work (Minimum 3 Tasks):**
1. Create GET /api/sessions/:id/playback endpoint (15 min)
2. Create POST /api/sessions/:id/advance endpoint (10 min)
3. Update rehearsal page to poll + auto-play audio (30 min)
**Estimated total: ~1 hour of focused work**

---

### 📅 Sprint 6B: Audio Generation with Chatterbox (Future Session)

**Status**: ⏸️ Not Started - 0%
**Depends on**: Sprint 6A ✅ Complete
**Focus**: Replace test audio with real TTS-generated voices

- [ ] **TTS Integration**
  - [ ] Create AudioGenerationService
  - [ ] Integrate Chatterbox adapter (already exists in tts-service)
  - [ ] Generate audio for each AI line on session start
  - [ ] Map voice presets to Chatterbox parameters
  - [ ] Store in: `backend/public/audio/{sessionId}/line-{index}.wav`

- [ ] **Batch Generation Endpoint**
  - [ ] POST /api/sessions/:id/generate-audio
  - [ ] Shows progress bar: "Generating audio... 42/428 lines"
  - [ ] Parallel generation (10 lines at once)
  - [ ] Estimated time: 428 lines × 0.5s = ~3.5 minutes

- [ ] **Cache Management**
  - [ ] Audio files persist until session deleted
  - [ ] Future: Cache by (text + voice params) hash for reuse

- [ ] **🔍 CHECKPOINT 6B**: Full TTS integration
  - [ ] Generate audio for 428-line script
  - [ ] Verify voice assignments match presets
  - [ ] Verify audio quality and timing
  - [ ] Test full rehearsal with real voices

---

## 📅 Sprint 7: Rehearsal Playback UI (Week 4)

**Status**: 🔄 In Progress - 40%
**Depends on**: Audio Generation ⏸️ (Working on UI first)
**Started**: 2025-10-24
**Focus**: Scene-based rehearsal UI with sticky headers and character portraits

### ✅ Completed Tasks (2025-10-24)

#### 🐛 Compilation Fixes
- [x] **✅ COMPLETE**: Fixed ESLint configuration errors
  - [x] Removed `@typescript-eslint/no-unused-vars` rule (not configured)
  - [x] Turned off `react/no-unescaped-entities`
  - [x] File: `/home/corey/projects/RunThru-frontend/.eslintrc.json`

- [x] **✅ COMPLETE**: Fixed Next.js 15 async params requirement
  - [x] Updated portrait route to await params
  - [x] Changed signature to `{ params: Promise<{...}> }`
  - [x] File: `/home/corey/projects/RunThru-frontend/src/app/portraits/[scriptId]/[filename]/route.ts:12`

- [x] **✅ COMPLETE**: Fixed TypeScript type errors
  - [x] Added `analysis?: any` to ScriptDetailResponse interface
  - [x] Added explicit `any` type annotations for character lookups
  - [x] Fixed role ordering type in setup page
  - [x] Files: `useScripts.ts:35`, `[id]/page.tsx:108`, `setup/page.tsx:123`

- [x] **✅ COMPLETE**: Fixed Lucide icon props
  - [x] Removed invalid `title` prop from Crown icon
  - [x] File: `LobbyStatus.tsx:56`

#### 🎨 Rehearsal UI Redesign
- [x] **✅ COMPLETE**: Scene-based sticky headers
  - [x] Removed static top header entirely
  - [x] Created inline scene headers that stick as you scroll
  - [x] Each scene header has incrementing z-index (10 + idx)
  - [x] Gradient background: purple/cyan gradient
  - [x] Scene heading displayed prominently
  - [x] Character badges showing all characters in scene
  - [x] "YOU (character)" badge for selected character

- [x] **✅ COMPLETE**: Fixed layout structure for sticky positioning
  - [x] Parent: `h-screen flex flex-col overflow-hidden`
  - [x] Main: `flex-1 overflow-y-auto` (scroll container)
  - [x] Footer: `sticky bottom-0 z-[9999]` (always visible)
  - [x] Sticky headers work correctly (previous issue: overflow on wrong element)

- [x] **✅ COMPLETE**: Hide scrollbars while maintaining scrolling
  - [x] Added webkit-scrollbar hiding: `[&::-webkit-scrollbar]:hidden`
  - [x] Added IE/Edge hiding: `[-ms-overflow-style:none]`
  - [x] Added Firefox hiding: `[scrollbar-width:none]`
  - [x] Applied to main element only (no horizontal scrollbar)

- [x] **✅ COMPLETE**: Character portrait integration
  - [x] Added Next.js Image component
  - [x] Created `getCharacterPortrait()` helper function
  - [x] 60x60 rounded square portraits (rounded-lg)
  - [x] Positioned to left of each dialogue line
  - [x] Case-insensitive character name matching (GIRL vs Girl)
  - [x] Portrait URLs use dedicated `/portraits/` route (not `/api/portraits/`)
  - [x] Graceful fallback if portrait not available

- [x] **✅ COMPLETE**: Scene grouping logic
  - [x] Groups dialogue lines by scene number
  - [x] Extracts scene headings from parsed content
  - [x] Builds character list per scene (all unique characters)
  - [x] Fallback: "Intro" for first scene if no heading
  - [x] Returns: `{sceneNumber, sceneHeading, characters[], lines[]}`

#### 📂 Files Modified
- [x] `/home/corey/projects/RunThru-frontend/src/app/rehearsal/[sessionId]/page.tsx` - Major restructure
- [x] `/home/corey/projects/RunThru-frontend/.eslintrc.json` - Fixed linting
- [x] `/home/corey/projects/RunThru-frontend/src/app/portraits/[scriptId]/[filename]/route.ts` - Async params
- [x] `/home/corey/projects/RunThru-frontend/src/hooks/useScripts.ts` - Added analysis field
- [x] `/home/corey/projects/RunThru-frontend/src/app/scripts/[id]/page.tsx` - Type annotation
- [x] `/home/corey/projects/RunThru-frontend/src/app/scripts/[id]/setup/page.tsx` - Type fixes
- [x] `/home/corey/projects/RunThru-frontend/src/components/session/LobbyStatus.tsx` - Icon props

### 🔄 In Progress Tasks

- [ ] **Audio playback integration** (Deferred to Sprint 6)
  - [ ] Connect Play/Pause button to actual TTS audio
  - [ ] Implement word-sync highlighting
  - [ ] Auto-advance to next line on audio completion
  - [ ] Audio queue management

- [ ] **Navigation polish**
  - [ ] Keyboard shortcuts (Space = play/pause, Arrow keys = next/prev)
  - [ ] Swipe gestures on mobile
  - [ ] Jump to scene functionality
  - [ ] Bookmark specific lines

### 📊 Progress Breakdown
- **UI Structure**: 100% ✅ (Sticky headers, scrolling, layout)
- **Visual Design**: 100% ✅ (Portraits, scene headers, character badges)
- **Compilation**: 100% ✅ (All errors fixed)
- **Audio Playback**: 0% ⏸️ (Waiting on Sprint 6 TTS integration)
- **Overall Sprint 7**: 40% 🔄

### 🎯 Next Steps
1. Complete Sprint 5 (Multiplayer) - Fix backend compilation errors
2. Complete Sprint 6 (Audio Generation) - TTS integration
3. Return to Sprint 7 - Wire up audio playback to UI

### 🔍 Testing Notes
- ✅ Rehearsal page loads with scene-based headers
- ✅ Scrolling works, headers stick correctly
- ✅ Character portraits display (60x60 rounded squares)
- ✅ Scene transitions smoothly
- ✅ Footer controls always visible
- ⏸️ Audio playback not yet tested (waiting on Sprint 6)

---

---

## 🚨 Blockers & Decisions Needed

### Active Blockers:

**✅ NO ACTIVE BLOCKERS** - Starting Sprint 6A (Synchronized Rehearsal)

**Sprint 5 Summary** (100% Complete):
- ✅ PIN authentication system implemented
- ✅ Unified auth (PIN + lobby join) working
- ✅ All backend APIs tested and working
- ✅ SQLite boolean rendering bug fixed
- ✅ Auth guard race condition fixed
- ✅ Multiplayer lobby flow working end-to-end
- ✅ Perspective debugging added (console logs + UI banner)
- ✅ Cloudflare Tunnel compatibility (all relative URLs)

**Current Focus**: Sprint 6A - Playback synchronization with test audio (see PRD: `/docs/synchronized-rehearsal-prd.md`)

**Goal**: Get 3+ browsers staying in sync, auto-playing audio, pausing on user turns

### Sprint 3 Decisions (Resolved):

1. **✅ Character Selection UX** (Resolved: 2025-10-23 17:50)
   - Decision: Large character cards (video game style)
   - Rationale: Teen-friendly, visual, playful

2. **✅ Voice Assignment UI** (Resolved: 2025-10-23 17:50)
   - Decision: Presets + fine-tune sliders
   - Rationale: Quick setup + creative control

3. **✅ Auto-assignment Rules** (Resolved: 2025-10-23 17:50)
   - Decision: Yes, with smart defaults (user can override)
   - Rationale: Saves time for large casts (30+ characters)

4. **✅ Voice Preview Generation** (Resolved: 2025-10-23 17:50)
   - Decision: On-demand (click "Preview" button)
   - Rationale: Saves GPU time during setup

### Upcoming Decisions:

1. **OpenAI Image Storage** (Sprint 4 - NEXT)
   - Question: Where to store character portrait images?
   - Options:
     - A) Local filesystem (simplest, works for single server)
     - B) Database base64 (easy, but large DB size)
     - C) S3/Cloud Storage (scalable, costs money)
   - Decision needed by: Before implementing CharacterPortraitService
   - Owner: @corey
   - **Recommendation**: Start with local filesystem for MVP, migrate to S3 if needed

2. **Analysis Timing** (Sprint 4)
   - Question: Run OpenAI analysis synchronously (user waits) or asynchronously (background)?
   - Options:
     - A) Synchronous: User waits 30-60 seconds, sees portraits immediately
     - B) Asynchronous: Instant upload, portraits populate in background
   - Decision needed by: Before implementing script upload integration
   - Owner: @corey
   - **Recommendation**: Asynchronous with "Analyzing..." status

3. **TTS Engine Selection** (Sprint 5)
   - Question: Index TTS vs Chatterbox for MVP default?
   - Needs: throwaway-tests/003-tts-latency/ benchmark
   - Decision needed by: Start of Sprint 5
   - Owner: @corey + data

4. **Voice Cloning** (Future)
   - Question: Allow users to upload their own voice samples?
   - Trade-off: Cool feature vs complexity
   - Decision needed by: After MVP
   - Owner: @corey

---

## 📊 Progress Dashboard

### Overall MVP Phase 1 Progress: 78%

| Sprint | Status | Progress | Target Date |
|--------|--------|----------|-------------|
| 1. Infrastructure | ✅ Complete | 100% | 2025-10-23 |
| 2. Script Upload | ✅ Complete | 100% | 2025-10-23 |
| 3. Role Selection | ✅ Complete | 100% | 2025-10-23 |
| 4. OpenAI Integration | ✅ Complete | 100% | 2025-10-23 |
| 5. Multiplayer & Security | ✅ Complete | 100% | 2025-10-24 |
| 6A-Part1. Character Card Audio | ✅ Complete | 100% | 2025-10-24 |
| 6A-Part2. Playback Sync | ⏸️ Paused | 15% | TBD |
| 6B. Full Dialogue Audio (TTS) | ⏸️ Not Started | 0% | TBD |
| 7. Rehearsal Playback UI | ✅ Complete | 100% | 2025-10-24 |

### Track-Specific Progress:

| Track | Sprint 5 (Multiplayer) | Sprint 6A-Part1 (Card Audio) | Sprint 6A-Part2 (Sync) | Sprint 6B (TTS) | Sprint 7 (UI) |
|-------|------------------------|------------------------------|------------------------|-----------------|---------------|
| 🎨 Frontend | ✅ 100% | ✅ 100% | ⏸️ 0% (Paused) | ⏸️ Waiting | ✅ 100% |
| ⚙️ Backend | ✅ 100% | ✅ 100% | ⏸️ 15% (Service only) | ⏸️ Waiting | N/A |
| 🤖 AI/ML | N/A | ✅ 100% (Chatterbox) | N/A | ⏸️ Waiting | N/A |
| 🔗 Integration | ✅ 100% | ✅ 100% | ⏸️ 0% (Not tested) | ⏸️ Waiting | ✅ 100% |

---

## 🔍 Integration Checkpoints Explained

Integration checkpoints are **critical sync points** where you stop, merge branches, and test end-to-end.

### Checkpoint Protocol:

1. **Prerequisites**: Both frontend and backend tracks mark their tasks [x]
2. **Location**: Work in `RunThru/` (main worktree)
3. **Steps**:
   ```bash
   cd /home/corey/projects/RunThru
   git merge feature/frontend
   git merge feature/backend
   docker-compose up  # or run dev servers
   # Test the feature end-to-end
   ```
4. **Outcomes**:
   - ✅ **PASS**: Mark checkpoint [x], move to next sprint
   - ❌ **FAIL**: Add tasks to current sprint, iterate
   - 🧪 **DATA NEEDED**: Create throwaway test, gather data, decide

### Upcoming Checkpoints:

**CHECKPOINT 0: Scaffold Complete** (Today)
- Success: All dev servers start, no errors
- Test: Run `npm run dev` in frontend and backend

**CHECKPOINT 1: Script Upload Working** (End Sprint 2)
- Success: Upload markdown → See parsed script in database
- Test: Upload Romeo & Juliet, verify all characters detected

**CHECKPOINT 2: Voice Assignment Working** (End Sprint 3)
- Success: Select role → Assign voice → Preview audio
- Test: With teen user (your daughter)

---

## 🔄 How to Use This File

### For @corey (You):

**Daily:**
1. Open `TASKS.md` to see current status
2. Check "Active Sprint" section
3. Look for 🔍 **CHECKPOINT** markers (time to test)
4. Look for ✅ **DECISION** markers (your input needed)

**When testing:**
1. Look for "Integration Checkpoint" tasks
2. Follow the test steps
3. Mark ✅ **PASS** or ❌ **FAIL**
4. Add notes about what worked/didn't work

**When blocked:**
1. Add to "Blockers & Decisions Needed"
2. Tag with your name: `@corey decision needed`
3. Claude will see it and ask for your input

**Editing:**
- You can edit this file anytime (it's just markdown)
- Commit changes: `git add TASKS.md && git commit -m "tasks: your note"`
- It's synced across all worktrees via symlinks

---

### For Claude:

**During work:**
1. Mark tasks [x] when completed
2. Update 🔄 **IN PROGRESS** markers
3. Commit changes after each task: `git add TASKS.md && git commit -m "tasks: Complete X"`
4. Flag blockers if stuck

**At checkpoints:**
1. Mark all sprint tasks [x]
2. Update status to 🔍 **CHECKPOINT**
3. Notify @corey: "Ready for Checkpoint 1 review"

**When asking decisions:**
1. Add to "Blockers & Decisions Needed"
2. Present options clearly
3. Reference throwaway tests if data available

---

## 📝 Status Icon Legend

**Task Status:**
- [x] **Completed** - Done
- [ ] **Not Started** - Pending
- 🔄 **IN PROGRESS** - Currently working
- 🔍 **CHECKPOINT** - Ready for human review
- ⚠️ **BLOCKED** - Waiting on something
- 🧪 **DATA NEEDED** - Needs throwaway test
- 📋 **READY** - Unblocked, can start anytime
- ✅ **DECISION** - Human approval needed

**Track Status:**
- 🟢 **Active** - Currently working
- 🟡 **Ready** - Can start, waiting to begin
- 🔴 **Blocked** - Cannot proceed
- ⏸️ **Not Started** - Future work

---

## 🎯 Quick Navigation

Jump to sections:
- [Active Sprint](#-active-sprint-infrastructure-setup-current)
- [Next Sprint](#-next-sprint-script-upload-feature-week-1)
- [Blockers & Decisions](#-blockers--decisions-needed)
- [Progress Dashboard](#-progress-dashboard)
- [Checkpoints](#-integration-checkpoints-explained)

---

## 🚀 Ready to Start?

**Current focus**: Complete Infrastructure Setup (80% done)
**Next task**: Scaffold frontend and backend project structures
**ETA**: ~30 minutes for both tracks

Once scaffolding is complete, we'll hit **CHECKPOINT 0** and you'll test that dev servers start successfully.

---

*This file is git-tracked and symlinked to all worktrees. Edit anytime, commit changes.*
