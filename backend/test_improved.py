#!/usr/bin/env python
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s - %(message)s',
    stream=sys.stdout
)

from app.services.ai_engine import ai_analyzer

test_messages = [
    "tolol",  # Should be NEGATIVE + TOXIC
    "bagus sekali",  # Should be POSITIVE
    "sebenernya gue kangen nongkrong aja, lu jarang muncul skrng",  # Should be adjusted to NEUTRAL (positive context: kangen)
    "iya bro sori, gue lagi hectic bgt… tapi lu tetep temen gue lah",  # Should be NEUTRAL (apology + teman)
    "hmm… ya lumayan sih wkwk",  # Should be POSITIVE
    "love u kontol",  # Should check if positive context overrides crude language
    "tai juga gas nongkrong sabtu",  # Crude + positive activity
    "yaudah salah gue, gue minta maaf dah",  # Should be NEUTRAL (apology)
]

print("=" * 60)
print("IMPROVED SENTIMENT ANALYZER TEST")
print("=" * 60)

for text in test_messages:
    print(f"\nText: '{text}'")
    result = ai_analyzer.analyze(text)
    print(f"Result: {result}")

print("\n" + "=" * 60)
