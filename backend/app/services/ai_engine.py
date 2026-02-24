# app/services/ai_engine.py
import logging
import os
import re
from typing import Any, Dict

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ============================================================
# LEET SPEAK / OBFUSCATION MAP
# ============================================================

LEET_MAP = str.maketrans({
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '@': 'a',
    '!': 'i',
    '$': 's',
    '+': 't',
})

# ============================================================
# TOXIC KEYWORDS (STRICTLY FOR TOXICITY, NOT SENTIMENT)
# ============================================================

TOXIC_KEYWORDS = {
    # Hard insults (direct harassment)
    'tolol': 'hard',
    'tol0l': 'hard',
    't0lol': 'hard',
    'bego': 'hard',
    'bodoh': 'hard',
    'b0doh': 'hard',
    'idiot': 'hard',
    '1diot': 'hard',
    'anjing': 'hard',
    '4njing': 'hard',
    'anjir': 'hard',
    'anjer': 'hard',
    'kontol': 'hard',
    'kont0l': 'hard',
    'k0ntol': 'hard',
    'bangsat': 'hard',
    'b4ngsat': 'hard',
    'brengsek': 'hard',
    'br3ngsek': 'hard',
    'keparat': 'hard',
    'k3parat': 'hard',
    'monyet': 'hard',
    'm0nyet': 'hard',
    'goblok': 'hard',
    'g0blok': 'hard',
    'bajingan': 'hard',
    'b4jingan': 'hard',
    'oon': 'hard',
    'o0n': 'hard',
    'jancok': 'hard',
    'j4ncok': 'hard',
    'kampret': 'hard',
    'k4mpret': 'hard',
    'celeng': 'hard',
    'babi': 'hard',
    'sialan': 'hard',
    'kurang ajar': 'hard',
    'geblek': 'hard',
    'dodol': 'hard',
    'd0dol': 'hard',
    'brengsek': 'hard',
    'setan': 'hard',
    'iblis': 'hard',

    # Crude language (can be friendly in some contexts)
    'tai': 'crude',
    't4i': 'crude',
    'puki': 'crude',
    'memek': 'crude',

    # Mild complaints (NOT toxic by default)
    'nyebelin': 'mild',
    'menyebalkan': 'mild',
    'benci': 'mild',
    'kesal': 'mild',
    'kesel': 'mild',
    'gemes': 'mild',
    'gondok': 'mild',
    'sengit': 'mild',
}

# ============================================================
# POSITIVE / FRIENDLY CONTEXT INDICATORS
# ============================================================

POSITIVE_INDICATORS = {
    'kangen',
    'teman',
    'maaf',
    'minta maaf',
    'sorry',
    'sori',
    'makasih',
    'terima kasih',
    'thanks',
    'love',
    'sayang',
    'traktir',
    'sahabat',
    'akrab',
    'seru',
    'senang',
    'bahagia',
    'bangga',
    'nongkrong',
}

# Friendly slang patterns (IMPORTANT for Indo chat)
FRIENDLY_PATTERNS = [
    r"gila\s+sih",
    r"keren\s+banget",
    r"niat\s+banget",
    r"mantap\s+(sih|jiwa|bro)?",
    r"rapi[h]?\s+banget",
    r"seru\s+(banget|abis|parah)?",
    r"asik\s+(banget)?",
    r"gokil\s+(banget|abis)?",
]


