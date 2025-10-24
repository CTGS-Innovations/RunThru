-- RunThru Database Schema
-- SQLite 3

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  markdown_source TEXT NOT NULL,
  parsed_json TEXT NOT NULL,
  analysis TEXT,  -- JSON: OpenAI analysis (metadata, characters, scenes)
  analysis_tokens_used INTEGER DEFAULT 0,
  analysis_cost_usd REAL DEFAULT 0,
  analyzed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scripts_created_at ON scripts(created_at DESC);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  selected_character TEXT,  -- Character the user is playing (nullable for multiplayer)
  current_scene_index INTEGER DEFAULT 0,
  current_line_index INTEGER DEFAULT 0,
  user_role TEXT,  -- Deprecated: use selected_character instead
  voice_assignments TEXT,  -- JSON backup: use voice_assignments table instead
  tts_engine TEXT DEFAULT 'chatterbox',  -- Default to chatterbox (faster)
  shareable_token TEXT UNIQUE,  -- UUID for shareable lobby links
  expires_at DATETIME,  -- Session expiration time (4 hours from creation)
  is_active BOOLEAN DEFAULT 0,  -- True when rehearsal starts
  started_at DATETIME,  -- When host started the rehearsal
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_script_id ON sessions(script_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_accessed ON sessions(last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_shareable_token ON sessions(shareable_token);

-- Voice assignments table (normalized, per-character voice settings)
CREATE TABLE IF NOT EXISTS voice_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  character_id TEXT NOT NULL,  -- Character name from script
  voice_preset_id TEXT NOT NULL,  -- Reference to voice preset (teen-male, etc.)
  gender INTEGER DEFAULT 50,  -- 0-100 (0=female, 100=male)
  emotion INTEGER DEFAULT 50,  -- 0-100 (0=calm, 100=excited)
  age INTEGER DEFAULT 50,  -- 0-100 (0=young, 100=old)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE(session_id, character_id)  -- One voice assignment per character per session
);

CREATE INDEX IF NOT EXISTS idx_voice_assignments_session ON voice_assignments(session_id);

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

-- Participants table (for multiplayer sessions)
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  character_name VARCHAR(100),  -- NULL until character selected
  is_ai BOOLEAN DEFAULT 0,  -- True for AI-controlled characters
  is_host BOOLEAN DEFAULT 0,  -- True for session creator
  is_ready BOOLEAN DEFAULT 0,  -- True when character assigned
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE(session_id, character_name)  -- Character locking: one character per session
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_host ON participants(session_id, is_host);
