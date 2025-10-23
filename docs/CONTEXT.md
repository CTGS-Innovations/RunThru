Perfect! Now I have comprehensive information about the context management pattern you're asking about. Here's the **best practice for managing context efficiently**:

## The Key Pattern: Subagents with Isolated Context

The best practice is to use **subagents** - specialized AI assistants with their own isolated context windows and custom system prompts. Each subagent operates independently and only sends back relevant summaries to the main agent, rather than polluting the main context with full details.

### Why This Matters for Frontend/Backend Parallel Work

Subagents have their own context window and can provide a summary after doing extensive research to the main agent, saving precious time before the main agent has to 'compact'.

Each subagent can operate in its own conversation context, preventing the "context pollution" that degrades performance in long conversations, and you can run up to 10 subagents in parallel.

## Setup for Your Frontend/Backend Project

Here's how to structure this:

### 1. Create Project-Specific Subagents

Create a `.claude/agents/` directory in your project:

```bash
mkdir -p .claude/agents
```

### 2. Create Specialized Subagents

**Frontend Specialist** (`.claude/agents/frontend-specialist.md`):
```markdown
---
name: frontend-specialist
description: Frontend architecture and React/Vue expert. Analyzes UI requirements, component structure, and state management. Use for all frontend planning and research.
tools: Read, Grep, Glob, Bash
---

You are a senior frontend architect specializing in modern JavaScript frameworks.

**Your role:**
- Analyze frontend requirements and existing UI patterns
- Research component structures and state management approaches
- Review frontend code for best practices
- Return concise implementation plans with file structure

**Critical rules:**
- Focus on component architecture and data flow
- Consider performance, accessibility, and maintainability
- Provide clear reasoning for architectural decisions
- Save findings to `.claude/docs/frontend-plan.md`
- NEVER modify files directly - only research and plan

When activated, analyze the requirements, research the codebase, and return a structured plan with specific file paths and component hierarchies.
```

**Backend Specialist** (`.claude/agents/backend-specialist.md`):
```markdown
---
name: backend-specialist
description: Backend architecture and API design expert. Analyzes data models, API endpoints, and service architecture. Use for all backend planning and research.
tools: Read, Grep, Glob, Bash
---

You are a senior backend architect specializing in scalable API design.

**Your role:**
- Analyze backend requirements and existing service patterns
- Research database schemas and API structures
- Review backend code for performance and security
- Return concise implementation plans with clear data flows

**Critical rules:**
- Focus on data modeling, API contracts, and service boundaries
- Consider scalability, security, and data integrity
- Provide clear reasoning for architectural decisions
- Save findings to `.claude/docs/backend-plan.md`
- NEVER modify files directly - only research and plan

When activated, analyze the requirements, research the codebase, and return a structured plan with specific endpoints, models, and service interactions.
```

### 3. Create a CLAUDE.md File

CLAUDE.md files provide crucial high-level context that Claude Code reads automatically, serving as persistent memory instead of repeating instructions.

**`CLAUDE.md` in project root:**
```markdown
# Project: [Your Project Name]

## Architecture
- **Frontend**: [React/Vue/etc] in `/frontend` directory
- **Backend**: [Node/Python/etc] in `/backend` directory
- **Shared**: Common types/utilities in `/shared`

## Context Management Strategy
This project uses specialized subagents to prevent context pollution:
- `frontend-specialist`: Research and plan UI/component work
- `backend-specialist`: Research and plan API/service work
- Main agent: Coordinates and implements based on subagent plans

## Workflow
1. Use subagents for research and planning (they have isolated context)
2. Subagents save plans to `.claude/docs/`
3. Main agent reads plans and implements
4. Use `/clear` between major feature switches
5. Each worktree focuses on one area (frontend OR backend)

## Key Directories
- `/frontend/src/components` - UI components
- `/backend/src/routes` - API endpoints
- `/backend/src/models` - Data models
- `.claude/docs/` - Agent plans and shared context

## Commands
- `/clear` - Reset context when switching features
- `use frontend-specialist to analyze [feature]` - Research frontend needs
- `use backend-specialist to analyze [feature]` - Research backend needs
```

### 4. Shared Context via Files

Instead of passing massive contexts between agents, use markdown files as shared memory in `.claude/docs/`.

```bash
mkdir -p .claude/docs/tasks
```

## Using This Pattern

### In Frontend Worktree:
```bash
cd ../myproject-frontend
claude

# In Claude Code:
> use frontend-specialist to analyze the user dashboard requirements in docs/features.md

# Subagent researches and saves plan to .claude/docs/frontend-plan.md

> read .claude/docs/frontend-plan.md and implement the component structure

# When done with this feature:
> /clear

# Start next feature fresh
```

### In Backend Worktree:
```bash
cd ../myproject-backend  
claude

# In Claude Code:
> use backend-specialist to analyze the user API requirements

# Subagent researches and saves plan to .claude/docs/backend-plan.md

> read .claude/docs/backend-plan.md and implement the endpoints

> /clear
```

## Key Benefits

Using subagents to verify details or investigate questions, especially early on, preserves context availability without much downside in terms of lost efficiency.

Use `/clear` often - every time you switch gears or start something new. Monitor the context meter and `/compact` at 70% capacity.

This pattern gives you:
- **Parallel research** without context pollution
- **Specialized expertise** per domain
- **Clean main context** for implementation
- **Shared memory** via markdown files
- **Version-controlled** agent configurations

Want me to help you set up these files for your specific tech stack?