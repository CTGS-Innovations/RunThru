# RunThru - Task Tracking & Progress

**Last Updated**: 2025-10-23 17:45
**Current Phase**: MVP Phase 1 - Sprint 2 Complete ✅ | Sprint 3 Ready
**Overall Progress**: Sprint 1: 100% ✅ | Sprint 2: 100% ✅ (tested + bugs fixed)

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

## 📅 Sprint 2: Script Upload Feature (Current - Week 1)

**Status**: 🟢 Active - 15% Complete
**Depends on**: Infrastructure Setup ✅ Complete
**Target**: 2025-10-30
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

## 📅 Future Sprints (Overview)

### Sprint 3: Role Selection & Voice Assignment (Week 2)
- [ ] Frontend: CharacterSelector, VoiceSelector, VoicePreview
- [ ] Backend: TTS voice listing, session creation
- [ ] TTS: Index TTS integration, voice samples
- [ ] **CHECKPOINT 2**: Voice selection working

### Sprint 4: Audio Generation & Caching (Week 2-3)
- [ ] Frontend: Progress bar, audio generation UI
- [ ] Backend: Batch generation (SSE), audio cache service
- [ ] TTS: Emotion mapping, batch processing
- [ ] **CHECKPOINT 3**: Audio generation complete

### Sprint 5: Rehearsal Playback (Week 3)
- [ ] Frontend: LineDisplay, AudioPlayer, NavigationControls
- [ ] Backend: Session state management, audio serving
- [ ] **CHECKPOINT 4**: Rehearsal mode working end-to-end

---

## 🚨 Blockers & Decisions Needed

### Active Blockers:
*None currently - infrastructure is unblocked*

### Upcoming Decisions:

1. **Script Parser Edge Cases** (Sprint 2)
   - Question: How to handle "GUARD 1", "GUARD 2" (numbers in character names)?
   - Options:
     - A) Allow numbers, treat as separate characters
     - B) Normalize to "GUARD" (lose distinction)
     - C) Manual tagging in UI
   - Decision needed by: Start of Sprint 2
   - Owner: @corey
   - **Recommendation**: Test with throwaway-tests/002-markdown-parser/

2. **TTS Engine Selection** (Sprint 4)
   - Question: Index TTS vs Chatterbox for MVP default?
   - Needs: throwaway-tests/003-tts-latency/ benchmark
   - Decision needed by: Start of Sprint 4
   - Owner: @corey + data

3. **Voice Cloning** (Sprint 3)
   - Question: Allow users to upload their own voice samples?
   - Trade-off: Cool feature vs complexity
   - Decision needed by: Start of Sprint 3
   - Owner: @corey

---

## 📊 Progress Dashboard

### Overall MVP Phase 1 Progress: 8%

| Sprint | Status | Progress | Target Date |
|--------|--------|----------|-------------|
| Infrastructure | 🟢 Active | 80% | 2025-10-23 (today) |
| Script Upload | ⏸️ Not Started | 0% | 2025-10-30 |
| Role Selection | ⏸️ Not Started | 0% | 2025-11-06 |
| Audio Generation | ⏸️ Not Started | 0% | 2025-11-13 |
| Rehearsal Playback | ⏸️ Not Started | 0% | 2025-11-20 |

### Track-Specific Progress:

| Track | Sprint Current | Sprint Next |
|-------|----------------|-------------|
| 🎨 Frontend | 🟡 Ready (0%) | ⏸️ Not Started |
| ⚙️ Backend | 🟡 Ready (0%) | ⏸️ Not Started |
| 🤖 TTS | ⏸️ Not Started | ⏸️ Not Started |
| 🔗 Integration | ⏸️ Waiting | ⏸️ Waiting |

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
