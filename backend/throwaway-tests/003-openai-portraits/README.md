# Throwaway Test 003: OpenAI Portrait Generation

## Purpose

Validate the OpenAI integration (GPT-4o-mini + DALL-E 3) before committing to full implementation.

## What This Tests

1. **Text Analysis Accuracy**: Can GPT-4o-mini extract meaningful character descriptions?
2. **Portrait Quality**: Do DALL-E 3 portraits look theatrical and teen-appropriate?
3. **Prompt Effectiveness**: Do our prompts produce good results?
4. **Style Consistency**: Do portraits match the script's genre/tone?
5. **Cost & Timing**: Are costs and generation times acceptable?

## Prerequisites

1. OpenAI API key set in `.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```

2. Test script exists at:
   ```
   backend/data/scripts/zombie-apocalypse.md
   ```

## How to Run

```bash
# From backend directory
cd /home/corey/projects/RunThru-backend/backend

# Run the test
npx ts-node throwaway-tests/003-openai-portraits/test-portraits.ts
```

## What It Does

1. **Loads** the zombie apocalypse script (~1200 lines, 11 characters)
2. **Runs** GPT-4o-mini text analysis (genre, themes, character descriptions)
3. **Selects** 3 sample characters (1 Lead, 1 Featured, 1 Ensemble)
4. **Generates** DALL-E 3 portraits for those 3 characters
5. **Saves** results to `throwaway-tests/003-openai-portraits/results/`
6. **Saves** portrait images to `public/portraits/test-run/`

## Expected Results

**Cost**: ~$0.13 total
- Text analysis: ~$0.013
- 3 portraits: $0.12 ($0.04 each)

**Time**: ~30-40 seconds
- Text analysis: ~5-10s
- Portrait generation: ~20-30s (3 portraits)

## Success Criteria

✅ Portraits should:
- Look theatrical (not photorealistic)
- Be teen-appropriate (no gore/violence)
- Match script's comedy/horror tone
- Be distinct and recognizable
- Show character personality

✅ Text analysis should:
- Identify genres correctly (Comedy, Horror Parody)
- Extract meaningful themes
- Generate useful character descriptions

## Review Process

After running the test:

1. **Check portraits** in `public/portraits/test-run/`
2. **Read results** in `throwaway-tests/003-openai-portraits/results/RESULTS.md`
3. **Evaluate quality**:
   - Do portraits match your vision?
   - Are they appropriate for teens?
   - Do they fit the script style?

4. **Make decision**:
   - ✅ **APPROVED**: Proceed with full implementation
   - 🔄 **ITERATE**: Adjust prompts and run again
   - ❌ **RETHINK**: Approach needs changes

5. **Document findings** in `results/RESULTS.md` (checkboxes provided)

## Iterating on Prompts

If portraits need improvement, edit:
```
backend/src/services/characterPortrait.service.ts
```

Look for the `buildPortraitPrompt()` method and adjust:
- Style keywords
- Mood descriptors
- Technical directions
- Quality parameters

Then run the test again.

## Next Steps

After validating with zombie script:

1. **Test variety** (optional): Generate mock scripts with different genres
2. **Test full batch** (optional): Generate all 11 characters to see consistency
3. **Clean up**: Delete this throwaway test directory once decision is made

## Cleanup

Once you've made a decision:

```bash
# Delete the throwaway test
rm -rf throwaway-tests/003-openai-portraits/

# Document decision in docs/decisions/
echo "Decision documented in git commit"
```

---

**Note**: This is a throwaway test. It's meant to be deleted after we validate the approach. The real implementation is in `src/services/`.
