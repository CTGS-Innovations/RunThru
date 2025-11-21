#!/bin/bash
# Install RunThru systemd services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "==================================="
echo "RunThru Service Installation"
echo "==================================="
echo ""

# Check if running from correct directory
if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    echo "Error: Cannot find docker-compose.yml in $PROJECT_ROOT"
    exit 1
fi

# Step 1: Build Backend
echo "Step 1: Building backend..."
cd "$PROJECT_ROOT/backend"
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
echo "Compiling TypeScript..."
npm run build
echo "✓ Backend built successfully"
echo ""

# Step 2: Build Frontend
echo "Step 2: Building frontend..."
cd "$PROJECT_ROOT"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
echo "Building Next.js production bundle..."
npm run build
echo "✓ Frontend built successfully"
echo ""

# Step 3: Install systemd services
echo "Step 3: Installing systemd services..."
echo "This requires sudo privileges..."
sudo cp "$SCRIPT_DIR/runthru-backend.service" /etc/systemd/system/
sudo cp "$SCRIPT_DIR/runthru-frontend.service" /etc/systemd/system/
sudo systemctl daemon-reload
echo "✓ Services installed"
echo ""

# Step 4: Enable services (start on boot)
echo "Step 4: Enabling services..."
sudo systemctl enable runthru-backend.service
sudo systemctl enable runthru-frontend.service
echo "✓ Services enabled (will start on boot)"
echo ""

echo "==================================="
echo "Installation Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "  ./service/start.sh    - Start the services"
echo "  ./service/status.sh   - Check service status"
echo "  ./service/logs.sh     - View logs"
echo ""
