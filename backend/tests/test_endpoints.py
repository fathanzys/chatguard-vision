# tests/test_endpoints.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, get_db, SessionLocal
from slowapi import Limiter
from slowapi.util import get_remote_address

# Setup test database
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Mock the limiter so tests don't fail due to rate limiting
app.state.limiter = Limiter(key_func=get_remote_address, default_limits=["1000/minute"])

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Backend is running"}

def test_audit_text_empty():
    response = client.post("/api/audit/text", json={"text": "   "})
    assert response.status_code == 422 # Pydantic validation error

def test_audit_text_invalid_payload():
    response = client.post("/api/audit/text", json={"wrong_key": "hello"})
    assert response.status_code == 422 

def test_audit_text_success():
    payload = {
        "text": "[10:00] user1: halo semua\n[10:01] user2: woy t0l0l"
    }
    response = client.post("/api/audit/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Assert Meta
    assert "meta" in data
    assert data["meta"]["total_messages"] == 2
    assert data["meta"]["toxic_messages"] >= 1 # Because of 't0l0l'
    assert data["meta"]["session_id"] is not None
    
    # Assert Data properties
    messages = data["data"]
    assert len(messages) == 2
    assert messages[1]["analysis"]["is_toxic"] == True

def test_history_list():
    response = client.get("/api/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_history_detail_not_found():
    response = client.get("/api/history/999999")
    assert response.status_code == 404
