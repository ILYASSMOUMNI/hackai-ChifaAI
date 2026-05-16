from fastapi import APIRouter
from ..config import settings
from ..schemas import StatusResponse

router = APIRouter()


@router.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(
        status="ok",
        ai_provider=settings.get_active_provider(),
        demo_mode=settings.demo_mode,
        version="1.0.0",
        app_name=settings.app_name,
    )
