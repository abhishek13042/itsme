import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';

const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (err) {
    console.warn('Audio chime failed:', err);
  }
};

export const usePomodoroStore = create((set, get) => ({
  timers: [
    { 
      id: 1, 
      label: 'Focus Session', 
      category: 'Deep Work', 
      duration: 25 * 60, 
      timeLeft: 25 * 60, 
      isActive: false, 
      isPaused: false, 
      isBreak: false, 
      sessionsCompleted: 0 
    }
  ],
  stats: {
    sessionsToday: 0,
    focusMinutesToday: 0,
    xpToday: 0,
    streak: 0
  },
  history: [],
  loading: false,

  loadPomodoroData: async () => {
    set({ loading: true });
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions } = await supabase.from('pomodoro_sessions').select('*').eq('session_date', today);
      const { data: history } = await supabase.from('pomodoro_sessions').select('*').order('created_at', { ascending: false }).limit(30);

      const focusMinutes = (sessions || []).reduce((sum, s) => sum + s.duration_minutes, 0);
      const xp = (sessions || []).reduce((sum, s) => sum + s.xp_awarded, 0);

      set({ 
        stats: {
          sessionsToday: sessions?.length || 0,
          focusMinutesToday: focusMinutes,
          xpToday: xp,
          streak: 12 // Simplified streak logic
        },
        history: history || [],
        loading: false 
      });
    } catch (err) {
      console.error('Failed to load pomodoro data:', err);
      set({ loading: false });
    }
  },

  addTimer: () => {
    const { timers } = get();
    if (timers.length >= 3) return;
    const newTimer = {
      id: Date.now(),
      label: 'New Session',
      category: 'Study',
      duration: 25 * 60,
      timeLeft: 25 * 60,
      isActive: false,
      isPaused: false,
      isBreak: false,
      sessionsCompleted: 0
    };
    set({ timers: [...timers, newTimer] });
  },

  removeTimer: (id) => {
    set(state => ({ timers: state.timers.filter(t => t.id !== id) }));
  },

  updateTimer: (id, updates) => {
    set(state => ({
      timers: state.timers.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  },

  tick: () => {
    const { timers, updateTimer, completeSession } = get();
    timers.forEach(timer => {
      if (timer.isActive && !timer.isPaused) {
        if (timer.timeLeft > 0) {
          updateTimer(timer.id, { timeLeft: timer.timeLeft - 1 });
        } else {
          completeSession(timer.id);
        }
      }
    });
  },

  completeSession: async (id) => {
    const { timers, updateTimer, loadPomodoroData } = get();
    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    playChime();

    if (!timer.isBreak) {
      // Completed a focus session
      await awardXP(50, 'pomodoro_complete');
      const durationMin = Math.round(timer.duration / 60);
      
      await supabase.from('pomodoro_sessions').insert([{
        session_date: new Date().toISOString().split('T')[0],
        duration_minutes: durationMin,
        category: timer.category,
        label: timer.label,
        completed: true,
        xp_awarded: 50
      }]);

      updateTimer(id, {
        isActive: true,
        isBreak: true,
        timeLeft: 5 * 60, // 5 min break
        sessionsCompleted: timer.sessionsCompleted + 1
      });
      
      await loadPomodoroData();
    } else {
      // Completed a break
      updateTimer(id, {
        isActive: false,
        isBreak: false,
        timeLeft: timer.duration
      });
    }
  }
}));
