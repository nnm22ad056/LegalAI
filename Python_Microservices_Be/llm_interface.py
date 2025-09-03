# backend/llm_interface.py

from langchain_ollama import ChatOllama
import config

# Initialize LLM once globally
_llm_instance = None

def get_llm():
    """
    Initializes and returns the ChatOllama instance.
    Ensures the LLM is initialized only once.
    """
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = ChatOllama(
            model=config.LLM_MODEL_NAME,
            base_url=config.OLLAMA_BASE_URL
        )
    return _llm_instance
