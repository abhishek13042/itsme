import { supabase } from '../lib/supabase';

const subjects = [
  { name: 'Operating Systems', short_name: 'OS', readiness: 0, color: '#C0392B' },
  { name: 'Design & Analysis of Algorithms', short_name: 'DAA', readiness: 0, color: '#1A1A2E' },
  { name: 'Machine Learning', short_name: 'ML', readiness: 0, color: '#7C3AED' },
  { name: 'Software Engineering', short_name: 'SE', readiness: 0, color: '#1A6B4A' },
  { name: 'Database Management Systems', short_name: 'DBMS', readiness: 0, color: '#E07B39' },
  { name: 'Digital Hardware & VLSI', short_name: 'DHV', readiness: 0, color: '#D97706' },
];

export const seedExamSystem = async () => {
  try {
    const { data: existing } = await supabase.from('exam_subjects').select('id').limit(1);
    if (existing?.length === 0) {
      await supabase.from('exam_subjects').insert(subjects);
    }
    
    // Ensure exam_date setting exists
    const { data: dateSetting } = await supabase.from('settings').select('*').eq('key', 'exam_date').single();
    if (!dateSetting) {
      await supabase.from('settings').insert([{ key: 'exam_date', value: '2025-04-30' }]);
    }
  } catch (err) {
    console.error('Exam seed error:', err);
  }
};
