/**
 * Test different image formats and quality settings with gpt-image-1
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TEST_PROMPT = `A theatrical character portrait of ROMEO. A passionate and impulsive young lover, Romeo is driven by his emotions and the intensity of first love.

Digital illustration in vibrant theatrical style with dramatic stage lighting. The character has a confident and theatrical expression and confident pose. Colorful theatrical costume, stylized art style similar to animated theater posters. Portrait orientation with subtle stage backdrop.`;

interface TestConfig {
  name: string;
  format: 'png' | 'webp' | 'jpeg';
  compression: number;
  quality: 'high' | 'medium' | 'low';
}

const TESTS: TestConfig[] = [
  { name: 'webp-high-85', format: 'webp', compression: 85, quality: 'high' },
  { name: 'webp-high-70', format: 'webp', compression: 70, quality: 'high' },
  { name: 'jpeg-high-85', format: 'jpeg', compression: 85, quality: 'high' },
  { name: 'jpeg-high-70', format: 'jpeg', compression: 70, quality: 'high' },
  { name: 'png-high-100', format: 'png', compression: 100, quality: 'high' },
];

async function runTest() {
  console.log('🧪 Testing gpt-image-1 with different formats\n');
  console.log('='.repeat(60));

  const resultsDir = path.join(__dirname, 'image-format-tests');
  await fs.mkdir(resultsDir, { recursive: true });

  for (const test of TESTS) {
    console.log(`\n📸 Test: ${test.name}`);
    console.log(`   Format: ${test.format}, Compression: ${test.compression}%, Quality: ${test.quality}`);

    try {
      const startTime = Date.now();

      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: TEST_PROMPT,
        size: '1024x1024',
        quality: test.quality,
        output_format: test.format,
        output_compression: test.compression,
        moderation: 'low', // Less restrictive filtering
      });

      const duration = Date.now() - startTime;

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error('No image data returned');
      }

      // Save image
      const filename = `romeo-${test.name}.${test.format}`;
      const filepath = path.join(resultsDir, filename);
      const buffer = Buffer.from(imageData.b64_json, 'base64');
      await fs.writeFile(filepath, buffer);

      const fileSizeKB = (buffer.length / 1024).toFixed(1);

      console.log(`   ✅ Success!`);
      console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`);
      console.log(`   File size: ${fileSizeKB} KB`);
      console.log(`   Saved: ${filename}`);

    } catch (error: any) {
      console.error(`   ❌ Failed:`, error.message);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Tests complete! Check: ${resultsDir}/\n`);
}

runTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
