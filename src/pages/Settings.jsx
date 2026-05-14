import { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Settings as SettingsIcon, User, Palette, GraduationCap, 
  TrendingUp, Clock, Volume2, AlertCircle, Save,
  Monitor, Type, Target, Calendar, Award,
  Search, ChevronDown, ChevronUp, Bot, Brain, Heart, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  loadMemories, 
  deleteMemory, 
  resetMemory, 
  MEMORY_TYPES 
} from '../lib/globalMemory';

const CONV_TYPES = {
  jarvis_chat: { label: 'JARVIS Chat', color: '#1A1A2E' },
  morning_brief: { label: 'Morning Brief', color: '#E07B39' },
  evening_debrief: { label: 'Evening Debrief', color: '#7C3AED' },
  daily_intention: { label: 'Daily Intention', color: '#E07B39' },
  weekly_digest: { label: 'Weekly Digest', color: '#1A6B4A' },
  health_ai_tip: { label: 'Health Tip', color: '#1A6B4A' },
  health_coach: { label: 'Health Coach', color: '#1A6B4A' },
  gym_readiness: { label: 'Gym Check', color: '#E07B39' },
  explorer_topic: { label: 'Explorer Topic', color: '#7C3AED' },
  ai_track_exploration: { label: 'AI Track', color: '#1A6B4A' },
  weekly_trading_letter: { label: 'Trading Letter', color: '#E07B39' },
  weekly_review_verdict: { label: 'Weekly Verdict', color: '#1A1A2E' },
  pomodoro_session: { label: 'Pomodoro', color: '#E07B39' },
  energy_log: { label: 'Energy Log', color: '#1A6B4A' },
  mood_log: { label: 'Mood Log', color: '#7C3AED' },
  book_read: { label: 'Book Read', color: '#C0392B' },
  cluster_completion: { label: 'Cluster Complete', color: '#7C3AED' },
  prestige_roadmap: { label: 'Prestige', color: '#7C3AED' }
};

