# Test 001: State Management Comparison

## Status
**Example Test** - Demonstrates throwaway test pattern. Not yet run.

## Hypothesis
Zustand will be faster than React Context for frequent state updates (like audio playback position) while maintaining similar developer experience.

## Options Compared

### 1. Zustand
**Description**: Lightweight state management library (~1KB)
**Pros**:
- No Provider wrapper needed
- Selective re-renders
- Simple API
- Built-in devtools

**Cons**:
- External dependency
- Less familiar to beginners

### 2. React Context + useReducer
**Description**: Built-in React state management
**Pros**:
- No dependencies
- Familiar pattern
- Part of React

**Cons**:
- Potential re-render issues
- Requires Provider wrapper
- More boilerplate

### 3. Redux Toolkit
**Description**: Official Redux tooling
**Pros**:
- Industry standard
- Excellent devtools
- Large ecosystem

**Cons**:
- Heavyweight (~47KB)
- More boilerplate
- Overkill for this project

## Test Methodology

### Benchmark Setup:
1. Create identical state structure in each library
2. Simulate rehearsal scenario:
   - Update `currentLineIndex` 60 times/sec (audio playback)
   - 20 components subscribed to state
   - Measure re-renders per update
   - Measure update latency (ms)

### Metrics to Collect:
- **Average update time** (lower is better)
- **P50, P95, P99 latency** (consistency)
- **Re-renders per update** (fewer is better)
- **Bundle size impact** (KB added)
- **Memory usage** (MB)

### Test Duration:
- 1000 state updates per library
- Warmup: 100 updates (discard)
- Measure: 1000 updates

## How to Run

```bash
cd throwaway-tests/001-state-management

# Install dependencies
npm install zustand react react-dom @reduxjs/toolkit

# Run benchmark
node benchmark.js

# View results
cat results.json
```

## Expected Outcome
**Prediction**:
- Zustand: ~1-2ms per update, 4-5 components re-render
- Context: ~7-10ms per update, 20 components re-render (all)
- Redux: ~3-5ms per update, 6-8 components re-render

**Winner**: Zustand (best performance + simplicity)

## Actual Results
[To be filled after running test]

```json
{
  "test": "state-management-comparison",
  "timestamp": "TBD",
  "results": {
    "zustand": {
      "avg_ms": "TBD",
      "p50_ms": "TBD",
      "p95_ms": "TBD",
      "p99_ms": "TBD",
      "re_renders": "TBD",
      "bundle_kb": 1.2
    },
    "context": {
      "avg_ms": "TBD",
      "p50_ms": "TBD",
      "p95_ms": "TBD",
      "p99_ms": "TBD",
      "re_renders": "TBD",
      "bundle_kb": 0
    },
    "redux": {
      "avg_ms": "TBD",
      "p50_ms": "TBD",
      "p95_ms": "TBD",
      "p99_ms": "TBD",
      "re_renders": "TBD",
      "bundle_kb": 47
    }
  }
}
```

## Decision
[To be filled after analysis]

**Winner**: TBD

**Rationale**: TBD

**Trade-offs Accepted**: TBD

## References
- Decision documented in: `docs/decisions/001-state-management.md`
- Implemented in: `frontend/src/stores/sessionStore.ts`
- Pattern used in: All global state (session, audio, auth)

## Notes
This is an **example test** demonstrating the throwaway test pattern. It shows:
- Clear hypothesis
- Multiple options with pros/cons
- Specific metrics to measure
- Reproducible test methodology
- Results format
- Decision documentation

To actually run this test, you'd need to:
1. Create `benchmark.js` with React rendering benchmarks
2. Set up test harnesses for each library
3. Run and collect results
4. Analyze data
5. Document decision
6. Delete or archive this directory
