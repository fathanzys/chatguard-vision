# tests/test_ai_engine.py
import pytest
from app.services.ai_engine import SentimentEngine

@pytest.fixture
def engine():
    return SentimentEngine()

def test_normalize_leet(engine):
    assert engine._normalize_leet("t0l0l") == "tolol"
    assert engine._normalize_leet("4njing") == "anjing"
    assert engine._normalize_leet("b4ngs4t") == "bangsat"

def test_has_positive_context(engine):
    assert engine._has_positive_context("lu tuh bego, tapi gw sayang") == True
    assert engine._has_positive_context("anjing lu") == False
    assert engine._has_positive_context("keren banget") == True

def test_detect_toxicity_hard(engine):
    res = engine._detect_toxicity("dasar t0l0l lu")
    assert res["is_toxic"] == True
    assert res["level"] == "hard"

def test_detect_toxicity_crude(engine):
    res = engine._detect_toxicity("tai lu bro")
    assert res["is_toxic"] == False
    assert res["level"] == "crude"

def test_detect_toxicity_mild(engine):
    res = engine._detect_toxicity("nyebelin banget lu")
    assert res["is_toxic"] == False
    assert res["level"] == "mild"
