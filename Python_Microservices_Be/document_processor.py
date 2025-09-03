# backend/

import os
import hashlib
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import Chroma

import config

def generate_collection_name(filepath):
    """Generates a collection name from the PDF file path."""
    # We use a hash of the filename to create a unique and valid collection name
    filename = os.path.basename(filepath)
    hash_object = hashlib.sha256(filename.encode())
    return f"legal_case_{hash_object.hexdigest()[:10]}"


def load_and_embed_pdf(filepath, collection_name):
    """
    Loads a PDF, splits it into chunks, and embeds them into a Chroma vector store.
    """
    # 1. Load the document
    loader = PyMuPDFLoader(filepath)
    documents = loader.load()

    # 2. Split the document into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP
    )
    docs = text_splitter.split_documents(documents)

    # 3. Initialize the embedding model
    embeddings = HuggingFaceBgeEmbeddings(
        model_name=config.EMBEDDING_MODEL_NAME,
        model_kwargs=config.EMBEDDING_MODEL_KWARGS,
        encode_kwargs=config.EMBEDDING_ENCODE_KWARGS
    )

    # 4. Create and persist the vector store
    vector_store = Chroma.from_documents(
        docs,
        embeddings,
        collection_name=collection_name,
        persist_directory=config.CHROMA_PERSIST_DIRECTORY
    )
    
    print(f"Successfully processed and embedded '{os.path.basename(filepath)}' into collection '{collection_name}'.")
    return vector_store