#!/usr/bin/env python
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

from app.services.ai_engine import ai_analyzer

print("=" * 50)
print("Testing sentiment analyzer...")
print("=" * 50)

text = "tolol"
print(f"\nAnalyzing: '{text}'")
result = ai_analyzer.analyze(text)
print(f"Result: {result}")

print("\n" + "=" * 50)
text2 = "bagus sekali"
print(f"Analyzing: '{text2}'")
result2 = ai_analyzer.analyze(text2)
print(f"Result: {result2}")
