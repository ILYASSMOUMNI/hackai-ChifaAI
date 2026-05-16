from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Language(str, Enum):
    darija = "darija"
    ar = "ar"
    fr = "fr"
    amazigh = "amazigh"


class Mode(str, Enum):
    health = "health"
    documents = "documents"
    public_services = "public_services"
    general = "general"


class Urgency(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class VoiceChatRequest(BaseModel):
    text: str
    language: str = "darija"
    mode: str = "health"


class VoiceChatResponse(BaseModel):
    answer: str
    urgency: str
    steps: List[str]
    checklist: List[str]
    disclaimer: str
    language: str
    confidence: float


class DocumentResponse(BaseModel):
    document_type: str
    summary: str
    next_steps: List[str]
    warning: Optional[str] = None
    confidence: float


class ChecklistRequest(BaseModel):
    use_case: str
    language: str = "darija"


class ChecklistResponse(BaseModel):
    title: str
    items: List[str]
    language: str


class TTSRequest(BaseModel):
    text: str
    language: str = "darija"


class ASRResponse(BaseModel):
    text: str
    language: str


class StatusResponse(BaseModel):
    status: str
    ai_provider: str
    demo_mode: bool
    version: str
    app_name: str
