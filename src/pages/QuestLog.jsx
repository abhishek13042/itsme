import React, { useState, useEffect } from 'react';
import { useQuestStore } from '../store/questStore';
import { useXpStore } from '../store/xpStore';
import { useHealthStore } from '../store/healthStore';
import { useSdeStore } from '../store/sdeStore';
import { useWalletStore } from '../store/walletStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import {
  Plus, Check, Trash2, Sword, Zap, Star,
  ChevronDown, ChevronUp, Filter, Target,
  Flame, Clock, RotateCcw,
  Bot, Layers, RefreshCw, AlertCircle
} from 'lucide-react';

const QuestLog = () => {
  const [activeTab, setActiveTab] = useState('clusters');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '', description: '',
    xp_reward: 100, domain: 'General', difficulty: 'Medium'
  });
  const [filter, setFilter] = useState('All');
  const [completingId, setCompletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const {
    dailyQuests, todayCompletions, questClusters,
    isGeneratingClusters, clustersGeneratedAt, clustersApproved,
    addDailyQuest, completeDaily, deleteDailyQuest,
    loadQuestClusters, generateQuestClusters, approveCluster,
    approveAllClusters
  } = useQuestStore();

  const { level, streakDays } = useXpStore();
  const { todayLog, history } = useHealthStore();
  const { chapters, dsaSolved } = useSdeStore();
  const { balance } = useWalletStore();

  useEffect(() => {
    loadQuestClusters();
  }, []);

  const handleGenerateClusters = async () => {
    const contextData = {
      level,
      streak: streakDays,
      dsaSolved: dsaSolved || 0,
      chaptersCompleted: chapters?.filter(c => c.completed)?.length || 0,
      lastHealthScore: history?.[0]?.day_score || 0,
      gymDone: todayLog?.gym_done || false,
      completedToday: todayCompletions?.length || 0,
      wallet: Math.floor((balance || 0) / 100)
    };
    await generateQuestClusters(contextData);
  };

  const completedCount = todayCompletions?.length || 0;
  const totalDaily = dailyQuests?.length || 0;
  const completionPercent = totalDaily
    ? Math.floor((completedCount / totalDaily) * 100) : 0;
  const domains = ['All','SDE','Trading','Health',
    'Exam','Finance','General','Explorer'];
  const todayStr = new Date().toISOString().split('T')[0];
  const clustersAreToday = clustersGeneratedAt
    ?.startsWith(todayStr);

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sword size={14} className="text-[#E07B39]"/>
            <p className="text-[10px] font-bold text-[#9A9590]
              font-['Space_Mono'] uppercase tracking-widest">
              Quest Log
            </p>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]
            font-['Inter'] tracking-tight">
            Daily Missions
          </h1>
          <p className="text-xs text-[#9A9590] font-['Inter'] mt-1">
            {completedCount}/{totalDaily} done · {completionPercent}%
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateClusters}
            disabled={isGeneratingClusters}
            className="flex items-center gap-2 bg-[#E07B39] text-white
              px-4 py-2.5 rounded-xl text-xs font-bold font-['Space_Mono']
              uppercase tracking-wider hover:opacity-90 transition-all
              disabled:opacity-50"
          >
            <Bot size={13} className={isGeneratingClusters
              ? 'animate-spin' : ''}/>
            {isGeneratingClusters ? 'Generating...' : 'JARVIS Missions'}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#1A1A2E] text-white
              px-4 py-2.5 rounded-xl text-xs font-bold font-['Space_Mono']
              uppercase tracking-wider hover:bg-[#2a2a4e] transition-all"
          >
            <Plus size={13}/>
            Manual
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      {totalDaily > 0 && (
        <div className="mb-6">
          <div className="h-2 bg-white rounded-full border
            border-[#E5E0D8] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: completionPercent === 100
                  ? '#1A6B4A'
                  : completionPercent >= 50
                  ? '#E07B39' : '#1A1A2E'
              }}
            />
          </div>
          {completionPercent === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-[#1A6B4A]
                font-['Space_Mono'] uppercase tracking-wider mt-2 text-center"
            >
              ⚡ All missions complete — legendary day
            </motion.p>
          )}
        </div>
      )}

      {/* ADD QUEST FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white rounded-2xl border
              border-[#E5E0D8] p-5 shadow-sm">
              <p className="text-xs font-bold text-[#1A1A2E]
                font-['Space_Mono'] uppercase tracking-widest mb-4">
                Add Manual Quest
              </p>
              <input
                type="text"
                value={newQuest.title}
                onChange={e => setNewQuest(p =>
                  ({ ...p, title: e.target.value }))}
                placeholder="What needs to be done?"
                className="w-full bg-[#F5F4F0] border border-transparent
                  focus:border-[#E07B39] rounded-xl px-4 py-3 text-sm
                  font-['Inter'] text-[#1A1A2E] placeholder-[#9A9590]
                  focus:outline-none transition-all mb-3"
              />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[9px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-wider mb-2">
                    Domain
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['General','SDE','Trading','Health',
                      'Exam','Finance'].map(d => (
                      <button key={d}
                        onClick={() => setNewQuest(p =>
                          ({ ...p, domain: d }))}
                        className={clsx(
                          'px-2.5 py-1 rounded-lg text-[10px] font-bold',
                          'font-["Space_Mono"] uppercase transition-all',
                          newQuest.domain === d
                            ? 'bg-[#1A1A2E] text-white'
                            : 'bg-[#F5F4F0] text-[#9A9590]'
                        )}
                      >{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-wider mb-2">
                    Difficulty
                  </p>
                  <div className="flex gap-1.5">
                    {[
                      { d: 'Easy', xp: 50, color: '#1A6B4A' },
                      { d: 'Medium', xp: 100, color: '#E07B39' },
                      { d: 'Hard', xp: 200, color: '#C0392B' }
                    ].map(({ d, xp, color }) => (
                      <button key={d}
                        onClick={() => setNewQuest(p => ({
                          ...p, difficulty: d, xp_reward: xp
                        }))}
                        className={clsx(
                          'flex-1 py-1.5 rounded-lg text-[10px] font-bold',
                          'font-["Space_Mono"] uppercase transition-all border',
                          newQuest.difficulty === d
                            ? 'text-white border-transparent'
                            : 'bg-white text-[#9A9590] border-[#E5E0D8]'
                        )}
                        style={newQuest.difficulty === d
                          ? { backgroundColor: color } : {}}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!newQuest.title.trim()) return
                    await addDailyQuest(newQuest)
                    setNewQuest({
                      title: '', description: '',
                      xp_reward: 100, domain: 'General',
                      difficulty: 'Medium'
                    })
                    setShowAddForm(false)
                  }}
                  className="flex-1 bg-[#1A6B4A] text-white py-2.5
                    rounded-xl text-xs font-bold font-['Space_Mono']
                    uppercase tracking-wider hover:opacity-90 transition-all"
                >
                  Add Quest
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-[#F5F4F0] text-[#9A9590]
                    rounded-xl text-xs font-bold font-['Space_Mono']
                    uppercase hover:bg-[#E5E0D8] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS */}
      <div className="flex items-center gap-1 bg-white rounded-xl
        border border-[#E5E0D8] p-1 w-fit mb-5 overflow-x-auto">
        {[
          { id: 'clusters', label: `Clusters (${questClusters.length})` },
          { id: 'daily', label: `Active (${totalDaily})` },
          { id: 'completed', label: `Done (${completedCount})` }
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-xs font-bold font-["Space_Mono"]',
              'uppercase tracking-wider transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-[#1A1A2E] text-white'
                : 'text-[#9A9590] hover:text-[#1A1A2E]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CLUSTERS TAB ── */}
      {activeTab === 'clusters' && (
        <div className="flex flex-col gap-4">

          {/* Empty state */}
          {questClusters.length === 0 && !isGeneratingClusters && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white rounded-2xl border
                border-[#E5E0D8] flex items-center justify-center
                mx-auto mb-4">
                <Bot size={28} className="text-[#E07B39]"/>
              </div>
              <p className="text-sm font-bold text-[#1A1A2E]
                font-['Inter'] mb-2">
                No missions generated yet
              </p>
              <p className="text-xs text-[#9A9590] font-['Inter'] mb-6
                max-w-sm mx-auto">
                Hit "JARVIS Missions" — JARVIS will analyze your progress
                and generate personalized quest clusters for today.
              </p>
              <button
                onClick={handleGenerateClusters}
                disabled={isGeneratingClusters}
                className="bg-[#E07B39] text-white px-8 py-3 rounded-xl
                  font-bold font-['Space_Mono'] uppercase tracking-wider
                  hover:opacity-90 transition-all flex items-center gap-2
                  mx-auto"
              >
                <Bot size={14}/>
                Generate Today's Missions
              </button>
            </div>
          )}

          {/* Generating state */}
          {isGeneratingClusters && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-[#1A1A2E] rounded-2xl
                flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Bot size={22} className="text-[#E07B39]"/>
              </div>
              <p className="text-sm font-bold text-[#1A1A2E]
                font-['Space_Mono'] uppercase tracking-wider mb-1">
                Analyzing your progress...
              </p>
              <p className="text-xs text-[#9A9590] font-['Inter']">
                JARVIS is building personalized missions for you
              </p>
            </div>
          )}

          {/* Approve All button */}
          {questClusters.length > 0 && !clustersApproved && (
            <div className="bg-[#1A1A2E] rounded-2xl p-4 flex items-center
              justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-white
                  font-['Space_Mono'] uppercase tracking-wider">
                  {questClusters.filter(c => !c.approved).length} clusters ready
                </p>
                <p className="text-[10px] text-white/50 font-['Inter'] mt-0.5">
                  Approve clusters to add quests to your daily list
                </p>
              </div>
              <button
                onClick={approveAllClusters}
                className="flex items-center gap-2 bg-[#E07B39] text-white
                  px-4 py-2 rounded-xl text-xs font-bold font-['Space_Mono']
                  uppercase tracking-wider hover:opacity-90 transition-all
                  whitespace-nowrap"
              >
                <Check size={12}/>
                Approve All
              </button>
            </div>
          )}

          {/* Cluster cards */}
          {questClusters.map((cluster, ci) => {
            const clusterQuests = cluster.quests || []
            const totalXp = cluster.total_xp ||
              clusterQuests.reduce((s, q) => s + (q.xp_reward || 0), 0)
            const isApproved = cluster.approved

            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.06 }}
                className={clsx(
                  'bg-white rounded-2xl border overflow-hidden transition-all',
                  isApproved
                    ? 'border-[#1A6B4A]/30'
                    : 'border-[#E5E0D8] hover:shadow-sm'
                )}
              >
                {/* Cluster header */}
                <div className="p-4 flex items-center justify-between gap-3"
                  style={{
                    borderLeft: `4px solid ${clusterQuests[0]?.color || '#1A1A2E'}`
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">
                      {clusterQuests[0]?.icon || '⚔️'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-[#1A1A2E]
                          font-['Inter']">
                          {cluster.cluster_name}
                        </p>
                        <span className="text-[9px] font-bold
                          font-['Space_Mono'] uppercase px-2 py-0.5
                          rounded-full bg-[#F5F4F0] text-[#9A9590]">
                          {cluster.domain}
                        </span>
                        {isApproved && (
                          <span className="text-[9px] font-bold
                            font-['Space_Mono'] uppercase px-2 py-0.5
                            rounded-full bg-emerald-50 text-emerald-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#9A9590] font-['Inter']
                        truncate">
                        {cluster.theme}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold
                      text-[#1A6B4A] font-['Space_Mono']">
                      +{totalXp} XP
                    </span>
                    {!isApproved && (
                      <button
                        onClick={async () => {
                          setApprovingId(cluster.id)
                          await approveCluster(cluster.id)
                          setApprovingId(null)
                        }}
                        disabled={approvingId === cluster.id}
                        className="flex items-center gap-1.5 bg-[#1A1A2E]
                          text-white px-3 py-1.5 rounded-lg text-[10px]
                          font-bold font-['Space_Mono'] uppercase tracking-wider
                          hover:bg-[#2a2a4e] transition-all disabled:opacity-50"
                      >
                        {approvingId === cluster.id
                          ? '...'
                          : <><Check size={10}/> Add</>
                        }
                      </button>
                    )}
                  </div>
                </div>

                {/* Why today */}
                {clusterQuests[0]?.why_today && (
                  <div className="px-4 py-2 bg-[#FFF0E6] border-t
                    border-[#E5E0D8]">
                    <p className="text-[10px] text-[#E07B39] font-['Inter']
                      font-medium">
                      💡 {clusterQuests[0].why_today}
                    </p>
                  </div>
                )}

                {/* Quest list inside cluster */}
                <div className="border-t border-[#F5F4F0]">
                  {clusterQuests.map((q, qi) => (
                    <div key={qi}
                      className="flex items-start gap-3 px-4 py-3
                        border-b border-[#F5F4F0] last:border-0"
                    >
                      <div className="w-1.5 h-1.5 rounded-full mt-2
                        shrink-0 bg-[#E5E0D8]"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1A1A2E]
                          font-['Inter']">
                          {q.title}
                        </p>
                        {q.description && (
                          <p className="text-[10px] text-[#9A9590]
                            font-['Inter'] mt-0.5 leading-relaxed">
                            {q.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {q.time_estimate && (
                          <span className="text-[9px] text-[#9A9590]
                            font-['Space_Mono']">
                            {q.time_estimate}
                          </span>
                        )}
                        <span className={clsx(
                          'text-[9px] font-bold font-["Space_Mono"]',
                          'uppercase px-1.5 py-0.5 rounded',
                          q.difficulty === 'Hard'
                            ? 'bg-red-50 text-red-600'
                            : q.difficulty === 'Medium'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-green-50 text-green-600'
                        )}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-bold
                          text-[#1A6B4A] font-['Space_Mono']">
                          +{q.xp_reward}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── DAILY TAB ── */}
      {activeTab === 'daily' && (
        <div className="flex flex-col gap-3">

          {/* Domain filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {domains.map(d => (
              <button key={d}
                onClick={() => setFilter(d)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-[10px] font-bold',
                  'font-["Space_Mono"] uppercase tracking-wider',
                  'whitespace-nowrap transition-all border',
                  filter === d
                    ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                    : 'bg-white text-[#9A9590] border-[#E5E0D8]'
                )}
              >{d}</button>
            ))}
          </div>

          {dailyQuests
            ?.filter(q => filter === 'All' || q.domain === filter)
            ?.map((quest, i) => {
              const isDone = todayCompletions?.find(
                c => c.quest_id === quest.id
              )
              const domainColors = {
                SDE: { bg: '#EEF2FF', text: '#1A1A2E' },
                Trading: { bg: '#FFF0E6', text: '#E07B39' },
                Health: { bg: '#F0FDF4', text: '#1A6B4A' },
                Exam: { bg: '#FEF2F2', text: '#C0392B' },
                Finance: { bg: '#EEF2FF', text: '#1A1A2E' },
                Explorer: { bg: '#F5F3FF', text: '#7C3AED' },
                General: { bg: '#F5F4F0', text: '#9A9590' }
              }
              const dc = domainColors[quest.domain] || domainColors.General

              return (
                <motion.div key={quest.id || i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={clsx(
                    'bg-white rounded-2xl border transition-all',
                    isDone
                      ? 'border-[#1A6B4A]/30 opacity-60'
                      : 'border-[#E5E0D8] hover:shadow-sm'
                  )}
                >
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={async () => {
                        if (isDone) return
                        setCompletingId(quest.id)
                        await completeDaily(quest.id)
                        setCompletingId(null)
                      }}
                      disabled={!!isDone || completingId === quest.id}
                      className={clsx(
                        'w-6 h-6 rounded-full border-2 flex items-center',
                        'justify-center shrink-0 transition-all',
                        isDone
                          ? 'bg-[#1A6B4A] border-[#1A6B4A]'
                          : completingId === quest.id
                          ? 'border-[#E07B39] animate-pulse'
                          : 'border-[#E5E0D8] hover:border-[#1A6B4A]'
                      )}
                    >
                      {isDone && (
                        <Check size={12} className="text-white"
                          strokeWidth={3}/>
                      )}
                    </button>

                    <div className="flex-1 min-w-0 px-1">
                      <p className={clsx(
                        'text-sm font-bold font-["Inter"]',
                        isDone
                          ? 'text-[#9A9590] line-through'
                          : 'text-[#1A1A2E]'
                      )}>
                        {quest.title}
                      </p>
                      {quest.description && (
                        <p className="text-[10px] text-[#9A9590]
                          font-['Inter'] mt-0.5 truncate">
                          {quest.description}
                        </p>
                      )}
                      {quest.source === 'jarvis' && (
                        <span className="text-[9px] text-[#E07B39]
                          font-['Space_Mono'] uppercase tracking-wider">
                          JARVIS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-[9px]
                        font-bold font-['Space_Mono'] uppercase px-2 py-0.5
                        rounded-full"
                        style={{
                          backgroundColor: dc.bg,
                          color: dc.text
                        }}
                      >
                        {quest.domain}
                      </span>
                      <span className="text-[10px] font-bold text-[#1A6B4A]
                        font-['Space_Mono'] whitespace-nowrap">
                        +{quest.xp_reward}
                      </span>
                      <button
                        onClick={() => deleteDailyQuest(quest.id)}
                        className="p-1.5 rounded-lg text-[#9A9590]
                          hover:text-[#C0392B] hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}

          {dailyQuests?.filter(q =>
            filter === 'All' || q.domain === filter
          )?.length === 0 && (
            <div className="text-center py-12">
              <Target size={28} className="text-[#E5E0D8] mx-auto mb-3"/>
              <p className="text-sm text-[#9A9590] font-['Inter']">
                {filter !== 'All'
                  ? `No ${filter} quests.`
                  : 'No active quests. Generate or add manually.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLETED TAB ── */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-3">
          {todayCompletions?.length === 0 && (
            <div className="text-center py-12">
              <Check size={28} className="text-[#E5E0D8] mx-auto mb-3"/>
              <p className="text-sm text-[#9A9590] font-['Inter']">
                Nothing completed yet today.
              </p>
            </div>
          )}
          {todayCompletions?.map((item, i) => (
            <motion.div key={item.id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-[#1A6B4A]/20
                p-4 flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-[#1A6B4A]
                flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" strokeWidth={3}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#9A9590]
                  font-['Inter'] line-through truncate">
                  {item.quest_title || item.title}
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#1A6B4A]
                font-['Space_Mono'] shrink-0">
                +{item.xp_reward || 100} XP
              </span>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  )
}

export default QuestLog
