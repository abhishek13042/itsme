let rateLimitedUntil = null

export function getTimeUntilReady() {
  if (!rateLimitedUntil) return 0
  return Math.max(0, rateLimitedUntil - Date.now())
}

export async function callGroq({ 
  messages, 
  max_tokens = 1000, 
  temperature = 0.7, 
  systemPrompt = null 
}) {
  if (systemPrompt) {
    messages = [
      { role: 'system', content: systemPrompt }, 
      ...messages
    ]
  }
  try {
    const res = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens,
        temperature
      })
    })
    if (!res.ok) {
      const err = await res.text()
      return { text: '', error: err }
    }
    const data = await res.json()
    return { 
      text: data.choices?.[0]?.message?.content || '', 
      error: null 
    }
  } catch (err) {
    return { text: '', error: err.message }
  }
}

export async function generateText(systemPrompt, userPrompt) {
  return callGroq({
    messages: [{ role: 'user', content: userPrompt }],
    systemPrompt,
    max_tokens: 1000,
    temperature: 0.7
  })
}
