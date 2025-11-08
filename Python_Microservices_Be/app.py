# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Import our new modules
import config
from document_processor import load_and_embed_pdf, generate_collection_name
from retriever_factory import get_retriever
from chain_handler import get_rag_chain, get_direct_llm_chain
from validator_pdf import validate_court_case_pdf,extract_text_for_validation
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
        validation_result = validate_court_case_pdf(filepath)
        if not validation_result["is_valid"]:
            print(f"Validation FAILED for {file.filename}. Confidence: {validation_result['confidence']}, Hits: {validation_result['keywords_matched']}")
            os.remove(filepath)
            return jsonify({
                    "error": "File does not appear to be a valid legal document. Please upload a court case, judgment, or similar file.",
                    "details": {
                        "confidence": validation_result['confidence'],
                        "keywords_matched": validation_result['keywords_matched']
                    }
                })
        print(f"Validation PASSED for {file.filename}. Confidence: {validation_result['confidence']}, Hits: {validation_result['keywords_matched']}")
        
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
    collection_name = data.get('collection_name')
    prompt_type = data.get('prompt_type', None)

    if not query or not collection_name:
        return jsonify({"error": "Missing 'question' or 'collection_name'"}), 400
    
    try:
        retriever = get_retriever(collection_name)
        rag_chain = get_rag_chain(retriever)

        input_payload = {"question": query, "prompt_type": prompt_type}
        answer = rag_chain.invoke(input_payload)
        
        # --- CORRECTED WAY TO GET SOURCES ---
        # We re-invoke the retriever to get the final list of documents
        # that were actually used to generate the answer.
        retrieved_docs = retriever.invoke(query)
        # ------------------------------------
        
        sources = [
            {"content": doc.page_content, "page": doc.metadata.get('page', 'N/A')} 
            for doc in retrieved_docs
        ]

        response_data = {
            "answer": answer, 
            "sources": sources,
            "prompt_type_used": prompt_type if prompt_type else "default_fallback"
        }
        return jsonify(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)