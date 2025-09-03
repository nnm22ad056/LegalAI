# backend/qa_core.py

import chromadb
from sentence_transformers import SentenceTransformer, CrossEncoder
import requests
import json

# Initialize ChromaDB client
# This will create a persistent database in the './chroma_db' directory
client = chromadb.PersistentClient(path="./chroma_db")

# Initialize the embedding model
# This model is used to convert text chunks into numerical vectors
embedding_model = SentenceTransformer('BAAI/bge-base-en-v1.5')

# Initialize the reranker model
# This model is used to improve the relevance of search results
reranker_model = CrossEncoder('BAAI/bge-reranker-base')

# Get or create the ChromaDB collection
# A collection is like a table in a traditional database
collection = client.get_or_create_collection(name="pdf_qa_collection")

def store_chunks(chunks, metadata):
    """
    Embeds text chunks and stores them in ChromaDB.
    """
    if not chunks:
        return

    # Generate embeddings for each chunk
    embeddings = embedding_model.encode(chunks, convert_to_tensor=False).tolist()
    
    # Create unique IDs for each chunk
    ids = [f"{metadata['filename']}_chunk_{i}" for i in range(len(chunks))]
    
    # Prepare metadata for each chunk, including the original text
    metadatas = [{
        "source": metadata['filename'],
        "page_number": metadata['page_numbers'][i],
        "text": chunks[i] # Store the original text in metadata
    } for i in range(len(chunks))]

    # Add the embeddings, metadata, and IDs to the collection
    collection.add(
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )
    print(f"Successfully stored {len(chunks)} chunks for {metadata['filename']}.")

def retrieve_and_rerank(query, top_k=20, rerank_top_n=5):
    """
    Retrieves relevant chunks from ChromaDB and reranks them.
    """
    # 1. Retrieve initial results from ChromaDB
    query_embedding = embedding_model.encode(query, convert_to_tensor=False).tolist()
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    if not results['metadatas'][0]:
        return []

    retrieved_docs = [meta['text'] for meta in results['metadatas'][0]]
    
    # 2. Rerank the results
    # Create pairs of [query, document] for the reranker model
    rerank_pairs = [[query, doc] for doc in retrieved_docs]
    
    # Get scores from the reranker model
    scores = reranker_model.predict(rerank_pairs)

    # 3. Combine documents with their scores and sort
    doc_scores = list(zip(results['metadatas'][0], scores))
    doc_scores.sort(key=lambda x: x[1], reverse=True)

    # 4. Return the top N reranked results
    reranked_results = [doc for doc, score in doc_scores[:rerank_top_n]]
    
    return reranked_results

def generate_answer(query, context):
    """
    Generates an answer using the LLM with the provided context.
    """
    # Format the context into a single string
    context_str = "\n\n".join([f"Source: {item['source']}, Page: {item['page_number']}\nContent: {item['text']}" for item in context])

    # Create the prompt for the LLM
    prompt = f"""
    You are a specialized AI assistant for answering questions based on the content of provided PDF documents.
    Your sole purpose is to answer the user's question accurately based ONLY on the context provided.
    Do not hallucinate or use any information outside of the context.
    Always cite the source document and page number for the information you use.

    CONTEXT:
    {context_str}

    QUESTION:
    {query}

    ANSWER:
    """

    # Ollama API endpoint
    url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False # We'll wait for the full response
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes
        
        # Parse the JSON response
        response_data = response.json()
        
        return {
            "answer": response_data.get("response", "No response from model."),
            "sources": context
        }
    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama API: {e}")
        return {
            "answer": "Failed to get a response from the language model.",
            "sources": []
        }