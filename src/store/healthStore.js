import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { seedHealthSystem } from '../lib/healthSeeder';

export const useHealthStore = create((set, get) => ({
  todayLog: null,
  history: [],
  milestones: [],
  loading: false,

  loadHealthData: async () => {
    set({ loading: true });
    try {
      await seedHealthSystem();
      const today = new Date().toISOString().split('T')[0];

      const { data: log } = await supabase.from('health_logs').select('*').eq('log_date', today).maybeSingle();
      const { data: history } = await supabase.from('health_logs').select('*').order('log_date', { ascending: false }).limit(30);
      const { data: milestones } = await supabase.from('health_milestones').select('*').order('phase');

      set({ 
        todayLog: log || { log_date: today, water_glasses: 0 }, 
        history: history || [],
        milestones: milestones || [],
        loading: false 
      });
    } catch (err) {
      console.error('Failed to load health data:', err);
      set({ loading: false });
    }
  },

  updateLog: async (updates) => {
    const { todayLog } = get();
    try {
      const { data, error } = await supabase
        .from('health_logs')
        .upsert({ ...todayLog, ...updates })
        .select()
        .single();
      
      if (!error) {
        set({ todayLog: data });
        // Calculate XP awards based on what changed
        if (updates.gym_done && !todayLog.gym_done) await awardXP(25, 'health:gym');
        if (updates.sleep_time && !todayLog.sleep_time) await awardXP(10, 'health:sleep');
        if (updates.skincare_am && !todayLog.skincare_am) await awardXP(5, 'health:skincare_am');
        if (updates.skincare_pm && !todayLog.skincare_pm) await awardXP(5, 'health:skincare_pm');
        if (updates.no_junk_before_6pm && !todayLog.no_junk_before_6pm) await awardXP(10, 'health:nutrition');
      }
    } catch (err) {
      console.error('Failed to update health log:', err);
    }
  },

  toggleMilestone: async (id, completed) => {
    try {
      await supabase.from('health_milestones').update({ completed }).eq('id', id);
      set(state => ({
        milestones: state.milestones.map(m => m.id === id ? { ...m, completed } : m)
      }));
    } catch (err) {
      console.error('Failed to toggle milestone:', err);
    }
  }
}));
