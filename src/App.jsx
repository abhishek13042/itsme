import React, { useEffect, useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import JarvisToast from './components/JarvisToast';
import LevelUpEvent from './components/LevelUpEvent';
import ClusterCelebration from './components/ClusterCelebration';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalSearch from './components/GlobalSearch';
const CommandCenter = React.lazy(() => import('./pages/CommandCenter'));
const Tracker = React.lazy(() => import('./pages/Tracker'));
const QuestLog = React.lazy(() => import('./pages/QuestLog'));
const SDERoadmap = React.lazy(() => import('./pages/SDERoadmap'));
const TradingRoadmap = React.lazy(() => import('./pages/TradingRoadmap'));
const ExamMode = React.lazy(() => import('./pages/ExamMode'));
const Health = React.lazy(() => import('./pages/Health'));
const FinanceBooks = React.lazy(() => import('./pages/FinanceBooks'));
const CharacterSheet = React.lazy(() => import('./pages/CharacterSheet'));
const AIPlanner = React.lazy(() => import('./pages/AIPlanner'));
const Pomodoro = React.lazy(() => import('./pages/Pomodoro'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Explorer = React.lazy(() => import('./pages/Explorer'));
const AIEngineerTrack = React.lazy(() => import('./pages/AIEngineerTrack'));
const WeeklyReview = React.lazy(() => import('./pages/WeeklyReview'));
const Goals = React.lazy(() => import('./pages/Goals'));

import { useSettingsStore } from './store/settingsStore';
import { useXpStore } from './store/xpStore';
import { useWalletStore } from './store/walletStore';
import { useQuestStore } from './store/questStore';
import { useHealthStore } from './store/healthStore';
import { useSdeStore } from './store/sdeStore';
import { useExamStore } from './store/examStore';
import { useTradingStore } from './store/tradingStore';
import { useCharacterStore } from './store/characterStore';
import { useFinanceStore } from './store/financeStore';
import { supabase } from './lib/supabase';
import { ShieldAlert, Key, Zap, Brain, Shield } from 'lucide-react';

function App() {
  const { loadSettings } = useSettingsStore();
  const { loadPlayerState, checkStreak } = useXpStore();
  const { loadWallet } = useWalletStore();
  const { loadQuests } = useQuestStore();
  const { loadHealthData } = useHealthStore();
  const { loadRoadmap } = useSdeStore();
  const { loadSemesters } = useExamStore();
  const { loadTradingData } = useTradingStore();
  const { loadCharacterData } = useCharacterStore();
  const { loadFinanceData } = useFinanceStore();
  const [systemLoading, setSystemLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Initializing neural link...');

  const isConfigured = !!supabase;

  const location = useLocation();

  useEffect(() => {
    if (!isConfigured) return;

    const initApp = async () => {
      setSystemLoading(true);
      
      const texts = [
        'Booting neural systems...',
        'Loading character stats...',
        'Syncing wallet and quests...',
        'Fetching SDE roadmap...',
        'Loading trading data...',
        'Syncing health protocol...',
        'Loading exam intel...',
        'Finalizing systems...',
        'PLAYER ONE — Online.'
      ];
      
      let i = 0;
      const textInterval = setInterval(() => {
        setLoadingText(texts[i % texts.length]);
        i++;
      }, 250);

      try {
        // Run only critical data fetches on boot
        await Promise.all([
          loadSettings(),
          loadPlayerState(),
          loadWallet(),
          checkStreak()
        ]);
      } catch (err) {
        console.error("System initialization failed:", err);
      } finally {
        clearInterval(textInterval);
        setTimeout(() => setSystemLoading(false), 200);
      }
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

  if (systemLoading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-[#1A1A2E] rounded-2xl flex items-center justify-center mb-6 shadow-xl animate-pulse">
            <Zap className="w-8 h-8 text-[#E07B39]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-[#1A1A2E] tracking-tighter uppercase mb-2">SYSTEM INITIALIZING</h2>
          <p className="font-mono text-[11px] text-[#9A9590] uppercase tracking-[0.2em]">{loadingText}</p>
          
          <div className="w-48 h-1 bg-[#E5E0D8] rounded-full mt-8 overflow-hidden">
            <motion.div 
              className="h-full bg-[#1A1A2E]"
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <JarvisToast />
      <GlobalSearch />
      <LevelUpEvent />
      <ClusterCelebration />
      <Sidebar />
      <main className="lg:ml-[260px] ml-0 flex-1 min-h-screen p-4 lg:p-8 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto h-full">
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F5F4F0]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg animate-pulse flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#E07B39]" />
                </div>
                <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
                  Loading...
                </p>
              </div>
            </div>
          }>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ height: '100%' }}
              >
                <Routes location={location}>
                  <Route path="/" element={<ErrorBoundary><CommandCenter /></ErrorBoundary>} />
                  <Route path="/tracker" element={<ErrorBoundary><Tracker /></ErrorBoundary>} />
                  <Route path="/quests" element={<ErrorBoundary><QuestLog /></ErrorBoundary>} />
                  <Route path="/character" element={<ErrorBoundary><CharacterSheet /></ErrorBoundary>} />
                  <Route path="/sde" element={<ErrorBoundary><SDERoadmap /></ErrorBoundary>} />
                  <Route path="/trading" element={<ErrorBoundary><TradingRoadmap /></ErrorBoundary>} />
                  <Route path="/exams" element={<ErrorBoundary><ExamMode /></ErrorBoundary>} />
                  <Route path="/health" element={<ErrorBoundary><Health /></ErrorBoundary>} />
                  <Route path="/finance" element={<ErrorBoundary><FinanceBooks /></ErrorBoundary>} />
                  <Route path="/planner" element={<ErrorBoundary><AIPlanner /></ErrorBoundary>} />
                  <Route path="/pomodoro" element={<ErrorBoundary><Pomodoro /></ErrorBoundary>} />
                  <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
                  <Route path="/explorer" element={<ErrorBoundary><Explorer /></ErrorBoundary>} />
                  <Route path="/ai-track" element={<ErrorBoundary><AIEngineerTrack /></ErrorBoundary>} />
                  <Route path="/weekly" element={<ErrorBoundary><WeeklyReview /></ErrorBoundary>} />
                  <Route path="/goals" element={<ErrorBoundary pageName="Goals"><Goals /></ErrorBoundary>} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