const Settings = () => {
  const { settings, updateSetting, resetData, saving } = useSettingsStore();

  // AI History State
  const [conversations, setConversations] = useState([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [convFilter, setConvFilter] = useState('all');
  const [expandedConv, setExpandedConv] = useState(null);
  const [convPage, setConvPage] = useState(0);
  const [convHasMore, setConvHasMore] = useState(true);
  const [showConvHistory, setShowConvHistory] = useState(false);

  // Global Memory State
  const [memories, setMemories] = useState([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [memFilter, setMemFilter] = useState('all');
  const [showMemoryManager, setShowMemoryManager] = useState(false);
  const [memSearch, setMemSearch] = useState('');


  const loadConversations = async (page = 0) => {
    setIsLoadingConvs(true);
    try {
      const PAGE_SIZE = 20;
      let query = supabase
        .from('ai_sessions')
        .select('id, type, session_date, user_input, ai_response, context_snapshot, created_at')
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (convFilter !== 'all') {
        query = query.eq('type', convFilter);
      }

      const { data } = await query;
      const items = data || [];

      if (page === 0) {
        setConversations(items);
      } else {
        setConversations(prev => [...prev, ...items]);
      }
      setConvHasMore(items.length === PAGE_SIZE);
      setConvPage(page);
    } catch (err) {
      console.error('loadConversations error:', err);
    }
    setIsLoadingConvs(false);
  };

  useEffect(() => {
    if (showConvHistory) loadConversations(0);
  }, [showConvHistory, convFilter]);

  const loadMemoriesData = async () => {
    setIsLoadingMemories(true);
    try {
      const type = memFilter === 'all' ? null : memFilter;
      const data = await loadMemories(type, 50);
      setMemories(data || []);
    } catch (err) {
      console.error('loadMemoriesData error:', err);
    }
    setIsLoadingMemories(false);
  };

  useEffect(() => {
    if (showMemoryManager) loadMemoriesData();
  }, [showMemoryManager, memFilter]);

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Delete this memory?')) return;
    const success = await deleteMemory(id);
    if (success) {
      setMemories(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleResetMemory = async () => {
    const typeLabel = memFilter === 'all' ? 'ALL domains' : memFilter;
    if (!window.confirm(`CRITICAL: Clear memory for ${typeLabel}? This will remove context JARVIS uses for personalization.`)) return;
    
    const success = await resetMemory(memFilter === 'all' ? null : memFilter);
    if (success) {
      setMemories([]);
      loadMemoriesData();
    }
  };

  const filteredConversations = useMemo(() => {
    if (!convSearch.trim()) return conversations;
    const q = convSearch.toLowerCase();
    return conversations.filter(c =>
      c.ai_response?.toLowerCase().includes(q) ||
      c.user_input?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q)
    );
  }, [conversations, convSearch]);

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

        {/* ── AI HISTORY ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                AI History
              </p>
              <p className="text-sm font-bold text-[#1A1A2E] 
                font-['Inter']">
                All Conversations
              </p>
            </div>
            <button
              onClick={() => setShowConvHistory(!showConvHistory)}
              className="flex items-center gap-1.5 text-[9px] font-bold
                font-['Space_Mono'] uppercase tracking-wider
                text-[#9A9590] hover:text-[#1A1A2E] transition-colors"
            >
              {showConvHistory ? (
                <><ChevronUp size={13}/> Hide</>
              ) : (
                <><ChevronDown size={13}/> Show</>
              )}
            </button>
          </div>

          {showConvHistory && (
            <div className="mt-4">
              {/* Search + Filter */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search size={13} className="absolute left-3 top-1/2 
                    -translate-y-1/2 text-[#9A9590]"/>
                  <input
                    value={convSearch}
                    onChange={e => setConvSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-2.5 bg-[#F5F4F0]
                      rounded-xl text-sm font-['Inter'] text-[#1A1A2E]
                      placeholder-[#9A9590] border border-transparent
                      focus:border-[#1A1A2E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Type filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar"
                style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setConvFilter('all')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[9px] font-bold',
                    'font-["Space_Mono"] uppercase tracking-wider',
                    'whitespace-nowrap transition-all shrink-0',
                    convFilter === 'all'
                      ? 'bg-[#1A1A2E] text-white'
                      : 'bg-[#F5F4F0] text-[#9A9590]'
                  )}
                >
                  All
                </button>
                {Object.entries(CONV_TYPES).slice(0, 10).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setConvFilter(key)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-[9px] font-bold',
                      'font-["Space_Mono"] uppercase tracking-wider',
                      'whitespace-nowrap transition-all shrink-0',
                      convFilter === key
                        ? 'text-white'
                        : 'bg-[#F5F4F0] text-[#9A9590]'
                    )}
                    style={convFilter === key 
                      ? { backgroundColor: val.color } 
                      : {}}
                  >
                    {val.label}
                  </button>
                ))}
              </div>

              {/* Conversation list */}
              {isLoadingConvs && conversations.length === 0 && (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-[#F5F4F0] 
                      rounded-xl animate-pulse"/>
                  ))}
                </div>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto 
                pr-1 no-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                {filteredConversations.map(conv => {
                  const typeInfo = CONV_TYPES[conv.type] || { 
                    label: conv.type, color: '#9A9590' 
                  }
                  const isExpanded = expandedConv === conv.id
                  
                  return (
                    <div key={conv.id}
                      className="border border-[#E5E0D8] rounded-xl 
                        overflow-hidden">
                      {/* Header row */}
                      <button
                        onClick={() => setExpandedConv(
                          isExpanded ? null : conv.id
                        )}
                        className="w-full flex items-center 
                          justify-between p-3 hover:bg-[#F5F4F0]
                          transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 
                          flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: typeInfo.color }}/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] font-bold 
                                font-['Space_Mono'] uppercase 
                                tracking-wider"
                                style={{ color: typeInfo.color }}>
                                {typeInfo.label}
                              </span>
                              <span className="text-[9px] text-[#9A9590]
                                font-['Space_Mono']">
                                {conv.session_date}
                              </span>
                            </div>
                            {conv.user_input && 
                             conv.type !== 'energy_log' &&
                             conv.type !== 'mood_log' && (
                              <p className="text-xs text-[#9A9590] 
                                font-['Inter'] truncate">
                                {conv.user_input.substring(0, 60)}
                              </p>
                            )}
                          </div>
                        </div>
                        {isExpanded 
                          ? <ChevronUp size={13} className="text-[#9A9590] shrink-0"/>
                          : <ChevronDown size={13} className="text-[#9A9590] shrink-0"/>
                        }
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t 
                          border-[#F5F4F0]">
                          {conv.user_input && 
                           conv.type !== 'energy_log' && (
                            <div className="mb-2 mt-2">
                              <p className="text-[9px] font-bold 
                                text-[#9A9590] font-['Space_Mono']
                                uppercase tracking-wider mb-1">
                                Input
                              </p>
                              <p className="text-xs text-[#1A1A2E]
                                font-['Inter'] leading-relaxed 
                                bg-[#F5F4F0] rounded-lg p-2.5">
                                {conv.user_input}
                              </p>
                            </div>
                          )}
                          {conv.ai_response && (
                            <div>
                              <p className="text-[9px] font-bold 
                                text-[#9A9590] font-['Space_Mono']
                                uppercase tracking-wider mb-1">
                                AI Response
                              </p>
                              <p className="text-xs text-[#1A1A2E]
                                font-['Inter'] leading-relaxed 
                                bg-[#F5F4F0] rounded-lg p-2.5
                                whitespace-pre-wrap max-h-48 
                                overflow-y-auto">
                                {conv.ai_response}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {filteredConversations.length === 0 && 
                 !isLoadingConvs && (
                  <div className="text-center py-8">
                    <Bot size={28} className="text-[#E5E0D8] 
                      mx-auto mb-2"/>
                    <p className="text-sm font-bold text-[#1A1A2E]
                      font-['Inter'] mb-1">
                      No conversations yet
                    </p>
                    <p className="text-xs text-[#9A9590] font-['Inter']">
                      Start using AI features across the app
                    </p>
                  </div>
                )}

                {/* Load more */}
                {convHasMore && !isLoadingConvs && (
                  <button
                    onClick={() => loadConversations(convPage + 1)}
                    className="w-full py-2.5 text-xs font-bold 
                      text-[#9A9590] font-['Space_Mono'] uppercase
                      tracking-wider hover:text-[#1A1A2E] transition-colors"
                  >
                    Load More
                  </button>
                )}
              </div>

              {/* Stats row */}
              {conversations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#E5E0D8]
                  grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1A1A2E]
                      font-['Space_Mono']">
                      {conversations.length}+
                    </p>
                    <p className="text-[9px] text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-wider">
                      Total
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#E07B39]
                      font-['Space_Mono']">
                      {new Set(conversations.map(c => c.type)).size}
                    </p>
                    <p className="text-[9px] text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-wider">
                      AI Types
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1A6B4A]
                      font-['Space_Mono']">
                      {new Set(conversations.map(c => 
                        c.session_date)).size}
                    </p>
                    <p className="text-[9px] text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-wider">
                      Days
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── GLOBAL MEMORY MANAGER ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                Global Memory
              </p>
              <p className="text-sm font-bold text-[#1A1A2E] 
                font-['Inter']">
                JARVIS Context Engine
              </p>
            </div>
            <button
              onClick={() => setShowMemoryManager(!showMemoryManager)}
              className="flex items-center gap-1.5 text-[9px] font-bold
                font-['Space_Mono'] uppercase tracking-wider
                text-[#9A9590] hover:text-[#1A1A2E] transition-colors"
            >
              {showMemoryManager ? (
                <><ChevronUp size={13}/> Hide</>
              ) : (
                <><ChevronDown size={13}/> Inspect</>
              )}
            </button>
          </div>

          {showMemoryManager && (
            <div className="mt-4">
              {/* Type filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar"
                style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setMemFilter('all')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[9px] font-bold',
                    'font-["Space_Mono"] uppercase tracking-wider',
                    'whitespace-nowrap transition-all shrink-0',
                    memFilter === 'all'
                      ? 'bg-[#1A1A2E] text-white'
                      : 'bg-[#F5F4F0] text-[#9A9590]'
                  )}
                >
                  All
                </button>
                {Object.entries(MEMORY_TYPES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setMemFilter(val)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-[9px] font-bold',
                      'font-["Space_Mono"] uppercase tracking-wider',
                      'whitespace-nowrap transition-all shrink-0',
                      memFilter === val
                        ? 'bg-[#E07B39] text-white'
                        : 'bg-[#F5F4F0] text-[#9A9590]'
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Memory List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 no-scrollbar"
                style={{ scrollbarWidth: 'thin' }}>
                {isLoadingMemories && (
                  <div className="text-center py-4">
                    <RefreshCw size={20} className="text-[#9A9590] animate-spin mx-auto"/>
                  </div>
                )}

                {!isLoadingMemories && memories.length === 0 && (
                  <div className="text-center py-8 bg-[#F5F4F0]/50 rounded-xl border border-dashed border-[#E5E0D8]">
                    <Brain size={24} className="text-[#E5E0D8] mx-auto mb-2"/>
                    <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">No memories in this domain</p>
                  </div>
                )}

                {memories.map(mem => (
                  <div key={mem.id} className="group p-3 bg-[#F5F4F0]/50 rounded-xl border border-transparent hover:border-[#E5E0D8] hover:bg-white transition-all">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold font-['Space_Mono'] uppercase px-1.5 py-0.5 rounded bg-[#1A1A2E] text-white">
                          {mem.memory_type}
                        </span>
                        <span className="text-[8px] font-bold font-['Space_Mono'] text-[#9A9590]">
                          {mem.created_at?.split('T')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={clsx("w-1 h-1 rounded-full", i < (mem.importance || 0) ? "bg-[#E07B39]" : "bg-[#E5E0D8]")}/>
                            ))}
                         </div>
                         <button 
                           onClick={() => handleDeleteMemory(mem.id)}
                           className="text-[#9A9590] hover:text-[#C0392B] transition-colors"
                         >
                           <Trash2 size={12}/>
                         </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#1A1A2E] font-['Inter'] leading-relaxed">
                      {mem.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reset memory */}
              {memories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#F5F4F0] flex justify-between items-center">
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase">
                    {memories.length} entries in context
                  </p>
                  <button 
                    onClick={handleResetMemory}
                    className="text-[9px] font-bold text-[#C0392B] font-['Space_Mono'] uppercase tracking-wider hover:underline"
                  >
                    Clear {memFilter === 'all' ? 'All' : memFilter} Memory
                  </button>
                </div>
              )}
            </div>
          )}
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