class SentimentEngine:
    """
    Sentiment + Toxicity Engine
    - Sentiment: handled by ML model (Indonesian RoBERTa)
    - Toxicity: rule-based with leet speak normalization (separated from sentiment)
    - Context-aware (Indonesian informal chat)
    """

    _instance = None
    _pipeline = None
    _model_name: str

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pipeline = None
            cls._instance._model_name = os.getenv(
                "SENTIMENT_MODEL",
                "w11wo/indonesian-roberta-base-sentiment-classifier",
            )
        return cls._instance

    # ============================================================
    # MODEL LOADER (LAZY, SINGLETON)
    # ============================================================

    def _load_model(self):
        try:
            logger.info("Loading sentiment model...")
            from transformers import (
                AutoTokenizer,
                AutoModelForSequenceClassification,
                pipeline,
            )

            cache_dir = os.getenv("HF_CACHE_DIR")

            tokenizer = AutoTokenizer.from_pretrained(
                self._model_name, cache_dir=cache_dir
            )
            model = AutoModelForSequenceClassification.from_pretrained(
                self._model_name, cache_dir=cache_dir
            )

            self._pipeline = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer,
                device=-1,  # CPU only
                top_k=None,
            )

            logger.info("Sentiment model ready.")
        except Exception as e:
            logger.exception("Model load failed: %s", e)
            self._pipeline = None

    # ============================================================
    # RULE HELPERS
    # ============================================================

    def _normalize_leet(self, text: str) -> str:
        """Convert leet speak characters to their alphabetic equivalents."""
        return text.translate(LEET_MAP)

    def _has_positive_context(self, text: str) -> bool:
        t = text.lower()
        if any(p in t for p in POSITIVE_INDICATORS):
            return True
        for pattern in FRIENDLY_PATTERNS:
            if re.search(pattern, t):
                return True
        return False

    def _detect_toxicity(self, text: str) -> Dict[str, Any]:
        """
        Toxicity detection with leet speak normalization:
        - hard insults → toxic
        - crude → contextual (not toxic unless no positive context)
        - mild → never toxic
        """
        normalized = self._normalize_leet(text.lower())
        words = re.findall(r"\b\w+\b", normalized)
        found = set()

        for w in words:
            if w in TOXIC_KEYWORDS:
                found.add(TOXIC_KEYWORDS[w])

        # Also check multi-word phrases
        for phrase, level in TOXIC_KEYWORDS.items():
            if " " in phrase and phrase in normalized:
                found.add(level)

        if "hard" in found:
            return {"is_toxic": True, "level": "hard"}
        if "crude" in found:
            return {"is_toxic": False, "level": "crude"}
        if "mild" in found:
            return {"is_toxic": False, "level": "mild"}

        return {"is_toxic": False, "level": "none"}

    # ============================================================
    # MAIN ANALYSIS
    # ============================================================

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {"label": "neutral", "score": 0.0, "is_toxic": False}

        if self._pipeline is None:
            self._load_model()
            if self._pipeline is None:
                return {"label": "error", "score": 0.0, "is_toxic": False}

        safe_text = text[:512]
        logger.info("Analyzing: %s", safe_text[:80])

        try:
            toxicity = self._detect_toxicity(safe_text)
            has_positive_ctx = self._has_positive_context(safe_text)

            results = self._pipeline(safe_text)
            # Flatten if nested (top_k returns nested list)
            if isinstance(results, list) and len(results) > 0:
                if isinstance(results[0], list):
                    results = results[0]

                if len(results) > 0 and isinstance(results[0], dict):
                    top = max(results, key=lambda x: x.get("score", 0.0))
                    label = str(top.get("label", "neutral")).lower()
                    score = float(top.get("score", 0.0))
                else:
                    logger.warning("Unexpected results format: %s", type(results[0]))
                    return {"label": "error", "score": 0.0, "is_toxic": False}
            else:
                logger.warning("Empty or invalid results: %s", results)
                return {"label": "error", "score": 0.0, "is_toxic": False}

            # Context correction: positive context downgrades negative sentiment
            if has_positive_ctx and label == "negative":
                label = "neutral"
                score = round(score * 0.5, 4)

            # Toxicity is strictly rule-based and separate from sentiment
            is_toxic = toxicity["is_toxic"]

            return {
                "label": label,
                "score": round(score, 4),
                "is_toxic": is_toxic,
            }

        except Exception as e:
            logger.exception("Inference error: %s", e)
            return {"label": "error", "score": 0.0, "is_toxic": False}


# Singleton instance
ai_analyzer = SentimentEngine()
