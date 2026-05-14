import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkDrawdown } from '../lib/drawdownDetector';
import { X } from 'lucide-react';
import TradeChecklist from '../components/TradeChecklist';
import { useTradingStore } from '../store/tradingStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { getTodayIST } from '../lib/dateUtils';
import { loadMemories, saveMemory, MEMORY_TYPES } from '../lib/globalMemory'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Target, 
  PlusCircle, 
  Lock, 
  Image as ImageIcon,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { clsx } from 'clsx';

console.log("TRADING TERMINAL V2.1 LOADED");

const TradingRoadmap = () => {
  const { 
    trades, 
    phases, 
    journalEntries, 
    moneyEntries, 
    withdrawals, 
    loading, 
    isLoading,
    tradesHasMore,
    loadTradingData, 
    loadMoreTrades,
    logTrade, 
    addJournalEntry,
    addMoneyEntry,
    logWithdrawal,
    updatePhase 
  } = useTradingStore();

  const [activeTab, setActiveTab] = useState('GBPUSD');
  const [direction, setDirection] = useState('LONG');
  const [form, setForm] = useState({
    htf_bias: 'NEUTRAL',
    ltr_entry_reason: 'FVG',
    ict_concept: '',
    rules_followed: 'YES',
    mistake: '',
    notes: '',
    screenshot_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeSession, setTradeSession] = useState('london');
  const [weeklyLetter, setWeeklyLetter] = useState(null);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterLoaded, setLetterLoaded] = useState(false);
  const [drawdownAlert, setDrawdownAlert] = useState(null);
  const [drawdownChecked, setDrawdownChecked] = useState(false);

  const tvContainerRef = useRef(null);

  useEffect(() => {
    if (!trades?.length) loadTradingData();
  }, []);

  useEffect(() => {
    const loadLetter = async () => {
      const { data } = await supabase
        .from('ai_sessions')
        .select('ai_response, session_date')
        .eq('type', 'weekly_trading_letter')
        .order('session_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data) setWeeklyLetter(data)
      setLetterLoaded(true)
    }
    loadLetter()
  }, [])

  useEffect(() => {
    checkDrawdown(supabase)
      .then(alert => {
        setDrawdownAlert(alert)
        setDrawdownChecked(true)
      })
      .catch(() => setDrawdownChecked(true))
  }, [trades])

  // TradingView Widget initialization
  useEffect(() => {
    if (window.TradingView && tvContainerRef.current) {
      new window.TradingView.widget({
        container_id: "tv-chart",
        symbol: activeTab === 'NASDAQ' ? 'NASDAQ:NDX' : `FX:${activeTab}`,
        interval: "15",
        theme: "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#F5F4F0",
        enable_publishing: false,
        hide_side_toolbar: false,
        width: "100%",
        height: 420
      });
    }
  }, [activeTab]);

  const activePhase = useMemo(() => {
    return phases.find(p => !p.completed) || phases[phases.length - 1];
  }, [phases]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysTrades = trades.filter(t => t.date === today).length;
    const wins = trades.filter(t => (t.pnl || 0) > 0).length;
    const ruleYes = trades.filter(t => t.rules_followed === 'YES').length;
    const compliance = trades.length > 0 ? (ruleYes / trades.length * 100).toFixed(0) : 0;
    const netPnl = trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);

    // Streak logic
    let streak = 0;
    const sortedTrades = [...trades].sort((a,b) => new Date(b.date) - new Date(a.date));
    for (let t of sortedTrades) {
      if (t.rules_followed === 'YES') streak++;
      else break;
    }

    return { todaysTrades, wins, compliance, netPnl, streak };
  }, [trades]);

  const sessionStats = useMemo(() => {
    const sessions = ['london', 'new_york', 'asian', 'overlap']
    return sessions.map(session => {
      const sessionTrades = trades.filter(t => t.session === session)
      if (sessionTrades.length === 0) return null
      const wins = sessionTrades.filter(t => parseFloat(t.pnl) > 0).length
      const winRate = Math.round((wins / sessionTrades.length) * 100)
      const totalPnl = sessionTrades
        .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0)
      return { 
        session, 
        tradesCount: sessionTrades.length, 
        winRate, 
        totalPnl: Math.round(totalPnl * 100) / 100 
      }
    }).filter(Boolean)
  }, [trades])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `trades/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(filePath);

      setForm({ ...form, screenshot_url: publicUrl });
      setPreviewUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (stats.todaysTrades >= 3) return;
    
    setIsSubmitting(true);
    try {
      await logTrade({
        ...form,
        date: new Date().toISOString().split('T')[0],
        pair: activeTab,
        direction,
        session: tradeSession,
        pnl: 0, // Placeholder
        rules_score: checklistData?.rulesScore || null,
        checklist_passed: checklistData 
          ? Object.values(checklistData.checklist).filter(Boolean).length >= 4 
          : null
      });
      setChecklistData(null);
      setShowTradeForm(false);
      setForm({
        htf_bias: 'NEUTRAL',
        ltr_entry_reason: 'FVG',
        ict_concept: '',
        rules_followed: 'YES',
        mistake: '',
        notes: '',
        screenshot_url: ''
      });
      setPreviewUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWeeklyLetter = async () => {
    setIsGeneratingLetter(true)
    try {
      let tradingHistory = ''
      try {
        const tradingMemory = await loadMemories(MEMORY_TYPES.TRADING, 8)
        tradingHistory = tradingMemory.map(m => m.content).join('\n- ')
      } catch (memErr) {
        console.error('Failed to load trading memory:', memErr)
      }

      const { callGroq } = await import('../lib/groq')


      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      const fromDate = weekStart.toISOString().split('T')[0]

      const { data: weekTrades } = await supabase
        .from('trades')
        .select('*')
        .gte('date', fromDate)

      const wins = (weekTrades || []).filter(t => 
        parseFloat(t.pnl) > 0).length
      const losses = (weekTrades || []).filter(t => 
        parseFloat(t.pnl) < 0).length
      const totalPnl = (weekTrades || [])
        .reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0)
      const rulesViolations = (weekTrades || []).filter(t => 
        t.rules_followed === 'NO').length

      const result = await callGroq({
        messages: [{
          role: 'user',
          content: `Write a weekly trading performance letter 
          for Abhishek. He trades GBPUSD, EURUSD, XAUUSD 
          using ICT/SMC framework.
          
          This week:
          - Trades: ${weekTrades?.length || 0}
          - Wins: ${wins}, Losses: ${losses}
          - Total PnL: ${Math.round(totalPnl * 100) / 100}
          - Rules violations: ${rulesViolations}
          
          Write exactly 1 paragraph. Style: brutal honest 
          fund manager letter to himself. No fluff. 
          Reference specific numbers. End with one action 
          for next week. Max 120 words.
          
          ${tradingHistory ? `
          PAST PERFORMANCE HISTORY:
          - ${tradingHistory}

          Reference how this week compares to past performance.
          Identify recurring mistakes or positive trends.
          ` : ''}`
        }],
        max_tokens: 300,
        temperature: 0.8
      })

      if (!result.error) {
        const today = getTodayIST()
        await supabase.from('ai_sessions').insert({
          type: 'weekly_trading_letter',
          session_date: today,
          ai_response: result.text,
          user_input: `trades:${weekTrades?.length || 0}`,
          context_snapshot: JSON.stringify({ 
            wins, losses, totalPnl, rulesViolations 
          })
        })
        setWeeklyLetter({ 
          ai_response: result.text, 
          session_date: today 
        })

        saveMemory({
          type: MEMORY_TYPES.TRADING,
          content: `Weekly trading verdict: ${result.text.substring(0, 200)}`,
          source: 'weekly_letter',
          importance: 8
        })
      }

    } catch (err) {
      console.error('letter error:', err)
    }
    setIsGeneratingLetter(false)
  }

  const isNYSession = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const timeInMinutes = hours * 60 + minutes;
    return timeInMinutes >= (13 * 60 + 30) && timeInMinutes <= (22 * 60 + 30);
  };

  if (isLoading && !trades?.length) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-[#F5F4F0] animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-48 bg-[#F5F4F0] animate-pulse rounded-2xl" />
        </div>
        <div className="h-96 bg-[#F5F4F0] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] tracking-tight">Trading Journal</h1>
          <p className="text-[12px] font-body font-medium text-[#9A9590] uppercase tracking-wider mt-1">
            GBPUSD · EURUSD · {activePhase?.title || 'TAPE READING'} PHASE
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#1A1A2E] text-[#E07B39] font-mono text-[12px] px-4 py-2 rounded-lg flex flex-col items-center">
             <span className="opacity-60 text-[10px]">CURRENT PHASE</span>
             <span className="font-bold uppercase">{activePhase?.title}</span>
          </div>

          <div className="border border-[#E5E0D8] bg-white px-4 py-2 rounded-full flex items-center gap-2">
            <div className={clsx("w-2 h-2 rounded-full", isNYSession() ? "bg-[#1A6B4A] animate-pulse" : "bg-[#7A7A7A]")} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isNYSession() ? 'NY SESSION LIVE' : 'MARKET CLOSED'}
            </span>
          </div>
        </div>
      </header>

      {drawdownChecked && drawdownAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 mb-4 border-2
            ${drawdownAlert.alertLevel === 'critical'
              ? 'bg-[#C0392B]/10 border-[#C0392B]'
              : 'bg-[#E07B39]/10 border-[#E07B39]'}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">
              {drawdownAlert.alertLevel === 'critical' ? '🚨' : '⚠️'}
            </span>
            <div className="flex-1">
              <p className="text-[9px] font-bold font-['Space_Mono']
                uppercase tracking-widest mb-1"
                style={{ 
                  color: drawdownAlert.alertLevel === 'critical' 
                    ? '#C0392B' : '#E07B39' 
                }}>
                {drawdownAlert.alertLevel === 'critical' 
                  ? 'Critical Drawdown Alert' 
                  : 'Risk Warning'}
              </p>
              <p className="text-sm font-bold text-[#1A1A2E] 
                font-['Inter'] mb-1">
                {drawdownAlert.message}
              </p>
              <p className="text-xs text-[#1A1A2E] font-['Inter']
                font-bold">
                → {drawdownAlert.action}
              </p>
              {drawdownAlert.maxDrawdown > 0 && (
                <p className="text-[10px] text-[#9A9590] 
                  font-['Space_Mono'] mt-2 uppercase tracking-wider">
                  30d max drawdown: {drawdownAlert.maxDrawdown}
                </p>
              )}
            </div>
            <button
              onClick={() => setDrawdownAlert(null)}
              className="text-[#9A9590] hover:text-[#1A1A2E] shrink-0"
            >
              <X size={16}/>
            </button>
          </div>
        </motion.div>
      )}

      {/* SECTION 1 — PHASE TRACKER */}
      <Card className="mb-10 !p-7 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 w-full flex items-center justify-between relative px-4">
          <div className="absolute top-5 inset-x-12 h-[2px] bg-[#E5E0D8]" />
          {phases.slice(0, 3).map((p, idx) => {
            const isCompleted = p.completed;
            const isActive = activePhase?.id === p.id;
            return (
              <div key={p.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                  isCompleted ? "bg-[#1A6B4A] border-[#1A6B4A] text-white" : 
                  isActive ? "bg-[#1A1A2E] border-[#1A1A2E]" : "bg-white border-[#E5E0D8]"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                   isActive ? <div className="w-2 h-2 rounded-full bg-[#E07B39]" /> : null}
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-[#7A7A7A] uppercase">{p.title}</p>
                  <p className="text-[10px] font-mono text-[#7A7A7A]">Month {idx + 1}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="min-w-[280px] space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[13px] font-mono font-bold text-[#1A1A2E]">DAY {stats.todaysTrades} OF 60</span>
            <span className="text-[10px] font-bold text-[#7A7A7A]">60% TO NEXT PHASE</span>
          </div>
          <ProgressBar value={60} color="navy" height="4px" />
        </div>
      </Card>

      {/* SECTION 2 — STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'SESSIONS LOGGED', value: trades.length, sub: 'tape reading sessions' },
          { label: 'TRADE IDEAS', value: stats.todaysTrades, sub: 'marked on chart today', highlight: stats.todaysTrades > 0 },
          { label: 'JOURNAL STREAK', value: `${stats.streak} days`, sub: 'consecutive days logged', highlight: stats.streak > 7 },
          { label: 'RULE COMPLIANCE', value: `${stats.compliance}%`, sub: 'last 30 entries', color: stats.compliance > 80 ? 'emerald' : stats.compliance < 60 ? 'crimson' : 'navy' },
          { label: 'NET P&L (USD)', value: `$${stats.netPnl.toLocaleString()}`, sub: 'withdrawn — fees', color: stats.netPnl >= 0 ? 'emerald' : 'crimson' },
        ].map((stat, i) => (
          <Card key={i} className={clsx(
            "!p-6 transition-all duration-200 hover:border-[#E07B39]",
            stat.highlight && "border-l-[3px] border-l-[#E07B39]"
          )}>
            <p className="text-[10px] font-bold text-[#7A7A7A] uppercase tracking-wider">{stat.label}</p>
            <p className={clsx(
              "text-[24px] font-mono font-bold mt-2",
              stat.color === 'emerald' ? "text-[#1A6B4A]" : stat.color === 'crimson' ? "text-[#8B2635]" : "text-[#1A1A2E]"
            )}>{stat.value}</p>
            <p className="text-[12px] text-[#7A7A7A] mt-1">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* SECTION 3 — MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CHART SUB-SECTION */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
               <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em]">Market Chart</p>
               <div className="flex gap-4 border-b border-[#E5E0D8]">
                  {['GBPUSD', 'EURUSD', 'NASDAQ'].map(pair => (
                    <button 
                      key={pair}
                      onClick={() => setActiveTab(pair)}
                      className={clsx(
                        "pb-2 px-4 text-[13px] transition-all",
                        activeTab === pair ? "font-bold text-[#1A1A2E] border-b-2 border-[#E07B39]" : "text-[#7A7A7A] border-b-2 border-transparent"
                      )}
                    >
                      {pair === 'NASDAQ' ? (
                        <div className="flex items-center gap-2">
                          NASDAQ <span className="text-[9px] bg-[#E5E0D8] px-1.5 py-0.5 rounded leading-none text-[#7A7A7A]">OBSERVE</span>
                        </div>
                      ) : pair}
                    </button>
                  ))}
               </div>
            </div>
            
            <Card className="!p-0 overflow-hidden !rounded-xl border-[#E5E0D8]">
              <div id="tv-chart" ref={tvContainerRef} className="w-full bg-white h-[420px]" />
            </Card>
          </section>

          {/* LOG FORM SUB-SECTION */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em]">Log This Setup</p>
                <p className="text-[12px] text-[#7A7A7A]">Max 3 entries per day</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A2E]">Today: {stats.todaysTrades} / 3 ENTRIES</span>
                <div className="flex gap-1.5">
                  {[1,2,3].map(i => (
                    <div key={i} className={clsx("w-2 h-2 rounded-full", i <= stats.todaysTrades ? "bg-[#1A1A2E]" : "border border-[#1A1A2E]")} />
                  ))}
                </div>
              </div>
            </div>

            {activeTab === 'NASDAQ' ? (
              <Card className="bg-[#E5E0D8]/10 border-dashed !p-12 text-center">
                <Lock className="w-8 h-8 text-[#7A7A7A] mx-auto mb-4" />
                <p className="text-[14px] font-bold text-[#7A7A7A] uppercase tracking-wider underline decoration-[#E07B39]">Observe only — no logging for NASDAQ</p>
                <p className="text-[12px] text-[#7A7A7A] mt-2">Use this chart to understand macro direction only.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {showChecklist && !showTradeForm && (
                  <TradeChecklist
                    onComplete={(data) => {
                      setChecklistData(data)
                      setShowChecklist(false)
                      setShowTradeForm(true)
                    }}
                    onSkip={() => {
                      setChecklistData(null)
                      setShowChecklist(false)
                      setShowTradeForm(true)
                    }}
                  />
                )}

                {!showChecklist && !showTradeForm && (
                  <Card className="!p-12 text-center border-dashed">
                    <PlusCircle className="w-8 h-8 text-[#E07B39] mx-auto mb-4" />
                    <button 
                      onClick={() => {
                        setShowChecklist(true)
                        setShowTradeForm(false)
                        setChecklistData(null)
                      }}
                      className="bg-[#1A1A2E] text-white px-8 py-3 rounded-xl font-bold font-['Space_Mono'] uppercase tracking-widest hover:bg-[#2a2a4e] transition-all"
                    >
                      Log New Setup
                    </button>
                    <p className="text-[12px] text-[#7A7A7A] mt-4 uppercase font-bold tracking-wider">
                      Verify your rules before executing
                    </p>
                  </Card>
                )}

                {showTradeForm && (
                  <Card className={clsx("!p-8", stats.todaysTrades >= 3 && "opacity-50 grayscale pointer-events-none")}>
                <form onSubmit={handleSaveEntry} className="space-y-10">
                  <div className="grid grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#7A7A7A] uppercase">Current Pair</span>
                      <span className="text-[16px] font-bold font-mono text-[#1A1A2E]">{activeTab}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-[#7A7A7A] uppercase">Trade Direction</span>
                      <div className="flex overflow-hidden rounded-full border border-[#E5E0D8] h-12">
                        <button 
                          type="button"
                          onClick={() => setDirection('LONG')}
                          className={clsx(
                            "flex-1 text-[11px] font-bold tracking-widest transition-all",
                            direction === 'LONG' ? "bg-[#1A6B4A] text-white" : "bg-[#F5F4F0] text-[#7A7A7A]"
                          )}
                        >LONG</button>
                        <button 
                          type="button"
                          onClick={() => setDirection('SHORT')}
                          className={clsx(
                            "flex-1 text-[11px] font-bold tracking-widest transition-all",
                            direction === 'SHORT' ? "bg-[#8B2635] text-white" : "bg-[#F5F4F0] text-[#7A7A7A]"
                          )}
                        >SHORT</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#7A7A7A]
                      font-['Space_Mono'] uppercase tracking-widest mb-3">
                      Trading Session
                    </p>
                    <div className="flex gap-2">
                      {['london', 'new_york', 'asian', 'overlap'].map(session => (
                        <button
                          key={session}
                          type="button"
                          onClick={() => setTradeSession(session)}
                          className={`flex-1 py-3 rounded-xl text-[10px] 
                            font-bold font-['Space_Mono'] uppercase tracking-wider
                            transition-all border
                            ${tradeSession === session
                              ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                              : 'bg-[#F5F4F0] text-[#7A7A7A] border-[#E5E0D8]'}`}
                        >
                          {session === 'new_york' ? 'NY' 
                            : session === 'overlap' ? 'OL'
                            : session.charAt(0).toUpperCase() + session.slice(1,3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-[#7A7A7A] uppercase">HTF Bias</label>
                      <div className="flex gap-2">
                        {['BULLISH', 'NEUTRAL', 'BEARISH'].map(b => (
                          <button 
                            key={b}
                            type="button"
                            onClick={() => setForm({...form, htf_bias: b})}
                            className={clsx(
                              "flex-1 py-2 text-[9px] font-bold rounded-md border transition-all",
                              form.htf_bias === b ? "bg-[#1A1A2E] text-white border-[#1A1A2E]" : "border-[#E5E0D8] text-[#7A7A7A]"
                            )}
                          >{b}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 text-[#7A7A7A]">
                      <label className="text-[10px] font-bold uppercase">LTF Entry Reason</label>
                      <select 
                        value={form.ltr_entry_reason}
                        onChange={e => setForm({...form, ltr_entry_reason: e.target.value})}
                        className="w-full h-10 border border-[#E5E0D8] rounded-md px-3 text-[12px] font-medium focus:border-[#1A1A2E] outline-none"
                      >
                        {['FVG', 'Order Block', '3CS', 'BOS', 'CHOCH', 'Inducement', 'Other'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-[#7A7A7A] uppercase">ICT Concept Used</label>
                       <input 
                         placeholder="e.g. Asian range + FVG fill"
                         value={form.ict_concept}
                         onChange={e => setForm({...form, ict_concept: e.target.value})}
                         className="w-full h-11 border border-[#E5E0D8] rounded-md px-4 text-[13px] focus:border-[#1A1A2E] outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-[#7A7A7A] uppercase text-[#7A7A7A]">Rules Followed</label>
                       <div className="flex gap-2">
                          {['YES', 'PARTIAL', 'NO'].map(r => (
                            <button 
                              key={r}
                              type="button"
                              onClick={() => setForm({...form, rules_followed: r})}
                              className={clsx(
                                "flex-1 py-2 text-[9px] font-bold rounded-md border transition-all",
                                form.rules_followed === r 
                                  ? (r === 'YES' ? "bg-[#1A6B4A] text-white border-[#1A6B4A]" : r === 'PARTIAL' ? "bg-[#E07B39] text-[#1A1A2E] border-[#E07B39]" : "bg-[#8B2635] text-white border-[#8B2635]") 
                                  : "border-[#E5E0D8] text-[#7A7A7A]"
                              )}
                            >{r}</button>
                          ))}
                       </div>
                    </div>
                  </div>

                  {(form.rules_followed === 'PARTIAL' || form.rules_followed === 'NO') && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-[#7A7A7A] uppercase">What went wrong</label>
                      <textarea 
                        rows={2}
                        placeholder="Be specific. This is your edge data."
                        value={form.mistake}
                        onChange={e => setForm({...form, mistake: e.target.value})}
                        className="w-full border-l-4 border-[#E07B39] border-y border-r border-[#E5E0D8] rounded-md px-4 py-3 text-[13px] outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#7A7A7A] uppercase">Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="What did the tape show you? What did price do before this setup formed?"
                      value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})}
                      className="w-full border border-[#E5E0D8] rounded-md px-4 py-3 text-[13px] outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#7A7A7A] uppercase">Chart Screenshot</label>
                    <div className="relative border-2 border-dashed border-[#E5E0D8] rounded-xl h-24 flex flex-col items-center justify-center transition-colors hover:bg-[#F5F4F0]">
                       <input 
                         type="file"
                         accept="image/*"
                         onChange={handleFileUpload}
                         className="absolute inset-0 opacity-0 cursor-pointer"
                       />
                       {previewUrl ? (
                         <img src={previewUrl} className="h-full w-full object-cover rounded-xl" alt="Preview" />
                       ) : (
                         <>
                           <ImageIcon className="w-5 h-5 text-[#7A7A7A] mb-1" />
                           <span className="text-[12px] text-[#7A7A7A] font-medium">{uploading ? 'UPLOADING...' : 'Drop screenshot or click to upload'}</span>
                         </>
                       )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={stats.todaysTrades >= 3 || isSubmitting}
                    className="w-full h-[52px] bg-[#1A1A2E] text-white rounded-xl font-bold text-[14px] uppercase tracking-widest flex items-center justify-center gap-4 transition-all hover:bg-[#2D4270] disabled:bg-[#7A7A7A] disabled:opacity-50"
                  >
                    SAVE ENTRY
                    <span className={clsx(
                      "text-[10px] px-2 py-0.5 rounded",
                      form.rules_followed === 'NO' ? "bg-[#8B2635]" : "bg-[#E07B39] text-[#1A1A2E]"
                    )}>
                      {form.rules_followed === 'NO' ? '-20 XP PENALTY' : '+30 XP'}
                    </span>
                  </button>
                </form>
              </Card>
              )}
            </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* EQUITY CURVE */}
          <Card className="!p-6">
            <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em] mb-6">Equity Curve</p>
            {trades.length > 0 ? (
               <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={equityData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E0D8" />
                   <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#7A7A7A' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#7A7A7A' }} tickFormatter={(val) => `$${val}`} />
                   <RechartsTooltip 
                    contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'Space Mono', fontSize: '11px' }}
                   />
                   <Area type="monotone" dataKey="balance" stroke="#1A1A2E" strokeWidth={2} fill="#1A1A2E" fillOpacity={0.05} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
            ) : (
              <div className="h-48 border-2 border-dashed border-[#E5E0D8] rounded-xl flex items-center justify-center text-center p-6 bg-[#F5F4F0]/50">
                <p className="text-[12px] text-[#7A7A7A] font-medium leading-relaxed italic">Equity curve appears after first entries</p>
              </div>
            )}
          </Card>

          {/* MONEY TRACKER */}
          <section className="space-y-4">
             <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em]">Account</p>
             <Card className="!p-0 overflow-hidden">
                {!activePhase?.title?.includes('FUNDED') ? (
                  <div className="!p-8 text-center bg-[#E5E0D8]/10">
                    <Lock className="w-6 h-6 text-[#7A7A7A] mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-[#7A7A7A] uppercase">Activates when funded account begins</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-medium text-[#7A7A7A]">Current Balance</span>
                      <span className="text-[18px] font-mono font-bold">$XX,XXX</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-[#7A7A7A] uppercase">Profit Target</span>
                         <span className="text-[#1A6B4A]">$X,XXX / $10,000</span>
                       </div>
                       <ProgressBar value={40} color="emerald" height="6px" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E5E0D8]">
                       <div>
                         <p className="text-[9px] font-bold text-[#7A7A7A] uppercase mb-1">Daily Loss Remaining</p>
                         <p className="text-[14px] font-mono font-bold text-[#8B2635]">$500</p>
                       </div>
                       <div>
                         <p className="text-[9px] font-bold text-[#7A7A7A] uppercase mb-1">Overall Remaining</p>
                         <p className="text-[14px] font-mono font-bold text-[#2D2D2D]">$4,500</p>
                       </div>
                    </div>
                    <div className="bg-[#1A1A2E] text-white p-4 rounded-xl flex items-center justify-between">
                       <span className="text-[11px] font-bold uppercase tracking-wider">Net Position</span>
                       <span className="text-[20px] font-mono font-bold text-[#E07B39]">+$1,240</span>
                    </div>
                  </div>
                )}
             </Card>
          </section>

          {/* WITHDRAWAL TRACKER */}
          <section className="space-y-4 mb-8">
             <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em]">Withdrawals</p>
             {!activePhase?.title?.includes('FUNDED') ? (
                <Card className="!p-8 text-center bg-[#E5E0D8]/10">
                   <Lock className="w-6 h-6 text-[#7A7A7A] mx-auto mb-3" />
                   <p className="text-[11px] font-bold text-[#7A7A7A] uppercase">Withdrawal tracking locked</p>
                </Card>
             ) : (
               <Card className="!p-0 overflow-hidden">
                  <div className="p-6 text-center border-b border-[#E5E0D8]">
                    <p className="text-[28px] font-mono font-bold text-[#1A6B4A]">$4,200</p>
                    <p className="text-[9px] font-bold text-[#7A7A7A] uppercase tracking-widest mt-1">Total Withdrawn</p>
                  </div>
                  <div className="p-4">
                     <button className="w-full py-2 border border-[#E5E0D8] rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#F5F4F0] transition-colors">
                        Log Withdrawal
                     </button>
                  </div>
                  {withdrawals.length > 0 ? (
                    <div className="divide-y divide-[#E5E0D8]">
                       {withdrawals.map(w => (
                         <div key={w.id} className="p-4 flex justify-between items-center text-[12px]">
                            <span className="text-[#7A7A7A]">{format(new Date(w.withdrawal_date), 'MMM dd')}</span>
                            <span className="font-mono font-bold text-[#1A1A2E]">${parseFloat(w.amount_usd).toLocaleString()}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[#7A7A7A] text-[11px] opacity-40 uppercase">No payouts recorded</div>
                  )}
               </Card>
             )}
          </section>

          {/* SESSION STATS */}
          {sessionStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] 
              p-5 mb-4">
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-3">
                Session Performance
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sessionStats.map(stat => (
                  <div key={stat.session}
                    className="bg-[#F5F4F0] rounded-xl p-3">
                    <p className="text-[9px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-wider mb-1">
                      {stat.session === 'new_york' ? 'New York'
                        : stat.session === 'overlap' ? 'Overlap'
                        : stat.session.charAt(0).toUpperCase() + 
                          stat.session.slice(1)}
                    </p>
                    <p className="text-lg font-bold font-['Space_Mono']"
                      style={{ 
                        color: stat.winRate >= 50 ? '#1A6B4A' : '#C0392B' 
                      }}>
                      {stat.winRate}%
                    </p>
                    <p className="text-[9px] text-[#9A9590] 
                      font-['Space_Mono']">
                      {stat.tradesCount} trades · {stat.totalPnl > 0 ? '+' : ''}{stat.totalPnl}
                    </p>
                  </div>
                ))}
              </div>
              {sessionStats.length >= 2 && (
                <p className="text-[10px] text-[#E07B39] font-['Space_Mono']
                  uppercase tracking-wider mt-3 font-bold">
                  Best: {sessionStats.sort((a,b) => b.winRate - a.winRate)[0]
                    .session.replace('_', ' ').toUpperCase()} session
                </p>
              )}
            </div>
          )}

          {/* WEEKLY LETTER */}
          {letterLoaded && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] 
              p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                    Weekly Letter
                  </p>
                  <p className="text-sm font-bold text-[#1A1A2E] 
                    font-['Inter']">
                    JARVIS Verdict
                  </p>
                </div>
                <button
                  onClick={generateWeeklyLetter}
                  disabled={isGeneratingLetter}
                  className="bg-[#1A1A2E] text-white px-3 py-1.5 
                    rounded-lg text-[9px] font-bold font-['Space_Mono']
                    uppercase tracking-wider disabled:opacity-50"
                >
                  {isGeneratingLetter ? 'Writing...' : 'Generate'}
                </button>
              </div>
              {weeklyLetter ? (
                <div className="bg-[#F5F4F0] rounded-xl p-4 
                  border-l-4 border-[#1A1A2E]">
                  <p className="text-sm text-[#1A1A2E] font-['Inter'] 
                    leading-relaxed">
                    {weeklyLetter.ai_response}
                  </p>
                  <p className="text-[9px] text-[#9A9590] 
                    font-['Space_Mono'] uppercase tracking-wider mt-2">
                    {weeklyLetter.session_date}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#9A9590] font-['Inter']">
                  Generate your weekly trading assessment.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4 — TRADE HISTORY */}
      <section className="space-y-4 mb-10">
        <div className="flex justify-between items-center">
           <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em]">Entry Log</p>
           <div className="flex gap-2">
              <select className="bg-white border border-[#E5E0D8] rounded-lg px-3 py-1.5 text-[11px] font-medium outline-none">
                 <option>All Pairs</option>
                 <option>GBPUSD</option>
                 <option>EURUSD</option>
              </select>
              <select className="bg-white border border-[#E5E0D8] rounded-lg px-3 py-1.5 text-[11px] font-medium outline-none">
                 <option>All Rules</option>
                 <option>Yes</option>
                 <option>Partial</option>
                 <option>No</option>
              </select>
           </div>
        </div>

        <Card className="!p-0 overflow-hidden !rounded-xl">
           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-[#F5F4F0]/50 border-b border-[#E5E0D8]">
                       {['Date', 'Pair', 'Dir', 'HTF', 'Reason', 'Rules', 'Shot', 'XP'].map(h => (
                         <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-[#7A7A7A] uppercase tracking-widest">{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-[#E5E0D8]">
                    {trades.map(t => (
                      <tr key={t.id} className="hover:bg-[#F5F4F0] transition-colors group">
                        <td className="px-6 py-4 text-[12px] font-medium text-[#7A7A7A]">{format(new Date(t.date), 'MMM dd')}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-[#1A1A2E]">{t.pair}</span>
                              {t.session && (
                                <span className="text-[8px] font-bold font-['Space_Mono']
                                  uppercase tracking-wider px-1.5 py-0.5 rounded-md
                                  bg-[#1A1A2E]/10 text-[#1A1A2E]">
                                  {t.session === 'new_york' ? 'NY' 
                                    : t.session === 'overlap' ? 'OL'
                                    : t.session?.charAt(0).toUpperCase() + 
                                      t.session?.slice(1,3)}
                                </span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={clsx(
                             "px-2.5 py-1 rounded text-[9px] font-bold text-white",
                             t.direction === 'LONG' ? "bg-[#1A6B4A]" : "bg-[#8B2635]"
                           )}>{t.direction}</span>
                        </td>
                        <td className="px-6 py-4 text-[11px] font-bold uppercase text-[#7A7A7A]">{t.htf_bias}</td>
                        <td className="px-6 py-4 text-[12px] font-medium">{t.ltr_entry_reason}</td>
                        <td className={clsx(
                          "px-6 py-4 text-[11px] font-bold",
                          t.rules_followed === 'YES' ? "text-[#1A6B4A]" : t.rules_followed === 'PARTIAL' ? "text-[#E07B39]" : "text-[#8B2635]"
                        )}>
                          <div className="flex flex-col gap-1">
                            <span>{t.rules_followed}</span>
                            {t.rules_score !== null && t.rules_score !== undefined && (
                              <span className={`text-[9px] font-bold font-['Space_Mono']
                                px-2 py-0.5 rounded-full w-fit
                                ${t.rules_score === 100 
                                  ? 'bg-[#1A6B4A]/10 text-[#1A6B4A]'
                                  : t.rules_score >= 66 
                                    ? 'bg-[#E07B39]/10 text-[#E07B39]'
                                    : 'bg-[#C0392B]/10 text-[#C0392B]'}`}>
                                {t.rules_score}% rules
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           {t.screenshot_url ? (
                             <div className="w-8 h-8 rounded-lg border border-[#E5E0D8] overflow-hidden cursor-pointer" onClick={() => window.open(t.screenshot_url)}>
                                <img src={t.screenshot_url} className="w-full h-full object-cover" />
                             </div>
                           ) : "—"}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] font-bold">
                           {t.rules_followed === 'NO' ? <span className="text-[#8B2635]">-20</span> : <span className="text-[#1A6B4A]">+30</span>}
                        </td>
                      </tr>
                    ))}
                    {trades.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-16 text-center text-[#7A7A7A] italic opacity-40 uppercase text-[11px] tracking-widest">No entries found</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </Card>
        {tradesHasMore && (
          <button
            onClick={loadMoreTrades}
            className="w-full py-4 text-xs font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-wider 
              hover:text-[#1A1A2E] transition-colors"
          >
            Load More Trades
          </button>
        )}
      </section>

      {/* SECTION 5 — TRADE JOURNAL */}
      <section className="space-y-6">
         <div>
            <p className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.08em]">Journal</p>
            <p className="text-[12px] text-[#7A7A7A] mt-1">Your tape reading journey — thoughts, observations, what the market is teaching you</p>
         </div>

         <Card className="!p-8 space-y-6">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[12px] font-bold text-[#1A1A2E]">{format(new Date(), 'EEEE, MMMM dd')}</span>
            </div>
            <textarea 
               rows={6}
               placeholder="What did you observe today? What did price do that surprised you? How is your reading improving?"
               value={journalText}
               onChange={e => setJournalText(e.target.value)}
               className="w-full border border-[#E5E0D8] rounded-xl px-6 py-4 text-[14px] leading-[1.7] outline-none focus:border-[#1A1A2E]"
            />
            <div className="flex items-center gap-6">
               <button 
                onClick={async () => {
                  await addJournalEntry({ 
                    content: journalText, 
                    entry_date: new Date().toISOString().split('T')[0] 
                  });
                  setJournalText('');
                }}
                className="px-8 py-2.5 border border-[#1A1A2E] text-[#1A1A2E] font-bold rounded-lg uppercase text-[11px] tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-all"
               >SAVE JOURNAL</button>
               <span className="bg-[#E07B39]/20 text-[#1A1A2E] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">+10 XP</span>
            </div>
         </Card>

         <div className="space-y-8 mt-12">
            {journalEntries.map(entry => (
              <div key={entry.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[1px] before:bg-[#E5E0D8]">
                 <p className="text-[13px] font-display font-semibold italic text-[#1A1A2E] mb-3">
                   {format(new Date(entry.entry_date), 'MMMM dd, yyyy')}
                 </p>
                 <p className="text-[14px] leading-[1.8] text-[#2D2D2D] opacity-90">
                   {entry.content}
                 </p>
                 <div className="h-[1px] w-full bg-[#E5E0D8] mt-8" />
              </div>
            ))}
         </div>
         
         {journalEntries.length > 7 && (
           <button className="w-full py-4 text-[11px] font-bold text-[#7A7A7A] uppercase tracking-[0.2em] border border-[#E5E0D8] rounded-xl hover:bg-white">
             Load older entries
           </button>
         )}
      </section>

    </div>
  );
};

export default TradingRoadmap;
