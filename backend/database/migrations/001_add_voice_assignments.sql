-- Migration: Add voice assignment features (Sprint 3)
-- This migration adds the selected_character column and voice_assignments table

-- Add selected_character column to sessions if it doesn't exist
-- SQLite doesn't support ALTER TABLE IF COLUMN NOT EXISTS, so we wrap in a check
PRAGMA foreign_keys=OFF;

-- Create new sessions table with all columns
CREATE TABLE IF NOT EXISTS sessions_new (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  selected_character TEXT NOT NULL DEFAULT '',  -- New column for Sprint 3
  current_scene_index INTEGER DEFAULT 0,
  current_line_index INTEGER DEFAULT 0,
  user_role TEXT,
  voice_assignments TEXT,
  tts_engine TEXT DEFAULT 'chatterbox',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

-- Copy data from old table (if it exists)
INSERT OR IGNORE INTO sessions_new (id, script_id, current_scene_index, current_line_index, user_role, voice_assignments, tts_engine, created_at, last_accessed_at, selected_character)
SELECT id, script_id, current_scene_index, current_line_index, user_role, voice_assignments, tts_engine, created_at, last_accessed_at, COALESCE(user_role, '') as selected_character
FROM sessions;

-- Drop old table and rename new one
DROP TABLE IF EXISTS sessions;
ALTER TABLE sessions_new RENAME TO sessions;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_sessions_script_id ON sessions(script_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed_at DESC);

-- Create voice_assignments table (normalized voice settings)
CREATE TABLE IF NOT EXISTS voice_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  voice_preset_id TEXT NOT NULL,
  gender INTEGER DEFAULT 50,
  emotion INTEGER DEFAULT 50,
  age INTEGER DEFAULT 50,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE(session_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_voice_assignments_session ON voice_assignments(session_id);

PRAGMA foreign_keys=ON;
