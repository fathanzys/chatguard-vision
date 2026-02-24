# app/schemas.py
"""
Pydantic request and response models for ChatGuard Vision API.
Using Pydantic for automatic validation, serialization, and OpenAPI documentation.
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


# ============================================================
# REQUEST MODELS
# ============================================================

class TextAuditRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50_000, description="Raw chat log text")

    @field_validator("text")
    @classmethod
    def must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be empty or whitespace only")
        return v


# ============================================================
# RESPONSE MODELS
# ============================================================

class AnalysisResult(BaseModel):
    label: str
    score: float
    is_toxic: bool


class MessageResult(BaseModel):
    id: int
    timestamp: str
    sender: str
    raw_text: str
    normalized_text: str
    analysis: AnalysisResult


class AuditMeta(BaseModel):
    total_messages: int
    toxic_messages: int
    safety_score: int
    processing_time_seconds: float
    session_id: Optional[int] = None  # filled after DB save


class AuditResponse(BaseModel):
    meta: AuditMeta
    data: List[MessageResult]


# ============================================================
# HISTORY RESPONSE MODELS
# ============================================================

class HistorySession(BaseModel):
    id: int
    source: str          # "text" or "image"
    created_at: datetime
    total_messages: int
    toxic_messages: int
    safety_score: int
    processing_time_seconds: float

    class Config:
        from_attributes = True


class HistoryDetail(HistorySession):
    messages: List[MessageResult]
