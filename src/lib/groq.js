let isProcessing = false;
let rateLimitedUntil = null;

export function getTimeUntilReady() {
  if (!rateLimitedUntil) return 0;
  const remaining = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

export async function callGroq({ messages, max_tokens = 1000, temperature = 0.7, systemPrompt = null }) {
  if (systemPrompt) {
    messages = [{ role: 'system', content: systemPrompt }, ...messages]
  }
  try {
    const res = await fetch('/api/groq/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens,
        temperature
      })
    })
    const data = await res.json()
    return { 
      text: data.choices?.[0]?.message?.content || '', 
      error: null 
    }
  } catch (err) {
    return { text: '', error: err.message }
  }
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
    const response = await fetch('/api/groq/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
        return "API key error. Check proxy configuration.";
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
