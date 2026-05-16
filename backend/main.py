from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, document, health, status as status_router
from app.routes import tts_route, asr_route

app = FastAPI(
    title="ShiffAi Backend",
    description="Voice-first rural health AI assistant for Morocco",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(document.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(status_router.router, prefix="/api")
app.include_router(tts_route.router, prefix="/api")
app.include_router(asr_route.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "ShiffAi API — Rural Health AI for Morocco",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": ["/api/status", "/api/voice-chat", "/api/document-analyze", "/api/checklist"],
    }
