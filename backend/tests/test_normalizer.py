import pytest
from app.services.normalizer import normalize_text, parse_chat_log, dedupe_repeated_chars

def test_dedupe_repeated_chars():
    assert dedupe_repeated_chars("haaaalloooo") == "hallo"
    assert dedupe_repeated_chars("wkwkwkwk") == "wkwkwkwk"
    assert dedupe_repeated_chars("anjjjjjj") == "anj"

def test_normalize_text_slang_mapping():
    # Asumsi loaded slang_dict contains rules mapped
    text = normalize_text("gw mau anj2an sama elu")
    assert text != "gw mau anj2an sama elu"

def test_parse_chat_log_format():
    sample_chat = "10:30 Andi: bro lu dmn?\n10:31 Budi: lagi di warkop wkwk"
    parsed = parse_chat_log(sample_chat)
    
    assert len(parsed) == 2
    assert "Andi" in parsed[0]["sender"] or parsed[0]["sender"] == "10:30 Andi"
    assert "bro lu dmn?" in parsed[0]["raw_text"]
    assert "Budi" in parsed[1]["sender"] or parsed[1]["sender"] == "10:31 Budi"
    assert "lagi di warkop" in parsed[1]["raw_text"]
