export async function checkDrawdown(supabase) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

  if (!supabase) return null

  const { data: trades, error } = await supabase
    .from('trades')
    .select('pnl, date, pair, rules_followed')
    .gte('date', fromDate)
    .order('date', { ascending: false })

  if (error || !trades || trades.length < 3) return null

  const result = {
    alert: false,
    alertLevel: null,
    consecutiveLosses: 0,
    maxDrawdown: 0,
    rulesViolationStreak: 0,
    message: null,
    action: null
  }

  // Consecutive losses from most recent
  let streak = 0
  for (const trade of trades) {
    if (parseFloat(trade.pnl) < 0) streak++
    else break
  }
  result.consecutiveLosses = streak

  // Rules violation streak
  let ruleStreak = 0
  for (const trade of trades) {
    if (trade.rules_followed === 'NO') ruleStreak++
    else break
  }
  result.rulesViolationStreak = ruleStreak

  // Max drawdown (peak to trough)
  let peak = 0
  let runningPnl = 0
  let maxDD = 0
  ;[...trades].reverse().forEach(trade => {
    runningPnl += parseFloat(trade.pnl || 0)
    if (runningPnl > peak) peak = runningPnl
    const dd = peak - runningPnl
    if (dd > maxDD) maxDD = dd
  })
  result.maxDrawdown = Math.round(maxDD * 100) / 100

  // Alert logic
  if (streak >= 5) {
    result.alert = true
    result.alertLevel = 'critical'
    result.message = `${streak} consecutive losses.`
    result.action = 'Stop trading. Full journal review required.'
  } else if (streak >= 3) {
    result.alert = true
    result.alertLevel = 'warning'
    result.message = `${streak} losses in a row.`
    result.action = 'Review HTF bias. Skip next session if unsure.'
  } else if (ruleStreak >= 3) {
    result.alert = true
    result.alertLevel = 'warning'
    result.message = `${ruleStreak} consecutive trades with rules broken.`
    result.action = 'Protocol check before next trade.'
  }

  return result.alert ? result : null
}
