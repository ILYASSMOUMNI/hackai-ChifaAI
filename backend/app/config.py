import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path, override=True)

class Settings:
    demo_mode: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "").strip()
    groq_api_key: str = os.getenv("GROQ_API_KEY", "").strip()
    hf_token: str = os.getenv("HF_TOKEN", "").strip()
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "").strip()
    elevenlabs_voice_id: str = os.getenv("ELEVENLABS_VOICE_ID", "").strip()
    ai_provider: str = os.getenv("AI_PROVIDER", "smolagents")
    app_name: str = os.getenv("APP_NAME", "ShiffAi")
    default_language: str = os.getenv("DEFAULT_LANGUAGE", "darija")

    # ASR settings
    use_local_asr: bool = os.getenv("USE_LOCAL_ASR", "true").lower() == "true"
    local_asr_model: str = os.getenv("LOCAL_ASR_MODEL", "KandirResearch/Whisper-Small-Darija")

    # TTS settings
    use_local_tts: bool = os.getenv("USE_LOCAL_TTS", "true").lower() == "true"
    tts_speaker_wav: str = os.getenv("TTS_SPEAKER_WAV", "").strip()

    def get_active_provider(self) -> str:
        if self.demo_mode:
            return "mock"
        if self.ai_provider == "atlas" and self.hf_token:
            return "atlas"
        if self.ai_provider == "smolagents" and self.groq_api_key:
            return "smolagents"
        if self.ai_provider == "groq" and self.groq_api_key:
            return "groq"
        if self.google_api_key:
            return "gemini"
        if self.groq_api_key:
            return "groq"
        return "mock"

settings = Settings()
