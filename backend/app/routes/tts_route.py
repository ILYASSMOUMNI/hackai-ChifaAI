from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx

from app.schemas import TTSRequest
from app.config import settings

router = APIRouter()

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
DEFAULT_VOICE_ID = "9BWtsMINqrJLrRacOk9x"  # Aria — multilingual


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    # 1. Try local Coqui TTS (ar/cv/vits or xtts_v2)
    if settings.use_local_tts:
        try:
            from app.tts_service import tts_service
            audio_bytes = await tts_service.synthesize(req.text, req.language)
            return Response(content=audio_bytes, media_type="audio/wav")
        except Exception as e:
            print(f"[ShiffAi] Coqui TTS failed: {e} — trying ElevenLabs")

    # 2. Try ElevenLabs cloud TTS
    if settings.elevenlabs_api_key:
        voice_id = settings.elevenlabs_voice_id or DEFAULT_VOICE_ID
        url = ELEVENLABS_TTS_URL.format(voice_id=voice_id)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    url,
                    headers={
                        "xi-api-key": settings.elevenlabs_api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "text": req.text,
                        "model_id": "eleven_multilingual_v2",
                        "voice_settings": {
                            "stability": 0.45,
                            "similarity_boost": 0.80,
                            "style": 0.0,
                            "use_speaker_boost": True,
                        },
                    },
                )
            if resp.status_code == 200:
                return Response(content=resp.content, media_type="audio/mpeg")
            print(f"[ShiffAi] ElevenLabs TTS HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[ShiffAi] ElevenLabs TTS failed: {e}")

    # 3. Both failed — frontend will use browser SpeechSynthesis
    raise HTTPException(
        status_code=503,
        detail="TTS not available. Frontend will use browser SpeechSynthesis fallback.",
    )
