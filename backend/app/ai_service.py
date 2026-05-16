import json
import asyncio
from .config import settings
from .schemas import VoiceChatRequest, VoiceChatResponse
from .safety import SYSTEM_PROMPT, detect_urgency, get_disclaimer

# Lazy import to avoid crashing if smolagents not installed
_medical_agent = None

def _get_medical_agent():
    global _medical_agent
    if _medical_agent is None:
        from .agent_service import medical_agent
        _medical_agent = medical_agent
    return _medical_agent

MOCK_RESPONSES = {
    "high": {
        "darija": {
            "answer": "⚠️ هاد الأعراض خطرين بزاف! سير دابا دابا للسبيطار القريب ولا عيّط 15 (SAMU). ما تستنى والو — هاد الشي لازم يتوجد دابا!",
            "steps": ["عيّط 15 (SAMU) دابا", "ولا سير لورجانس القريب", "ما تق3دش وحدك", "خبر العيلة ولا الجيران"],
            "checklist": ["عيّط للنجدة", "دار شخص معاك", "سير السبيطار دابا"],
        },
        "fr": {
            "answer": "⚠️ Ces symptômes peuvent être très graves. Rendez-vous immédiatement aux urgences ou appelez le 15 (SAMU). N'attendez pas — agissez maintenant!",
            "steps": ["Appelez le 15 (SAMU) maintenant", "Rendez-vous aux urgences les plus proches", "Ne restez pas seul(e)", "Prévenez votre famille"],
            "checklist": ["Appeler les secours", "Être accompagné", "Aller aux urgences"],
        },
        "ar": {
            "answer": "⚠️ هذه الأعراض قد تكون خطيرة جداً. توجه فوراً لأقرب طوارئ أو اتصل بـ 15 (SAMU). لا تنتظر — تصرف الآن!",
            "steps": ["اتصل بـ 15 (SAMU) فوراً", "اذهب لأقرب طوارئ", "لا تكن وحدك", "أخبر أهلك"],
            "checklist": ["الاتصال بالإسعاف", "مرافق", "الذهاب للطوارئ"],
        },
    },
    "medium": {
        "darija": {
            "answer": "شرب الماء بزاف وارتح فالدار. خد باراسيتامول باش تقلل السخانة ولا الوجع. إلا زاد الحال ولا بغات تكثر من 3 أيام، سير السبيطار ولا الصيدلية.",
            "steps": ["ارتح فالدار", "شرب الماء بزاف (2-3 ليتر النهار)", "خد باراسيتامول باش تقلل السخانة", "إلا زاد من 3 أيام، سير السبيطار"],
            "checklist": ["الماء بزاف", "باراسيتامول", "راحة", "راقب الحال"],
        },
        "fr": {
            "answer": "Reposez-vous et buvez beaucoup d'eau. Prenez du paracétamol pour la fièvre ou la douleur. Si les symptômes durent plus de 3 jours ou s'aggravent, consultez un médecin ou une pharmacie.",
            "steps": ["Reposez-vous à la maison", "Buvez 2-3 litres d'eau par jour", "Prenez du paracétamol si nécessaire", "Si ça dure plus de 3 jours, consultez"],
            "checklist": ["Beaucoup d'eau", "Paracétamol", "Repos", "Surveiller les symptômes"],
        },
        "ar": {
            "answer": "استرح واشرب الماء الكثير. تناول الباراسيتامول للحمى أو الألم. إذا استمرت الأعراض أكثر من 3 أيام أو ساءت، راجع الطبيب أو الصيدلية.",
            "steps": ["الراحة في البيت", "اشرب 2-3 لترات ماء يومياً", "تناول الباراسيتامول إذا لزم", "إذا دامت أكثر من 3 أيام، استشر"],
            "checklist": ["ماء كثير", "باراسيتامول", "راحة", "مراقبة الأعراض"],
        },
    },
    "low": {
        "darija": {
            "answer": "نقدر نعاونك تفهم وقتك الصحية ونوجهك للمكان الصحيح. وصف لي أعراضك بتحديد باش ندير لك البقالي.",
            "steps": ["وصف أعراضك بتحديد", "سوّل الصيدلية إلا عندك سوال بسيط", "سير السبيطار إلا لزم"],
            "checklist": ["وصف أعراضك", "سوّل الصيدلية ولا السبيطار إلا لزم"],
        },
        "fr": {
            "answer": "Je suis là pour vous aider à comprendre votre situation de santé. Décrivez-moi vos symptômes en détail pour que je puisse vous donner les meilleurs conseils.",
            "steps": ["Décrivez vos symptômes en détail", "Consultez un pharmacien pour des questions simples", "Allez à un centre de santé si nécessaire"],
            "checklist": ["Décrire les symptômes", "Consulter si besoin"],
        },
        "ar": {
            "answer": "أنا هنا لمساعدتك في فهم وضعك الصحي. أخبرني بأعراضك بالتفصيل لأعطيك أفضل النصائح.",
            "steps": ["صف أعراضك بالتفصيل", "استشر الصيدلي لأسئلة بسيطة", "اذهب لمركز صحي إذا لزم"],
            "checklist": ["وصف الأعراض", "الاستشارة عند الحاجة"],
        },
    },
}


