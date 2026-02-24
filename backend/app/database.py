# app/database.py
"""
SQLAlchemy database setup using SQLite for audit history persistence.
"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func

# Resolve DB path relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'audit.db')}")

engine = create_engine(
    DB_PATH,
    connect_args={"check_same_thread": False},  # Needed for SQLite + FastAPI
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ============================================================
# MODELS
# ============================================================

class AuditSession(Base):
    """Represents one audit request (the whole conversation)."""
    __tablename__ = "audit_sessions"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(10), nullable=False)          # "text" or "image"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    total_messages = Column(Integer, nullable=False)
    toxic_messages = Column(Integer, nullable=False)
    safety_score = Column(Integer, nullable=False)
    processing_time_seconds = Column(Float, nullable=False)

    messages = relationship("AuditMessage", back_populates="session", cascade="all, delete-orphan")


class AuditMessage(Base):
    """Represents a single parsed message within an audit session."""
    __tablename__ = "audit_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("audit_sessions.id", ondelete="CASCADE"), nullable=False)
    msg_order = Column(Integer, nullable=False)          # original order in conversation
    sender = Column(String(255), nullable=False)
    timestamp = Column(String(50), nullable=False)
    raw_text = Column(Text, nullable=False)
    normalized_text = Column(Text, nullable=False)
    label = Column(String(20), nullable=False)           # positive/negative/neutral
    score = Column(Float, nullable=False)
    is_toxic = Column(Boolean, nullable=False)

    session = relationship("AuditSession", back_populates="messages")


# ============================================================
# HELPERS
# ============================================================

def create_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency: yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
