import { supabase } from '../lib/supabase';

const books = [
  { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', total_pages: 256 },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', category: 'Finance', total_pages: 336 },
  { title: 'Thinking Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', total_pages: 499 },
  { title: 'Zero to One', author: 'Peter Thiel', category: 'Startup', total_pages: 224 },
  { title: 'The Lean Startup', author: 'Eric Ries', category: 'Startup', total_pages: 336 },
  { title: 'Influence', author: 'Robert Cialdini', category: 'Marketing', total_pages: 320 },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Discipline', total_pages: 320 },
  { title: 'The Almanack of Naval Ravikant', author: 'Eric Jorgenson', category: 'Philosophy', total_pages: 238 },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Productivity', total_pages: 304 },
  { title: 'How to Think Like a Brain Surgeon', author: 'Research', category: 'Brain', total_pages: 280 },
];

const milestones = [
  { amount: '₹1', description: 'Earned online (any source)', status: 'ACHIEVED', date: '2024-01-10' },
  { amount: '₹1,000', description: 'From a single project', status: 'ACHIEVED', date: '2024-03-05' },
  { amount: '₹10,000', description: 'Monthly passive income', status: 'IN_PROGRESS' },
  { amount: '₹50,000', description: 'Monthly income', status: 'LOCKED' },
  { amount: '₹1,00,000', description: 'Monthly income', status: 'LOCKED' },
  { amount: '$100k', description: 'Trading Funded Account', status: 'LOCKED' },
];

export const seedFinanceSystem = async () => {
  try {
    const { data: bookCheck } = await supabase.from('books').select('id').limit(1);
    if (bookCheck?.length === 0) {
      await supabase.from('books').insert(books);
    }

    const { data: milestoneCheck } = await supabase.from('income_milestones').select('id').limit(1);
    if (milestoneCheck?.length === 0) {
      await supabase.from('income_milestones').insert(milestones);
    }
  } catch (err) {
    console.error('Finance seed error:', err);
  }
};
