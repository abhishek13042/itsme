import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { generateMorningPlan, generateEveningReview } from '../lib/aiPlanner';

export const usePlannerStore = create((set, get) => ({
  todaysPlan: null,
  todaysReview: null,
  isGenerating: false,
  error: null,

  loadTodaysPlan: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('plan_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        set({
          todaysPlan: data.morning_plan,
          todaysReview: data.evening_review,
          error: null
        });
      }
    } catch (err) {
      console.error('Failed to load today\'s plan:', err);
      set({ error: err.message });
    }
  },

  generatePlan: async () => {
    set({ isGenerating: true, error: null });
    try {
      const plan = await generateMorningPlan();
      set({ todaysPlan: plan, isGenerating: false });
      return plan;
    } catch (err) {
      console.error('Failed to generate plan:', err);
      set({ error: err.message, isGenerating: false });
      throw err;
    }
  },

  generateReview: async (userInput) => {
    set({ isGenerating: true, error: null });
    try {
      const review = await generateEveningReview(userInput);
      set({ todaysReview: review, isGenerating: false });
      return review;
    } catch (err) {
      console.error('Failed to generate review:', err);
      set({ error: err.message, isGenerating: false });
      throw err;
    }
  }
}));
