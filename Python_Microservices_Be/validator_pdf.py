# backend/pdf_validator.py

import fitz  # PyMuPDF

# List of keywords that are strong indicators of a legal document
LEGAL_KEYWORDS = [
    "in the high court of",
    "supreme court of india",
    "district court",
    "metropolitan magistrate",
    "civil judge",
    "case no", "case number",
    "application no",
    "petitioner",
    "respondent",
    "appellant",
    "defendant",
    "plaintiff",
    "judgment",
    "order",
    "coram",
    "hon'ble", "honourable",
    "learned counsel",
    "advocate for the petitioner",
    "advocate for the respondent",
    "section", "article",
    "under section",
    "the indian penal code",
    "code of civil procedure",
    "the constitution of india",
    "fir no",
]

# This is the simplified text extraction function without OCR
def extract_text_for_validation(file_path: str) -> str:
    text = ""
    try:
        with fitz.open(file_path) as doc:
            # Limit the number of pages to check for efficiency
            page_count = min(3, doc.page_count) 
            for i in range(page_count):
                page = doc.load_page(i)
                text += page.get_text("text")
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return "" # Return empty string on failure

    return text.lower()


def validate_court_case_pdf(file_path: str) -> dict:
    text = extract_text_for_validation(file_path)

    if not text.strip():
        return {
            "is_valid": False,
            "confidence": 0,
            "keywords_matched": 0,
            "reason": "Document contains no extractable text."
        }

    # 2. Count how many unique keywords are present in the text
    matched_keywords = {k for k in LEGAL_KEYWORDS if k in text}
    hits = len(matched_keywords)
    
    # 3. Calculate a confidence score
    # We use a simple ratio of matched keywords to a threshold number.
    # A threshold of 5-6 keywords is a good indicator. Let's use 5.
    CONFIDENCE_THRESHOLD_HITS = 5
    confidence = min(1.0, hits / CONFIDENCE_THRESHOLD_HITS)

    # 4. Determine if the document is valid
    # We can use a simple hit count. If it has at least 3 distinct keywords, it's likely valid.
    IS_VALID_THRESHOLD_HITS = 3
    is_valid = hits >= IS_VALID_THRESHOLD_HITS

    return {
        "is_valid": is_valid,
        "confidence": round(confidence, 2),
        "keywords_matched": hits,
    }