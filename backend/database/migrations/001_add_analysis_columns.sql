-- Migration: Add OpenAI analysis columns to scripts table
-- Date: 2025-10-23
-- Sprint: 4 (OpenAI Integration)

-- Add analysis columns (safe to run multiple times)
ALTER TABLE scripts ADD COLUMN analysis TEXT;
ALTER TABLE scripts ADD COLUMN analysis_tokens_used INTEGER DEFAULT 0;
ALTER TABLE scripts ADD COLUMN analysis_cost_usd REAL DEFAULT 0;
ALTER TABLE scripts ADD COLUMN analyzed_at DATETIME;
