import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { generateMorningPlan, generateEveningReview } from '../lib/aiPlanner';

export const useAiStore = create((set, get) => ({
  todayPlan: null,
  history: [],
  loading: false,
  error: null,
  loadingMessage: '',

  loadPlans: async () => {
    set({ loading: true });
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: todayPlan } = await supabase.from('daily_plans').select('*').eq('plan_date', today).single();
      const { data: history } = await supabase.from('daily_plans').select('*').order('plan_date', { ascending: false }).limit(7);

      set({ todayPlan, history: history || [], loading: false });
    } catch (err) {
      console.error('Failed to load plans:', err);
      set({ loading: false });
    }
  },

  generateTodayPlan: async () => {
    set({ loading: true, error: null, loadingMessage: 'Waking up the AI Coach...' });
    
    const messages = [
      'Analyzing your current stats...',
      'Checking your active quests...',
      'Scanning exam deadlines...',
      'Calculating optimal time blocks...',
      'Finalizing battle plan...'
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        set({ loadingMessage: messages[msgIdx] });
        msgIdx++;
      }
    }, 1500);

    try {
      const plan = await generateMorningPlan();
      clearInterval(interval);
      await get().loadPlans();
    } catch (err) {
      clearInterval(interval);
      set({ error: err.message, loading: false });
    }
  },

  submitEveningReview: async (userInput) => {
    set({ loading: true, error: null, loadingMessage: 'Analyzing your day...' });
    
    const messages = [
      'Reviewing completed tasks...',
      'Comparing with morning plan...',
      'Calculating discipline score...',
      'Writing honest feedback...'
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        set({ loadingMessage: messages[msgIdx] });
        msgIdx++;
      }
    }, 1500);

    try {
      const review = await generateEveningReview(userInput);
      clearInterval(interval);
      await get().loadPlans();
    } catch (err) {
      clearInterval(interval);
      set({ error: err.message, loading: false });
    }
  }
}));
