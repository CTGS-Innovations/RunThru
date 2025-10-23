-- RunThru Database Schema
-- SQLite 3

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  markdown_source TEXT NOT NULL,
  parsed_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  current_scene_index INTEGER DEFAULT 0,
  current_line_index INTEGER DEFAULT 0,
  user_role TEXT,
  voice_assignments TEXT,
  tts_engine TEXT DEFAULT 'index-tts',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_script_id ON sessions(script_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed_at DESC);

-- Audio cache metadata
CREATE TABLE IF NOT EXISTS audio_cache (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  line_id TEXT NOT NULL,
  tts_engine TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  emotion_hash TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audio_cache_script_id ON audio_cache(script_id);
CREATE INDEX IF NOT EXISTS idx_audio_cache_lookup ON audio_cache(script_id, line_id, tts_engine, voice_id);
