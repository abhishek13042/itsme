import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePomodoroStore } from '../store/pomodoroStore';
import { useQuestStore } from '../store/questStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  Timer, 
  Play, 
  Pause, 
  RefreshCw, 
  X, 
  Plus, 
  Settings, 
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  CloudRain,
  Coffee,
  Waves,
  Zap,
  Target,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const PRESETS = [25, 45, 60, 90];
const CATEGORIES = ['Study', 'Trading', 'Health', 'Deep Work', 'Custom'];

const TimerCard = ({ timer }) => {
  const { updateTimer, removeTimer } = usePomodoroStore();
  const [showConfig, setShowConfig] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timer.timeLeft / timer.duration) * 100;
  
  const timerColor = timer.isPaused 
    ? '#94A3B8' 
    : timer.timeLeft < 300 
      ? '#E07B39' 
      : '#1A1A2E';

  return (
    <Card className={clsx(
      "p-0 overflow-hidden border-2 transition-all relative",
      timer.isActive && !timer.isPaused ? "border-navy-100 shadow-xl" : "border-slate-100",
      timer.isBreak && "bg-green-50/50 border-green-200"
    )}>
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <input 
            value={timer.label}
            onChange={(e) => updateTimer(timer.id, { label: e.target.value })}
            className="bg-transparent text-xs font-bold text-slate-900 uppercase tracking-widest outline-none w-32 focus:bg-white"
           />
           <select 
            value={timer.category}
            onChange={(e) => updateTimer(timer.id, { category: e.target.value })}
            className="text-[10px] font-bold text-slate-400 bg-transparent border-none outline-none cursor-pointer"
           >
             {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        <button onClick={() => removeTimer(timer.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-10 flex flex-col items-center justify-center relative">
        {/* Progress Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle 
               cx="50%" cy="50%" r="45%" 
               className="stroke-slate-100" 
               strokeWidth="8" fill="none" 
             />
             <motion.circle 
               cx="50%" cy="50%" r="45%" 
               style={{ stroke: timerColor }}
               strokeWidth="8" 
               strokeDasharray="100 100"
               strokeDashoffset={100 - progress}
               strokeLinecap="round" 
               fill="none" 
               className="transition-all duration-1000"
             />
           </svg>
           
           <div className="text-center z-10">
              {timer.isBreak && <p className="text-[10px] font-bold text-success uppercase tracking-[0.2em] mb-2">BREAK TIME</p>}
              <h3 className="text-7xl font-display font-bold text-slate-900 font-mono tracking-tight">
                {formatTime(timer.timeLeft)}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Session {timer.sessionsCompleted + 1} of 4
              </p>
           </div>
        </div>

        {/* Duration Select (only when inactive) */}
        {!timer.isActive && (
          <div className="mt-8 flex gap-2">
            {PRESETS.map(min => (
              <button 
                key={min}
                onClick={() => updateTimer(timer.id, { duration: min * 60, timeLeft: min * 60 })}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all",
                  timer.duration === min * 60 ? "bg-navy-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {min}m
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="mt-10 flex items-center gap-6">
           <button 
            onClick={() => updateTimer(timer.id, { isActive: false, timeLeft: timer.duration, isPaused: false, isBreak: false })}
            className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
           ><RefreshCw className="w-6 h-6" /></button>
           
           <button 
            onClick={() => updateTimer(timer.id, { isActive: true, isPaused: !timer.isPaused })}
            className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white shadow-xl shadow-navy-100 hover:scale-105 transition-all"
           >
             {timer.isActive && !timer.isPaused ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
           </button>

           <button 
            onClick={() => updateTimer(timer.id, { timeLeft: 0 })}
            className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
           ><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 flex justify-center border-t border-slate-100">
         <Badge text="+50 XP ON COMPLETION" color="gold" className="text-[9px]" />
      </div>
    </Card>
  );
};

const AmbientPlayer = () => {
  const [sound, setSound] = useState('none');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  const SOUND_SOURCES = {
    none: null,
    rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder, using reliable URL for testing
    coffee: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    waves: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSoundChange = (newSound) => {
    setSound(newSound);
    if (newSound === 'none') {
      audioRef.current?.pause();
    }
  };

  return (
    <Card className="p-4 bg-navy-900 text-white border-none flex items-center gap-6 shadow-2xl">
       <div className="flex gap-1">
         {[
           { id: 'none', icon: <VolumeX className="w-4 h-4" /> },
           { id: 'rain', icon: <CloudRain className="w-4 h-4" /> },
           { id: 'coffee', icon: <Coffee className="w-4 h-4" /> },
           { id: 'waves', icon: <Waves className="w-4 h-4" /> },
         ].map(s => (
           <button 
            key={s.id}
            onClick={() => handleSoundChange(s.id)}
            className={clsx(
              "p-2 rounded-lg transition-all",
              sound === s.id ? "bg-navy-700 text-white" : "text-navy-400 hover:bg-navy-800"
            )}
           >{s.icon}</button>
         ))}
       </div>

       <div className="flex-1 flex items-center gap-4">
         <div className="h-1 bg-navy-800 flex-1 rounded-full relative">
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="h-full bg-navy-400 rounded-full" style={{ width: `${volume * 100}%` }} />
         </div>
         <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest w-12 text-center">
           {sound.toUpperCase()}
         </span>
       </div>

       {sound !== 'none' && (
         <audio ref={audioRef} src={SOUND_SOURCES[sound]} loop autoPlay />
       )}
    </Card>
  );
};

const FocusRoom = () => {
  const { timers, stats, history, loading, addTimer, tick, loadPomodoroData } = usePomodoroStore();
  const { activeQuests } = useQuestStore();

  useEffect(() => {
    loadPomodoroData();
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      minutes: Math.floor(Math.random() * 300) + 100, // Mock history for now
      goal: 240
    }));
  }, []);

  if (loading && !history.length) return <div className="p-8 animate-pulse text-slate-400">Entering Focus Room...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">FOCUS ROOM</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Deep work. No distractions.</p>
      </div>

      {/* Timers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {timers.map(timer => (
            <motion.div 
              key={timer.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <TimerCard timer={timer} />
            </motion.div>
          ))}
        </AnimatePresence>

        {timers.length < 3 && (
          <button 
            onClick={addTimer}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-2xl hover:border-navy-200 group transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-navy-50 group-hover:text-navy-900 transition-all mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ADD TIMER</span>
            <span className="text-[10px] text-slate-300 mt-2">Max 3 sessions</span>
          </button>
        )}
      </div>

      <StatsRow stats={stats} />

      {/* Linked Quest & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
           <Card className="p-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                   <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Weekly Focus Pattern</h3>
                   <p className="text-xs text-slate-400 font-medium">Goal: 4 hours / day</p>
                </div>
                <div className="text-right">
                   <p className="text-xl font-display font-bold text-navy-900">22.4 hrs</p>
                   <p className="text-[10px] font-bold text-success uppercase">+12% vs last week</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <YAxis hide domain={[0, 400]} />
                    <RechartsTooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontSize: '10px', color: '#64748B', fontWeight: 800, marginBottom: '4px' }}
                    />
                    <ReferenceLine y={240} stroke="#E2E8F0" strokeDasharray="5 5" />
                    <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="#1A1A2E">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.minutes >= 240 ? '#1A6B4A' : '#1A1A2E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-50">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Best Day</p>
                    <p className="text-sm font-bold text-slate-900">Tuesday (340m)</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deep Work %</p>
                    <p className="text-sm font-bold text-slate-900">74.2%</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
                    <p className="text-sm font-bold text-slate-900">Gold Tier</p>
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
           {/* Focus Association */}
           <Card className="p-8 border-navy-100 bg-navy-50/10">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="w-4 h-4 text-navy-600" /> Linked Quest
              </h3>
              <select className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-navy-100 mb-6">
                <option>None (Just focus)</option>
                {activeQuests.map(q => <option key={q.id}>{q.title}</option>)}
              </select>
              
              <div className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-xp/10 flex items-center justify-center text-xp">
                      <Zap className="w-4 h-4" />
                   </div>
                   <p className="text-xs font-bold text-slate-800 tracking-tight">Focus Reward Scale</p>
                 </div>
                 <span className="text-xs font-mono font-bold text-slate-400">2x Multiplier</span>
              </div>
           </Card>

           <AmbientPlayer />
        </div>
      </div>

    </div>
  );
};

const StatsRow = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: 'Sessions Today', value: stats.sessionsToday, icon: '🍅' },
      { label: 'Focus Time', value: `${Math.floor(stats.focusMinutesToday/60)}h ${stats.focusMinutesToday%60}m`, icon: '⏱️' },
      { label: 'XP Earned', value: `+${stats.xpToday}`, icon: '⚡' },
      { label: 'Focus Streak', value: `${stats.streak} Days`, icon: '🔥' },
    ].map(s => (
      <Card key={s.label} className="p-5">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-xs">{s.icon}</span>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
        </div>
        <p className="text-xl font-mono font-bold text-slate-900">{s.value}</p>
      </Card>
    ))}
  </div>
);

export default FocusRoom;
