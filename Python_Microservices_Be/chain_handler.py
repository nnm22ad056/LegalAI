# backend/chain_handler.py

# CHANGE 1: Import RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 
from langchain_core.output_parsers import StrOutputParser
from llm_interface import get_llm
import re

# --- RAG Chain Prompts ---
RAG_PROMPT_TEMPLATE = """
CONTEXT:
{context}

QUERY:
{question}

Based *only* on the provided CONTEXT from the legal document, answer the QUERY.
If the CONTEXT does not contain information to answer the QUERY, state that the information is not found in the provided document.
Do not use any prior knowledge. Your answer should be concise and directly address the query.

Answer:
"""

SUMMARIZATION_RAG_PROMPT_TEMPLATE = """
You are a legal assistant AI. Based *only* on the following CONTEXT retrieved from a document, provide a concise summary that captures the main points, arguments, facts, or decisions presented.

Focus on identifying:
- The primary parties involved.
- The core legal or factual issue being discussed.
- Key facts or claims highlighted.
- Any holdings or significant legal reasoning mentioned.

Guidelines:
- Stick strictly to the information within the provided CONTEXT.
- Do not infer or add external knowledge.
- Aim for a brief, coherent paragraph (3-6 sentences).

CONTEXT:
{context}

USER'S QUERY (which asked for a summary):
{question}

Concise Summary:
"""

def get_rag_chain(retriever):
    """
    Creates and returns a RAG chain that dynamically selects a prompt.
    """
    llm = get_llm()

    def format_docs(docs):
        # Also include metadata for source tracking
        return "\n\n".join(f"Source: Page {doc.metadata.get('page', 'N/A')}\nContent: {doc.page_content}" for doc in docs)

    def select_prompt(input_dict):
        # Check if the question asks for a summary
        question = input_dict.get("question", "").lower()
        if re.search(r'\b(summarize|summary|tl;dr|gist)\b', question):
            return ChatPromptTemplate.from_template(SUMMARIZATION_RAG_PROMPT_TEMPLATE)
        return ChatPromptTemplate.from_template(RAG_PROMPT_TEMPLATE)

    # The chain now first prepares the input, then passes it to the prompt selector
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        # CHANGE 2: Wrap the prompt selection logic in RunnableLambda
        | RunnableLambda(select_prompt)
        | llm
        | StrOutputParser()
    )
    return rag_chain

# --- Direct LLM Chain ---
DIRECT_LLM_PROMPT_TEMPLATE = """
You are an AI assistant specialized in Indian Legal Law, based on your custom training.
Answer the following question comprehensively and accurately, drawing upon your knowledge of Indian legal statutes, case law, and principles.

Question: {question}

Answer:
"""

def get_direct_llm_chain():
    """
    Creates and returns a chain that queries the LLM directly.
    """
    llm = get_llm()
    prompt = ChatPromptTemplate.from_template(DIRECT_LLM_PROMPT_TEMPLATE)
    
    direct_chain = (
        {"question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return direct_chain