import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { calculateAllStats } from '../lib/statCalculator';
import { triggerJarvisToast } from '../components/JarvisToast';
import { getJarvisLine } from '../lib/jarvisReactions';

export const useCharacterStore = create((set, get) => ({
  stats: {
    dsa: 0,
    sysdesign: 0,
    backend: 0,
    trading: 0,
    physique: 0,
    analytical: 0
  },
  badges: [],
  brainLogs: [],
  xpEvents: [],
  playerState: null,
  loading: false,
  lastLoaded: null,

  loadCharacterData: async () => {
    if (get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true });
    try {
      // 1. Get Player State (contains calculated stats)
      const { data: player } = await supabase.from('player_state').select('*').single();
      
      // 2. Load Brain Logs (Last 30 for charts)
      const { data: bLogs } = await supabase
        .from('brain_logs')
        .select('*')
        .order('logged_at', { ascending: false });

      // 3. Load All Badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('order_index', { ascending: true });

      // 4. Load XP Log (Last 20 for history)
      const { data: xLogs } = await supabase
        .from('xp_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      set({ 
        playerState: player,
        stats: {
          dsa: player?.stat_dsa || 0,
          sysdesign: player?.stat_sysdesign || 0,
          backend: player?.stat_backend || 0,
          trading: player?.stat_trading || 0,
          physique: player?.stat_physique || 0,
          analytical: player?.stat_analytical || 0
        },
        badges: allBadges || [],
        brainLogs: bLogs || [],
        xpEvents: xLogs || [],
        loading: false,
        lastLoaded: Date.now()
      });

      // Recalculate stats on load to keep them fresh
      const newStats = await calculateAllStats();
      if (newStats) set({ stats: newStats });

    } catch (err) {
      console.error('Failed to load character data:', err);
      set({ loading: false });
    }
  },

  recalculate: async () => {
    set({ loading: true });
    const newStats = await calculateAllStats();
    if (newStats) set({ stats: newStats });
    set({ loading: false });
  },

  submitBrainLog: async (entry) => {
    try {
      const { data, error } = await supabase
        .from('brain_logs')
        .insert([{
          ...entry,
          xp_awarded: 20
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Add to local state
      set(state => ({ brainLogs: [data, ...state.brainLogs] }));
      
      // Award XP
      await awardXP(20, 'character:brain_log');
      
      // Recalculate stats
      await get().recalculate();
      
      triggerJarvisToast({
        type: 'info',
        title: 'BRAIN LOG',
        xp: 20,
        message: `${entry.topic} — recorded.`,
        duration: 3000
      });
      getJarvisLine('brain_log', { 
        minutes: entry.minutes_pushed, 
        topic: entry.topic 
      }).then(line => {
        if (line) triggerJarvisToast({
          type: 'info',
          title: 'BRAIN LOG',
          xp: 20,
          jarvisLine: line,
          duration: 3000
        });
      });

      return { success: true, data };
    } catch (err) {
      console.error('Failed to log brain session:', err);
      return { success: false, error: err };
    }
  }
}));
