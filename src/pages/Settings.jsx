import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  Palette, 
  User, 
  Target, 
  Bell, 
  ShieldAlert, 
  Download, 
  Trash2, 
  Smartphone, 
  Info,
  Check,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Globe,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';

const THEME_OPTIONS = [
  { 
    name: 'LIGHT PROFESSIONAL', 
    desc: 'Clean, minimal, Bloomberg-style', 
    swatch: ['bg-white', 'bg-navy-900', 'bg-slate-100'] 
  },
  { 
    name: 'DARK WAR ROOM', 
    desc: 'Dark, intense, command center', 
    swatch: ['bg-[#F5F4F0]', 'bg-violet-600', 'bg-emerald-500'] 
  },
  { 
    name: 'MIDNIGHT', 
    desc: 'Deep dark, easy on eyes at night', 
    swatch: ['bg-[#020617]', 'bg-cyan-500', 'bg-purple-600'] 
  },
  { 
    name: 'PAPER', 
    desc: 'Warm, document-style, calm', 
    swatch: ['bg-[#fafaf5]', 'bg-stone-700', 'bg-amber-600'] 
  }
];

const Settings = () => {
  const { settings, loading, loadSettings, updateSetting } = useSettingsStore();

  const [confirmInput, setConfirmInput] = useState('');
  const [resetModal, setResetModal] = useState(null); // 'streak' | 'wallet' | 'all'
  const [pwaPrompt, setPwaPrompt] = useState(null);

  useEffect(() => {
    loadSettings();
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPwaPrompt(e);
    });
  }, []);

  const handleExportData = async () => {
    const { data: allSettings } = await supabase.from('settings').select('*');
    const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player_one_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleInstallPWA = () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      pwaPrompt.userChoice.then(() => setPwaPrompt(null));
    }
  };

  const resetData = async (type) => {
    if (confirmInput !== 'CONFIRM') return;

    if (type === 'all') {
       // Deep reset logic would go here
       console.log("Full data reset triggered");
    }
    setResetModal(null);
    setConfirmInput('');
  };

  if (loading && !settings.userName) return <div className="p-8 animate-pulse text-slate-400">Loading Configuration...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">SETTINGS</h1>
      </div>

      {/* SECTION 1 — THEME */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-navy-400" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Appearance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THEME_OPTIONS.map(theme => (
            <Card 
              key={theme.name}
              onClick={() => updateSetting('theme', theme.name)}
              className={clsx(
                "p-5 cursor-pointer transition-all border-2",
                settings.theme === theme.name ? "border-navy-900 shadow-xl" : "border-slate-100 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {theme.swatch.map((bg, i) => (
                      <div key={i} className={clsx("w-8 h-8 rounded-full border-2 border-white", bg)} />
                    ))}
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{theme.name}</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{theme.desc}</p>
                 </div>
                 {settings.theme === theme.name && <Check className="w-4 h-4 text-navy-900" />}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 2 — PERSONAL TARGETS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-navy-400" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Your Targets</h2>
        </div>

        <Card className="p-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                 <input 
                  value={settings.userName}
                  onChange={(e) => updateSetting('userName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Budget (₹)</label>
                 <input 
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => updateSetting('monthlyBudget', parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Major Exam Date</label>
                 <input 
                  type="date"
                  value={settings.examDate}
                  onChange={(e) => updateSetting('examDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Reset Time</label>
                 <input 
                  type="time"
                  value={settings.resetTime}
                  onChange={(e) => updateSetting('resetTime', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                 />
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 flex justify-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Settings auto-save on change</p>
           </div>
        </Card>
      </section>

      {/* SECTION 3 — NOTIFICATIONS */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-navy-400" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Reminders</h2>
        </div>

        <Card className="p-0 overflow-hidden">
           <div className="divide-y divide-slate-50">
             {[
               { id: 'morningPlan', label: "Morning Plan Reminder", sub: "6:30 AM — Generate today's battle plan" },
               { id: 'eveningReview', label: "Evening Review Reminder", sub: "9:00 PM — Do your honest evening review" },
               { id: 'streakWarning', label: "Streak Warning", sub: "8:00 PM alert if dailies are unfinished" },
               { id: 'examCountdown', label: "Daily Exam Countdown", sub: "Morning notification of days remaining" },
             ].map(n => (
               <div key={n.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{n.label}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">{n.sub}</p>
                  </div>
                  <button 
                    onClick={() => updateSetting('notifications', { ...settings.notifications, [n.id]: !settings.notifications[n.id] })}
                    className={clsx(
                      "w-12 h-6 rounded-full transition-all relative",
                      settings.notifications[n.id] ? "bg-navy-900" : "bg-slate-200"
                    )}
                  >
                    <div className={clsx(
                      "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                      settings.notifications[n.id] ? "right-1" : "left-1"
                    )} />
                  </button>
               </div>
             ))}
           </div>
        </Card>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
          Push notifications require "Add to homescreen" as PWA
        </p>
      </section>

      {/* SECTION 4 — DATA & RESET */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-navy-400" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Data & Reset</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Export Backup</h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Download a full JSON archive of your entire dashboard state.</p>
            <Button onClick={handleExportData} variant="ghost" className="w-full border-slate-200 uppercase tracking-widest text-[10px] font-bold">
              <Download className="w-4 h-4 mr-2" /> Export to JSON
            </Button>
          </Card>

          <Card className="p-6 border-rose-100 bg-rose-50/50">
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </h3>
            <div className="space-y-3">
               <button onClick={() => setResetModal('streak')} className="w-full py-2.5 rounded-xl border border-rose-200 bg-white text-rose-600 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">Reset Current Streak</button>
               <button onClick={() => setResetModal('all')} className="w-full py-2.5 rounded-xl border border-rose-600 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all">Clear All App Data</button>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 5 — PWA INSTALL */}
      <section className="space-y-6">
         <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-navy-400" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Install App</h2>
        </div>
        <Card className="p-8 text-center bg-navy-900 text-white border-none shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-transparent opacity-50" />
           <div className="relative z-10 flex flex-col items-center">
             <Smartphone className="w-12 h-12 text-navy-400 mb-6" />
             <h3 className="text-xl font-display font-bold mb-2">Install PLAYER ONE</h3>
             <p className="text-navy-300 text-xs font-medium mb-8 max-w-sm">Access your command center faster and get real-time notifications by adding it to your home screen.</p>
             <Button onClick={handleInstallPWA} className="px-10 h-12 bg-white text-navy-900 border-none hover:bg-slate-100 tracking-widest uppercase">
               Install Now
             </Button>
             
             <div className="mt-8 pt-8 border-t border-navy-800 w-full flex justify-center gap-8">
               <div className="text-center">
                 <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">iOS Instructions</p>
                 <p className="text-[9px] text-navy-500 font-medium">Share Icon (↑) → Add to HomeScreen</p>
               </div>
             </div>
           </div>
        </Card>
      </section>

      {/* SECTION 6 — ABOUT */}
      <section className="pt-12 border-t border-slate-100 flex flex-col items-center text-center space-y-4">
        <div className="flex gap-6">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supabase Connected</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini Linked</span>
           </div>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
           <p className="text-[10px] font-bold uppercase tracking-widest">PLAYER ONE v1.0.4</p>
           <span className="text-[10px]">•</span>
           <p className="text-[10px] font-bold uppercase tracking-widest">Updated April 10, 2026</p>
        </div>
      </section>

      {/* Reset Modal Overlay */}
      <AnimatePresence>
        {resetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setResetModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center"
            >
               <h3 className="text-xl font-display font-bold text-rose-600 mb-2 uppercase">Destructive Action</h3>
               <p className="text-xs text-slate-500 font-medium mb-8">
                 This action cannot be undone. Type <span className="font-bold text-slate-900">CONFIRM</span> below to proceed.
               </p>
               <input 
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type CONFIRM here..."
                className="w-full bg-slate-50 border border-rose-100 rounded-xl px-4 py-3 text-sm font-bold text-center mb-6"
               />
               <div className="flex gap-4">
                  <Button onClick={() => setResetModal(null)} variant="ghost" className="flex-1 uppercase font-bold text-[10px]">Cancel</Button>
                  <Button 
                    onClick={() => resetData(resetModal)}
                    disabled={confirmInput !== 'CONFIRM'}
                    className={clsx(
                      "flex-1 uppercase font-bold text-[10px] border-none text-white",
                      confirmInput === 'CONFIRM' ? "bg-rose-600 shadow-xl" : "bg-slate-300"
                    )}
                  >
                    Proceed
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;
