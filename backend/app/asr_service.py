import io
import os
import asyncio
import tempfile
from .config import settings


class ASRService:
    def __init__(self):
        self._pipe = None

    def _load_local_model(self):
        from transformers import pipeline
        import torch

        model_id = settings.local_asr_model  # KandirResearch/Whisper-Small-Darija
        device = "cuda" if torch.cuda.is_available() else "cpu"
        kwargs = {"torch_dtype": torch.float16} if device == "cuda" else {}

        pipe = pipeline(
            "automatic-speech-recognition",
            model=model_id,
            device=device,
            token=settings.hf_token or None,
            **kwargs,
        )
        print(f"[ShiffAi] Local ASR model '{model_id}' loaded on {device}.")
        return pipe

    def _get_pipe(self):
        if self._pipe is None:
            self._pipe = self._load_local_model()
        return self._pipe

    def _decode_audio(self, audio_bytes: bytes, filename: str) -> tuple:
        """Convert raw audio bytes → (numpy float32 array, sample_rate=16000)"""
        import numpy as np

        # Save to a temp file so librosa/ffmpeg can decode any format (webm, mp4, wav, ogg…)
        suffix = os.path.splitext(filename)[-1] or ".webm"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        try:
            import librosa
            audio, _ = librosa.load(tmp_path, sr=16000, mono=True)
            return audio
        finally:
            os.unlink(tmp_path)

    def _transcribe_local(self, audio_bytes: bytes, filename: str) -> str:
        audio = self._decode_audio(audio_bytes, filename)
        pipe = self._get_pipe()
        result = pipe(
            {"array": audio, "sampling_rate": 16000},
            generate_kwargs={"language": "arabic", "task": "transcribe"},
            return_timestamps=False,
        )
        return result["text"].strip()

    async def _transcribe_groq(self, audio_bytes: bytes, filename: str, language: str) -> str:
        from groq import Groq
        client = Groq(api_key=settings.groq_api_key)
        lang = language if language in ("ar", "fr", "en") else "ar"

        def _call():
            return client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=(filename, io.BytesIO(audio_bytes), "audio/webm"),
                language=lang,
                response_format="text",
            )

        result = await asyncio.to_thread(_call)
        return result if isinstance(result, str) else str(result)

    async def transcribe(self, audio_bytes: bytes, filename: str = "recording.webm", language: str = "ar") -> str:
        # 1. Local HuggingFace Darija Whisper
        if settings.use_local_asr:
            try:
                text = await asyncio.to_thread(self._transcribe_local, audio_bytes, filename)
                if text:
                    return text
            except Exception as e:
                print(f"[ShiffAi] Local ASR failed ({e}), falling back to Groq Whisper")

        # 2. Groq Whisper API (cloud fallback)
        if settings.groq_api_key:
            return await self._transcribe_groq(audio_bytes, filename, language)

        raise RuntimeError("No ASR configured: local model failed and no GROQ_API_KEY set")


asr_service = ASRService()
