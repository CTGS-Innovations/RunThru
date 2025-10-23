# Throwaway Tests - Data-Driven Decision Framework

This directory contains **isolated performance benchmarks and comparisons** used to validate architectural decisions with real data.

## Philosophy

> "In God we trust. All others must bring data." - W. Edwards Deming

When architectural decisions have performance implications, **we test them** instead of guessing. These tests are:
- **Isolated** - No dependencies on main codebase
- **Focused** - Test one specific comparison
- **Data-driven** - Generate real metrics
- **Throwaway** - Delete after decision is made (they're temporary!)

## When to Create a Throwaway Test

### ✅ Create a Test When:
- Performance claims need validation ("X is faster than Y")
- Comparing multiple library options
- Edge case handling needs corpus testing
- Optimization impact needs measurement
- You say "prove it with data"

### ❌ Skip Tests For:
- Obvious choices (TypeScript > JavaScript for this project)
- Standard practices (ESLint, Prettier)
- Aesthetic decisions (color schemes)
- Your direct experience ("I've used X, it works well")

## Directory Structure

```
throwaway-tests/
├── README.md (this file)
├── 001-state-management/
│   ├── README.md (test plan + results)
│   ├── benchmark.js (test script)
│   ├── results.json (raw data)
│   └── conclusion.md (decision + winner)
├── 002-markdown-parsers/
│   ├── README.md
│   ├── test-corpus/ (sample scripts)
│   ├── parser-custom.js
│   ├── parser-remark.js
│   ├── results.csv
│   └── winner.md
└── 003-tts-latency/
    ├── README.md
    ├── benchmark.py
    ├── sample-lines.txt
    ├── results.json
    └── analysis.md
```

## Test Template

Each test directory should contain:

### 1. README.md
```markdown
# Test [Number]: [Name]

## Hypothesis
[What you're testing]

## Options Compared
1. Option A - [Description]
2. Option B - [Description]
3. Option C - [Description]

## Test Methodology
[How you'll measure]

## How to Run
```bash
cd throwaway-tests/[number]-[name]
[command to run test]
```

## Expected Outcome
[What you think will happen]

## Actual Results
[Filled in after running test]

## Decision
[Which option wins and why]

## References
- Documented in: `docs/decisions/[number]-[name].md`
- Used in: [Which files/modules]
```

### 2. Test Script (benchmark.js, benchmark.py, etc.)
Isolated code that:
- Requires NO dependencies on main codebase
- Generates reproducible results
- Outputs to results.json or results.csv
- Includes timestamp and system info

### 3. Results File (results.json, results.csv)
Raw data output:
```json
{
  "test": "state-management-comparison",
  "timestamp": "2025-10-23T14:30:00Z",
  "system": {
    "node": "20.10.0",
    "cpu": "AMD Ryzen 9 5900X",
    "memory": "32GB"
  },
  "results": {
    "zustand": {
      "avg_ms": 1.2,
      "p50_ms": 1.1,
      "p95_ms": 1.8,
      "p99_ms": 2.3
    },
    "context": {
      "avg_ms": 8.5,
      "p50_ms": 7.9,
      "p95_ms": 12.1,
      "p99_ms": 18.4
    }
  }
}
```

### 4. Conclusion/Analysis (conclusion.md, analysis.md)
Human-readable summary:
- Key findings
- Winner and why
- Trade-offs accepted
- Link to docs/decisions/

## Workflow Example

### Step 1: Question Arises
**Me**: "For state management, I recommend Zustand because it's performant and simple."
**You**: "Prove it. Create a throwaway test comparing Zustand vs Context."

### Step 2: Create Test
```bash
mkdir -p throwaway-tests/001-state-management
cd throwaway-tests/001-state-management

# Create benchmark
cat > benchmark.js <<EOF
// Isolated test comparing Zustand vs Context
// [test code here]
EOF

# Run test
node benchmark.js > results.json
```

### Step 3: Analyze Results
```bash
# results.json shows:
# Zustand: 1.2ms avg
# Context: 8.5ms avg
# Winner: Zustand (7x faster)
```

### Step 4: Document Decision
```bash
# Create decision document
cat > conclusion.md <<EOF
# Winner: Zustand

**Data**: Zustand is 7x faster (1.2ms vs 8.5ms per update)
**Trade-off**: Adds 1KB dependency vs Context (built-in)
**Decision**: Use Zustand (performance matters for audio playback)
EOF

# Link from docs/decisions/
docs/decisions/001-state-management.md references this test
```

### Step 5: Implement
Main agent implements using Zustand based on data.

### Step 6: Cleanup (Optional)
```bash
# After decision is made and documented, can delete test
rm -rf throwaway-tests/001-state-management

# OR keep it in git history for future reference
git add throwaway-tests/001-state-management
git commit -m "test: Zustand vs Context comparison (Zustand wins 7x)"
```

## Example Tests for RunThru

### Likely Tests We'll Need:
1. **State management** - Zustand vs Context vs Redux
2. **Markdown parsers** - Custom vs remark vs marked
3. **TTS latency** - Index TTS vs Chatterbox on RTX 3090
4. **Audio formats** - WAV vs MP3 vs Opus (quality vs size)
5. **Cache strategies** - Filesystem vs SQLite blobs
6. **Script parsing speed** - Regex vs AST parser

## Integration with docs/decisions/

Every throwaway test should be referenced in a decision document:

**throwaway-tests/003-tts-latency/** → **docs/decisions/003-tts-engine-selection.md**

The decision doc includes:
- Context and options
- Link to throwaway test
- Raw results summary
- Final decision with rationale
- Human approval (@corey approves)

## Notes
- Tests are **temporary** by nature (hence "throwaway")
- Keep tests **simple** - measure one thing well
- **No mocking** - test real implementations
- **Reproducible** - include system info, timestamps
- **Data first** - numbers over opinions
- **Delete after use** - or keep in git history for reference

## Questions?
See example test in `001-state-management/` (if created) for full pattern.
