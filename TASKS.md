# RunThru - Task Tracking & Progress

**Last Updated**: 2025-10-23 14:50
**Current Phase**: MVP Phase 1 - Foundation & Infrastructure
**Overall Progress**: 40% infrastructure, 0% features

---

## 🎯 Active Sprint: Infrastructure Setup (Current)

**Status**: 🟢 In Progress (80% complete)
**Started**: 2025-10-23
**Target Completion**: 2025-10-23 (today)

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

#### 🎨 Frontend Track (RunThru-frontend)
**Status**: 🟡 Ready to start
**Branch**: feature/frontend

- [ ] **NEXT**: Scaffold Next.js 15 project structure
  - [ ] Initialize with create-next-app
  - [ ] Configure shadcn/ui
  - [ ] Set up Tailwind with custom theme (dark mode, teen-friendly colors)
  - [ ] Configure TypeScript (strict mode)
  - [ ] Create basic app structure (layout, pages, components)
  - [ ] Add package.json with all dependencies
  - [ ] **🔍 CHECKPOINT**: Frontend scaffold review with @corey

#### ⚙️ Backend Track (RunThru-backend)
**Status**: 🟡 Ready to start
**Branch**: feature/backend

- [ ] **NEXT**: Scaffold Node.js API project structure
  - [ ] Initialize Node.js project with TypeScript
  - [ ] Set up Express server
  - [ ] Configure SQLite database with initial schema
  - [ ] Create service/route/model directory structure
  - [ ] Add package.json with all dependencies
  - [ ] **🔍 CHECKPOINT**: Backend scaffold review with @corey

- [ ] **NEXT**: Scaffold Python TTS service
  - [ ] Initialize Python project structure
  - [ ] Create FastAPI app skeleton
  - [ ] Set up TTS adapter pattern (base class)
  - [ ] Create requirements.txt
  - [ ] Create Dockerfile for GPU container
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
