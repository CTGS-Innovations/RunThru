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

## Workflow
```
1. Research Phase
   └─ Launch subagent(s) for isolated research
   └─ Subagents save plans to .claude/docs/

2. Decision Phase
   └─ Review plans with human (critical decisions)
   └─ Run throwaway tests if data needed

3. Implementation Phase
   └─ Main agent reads plan and implements
   └─ Work in appropriate worktree (frontend OR backend)

4. Integration Phase
   └─ Merge feature branches to main
   └─ Test full stack in this worktree

5. Pattern Extraction
   └─ Document reusable patterns as Claude Code skills
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

## Notes for Claude
- This is a father-daughter project - keep it professional but kid-friendly
- The user has 50 years of industry experience - present options, don't assume
- Use throwaway tests to validate performance claims
- Keep the user in the loop on architectural decisions
- When in doubt, ask rather than guess
