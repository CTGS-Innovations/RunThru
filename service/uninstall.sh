#!/bin/bash
# Uninstall RunThru systemd services

echo "==================================="
echo "RunThru Service Uninstallation"
echo "==================================="
echo ""

echo "Step 1: Stopping services..."
sudo systemctl stop runthru-backend.service 2>/dev/null || true
sudo systemctl stop runthru-frontend.service 2>/dev/null || true
echo "✓ Services stopped"
echo ""

echo "Step 2: Disabling services..."
sudo systemctl disable runthru-backend.service 2>/dev/null || true
sudo systemctl disable runthru-frontend.service 2>/dev/null || true
echo "✓ Services disabled"
echo ""

echo "Step 3: Removing service files..."
sudo rm -f /etc/systemd/system/runthru-backend.service
sudo rm -f /etc/systemd/system/runthru-frontend.service
sudo systemctl daemon-reload
echo "✓ Service files removed"
echo ""

echo "==================================="
echo "Uninstallation Complete!"
echo "==================================="
echo ""
echo "To reinstall, run: ./service/install.sh"
echo ""
