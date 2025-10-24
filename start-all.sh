#!/bin/bash
# RunThru - Master Control Script
# Start/stop all services from one command

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service paths
BACKEND_DIR="/home/corey/projects/RunThru-backend/backend"
TTS_DIR="/home/corey/projects/RunThru-backend/tts-service"
FRONTEND_DIR="/home/corey/projects/RunThru-frontend"

log_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Start all services
start_all() {
    log_header "Starting All RunThru Services"

    # Start TTS service first (backend depends on it)
    echo -e "${GREEN}[1/3]${NC} Starting TTS Service..."
    cd "$TTS_DIR"
    ./start.sh start &
    sleep 4  # Give TTS time to load models

    # Start backend
    echo -e "${GREEN}[2/3]${NC} Starting Backend API..."
    cd "$BACKEND_DIR"
    ./start.sh start &
    sleep 2

    # Start frontend
    echo -e "${GREEN}[3/3]${NC} Starting Frontend..."
    cd "$FRONTEND_DIR"
    ./start.sh start &
    sleep 2

    log_header "All Services Started"
    echo "Frontend:  http://localhost:3000"
    echo "Backend:   http://localhost:4000/api/health"
    echo "TTS:       http://localhost:5000/health"
    echo ""
    echo "Press Ctrl+C to stop all services, or run './start-all.sh stop'"

    # Wait for all background jobs
    wait
}

# Stop all services
stop_all() {
    log_header "Stopping All RunThru Services"

    echo -e "${YELLOW}[1/3]${NC} Stopping Frontend..."
    cd "$FRONTEND_DIR"
    ./start.sh stop

    echo -e "${YELLOW}[2/3]${NC} Stopping Backend..."
    cd "$BACKEND_DIR"
    ./start.sh stop

    echo -e "${YELLOW}[3/3]${NC} Stopping TTS Service..."
    cd "$TTS_DIR"
    ./start.sh stop

    log_header "All Services Stopped"
}

# Check status of all services
status_all() {
    log_header "RunThru Services Status"

    echo -e "${BLUE}TTS Service (port 5000):${NC}"
    cd "$TTS_DIR"
    ./start.sh status || true
    echo ""

    echo -e "${BLUE}Backend API (port 4000):${NC}"
    cd "$BACKEND_DIR"
    ./start.sh status || true
    echo ""

    echo -e "${BLUE}Frontend (port 3000):${NC}"
    cd "$FRONTEND_DIR"
    ./start.sh status || true
    echo ""
}

# Clean all lingering processes
clean_all() {
    log_header "Cleaning All Lingering Processes"

    echo -e "${YELLOW}Cleaning Frontend...${NC}"
    cd "$FRONTEND_DIR"
    ./start.sh clean

    echo -e "${YELLOW}Cleaning Backend...${NC}"
    cd "$BACKEND_DIR"
    ./start.sh clean

    echo -e "${YELLOW}Cleaning TTS Service...${NC}"
    cd "$TTS_DIR"
    ./start.sh clean

    log_header "Cleanup Complete"
}

# Build all services
build_all() {
    log_header "Building All RunThru Services"

    echo -e "${GREEN}[1/2]${NC} Building Backend..."
    cd "$BACKEND_DIR"
    ./start.sh build

    echo -e "${GREEN}[2/2]${NC} Building Frontend..."
    cd "$FRONTEND_DIR"
    ./start.sh build

    log_header "Build Complete"
}

# Main command router
case "${1:-start}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_all
        ;;
    status)
        status_all
        ;;
    clean)
        clean_all
        ;;
    build)
        build_all
        ;;
    *)
        echo "RunThru - Master Control Script"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|clean|build}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all services (TTS → Backend → Frontend)"
        echo "  stop     - Stop all services"
        echo "  restart  - Stop and start all services"
        echo "  status   - Check status of all services"
        echo "  clean    - Kill any lingering processes on all ports"
        echo "  build    - Build backend and frontend"
        echo ""
        echo "Individual service scripts:"
        echo "  Backend:  cd $BACKEND_DIR && ./start.sh"
        echo "  TTS:      cd $TTS_DIR && ./start.sh"
        echo "  Frontend: cd $FRONTEND_DIR && ./start.sh"
        exit 1
        ;;
esac
