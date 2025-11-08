
# backend/chain_handler.py

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter

from llm_interface import get_llm
from prompt_manager import load_prompt_templates

def get_rag_chain(retriever):
    """
    Creates a RAG chain that dynamically selects a prompt based on 'prompt_type'
    and falls back to a default prompt for general questions.
    """
    llm = get_llm()
    prompt_templates = load_prompt_templates()

    def format_docs(docs):
        """Formats the retrieved documents into a single string."""
        if not docs:
            print("WARNING: No documents retrieved!")
            return "No relevant documents found."
        formatted = "\n\n".join(f"Source: Page {doc.metadata.get('page', 'N/A')}\nContent: {doc.page_content}" for doc in docs)
        print(f"DEBUG: Formatted {len(docs)} documents, total length: {len(formatted)}")
        return formatted

    def get_prompt_template(input_dict):
        """Selects the correct prompt template based on the input."""
        prompt_type = input_dict.get("prompt_type")
        
        # Priority 1: Use a dynamic prompt if a valid type is provided.
        if prompt_type and prompt_type in prompt_templates:
            template_info = prompt_templates[prompt_type]
            # This is the template for specialized tasks
            return ChatPromptTemplate.from_template(
                "CONTEXT:\n---\n{context}\n---\n\n"
                "USER'S REQUEST:\n---\n{question}\n---\n\n"
                f"TASK:\n---\n{template_info['prompt_template']}\n---"
            )
        
        # Priority 2: Use the default prompt for general Q&A.
        return ChatPromptTemplate.from_template(
            "CONTEXT:\n{context}\n\n"
            "QUERY:\n{question}\n\n"
            "Based *only* on the provided CONTEXT, answer the QUERY. "
            "If the information is not found, state that. Be concise.\n\n"
            "Answer:"
        )

    # --- Assemble the Full Chain ---
    # This design uses a RunnableLambda to dynamically select and format the prompt
    def format_prompt(input_dict):
        """Get the prompt template, format it, and return the formatted prompt"""
        prompt_template = get_prompt_template(input_dict)
        # Format the prompt with context and question
        try:
            formatted = prompt_template.format_messages(
                context=input_dict.get("context", ""),
                question=input_dict.get("question", "")
            )
            # Debug: print the formatted prompt
            print("=" * 80)
            print("FORMATTED PROMPT:")
            for i, msg in enumerate(formatted):
                print(f"Message {i}: Type={msg.type}, Content length={len(msg.content)}")
                print(f"Content preview: {msg.content[:200]}...")
            print("=" * 80)
            return formatted
        except Exception as e:
            print(f"Error formatting prompt: {e}")
            print(f"Input dict keys: {input_dict.keys()}")
            print(f"Context length: {len(input_dict.get('context', ''))}")
            raise
    
    def debug_llm_response(response):
        """Debug function to check LLM response"""
        print("=" * 80)
        print("LLM RESPONSE (BEFORE PARSER):")
        print(f"Response type: {type(response)}")
        if hasattr(response, 'content'):
            content = response.content
            print(f"Response content type: {type(content)}")
            print(f"Response content: {content[:500] if content else 'EMPTY'}")
            print(f"Response content length: {len(content) if content else 0}")
            if not content or len(content.strip()) == 0:
                print("WARNING: LLM returned empty content!")
        else:
            print(f"Response: {str(response)[:500]}")
        print("=" * 80)
        return response
    
    def ensure_string_output(response):
        """Ensure we extract string content from the response"""
        # StrOutputParser should handle this, but as a safety measure
        if isinstance(response, str):
            return response
        elif hasattr(response, 'content'):
            content = response.content
            if content is None:
                return ""
            return str(content)
        else:
            return str(response)
    
    full_chain = (
        {
            # 1. Retrieve context based on the 'question'.
            "context": itemgetter("question") | retriever | format_docs,
            # 2. Pass the original 'question' and 'prompt_type' through.
            "question": itemgetter("question"),
            "prompt_type": itemgetter("prompt_type")
        }
        # 3. Format the prompt with the retrieved context
        | RunnableLambda(format_prompt)
        # 4. Pass the formatted messages to the LLM.
        | llm
        # 5. Debug the LLM response
        | RunnableLambda(debug_llm_response)
        # 6. Parse the output to a string.
        | StrOutputParser()
        # 7. Ensure we have a string (safety check)
        | RunnableLambda(ensure_string_output)
    )

    return full_chain

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