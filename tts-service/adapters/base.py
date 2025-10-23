"""
Base adapter interface for TTS engines
"""

from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel


class VoiceInfo(BaseModel):
    """Information about an available voice"""
    id: str
    name: str
    gender: str  # 'M', 'F', 'N' (neutral)
    age_range: str = "adult"
    preview_url: str | None = None


class EmotionParams(BaseModel):
    """Emotion parameters for TTS"""
    intensity: float  # 0.0-1.0
    valence: str      # 'positive', 'negative', 'neutral'


class TTSRequest(BaseModel):
    """Request for TTS synthesis"""
    text: str
    character: str
    engine: str
    voice_id: str
    emotion: EmotionParams


class TTSAdapter(ABC):
    """Abstract base class for TTS engine adapters"""

    @abstractmethod
    def __init__(self, model_dir: str, device: str):
        """Initialize the TTS adapter"""
        pass

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        voice_id: str,
        emotion: EmotionParams
    ) -> bytes:
        """
        Generate audio bytes (WAV format) from text

        Args:
            text: The text to synthesize
            voice_id: ID of the voice to use
            emotion: Emotion parameters

        Returns:
            Audio data as bytes (WAV format)
        """
        pass

    @abstractmethod
    def list_voices(self) -> List[VoiceInfo]:
        """
        Return list of available voices

        Returns:
            List of VoiceInfo objects
        """
        pass

    @abstractmethod
    def warmup(self) -> None:
        """
        Warm up the model by running a test inference
        Loads model weights into GPU memory
        """
        pass
