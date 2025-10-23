"""Pydantic schemas for TTS service"""

from pydantic import BaseModel, Field
from typing import List, Optional


class TTSGenerateRequest(BaseModel):
    """Request to generate speech"""
    text: str = Field(..., min_length=1, max_length=5000)
    voice_id: str
    engine: str = Field(default="index-tts")
    emotion_intensity: float = Field(default=0.5, ge=0.0, le=1.0)
    emotion_valence: str = Field(default="neutral")


class VoiceListResponse(BaseModel):
    """Response for voice listing"""
    voices: List[dict]
    engine: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    gpu_available: bool
    gpu_name: Optional[str]
    engines: List[str]
