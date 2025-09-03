# Major Project: End-to-End PDF QA Chatbot

This project is an end-to-end system for querying PDF documents using a chatbot interface. It combines a modern [Next.js](https://nextjs.org/) frontend with Python microservices for document processing, retrieval, and LLM-based question answering. The system is designed for extensibility and performance, supporting scalable document ingestion and semantic search.

## Techniques Used

- **Server Components in Next.js**: Efficient rendering and data fetching ([MDN: Server Components](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)).
- **TypeScript for Type Safety**: Ensures robust code and easier refactoring ([MDN: TypeScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)).
- **Custom Hooks and Utility Functions**: Modularizes logic for reusability.
- **Python Microservices**: Decouples document processing and QA logic for scalability.
- **Chroma Vector Database**: Enables fast semantic search over document embeddings ([ChromaDB](https://www.trychroma.com/)).
- **PDF Parsing and Embedding**: Processes and indexes PDF content for retrieval.
- **LLM Integration**: Uses language models for natural language question answering.

## Notable Technologies & Libraries

- [Next.js](https://nextjs.org/) (React framework)
- [ChromaDB](https://www.trychroma.com/) (vector database)
- [LangChain](https://python.langchain.com/) (LLM orchestration)
- [FastAPI](https://fastapi.tiangolo.com/) (Python web framework)
- [PyPDF2](https://pypdf2.readthedocs.io/) (PDF parsing)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS)
- [Vercel](https://vercel.com/) (deployment platform)
- [PostCSS](https://postcss.org/) (CSS processing)
- [ESLint](https://eslint.org/) (code linting)
- [TypeScript](https://www.typescriptlang.org/) (typed JavaScript)
- [React](https://react.dev/) (UI library)

## Project Structure

```
.
├── pdf-qa-chatbot/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── lib/
├── Python_Microservices_Be/
│   ├── chroma_db_legal/
│   ├── uploads/
```

- **pdf-qa-chatbot/public/**: Contains SVG assets for UI.
- **pdf-qa-chatbot/src/app/**: Next.js app directory, includes global styles and layout.
- **pdf-qa-chatbot/src/lib/**: Utility functions for frontend logic.
- **Python_Microservices_Be/chroma_db_legal/**: ChromaDB vector store and metadata.
- **Python_Microservices_Be/uploads/**: Uploaded PDF documents for processing.

## Fonts

No custom fonts detected; uses system or default web fonts.

---

## Next.js Frontend Setup

1. **Install dependencies:**
   ```sh
   cd pdf-qa-chatbot
   npm install
   ```
2. **Run the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Python Microservices Setup

1. **Create a virtual environment:**
   ```sh
   python -m venv venv
   ```
2. **Activate the environment:**
   - On Windows:
     ```sh
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```sh
     source venv/bin/activate
     ```
3. **Install dependencies:**
   ```sh
   pip install -r Python_Microservices_Be/requirements.txt
   ```

---

## Ollama Setup & Model Preparation

1. **Install Ollama Desktop:**
   - Download and install from [Ollama Desktop](https://ollama.com/download).

2. **Download GGUF Model from Hugging Face:**
   - Visit [Indian-LegalBot-Llama-3.1-8B-GGUF](https://huggingface.co/mradermacher/Indian-LegalBot-Llama-3.1-8B-GGUF).
   - Download the recommended version: `Q4_K_S` or `Q4_K_M`.

3. **Convert GGUF Model for Ollama Compatibility:**
   - Create a `Modfile` in your model directory with the following content:
     ```
     FROM ./Indian-LegalBot-Llama-3.1-8B-Q4_K_S.gguf
     PARAMETER stop "<|eot_id|>"
     ```
   - Replace the filename with your downloaded GGUF file.
   - Build the model for Ollama:
     ```sh
     ollama create indian-legalbot -f Modfile
     ```
   - The model is now available for use with Ollama.

4. **Update Python Microservices Configuration:**
   - Open [`Python_Microservices_Be/config.py`](Python_Microservices_Be/config.py).
   - Set the model name:
     ```python
     LLM_MODEL_NAME = "indian-legalbot"
     ```
   - This ensures your microservices use the correct Ollama model.

---

...

## Next.js Frontend Setup

1. **Navigate to the frontend directory:**
   ```sh
   cd pdf-qa-chatbot
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000)
...


...

## Starting Python Microservices

1. **Activate your virtual environment:**
   - On Windows:
     ```sh
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```sh
     source venv/bin/activate
     ```

2. **Start the microservices:**
   ```sh
   flask run --port=5001
   ```

## API Endpoints

### 1. `POST /api/upload`

**BODY Example:**
```json
{
    "collection_name": "legal_case_a1b2c3d4e5",
    "message": "File 'sample_case.pdf' processed successfully."
}
```

### 2. `POST /api/ask_rag`

**BODY Example:**
```json
{
  "question": "What is the main subject of this document?",
  "collection_name": "legal_case_a1b2c3d4e5"
}

```


### 3. `POST api/ask_direct`

**BODY Example:**
```json
{
  "question": "Explain the concept of 'audi alteram partem' in Indian law."
}
```

...

