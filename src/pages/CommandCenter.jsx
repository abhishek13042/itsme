import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useXpStore } from '../store/xpStore';
import { useQuestStore } from '../store/questStore';
import { useWalletStore } from '../store/walletStore';
import { useHealthStore } from '../store/healthStore';
import { useSdeStore } from '../store/sdeStore';
import { useTradingStore } from '../store/tradingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import {
  Zap, Flame, Wallet, TrendingUp, Code2,
  Heart, BookOpen, Check, Circle, Bot,
  RefreshCw, ChevronRight, Target, Brain,
  Sun, Moon, Sunset, Star
} from 'lucide-react';

const CommandCenter = () => {
  // === STATE ===
  const [aiGreeting, setAiGreeting] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [greetingGenerated, setGreetingGenerated] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [focusLoading, setFocusLoading] = useState(false);
  const [digest, setDigest] = useState(null)
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false)
  const [digestExpanded, setDigestExpanded] = useState(false)

  // === STORE CONNECTIONS ===
  const { xp, level, streakDays } = useXpStore();
  const { dailyQuests, todayCompletions } = useQuestStore();
  const { balance } = useWalletStore();
  const { todayLog } = useHealthStore();
  const { chapters, dsaSolved } = useSdeStore();
  const { trades } = useTradingStore();

  // === DERIVED DATA ===
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const TimeIcon = hour < 12 ? Sun : hour < 17 ? Sunset : Moon;
  
  const walletBalance = Math.floor((balance || 0) / 100);
  const completedCount = todayCompletions?.length || 0;
  const totalQuests = dailyQuests?.length || 0;
  
  const safeLevel = level || 1;
  const safeXp = xp || 0;
  const xpForCurrent = Math.pow((safeLevel - 1) * 10, 2);
  const xpForNext = Math.pow(safeLevel * 10, 2);
  const xpProgress = Math.max(0, safeXp - xpForCurrent);
  const xpRequired = Math.max(1, xpForNext - xpForCurrent);
  const xpPercent = Math.min(100, Math.floor((xpProgress / xpRequired) * 100));
  
  const completedChapters = chapters?.filter(c => c.completed)?.length || 0;
  const todayTrades = trades?.filter(t =>
    t.date?.startsWith(new Date().toISOString().split('T')[0])
  )?.length || 0;
  
  const gymDone = todayLog?.gym_done || false;
  const healthScore = todayLog?.day_score || 0;

  // === AI FUNCTIONS ===
  const generateWeeklyDigest = async () => {
    setIsGeneratingDigest(true)
    try {
      const { callGroq } = await import('../lib/groq')
      
      // Fetch this week's data
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]
      
      const [questRes, healthRes, xpRes] = await Promise.all([
        supabase.from('daily_completions')
          .select('*').gte('completed_date', weekStartStr),
        supabase.from('health_logs')
          .select('*').gte('log_date', weekStartStr),
        supabase.from('xp_log')
          .select('*').gte('created_at', weekStartStr)
      ])

      const totalXP = xpRes.data?.reduce((s, r) => s + r.amount, 0) || 0
      const questsDone = questRes.data?.length || 0
      const healthDays = healthRes.data?.length || 0
      const avgScore = healthRes.data?.length 
        ? Math.round(healthRes.data.reduce((s,r) => 
            s + (r.day_score || 0), 0) / healthRes.data.length)
        : 0

      const result = await callGroq({
        messages: [{
          role: 'user',
          content: `Abhishek's week in numbers:
          - Quests completed: ${questsDone}
          - XP earned: ${totalXP}
          - Health days logged: ${healthDays}/7
          - Average health score: ${avgScore}%
          
          Write a 3-sentence weekly reflection. 
          Sentence 1: What the numbers say about this week.
          Sentence 2: One specific thing to fix next week.
          Sentence 3: One thing to be proud of.
          Be direct. No fluff. Max 80 words.`
        }],
        max_tokens: 200,
        temperature: 0.7
      })

      setDigest({
        text: result.text,
        questsDone,
        totalXP,
        healthDays,
        avgScore,
        generatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('digest error:', err)
    }
    setIsGeneratingDigest(false)
  }

  const generateGreeting = async () => {
    setAiLoading(true);
    try {
      const prompt = `You are JARVIS — the AI core of PLAYER ONE, 
      a personal life RPG. Generate a sharp, personalized 
      ${timeOfDay} greeting for Abhishek.
      
      His current data:
      - Level ${safeLevel}, ${safeXp} total XP
      - Streak: ${streakDays} days
      - Wallet: ₹${walletBalance}
      - Daily quests: ${completedCount}/${totalQuests} done
      - Health score today: ${healthScore}%
      - Gym done: ${gymDone ? 'Yes' : 'No'}
      - DSA problems solved total: ${dsaSolved}
      - SDE chapters completed: ${completedChapters}
      - Trades today: ${todayTrades}
      
      Write 2-3 sentences maximum. Start with "${greeting}, Abhishek."
      Then give ONE sharp observation about his current status using
      the actual numbers. Then ONE specific thing to focus on today.
      Tone: precise, direct, like Tony Stark's JARVIS. No fluff.`;

      const { callGroq } = await import('../lib/groq');
      const result = await callGroq({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0.8
      });
      setAiGreeting(result.text);
      setGreetingGenerated(true);
    } catch (err) {
      console.error('greeting error:', err);
    }
    setAiLoading(false);
  };

  const getFocusTask = async () => {
    setFocusLoading(true);
    try {
      const incomplete = dailyQuests
        ?.filter(q => !todayCompletions?.includes(q.id))
        ?.map(q => q.title)
        ?.slice(0, 5)
        ?.join(', ') || 'no quests set';
      
      const prompt = `Abhishek's incomplete tasks today: ${incomplete}.
      His health score: ${healthScore}%. Gym done: ${gymDone}.
      DSA solved today: Abhishek has solved ${dsaSolved} total.
      
      Tell him in ONE sentence exactly what to do RIGHT NOW —
      the single highest leverage action for the next 2 hours.
      Be specific. No question marks. Just the directive.
      Start with an action verb.`;

      const { callGroq } = await import('../lib/groq');
      const result = await callGroq({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 60,
        temperature: 0.7
      });
      setFocusTask(result.text);
    } catch (err) {
      console.error('focus error:', err);
    }
    setFocusLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">

      {/* ── HERO GREETING SECTION ── */}
      <div className="mb-6">
        
        {/* Time + date */}
        <div className="flex items-center gap-2 mb-3">
          <TimeIcon size={14} className="text-[#E07B39]"/>
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']
            uppercase tracking-widest">
            {format(new Date(), 'EEEE, MMMM do')} · {format(new Date(), 'HH:mm')}
          </p>
        </div>

        {/* AI Greeting Card */}
        <div className="bg-[#1A1A2E] rounded-2xl p-5 mb-4 border border-white/5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {!greetingGenerated && !aiLoading && (
                <div>
                  <h1 className="text-xl font-bold text-white font-['Inter'] mb-1">
                    {greeting}, Abhishek.
                  </h1>
                  <p className="text-xs text-white/40 font-['Inter']">
                    Level {safeLevel} · {streakDays} day streak · 
                    ₹{walletBalance.toLocaleString()} wallet
                  </p>
                </div>
              )}
              {aiLoading && (
                <div className="space-y-2">
                  <div className="h-5 bg-white/10 rounded animate-pulse w-3/4"/>
                  <div className="h-4 bg-white/5 rounded animate-pulse w-full"/>
                  <div className="h-4 bg-white/5 rounded animate-pulse w-2/3"/>
                </div>
              )}
              {greetingGenerated && aiGreeting && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-white font-['Inter'] leading-relaxed"
                >
                  {aiGreeting}
                </motion.p>
              )}
            </div>
            <button
              onClick={generateGreeting}
              disabled={aiLoading}
              className={clsx(
                'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl',
                'text-[10px] font-bold font-["Space_Mono"] uppercase',
                'tracking-wider transition-all disabled:opacity-40',
                greetingGenerated
                  ? 'bg-white/10 text-white/60 hover:bg-white/20'
                  : 'bg-[#E07B39] text-white hover:opacity-90'
              )}
            >
              <Bot size={12}/>
              {aiLoading ? '...' : greetingGenerated ? 'Refresh' : 'Brief Me'}
            </button>
          </div>

          {/* Focus directive */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center 
            justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Target size={13} className="text-[#E07B39] shrink-0"/>
              {focusTask ? (
                <p className="text-xs text-white/70 font-['Inter'] truncate">
                  {focusTask}
                </p>
              ) : (
                <p className="text-xs text-white/30 font-['Inter']">
                  Get your focus directive for the next 2 hours
                </p>
              )}
            </div>
            <button
              onClick={getFocusTask}
              disabled={focusLoading}
              className="shrink-0 text-[9px] font-bold font-['Space_Mono'] 
                uppercase tracking-wider text-[#E07B39] hover:text-white 
                transition-colors disabled:opacity-40"
            >
              {focusLoading ? '...' : 'Focus →'}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Digest Card */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest mb-0.5">
              Weekly Digest
            </p>
            <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']">
              This Week So Far
            </p>
          </div>
          <button
            onClick={() => setDigestExpanded(!digestExpanded)}
            className="text-xs text-[#9A9590] font-['Space_Mono'] 
              uppercase tracking-wider"
          >
            {digestExpanded ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Stats row always visible */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Quests', value: digest?.questsDone ?? '—' },
            { label: 'XP', value: digest?.totalXP ?? '—' },
            { label: 'Health Days', value: digest ? `${digest.healthDays}/7` : '—' },
            { label: 'Avg Score', value: digest ? `${digest.avgScore}%` : '—' }
          ].map(stat => (
            <div key={stat.label} className="bg-[#F5F4F0] rounded-xl p-3 
              text-center">
              <p className="text-base font-bold text-[#1A1A2E] 
                font-['Space_Mono']">{stat.value}</p>
              <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] 
                uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {digestExpanded && (
          <div>
            {!digest && !isGeneratingDigest && (
              <button
                onClick={generateWeeklyDigest}
                className="w-full bg-[#1A1A2E] text-white py-2.5 rounded-xl
                  text-xs font-bold font-['Space_Mono'] uppercase tracking-wider"
              >
                Generate JARVIS Digest
              </button>
            )}
            {isGeneratingDigest && (
              <p className="text-xs text-[#9A9590] font-['Space_Mono'] 
                uppercase tracking-wider text-center py-3 animate-pulse">
                Analyzing your week...
              </p>
            )}
            {digest?.text && (
              <div className="bg-[#F5F4F0] rounded-xl p-4 
                border-l-4 border-[#E07B39]">
                <p className="text-sm text-[#1A1A2E] font-['Inter'] 
                  leading-relaxed">{digest.text}</p>
                <button onClick={generateWeeklyDigest}
                  className="text-[9px] text-[#9A9590] font-['Space_Mono'] 
                    uppercase tracking-wider mt-3 hover:text-[#E07B39]
                    transition-colors">
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Level',
            value: `LVL ${safeLevel}`,
            sub: `${xpPercent}% to next`,
            color: '#1A1A2E',
            bg: '#F0F0FF',
            progress: xpPercent,
            progressColor: '#1A1A2E'
          },
          {
            label: 'Streak',
            value: `${streakDays} days`,
            sub: streakDays > 0 ? 'Keep going' : 'Start today',
            color: '#E07B39',
            bg: '#FFF0E6',
            icon: Flame
          },
          {
            label: 'Wallet',
            value: `₹${walletBalance.toLocaleString()}`,
            sub: 'Total balance',
            color: '#1A6B4A',
            bg: '#F0FDF4'
          },
          {
            label: 'Quests',
            value: `${completedCount}/${totalQuests}`,
            sub: 'Done today',
            color: '#7C3AED',
            bg: '#F5F3FF',
            progress: totalQuests ? (completedCount/totalQuests)*100 : 0,
            progressColor: '#7C3AED'
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-[#E5E0D8] p-4"
          >
            <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono']
              uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-[#1A1A2E] font-['Space_Mono'] mb-1"
              style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[10px] text-[#9A9590] font-['Inter']">{stat.sub}</p>
            {stat.progress !== undefined && (
              <div className="mt-2 h-1 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stat.progress}%`,
                    backgroundColor: stat.progressColor
                  }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* LEFT — Daily Quests */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Daily Quests */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']
                  uppercase tracking-widest">
                  Today's Quests
                </p>
                {totalQuests > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 w-24 bg-[#F5F4F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A6B4A] rounded-full transition-all"
                        style={{ width: `${(completedCount/totalQuests)*100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1A6B4A]
                      font-['Space_Mono']">
                      {completedCount}/{totalQuests}
                    </span>
                  </div>
                )}
              </div>
              <a href="/quests"
                className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']
                  uppercase tracking-wider hover:text-[#1A1A2E] transition-colors
                  flex items-center gap-1">
                All <ChevronRight size={11}/>
              </a>
            </div>

            {totalQuests === 0 && (
              <div className="text-center py-8">
                <Target size={28} className="text-[#E5E0D8] mx-auto mb-2"/>
                <p className="text-sm text-[#9A9590] font-['Inter']">
                  No quests yet. Add from Quest Log.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {dailyQuests?.slice(0, 8).map((quest, i) => {
                const isDone = todayCompletions?.includes(quest.id);
                return (
                  <motion.div
                    key={quest.id || i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      isDone
                        ? 'bg-[#F0FDF4] border-[#1A6B4A]/20'
                        : 'bg-[#F5F4F0] border-transparent hover:border-[#E5E0D8]'
                    )}
                  >
                    <div className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center',
                      'justify-center shrink-0 transition-all',
                      isDone
                        ? 'bg-[#1A6B4A] border-[#1A6B4A]'
                        : 'border-[#E5E0D8] bg-white'
                    )}>
                      {isDone && (
                        <Check size={11} className="text-white" strokeWidth={3}/>
                      )}
                    </div>
                    <p className={clsx(
                      'text-sm font-["Inter"] flex-1 min-w-0 truncate',
                      isDone
                        ? 'text-[#9A9590] line-through font-normal'
                        : 'text-[#1A1A2E] font-medium'
                    )}>
                      {quest.title}
                    </p>
                    {quest.xp_reward && (
                      <span className="text-[10px] font-bold font-['Space_Mono']
                        text-[#1A6B4A] shrink-0">
                        +{quest.xp_reward}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Domain Status Grid */}
          <div>
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']
              uppercase tracking-widest mb-3">
              Domain Status
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  domain: 'SDE Track',
                  icon: Code2,
                  color: '#1A1A2E',
                  bg: '#EEF2FF',
                  stat: `${completedChapters} chapters done`,
                  sub: `${dsaSolved} problems solved`,
                  link: '/sde'
                },
                {
                  domain: 'Trading',
                  icon: TrendingUp,
                  color: '#E07B39',
                  bg: '#FFF0E6',
                  stat: `${todayTrades} trades today`,
                  sub: trades?.length > 0
                    ? `${trades.length} total logged`
                    : 'No trades logged',
                  link: '/trading'
                },
                {
                  domain: 'Health',
                  icon: Heart,
                  color: '#1A6B4A',
                  bg: '#F0FDF4',
                  stat: `${healthScore}% today`,
                  sub: gymDone ? 'Gym ✓ done' : 'Gym not done',
                  link: '/health'
                },
                {
                  domain: 'Exams',
                  icon: BookOpen,
                  color: '#C0392B',
                  bg: '#FEF2F2',
                  stat: 'Check status',
                  sub: 'Tap to review',
                  link: '/exams'
                }
              ].map((d, i) => {
                const Icon = d.icon;
                return (
                  <a key={i} href={d.link}
                    className="bg-white rounded-2xl border border-[#E5E0D8]
                      p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center
                        justify-center shrink-0"
                        style={{ backgroundColor: d.bg }}>
                        <Icon size={16} style={{ color: d.color }}/>
                      </div>
                      <p className="text-xs font-bold text-[#1A1A2E]
                        font-['Space_Mono'] uppercase tracking-wide">
                        {d.domain}
                      </p>
                    </div>
                    <p className="text-sm font-bold font-['Inter']"
                      style={{ color: d.color }}>
                      {d.stat}
                    </p>
                    <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-0.5">
                      {d.sub}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-[9px]
                      font-bold text-[#9A9590] font-['Space_Mono'] uppercase
                      tracking-wider group-hover:text-[#1A1A2E] transition-colors">
                      Open <ChevronRight size={10}/>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT — Activity + XP */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4">

          {/* XP Progress */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']
              uppercase tracking-widest mb-3">
              XP Progress
            </p>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-2xl font-bold text-[#1A1A2E]
                  font-['Space_Mono']">
                  LVL {safeLevel}
                </p>
                <p className="text-[10px] text-[#9A9590] font-['Inter']">
                  {xpProgress} / {xpRequired} XP
                </p>
              </div>
              <p className="text-lg font-bold text-[#E07B39]
                font-['Space_Mono']">
                {xpPercent}%
              </p>
            </div>
            <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#E07B39] rounded-full"
              />
            </div>
            <p className="text-[9px] text-[#9A9590] font-['Inter'] mt-2">
              {xpRequired - xpProgress} XP to Level {safeLevel + 1}
            </p>
          </div>

          {/* Today at a glance */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']
              uppercase tracking-widest mb-3">
              Today at a Glance
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: 'Gym',
                  done: gymDone,
                  value: gymDone ? 'Done ✓' : 'Not done'
                },
                {
                  label: 'Protein',
                  done: todayLog?.protein_hit || false,
                  value: todayLog?.protein_hit ? 'Hit ✓' : 'Not hit'
                },
                {
                  label: 'Sleep',
                  done: todayLog?.slept_by_midnight || false,
                  value: todayLog?.slept_by_midnight
                    ? 'On time ✓' : 'Late'
                },
                {
                  label: 'Quests',
                  done: completedCount === totalQuests && totalQuests > 0,
                  value: `${completedCount}/${totalQuests} done`
                },
                {
                  label: 'Skincare AM',
                  done: todayLog?.skincare_am || false,
                  value: todayLog?.skincare_am ? 'Done ✓' : 'Pending'
                }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-xs text-[#3D3830] font-['Inter']">
                    {item.label}
                  </p>
                  <span className={clsx(
                    'text-[10px] font-bold font-["Space_Mono"]',
                    item.done ? 'text-[#1A6B4A]' : 'text-[#9A9590]'
                    )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent XP events */}
          <div className="bg-[#1A1A2E] rounded-2xl p-5 text-white">
            <p className="text-[10px] font-bold text-white/40 font-['Space_Mono']
              uppercase tracking-widest mb-3">
              Recent Activity
            </p>
            <div className="flex flex-col gap-2">
              {todayCompletions?.slice(0, 5).map((id, i) => {
                const quest = dailyQuests?.find(q => q.id === id);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Zap size={11} className="text-[#E07B39] shrink-0"/>
                    <p className="text-[10px] text-white/60 font-['Inter'] truncate">
                      {quest?.title || 'Quest completed'}
                    </p>
                  </div>
                );
              })}
              {(!todayCompletions || todayCompletions.length === 0) && (
                <p className="text-[10px] text-white/30 font-['Inter']">
                  No activity yet today. Start moving.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CommandCenter;
