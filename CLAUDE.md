# RunThru - Theatrical Rehearsal Platform

## Project Overview
Interactive rehearsal app for teen actors to practice lines with AI scene partners. Built for local deployment with GPU-accelerated TTS.

## Target User
Teen actors (13-18) practicing for school plays and community theater productions.

## Architecture
This project uses **git worktrees** for parallel development:

- **Main** (`/home/corey/projects/RunThru`): Integration, testing, documentation
- **Frontend** (`/home/corey/projects/RunThru-frontend`): Next.js UI
- **Backend** (`/home/corey/projects/RunThru-backend`): Node.js API + Python TTS service

All three share the same `.git` repository but work on separate branches.

### CRITICAL: Git Worktree Command Protocol

**MANDATORY RULES FOR CLAUDE:**

1. **NEVER run git commands without absolute path `cd` in the same command**
   ```bash
   # WRONG (relies on current directory):
   git add .
   git commit -m "message"

   # CORRECT (explicit worktree):
   cd /home/corey/projects/RunThru-frontend && git add . && git commit -m "message"
   ```

2. **File operations MUST specify which worktree:**
   - Frontend changes → Read/Edit/Write in `/home/corey/projects/RunThru-frontend/`
   - Backend changes → Read/Edit/Write in `/home/corey/projects/RunThru-backend/`
   - Integration only → Work in `/home/corey/projects/RunThru/`

3. **Before ANY commit, verify branch:**
   ```bash
   cd /home/corey/projects/RunThru-frontend && git branch --show-current
   # MUST show: feature/frontend

   cd /home/corey/projects/RunThru-backend && git branch --show-current
   # MUST show: feature/backend
   ```

4. **NEVER commit to main branch** (except merges)
   - If `git branch --show-current` shows "main" → STOP
   - Move changes to feature branch or abort

5. **Command pattern for all git operations:**
   ```bash
   # Template:
   cd /absolute/path/to/worktree && git <command>

   # Examples:
   cd /home/corey/projects/RunThru-frontend && git status
   cd /home/corey/projects/RunThru-backend && git add backend/src/routes/
   cd /home/corey/projects/RunThru-frontend && git commit -m "feat: Add component"
   ```

6. **Merging (ONLY from main worktree):**
   ```bash
   cd /home/corey/projects/RunThru && git merge feature/frontend
   cd /home/corey/projects/RunThru && git merge feature/backend
   ```

**Why this matters**: Omitting `cd` or relying on shell state causes commits to go to the wrong branch, leading to code loss and merge conflicts.

## Tech Stack
- **Frontend**: Next.js 15, React 18, shadcn/ui, Tailwind CSS, TypeScript, Zustand
- **Backend API**: Node.js 20, Express, SQLite (better-sqlite3), TypeScript
- **TTS Service**: Python 3.11, FastAPI, PyTorch, Index TTS, Chatterbox TTS
- **Infrastructure**: Docker Compose, Cloudflare Tunnel, NVIDIA RTX 3090 (24GB)

## Context Management Strategy
To prevent context pollution and enable parallel development:

### Specialized Subagents
Use these for research and planning (they have isolated context windows):
- **frontend-specialist**: UI/component architecture research
- **backend-specialist**: API/service architecture research
- **tts-specialist**: TTS integration and GPU optimization research

### How Subagents Work
1. Launch subagent for research: `use frontend-specialist to analyze [feature]`
2. Subagent reads relevant files (uses ITS OWN context, not main context)
3. Subagent saves plan to `.claude/docs/[feature]-plan.md`
4. Main agent reads plan (only a few hundred tokens) and implements

### Shared Memory
Subagents communicate via markdown files in `.claude/docs/`:
- `frontend-plan.md` - Frontend architecture plans
- `backend-plan.md` - Backend architecture plans
- `tts-integration-plan.md` - TTS service plans
- `integration-notes.md` - Cross-cutting concerns

