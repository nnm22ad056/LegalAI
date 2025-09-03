# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Import our new modules
import config
from document_processor import load_and_embed_pdf, generate_collection_name
from retriever_factory import get_retriever
from chain_handler import get_rag_chain, get_direct_llm_chain

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# Create a directory for file uploads
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '' or not file.filename.endswith('.pdf'):
        return jsonify({"error": "Invalid or no selected file"}), 400
        
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Generate a unique collection name for this PDF
        collection_name = generate_collection_name(filepath)
        
        # Process and embed the PDF
        load_and_embed_pdf(filepath, collection_name)
        
        # Return the unique collection_name to the frontend
        # The frontend will need to store this to ask questions about this specific PDF
        return jsonify({
            "message": f"File '{file.filename}' processed successfully.",
            "collection_name": collection_name
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500


@app.route('/api/ask_rag', methods=['POST'])
def ask_rag():
    data = request.get_json()
    query = data.get('question')
    collection_name = data.get('collection_name') # Frontend MUST send this

    if not query or not collection_name:
        return jsonify({"error": "Missing 'question' or 'collection_name'"}), 400
    
    try:
        # 1. Get the retriever for the specific document collection
        retriever = get_retriever(collection_name, use_reranker=True)

        # 2. Create the RAG chain
        rag_chain = get_rag_chain(retriever)

        # 3. Invoke the chain to get an answer
        answer = rag_chain.invoke(query)
        
        # 4. Retrieve source documents for citation
        retrieved_docs = retriever.get_relevant_documents(query)
        sources = [
            {"content": doc.page_content, "page": doc.metadata.get('page', 'N/A')} 
            for doc in retrieved_docs
        ]

        return jsonify({"answer": answer, "sources": sources})

    except Exception as e:
        # This can happen if the collection_name is invalid
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/api/ask_direct', methods=['POST'])
def ask_direct():
    data = request.get_json()
    query = data.get('question')

    if not query:
        return jsonify({"error": "Question is missing."}), 400
    
    try:
        direct_chain = get_direct_llm_chain()
        answer = direct_chain.invoke(query)
        # No sources for a direct query
        return jsonify({"answer": answer, "sources": []})
    except Exception as e:
        return jsonify({"error": f"Failed to query LLM: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)