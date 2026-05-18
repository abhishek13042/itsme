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
  ChevronDown, ChevronUp, Filter, Target, CheckCircle2,
  Flame, Clock, RotateCcw,
  Bot, Layers, RefreshCw, AlertCircle,
  Code2, Heart
} from 'lucide-react';

const DOMAIN_COLORS = {
  health: '#1A6B4A',
  sde: '#1A1A2E',
  trading: '#E07B39',
  explorer: '#7C3AED',
  finance: '#C0392B',
  general: '#9A9590',
  exam: '#E07B39',
  ai_track: '#1A6B4A'
};

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
  const [isResetting, setIsResetting] = useState(false);

  const {
    dailyQuests, todayCompletions,
    isLoading, addDailyQuest, completeDaily, deleteDailyQuest,
    loadDailyQuests,
    studyQuests, lifeQuests, isGeneratingStudy,
    isGeneratingLife, studyGenerated, lifeGenerated,
    generateStudyQuests, generateLifeQuests
  } = useQuestStore();

  const { level, streakDays } = useXpStore();
  const { todayLog, history } = useHealthStore();
  const { chapters, dsaSolved } = useSdeStore();
  const { balance } = useWalletStore();

  useEffect(() => {
    loadDailyQuests(true); // Always force-refresh on mount
  }, []);

  const handleResetDailyQuests = async () => {
    if (!window.confirm(
      'Clear ALL daily quests and reset cluster approvals? This removes corrupt data.'
    )) return
    setIsResetting(true)
    try {
      const { supabase } = await import('../lib/supabase')
      await supabase.from('daily_quests').delete().eq('is_active', true)
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('quest_clusters')
        .update({ approved: false, approved_at: null })
        .eq('cluster_date', today)
      await loadDailyQuests(true)
      setActiveTab('clusters')
      const { triggerJarvisToast } = await import('../components/JarvisToast')
      triggerJarvisToast({ type: 'success', title: 'RESET', message: 'Re-approve clusters now.', duration: 3000 })
    } catch (err) {
      console.error('Reset error:', err)
    }
    setIsResetting(false)
  };

  const completedCount = todayCompletions?.length || 0;
  const totalDaily = dailyQuests?.length || 0;
  const completionPercent = totalDaily
    ? Math.floor((completedCount / totalDaily) * 100) : 0;
  const domains = ['All','SDE','Trading','Health',
    'Exam','Finance','General','Explorer'];

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-[#E5E0D8] animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#E5E0D8] animate-pulse rounded-2xl" />
          <div className="h-64 bg-[#E5E0D8] animate-pulse rounded-2xl" />
        </div>
        <div className="h-96 bg-[#E5E0D8] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">

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
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#1A1A2E] text-white
              px-4 py-2.5 rounded-xl text-xs font-bold font-['Space_Mono']
              uppercase tracking-wider hover:bg-[#2a2a4e] transition-all"
          >
            <Plus size={13}/>
            Manual
          </button>
          <button
            onClick={handleResetDailyQuests}
            disabled={isResetting}
            title="Clear corrupt quest data and start fresh"
            className="flex items-center gap-1.5 bg-[#C0392B]/10 text-[#C0392B]
              px-3 py-2.5 rounded-xl text-xs font-bold font-['Space_Mono']
              uppercase tracking-wider hover:bg-[#C0392B]/20 transition-all
              disabled:opacity-50 border border-[#C0392B]/20"
          >
            <Trash2 size={12}/>
            {isResetting ? '...' : 'Reset'}
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
          { id: 'clusters', label: 'Clusters' },
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

          {/* CLUSTER 1 — STUDY */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#1A1A2E]"/>
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    Study Cluster
                  </p>
                </div>
                <p className="text-sm font-bold text-[#1A1A2E] 
                  font-['Inter']">
                  SDE · AI Track · Explorer
                </p>
              </div>
              <button
                onClick={generateStudyQuests}
                disabled={isGeneratingStudy}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold',
                  'font-["Space_Mono"] uppercase tracking-wider',
                  'transition-all disabled:opacity-50',
                  studyGenerated 
                    ? 'bg-[#F5F4F0] text-[#9A9590]'
                    : 'bg-[#1A1A2E] text-white'
                )}
              >
                {isGeneratingStudy 
                  ? 'Generating...' 
                  : studyGenerated 
                    ? 'Regenerate' 
                    : 'Generate Study Quests'}
              </button>
            </div>

            {/* Study quests list */}
            {studyQuests.length > 0 ? (
              <div className="space-y-2">
                {studyQuests.map(quest => {
                  const done = todayCompletions?.some(
                    c => c.quest_id === quest.id
                  )
                  return (
                    <div key={quest.id}
                      className={clsx(
                        'flex items-start gap-3 p-3 rounded-xl border',
                        'transition-all',
                        done 
                          ? 'border-[#1A6B4A]/20 bg-[#F0FDF4]'
                          : 'border-[#E5E0D8] hover:border-[#1A1A2E]'
                      )}
                    >
                      <button
                        onClick={() => !done && completeDaily(quest.id)}
                        disabled={done}
                        className={clsx(
                          'w-5 h-5 rounded border-2 flex items-center',
                          'justify-center shrink-0 mt-0.5 transition-all',
                          done
                            ? 'bg-[#1A6B4A] border-[#1A6B4A]'
                            : 'border-[#E5E0D8] bg-white hover:border-[#1A1A2E]'
                        )}
                      >
                        {done && (
                          <Check size={11} className="text-white" 
                            strokeWidth={3}/>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 
                          flex-wrap">
                          <p className={clsx(
                            'text-sm font-bold font-["Inter"]',
                            done ? 'text-[#9A9590] line-through' 
                              : 'text-[#1A1A2E]'
                          )}>
                            {quest.title || quest.name || 'Quest'}
                          </p>
                          <span className="text-[8px] font-bold 
                            font-['Space_Mono'] uppercase px-1.5 py-0.5
                            rounded-full bg-[#1A1A2E]/10 text-[#1A1A2E]
                            shrink-0">
                            {quest.domain}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9A9590] 
                          font-['Inter']">
                          {quest.description}
                        </p>
                        {quest.why_today && (
                          <p className="text-[9px] text-[#E07B39]
                            font-['Space_Mono'] uppercase tracking-wider mt-1">
                            → {quest.why_today}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-bold text-[#E07B39]
                          font-['Space_Mono']">
                          +{quest.xp_reward}
                        </p>
                        {quest.estimated_minutes && (
                          <p className="text-[9px] text-[#9A9590]
                            font-['Space_Mono']">
                            {quest.estimated_minutes}m
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : !isGeneratingStudy ? (
              <div className="text-center py-8">
                <Code2 size={28} className="text-[#E5E0D8] mx-auto mb-2"/>
                <p className="text-xs text-[#9A9590] font-['Inter']">
                  Generate your study quests for today
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-[#F5F4F0] rounded-xl 
                    animate-pulse"/>
                ))}
              </div>
            )}
          </div>

          {/* CLUSTER 2 — LIFE */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#E07B39]"/>
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    Life Cluster
                  </p>
                </div>
                <p className="text-sm font-bold text-[#1A1A2E] 
                  font-['Inter']">
                  Health · Trading · Habits · Finance
                </p>
              </div>
              <button
                onClick={generateLifeQuests}
                disabled={isGeneratingLife}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold',
                  'font-["Space_Mono"] uppercase tracking-wider',
                  'transition-all disabled:opacity-50',
                  lifeGenerated 
                    ? 'bg-[#F5F4F0] text-[#9A9590]'
                    : 'bg-[#E07B39] text-white'
                )}
              >
                {isGeneratingLife 
                  ? 'Generating...' 
                  : lifeGenerated 
                    ? 'Regenerate' 
                    : 'Generate Life Quests'}
              </button>
            </div>

            {/* Life quests list */}
            {lifeQuests.length > 0 ? (
              <div className="space-y-2">
                {lifeQuests.map(quest => {
                  const done = todayCompletions?.some(
                    c => c.quest_id === quest.id
                  )
                  return (
                    <div key={quest.id}
                      className={clsx(
                        'flex items-start gap-3 p-3 rounded-xl border',
                        'transition-all',
                        done 
                          ? 'border-[#1A6B4A]/20 bg-[#F0FDF4]'
                          : 'border-[#E5E0D8] hover:border-[#E07B39]'
                      )}
                    >
                      <button
                        onClick={() => !done && completeDaily(quest.id)}
                        disabled={done}
                        className={clsx(
                          'w-5 h-5 rounded border-2 flex items-center',
                          'justify-center shrink-0 mt-0.5 transition-all',
                          done
                            ? 'bg-[#1A6B4A] border-[#1A6B4A]'
                            : 'border-[#E5E0D8] bg-white hover:border-[#E07B39]'
                        )}
                      >
                        {done && <Check size={11} className="text-white" 
                          strokeWidth={3}/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 
                          flex-wrap">
                          <p className={clsx(
                            'text-sm font-bold font-["Inter"]',
                            done ? 'text-[#9A9590] line-through' 
                              : 'text-[#1A1A2E]'
                          )}>
                            {quest.title || quest.name || 'Quest'}
                          </p>
                          <span className="text-[8px] font-bold 
                            font-['Space_Mono'] uppercase px-1.5 py-0.5
                            rounded-full bg-[#E07B39]/10 text-[#E07B39]
                            shrink-0">
                            {quest.domain}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9A9590] 
                          font-['Inter']">
                          {quest.description}
                        </p>
                        {quest.why_today && (
                          <p className="text-[9px] text-[#E07B39]
                            font-['Space_Mono'] uppercase tracking-wider mt-1">
                            → {quest.why_today}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-bold text-[#E07B39]
                          font-['Space_Mono']">
                          +{quest.xp_reward}
                        </p>
                        {quest.estimated_minutes && (
                          <p className="text-[9px] text-[#9A9590]
                            font-['Space_Mono']">
                            {quest.estimated_minutes}m
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : !isGeneratingLife ? (
              <div className="text-center py-8">
                <Heart size={28} className="text-[#E5E0D8] mx-auto mb-2"/>
                <p className="text-xs text-[#9A9590] font-['Inter']">
                  Generate your life quests for today
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-16 bg-[#F5F4F0] rounded-xl 
                    animate-pulse"/>
                ))}
              </div>
            )}
          </div>
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
                sde: { bg: '#EEF2FF', text: '#1A1A2E' },
                trading: { bg: '#FFF0E6', text: '#E07B39' },
                health: { bg: '#F0FDF4', text: '#1A6B4A' },
                exam: { bg: '#FEF2F2', text: '#C0392B' },
                finance: { bg: '#EEF2FF', text: '#1A1A2E' },
                explorer: { bg: '#F5F3FF', text: '#7C3AED' },
                general: { bg: '#F5F4F0', text: '#9A9590' }
              }
              const dKey = (quest.domain || 'general').toLowerCase()
              const dc = domainColors[dKey] || domainColors.general

              return (
                <motion.div key={quest.id || `q-${i}`}
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
                        {quest.title || quest.name || 'Unnamed Quest'}
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
            <div className="text-center py-16">
              <Target size={32} className="text-[#E5E0D8] mx-auto mb-3"/>
              <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] mb-1">
                No Active Quests
              </p>
              <p className="text-xs text-[#9A9590] font-['Inter'] max-w-xs mx-auto">
                Generate a cluster or add quests manually.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLETED TAB ── */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-3">
          {todayCompletions?.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle2 size={32} className="text-[#E5E0D8] mx-auto mb-3"/>
              <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] mb-1">
                Nothing Completed Yet
              </p>
              <p className="text-xs text-[#9A9590] font-['Inter'] max-w-xs mx-auto">
                Complete quests to see them here.
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
                  {item.quest_title || item.title || 'Quest completed'}
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
