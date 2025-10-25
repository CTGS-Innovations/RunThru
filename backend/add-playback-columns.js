const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'runthru.db');
const db = new Database(dbPath);

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(sessions)").all();
  const hasPlaybackState = tableInfo.some(col => col.name === 'playback_state');
  const hasLastStateUpdate = tableInfo.some(col => col.name === 'last_state_update');

  if (!hasPlaybackState) {
    console.log('Adding playback_state column...');
    db.prepare("ALTER TABLE sessions ADD COLUMN playback_state TEXT DEFAULT 'paused'").run();
    console.log('✓ playback_state column added');
  } else {
    console.log('✓ playback_state column already exists');
  }

  if (!hasLastStateUpdate) {
    console.log('Adding last_state_update column...');
    db.prepare("ALTER TABLE sessions ADD COLUMN last_state_update DATETIME").run();
    // Update existing rows to have current timestamp
    db.prepare("UPDATE sessions SET last_state_update = CURRENT_TIMESTAMP WHERE last_state_update IS NULL").run();
    console.log('✓ last_state_update column added');
  } else {
    console.log('✓ last_state_update column already exists');
  }

  console.log('\n✅ Database migration complete!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
