# backend/config.py

# LLM Configuration
OLLAMA_BASE_URL = "http://localhost:11434"  # Default Ollama API URL
# Replace with the actual name of your custom-trained Indian legal LLM in Ollama
LLM_MODEL_NAME = "indian-legalbot" # Using llama3 as a stand-in for "LLM-Legal-M"

# Embedding Model Configuration
EMBEDDING_MODEL_NAME = "BAAI/bge-base-en-v1.5"
EMBEDDING_MODEL_KWARGS = {'device': 'cpu'} # Use 'cuda' if you have a GPU
EMBEDDING_ENCODE_KWARGS = {'normalize_embeddings': True}

# Reranker Configuration
CROSS_ENCODER_MODEL_NAME = "BAAI/bge-reranker-base"
RERANK_TOP_N = 3  # Number of documents to return after reranking

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY = "./chroma_db_legal"
# The collection name will be generated dynamically based on the PDF filename

# Document Processing Configuration
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100