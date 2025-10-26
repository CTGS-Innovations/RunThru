#!/bin/sh
set -e

# Fix permissions for mounted volumes (runs as root, then switches to apiuser)
echo "Fixing /data permissions for container user..."
chown -R apiuser:nodejs /data 2>/dev/null || true

# Switch to apiuser and run the application
echo "Starting RunThru Backend as apiuser..."
exec su-exec apiuser "$@"
