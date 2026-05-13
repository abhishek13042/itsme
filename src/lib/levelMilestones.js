export const LEVEL_MILESTONES = {
  5: {
    title: 'Initiate',
    unlock: 'JARVIS Sarcasm Mode',
    description: 'You survived the first grind. JARVIS now respects you slightly.',
    color: '#E07B39',
    icon: '⚡'
  },
  10: {
    title: 'Operator',
    unlock: 'Boss Battle Access',
    description: 'Double digits. The quest clusters get harder from here.',
    color: '#1A6B4A',
    icon: '🎯'
  },
  15: {
    title: 'Architect',
    unlock: 'Weekly Deep Dive Mode',
    description: 'You think in systems now. Explorer topics unlock harder papers.',
    color: '#1A1A2E',
    icon: '🧠'
  },
  20: {
    title: 'Sovereign',
    unlock: 'Prestige Track Visible',
    description: 'Top 1% consistency. The AI track prestige panel unlocks.',
    color: '#7C3AED',
    icon: '👑'
  },
  25: {
    title: 'Legend',
    unlock: 'Full JARVIS Context Mode',
    description: 'JARVIS now pulls 90 days of context instead of 30.',
    color: '#C0392B',
    icon: '🏆'
  }
}

export function getMilestoneForLevel(level) {
  return LEVEL_MILESTONES[level] || null
}

export function getNextMilestone(level) {
  const milestonelevels = Object.keys(LEVEL_MILESTONES).map(Number)
  const next = milestonelevels.find(l => l > level)
  return next ? { level: next, ...LEVEL_MILESTONES[next] } : null
}
