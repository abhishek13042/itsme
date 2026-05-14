import React, { useState, useMemo } from 'react';
import { useXpStore } from '../store/xpStore';
import { useHealthStore } from '../store/healthStore';
import { useQuestStore } from '../store/questStore';
import { useSdeStore } from '../store/sdeStore';
import { useTradingStore } from '../store/tradingStore';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { clsx } from 'clsx';
import {
  CalendarCheck, Flame, TrendingUp, Code2,
  Heart, Zap, Target, BarChart3, Check,
  ChevronRight, Award, ChevronLeft
} from 'lucide-react';

const Tracker = () => {
  // === STATE ===
  const [selectedWeek, setSelectedWeek] = useState(0);

  // === STORE DATA ===
  const { xp, level, streakDays } = useXpStore();
  const { history, todayLog } = useHealthStore();
  const { dailyQuests, todayCompletions } = useQuestStore();
  const { chapters, dsaSolved } = useSdeStore();
  const { trades } = useTradingStore();

  // === DERIVED — Week Days ===
  const weekStart = startOfWeek(
    subDays(new Date(), selectedWeek * 7), 
    { weekStartsOn: 1 }
  );
  
  const weekDays = useMemo(() => {
    const start = weekStart;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return eachDayOfInterval({
      start: start,
      end: end
    }).slice(0, 7);
  }, [weekStart]);

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-[#9A9590]
          font-['Space_Mono'] uppercase tracking-widest mb-1">
          Activity Overview
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A2E] 
          font-['Inter']">
          Tracker
        </h1>
      </div>

      {/* WEEK HEATMAP CARD */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-bold text-[#9A9590]
            font-['Space_Mono'] uppercase tracking-widest">
            {selectedWeek === 0 ? 'This Week' : 'Previous Week'}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedWeek(w => w + 1)}
              className="w-7 h-7 bg-[#F5F4F0] rounded-lg flex items-center 
                justify-center text-[#9A9590] hover:text-[#1A1A2E] transition-all"
            >
              <ChevronLeft size={14}/>
            </button>
            <button
              onClick={() => setSelectedWeek(0)}
              disabled={selectedWeek === 0}
              className="px-3 h-7 bg-[#F5F4F0] rounded-lg flex items-center 
                justify-center text-[9px] font-bold font-['Space_Mono'] 
                uppercase text-[#9A9590] hover:text-[#1A1A2E] 
                disabled:opacity-30 transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedWeek(w => Math.max(0, w - 1))}
              disabled={selectedWeek === 0}
              className="w-7 h-7 bg-[#F5F4F0] rounded-lg flex items-center 
                justify-center text-[#9A9590] hover:text-[#1A1A2E] transition-all
                disabled:opacity-30"
            >
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const healthLog = history?.find(h => h.log_date === dateStr);
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            const score = healthLog?.day_score || 0;
            const gymDone = healthLog?.gym_done || false;

            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <p className="text-[9px] font-bold text-[#9A9590] 
                  font-['Space_Mono'] uppercase">
                  {format(day, 'EEE')}
                </p>
                <div className={clsx(
                  'w-full aspect-square rounded-xl flex items-center',
                  'justify-center relative border transition-all duration-500',
                  isToday ? 'border-[#E07B39] border-2' : 'border-transparent',
                  score === 0 ? 'bg-[#F5F4F0]' :
                  score === 100 ? 'bg-[#1A6B4A]' :
                  score >= 80 ? 'bg-[#E07B39]' :
                  score >= 50 ? 'bg-[#FFC49B]' : 'bg-[#FFE4CC]'
                )}>
                  <span className={clsx(
                    'text-[10px] font-bold font-["Space_Mono"]',
                    score > 0 ? 'text-white' : 'text-[#9A9590]'
                  )}>
                    {score > 0 ? `${score}%` : format(day, 'd')}
                  </span>
                </div>
                {gymDone && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E07B39]"/>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center flex-wrap gap-4 mt-6 pt-4 border-t border-[#F5F4F0]">
          {[
            { color: '#1A6B4A', label: 'Perfect' },
            { color: '#E07B39', label: 'Good' },
            { color: '#FFC49B', label: 'Fair' },
            { color: '#F5F4F0', label: 'No Data', border: true }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={clsx('w-3 h-3 rounded', item.border ? 'border border-[#E5E0D8]' : '')}
                style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase font-bold">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DOMAIN STATS GRID */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard 
          label="Health" 
          value={`${todayLog?.day_score || 0}%`} 
          sublabel="Today's Score"
          color="#1A6B4A"
        />
        <StatCard 
          label="SDE Track" 
          value={chapters?.filter(c => c.completed)?.length || 0} 
          sublabel="Chapters Done"
          color="#1A1A2E"
        />
        <StatCard 
          label="Trading" 
          value={trades?.length || 0} 
          sublabel="Total Trades"
          color="#E07B39"
        />
        <StatCard 
          label="Quests" 
          value={`${todayCompletions?.length || 0}/${dailyQuests?.length || 0}`} 
          sublabel="Done Today"
          color="#7C3AED"
        />
      </div>

      {/* STREAK CARD */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-white/40
              font-['Space_Mono'] uppercase tracking-widest mb-1">
              Current Streak
            </p>
            <p className="text-4xl font-bold font-['Space_Mono'] text-[#E07B39]">
              {streakDays}
            </p>
            <p className="text-xs text-white/60 font-['Inter'] mt-1">
              consecutive days
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-white/40
              font-['Space_Mono'] uppercase tracking-widest mb-1">
              Level
            </p>
            <p className="text-2xl font-bold font-['Space_Mono'] text-white">
              LVL {level}
            </p>
            <p className="text-xs text-white/60 font-['Inter'] mt-1">
              {xp?.toLocaleString()} total XP
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ label, value, sublabel, color }) => (
  <div className="bg-white rounded-2xl border border-[#E5E0D8] p-4 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-5 rounded-full"
        style={{ backgroundColor: color }}/>
      <p className="text-[10px] font-bold text-[#9A9590]
        font-['Space_Mono'] uppercase tracking-widest">
        {label}
      </p>
    </div>
    <p className="text-2xl font-bold text-[#1A1A2E]
      font-['Space_Mono']">{value}</p>
    <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-0.5">
      {sublabel}
    </p>
  </div>
);

export default Tracker;
