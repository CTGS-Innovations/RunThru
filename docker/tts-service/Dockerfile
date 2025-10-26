# ==================================
# RunThru TTS Service Dockerfile
# Python 3.11 + FastAPI + PyTorch + CUDA
# ==================================

# Use NVIDIA CUDA base image for GPU support
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV CUDA_HOME=/usr/local/cuda
ENV PATH=$CUDA_HOME/bin:$PATH
ENV LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH

# Install system dependencies (using Python 3.10 for pkuseg compatibility)
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y \
    python3.10 \
    python3.10-dev \
    python3.10-venv \
    python3-pip \
    git \
    wget \
    curl \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links for python
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.10 1 && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1

WORKDIR /app

# Upgrade pip
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY requirements.txt .

# Install PyTorch with CUDA support
RUN pip install --no-cache-dir \
    torch==2.1.0 \
    torchaudio==2.1.0 \
    --index-url https://download.pytorch.org/whl/cu121

# Install other Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Optional: Install Chatterbox TTS (skip for now due to pkuseg Python 3.10 compatibility issues)
# TODO: Re-enable when pkuseg is fixed or find alternative
# RUN pip install --no-cache-dir chatterbox-tts

# Note: Chatterbox adapter will fail to initialize but Index TTS will work

# Copy application code
COPY . .

# Create directories for models and cache
RUN mkdir -p /models /cache

# Create non-root user for security
RUN groupadd --gid 1001 ttsuser && \
    useradd --uid 1001 --gid 1001 --shell /bin/bash --create-home ttsuser

# Set ownership
RUN chown -R ttsuser:ttsuser /app /models /cache

# Switch to non-root user
USER ttsuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["python", "main.py"]
