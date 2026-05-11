import React, { useState, useEffect, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useXpStore } from '../store/xpStore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis
} from 'recharts';
import { 
  User, Flame, Zap, Award, Target, Brain, 
  Clock, CheckCircle2, CircleDot, ChevronDown, 
  ChevronUp, Star, Sword, Lock, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const CharacterSheet = () => {
  const { 
    stats, badges, brainLogs, xpEvents, playerState, 
    loading, loadCharacterData, recalculate, submitBrainLog 
  } = useCharacterStore();

  const { streakDays } = useXpStore();

  const [isXpLogOpen, setIsXpLogOpen] = useState(false);
  const [activeBadgeCategory, setActiveBadgeCategory] = useState('ALL');
  const [brainForm, setBrainForm] = useState({
    topic: '',
    subject_area: 'DSA',
    was_stuck_on: '',
    minutes_pushed: 20,
    solved: false,
    what_clicked: '',
    concept_unlocked: '',
    difficulty: 3,
    mood_before: 3,
    mood_after: 3
  });
  const [submitFeedback, setSubmitFeedback] = useState(null);

  useEffect(() => {
    loadCharacterData();
  }, []);

  // === DERIVED XP DATA ===
  const level = playerState?.level || 1;
  const xp = playerState?.xp || 0;
  const xpForCurrent = Math.pow((level - 1) * 10, 2);
  const xpForNext = Math.pow(level * 10, 2);
  const xpProgress = Math.max(0, xp - xpForCurrent);
  const xpRequired = Math.max(1, xpForNext - xpForCurrent);
  const xpPercent = Math.min(100, Math.floor((xpProgress / xpRequired) * 100));

  // Radar chart data
  const radarData = useMemo(() => [
    { subject: 'DSA', A: stats.dsa, fullMark: 100 },
    { subject: 'SysDesign', A: stats.sysdesign, fullMark: 100 },
    { subject: 'Backend', A: stats.backend, fullMark: 100 },
    { subject: 'Trading', A: stats.trading, fullMark: 100 },
    { subject: 'Physique', A: stats.physique, fullMark: 100 },
    { subject: 'Analytical', A: stats.analytical, fullMark: 100 },
  ], [stats]);

  const lineData = useMemo(() => {
    return [...brainLogs].reverse().slice(-30).map(log => ({
      date: format(new Date(log.logged_at), 'MM/dd'),
      minutes: log.minutes_pushed
    }));
  }, [brainLogs]);

  const handleBrainSubmit = async (e) => {
    e.preventDefault();
    const res = await submitBrainLog(brainForm);
    if (res.success) {
      setSubmitFeedback(res.data);
      setBrainForm({
        topic: '',
        subject_area: 'DSA',
        was_stuck_on: '',
        minutes_pushed: 20,
        solved: false,
        what_clicked: '',
        concept_unlocked: '',
        difficulty: 3,
        mood_before: 3,
        mood_after: 3
      });
      setTimeout(() => setSubmitFeedback(null), 5000);
    }
  };

  const badgeCategories = ['ALL', 'IDENTITY', 'SDE', 'TRADING', 'HEALTH', 'BRAIN', 'MONEY', 'KNOWLEDGE', 'EXAMS'];
  const filteredBadges = activeBadgeCategory === 'ALL' 
    ? badges 
    : badges.filter(b => b.category?.toUpperCase() === activeBadgeCategory);

  if (loading && !playerState) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F5F4F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg animate-pulse flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#E07B39]" />
          </div>
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
            Syncing Identity...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">
      
      {/* ── PAGE HEADER ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-[#E07B39]"/>
          <p className="text-[10px] font-bold text-[#9A9590] 
            font-['Space_Mono'] uppercase tracking-widest">
            Character Sheet
          </p>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A2E] 
          font-['Inter'] tracking-tight">
          Abhishek
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-[#1A1A2E] text-white 
            font-['Space_Mono'] text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
            LVL {level}
          </span>
          {streakDays > 0 && (
            <span className="bg-[#FFF0E6] text-[#E07B39] 
              font-['Space_Mono'] text-xs font-bold px-3 py-1 
              rounded-lg flex items-center gap-1 shadow-sm border border-[#E07B39]/10">
              <Flame size={11}/> {streakDays} day streak
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        
        {/* LEFT: Identity & Stats Bar */}
        <div className="flex-1 space-y-6">
          
          {/* XP Progress Card */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm">
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest mb-3">
              XP Progress
            </p>
            <div className="flex items-end justify-between mb-2">
              <p className="text-3xl font-bold text-[#1A1A2E] 
                font-['Space_Mono']">
                {xp?.toLocaleString()}
              </p>
              <p className="text-xs text-[#9A9590] font-['Space_Mono']">
                LVL {level} → {level + 1}
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
            <div className="flex justify-between items-center mt-2">
              <p className="text-[10px] text-[#9A9590] font-['Inter']">
                {xpRequired - xpProgress} XP to next level
              </p>
              <button 
                onClick={recalculate}
                className="text-[9px] font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-wider hover:text-[#E07B39] transition-colors"
              >
                Sync Stats
              </button>
            </div>
          </div>

          {/* RPG Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'DSA', val: stats.dsa, color: '#1A1A2E' },
              { label: 'SysDesign', val: stats.sysdesign, color: '#7C3AED' },
              { label: 'Backend', val: stats.backend, color: '#E07B39' },
              { label: 'Trading', val: stats.trading, color: '#E07B39' },
              { label: 'Physique', val: stats.physique, color: '#1A6B4A' },
              { label: 'Analytical', val: stats.analytical, color: '#C0392B' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold font-['Space_Mono'] 
                    uppercase tracking-widest text-[#9A9590]">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold font-['Space_Mono'] text-[#1A1A2E]">
                    {s.val}
                  </p>
                </div>
                <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s.val}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Attribute Web */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm h-full flex flex-col items-center">
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest mb-6 w-full">
              Attribute Matrix
            </p>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#E5E0D8" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9A9590', fontSize: 10, fontWeight: 500 }} />
                  <Radar
                    name="Stats"
                    dataKey="A"
                    stroke="#1A1A2E"
                    strokeWidth={2}
                    fill="#1A1A2E"
                    fillOpacity={0.1}
                    animationDuration={800}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto pt-6 w-full border-t border-[#F5F4F0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-[#E07B39]"/>
                  <p className="text-[10px] font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-wider">
                    {badges.filter(b => b.earned).length} / {badges.length} Badges
                  </p>
                </div>
                <p className="text-[10px] text-[#9A9590] font-['Inter']">
                  Updated {playerState?.stats_last_updated ? formatDistanceToNow(new Date(playerState.stats_last_updated)) : 'recently'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION: BRAIN LOGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Brain Log Form */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm border-l-4 border-l-[#7C3AED]">
            <div className="mb-6">
              <h3 className="text-[10px] font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-widest">
                Log Thinking Session
              </h3>
              <p className="text-[11px] text-[#9A9590] mt-1">Record deep work and breakthroughs.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-[#9A9590] uppercase font-['Space_Mono'] tracking-wider mb-1 block">Topic</label>
                <input 
                  type="text"
                  placeholder="What were you working on?"
                  className="w-full bg-[#F5F4F0] border-transparent focus:border-[#7C3AED] border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  value={brainForm.topic}
                  onChange={e => setBrainForm({...brainForm, topic: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-[#9A9590] uppercase font-['Space_Mono'] tracking-wider mb-1 block">Subject</label>
                <div className="flex flex-wrap gap-1.5">
                  {['DSA', 'SysDesign', 'Backend', 'Trading', 'Exams'].map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setBrainForm({...brainForm, subject_area: area})}
                      className={clsx(
                        "px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all",
                        brainForm.subject_area === area ? "bg-[#1A1A2E] text-white" : "bg-[#F5F4F0] text-[#9A9590] hover:bg-[#E5E0D8]"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-[#9A9590] uppercase font-['Space_Mono'] tracking-wider mb-1 block">Minutes</label>
                  <input 
                    type="number"
                    className="w-full bg-[#F5F4F0] border-transparent focus:border-[#7C3AED] border rounded-xl px-4 py-2 text-sm outline-none transition-all"
                    value={brainForm.minutes_pushed}
                    onChange={e => setBrainForm({...brainForm, minutes_pushed: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-[#9A9590] uppercase font-['Space_Mono'] tracking-wider mb-1 block">Solved?</label>
                  <button 
                    type="button"
                    onClick={() => setBrainForm({...brainForm, solved: !brainForm.solved})}
                    className={clsx(
                      "w-full py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                      brainForm.solved ? "bg-[#1A6B4A] text-white border-[#1A6B4A]" : "bg-white text-[#9A9590] border-[#E5E0D8]"
                    )}
                  >
                    {brainForm.solved ? 'YES' : 'NO'}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleBrainSubmit}
                className="w-full bg-[#1A1A2E] text-white py-3 rounded-xl font-bold font-['Space_Mono'] uppercase tracking-widest text-xs hover:bg-[#2a2a4e] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Brain size={14} className="text-[#E07B39]"/>
                Log Session +20 XP
              </button>
            </div>

            <AnimatePresence>
              {submitFeedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-3 bg-[#F0FDF4] border-l-4 border-l-[#1A6B4A] rounded-r-xl">
                  <p className="text-[11px] font-bold text-[#1A6B4A]">
                    Session logged. Neural pathways strengthened.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Brain Log History */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
            Recent Thinking Sessions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brainLogs.slice(0, 4).map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[#E5E0D8] p-4 border-l-4 border-l-[#E07B39] shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-[#1A1A2E] font-bold font-['Inter'] leading-relaxed truncate pr-2">
                    {log.topic}
                  </p>
                  <span className="px-2 py-0.5 bg-[#F5F4F0] text-[#9A9590] text-[9px] font-bold uppercase rounded">
                    {log.subject_area}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider">
                    {format(new Date(log.logged_at), 'MMM d, yyyy · HH:mm')}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-[#9A9590]"/>
                    <span className="text-[10px] font-bold text-[#1A1A2E] font-['Space_Mono']">{log.minutes_pushed}m</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <Card className="p-8 mt-4 h-[180px]">
             <div className="w-full h-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F4F0" />
                    <XAxis dataKey="date" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A2E', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="minutes" stroke="#7C3AED" strokeWidth={2} fill="#7C3AED" fillOpacity={0.05} />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>
      </div>

      {/* ── SECTION: ACHIEVEMENTS ── */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
            Achievements
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[60%]">
            {badgeCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveBadgeCategory(cat)}
                className={clsx(
                  "px-3 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all whitespace-nowrap border",
                  activeBadgeCategory === cat ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "bg-white text-[#9A9590] border-[#E5E0D8]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredBadges.map((badge) => {
            const isEarned = badge.earned;
            return (
              <div 
                key={badge.badge_key}
                className={clsx(
                  "bg-white rounded-2xl border p-4 flex flex-col items-center text-center transition-all group relative",
                  isEarned ? "border-[#1A1A2E] shadow-sm" : "border-[#E5E0D8] opacity-40 grayscale"
                )}
              >
                <div className="text-3xl mb-2 grayscale-0">{badge.icon}</div>
                <h4 className="text-xs font-bold font-['Inter'] text-[#1A1A2E] mb-1">
                  {badge.title}
                </h4>
                <p className="text-[10px] font-['Inter'] text-[#9A9590] leading-tight line-clamp-2">
                  {badge.description}
                </p>
                
                {isEarned ? (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 size={12} className="text-[#1A6B4A]"/>
                  </div>
                ) : (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-[#9A9590]"/>
                  </div>
                )}
                
                {/* Unlock condition on hover for locked ones */}
                {!isEarned && (
                  <div className="absolute inset-0 bg-[#1A1A2E]/95 rounded-2xl flex items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[9px] font-bold text-white uppercase tracking-tighter text-center">
                      {badge.unlock_condition}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION: XP LOG ── */}
      <div className="pt-6 border-t border-[#E5E0D8]">
        <button 
          onClick={() => setIsXpLogOpen(!isXpLogOpen)}
          className="flex items-center gap-3 font-bold text-sm text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-widest group"
        >
          Activity Log
          {isXpLogOpen ? <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" /> : <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />}
        </button>

        <AnimatePresence>
          {isXpLogOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="bg-white rounded-2xl border border-[#E5E0D8] divide-y divide-[#F5F4F0]">
                {xpEvents.slice(0, 10).map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-[#F5F4F0] transition-all">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-[#9A9590] w-12">{format(new Date(log.created_at), 'MM/dd')}</span>
                      <span className="font-body text-[13px] text-[#1A1A2E] font-medium">{log.source || log.reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {log.multiplier > 1 && <span className="px-2 py-0.5 bg-[#FFF0E6] text-[#E07B39] rounded font-mono text-[9px] font-bold">×{log.multiplier}</span>}
                      <span className="font-mono text-[13px] font-bold text-[#1A6B4A]">+{log.final_amount || log.amount} XP</span>
                    </div>
                  </div>
                ))}
                <div className="p-4 text-center">
                   <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
                     Lifetime Earnings: {playerState?.total_xp_alltime?.toLocaleString()} XP
                   </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default CharacterSheet;
