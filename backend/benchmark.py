"""
ShiffAi Model Accuracy Benchmark
Tests urgency classification accuracy against a labeled Darija health dataset.

Usage:
    python benchmark.py                    # test current AI_PROVIDER from .env
    python benchmark.py --provider groq    # test a specific provider
    python benchmark.py --provider atlas
"""

import asyncio
import argparse
import json
import os
import sys
import io
from pathlib import Path
from dotenv import load_dotenv

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

load_dotenv(Path(__file__).parent / ".env", override=True)

sys.path.insert(0, str(Path(__file__).parent))

# Labeled test dataset — (query, language, expected_urgency)
TEST_CASES = [
    # HIGH urgency
    ("3endi wajja3 f sdar w so3oba f tnafes", "darija", "high"),
    ("ma kantnafes mzyan wa sdar ta3 li", "darija", "high"),
    ("wqa3 wa mfqod l-wa3i", "darija", "high"),
    ("عندي ألم في الصدر وصعوبة في التنفس", "ar", "high"),
    ("douleur thoracique et difficulté à respirer", "fr", "high"),
    ("dam bzzaf khrej mn jrh", "darija", "high"),

    # MEDIUM urgency
    ("3endi skhana w ras", "darija", "medium"),
    ("wajja3 ras w ka7 mn 3 iyam", "darija", "medium"),
    ("3endi is7al w qyah men s-sbah", "darija", "medium"),
    ("عندي حمى وصداع منذ يومين", "ar", "medium"),
    ("j'ai de la fièvre depuis deux jours", "fr", "medium"),
    ("d3if w ma kaklach w 3endi ghthyan", "darija", "medium"),

    # LOW urgency
    ("fin nqdr njiw l-sbitar l-qrib", "darija", "low"),
    ("chno nakhod men dwa l-broud", "darija", "low"),
    ("كيف يمكنني الوصول إلى أقرب مستشفى", "ar", "low"),
    ("où est la pharmacie la plus proche", "fr", "low"),
    ("wach khass nakhod doctor wla pharmacie", "darija", "low"),
    ("chno mane3 nshreb Doliprane", "darija", "low"),
]


async def run_benchmark(provider: str):
    os.environ["AI_PROVIDER"] = provider

    # Re-import after env change
    from app.config import Settings
    settings = Settings()
    print(f"Active provider: {settings.get_active_provider()}")

    from app.ai_service import AIService
    from app.schemas import VoiceChatRequest

    svc = AIService()
    svc.provider = settings.get_active_provider()

    results = []
    correct = 0
    total = len(TEST_CASES)

    print(f"\nRunning {total} test cases with provider: {svc.provider}\n")
    print(f"{'#':<4} {'Query':<45} {'Expected':<10} {'Got':<10} {'OK'}")
    print("-" * 80)

    for i, (text, lang, expected) in enumerate(TEST_CASES, 1):
        req = VoiceChatRequest(text=text, language=lang, mode="health")
        try:
            resp = await svc.voice_chat(req)
            got = resp.urgency
            ok = got == expected
            if ok:
                correct += 1
            status = "OK" if ok else "FAIL"
            print(f"{i:<4} {text[:44]:<45} {expected:<10} {got:<10} {status}")
            results.append({"text": text, "lang": lang, "expected": expected, "got": got, "correct": ok})
        except Exception as e:
            print(f"{i:<4} {text[:44]:<45} {expected:<10} ERROR: {e}")
            results.append({"text": text, "lang": lang, "expected": expected, "got": "error", "correct": False})

    accuracy = correct / total * 100
    print(f"\n{'='*80}")
    print(f"Provider : {svc.provider}")
    print(f"Correct  : {correct}/{total}")
    print(f"Accuracy : {accuracy:.1f}%")

    # Per-class breakdown
    for label in ("high", "medium", "low"):
        subset = [r for r in results if r["expected"] == label]
        if subset:
            sub_correct = sum(1 for r in subset if r["correct"])
            print(f"  {label:<8}: {sub_correct}/{len(subset)} ({sub_correct/len(subset)*100:.0f}%)")

    # Save results
    out_path = Path(__file__).parent / f"benchmark_results_{svc.provider}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"provider": svc.provider, "accuracy": accuracy, "correct": correct, "total": total, "cases": results}, f, ensure_ascii=False, indent=2)
    print(f"\nResults saved to: {out_path.name}")

    return accuracy


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", default=None, help="Override AI_PROVIDER (atlas, groq, gemini, mock)")
    args = parser.parse_args()

    provider = args.provider or os.getenv("AI_PROVIDER", "groq")
    asyncio.run(run_benchmark(provider))
