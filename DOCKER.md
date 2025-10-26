# RunThru Docker Deployment Guide

Complete guide for deploying RunThru using Docker Compose with GPU support.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Building Images](#building-images)
5. [Running the Stack](#running-the-stack)
6. [Data Management](#data-management)
7. [GPU Setup](#gpu-setup)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher (comes with Docker Desktop)
- **NVIDIA Docker Runtime**: Required for GPU support (TTS service)
- **NVIDIA GPU**: CUDA-compatible GPU with 8GB+ VRAM (tested on RTX 3090)

### System Requirements
- **CPU**: 4+ cores recommended
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 50GB+ for Docker images and models
- **OS**: Ubuntu 20.04+, Debian 11+, or other Linux with Docker support

---

## Quick Start

### 1. Clone and Navigate to Project
```bash
cd /home/corey/projects/RunThru
```

### 2. Create Environment File
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

**Minimum required changes:**
```env
PIN_CODE=your-secure-pin-here
```

### 3. Create Data Directories
```bash
mkdir -p data/database data/scripts data/audio-cache data/logs data/models
```

### 4. Build and Start Services
```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 5. Verify Deployment
```bash
# Check service health
docker-compose ps

# Test frontend
curl http://localhost:3000

# Test backend API
curl http://localhost:4000/health

# Test TTS service (with GPU info)
curl http://localhost:5000/health
```

---

## Configuration

### Environment Variables

Edit `.env` file with your configuration. Key variables:

#### Authentication
```env
PIN_CODE=1234  # Change this to a secure PIN
```

#### Ports
```env
FRONTEND_PORT=3000   # Frontend web interface
BACKEND_PORT=4000    # Backend API
TTS_PORT=5000        # TTS service
```

#### API URLs
```env
# For local deployment:
NEXT_PUBLIC_API_URL=http://localhost:4000

# For production with domain:
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

#### TTS Service
```env
CUDA_VISIBLE_DEVICES=0  # Use first GPU (0), or -1 for CPU
MODEL_DIR=/models        # Model storage inside container
```

---

## Building Images

### Build All Services
```bash
docker-compose build
```

### Build Individual Services
```bash
# Frontend only
docker-compose build frontend

# Backend only
docker-compose build backend

# TTS service only
docker-compose build tts-service
```

### Rebuild Without Cache
```bash
docker-compose build --no-cache
```

### Build with Progress Output
```bash
DOCKER_BUILDKIT=1 docker-compose build --progress=plain
```

---

## Running the Stack

### Start All Services
```bash
# Start in background (detached mode)
docker-compose up -d

# Start with logs visible
docker-compose up
```

### Start Individual Services
```bash
# Start only backend and its dependencies
docker-compose up -d backend

# Start only TTS service
docker-compose up -d tts-service
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data!)
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart individual service
docker-compose restart backend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 tts-service
```

---

## Data Management

### Directory Structure
```
RunThru/
├── data/
│   ├── database/          # SQLite database
│   │   └── runthru.db
│   ├── scripts/           # Uploaded script files
│   ├── audio-cache/       # Generated TTS audio
│   ├── logs/              # Application logs
│   └── models/            # TTS model weights
```

### Backup Data
```bash
# Backup database
cp data/database/runthru.db data/database/runthru.db.backup

# Backup all data
tar -czf runthru-backup-$(date +%Y%m%d).tar.gz data/

# Backup using Docker volumes
docker run --rm -v runthru-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

### Restore Data
```bash
# Restore database
cp data/database/runthru.db.backup data/database/runthru.db

# Restore from tar
tar -xzf runthru-backup-20231023.tar.gz

# Restore Docker volume
docker run --rm -v runthru-data:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/data-backup.tar.gz --strip 1"
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove all data (WARNING: irreversible!)
docker-compose down -v
rm -rf data/*

# Remove unused images
docker image prune -a

# Full cleanup (images, containers, volumes, networks)
docker system prune -a --volumes
```

---

## GPU Setup

### Install NVIDIA Docker Runtime

#### Ubuntu/Debian
```bash
# Add NVIDIA package repositories
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install nvidia-docker2
sudo apt-get update
sudo apt-get install -y nvidia-docker2

# Restart Docker
sudo systemctl restart docker
```

### Verify GPU Access
```bash
# Test GPU inside Docker
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi

# Check TTS service GPU access
docker-compose exec tts-service nvidia-smi

# Check CUDA availability
docker-compose exec tts-service python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
```

### GPU Troubleshooting

**Issue: "could not select device driver"**
```bash
# Solution: Install nvidia-container-toolkit
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

**Issue: "CUDA out of memory"**
```bash
# Solution 1: Reduce batch size or use FP16 (already enabled)
# Solution 2: Use smaller model
# Solution 3: Restart TTS service to clear GPU memory
docker-compose restart tts-service
```

---

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Inspect container
docker inspect runthru-backend
```

#### Cannot Connect to Service
```bash
# Check if service is running
docker-compose ps

# Check network connectivity
docker-compose exec backend ping tts-service

# Check port bindings
docker-compose port backend 4000
```

#### Database Locked
```bash
# Stop all services
docker-compose down

# Check for stale locks
rm -f data/database/runthru.db-shm data/database/runthru.db-wal

# Restart
docker-compose up -d
```

#### Permission Denied
```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/

# Fix for SELinux systems
sudo chcon -Rt svirt_sandbox_file_t data/
```

### Health Checks

All services include health checks. View status:
```bash
# Check health status
docker-compose ps

# View detailed health
docker inspect runthru-backend | jq '.[0].State.Health'
```

### Performance Issues

#### Slow Build Times
```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Use build cache
docker-compose build --parallel
```

#### High Memory Usage
```bash
# Limit container memory
# Add to docker-compose.yml under service:
deploy:
  resources:
    limits:
      memory: 4G
```

---

## Production Deployment

### Security Hardening

#### 1. Change Default PIN
```env
PIN_CODE=use-strong-random-pin-here
```

#### 2. Use Secrets for Sensitive Data
```yaml
# docker-compose.yml
services:
  backend:
    secrets:
      - pin_code
secrets:
  pin_code:
    file: ./secrets/pin_code.txt
```

#### 3. Restrict Network Access
```yaml
# Only expose frontend
services:
  frontend:
    ports:
      - "3000:3000"
  backend:
    # Remove ports, use only internal network
  tts-service:
    # Remove ports, use only internal network
```

### Cloudflare Tunnel Setup

#### 1. Create Tunnel
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create runthru
```

#### 2. Configure DNS
```bash
# Point domain to tunnel
cloudflared tunnel route dns runthru runthru.yourdomain.com
```

#### 3. Update Environment
```env
CF_TUNNEL_TOKEN=your-tunnel-token-from-cloudflare
```

#### 4. Enable in Docker Compose
```yaml
# Uncomment cloudflared service in docker-compose.yml
```

### Monitoring

#### View Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Specific service stats
docker stats runthru-backend
```

#### Log Rotation
```bash
# Add to docker-compose.yml for each service:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Updates

#### Update Application Code
```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d
```

#### Update Base Images
```bash
# Pull latest base images
docker-compose pull

# Rebuild with --pull
docker-compose build --pull

# Restart services
docker-compose up -d
```

---

## Quick Reference

### Common Commands
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Execute command in container
docker-compose exec backend sh

# Scale service (if stateless)
docker-compose up -d --scale backend=3

# Update and restart
docker-compose up -d --build
```

### Port Reference
- **3000**: Frontend (Next.js web interface)
- **4000**: Backend API (Express server)
- **5000**: TTS Service (FastAPI)

### Data Persistence
- **Database**: `./data/database/runthru.db`
- **Scripts**: `./data/scripts/`
- **Audio Cache**: `./data/audio-cache/`
- **Models**: `./data/models/`
- **Logs**: `./data/logs/`

---

## Support

For issues, questions, or contributions:
- Check logs: `docker-compose logs -f`
- Review health: `docker-compose ps`
- Consult docs: `docs/ARCHITECTURE.md`
- File issues on GitHub

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
