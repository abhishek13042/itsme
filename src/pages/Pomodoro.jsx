import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, SkipForward, 
  Plus, Check, Trash2, Brain, Zap, 
  Target, Clock, TrendingUp, Music,
  Coffee, ChevronDown, ChevronUp, X,
  BookOpen, Code2, Heart, Bot
} from 'lucide-react'
import { usePomodoroStore } from '../store/pomodoroStore'
import { useQuestStore } from '../store/questStore'
import { supabase } from '../lib/supabase'
import { getTodayIST } from '../lib/dateUtils'
import { triggerJarvisToast } from '../components/JarvisToast'
import { saveMemory, MEMORY_TYPES } from '../lib/globalMemory'
import { clsx } from 'clsx'

const FOCUS_MODES = {
  pomodoro: { label: 'Pomodoro', minutes: 25, break: 5, color: '#E07B39' },
  deep: { label: 'Deep Work', minutes: 45, break: 10, color: '#1A1A2E' },
  flow: { label: 'Flow State', minutes: 90, break: 15, color: '#7C3AED' }
}

const DOMAIN_TAGS = [
  { id: 'sde', label: 'SDE', color: '#1A1A2E' },
  { id: 'trading', label: 'Trading', color: '#E07B39' },
  { id: 'health', label: 'Health', color: '#1A6B4A' },
  { id: 'ai_track', label: 'AI Track', color: '#7C3AED' },
  { id: 'explorer', label: 'Explorer', color: '#9A9590' },
  { id: 'general', label: 'General', color: '#9A9590' }
]

