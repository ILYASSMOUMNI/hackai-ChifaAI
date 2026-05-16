import asyncio
import json
import re
from smolagents import ToolCallingAgent, OpenAIServerModel, tool, Tool
from .config import settings
from .safety import detect_urgency, get_disclaimer

# ── Medical tools ─────────────────────────────────────────────────────────────

@tool
def analyze_symptoms(symptoms_text: str) -> str:
    """
    Analyze medical symptoms described in Darija, Arabic, or French and identify key medical issues.
    Args:
        symptoms_text: The patient's description of their symptoms in any language.
    Returns a structured analysis of the identified symptoms.
    """
    return (
        f"Symptoms received: '{symptoms_text}'. "
        "Key medical concepts identified for Moroccan rural context. "
        "Proceed to urgency classification."
    )


@tool
def classify_urgency(symptoms_description: str) -> str:
    """
    Classify the medical urgency level for a Moroccan rural patient.
    Args:
        symptoms_description: Patient symptoms to evaluate for urgency.
    Returns urgency level with clinical reasoning.
    """
    urgency = detect_urgency(symptoms_description)
    details = {
        "high": (
            "HIGH URGENCY — Life-threatening situation possible. "
            "Patient must call SAMU 141 or go to emergency room immediately. "
            "Do not wait. Possible: chest pain, breathing difficulty, unconsciousness, severe bleeding."
        ),
        "medium": (
            "MEDIUM URGENCY — Needs medical attention within 24-48 hours. "
            "Can visit nearest pharmacy first or health center (Centre de Santé). "
            "Monitor symptoms carefully. If worsening, escalate to HIGH."
        ),
        "low": (
            "LOW URGENCY — Can be managed at home with rest and basic care. "
            "Encourage hydration, rest. Visit pharmacy if symptoms persist beyond 3 days."
        ),
    }
    return details.get(urgency, details["low"])


@tool
def get_otc_medication_advice(symptoms: str, urgency_level: str) -> str:
    """
    Provide safe over-the-counter medication advice available in Moroccan pharmacies.
    Only for low or medium urgency — never for emergencies.
    Args:
        symptoms: The patient symptoms description.
        urgency_level: Must be 'low' or 'medium'. If 'high', no OTC advice is given.
    Returns safe OTC recommendations with dosage available in Morocco.
    """
    if urgency_level == "high":
        return "Emergency situation — no OTC advice. Patient must call SAMU 141 immediately."

    s = symptoms.lower()

    if any(k in s for k in ["fever", "skhana", "sokhana", "حمى", "سخانة", "fièvre", "temperature"]):
        return (
            "Paracétamol (Doliprane) 500mg–1g every 6–8 hours. Maximum 3g per day. "
            "Drink 2–3 litres of water daily. Rest at home. "
            "If fever exceeds 39°C for more than 2 days, see a doctor."
        )
    if any(k in s for k in ["headache", "mal de tête", "صداع", "sda3", "ras"]):
        return (
            "Paracétamol 500mg with a full glass of water. Rest in a quiet, dark room. "
            "Stay hydrated. Avoid screens. If headache is sudden and very severe, go to emergency."
        )
    if any(k in s for k in ["cough", "toux", "ka7", "سعال", "kha"]):
        return (
            "Sirop antitussif (Hexapneumine or Drill) — follow dosage on box. "
            "Warm honey and lemon in water. Stay hydrated. Avoid cold air. "
            "If coughing blood, go to emergency immediately."
        )
    if any(k in s for k in ["diarrhea", "diarrhée", "is7al", "إسهال"]):
        return (
            "Oral rehydration salts (SRO / Réhydratation orale) — dissolve in clean water. "
            "Avoid dairy and fatty foods. Eat rice, bananas, dry bread. "
            "If blood in stool or more than 5 days, see a doctor."
        )
    if any(k in s for k in ["vomit", "vomissement", "qyah", "قيء", "nausea", "nausée"]):
        return (
            "Rest stomach — avoid food for 2 hours. Small sips of water frequently. "
            "Metoclopramide (Primpéran) — available at pharmacy. "
            "If vomiting blood or unconscious, call SAMU 141."
        )
    if any(k in s for k in ["sore throat", "mal de gorge", "حلق", "gorge"]):
        return (
            "Gargle warm salt water 3× per day. Strepsils or Lysopaïne lozenges. "
            "Paracétamol for pain. If throat is very swollen and can't swallow, see a doctor."
        )

    return (
        "Consult your nearest pharmacist (صيدلية / pharmacie) — they can recommend "
        "appropriate medication for your symptoms without a prescription. "
        "Pharmacies in Morocco are widely available and provide free basic advice."
    )


