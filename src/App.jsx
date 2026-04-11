import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import CommandCenter from './pages/CommandCenter';
import Tracker from './pages/Tracker';
import QuestLog from './pages/QuestLog';
import SDERoadmap from './pages/SDERoadmap';
import TradingRoadmap from './pages/TradingRoadmap';
import ExamMode from './pages/ExamMode';
import HealthRoadmap from './pages/HealthRoadmap';
import FinanceBooks from './pages/FinanceBooks';
import CharacterSheet from './pages/CharacterSheet';
import AIPlanner from './pages/AIPlanner';
import Pomodoro from './pages/Pomodoro';
import Settings from './pages/Settings';

import { useSettingsStore } from './store/settingsStore';
import { useXpStore } from './store/xpStore';
import { useWalletStore } from './store/walletStore';
import { useQuestStore } from './store/questStore';
import { supabase } from './lib/supabase';
import { ShieldAlert, Key } from 'lucide-react';

function App() {
  const { loadSettings } = useSettingsStore();
  const { loadPlayerState, checkStreak } = useXpStore();
  const { loadWallet } = useWalletStore();
  const { loadQuests } = useQuestStore();

  const isConfigured = !!supabase;

  useEffect(() => {
    if (!isConfigured) return;

    const initApp = async () => {
      await loadSettings();
      await Promise.all([
        loadPlayerState(),
        loadWallet(),
        loadQuests(),
        checkStreak()
      ]);
    };
    initApp();
  }, [isConfigured]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex justify-center">
            <div className="p-4 bg-rose-500/10 rounded-full">
              <ShieldAlert className="w-12 h-12 text-rose-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white mb-2 tracking-tight">CONFIGURATION REQUIRED</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your PLAYER ONE dashboard is disconnected from the neural net. Please provide your Supabase credentials to activate the Command Center.
            </p>
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-left space-y-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-navy-400 mt-1" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest">Update .env.local</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the project root.</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Deployment Stalled • System Offline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Sidebar />
      <main className="ml-[260px] flex-1 min-h-screen p-8 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto h-full">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/quests" element={<QuestLog />} />
            <Route path="/character" element={<CharacterSheet />} />
            <Route path="/sde" element={<SDERoadmap />} />
            <Route path="/trading" element={<TradingRoadmap />} />
            <Route path="/exams" element={<ExamMode />} />
            <Route path="/health" element={<HealthRoadmap />} />
            <Route path="/finance" element={<FinanceBooks />} />
            <Route path="/planner" element={<AIPlanner />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
