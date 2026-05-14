import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { useWalletStore } from './walletStore';

export const useFinanceStore = create((set, get) => ({
  books: [],
  milestones: [],
  curiosityNodes: [],
  readingStreak: 0,
  explorerBooks: [],
  explorerPapers: [],
  aiTrackBooks: [],
  aiTrackPapers: [],
  readingHistory: [],
  isLoadingKnowledge: false,
  loading: false,
  isLoading: false,
  lastLoaded: null,

  loadFinanceData: async (force = false) => {
    if (!force && get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true, isLoading: true });
    try {
      // 1. Fetch Books
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .order('order_index', { ascending: true });

      // 2. Fetch Milestones
      const { data: milestones } = await supabase
        .from('income_milestones')
        .select('*')
        .order('order_index', { ascending: true });

      // 3. Fetch Curiosity Nodes
      const { data: nodes } = await supabase
        .from('curiosity_nodes')
        .select('*')
        .order('order_index', { ascending: true });

      // 4. Calculate Reading Streak (simplified from logs)
      const { data: logs } = await supabase
        .from('xp_transactions')
        .select('created_at')
        .ilike('reason', '%book%')
        .order('created_at', { ascending: false });
      
      const streak = calculateStreak(logs?.map(l => l.created_at) || []);

      set({ 
        books: books || [], 
        milestones: milestones || [],
        curiosityNodes: nodes || [],
        readingStreak: streak,
        loading: false,
        isLoading: false,
        lastLoaded: Date.now()
      });

      // Load Knowledge Store
      await get().loadKnowledgeStore();
      await get().loadReadBooks();

    } catch (err) {
      console.error('Failed to load finance data:', err);
      set({ loading: false, isLoading: false });
    }
  },

  loadKnowledgeStore: async () => {
    set({ isLoadingKnowledge: true })
    
    try {
      // Fetch all Explorer topics with their books/papers
      const { data: explorerTopics } = await supabase
        .from('explorer_topics')
        .select('topic_data, books, papers, domain, read_concepts, week_number, created_at')
        .order('created_at', { ascending: false })
  
      // Extract unique books from Explorer
      const explorerBooksMap = {}
      const explorerPapersMap = {}
  
      ;(explorerTopics || []).forEach(topic => {
        const topicTitle = topic.topic_data?.title || `Week ${topic.week_number}`
        
        ;(topic.books || []).forEach(book => {
          const key = book.title?.toLowerCase()
          if (key && !explorerBooksMap[key]) {
            explorerBooksMap[key] = {
              ...book,
              source: 'explorer',
              sourceTopic: topicTitle,
              domain: topic.domain,
              addedAt: topic.created_at
            }
          }
        })
  
        ;(topic.papers || []).forEach(paper => {
          const key = paper.title?.toLowerCase()
          if (key && !explorerPapersMap[key]) {
            explorerPapersMap[key] = {
              ...paper,
              source: 'explorer',
              sourceTopic: topicTitle,
              domain: topic.domain,
              addedAt: topic.created_at
            }
          }
        })
      })
  
      // Fetch AI Track exploration data for books/papers
      const { data: aiTrackExplorer } = await supabase
        .from('ai_track_explorer')
        .select('topic_title, section_id, cluster, books, papers, generated_at')
        .order('generated_at', { ascending: false })
  
      const aiTrackBooksMap = {}
      const aiTrackPapersMap = {}
  
      ;(aiTrackExplorer || []).forEach(item => {
        ;(item.books || []).forEach(book => {
          const key = book.toLowerCase?.() || book
          if (!aiTrackBooksMap[key]) {
            aiTrackBooksMap[key] = {
              title: book,
              source: 'ai_track',
              sourceTopic: item.topic_title,
              cluster: item.cluster,
              addedAt: item.generated_at
            }
          }
        })
  
        ;(item.papers || []).forEach(paper => {
          const key = paper.toLowerCase?.() || paper
          if (!aiTrackPapersMap[key]) {
            aiTrackPapersMap[key] = {
              title: paper,
              source: 'ai_track',
              sourceTopic: item.topic_title,
              cluster: item.cluster,
              addedAt: item.generated_at
            }
          }
        })
      })
  
      set({
        explorerBooks: Object.values(explorerBooksMap),
        explorerPapers: Object.values(explorerPapersMap),
        aiTrackBooks: Object.values(aiTrackBooksMap),
        aiTrackPapers: Object.values(aiTrackPapersMap),
        isLoadingKnowledge: false
      })
    } catch (err) {
      console.error('loadKnowledgeStore error:', err)
      set({ isLoadingKnowledge: false })
    }
  },

  markBookRead: async (bookKey, isRead) => {
    try {
      const { data: existing } = await supabase
        .from('ai_sessions')
        .select('id')
        .eq('type', 'book_read')
        .eq('user_input', bookKey)
        .maybeSingle()

      if (isRead && !existing) {
        await supabase.from('ai_sessions').insert({
          type: 'book_read',
          session_date: new Date().toISOString().split('T')[0],
          user_input: bookKey,
          ai_response: 'read',
          context_snapshot: JSON.stringify({ 
            bookKey, markedAt: new Date().toISOString() 
          })
        })
        
        // Save to global memory
        const { saveMemory, MEMORY_TYPES } = await import('../lib/globalMemory')
        saveMemory({
          type: MEMORY_TYPES.FINANCE,
          content: `Read book: "${bookKey}"`,
          source: 'finance_books',
          importance: 7
        })

        set(state => ({ readingHistory: [...state.readingHistory, bookKey] }))
      } else if (!isRead && existing) {
        await supabase.from('ai_sessions')
          .delete().eq('id', existing.id)
        set(state => ({ readingHistory: state.readingHistory.filter(k => k !== bookKey) }))
      }
    } catch (err) {
      console.error('markBookRead error:', err)
    }
  },

  loadReadBooks: async () => {
    const { data } = await supabase
      .from('ai_sessions')
      .select('user_input, session_date')
      .eq('type', 'book_read')
    set({ readingHistory: (data || []).map(d => d.user_input) })
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

  completeBook: async (id) => {
    try {
      const book = get().books.find(b => b.id === id);
      await supabase.from('books').update({ 
        status: 'COMPLETED',
        completed: true,
        completed_at: new Date().toISOString() 
      }).eq('id', id);
      
      await awardXP(200, `book_complete:${book.title}`);
      await useWalletStore.getState().earnReward(50, `Finished book: ${book.title}`, 'reading');
      
      await get().loadFinanceData();
    } catch (err) {
      console.error('Failed to complete book:', err);
    }
  },

  updateBookReview: async (id, { rating, takeaway }) => {
    try {
      const updates = {};
      if (rating !== undefined) updates.rating = rating;
      if (takeaway !== undefined) updates.one_line_takeaway = takeaway;
      
      await supabase.from('books').update(updates).eq('id', id);
      
      set(state => ({
        books: state.books.map(b => b.id === id ? { ...b, ...updates } : b)
      }));
    } catch (err) {
      console.error('Failed to update book review:', err);
    }
  },

  markMilestoneAchieved: async (id) => {
    try {
      const milestone = get().milestones.find(m => m.id === id);
      await supabase.from('income_milestones').update({ 
        status: 'ACHIEVED',
        completed: true,
        completed_at: new Date().toISOString()
      }).eq('id', id);
      
      await awardXP(300, `milestone:${milestone.title}`);
      
      // Bonus: Larger reward for higher milestones
      const reward = milestone.amount_inr > 1000 ? 500 : 100;
      await useWalletStore.getState().earnReward(reward, `Milestone Achieved: ${milestone.title}`, 'finance');
      
      await get().loadFinanceData();
    } catch (err) {
      console.error('Failed to achieve milestone:', err);
    }
  }
}));

// Helper: Calculate streak from a list of ISO dates
function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;
  
  let streak = 0;
  let currentPos = new Date(sortedDates[0]);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const d = new Date(sortedDates[i]);
    const diff = (currentPos - d) / (1000 * 60 * 60 * 24);
    
    if (diff === 0) {
      streak++;
    } else if (diff === 1) {
      streak++;
      currentPos = d;
    } else {
      break;
    }
  }
  
  return streak;
}
