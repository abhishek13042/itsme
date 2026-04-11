import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { seedCharacterSystem } from '../lib/characterSeeder';

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
  loading: false,

  loadCharacterData: async () => {
    set({ loading: true });
    try {
      await seedCharacterSystem();
      
      const { data: player } = await supabase.from('player_state').select('*').single();
      const { data: bLogs } = await supabase.from('brain_logs').select('*').order('created_at', { ascending: false });
      const { data: xLogs } = await supabase.from('xp_log').select('*').order('created_at', { ascending: false }).limit(50);

      set({ 
        stats: {
          dsa: player?.stat_dsa || 0,
          sysdesign: player?.stat_sysdesign || 0,
          backend: player?.stat_backend || 0,
          trading: player?.stat_trading || 0,
          physique: player?.stat_physique || 0,
          analytical: player?.stat_analytical || 0
        },
        badges: player?.badges || [],
        brainLogs: bLogs || [],
        xpEvents: xLogs || [],
        loading: false 
      });
    } catch (err) {
      console.error('Failed to load character data:', err);
      set({ loading: false });
    }
  },

  updateStat: async (statName, value) => {
    try {
      const colName = `stat_${statName}`;
      await supabase.from('player_state').update({ [colName]: value }).eq('id', (await supabase.from('player_state').select('id').single()).data.id);
      
      set(state => ({
        stats: { ...state.stats, [statName]: value }
      }));
    } catch (err) {
      console.error('Failed to update stat:', err);
    }
  },

  logBrainWin: async (entry) => {
    try {
      const { data, error } = await supabase.from('brain_logs').insert([entry]).select().single();
      if (!error) {
        set(state => ({ brainLogs: [data, ...state.brainLogs] }));
        await awardXP(20, 'character:deep_thinker_session');
        
        // Milestone logic: check if 10 or 30 logs
        const count = get().brainLogs.length;
        if (count === 10 || count === 30) {
            const badgeName = count === 30 ? 'Deep Thinker' : 'Mind Pushed';
            const { data: player } = await supabase.from('player_state').select('badges, id').single();
            if (player && !player.badges?.includes(badgeName)) {
                await supabase.from('player_state')
                  .update({ badges: [...(player.badges || []), badgeName] })
                  .eq('id', player.id);
                set(state => ({ badges: [...state.badges, badgeName] }));
            }
        }
      }
    } catch (err) {
      console.error('Failed to log brain win:', err);
    }
  }
}));
