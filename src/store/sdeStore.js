import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { seedSdeRoadmap } from '../lib/sdeSeeder';

export const useSdeStore = create((set, get) => ({
  chapters: [],
  dsaSolved: 0,
  loading: false,
  isLoading: false,
  lastLoaded: null,

  loadRoadmap: async () => {
    if (get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true, isLoading: true });
    try {
      await seedSdeRoadmap(); // Ensure table is seeded
      
      const { data: chapters, error } = await supabase
        .from('sde_progress')
        .select('*')
        .order('month_target', { ascending: true });

      if (error) throw error;

      const { data: player } = await supabase
        .from('player_state')
        .select('stat_dsa_solved')
        .single();

      set({ 
        chapters: chapters || [], 
        dsaSolved: player?.stat_dsa_solved || 0,
        loading: false,
        isLoading: false,
        lastLoaded: Date.now()
      });
    } catch (err) {
      console.error('Failed to load SDE roadmap:', err);
      set({ loading: false, isLoading: false });
    }
  },

  updateChapterStatus: async (chapterId, status) => {
    // Status: 0 = Not Started, 1 = In Progress, 2 = Done
    const isCompleted = status === 2;
    const currentChapter = get().chapters.find(c => c.chapter_id === chapterId);
    
    try {
      const { error } = await supabase
        .from('sde_progress')
        .update({ 
          completed: isCompleted,
          status: status, // I'll add a 'status' column in SQL if needed, using 'completed' for now
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('chapter_id', chapterId);

      if (error) throw error;

      if (isCompleted && !currentChapter.completed) {
        // Award XP and update stats
        await awardXP(100, `roadmap:${currentChapter.title}`);
        
        const { data: player } = await supabase.from('player_state').select('*').single();
        const updates = {};
        if (currentChapter.category === 'DSA') updates.stat_dsa = (player.stat_dsa || 0) + 1;
        if (currentChapter.category === 'Backend') updates.stat_backend = (player.stat_backend || 0) + 1;
        
        if (Object.keys(updates).length > 0) {
          await supabase.from('player_state').update(updates).eq('id', player.id);
        }
      }

      await get().loadRoadmap();
    } catch (err) {
      console.error('Failed to update chapter status:', err);
    }
  },

  updateNotes: async (chapterId, notes) => {
    try {
       await supabase
        .from('sde_progress')
        .update({ notes })
        .eq('chapter_id', chapterId);
        
       set(state => ({
         chapters: state.chapters.map(c => c.chapter_id === chapterId ? { ...c, notes } : c)
       }));
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  },

  updateDsaSolved: async (count) => {
    try {
      const { data: player } = await supabase.from('player_state').select('id').single();
      await supabase.from('player_state').update({ stat_dsa_solved: count }).eq('id', player.id);
      set({ dsaSolved: count });
    } catch (err) {
      console.error('Failed to update DSA solved count:', err);
    }
  }
}));
