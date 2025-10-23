# RunThru - Task Tracking & Progress

**Last Updated**: 2025-10-23 16:00
**Current Phase**: MVP Phase 1 - Foundation & Scaffolding
**Overall Progress**: 100% infrastructure ✅, planning complete ✅, scaffolding in progress 🔄

---

## 🎯 Active Sprint: Infrastructure Setup (Current)

**Status**: ✅ Complete (100%)
**Started**: 2025-10-23
**Completed**: 2025-10-23

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
**Status**: 🔄 **IN PROGRESS** - Parallel scaffolding with subagent
**Branch**: feature/frontend

- [x] **✅ COMPLETE**: Research and planning (frontend-specialist)
  - [x] Analyzed project requirements and architecture
  - [x] Created comprehensive scaffold specification
  - [x] Defined 17 files: package.json, Next.js config, components, stores
  - [x] Chose design system: dark mode, amber/cyan/magenta colors
  - [x] Documented installation steps and success criteria
- [ ] 🔄 **IN PROGRESS**: Scaffold Next.js 15 project structure
  - [ ] Create package.json with dependencies (Next 15, React 18, shadcn/ui, Zustand)
  - [ ] Configure TypeScript (strict mode) and Tailwind CSS
  - [ ] Create src/app/ structure (layout.tsx, page.tsx, globals.css)
  - [ ] Set up Zustand store (sessionStore.ts) and API client (api.ts)
  - [ ] Add types (src/types/index.ts) and utilities (lib/utils.ts)
  - [ ] Create components.json for shadcn/ui
  - [ ] Add README.md with setup instructions
  - [ ] **🔍 CHECKPOINT**: Frontend scaffold review with @corey

#### ⚙️ Backend Track (RunThru-backend)
**Status**: 🔄 **IN PROGRESS** - Parallel scaffolding with subagent
**Branch**: feature/backend

- [x] **✅ COMPLETE**: Research and planning (backend-specialist)
  - [x] Analyzed backend architecture and TTS integration requirements
  - [x] Created comprehensive scaffold specification for both services
  - [x] Defined 34 files: Node.js API (20 files) + Python TTS service (14 files)
  - [x] Designed database schema (3 tables: scripts, sessions, audio_cache)
  - [x] Created TTS adapter pattern (base class + Index TTS + Chatterbox)
  - [x] Documented installation steps and success criteria
- [ ] 🔄 **IN PROGRESS**: Scaffold Node.js API project structure
  - [ ] Create package.json with dependencies (Express, SQLite, TypeScript)
  - [ ] Configure TypeScript (tsconfig.json) and environment (.env.example)
  - [ ] Create src/ structure (server.ts, routes/, services/, models/)
  - [ ] Set up Express server with CORS, error handling, logging
  - [ ] Create database.service.ts and schema.sql
  - [ ] Add script parser service and TTS client service
  - [ ] Create Dockerfile for containerization
  - [ ] **🔍 CHECKPOINT**: Backend scaffold review with @corey

- [ ] 🔄 **IN PROGRESS**: Scaffold Python TTS service
  - [ ] Create main.py with FastAPI app
  - [ ] Set up requirements.txt with PyTorch and FastAPI dependencies
  - [ ] Create adapters/ directory (base.py, index_tts_adapter.py, chatterbox_adapter.py)
  - [ ] Create models/schemas.py with Pydantic models
  - [ ] Set up /synthesize and /voices endpoints
  - [ ] Create Dockerfile with CUDA 12.1 support
  - [ ] **🔍 CHECKPOINT**: TTS service scaffold review with @corey

#### 🔗 Integration Tasks (RunThru)
**Status**: ⏸️ Waiting for frontend + backend completion

- [ ] **INTEGRATION CHECKPOINT 0**: Scaffold Complete
  - [ ] Merge feature/frontend to main
  - [ ] Merge feature/backend to main
  - [ ] Create docker-compose.yml for full stack
  - [ ] Test: All services start without errors
  - [ ] Verify: npm run dev works in frontend
  - [ ] Verify: npm run dev works in backend
  - [ ] Verify: python main.py works in tts-service
  - [ ] **✅ DECISION**: Approve scaffold or iterate

---

## 📅 Next Sprint: Script Upload Feature (Week 1)

**Status**: ⏸️ Not Started
**Depends on**: Infrastructure Setup completion
**Target**: 2025-10-30

### 🎨 Frontend Track - Script Upload UI

- [ ] Create ScriptUploader component (shadcn/ui Dialog + Input)
  - [ ] Drag-and-drop file upload
  - [ ] Paste markdown textarea option
  - [ ] Client-side validation (file size, format)
  - [ ] Loading state during upload
  - [ ] Success/error feedback (toast notifications)

- [ ] Create Script Library page
  - [ ] List all uploaded scripts (Card layout)
  - [ ] Show: title, character count, date uploaded
  - [ ] Actions: Open, Edit, Delete
  - [ ] Empty state ("Upload your first script")

- [ ] Create API client hooks
  - [ ] useScripts() - List scripts
  - [ ] useUploadScript() - Upload new script
  - [ ] useScript(id) - Get single script

- [ ] **🔍 CHECKPOINT 1A**: Frontend script upload review

### ⚙️ Backend Track - Script Parser & API

- [ ] Create ScriptParserService
  - [ ] Parse markdown → JSON (character names, scenes, lines)
  - [ ] Extract stage directions: (angrily), (softly), etc.
  - [ ] Handle multiple formats: "CHARACTER" and "**CHARACTER:**"
  - [ ] Edge cases: numbers in names (GUARD 1), mixed case
  - [ ] Return: `{ title, characters[], scenes[] }`

- [ ] Create POST /api/scripts endpoint
  - [ ] Validate markdown input (Zod schema)
  - [ ] Call ScriptParserService
  - [ ] Save to SQLite database
  - [ ] Return parsed script JSON

- [ ] Create GET /api/scripts endpoint
  - [ ] List all scripts (sorted by created_at DESC)
  - [ ] Pagination support (limit, offset)

- [ ] Create GET /api/scripts/:id endpoint
  - [ ] Return single script with full parsed data

- [ ] **🔍 CHECKPOINT 1B**: Backend parser accuracy test

### 🧪 Data Validation Tasks

- [ ] **THROWAWAY TEST**: Parser accuracy comparison
  - [ ] Location: throwaway-tests/002-markdown-parser/
  - [ ] Test with 10+ real scripts (Romeo & Juliet, Hamlet, modern plays)
  - [ ] Measure: Character detection accuracy (target: >95%)
  - [ ] Compare: Custom parser vs remark vs marked
  - [ ] Document winner in docs/decisions/002-markdown-parser.md

### 🔗 Integration Milestone

- [ ] **INTEGRATION CHECKPOINT 1**: Script Upload End-to-End
  - [ ] Merge feature/frontend to main
  - [ ] Merge feature/backend to main
  - [ ] Test: Upload markdown via UI → See in database → View in library
  - [ ] Test: Edge cases (invalid markdown, large files)
  - [ ] Test: Error handling (network errors, parsing failures)
  - [ ] **✅ DECISION**: Approve or iterate

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
