#!/bin/bash
# Stop RunThru services

echo "Stopping RunThru services..."
sudo systemctl stop runthru-backend.service
sudo systemctl stop runthru-frontend.service

echo ""
echo "✓ Services stopped"
echo ""
echo "Start again with: ./service/start.sh"
