import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP, checkAndUpdateStreak, getStreakMultiplier, LEVEL_FORMULA } from '../lib/xpEngine';
import { triggerJarvisToast } from '../components/JarvisToast';
import { getJarvisLine } from '../lib/jarvisReactions';
import { triggerLevelUp } from '../components/LevelUpEvent';

export const useXpStore = create((set, get) => ({
  xp: 0,
  level: 1,
  streakDays: 0,
  multiplier: 1.0,
  badges: [],
  xpLog: [],
  loading: false,
  lastLoaded: null,

  loadPlayerState: async (force = false) => {
    if (!force && get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
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
          loading: false,
          lastLoaded: Date.now()
        });
      }
    } catch (err) {
      console.error('Failed to load player XP state:', err);
      set({ loading: false });
    }
  },

  awardXP: async (amount, source) => {
    try {
      const oldLevel = get().level;
      const result = await awardXP(amount, source);
      
      // Update local state with fresh data from engine
      set({
        xp: result.player.xp,
        level: result.player.level,
        badges: result.player.badges,
        multiplier: result.multiplier
      });

      // Check if leveled up
      if (result.player.level > oldLevel) {
        triggerJarvisToast({
          type: 'level',
          title: `LEVEL UP`,
          message: `You are now Level ${result.player.level}`,
          duration: 6000
        });
        getJarvisLine('level_up', { 
          newLevel: result.player.level 
        }).then(line => {
          if (line) triggerJarvisToast({
            type: 'level',
            title: 'LEVEL UP',
            message: `Level ${result.player.level} achieved`,
            jarvisLine: line,
            duration: 6000
          });
        });

        // First show the event with no JARVIS line
        triggerLevelUp(result.player.level, null);
        
        // Then get JARVIS line async and re-trigger with line
        getJarvisLine('level_up', { 
          newLevel: result.player.level 
        }).then(line => {
          if (line) {
            // Small delay so the event is already showing
            setTimeout(() => {
              triggerLevelUp(result.player.level, line);
            }, 800);
          }
        });
      }

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

      const milestones = [3, 7, 14, 21, 30, 60, 90, 100];
      if (milestones.includes(result.streakDays)) {
        triggerJarvisToast({
          type: 'xp',
          title: `${result.streakDays} DAY STREAK`,
          message: 'Milestone hit.',
          duration: 5000
        });
        getJarvisLine('streak_milestone', { 
          days: result.streakDays 
        }).then(line => {
          if (line) triggerJarvisToast({
            type: 'xp',
            title: `${result.streakDays} DAY STREAK`,
            jarvisLine: line,
            duration: 5000
          });
        });
      }

      return result;
    } catch (err) {
      console.error('Failed to check streak:', err);
      throw err;
    }
  }
}));
