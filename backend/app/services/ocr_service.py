# app/services/ocr_service.py
import os
import numpy as np
import cv2
import pytesseract

# Configure tesseract command
# Try to get from environment variable, fallback to common Windows path
TESSERACT_CMD = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# Check if file exists at the path
if os.path.exists(TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
else:
    # Try to find in PATH if explicit path doesn't exist
    print(f"⚠️ Warning: Tesseract not found at {TESSERACT_CMD}")
    print("Attempting to use system PATH...")



def preprocess_image(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Failed to decode image bytes - unsupported format or corrupted file")

    # Detect dark-mode heuristically (mean pixel value)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_val = gray.mean()
    if mean_val < 80:
        # invert if dark background
        gray = cv2.bitwise_not(gray)

    # denoise -> threshold
    denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return thresh


def extract_text_from_image(image_bytes: bytes) -> str:
    processed = preprocess_image(image_bytes)

    custom_config = r"--oem 3 --psm 6"
    try:
        text = pytesseract.image_to_string(processed, config=custom_config, lang="ind")
    except Exception:
        # fallback to default language
        text = pytesseract.image_to_string(processed, config=custom_config)

    return text or ""
