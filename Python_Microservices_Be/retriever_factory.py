# backend/

from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

import config

def get_retriever(collection_name, use_reranker=True):
    """
    Creates a retriever from a persisted ChromaDB collection, with an optional reranker.
    """
    # Initialize the embedding model (needed to connect to Chroma)
    embeddings = HuggingFaceBgeEmbeddings(
        model_name=config.EMBEDDING_MODEL_NAME,
        model_kwargs=config.EMBEDDING_MODEL_KWARGS,
        encode_kwargs=config.EMBEDDING_ENCODE_KWARGS
    )
    
    # Connect to the existing vector store
    vector_store = Chroma(
        persist_directory=config.CHROMA_PERSIST_DIRECTORY,
        embedding_function=embeddings,
        collection_name=collection_name
    )

    # Create a base retriever
    retriever = vector_store.as_retriever(search_kwargs={"k": 10}) # Retrieve more docs initially for reranking

    if not use_reranker:
        return retriever

    # Initialize the reranker model
    cross_encoder = HuggingFaceCrossEncoder(model_name=config.CROSS_ENCODER_MODEL_NAME)
    compressor = CrossEncoderReranker(model=cross_encoder, top_n=config.RERANK_TOP_N)
    
    # Create the compression retriever
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=retriever
    )
    
    return compression_retriever