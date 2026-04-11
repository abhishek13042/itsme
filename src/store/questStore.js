import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { completeQuest, completeBossTask, getBossStatus, checkWeeklyBonus } from '../lib/questEngine';

export const useQuestStore = create((set, get) => ({
  activeQuests: [],
  completedQuests: [],
  dailyQuests: [],
  todayCompletions: [],
  boss: null,
  bossTasks: [],
  hpPercent: 0,
  isBossDefeated: false,
  weeklyProgress: 0,
  penalties: [],
  loading: false,

  loadQuests: async () => {
    set({ loading: true });
    try {
      const { data: allQuests, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const active = allQuests?.filter(q => !q.completed) || [];
      const completed = allQuests?.filter(q => q.completed) || [];

      set({ 
        activeQuests: active, 
        completedQuests: completed,
        loading: false 
      });
    } catch (err) {
      console.error('Failed to load quests:', err);
      set({ loading: false });
    }
  },

  loadPenalties: async () => {
    try {
      const { data } = await supabase
        .from('penalties')
        .select('*')
        .order('created_at', { ascending: false });
      set({ penalties: data || [] });
    } catch (err) {
      console.error('Failed to load penalties:', err);
    }
  },

  loadBoss: async () => {
    try {
      const status = await getBossStatus();
      set({
        boss: status.boss,
        bossTasks: status.tasks,
        hpPercent: status.hpPercent,
        isBossDefeated: status.isDefeated
      });
    } catch (err) {
      console.error('Failed to load boss status:', err);
    }
  },

  completeQuest: async (questId) => {
    try {
      const result = await completeQuest(questId);
      await get().loadQuests(); // Refresh lists and weekly progress
      return result;
    } catch (err) {
      console.error('Failed to complete quest:', err);
      throw err;
    }
  },

  completeBossTask: async (taskId) => {
    try {
      const result = await completeBossTask(taskId);
      await get().loadBoss(); // Refresh HP and defeat status
      return result;
    } catch (err) {
      console.error('Failed to complete boss task:', err);
      throw err;
    }
  },

  loadDailyQuests: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: dailies } = await supabase.from('daily_quests').select('*').eq('is_active', true);
      const { data: completions } = await supabase.from('daily_completions').select('quest_id').eq('completed_date', today);
      
      set({ 
        dailyQuests: dailies || [], 
        todayCompletions: completions?.map(c => c.quest_id) || [] 
      });
    } catch (err) {
      console.error('Failed to load daily quests:', err);
    }
  },

  completeDaily: async (questId) => {
    try {
      const { completeDailyQuest } = await import('../lib/questEngine');
      const result = await completeDailyQuest(questId);
      if (result.alreadyCompleted) return result;
      
      await get().loadDailyQuests();
      return result;
    } catch (err) {
      console.error('Failed to complete daily:', err);
      throw err;
    }
  }
}));