def _map_lang(language: str) -> str:
    if language in ("dr", "darija"):
        return "darija"
    if language == "ar":
        return "ar"
    if language == "fr":
        return "fr"
    return "darija"


def get_mock_response(request: VoiceChatRequest) -> VoiceChatResponse:
    urgency = detect_urgency(request.text)
    lang_key = _map_lang(request.language)
    data = MOCK_RESPONSES.get(urgency, MOCK_RESPONSES["low"]).get(lang_key, MOCK_RESPONSES["low"]["fr"])
    return VoiceChatResponse(
        answer=data["answer"],
        urgency=urgency,
        steps=data["steps"],
        checklist=data["checklist"],
        disclaimer=get_disclaimer(lang_key),
        language=lang_key,
        confidence=0.95 if urgency == "high" else 0.78 if urgency == "medium" else 0.65,
    )


class AIService:
    def __init__(self):
        self.provider = settings.get_active_provider()

    async def voice_chat(self, request: VoiceChatRequest) -> VoiceChatResponse:
        if self.provider == "mock":
            return get_mock_response(request)
        try:
            if self.provider == "smolagents":
                return await self._call_smolagents(request)
            if self.provider == "gemini":
                return await self._call_gemini(request)
            if self.provider == "groq":
                return await self._call_groq(request)
            if self.provider == "atlas":
                return await self._call_atlas(request)
        except Exception as e:
            print(f"[ShiffAi] AI call failed ({self.provider}): {e}")
        return get_mock_response(request)

    async def _call_smolagents(self, request: VoiceChatRequest) -> VoiceChatResponse:
        agent = _get_medical_agent()
        data = await agent.run(request.text, request.language, request.mode)

        lang_key = _map_lang(request.language)
        kw_urgency = detect_urgency(request.text)
        ai_urgency = data.get("urgency", "low")
        RANK = {"low": 0, "medium": 1, "high": 2}
        final_urgency = ai_urgency if RANK.get(ai_urgency, 0) >= RANK.get(kw_urgency, 0) else kw_urgency

        return VoiceChatResponse(
            answer=data.get("answer", ""),
            urgency=final_urgency,
            steps=data.get("steps", []),
            checklist=data.get("checklist", []),
            disclaimer=get_disclaimer(lang_key),
            language=lang_key,
            confidence=float(data.get("confidence", 0.8)),
        )

    async def _call_gemini(self, request: VoiceChatRequest) -> VoiceChatResponse:
        import google.generativeai as genai
        genai.configure(api_key=settings.google_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""{SYSTEM_PROMPT}

User: {request.text}
Language: {request.language}
Mode: {request.mode}"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        return self._parse_json_response(response.text, request)

    async def _call_groq(self, request: VoiceChatRequest) -> VoiceChatResponse:
        from groq import Groq
        client = Groq(api_key=settings.groq_api_key)

        completion = await asyncio.to_thread(
            client.chat.completions.create,
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"User: {request.text}\nLanguage: {request.language}\nMode: {request.mode}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )
        return self._parse_json_response(completion.choices[0].message.content, request)

    async def _call_atlas(self, request: VoiceChatRequest) -> VoiceChatResponse:
        import httpx
        url = "https://api-inference.huggingface.co/models/MBZUAI-Paris/Atlas-Chat-9B/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.hf_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "MBZUAI-Paris/Atlas-Chat-9B",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"User: {request.text}\nLanguage: {request.language}\nMode: {request.mode}"},
            ],
            "max_tokens": 512,
            "temperature": 0.4,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Atlas Chat HTTP {resp.status_code}: {resp.text[:200]}")
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return self._parse_json_response(content, request)

    def _parse_json_response(self, text: str, request: VoiceChatRequest) -> VoiceChatResponse:
        try:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            data = json.loads(text)
            lang_key = _map_lang(request.language)

            # Safety override: keyword detector acts as a minimum urgency floor.
            # If keywords detect high urgency but AI says low/medium, we escalate.
            keyword_urgency = detect_urgency(request.text)
            ai_urgency = data.get("urgency", "low")
            URGENCY_RANK = {"low": 0, "medium": 1, "high": 2}
            final_urgency = ai_urgency if URGENCY_RANK.get(ai_urgency, 0) >= URGENCY_RANK.get(keyword_urgency, 0) else keyword_urgency

            return VoiceChatResponse(
                answer=data.get("answer", ""),
                urgency=final_urgency,
                steps=data.get("steps", []),
                checklist=data.get("checklist", []),
                disclaimer=get_disclaimer(lang_key),
                language=lang_key,
                confidence=float(data.get("confidence", 0.8)),
            )
        except Exception as e:
            print(f"[ShiffAi] JSON parse failed: {e} | raw: {text[:200]}")
            return get_mock_response(request)


ai_service = AIService()
