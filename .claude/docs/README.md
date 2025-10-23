# Shared Memory Directory

This directory contains **research outputs from specialized subagents**. It acts as "shared memory" between the main agent and subagents, preventing context pollution.

## How It Works

### Subagent Workflow:
1. Main agent launches subagent: `use frontend-specialist to analyze script upload feature`
2. Subagent researches in its own isolated context (reads PRD, ARCHITECTURE, code)
3. Subagent saves plan here: `frontend-plan.md`
4. Subagent returns brief summary to main agent
5. Main agent reads plan (only a few hundred tokens) and implements

### Why This Matters:
- **Without subagents**: Main agent reads entire codebase (10,000+ tokens), context fills up fast
- **With subagents**: Main agent reads only plans (~500 tokens each), context stays clean

## Files in This Directory

| File | Created By | Used By | Purpose |
|------|------------|---------|---------|
| `frontend-plan.md` | frontend-specialist | Main agent | UI/component architecture plans |
| `backend-plan.md` | backend-specialist | Main agent | API/service architecture plans |
| `tts-integration-plan.md` | tts-specialist | Main agent | TTS engine integration plans |
| `integration-notes.md` | Main agent | All | Cross-cutting concerns, integration TODOs |

## File Lifecycle

### Creation:
```bash
# User triggers research
use frontend-specialist to analyze the rehearsal UI

# Subagent creates/updates plan
.claude/docs/frontend-plan.md (created or overwritten)
```

### Reading:
```bash
# Main agent reads plan before implementing
read .claude/docs/frontend-plan.md
```

### Cleanup:
Plans are **persistent** - they stay until overwritten by next research phase. This provides continuity across sessions.

To clean up:
```bash
# Delete old plans when starting new feature
rm .claude/docs/*-plan.md
```

## Symlinks in Worktrees

This directory is symlinked from other worktrees:
- `RunThru/.claude/docs/` (this directory - original)
- `RunThru-frontend/.claude/docs/` → symlink to this
- `RunThru-backend/.claude/docs/` → symlink to this

This ensures all worktrees see the same plans.

## Notes
- Plans should be **concise** (500-2000 tokens)
- Include **actionable details** (file paths, types, endpoints)
- Reference **throwaway tests** if data-driven decisions were needed
- Update plans as research evolves (overwrite old ones)
