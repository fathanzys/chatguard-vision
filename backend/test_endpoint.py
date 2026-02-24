#!/usr/bin/env python
import sys
sys.path.insert(0, '.')

from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)
response = client.post('/api/audit/text', json={'text': 'tolol'})
print('Status:', response.status_code)
if response.status_code == 200:
    data = response.json()
    print('Response:', data)
    print('\nAnalysis:')
    for msg in data.get('data', []):
        print(f"  - {msg['raw_text']}: {msg['analysis']}")
else:
    print('Error:', response.text)
