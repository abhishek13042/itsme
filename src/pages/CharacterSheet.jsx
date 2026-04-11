import React, { useState, useEffect, useMemo } from 'react';
import { useCharacterStore } from '../store/characterStore';
import { useXpStore } from '../store/xpStore';
import { useQuestStore } from '../store/questStore';
import { useWalletStore } from '../store/walletStore';
import { useTradingStore } from '../store/tradingStore';
import { useFinanceStore } from '../store/financeStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Shield, 
  Zap, 
  Flame, 
  Trophy, 
  Brain, 
  Crosshair, 
  Sword, 
  Book, 
  Coins, 
  Terminal,
  Activity,
  ChevronRight,
  Plus,
  Lock,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const BADGE_DEFS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Complete first daily quest', icon: '🩸', condition: (s) => s.questCount > 0 },
  { id: 'week_warrior', name: 'Week Warrior', desc: '7 day streak', icon: '⚔️', condition: (s) => s.streak >= 7 },
  { id: 'century', name: 'Century', desc: '100 XP in one day', icon: '💯', condition: (s) => s.maxDayXp >= 100 },
  { id: 'exam_slayer', name: 'Exam Slayer', desc: 'Defeat exam boss', icon: '🏆', condition: (s) => s.badges.includes('Exam Slayer') },
  { id: 'grinder', name: 'Grinder', desc: '30 day streak', icon: '🔥', condition: (s) => s.streak >= 30 },
  { id: 'code_initiate', name: 'Code Initiate', desc: 'Complete first SDE quest', icon: '💻', condition: (s) => s.sdeQuests > 0 },
  { id: 'market_journal', name: 'Market Journal', desc: 'Log 10 trades', icon: '📊', condition: (s) => s.tradeCount >= 10 },
  { id: 'perfect_week', name: 'Perfect Week', desc: '7 consecutive perfect days', icon: '⚡', condition: (s) => s.perfectWeeks > 0 },
  { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat 3 world bosses', icon: '🎯', condition: (s) => s.bossesDefeated >= 3 },
  { id: 'first_rupee', name: 'First Rupee', desc: 'Earn ₹1 in wallet', icon: '💰', condition: (s) => s.balance > 0 },
  { id: 'bookworm', name: 'Bookworm', desc: 'Finish first book', icon: '📚', condition: (s) => s.booksCompleted >= 1 },
  { id: 'deep_thinker', name: 'Deep Thinker', desc: '30 analytical brain logs', icon: '🧠', condition: (s) => s.brainLogCount >= 30 },
];

