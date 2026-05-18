import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAiTrackStore, AI_TRACK_DATA } from '../store/aiTrackStore'
import ProgressTimeline from '../components/ProgressTimeline'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInDays, addDays } from 'date-fns'
import { clsx } from 'clsx'
import {
  Brain, Code2, Cpu, ChevronDown, ChevronUp,
  ChevronRight, BookOpen, FlaskConical, Play,
  Check, Circle, ExternalLink, Zap, Target,
  TrendingUp, Clock, Star, Layers, Bot,
  RefreshCw, X, Building, Wallet, Calendar,
  ArrowRight, Compass, BarChart3, Trophy
} from 'lucide-react'

const AIEngineerTrack = () => {
  const [activeTab, setActiveTab] = useState('roadmap')
  const [activeCluster, setActiveCluster] = useState('A')
  const [activeSection, setActiveSection] = useState(null)
  const [expandedTopic, setExpandedTopic] = useState(null)
  const [explorerTopic, setExplorerTopic] = useState(null)
  const [notesTopicId, setNotesTopicId] = useState(null)
  const [notesValue, setNotesValue] = useState('')
  const [minuteInputs, setMinuteInputs] = useState({})
  const notesTimer = useRef(null)

  const {
    progress, difficultyRatings, isLoadingProgress, isGeneratingExploration, activeExploration,
    completedClusters, clusterCompletionLoaded,
    topicMinutes, loadTopicTime, logTopicTime, getSectionMinutes, getClusterMinutes, getSlowestTopics,
    loadProgress, loadCompletedClusters, togglePhase1, togglePhase2, checkClusterCompletion,
    saveTopicNotes, generateExploration, loadExploration, clearExploration,
    rateTopic, getRevisionQueue
  } = useAiTrackStore()

  useEffect(() => { 
    loadProgress()
    loadCompletedClusters()
    loadTopicTime()
  }, [])

  // Overall stats
  const allTopics = useMemo(() => {
    return AI_TRACK_DATA.clusters.flatMap(c =>
      c.sections.flatMap(s =>
        s.topics.map(t => ({ ...t, cluster: c.id, section: s }))
      )
    )
  }, [])

  const totalTopics = allTopics.length
  const phase1Done = allTopics.filter(t => progress[t.id]?.phase1_done).length
  const phase2Done = allTopics.filter(t => progress[t.id]?.phase2_done).length
  const overallPercent = totalTopics > 0 ? Math.floor((phase2Done / totalTopics) * 100) : 0

  // Days elapsed since start
  const startDate = new Date(AI_TRACK_DATA.startDate)
  const today = new Date()
  const daysElapsed = Math.max(0, differenceInDays(today, startDate))
  const daysTotal = 14 * 30 // 14 months approx
  const timePercent = Math.min(100, Math.floor((daysElapsed / daysTotal) * 100))

  // Current phase
  const currentPhase = useMemo(() => {
    const elapsed = daysElapsed
    if (elapsed < 60) return AI_TRACK_DATA.phases[0]
    if (elapsed < 120) return AI_TRACK_DATA.phases[1]
    if (elapsed < 210) return AI_TRACK_DATA.phases[2]
    if (elapsed < 300) return AI_TRACK_DATA.phases[3]
    return AI_TRACK_DATA.phases[4]
  }, [daysElapsed])

  // Active cluster data
  const activeClusterData = useMemo(() =>
    AI_TRACK_DATA.clusters.find(c => c.id === activeCluster),
  [activeCluster])

  // Section stats
  const getSectionStats = (section) => {
    const total = section.topics.length
    const p1 = section.topics.filter(t => progress[t.id]?.phase1_done).length
    const p2 = section.topics.filter(t => progress[t.id]?.phase2_done).length
    return { total, p1, p2, percent: total > 0 ? Math.floor((p2 / total) * 100) : 0 }
  }

  // All papers across roadmap (unique)
  const allPapers = useMemo(() => {
    const seen = new Set()
    return AI_TRACK_DATA.clusters.flatMap(c =>
      c.sections.flatMap(s =>
        (s.papers || []).filter(p => {
          if (seen.has(p.title)) return false
          seen.add(p.title)
          return true
        }).map(p => ({ ...p, section: s.name, cluster: c.id }))
      )
    )
  }, [])

  // All books across roadmap (unique)
  const allBooks = useMemo(() => {
    const seen = new Set()
    return AI_TRACK_DATA.clusters.flatMap(c =>
      c.sections.flatMap(s =>
        (s.books || []).filter(b => {
          if (seen.has(b.title)) return false
          seen.add(b.title)
          return true
        }).map(b => ({ ...b, section: s.name, cluster: c.id }))
      )
    )
  }, [])

  const handleTopicClick = async (topic, section) => {
    if (expandedTopic === topic.id) {
      setExpandedTopic(null)
      setExplorerTopic(null)
      clearExploration()
      return
    }
    setExpandedTopic(topic.id)
    setNotesTopicId(topic.id)
    setNotesValue(progress[topic.id]?.notes || '')
    // Load existing exploration if any
    await loadExploration(topic.id)
  }

  const handleGenerateExploration = async (topic, section) => {
    setExplorerTopic(topic.id)
    await generateExploration(topic, section)
  }

  const handleNotesChange = (val, topicId) => {
    setNotesValue(val)
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => {
      saveTopicNotes(topicId, val)
    }, 1500)
  }

  const renderRoadmapTab = () => {
    const slowestTopics = getSlowestTopics()
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {AI_TRACK_DATA.clusters.map((cluster, i) => {
            const clusterTopics = cluster.sections.flatMap(s => s.topics)
            const clusterDone = clusterTopics.filter(t => progress[t.id]?.phase2_done).length
            const clusterPercent = clusterTopics.length > 0 ? Math.round((clusterDone / clusterTopics.length) * 100) : 0

            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setActiveCluster(cluster.id)
                  setActiveSection(null)
                }}
                className={clsx(
                  'bg-white rounded-2xl border p-5 cursor-pointer transition-all',
                  activeCluster === cluster.id
                    ? 'border-[#1A1A2E] ring-4 ring-[#1A1A2E]/5'
                    : 'border-[#E5E0D8] hover:border-[#1A1A2E]/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold font-['Space_Mono']"
                      style={{ backgroundColor: cluster.color }}>
                      {cluster.id}
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']">{cluster.name}</p>
                  </div>
                  <p className="text-[10px] font-bold font-['Space_Mono']" style={{ color: cluster.color }}>{clusterPercent}%</p>
                </div>

                {completedClusters[cluster.id] && (
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Trophy size={11} style={{ color: cluster.color }}/>
                    <p className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-wider" style={{ color: cluster.color }}>
                      Mastered {completedClusters[cluster.id].completedAt}
                    </p>
                  </div>
                )}

                {getClusterMinutes(cluster.id) > 0 && (
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider mt-1">
                    {getClusterMinutes(cluster.id) >= 60 
                      ? `${Math.floor(getClusterMinutes(cluster.id)/60)}h ${getClusterMinutes(cluster.id)%60}m` 
                      : `${getClusterMinutes(cluster.id)}m`} logged
                  </p>
                )}

                <div className="h-1 bg-[#F5F4F0] rounded-full overflow-hidden mt-3">
                  <div className="h-full rounded-full" style={{ width: `${clusterPercent}%`, backgroundColor: cluster.color }} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {slowestTopics.length >= 3 && (
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-3">
              Time Investment
            </p>
            <div className="space-y-2">
              {slowestTopics.slice(0,3).map((t) => (
                <div key={t.topicId} className="flex items-center justify-between">
                  <p className="text-xs text-[#1A1A2E] font-['Inter'] flex-1 truncate mr-2">
                    {t.topicTitle}
                  </p>
                  <span className="text-xs font-bold text-[#E07B39] font-['Space_Mono'] shrink-0">
                    {t.minutes >= 60 
                      ? `${Math.floor(t.minutes/60)}h ${t.minutes%60}m`
                      : `${t.minutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">

      {/* ── HERO HEADER ── */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={14} className="text-[#E07B39]"/>
              <p className="text-[10px] font-bold text-white/40
                font-['Space_Mono'] uppercase tracking-widest">
                14-Month Plan · CampusX AI Roadmap 2026
              </p>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Inter']
              tracking-tight mb-1">
              AI Engineer Track
            </h1>
            <p className="text-xs text-white/50 font-['Inter']">
              {totalTopics} topics · {allPapers.length} research papers · 
              {allBooks.length} books · 8 projects
            </p>
          </div>

          {/* Overall progress ring */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                <motion.circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="#E07B39" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 15}`}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 15 * (1 - overallPercent / 100)
                  }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-bold text-white font-['Space_Mono']">
                  {overallPercent}%
                </p>
              </div>
            </div>
            <p className="text-[9px] text-white/40 font-['Space_Mono']
              uppercase tracking-wider mt-1">
              Complete
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Explored', value: phase1Done, total: totalTopics, color: '#E07B39' },
            { label: 'Studied', value: phase2Done, total: totalTopics, color: '#1A6B4A' },
            { label: 'Day', value: daysElapsed, total: daysTotal, color: '#7C3AED', suffix: ` of ${daysTotal}` },
            { label: 'Phase', value: currentPhase.number, total: 5, color: currentPhase.color, suffix: '/5' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[9px] text-white/40 font-['Space_Mono']
                uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-lg font-bold font-['Space_Mono']"
                style={{ color: stat.color }}>
                {stat.value}
                <span className="text-xs text-white/30 ml-0.5">
                  {stat.suffix || `/${stat.total}`}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Time progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] text-white/40 font-['Space_Mono']
              uppercase tracking-widest">
              Timeline — {currentPhase.name}
            </p>
            <p className="text-[9px] text-white/40 font-['Space_Mono']">
              {currentPhase.duration}
            </p>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: currentPhase.color }}
            />
          </div>
        </div>
      </div>

      {/* ── PROGRESS TIMELINE ── */}
      <div className="mb-6">
        <ProgressTimeline
          phases={AI_TRACK_DATA.phases.map(p => ({
            id: `phase-${p.number}`,
            name: p.name,
            color: p.color
          }))}
          currentPhaseId={`phase-${currentPhase.number}`}
          getProgress={(phaseId) => {
            const phaseNum = parseInt(phaseId.split('-')[1])
            if (phaseNum === currentPhase.number) {
              return Math.floor((phase2Done / totalTopics) * 100)
            }
            if (phaseNum < currentPhase.number) return 100
            return 0
          }}
          isLocked={(phase) => {
            const phaseNum = parseInt(phase.id.split('-')[1])
            return phaseNum > currentPhase.number
          }}
          onPhaseClick={() => {}}
        />
      </div>

      {/* ── TAB BAR ── */}
      <div className="flex items-center gap-1 bg-white rounded-xl
        border border-[#E5E0D8] p-1 w-fit mb-6 overflow-x-auto">
        {[
          { id: 'roadmap', label: 'Roadmap', icon: Layers },
          { id: 'explorer', label: 'Books & Papers', icon: BookOpen },
          { id: 'placement', label: 'Placement', icon: Building },
          { id: 'revision', label: 'Revision Queue', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs',
                'font-bold font-["Space_Mono"] uppercase tracking-wider',
                'transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[#1A1A2E] text-white'
                  : 'text-[#9A9590] hover:text-[#1A1A2E]'
              )}
            >
              <Icon size={12}/> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════
          TAB 1 — ROADMAP
      ══════════════════════════════════════ */}
      {activeTab === 'roadmap' && (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Cluster + Section navigation */}
          <div className="w-full lg:w-[280px] shrink-0">

            {/* Phase banner */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8]
              p-4 mb-4">
              <p className="text-[9px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-1">
                Current Phase
              </p>
              <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] mb-1">
                Phase {currentPhase.number} — {currentPhase.name}
              </p>
              <p className="text-[10px] text-[#9A9590] font-['Inter']
                leading-relaxed">
                {currentPhase.focus}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <Clock size={11} className="text-[#E07B39]"/>
                <p className="text-[10px] text-[#E07B39] font-['Space_Mono']
                  font-bold uppercase">
                  {currentPhase.hoursPerDay}hrs/day
                </p>
              </div>
            </div>

            {/* Section list for active cluster */}
            {activeClusterData && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[9px] font-bold text-[#9A9590]
                  font-['Space_Mono'] uppercase tracking-widest px-1 mb-1">
                  Sections
                </p>
                {activeClusterData.sections.map(section => {
                  const stats = getSectionStats(section)
                  const isActive = activeSection === section.id

                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(
                          activeSection === section.id ? null : section.id
                        )
                        setExpandedTopic(null)
                      }}
                      className={clsx(
                        'w-full text-left px-3 py-2.5 rounded-xl border',
                        'transition-all flex items-center justify-between',
                        isActive
                          ? 'bg-[#1A1A2E] border-[#1A1A2E] text-white'
                          : 'bg-white border-[#E5E0D8] text-[#1A1A2E]',
                        'hover:border-[#1A1A2E]'
                      )}
                    >
                      <div className="min-w-0">
                        <p className={clsx(
                          'text-xs font-bold font-["Inter"] truncate',
                          isActive ? 'text-white' : 'text-[#1A1A2E]'
                        )}>
                          {section.id} · {section.name}
                        </p>
                        <p className={clsx(
                          'text-[9px] font-["Space_Mono"]',
                          isActive ? 'text-white/50' : 'text-[#9A9590]'
                        )}>
                          {stats.p2}/{stats.total} studied {getSectionMinutes(section.id) > 0 ? `· ${getSectionMinutes(section.id)}m` : ''}
                        </p>
                      </div>
                      <ChevronRight size={12} className={
                        isActive ? 'text-white/50' : 'text-[#9A9590]'
                      }/>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT — Section content */}
          <div className="flex-1 min-w-0">

            {!activeSection && renderRoadmapTab()}

            {/* Section content */}
            {activeSection && (() => {
              const section = activeClusterData?.sections.find(
                s => s.id === activeSection
              )
              if (!section) return null
              const stats = getSectionStats(section)
              const clusterColor = activeClusterData?.color || '#1A1A2E'

              return (
                <div className="flex flex-col gap-5">

                  {/* Section header */}
                  <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold
                            font-['Space_Mono'] uppercase tracking-wider
                            px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: clusterColor }}>
                            {section.id}
                          </span>
                          <span className="text-[10px] text-[#9A9590]
                            font-['Space_Mono']">
                            {section.duration}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-[#1A1A2E]
                          font-['Inter'] tracking-tight">
                          {section.name}
                        </h2>
                        {section.note && (
                          <p className="text-xs text-[#E07B39] font-['Inter']
                            mt-1 italic">
                            ⚡ {section.note}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-2xl font-bold font-['Space_Mono']"
                          style={{ color: clusterColor }}>
                          {stats.percent}%
                        </p>
                        <p className="text-[9px] text-[#9A9590] font-['Space_Mono']">
                          {stats.p1} explored · {stats.p2} studied
                        </p>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <p className="text-[9px] text-[#9A9590] font-['Space_Mono']
                          uppercase tracking-wider w-16 shrink-0">
                          Explored
                        </p>
                        <div className="flex-1 h-1.5 bg-[#F5F4F0]
                          rounded-full overflow-hidden">
                          <div className="h-full bg-[#E07B39] rounded-full
                            transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.p1/stats.total)*100 : 0}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-bold font-['Space_Mono']
                          text-[#E07B39] w-8 text-right">
                          {stats.p1}/{stats.total}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-[9px] text-[#9A9590] font-['Space_Mono']
                          uppercase tracking-wider w-16 shrink-0">
                          Studied
                        </p>
                        <div className="flex-1 h-1.5 bg-[#F5F4F0]
                          rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${stats.total > 0 ? (stats.p2/stats.total)*100 : 0}%`,
                              backgroundColor: clusterColor
                            }}
                          />
                        </div>
                        <p className="text-[9px] font-bold font-['Space_Mono']
                          w-8 text-right"
                          style={{ color: clusterColor }}>
                          {stats.p2}/{stats.total}
                        </p>
                      </div>
                    </div>

                    {/* Resources row */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4
                      border-t border-[#F5F4F0]">
                      {section.campusx_playlist && (
                        <a href={section.campusx_url || '#'}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-[10px]
                            font-bold font-['Space_Mono'] uppercase tracking-wider
                            px-3 py-1.5 rounded-lg bg-red-50 text-red-600
                            hover:bg-red-100 transition-all"
                        >
                          <Play size={10}/> {section.campusx_playlist}
                        </a>
                      )}
                      {section.paid_course && (
                        <a href={section.paid_course.url}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-[10px]
                            font-bold font-['Space_Mono'] uppercase tracking-wider
                            px-3 py-1.5 rounded-lg bg-[#FFF0E6] text-[#E07B39]
                            hover:bg-orange-100 transition-all"
                        >
                          <Wallet size={10}/>
                          Rs.{section.paid_course.price} · {section.paid_course.name}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Topics list */}
                  <div>
                    <p className="text-[10px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-widest mb-3">
                      Topics ({section.topics.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {section.topics.map((topic, ti) => {
                        const tp = progress[topic.id] || {}
                        const isExpanded = expandedTopic === topic.id
                        const isFullDone = tp.phase1_done && tp.phase2_done

                        return (
                          <motion.div key={topic.id} layout
                            className={clsx(
                              'bg-white rounded-2xl border transition-all',
                              isFullDone
                                ? 'border-[#1A6B4A]/30'
                                : 'border-[#E5E0D8] hover:shadow-sm'
                            )}
                          >
                            {/* Topic header row */}
                            <div
                              className="flex items-center gap-3 p-4
                                cursor-pointer select-none"
                              onClick={() => handleTopicClick(topic, section)}
                            >
                              {/* Phase indicators */}
                              <div className="flex gap-1.5 shrink-0">
                                {/* Phase 1 — Explore */}
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    togglePhase1(
                                      topic.id, topic.title,
                                      section.id, activeCluster
                                    )
                                  }}
                                  title="Mark Week 1 Explored"
                                  className={clsx(
                                    'w-6 h-6 rounded-lg border-2 flex items-center',
                                    'justify-center transition-all shrink-0',
                                    tp.phase1_done
                                      ? 'bg-[#E07B39] border-[#E07B39]'
                                      : 'border-[#E5E0D8] hover:border-[#E07B39]'
                                  )}
                                >
                                  {tp.phase1_done && (
                                    <Compass size={10} className="text-white"/>
                                  )}
                                </button>
                                { /* Phase 2 — Study */ }
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    await togglePhase2(
                                      topic.id, topic.title,
                                      section.id, activeCluster
                                    )
                                    await checkClusterCompletion(activeCluster, activeClusterData?.name)
                                  }}
                                  title="Mark Week 2 Studied"
                                  className={clsx(
                                    'w-6 h-6 rounded-lg border-2 flex items-center',
                                    'justify-center transition-all shrink-0',
                                    tp.phase2_done
                                      ? 'border-transparent text-white'
                                      : 'border-[#E5E0D8] hover:border-current',
                                    !tp.phase2_done && 'hover:border-opacity-50'
                                  )}
                                  style={tp.phase2_done ? {
                                    backgroundColor: clusterColor
                                  } : {}}
                                >
                                  {tp.phase2_done && (
                                    <Check size={10} className="text-white"
                                      strokeWidth={3}/>
                                  )}
                                </button>
                              </div>

                              {/* Topic info */}
                              <div className="flex-1 min-w-0">
                                <p className={clsx(
                                  'text-sm font-bold font-["Inter"]',
                                  isFullDone
                                    ? 'text-[#9A9590]' : 'text-[#1A1A2E]'
                                )}>
                                  {topic.title}
                                </p>
                                <p className="text-[10px] text-[#9A9590]
                                  font-['Inter'] mt-0.5 truncate">
                                  {topic.desc}
                                </p>
                              </div>

                              {/* Status badges */}
                              <div className="flex items-center gap-2 shrink-0">
                                {isExpanded
                                  ? <ChevronUp size={14}
                                      className="text-[#9A9590]"/>
                                  : <ChevronDown size={14}
                                      className="text-[#9A9590]"/>
                                }
                              </div>
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 border-t
                                    border-[#F5F4F0] pt-4 space-y-4">

                                    {/* Phase legend */}
                                    <div className="flex gap-3">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded bg-[#E07B39]
                                          flex items-center justify-center">
                                          <Compass size={8} className="text-white"/>
                                        </div>
                                        <p className="text-[9px] text-[#9A9590]
                                          font-['Space_Mono'] uppercase">
                                          Week 1: Explore
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded
                                          flex items-center justify-center"
                                          style={{ backgroundColor: clusterColor }}>
                                          <Check size={8} className="text-white"
                                            strokeWidth={3}/>
                                        </div>
                                        <p className="text-[9px] text-[#9A9590]
                                          font-['Space_Mono'] uppercase">
                                          Week 2: Study via CampusX
                                        </p>
                                      </div>
                                    </div>

                                    {/* JARVIS Explorer button */}
                                    <div>
                                      <button
                                        onClick={() => handleGenerateExploration(
                                          topic, section
                                        )}
                                        disabled={isGeneratingExploration}
                                        className="flex items-center gap-2
                                          bg-[#1A1A2E] text-white px-4 py-2
                                          rounded-xl text-xs font-bold
                                          font-['Space_Mono'] uppercase
                                          tracking-wider hover:bg-[#2a2a4e]
                                          transition-all disabled:opacity-50"
                                      >
                                        <Bot size={12}
                                          className={isGeneratingExploration
                                            && explorerTopic === topic.id
                                            ? 'animate-spin' : ''}
                                        />
                                        {isGeneratingExploration
                                          && explorerTopic === topic.id
                                          ? 'Generating exploration...'
                                          : activeExploration?.topic_id === topic.id
                                          ? 'Regenerate Week 1 Package'
                                          : 'Generate Week 1 Exploration'
                                        }
                                      </button>
                                    </div>

                                    {/* Exploration output */}
                                    {activeExploration?.topic_id === topic.id && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#F5F4F0] rounded-xl p-4
                                          space-y-4"
                                      >
                                        {/* Curiosity hook */}
                                        {activeExploration.curiosity_hook && (
                                          <div className="bg-[#1A1A2E] rounded-xl
                                            p-4 flex gap-3">
                                            <Zap size={14} className="text-[#E07B39]
                                              shrink-0 mt-0.5"/>
                                            <p className="text-xs text-white/80
                                              font-['Inter'] leading-relaxed">
                                              {activeExploration.curiosity_hook}
                                            </p>
                                          </div>
                                        )}

                                        {/* Key questions */}
                                        {activeExploration.key_questions?.length > 0 && (
                                          <div>
                                            <p className="text-[9px] font-bold
                                              text-[#9A9590] font-['Space_Mono']
                                              uppercase tracking-widest mb-2">
                                              Questions to investigate
                                            </p>
                                            {activeExploration.key_questions.map(
                                              (q, i) => (
                                              <div key={i} className="flex gap-2
                                                items-start mb-2">
                                                <span className="text-[#E07B39]
                                                  font-bold text-xs shrink-0">
                                                  {i+1}.
                                                </span>
                                                <p className="text-xs
                                                  text-[#3D3830] font-['Inter']
                                                  leading-relaxed">
                                                  {q}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Concepts */}
                                        {activeExploration.concepts_to_investigate?.length > 0 && (
                                          <div>
                                            <p className="text-[9px] font-bold
                                              text-[#9A9590] font-['Space_Mono']
                                              uppercase tracking-widest mb-2">
                                              Concepts to explore
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                              {activeExploration.concepts_to_investigate.map(
                                                (c, i) => (
                                                <div key={i} className="bg-white
                                                  rounded-lg p-2.5">
                                                  <p className="text-[10px] font-bold
                                                    text-[#1A1A2E] font-['Inter']
                                                    mb-0.5">
                                                    {c.concept}
                                                  </p>
                                                  <p className="text-[9px]
                                                    text-[#9A9590] font-['Inter']">
                                                    {c.why_first}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Exploration tasks */}
                                        {activeExploration.resources?.length > 0 && (
                                          <div>
                                            <p className="text-[9px] font-bold
                                              text-[#9A9590] font-['Space_Mono']
                                              uppercase tracking-widest mb-2">
                                              Week 1 tasks
                                            </p>
                                            {activeExploration.resources.map(
                                              (task, i) => (
                                              <div key={i} className="flex gap-2
                                                items-start mb-2">
                                                <ArrowRight size={11}
                                                  className="text-[#E07B39]
                                                  shrink-0 mt-0.5"/>
                                                <p className="text-xs
                                                  text-[#3D3830] font-['Inter']
                                                  leading-relaxed">
                                                  {task}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Exploration papers */}
                                        {activeExploration.papers?.length > 0 && (
                                          <div>
                                            <p className="text-[9px] font-bold
                                              text-[#9A9590] font-['Space_Mono']
                                              uppercase tracking-widest mb-2">
                                              Papers to read this week
                                            </p>
                                            {activeExploration.papers.map((p, i) => (
                                              <div key={i} className="bg-[#1A1A2E]
                                                rounded-lg p-3 mb-2">
                                                <p className="text-xs font-bold
                                                  text-white font-['Inter'] mb-0.5">
                                                  {p.title}
                                                </p>
                                                <p className="text-[9px]
                                                  text-white/40 font-['Space_Mono']
                                                  mb-1">
                                                  {p.authors} · {p.year}
                                                </p>
                                                <p className="text-[10px]
                                                  text-white/60 font-['Inter']">
                                                  {p.one_line}
                                                </p>
                                                {p.url && (
                                                  <a href={p.url} target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[9px]
                                                      text-[#E07B39]
                                                      font-['Space_Mono']
                                                      uppercase flex items-center
                                                      gap-1 mt-1.5">
                                                    Read <ExternalLink size={9}/>
                                                  </a>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-[#E5E0D8]">
                                      <p className="text-[9px] font-bold text-[#9A9590]
                                        font-['Space_Mono'] uppercase tracking-widest mb-2">
                                        Time Logged
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-[#F5F4F0] 
                                          rounded-xl px-3 py-1.5">
                                          <span className="text-xs font-bold text-[#1A6B4A]
                                            font-['Space_Mono']">
                                            {topicMinutes[topic.id] 
                                              ? `${topicMinutes[topic.id]}m total` 
                                              : '0m'}
                                          </span>
                                        </div>
                                        <input
                                          type="number"
                                          min={1}
                                          max={300}
                                          placeholder="+ mins"
                                          value={minuteInputs[topic.id] || ''}
                                          onChange={e => setMinuteInputs(prev => ({
                                            ...prev,
                                            [topic.id]: e.target.value
                                          }))}
                                          className="w-20 bg-[#F5F4F0] rounded-xl px-3 py-1.5
                                            text-xs text-[#1A1A2E] font-['Space_Mono']
                                            border border-[#E5E0D8] focus:outline-none
                                            focus:border-[#E07B39] text-center"
                                        />
                                        <button
                                          onClick={() => {
                                            const mins = parseInt(minuteInputs[topic.id])
                                            if (mins > 0) {
                                              logTopicTime(
                                                topic.id, topic.title, 
                                                section.id, activeCluster, mins
                                              )
                                              setMinuteInputs(prev => ({ ...prev, [topic.id]: '' }))
                                            }
                                          }}
                                          className="bg-[#E07B39] text-white px-3 py-1.5 
                                            rounded-xl text-[10px] font-bold font-['Space_Mono']
                                            uppercase tracking-wider"
                                        >
                                          Log
                                        </button>
                                      </div>
                                    </div>

                                    {/* Notes editor */}
                                      <div>
                                        <p className="text-[9px] font-bold
                                          text-[#9A9590] font-['Space_Mono']
                                          uppercase tracking-widest mb-2">
                                          My Notes
                                        </p>
                                        <textarea
                                          value={notesTopicId === topic.id
                                            ? notesValue : ''}
                                          onChange={e => handleNotesChange(
                                            e.target.value, topic.id
                                          )}
                                          placeholder="Write your insights, links, or key takeaways..."
                                          className="w-full bg-[#F5F4F0] border
                                            border-transparent focus:border-[#E07B39]
                                            rounded-xl p-3 text-sm font-['Inter']
                                            text-[#1A1A2E] placeholder-[#9A9590]
                                            resize-none focus:outline-none
                                            transition-all min-h-[80px]"
                                        />
                                      </div>

                                      {/* Difficulty Rating */}
                                      {tp.phase2_done && (
                                        <div className="mt-3 pt-3 border-t border-[#E5E0D8]">
                                          <p className="text-[9px] font-bold text-[#9A9590]
                                            font-['Space_Mono'] uppercase tracking-widest mb-2">
                                            How Hard Was This?
                                          </p>
                                          <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                              <button
                                                key={star}
                                                onClick={() => rateTopic(
                                                  topic.id, 
                                                  topic.title,
                                                  section.id,
                                                  activeCluster,
                                                  star
                                                )}
                                                className={`w-8 h-8 rounded-lg text-sm font-bold
                                                  transition-all border
                                                  ${(difficultyRatings[topic.id] || 0) >= star
                                                    ? 'bg-[#E07B39] text-white border-[#E07B39]'
                                                    : 'bg-[#F5F4F0] text-[#9A9590] border-[#E5E0D8]'
                                                  }`}
                                              >
                                                {star}
                                              </button>
                                            ))}
                                            {difficultyRatings[topic.id] && (
                                              <span className="text-[10px] text-[#9A9590] 
                                                font-['Space_Mono'] self-center ml-1">
                                                {difficultyRatings[topic.id] >= 4 
                                                  ? '→ Added to revision queue' 
                                                  : 'Rated'}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 2 — BOOKS & PAPERS
      ══════════════════════════════════════ */}
      {activeTab === 'explorer' && (
        <div className="flex flex-col gap-6">

          {/* Books section */}
          <div>
            <p className="text-[10px] font-bold text-[#9A9590]
              font-['Space_Mono'] uppercase tracking-widest mb-4">
              Complete Book List ({allBooks.length} books)
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allBooks.map((book, i) => {
                const clusterColor = AI_TRACK_DATA.clusters.find(
                  c => c.sections.some(s => s.books?.some(b => b.title === book.title))
                )?.color || '#1A1A2E'

                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl border border-[#E5E0D8] p-5
                      flex gap-4"
                  >
                    <div className="w-10 h-12 rounded-lg shrink-0
                      flex items-center justify-center"
                      style={{ backgroundColor: clusterColor + '20' }}>
                      <BookOpen size={18} style={{ color: clusterColor }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-[#1A1A2E]
                          font-['Inter']">
                          {book.title}
                        </p>
                        <div className="flex gap-1 shrink-0">
                          <span className={clsx(
                            'text-[9px] font-bold font-["Space_Mono"]',
                            'uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap',
                            book.difficulty === 'Dense'
                              ? 'bg-red-50 text-red-600'
                              : book.difficulty === 'Intermediate'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-green-50 text-green-600'
                          )}>
                            {book.difficulty}
                          </span>
                          {book.free && (
                            <span className="text-[9px] font-bold
                              font-['Space_Mono'] uppercase px-1.5 py-0.5
                              rounded-full bg-emerald-50 text-emerald-700
                              whitespace-nowrap">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#9A9590] font-['Space_Mono']
                        mb-1">
                        {book.author} · {book.section}
                      </p>
                      <p className="text-xs text-[#3D3830] font-['Inter']
                        leading-relaxed">
                        {book.why}
                      </p>
                      {book.url && (
                        <a href={book.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[9px]
                            text-[#1A6B4A] font-['Space_Mono'] uppercase
                            tracking-wider mt-1.5 hover:underline">
                          Read free <ExternalLink size={9}/>
                        </a>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Papers section */}
          <div>
            <p className="text-[10px] font-bold text-[#9A9590]
              font-['Space_Mono'] uppercase tracking-widest mb-4">
              Research Papers ({allPapers.length} curated papers)
            </p>
            <p className="text-xs text-[#9A9590] font-['Inter'] mb-4">
              These are the foundational papers. JARVIS will suggest 
              additional papers per topic during Week 1 exploration.
            </p>
            <div className="flex flex-col gap-3">
              {allPapers.map((paper, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-[#1A1A2E] rounded-2xl p-5 flex gap-4"
                >
                  <div className="w-8 h-8 bg-[#E07B39] rounded-xl
                    flex items-center justify-center shrink-0">
                    <FlaskConical size={15} className="text-white"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white font-['Inter']">
                        {paper.title}
                      </p>
                      <span className="text-[9px] font-bold text-[#E07B39]
                        font-['Space_Mono'] uppercase px-2 py-0.5 rounded-full
                        bg-[#E07B39]/10 whitespace-nowrap shrink-0">
                        {paper.cluster === 'A' ? 'Foundation'
                          : paper.cluster === 'B' ? 'ML'
                          : 'AI Eng'}
                      </span>
                    </div>
                    <p className="text-[9px] text-white/40 font-['Space_Mono']
                      mb-1.5">
                      {paper.authors} · {paper.year} · {paper.section}
                    </p>
                    <p className="text-xs text-white/60 font-['Inter']
                      leading-relaxed mb-2">
                      {paper.why}
                    </p>
                    {paper.url && (
                      <a href={paper.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[9px]
                          text-[#E07B39] font-['Space_Mono'] uppercase
                          tracking-wider hover:underline">
                        Read on arXiv <ExternalLink size={9}/>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 3 — PLACEMENT
      ══════════════════════════════════════ */}
      {activeTab === 'placement' && (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Salary target card */}
            <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-bold text-white/40
                font-['Space_Mono'] uppercase tracking-widest mb-2">
                Target Outcome
              </p>
              <p className="text-4xl font-bold text-[#E07B39]
                font-['Space_Mono'] mb-1">
                {AI_TRACK_DATA.placement.salaryTarget}
              </p>
              <p className="text-sm text-white/60 font-['Inter'] mb-4">
                Target salary range for AI Engineer roles
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_TRACK_DATA.placement.targetRoles.map((role, i) => (
                  <span key={i} className="text-[10px] font-bold
                    font-['Space_Mono'] uppercase px-3 py-1.5 rounded-full
                    bg-white/10 text-white/70">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* 2-month job hunt plan */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-4">
                2-Month Job Hunt Plan
              </p>
              <div className="flex flex-col gap-3">
                {AI_TRACK_DATA.placement.jobHuntingPlan.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start p-3
                    bg-[#F5F4F0] rounded-xl">
                    <div className="bg-[#1A1A2E] text-white rounded-lg px-2 py-1
                      text-[9px] font-bold font-['Space_Mono'] uppercase
                      whitespace-nowrap shrink-0">
                      Week {step.week}
                    </div>
                    <p className="text-xs text-[#3D3830] font-['Inter']
                      leading-relaxed">
                      {step.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phases timeline */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-4">
                14-Month Timeline
              </p>
              <div className="flex flex-col gap-3">
                {AI_TRACK_DATA.phases.map((phase, i) => (
                  <div key={i} className={clsx(
                    'flex gap-4 p-4 rounded-xl border transition-all',
                    currentPhase.number === phase.number
                      ? 'border-[#E07B39] bg-[#FFF0E6]'
                      : 'border-[#E5E0D8] bg-[#F5F4F0]'
                  )}>
                    <div className="w-8 h-8 rounded-xl flex items-center
                      justify-center shrink-0 text-white text-sm font-bold
                      font-['Space_Mono']"
                      style={{ backgroundColor: phase.color }}>
                      {phase.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-[#1A1A2E]
                          font-['Inter']">
                          {phase.name}
                        </p>
                        {currentPhase.number === phase.number && (
                          <span className="text-[9px] font-bold text-[#E07B39]
                            font-['Space_Mono'] uppercase px-2 py-0.5
                            rounded-full bg-[#E07B39]/10">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9A9590] font-['Space_Mono']
                        mb-1">
                        {phase.duration} · {phase.hoursPerDay}hrs/day
                      </p>
                      <p className="text-xs text-[#3D3830] font-['Inter']
                        leading-relaxed">
                        {phase.focus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Companies */}
          <div className="w-full lg:w-[360px]">
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5
              sticky top-6">
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-4">
                Target Companies ({AI_TRACK_DATA.placement.targetCompanies.length})
              </p>
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto
                no-scrollbar">
                {AI_TRACK_DATA.placement.targetCompanies.map((company, i) => (
                  <div key={i} className={clsx(
                    'flex items-center justify-between p-3 rounded-xl border',
                    'transition-all hover:shadow-sm',
                    company.priority === 'High'
                      ? 'border-[#1A6B4A]/20 bg-emerald-50/30'
                      : company.priority === 'Medium'
                      ? 'border-[#E5E0D8] bg-white'
                      : 'border-[#E5E0D8] bg-[#F5F4F0]'
                  )}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1A1A2E]
                          font-['Inter']">
                          {company.name}
                        </p>
                        <span className={clsx(
                          'text-[9px] font-bold font-["Space_Mono"]',
                          'uppercase px-1.5 py-0.5 rounded-full',
                          company.priority === 'High'
                            ? 'bg-emerald-50 text-emerald-700'
                            : company.priority === 'Medium'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-[#F5F4F0] text-[#9A9590]'
                        )}>
                          {company.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9A9590] font-['Inter']">
                        {company.type}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-[#1A6B4A]
                      font-['Space_Mono'] whitespace-nowrap">
                      {company.salary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 4 — REVISION QUEUE
      ══════════════════════════════════════ */}
      {activeTab === 'revision' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                Hard Topics
              </p>
              <p className="text-lg font-bold text-[#1A1A2E] 
                font-['Inter']">
                Revision Queue
              </p>
            </div>
            <div className="bg-[#C0392B]/10 rounded-xl px-3 py-1.5">
              <p className="text-sm font-bold text-[#C0392B]
                font-['Space_Mono']">
                {getRevisionQueue().length} topics
              </p>
            </div>
          </div>

          {getRevisionQueue().length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white rounded-2xl border border-[#E5E0D8]
                flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={28} className="text-[#E5E0D8]"/>
              </div>
              <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] mb-1">
                Queue Clear
              </p>
              <p className="text-xs text-[#9A9590] font-['Inter'] max-w-xs mx-auto">
                Rate topics with a difficulty of 4 or 5 after studying to add them here for focused revision.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getRevisionQueue().map(({ topicId, rating }) => {
                // Find topic data from AI_TRACK_DATA
                let topicData = null
                AI_TRACK_DATA.clusters.forEach(c => {
                  c.sections.forEach(s => {
                    s.topics.forEach(t => {
                      if (t.id === topicId) topicData = { 
                        ...t, 
                        sectionTitle: s.name,
                        clusterName: c.name 
                      }
                    })
                  })
                })
                if (!topicData) return null
                return (
                  <div key={topicId}
                    className="bg-white rounded-2xl border 
                      border-[#E5E0D8] p-4">
                    <div className="flex items-start 
                      justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[9px] font-bold 
                          text-[#9A9590] font-['Space_Mono'] 
                          uppercase tracking-wider mb-0.5">
                          {topicData.clusterName} → {topicData.sectionTitle}
                        </p>
                        <p className="text-sm font-bold text-[#1A1A2E]
                          font-['Inter']">
                          {topicData.title}
                        </p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <div key={s}
                            className={`w-3 h-3 rounded-sm
                              ${s <= rating 
                                ? 'bg-[#C0392B]' 
                                : 'bg-[#E5E0D8]'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default AIEngineerTrack
