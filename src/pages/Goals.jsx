import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useXpStore } from '../store/xpStore'
import { useSdeStore } from '../store/sdeStore'
import { useAiTrackStore, AI_TRACK_DATA } from '../store/aiTrackStore'
import { useExplorerStore } from '../store/explorerStore'
import { useHealthStore } from '../store/healthStore'
import { SDE_TRACK_DATA, getPhaseProgress } from '../lib/sdeTrackData'
import { differenceInDays, addMonths, format } from 'date-fns'
import {
  Target, TrendingUp, Clock, Star, Check,
  Code2, Brain, Heart, TrendingDown, Zap,
  BookOpen, Calendar, Award, ArrowRight
} from 'lucide-react'
import { clsx } from 'clsx'

const START_DATE = new Date('2026-05-17')

const MILESTONES = [
  {
    id: 'dsa_100',
    title: '100 DSA Problems',
    description: 'First major DSA checkpoint on Striver A2Z',
    targetDate: addMonths(START_DATE, 1),
    domain: 'SDE',
    color: '#1A1A2E',
    check: ({ dsaSolved }) => dsaSolved >= 100,
    progress: ({ dsaSolved }) => Math.min(100, (dsaSolved / 100) * 100)
  },
  {
    id: 'ai_cluster_a',
    title: 'AI Track Cluster A Complete',
    description: 'All Foundation topics studied (phase2)',
    targetDate: addMonths(START_DATE, 2),
    domain: 'AI Track',
    color: '#1A6B4A',
    check: ({ aiProgress }) => {
      const clusterA = AI_TRACK_DATA?.clusters?.[0]
      if (!clusterA) return false
      const topics = clusterA.sections.flatMap(s => s.topics)
      return topics.every(t => aiProgress[t.id]?.phase2_done)
    },
    progress: ({ aiProgress }) => {
      const clusterA = AI_TRACK_DATA?.clusters?.[0]
      if (!clusterA) return 0
      const topics = clusterA.sections.flatMap(s => s.topics)
      const done = topics.filter(t => 
        aiProgress[t.id]?.phase2_done).length
      return Math.floor((done / topics.length) * 100)
    }
  },
  {
    id: 'dsa_474',
    title: '474 DSA Problems',
    description: 'DSA phase complete. All other phases unlock.',
    targetDate: addMonths(START_DATE, 3),
    domain: 'SDE',
    color: '#1A1A2E',
    check: ({ dsaSolved }) => dsaSolved >= 474,
    progress: ({ dsaSolved }) => Math.min(100, (dsaSolved / 474) * 100)
  },
  {
    id: 'streak_30',
    title: '30-Day Consistency Streak',
    description: 'Unbroken daily habit streak for 30 days',
    targetDate: addMonths(START_DATE, 1),
    domain: 'Health',
    color: '#E07B39',
    check: ({ streakDays }) => streakDays >= 30,
    progress: ({ streakDays }) => Math.min(100, (streakDays / 30) * 100)
  },
  {
    id: 'ai_cluster_b',
    title: 'AI Track Cluster B Complete',
    description: 'All ML topics studied',
    targetDate: addMonths(START_DATE, 5),
    domain: 'AI Track',
    color: '#1A6B4A',
    check: ({ aiProgress }) => {
      const clusterB = AI_TRACK_DATA?.clusters?.[1]
      if (!clusterB) return false
      const topics = clusterB.sections.flatMap(s => s.topics)
      return topics.every(t => aiProgress[t.id]?.phase2_done)
    },
    progress: ({ aiProgress }) => {
      const clusterB = AI_TRACK_DATA?.clusters?.[1]
      if (!clusterB) return 0
      const topics = clusterB.sections.flatMap(s => s.topics)
      const done = topics.filter(t => 
        aiProgress[t.id]?.phase2_done).length
      return Math.floor((done / topics.length) * 100)
    }
  },
  {
    id: 'sde_backend',
    title: 'Backend Engineering Complete',
    description: 'APIs, databases, system internals done',
    targetDate: addMonths(START_DATE, 6),
    domain: 'SDE',
    color: '#1A1A2E',
    check: ({ sdeProgress }) => 
      getPhaseProgress('BACKEND', sdeProgress) >= 100,
    progress: ({ sdeProgress }) => 
      getPhaseProgress('BACKEND', sdeProgress)
  },
  {
    id: 'explorer_10',
    title: '10 Explorer Topics',
    description: '10 weeks of structured curiosity',
    targetDate: addMonths(START_DATE, 3),
    domain: 'Explorer',
    color: '#7C3AED',
    check: ({ archiveCount }) => archiveCount >= 10,
    progress: ({ archiveCount }) => 
      Math.min(100, (archiveCount / 10) * 100)
  },
  {
    id: 'level_20',
    title: 'Reach Level 20',
    description: 'Trading analytics + PLAYER ONE Prestige visible',
    targetDate: addMonths(START_DATE, 4),
    domain: 'XP',
    color: '#E07B39',
    check: ({ level }) => level >= 20,
    progress: ({ level }) => Math.min(100, (level / 20) * 100)
  },
  {
    id: 'ai_cluster_c',
    title: 'AI Track Cluster C Complete',
    description: 'LLM + AI Engineering mastered',
    targetDate: addMonths(START_DATE, 10),
    domain: 'AI Track',
    color: '#1A6B4A',
    check: ({ aiProgress }) => {
      const clusterC = AI_TRACK_DATA?.clusters?.[2]
      if (!clusterC) return false
      const topics = clusterC.sections.flatMap(s => s.topics)
      return topics.every(t => aiProgress[t.id]?.phase2_done)
    },
    progress: ({ aiProgress }) => {
      const clusterC = AI_TRACK_DATA?.clusters?.[2]
      if (!clusterC) return 0
      const topics = clusterC.sections.flatMap(s => s.topics)
      const done = topics.filter(t => 
        aiProgress[t.id]?.phase2_done).length
      return Math.floor((done / topics.length) * 100)
    }
  },
  {
    id: 'first_offer',
    title: 'First Job Offer',
    description: 'AI Engineer / SDE role at 12+ LPA',
    targetDate: addMonths(START_DATE, 14),
    domain: 'Career',
    color: '#C0392B',
    check: () => false,
    progress: () => 0,
    isEndGoal: true
  }
]