## Data-Driven Decisions
Use **throwaway-tests/** for performance validation:
- Create isolated benchmarks for architectural decisions
- Compare multiple approaches with real data
- Document results in `docs/decisions/`
- Delete tests after decision is made (they're throwaway!)

Example: "Should we use Zustand or Context?" → Create `throwaway-tests/001-state-management/` → Run benchmark → Document winner → Delete test

## Task Tracking
**IMPORTANT**: This project uses `TASKS.md` for progress tracking.

### Your Responsibilities:
1. **Read TASKS.md** at start of each session to understand current sprint
2. **Update TASKS.md** as you complete tasks:
   - Change `[ ]` to `[x]` when done
   - Update 🔄 **IN PROGRESS** markers
   - Update progress percentages
   - Commit changes: `git add TASKS.md && git commit -m "tasks: Complete X"`
3. **Flag blockers** in "Blockers & Decisions Needed" section
4. **Notify @corey** when reaching 🔍 **CHECKPOINT** markers
5. **Update timestamps** ("Last Updated" field)

### TASKS.md is Synced:
- Lives in main worktree: `RunThru/TASKS.md`
- Symlinked to: `RunThru-frontend/TASKS.md` and `RunThru-backend/TASKS.md`
- All three point to the same file
- Git-tracked, so history is preserved

## Workflow
```
1. Research Phase
   └─ Launch subagent(s) for isolated research
   └─ Subagents save plans to .claude/docs/

2. Decision Phase
   └─ Review plans with human (critical decisions)
   └─ Run throwaway tests if data needed
   └─ Update TASKS.md with decisions

3. Implementation Phase
   └─ Main agent reads plan and implements
   └─ Work in appropriate worktree (frontend OR backend)
   └─ Mark tasks [x] in TASKS.md as you go

4. Integration Phase
   └─ Mark sprint complete in TASKS.md
   └─ Update status to 🔍 CHECKPOINT
   └─ Notify @corey for review
   └─ Merge feature branches to main
   └─ Test full stack in this worktree

5. Pattern Extraction
   └─ Document reusable patterns as Claude Code skills
   └─ Update TASKS.md with new sprint tasks
```

## Commands to Remember
- `/clear` - Reset context when switching between major features
- `use [subagent] to [task]` - Launch specialized research agent
- `git worktree list` - See all worktrees
- `git merge feature/frontend` - Integrate frontend work

## Key Documentation
- `docs/PRD.md` - Product requirements and features
- `docs/ARCHITECTURE.md` - Technical design and file structure
- `docs/CONTEXT.md` - This context management pattern
- `docs/decisions/` - Architectural decisions with supporting data
- `.claude/docs/` - Subagent research outputs (shared memory)
- `throwaway-tests/` - Performance benchmarks (temporary)

## Development Guidelines
1. **Separation of Concerns**: Frontend work stays in RunThru-frontend/, backend in RunThru-backend/
2. **Context Hygiene**: Use `/clear` often, especially when switching features
3. **Data-Driven**: Validate performance claims with throwaway tests
4. **Human-in-Loop**: Present plans at decision points, don't guess
5. **Document Patterns**: Successful patterns → Claude Code skills

## Current Phase
**MVP Phase 1** - Solo rehearsal mode with pre-generated audio
- Script upload and parsing (markdown → JSON)
- Role selection and voice assignment
- Audio generation with Index TTS
- Linear playback rehearsal UI

See `docs/PRD.md#mvp-scope` for full phase 1 requirements.

## Getting Started
```bash
# Frontend development
cd /home/corey/projects/RunThru-frontend
npm run dev  # localhost:3000

# Backend development
cd /home/corey/projects/RunThru-backend/backend
npm run dev  # localhost:4000

# TTS service
cd /home/corey/projects/RunThru-backend/tts-service
python main.py  # localhost:5000

# Full stack integration
cd /home/corey/projects/RunThru
docker-compose up
```

## UI/UX Design Skill

RunThru has a Claude Code Skill that automatically activates when working on UI:

**Skill**: `.claude/skills/ui-ux-designer/SKILL.md`

**How it works**: This is a **model-invoked skill** - Claude automatically uses it when building, reviewing, or refactoring UI components. You don't need to explicitly call it.

**What it ensures**:
- Pokemon-card energy (exciting, not boring)
- Mobile-first responsive design (375px → desktop)
- Brand colors (amber for user, cyan for AI, green for CTAs)
- Accessibility (keyboard nav, ARIA, 48px touch targets, 4.5:1 contrast)
- Component states (hover, selected, disabled, focus)
- Consistent patterns across all pages

**Core principle**: Every interaction should feel like starting an epic adventure, not filling out homework.

## Notes for Claude
- This is a father-daughter project - keep it professional but kid-friendly
- The user has 50 years of industry experience - present options, don't assume
- Use throwaway tests to validate performance claims
- Keep the user in the loop on architectural decisions
- When in doubt, ask rather than guess
