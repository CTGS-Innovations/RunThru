#!/bin/bash
# Start RunThru services

echo "Starting RunThru services..."
sudo systemctl start runthru-backend.service
sudo systemctl start runthru-frontend.service

echo ""
echo "✓ Services started"
echo ""
echo "Backend API: http://localhost:14000"
echo "Frontend:    http://localhost:13000"
echo ""
echo "Check status with: ./service/status.sh"
echo "View logs with:    ./service/logs.sh"
