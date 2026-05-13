import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  BarChart2, Award, Zap, Heart, Brain, 
  TrendingUp, IndianRupee, RefreshCw, Bot
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const WeeklyReview = () => {
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState({
    quests: [],
    health: [],
    xp: [],
    brain: [],
    trades: []
  });

  const [verdict, setVerdict] = useState(null);
  const [verdictLoading, setVerdictLoading] = useState(false);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, hRes, xRes, bRes, tRes] = await Promise.all([
        supabase.from('daily_completions').select('*').gte('completed_date', weekStartStr).lte('completed_date', weekEndStr),
        supabase.from('health_logs').select('*').gte('log_date', weekStartStr).lte('log_date', weekEndStr),
        supabase.from('xp_log').select('*').gte('created_at', weekStart.toISOString()).lte('created_at', weekEnd.toISOString()),
        supabase.from('brain_logs').select('*').gte('logged_at', weekStart.toISOString()).lte('logged_at', weekEnd.toISOString()),
        supabase.from('trades').select('*').gte('date', weekStartStr).lte('date', weekEndStr)
      ]);

      setWeekData({
        quests: qRes.data || [],
        health: hRes.data || [],
        xp: xRes.data || [],
        brain: bRes.data || [],
        trades: tRes.data || []
      });
    } catch (err) {
      console.error('Weekly Review data error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalXP = weekData.xp.reduce((s, r) => s + r.amount, 0);
    const questsDone = weekData.quests.length;
    const healthDays = weekData.health.length;
    const avgScore = healthDays 
      ? Math.round(weekData.health.reduce((s, r) => s + (r.day_score || 0), 0) / healthDays)
      : 0;
    const brainLogsCount = weekData.brain.length;
    const tradesCount = weekData.trades.length;

    return [
      { label: 'Total XP', value: totalXP, icon: Zap, color: '#E07B39' },
      { label: 'Quests', value: questsDone, icon: Award, color: '#1A1A2E' },
      { label: 'Health Days', value: `${healthDays}/7`, icon: Heart, color: '#C0392B' },
      { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, color: '#1A6B4A' },
      { label: 'Brain Logs', value: brainLogsCount, icon: Brain, color: '#7C3AED' },
      { label: 'Trades', value: tradesCount, icon: IndianRupee, color: '#2D6A4F' }
    ];
  }, [weekData]);

  const heatmapData = useMemo(() => {
    return days.map(day => {
      const log = weekData.health.find(l => isSameDay(new Date(l.log_date), day));
      return {
        day: format(day, 'EEE'),
        active: !!log
      };
    });
  }, [weekData, days]);

  const xpChartData = useMemo(() => {
    return days.map(day => {
      const dayXP = weekData.xp
        .filter(r => isSameDay(new Date(r.created_at), day))
        .reduce((s, r) => s + r.amount, 0);
      return {
        name: format(day, 'EEE'),
        xp: dayXP
      };
    });
  }, [weekData, days]);

  const getVerdict = async () => {
    setVerdictLoading(true);
    try {
      const { callGroq } = await import('../lib/groq');
      const s = stats.map(st => `${st.label}: ${st.value}`).join('\n');
      
      const result = await callGroq({
        messages: [{
          role: 'user',
          content: `Abhishek's Weekly Stats:\n${s}\n\nWrite a 4-sentence verdict:\n1. What this week says about his discipline.\n2. His biggest win.\n3. His biggest gap/failure.\n4. One specific thing to do differently next week.\n\nTone: JARVIS, dry wit, precise. Max 100 words.`
        }],
        max_tokens: 300,
        temperature: 0.7
      });
      setVerdict(result.text);
    } catch (err) {
      console.error('Verdict error:', err);
    }
    setVerdictLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <RefreshCw className="animate-spin text-[#9A9590]" size={24}/>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-[#9A9590] 
          font-['Space_Mono'] uppercase tracking-widest mb-1">
          Week of {format(weekStart, 'MMM dd')} — {format(weekEnd, 'MMM dd')}
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A2E] font-['Inter']">
          Weekly Review
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E0D8] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={16} style={{ color: stat.color }}/>
            </div>
            <p className="text-2xl font-bold text-[#1A1A2E] font-['Space_Mono']">
              {stat.value}
            </p>
            <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] 
              uppercase tracking-widest mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Health Heatmap */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-8">
        <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
          uppercase tracking-widest mb-4">
          Health Consistency
        </p>
        <div className="flex justify-between gap-2">
          {heatmapData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={clsx(
                  'w-full aspect-square rounded-lg border transition-all',
                  d.active ? 'bg-[#1A6B4A] border-[#1A6B4A]' : 'bg-[#F5F4F0] border-[#E5E0D8]'
                )}
              />
              <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">
                {d.day}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* XP Chart */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 mb-8">
        <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
          uppercase tracking-widest mb-6">
          Daily XP Earnings
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={xpChartData}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: 'Space Mono', fill: '#9A9590' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 9, fontFamily: 'Space Mono', fill: '#9A9590' }} axisLine={false} tickLine={false} width={30}/>
            <Tooltip 
              cursor={{ fill: '#F5F4F0' }}
              contentStyle={{ fontSize: 11, fontFamily: 'Space Mono', borderRadius: 8, border: '1px solid #E5E0D8' }}
            />
            <Bar dataKey="xp" fill="#E07B39" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* JARVIS Verdict */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-[#E07B39]"/>
            </div>
            <p className="text-sm font-bold text-white font-['Space_Mono'] uppercase tracking-widest">
              JARVIS Verdict
            </p>
          </div>
          {!verdict && !verdictLoading && (
            <button
              onClick={getVerdict}
              className="bg-[#E07B39] text-white px-4 py-2 rounded-xl text-[10px] font-bold font-['Space_Mono'] uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Analyze Week
            </button>
          )}
        </div>

        {verdictLoading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <RefreshCw className="animate-spin text-[#E07B39]" size={20}/>
            <p className="text-[10px] font-bold text-white/40 font-['Space_Mono'] uppercase tracking-widest">
              Processing week data...
            </p>
          </div>
        )}

        {verdict && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <p className="text-sm text-white/90 font-['Inter'] leading-relaxed whitespace-pre-wrap">
              {verdict}
            </p>
            <button
              onClick={getVerdict}
              className="mt-4 text-[9px] font-bold text-white/30 font-['Space_Mono'] uppercase tracking-widest hover:text-[#E07B39] transition-colors"
            >
              Recalculate Verdict
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReview;
