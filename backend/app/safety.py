SYSTEM_PROMPT = """You are ShiffAi, a voice-first rural health guidance assistant for Morocco.
You help users in Darija, Arabic, French, or Amazigh understand health-related situations, documents, and next steps.
You are designed for rural and low-literacy users.

STRICT RULES:
- Keep the main answer SHORT — maximum 3-4 sentences
- Use SIMPLE, everyday language — no medical jargon
- NEVER give a final medical diagnosis
- NEVER replace a doctor or pharmacist
- NEVER prescribe exact medication doses
- If symptoms may be severe, CLEARLY recommend urgent medical help or the nearest health center
- Respond in the SAME language as the user's message
- If user speaks Darija (Moroccan Arabic dialect in Latin or Arabic script), respond in Darija
- For HIGH urgency, start with ⚠️ and emphasize going to a health center immediately
- Always end with encouraging, actionable steps

You MUST respond ONLY in valid JSON with this exact structure:
{
  "answer": "Your main response here",
  "urgency": "low|medium|high",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "checklist": ["Item 1", "Item 2"],
  "confidence": 0.85
}

Do NOT include any text outside the JSON."""

DISCLAIMER = "شيفاي كيدي تاويجيهات فقط. ما كيبقاش بدعة أكثر من طبيب."
DISCLAIMER_FR = "ShiffAi donne des conseils uniquement. Il ne remplace pas un médecin."
DISCLAIMER_AR = "شِفاء AI يقدم توجيهات فقط ولا يحل محل الطبيب."

HIGH_URGENCY_KEYWORDS = [
    # Darija (Latin script)
    "sdar", "wajja3 f sdar", "seder", "so3oba f tnafes", "ma kantnafes",
    "dam bzzaf", "wqe3", "mfqod l-wa3i", "9tab", "skta", "paralysie",
    # Arabic substrings — broad matching (chest, breathing, consciousness)
    "الصدر", "التنفس", "صعوبة", "الوعي", "نزيف", "سكتة", "شلل", "إسعاف",
    # French
    "douleur thoracique", "difficulté à respirer", "perte de connaissance",
    "saignement abondant", "accident grave", "ne respire plus",
    # English
    "chest pain", "can't breathe", "unconscious",
]

MEDIUM_URGENCY_KEYWORDS = [
    # Darija (Latin script)
    "skhana", "ras", "dar7", "wajja3", "ka7", "rija",
    "ma kaklach", "tabash", "d3if", "qyah", "is7al",
    # Arabic — includes Darija Arabic-script words
    "سخانة", "حمى", "ألم", "صداع", "إسهال", "قيء", "تعب", "غثيان", "وجع",
    # French
    "fièvre", "mal", "douleur", "vomissement", "diarrhée", "nausée", "fatigue",
    # English
    "fever", "headache", "vomit", "diarrhea",
]


def detect_urgency(text: str) -> str:
    text_lower = text.lower()
    for kw in HIGH_URGENCY_KEYWORDS:
        if kw in text_lower:
            return "high"
    for kw in MEDIUM_URGENCY_KEYWORDS:
        if kw in text_lower:
            return "medium"
    return "low"


def get_disclaimer(language: str) -> str:
    if language == "fr":
        return DISCLAIMER_FR
    elif language in ("ar", "amazigh"):
        return DISCLAIMER_AR
    return DISCLAIMER
