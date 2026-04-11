import React, { useState, useEffect, useMemo } from 'react';
import { useHealthStore } from '../store/healthStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';
import { 
  Dumbbell, 
  Moon, 
  Sun, 
  Sparkles, 
  Utensils, 
  Droplets,
  Zap,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Clock
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { clsx } from 'clsx';

const HABITS = [
  { id: 'gym_done', label: 'Gym / Walk session', icon: <Dumbbell className="w-5 h-5" />, xp: 25 },
  { id: 'sleep_time', label: 'Sleep by 12AM', icon: <Moon className="w-5 h-5" />, xp: 10, type: 'time' },
  { id: 'wake_time', label: 'Wake by 6:30 AM', icon: <Sun className="w-5 h-5" />, xp: 10, type: 'time' },
  { id: 'skincare_am', label: 'Skincare AM', icon: <Sparkles className="w-5 h-5" />, xp: 5 },
  { id: 'skincare_pm', label: 'Skincare PM', icon: <Sparkles className="w-5 h-5" />, xp: 5 },
  { id: 'no_junk_before_6pm', label: 'No Junk before 6PM', icon: <Utensils className="w-5 h-5" />, xp: 10 },
];

const HealthRoadmap = () => {
  const { todayLog, history, milestones, loading, loadHealthData, updateLog, toggleMilestone } = useHealthStore();
  const [showRoutine, setShowRoutine] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  const stats = useMemo(() => {
    if (!history.length) return { gymStreak: 0, avgSleep: 0, skincareStreak: 0, healthyDays: 0 };
    
    // Gym Streak
    let gymStreak = 0;
    for (const log of history) {
      if (log.gym_done) gymStreak++;
      else break;
    }

    // Skincare Streak
    let skincareStreak = 0;
    for (const log of history) {
      if (log.skincare_am && log.skincare_pm) skincareStreak++;
      else break;
    }

    // Avg Sleep
    const logsWithSleep = history.filter(l => l.sleep_time && l.wake_time);
    const avgSleep = logsWithSleep.length > 0
      ? (logsWithSleep.reduce((sum, l) => {
          const sleep = new Date(`1970-01-01T${l.sleep_time}:00`);
          const wake = new Date(`1970-01-01T${l.wake_time}:00`);
          let diff = (wake - sleep) / (1000 * 60 * 60);
          if (diff < 0) diff += 24; // Handle wrap around midnight
          return sum + diff;
        }, 0) / logsWithSleep.length).toFixed(1)
      : 0;

    const healthyDays = history.filter(l => {
        const count = [l.gym_done, l.skincare_am, l.skincare_pm, l.no_junk_before_6pm].filter(Boolean).length;
        return count >= 3;
    }).length;

    return { gymStreak, avgSleep, skincareStreak, healthyDays };
  }, [history]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

  const getHeatmapColor = (log) => {
    if (!log) return 'bg-slate-50';
    const doneCount = [
      log.gym_done, 
      log.skincare_am, 
      log.skincare_pm, 
      log.no_junk_before_6pm,
      log.water_glasses >= 8,
      log.sleep_time && log.wake_time
    ].filter(Boolean).length;

    if (doneCount === 6) return 'bg-success';
    if (doneCount >= 4) return 'bg-green-400';
    if (doneCount >= 2) return 'bg-orange-200';
    return 'bg-rose-100';
  };

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, idx) => {
      const logs = history.filter(l => new Date(l.log_date).getDay() === idx);
      const avg = logs.length > 0 
        ? logs.reduce((sum, l) => {
            return sum + [l.gym_done, l.skincare_am, l.skincare_pm, l.no_junk_before_6pm, l.water_glasses >= 8, l.sleep_time && l.wake_time].filter(Boolean).length;
          }, 0) / logs.length
        : 0;
      return { day, value: Math.round(avg) };
    });
  }, [history]);

  if (loading && !todayLog) return <div className="p-8 animate-pulse text-slate-400">Syncing Health Vitals...</div>;

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1 uppercase">HEALTH ROADMAP</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Physique • Sleep • Skin • Nutrition</p>
      </div>

      {/* Checklist */}
      <Card className="p-8 border-navy-100 bg-white shadow-xl shadow-navy-100/10">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Today's Protocol</h2>
           <p className="text-lg font-display font-bold text-navy-900">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HABITS.map(habit => {
            const isDone = habit.type === 'time' ? todayLog[habit.id] : todayLog[habit.id];
            return (
              <div 
                key={habit.id}
                onClick={() => habit.type !== 'time' && updateLog({ [habit.id]: !isDone })}
                className={clsx(
                  "p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                  isDone ? "bg-green-50 border-green-200" : "bg-white border-slate-100 hover:border-navy-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "p-2.5 rounded-xl transition-colors",
                    isDone ? "bg-success text-white" : "bg-slate-50 text-slate-400 group-hover:bg-navy-50 group-hover:text-navy-500"
                  )}>
                    {habit.icon}
                  </div>
                  <div>
                     <p className={clsx("text-sm font-bold", isDone ? "text-slate-900" : "text-slate-500")}>{habit.label}</p>
                     <p className="text-[10px] font-bold text-xp uppercase tracking-widest">+{habit.xp} XP</p>
                  </div>
                </div>

                {habit.type === 'time' ? (
                   <div className="flex items-center gap-2">
                      {todayLog[habit.id] ? (
                        <span className="text-xs font-mono font-bold text-success">
                          {todayLog[habit.id]}
                        </span>
                      ) : (
                        <input 
                          type="time"
                          onChange={(e) => updateLog({ [habit.id]: e.target.value })}
                          className="bg-transparent text-xs font-mono font-bold text-slate-400 focus:text-navy-900 outline-none"
                        />
                      )}
                   </div>
                ) : (
                  <div className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isDone ? "bg-success border-success text-white" : "border-slate-200 bg-white"
                  )}>
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })}

          {/* Water Counter */}
          <div className="p-5 rounded-2xl border border-slate-100 bg-white lg:col-span-1">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
                    <Droplets className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Water Intake</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Target: 8 Glasses</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateLog({ water_glasses: Math.max(0, todayLog.water_glasses - 1) })}
                    className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"
                  >-</button>
                  <span className="text-xl font-mono font-bold text-navy-900">{todayLog.water_glasses}</span>
                  <button 
                    onClick={() => updateLog({ water_glasses: todayLog.water_glasses + 1 })}
                    className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-white"
                  >+</button>
               </div>
             </div>
             <ProgressBar value={(todayLog.water_glasses / 8) * 100} color="navy" height="6px" />
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gym Streak', value: stats.gymStreak, suffix: ' Days', icon: <Flame className="w-4 h-4" />, color: 'text-orange-500' },
          { label: 'Avg Sleep', value: stats.avgSleep, suffix: ' Hours', icon: <Clock className="w-4 h-4" />, color: 'text-violet-500' },
          { label: 'Skin Streak', value: stats.skincareStreak, suffix: ' Days', icon: <Sparkles className="w-4 h-4" />, color: 'text-emerald-500' },
          { label: 'Healthy Days', value: stats.healthyDays, suffix: `/${history.length}`, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-blue-500' },
        ].map(stat => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx("p-1", stat.color)}>{stat.icon}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className="text-xl font-mono font-bold text-slate-900">{stat.value}<span className="text-sm font-sans text-slate-400 ml-1">{stat.suffix}</span></p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Phases */}
        <Card className="p-8">
           <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8">Progression Path</h2>
           <div className="space-y-10 relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-100" />
              {[1, 2, 3, 4].map(phaseNum => (
                <div key={phaseNum} className="relative flex gap-6">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors border-2",
                    phaseNum === 1 ? "bg-navy-900 border-navy-900 text-white" : "bg-white border-slate-200 text-slate-400"
                  )}>
                    <span className="text-xs font-bold">{phaseNum}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                      {phaseNum === 1 && 'Routine Lock (Month 1)'}
                      {phaseNum === 2 && 'Foundation Build (Month 2-3)'}
                      {phaseNum === 3 && 'Visible Progress (Month 4-6)'}
                      {phaseNum === 4 && 'Identity (Month 7-12)'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      Target: {phaseNum === 1 ? 'Gym 25/30 days' : phaseNum === 2 ? 'Strength Improvement' : phaseNum === 3 ? 'Physique Change' : 'Permanent Identity'}
                    </p>
                    
                    {phaseNum === 1 ? (
                      <div className="mt-4 space-y-2">
                         <div className="flex justify-between text-[9px] font-bold text-navy-600 uppercase mb-1">
                            <span>{stats.healthyDays} / 25 Days</span>
                         </div>
                         <ProgressBar value={(stats.healthyDays / 25) * 100} color="navy" height="6px" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 mt-4">
                        {milestones.filter(m => m.phase === phaseNum).map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => toggleMilestone(m.id, !m.completed)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                             <div className={clsx(
                               "w-4 h-4 rounded border flex items-center justify-center transition-all",
                               m.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 group-hover:border-navy-400"
                             )}>
                               {m.completed && <CheckCircle2 className="w-3 h-3" />}
                             </div>
                             <span className={clsx("text-xs font-medium", m.completed ? "text-slate-400 line-through" : "text-slate-600")}>{m.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </Card>

        {/* Calendar Heatmap & Patterns */}
        <div className="space-y-8">
           <Card className="p-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">30-Day Health Heatmap</h3>
              <div className="grid grid-cols-7 gap-2">
                 {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                   <div key={`${d}-${i}`} className="text-[8px] font-bold text-slate-300 text-center">{d}</div>
                 ))}
                 {calendarDays.map(day => {
                   const log = history.find(l => isSameDay(new Date(l.log_date), day));
                   return (
                     <div 
                       key={day.toString()} 
                       className={clsx(
                         "aspect-square rounded-sm flex items-center justify-center text-[9px] font-bold relative group",
                         getHeatmapColor(log),
                         isToday(day) && "ring-2 ring-navy-900 ring-offset-1"
                       )}
                     >
                       {format(day, 'd')}
                       {log && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                            <div className="bg-slate-900 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                               {format(day, 'MMM d')}: {Object.values(log).filter(v => v === true).length} Habits
                            </div>
                          </div>
                       )}
                     </div>
                   );
                 })}
              </div>
              <div className="flex gap-4 items-center justify-center mt-6 pt-4 border-t border-slate-50">
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-success" /><span className="text-[8px] font-bold text-slate-400 uppercase">Perfect</span></div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-orange-200" /><span className="text-[8px] font-bold text-slate-400 uppercase">Partial</span></div>
                 <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-rose-100" /><span className="text-[8px] font-bold text-slate-400 uppercase">Missed</span></div>
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Weekly Pattern</h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <YAxis hide domain={[0, 6]} />
                    <RechartsTooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontSize: '10px', color: '#64748B', fontWeight: 800, marginBottom: '4px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.value === 6 ? '#1A6B4A' : entry.value >= 4 ? '#2ECC71' : '#F1F3F5'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </Card>

           {/* Skincare Routine Card */}
           <div className="space-y-4">
              <div 
                onClick={() => setShowRoutine(!showRoutine)}
                className="p-6 bg-white border border-slate-100 rounded-2xl cursor-pointer flex justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Skin Maintenance Reference</h3>
                  <p className="text-xs text-slate-500 font-medium">Simple. Consistent. Identity.</p>
                </div>
                <ChevronRight className={clsx("transition-transform", showRoutine && "rotate-90")} />
              </div>
              
              {showRoutine && (
                <Card className="p-6 border-navy-100 space-y-6">
                   <div>
                     <div className="flex items-center gap-2 mb-3">
                       <Sun className="w-4 h-4 text-amber-500" />
                       <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">AM Routine (30 Sec)</h4>
                     </div>
                     <ol className="space-y-2">
                       {['Wash face with water', 'Moisturizer SPF 30+', 'Done'].map((s, i) => (
                         <li key={i} className="text-xs text-slate-600 flex gap-3 font-medium">
                           <span className="text-slate-300 font-bold">{i+1}.</span> {s}
                         </li>
                       ))}
                     </ol>
                   </div>
                   <div className="pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-2 mb-3">
                       <Moon className="w-4 h-4 text-violet-500" />
                       <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">PM Routine (2 Mins)</h4>
                     </div>
                     <ol className="space-y-2">
                       {['Cleanser', 'Moisturizer', 'Done'].map((s, i) => (
                         <li key={i} className="text-xs text-slate-600 flex gap-3 font-medium">
                           <span className="text-slate-300 font-bold">{i+1}.</span> {s}
                         </li>
                       ))}
                     </ol>
                   </div>
                </Card>
              )}
           </div>
        </div>
      </div>

    </div>
  );
};

export default HealthRoadmap;
