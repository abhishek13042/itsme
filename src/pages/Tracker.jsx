import React, { useEffect, useState, useMemo } from 'react';
import { useXpStore } from '../store/xpStore';
import { useWalletStore } from '../store/walletStore';
import { useQuestStore } from '../store/questStore';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Zap,
  Wallet,
  Calendar,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, startOfMonth, endOfMonth, isFuture } from 'date-fns';

const Tracker = () => {
  const { streakDays, multiplier, loadPlayerState } = useXpStore();
  const { balance, transactions, loadWallet } = useWalletStore();
  const { 
    dailyQuests, 
    todayCompletions, 
    activeQuests, 
    loadDailyQuests, 
    loadQuests, 
    completeDaily 
  } = useQuestStore();

  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyCompletions, setMonthlyCompletions] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadPlayerState(),
          loadWallet(),
          loadQuests(),
          loadDailyQuests(),
          fetchWeeklyStats(),
          fetchMonthlyHistory(),
          fetchMonthlyTarget()
        ]);
      } catch (error) {
        console.error("Failed to fetch tracker data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth]);

  const fetchWeeklyStats = async () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    // Fetch completions and transactions for this week
    const { data: completions } = await supabase
      .from('daily_completions')
      .select('*')
      .gte('completed_date', format(start, 'yyyy-MM-dd'))
      .lte('completed_date', format(end, 'yyyy-MM-dd'));

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    const { data: xpLogs } = await supabase
      .from('xp_log')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    const stats = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayCompletions = completions?.filter(c => c.completed_date === dateStr) || [];
      const dayTxs = txs?.filter(t => t.created_at.startsWith(dateStr)) || [];
      const dayXP = xpLogs?.filter(l => l.created_at.startsWith(dateStr)).reduce((sum, l) => sum + l.final_amount, 0) || 0;
      const dayRupees = dayTxs.filter(t => t.type === 'earn' || t.type === 'bonus').reduce((sum, t) => sum + t.amount_paise, 0);

      // Status logic
      let status = 'empty';
      if (isFuture(day) && !isToday(day)) status = 'future';
      else if (dayCompletions.length === 7) status = 'perfect';
      else if (dayCompletions.length > 0) status = 'partial';
      else if (!isFuture(day)) status = 'missed';

      return {
        date: day,
        dateStr,
        status,
        xp: dayXP,
        rupees: dayRupees,
        completionCount: dayCompletions.length
      };
    });

    setWeeklyStats(stats);
  };

  const fetchMonthlyHistory = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const { data } = await supabase
      .from('daily_completions')
      .select('completed_date')
      .gte('completed_date', format(start, 'yyyy-MM-dd'))
      .lte('completed_date', format(end, 'yyyy-MM-dd'));

    // Count completions per day
    const counts = (data || []).reduce((acc, curr) => {
      acc[curr.completed_date] = (acc[curr.completed_date] || 0) + 1;
      return acc;
    }, {});

    setMonthlyCompletions(counts);
  };

  const fetchMonthlyTarget = async () => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    const { data } = await supabase
      .from('monthly_targets')
      .select('*')
      .eq('month', monthStr);
    
    if (data && data.length > 0) {
      setCurrentTarget(data);
    }
  };

  const monthEarnings = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    return transactions
      .filter(tx => tx.created_at.startsWith(monthStr) && (tx.type === 'earn' || tx.type === 'bonus'))
      .reduce((sum, tx) => sum + tx.amount_paise, 0);
  }, [transactions, currentMonth]);

  const monthXP = useMemo(() => {
    // This would ideally come from xpStore/logs, for now we sum dailies for simplicity or mock
    return Object.values(monthlyCompletions).reduce((sum, count) => sum + (count * 20), 0); // Mock: 20xp per daily
  }, [monthlyCompletions]);

  const heatmapDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getHeatmapColor = (count) => {
    if (!count || count === 0) return 'bg-slate-100';
    if (count <= 3) return 'bg-green-200';
    if (count <= 6) return 'bg-green-400';
    return 'bg-success'; // 7 done
  };

  const handleQuestCheck = async (id) => {
    await completeDaily(id);
    fetchWeeklyStats();
    fetchMonthlyHistory();
  };

  if (loading) return <div className="p-8 animate-pulse space-y-8">
    <div className="h-8 bg-slate-200 w-48 rounded"></div>
    <div className="h-64 bg-slate-200 rounded-xl"></div>
    <div className="h-96 bg-slate-200 rounded-xl"></div>
  </div>;

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      
      {/* SECTION 1 — DAILY QUESTS */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">TODAY'S TRACKER</h1>
          <p className="text-sm font-medium text-slate-500">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-0 overflow-hidden border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Daily Quests</h2>
              </div>
              <Badge text={`${todayCompletions.length}/7 DONE`} color={todayCompletions.length === 7 ? 'success' : 'navy'} />
            </div>
            
            <div className="divide-y divide-slate-50">
              {dailyQuests.map((quest) => {
                const isDone = todayCompletions.includes(quest.id);
                return (
                  <div key={quest.id} className={clsx(
                    "flex items-center justify-between p-4 transition-all duration-200",
                    isDone ? "bg-green-50/50" : "hover:bg-slate-50"
                  )}>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => !isDone && handleQuestCheck(quest.id)}
                        className={clsx(
                          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                          isDone ? "bg-success border-success text-white" : "border-slate-200 bg-white hover:border-navy-500"
                        )}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={clsx("text-sm font-medium", isDone ? "text-slate-400 line-through" : "text-slate-900")}>
                          {quest.quest_text}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">~30MIN</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-navy-500 uppercase">{quest.category || 'Discipline'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Badge text={`+${quest.xp_reward}xp`} color="xp" />
                       <Badge text={`+₹${quest.gold_reward}`} color="success" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50/50">
               <ProgressBar value={(todayCompletions.length / 7) * 100} color="success" height="8px" />
               {todayCompletions.length === 7 && (
                 <div className="mt-3 py-2 bg-success/10 border border-success/20 rounded-lg text-center font-bold text-[11px] text-success tracking-widest uppercase animate-bounce">
                    ⚡ PERFECT DAY +₹15 BONUS CLAIMED
                 </div>
               )}
            </div>
          </Card>

          <div className="space-y-6">
            {dailyQuests.length - todayCompletions.length >= 3 && (
              <Card className="bg-orange-50 border-orange-200 shadow-none">
                <div className="flex gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600 h-fit">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-orange-900 uppercase tracking-tight">Penalty Warning</h3>
                    <p className="text-xs text-orange-700 mt-1 leading-relaxed font-medium">
                      3 quests unfinished. Complete before midnight or lose your 🔥 {streakDays} day streak (-₹50).
                    </p>
                  </div>
                </div>
              </Card>
            )}
            
            <Card className="bg-navy-900 text-white border-none shadow-xl">
               <div className="flex items-center gap-2 mb-4">
                 <Zap className="w-5 h-5 text-xp" />
                 <h3 className="text-xs font-bold uppercase tracking-widest text-navy-200">Consistency Power</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-display font-bold">🔥 {streakDays}</p>
                      <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Active Streak</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-mono font-bold text-xp">x{multiplier.toFixed(2)}</p>
                       <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">XP Multiplier</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-navy-800">
                    <p className="text-xs text-navy-200 italic font-medium">"Keep the flame burning. One missed day resets everything."</p>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WEEKLY GRID */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">THIS WEEK</h2>
          <Badge text={`${format(weeklyStats[0]?.date || new Date(), 'MMM d')} - ${format(weeklyStats[6]?.date || new Date(), 'MMM d')}`} color="label" />
        </div>

        <Card className="p-6 overflow-x-auto border-slate-200">
          <div className="flex justify-between min-w-[800px] gap-4">
            {weeklyStats.map((day) => (
              <div key={day.dateStr} className={clsx(
                "flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-300",
                isToday(day.date) ? "bg-white border-2 border-navy-700 shadow-xl -translate-y-1" : "bg-white border border-slate-100"
              )}>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{format(day.date, 'EEE')}</span>
                <span className="text-lg font-display font-bold text-slate-900 mb-3">{format(day.date, 'd')}</span>
                
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors",
                  day.status === 'perfect' ? "bg-success text-white" : 
                  day.status === 'partial' ? "bg-orange-100 text-orange-600" :
                  day.status === 'missed' ? "bg-rose-50 text-rose-500" :
                  day.status === 'future' ? "bg-slate-50 text-slate-300" : "bg-slate-100 text-slate-400"
                )}>
                  {day.status === 'perfect' ? <CheckCircle2 className="w-5 h-5" /> : 
                   day.status === 'partial' ? <div className="w-3 h-3 bg-orange-400 rounded-full" /> :
                   day.status === 'missed' ? <AlertTriangle className="w-4 h-4" /> : 
                   day.status === 'future' ? <Circle className="w-4 h-4" /> : <div className="w-1 h-1 bg-slate-300 rounded-full" />}
                </div>

                <div className="text-center space-y-1">
                  <p className="text-[10px] font-mono font-bold text-xp">+{day.xp} XP</p>
                  <p className="text-[10px] font-mono font-bold text-success">+₹{day.rupees / 100}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start px-2">
            {[
              { label: 'Days Active', value: weeklyStats.filter(d => d.status !== 'missed' && d.status !== 'future' && d.status !== 'empty').length, suffix: '/7', icon: '✅' },
              { label: 'Weekly Earnings', value: `₹${weeklyStats.reduce((sum, d) => sum + d.rupees, 0) / 100}`, icon: '💰' },
              { label: 'XP Gained', value: weeklyStats.reduce((sum, d) => sum + d.xp, 0), icon: '⚡' },
              { label: 'Current Streak', value: streakDays, suffix: ' Days', icon: '🔥' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-100">
                <span className="text-lg">{stat.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-sm font-bold text-slate-900">{stat.value}<span className="text-slate-400 font-medium ml-0.5">{stat.suffix}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Quest Progress Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeQuests.slice(0, 4).map((quest) => (
             <Card key={quest.id} className="p-5 border-slate-200 hover:border-navy-200 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge text={quest.domain || 'Core'} color={quest.domain === 'sde' ? 'navy' : 'success'} />
                  </div>
                  <span className="text-sm font-mono font-bold text-success">₹{(quest.rupee_value / 100).toLocaleString()}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-navy-900 transition-colors mb-3">{quest.title}</h3>
                <div className="space-y-3">
                  <ProgressBar value={quest.progress || 0} color="navy" height="6px" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{quest.progress || 0}% Complete</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-widest px-2 group-hover:bg-navy-50">Details</Button>
                  </div>
                </div>
             </Card>
          ))}
        </div>
      </section>

      {/* SECTION 3 — MONTHLY HEATMAP */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight uppercase tracking-wider">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Badge text="Monthly Milestones" color="gold" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-6 border-slate-200">
             <div className="grid grid-cols-7 gap-3 mb-4">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="text-[10px] font-bold text-slate-400 text-center tracking-widest">{day}</div>
                ))}
                
                {/* Empty cells for padding */}
                {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square"></div>
                ))}

                {heatmapDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = monthlyCompletions[dateStr] || 0;
                  return (
                    <div 
                      key={dateStr}
                      className={clsx(
                        "aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all relative group cursor-pointer",
                        getHeatmapColor(count),
                        count > 3 ? "text-white" : "text-slate-600",
                        isToday(day) && "ring-2 ring-navy-900 ring-offset-2"
                      )}
                    >
                      {format(day, 'd')}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                        <div className="bg-slate-900 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                           {format(day, 'MMM d')}: {count} Quests
                        </div>
                      </div>
                    </div>
                  );
                })}
             </div>

             <div className="flex gap-4 items-center justify-center pt-4 border-t border-slate-50">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-slate-100" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase">None</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-green-200" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase">1-3 Done</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-green-400" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase">4-6 Done</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-success" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Perfect</span>
               </div>
             </div>

             <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Best Streak', value: `${streakDays} Days`, icon: '🔥' },
                  { label: 'Perfect Days', value: Object.values(monthlyCompletions).filter(c => c === 7).length, icon: '✅' },
                  { label: 'Total Earnings', value: `₹${monthEarnings / 100}`, icon: '💰' },
                  { label: 'Completion %', value: `${Math.floor((Object.values(monthlyCompletions).reduce((s,c)=>s+c,0) / (heatmapDays.length * 7)) * 100)}%`, icon: '📊' }
                ].map(stat => (
                  <div key={stat.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-xl mb-1">{stat.icon}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
             </div>
          </Card>

          <Card className="bg-slate-50 border-slate-200 flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Monthly Target</h3>
            
            <div className="flex-1 space-y-8">
              <div className="text-center">
                <p className="text-4xl font-display font-bold text-slate-900">₹{(monthEarnings / 100).toLocaleString()}</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">of ₹3,000 Target</p>
                   {monthEarnings >= 300000 && <Badge text="COMPLETED" color="success" />}
                </div>
              </div>

              <div className="space-y-3">
                 <ProgressBar value={(monthEarnings / 300000) * 100} color="success" height="10px" />
                 <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-wider">
                   <span>{Math.floor((monthEarnings / 300000) * 100)}% REVENUE</span>
                   <span>70% FOR WITHDRAW</span>
                 </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                {currentTarget?.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                       <div className={clsx(
                         "w-4 h-4 rounded border flex items-center justify-center",
                         t.completed ? "bg-success border-success text-white" : "border-slate-300"
                       )}>
                         {t.completed && <CheckCircle2 className="w-3 h-3" />}
                       </div>
                       <span className={clsx("text-[11px] font-medium", t.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                          {t.goal_title}
                       </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-success">+₹{t.rupee_reward / 100}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
               <Button 
                variant="primary" 
                className="w-full h-12 shadow-lg shadow-navy-200"
                disabled={monthEarnings < 210000} // 70% of 3000
               >
                 {monthEarnings >= 210000 ? `Withdraw ₹${(monthEarnings / 100).toLocaleString()}` : 'Withdraw Locked'}
               </Button>
               <p className="text-[9px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">Available last 3 days of month</p>
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
};

export default Tracker;
