import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useXpStore } from '../store/xpStore';
import { useWalletStore } from '../store/walletStore';
import { useQuestStore } from '../store/questStore';
import { usePlannerStore } from '../store/plannerStore';
import { useTradingStore } from '../store/tradingStore';
import { useExamStore } from '../store/examStore';
import { useSdeStore } from '../store/sdeStore';
import { useHealthStore } from '../store/healthStore';
import { useFinanceStore } from '../store/financeStore';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Star, 
  CheckCircle2, 
  Circle, 
  Swords, 
  AlertTriangle, 
  Trophy, 
  TrendingUp,
  Activity,
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  Clock,
  ShieldAlert
} from 'lucide-react';

const CommandCenter = () => {
  const navigate = useNavigate();
  
  // Stores
  const { xp, level, streakDays, multiplier, loadPlayerState, checkStreak, awardXP } = useXpStore();
  const { balance, transactions, loadWallet, applyPenalty: walletPenalty } = useWalletStore();
  const { 
    dailyQuests, 
    todayCompletions, 
    activeQuests, 
    boss, 
    bossTasks, 
    hpPercent, 
    loadQuests, 
    loadDailyQuests,
    loadBoss,
    completeDaily,
    completeBossTask
  } = useQuestStore();
  
  const { loadRoadmap: loadSde } = useSdeStore();
  const { loadTradingData } = useTradingStore();
  const { loadExamData } = useExamStore();
  const { loadHealthData } = useHealthStore();
  const { loadFinanceData } = useFinanceStore();
  const { loadTodaysPlan } = usePlannerStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [missedItems, setMissedItems] = useState([]);
  
  // Initialize Data with Timeout & Error Handling
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);

      // 5-second Safety Timeout
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError("Initialization timeout. Please check your database connection or permissions.");
          setLoading(false);
        }
      }, 5000);

      try {
        await Promise.allSettled([
          loadPlayerState(),
          loadWallet(),
          loadQuests(),
          loadDailyQuests(),
          loadBoss(),
          loadSde(),
          loadTradingData(),
          loadExamData(),
          loadHealthData(),
          loadFinanceData(),
          loadTodaysPlan(),
          handleStreakAndPenalties()
        ]);
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (err) {
        console.error("Initialization Error:", err);
        setError("Failed to connect to Supabase. Run the unblock_app.sql script to fix permissions.");
        setLoading(false);
      }
    };
    init();
  }, []);

  // Complex Logic: Streak & Penalties
  const handleStreakAndPenalties = async () => {
    // 1. Check Streak
    const streakResult = await checkStreak();
    if (streakResult?.streakLost) setStreakLost(true);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 2. Fetch dependencies for missed items
    const { data: allDailies } = await supabase.from('daily_quests').select('*').eq('is_active', true);
    const { data: yestCompletions } = await supabase.from('daily_completions').select('quest_id').eq('completed_date', yesterday);
    const { data: yestQuests } = await supabase.from('quests').select('*').eq('completed', false).eq('due_date', yesterday);
    
    const completedIds = yestCompletions?.map(c => c.quest_id) || [];
    const missedDailies = allDailies?.filter(q => !completedIds.includes(q.id)) || [];
    
    const allMissed = [
      ...(missedDailies || []).map(d => ({ ...d, type: 'DAILY', title: d.quest_text })),
      ...(yestQuests || []).map(q => ({ ...q, type: 'MAIN', title: q.title }))
    ];

    setMissedItems(allMissed);

    // 3. Apply Penalties (Idempotent)
    if (allMissed.length > 0) {
      const { data: existingPenalties } = await supabase
        .from('penalties')
        .select('*')
        .gte('created_at', today);

      for (const item of allMissed) {
        const reason = `Missed ${item.type.toLowerCase()}: ${item.title}`;
        if (!existingPenalties?.some(p => p.reason === reason)) {
          await applyPenalty(item.xp_reward || 20, reason);
        }
      }
    }

    // 4. Load today's penalties
    const { data: todayP } = await supabase.from('penalties').select('*').gte('created_at', today);
    setTodayPenalties({
      count: todayP?.length || 0,
      totalXp: todayP?.reduce((sum, p) => sum + (p.xp_penalty || 0), 0) || 0
    });

    // 5. Load yesterday's review
    const { data: plan } = await supabase.from('daily_plans').select('evening_review').eq('plan_date', yesterday).single();
    if (plan?.evening_review) setYesterdayReview(plan.evening_review);
  };

  const applyPenalty = async (amount, reason) => {
    // Deduct XP
    await awardXP(-amount, reason);
    // Log Penalty in DB
    await supabase.from('penalties').insert([{
      reason: reason,
      xp_penalty: amount,
      gold_penalty: 0 // Adding for schema completion
    }]);
    // Deduct wallet if needed (e.g., skip daily 3 times? handle specific logic here)
    if (reason.includes('Streak Broken')) {
       await walletPenalty('breakStreak');
    }
  };

  // Helper: NY Session Status
  const getMarketStatus = () => {
    const now = new Date();
    // IST is UTC + 5:30. NY Session usually starts 1:30 PM IST (Winter) / 3:30 PM (Summer)
    // Using a simplified check for now
    const hrs = now.getHours();
    const mins = now.getMinutes();
    const istTime = hrs + mins/60;
    const isActive = istTime >= 13.5 && istTime <= 22.5; 
    return isActive;
  };

  // Prioritized Tasks Engine
  const rightNowTasks = useMemo(() => {
    const carryOver = missedItems.map(item => ({ ...item, priority: 1, tag: 'CARRY OVER', color: '#C0392B' }));
    const dailies = dailyQuests
      .filter(q => !todayCompletions.includes(q.id))
      .map(q => ({ ...q, title: q.quest_text, priority: 2, tag: 'DAILY', color: '#1A1A2E' }))
      .sort((a, b) => b.xp_reward - a.xp_reward);
    const mainQuests = activeQuests
      .filter(q => q.due_date === new Date().toISOString().split('T')[0])
      .map(q => ({ ...q, priority: 3, tag: q.domain?.toUpperCase() || 'QUEST', color: '#E07B39' }));
    const bossT = bossTasks
      .filter(t => !t.completed)
      .map(t => ({ ...t, title: t.task_text, priority: 4, tag: 'BOSS', color: '#C0392B' }));

    return [...carryOver, ...dailies, ...mainQuests, ...bossT].slice(0, 3);
  }, [missedItems, dailyQuests, todayCompletions, activeQuests, bossTasks]);

  if (loading) return <div className="p-12 animate-pulse font-mono text-muted text-center mt-20">LOADING COMMAND CENTER...</div>;

  return (
    <div className="space-y-8 pb-20 overflow-hidden">
      
      {/* STREAK LOST BANNER */}
      {streakLost && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-[#C0392B] text-white py-3 px-6 rounded-xl flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-display font-bold text-lg uppercase">STREAK LOST — BACK TO DAY 0</span>
          </div>
          <button onClick={() => setStreakLost(false)} className="opacity-60 hover:opacity-100 font-bold">×</button>
        </motion.div>
      )}

      {/* PAGE HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">COMMAND CENTER</h1>
          <p className="text-[11px] font-body font-bold text-[#9A9590] uppercase tracking-[0.15em]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#C0392B] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm shadow-crimson/20">
             <Star className="w-3.5 h-3.5 fill-white" />
             <span className="text-[11px] font-body font-bold uppercase tracking-wider">EXAM MODE — DAY 1 OF 20</span>
          </div>
          
          <div className="bg-white border-1.5 border-[#E5E0D8] px-4 py-1.5 rounded-full flex items-center gap-2">
            <div className={clsx("w-2 h-2 rounded-full", getMarketStatus() ? "bg-[#1A6B4A] shadow-[0_0_8px_#1A6B4A]" : "bg-[#9A9590]")} />
            <span className="text-[11px] font-body font-bold text-[#1A1A2E] uppercase tracking-wider">
              {getMarketStatus() ? "NY SESSION LIVE" : "MARKET CLOSED"}
            </span>
          </div>
        </div>
      </header>

      {/* SECTION 1 — MISSED YESTERDAY */}
      {missedItems.length > 0 && (
        <Card className="border-l-4 border-[#C0392B] bg-white shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-bold text-[#C0392B] uppercase tracking-[0.15em]">MISSED YESTERDAY</h3>
            <span className="font-mono text-[12px] text-[#C0392B] font-bold">-{todayPenalties.totalXp} XP APPLIED</span>
          </div>
          <div className="space-y-3">
            {missedItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
                  <span className="text-sm font-body text-[#3D3830] font-medium">{item.title}</span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-800 text-[9px] font-bold rounded-md border border-red-100 uppercase tracking-tighter">ROLL OVER</span>
                </div>
                <span className="text-sm font-mono text-[#C0392B]/60 font-medium">-{item.xp_reward || 20} XP</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SECTION 2 — STAT CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card-glass p-5">
           <h4 className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest mb-4">LEVEL</h4>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-black text-[#1A1A2E]">{level}</span>
           </div>
           <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-[#9A9590]">
                 <span>{xp} / 5000 XP</span>
              </div>
              <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                 <div className="h-full bg-[#1A1A2E] transition-all duration-700" style={{ width: `${(xp/5000)*100}%` }} />
              </div>
           </div>
        </div>

        <div className="card p-5 bg-[#E07B39]/5 border-[#E07B39]/20">
           <h4 className="text-[10px] font-bold text-[#E07B39] uppercase tracking-widest mb-4">DAY STREAK</h4>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-black text-[#E07B39]">{streakDays}</span>
           </div>
           <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-[#9A9590]">
                 <span>{multiplier}x XP ACTIVE</span>
              </div>
              <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden border border-[#E07B39]/10">
                 <div className="h-full bg-[#E07B39] transition-all duration-700" style={{ width: `${(streakDays/30)*100}%` }} />
              </div>
           </div>
        </div>

        <div className="card-glass p-5">
           <h4 className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest mb-4">TODAY'S XP</h4>
           <div className="flex items-center gap-3">
              <span className="text-5xl font-display font-black text-[#1A1A2E]">
                {transactions.filter(t => t.created_at.startsWith(new Date().toISOString().split('T')[0]) && t.type === 'earn').reduce((s, t) => s + (t.amount_paise/100), 0)}
              </span>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#1A6B4A]/10 text-[#1A6B4A] px-2 py-0.5 rounded-full text-[10px] font-bold">+</motion.div>
           </div>
           <div className="mt-4">
              <span className="text-[11px] font-mono text-[#9A9590]">+₹{transactions.filter(t => t.created_at.startsWith(new Date().toISOString().split('T')[0])).reduce((s, t) => s + (t.amount_paise/100), 0)} GOLD EARNED</span>
           </div>
        </div>

        <div className={clsx("card p-5", todayPenalties.count > 0 ? "bg-[#C0392B]/5 border-[#C0392B]/20" : "bg-white")}>
           <h4 className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest mb-4">PENALTIES</h4>
           <div className="flex items-baseline gap-2">
              <span className={clsx("text-5xl font-display font-black", todayPenalties.count > 0 ? "text-[#C0392B]" : "text-[#9A9590]")}>
                 {todayPenalties.count}
              </span>
           </div>
           <div className="mt-4">
              {todayPenalties.count > 0 ? (
                <span className="text-[11px] font-mono text-[#C0392B] font-bold">-{todayPenalties.totalXp} XP LOST TODAY</span>
              ) : (
                <span className="text-[11px] font-body font-bold text-[#1A6B4A] uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> CLEAN DAY
                </span>
              )}
           </div>
        </div>
      </div>

      {/* SECTION 3 — COUNTDOWN CLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* EXAM */}
        <div className="card p-6 bg-white border-[#E5E0D8]">
          <h5 className="text-[10px] font-bold text-[#C0392B] uppercase tracking-[0.2em] mb-4">EXAM DEADLINE</h5>
          <div className="flex gap-2 mb-6">
            <div className="flex-1 bg-[#C0392B]/5 p-2 rounded-lg text-center border border-[#C0392B]/10">
               <div className="text-xl font-display font-black text-[#C0392B]">19</div>
               <div className="text-[8px] font-bold text-[#C0392B]/50 uppercase">DAYS</div>
            </div>
            <div className="flex-1 bg-[#C0392B]/5 p-2 rounded-lg text-center border border-[#C0392B]/10">
               <div className="text-xl font-display font-black text-[#C0392B]">14</div>
               <div className="text-[8px] font-bold text-[#C0392B]/50 uppercase">HRS</div>
            </div>
            <div className="flex-1 bg-[#C0392B]/5 p-2 rounded-lg text-center border border-[#C0392B]/10">
               <div className="text-xl font-display font-black text-[#C0392B]">52</div>
               <div className="text-[8px] font-bold text-[#C0392B]/50 uppercase">MINS</div>
            </div>
          </div>
          <p className="text-[9px] font-mono text-[#9A9590] mb-3 uppercase tracking-wider">OS · DAA · ML · SE · DBMS · DHV</p>
          <div className="space-y-1.5">
             <div className="flex justify-between text-[9px] font-bold text-[#9A9590]">
                <span>AVG READINESS</span>
                <span>42%</span>
             </div>
             <div className="h-1 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#E07B39] rounded-full" style={{ width: '42%' }} />
             </div>
          </div>
        </div>

        {/* SDE */}
        <div className="card p-6 bg-white border-[#E5E0D8]">
          <h5 className="text-[10px] font-bold text-[#1A1A2E] uppercase tracking-[0.2em] mb-4">SDE READY IN</h5>
          <div className="flex gap-2 mb-6">
            <div className="flex-1 bg-[#1A1A2E]/5 p-2 rounded-lg text-center border border-[#1A1A2E]/10">
               <div className="text-xl font-display font-black text-[#1A1A2E]">05</div>
               <div className="text-[8px] font-bold text-[#1A1A2E]/50 uppercase">MONTHS</div>
            </div>
            <div className="flex-1 bg-[#1A1A2E]/5 p-2 rounded-lg text-center border border-[#1A1A2E]/10">
               <div className="text-xl font-display font-black text-[#1A1A2E]">12</div>
               <div className="text-[8px] font-bold text-[#1A1A2E]/50 uppercase">DAYS</div>
            </div>
            <div className="flex-1 bg-[#1A1A2E]/5 p-2 rounded-lg text-center border border-[#1A1A2E]/10">
               <div className="text-xl font-display font-black text-[#1A1A2E]">08</div>
               <div className="text-[8px] font-bold text-[#1A1A2E]/50 uppercase">HRS</div>
            </div>
          </div>
          <p className="text-[9px] font-mono text-[#9A9590] mb-3 uppercase tracking-wider">FAANG OFF-CAMPUS PREP</p>
          <div className="space-y-1.5">
             <div className="flex justify-between text-[9px] font-bold text-[#9A9590]">
                <span>CHAPTER PROGRESS</span>
                <span>12 / 48</span>
             </div>
             <div className="h-1 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#1A1A2E] rounded-full" style={{ width: '25%' }} />
             </div>
          </div>
        </div>

        {/* TRADING */}
        <div className="card p-6 bg-white border-[#E5E0D8]">
          <h5 className="text-[10px] font-bold text-[#E07B39] uppercase tracking-[0.2em] mb-4">PHASE ENDS IN</h5>
          <div className="flex gap-2 mb-6">
             <div className="flex-1 bg-[#E07B39]/5 p-2 rounded-lg text-center border border-[#E07B39]/10">
               <div className="text-xl font-display font-black text-[#E07B39]">08</div>
               <div className="text-[8px] font-bold text-[#E07B39]/50 uppercase">DAYS</div>
            </div>
            <div className="flex-1 bg-[#E07B39]/5 p-2 rounded-lg text-center border border-[#E07B39]/10">
               <div className="text-xl font-display font-black text-[#E07B39]">04</div>
               <div className="text-[8px] font-bold text-[#E07B39]/50 uppercase">HRS</div>
            </div>
            <div className="flex-1 bg-[#E07B39]/5 p-2 rounded-lg text-center border border-[#E07B39]/10">
               <div className="text-xl font-display font-black text-[#E07B39]">12</div>
               <div className="text-[8px] font-bold text-[#E07B39]/50 uppercase">MINS</div>
            </div>
          </div>
          <p className="text-[9px] font-mono text-[#9A9590] mb-3 uppercase tracking-wider">TAPE READING PHASE</p>
          <div className="space-y-1.5">
             <div className="flex justify-between text-[9px] font-bold text-[#9A9590]">
                <span>PHASE COMPLETION</span>
                <span>52 / 60 DAYS</span>
             </div>
             <div className="h-1 bg-[#F5F4F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#E07B39] rounded-full" style={{ width: '86%' }} />
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 — RIGHT NOW */}
      <Card className="bg-white border-0 shadow-sm border-t-2 border-[#1A1A2E]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[12px] font-bold text-[#1A1A2E] uppercase tracking-[0.2em]">RIGHT NOW</h3>
          <span className="font-mono text-[12px] text-[#9A9590] uppercase">{rightNowTasks.length} TASKS REMAINING TODAY</span>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {rightNowTasks.map((task, idx) => (
              <motion.div 
                key={task.id || idx}
                layout
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="flex items-center gap-4 p-4 bg-[#F5F4F0] rounded-xl border-l-[4px] relative overflow-hidden group"
                style={{ borderLeftColor: task.color }}
              >
                <span className="font-display font-black text-2xl" style={{ color: task.color }}>{idx + 1}</span>
                <div className="flex-1">
                   <h5 className="text-[15px] font-body font-bold text-[#1A1A2E] leading-tight">{task.title}</h5>
                   <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-mono text-[#9A9590] uppercase">Due Today</span>
                      <span className="w-1 h-1 rounded-full bg-[#E5E0D8]" />
                      <span className="text-[10px] font-mono text-[#9A9590] uppercase">+{task.xp_reward || 50} XP</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="px-2.5 py-1 bg-white/60 text-[#1A1A2E] text-[9px] font-bold rounded-md uppercase tracking-wider border border-white">
                     {task.tag}
                   </span>
                   <button 
                     onClick={() => task.type === 'DAILY' ? completeDaily(task.id) : null}
                     className="w-8 h-8 rounded-full border-2 border-[#E5E0D8] bg-white hover:border-[#1A1A2E] hover:bg-[#1A1A2E] flex items-center justify-center transition-all group/btn"
                   >
                     <CheckCircle2 className="w-4 h-4 text-[#E5E0D8] group-hover/btn:text-white" />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {rightNowTasks.length === 0 && (
             <div className="py-8 text-center bg-[#F5F4F0] rounded-xl border-2 border-dashed border-[#E5E0D8]">
                <p className="text-[11px] font-body font-bold text-[#9A9590] uppercase tracking-widest">Zone Clear — No immediate threats</p>
             </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* LEFT COLUMN: QUESTS */}
        <div className="md:col-span-3 space-y-6">
          <Card className="bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold text-[#1A1A2E] uppercase tracking-[0.2em]">DAILY QUESTS</h3>
              <span className="font-mono text-[13px] text-[#1A1A2E] font-bold">{todayCompletions.length} / {dailyQuests.length}</span>
            </div>
            
            <div className="mb-6">
               <div className="h-2.5 bg-[#F5F4F0] rounded-full overflow-hidden border border-[#E5E0D8]">
                  <div 
                    className={clsx("h-full transition-all duration-1000", todayCompletions.length === dailyQuests.length ? "bg-[#1A6B4A]" : "bg-[#1A1A2E]")}
                    style={{ width: `${(todayCompletions.length/dailyQuests.length)*100}%` }}
                  />
               </div>
            </div>

            <div className="space-y-1">
              {dailyQuests.map((quest) => {
                const isDone = todayCompletions.includes(quest.id);
                return (
                  <div key={quest.id} className="flex items-center justify-between py-3 px-2 hover:bg-[#F5F4F0] rounded-lg group transition-colors">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => completeDaily(quest.id)}
                        disabled={isDone}
                        className={clsx(
                          "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                          isDone ? "bg-[#1A6B4A] border-[#1A6B4A]" : "border-[#E5E0D8] group-hover:border-[#1A1A2E]"
                        )}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <span className={clsx("text-[14px] font-body font-medium transition-all", isDone ? "text-[#9A9590] line-through" : "text-[#3D3830]")}>
                        {quest.quest_text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-mono text-[11px] text-[#9A9590] font-bold">+{quest.xp_reward} XP</span>
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: quest.category === 'health' ? '#1A6B4A' : quest.category === 'trading' ? '#E07B39' : '#1A1A2E' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PERFECT DAY BONUS */}
            {todayCompletions.length === dailyQuests.length && (
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="mt-6 p-4 bg-[#1A6B4A] rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald/20"
               >
                 <Trophy className="w-5 h-5 text-white" />
                 <span className="font-display font-bold text-[14px] text-white uppercase tracking-widest">PERFECT DAY — +100 XP BONUS</span>
               </motion.div>
            )}
          </Card>

          <Card className="bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold text-[#1A1A2E] uppercase tracking-[0.2em]">MAIN QUESTS THIS WEEK</h3>
              <span className="font-mono text-[12px] text-[#9A9590] font-bold">1 / 4 COMPLETE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {activeQuests.slice(0, 4).map(q => (
                 <div key={q.id} className="p-4 border border-[#E5E0D8] rounded-xl border-l-[3px] space-y-3" style={{ borderLeftColor: q.domain === 'sde' ? '#1A1A2E' : '#E07B39' }}>
                    <div className="flex justify-between items-start">
                       <h6 className="text-[13px] font-body font-bold text-[#1A1A2E] line-clamp-1">{q.title}</h6>
                       <button className="w-5 h-5 border-2 border-[#E5E0D8] rounded-md" />
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="px-1.5 py-0.5 bg-[#F5F4F0] text-[#9A9590] text-[9px] font-bold rounded uppercase tracking-tighter">{q.domain}</span>
                       <span className="text-[10px] font-mono text-[#1A1A2E] font-bold">+{q.xp_reward} XP</span>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: BOSS & ROADMAPS */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#C0392B]/5 border-[#C0392B]/20">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-2">
                 <Star className="w-4 h-4 text-[#C0392B] fill-[#C0392B]" />
                 <h3 className="text-[12px] font-bold text-[#C0392B] uppercase tracking-[0.2em]">ACTIVE BOSS</h3>
               </div>
               <span className="font-mono text-[11px] text-[#C0392B] font-bold">19 DAYS LEFT</span>
            </div>
            
            <div className="space-y-4">
               <div>
                  <h2 className="text-[18px] font-display font-black text-[#1A1A2E]">Final Sem Exam Gauntlet</h2>
                  <div className="mt-3 space-y-1.5">
                     <div className="flex justify-between text-[11px] font-bold text-[#9A9590]">
                        <span className="uppercase">BOSS HP — {hpPercent}%</span>
                     </div>
                     <div className="h-2.5 bg-[#E5E0D8] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${hpPercent}%` }}
                          className="h-full bg-[#C0392B]"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-3 pt-2">
                  {bossTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3">
                       <button 
                         onClick={() => completeBossTask(task.id)}
                         className={clsx("w-2 h-2 rounded-full transition-all", task.completed ? "bg-[#1A6B4A]" : "bg-[#C0392B]")}
                       />
                       <span className={clsx("text-[12px] font-body transition-all", task.completed ? "text-[#9A9590] line-through" : "text-[#1A1A2E] font-medium")}>
                         {task.task_text}
                       </span>
                       <span className="ml-auto text-[10px] font-mono text-[#9A9590]">-{task.hp_damage}% HP</span>
                    </div>
                  ))}
               </div>
            </div>
          </Card>

          <Card className="bg-white">
            <h3 className="text-[11px] font-bold text-[#1A1A2E] uppercase tracking-[0.2em] mb-6">ROADMAP PROGRESS</h3>
            <div className="space-y-5">
               {/* SDE */}
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <span className="text-[13px] font-body font-bold text-[#1A1A2E]">SDE READY</span>
                     <span className="text-[10px] font-mono text-[#9A9590]">12 / 48 CHAPTERS</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                     <div className="h-full bg-[#1A1A2E]" style={{ width: '25%' }} />
                  </div>
               </div>
               {/* TRADING */}
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <span className="text-[13px] font-body font-bold text-[#1A1A2E]">TRADING PHASE</span>
                     <span className="text-[10px] font-mono text-[#9A9590]">52 / 60 DAYS</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                     <div className="h-full bg-[#E07B39]" style={{ width: '86%' }} />
                  </div>
               </div>
                {/* EXAMS */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <span className="text-[13px] font-body font-bold text-[#1A1A2E]">EXAM READINESS</span>
                     <span className="text-[10px] font-mono text-[#9A9590]">42% AVERAGE</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                     <div className="h-full bg-[#C0392B]" style={{ width: '42%' }} />
                  </div>
               </div>
               {/* HEALTH */}
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <span className="text-[13px] font-body font-bold text-[#1A1A2E]">HEALTH STREAK</span>
                     <span className="text-[10px] font-mono text-[#9A9590]">14 / 30 DAYS</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                     <div className="h-full bg-[#1A6B4A]" style={{ width: '46%' }} />
                  </div>
               </div>
               {/* FINANCE */}
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <span className="text-[13px] font-body font-bold text-[#1A1A2E]">FINANCE & BOOKS</span>
                     <span className="text-[10px] font-mono text-[#9A9590]">3 / 10 BOOKS</span>
                  </div>
                  <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                     <div className="h-full bg-[#1A1A2E]" style={{ width: '30%' }} />
                  </div>
               </div>
               {/* CURIOSITY */}
               <div className="space-y-2 opacity-40 grayscale">
                  <div className="flex justify-between items-end">
                     <span className="text-[13px] font-body font-bold text-[#9A9590]">CURIOSITY</span>
                     <span className="text-[10px] font-mono text-[#9A9590]">LOCKED · UNLOCK PHASE 3</span>
                  </div>
                  <div className="h-1.5 bg-[#E5E0D8] rounded-full" />
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 6 — YESTERDAY SUMMARY */}
      {yesterdayReview ? (
        <Card className="bg-white border-0 shadow-sm border-b-2 border-[#E5E0D8]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-bold text-[#1A1A2E] uppercase tracking-[0.2em]">YESTERDAY</h3>
              <div className={clsx("px-4 py-1.5 rounded-full flex items-center gap-2", 
                yesterdayReview.score >= 8 ? "bg-[#1A6B4A]/10 text-[#1A6B4A]" : 
                yesterdayReview.score >= 5 ? "bg-[#E07B39]/10 text-[#E07B39]" : "bg-[#C0392B]/10 text-[#C0392B]")}>
                 <span className="font-display font-black text-lg">{yesterdayReview.score}</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">/ 10</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                 <h5 className="text-[10px] font-bold text-[#1A6B4A] uppercase tracking-widest mb-3">WINS</h5>
                 <ul className="space-y-2">
                    {yesterdayReview.wins?.slice(0, 2).map((win, idx) => (
                      <li key={idx} className="text-[14px] font-body text-[#3D3830] flex items-start gap-2">
                         <div className="mt-1.5 w-1 h-1 rounded-full bg-[#1A6B4A]" />
                         {win}
                      </li>
                    ))}
                 </ul>
              </div>
              <div>
                 <h5 className="text-[10px] font-bold text-[#C0392B] uppercase tracking-widest mb-3">MISSED</h5>
                 <ul className="space-y-2">
                    {yesterdayReview.missed?.slice(0, 2).map((miss, idx) => (
                      <li key={idx} className="text-[14px] font-body text-[#3D3830] flex items-start gap-2">
                         <div className="mt-1.5 w-1 h-1 rounded-full bg-[#C0392B]" />
                         {miss}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="pt-4 border-t border-[#F5F4F0] flex items-center gap-3">
              <span className="text-[11px] font-body text-[#9A9590] font-bold uppercase tracking-wider">Tomorrow's Focus:</span>
              <span className="text-[14px] font-body text-[#1A1A2E] font-extrabold">{yesterdayReview.tomorrow_priority}</span>
           </div>
        </Card>
      ) : (
        <Card className="bg-[#F5F4F0] border-2 border-dashed border-[#E5E0D8] py-8 text-center" onClick={() => navigate('/planner')}>
           <div className="max-w-md mx-auto space-y-3 cursor-pointer group">
              <h3 className="text-[12px] font-display font-black text-[#1A1A2E] uppercase tracking-[0.2em] group-hover:text-[#E07B39] transition-colors">No evening review found for yesterday</h3>
              <p className="text-[11px] font-body font-bold text-[#9A9590] uppercase tracking-widest">Complete tonight's review in AI Planner →</p>
           </div>
        </Card>
      )}

    </div>
  );
};

export default CommandCenter;
