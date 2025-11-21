# RunThru Production Services

This document describes how to run RunThru as systemd services for production deployment with Cloudflare Tunnel.

## Overview

RunThru runs as two systemd services on non-standard ports:
- **Backend API**: Port 14000 (instead of development port 4000)
- **Frontend**: Port 13000 (instead of development port 3000)

This allows:
- Production services to run independently from development
- Cloudflare Tunnel to expose services publicly
- Automatic restart on failure
- Start on system boot

## Quick Start

```bash
# From /home/corey/projects/RunThru
./setup-services.sh
```

This script will:
1. Build the backend (TypeScript compilation)
2. Build the frontend (Next.js production build)
3. Install systemd service files
4. Enable services (start on boot)
5. Start both services
6. Show status and listening ports

## Manual Setup

If you prefer to set up manually:

### 1. Build Backend
```bash
cd /home/corey/projects/RunThru/backend
npm install
npm run build
```

### 2. Build Frontend
```bash
cd /home/corey/projects/RunThru
npm install
npm run build
```

### 3. Install Services
```bash
sudo cp runthru-backend.service /etc/systemd/system/
sudo cp runthru-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### 4. Enable and Start
```bash
sudo systemctl enable runthru-backend.service
sudo systemctl enable runthru-frontend.service
sudo systemctl start runthru-backend.service
sudo systemctl start runthru-frontend.service
```

## Service Management

### Check Status
```bash
sudo systemctl status runthru-backend
sudo systemctl status runthru-frontend
```

### Start Services
```bash
sudo systemctl start runthru-backend
sudo systemctl start runthru-frontend
```

### Stop Services
```bash
sudo systemctl stop runthru-backend
sudo systemctl stop runthru-frontend
```

### Restart Services
```bash
sudo systemctl restart runthru-backend
sudo systemctl restart runthru-frontend
```

### View Logs (Real-time)
```bash
# Backend logs
sudo journalctl -u runthru-backend -f

# Frontend logs
sudo journalctl -u runthru-frontend -f

# Both services
sudo journalctl -u runthru-backend -u runthru-frontend -f
```

### View Recent Logs
```bash
# Last 100 lines
sudo journalctl -u runthru-backend -n 100
sudo journalctl -u runthru-frontend -n 100
```

### Disable Services (won't start on boot)
```bash
sudo systemctl disable runthru-backend
sudo systemctl disable runthru-frontend
```

## Configuration

### Environment Variables
Production configuration is in `.env.production`:
- Frontend port: 13000
- Backend port: 14000
- Backend URL: http://localhost:14000

### Updating Configuration
1. Edit `.env.production`
2. Restart the affected service:
   ```bash
   sudo systemctl restart runthru-backend
   # or
   sudo systemctl restart runthru-frontend
   ```

## Cloudflare Tunnel Setup

Once services are running, configure Cloudflare Tunnel to point to:
- Frontend: `http://localhost:13000`
- Backend API: `http://localhost:14000` (if needed for direct API access)

Typically you'll only expose the frontend, and it will proxy API requests to the backend internally.

### Cloudflare Tunnel Configuration Example
```yaml
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: runthru.yourdomain.com
    service: http://localhost:13000
  - service: http_status:404
```

## Deployment Workflow

### Deploying Updates

When you make changes to the code:

```bash
# 1. Pull latest changes (if using git)
cd /home/corey/projects/RunThru
git pull

# 2. Rebuild backend (if backend changed)
cd backend
npm install  # if dependencies changed
npm run build
sudo systemctl restart runthru-backend

# 3. Rebuild frontend (if frontend changed)
cd /home/corey/projects/RunThru
npm install  # if dependencies changed
npm run build
sudo systemctl restart runthru-frontend

# 4. Check logs for errors
sudo journalctl -u runthru-backend -u runthru-frontend -n 50
```

### Quick Deployment Script
```bash
#!/bin/bash
# deploy.sh - Quick deployment script

cd /home/corey/projects/RunThru

# Backend
cd backend
npm run build
sudo systemctl restart runthru-backend

# Frontend
cd ..
npm run build
sudo systemctl restart runthru-frontend

# Status
sudo systemctl status runthru-backend --no-pager
sudo systemctl status runthru-frontend --no-pager
```

## Troubleshooting

### Service won't start
```bash
# Check service status
sudo systemctl status runthru-backend
sudo systemctl status runthru-frontend

# Check logs for errors
sudo journalctl -u runthru-backend -n 50
sudo journalctl -u runthru-frontend -n 50
```

### Port already in use
```bash
# Find what's using the port
sudo ss -tlnp | grep 13000
sudo ss -tlnp | grep 14000

# Kill the process if needed
sudo kill <PID>
```

### Database permissions
Make sure the database file is accessible:
```bash
ls -l /home/corey/projects/RunThru/backend/database/runthru.db
```

### Frontend can't reach backend
Check that:
1. Backend is running: `sudo systemctl status runthru-backend`
2. Backend port is correct in `.env.production`: `BACKEND_URL=http://localhost:14000`
3. Frontend has been rebuilt: `npm run build`

## File Locations

- **Service files**: `/etc/systemd/system/runthru-*.service`
- **Environment config**: `/home/corey/projects/RunThru/.env.production`
- **Backend code**: `/home/corey/projects/RunThru/backend/`
- **Frontend code**: `/home/corey/projects/RunThru/`
- **Logs**: `journalctl -u runthru-*`

## Security Notes

- Services run as user `corey` (not root)
- `.env.production` contains sensitive keys - keep it secure
- Services have `NoNewPrivileges=true` and `PrivateTmp=true` for security
- Services auto-restart on failure with 10-second delay

## Development vs Production

This setup allows you to run:
- **Production**: Ports 13000/14000, systemd services, main branch
- **Development**: Ports 3000/4000, `npm run dev`, feature branches in worktrees

They won't conflict because they use different ports!
