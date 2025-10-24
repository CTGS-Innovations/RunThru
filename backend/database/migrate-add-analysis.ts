/**
 * Migration: Add OpenAI analysis columns to scripts table
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/database/runthru.db');

function migrate() {
  console.log('🔄 Running migration: Add analysis columns to scripts table');

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  try {
    // Check if columns already exist
    const columns = db.prepare("PRAGMA table_info(scripts)").all();
    const columnNames = (columns as any[]).map((col: any) => col.name);

    console.log('Current columns:', columnNames);

    // Add columns if they don't exist
    if (!columnNames.includes('analysis')) {
      console.log('  Adding column: analysis');
      db.prepare('ALTER TABLE scripts ADD COLUMN analysis TEXT').run();
    }

    if (!columnNames.includes('analysis_tokens_used')) {
      console.log('  Adding column: analysis_tokens_used');
      db.prepare('ALTER TABLE scripts ADD COLUMN analysis_tokens_used INTEGER DEFAULT 0').run();
    }

    if (!columnNames.includes('analysis_cost_usd')) {
      console.log('  Adding column: analysis_cost_usd');
      db.prepare('ALTER TABLE scripts ADD COLUMN analysis_cost_usd REAL DEFAULT 0').run();
    }

    if (!columnNames.includes('analyzed_at')) {
      console.log('  Adding column: analyzed_at');
      db.prepare('ALTER TABLE scripts ADD COLUMN analyzed_at DATETIME').run();
    }

    console.log('✅ Migration complete!');

    // Verify new schema
    const newColumns = db.prepare("PRAGMA table_info(scripts)").all();
    console.log('\nNew columns:', (newColumns as any[]).map((col: any) => col.name));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

migrate();
