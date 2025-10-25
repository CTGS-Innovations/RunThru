-- Migration: Add updated_at column to participants table for optimized polling
-- Purpose: Track when participant data changes to avoid unnecessary queries

-- Add updated_at column (nullable, will set defaults next)
ALTER TABLE participants ADD COLUMN updated_at DATETIME;

-- Backfill existing rows with joined_at as initial value
UPDATE participants SET updated_at = COALESCE(updated_at, joined_at, CURRENT_TIMESTAMP);

-- Create trigger to auto-update timestamp on any UPDATE
CREATE TRIGGER IF NOT EXISTS participants_updated_at
AFTER UPDATE ON participants
FOR EACH ROW
BEGIN
  UPDATE participants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create index for efficient version checking
CREATE INDEX IF NOT EXISTS idx_participants_updated_at ON participants(session_id, updated_at DESC);
