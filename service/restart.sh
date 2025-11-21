#!/bin/bash
# Restart RunThru services

echo "Restarting RunThru services..."
sudo systemctl restart runthru-backend.service
sudo systemctl restart runthru-frontend.service

echo ""
echo "✓ Services restarted"
echo ""
echo "Check status with: ./service/status.sh"
echo "View logs with:    ./service/logs.sh"
