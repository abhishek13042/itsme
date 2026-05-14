const DOMAIN_LABELS = {
  sde: 'SDE / DSA',
  trading: 'Trading',
  health: 'Health',
  explorer: 'Explorer',
  ai_track: 'AI Track',
  finance: 'Finance'
}

const DOMAIN_ICONS = {
  sde: '💻',
  trading: '📈',
  health: '💪',
  explorer: '🧠',
  ai_track: '🤖',
  finance: '📚'
}

export function detectDomainImbalance(domainCompletionMap) {
  if (!domainCompletionMap || Object.keys(domainCompletionMap).length === 0) return []
  
  const alerts = []
  const today = new Date()

  Object.entries(domainCompletionMap).forEach(([domain, data]) => {
    if (data.total === 0) return // no quests in domain
    
    // Check last completion date
    if (data.lastCompletionDate) {
      const lastDate = new Date(data.lastCompletionDate)
      const daysSince = Math.floor(
        (today - lastDate) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSince >= 5) {
        alerts.push({
          domain,
          label: DOMAIN_LABELS[domain] || domain,
          icon: DOMAIN_ICONS[domain] || '🎯',
          message: `No ${DOMAIN_LABELS[domain] || domain} quests in ${daysSince} days`,
          severity: daysSince >= 10 ? 'high' : 'medium'
        })
      }
    } else if (data.total > 0) {
      // Quests exist but none ever completed
      alerts.push({
        domain,
        label: DOMAIN_LABELS[domain] || domain,
        icon: DOMAIN_ICONS[domain] || '🎯',
        message: `${DOMAIN_LABELS[domain] || domain} quests never attempted`,
        severity: 'low'
      })
    }
  })

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 }
  return alerts
    .sort((a,b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 2) // max 2 alerts shown
}
