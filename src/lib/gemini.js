let isProcessing = false;
let rateLimitedUntil = null;

export function getTimeUntilReady() {
  if (!rateLimitedUntil) return 0;
  const remaining = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

async function generateText(systemPrompt, userPrompt) {
  // Cooldown guard
  const cooldown = getTimeUntilReady();
  if (cooldown > 0) {
    return `Rate limited. Please wait ${cooldown} more second${cooldown === 1 ? '' : 's'}.`;
  }

  // Concurrency guard
  if (isProcessing) {
    return "Already processing a request. Please wait.";
  }

  isProcessing = true;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        rateLimitedUntil = Date.now() + 60_000;
        isProcessing = false;
        return "Rate limit hit. I'm standing by for 60 seconds — then we're back online.";
      }
      if (response.status === 401) {
        isProcessing = false;
        return "API key error. Check that VITE_GROQ_API_KEY is set correctly in your .env file.";
      }
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    const text = data.choices[0].message.content;
    isProcessing = false;
    return text;

  } catch (error) {
    isProcessing = false;

    if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch')) {
      return "Connection error. Check your internet connection and try again.";
    }

    console.error('Groq error:', error);
    return `Something went wrong: ${error?.message || 'Unknown error'}. Try again.`;
  }
}

export { generateText };
