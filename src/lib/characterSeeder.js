import { supabase } from '../lib/supabase';

export const seedCharacterSystem = async () => {
  try {
    // Create brain_logs table via prompt if needed
    // But we'll initialize stats in player_state if they aren't there
    const { data: player } = await supabase.from('player_state').select('*').single();
    if (player) {
      // Ensure we have a baseline for radar chart
      const initialStats = {
        stat_dsa: player.stat_dsa || 0,
        stat_sysdesign: player.stat_sysdesign || 0,
        stat_backend: player.stat_backend || 0,
        stat_trading: player.stat_trading || 0,
        stat_physique: player.stat_physique || 0,
        stat_analytical: player.stat_analytical || 0
      };
      
      const hasNull = Object.values(initialStats).some(v => v === null);
      if (hasNull) {
          await supabase.from('player_state')
            .update({
                stat_dsa: player.stat_dsa ?? 0,
                stat_sysdesign: player.stat_sysdesign ?? 0,
                stat_backend: player.stat_backend ?? 0,
                stat_trading: player.stat_trading ?? 0,
                stat_physique: player.stat_physique ?? 0,
                stat_analytical: player.stat_analytical ?? 0
            })
            .eq('id', player.id);
      }
    }
  } catch (err) {
    console.error('Character system init error:', err);
  }
};
