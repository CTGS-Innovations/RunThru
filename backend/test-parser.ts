/**
 * Quick test of ScriptParserService
 * Run with: npx ts-node test-parser.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { ScriptParserService } from './src/services/scriptParser.service';

const scriptPath = '/home/corey/projects/RunThru/data/scripts/10 Ways to Survive the Zombie Apocalypse.md';
const markdown = fs.readFileSync(scriptPath, 'utf-8');

const parser = new ScriptParserService();
const result = parser.parse(markdown);

console.log('📜 Script Parser Test\n');
console.log('Title:', result.title);
console.log('Subtitle:', result.subtitle);
console.log('Author:', result.author);
console.log('\n📋 Front Matter Blocks:', result.frontMatter.length);
result.frontMatter.forEach((block, i) => {
  console.log(`  ${i + 1}. ${block.type}: ${block.heading} (line ${block.lineNumber})`);
});

console.log('\n🎭 Characters:', result.characters.length);
result.characters.slice(0, 10).forEach((char) => {
  console.log(`  - ${char.name}: ${char.lineCount} lines (first: line ${char.firstAppearance})`);
});

console.log('\n🎬 Scenes:', result.scenes.length);
result.scenes.slice(0, 10).forEach((scene) => {
  console.log(`  - ${scene.id}: "${scene.title}" (${scene.dialogueCount} lines, ${scene.characterCount} chars)`);
});

console.log('\n📝 Content Elements:', result.content.length);
const contentStats = {
  scenes: result.content.filter(e => e.type === 'scene').length,
  dialogue: result.content.filter(e => e.type === 'dialogue').length,
  stageDirection: result.content.filter(e => e.type === 'stage_direction').length,
};
console.log('  Scenes:', contentStats.scenes);
console.log('  Dialogue:', contentStats.dialogue);
console.log('  Stage Directions:', contentStats.stageDirection);

console.log('\n🔍 Sample Dialogue (first 5):');
result.content
  .filter(e => e.type === 'dialogue')
  .slice(0, 5)
  .forEach((dialogue: any) => {
    const directionStr = dialogue.direction ? ` (${dialogue.direction})` : '';
    const offstageStr = dialogue.isOffstage ? ' [OFFSTAGE]' : '';
    console.log(`  ${dialogue.id} - ${dialogue.character}${directionStr}${offstageStr}:`);
    console.log(`    "${dialogue.text.substring(0, 60)}${dialogue.text.length > 60 ? '...' : ''}"`);
  });

console.log('\n✅ Parser test complete!\n');

// Save output to file for inspection
const outputPath = path.join(__dirname, 'test-parser-output.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`📄 Full output saved to: ${outputPath}\n`);
