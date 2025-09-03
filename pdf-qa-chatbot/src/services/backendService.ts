// src/services/backendService.ts

const BACKEND_URL = 'http://127.0.0.1:5001'; 

export const uploadPdf = async (file: File): Promise<{ collection_name: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload PDF');
  }

  const data = await response.json();
  return data;
};

export const askBackend = async (
  question: string,
  type: 'rag' | 'direct',
  collection_name?: string
): Promise<{ answer: string; sources: any[] }> => {
  let apiUrl = '';
  let body: any = { question };

  if (type === 'rag') {
    apiUrl = `${BACKEND_URL}/api/ask_rag`;
    body.collection_name = collection_name;
  } else if (type === 'direct') {
    apiUrl = `${BACKEND_URL}/api/ask_direct`;
  } else {
    throw new Error('Invalid query type');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Backend API error');
  }

  const data = await response.json();
  return data;
};

export const generateChatTitle = async (prompt: string): Promise<string> => {
  // For now, we'll use a simple title generation.
  // In a real scenario, you might send this to the backend for a more sophisticated title.
  return prompt.split(' ').slice(0, 4).join(' ') + (prompt.split(' ').length > 4 ? '...' : '');
};
