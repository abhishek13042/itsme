import { supabase } from './supabase'

// ── MEMORY TYPES ──
export const MEMORY_TYPES = {
  GLOBAL: 'global',
  HEALTH: 'health',
  EXPLORER: 'explorer',
  TRADING: 'trading',
  SDE: 'sde',
  AI_TRACK: 'ai_track',
  QUEST: 'quest',
  POMODORO: 'pomodoro',
  FINANCE: 'finance'
}

// ── SAVE A MEMORY ──
export async function saveMemory({
  type = MEMORY_TYPES.GLOBAL,
  content,
  source,
  importance = 5,
  metadata = {}
}) {
  if (!content?.trim()) return null
  try {
    const { data } = await supabase
      .from('jarvis_memory')
      .insert({
        memory_type: type,
        content: content.substring(0, 500),
        importance,
        context_snapshot: JSON.stringify({
          source,
          metadata,
          saved_at: new Date().toISOString()
        }),
        created_at: new Date().toISOString(),
        last_referenced: new Date().toISOString(),
        reference_count: 0
      })
      .select()
      .single()
    return data
  } catch (err) {
    console.error('saveMemory error:', err)
    return null
  }
}

// ── LOAD MEMORIES BY TYPE ──
export async function loadMemories(type = null, limit = 20) {
  try {
    let query = supabase
      .from('jarvis_memory')
      .select('*')
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type) query = query.eq('memory_type', type)

    const { data } = await query
    return data || []
  } catch (err) {
    console.error('loadMemories error:', err)
    return []
  }
}

// ── DELETE A MEMORY ──
export async function deleteMemory(id) {
  try {
    const { error } = await supabase
      .from('jarvis_memory')
      .delete()
      .eq('id', id)
    return !error
  } catch (err) {
    console.error('deleteMemory error:', err)
    return false
  }
}

// ── RESET ALL MEMORIES ──
export async function resetMemory(type = null) {
  try {
    let query = supabase.from('jarvis_memory').delete()
    if (type) query = query.eq('memory_type', type)
    else query = query.neq('id', '00000000-0000-0000-0000-000000000000') // just a hack to delete all if no type

    const { error } = await query
    return !error
  } catch (err) {
    console.error('resetMemory error:', err)
    return false
  }
}

// ── GET MEMORY COUNT ──
export async function getMemoryCount() {
  try {
    const { count, error } = await supabase
      .from('jarvis_memory')
      .select('*', { count: 'exact', head: true })
    return count || 0
  } catch (err) {
    console.error('getMemoryCount error:', err)
    return 0
  }
}

// ── LOAD ALL MEMORIES FOR CONTEXT ──
export async function loadAllMemoriesForContext() {
  try {
    const [global, health, explorer, trading, sde, 
      aiTrack, quest, finance] = await Promise.all([
      loadMemories(MEMORY_TYPES.GLOBAL, 5),
      loadMemories(MEMORY_TYPES.HEALTH, 5),
      loadMemories(MEMORY_TYPES.EXPLORER, 5),
      loadMemories(MEMORY_TYPES.TRADING, 5),
      loadMemories(MEMORY_TYPES.SDE, 3),
      loadMemories(MEMORY_TYPES.AI_TRACK, 5),
      loadMemories(MEMORY_TYPES.QUEST, 5),
      loadMemories(MEMORY_TYPES.FINANCE, 3)
    ])

    return {
      global,
      health,
      explorer,
      trading,
      sde,
      aiTrack,
      quest,
      finance,
      formatted: formatMemoriesForPrompt({
        global, health, explorer, trading,
        sde, aiTrack, quest, finance
      })
    }
  } catch (err) {
    console.error('loadAllMemoriesForContext error:', err)
    return { formatted: '' }
  }
}

// ── FORMAT FOR PROMPT ──
export function formatMemoriesForPrompt(memories) {
  const sections = []

  const format = (type, items) => {
    if (!items?.length) return ''
    const lines = items
      .map(m => `  - [${m.created_at?.split('T')[0]}] ${m.content}`)
      .join('\n')
    return `${type.toUpperCase()} MEMORY:\n${lines}`
  }

  if (memories.global?.length) 
    sections.push(format('global', memories.global))
  if (memories.quest?.length) 
    sections.push(format('quests', memories.quest))
  if (memories.health?.length) 
    sections.push(format('health', memories.health))
  if (memories.explorer?.length) 
    sections.push(format('explorer', memories.explorer))
  if (memories.trading?.length) 
    sections.push(format('trading', memories.trading))
  if (memories.sde?.length) 
    sections.push(format('sde', memories.sde))
  if (memories.aiTrack?.length) 
    sections.push(format('ai_track', memories.aiTrack))
  if (memories.finance?.length) 
    sections.push(format('finance', memories.finance))

  return sections.length > 0
    ? `=== ABHISHEK'S MEMORY CONTEXT ===\n${sections.join('\n\n')}\n=== END MEMORY ===`
    : ''
}

