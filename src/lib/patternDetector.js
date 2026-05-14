export async function detectPatterns(supabase) {
  try {
    const patterns = []
    const today = new Date()
    
    // Fetch last 14 days of data
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const fromDate = fourteenDaysAgo.toISOString().split('T')[0]

    const [healthRes, questRes, tradeRes] = await Promise.all([
      supabase.from('health_logs')
        .select('*')
        .gte('log_date', fromDate)
        .order('log_date', { ascending: true }),
      supabase.from('daily_completions')
        .select('*')
        .gte('completed_date', fromDate),
      supabase.from('trades')
        .select('*')
        .gte('date', fromDate)
        .order('date', { ascending: true })
    ])

    const healthLogs = healthRes.data || []
    const completions = questRes.data || []
    const trades = tradeRes.data || []

    // PATTERN 1: Gym skip streak
    const lastNDays = (n) => {
      const days = []
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push(d.toISOString().split('T')[0])
      }
      return days
    }

    const last3Days = lastNDays(3)
    const gymSkips = last3Days.filter(date => {
      const log = healthLogs.find(l => l.log_date === date)
      return log && !log.gym_done
    })
    if (gymSkips.length === 3) {
      patterns.push({
        type: 'warning',
        icon: '💪',
        title: 'Gym Skip Streak',
        message: 'You have skipped gym 3 days in a row.',
        action: 'Break the pattern today.'
      })
    }

    // PATTERN 2: Monday quest drop
    const mondayCompletions = completions.filter(c => {
      const day = new Date(c.completed_date).getDay()
      return day === 1
    })
    const otherCompletions = completions.filter(c => {
      const day = new Date(c.completed_date).getDay()
      return day !== 1 && day !== 0
    })
    const mondayAvg = mondayCompletions.length / 2
    const otherAvg = otherCompletions.length / 8
    if (otherAvg > 0 && mondayAvg < otherAvg * 0.5) {
      patterns.push({
        type: 'info',
        icon: '📅',
        title: 'Monday Dip Detected',
        message: 'Your quest completion is significantly lower on Mondays.',
        action: 'Prep Sunday night for a strong Monday.'
      })
    }

    // PATTERN 3: Consecutive losses
    const last5Trades = trades.slice(-5)
    const consecutiveLosses = last5Trades
      .filter(t => parseFloat(t.pnl) < 0).length
    if (consecutiveLosses >= 3 && last5Trades.length >= 3) {
      patterns.push({
        type: 'danger',
        icon: '⚠️',
        title: 'Drawdown Alert',
        message: `${consecutiveLosses} of your last 5 trades were losses.`,
        action: 'Step back. Review HTF bias before next trade.'
      })
    }

    // PATTERN 4: High score streak
    const last7Days = lastNDays(7)
    const highScoreDays = last7Days.filter(date => {
      const log = healthLogs.find(l => l.log_date === date)
      return log && log.day_score >= 80
    })
    if (highScoreDays.length >= 5) {
      patterns.push({
        type: 'success',
        icon: '🔥',
        title: 'On Fire',
        message: `${highScoreDays.length} high-score health days this week.`,
        action: 'Keep this momentum going.'
      })
    }

    // PATTERN 5: No quests for X days
    const todayStr = today.toISOString().split('T')[0]
    const last3DaysQuests = lastNDays(3).filter(date => 
      date !== todayStr
    )
    const questGap = last3DaysQuests.filter(date =>
      !completions.find(c => c.completed_date === date)
    )
    if (questGap.length === 2) {
      patterns.push({
        type: 'warning',
        icon: '📋',
        title: 'Quest Gap',
        message: 'No quests completed in the last 2 days.',
        action: 'Open Quest Log and approve a cluster now.'
      })
    }

    // PATTERN 6: No SDE domain quests
    const { data: sdeCompletions } = await supabase
      .from('daily_completions')
      .select('quest_id, daily_quests(domain)')
      .gte('completed_date', fromDate)
    
    const sdeDone = (sdeCompletions || []).filter(c => 
      c.daily_quests?.domain === 'sde'
    )
    if (sdeDone.length === 0 && completions.length > 10) {
      patterns.push({
        type: 'info',
        icon: '💻',
        title: 'SDE Neglect',
        message: 'No SDE quests completed in 14 days.',
        action: 'Generate a coding cluster today.'
      })
    }

    return patterns
  } catch (err) {
    console.error('Pattern Detector Error:', err)
    return []
  }
}
