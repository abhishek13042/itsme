import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';

const MODES = {
  pomodoro: { name: 'POMODORO', work: 25, break: 5, xp: 40, color: '#E07B39' },
  deep_work: { name: 'DEEP WORK', work: 45, break: 10, xp: 70, color: '#1A1A2E' },
  study_block: { name: 'STUDY BLOCK', work: 90, break: 20, xp: 120, color: '#7C3AED' },
  flow: { name: 'FLOW', work: 60, break: 10, xp: 90, color: '#1A6B4A' },
  custom: { name: 'CUSTOM', work: 25, break: 5, xp: 40, color: '#9A9590' }
};

export const usePomodoroStore = create((set, get) => ({
  timers: [],
  focusSettings: {
    pomodoro_duration: 25,
    short_break: 5,
    long_break: 15,
    long_break_interval: 4,
    auto_start_breaks: true,
    auto_start_pomodoros: false,
    sound_enabled: true,
    sound_volume: 70,
    ambient_sound: 'none',
    notifications_enabled: true
  },
  statsToday: {
    sessions: 0,
    minutes: 0,
    xp: 0,
    completedCount: 0,
    startedCount: 0,
    interruptions: 0
  },
  history: [],
  weeklyData: [],
  loading: false,
  isRunning: false,
  startedAt: null,
  expectedEndAt: null,
  currentDuration: 25, // Fallback for startTimer calculation

  loadPomodoroData: async () => {
    set({ loading: true });
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [sessionsRes, settingsRes, historyRes] = await Promise.all([
        supabase.from('pomodoro_sessions').select('*').eq('session_date', today),
        supabase.from('focus_settings').select('*').single(),
        supabase.from('pomodoro_sessions').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      const sessions = sessionsRes.data || [];
      const stats = {
        sessions: sessions.length,
        minutes: sessions.reduce((sum, s) => sum + (s.completed ? s.duration_minutes : 0), 0),
        xp: sessions.reduce((sum, s) => sum + s.xp_awarded, 0),
        completedCount: sessions.filter(s => s.completed).length,
        startedCount: sessions.length,
        interruptions: sessions.reduce((sum, s) => sum + (s.interruption_count || 0), 0)
      };

      // Weekly breakdown for Recharts
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const { data: weekly } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .gte('session_date', startOfWeek.toISOString().split('T')[0]);

      set({ 
        statsToday: stats, 
        focusSettings: settingsRes.data || get().focusSettings,
        history: historyRes.data || [],
        weeklyData: processWeeklyData(weekly || []),
        loading: false 
      });

      // If no timers, add initial one
      if (get().timers.length === 0) {
        get().addTimer('pomodoro');
      }
    } catch (err) {
      console.error('Failed to load Pomodoro data:', err);
      set({ loading: false });
    }
  },

  addTimer: (modeId = 'pomodoro') => {
    const { timers } = get();
    if (timers.length >= 3) return;

    const mode = MODES[modeId];
    const newTimer = {
      id: Math.random().toString(36).substr(2, 9),
      modeId,
      label: 'Focus Session',
      timeLeft: mode.work * 60,
      duration: mode.work * 60,
      breakDuration: mode.break * 60,
      isRunning: false,
      isBreak: false,
      sessionCount: 1,
      linkedQuestId: null,
      interruptionCount: 0,
      dbSessionId: null
    };
    set({ timers: [...timers, newTimer] });
  },

  removeTimer: (id) => {
    set(state => ({ timers: state.timers.filter(t => t.id !== id) }));
  },

  startTimer: async (id) => {
    const timer = get().timers.find(t => t.id === id);
    if (!timer) return;

    // Log session start if not already logged
    let dbId = timer.dbSessionId;
    if (!dbId && !timer.isBreak) {
      const mode = MODES[timer.modeId];
      const { data } = await supabase.from('pomodoro_sessions').insert([{
        session_date: new Date().toISOString().split('T')[0],
        label: timer.label,
        mode: timer.modeId,
        duration_minutes: mode.work,
        break_minutes: mode.break,
        linked_quest_id: timer.linkedQuestId,
        completed: false
      }]).select().single();
      dbId = data?.id;
    }

    const now = Date.now();
    const durationMs = timer.timeLeft * 1000;

    set(state => ({
      isRunning: true,
      startedAt: now,
      expectedEndAt: now + durationMs,
      timers: state.timers.map(t => t.id === id ? { ...t, isRunning: true, dbSessionId: dbId } : t)
    }));
  },

  pauseTimer: (id) => {
    set(state => ({
      isRunning: false,
      startedAt: null,
      expectedEndAt: null,
      timers: state.timers.map(t => t.id === id ? { ...t, isRunning: false } : t)
    }));
  },

  resetTimer: (id) => {
    const timer = get().timers.find(t => t.id === id);
    if (!timer) return;
    const mode = MODES[timer.modeId];
    set(state => ({
      timers: state.timers.map(t => t.id === id ? { 
        ...t, 
        timeLeft: t.isBreak ? mode.break * 60 : mode.work * 60,
        isRunning: false 
      } : t),
      isRunning: false,
      startedAt: null,
      expectedEndAt: null
    }));
  },

  skipPhase: (id) => {
    const timer = get().timers.find(t => t.id === id);
    if (!timer) return;
    get().completePhase(id);
  },

  logInterruption: async (id) => {
    const timer = get().timers.find(t => t.id === id);
    if (!timer || !timer.dbSessionId) return;

    const count = (timer.interruptionCount || 0) + 1;
    await supabase.from('pomodoro_sessions').update({ interruption_count: count }).eq('id', timer.dbSessionId);
    
    set(state => ({
      timers: state.timers.map(t => t.id === id ? { ...t, interruptionCount: count } : t)
    }));
  },

  // tick is removed in favor of visibility-aware component approach

  completePhase: async (id) => {
    const timer = get().timers.find(t => t.id === id);
    if (!timer) return;

    const mode = MODES[timer.modeId];
    const { focusSettings, loadPomodoroData } = get();

    if (!timer.isBreak) {
      // Completed Focus Session
      await awardXP(mode.xp, 'pomodoro_complete');
      if (timer.dbSessionId) {
        await supabase.from('pomodoro_sessions').update({ 
          completed: true, 
          xp_awarded: mode.xp 
        }).eq('id', timer.dbSessionId);
      }
      
      const isLongBreak = timer.sessionCount % focusSettings.long_break_interval === 0;
      const breakTime = isLongBreak ? focusSettings.long_break : focusSettings.short_break;
      
      set(state => ({
        timers: state.timers.map(t => t.id === id ? { 
          ...t, 
          isBreak: true, 
          timeLeft: breakTime * 60,
          isRunning: focusSettings.auto_start_breaks,
          dbSessionId: null // Reset for next work session
        } : t),
        isRunning: focusSettings.auto_start_breaks,
        startedAt: focusSettings.auto_start_breaks ? Date.now() : null,
        expectedEndAt: focusSettings.auto_start_breaks ? Date.now() + (breakTime * 60 * 1000) : null
      }));
      
      await loadPomodoroData();
    } else {
      // Completed Break
      set(state => ({
        timers: state.timers.map(t => t.id === id ? { 
          ...t, 
          isBreak: false, 
          timeLeft: mode.work * 60,
          sessionCount: t.sessionCount + 1,
          isRunning: focusSettings.auto_start_pomodoros
        } : t),
        isRunning: focusSettings.auto_start_pomodoros,
        startedAt: focusSettings.auto_start_pomodoros ? Date.now() : null,
        expectedEndAt: focusSettings.auto_start_pomodoros ? Date.now() + (mode.work * 60 * 1000) : null
      }));
    }
  },

  updateSettings: async (updates) => {
    const { focusSettings } = get();
    const newSettings = { ...focusSettings, ...updates };
    set({ focusSettings: newSettings });
    await supabase.from('focus_settings').upsert(newSettings);
  }
}));

function processWeeklyData(sessions) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = days.map(day => ({ 
    day, 
    pomodoro: 0, 
    deep_work: 0, 
    study_block: 0, 
    flow: 0, 
    custom: 0 
  }));

  sessions.forEach(s => {
    const dayIndex = new Date(s.session_date).getDay();
    const mode = s.mode || 'pomodoro';
    if (s.completed && data[dayIndex]) {
      data[dayIndex][mode] += s.duration_minutes;
    }
  });

  return data;
}
