import React, { useState, useEffect, useMemo } from 'react';
import { getNextMilestone } from '../lib/levelMilestones';
import { useCharacterStore } from '../store/characterStore';
import { useXpStore } from '../store/xpStore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { 
  User, Flame, Zap, Award, Brain, Clock, CheckCircle2, ChevronDown, 
  ChevronUp, Lock, Shield, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { triggerJarvisToast } from '../components/JarvisToast';

const CharacterSheet = () => {
  const { 
    stats, badges, brainLogs, playerState, 
    loading, isLoading, brainLogsHasMore, loadCharacterData, 
    loadMoreBrainLogs, recalculate, submitBrainLog 
  } = useCharacterStore();

  const { xpLog, xpLogHasMore, loadMoreXpLogs } = useXpStore();
  const { streakDays, streakShields, useStreakShield } = useXpStore();

  const [isXpLogOpen, setIsXpLogOpen] = useState(false);
  const [activeBadgeCategory, setActiveBadgeCategory] = useState('ALL');
  const [brainForm, setBrainForm] = useState({
    topic: '',
    subject_area: 'DSA',
    minutes_pushed: 20,
    solved: false,
  });
  const [submitFeedback, setSubmitFeedback] = useState(null);

  useEffect(() => {
    if (!playerState) loadCharacterData();
  }, []);

  const level = playerState?.level || 1;
  const xp = playerState?.xp || 0;
  const xpForCurrent = Math.pow((level - 1) * 10, 2);
  const xpForNext = Math.pow(level * 10, 2);
  const xpProgress = Math.max(0, xp - xpForCurrent);
  const xpRequired = Math.max(1, xpForNext - xpForCurrent);
  const xpPercent = Math.min(100, Math.floor((xpProgress / xpRequired) * 100));

  const radarData = useMemo(() => [
    { subject: 'DSA', A: stats.dsa },
    { subject: 'SysDesign', A: stats.sysdesign },
    { subject: 'Backend', A: stats.backend },
    { subject: 'Trading', A: stats.trading },
    { subject: 'Physique', A: stats.physique },
    { subject: 'Analytical', A: stats.analytical },
  ], [stats]);

  const totalBrainMinutes = useMemo(() => {
    return (brainLogs || []).reduce((sum, log) => sum + (log.minutes_pushed || 0), 0)
  }, [brainLogs]);

  const handleBrainSubmit = async (e) => {
    e.preventDefault();
    const res = await submitBrainLog(brainForm);
    if (res.success) {
      setSubmitFeedback(res.data);
      setBrainForm({ topic: '', subject_area: 'DSA', minutes_pushed: 20, solved: false });
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
        <div className="w-12 h-12 border-2 border-[#1A1A2E]/10 border-t-[#E07B39] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-6xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-[#E07B39]"/>
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
              Profile
            </p>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-['Inter']">Abhishek</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-[#1A1A2E] text-white font-['Space_Mono'] text-xs font-bold px-3 py-1.5 rounded-xl">
              LVL {level}
            </span>
            {streakDays > 0 && (
              <span className="bg-white border border-[#E5E0D8] text-[#E07B39] font-['Space_Mono'] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Flame size={12}/> {streakDays}d
              </span>
            )}
            {streakShields > 0 && (
              <span className="bg-white border border-[#E5E0D8] text-[#1A1A2E] font-['Space_Mono'] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Shield size={12}/> {streakShields}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm min-w-[300px]">
          <div className="flex justify-between items-end mb-3">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">XP Progress</p>
            <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono']">{xpPercent}%</p>
          </div>
          <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-[#E07B39]"
            />
          </div>
          <p className="text-[9px] text-[#9A9590] font-['Inter'] mt-2 text-right">
            {xpRequired - xpProgress} XP to Level {level + 1}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* STATS MATRIX */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
              Domain Expertise
            </p>
            <button onClick={recalculate} className="text-[10px] font-bold text-[#E07B39] font-['Space_Mono'] uppercase">
              Recalculate
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { label: 'DSA', val: stats.dsa, color: '#1A1A2E' },
              { label: 'SysDesign', val: stats.sysdesign, color: '#7C3AED' },
              { label: 'Backend', val: stats.backend, color: '#E07B39' },
              { label: 'Trading', val: stats.trading, color: '#E07B39' },
              { label: 'Physique', val: stats.physique, color: '#1A6B4A' },
              { label: 'Analytical', val: stats.analytical, color: '#C0392B' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-end mb-1.5">
                  <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono']">{s.label}</p>
                  <p className="text-xs font-bold text-[#9A9590] font-['Space_Mono']">{s.val}</p>
                </div>
                <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }} 
                    className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RADAR CHART */}
        <div className="bg-[#1A1A2E] rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-full h-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#FFFFFF20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#FFFFFF60', fontSize: 10 }} />
                <Radar dataKey="A" stroke="#E07B39" strokeWidth={2} fill="#E07B39" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BRAIN LOG SECTION */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Brain size={16} className="text-[#7C3AED]"/>
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
            Neural Conditioning
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleBrainSubmit} className="space-y-4">
            <input 
              type="text" placeholder="Current study topic..."
              className="w-full bg-[#F5F4F0] border-none rounded-xl px-4 py-3 text-sm outline-none font-['Inter']"
              value={brainForm.topic} onChange={e => setBrainForm({...brainForm, topic: e.target.value})}
            />
            <div className="flex flex-wrap gap-2">
              {['DSA', 'SysDesign', 'Trading'].map(area => (
                <button key={area} type="button" onClick={() => setBrainForm({...brainForm, subject_area: area})}
                  className={clsx("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                    brainForm.subject_area === area ? "bg-[#1A1A2E] text-white" : "bg-[#F5F4F0] text-[#9A9590]")}>
                  {area}
                </button>
              ))}
            </div>
            <button className="w-full bg-[#E07B39] text-white py-3 rounded-xl font-bold font-['Space_Mono'] uppercase tracking-widest text-xs hover:shadow-md transition-all">
              Log Session +20 XP
            </button>
          </form>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brainLogs.slice(0, 4).map((log, i) => (
                <div key={i} className="p-4 bg-[#F5F4F0] rounded-xl border border-transparent hover:border-[#E5E0D8] transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-[#1A1A2E] truncate">{log.topic}</p>
                    <span className="text-[9px] font-bold text-[#E07B39] font-['Space_Mono']">{log.minutes_pushed}m</span>
                  </div>
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase">{log.subject_area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
            Achievements
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {badgeCategories.slice(0, 5).map(cat => (
              <button key={cat} onClick={() => setActiveBadgeCategory(cat)}
                className={clsx("px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition-all whitespace-nowrap border",
                  activeBadgeCategory === cat ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "bg-white text-[#9A9590] border-[#E5E0D8]")}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {filteredBadges.slice(0, 12).map((badge) => (
            <div key={badge.badge_key} className={clsx("bg-white rounded-2xl border p-4 flex flex-col items-center text-center transition-all relative group",
                badge.earned ? "border-[#E07B39] shadow-sm" : "border-[#E5E0D8] opacity-30 grayscale")}>
              <span className="text-2xl mb-2">{badge.icon}</span>
              <p className="text-[9px] font-bold font-['Space_Mono'] uppercase text-[#1A1A2E] leading-tight line-clamp-1">{badge.title}</p>
              {!badge.earned && (
                <div className="absolute inset-0 bg-[#1A1A2E]/90 rounded-2xl flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-[8px] font-bold text-white uppercase tracking-tighter">{badge.unlock_condition}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CharacterSheet;
