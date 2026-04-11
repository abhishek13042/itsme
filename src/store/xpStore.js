import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP, checkAndUpdateStreak, getStreakMultiplier, LEVEL_FORMULA } from '../lib/xpEngine';

export const useXpStore = create((set, get) => ({
  xp: 0,
  level: 1,
  streakDays: 0,
  multiplier: 1.0,
  badges: [],
  xpLog: [],
  loading: false,

  loadPlayerState: async () => {
    set({ loading: true });
    try {
      const { data: player, error } = await supabase
        .from('player_state')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;

      if (error?.code === 'PGRST116') {
        const { data: newPlayer, error: createError } = await supabase
          .from('player_state')
          .insert([{ xp: 0, level: 1, streak_days: 0, last_active_date: new Date().toISOString().split('T')[0] }])
          .select()
          .single();
        if (createError) throw createError;
        
        set({
          xp: 0,
          level: 1,
          streakDays: 0,
          multiplier: 1.0,
          badges: [],
          loading: false
        });
        return;
      }

      const { data: logs } = await supabase
        .from('xp_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (player) {
        set({
          xp: player.xp,
          level: player.level || LEVEL_FORMULA.getLevel(player.xp),
          streakDays: player.streak_days,
          multiplier: getStreakMultiplier(player.streak_days),
          badges: player.badges || [],
          xpLog: logs || [],
          loading: false
        });
      }
    } catch (err) {
      console.error('Failed to load player XP state:', err);
      set({ loading: false });
    }
  },

  awardXP: async (amount, source) => {
    try {
      const result = await awardXP(amount, source);
      
      // Update local state with fresh data from engine
      set({
        xp: result.player.xp,
        level: result.player.level,
        badges: result.player.badges,
        multiplier: result.multiplier
      });

      // Refresh log
      const { data: logs } = await supabase
        .from('xp_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      set({ xpLog: logs || [] });

      return result;
    } catch (err) {
      console.error('Failed to award XP:', err);
      throw err;
    }
  },

  checkStreak: async () => {
    try {
      const result = await checkAndUpdateStreak();
      set({
        streakDays: result.streakDays,
        multiplier: getStreakMultiplier(result.streakDays)
      });
      return result;
    } catch (err) {
      console.error('Failed to check streak:', err);
      throw err;
    }
  }
}));
