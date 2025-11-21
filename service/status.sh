#!/bin/bash
# Check status of RunThru services

echo "==================================="
echo "RunThru Service Status"
echo "==================================="
echo ""

echo "--- Backend Service ---"
sudo systemctl status runthru-backend.service --no-pager -l
echo ""

echo "--- Frontend Service ---"
sudo systemctl status runthru-frontend.service --no-pager -l
echo ""

echo "--- Listening Ports ---"
sudo ss -tlnp | grep -E ':(13000|14000)' || echo "No services listening on ports 13000/14000"
echo ""
