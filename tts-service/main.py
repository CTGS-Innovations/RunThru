"""
RunThru TTS Service
FastAPI application for text-to-speech synthesis
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv

from adapters.base import TTSRequest
from adapters.index_tts_adapter import IndexTTSAdapter

load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RunThru TTS Service",
    description="Text-to-speech synthesis for theatrical rehearsals",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize TTS adapters
MODEL_DIR = os.getenv('MODEL_DIR', './index-tts')
DEVICE = "cuda:0" if os.getenv('CUDA_VISIBLE_DEVICES') else "cpu"

adapters = {}

try:
    logger.info(f"Initializing Index TTS adapter (device: {DEVICE})...")
    adapters["index-tts"] = IndexTTSAdapter(MODEL_DIR, DEVICE)
    logger.info("Index TTS adapter initialized")
except Exception as e:
    logger.error(f"Failed to initialize Index TTS: {e}")


@app.on_event("startup")
async def startup_event():
    """Warm up models on startup"""
    logger.info("Warming up TTS models...")
    for name, adapter in adapters.items():
        try:
            logger.info(f"Warming up {name}...")
            adapter.warmup()
            logger.info(f"{name} ready!")
        except Exception as e:
            logger.error(f"Failed to warm up {name}: {e}")
    logger.info("All models ready!")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "RunThru TTS Service",
        "version": "1.0.0",
        "engines": list(adapters.keys()),
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with GPU status"""
    import torch

    return {
        "status": "healthy",
        "timestamp": "2025-10-23",
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "gpu_memory_allocated_gb": round(torch.cuda.memory_allocated(0) / 1e9, 2) if torch.cuda.is_available() else 0,
        "engines": list(adapters.keys()),
    }


@app.post("/synthesize")
async def synthesize(request: TTSRequest):
    """
    Generate speech audio from text

    Returns: WAV audio file (audio/wav)
    """
    logger.info(f"Synthesis request: engine={request.engine}, voice={request.voice_id}")

    adapter = adapters.get(request.engine)
    if not adapter:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine: {request.engine}. Available: {list(adapters.keys())}"
        )

    try:
        audio_bytes = await adapter.synthesize(
            text=request.text,
            voice_id=request.voice_id,
            emotion=request.emotion
        )

        return Response(
            content=audio_bytes,
            media_type="audio/wav"
        )
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/voices")
async def list_voices(engine: str):
    """
    List available voices for a TTS engine

    Args:
        engine: TTS engine name (index-tts, chatterbox)

    Returns: List of voice info objects
    """
    adapter = adapters.get(engine)
    if not adapter:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine: {engine}"
        )

    return adapter.list_voices()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level=os.getenv('LOG_LEVEL', 'info').lower()
    )
