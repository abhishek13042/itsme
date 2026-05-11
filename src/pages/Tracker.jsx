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
  ChevronRight, Award
} from 'lucide-react';

const Tracker = () => {
  // === STATE ===
  const [selectedWeek, setSelectedWeek] = useState(0);
  // 0 = this week, 1 = last week etc

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
  
  // Calculate the end of the interval correctly
  // If selectedWeek is 0, end is today. If selectedWeek > 0, end is (selectedWeek-1)*7 days ago.
  const weekEnd = selectedWeek === 0 
    ? new Date() 
    : subDays(new Date(), (selectedWeek - 0) * 7 - 6); // Just get 7 days from start

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
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck size={14} className="text-[#E07B39]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Tracker
            </p>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] 
            font-['Inter'] tracking-tight">
            Weekly Progress
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedWeek(w => w + 1)}
            className="px-3 py-1.5 bg-white border border-[#E5E0D8] 
              rounded-lg text-[10px] font-bold font-['Space_Mono'] 
              uppercase text-[#9A9590] hover:border-[#1A1A2E] 
              transition-all"
          >
            ← Prev
          </button>
          <button
            onClick={() => setSelectedWeek(0)}
            disabled={selectedWeek === 0}
            className="px-3 py-1.5 bg-[#1A1A2E] text-white 
              rounded-lg text-[10px] font-bold font-['Space_Mono'] 
              uppercase disabled:opacity-40 transition-all"
          >
            This Week
          </button>
        </div>
      </div>

      {/* WEEK HEATMAP — 7 day strip */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] 
        p-5 mb-6 shadow-sm">
        <p className="text-[10px] font-bold text-[#9A9590] 
          font-['Space_Mono'] uppercase tracking-widest mb-4">
          Week at a Glance
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const healthLog = history?.find(
              h => h.log_date === dateStr
            );
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
                  isToday ? 'border-[#E07B39]' : 'border-transparent',
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
                  <div className="w-1.5 h-1.5 rounded-full 
                    bg-[#E07B39]"/>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center flex-wrap gap-4 mt-4 pt-4 
          border-t border-[#F5F4F0]">
          {[
            { color: '#1A6B4A', label: 'Perfect (100%)' },
            { color: '#E07B39', label: 'Good (80%+)' },
            { color: '#FFC49B', label: 'Okay (50%+)' },
            { color: '#F5F4F0', label: 'Not logged', border: true }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={clsx(
                'w-3 h-3 rounded',
                item.border ? 'border border-[#E5E0D8]' : ''
              )}
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[9px] text-[#9A9590] font-['Inter']">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DOMAIN STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* HEALTH */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] 
                flex items-center justify-center">
                <Heart size={15} className="text-[#1A6B4A]"/>
              </div>
              <p className="text-xs font-bold text-[#1A1A2E] 
                font-['Space_Mono'] uppercase tracking-wide">
                Health
              </p>
            </div>
            <a href="/health" className="text-[9px] font-bold 
              text-[#9A9590] font-['Space_Mono'] uppercase 
              hover:text-[#1A1A2E] transition-colors flex 
              items-center gap-1">
              Open <ChevronRight size={10}/>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Today Score',
                value: `${todayLog?.day_score || 0}%`,
                color: (todayLog?.day_score || 0) >= 80 
                  ? '#1A6B4A' : '#E07B39'
              },
              {
                label: 'Gym Streak',
                value: `${history?.filter(h => h.gym_done)
                  ?.length || 0} days`,
                color: '#E07B39'
              },
              {
                label: 'Perfect Days',
                value: history?.filter(h => h.day_score === 100)
                  ?.length || 0,
                color: '#1A6B4A'
              }
            ].map((stat, i) => (
              <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 
                text-center">
                <p className="text-[9px] text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-sm font-bold font-['Space_Mono']"
                  style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SDE */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] 
                flex items-center justify-center">
                <Code2 size={15} className="text-[#1A1A2E]"/>
              </div>
              <p className="text-xs font-bold text-[#1A1A2E] 
                font-['Space_Mono'] uppercase tracking-wide">
                SDE Track
              </p>
            </div>
            <a href="/sde" className="text-[9px] font-bold 
              text-[#9A9590] font-['Space_Mono'] uppercase 
              hover:text-[#1A1A2E] transition-colors flex 
              items-center gap-1">
              Open <ChevronRight size={10}/>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Chapters Done',
                value: chapters?.filter(c => c.completed)
                  ?.length || 0,
                color: '#1A1A2E'
              },
              {
                label: 'Problems Solved',
                value: dsaSolved || 0,
                color: '#E07B39'
              },
              {
                label: 'Total Chapters',
                value: chapters?.length || 0,
                color: '#9A9590'
              }
            ].map((stat, i) => (
              <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 
                text-center">
                <p className="text-[9px] text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-sm font-bold font-['Space_Mono']"
                  style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 bg-[#F5F4F0] rounded-full 
            overflow-hidden">
            <div
              className="h-full bg-[#1A1A2E] rounded-full transition-all duration-700"
              style={{
                width: `${chapters?.length
                  ? (chapters.filter(c => c.completed).length 
                    / chapters.length) * 100
                  : 0}%`
              }}
            />
          </div>
        </div>

        {/* TRADING */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0E6] 
                flex items-center justify-center">
                <TrendingUp size={15} className="text-[#E07B39]"/>
              </div>
              <p className="text-xs font-bold text-[#1A1A2E] 
                font-['Space_Mono'] uppercase tracking-wide">
                Trading
              </p>
            </div>
            <a href="/trading" className="text-[9px] font-bold 
              text-[#9A9590] font-['Space_Mono'] uppercase 
              hover:text-[#1A1A2E] transition-colors flex 
              items-center gap-1">
              Open <ChevronRight size={10}/>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Total Trades',
                value: trades?.length || 0,
                color: '#E07B39'
              },
              {
                label: 'This Week',
                value: trades?.filter(t => {
                  const tradeDate = new Date(t.date || t.created_at);
                  return tradeDate >= weekStart;
                })?.length || 0,
                color: '#1A1A2E'
              },
              {
                label: 'Rules Followed',
                value: `${trades?.filter(t => 
                  t.rules_followed === 'YES')?.length || 0}`,
                color: '#1A6B4A'
              }
            ].map((stat, i) => (
              <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 
                text-center">
                <p className="text-[9px] text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-sm font-bold font-['Space_Mono']"
                  style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QUEST STATS */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] 
                flex items-center justify-center">
                <Target size={15} className="text-[#7C3AED]"/>
              </div>
              <p className="text-xs font-bold text-[#1A1A2E] 
                font-['Space_Mono'] uppercase tracking-wide">
                Quests
              </p>
            </div>
            <a href="/quests" className="text-[9px] font-bold 
              text-[#9A9590] font-['Space_Mono'] uppercase 
              hover:text-[#1A1A2E] transition-colors flex 
              items-center gap-1">
              Open <ChevronRight size={10}/>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Done Today',
                value: `${todayCompletions?.length || 0}/${
                  dailyQuests?.length || 0}`,
                color: '#7C3AED'
              },
              {
                label: 'XP Today',
                value: `+${(todayCompletions?.reduce((s, q) => 
                  s + (q.xp_reward || 100), 0) || 0)}`,
                color: '#E07B39'
              },
              {
                label: 'Completion',
                value: `${dailyQuests?.length
                  ? Math.floor((todayCompletions?.length || 0) 
                    / dailyQuests.length * 100)
                  : 0}%`,
                color: '#1A6B4A'
              }
            ].map((stat, i) => (
              <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 
                text-center">
                <p className="text-[9px] text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-sm font-bold font-['Space_Mono']"
                  style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STREAK SECTION */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white shadow-xl">
        <p className="text-[10px] font-bold text-white/40 
          font-['Space_Mono'] uppercase tracking-widest mb-4">
          Current Streaks
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Overall Streak',
              value: streakDays,
              unit: 'days',
              color: '#E07B39',
              icon: Flame
            },
            {
              label: 'Gym Days',
              value: history?.filter(h => h.gym_done)?.length || 0,
              unit: 'total',
              color: '#1A6B4A',
              icon: Heart
            },
            {
              label: 'Problems Solved',
              value: dsaSolved || 0,
              unit: 'total',
              color: '#9A9590',
              icon: Code2
            },
            {
              label: 'Total XP',
              value: xp || 0,
              unit: 'xp',
              color: '#E07B39',
              icon: Zap
            }
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} style={{ color: s.color }}/>
                  <p className="text-[9px] text-white/40 
                    font-['Space_Mono'] uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
                <p className="text-2xl font-bold font-['Space_Mono']"
                  style={{ color: s.color }}>
                  {s.value.toLocaleString()}
                  <span className="text-xs text-white/40 ml-1 
                    font-normal">
                    {s.unit}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Tracker;
