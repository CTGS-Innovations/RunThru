#!/bin/bash
# Test OpenAI Integration with Romeo & Juliet

echo "🧪 Testing OpenAI Integration"
echo "================================"
echo ""
echo "This will:"
echo "  1. Upload a short Romeo & Juliet excerpt"
echo "  2. Generate 2 character portraits"
echo "  3. Cost: ~\$0.09"
echo "  4. Time: ~20-30 seconds"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "📤 Uploading script to API..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

RESPONSE=$(curl -s -X POST http://localhost:4000/api/scripts \
  -H "Content-Type: application/json" \
  -d @"${SCRIPT_DIR}/test-romeo.json")

echo "📋 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Test complete!"
echo ""
echo "Check:"
echo "  - Backend logs for progress updates"
echo "  - public/portraits/[scriptId]/ for generated portraits"
echo ""