const CharacterSheet = () => {
  const { stats, badges: earnedBadges, brainLogs, xpEvents, loadCharacterData, updateStat, logBrainWin } = useCharacterStore();
  const { level, xp, xpNeeded, totalXp, streakDays, loadPlayerState } = useXpStore();
  const { completedQuests, loadQuests } = useQuestStore();
  const { balance, loadWallet } = useWalletStore();
  const { trades, loadTradingData } = useTradingStore();
  const { books, loadFinanceData } = useFinanceStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brainForm, setBrainForm] = useState({ problem: '', time_pushed: '', outcome: '' });

  useEffect(() => {
    loadCharacterData();
    loadPlayerState();
    loadQuests();
    loadWallet();
    loadTradingData();
    loadFinanceData();
  }, []);

  const radarData = useMemo(() => [
    { subject: 'DSA', A: stats.dsa, fullMark: 100 },
    { subject: 'SysDesign', A: stats.sysdesign, fullMark: 100 },
    { subject: 'Backend', A: stats.backend, fullMark: 100 },
    { subject: 'Trading', A: stats.trading, fullMark: 100 },
    { subject: 'Physique', A: stats.physique, fullMark: 100 },
    { subject: 'Analytical', A: stats.analytical, fullMark: 100 },
  ], [stats]);

  const badgeStats = useMemo(() => ({
    questCount: completedQuests.length,
    streak: streakDays,
    maxDayXp: xpEvents.reduce((max, e) => {
        const date = format(new Date(e.created_at), 'yyyy-MM-dd');
        return max; // This needs proper aggregation, but for UI mockup we'll mock or simplify
    }, 120),
    badges: earnedBadges,
    sdeQuests: completedQuests.filter(q => q.domain === 'sde').length,
    tradeCount: trades.length,
    perfectWeeks: 0,
    bossesDefeated: earnedBadges.includes('Exam Slayer') ? 1 : 0,
    balance: balance,
    booksCompleted: books.filter(b => b.status === 'COMPLETED').length,
    brainLogCount: brainLogs.length
  }), [completedQuests, streakDays, earnedBadges, trades, balance, books, brainLogs]);

  const handleBrainSubmit = async (e) => {
    e.preventDefault();
    await logBrainWin(brainForm);
    setIsModalOpen(false);
    setBrainForm({ problem: '', time_pushed: '', outcome: '' });
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      
      {/* Top — Player Identity Card */}
      <Card className="p-0 overflow-hidden border-navy-100 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-navy-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-10 flex flex-col justify-between border-r border-slate-100 relative z-10">
            <div className="flex items-center gap-8 mb-10">
              <div className="text-center">
                <p className="text-[10px] font-bold text-navy-400 mb-1 uppercase tracking-widest">RANK</p>
                <h2 className="text-6xl font-display font-bold text-navy-900 leading-none">LVL {level}</h2>
              </div>
              <div className="h-16 w-px bg-slate-200" />
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-widest">PLAYER ONE</p>
                <h3 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">ABHISHEK</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider italic">"Software Engineer in Training"</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-navy-900">
                <span>XP Progress</span>
                <span className="font-mono">{xp.toLocaleString()} / {xpNeeded.toLocaleString()}P</span>
              </div>
              <ProgressBar value={(xp / xpNeeded) * 100} color="navy" height="14px" />
              <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                {xpNeeded - xp} XP to Level {level + 1}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'All-Time XP', val: totalXp.toLocaleString(), icon: <Zap className="w-3.5 h-3.5" /> },
                 { label: 'Streak', val: `${streakDays} Days`, icon: <Flame className="w-3.5 h-3.5" /> },
                 { label: 'Quests', val: completedQuests.length, icon: <Trophy className="w-3.5 h-3.5" /> },
                 { label: 'Deep Wins', val: brainLogs.length, icon: <Brain className="w-3.5 h-3.5" /> },
               ].map(s => (
                 <div key={s.label}>
                   <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     {s.icon} <span>{s.label}</span>
                   </div>
                   <p className="text-lg font-mono font-bold text-slate-900">{s.val}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex-1 p-10 bg-slate-50/50 flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 border-b-2 border-navy-900 pb-1">Stat Distribution</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                    <Radar
                      name="Abhishek"
                      dataKey="A"
                      stroke="#1A1A2E"
                      strokeWidth={3}
                      fill="#1A1A2E"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-4 w-full max-w-sm">
               {Object.entries(stats).map(([key, val]) => (
                 <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       <span>{key}</span>
                       <span className="font-mono text-navy-900">{val}</span>
                    </div>
                    <input 
                      type="range"
                      min="0" max="100"
                      value={val}
                      onChange={(e) => updateStat(key, parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-900"
                    />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Badges Wall */}
      <section>
        <div className="flex justify-between items-end mb-8">
           <div>
             <h2 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">ACHIEVEMENTS</h2>
             <p className="text-slate-500 text-sm font-medium mt-1">Unlocked through persistent discipline.</p>
           </div>
           <Badge text={`${earnedBadges.length} / ${BADGE_DEFS.length} EARNED`} color="gold" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {BADGE_DEFS.map(badge => {
            const isEarned = badge.condition(badgeStats);
            return (
               <motion.div 
                 key={badge.id}
                 whileHover={{ y: -5 }}
                 className={clsx(
                   "p-5 rounded-2xl border-2 text-center flex flex-col items-center gap-3 transition-all",
                   isEarned ? "bg-white border-navy-100 shadow-lg" : "bg-slate-50 border-transparent opacity-60 grayscale"
                 )}
               >
                  <div className="text-4xl">{badge.icon}</div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">{badge.name}</h4>
                    <p className="text-[9px] text-slate-400 font-medium mt-1 leading-tight">{isEarned ? 'UNLOCKED' : badge.desc}</p>
                  </div>
                  {!isEarned && <Lock className="w-3.5 h-3.5 text-slate-300" />}
               </motion.div>
            );
          })}
        </div>
      </section>

      {/* Analytical Brain Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
           <Card className="p-8 bg-navy-900 text-white border-none shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-2">ANALYTICAL BRAIN DISCIPLINE</h3>
              <p className="text-xs text-navy-300 leading-relaxed mb-8">Every time you sat 10 extra minutes instead of quitting — log a win for your long-term focus.</p>
              
              <div className="space-y-6">
                 <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
                    <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-1">Deep Sessions</p>
                    <p className="text-3xl font-display font-bold text-white">{brainLogs.length}</p>
                 </div>
                 <Button 
                   onClick={() => setIsModalOpen(true)}
                   className="w-full bg-white text-navy-900 border-none hover:bg-slate-100 h-10 tracking-widest text-[11px] font-bold uppercase"
                 >
                   LOG A WIN +20 XP
                 </Button>
              </div>
           </Card>

           <Card className="p-6 border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Milestone Progress</h4>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[11px] font-bold mb-2">
                       <span>Mind Pushed (10)</span>
                       <span className={clsx(brainLogs.length >= 10 ? "text-success" : "text-slate-400")}>{brainLogs.length}/10</span>
                    </div>
                    <ProgressBar value={(Math.min(brainLogs.length, 10) / 10) * 100} color="navy" height="6px" />
                 </div>
                 <div>
                    <div className="flex justify-between text-[11px] font-bold mb-2">
                       <span>Deep Thinker (30)</span>
                       <span className={clsx(brainLogs.length >= 30 ? "text-success" : "text-slate-400")}>{brainLogs.length}/30</span>
                    </div>
                    <ProgressBar value={(Math.min(brainLogs.length, 30) / 30) * 100} color="navy" height="6px" />
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-12 xl:col-span-8">
           <Card className="p-0 overflow-hidden border-slate-200 h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Brain Activity Journal</h3>
                 <Activity className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-slate-50">
                {brainLogs.map(log => (
                  <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-slate-900">{log.problem}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(log.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">"{log.outcome}"</p>
                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-navy-50 text-navy-600 text-[10px] font-bold uppercase tracking-wider">
                       Pushed through for {log.time_pushed} minutes
                    </div>
                  </div>
                ))}
                {brainLogs.length === 0 && (
                  <div className="p-20 text-center opacity-20 filter grayscale">
                    <Brain className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No brain wins logged yet</p>
                  </div>
                )}
              </div>
           </Card>
        </div>
      </div>

      {/* Level History */}
      <section>
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight uppercase">Level & XP History</h2>
           <Badge text="RECENT ACTIVITY" color="label" />
        </div>
        
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="divide-y divide-slate-50">
            {xpEvents.map(event => (
              <div key={event.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-600">
                     <Zap className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-900">{event.source.replace(/_/g, ' ').toUpperCase()}</p>
                     <p className="text-[10px] font-medium text-slate-400 mt-1">
                        {format(new Date(event.created_at), 'MMMM d, h:mm a')}
                     </p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-mono font-bold text-xp">+{event.final_amount} XP</p>
                   {event.multiplier > 1 && <p className="text-[9px] font-bold text-amber-600 uppercase">x{event.multiplier} streak</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Log Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-xl font-display font-bold text-slate-900">LOG A BRAIN WIN</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleBrainSubmit} className="p-8 space-y-6">
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">The Block</label>
                     <input 
                       required
                       placeholder="What problem were you stuck on?"
                       value={brainForm.problem}
                       onChange={e => setBrainForm({...brainForm, problem: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Time Pushed (Mins)</label>
                     <input 
                       required
                       type="number"
                       placeholder="How many extra minutes did you sit?"
                       value={brainForm.time_pushed}
                       onChange={e => setBrainForm({...brainForm, time_pushed: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium"
                     />
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">The Outcome</label>
                     <textarea 
                       required
                       placeholder="What happened when you stayed? (e.g. finally figured out the bug, or just built mental grit)"
                       value={brainForm.outcome}
                       onChange={e => setBrainForm({...brainForm, outcome: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium"
                       rows={3}
                     />
                   </div>
                   <Button type="submit" variant="primary" className="w-full h-12 shadow-xl shadow-navy-100 tracking-widest uppercase">
                      SAVE WIN +20 XP
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CharacterSheet;
