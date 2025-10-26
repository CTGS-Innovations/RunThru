#!/bin/bash
# Quick terminal reset utility
# Run this if your terminal gets corrupted: source ./reset-terminal.sh

# Reset all terminal attributes
tput sgr0 2>/dev/null || printf '\033[0m'

# Reset terminal to sane state
stty sane 2>/dev/null

# Clear screen (optional)
# clear

echo "Terminal reset complete"
