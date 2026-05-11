import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Settings as SettingsIcon, User, Palette, GraduationCap, 
  TrendingUp, Clock, Volume2, AlertCircle, Save,
  Monitor, Type, Target, Calendar, Award
} from 'lucide-react';

const Settings = () => {
  const { settings, updateSetting, resetData, saving } = useSettingsStore();

  const handleReset = async () => {
    if (window.confirm('CRITICAL: This will wipe all progress data (quests, trades, logs). This cannot be undone. Proceed?')) {
      await resetData();
      window.location.reload();
    }
  };

  const SettingRow = ({ label, description, children, border = true }) => (
    <div className={clsx(
      "flex items-center justify-between py-4",
      border && "border-b border-[#F5F4F0]"
    )}>
      <div className="pr-4">
        <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']">
          {label}
        </p>
        <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-0.5 max-w-[240px]">
          {description}
        </p>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ value, onToggle }) => (
    <button
      onClick={onToggle}
      className={clsx(
        'w-11 h-6 rounded-full relative transition-all shrink-0 shadow-inner',
        value ? 'bg-[#1A1A2E]' : 'bg-[#E5E0D8]'
      )}
    >
      <div className={clsx(
        'absolute top-1 w-4 h-4 rounded-full bg-white',
        'transition-all duration-200 shadow-sm',
        value ? 'left-6' : 'left-1'
      )}/>
    </button>
  );

  const Input = ({ type = 'text', value, onChange, placeholder, width = 'w-32' }) => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        "bg-[#F5F4F0] border border-transparent focus:border-[#E07B39]",
        "rounded-xl px-4 py-2 text-sm font-['Space_Mono'] text-[#1A1A2E]",
        "focus:outline-none transition-all text-right",
        width
      )}
    />
  );

  const Select = ({ value, options, onChange }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#F5F4F0] border border-transparent focus:border-[#E07B39] 
        rounded-xl px-4 py-2 text-xs font-['Space_Mono'] text-[#1A1A2E] 
        focus:outline-none transition-all cursor-pointer appearance-none text-right min-w-[140px]"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-12">
      <div className="max-w-2xl mx-auto">
        
        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon size={14} className="text-[#E07B39]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Configuration
            </p>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] 
            font-['Inter'] tracking-tight">
            Settings
          </h1>
        </div>

        {/* ── IDENTITY ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User size={14} className="text-[#1A1A2E]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Identity
            </p>
          </div>
          <SettingRow 
            label="Player Name" 
            description="How you're addressed throughout the system."
            border={false}
          >
            <Input 
              value={settings.name} 
              onChange={v => updateSetting('name', v)}
              width="w-40"
            />
          </SettingRow>
        </div>

        {/* ── APPEARANCE ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Palette size={14} className="text-[#7C3AED]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Appearance
            </p>
          </div>
          <SettingRow 
            label="System Theme" 
            description="Switch between different UI color palettes."
          >
            <Select 
              value={settings.theme}
              options={['LIGHT PROFESSIONAL', 'DARK WAR ROOM', 'MIDNIGHT BLUE', 'PAPER']}
              onChange={v => updateSetting('theme', v)}
            />
          </SettingRow>
          <SettingRow 
            label="Interface Scale" 
            description="Adjust text size for better readability."
            border={false}
          >
            <Select 
              value={settings.fontSize}
              options={['Small', 'Default', 'Large']}
              onChange={v => updateSetting('fontSize', v)}
            />
          </SettingRow>
        </div>

        {/* ── ACADEMIC & SDE ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap size={14} className="text-[#1A6B4A]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Academic & SDE
            </p>
          </div>
          <SettingRow 
            label="Current Semester" 
            description="Sets the active semester for your exam tracker."
          >
            <Input 
              type="number"
              value={settings.current_semester}
              onChange={v => updateSetting('current_semester', parseInt(v))}
              width="w-24"
            />
          </SettingRow>
          <SettingRow 
            label="Next Big Exam" 
            description="Target date for your upcoming major examination."
          >
            <Input 
              type="date"
              value={settings.exam_date}
              onChange={v => updateSetting('exam_date', v)}
              width="w-40"
            />
          </SettingRow>
          <SettingRow 
            label="LeetCode Problems" 
            description="Sync your DSA progress to your character sheet."
            border={false}
          >
            <Input 
              type="number"
              value={settings.lc_problems_solved}
              onChange={v => updateSetting('lc_problems_solved', parseInt(v))}
              width="w-24"
            />
          </SettingRow>
        </div>

        {/* ── TRADING ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={14} className="text-[#E07B39]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Trading
            </p>
          </div>
          <SettingRow 
            label="Monthly Target" 
            description="Your target profit in INR for the current month."
          >
            <div className="flex items-center gap-2 bg-[#F5F4F0] px-4 py-2 rounded-xl">
              <span className="text-xs font-bold text-[#9A9590]">₹</span>
              <input 
                type="number"
                value={settings.monthly_target_inr}
                onChange={e => updateSetting('monthly_target_inr', parseInt(e.target.value))}
                className="bg-transparent border-none text-sm font-['Space_Mono'] text-[#1A1A2E] outline-none text-right w-24"
              />
            </div>
          </SettingRow>
          <SettingRow 
            label="Prop Firm Funded" 
            description="Awards the 'Funded' badge and +1000 XP on activation."
            border={false}
          >
            <Toggle 
              value={settings.prop_firm_passed}
              onToggle={() => updateSetting('prop_firm_passed', !settings.prop_firm_passed)}
            />
          </SettingRow>
        </div>

        {/* ── SCHEDULE ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={14} className="text-[#9A9590]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              System Schedule
            </p>
          </div>
          <SettingRow 
            label="Morning Briefing" 
            description="When JARVIS generates your daily mission plan."
          >
            <Input 
              type="time"
              value={settings.morning_brief_time}
              onChange={v => updateSetting('morning_brief_time', v)}
              width="w-32"
            />
          </SettingRow>
          <SettingRow 
            label="Evening Review" 
            description="Time to finalize logs and review performance."
            border={false}
          >
            <Input 
              type="time"
              value={settings.evening_review_time}
              onChange={v => updateSetting('evening_review_time', v)}
              width="w-32"
            />
          </SettingRow>
        </div>

        {/* ── ACCESSIBILITY ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Volume2 size={14} className="text-[#1A1A2E]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              System Audio
            </p>
          </div>
          <SettingRow 
            label="Voice Feedback" 
            description="Enable audio alerts and briefing narration."
            border={false}
          >
            <Toggle 
              value={settings.voice_enabled}
              onToggle={() => updateSetting('voice_enabled', !settings.voice_enabled)}
            />
          </SettingRow>
        </div>

        {/* ── DANGER ZONE ── */}
        <div className="bg-white rounded-2xl border border-[#C0392B]/20 
          p-5 mb-12 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={14} className="text-[#C0392B]"/>
            <p className="text-[10px] font-bold text-[#C0392B] 
              font-['Space_Mono'] uppercase tracking-widest">
              Danger Zone
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1A1A2E] 
                font-['Inter']">
                Reset All Progress
              </p>
              <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-0.5">
                Clears all trades, health logs, and missions.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#C0392B] text-white rounded-xl 
                text-xs font-bold font-['Space_Mono'] uppercase 
                tracking-wider hover:bg-[#A93226] transition-all shadow-md"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ── APP FOOTER ── */}
        <div className="text-center">
          <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] 
            uppercase tracking-[0.3em]">
            PLAYER ONE · v1.0 · System by Abhishek
          </p>
        </div>

      </div>
      
      {/* ── SAVING INDICATOR ── */}
      <AnimatePresence>
        {saving && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <div className="w-2 h-2 bg-[#E07B39] rounded-full animate-ping" />
            <span className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-widest">
              Saving to Neural Net...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
