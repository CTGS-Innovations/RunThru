#!/bin/bash
# Test OpenAI portrait generation with Zombie Apocalypse script

echo "🧟 Testing Character Portraits with Zombie Apocalypse Script"
echo "=============================================================="
echo ""
echo "This will:"
echo "  1. Upload the full zombie script"
echo "  2. Generate portraits for ALL 11 characters"
echo "  3. Style: Pixar meets Broadway (improved prompts)"
echo "  4. Format: WebP 70% compression"
echo "  5. Estimated cost: ~\$0.66"
echo "  6. Estimated time: ~10 minutes"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "📤 Uploading script..."
echo ""

# Read the zombie script and convert to JSON
SCRIPT_PATH="/home/corey/projects/RunThru/data/scripts/10 Ways to Survive the Zombie Apocalypse.md"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "❌ Script not found at: $SCRIPT_PATH"
  exit 1
fi

# Upload script to API (it will auto-generate portraits)
RESPONSE=$(curl -s -X POST http://localhost:4000/api/scripts \
  -H "Content-Type: application/json" \
  -d "{\"markdown\": $(jq -Rs . < "$SCRIPT_PATH")}")

echo "📋 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Test complete!"
echo ""
echo "Check the generated portraits at:"
SCRIPT_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)
if [ "$SCRIPT_ID" != "null" ] && [ -n "$SCRIPT_ID" ]; then
  echo "  public/portraits/$SCRIPT_ID/"
  echo ""
  echo "View them:"
  echo "  ls -lh public/portraits/$SCRIPT_ID/"
  echo "  open public/portraits/$SCRIPT_ID/  # (if on Mac)"
fi
echo ""
