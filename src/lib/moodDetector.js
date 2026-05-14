const MOOD_KEYWORDS = {
  stressed: [
    'stressed', 'overwhelmed', 'too much', 'can\'t focus',
    'anxious', 'worried', 'behind', 'failing', 'lost',
    'confused', 'stuck', 'burnout', 'tired', 'exhausted'
  ],
  motivated: [
    'let\'s go', 'ready', 'focused', 'crushing it', 'grind',
    'motivated', 'excited', 'pumped', 'locked in', 'let\'s do',
    'feeling good', 'great day', 'on fire'
  ],
  frustrated: [
    'frustrated', 'annoyed', 'not working', 'broken', 'hate',
    'useless', 'waste', 'failed', 'keep failing', 'can\'t',
    'nothing works', 'what\'s wrong', 'ugh', 'damn'
  ],
  reflective: [
    'thinking about', 'wondering', 'what if', 'maybe i should',
    'not sure', 'question', 'curious about', 'understand why',
    'makes sense', 'realizing', 'been noticing'
  ],
  neutral: []
}

export function detectMood(message) {
  const lower = message.toLowerCase()
  
  let scores = {
    stressed: 0,
    motivated: 0,
    frustrated: 0,
    reflective: 0
  }

  Object.entries(MOOD_KEYWORDS).forEach(([mood, keywords]) => {
    keywords.forEach(kw => {
      if (lower.includes(kw)) scores[mood]++
    })
  })

  const topMood = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)[0]
  
  return topMood[1] > 0 ? topMood[0] : 'neutral'
}

export function getMoodAdjustment(mood) {
  switch (mood) {
    case 'stressed':
      return `The user seems stressed or overwhelmed. 
        Keep your response calm, concise, and grounding.
        Break things into small steps. No pressure.
        Start with one simple actionable thing.`
    case 'motivated':
      return `The user is fired up and motivated.
        Match that energy. Be direct and push them harder.
        Give ambitious, challenging guidance.`
    case 'frustrated':
      return `The user is frustrated. Acknowledge it briefly
        without dwelling. Then redirect to a concrete fix.
        Be direct but not dismissive. One solution focus.`
    case 'reflective':
      return `The user is in a reflective, thinking mode.
        Engage thoughtfully. Ask one good question back.
        Explore the idea with them — don't just answer.`
    default:
      return ''
  }
}

export async function saveMoodLog(supabase, mood, message) {
  if (mood === 'neutral') return
  try {
    await supabase.from('ai_sessions').insert({
      type: 'mood_log',
      session_date: new Date().toISOString().split('T')[0],
      user_input: message.substring(0, 100),
      ai_response: mood,
      context_snapshot: JSON.stringify({ 
        detected_mood: mood,
        logged_at: new Date().toISOString()
      })
    })
  } catch (err) {
    console.error('Mood log save error:', err)
  }
}
