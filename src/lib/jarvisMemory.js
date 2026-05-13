import { supabase } from './supabase'

export async function loadMemories() {
  try {
    const { data } = await supabase
      .from('jarvis_memory')
      .select('*')
      .order('importance', { ascending: false })
      .order('last_referenced', { ascending: false })
      .limit(20)
    return data || []
  } catch (err) {
    console.error('loadMemories error:', err)
    return []
  }
}

export async function saveMemory(content, type = 'insight', importance = 5) {
  try {
    await supabase.from('jarvis_memory').insert({
      memory_type: type,
      content,
      importance,
      created_at: new Date().toISOString(),
      last_referenced: new Date().toISOString()
    })
  } catch (err) {
    console.error('saveMemory error:', err)
  }
}

export async function extractAndSaveMemories(conversation) {
  // After each JARVIS conversation, extract key facts to remember
  if (!conversation || conversation.length < 2) return
  
  const recentMessages = conversation.slice(-6)
    .map(m => `${m.role === 'user' ? 'Abhishek' : 'JARVIS'}: ${m.text}`)
    .join('\n')

  try {
    const { callGroq } = await import('./groq')
    const result = await callGroq({
      messages: [{
        role: 'user',
        content: `Extract important facts about Abhishek from this conversation 
        that JARVIS should remember for future sessions. Only extract concrete 
        facts, goals, or insights (not generic information).

        Conversation:
        ${recentMessages}

        Return ONLY a JSON array of strings, max 3 items, or empty array if 
        nothing important. Example: ["Working on B7 Deep Learning section",
        "Struggling with gradient descent intuition", "Gym starts June 16"]
        
        Return [] if nothing worth remembering.`
      }],
      max_tokens: 200,
      temperature: 0.3
    })

    if (result.error) return

    const cleaned = result.text.replace(/```json|```/g, '').trim()
    const memories = JSON.parse(cleaned)

    if (Array.isArray(memories) && memories.length > 0) {
      for (const memory of memories) {
        if (typeof memory === 'string' && memory.length > 10) {
          await saveMemory(memory, 'conversation', 5)
        }
      }
    }
  } catch (err) {
    console.error('extractAndSaveMemories error:', err)
  }
}

export function formatMemoriesForPrompt(memories) {
  if (!memories || memories.length === 0) return ''
  return `\n\nJARVIS MEMORY (from past sessions):\n${memories
    .map(m => `- ${m.content}`)
    .join('\n')}`
}
