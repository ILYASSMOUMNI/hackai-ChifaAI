from fastapi import APIRouter, HTTPException
from ..schemas import VoiceChatRequest, VoiceChatResponse, ChecklistRequest, ChecklistResponse
from ..ai_service import ai_service

router = APIRouter()

CHECKLISTS = {
    "hospital": {
        "darija": {
            "title": "Tahdir dyal sbitar",
            "items": [
                "CIN wla passeport",
                "Carte CNSS / AMO / Ramed ila 3endek",
                "Wraq dyal tbib (ordonnance, lettre)",
                "Lista dyal dwa li kataakhod",
                "Flous dyal transport w consultation",
                "Wahed m3ak ila imken",
                "Hda, 7ib wla 3tay f fomek ila sber",
            ],
        },
        "fr": {
            "title": "Préparation pour l'hôpital",
            "items": [
                "Carte d'identité ou passeport",
                "Carte CNSS / AMO / Ramed si vous en avez une",
                "Documents médicaux (ordonnance, lettre du médecin)",
                "Liste de vos médicaments actuels",
                "Argent pour le transport et la consultation",
                "Un accompagnant si possible",
                "Eau et nourriture légère si l'attente peut être longue",
            ],
        },
        "ar": {
            "title": "التحضير للمستشفى",
            "items": [
                "بطاقة التعريف الوطنية أو جواز السفر",
                "بطاقة CNSS / AMO / Ramed إن وجدت",
                "وثائق طبية (وصفة، رسالة الطبيب)",
                "قائمة الأدوية التي تتناولها",
                "مال للتنقل والاستشارة",
                "مرافق إن أمكن",
                "ماء وطعام خفيف إذا كان الانتظار طويلاً",
            ],
        },
    },
    "vaccination": {
        "darija": {
            "title": "Tahdir dyal tatih",
            "items": [
                "Carnet dyal tatih (livret de vaccination)",
                "CIN wla wraq dyal l-weld",
                "Rta7 mezyan l-lila 9bel",
                "Ma taklach walo 30 di9i9a 9bel tatih",
                "Lebbes hwayej mrayha",
                "3ayyet l-sbitar ila 9ella7 chay m3ak ba3d",
            ],
        },
        "fr": {
            "title": "Préparation pour une vaccination",
            "items": [
                "Carnet de vaccination",
                "CIN ou documents de l'enfant",
                "Bien se reposer la veille",
                "Ne pas manger 30 minutes avant le vaccin",
                "Vêtements confortables avec accès facile au bras",
                "Consulter si réaction après le vaccin",
            ],
        },
        "ar": {
            "title": "التحضير للتطعيم",
            "items": [
                "دفتر التطعيم",
                "بطاقة الهوية أو وثائق الطفل",
                "الراحة الجيدة في الليلة السابقة",
                "عدم الأكل 30 دقيقة قبل التطعيم",
                "ملابس مريحة مع سهولة الوصول للذراع",
                "استشر إذا ظهرت ردة فعل بعد التطعيم",
            ],
        },
    },
}


@router.post("/voice-chat", response_model=VoiceChatResponse)
async def voice_chat(request: VoiceChatRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    request.text = request.text.strip()[:1000]
    return await ai_service.voice_chat(request)


@router.post("/checklist", response_model=ChecklistResponse)
async def get_checklist(request: ChecklistRequest):
    use_case = request.use_case.lower()
    lang = request.language if request.language in ("fr", "ar") else "darija"

    matched = None
    for key in CHECKLISTS:
        if key in use_case or use_case in key:
            matched = CHECKLISTS[key]
            break

    if not matched:
        matched = CHECKLISTS["hospital"]

    data = matched.get(lang, matched.get("fr"))
    return ChecklistResponse(title=data["title"], items=data["items"], language=lang)
