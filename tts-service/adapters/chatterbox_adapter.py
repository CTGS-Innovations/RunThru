"""
Chatterbox TTS Adapter
Uses Chatterbox for fast, high-quality voice cloning
"""

import os
import io
import torch
import torchaudio
from typing import List
from .base import TTSAdapter, VoiceInfo, EmotionParams


class ChatterboxAdapter(TTSAdapter):
    """Adapter for Chatterbox TTS engine"""

    def __init__(self, model_dir: str, device: str):
        """
        Initialize Chatterbox TTS

        Args:
            model_dir: Not used for Chatterbox (uses HuggingFace models)
            device: 'cuda:0' or 'cpu'
        """
        self.device = device
        self.model = None
        self.sr = 24000  # Chatterbox sample rate

        # Load model lazily (on first synthesis call)
        self._load_model()

    def _load_model(self):
        """Load Chatterbox model from pretrained weights"""
        if self.model is not None:
            return

        try:
            from chatterbox import ChatterboxTTS
            self.model = ChatterboxTTS.from_pretrained(device=self.device)
            self.sr = self.model.sr
        except ImportError:
            raise RuntimeError(
                "Chatterbox not installed. Install with: pip install chatterbox-tts"
            )

    async def synthesize(
        self,
        text: str,
        voice_id: str,
        emotion: EmotionParams
    ) -> bytes:
        """
        Generate audio using Chatterbox TTS

        Args:
            text: Text to synthesize
            voice_id: Path to reference audio file (voice prompt)
            emotion: Emotion parameters (intensity maps to exaggeration)

        Returns:
            WAV audio bytes
        """
        self._load_model()

        # Map emotion parameters to Chatterbox params
        # emotion.intensity (0.0-1.0) → exaggeration parameter
        exaggeration = emotion.intensity

        # Generate audio
        try:
            # Check if voice_id is a file path (reference audio)
            if os.path.exists(voice_id):
                # Voice cloning mode with reference audio
                wav = self.model.generate(
                    text,
                    audio_prompt_path=voice_id,
                    exaggeration=exaggeration,
                    cfg_weight=0.5  # Style control (0.0-1.0)
                )
            else:
                # Default voice mode (no reference audio)
                wav = self.model.generate(
                    text,
                    exaggeration=exaggeration
                )

            # Convert tensor to WAV bytes
            return self._tensor_to_wav(wav)

        except Exception as e:
            raise RuntimeError(f"Chatterbox synthesis failed: {e}")

    def _tensor_to_wav(self, audio_tensor: torch.Tensor) -> bytes:
        """
        Convert PyTorch audio tensor to WAV bytes

        Args:
            audio_tensor: Audio tensor (C, T) or (T,)

        Returns:
            WAV file bytes
        """
        # Ensure tensor is 2D (C, T)
        if audio_tensor.dim() == 1:
            audio_tensor = audio_tensor.unsqueeze(0)

        # Move to CPU if needed
        if audio_tensor.device.type == 'cuda':
            audio_tensor = audio_tensor.cpu()

        # Save to bytes buffer
        buffer = io.BytesIO()
        torchaudio.save(
            buffer,
            audio_tensor,
            self.sr,
            format="wav"
        )

        return buffer.getvalue()

    def list_voices(self) -> List[VoiceInfo]:
        """
        List available voice references

        Returns:
            List of VoiceInfo objects (reference audio files)
        """
        # Return reference voices from tts-service/reference-voices/
        reference_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "reference-voices"
        )

        voices = []
        if os.path.exists(reference_dir):
            for filename in os.listdir(reference_dir):
                if filename.endswith('.wav'):
                    voice_id = filename.replace('.wav', '')
                    voices.append(VoiceInfo(
                        id=os.path.join(reference_dir, filename),
                        name=voice_id.replace('-', ' ').title(),
                        gender='N',  # Neutral (determined by reference audio)
                        age_range='varies',
                        preview_url=None
                    ))

        return voices

    def warmup(self) -> None:
        """
        Warm up the model by running a test inference
        """
        self._load_model()

        # Generate short test audio
        try:
            wav = self.model.generate("Hello", exaggeration=0.5)
            # Discard output (just warming up GPU)
        except Exception as e:
            print(f"Chatterbox warmup warning: {e}")
