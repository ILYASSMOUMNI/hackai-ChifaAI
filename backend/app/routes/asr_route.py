from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.asr_service import asr_service
from app.schemas import ASRResponse

router = APIRouter()


@router.post("/transcribe", response_model=ASRResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("ar"),
):
    audio_bytes = await audio.read()
    if len(audio_bytes) < 500:
        raise HTTPException(status_code=400, detail="Audio too short or empty")

    filename = audio.filename or "recording.webm"
    try:
        text = await asr_service.transcribe(audio_bytes, filename, language)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return ASRResponse(text=text.strip(), language=language)
