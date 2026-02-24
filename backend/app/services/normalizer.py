# app/services/normalizer.py
import os
import re
import pandas as pd
from io import StringIO
from typing import Dict, Tuple, List

# ============================================================
# PATH RESOLUTION (FIXED)
# ============================================================

# Resolve absolute path based on THIS file location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")

DEFAULT_SLANG_PATH = os.path.join(
    DATA_DIR, "colloquial-indonesian-lexicon.csv"
)

SLANG_PATH = os.getenv("SLANG_DATA_PATH", DEFAULT_SLANG_PATH)

# ============================================================
# GLOBAL CACHES
# ============================================================

slang_dict: Dict[str, str] = {}
slang_meta: Dict[str, Dict] = {}
_slang_loaded: bool = False  # 🔥 guard flag


# ============================================================
# UTIL
# ============================================================

def _truthy(val) -> bool:
    if pd.isna(val):
        return False
    if isinstance(val, (int, float)):
        return int(val) != 0
    return str(val).strip().lower() in {"1", "true", "yes", "y", "t"}


# ============================================================
# LOAD SLANG DICTIONARY (SAFE & EXPLICIT)
# ============================================================

def load_slang_dict(force_reload: bool = False) -> Tuple[Dict[str, str], Dict[str, Dict]]:
    """
    Load slang dictionary safely.
    - Uses absolute path
    - Can be force reloaded
    - No silent failure
    """
    global slang_dict, slang_meta, _slang_loaded

    if _slang_loaded and not force_reload:
        return slang_dict, slang_meta

    slang_dict = {}
    slang_meta = {}

    if not os.path.exists(SLANG_PATH):
        raise FileNotFoundError(
            f"[Normalizer] Slang CSV not found: {SLANG_PATH}"
        )

    with open(SLANG_PATH, "r", encoding="utf-8", errors="ignore") as f:
        csv_text = f.read()

    df = pd.read_csv(StringIO(csv_text), sep=",", engine="python")
    df.columns = [c.strip().lower() for c in df.columns]

    slang_col = "slang" if "slang" in df.columns else df.columns[0]
    formal_col = "formal" if "formal" in df.columns else df.columns[1]
    in_dict_col = next(
        (c for c in df.columns if c.replace("-", "_") == "in_dictionary"),
        None,
    )

    category_cols = [c for c in df.columns if c.startswith("category")]
    context_col = "context" if "context" in df.columns else None

    for _, row in df.iterrows():
        slang = str(row.get(slang_col, "")).strip().lower()
        if not slang:
            continue

        in_dict = row.get(in_dict_col, 1) if in_dict_col else 1
        if not _truthy(in_dict):
            continue

        formal = str(row.get(formal_col, slang)).strip().lower()
        slang_dict[slang] = formal

        meta = {}
        if context_col:
            meta["context"] = row.get(context_col)

        cats: List[str] = []
        for c in category_cols:
            v = row.get(c)
            if pd.notna(v) and str(v).strip() not in {"0", "nan", "none"}:
                cats.append(str(v).strip())

        if cats:
            meta["categories"] = cats

        slang_meta[slang] = meta

    _slang_loaded = True
    print(f"[Normalizer] Loaded {len(slang_dict)} slang entries from {SLANG_PATH}")
    return slang_dict, slang_meta


# ============================================================
# NORMALIZATION
# ============================================================

def dedupe_repeated_chars(word: str) -> str:
    return re.sub(r"(.)\1{2,}", r"\1", word)


def normalize_text(text: str) -> str:
    """
    Normalize chat text:
    - lowercase
    - remove edge punctuation
    - dedupe repeated chars
    - slang → formal mapping
    """
    if not text:
        return ""

    # ENSURE SLANG LOADED
    if not _slang_loaded:
        load_slang_dict()

    words = text.split()
    out = []

    for w in words:
        clean = re.sub(r"^[^\w]+|[^\w]+$", "", w).lower()
        clean = dedupe_repeated_chars(clean)

        if clean in slang_dict:
            out.append(slang_dict[clean])
        else:
            out.append(clean)

    return " ".join(out)


# ============================================================
# CHAT PARSER
# ============================================================

TIMESTAMP_PATTERN = r"(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)"
SENDER_MSG_PATTERN = rf"^{TIMESTAMP_PATTERN}\s*-?\s*(.*?)\s*:\s*(.*)$"


def parse_chat_log(raw_text: str):
    """
    Parse chat logs into structured messages.
    """
    if not raw_text:
        return []

    lines = raw_text.splitlines()
    parsed = []
    msg_id = 1

    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue

        m = re.search(SENDER_MSG_PATTERN, ln)
        if m:
            timestamp, sender, msg = m.group(1), m.group(2), m.group(3)
        else:
            timestamp = ""
            if ":" in ln:
                sender, msg = ln.split(":", 1)
            else:
                sender, msg = "Unknown", ln

        normalized = normalize_text(msg)

        parsed.append({
            "id": msg_id,
            "timestamp": timestamp,
            "sender": sender.strip(),
            "raw_text": msg.strip(),
            "normalized_text": normalized,
        })

        msg_id += 1

    return parsed
