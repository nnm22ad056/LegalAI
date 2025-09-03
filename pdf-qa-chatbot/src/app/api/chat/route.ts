import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, collection_name, type } = await req.json();

    if (type !== 'rag' && type !== 'direct') {
      return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
    }

    try {
      const response = await fetch(`http://127.0.0.1:5001/api/ask_${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, collection_name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ error: errorData.error || 'Backend API error' }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('API Route error:', error);
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Route parsing error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
