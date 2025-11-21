# RunThru Service Management

This folder contains all scripts for managing RunThru as systemd services.

## Quick Start

```bash
# First time setup
./service/install.sh    # Build and install services

# Daily use
./service/start.sh      # Start services
./service/stop.sh       # Stop services
./service/restart.sh    # Restart services
./service/status.sh     # Check service status
./service/logs.sh       # Watch logs (both services)
```

## Scripts

### `install.sh`
**First-time installation**
- Builds backend (TypeScript compilation)
- Builds frontend (Next.js production bundle)
- Installs systemd service files to `/etc/systemd/system/`
- Enables services to start on boot

```bash
./service/install.sh
```

### `start.sh`
**Start the services**
```bash
./service/start.sh
```

Services will be available at:
- Backend API: http://localhost:14000
- Frontend: http://localhost:13000

### `stop.sh`
**Stop the services**
```bash
./service/stop.sh
```

### `restart.sh`
**Restart both services**
```bash
./service/restart.sh
```

Useful after configuration changes or when services are misbehaving.

### `status.sh`
**Check service status**
```bash
./service/status.sh
```

Shows:
- Service status (running/stopped)
- Memory usage
- Recent log entries
- Listening ports

### `logs.sh`
**View service logs**

```bash
# Watch both services (default)
./service/logs.sh

# Watch only backend
./service/logs.sh backend

# Watch only frontend
./service/logs.sh frontend

# Show more lines
./service/logs.sh both 100      # Last 100 lines
./service/logs.sh backend 200   # Last 200 lines of backend
```

Press `Ctrl+C` to exit log viewer.

### `rebuild.sh`
**Rebuild and restart after code changes**
```bash
./service/rebuild.sh
```

This script:
1. Stops services
2. Rebuilds backend (npm run build)
3. Rebuilds frontend (npm run build)
4. Restarts services

Use this after pulling code changes or modifying source files.

### `uninstall.sh`
**Remove services completely**
```bash
./service/uninstall.sh
```

This will:
1. Stop services
2. Disable auto-start on boot
3. Remove service files from systemd
4. Reload systemd daemon

Your code and data remain intact.

## Service Files

### `runthru-backend.service`
Systemd unit file for the backend API service.

**Configuration:**
- Port: 14000
- WorkingDirectory: `/home/corey/projects/RunThru/backend`
- Auto-restart on failure
- Logs to systemd journal

### `runthru-frontend.service`
Systemd unit file for the Next.js frontend service.

**Configuration:**
- Port: 13000
- WorkingDirectory: `/home/corey/projects/RunThru`
- Depends on backend service
- Auto-restart on failure
- Logs to systemd journal

## Manual systemd Commands

If you prefer using systemd directly:

```bash
# Start/stop/restart
sudo systemctl start runthru-backend
sudo systemctl stop runthru-frontend
sudo systemctl restart runthru-backend

# Status
sudo systemctl status runthru-backend
sudo systemctl status runthru-frontend

# Enable/disable auto-start on boot
sudo systemctl enable runthru-backend
sudo systemctl disable runthru-frontend

# View logs
sudo journalctl -u runthru-backend -f
sudo journalctl -u runthru-frontend -n 100
sudo journalctl -u runthru-backend -u runthru-frontend -f

# Reload systemd after editing service files
sudo systemctl daemon-reload
```

## Troubleshooting

### Services won't start
```bash
# Check status for error messages
./service/status.sh

# View detailed logs
./service/logs.sh

# Common issues:
# - Port already in use (check with: sudo ss -tlnp | grep -E ':(13000|14000)')
# - Missing dependencies (run: npm install in backend/ and root/)
# - Build errors (run: ./service/rebuild.sh)
```

### Services keep restarting
```bash
# Watch logs to see the error
./service/logs.sh

# Check if ports are already in use
sudo ss -tlnp | grep -E ':(13000|14000)'

# Try manual start to see errors
cd /home/corey/projects/RunThru/backend
npm start
```

### Need to change ports or configuration
Edit the service files in this folder, then:
```bash
./service/uninstall.sh
./service/install.sh
```

## Development vs Production

**Development mode** (manual start, hot reload):
```bash
# Backend
cd /home/corey/projects/RunThru/backend
npm run dev

# Frontend
cd /home/corey/projects/RunThru
npm run dev
```

**Production mode** (systemd services, this folder):
```bash
./service/start.sh
```

Don't run both at the same time (port conflicts).

## Architecture Notes

- **Backend**: Node.js Express API + SQLite database
- **Frontend**: Next.js 15 with React 18
- **TTS Service**: Not included (run separately with Python)
- **Git Worktrees**: Main integration branch lives here

For full architecture details, see `/docs/ARCHITECTURE.md`.
