# backend/retriever_factory.py

from langchain_classic.retrievers import MultiQueryRetriever
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
# ---------------------------------------------------------

from langchain_core.retrievers import BaseRetriever
from langchain_core.prompts import ChatPromptTemplate
from FlagEmbedding import FlagReranker
from typing import List
from pydantic import Field, ConfigDict
from langchain_core.documents import Document

from llm_interface import get_llm
import config

# A more powerful prompt for the MultiQueryRetriever to force diversity
QUERY_GENERATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an AI language model assistant. Your task is to generate five "
               "different versions of the given user question to retrieve relevant documents from "
               "a vector database. By generating multiple perspectives on the user question, "
               "your goal is to help the user overcome some of the limitations of distance-based "
               "similarity search. Provide these alternative questions separated by newlines."),
    ("user", "Original question: {question}")
])

class CustomRerankerRetriever(BaseRetriever):
    """Custom retriever that inherits from BaseRetriever, uses a reranker, and handles deduplication."""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    base_retriever: BaseRetriever = Field(exclude=True)
    reranker_model_name: str
    top_n: int = 5
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        object.__setattr__(self, '_reranker', FlagReranker(self.reranker_model_name, use_fp16=True))
    
    # --- 2. CORRECT THE TYPE HINT HERE ---
    def _get_relevant_documents(self, query: str, **kwargs) -> List[Document]:
    # -------------------------------------
        """The required method for BaseRetriever, handles the full RAG pipeline."""
        docs = self.base_retriever.invoke(query)
        if not docs: return []
        
        seen_content = set()
        unique_docs = []
        for doc in docs:
            if doc.page_content not in seen_content:
                seen_content.add(doc.page_content)
                unique_docs.append(doc)
        
        if not unique_docs: return []
        
        pairs = [[query, doc.page_content] for doc in unique_docs]
        scores = self._reranker.compute_score(pairs)
        
        if not isinstance(scores, list): scores = [scores]
        
        doc_score_pairs = list(zip(unique_docs, scores))
        doc_score_pairs.sort(key=lambda x: x[1], reverse=True)
        
        reranked_docs = [doc for doc, score in doc_score_pairs[:self.top_n]]
        print(f"DEBUG: Reranked from {len(unique_docs)} unique docs down to {len(reranked_docs)}.")
        return reranked_docs

def get_retriever(collection_name: str) -> BaseRetriever:
    """Creates a robust retriever using MultiQuery for diversity and a Custom Reranker for relevance."""
    embeddings = HuggingFaceBgeEmbeddings(
        model_name=config.EMBEDDING_MODEL_NAME,
        model_kwargs=config.EMBEDDING_MODEL_KWARGS,
        encode_kwargs=config.EMBEDDING_ENCODE_KWARGS
    )
    
    vector_store = Chroma(
        persist_directory=config.CHROMA_PERSIST_DIRECTORY,
        embedding_function=embeddings,
        collection_name=collection_name
    )

    base_retriever = vector_store.as_retriever(search_kwargs={"k": 50})
    llm = get_llm()

    multi_query_retriever = MultiQueryRetriever.from_llm(
        retriever=base_retriever,
        llm=llm,
        prompt=QUERY_GENERATION_PROMPT
    )

    final_retriever = CustomRerankerRetriever(
        base_retriever=multi_query_retriever,
        reranker_model_name=config.CROSS_ENCODER_MODEL_NAME,
        top_n=config.RERANK_TOP_N
    )
    
    return final_retriever