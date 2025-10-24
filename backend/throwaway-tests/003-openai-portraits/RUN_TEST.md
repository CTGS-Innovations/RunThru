# Running the OpenAI Portrait Test

## Option 1: Upload Script via API (Recommended)

The easiest way to test is to upload your zombie apocalypse script through the API:

1. **Start the backend server**:
   ```bash
   cd /home/corey/projects/RunThru-backend/backend
   npm run dev
   ```

2. **Upload your script** via the API:
   ```bash
   curl -X POST http://localhost:4000/api/scripts \
     -H "Content-Type: application/json" \
     -d '{"markdown": "YOUR_SCRIPT_HERE"}'
   ```

   Or use the frontend at http://localhost:3000

3. **Check the results**:
   - Portraits will be in: `public/portraits/[scriptId]/`
   - Analysis data returned in API response
   - Backend logs show progress

## Option 2: Run Standalone Test (If you have the script file)

If you have the zombie apocalypse markdown file:

1. **Place the script**:
   ```bash
   mkdir -p data/scripts
   cp /path/to/zombie-script.md data/scripts/zombie-apocalypse.md
   ```

2. **Run the test**:
   ```bash
   npx ts-node throwaway-tests/003-openai-portraits/test-portraits.ts
   ```

3. **Review results**:
   - Check `throwaway-tests/003-openai-portraits/results/`
   - Check `public/portraits/test-run/`

## What to Look For

After generation, review:

1. **Portrait Quality**
   - Theatrical style (not photorealistic)?
   - Teen-appropriate (no gore)?
   - Matches character personality?

2. **Style Consistency**
   - Do all portraits look like they're from the same production?
   - Does style match script genre?

3. **Prompt Effectiveness**
   - Are descriptions accurate?
   - Are traits visible in portraits?

## Quick Test with Sample Script

Want to do a quick test first? Here's a mini script:

```bash
curl -X POST http://localhost:4000/api/scripts \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# Romeo and Juliet (Excerpt)\n\n## Act 2, Scene 2\n\n**ROMEO:** But soft! What light through yonder window breaks?\nIt is the east, and Juliet is the sun.\n\n**JULIET:** O Romeo, Romeo! Wherefore art thou Romeo?"
  }'
```

This will generate 2 character portraits for Romeo and Juliet. Much faster than 11 characters!

