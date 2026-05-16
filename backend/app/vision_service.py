import json
import io
import asyncio
from .config import settings
from .schemas import DocumentResponse

MOCK_PRESCRIPTION = DocumentResponse(
    document_type="Ordonnance médicale",
    summary="Ce document semble être une ordonnance médicale contenant des médicaments prescrits par un médecin. Apportez-le directement à la pharmacie.",
    next_steps=[
        "Apportez ce document à la pharmacie la plus proche",
        "Demandez au pharmacien d'expliquer les médicaments et les doses",
        "Ne prenez jamais de médicaments sans l'avis d'un professionnel",
        "Conservez une copie de l'ordonnance pour votre dossier",
    ],
    warning="Ne prenez jamais de médicaments sans consulter un médecin ou un pharmacien.",
    confidence=0.78,
)

MOCK_LAB = DocumentResponse(
    document_type="Résultat d'analyse médicale",
    summary="Ce document contient des résultats d'analyses médicales. Ces résultats doivent être interprétés uniquement par votre médecin.",
    next_steps=[
        "Montrez ce document à votre médecin lors de votre prochain rendez-vous",
        "Ne tirez pas de conclusions sans l'avis d'un médecin",
        "Si vous avez des symptômes, consultez rapidement",
    ],
    warning="Les résultats d'analyses médicales doivent toujours être interprétés par un médecin.",
    confidence=0.72,
)

MOCK_ADMIN = DocumentResponse(
    document_type="Document administratif de santé",
    summary="Ce document semble être un formulaire administratif lié à la santé (attestation, demande de remboursement, ou dossier médical).",
    next_steps=[
        "Vérifiez que toutes les informations personnelles sont correctes",
        "Présentez ce document à l'administration de l'hôpital ou de la CNSS",
        "Gardez une copie pour vous",
    ],
    warning=None,
    confidence=0.68,
)

DOCUMENT_ANALYSIS_PROMPT = """Analyze this medical document carefully and respond ONLY in JSON:
{
  "document_type": "Type in French (e.g., Ordonnance médicale, Résultat d'analyse, Document administratif)",
  "summary": "2-3 sentence plain-language summary in French. Simple enough for a rural person with low literacy.",
  "next_steps": ["Action 1", "Action 2", "Action 3"],
  "warning": "Safety warning if needed, or null",
  "confidence": 0.0
}

Rules:
- Use SIMPLE language — no medical jargon
- NEVER interpret lab values or give a diagnosis
- Always recommend consulting a doctor or pharmacist for medical documents
- Focus on WHAT the document is and WHAT to DO with it
- Respond only in valid JSON, nothing else"""


class VisionService:
    def __init__(self):
        self.provider = settings.get_active_provider()

    async def analyze_document(self, file_bytes: bytes, filename: str, content_type: str) -> DocumentResponse:
        if self.provider == "mock":
            return self._mock_response(filename)
        try:
            if self.provider == "gemini":
                return await self._call_gemini(file_bytes, filename, content_type)
        except Exception as e:
            print(f"[ShiffAi] Vision call failed: {e}")
        return self._mock_response(filename)

    def _mock_response(self, filename: str) -> DocumentResponse:
        fn = filename.lower()
        if any(k in fn for k in ("ordon", "rx", "presc", "medic", "traitement")):
            return MOCK_PRESCRIPTION
        if any(k in fn for k in ("analyse", "lab", "result", "bilan", "examen")):
            return MOCK_LAB
        return MOCK_ADMIN

    async def _call_gemini(self, file_bytes: bytes, filename: str, content_type: str) -> DocumentResponse:
        import google.generativeai as genai
        genai.configure(api_key=settings.google_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        if "pdf" in content_type.lower() or filename.lower().endswith(".pdf"):
            try:
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(file_bytes))
                text = " ".join(page.extract_text() or "" for page in reader.pages)
                prompt = f"{DOCUMENT_ANALYSIS_PROMPT}\n\nDocument text:\n{text[:4000]}"
                response = await asyncio.to_thread(model.generate_content, prompt)
            except Exception:
                return self._mock_response(filename)
        else:
            from PIL import Image
            img = Image.open(io.BytesIO(file_bytes))
            response = await asyncio.to_thread(model.generate_content, [DOCUMENT_ANALYSIS_PROMPT, img])

        try:
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            data = json.loads(text)
            return DocumentResponse(**data)
        except Exception as e:
            print(f"[ShiffAi] Vision parse failed: {e}")
            return self._mock_response(filename)


vision_service = VisionService()
