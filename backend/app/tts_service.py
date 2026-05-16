import asyncio
import os
import tempfile
from .config import settings


class TTSService:
    def __init__(self):
        self._tts = None
        self._model_name = None

    def _load_model(self):
        from TTS.api import TTS  # coqui-tts

        # Try XTTS-v2 first (multilingual, supports Arabic natively)
        try:
            tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", progress_bar=False, gpu=False)
            self._model_name = "xtts_v2"
            print("[ShiffAi] Coqui XTTS-v2 loaded.")
            return tts
        except Exception as e:
            print(f"[ShiffAi] XTTS-v2 unavailable ({e}), trying Arabic VITS...")

        # Fallback: Arabic single-speaker VITS — no speaker WAV needed
        try:
            tts = TTS("tts_models/ar/cv/vits", progress_bar=False, gpu=False)
            self._model_name = "ar_vits"
            print("[ShiffAi] Coqui Arabic VITS loaded.")
            return tts
        except Exception as e:
            print(f"[ShiffAi] Arabic VITS unavailable: {e}")
            raise RuntimeError("No Coqui TTS model could be loaded") from e

    def _get_tts(self):
        if self._tts is None:
            self._tts = self._load_model()
        return self._tts

    def _synth(self, tts, text: str, lang_code: str) -> bytes:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            if self._model_name == "xtts_v2":
                speaker_wav = settings.tts_speaker_wav or None
                if speaker_wav and os.path.exists(speaker_wav):
                    tts.tts_to_file(
                        text=text,
                        language=lang_code,
                        speaker_wav=speaker_wav,
                        file_path=tmp_path,
                    )
                else:
                    # XTTS-v2 without speaker WAV — use built-in speaker
                    speakers = tts.speakers or []
                    speaker = speakers[0] if speakers else None
                    tts.tts_to_file(
                        text=text,
                        language=lang_code,
                        speaker=speaker,
                        file_path=tmp_path,
                    )
            else:
                # Arabic VITS — single speaker, no extra params needed
                tts.tts_to_file(text=text, file_path=tmp_path)

            with open(tmp_path, "rb") as f:
                return f.read()
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    async def synthesize(self, text: str, language: str = "darija") -> bytes:
        # Map language codes to Coqui lang codes
        lang_code = {
            "darija": "ar",
            "dr": "ar",
            "ar": "ar",
            "fr": "fr-fr",
        }.get(language, "ar")

        tts = await asyncio.to_thread(self._get_tts)
        return await asyncio.to_thread(self._synth, tts, text, lang_code)


tts_service = TTSService()
