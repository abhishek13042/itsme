import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const THEMES = {
  'LIGHT PROFESSIONAL': {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f8fafc',
    '--bg-tertiary': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#64748b',
    '--border-color': '#e2e8f0',
    '--accent': '#1e3a5f',
    '--card-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  },
  'DARK WAR ROOM': {
    '--bg-primary': '#F5F4F0',
    '--bg-secondary': '#FFFFFF',
    '--bg-tertiary': '#1a1a2e',
    '--text-primary': '#e2e8f0',
    '--text-secondary': '#94a3b8',
    '--border-color': 'rgba(255,255,255,0.08)',
    '--accent': '#1A1A2E',
    '--card-shadow': '0 10px 15px -3px rgb(0 0 0 / 0.5)'
  },
  'MIDNIGHT': {
    '--bg-primary': '#020617',
    '--bg-secondary': '#0f172a',
    '--bg-tertiary': '#1e293b',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--border-color': '#334155',
    '--accent': '#06b6d4',
    '--card-shadow': '0 4px 12px 0 rgba(0,0,0,0.5)'
  },
  'PAPER': {
    '--bg-primary': '#fafaf5',
    '--bg-secondary': '#f5f5f0',
    '--bg-tertiary': '#f0f0e8',
    '--text-primary': '#2d2d2a',
    '--text-secondary': '#78716c',
    '--border-color': '#e7e5e4',
    '--accent': '#b45309',
    '--card-shadow': '0 2px 4px 0 rgba(0,0,0,0.05)'
  }
};

export const useSettingsStore = create((set, get) => ({
  settings: {
    theme: 'LIGHT PROFESSIONAL',
    userName: 'ABHISHEK',
    monthlyBudget: 3000,
    examDate: '2025-04-30',
    resetTime: '00:00',
    tradingPairs: ['XAUUSD', 'GBPUSD'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Atlassian', 'Razorpay', 'Zerodha'],
    notifications: {
      morningPlan: true,
      eveningReview: true,
      streakWarning: true,
      examCountdown: true
    }
  },
  loading: false,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const loadedSettings = {};
        data.forEach(s => {
          try {
             loadedSettings[s.key] = JSON.parse(s.value);
          } catch {
             loadedSettings[s.key] = s.value;
          }
        });
        
        const newSettings = { ...get().settings, ...loadedSettings };
        set({ settings: newSettings, loading: false });
        get().applyTheme(newSettings.theme);
      } else {
        set({ loading: false });
        get().applyTheme(get().settings.theme);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      set({ loading: false });
    }
  },

  updateSetting: async (key, value) => {
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await supabase.from('settings').upsert([{ key, value: stringValue }]);
      
      set(state => ({
        settings: { ...state.settings, [key]: value }
      }));

      if (key === 'theme') {
        get().applyTheme(value);
      }
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
    }
  },

  applyTheme: (themeName) => {
    const theme = THEMES[themeName] || THEMES['LIGHT PROFESSIONAL'];
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }
}));
