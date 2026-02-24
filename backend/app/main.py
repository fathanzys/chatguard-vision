# app/main.py
import time
import os
import sys
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import List

# Load environment variables
load_dotenv()

# ============================================================
# LOGGING
# ============================================================
logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger(__name__)

# Windows Asyncio Fix
if sys.platform == "win32":
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Imports (clean — no fragile try/except path hacks)
from app.services.ocr_service import extract_text_from_image
from app.services.normalizer import parse_chat_log
from app.services.ai_engine import ai_analyzer
from app.database import create_db, get_db, AuditSession, AuditMessage
from app.schemas import (
    TextAuditRequest,
    AuditResponse,
    AuditMeta,
    MessageResult,
    AnalysisResult,
    HistorySession,
    HistoryDetail,
)

# ============================================================
# RATE LIMITER
# ============================================================
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# ============================================================
# LIFESPAN (replaces deprecated @app.on_event)
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — creating database tables...")
    create_db()
    logger.info("Database ready.")
    yield
    logger.info("Shutting down.")

# ============================================================
# APP SETUP
# ============================================================
app = FastAPI(
    title="ChatGuard Vision API",
    description="Indonesian chat toxicity detection API",
    version="2.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow only from configured origin (env var or localhost:3000)
ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# ============================================================
# SHARED HELPER — DRY: single analysis loop
# ============================================================

def _process_messages(chats: List[dict]) -> tuple[List[dict], int]:
    """
    Run AI analysis on a list of parsed chat messages.
    Returns (result_data, toxic_count).
    """
    result_data = []
    toxic_count = 0

    for c in chats:
        ai = ai_analyzer.analyze(c.get("normalized_text", ""))
        row = {**c, "analysis": ai}
        if ai.get("is_toxic"):
            toxic_count += 1
        result_data.append(row)

    return result_data, toxic_count


def _save_to_db(
    db: Session,
    source: str,
    result_data: List[dict],
    toxic_count: int,
    processing_time: float,
) -> int:
    """Persist audit results to database, return session_id."""
    total = len(result_data)
    safety_score = int(100 - ((toxic_count / total) * 100)) if total > 0 else 100

    session = AuditSession(
        source=source,
        total_messages=total,
        toxic_messages=toxic_count,
        safety_score=safety_score,
        processing_time_seconds=round(processing_time, 2),
    )
    db.add(session)
    db.flush()  # get session.id

    for item in result_data:
        analysis = item.get("analysis", {})
        db.add(AuditMessage(
            session_id=session.id,
            msg_order=item.get("id", 0),
            sender=item.get("sender", ""),
            timestamp=item.get("timestamp", ""),
            raw_text=item.get("raw_text", ""),
            normalized_text=item.get("normalized_text", ""),
            label=analysis.get("label", "neutral"),
            score=analysis.get("score", 0.0),
            is_toxic=analysis.get("is_toxic", False),
        ))

    db.commit()
    return session.id


def _build_response(result_data: List[dict], toxic_count: int, processing_time: float, session_id: int) -> dict:
    total = len(result_data)
    safety_score = int(100 - ((toxic_count / total) * 100)) if total > 0 else 100
    return {
        "meta": {
            "total_messages": total,
            "toxic_messages": toxic_count,
            "safety_score": safety_score,
            "processing_time_seconds": round(processing_time, 2),
            "session_id": session_id,
        },
        "data": result_data,
    }


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    return {"status": "ok", "service": "ChatGuard Vision API", "version": "2.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


@app.post("/api/audit/upload", response_model=AuditResponse)
@limiter.limit("10/minute")
async def audit_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    start = time.time()

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar valid (JPG/PNG)")

    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran file maksimal 5MB")

    try:
        content = await file.read()
        raw_text = extract_text_from_image(content)

        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Tidak ada teks terbaca pada gambar. Coba gambar yang lebih jelas.")

        chats = parse_chat_log(raw_text)
        if not chats:
            raise HTTPException(status_code=422, detail="Tidak dapat mem-parsing format chat. Pastikan gambar berisi percakapan.")

        result_data, toxic_count = _process_messages(chats)
        elapsed = time.time() - start
        session_id = _save_to_db(db, "image", result_data, toxic_count, elapsed)

        return _build_response(result_data, toxic_count, elapsed, session_id)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing image upload")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat memproses gambar. Silakan coba lagi.")


@app.post("/api/audit/text", response_model=AuditResponse)
@limiter.limit("30/minute")
async def audit_text(
    request: Request,
    payload: TextAuditRequest,
    db: Session = Depends(get_db),
):
    start = time.time()

    try:
        chats = parse_chat_log(payload.text)
        if not chats:
            raise HTTPException(status_code=422, detail="Tidak dapat mem-parsing format chat dari teks yang diberikan.")

        result_data, toxic_count = _process_messages(chats)
        elapsed = time.time() - start
        session_id = _save_to_db(db, "text", result_data, toxic_count, elapsed)

        return _build_response(result_data, toxic_count, elapsed, session_id)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing text audit")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan saat menganalisis teks. Silakan coba lagi.")


@app.get("/api/history", response_model=List[HistorySession])
@limiter.limit("60/minute")
def get_history(
    request: Request,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Return list of past audit sessions, newest first."""
    sessions = (
        db.query(AuditSession)
        .order_by(AuditSession.created_at.desc())
        .offset(skip)
        .limit(min(limit, 100))
        .all()
    )
    return sessions


@app.get("/api/history/{session_id}", response_model=HistoryDetail)
@limiter.limit("60/minute")
def get_history_detail(
    request: Request,
    session_id: int,
    db: Session = Depends(get_db),
):
    """Return full detail of a specific audit session including all messages."""
    session = db.query(AuditSession).filter(AuditSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Sesi audit #{session_id} tidak ditemukan.")

    messages = [
        MessageResult(
            id=m.msg_order,
            timestamp=m.timestamp,
            sender=m.sender,
            raw_text=m.raw_text,
            normalized_text=m.normalized_text,
            analysis=AnalysisResult(label=m.label, score=m.score, is_toxic=m.is_toxic),
        )
        for m in sorted(session.messages, key=lambda x: x.msg_order)
    ]

    return HistoryDetail(
        id=session.id,
        source=session.source,
        created_at=session.created_at,
        total_messages=session.total_messages,
        toxic_messages=session.toxic_messages,
        safety_score=session.safety_score,
        processing_time_seconds=session.processing_time_seconds,
        messages=messages,
    )


@app.delete("/api/history/{session_id}", status_code=204)
@limiter.limit("10/minute")
def delete_history(
    request: Request,
    session_id: int,
    db: Session = Depends(get_db),
):
    """Delete a specific audit session."""
    session = db.query(AuditSession).filter(AuditSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Sesi audit #{session_id} tidak ditemukan.")
    db.delete(session)
    db.commit()