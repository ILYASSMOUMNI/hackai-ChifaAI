from fastapi import APIRouter, UploadFile, File, HTTPException
from ..schemas import DocumentResponse
from ..vision_service import vision_service

router = APIRouter()

ALLOWED_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf",
}
MAX_SIZE_MB = 10


@router.post("/document-analyze", response_model=DocumentResponse)
async def analyze_document(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WebP, PDF",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_SIZE_MB}MB.")

    return await vision_service.analyze_document(file_bytes, file.filename or "document", file.content_type)
