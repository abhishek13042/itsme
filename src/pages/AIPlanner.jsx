import React, { useState, useEffect, useRef } from 'react'
import { useJarvisStore } from '../store/jarvisStore'
import { useQuestStore } from '../store/questStore'
import { supabase } from '../lib/supabase'
import { collectFullContext } from '../lib/jarvisContext'
import { speak, stopSpeaking } from '../lib/jarvisSpeech'
import { getTimeUntilReady } from '../lib/gemini'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import {
  Volume2, VolumeX, Mic, Send, RefreshCcw,
  Target, TrendingUp, Trash2, ArrowRight, Clock, CheckCircle2
} from 'lucide-react'

const AIPlanner = () => {
  // --- TOP-LEVEL STATE ---
  const [playerContext, setPlayerContext] = useState(null)
  const [contextLoading, setContextLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [dayRating, setDayRating] = useState(null)  // 'solid' | 'okay' | 'rough'
  const [debriefNotes, setDebriefNotes] = useState('')
  const [questsVisible, setQuestsVisible] = useState(false)
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0) // seconds remaining
  const [addedQuests, setAddedQuests] = useState(new Set())
  const messagesEndRef = useRef(null)

  // --- ZUSTAND STORE ---
  const {
    chatHistory, morningBrief, eveningReview, generatedQuests,
    isGenerating, voiceEnabled,
    toggleVoice, clearChat, sendMessage,
    generateMorningBrief, generateEveningReview, generateDailyQuests
  } = useJarvisStore()

  const { loadQuests } = useQuestStore()


  // --- useEffect 1: Load Context on Mount ---
  useEffect(() => {
    const loadContext = async () => {
      setContextLoading(true)
      try {
        const result = await collectFullContext()
        setPlayerContext(result)
        setContextLoading(false)
        // No auto API call on mount — user initiates conversation
      } catch (err) {
        console.error('Jarvis Context Error:', err)
        setContextLoading(false)
      }
    }
    loadContext()
  }, [])

  // --- useEffect 2: Auto-scroll chat ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // --- useEffect 3: Rate limit cooldown ticker ---
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimitCooldown(getTimeUntilReady())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // --- ACTIONS ---
  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return
    const text = inputText.trim()
    setInputText('')
    const response = await sendMessage(text, playerContext)
    if (voiceEnabled && response) {
      speak(response)
    }
  }

  const handleMic = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      alert('Voice recognition not supported in this browser')
      return
    }

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-IN'

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
      setIsListening(false)
      // Pass transcript directly — don't rely on stale inputText state
      const response = await sendMessage(transcript, playerContext)
      if (voiceEnabled && response) {
        speak(response)
      }
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    
    recognition.start()
  }

  const handleBriefMe = async () => {
    const response = await generateMorningBrief(playerContext)
    if (voiceEnabled && response) {
      speak(response)
    }
  }

  const handleDebrief = async () => {
    if (!dayRating) {
      alert('Please select a day rating first')
      return
    }
    await generateEveningReview(playerContext, dayRating, debriefNotes)
  }

  const handleGenerateQuests = async () => {
    setAddedQuests(new Set())
    await generateDailyQuests(playerContext)
    setQuestsVisible(true)
  }

  const handleAddQuest = async (quest, index) => {
    try {
      const { error } = await supabase.from('quests').insert([{
        title: quest.title,
        description: quest.description,
        xp_reward: quest.xp,
        domain: quest.domain,
        difficulty: quest.difficulty,
        completed: false,
        source: 'jarvis'
      }])
      if (error) throw error
      setAddedQuests(prev => new Set([...prev, index]))
      loadQuests(true) // force-refresh the quest store
    } catch (err) {
      console.error('Failed to add quest:', err)
      alert('Failed to add quest. Try again.')
    }
  }

  const showEveningDebrief = true // Always show as per requirements

  const quickPrompts = [
    'What should I focus on right now?',
    "How's my progress today?",
    'Generate my daily quests',
    'Give me a trade review',
    'Exam status update',
    'Focus mode — what to do next?'
  ]

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 font-['Inter'] text-[#1A1A2E]">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-['Inter'] font-bold text-[#1A1A2E] tracking-tight uppercase">JARVIS</h1>
          <p className="text-sm text-[#9A9590] font-['Inter']">Personal AI Assistant — Gemini 2.0 Flash</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleVoice} 
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border',
              voiceEnabled 
                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' 
                : 'bg-white border-gray-200 text-[#9A9590]'
            )}
          >
            {voiceEnabled ? <Volume2 size={14}/> : <VolumeX size={14}/>}
            {voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}
          </button>
          <div className="flex items-center gap-2 text-sm text-[#9A9590] font-['Space_Mono'] font-bold">
            <div className={clsx('w-2 h-2 rounded-full', contextLoading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500')}/>
            {contextLoading ? 'LOADING...' : 'READY'}
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT PANEL — Briefings (flex-1) */}
        <div className="flex-1 flex flex-col gap-6">

          {/* MORNING BRIEF CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-['Space_Mono'] font-bold text-[#1A1A2E] tracking-widest uppercase">Morning Brief</h2>
              <span className="text-xs text-[#9A9590] font-['Space_Mono']">{format(new Date(), 'HH:mm')}</span>
            </div>
            
            {!morningBrief ? (
              <div className="text-center py-8">
                <div className="text-8xl font-['Inter'] font-bold text-gray-100 mb-4 select-none">J</div>
                <p className="text-lg font-['Inter'] font-bold text-[#1A1A2E] mb-1">
                  {contextLoading ? 'Loading...' : `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Abhishek.`}
                </p>
                <p className="text-sm text-[#9A9590] mb-2 font-['Inter']">{format(new Date(), 'EEEE, MMMM do')}</p>
                
                {playerContext && (
                  <div className="flex justify-center gap-2 mb-6">
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 font-bold">
                      🔥 Streak: {playerContext?.player?.streak || 0} days
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">
                      💰 ₹{playerContext?.wallet?.balance || 0}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={handleBriefMe}
                  disabled={isGenerating || contextLoading}
                  className="w-full bg-[#1A1A2E] text-white font-['Space_Mono'] font-bold tracking-widest py-3 rounded-xl hover:bg-[#2a2a4e] transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'GENERATING...' : 'BRIEF ME'}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-4 border-[#E07B39] pl-4"
              >
                <p className="text-sm font-['Inter'] text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">{morningBrief}</p>
                <button
                  onClick={handleBriefMe}
                  disabled={isGenerating}
                  className="mt-4 text-xs text-[#9A9590] hover:text-[#E07B39] transition-colors flex items-center gap-1 font-bold uppercase tracking-wider"
                >
                  <RefreshCcw size={12}/> Regenerate
                </button>
              </motion.div>
            )}
          </div>

          {/* QUEST GENERATOR CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-['Space_Mono'] font-bold text-[#1A1A2E] tracking-widest uppercase">Quest Generator</h2>
              <Target size={16} className="text-[#E07B39]"/>
            </div>
            
            <button
              onClick={handleGenerateQuests}
              disabled={isGenerating || contextLoading}
              className="w-full bg-[#E07B39] text-white font-['Space_Mono'] font-bold tracking-widest py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mb-4"
            >
              {isGenerating ? 'GENERATING...' : "GENERATE TODAY'S QUESTS"}
            </button>

            <AnimatePresence>
              {questsVisible && generatedQuests.length > 0 && (
                <div className="flex flex-col gap-3">
                  {generatedQuests.map((quest, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start justify-between p-3 rounded-xl bg-[#F5F4F0] border border-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A2E] text-white font-['Space_Mono'] font-bold">{quest.domain}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-['Space_Mono'] font-bold">+{quest.xp} XP</span>
                          <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-["Space_Mono"] font-bold',
                            quest.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border border-red-100' :
                            quest.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                            'bg-green-50 text-green-600 border border-green-100'
                          )}>{quest.difficulty}</span>
                        </div>
                        <p className="text-sm font-['Inter'] font-bold text-[#1A1A2E]">{quest.title}</p>
                        <p className="text-xs text-[#9A9590] font-['Inter'] mt-0.5 leading-snug">{quest.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddQuest(quest, i)}
                        disabled={addedQuests.has(i)}
                        className={clsx(
                          'ml-3 text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold whitespace-nowrap transition-all active:scale-95',
                          addedQuests.has(i)
                            ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                            : 'bg-[#1A1A2E] text-white hover:bg-[#2a2a4e]'
                        )}
                      >
                        {addedQuests.has(i)
                          ? <><CheckCircle2 size={10}/> Added</>
                          : <><ArrowRight size={10}/> Add</>
                        }
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* EVENING DEBRIEF CARD */}
          {showEveningDebrief && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-['Space_Mono'] font-bold text-[#1A1A2E] tracking-widest uppercase">Evening Debrief</h2>
                <TrendingUp size={16} className="text-[#2D6A4F]"/>
              </div>
              
              {playerContext && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#F5F4F0] border border-gray-100">
                    <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-1 font-bold">Daily Progress</p>
                    <p className="text-xl font-['Inter'] font-bold text-[#1A1A2E]">
                      {playerContext?.today?.completedQuests || 0}/{playerContext?.today?.totalQuests || 0}
                      <span className="text-xs font-normal ml-1">done</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F4F0] border border-gray-100">
                    <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-1 font-bold">XP Earned</p>
                    <p className="text-xl font-['Inter'] font-bold text-[#2D6A4F]">
                      +{playerContext?.today?.xpEarnedToday || 0}
                      <span className="text-xs font-normal ml-1">XP</span>
                    </p>
                  </div>
                </div>
              )}

              <textarea
                value={debriefNotes}
                onChange={e => setDebriefNotes(e.target.value)}
                placeholder="What happened today that the data doesn't show? (e.g., Felt distracted early on, but pushed through DSA late session.)"
                className="w-full p-4 rounded-xl bg-[#F5F4F0] border border-gray-100 text-sm font-['Inter'] text-[#1A1A2E] placeholder-[#9A9590] resize-none focus:outline-none focus:border-[#E07B39] transition-all min-h-[120px] mb-4"
              />
              
              <div className="flex gap-2 mb-4">
                {[
                  { value: 'solid', label: 'Solid day', icon: '✅' },
                  { value: 'okay', label: 'Okay day', icon: '⚠️' },
                  { value: 'rough', label: 'Rough day', icon: '❌' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDayRating(option.value)}
                    className={clsx(
                      'flex-1 py-2.5 rounded-xl text-xs font-bold font-["Inter"] border transition-all',
                      dayRating === option.value
                        ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-sm'
                        : 'bg-white text-[#9A9590] border-gray-200 hover:border-[#1A1A2E]'
                    )}
                  >
                    <span className="mr-1">{option.icon}</span> {option.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDebrief}
                disabled={isGenerating || !dayRating}
                className="w-full bg-[#2D6A4F] text-white font-['Space_Mono'] font-bold tracking-widest py-3 rounded-xl hover:opacity-95 transition-all disabled:opacity-50 shadow-md active:scale-[0.98]"
              >
                {isGenerating ? 'GENERATING...' : 'GET DEBRIEF'}
              </button>

              {eveningReview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 border-l-4 border-[#2D6A4F] pl-4 bg-emerald-50/30 p-4 rounded-r-xl"
                >
                  <p className="text-sm font-['Inter'] text-[#1A1A2E] leading-relaxed whitespace-pre-wrap">{eveningReview}</p>
                </motion.div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANEL — Chat (sticky) */}
        <div className="w-full lg:w-[460px] lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 120px)', minHeight: '600px' }}>
            
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                <h2 className="text-xs font-['Space_Mono'] font-bold text-[#1A1A2E] tracking-widest uppercase">Talk to JARVIS</h2>
              </div>
              <button 
                onClick={clearChat} 
                className="p-2 rounded-lg hover:bg-red-50 text-[#9A9590] hover:text-red-500 transition-colors"
                title="Clear History"
              >
                <Trash2 size={16}/>
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#fcfcfb]">
              {chatHistory.length === 0 && !isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="text-6xl font-['Inter'] font-bold text-gray-100 select-none">J</div>
                  <p className="text-xs text-[#9A9590] font-['Space_Mono'] text-center">
                    {contextLoading ? 'INITIALIZING SYSTEMS...' : 'JARVIS READY — SAY SOMETHING'}
                  </p>
                </div>
              )}

              {chatHistory.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div className={clsx(
                    'max-w-[85%] px-4 py-3 rounded-2xl text-sm font-["Inter"] leading-relaxed shadow-sm',
                    msg.role === 'user'
                      ? 'bg-[#1A1A2E] text-white rounded-tr-sm'
                      : 'bg-white text-[#3D3830] border-l-4 border-[#E07B39] rounded-tl-sm border border-gray-100'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={clsx('text-[10px] mt-1 font-bold font-["Space_Mono"] uppercase tracking-tighter text-right', msg.role === 'user' ? 'text-white/40' : 'text-[#9A9590]')}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isGenerating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border-l-4 border-[#E07B39] px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <div className="w-1.5 h-1.5 bg-[#E07B39] rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                      <div className="w-1.5 h-1.5 bg-[#E07B39] rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                      <div className="w-1.5 h-1.5 bg-[#E07B39] rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef}/>
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-3 border-t border-gray-50 bg-white">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setInputText(prompt); }}
                    className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full bg-[#F5F4F0] text-[#9A9590] hover:bg-[#1A1A2E] hover:text-white transition-all border border-transparent hover:border-[#1A1A2E] font-['Space_Mono']"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-gray-100 bg-white">
              {/* Rate limit cooldown banner */}
              <AnimatePresence>
                {rateLimitCooldown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-100"
                  >
                    <Clock size={13} className="text-[#E07B39] shrink-0" />
                    <p className="text-xs font-['Space_Mono'] font-bold text-[#E07B39] uppercase tracking-wider">
                      Rate limited — ready in {rateLimitCooldown}s
                    </p>
                    <div className="flex-1 h-1 bg-orange-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#E07B39] rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(rateLimitCooldown / 60) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 flex gap-2 items-end">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={rateLimitCooldown > 0 ? `Cooling down... ${rateLimitCooldown}s` : "Ask JARVIS anything..."}
                  rows={1}
                  disabled={rateLimitCooldown > 0}
                  className={clsx(
                    "flex-1 p-3.5 rounded-xl border border-transparent text-sm font-['Inter'] text-[#1A1A2E] placeholder-[#9A9590] resize-none focus:outline-none transition-all",
                    rateLimitCooldown > 0
                      ? 'bg-orange-50 placeholder-orange-300 cursor-not-allowed'
                      : 'bg-[#F5F4F0] focus:border-[#E07B39]'
                  )}
                />
                <button
                  onClick={handleMic}
                  disabled={isGenerating || rateLimitCooldown > 0}
                  className={clsx(
                    'p-3.5 rounded-xl transition-all shadow-sm',
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-[#F5F4F0] text-[#9A9590] hover:bg-[#1A1A2E] hover:text-white active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <Mic size={18}/>
                </button>
                <button
                  onClick={handleSend}
                  disabled={isGenerating || !inputText.trim() || rateLimitCooldown > 0}
                  className="p-3.5 rounded-xl bg-[#1A1A2E] text-white hover:bg-[#2a2a4e] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg active:scale-95"
                >
                  <Send size={18}/>
                </button>
              </div>
            </div>


          </div>
        </div>

      </div>
    </div>
  )
}

export default AIPlanner;