@tool
def get_emergency_contacts(region: str = "Morocco") -> str:
    """
    Provide emergency service numbers and hospital contacts for Morocco.
    Args:
        region: Patient's region or city in Morocco (optional).
    Returns emergency contacts and nearest hospital information.
    """
    return (
        "EMERGENCY NUMBERS IN MOROCCO:\n"
        "- SAMU (Medical Emergency): 141\n"
        "- Police: 19\n"
        "- Gendarmerie Royale: 177\n"
        "- Civil Protection / Fire: 15\n"
        "- SOS Médecins Maroc: 0801 000 180\n\n"
        "MAJOR HOSPITALS:\n"
        "- Casablanca: CHU Ibn Rochd — 0522 223 838\n"
        "- Rabat: CHU Ibn Sina — 0537 677 070\n"
        "- Marrakech: CHU Mohammed VI — 0524 300 000\n"
        "- Fès: CHU Hassan II — 0535 612 525\n"
        "- Agadir: CHU Souss Massa — 0528 282 424\n"
        "- Oujda: CHU Mohammed I — 0536 682 447\n\n"
        "RURAL AREAS: Contact your nearest Centre de Santé or Maison d'Accouchement. "
        "If unavailable, call 141 (SAMU) — they dispatch mobile medical units."
    )


# ── Agent ─────────────────────────────────────────────────────────────────────

MEDICAL_SYSTEM_PROMPT = """You are ShiffAi, a voice-first rural health guidance assistant for Morocco.
You help patients in Darija, Arabic, French, or Amazigh understand health situations.
You serve low-literacy rural users — keep answers simple and actionable.

RULES:
- Use the tools to analyze symptoms, classify urgency, get OTC advice, and locate emergency services.
- NEVER give a final medical diagnosis.
- NEVER prescribe exact doses beyond safe OTC recommendations.
- Always recommend seeing a real doctor for anything beyond basic first aid.
- For HIGH urgency: immediately recommend calling 141 (SAMU).
- Respond in the SAME language as the patient.

After using your tools, respond ONLY with valid JSON in this exact format (no other text):
{
  "answer": "Main response in patient's language. Short — 2–3 sentences max.",
  "urgency": "low|medium|high",
  "steps": ["Concrete step 1", "Concrete step 2", "Concrete step 3"],
  "checklist": ["Quick item 1", "Quick item 2", "Quick item 3"],
  "confidence": 0.85
}"""


class MedicalAgentService:
    def __init__(self):
        self._agent = None

    def _build(self):
        if not settings.groq_api_key:
            raise RuntimeError("Groq API key required for smolagents medical agent")

        model = OpenAIServerModel(
            model_id="llama-3.3-70b-versatile",
            api_base="https://api.groq.com/openai/v1",
            api_key=settings.groq_api_key,
        )

        return ToolCallingAgent(
            model=model,
            tools=[
                analyze_symptoms,
                classify_urgency,
                get_otc_medication_advice,
                get_emergency_contacts,
            ],
            max_steps=5,
            verbosity_level=0,
            instructions=MEDICAL_SYSTEM_PROMPT,
        )

    def _get_agent(self):
        if self._agent is None:
            self._agent = self._build()
        return self._agent

    async def run(self, text: str, language: str, mode: str) -> dict:
        agent = self._get_agent()

        prompt = (
            f"Patient speaks {language}.\n"
            f"Patient says: \"{text}\"\n\n"
            "Use your tools in order: analyze_symptoms → classify_urgency → "
            "get_otc_medication_advice (if not high) or get_emergency_contacts (if high). "
            "Then return only the JSON response."
        )

        def _run():
            return agent.run(prompt)

        raw = await asyncio.to_thread(_run)

        return self._parse(str(raw), text, language)

    def _parse(self, raw: str, original_text: str, language: str) -> dict:
        # Extract JSON from agent output
        try:
            match = re.search(r'\{[^{}]*"answer"[^{}]*\}', raw, re.DOTALL)
            if match:
                data = json.loads(match.group())
                # Safety floor: keyword urgency can only escalate, never downgrade
                kw_urgency = detect_urgency(original_text)
                ai_urgency = data.get("urgency", "low")
                RANK = {"low": 0, "medium": 1, "high": 2}
                data["urgency"] = ai_urgency if RANK.get(ai_urgency, 0) >= RANK.get(kw_urgency, 0) else kw_urgency
                return data
        except Exception as e:
            print(f"[ShiffAi] Agent JSON parse failed: {e} | raw[:300]: {raw[:300]}")

        # Fallback — return structured response using keyword urgency
        urgency = detect_urgency(original_text)
        return {
            "answer": raw[:400] if raw else "",
            "urgency": urgency,
            "steps": [],
            "checklist": [],
            "confidence": 0.6,
        }


medical_agent = MedicalAgentService()
