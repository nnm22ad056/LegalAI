# backend/prompt_manager.py

import json
from functools import lru_cache
from pathlib import Path

# --- Configuration ---
PROMPT_TEMPLATES_PATH = Path(__file__).parent / "prompts/legal_prompts.json"

@lru_cache(maxsize=1)
def load_prompt_templates() -> dict:
    """
    Loads prompt templates from the JSON file.
    Uses lru_cache to load the file only once from disk, improving performance.
    """
    if not PROMPT_TEMPLATES_PATH.exists():
        raise FileNotFoundError(f"Prompt templates file not found at: {PROMPT_TEMPLATES_PATH}")
    
    # IMPORTANT: Add encoding="utf-8" to handle special characters (₹, etc.)
    with open(PROMPT_TEMPLATES_PATH, "r", encoding="utf-8") as f:
        templates = json.load(f)
    
    print("Prompt templates loaded and cached successfully.")
    return templates