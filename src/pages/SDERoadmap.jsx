import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSdeStore } from '../store/sdeStore'
import { SDE_TRACK_DATA, getCurrentPhase, getPhaseProgress, getAllDsaTopics } from '../lib/sdeTrackData'
import { differenceInDays } from 'date-fns'
import { clsx } from 'clsx'
import { triggerJarvisToast } from '../components/JarvisToast'
import ProgressTimeline from '../components/ProgressTimeline'
import {
  Code2, Lock, ChevronDown, ChevronUp,
  Check, ExternalLink, Target, Calendar,
  Zap, BookOpen, RefreshCw
} from 'lucide-react'

const SDERoadmap = () => {
  const [activePhase, setActivePhase] = useState('DSA')
  const [activeSection, setActiveSection] = useState(null)
  const [expandedTopic, setExpandedTopic] = useState(null)
  const [dsaInput, setDsaInput] = useState('')
  const [weekExpanded, setWeekExpanded] = useState(true)

  const {
    progress,
    dsaSolved,
    loadRoadmap,
    toggleTopic,
    updateDsaSolved,
    saveNotes,
    weeklyGoals,
    currentSdeWeek,
    isGeneratingGoals,
    generateSdeWeekGoals,
    loadSdeWeeklyGoals
  } = useSdeStore()

  useEffect(() => {
    loadRoadmap()
    loadSdeWeeklyGoals()
  }, [])

  const startDate = new Date(SDE_TRACK_DATA.startDate)
  const daysElapsed = Math.max(0, differenceInDays(new Date(), startDate))
  const dsaPercent = Math.min(100, Math.floor((dsaSolved / 474) * 100))
  const currentPhaseInfo = getCurrentPhase(progress, dsaSolved)

  const activePhaseData = SDE_TRACK_DATA.phases.find(
    p => p.id === activePhase
  )

  const isPhaseUnlocked = (phase) => {
    if (!phase.unlockAfter) return true
    const prevPhase = SDE_TRACK_DATA.phases.find(
      p => p.id === phase.unlockAfter
    )
    if (!prevPhase) return true
    if (phase.unlockAfter === 'DSA') {
      return dsaPercent >= (phase.unlockAtPercent || 60)
    }
    return getPhaseProgress(phase.unlockAfter, progress) >= 
      (phase.unlockAtPercent || 100)
  }

  const currentWeekGoal = weeklyGoals[0]
  const parsedGoal = currentWeekGoal?.goal_text
    ? (() => { 
        try { return JSON.parse(currentWeekGoal.goal_text) }
        catch { return null }
      })()
    : null

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24">

      {/* ── HERO HEADER ── */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 mb-5 text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={13} className="text-[#E07B39]"/>
              <p className="text-[10px] font-bold text-white/40
                font-['Space_Mono'] uppercase tracking-widest">
                8-Month SDE Track · Striver A2Z First
              </p>
            </div>
            <h1 className="text-2xl font-bold text-white 
              font-['Inter'] mb-1">
              SDE Roadmap
            </h1>
            <p className="text-xs text-white/50 font-['Inter']">
              Target: {SDE_TRACK_DATA.targetRole} · 
              {SDE_TRACK_DATA.dsaTarget} DSA problems
            </p>
          </div>
          {/* DSA progress ring */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" 
                viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                <motion.circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#E07B39" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  animate={{
                    strokeDashoffset: 
                      2 * Math.PI * 15 * (1 - dsaPercent / 100)
                  }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center 
                justify-center">
                <p className="text-sm font-bold text-white 
                  font-['Space_Mono']">
                  {dsaPercent}%
                </p>
              </div>
            </div>
            <p className="text-[9px] text-white/40 
              font-['Space_Mono'] uppercase tracking-wider mt-1">
              DSA Done
            </p>
          </div>
        </div>

        {/* DSA counter input */}
        <div className="bg-white/5 rounded-xl p-3 mb-4 
          flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[9px] text-white/40 
              font-['Space_Mono'] uppercase tracking-widest mb-1">
              LeetCode / DSA Problems Solved
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={dsaInput !== '' ? dsaInput : dsaSolved}
                onChange={e => setDsaInput(e.target.value)}
                placeholder={dsaSolved.toString()}
                className="w-20 bg-transparent text-2xl font-bold 
                  text-white font-['Space_Mono'] border-none 
                  focus:outline-none"
              />
              <span className="text-white/30 font-['Space_Mono']">
                / 474
              </span>
              {dsaInput !== '' && parseInt(dsaInput) !== dsaSolved && (
                <button
                  onClick={() => {
                    updateDsaSolved(parseInt(dsaInput))
                    setDsaInput('')
                  }}
                  className="bg-[#E07B39] text-white px-3 py-1
                    rounded-lg text-[10px] font-bold 
                    font-['Space_Mono'] uppercase tracking-wider"
                >
                  Update
                </button>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] text-white/40 
              font-['Space_Mono'] uppercase tracking-widest">
              Day {daysElapsed}
            </p>
            <p className="text-sm font-bold text-[#E07B39]
              font-['Space_Mono']">
              {currentPhaseInfo.phase.name.split(' — ')[0]}
            </p>
          </div>
        </div>

        {/* Phase progress pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}>
          {SDE_TRACK_DATA.phases.map(phase => {
            const unlocked = isPhaseUnlocked(phase)
            const prog = phase.id === 'DSA' 
              ? dsaPercent 
              : getPhaseProgress(phase.id, progress)
            const isActive = activePhase === phase.id
            
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                  'text-[9px] font-bold font-["Space_Mono"]',
                  'uppercase tracking-wider whitespace-nowrap',
                  'transition-all shrink-0',
                  isActive
                    ? 'text-[#1A1A2E]'
                    : unlocked
                      ? 'bg-white/10 text-white/60 hover:bg-white/15'
                      : 'bg-white/5 text-white/20'
                )}
                style={isActive 
                  ? { backgroundColor: phase.color, color: 'white' }
                  : {}}
              >
                {!unlocked && <Lock size={9}/>}
                {phase.name.split(' — ')[0]}
                {prog > 0 && (
                  <span className={clsx(
                    'text-[8px]',
                    isActive ? 'text-white/60' : 'text-white/40'
                  )}>
                    {prog}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── PROGRESS TIMELINE ── */}
      <div className="mb-5">
        <ProgressTimeline
          phases={SDE_TRACK_DATA.phases}
          currentPhaseId={currentPhaseInfo.phase.id}
          getProgress={(phaseId) => {
            if (phaseId === 'DSA') return dsaPercent
            return getPhaseProgress(phaseId, progress)
          }}
          isLocked={(phase) => !isPhaseUnlocked(phase)}
          onPhaseClick={(phaseId) => setActivePhase(phaseId)}
        />
      </div>

      {/* ── WEEKLY GOALS PANEL ── */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8]
        mb-5 overflow-hidden">
        <div className="flex items-center justify-between p-5
          cursor-pointer select-none"
          onClick={() => setWeekExpanded(!weekExpanded)}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A2E] rounded-xl
              flex items-center justify-center">
              <Calendar size={14} className="text-white"/>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest">
                Week {currentSdeWeek} SDE Goals
              </p>
              <p className="text-sm font-bold text-[#1A1A2E]
                font-['Inter']">
                {parsedGoal?.week_title || 
                  (isGeneratingGoals 
                    ? 'Generating...' 
                    : 'This Week\'s Study Plan')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGeneratingGoals && (
              <RefreshCw size={13} className="text-[#E07B39] 
                animate-spin"/>
            )}
            {weekExpanded 
              ? <ChevronUp size={15} className="text-[#9A9590]"/>
              : <ChevronDown size={15} className="text-[#9A9590]"/>
            }
          </div>
        </div>

        <AnimatePresence>
          {weekExpanded && parsedGoal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-[#F5F4F0]
                pt-4 space-y-4">
                
                {/* DSA focus + LeetCode target */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1A1A2E] rounded-xl p-3">
                    <p className="text-[9px] text-white/40
                      font-['Space_Mono'] uppercase tracking-widest mb-1">
                      DSA Focus
                    </p>
                    <p className="text-xs font-bold text-white
                      font-['Inter']">
                      {parsedGoal.dsa_focus}
                    </p>
                  </div>
                  <div className="bg-[#E07B39]/10 rounded-xl p-3
                    border border-[#E07B39]/20">
                    <p className="text-[9px] text-[#E07B39]
                      font-['Space_Mono'] uppercase tracking-widest mb-1">
                      Target This Week
                    </p>
                    <p className="text-lg font-bold text-[#E07B39]
                      font-['Space_Mono']">
                      +{parsedGoal.dsa_problems_target} problems
                    </p>
                  </div>
                </div>

                {/* Daily breakdown */}
                <div>
                  <p className="text-[9px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest mb-3">
                    Daily Plan
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {parsedGoal.daily_breakdown?.map((day, di) => {
                      const isToday = day.day === new Date()
                        .toLocaleDateString('en-US', { weekday: 'long' })
                      return (
                        <div key={di} className={clsx(
                          'p-3 rounded-xl border',
                          isToday
                            ? 'bg-[#FFF0E6] border-[#E07B39]'
                            : 'bg-[#F5F4F0] border-transparent'
                        )}>
                          <div className="flex justify-between mb-1">
                            <p className={clsx(
                              'text-[10px] font-bold font-["Space_Mono"]',
                              'uppercase tracking-wider',
                              isToday ? 'text-[#E07B39]' : 'text-[#9A9590]'
                            )}>
                              {day.day}{isToday && ' ← Today'}
                            </p>
                            <span className="text-[9px] text-[#9A9590]
                              font-['Space_Mono']">
                              {day.hours}h
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#1A1A2E]
                            font-['Inter'] mb-0.5">
                            {day.dsa_task}
                          </p>
                          {day.secondary_task && (
                            <p className="text-[10px] text-[#9A9590]
                              font-['Inter']">
                              + {day.secondary_task}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Leetcode tip */}
                {parsedGoal.leetcode_tip && (
                  <div className="bg-[#F5F4F0] rounded-xl p-3
                    flex gap-2">
                    <Zap size={13} className="text-[#E07B39] 
                      shrink-0 mt-0.5"/>
                    <p className="text-xs text-[#1A1A2E] font-['Inter']
                      leading-relaxed">
                      <strong>Technique:</strong> {parsedGoal.leetcode_tip}
                    </p>
                  </div>
                )}

                {/* Deliverable */}
                <div className="bg-[#1A1A2E] rounded-xl p-3 flex gap-2">
                  <Target size={13} className="text-[#E07B39] 
                    shrink-0 mt-0.5"/>
                  <p className="text-xs text-white font-['Inter']">
                    {parsedGoal.weekly_deliverable}
                  </p>
                </div>

                {/* Generate next week */}
                <button
                  onClick={() => generateSdeWeekGoals(currentSdeWeek + 1)}
                  disabled={isGeneratingGoals}
                  className="w-full bg-[#1A6B4A] text-white py-2.5
                    rounded-xl text-xs font-bold font-['Space_Mono']
                    uppercase tracking-wider hover:opacity-90
                    transition-all disabled:opacity-50
                    flex items-center justify-center gap-2"
                >
                  <Check size={13}/>
                  Mark Week Complete → Generate Week {currentSdeWeek + 1}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MAIN CONTENT: 2 column layout ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* LEFT — Phase list */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-3">
          {SDE_TRACK_DATA.phases.map(phase => {
            const unlocked = isPhaseUnlocked(phase)
            const prog = phase.id === 'DSA' 
              ? dsaPercent 
              : getPhaseProgress(phase.id, progress)
            const isActive = activePhase === phase.id
            const allTopics = phase.id === 'DSA'
              ? getAllDsaTopics(phase)
              : phase.sections.flatMap(s => s.topics || [])
            
            return (
              <button
                key={phase.id}
                onClick={() => {
                  if (!unlocked) {
                    triggerJarvisToast({
                      type: 'info',
                      title: 'Locked',
                      message: phase.unlockCondition,
                      duration: 3000
                    })
                    return
                  }
                  setActivePhase(phase.id)
                  setActiveSection(null)
                }}
                className={clsx(
                  'w-full text-left p-4 rounded-2xl border',
                  'transition-all',
                  isActive
                    ? 'bg-white border-[#E5E0D8] shadow-sm'
                    : unlocked
                      ? 'bg-white/60 border-transparent hover:border-[#E5E0D8]'
                      : 'bg-[#F5F4F0] border-transparent opacity-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center
                      justify-center"
                      style={{ backgroundColor: phase.color }}>
                      {!unlocked 
                        ? <Lock size={10} className="text-white"/>
                        : <span className="text-[10px] font-bold 
                            text-white font-['Space_Mono']">
                            {phase.number}
                          </span>
                      }
                    </div>
                    <p className="text-xs font-bold text-[#1A1A2E]
                      font-['Inter'] truncate max-w-[140px]">
                      {phase.name.split(' — ')[0]}
                    </p>
                  </div>
                  <p className="text-[10px] font-bold 
                    font-['Space_Mono']"
                    style={{ color: unlocked ? phase.color : '#9A9590' }}>
                    {prog}%
                  </p>
                </div>
                <p className="text-[9px] text-[#9A9590] font-['Inter']
                  mb-2 text-left">
                  {phase.tagline}
                </p>
                <div className="h-1 bg-[#E5E0D8] rounded-full 
                  overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${prog}%`,
                      backgroundColor: phase.color 
                    }}/>
                </div>
                <p className="text-[9px] text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-wider mt-1.5">
                  {phase.duration} · {allTopics.length} topics
                </p>
                {!unlocked && (
                  <p className="text-[9px] text-[#C0392B]
                    font-['Inter'] mt-1">
                    Unlocks: {phase.unlockCondition}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* RIGHT — Phase content */}
        <div className="flex-1 min-w-0">
          {activePhaseData && (() => {
            const unlocked = isPhaseUnlocked(activePhaseData)
            
            if (!unlocked) {
              return (
                <div className="bg-white rounded-2xl border 
                  border-[#E5E0D8] p-12 text-center">
                  <Lock size={32} className="text-[#E5E0D8] 
                    mx-auto mb-3"/>
                  <p className="text-sm font-bold text-[#1A1A2E]
                    font-['Inter'] mb-1">
                    Phase Locked
                  </p>
                  <p className="text-xs text-[#9A9590] font-['Inter']">
                    {activePhaseData.unlockCondition}
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-4">
                {/* Phase header card */}
                <div className="bg-white rounded-2xl border 
                  border-[#E5E0D8] p-5">
                  <div className="flex items-start justify-between 
                    gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold
                          font-['Space_Mono'] uppercase tracking-wider
                          px-2 py-0.5 rounded-full text-white"
                          style={{ 
                            backgroundColor: activePhaseData.color 
                          }}>
                          Phase {activePhaseData.number}
                        </span>
                        <span className="text-[10px] text-[#9A9590]
                          font-['Space_Mono']">
                          {activePhaseData.duration}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#1A1A2E]
                        font-['Inter']">
                        {activePhaseData.name}
                      </h2>
                      <p className="text-xs text-[#9A9590] font-['Inter']
                        mt-0.5 italic">
                        {activePhaseData.tagline}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold 
                        font-['Space_Mono']"
                        style={{ color: activePhaseData.color }}>
                        {activePhaseData.id === 'DSA' 
                          ? `${dsaPercent}%`
                          : `${getPhaseProgress(
                              activePhaseData.id, progress)}%`}
                      </p>
                    </div>
                  </div>

                  {/* Resource link */}
                  {activePhaseData.resource && (
                    <div className="flex items-center gap-2 p-3
                      bg-[#F5F4F0] rounded-xl">
                      <BookOpen size={13} className="text-[#E07B39]
                        shrink-0"/>
                      <p className="text-xs font-bold text-[#1A1A2E]
                        font-['Inter'] flex-1">
                        {activePhaseData.resource}
                      </p>
                      {activePhaseData.resourceUrl && (
                        <a href={activePhaseData.resourceUrl}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[9px]
                            text-[#E07B39] font-['Space_Mono'] uppercase
                            tracking-wider">
                          Open <ExternalLink size={9}/>
                        </a>
                      )}
                    </div>
                  )}

                  {/* DSA-specific: problem counter */}
                  {activePhaseData.id === 'DSA' && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { label: 'Solved', value: dsaSolved, 
                          color: '#1A6B4A' },
                        { label: 'Remaining', 
                          value: Math.max(0, 474 - dsaSolved), 
                          color: '#E07B39' },
                        { label: 'Daily Target', 
                          value: Math.ceil(Math.max(0, 474 - dsaSolved) / 60),
                          color: '#1A1A2E',
                          suffix: '/day'
                        }
                      ].map(stat => (
                        <div key={stat.label} 
                          className="bg-[#F5F4F0] rounded-lg p-2.5
                            text-center">
                          <p className="text-lg font-bold 
                            font-['Space_Mono']"
                            style={{ color: stat.color }}>
                            {stat.value}{stat.suffix || ''}
                          </p>
                          <p className="text-[9px] text-[#9A9590]
                            font-['Space_Mono'] uppercase 
                            tracking-wider">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sections list */}
                {activePhaseData.sections.map(section => {
                  const isDsa = activePhaseData.id === 'DSA'
                  const sectionTopics = isDsa
                    ? (section.subsections ? section.subsections.flatMap(sub => sub.problems || []) : [])
                    : (section.topics || [])
                  const sectionDone = sectionTopics.filter(
                    t => progress[t.id]?.done
                  ).length
                  const isExpanded = activeSection === section.id
                  
                  return (
                    <div key={section.id} 
                      className="bg-white rounded-2xl border 
                        border-[#E5E0D8] overflow-hidden">
                      {/* Section header */}
                      <button
                        onClick={() => setActiveSection(
                          isExpanded ? null : section.id
                        )}
                        className="w-full flex items-center 
                          justify-between p-4 hover:bg-[#F5F4F0]
                          transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {isExpanded 
                              ? <ChevronUp size={14} className="text-[#9A9590]"/>
                              : <ChevronDown size={14} className="text-[#9A9590]"/>
                            }
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-[#1A1A2E]
                              font-['Inter']">
                              {section.name}
                            </p>
                            <p className="text-[10px] text-[#9A9590]
                              font-['Space_Mono']">
                              {sectionDone}/{sectionTopics.length} done
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-[#F5F4F0]
                            rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ 
                                width: `${sectionTopics.length > 0 ? (sectionDone / 
                                  sectionTopics.length) * 100 : 0}%`,
                                backgroundColor: activePhaseData.color 
                              }}/>
                          </div>
                        </div>
                      </button>

                      {/* Topics/Problems List */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#F5F4F0] divide-y divide-[#F5F4F0]">
                              {isDsa ? (
                                // DSA nested subsections
                                section.subsections?.map(sub => (
                                  <div key={sub.id || sub.name} className="bg-white">
                                    {/* Subsection header */}
                                    <div className="bg-[#F5F4F0]/40 px-4 py-2 border-b border-[#F5F4F0]">
                                      <p className="text-[10px] font-bold text-[#E07B39] font-['Space_Mono'] uppercase tracking-wider">
                                        {sub.name}
                                      </p>
                                    </div>
                                    <div className="divide-y divide-[#F5F4F0]">
                                      {sub.problems?.map(problem => {
                                        const done = progress[problem.id]?.done
                                        const isProblemExpanded = expandedTopic === problem.id
                                        
                                        return (
                                          <div key={problem.id}>
                                            <div className={clsx(
                                              'flex items-center gap-3 px-4 py-3',
                                              'cursor-pointer hover:bg-[#F5F4F0]',
                                              'transition-colors'
                                            )}
                                              onClick={() => setExpandedTopic(
                                                isProblemExpanded ? null : problem.id
                                              )}
                                            >
                                              <button
                                                onClick={e => {
                                                  e.stopPropagation()
                                                  toggleTopic(
                                                    problem.id, problem.title,
                                                    activePhaseData.id
                                                  )
                                                }}
                                                className={clsx(
                                                  'w-5 h-5 rounded border-2',
                                                  'flex items-center justify-center',
                                                  'shrink-0 transition-all',
                                                  done
                                                    ? 'border-transparent text-white'
                                                    : 'border-[#E5E0D8] bg-white'
                                                )}
                                                style={done ? { 
                                                  backgroundColor: 
                                                    activePhaseData.color 
                                                } : {}}
                                              >
                                                {done && (
                                                  <Check size={11} 
                                                    className="text-white" 
                                                    strokeWidth={3}/>
                                                )}
                                              </button>
                                              <div className="flex-1 min-w-0">
                                                <p className={clsx(
                                                  'text-sm font-["Inter"]',
                                                  done 
                                                    ? 'text-[#9A9590] line-through' 
                                                    : 'text-[#1A1A2E] font-bold'
                                                )}>
                                                  {problem.title}
                                                </p>
                                              </div>
                                              
                                              {/* Difficulty badge */}
                                              {problem.difficulty && (
                                                <span className={clsx(
                                                  "text-[8px] font-bold font-['Space_Mono'] uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                  problem.difficulty === 'Easy' && "bg-[#1A6B4A]/10 text-[#1A6B4A]",
                                                  problem.difficulty === 'Medium' && "bg-[#E07B39]/10 text-[#E07B39]",
                                                  problem.difficulty === 'Hard' && "bg-[#C0392B]/10 text-[#C0392B]"
                                                )}>
                                                  {problem.difficulty}
                                                </span>
                                              )}
                                              
                                              {/* External link if provided */}
                                              {problem.link && (
                                                <a
                                                  href={problem.link}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  onClick={e => e.stopPropagation()}
                                                  className="text-[#9A9590] hover:text-[#E07B39]"
                                                >
                                                  <ExternalLink size={12}/>
                                                </a>
                                              )}
                                            </div>
                                            
                                            {/* Notes expansion */}
                                            {isProblemExpanded && (
                                              <div className="px-4 pb-3 bg-[#F5F4F0]">
                                                <textarea
                                                  value={progress[problem.id]?.notes || ''}
                                                  onChange={e => 
                                                    saveNotes(problem.id, e.target.value)}
                                                  placeholder="Notes, key patterns, links..."
                                                  className="w-full bg-white 
                                                    rounded-lg p-2.5 text-xs
                                                    text-[#1A1A2E] font-['Inter']
                                                    border border-[#E5E0D8]
                                                    focus:outline-none 
                                                    focus:border-[#E07B39]
                                                    resize-none min-h-[60px]"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                // Flat topics list for other phases
                                section.topics?.map(topic => {
                                  const done = progress[topic.id]?.done
                                  const isTopicExpanded = 
                                    expandedTopic === topic.id
                                  
                                  return (
                                    <div key={topic.id}>
                                      <div className={clsx(
                                        'flex items-center gap-3 px-4 py-3',
                                        'cursor-pointer hover:bg-[#F5F4F0]',
                                        'transition-colors'
                                      )}
                                        onClick={() => setExpandedTopic(
                                          isTopicExpanded ? null : topic.id
                                        )}
                                      >
                                        <button
                                          onClick={e => {
                                            e.stopPropagation()
                                            toggleTopic(
                                              topic.id, topic.title,
                                              activePhaseData.id
                                            )
                                          }}
                                          className={clsx(
                                            'w-5 h-5 rounded border-2',
                                            'flex items-center justify-center',
                                            'shrink-0 transition-all',
                                            done
                                              ? 'border-transparent text-white'
                                              : 'border-[#E5E0D8] bg-white'
                                          )}
                                          style={done ? { 
                                            backgroundColor: 
                                              activePhaseData.color 
                                          } : {}}
                                        >
                                          {done && (
                                            <Check size={11} 
                                              className="text-white" 
                                              strokeWidth={3}/>
                                          )}
                                        </button>
                                        <p className={clsx(
                                          'text-sm font-["Inter"] flex-1',
                                          done 
                                            ? 'text-[#9A9590] line-through' 
                                            : 'text-[#1A1A2E] font-bold'
                                        )}>
                                          {topic.title}
                                        </p>
                                        {done && (
                                          <Check size={13} 
                                            style={{ 
                                              color: activePhaseData.color 
                                            }}/>
                                        )}
                                      </div>
                                      
                                      {/* Notes expansion */}
                                      {isTopicExpanded && (
                                        <div className="px-4 pb-3 
                                          bg-[#F5F4F0]">
                                          <textarea
                                            value={progress[topic.id]
                                              ?.notes || ''}
                                            onChange={e => 
                                              saveNotes(topic.id, 
                                                e.target.value)}
                                            placeholder="Notes, key patterns, links..."
                                            className="w-full bg-white 
                                              rounded-lg p-2.5 text-xs
                                              text-[#1A1A2E] font-['Inter']
                                              border border-[#E5E0D8]
                                              focus:outline-none 
                                              focus:border-[#E07B39]
                                              resize-none min-h-[60px]"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default SDERoadmap
