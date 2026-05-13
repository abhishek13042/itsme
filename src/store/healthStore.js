import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { rewards } from '../lib/rewards';

export const useHealthStore = create((set, get) => ({
  todayLog: null,
  history: [],
  milestones: [],
  loading: false,
  isLoading: false,
  lastLoaded: null,

  loadHealthData: async (force = false) => {
    if (!force && get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true, isLoading: true });
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: log } = await supabase.from('health_logs').select('*').eq('log_date', today).maybeSingle();
      const { data: history } = await supabase.from('health_logs').select('*').order('log_date', { ascending: false }).limit(60);
      const { data: milestones } = await supabase.from('health_milestones').select('*').order('phase');

      set({ 
        todayLog: log || { 
          log_date: today, 
          total_checks: 0, 
          total_possible: 13,
          gym_done: false,
          bath_done: false,
          bed_made: false,
          teeth_brushed: false,
          skincare_am: false,
          skincare_pm: false,
          study_table_organised: false,
          meal_1_done: false,
          meal_2_done: false,
          protein_hit: false,
          no_junk_before_6pm: false,
          slept_by_midnight: false,
          woke_by_630: false
        }, 
        history: history || [],
        milestones: milestones || [],
        loading: false,
        isLoading: false,
        lastLoaded: Date.now()
      });
    } catch (err) {
      console.error('Failed to load health data:', err);
      set({ loading: false, isLoading: false });
    }
  },

  updateLog: async (field, value) => {
    const previousLog = { ...get().todayLog };
    
    // Count active checks for score
    const checkFields = [
      'gym_done', 'meal_1_done', 'meal_2_done', 'protein_hit', 'no_junk_before_6pm',
      'slept_by_midnight', 'woke_by_630', 'bath_done', 'bed_made', 'teeth_brushed',
      'skincare_am', 'skincare_pm', 'study_table_organised'
    ];
    
    const newLog = { ...previousLog, [field]: value };
    newLog.total_checks = checkFields.filter(f => newLog[f]).length;
    newLog.day_score = Math.floor((newLog.total_checks / (newLog.total_possible || 13)) * 100);

    // Optimistic Update
    set({ todayLog: newLog });

    try {
      const { error } = await supabase.from('health_logs').upsert(newLog);

      if (error) {
        set({ todayLog: previousLog });
        throw error;
      }
    } catch (err) {
      console.error('Failed to update log:', err);
      set({ todayLog: previousLog });
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
  },

  submitDay: async () => {
    const { todayLog } = get();
    if (!todayLog) return;
    
    try {
       // Finalize earnings based on score and save
       const earnings = todayLog.total_checks * 4; // Average ₹4 per habit
       await supabase.from('health_logs').update({ rupees_earned: earnings }).eq('id', todayLog.id);
       
       // Global rewards
       await awardXP(todayLog.total_checks * 10, 'daily_health_habits');
       await rewards.earnReward(earnings * 100, 'Health Protocol Check', 'health');
       
       if (todayLog.day_score === 100) {
         await awardXP(100, 'perfect_health_day');
         await rewards.earnReward(5000, 'Perfect Health Bonus', 'health_bonus');
       }
       
       return { success: true, score: todayLog.day_score, earnings };
    } catch (err) {
       console.error('Failed to submit day:', err);
       return { success: false };
    }
  }
}));
