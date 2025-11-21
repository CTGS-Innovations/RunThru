#!/bin/bash
# Rebuild and restart RunThru services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "==================================="
echo "RunThru Rebuild & Restart"
echo "==================================="
echo ""

# Step 1: Stop services
echo "Step 1: Stopping services..."
sudo systemctl stop runthru-backend.service
sudo systemctl stop runthru-frontend.service
echo "✓ Services stopped"
echo ""

# Step 2: Rebuild Backend
echo "Step 2: Rebuilding backend..."
cd "$PROJECT_ROOT/backend"
npm run build
echo "✓ Backend rebuilt"
echo ""

# Step 3: Rebuild Frontend
echo "Step 3: Rebuilding frontend..."
cd "$PROJECT_ROOT"
npm run build
echo "✓ Frontend rebuilt"
echo ""

# Step 4: Restart services
echo "Step 4: Restarting services..."
sudo systemctl start runthru-backend.service
sudo systemctl start runthru-frontend.service
echo "✓ Services restarted"
echo ""

echo "==================================="
echo "Rebuild Complete!"
echo "==================================="
echo ""
echo "Check status with: ./service/status.sh"
echo "View logs with:    ./service/logs.sh"
