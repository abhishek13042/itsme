import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const THEMES = {
  'LIGHT PROFESSIONAL': {
    '--bg-page': '#F5F4F0',
    '--bg-card': '#FFFFFF',
    '--text-primary': '#1A1A2E',
    '--border': '#E5E0D8'
  },
  'DARK WAR ROOM': {
    '--bg-page': '#0a0a0f',
    '--bg-card': '#12121a',
    '--text-primary': '#e2e8f0',
    '--border': '#ffffff15'
  },
  'MIDNIGHT BLUE': {
    '--bg-page': '#0f172a',
    '--bg-card': '#1e293b',
    '--text-primary': '#f1f5f9',
    '--border': '#334155'
  },
  'PAPER': {
    '--bg-page': '#fafaf5',
    '--bg-card': '#f5f0e8',
    '--text-primary': '#1c1917',
    '--border': '#d6d3d1'
  }
};

export const useSettingsStore = create((set, get) => ({
  settings: {
    name: 'Abhishek',
    monthly_target_inr: 3000,
    exam_date: '2025-04-30',
    current_semester: 5,
    trading_pairs: ['GBPUSD', 'EURUSD'],
    target_companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Atlassian', 'Razorpay', 'Zerodha'],
    theme: 'LIGHT PROFESSIONAL',
    voice_enabled: true,
    daily_reset_time: '00:00',
    morning_brief_time: '06:30',
    evening_review_time: '21:00',
    lc_problems_solved: 0,
    prop_firm_passed: false,
    withdrawal_count: 0,
    fontSize: 'Default'
  },
  loading: false,
  saving: false,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const loaded = {};
        data.forEach(s => {
          try {
            loaded[s.key] = JSON.parse(s.value);
          } catch {
            loaded[s.key] = s.value;
          }
        });
        const merged = { ...get().settings, ...loaded };
        set({ settings: merged, loading: false });
        get().applyTheme(merged.theme);
        get().applyFontSize(merged.fontSize);
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      set({ loading: false });
    }
  },

  updateSetting: async (key, value) => {
    set({ saving: true });
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await supabase.from('settings').upsert([{ key, value: stringValue }]);
      
      set(state => ({
        settings: { ...state.settings, [key]: value },
        saving: false
      }));

      // Side effects
      if (key === 'theme') get().applyTheme(value);
      if (key === 'fontSize') get().applyFontSize(value);
      if (key === 'current_semester') get().syncSemester(value);
      if (key === 'lc_problems_solved') get().syncDSAStat(value);
      if (key === 'prop_firm_passed' && value === true) get().awardFundedBadge();

    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
      set({ saving: false });
    }
  },

  syncSemester: async (semNum) => {
    // Set all to inactive, then set selected to active
    await supabase.from('semesters').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy filter to allow update
    await supabase.from('semesters').update({ is_active: true }).eq('sem_number', semNum);
  },

  syncDSAStat: async (count) => {
    // Formula: 1 problem = 1 base stat point in DSA
    await supabase.from('player_state').update({ stat_dsa: count }).eq('id', (await supabase.from('player_state').select('id').single()).data.id);
  },

  awardFundedBadge: async () => {
    const { awardXP } = await import('../lib/xpEngine');
    await supabase.from('badges').update({ earned: true, earned_at: new Date().toISOString() }).eq('badge_key', 'funded_trader');
    await awardXP(1000, 'Prop Firm Passed');
  },

  applyFontSize: (size) => {
    const sizes = { 'Small': '14px', 'Default': '16px', 'Large': '18px' };
    document.documentElement.style.fontSize = sizes[size] || '16px';
  },

  resetData: async () => {
    // Dangerous: Clear all progress-related tables but keep settings
    const tables = ['quests', 'daily_completions', 'trades', 'health_logs', 'brain_logs', 'books', 'xp_log', 'transactions', 'ai_sessions'];
    for (const table of tables) {
      await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
  },

  resetStreak: async () => {
    await supabase.from('player_state').update({ streak_days: 0, last_active_date: null }).eq('id', (await supabase.from('player_state').select('id').single()).data.id);
  }
}));
