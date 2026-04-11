import { supabase } from '../lib/supabase';

const phases = [
  { 
    phase_number: 1, 
    title: 'Discipline Lock', 
    description: 'Journal every trade, max 2/day, no revenge', 
    target: 'Zero rule breaks for 30 days' 
  },
  { 
    phase_number: 2, 
    title: 'Consistent Profitability', 
    description: '3 consecutive profitable weeks', 
    target: 'Win rate above 55%, RR above 1.5' 
  },
  { 
    phase_number: 3, 
    title: 'Prop Firm Prep', 
    description: 'FTMO 100k challenge preparation', 
    target: 'Pass FTMO challenge rules consistently' 
  },
  { 
    phase_number: 4, 
    title: '$100k Funded', 
    description: 'Pass prop firm, get funded', 
    target: '₹83L buying power' 
  }
];

export const seedTradingSystem = async () => {
  // Check if trading_phases exists/is empty
  // Assuming the user runs the SQL in dashboard, but we ensure basic seed here
  try {
    const { data: existing } = await supabase.from('trading_phases').select('id').limit(1);
    if (existing?.length === 0) {
      await supabase.from('trading_phases').insert(phases);
    }
  } catch (err) {
    console.error('Trading seed failed:', err);
  }
};
