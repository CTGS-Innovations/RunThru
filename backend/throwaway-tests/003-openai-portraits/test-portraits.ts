/**
 * Throwaway Test: OpenAI Portrait Generation
 *
 * Purpose: Validate character portrait generation before full implementation
 *
 * What this tests:
 * 1. GPT-4o-mini text analysis accuracy
 * 2. DALL-E 3 portrait quality
 * 3. Prompt effectiveness
 * 4. Style consistency
 * 5. Cost and timing
 *
 * Run: npx ts-node throwaway-tests/003-openai-portraits/test-portraits.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { ScriptParserService } from '../../src/services/scriptParser.service';
import { scriptAnalysisService } from '../../src/services/scriptAnalysis.service';
import { characterPortraitService } from '../../src/services/characterPortrait.service';

// Load environment variables
dotenv.config();

const RESULTS_DIR = path.join(__dirname, 'results');
const TEST_SCRIPT_PATH = path.join(__dirname, '../../data/scripts/zombie-apocalypse.md');

interface TestResults {
  scriptTitle: string;
  totalCharacters: number;
  charactersAnalyzed: number;
  textAnalysis: {
    tokensUsed: number;
    cost: number;
    durationMs: number;
    genres: string[];
    themes: string[];
  };
  portraitGeneration: {
    charactersGenerated: number;
    totalCost: number;
    durationMs: number;
    successRate: number;
  };
  sampleCharacters: Array<{
    name: string;
    description: string;
    roleType: string;
    personalityTraits: string[];
    portraitUrl: string;
    promptUsed: string;
  }>;
}

async function ensureResultsDir() {
  await fs.mkdir(RESULTS_DIR, { recursive: true });
  console.log(`✅ Results directory ready: ${RESULTS_DIR}`);
}

async function loadTestScript(): Promise<string> {
  try {
    const markdown = await fs.readFile(TEST_SCRIPT_PATH, 'utf-8');
    console.log(`✅ Loaded test script: ${TEST_SCRIPT_PATH}`);
    return markdown;
  } catch (error) {
    console.error(`❌ Could not load test script from ${TEST_SCRIPT_PATH}`);
    console.error('   Please ensure the zombie apocalypse script exists at this path');
    throw error;
  }
}

async function runTest() {
  console.log('\n🧪 OpenAI Portrait Generation Test\n');
  console.log('=' .repeat(60));

  // Ensure results directory exists
  await ensureResultsDir();

  // Load and parse script
  console.log('\n📖 Step 1: Loading and parsing script...');
  const markdown = await loadTestScript();
  const parser = new ScriptParserService();
  const parsed = parser.parse(markdown);

  console.log(`   Title: ${parsed.title}`);
  console.log(`   Characters: ${parsed.characters.length}`);
  console.log(`   Scenes: ${parsed.scenes.length}`);

  // Run text analysis
  console.log('\n🤖 Step 2: Running GPT-4o-mini text analysis...');
  const analysisStart = Date.now();
  const textAnalysis = await scriptAnalysisService.analyzeScript(parsed);
  const analysisDuration = Date.now() - analysisStart;

  console.log(`   ✅ Analysis complete in ${(analysisDuration / 1000).toFixed(2)}s`);
  console.log(`   Tokens used: ${textAnalysis.tokensUsed}`);
  console.log(`   Cost: $${textAnalysis.textAnalysisCost.toFixed(4)}`);
  console.log(`   Genres: ${textAnalysis.scriptLevel.genre.join(', ')}`);
  console.log(`   Themes: ${textAnalysis.scriptLevel.themes.join(', ')}`);

  // Select 3 characters for portrait generation (variety of role types)
  const testCharacters = selectTestCharacters(textAnalysis.characters);
  console.log(`\n🎨 Step 3: Generating portraits for ${testCharacters.length} sample characters...`);
  testCharacters.forEach((char, i) => {
    console.log(`   ${i + 1}. ${char.characterName} (${char.roleType})`);
  });

  // Generate portraits
  const portraitStart = Date.now();
  const charactersWithPortraits = await characterPortraitService.generateAllPortraits(
    'test-run',
    testCharacters,
    (current, total) => {
      console.log(`   Progress: ${current}/${total} portraits generated`);
    }
  );
  const portraitDuration = Date.now() - portraitStart;
  const successCount = charactersWithPortraits.filter(c => c.portrait.imageUrl).length;

  console.log(`   ✅ Portrait generation complete in ${(portraitDuration / 1000).toFixed(2)}s`);
  console.log(`   Success rate: ${successCount}/${testCharacters.length}`);
  console.log(`   Cost: $${(testCharacters.length * 0.04).toFixed(2)}`);

  // Compile results
  const results: TestResults = {
    scriptTitle: parsed.title,
    totalCharacters: parsed.characters.length,
    charactersAnalyzed: textAnalysis.characters.length,
    textAnalysis: {
      tokensUsed: textAnalysis.tokensUsed,
      cost: textAnalysis.textAnalysisCost,
      durationMs: analysisDuration,
      genres: textAnalysis.scriptLevel.genre,
      themes: textAnalysis.scriptLevel.themes,
    },
    portraitGeneration: {
      charactersGenerated: testCharacters.length,
      totalCost: testCharacters.length * 0.04,
      durationMs: portraitDuration,
      successRate: successCount / testCharacters.length,
    },
    sampleCharacters: charactersWithPortraits.map(char => ({
      name: char.characterName,
      description: char.description,
      roleType: char.roleType,
      personalityTraits: char.personalityTraits,
      portraitUrl: char.portrait.imageUrl,
      promptUsed: char.portrait.prompt,
    })),
  };

  // Save results
  console.log('\n💾 Step 4: Saving results...');
  await saveResults(results);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Cost: $${(results.textAnalysis.cost + results.portraitGeneration.totalCost).toFixed(4)}`);
  console.log(`Total Time: ${((analysisDuration + portraitDuration) / 1000).toFixed(2)}s`);
  console.log(`\nFull results saved to: ${RESULTS_DIR}/`);
  console.log(`\nPortraits saved to: ${path.join(__dirname, '../../public/portraits/test-run/')}`);
  console.log('\n✅ Test complete! Review the results and portraits.');
}

function selectTestCharacters(characters: any[]): any[] {
  // Select 3 characters with variety:
  // 1. One Lead
  // 2. One Featured
  // 3. One Ensemble
  const lead = characters.find(c => c.roleType === 'Lead');
  const featured = characters.find(c => c.roleType === 'Featured');
  const ensemble = characters.find(c => c.roleType === 'Ensemble');

  const selected = [];
  if (lead) selected.push(lead);
  if (featured) selected.push(featured);
  if (ensemble) selected.push(ensemble);

  // If we don't have all 3 role types, just take first 3
  if (selected.length < 3) {
    return characters.slice(0, 3);
  }

  return selected;
}

async function saveResults(results: TestResults) {
  // Save JSON results
  const jsonPath = path.join(RESULTS_DIR, 'test-results.json');
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2));
  console.log(`   ✅ JSON results: ${jsonPath}`);

  // Save human-readable report
  const reportPath = path.join(RESULTS_DIR, 'RESULTS.md');
  const report = generateMarkdownReport(results);
  await fs.writeFile(reportPath, report);
  console.log(`   ✅ Markdown report: ${reportPath}`);
}

function generateMarkdownReport(results: TestResults): string {
  return `# OpenAI Portrait Generation Test Results

**Test Date**: ${new Date().toISOString()}
**Script**: ${results.scriptTitle}

## Summary

| Metric | Value |
|--------|-------|
| Total Characters | ${results.totalCharacters} |
| Characters Tested | ${results.portraitGeneration.charactersGenerated} |
| Text Analysis Cost | $${results.textAnalysis.cost.toFixed(4)} |
| Portrait Cost | $${results.portraitGeneration.totalCost.toFixed(2)} |
| **Total Cost** | **$${(results.textAnalysis.cost + results.portraitGeneration.totalCost).toFixed(4)}** |
| Text Analysis Time | ${(results.textAnalysis.durationMs / 1000).toFixed(2)}s |
| Portrait Generation Time | ${(results.portraitGeneration.durationMs / 1000).toFixed(2)}s |
| **Total Time** | **${((results.textAnalysis.durationMs + results.portraitGeneration.durationMs) / 1000).toFixed(2)}s** |
| Success Rate | ${(results.portraitGeneration.successRate * 100).toFixed(0)}% |

## Script Analysis

**Genres**: ${results.textAnalysis.genres.join(', ')}
**Themes**: ${results.textAnalysis.themes.join(', ')}

**Tokens Used**: ${results.textAnalysis.tokensUsed}

## Sample Characters

${results.sampleCharacters.map((char, i) => `
### ${i + 1}. ${char.name} (${char.roleType})

**Description**: ${char.description}

**Personality Traits**: ${char.personalityTraits.join(', ')}

**Portrait**: \`${char.portraitUrl}\`

**Prompt Used**:
\`\`\`
${char.promptUsed}
\`\`\`
`).join('\n---\n')}

## Observations

### What Worked Well
- [ ] TODO: Review portraits and note what worked

### What Needs Improvement
- [ ] TODO: Review portraits and note what needs iteration

### Prompt Adjustments Needed
- [ ] TODO: If prompts need tweaking, document changes here

## Decision

- [ ] **APPROVED**: Portraits are good, proceed with full implementation
- [ ] **ITERATE**: Need to adjust prompts, run another test
- [ ] **RETHINK**: Approach needs significant changes

---
*This is a throwaway test. Delete this directory after making a decision.*
`;
}

// Run the test
runTest().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