// ── EXTRACT AND SAVE FROM AI RESPONSE ──
export async function extractAndSaveFromResponse({
  userInput,
  aiResponse,
  type = MEMORY_TYPES.GLOBAL,
  source
}) {
  if (!aiResponse?.trim()) return
  try {
    const { callGroq } = await import('./groq')
    const result = await callGroq({
      messages: [{
        role: 'user',
        content: `Extract 1-3 important facts to remember 
        about Abhishek from this conversation.
        
        User said: ${userInput?.substring(0, 200)}
        AI responded: ${aiResponse?.substring(0, 300)}
        
        Return ONLY a JSON array of strings. Each string is
        one fact to remember. Max 100 chars each.
        No markdown, no explanation.
        Example: ["Abhishek is struggling with DSA trees",
          "Completed 5 LeetCode problems this week"]
        
        If nothing important to remember, return: []`
      }],
      max_tokens: 200,
      temperature: 0.3
    })

    if (result.error || !result.text) return

    const clean = result.text.replace(/```json|```/g, '').trim()
    const facts = JSON.parse(clean)

    if (!Array.isArray(facts) || facts.length === 0) return

    await Promise.all(facts.map(fact =>
      saveMemory({
        type,
        content: fact,
        source,
        importance: 6
      })
    ))
  } catch (err) {
    // Silent fail — memory extraction is non-blocking
  }
}

// ── SAVE QUEST COMPLETION MEMORY ──
export async function saveQuestMemory(quest) {
  await saveMemory({
    type: MEMORY_TYPES.QUEST,
    content: `Completed quest: "${quest.title}" 
      (${quest.domain}, ${quest.difficulty}, +${quest.xp_reward}XP)`,
    source: 'quest_completion',
    importance: 5,
    metadata: { 
      questId: quest.id, 
      domain: quest.domain,
      date: new Date().toISOString().split('T')[0]
    }
  })
}

// ── SAVE HEALTH DAY MEMORY ──
export async function saveHealthMemory(log) {
  if (!log) return
  await saveMemory({
    type: MEMORY_TYPES.HEALTH,
    content: `Health day: score ${log.day_score}%, 
      gym ${log.gym_done ? 'done' : 'skipped'}, 
      ${log.total_checks}/13 habits, 
      earned ₹${log.rupees_earned}`,
    source: 'health_submit',
    importance: 6,
    metadata: { 
      date: log.log_date, 
      score: log.day_score 
    }
  })
}

// ── SAVE EXPLORER MEMORY ──
export async function saveExplorerMemory(topic, conceptsRead) {
  await saveMemory({
    type: MEMORY_TYPES.EXPLORER,
    content: `Studied topic: "${topic}" — read ${conceptsRead} concepts`,
    source: 'explorer',
    importance: 7,
    metadata: { topic, conceptsRead }
  })
}

// ── SAVE TRADING MEMORY ──
export async function saveTradingMemory(trade) {
  await saveMemory({
    type: MEMORY_TYPES.TRADING,
    content: `Trade: ${trade.pair} ${trade.direction} 
      PnL: ${trade.pnl} — rules: ${trade.rules_followed}`,
    source: 'trade_log',
    importance: 6,
    metadata: { 
      pair: trade.pair, 
      pnl: trade.pnl,
      date: trade.date
    }
  })
}

// ── SAVE BRAIN LOG MEMORY ──
export async function saveBrainLogMemory(log) {
  await saveMemory({
    type: MEMORY_TYPES.SDE,
    content: `Brain log: "${log.topic}" (${log.subject_area}) 
      — ${log.minutes_pushed}min, solved: ${log.solved}`,
    source: 'brain_log',
    importance: 7,
    metadata: { 
      topic: log.topic, 
      subject: log.subject_area 
    }
  })
}
