import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { rewards } from '../lib/rewards';
import { seedFinanceSystem } from '../lib/financeSeeder';

export const useFinanceStore = create((set, get) => ({
  books: [],
  milestones: [],
  readingStreak: 0,
  loading: false,

  loadFinanceData: async () => {
    set({ loading: true });
    try {
      await seedFinanceSystem();
      const { data: books } = await supabase.from('books').select('*').order('started_at', { ascending: false });
      const { data: milestones } = await supabase.from('income_milestones').select('*').order('created_at', { ascending: true });
      
      // Simulating streak for now, ideally calculated from daily_logs
      set({ 
        books: books || [], 
        milestones: milestones || [],
        readingStreak: 12,
        loading: false 
      });
    } catch (err) {
      console.error('Failed to load finance data:', err);
      set({ loading: false });
    }
  },

  updateBookProgress: async (id, pages) => {
    const book = get().books.find(b => b.id === id);
    const newTotal = (book.pages_read || 0) + pages;
    const isComplete = newTotal >= book.total_pages;

    try {
       const updates = {
         pages_read: Math.min(newTotal, book.total_pages),
         status: isComplete ? 'COMPLETED' : 'READING'
       };

       if (isComplete) {
         updates.finished_at = new Date().toISOString();
         await awardXP(100, `book_complete:${book.title}`);
         await rewards.earnReward(5000, `Finished reading: ${book.title}`, 'reading');
       } else {
         await awardXP(15, `pages_read:${book.title}`);
       }

       await supabase.from('books').update(updates).eq('id', id);
       await get().loadFinanceData();
    } catch (err) {
      console.error('Failed to update book progress:', err);
    }
  },

  startBook: async (id) => {
    try {
      await supabase.from('books').update({ 
        status: 'READING', 
        started_at: new Date().toISOString() 
      }).eq('id', id);
      await get().loadFinanceData();
    } catch (err) {
      console.error('Failed to start book:', err);
    }
  },

  updateMilestone: async (id, status) => {
    try {
      const updates = { status };
      if (status === 'ACHIEVED') updates.date = new Date().toISOString().split('T')[0];
      await supabase.from('income_milestones').update(updates).eq('id', id);
      await get().loadFinanceData();
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  }
}));
