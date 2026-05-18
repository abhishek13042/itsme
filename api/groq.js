// api/groq.js — Vercel Serverless Function
// Acts as a secure proxy to the Groq API.
// The GROQ_API_KEY env var must be set in the Vercel dashboard.
// Client calls /api/groq  →  this function calls api.groq.com

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY is not set in Vercel environment variables');
    return res.status(500).json({ error: 'Groq API key not configured on server' });
  }

  try {
    const body = req.body;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq API error:', data);
      return res.status(groqRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
