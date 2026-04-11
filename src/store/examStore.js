import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { rewards } from '../lib/rewards';
import { seedExamSystem } from '../lib/examSeeder';

export const useExamStore = create((set, get) => ({
  subjects: [],
  examDate: null,
  pastPapers: [],
  studyTasks: [],
  loading: false,

  loadExamData: async () => {
    set({ loading: true });
    try {
      await seedExamSystem();
      
      const { data: subjects } = await supabase.from('exam_subjects').select('*').order('name');
      const { data: setting } = await supabase.from('settings').select('value').eq('key', 'exam_date').single();
      
      // Load papers from a potential exam_past_papers table or local
      const { data: papers } = await supabase.from('exam_past_papers').select('*');

      set({ 
        subjects: subjects || [], 
        examDate: setting?.value ? new Date(setting.value) : null,
        pastPapers: papers || [],
        loading: false 
      });
    } catch (err) {
      console.error('Failed to load exam data:', err);
      set({ loading: false });
    }
  },

  updateReadiness: async (id, readiness) => {
    try {
      const { error } = await supabase
        .from('exam_subjects')
        .update({ readiness })
        .eq('id', id);
      
      if (!error) {
        set(state => ({
          subjects: state.subjects.map(s => s.id === id ? { ...s, readiness } : s)
        }));
      }
    } catch (err) {
      console.error('Failed to update readiness:', err);
    }
  },

  updateNotes: async (id, notes) => {
    try {
      await supabase.from('exam_subjects').update({ notes }).eq('id', id);
      set(state => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, notes } : s)
      }));
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  },

  logPastPaper: async (paper) => {
    try {
      const { data, error } = await supabase.from('exam_past_papers').insert([paper]).select().single();
      if (!error) {
        set(state => ({ pastPapers: [...state.pastPapers, data] }));
        await awardXP(50, `past_paper:${paper.subject}`);
        await rewards.earnReward(1500, `Past Paper: ${paper.subject}`, 'exam');
      }
    } catch (err) {
      console.error('Failed to log paper:', err);
    }
  }
}));
