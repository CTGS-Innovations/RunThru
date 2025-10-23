# Architectural Decision Records (ADRs)

This directory contains **architectural decisions** made during RunThru development, with supporting data from throwaway tests when applicable.

## Purpose

Document **why** we made specific technical choices, not just **what** we chose. This helps:
- **Future developers** understand context
- **Current team** stay aligned on decisions
- **Code reviews** reference agreed-upon patterns
- **Refactoring** know what trade-offs were accepted

## Format

Each decision uses this template:

```markdown
# Decision [Number]: [Title]

**Status**: Approved | Proposed | Superseded
**Date**: 2025-10-23
**Deciders**: @corey, Claude
**Tags**: frontend | backend | tts | performance | architecture

## Context
[What problem are we solving? What constraints do we have?]

## Options Considered

### Option 1: [Name]
**Pros**:
-

[...]

**Cons**:
- [...]

**Trade-offs**:
- [...]

### Option 2: [Name]
[Same format]

### Option 3: [Name]
[Same format]

## Data-Driven Analysis

**Test**: `throwaway-tests/[number]-[name]/`

**Key Findings**:
- Metric 1: [result]
- Metric 2: [result]

**Raw data**: See `throwaway-tests/[number]-[name]/results.json`

## Decision

**Chosen**: [Option Name]

**Rationale**:
1. [Reason with data]
2. [Reason with data]
3. [Consider constraints]

**Trade-offs Accepted**:
- [What we're giving up]
- [Why it's acceptable]

## Implementation

**Files affected**:
- `path/to/file1.ts` - [what changes]
- `path/to/file2.ts` - [what changes]

**Pattern to follow**:
```typescript
// Example code showing the pattern
```

## Consequences

**Positive**:
- [Benefit 1]
- [Benefit 2]

**Negative**:
- [Cost 1]
- [Cost 2]

**Mitigation**:
- [How we'll handle negatives]

## Future Considerations
[When might we revisit this decision?]

## References
- Throwaway test: `throwaway-tests/[number]-[name]/`
- Related decisions: [Links to other ADRs]
- External docs: [Links]
```

## Numbering Convention

**Format**: `[number]-[slug].md`

**Examples**:
- `001-state-management.md`
- `002-markdown-parser.md`
- `003-tts-engine-selection.md`
- `004-audio-format.md`

Numbers align with throwaway tests when applicable.

## Status Values

| Status | Meaning |
|--------|---------|
| **Proposed** | Under discussion, not yet implemented |
| **Approved** | Decision made, implementation in progress or complete |
| **Superseded** | Replaced by a newer decision (link to new ADR) |

## Example Decisions for RunThru

### Likely ADRs:
1. **State Management** - Zustand vs Context (with throwaway test)
2. **UI Component Library** - shadcn/ui vs alternatives (user experience)
3. **TTS Engine** - Index TTS vs Chatterbox (with throwaway test)
4. **Database** - SQLite vs PostgreSQL (deployment constraints)
5. **Audio Format** - WAV vs MP3 (with throwaway test)
6. **Deployment** - Docker + Cloudflare Tunnel (local GPU requirement)
7. **Authentication** - PIN-based vs user accounts (simplicity)

## Updating Decisions

### When to Create a New Decision:
- Comparing multiple technical approaches
- Performance-critical choice
- Architectural pattern that will be reused
- Trade-offs between complexity and features

### When to Update Existing Decision:
- New data emerges (performance changes)
- Implementation reveals issues
- Mark as Superseded and link to new ADR

## Integration with Throwaway Tests

**Workflow**:
1. Question arises: "Which state management library?"
2. Create throwaway test: `throwaway-tests/001-state-management/`
3. Run test, collect data
4. Create ADR: `docs/decisions/001-state-management.md`
5. Reference test results in ADR
6. Approve decision
7. Implement pattern
8. (Optional) Delete throwaway test after documenting results

## Example ADR

See `001-state-management.md` (to be created) for full example.

Quick preview:
```
# Decision 001: State Management

Context: Need global state for session (currentLine, isPlaying, etc)

Options: Zustand, Context, Redux

Test: throwaway-tests/001-state-management/ showed:
- Zustand: 1.2ms avg, 4 re-renders
- Context: 8.5ms avg, 20 re-renders
- Redux: 3.7ms avg, 6 re-renders

Decision: Zustand (7x faster, simplest API)

Trade-off: +1KB dependency vs Context (acceptable)
```

## Notes
- ADRs are **permanent** (unlike throwaway tests)
- Keep them **concise** (1-2 pages max)
- Include **data** when available
- Tag with **@username** for approvers
- Link **bidirectionally** (ADR ↔ throwaway test)
