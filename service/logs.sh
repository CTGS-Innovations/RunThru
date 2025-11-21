#!/bin/bash
# View RunThru service logs

SERVICE="${1:-both}"
LINES="${2:-50}"

case "$SERVICE" in
    backend)
        echo "Showing last $LINES lines of backend logs..."
        echo "Press Ctrl+C to exit"
        echo ""
        sudo journalctl -u runthru-backend -n "$LINES" -f
        ;;
    frontend)
        echo "Showing last $LINES lines of frontend logs..."
        echo "Press Ctrl+C to exit"
        echo ""
        sudo journalctl -u runthru-frontend -n "$LINES" -f
        ;;
    both)
        echo "Showing last $LINES lines of both services..."
        echo "Press Ctrl+C to exit"
        echo ""
        sudo journalctl -u runthru-backend -u runthru-frontend -n "$LINES" -f
        ;;
    *)
        echo "Usage: ./service/logs.sh [backend|frontend|both] [lines]"
        echo ""
        echo "Examples:"
        echo "  ./service/logs.sh              - Watch both services (last 50 lines)"
        echo "  ./service/logs.sh backend      - Watch backend only"
        echo "  ./service/logs.sh frontend 100 - Watch frontend, last 100 lines"
        exit 1
        ;;
esac
