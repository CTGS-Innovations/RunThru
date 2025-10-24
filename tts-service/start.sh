#!/bin/bash
# RunThru TTS Service - Startup Script
# Handles process cleanup and safe startup

set -e

PORT=5000
SERVICE_NAME="RunThru TTS Service"
PID_FILE="/tmp/runthru-tts.pid"
VENV_PATH="./venv"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[TTS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[TTS]${NC} $1"
}

log_error() {
    echo -e "${RED}[TTS]${NC} $1"
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
    # Kill any python/uvicorn processes for this service
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    log_info "Cleanup complete"
}

# Check venv exists
check_venv() {
    if [ ! -d "$VENV_PATH" ]; then
        log_error "Virtual environment not found at $VENV_PATH"
        log_error "Please run: python3.11 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
        exit 1
    fi
}

# Start the service
start() {
    log_info "Starting $SERVICE_NAME on port $PORT..."

    # Cleanup first
    cleanup

    # Verify we're in the right directory
    if [ ! -f "main.py" ]; then
        log_error "Error: main.py not found. Are you in the tts-service directory?"
        exit 1
    fi

    # Check venv
    check_venv

    # Activate venv and start
    source "$VENV_PATH/bin/activate"

    # Check GPU availability
    if python -c "import torch; exit(0 if torch.cuda.is_available() else 1)" 2>/dev/null; then
        log_info "GPU detected: $(python -c 'import torch; print(torch.cuda.get_device_name(0))')"
    else
        log_warn "No GPU detected - will use CPU (slow!)"
    fi

    # Start the service
    python main.py &
    local pid=$!
    echo $pid > "$PID_FILE"

    log_info "$SERVICE_NAME started (PID: $pid)"
    log_info "Health check: http://localhost:$PORT/health"

    # Wait for server to start
    sleep 3
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
    *)
        echo "Usage: $0 {start|stop|restart|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the TTS service (cleans up first)"
        echo "  stop     - Stop the TTS service"
        echo "  restart  - Stop and start the TTS service"
        echo "  status   - Check if the TTS service is running"
        echo "  clean    - Kill any lingering processes"
        exit 1
        ;;
esac
