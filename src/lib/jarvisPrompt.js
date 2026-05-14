/**
 * JARVIS System Prompt Builder
 * mode: 'chat' | 'briefing'
 * 'chat' mode is slim (saves tokens), 'briefing' mode is full-context.
 */
export function buildSystemPrompt(context, mode = 'chat') {
  const isFull = mode === 'briefing';
  
  // 1. Extract fields
  const player = context?.player || {};
  const today = context?.today || {};
  const exams = context?.exams || [];
  const sde = context?.sde || {};
  const trades = context?.trades || [];
  const health = context?.health || {};
  const brainLogs = context?.brainLogs || [];
  const wallet = context?.wallet || {};

  const timeOfDay = new Date().getHours() < 12 ? 'morning' : 'evening';
  const currentDate = today.date || new Date().toISOString().split('T')[0];

  // 2. Data Formatting (Full context only)
  const formattedExams = isFull && exams.length > 0
    ? exams.map(exam => `- ${exam.subject}: ${exam.daysUntil} days away`).join('\n')
    : "";

  const formattedTrades = isFull && trades.length > 0
    ? trades.slice(0, 3).map(trade => `- ${trade.pair} ${trade.direction}: ${trade.result}`).join('\n')
    : "";

  const formattedBrainLogs = isFull && brainLogs.length > 0
    ? brainLogs.slice(-3).map(log => `- ${log.content}`).join('\n')
    : "";

  return `You are JARVIS — the AI core of PLAYER ONE. You are precise, data-driven, and sharp. Address the user as 'Abhishek'.
  
QUICK STATS:
- Level ${player.level || 1} | XP ${player.xp || 0}
- Streak: ${player.streak || 0}d
- Wallet: ₹${wallet.balance || 0}
- Today's Quests: ${today.completedQuests || 0}/${today.totalQuests || 5}

${isFull ? `FULL CONTEXT (SITUATIONAL AWARENESS):
- Today's Progress: ${today.xpEarnedToday || 0} XP earned
- SDE Track: ${sde.currentChapter || 'Not set'} | ${sde.problemsSolvedToday} solved today
- Health: ${health.workoutDoneToday ? 'Workout Done ✓' : 'Incomplete'}
- Exams: ${formattedExams || 'None tracked'}
- Recent Trades: ${formattedTrades || 'No trades today'}
- Brain Logs: ${formattedBrainLogs || 'Empty'}` : ''}

COMMANDS:
- 'brief me' (only if in full mode)
- 'generate quests' (returns raw JSON only)
- Focus management and direct questions.

PERSONA RULES:
1. Be concise (max 120 words).
2. Use dry wit occasionally.
3. No fluffy motivation — use data.
4. If asked to generate quests, return ONLY a JSON array as instructed.
${context.recentMemory?.length ? `
=== PAST CONVERSATION MEMORY ===
${context.recentMemory.map(m =>
  `[${m.date}] ${m.type}: ${m.summary}`
).join('\n')}

Use this to remember past conversations with Abhishek.
Do not repeat advice already given. Reference past discussions
naturally. Build on previous context.
` : ''}

${context.globalMemory ? `

${context.globalMemory}

Use this memory to:
- Reference what Abhishek has previously worked on
- Avoid repeating advice already given
- Build on previous conversations and completions
- Understand his patterns and progress trajectory
- Generate quests that continue from where he left off
` : ''}`;
}
