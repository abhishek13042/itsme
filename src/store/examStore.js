import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { rewards } from '../lib/rewards';

export const useExamStore = create((set, get) => ({
  semesters: [],
  activeSem: null, // Full semester object
  subjects: [],    // Subjects for active semester
  checklists: {},  // subject_id -> items
  loading: false,
  isLoading: false,
  lastLoaded: null,

  loadSemesters: async () => {
    if (get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true, isLoading: true });
    try {
      const { data: sems, error } = await supabase
        .from('semesters')
        .select('*')
        .order('sem_number');
      
      if (error) throw error;

      const active = sems.find(s => s.is_active) || sems[0];
      set({ 
        semesters: sems, 
        activeSem: active, 
        loading: false, 
        isLoading: false,
        lastLoaded: Date.now() 
      });
      
      if (active) {
        await get().loadSemesterContent(active.id);
      }
    } catch (err) {
      console.error('Failed to load semesters:', err);
      set({ loading: false, isLoading: false });
    }
  },

  loadSemesterContent: async (semId) => {
    set({ loading: true });
    try {
      // Load subjects
      const { data: subjects } = await supabase
        .from('sem_subjects')
        .select('*')
        .eq('sem_id', semId)
        .order('created_at');

      // Load checklists for these subjects
      const subjectIds = subjects?.map(s => s.id) || [];
      const { data: checklistItems } = await supabase
        .from('subject_checklist')
        .select('*')
        .in('subject_id', subjectIds);

      const checklistMap = {};
      checklistItems?.forEach(item => {
        if (!checklistMap[item.subject_id]) checklistMap[item.subject_id] = [];
        checklistMap[item.subject_id].push(item);
      });

      set({ subjects: subjects || [], checklists: checklistMap, loading: false });
    } catch (err) {
      console.error('Failed to load semester content:', err);
      set({ loading: false });
    }
  },

  switchSemester: async (semId) => {
    const { semesters } = get();
    const active = semesters.find(s => s.id === semId);
    set({ activeSem: active });
    await get().loadSemesterContent(semId);
  },

  updateSemesterDates: async (semId, dates) => {
    try {
      const { data, error } = await supabase
        .from('semesters')
        .update(dates)
        .eq('id', semId)
        .select()
        .single();
      
      if (!error) {
        set(state => ({
          semesters: state.semesters.map(s => s.id === semId ? data : s),
          activeSem: state.activeSem.id === semId ? data : state.activeSem
        }));
      }
    } catch (err) {
      console.error('Failed to update semester dates:', err);
    }
  },

  updateSubjectReadiness: async (id, readiness) => {
    try {
      const { error } = await supabase
        .from('sem_subjects')
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

  updateMarks: async (id, field, value) => {
    try {
      const { error } = await supabase
        .from('sem_subjects')
        .update({ [field]: value })
        .eq('id', id);
      
      if (!error) {
        set(state => ({
          subjects: state.subjects.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
      }
    } catch (err) {
      console.error('Failed to update marks:', err);
    }
  },

  toggleChecklistItem: async (itemId, subjectId, completed) => {
    try {
      const { data, error } = await supabase
        .from('subject_checklist')
        .update({ completed, completed_at: completed ? new Date() : null })
        .eq('id', itemId)
        .select()
        .single();
      
      if (!error) {
        set(state => {
          const items = state.checklists[subjectId].map(i => i.id === itemId ? data : i);
          return {
            checklists: { ...state.checklists, [subjectId]: items }
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  },

  addChecklistItem: async (subjectId, type, text) => {
    try {
      const { data, error } = await supabase
        .from('subject_checklist')
        .insert([{ subject_id: subjectId, type, item_text: text }])
        .select()
        .single();
      
      if (!error) {
        set(state => {
          const items = [...(state.checklists[subjectId] || []), data];
          return {
            checklists: { ...state.checklists, [subjectId]: items }
          };
        });
      }
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  }
}));
