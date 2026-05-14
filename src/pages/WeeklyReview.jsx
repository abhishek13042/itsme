import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts'
import { 
  Trophy, Brain, Zap, Heart, TrendingUp, 
  Target, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { callGroq } from '../lib/groq'
import { loadMemories, saveMemory, MEMORY_TYPES } from '../lib/globalMemory'

function getWeekRange(offsetWeeks = 0) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setDate(monday.getDate() - (offsetWeeks * 7))
  monday.setHours(0, 0, 0, 0)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    label: `${monday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${sunday.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
  }
}

function getDayLabel(dateStr, short = false) {
  const days = short ? ['Su','Mo','Tu','We','Th','Fr','Sa'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return days[new Date(dateStr).getDay()]
}

export default function WeeklyReview() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekData, setWeekData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [jarvisVerdict, setJarvisVerdict] = useState(null)
  const [isGeneratingVerdict, setIsGeneratingVerdict] = useState(false)
  const [verdictLoaded, setVerdictLoaded] = useState(false)

  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset])

  useEffect(() => { loadWeekData() }, [weekRange])

  const loadWeekData = async () => {
    setIsLoading(true); setWeekData(null); setJarvisVerdict(null);
    const [completionsRes, healthRes, xpRes, brainRes, tradeRes, savedVerdictRes] = await Promise.all([
      supabase.from('daily_completions').select('completed_date, quest_id').gte('completed_date', weekRange.start).lte('completed_date', weekRange.end),
      supabase.from('health_logs').select('log_date, day_score, gym_done, rupees_earned').gte('log_date', weekRange.start).lte('log_date', weekRange.end),
      supabase.from('xp_log').select('amount, created_at').gte('created_at', weekRange.start).lte('created_at', weekRange.end + 'T23:59:59'),
      supabase.from('brain_logs').select('topic, subject_area, minutes_pushed, logged_at').gte('logged_at', weekRange.start).lte('logged_at', weekRange.end + 'T23:59:59'),
      supabase.from('trades').select('pnl, date, pair').gte('date', weekRange.start).lte('date', weekRange.end),
      supabase.from('ai_sessions').select('ai_response, session_date').eq('type', 'weekly_review_verdict').eq('session_date', weekRange.start).maybeSingle()
    ])

    const completions = completionsRes.data || []; const healthLogs = healthRes.data || []; const xpLogs = xpRes.data || [];
    const brainLogs = brainRes.data || []; const trades = tradeRes.data || [];

    if (savedVerdictRes.data) { setJarvisVerdict(savedVerdictRes.data.ai_response); setVerdictLoaded(true); } else { setVerdictLoaded(true); }

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekRange.start); d.setDate(d.getDate() + i); const dateStr = d.toISOString().split('T')[0]
      const dayXP = xpLogs.filter(x => x.created_at.startsWith(dateStr)).reduce((sum, x) => sum + (x.amount || 0), 0)
      const dayQuests = completions.filter(c => c.completed_date === dateStr).length
      const dayHealth = healthLogs.find(h => h.log_date === dateStr)
      days.push({ date: dateStr, day: getDayLabel(dateStr, true), xp: dayXP, quests: dayQuests, healthScore: dayHealth?.day_score || 0, gymDone: dayHealth?.gym_done || false, hasData: dayXP > 0 || dayQuests > 0 || !!dayHealth })
    }

    const totalXP = xpLogs.reduce((s, x) => s + (x.amount || 0), 0); const totalQuests = completions.length; const healthDays = healthLogs.length
    const avgHealthScore = healthDays > 0 ? Math.round(healthLogs.reduce((s, h) => s + (h.day_score || 0), 0) / healthDays) : 0
    const perfectDays = healthLogs.filter(h => h.day_score >= 100).length; const gymDays = healthLogs.filter(h => h.gym_done).length
    const totalBrainMinutes = brainLogs.reduce((s, b) => s + (b.minutes_pushed || 0), 0)
    const tradingPnl = trades.reduce((s, t) => s + parseFloat(t.pnl || 0), 0)
    const tradeWins = trades.filter(t => parseFloat(t.pnl) > 0).length; const healthEarnings = healthLogs.reduce((s, h) => s + (h.rupees_earned || 0), 0)

    setWeekData({ days, stats: { totalXP, totalQuests, healthDays, avgHealthScore, perfectDays, gymDays, totalBrainMinutes, trades: trades.length, tradeWins, tradingPnl: Math.round(tradingPnl * 100) / 100, healthEarnings } })
    setIsLoading(false)
  }

  const generateVerdict = async () => {
    if (!weekData) return
    setIsGeneratingVerdict(true)
    try {
      let globalHistory = ''
      try {
        const globalMemory = await loadMemories(MEMORY_TYPES.GLOBAL, 5)
        globalHistory = globalMemory.map(m => m.content).join('\n- ')
      } catch (memErr) {
        console.error('Failed to load global memory:', memErr)
      }

      const { stats } = weekData
      const result = await callGroq({
        messages: [{ role: 'user', content: `Abhishek's week (${weekRange.label}): XP: ${stats.totalXP} | Quests: ${stats.totalQuests} | Health score: ${stats.avgHealthScore}% | Gym days: ${stats.gymDays} | Brain time: ${stats.totalBrainMinutes}m | Trades: ${stats.trades} | Wins: ${stats.tradeWins}. 
        
        GLOBAL HISTORY:
        - ${globalHistory}

        Write exactly 4 sentences (Overall, Win, Gap, Non-negotiable). Brutal. Max 100 words. Reference how this week compares to his long-term goals and past history.` }],
        max_tokens: 250, temperature: 0.8
      })

      if (!result.error) {
        setJarvisVerdict(result.text)
        await supabase.from('ai_sessions').insert({ type: 'weekly_review_verdict', session_date: weekRange.start, ai_response: result.text, user_input: `week:${weekRange.label}`, context_snapshot: JSON.stringify(weekData.stats) })
        
        saveMemory({
          type: MEMORY_TYPES.GLOBAL,
          content: `Weekly verdict (${weekRange.label}): ${result.text.substring(0, 200)}`,
          source: 'weekly_review',
          importance: 9
        })
      }

    } catch (err) { console.error('verdict error:', err) }
    setIsGeneratingVerdict(false)
  }

  if (isLoading) return <div className="p-6 flex items-center justify-center min-h-screen bg-[#F5F4F0]"><div className="w-8 h-8 border-2 border-[#1A1A2E]/10 border-t-[#E07B39] rounded-full animate-spin" /></div>

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-1">{weekRange.label}</p>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-['Inter']">Weekly Review</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w + 1)} className="w-9 h-9 bg-white rounded-xl border border-[#E5E0D8] flex items-center justify-center hover:border-[#1A1A2E] transition-all"><ChevronLeft size={16} className="text-[#9A9590]"/></button>
          <button onClick={() => setWeekOffset(w => Math.max(0, w - 1))} disabled={weekOffset === 0} className="w-9 h-9 bg-white rounded-xl border border-[#E5E0D8] flex items-center justify-center hover:border-[#1A1A2E] transition-all disabled:opacity-30"><ChevronRight size={16} className="text-[#9A9590]"/></button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'XP Earned', value: weekData.stats.totalXP.toLocaleString(), icon: Zap, color: '#E07B39' },
          { label: 'Quests Done', value: weekData.stats.totalQuests, icon: Target, color: '#1A1A2E' },
          { label: 'Avg Health', value: `${weekData.stats.avgHealthScore}%`, icon: Heart, color: '#1A6B4A' },
          { label: 'Brain Time', value: weekData.stats.totalBrainMinutes >= 60 ? `${Math.floor(weekData.stats.totalBrainMinutes/60)}h` : `${weekData.stats.totalBrainMinutes}m`, icon: Brain, color: '#7C3AED' },
          { label: 'Gym Days', value: `${weekData.stats.gymDays}/7`, icon: Trophy, color: '#E07B39' },
          { label: 'Health ₹', value: `₹${weekData.stats.healthEarnings}`, icon: TrendingUp, color: '#1A6B4A' }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm">
            <stat.icon size={14} style={{ color: stat.color }} className="mb-3"/>
            <p className="text-2xl font-bold text-[#1A1A2E] font-['Space_Mono']">{stat.value}</p>
            <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* HEALTH HEATMAP */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-8 shadow-sm">
        <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-6">Execution Consistency</p>
        <div className="grid grid-cols-7 gap-3">
          {weekData.days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-xl flex items-center justify-center transition-all"
                style={{ backgroundColor: day.healthScore >= 80 ? '#1A6B4A' : day.healthScore >= 50 ? '#E07B39' : day.healthScore > 0 ? '#C0392B' : '#F5F4F0' }}>
                {day.gymDone && <span className="text-[10px]">💪</span>}
              </div>
              <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] font-bold uppercase">{day.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* JARVIS VERDICT */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#E07B39] fill-[#E07B39]"/>
            <p className="text-[10px] font-bold text-white/40 font-['Space_Mono'] uppercase tracking-widest">Neural Verdict</p>
          </div>
          <button onClick={generateVerdict} disabled={isGeneratingVerdict} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-bold font-['Space_Mono'] uppercase tracking-wider transition-all">
            {isGeneratingVerdict ? 'Processing...' : jarvisVerdict ? 'Regenerate' : 'Analyze Week'}
          </button>
        </div>
        {jarvisVerdict ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm leading-relaxed text-white/90 font-['Inter'] italic">
            "{jarvisVerdict}"
          </motion.p>
        ) : (
          <p className="text-sm text-white/40 font-['Inter']">Initialize neural analysis for performance review.</p>
        )}
      </div>
    </div>
  )
}