const Pomodoro = () => {
  const {
    isRunning,
    expectedEndAt,
    currentPhase,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase
  } = usePomodoroStore()

  const [sessionCount, setSessionCount] = useState(0)
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0)
  const [displayTime, setDisplayTime] = useState({ minutes: 25, seconds: 0 })
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const [sessionLog, setSessionLog] = useState([])
  const [showSessionLog, setShowSessionLog] = useState(false)
  const [jarvisInsight, setJarvisInsight] = useState('')
  const [isGettingInsight, setIsGettingInsight] = useState(false)
  const [focusMode, setFocusMode] = useState('pomodoro')
  const [ambientSound, setAmbientSound] = useState(null)
  const [todayStats, setTodayStats] = useState(null)
  const [suggestedQuest, setSuggestedQuest] = useState(null)

  // Load today's session stats on mount
  useEffect(() => {
    const loadStats = async () => {
      const today = getTodayIST()
      const { data } = await supabase
        .from('ai_sessions')
        .select('context_snapshot')
        .eq('type', 'pomodoro_session')
        .eq('session_date', today)
      
      const sessions = data || []
      const totalMins = sessions.reduce((sum, s) => {
        try {
          const ctx = JSON.parse(s.context_snapshot)
          return sum + (ctx.minutes || 0)
        } catch { return sum }
      }, 0)
      
      setTodayStats({
        sessions: sessions.length,
        minutes: totalMins,
        tasksCompleted: sessions.filter(s => {
          try {
            return JSON.parse(s.context_snapshot).taskCompleted
          } catch { return false }
        }).length
      })
      setSessionCount(sessions.length)
      setTotalFocusMinutes(totalMins)
    }
    loadStats()
  }, [])

  // Timer logic
  useEffect(() => {
    let interval = null
    
    const tick = () => {
      const state = usePomodoroStore.getState()
      if (!state.isRunning || !state.expectedEndAt) return
      
      const remaining = Math.max(0, state.expectedEndAt - Date.now())
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setDisplayTime({ minutes, seconds })
      
      if (remaining <= 0) {
        handleSessionComplete()
      }
    }

    if (isRunning) {
      tick()
      interval = setInterval(tick, 1000)
    } else {
      const mode = FOCUS_MODES[focusMode]
      setDisplayTime({ minutes: mode.minutes, seconds: 0 })
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isRunning, focusMode])

  const handleSessionComplete = async () => {
    skipPhase()
    
    const mode = FOCUS_MODES[focusMode]
    const newCount = sessionCount + 1
    const newMins = totalFocusMinutes + mode.minutes
    
    setSessionCount(newCount)
    setTotalFocusMinutes(newMins)
    
    // Log session to Supabase
    const today = getTodayIST()
    await supabase.from('ai_sessions').insert({
      type: 'pomodoro_session',
      session_date: today,
      user_input: activeTask?.text || 'Focus session',
      ai_response: focusMode,
      context_snapshot: JSON.stringify({
        minutes: mode.minutes,
        focusMode,
        activeTask: activeTask?.text,
        domain: activeTask?.domain,
        sessionNumber: newCount,
        taskCompleted: false
      })
    })

    // Save to global memory
    saveMemory({
      type: MEMORY_TYPES.POMODORO,
      content: `Completed ${mode.minutes}min ${focusMode} session${
        activeTask ? ` working on: ${activeTask.text}` : ''
      }`,
      source: 'pomodoro',
      importance: 4
    })

    // Add to session log
    setSessionLog(prev => [{
      id: Date.now(),
      mode: focusMode,
      minutes: mode.minutes,
      task: activeTask?.text,
      domain: activeTask?.domain,
      completedAt: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
      })
    }, ...prev].slice(0, 10))

    // Toast notification
    triggerJarvisToast({
      type: 'success',
      title: `${mode.label} Complete`,
      message: activeTask 
        ? `"${activeTask.text.substring(0, 30)}"` 
        : `${mode.minutes} min session done`,
      xp: Math.round(mode.minutes / 5)
    })

    // Suggest quest completion
    const { dailyQuests, todayCompletions } = useQuestStore.getState()
    const pending = dailyQuests?.filter(q => 
      !todayCompletions?.includes(q.id) &&
      (!activeTask?.domain || q.domain === activeTask?.domain)
    )
    if (pending?.length > 0) {
      setSuggestedQuest(pending[0])
    }
  }

  const getJarvisInsight = async () => {
    setIsGettingInsight(true)
    try {
      const { callGroq } = await import('../lib/groq')
      const result = await callGroq({
        messages: [{
          role: 'user',
          content: `Abhishek just completed ${sessionCount} focus sessions 
          totaling ${totalFocusMinutes} minutes today.
          Current task: ${activeTask?.text || 'none set'}
          Domain: ${activeTask?.domain || 'general'}
          
          Give him ONE sharp insight or recommendation in 2 sentences max.
          Focus on what to do next or how to optimize his focus session.
          Be direct. No fluff.`
        }],
        max_tokens: 100,
        temperature: 0.8
      })
      if (!result.error) setJarvisInsight(result.text)
    } catch {}
    setIsGettingInsight(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-[#9A9590]
            font-['Space_Mono'] uppercase tracking-widest mb-1">
            Focus System
          </p>
          <h1 className="text-2xl font-bold text-[#1A1A2E] 
            font-['Inter']">
            Pomodoro
          </h1>
        </div>
        {/* Today stats strip */}
        {todayStats && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest">
                Today
              </p>
              <p className="text-sm font-bold text-[#1A1A2E]
                font-['Space_Mono']">
                {todayStats.sessions} sessions · {todayStats.minutes}m
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* LEFT — Timer + Controls */}
        <div className="flex flex-col gap-4 lg:w-[380px] shrink-0">
          
          {/* Focus Mode Selector */}
          <div className="flex gap-2">
            {Object.entries(FOCUS_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => {
                  if (isRunning) return
                  setFocusMode(key)
                }}
                disabled={isRunning}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-[10px] font-bold',
                  'font-["Space_Mono"] uppercase tracking-wider',
                  'transition-all border',
                  focusMode === key
                    ? 'text-white border-transparent'
                    : 'bg-white border-[#E5E0D8] text-[#9A9590]',
                  isRunning && focusMode !== key && 'opacity-30'
                )}
                style={focusMode === key 
                  ? { backgroundColor: mode.color } 
                  : {}}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* MAIN TIMER CARD */}
          <div className="bg-[#1A1A2E] rounded-3xl p-8 text-center
            relative overflow-hidden">
            
            {/* Background phase indicator */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full rounded-3xl"
                style={{ 
                  backgroundColor: FOCUS_MODES[focusMode].color 
                }}/>
            </div>

            <div className="relative z-10">
              {/* Phase label */}
              <p className="text-[9px] font-bold text-white/40
                font-['Space_Mono'] uppercase tracking-widest mb-6">
                {currentPhase === 'focus' 
                  ? FOCUS_MODES[focusMode].label 
                  : 'Break Time'}
              </p>

              {/* Timer display */}
              <div className="mb-8">
                <span className="text-7xl font-bold text-white 
                  font-['Space_Mono'] tabular-nums">
                  {String(displayTime.minutes).padStart(2, '0')}
                </span>
                <span className="text-4xl font-bold text-white/40 
                  font-['Space_Mono']">
                  :
                </span>
                <span className="text-7xl font-bold text-white 
                  font-['Space_Mono'] tabular-nums">
                  {String(displayTime.seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Active task display */}
              {activeTask && (
                <div className="mb-6 px-4 py-2.5 rounded-xl
                  bg-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 
                    flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ 
                        backgroundColor: DOMAIN_TAGS
                          .find(d => d.id === activeTask.domain)
                          ?.color || '#9A9590'
                      }}/>
                    <p className="text-xs text-white/80 font-['Inter']
                      truncate">
                      {activeTask.text}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTask(null)}
                    className="text-white/30 hover:text-white/60 shrink-0"
                  >
                    <X size={12}/>
                  </button>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={resetTimer}
                  className="w-10 h-10 rounded-xl bg-white/10 
                    flex items-center justify-center
                    hover:bg-white/20 transition-all"
                >
                  <RotateCcw size={16} className="text-white/60"/>
                </button>
                
                <button
                  onClick={isRunning ? pauseTimer : startTimer}
                  className="w-16 h-16 rounded-2xl flex items-center 
                    justify-center transition-all"
                  style={{ 
                    backgroundColor: FOCUS_MODES[focusMode].color 
                  }}
                >
                  {isRunning 
                    ? <Pause size={24} className="text-white"/>
                    : <Play size={24} className="text-white ml-1"/>
                  }
                </button>

                <button
                  onClick={skipPhase}
                  className="w-10 h-10 rounded-xl bg-white/10 
                    flex items-center justify-center
                    hover:bg-white/20 transition-all"
                >
                  <SkipForward size={16} className="text-white/60"/>
                </button>
              </div>

              {/* Session counter */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ 
                      backgroundColor: i < (sessionCount % 4)
                        ? FOCUS_MODES[focusMode].color
                        : 'rgba(255,255,255,0.2)'
                    }}/>
                ))}
                <p className="text-[9px] text-white/40 
                  font-['Space_Mono'] uppercase tracking-wider ml-2">
                  Session {(sessionCount % 4) + 1}/4
                </p>
              </div>
            </div>
          </div>

          {/* AMBIENT SOUND */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4">
            <p className="text-[9px] font-bold text-[#9A9590]
              font-['Space_Mono'] uppercase tracking-widest mb-3">
              Ambient Sound
            </p>
            <div className="flex gap-2">
              {[
                { id: 'rain', label: 'Rain' },
                { id: 'cafe', label: 'Cafe' },
                { id: 'white', label: 'White' },
                { id: null, label: 'Off' }
              ].map(sound => (
                <button
                  key={sound.id || 'off'}
                  onClick={() => setAmbientSound(sound.id)}
                  className={clsx(
                    'flex-1 py-2 rounded-lg text-[9px] font-bold',
                    'font-["Space_Mono"] uppercase tracking-wider',
                    'transition-all border',
                    ambientSound === sound.id
                      ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                      : 'bg-[#F5F4F0] text-[#9A9590] border-transparent'
                  )}
                >
                  {sound.label}
                </button>
              ))}
            </div>
            {ambientSound && (
              <div className="mt-3 p-3 bg-[#F5F4F0] rounded-xl text-center">
                <a
                  href={
                    ambientSound === 'rain' 
                      ? 'https://www.youtube.com/watch?v=mPZkdNFkNps'
                      : ambientSound === 'cafe'
                        ? 'https://www.youtube.com/watch?v=gaGrHjqXVN8'
                        : 'https://www.youtube.com/watch?v=nMfPqeZjc2c'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#1A1A2E] 
                    font-['Space_Mono'] uppercase tracking-wider
                    hover:text-[#E07B39] transition-colors"
                >
                  Open {ambientSound === 'rain' 
                    ? 'Rain Sounds' 
                    : ambientSound === 'cafe' 
                      ? 'Cafe Ambience' 
                      : 'White Noise'} →
                </a>
              </div>
            )}
          </div>

          {/* JARVIS INSIGHT */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bot size={13} className="text-[#E07B39]"/>
                <p className="text-[9px] font-bold text-[#9A9590]
                  font-['Space_Mono'] uppercase tracking-widest">
                  JARVIS Focus Coach
                </p>
              </div>
              <button
                onClick={getJarvisInsight}
                disabled={isGettingInsight}
                className="text-[9px] font-bold text-[#E07B39]
                  font-['Space_Mono'] uppercase tracking-wider
                  disabled:opacity-40"
              >
                {isGettingInsight ? '...' : 'Ask'}
              </button>
            </div>
            {jarvisInsight ? (
              <p className="text-xs text-[#1A1A2E] font-['Inter']
                leading-relaxed">
                {jarvisInsight}
              </p>
            ) : (
              <p className="text-xs text-[#9A9590] font-['Inter']">
                Ask JARVIS for a focus recommendation
              </p>
            )}
          </div>

        </div>

        {/* RIGHT — Tasks + Log */}
        <div className="flex-1 flex flex-col gap-4">

          {/* TASK PANEL */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest">
                Focus Tasks
              </p>
              <p className="text-[9px] text-[#9A9590] 
                font-['Space_Mono']">
                {tasks.filter(t => t.done).length}/{tasks.length} done
              </p>
            </div>

            {/* Add task */}
            <div className="flex gap-2 mb-4">
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newTask.trim()) {
                    setTasks(prev => [...prev, {
                      id: Date.now(),
                      text: newTask.trim(),
                      domain: 'general',
                      done: false,
                      sessions: 0
                    }])
                    setNewTask('')
                  }
                }}
                placeholder="Add a focus task..."
                className="flex-1 bg-[#F5F4F0] rounded-xl px-3 py-2.5
                  text-sm text-[#1A1A2E] font-['Inter']
                  placeholder-[#9A9590] border border-transparent
                  focus:border-[#E07B39] focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!newTask.trim()) return
                  setTasks(prev => [...prev, {
                    id: Date.now(),
                    text: newTask.trim(),
                    domain: 'general',
                    done: false,
                    sessions: 0
                  }])
                  setNewTask('')
                }}
                className="bg-[#1A1A2E] text-white px-3 py-2.5 
                  rounded-xl"
              >
                <Plus size={16}/>
              </button>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {tasks.length === 0 && (
                <div className="text-center py-8">
                  <Target size={28} className="text-[#E5E0D8] 
                    mx-auto mb-2"/>
                  <p className="text-xs text-[#9A9590] font-['Inter']">
                    Add tasks to track what you are working on
                  </p>
                </div>
              )}
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-xl',
                    'border transition-all group',
                    activeTask?.id === task.id
                      ? 'border-[#E07B39] bg-[#E07B39]/5'
                      : task.done
                        ? 'border-transparent bg-[#F5F4F0] opacity-50'
                        : 'border-[#E5E0D8] bg-white hover:border-[#1A1A2E]'
                  )}
                >
                  <button
                    onClick={() => setTasks(prev => prev.map(t =>
                      t.id === task.id ? { ...t, done: !t.done } : t
                    ))}
                    className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center',
                      'justify-center shrink-0 transition-all',
                      task.done
                        ? 'bg-[#1A6B4A] border-[#1A6B4A]'
                        : 'border-[#E5E0D8] bg-white'
                    )}
                  >
                    {task.done && (
                      <Check size={11} className="text-white" 
                        strokeWidth={3}/>
                    )}
                  </button>
                  
                  <p className={clsx(
                    'text-sm font-["Inter"] flex-1 min-w-0 truncate',
                    task.done 
                      ? 'line-through text-[#9A9590]' 
                      : 'text-[#1A1A2E]'
                  )}>
                    {task.text}
                  </p>

                  {/* Domain tag */}
                  <select
                    value={task.domain}
                    onChange={e => setTasks(prev => prev.map(t =>
                      t.id === task.id 
                        ? { ...t, domain: e.target.value } 
                        : t
                    ))}
                    className="text-[8px] font-bold font-['Space_Mono']
                      uppercase bg-transparent border-none
                      text-[#9A9590] focus:outline-none cursor-pointer"
                  >
                    {DOMAIN_TAGS.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>

                  {/* Set as active */}
                  {!task.done && (
                    <button
                      onClick={() => setActiveTask(
                        activeTask?.id === task.id ? null : task
                      )}
                      className="text-[9px] font-bold font-['Space_Mono']
                        uppercase tracking-wider px-2 py-1 rounded-lg
                        opacity-0 group-hover:opacity-100 transition-all"
                      style={{ 
                        backgroundColor: activeTask?.id === task.id 
                          ? '#E07B39' : '#F5F4F0',
                        color: activeTask?.id === task.id 
                          ? 'white' : '#9A9590'
                      }}
                    >
                      {activeTask?.id === task.id ? 'Active' : 'Focus'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setTasks(prev => prev.filter(t => t.id !== task.id))
                      if (activeTask?.id === task.id) setActiveTask(null)
                    }}
                    className="text-[#9A9590] hover:text-[#C0392B]
                      opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* QUEST SUGGESTION (after session) */}
          <AnimatePresence>
            {suggestedQuest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#1A1A2E] rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-white/40
                      font-['Space_Mono'] uppercase tracking-widest mb-1">
                      Session Complete — Mark Quest Done?
                    </p>
                    <p className="text-sm font-bold text-white 
                      font-['Inter']">
                      {suggestedQuest.title}
                    </p>
                    <p className="text-[10px] text-white/40 
                      font-['Space_Mono'] mt-0.5">
                      +{suggestedQuest.xp_reward} XP
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        await useQuestStore.getState()
                          .completeDaily(suggestedQuest.id)
                        setSuggestedQuest(null)
                      }}
                      className="bg-[#1A6B4A] text-white px-3 py-1.5
                        rounded-lg text-[10px] font-bold 
                        font-['Space_Mono'] uppercase tracking-wider"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setSuggestedQuest(null)}
                      className="text-white/40 hover:text-white/60"
                    >
                      <X size={14}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TODAY'S STATS */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sessions', value: sessionCount, color: '#E07B39' },
              { label: 'Focus Time', value: totalFocusMinutes >= 60 ? `${Math.floor(totalFocusMinutes/60)}h ${totalFocusMinutes%60}m` : `${totalFocusMinutes}m`, color: '#1A1A2E' },
              { label: 'Tasks Done', value: tasks.filter(t => t.done).length, color: '#1A6B4A' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E0D8] p-4 text-center shadow-sm">
                <p className="text-xl font-bold font-['Space_Mono']" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* SESSION LOG */}
          {sessionLog.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">Session Log</p>
                <button onClick={() => setShowSessionLog(!showSessionLog)} className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider">
                  {showSessionLog ? 'Hide' : 'Show'}
                </button>
              </div>
              {showSessionLog && (
                <div className="space-y-2">
                  {sessionLog.map(session => (
                    <div key={session.id} className="flex items-center justify-between py-2 border-b border-[#F5F4F0] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FOCUS_MODES[session.mode]?.color || '#9A9590' }}/>
                        <p className="text-xs text-[#1A1A2E] font-['Inter']">{session.task || session.mode}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-[#9A9590] font-['Space_Mono']">{session.minutes}m</span>
                        <span className="text-[9px] text-[#9A9590] font-['Space_Mono']">{session.completedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Pomodoro
