#!/bin/bash
# RunThru Frontend - Startup Script
# Handles process cleanup and safe startup

set -e

PORT=3000
SERVICE_NAME="RunThru Frontend"
PID_FILE="/tmp/runthru-frontend.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[Frontend]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[Frontend]${NC} $1"
}

log_error() {
    echo -e "${RED}[Frontend]${NC} $1"
}

# Kill any process using the port
kill_port() {
    local port=$1
    log_info "Checking for processes on port $port..."

    # Find PID using the port
    local pids=$(lsof -ti:$port 2>/dev/null || true)

    if [ -n "$pids" ]; then
        log_warn "Found process(es) using port $port: $pids"
        for pid in $pids; do
            local cmd=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            log_warn "  PID $pid: $cmd"
            kill -9 $pid 2>/dev/null || true
            log_info "  Killed PID $pid"
        done
        sleep 1
    else
        log_info "Port $port is free"
    fi
}

# Kill processes from PID file
kill_pidfile() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log_warn "Killing previous instance (PID: $pid)"
            kill -9 $pid 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    kill_pidfile
    kill_port $PORT
    # Kill any next dev processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    log_info "Cleanup complete"
}

# Start the service
start() {
    log_info "Starting $SERVICE_NAME on port $PORT..."

    # Cleanup first
    cleanup

    # Verify we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "Error: package.json not found. Are you in the frontend directory?"
        exit 1
    fi

    # Start the dev server
    npm run dev &
    local pid=$!
    echo $pid > "$PID_FILE"

    log_info "$SERVICE_NAME started (PID: $pid)"
    log_info "Open: http://localhost:$PORT"

    # Wait for server to start
    sleep 2
    if ! ps -p $pid > /dev/null 2>&1; then
        log_error "Failed to start server (process died immediately)"
        rm -f "$PID_FILE"
        exit 1
    fi

    log_info "Server is running. Press Ctrl+C to stop, or run './start.sh stop'"

    # Wait for the process
    wait $pid
}

# Stop the service
stop() {
    log_info "Stopping $SERVICE_NAME..."
    cleanup
    log_info "$SERVICE_NAME stopped"
}

# Show status
status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            log_info "$SERVICE_NAME is running (PID: $pid)"
            log_info "Port $PORT: $(lsof -ti:$PORT 2>/dev/null || echo 'not in use')"
            return 0
        else
            log_warn "$SERVICE_NAME PID file exists but process is not running"
            rm -f "$PID_FILE"
        fi
    fi

    local pids=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$pids" ]; then
        log_warn "Port $PORT is in use by: $pids"
        return 1
    else
        log_info "$SERVICE_NAME is not running"
        return 1
    fi
}

# Build the project
build() {
    log_info "Building $SERVICE_NAME..."
    npm run build
    log_info "Build complete"
}

# Main command router
case "${1:-start}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 1
        start
        ;;
    status)
        status
        ;;
    clean)
        cleanup
        ;;
    build)
        build
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|clean|build}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the frontend server (cleans up first)"
        echo "  stop     - Stop the frontend server"
        echo "  restart  - Stop and start the frontend server"
        echo "  status   - Check if the frontend is running"
        echo "  clean    - Kill any lingering processes"
        echo "  build    - Build the Next.js project"
        exit 1
        ;;
esac
