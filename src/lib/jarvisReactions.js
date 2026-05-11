import { useXpStore } from '../store/xpStore'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Module-level toast queue — prevents spam
let lastReactionTime = 0
const COOLDOWN_MS = 8000 // 8 seconds between reactions

async function getJarvisLine(event, data) {
  // Cooldown guard — don't spam
  if (Date.now() - lastReactionTime < COOLDOWN_MS) return null
  lastReactionTime = Date.now()

  const prompts = {
    quest_complete: `You are JARVIS from PLAYER ONE. Abhishek just 
    completed a quest: "${data.title}" (+${data.xp} XP). 
    Respond in ONE sharp sentence — acknowledge it, reference the 
    actual quest name. Dry wit welcome. No emojis. Max 12 words.`,
    
    all_quests_done: `You are JARVIS. Abhishek just completed ALL 
    his daily quests (${data.total} missions). One sharp sentence 
    of acknowledgment. Make it feel earned. Max 15 words.`,
    
    streak_milestone: `You are JARVIS. Abhishek hit a ${data.days} 
    day streak. ONE sentence. Reference the number. No generic 
    motivation. Max 12 words.`,
    
    health_perfect: `You are JARVIS. Abhishek just hit 100% health 
    score today (13/13 habits). ONE line. Sharp. Max 12 words.`,
    
    level_up: `You are JARVIS. Abhishek just reached Level 
    ${data.newLevel}. ONE dramatic sentence about what this means. 
    Max 15 words.`,
    
    gym_done: `You are JARVIS. Abhishek just logged his gym session 
    (${data.type || 'workout'}). ONE motivating line. Reference the 
    workout type if available. Max 12 words.`,
    
    brain_log: `You are JARVIS. Abhishek just logged a ${data.minutes} 
    minute thinking session on ${data.topic}. ONE sharp acknowledgment. 
    Max 12 words.`,

    quest_cluster_generated: `You are JARVIS. Just generated 
    ${data.count} personalized quest clusters for Abhishek today. 
    ONE line telling him to execute. Sharp. Max 12 words.`
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompts[event] }],
        max_tokens: 40,
        temperature: 0.9
      })
    })
    const data2 = await response.json()
    return data2.choices[0].message.content.trim()
  } catch (err) {
    // Fallback lines if Groq fails
    const fallbacks = {
      quest_complete: `"${data.title}" — logged.`,
      all_quests_done: 'All missions complete. Exceptional.',
      streak_milestone: `${data.days} days. The pattern holds.`,
      health_perfect: 'Perfect score. Every system optimal.',
      level_up: `Level ${data.newLevel}. The data confirms progress.`,
      gym_done: 'Session logged. Recovery is part of the protocol.',
      brain_log: 'Neural session recorded.',
      quest_cluster_generated: 'Missions ready. Execute.'
    }
    return fallbacks[event] || 'Logged.'
  }
}

export { getJarvisLine }
