# Backup: 2025-10-24 02:10:13

## Contents

- `runthru.db*` - Complete SQLite database (3 files)
- `portraits/` - All character portrait images (1.9M)
- `zombie-apocalypse-analysis.json` - Current analysis data for comparison

## What's Backed Up

This backup contains:
- **Database**: All scripts, sessions, and OpenAI analysis metadata
- **Portraits**: 11 character portraits for Zombie Apocalypse script (webp format)
- **Analysis JSON**: Current analysis data for easy comparison with new run

## How to Restore

If you want to go back to this version:

```bash
# Stop the backend server first!

# Restore database
cp backups/backup-20251024-021013/runthru.db* backend/database/

# Restore portraits
rm -rf backend/public/portraits
cp -r backups/backup-20251024-021013/portraits backend/public/

# Restart server
cd backend && npm run dev
```

## Comparing Results

After running new analysis, you can compare:

```bash
# Get new analysis
curl -s http://localhost:4000/api/scripts/01af3528-4dd3-401d-a5c5-d17c96c445ac > new-analysis.json

# Compare character data
diff -u backups/backup-20251024-021013/zombie-apocalypse-analysis.json new-analysis.json
```

## Safety

This backup is completely isolated. The new analysis won't touch these files.
You can run the full upload flow and decide which version you prefer.
