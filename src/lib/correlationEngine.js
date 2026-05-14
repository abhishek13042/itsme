export async function getHabitCorrelations(supabase) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

    const [energyRes, healthRes, questRes] = await Promise.all([
      supabase.from('ai_sessions')
        .select('session_date, user_input')
        .eq('type', 'energy_log')
        .gte('session_date', fromDate)
        .order('session_date', { ascending: true }),
      supabase.from('health_logs')
        .select('log_date, sleep_done, day_score, gym_done')
        .gte('log_date', fromDate)
        .order('log_date', { ascending: true }),
      supabase.from('daily_completions')
        .select('completed_date')
        .gte('completed_date', fromDate)
    ])

    const energyLogs = energyRes.data || []
    const healthLogs = healthRes.data || []
    const completions = questRes.data || []

    // Minimum requirement: 7 days of energy logs
    if (energyLogs.length < 7) return null

    const insights = []

    // Helper: Map data by date for easier lookup
    const energyMap = {}
    energyLogs.forEach(l => energyMap[l.session_date] = parseInt(l.user_input))

    const healthMap = {}
    healthLogs.forEach(l => healthMap[l.log_date] = l)

    const completionMap = {}
    completions.forEach(c => {
      completionMap[c.completed_date] = (completionMap[c.completed_date] || 0) + 1
    })

    // Insight 1: Sleep vs Energy
    const sleepDays = healthLogs.filter(l => l.sleep_done)
    const noSleepDays = healthLogs.filter(l => !l.sleep_done)

    const avgEnergyWithSleep = sleepDays.reduce((sum, log) => {
      const eVal = energyMap[log.log_date]
      return eVal ? sum + eVal : sum
    }, 0) / (sleepDays.filter(l => energyMap[l.log_date]).length || 1)

    const avgEnergyWithoutSleep = noSleepDays.reduce((sum, log) => {
      const eVal = energyMap[log.log_date]
      return eVal ? sum + eVal : sum
    }, 0) / (noSleepDays.filter(l => energyMap[l.log_date]).length || 1)

    if (sleepDays.length >= 3 && noSleepDays.length >= 3) {
      const diff = Math.round((avgEnergyWithSleep - avgEnergyWithoutSleep) * 10) / 10
      if (Math.abs(diff) >= 0.5) {
        insights.push({
          icon: '😴',
          text: `On good sleep days your energy is ${Math.abs(diff)} points ${diff > 0 ? 'higher' : 'lower'} on average`
        })
      }
    }

    // Insight 2: Gym vs Quest completion
    const gymDays = healthLogs.filter(l => l.gym_done).map(l => l.log_date)
    const nonGymDays = healthLogs.filter(l => !l.gym_done).map(l => l.log_date)
  
    const avgQuestsOnGymDays = gymDays.reduce((sum, date) => sum + (completionMap[date] || 0), 0) / (gymDays.length || 1)
    const avgQuestsOnNonGymDays = nonGymDays.reduce((sum, date) => sum + (completionMap[date] || 0), 0) / (nonGymDays.length || 1)

    if (gymDays.length >= 3 && nonGymDays.length >= 3) {
      const diff = Math.round((avgQuestsOnGymDays - avgQuestsOnNonGymDays) * 10) / 10
      if (Math.abs(diff) >= 0.5) {
        insights.push({
          icon: '🏋️',
          text: `On gym days you complete ${Math.abs(diff)} more quests on average`
        })
      }
    }

    // Insight 3: High energy vs health score
    const highEnergyDates = Object.keys(energyMap).filter(d => energyMap[d] >= 7)
    const lowEnergyDates = Object.keys(energyMap).filter(d => energyMap[d] < 7)
  
    const healthOnHighEnergy = healthLogs
      .filter(l => highEnergyDates.includes(l.log_date))
      .reduce((sum, l) => sum + (l.day_score || 0), 0) / 
      (healthLogs.filter(l => highEnergyDates.includes(l.log_date)).length || 1)

    const healthOnLowEnergy = healthLogs
      .filter(l => lowEnergyDates.includes(l.log_date))
      .reduce((sum, l) => sum + (l.day_score || 0), 0) / 
      (healthLogs.filter(l => lowEnergyDates.includes(l.log_date)).length || 1)

    if (highEnergyDates.length >= 3 && lowEnergyDates.length >= 3) {
      const diff = Math.round(healthOnHighEnergy - healthOnLowEnergy)
      if (Math.abs(diff) >= 5) {
        insights.push({
          icon: '⚡',
          text: `High energy days correlate with a ${Math.abs(diff)}% ${diff > 0 ? 'increase' : 'decrease'} in health scores`
        })
      }
    }

    return insights.length > 0 ? insights : null
  } catch (err) {
    console.error('Correlation Engine Error:', err)
    return null
  }
}