export default function Goals() {
  const { level, xp, streakDays } = useXpStore()
  const { progress: sdeProgress, dsaSolved } = useSdeStore()
  const { progress: aiProgress } = useAiTrackStore()
  const { topicArchive } = useExplorerStore()

  const archiveCount = topicArchive?.length || 0
  const today = new Date()
  const daysElapsed = differenceInDays(today, START_DATE)

  const dataContext = { 
    dsaSolved, sdeProgress, aiProgress, 
    streakDays, level, archiveCount 
  }

  const milestoneStatuses = useMemo(() => {
    return MILESTONES.map(m => ({
      ...m,
      isDone: m.check(dataContext),
      prog: m.progress(dataContext),
      daysAway: differenceInDays(m.targetDate, today),
      isOverdue: today > m.targetDate && !m.check(dataContext)
    }))
  }, [dsaSolved, sdeProgress, aiProgress, streakDays, 
    level, archiveCount])

  const doneMilestones = milestoneStatuses.filter(m => m.isDone)
  const pendingMilestones = milestoneStatuses.filter(m => !m.isDone)
  const nextMilestone = pendingMilestones[0]

  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return pendingMilestones
    return pendingMilestones.filter(
      m => m.domain.toLowerCase() === activeFilter
    )
  }, [pendingMilestones, activeFilter])

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24
      max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-[#9A9590]
          font-['Space_Mono'] uppercase tracking-widest mb-1">
          The Full Picture
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A2E] 
          font-['Inter']">
          Goals & Vision
        </h1>
      </div>

      {/* HERO — End Goal */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 mb-5 text-white">
        <p className="text-[9px] font-bold text-white/40
          font-['Space_Mono'] uppercase tracking-widest mb-2">
          The End Goal · {format(addMonths(START_DATE, 14), 'MMMM yyyy')}
        </p>
        <p className="text-2xl font-bold text-white font-['Inter'] mb-2">
          AI Engineer / SDE at 12-30 LPA
        </p>
        <p className="text-sm text-white/60 font-['Inter'] mb-4">
          Day {daysElapsed} of ~420. You are building the foundation.
          Every study session, every quest, every habit compounds.
        </p>
        
        {/* Overall progress to goal */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'DSA', value: `${dsaSolved}/474`, 
              color: '#E07B39', 
              percent: Math.min(100, (dsaSolved/474)*100) },
            { label: 'AI Track', 
              value: `${Object.values(aiProgress)
                .filter(p=>p.phase2_done).length}/${
                AI_TRACK_DATA?.clusters?.flatMap(c=>
                  c.sections.flatMap(s=>s.topics)).length || 1}`,
              color: '#1A6B4A',
              percent: (() => {
                const total = AI_TRACK_DATA?.clusters?.flatMap(c=>
                  c.sections.flatMap(s=>s.topics)).length || 1
                const done = Object.values(aiProgress)
                  .filter(p=>p.phase2_done).length
                return Math.floor((done/total)*100)
              })()
            },
            { label: 'Level', value: level, color: '#E07B39',
              percent: Math.min(100, (level/30)*100) },
            { label: 'Streak', value: `${streakDays}d`, 
              color: '#E07B39',
              percent: Math.min(100, (streakDays/100)*100) }
          ].map(stat => (
            <div key={stat.label} 
              className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-white
                font-['Space_Mono']">{stat.value}</p>
              <p className="text-[8px] text-white/40
                font-['Space_Mono'] uppercase tracking-wider mt-0.5">
                {stat.label}
              </p>
              <div className="mt-1.5 h-0.5 bg-white/10 
                rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ 
                    width: `${stat.percent}%`,
                    backgroundColor: stat.color 
                  }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Next milestone highlight */}
        {nextMilestone && (
          <div className="bg-white/10 rounded-xl p-3 
            flex items-center gap-3">
            <ArrowRight size={14} className="text-[#E07B39] shrink-0"/>
            <div className="flex-1">
              <p className="text-[9px] text-white/40
                font-['Space_Mono'] uppercase tracking-widest">
                Next Milestone
              </p>
              <p className="text-xs font-bold text-white
                font-['Inter']">{nextMilestone.title}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold font-['Space_Mono']"
                style={{ color: nextMilestone.color }}>
                {nextMilestone.prog}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* COMPLETED MILESTONES */}
      {doneMilestones.length > 0 && (
        <div className="bg-[#F0FDF4] rounded-2xl border 
          border-[#1A6B4A]/20 p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-[#1A6B4A]"/>
            <p className="text-[10px] font-bold text-[#1A6B4A]
              font-['Space_Mono'] uppercase tracking-widest">
              Achieved ({doneMilestones.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {doneMilestones.map(m => (
              <div key={m.id}
                className="flex items-center gap-1.5 
                  bg-white border border-[#1A6B4A]/20
                  rounded-full px-3 py-1.5">
                <Check size={11} className="text-[#1A6B4A]"/>
                <p className="text-[9px] font-bold text-[#1A6B4A]
                  font-['Space_Mono'] uppercase tracking-wider">
                  {m.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4"
        style={{ scrollbarWidth: 'none' }}>
        {['all', 'SDE', 'AI Track', 'Health', 'Explorer', 
          'XP', 'Career'].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-[9px] font-bold',
              'font-["Space_Mono"] uppercase tracking-wider',
              'whitespace-nowrap transition-all shrink-0',
              activeFilter === f
                ? 'bg-[#1A1A2E] text-white'
                : 'bg-white border border-[#E5E0D8] text-[#9A9590]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* MILESTONE CARDS */}
      <div className="space-y-3">
        {filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={clsx(
              'bg-white rounded-2xl border p-5',
              m.isEndGoal 
                ? 'border-[#C0392B]/30 bg-[#FEF2F2]'
                : m.isOverdue
                  ? 'border-[#E07B39]/30'
                  : 'border-[#E5E0D8]'
            )}
          >
            <div className="flex items-start justify-between 
              gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 
                  flex-wrap">
                  <span className="text-[9px] font-bold
                    font-['Space_Mono'] uppercase tracking-wider
                    px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: m.color }}>
                    {m.domain}
                  </span>
                  {m.isOverdue && (
                    <span className="text-[9px] font-bold
                      text-[#E07B39] font-['Space_Mono'] uppercase">
                      Behind
                    </span>
                  )}
                  {m.isEndGoal && (
                    <span className="text-[9px] font-bold
                      text-[#C0392B] font-['Space_Mono'] uppercase">
                      Final Goal
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-[#1A1A2E]
                  font-['Inter'] mb-0.5">
                  {m.title}
                </p>
                <p className="text-xs text-[#9A9590] font-['Inter']">
                  {m.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                {!m.isEndGoal && (
                  <p className="text-xl font-bold font-['Space_Mono']"
                    style={{ color: m.color }}>
                    {m.prog}%
                  </p>
                )}
                <p className="text-[9px] text-[#9A9590]
                  font-['Space_Mono']">
                  {m.daysAway > 0 
                    ? `${m.daysAway}d away`
                    : `${Math.abs(m.daysAway)}d late`}
                </p>
              </div>
            </div>
            
            {!m.isEndGoal && (
              <div className="h-1.5 bg-[#F5F4F0] rounded-full 
                overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.prog}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px] text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-wider">
                Target: {format(m.targetDate, 'MMM yyyy')}
              </p>
              {m.isEndGoal && (
                <p className="text-[9px] font-bold text-[#C0392B]
                  font-['Space_Mono'] uppercase tracking-wider">
                  12-30 LPA
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CAREER TARGETS */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8]
        p-5 mt-5">
        <p className="text-[10px] font-bold text-[#9A9590]
          font-['Space_Mono'] uppercase tracking-widest mb-4">
          Target Companies
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ...SDE_TRACK_DATA.placement.targetCompanies,
            ...AI_TRACK_DATA.placement.targetCompanies
          ]
          .filter((c, i, arr) => 
            arr.findIndex(x => x.name === c.name) === i
          )
          .slice(0, 12)
          .map(company => (
            <div key={company.name}
              className={clsx(
                'flex items-center justify-between p-2.5',
                'rounded-xl border transition-all',
                company.priority === 'High'
                  ? 'border-[#1A6B4A]/20 bg-[#F0FDF4]'
                  : 'border-[#E5E0D8]'
              )}
            >
              <div>
                <p className="text-xs font-bold text-[#1A1A2E]
                  font-['Inter']">
                  {company.name}
                </p>
                <p className="text-[9px] text-[#9A9590]
                  font-['Inter']">
                  {company.type}
                </p>
              </div>
              <p className="text-[9px] font-bold text-[#1A6B4A]
                font-['Space_Mono'] whitespace-nowrap">
                {company.salary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
