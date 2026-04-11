import { supabase } from '../lib/supabase';

export const seedHealthSystem = async () => {
  try {
    // We check if health_logs exists, otherwise we assume the user will run the SQL provided in the prompt.
    // However, I can initialize some default settings if needed.
    const { data: milestones } = await supabase.from('health_milestones').select('id').limit(1);
    if (milestones?.length === 0) {
      const defaultMilestones = [
        { phase: 2, text: 'Can do 10 proper pushups', completed: false },
        { phase: 2, text: '30min cardio without stopping', completed: false },
        { phase: 2, text: 'Consistent sleep schedule', completed: false },
        { phase: 3, text: 'Clothes fitting differently', completed: false },
        { phase: 3, text: 'Energy levels high daily', completed: false },
        { phase: 3, text: 'Zero junk weeks', completed: false },
        { phase: 4, text: 'People notice the change', completed: false },
        { phase: 4, text: 'Never miss gym 2 days in a row', completed: false },
        { phase: 4, text: 'Know your macros', completed: false },
      ];
      await supabase.from('health_milestones').insert(defaultMilestones);
    }
  } catch (err) {
    console.error('Health system init error:', err);
  }
};
