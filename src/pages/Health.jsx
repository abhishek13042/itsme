import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useHealthStore } from '../store/healthStore';
import { useXpStore } from '../store/xpStore';
import { useWalletStore } from '../store/walletStore';
import { triggerJarvisToast } from '../components/JarvisToast';
import { getJarvisLine } from '../lib/jarvisReactions';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import MotivationalPopup from '../components/MotivationalPopup';
import GymChecklist from '../components/GymChecklist';
import { supabase } from '../lib/supabase';
import { getTodayIST } from '../lib/dateUtils';
import { loadMemories, saveMemory, MEMORY_TYPES } from '../lib/globalMemory'
import { 
  Flame, 
  Dumbbell, 
  Moon, 
  Sun, 
  Sparkles, 
  Utensils, 
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
  Activity,
  Clock,
  Zap,
  Bath,
  Check,
  Plus,
  Minus,
  Ruler,
  IndianRupee,
  Bot,
  ChevronDown,
  ChevronUp,
  Scissors,
  Droplets,
  Wind,
  Star,
  MessageSquare,
  Trash2,
  Bed,
  Book,
  Brush
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, isToday, addMinutes, parse } from 'date-fns';
import { clsx } from 'clsx';
import { awardXP } from '../lib/xpEngine';

const Health = () => {
  const { 
    todayLog, history, milestones, loading, isLoading, 
    loadHealthData, updateLog, toggleMilestone, submitDay,
    sleepDetails, logSleepDetail 
  } = useHealthStore();

  useEffect(() => {
    if (!todayLog) loadHealthData();
  }, []);
  const { streakDays, loadPlayerState } = useXpStore();
  const { loadWallet } = useWalletStore();
  const [dailyAiTip, setDailyAiTip] = useState('')
  const [dailyAiLoading, setDailyAiLoading] = useState(false)
  const [tipGenerated, setTipGenerated] = useState(false)

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [modalData, setModalData] = useState({ score: 0, earnings: 0 });
  const [activeXpPopups, setActiveXpPopups] = useState([]);
  const [activeSection, setActiveSection] = useState('daily');
  // sections: 'daily' | 'physique' | 'hair' | 'costs' | 'coach'

  const [physiqueLogs, setPhysiqueLogs] = useState([]);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [activeMetric, setActiveMetric] = useState('weight')

  const metricConfig = {
    weight: { label: 'Weight (kg)', color: '#1A1A2E' },
    waist: { label: 'Waist (cm)', color: '#C0392B' },
    chest: { label: 'Chest (cm)', color: '#E07B39' },
    arms: { label: 'Arms (cm)', color: '#1A6B4A' }
  }

  const physiqueChartData = useMemo(() => {
    return [...(physiqueLogs || [])]
      .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
      .slice(-12)
      .map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-IN', 
          { day: '2-digit', month: 'short' }),
        weight: log.weight_kg,
        waist: log.waist_cm,
        chest: log.chest_cm,
        arms: log.arms_cm
      }))
  }, [physiqueLogs])
  const [measurementForm, setMeasurementForm] = useState({
    weight_kg: '', chest_cm: '', waist_cm: '',
    arms_cm: '', forearms_cm: '', shoulders_cm: '', notes: ''
  });
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);

  const [healthCosts, setHealthCosts] = useState([]);
  const [costForm, setCostForm] = useState({ 
    item: '', category: 'Supplements', amount_inr: '', is_recurring: true 
  });
  const [showCostForm, setShowCostForm] = useState(false);
  const [aiCoachResponse, setAiCoachResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastCoachSession, setLastCoachSession] = useState(null);

  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', weight: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [gymChecklistOpen, setGymChecklistOpen] = useState(false);
  const [gymReadinessScore, setGymReadinessScore] = useState(null);
  const [readinessTrend, setReadinessTrend] = useState([]);
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');

  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const gymStartDate = new Date('2026-06-16');
  const todayDate = new Date();
  const daysUntilGym = Math.max(0, Math.ceil((gymStartDate - todayDate) / (1000 * 60 * 60 * 24)));
  const gymStarted = todayDate >= gymStartDate;

  useEffect(() => {
    loadHealthData();
    loadPhysiqueLogs();
    loadHealthCosts();
    loadLastCoachSession();
    loadExerciseLogs();
  }, []);

  useEffect(() => {
    if (activeSection !== 'physique') return
    const loadReadinessTrend = async () => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data } = await supabase
        .from('ai_sessions')
        .select('session_date, ai_response')
        .eq('type', 'gym_readiness')
        .gte('session_date', weekAgo.toISOString().split('T')[0])
        .order('session_date', { ascending: true })
      setReadinessTrend(data || [])
    }
    loadReadinessTrend()
  }, [activeSection])

  useEffect(() => {
    const todayDetail = sleepDetails?.find(d => 
      d.date === new Date().toISOString().split('T')[0]
    )
    if (todayDetail) {
      setBedTime(todayDetail.bedTime || '')
      setWakeTime(todayDetail.wakeTime || '')
    }
  }, [sleepDetails])

  const healthTrendData = useMemo(() => {
    return [...(history || [])]
      .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
      .slice(-30)
      .map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-IN', 
          { day: '2-digit', month: 'short' }),
        score: log.day_score || 0
      }))
  }, [history])

  const sleepDetailsChartData = useMemo(() => {
    return [...(sleepDetails || [])]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14)
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        hours: d.hours || 0
      }))
  }, [sleepDetails])

  const sleepQuestCorrelation = useMemo(() => {
    if (!sleepDetails || sleepDetails.length < 5) return null
    
    const goodSleepDates = sleepDetails
      .filter(d => d.hours >= 7)
      .map(d => d.date)
    const poorSleepDates = sleepDetails
      .filter(d => d.hours < 7)
      .map(d => d.date)

    if (goodSleepDates.length < 2 || poorSleepDates.length < 2) 
      return null

    const healthOnGoodSleep = (history || [])
      .filter(l => goodSleepDates.includes(l.log_date))
      .reduce((s, l) => s + (l.day_score || 0), 0) / 
      (goodSleepDates.length || 1)

    const healthOnPoorSleep = (history || [])
      .filter(l => poorSleepDates.includes(l.log_date))
      .reduce((s, l) => s + (l.day_score || 0), 0) / 
      (poorSleepDates.length || 1)

    const diff = Math.round(healthOnGoodSleep - healthOnPoorSleep)
    if (Math.abs(diff) < 5) return null

    return {
      diff,
      goodAvg: Math.round(healthOnGoodSleep),
      poorAvg: Math.round(healthOnPoorSleep),
      goodCount: goodSleepDates.length,
      poorCount: poorSleepDates.length
    }
  }, [sleepDetails, history])

  const loadExerciseLogs = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('log_date', today)
        .order('created_at', { ascending: true });
      setExerciseLogs(data || []);
    } catch (err) {
      console.error('exercise logs error:', err);
    }
  };

  const saveExercise = async () => {
    if (!newExercise.name) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('exercise_logs')
        .insert({
          exercise_name: newExercise.name,
          sets: parseInt(newExercise.sets) || 0,
          reps: parseInt(newExercise.reps) || 0,
          weight_kg: parseFloat(newExercise.weight) || 0
        })
        .select()
        .single();
      if (data) {
        setExerciseLogs(prev => [...prev, data]);
        setNewExercise({ name: '', sets: '', reps: '', weight: '' });
      }
    } catch (err) {
      console.error('save exercise error:', err);
    }
  };

  const toggleExercise = async (id, completed) => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('exercise_logs').update({ is_completed: completed }).eq('id', id);
      setExerciseLogs(prev => prev.map(e => e.id === id ? { ...e, is_completed: completed } : e));
    } catch (err) {
      console.error('toggle exercise error:', err);
    }
  };

  const deleteExercise = async (id) => {
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('exercise_logs').delete().eq('id', id);
      setExerciseLogs(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('delete exercise error:', err);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const context = `You are a fitness coach for Abhishek, a 20-year-old vegetarian Indian student in Nagpur. He wants a shredded, lean physique. 
      Today's score: ${todayLog?.day_score}%. Gym done: ${todayLog?.gym_done ? 'Yes' : 'No'}. 
      Logged exercises: ${exerciseLogs.map(e => `${e.exercise_name} (${e.sets}x${e.reps} @ ${e.weight_kg}kg)`).join(', ') || 'None yet'}.
      Remember: He is a strict vegetarian. Focus on paneer, soya, pulses, milk, and whey for protein.`;

      const { callGroq } = await import('../lib/groq');
      const result = await callGroq({
        messages: [
          { role: 'system', content: context },
          ...chatMessages.slice(-5),
          userMsg
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      if (result.error) {
        console.error('Groq error:', result.error)
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm having trouble connecting to the fitness core. Please check your connection or Groq API key." 
        }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: result.text }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    }
    setIsChatLoading(false);
  };

  const loadPhysiqueLogs = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('physique_logs')
        .select('*')
        .order('log_date', { ascending: false })
        .limit(20);
      setPhysiqueLogs(data || []);
      if (data && data.length > 0) setLatestMeasurement(data[0]);
    } catch (err) {
      console.error('physique logs error:', err);
    }
  };

  const loadHealthCosts = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('health_costs')
        .select('*')
        .eq('month', currentMonth)
        .order('category');
      setHealthCosts(data || []);
    } catch (err) {
      console.error('health costs error:', err);
    }
  };

  const loadLastCoachSession = async () => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('health_ai_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setAiCoachResponse(data.ai_response);
        setLastCoachSession(data.created_at);
      }
    } catch (err) {
      console.error('coach session error:', err);
    }
  };

  const saveMeasurement = async () => {
    if (!measurementForm.weight_kg) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('physique_logs')
        .insert({
          ...measurementForm,
          weight_kg: parseFloat(measurementForm.weight_kg) || null,
          chest_cm: parseInt(measurementForm.chest_cm) || null,
          waist_cm: parseInt(measurementForm.waist_cm) || null,
          arms_cm: parseInt(measurementForm.arms_cm) || null,
          forearms_cm: parseInt(measurementForm.forearms_cm) || null,
          shoulders_cm: parseInt(measurementForm.shoulders_cm) || null,
        })
        .select()
        .single();
      if (data) {
        setPhysiqueLogs(prev => [data, ...prev]);
        setLatestMeasurement(data);
        setMeasurementForm({
          weight_kg: '', chest_cm: '', waist_cm: '',
          arms_cm: '', forearms_cm: '', shoulders_cm: '', notes: ''
        });
        setShowMeasurementForm(false);
      }
    } catch (err) {
      console.error('save measurement error:', err);
    }
  };

  const saveCost = async () => {
    if (!costForm.item || !costForm.amount_inr) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const { data } = await supabase
        .from('health_costs')
        .insert({ ...costForm, month: currentMonth, 
          amount_inr: parseInt(costForm.amount_inr) })
        .select()
        .single();
      if (data) {
        setHealthCosts(prev => [...prev, data]);
        setCostForm({ item: '', category: 'Supplements', 
          amount_inr: '', is_recurring: true });
        setShowCostForm(false);
      }
    } catch (err) {
      console.error('save cost error:', err);
    }
  };

  const getAiCoach = async (promptType) => {
    setIsAiLoading(true);
    try {
      let healthContext = ''
      try {
        const healthMemory = await loadMemories(MEMORY_TYPES.HEALTH, 5)
        healthContext = healthMemory.map(m => m.content).join('\n- ')
      } catch (memErr) {
        console.error('Failed to load health memory:', memErr)
      }

      const totalCost = healthCosts.reduce((s, c) => s + c.amount_inr, 0);

      const latest = latestMeasurement;
      
      const prompts = {
        weekly: `You are a no-nonsense fitness coach for Abhishek, a 20-year-old Indian male student in Nagpur. He is a strict VEGETARIAN. He wants to achieve a shredded, vascular, lean physique — visible abs, V-taper, forearm veins. He's natural. Gym starts June 16, 2026. Days until gym: ${daysUntilGym}.

Current stats: Weight ${latest?.weight_kg || 'not logged'}kg, Waist ${latest?.waist_cm || 'not logged'}cm.
Today's health score: ${todayLog?.day_score || 0}%. Monthly health spend: ₹${totalCost}.

Give him a sharp, direct assessment. Suggest only VEGETARIAN protein sources (Soya, Paneer, Whey, Lentils). Be direct and motivating. Max 300 words.`,

        diet: `Design an optimal VEGETARIAN Indian diet plan for Abhishek — 20 year old male student in Nagpur, budget ₹200-300/day max. Goal is lean muscle gain (shredded). He needs high protein from vegetarian sources. Include: breakfast, lunch, dinner, pre/post workout. NO MEAT, NO FISH, NO EGGS. Focus on paneer, soya chunks, dal, milk, curd, nuts, and whey protein. Give realistic Nagpur market prices. Max 250 words.`,

        hair: `Give Abhishek a complete long hair care protocol. He's a 20 year old Indian male growing and maintaining long hair while working out daily (sweating). Include vegetarian nutritional tips for hair (biotin-rich veg foods like nuts, seeds, spinach). Max 200 words.`,

        cost: `Abhishek wants to build a shredded physique on a student budget in Nagpur as a VEGETARIAN. Monthly health spend optimization. Current spend: ₹${totalCost}/month. Give him: 1) Minimum monthly budget for veg protein (soya, paneer, whey), 2) Best value veg protein in India. Max 250 words.`
      };

      const finalPrompt = prompts[promptType] + (healthContext ? `
      
      RECENT HEALTH HISTORY:
      - ${healthContext}

      Reference this history. Build on previous advice.
      Don't repeat what has already been suggested.
      ` : '')

      const { callGroq } = await import('../lib/groq');
      const result = await callGroq({
        messages: [{ role: 'user', content: finalPrompt }],
        max_tokens: 800,
        temperature: 0.7
      });


      if (result.error) {
        console.error('Groq error:', result.error)
        setAiCoachResponse('AI Coach is temporarily offline. Focus on your vegetarian protein targets (Paneer, Soya, Whey).');
        setIsAiLoading(false);
        return;
      }

      const text = result.text;
      setAiCoachResponse(text);
      setLastCoachSession(new Date().toISOString());

      const { supabase } = await import('../lib/supabase');
      await supabase.from('health_ai_sessions').insert({
        prompt_type: promptType,
        ai_response: text
      });

      saveMemory({
        type: MEMORY_TYPES.HEALTH,
        content: `Health coach session: ${promptType} — key insight: ${text.substring(0, 150)}`,
        source: 'health_coach',
        importance: 6
      })

    } catch (err) {
      console.error('AI coach error:', err);
      setAiCoachResponse('Failed to get AI response. Check your Groq API key.');
    }
    setIsAiLoading(false);
  };

  const getDailyAiTip = async () => {
    setDailyAiLoading(true)
    try {
      const gymType = todayLog?.gym_type || 'not selected'
      const score = todayLog?.day_score || 0
      const gymDone = todayLog?.gym_done ? 'yes' : 'no'
      const proteinHit = todayLog?.protein_hit ? 'yes' : 'no'
      
      const prompt = `You are a sharp fitness coach for Abhishek, 
      a 20yo Indian male student. He is vegetarian + eggs (no meat, 
      no fish). Goal: shredded vascular physique. Starts gym June 16.
      
      Today's data: Gym done: ${gymDone}, Workout: ${gymType}, 
      Health score: ${score}%, Protein hit: ${proteinHit}.
      
      Give him ONE sharp, specific, actionable tip for today.
      Maximum 3 sentences. Be direct and specific to his situation.
      No fluff, no motivation speech. Just the one thing that will
      move the needle today for his physique goal. 
      Consider his vegetarian+egg diet when relevant.`

      const { callGroq } = await import('../lib/groq')
      const result = await callGroq({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.8
      })

      if (result.error) {
        console.error('Groq error:', result.error)
        setDailyAiTip("Consistency is key. Keep hitting your protein targets.")
      } else {
        setDailyAiTip(result.text)
        saveMemory({
          type: MEMORY_TYPES.HEALTH,
          content: `Daily tip: ${result.text.substring(0, 150)}`,
          source: 'health_daily_tip',
          importance: 4
        })
      }

      setTipGenerated(true)
    } catch (err) {
      console.error('daily tip error:', err)
    }
    setDailyAiLoading(false)
  }

  const identityLine = useMemo(() => {
    const s = streakDays;
    if (s <= 6) return `Day ${s} — Building the foundation`;
    if (s <= 13) return `Day ${s} — The habit is forming`;
    if (s <= 29) return `Day ${s} — You are becoming him`;
    return `Day ${s} — This is who you are now`;
  }, [streakDays]);

  const gymStreak = useMemo(() => {
    let s = 0;
    for (const log of history) {
      if (log.gym_done) s++;
      else break;
    }
    return s;
  }, [history]);

  const triggerXpPopup = (amount, label) => {
    const id = Date.now();
    setActiveXpPopups(prev => [...prev, { id, amount, label }]);
    setTimeout(() => {
      setActiveXpPopups(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  const handleToggle = async (id, value, xp, rupee) => {
    updateLog({ [id]: value });
    if (value) {
      triggerXpPopup(xp, id.replace(/_/g, ' '));
      // Wallet update handled by submit usually, but spec says "update live"
      // We could call earnReward here if preferred
    }

    if (id === 'gym_done' && value) {
      triggerJarvisToast({
        type: 'success',
        title: 'GYM SESSION',
        xp: 25,
        message: 'Logged. Recovery starts now.',
        duration: 3500
      });
      getJarvisLine('gym_done', { type: todayLog?.gym_type })
        .then(line => {
          if (line) triggerJarvisToast({
            type: 'success',
            title: 'GYM SESSION',
            xp: 25,
            jarvisLine: line,
            duration: 3500
          });
        });
    }

    if (id === 'skincare_am' && value) {
      triggerJarvisToast({
        type: 'info',
        title: 'AM PROTOCOL',
        message: 'Face protocol logged.',
        duration: 2500
      });
    }

    // Perfect health score
    const newChecks = Object.values({ ...todayLog, [id]: value })
      .filter(v => v === true).length;
    if (newChecks >= 13) {
      triggerJarvisToast({
        type: 'success',
        title: 'PERFECT SCORE',
        message: '13/13. Every system optimal.',
        duration: 5000
      });
      getJarvisLine('health_perfect', {})
        .then(line => {
          if (line) triggerJarvisToast({
            type: 'success',
            title: 'PERFECT SCORE',
            jarvisLine: line,
            duration: 5000
          });
        });
    }
  };

  const handleGymToggle = (currentValue) => {
    if (!currentValue) {
      setGymChecklistOpen(true)
    } else {
      updateLog({ gym_done: false })
      setGymReadinessScore(null)
    }
  }

  const handleTimeChange = (id, value) => {
    const updates = { [id]: value };
    if (id === 'sleep_time') {
      const isLate = value > '00:00' && value < '12:00'; // Simplistic check
      updates.slept_by_midnight = !isLate;
    }
    if (id === 'wake_time') {
      const isEarly = value <= '06:30';
      updates.woke_by_630 = isEarly;
    }
    updateLog(updates);
  };

  const hoursSlept = useMemo(() => {
    if (!todayLog?.sleep_time || !todayLog?.wake_time) return 0;
    try {
      const sleep = parse(todayLog.sleep_time, 'HH:mm', new Date());
      let wake = parse(todayLog.wake_time, 'HH:mm', new Date());
      if (wake < sleep) wake = new Date(wake.getTime() + 24 * 60 * 60 * 1000);
      return ((wake - sleep) / (1000 * 60 * 60)).toFixed(1);
    } catch { return 0; }
  }, [todayLog?.sleep_time, todayLog?.wake_time]);

  const handleSubmit = async () => {
    const res = await submitDay();
    if (res.success) {
      setModalData({ score: res.score, earnings: res.earnings });
      setShowSubmitModal(true);
      loadPlayerState();
      loadWallet();
    }
  };

  const workoutPlans = {
    'PUSH': {
      focus: 'Chest, Shoulders, Triceps',
      color: '#E07B39',
      warmup: '5 min incline walk + arm circles',
      exercises: [
        { name: 'Flat Bench Press', sets: '4', reps: '8-10', 
          note: 'Control the descent — 3 sec down' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12',
          note: 'Upper chest focus — don\'t flare elbows' },
        { name: 'Cable Lateral Raises', sets: '4', reps: '15-20',
          note: 'Light weight, feel the burn — no swinging' },
        { name: 'Overhead Press (DB)', sets: '3', reps: '10-12',
          note: 'Seated or standing — brace your core' },
        { name: 'Tricep Rope Pushdown', sets: '3', reps: '12-15',
          note: 'Full extension at bottom' },
        { name: 'Chest Dips', sets: '3', reps: 'Till failure',
          note: 'Lean forward slightly for chest activation' }
      ],
      cooldown: 'Chest stretch + shoulder cross stretch — 3 min'
    },
    'PULL': {
      focus: 'Back, Biceps, Rear Delts',
      color: '#1A1A2E',
      warmup: '5 min rowing machine or band pull-aparts',
      exercises: [
        { name: 'Pull-ups / Lat Pulldown', sets: '4', reps: '8-10',
          note: 'Full stretch at top, squeeze at bottom' },
        { name: 'Barbell or DB Row', sets: '4', reps: '8-10',
          note: 'Elbows back — not out. Row to hip not chest' },
        { name: 'Seated Cable Row', sets: '3', reps: '12',
          note: 'Pause 1 sec at peak contraction' },
        { name: 'Face Pulls', sets: '3', reps: '15-20',
          note: 'Rear delt health — do not skip this ever' },
        { name: 'Hammer Curl', sets: '3', reps: '12-15',
          note: 'Forearm and brachialis — key for arm thickness' },
        { name: 'Incline DB Curl', sets: '3', reps: '10-12',
          note: 'Full stretch on bicep — slow down' }
      ],
      cooldown: 'Lat stretch doorframe + bicep wall stretch — 3 min'
    },
    'LEGS': {
      focus: 'Quads, Hamstrings, Calves, Glutes',
      color: '#1A6B4A',
      warmup: '10 min incline walk + leg swings + bodyweight squats',
      exercises: [
        { name: 'Barbell Squat', sets: '4', reps: '8-10',
          note: 'Depth matters — parallel or below. Brace hard' },
        { name: 'Romanian Deadlift', sets: '4', reps: '10-12',
          note: 'Feel hamstring stretch — hinge at hip not back' },
        { name: 'Leg Press', sets: '3', reps: '12-15',
          note: 'Feet shoulder width. Full range of motion' },
        { name: 'Leg Curl (Machine)', sets: '3', reps: '12-15',
          note: 'Slow eccentric — 3 sec down' },
        { name: 'Calf Raises', sets: '4', reps: '20-25',
          note: 'Pause 2 sec at top. Calves need volume' },
        { name: 'Leg Extension', sets: '3', reps: '15',
          note: 'Finisher — feel the quad burn' }
      ],
      cooldown: 'Quad stretch + hamstring seated stretch — 5 min'
    },
    'FULL BODY': {
      focus: 'All muscle groups — moderate intensity',
      color: '#7C3AED',
      warmup: '5 min cardio + dynamic stretching',
      exercises: [
        { name: 'Deadlift', sets: '3', reps: '8',
          note: 'King of all exercises. Full body tension' },
        { name: 'Bench Press', sets: '3', reps: '10',
          note: 'Compound chest movement' },
        { name: 'Pull-ups', sets: '3', reps: 'Max',
          note: 'Bodyweight back work' },
        { name: 'Overhead Press', sets: '3', reps: '10',
          note: 'Shoulder strength and stability' },
        { name: 'Goblet Squat', sets: '3', reps: '12',
          note: 'Quad and core — use a dumbbell or kettlebell' },
        { name: 'Plank', sets: '3', reps: '45-60 sec',
          note: 'Core stability — keep hips neutral' }
      ],
      cooldown: 'Full body stretch — 5 min'
    },
    'CARDIO': {
      focus: 'Cardiovascular endurance + fat burn',
      color: '#C0392B',
      warmup: '2 min slow walk',
      exercises: [
        { name: 'Incline Treadmill Walk', sets: '1', reps: '20 min',
          note: 'Incline 10-12%, speed 5-6. Burns fat, saves muscle' },
        { name: 'Jump Rope', sets: '5', reps: '2 min on / 1 min rest',
          note: 'Best cardio for vascularity and conditioning' },
        { name: 'Stairmaster or Cycling', sets: '1', reps: '15 min',
          note: 'Moderate intensity — can hold a conversation' },
        { name: 'Battle Ropes', sets: '4', reps: '30 sec on / 30 off',
          note: 'Full body conditioning — brutal and effective' }
      ],
      cooldown: 'Walk 5 min + full stretch'
    },
    'REST DAY': {
      focus: 'Recovery — muscles grow on rest days, not gym days',
      color: '#9A9590',
      warmup: '',
      exercises: [
        { name: '20 min Walk', sets: '1', reps: 'Easy pace',
          note: 'Active recovery — keeps blood flowing' },
        { name: 'Full Body Stretching', sets: '1', reps: '15 min',
          note: 'Focus on whatever was sore this week' },
        { name: 'Foam Rolling', sets: '1', reps: '10 min',
          note: 'Quads, lats, thoracic spine — deep tissue' },
        { name: 'Meditation / Breathing', sets: '1', reps: '10 min',
          note: 'Mental recovery matters as much as physical' }
      ],
      cooldown: ''
    }
  };

  if (loading && !todayLog) return <div className="p-12 text-[#9A9590] animate-pulse font-mono text-center mt-20">SYNCING VITALS...</div>;

  if (!todayLog) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <Card className="max-w-md p-8 bg-white border-[#C0392B]/20 border-t-4 border-t-[#C0392B]">
        <h2 className="font-display text-xl font-extrabold text-[#1A1A2E] mb-4 uppercase">PROTOCOL OFFLINE</h2>
        <p className="text-[#9A9590] text-sm leading-relaxed mb-6">
          Your health neural net is disconnected. Please ensure you have run the <code className="bg-[#F5F4F0] px-1 rounded">supabase_health_v2.sql</code> script to initialize the new schema.
        </p>
        <Button onClick={() => loadHealthData()} className="w-full bg-[#1A1A2E] font-bold">RETRY SYNC</Button>
      </Card>
    </div>
  );


  if (isLoading && !todayLog) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-[#F5F4F0] animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-48 bg-[#F5F4F0] animate-pulse rounded-2xl" />
        </div>
        <div className="h-64 bg-[#F5F4F0] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24 bg-[#F5F4F0] font-body text-[#3D3830]">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-body text-[13px] text-[#9A9590] italic mb-1">{identityLine}</p>
          <h1 className="font-display text-[32px] font-extrabold text-[#1A1A2E] leading-tight uppercase tracking-tight">HEALTH</h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF0E6] rounded-full border border-[#E07B39]/20">
            <Flame className="w-5 h-5 text-[#E07B39]" />
            <span className="text-[13px] font-bold text-[#E07B39] font-mono">{streakDays} DAYS</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#E8F5EF] rounded-full border border-[#1A6B4A]/20">
            <Dumbbell className="w-5 h-5 text-[#1A6B4A]" />
            <span className="text-[13px] font-bold text-[#1A6B4A] font-mono">{gymStreak} DAYS</span>
          </div>
        </div>
      </header>

      {/* SECTION TABS */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E5E0D8] p-1 w-fit mb-6 overflow-x-auto scrollbar-none max-w-full">
        {[
          { id: 'daily', label: 'Daily Habits' },
          { id: 'physique', label: 'Physique' },
          { id: 'training', label: 'Training' },
          { id: 'hair', label: 'Face & Hair' },
          { id: 'costs', label: 'Costs' },
          { id: 'coach', label: 'AI Coach' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-xs font-bold font-["Space_Mono"] uppercase tracking-wider transition-all whitespace-nowrap',
              activeSection === tab.id
                ? 'bg-[#1A1A2E] text-white'
                : 'text-[#9A9590] hover:text-[#1A1A2E]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TODAY'S SCORE SECTION - MOVED TO DAILY TAB */}
      <div className="w-full">
          {activeSection === 'daily' && (
            <div className="space-y-4">
              {/* Score bar — compact full-width */}
              <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center 
                      justify-center shrink-0"
                      style={{ 
                        backgroundColor: (todayLog.day_score || 0) >= 80 
                          ? '#1A6B4A15' 
                          : (todayLog.day_score || 0) >= 50 
                            ? '#E07B3915' 
                            : '#C0392B15' 
                      }}>
                      <p className="text-base font-bold font-['Space_Mono']"
                        style={{ 
                          color: (todayLog.day_score || 0) >= 80 
                            ? '#1A6B4A' 
                            : (todayLog.day_score || 0) >= 50 
                              ? '#E07B39' 
                              : '#C0392B' 
                        }}>
                        {todayLog.day_score || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest">
                        Today's Score
                      </p>
                      <p className="text-sm font-bold text-[#1A1A2E] 
                        font-['Inter']">
                        {todayLog.total_checks || 0}/13 habits · 
                        ₹{(todayLog.total_checks || 0) * 4} earned
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(new Date().getHours() >= 18 || 
                      (todayLog.day_score || 0) === 100) ? (
                      <button
                        onClick={handleSubmit}
                        className="bg-[#1A6B4A] text-white px-4 py-2 
                          rounded-xl text-xs font-bold font-['Space_Mono']
                          uppercase tracking-wider hover:opacity-90"
                      >
                        Submit Day
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-wider 
                        bg-[#F5F4F0] px-3 py-1.5 rounded-lg">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayLog.day_score || 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: (todayLog.day_score || 0) >= 80 
                        ? '#1A6B4A' 
                        : (todayLog.day_score || 0) >= 50 
                          ? '#E07B39' 
                          : '#C0392B' 
                    }}
                  />
                </div>
              </div>

              {/* AI tip strip — compact version */}
              <div className="bg-[#1A1A2E] rounded-2xl p-4 flex items-center 
                justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#E07B39]/15 
                    flex items-center justify-center shrink-0">
                    <Bot size={15} className="text-[#E07B39]"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/40
                      font-['Space_Mono'] uppercase tracking-widest mb-1">
                      Coach Tip
                    </p>
                    {!tipGenerated && !dailyAiLoading && (
                      <p className="text-xs text-white/50 font-['Inter']">
                        Get today's personalized coaching tip
                      </p>
                    )}
                    {dailyAiLoading && (
                      <p className="text-xs text-white/40 font-['Space_Mono']
                        uppercase tracking-wider animate-pulse text-[10px]">
                        Analyzing...
                      </p>
                    )}
                    {tipGenerated && dailyAiTip && (
                      <p className="text-xs text-white/80 font-['Inter'] 
                        leading-relaxed">
                        {dailyAiTip}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={getDailyAiTip}
                  disabled={dailyAiLoading}
                  className="shrink-0 text-[9px] font-bold font-['Space_Mono']
                    uppercase tracking-wider px-3 py-2 rounded-lg transition-all
                    disabled:opacity-40"
                  style={{ 
                    backgroundColor: tipGenerated ? 'rgba(255,255,255,0.08)' : '#E07B39',
                    color: 'white'
                  }}
                >
                  {dailyAiLoading ? '...' : tipGenerated ? 'Refresh' : 'Get Tip'}
                </button>
              </div>

              {/* Health trend chart */}
              {healthTrendData.length >= 7 && (
                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-widest">
                      30-Day Health Score Trend
                    </p>
                    <p className="text-xs font-bold font-['Space_Mono']"
                      style={{
                        color: healthTrendData.slice(-7)
                          .reduce((s,d) => s + d.score, 0) / 7 >= 70
                          ? '#1A6B4A' : '#E07B39'
                      }}>
                      7d avg: {Math.round(
                        healthTrendData.slice(-7)
                          .reduce((s,d) => s + d.score, 0) / 7
                      )}%
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={healthTrendData}>
                      <XAxis dataKey="date" hide/>
                      <YAxis domain={[0, 100]} hide/>
                      <Tooltip
                        contentStyle={{ fontSize: 10, 
                          fontFamily: 'Space Mono',
                          borderRadius: 8, border: '1px solid #E5E0D8' }}
                        formatter={(val) => [`${val}%`, 'Score']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#1A6B4A"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#1A6B4A' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {/* SECTION 1 — TRAINING */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    TRAINING
                  </p>
                  <span className="text-[9px] font-bold font-['Space_Mono']
                    uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    style={{ 
                      backgroundColor: '#E07B3915',
                      color: '#E07B39'
                    }}>
                    🔥 {gymStreak} day streak
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                  {/* Top row: toggle + readiness score */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-1">
                        Did you train today?
                      </p>
                      <button
                        onClick={() => handleGymToggle(todayLog.gym_done)}
                        className={clsx(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                          "text-xs font-bold font-['Space_Mono'] uppercase",
                          "tracking-wider transition-all",
                          todayLog.gym_done
                            ? "bg-[#1A6B4A] text-white"
                            : "bg-[#F5F4F0] text-[#1A1A2E] hover:bg-[#E5E0D8]"
                        )}
                      >
                        {todayLog.gym_done 
                          ? <><CheckCircle2 size={14}/> Crushed It</>
                          : <><Dumbbell size={14}/> Log Workout</>
                        }
                      </button>
                    </div>
                    
                    {/* Readiness score pill */}
                    {gymReadinessScore !== null && (
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-[#9A9590]
                          font-['Space_Mono'] uppercase tracking-widest mb-1">
                          Readiness
                        </p>
                        <p className="text-2xl font-bold font-['Space_Mono']"
                          style={{ 
                            color: gymReadinessScore >= 75 
                              ? '#1A6B4A' 
                              : gymReadinessScore >= 50 
                                ? '#E07B39' 
                                : '#C0392B' 
                          }}>
                          {gymReadinessScore}%
                        </p>
                      </div>
                    )}
                    
                    {/* 30-day progress */}
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-1">
                        30-Day Goal
                      </p>
                      <p className="text-sm font-bold text-[#E07B39] 
                        font-['Space_Mono']">
                        {gymStreak}/30
                      </p>
                      <div className="w-24 h-1 bg-[#F5F4F0] rounded-full 
                        overflow-hidden mt-1">
                        <div className="h-full bg-[#E07B39] rounded-full"
                          style={{ width: `${(gymStreak/30)*100}%` }}/>
                      </div>
                    </div>
                  </div>

                  {/* Split selector — only when gym done */}
                  {todayLog.gym_done && (
                    <div className="border-t border-[#F5F4F0] pt-4">
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-2">
                        Select Split
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {['PUSH', 'PULL', 'LEGS', 'FULL BODY', 'CARDIO', 
                          'REST DAY'].map(t => (
                          <button
                            key={t}
                            onClick={() => updateLog({ gym_type: t })}
                            className={clsx(
                              "px-3 py-1.5 rounded-lg text-[9px] font-bold",
                              "font-['Space_Mono'] uppercase tracking-wider",
                              "transition-all",
                              todayLog.gym_type === t
                                ? "bg-[#1A1A2E] text-white"
                                : "bg-[#F5F4F0] text-[#9A9590]"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                 {todayLog.gym_done && todayLog.gym_type && workoutPlans[todayLog.gym_type] && (() => {
                    const plan = workoutPlans[todayLog.gym_type]
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded-xl overflow-hidden border border-[#E5E0D8]"
                      >
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between"
                          style={{ backgroundColor: plan.color }}>
                          <div>
                            <p className="text-[10px] font-bold text-white/60 
                              font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                              Today's Training
                            </p>
                            <p className="text-sm font-bold text-white font-['Inter']">
                              {plan.focus}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-white/80 
                            font-['Space_Mono'] uppercase">
                            {plan.exercises.length} exercises
                          </span>
                        </div>

                        {/* Warmup */}
                        {plan.warmup && (
                          <div className="px-4 py-3 bg-amber-50 border-b border-[#E5E0D8]
                            flex items-center gap-2">
                            <span className="text-base">🔥</span>
                            <div>
                              <p className="text-[9px] font-bold text-amber-700 
                                font-['Space_Mono'] uppercase tracking-wider">Warmup</p>
                              <p className="text-xs text-amber-800 font-['Inter']">
                                {plan.warmup}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Exercise list */}
                        <div className="bg-white">
                          {plan.exercises.map((ex, i) => (
                            <ExerciseItem key={i} ex={ex} />
                          ))}
                        </div>

                        {/* Cooldown */}
                        {plan.cooldown && (
                          <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
                            <span className="text-base">🧊</span>
                            <div>
                              <p className="text-[9px] font-bold text-blue-700 
                                font-['Space_Mono'] uppercase tracking-wider">
                                Cooldown
                              </p>
                              <p className="text-xs text-blue-800 font-['Inter']">
                                {plan.cooldown}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })()}
              </section>

              {/* SECTION 2 — NUTRITION */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    NUTRITION & FUEL
                  </p>
                  <span className="text-[9px] font-bold font-['Space_Mono']
                    uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    style={{ 
                      backgroundColor: '#1A6B4A15',
                      color: '#1A6B4A'
                    }}>
                    {todayLog.protein_hit ? '🔥 Protein Target Reached' : '⚖️ Tracking Macros'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                  {/* Habit toggles */}
                  <div className="space-y-4 mb-4">
                    <HabitRow 
                      icon="🍽️" 
                      label="Meal 1 done" 
                      value={todayLog.meal_1_done} 
                      onChange={(v) => handleToggle('meal_1_done', v, 8, 2)} 
                      color="#1A6B4A"
                    />
                    <HabitRow 
                      icon="🍽️" 
                      label="Meal 2 done" 
                      value={todayLog.meal_2_done} 
                      onChange={(v) => handleToggle('meal_2_done', v, 8, 2)} 
                      color="#1A6B4A"
                    />
                    <HabitRow 
                      icon="💪" 
                      label="Protein hit" 
                      sub="Eggs / Paneer / Soya / Dal"
                      value={todayLog.protein_hit} 
                      onChange={(v) => handleToggle('protein_hit', v, 10, 3)} 
                      color="#1A6B4A"
                    />
                    <HabitRow 
                      icon="🚫" 
                      label="No junk < 6PM" 
                      value={todayLog.no_junk_before_6pm} 
                      onChange={(v) => handleToggle('no_junk_before_6pm', v, 10, 3)} 
                      color="#1A6B4A"
                    />
                  </div>
                  
                  {/* Protein target — compact strip below habits */}
                  <div className="border-t border-[#F5F4F0] pt-4 
                    flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                        Daily Target
                      </p>
                      <p className="text-sm font-bold text-[#E07B39] 
                        font-['Space_Mono']">
                        126g - 140g protein
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 
                      bg-[#1A6B4A]/10 rounded-lg px-3 py-1.5">
                      <CheckCircle2 size={11} className="text-[#1A6B4A]"/>
                      <p className="text-[9px] font-bold text-[#1A6B4A]
                        font-['Space_Mono'] uppercase tracking-wider">
                        Veg Protocol
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3 — SLEEP */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    RECOVERY & SLEEP
                  </p>
                  <span className="text-[9px] font-bold font-['Space_Mono']
                    uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    style={{ 
                      backgroundColor: '#1A1A2E15',
                      color: '#1A1A2E'
                    }}>
                    {hoursSlept} hours slept
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                  {/* Time inputs row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-2">
                        Slept At
                      </p>
                      <input
                        type="time"
                        value={todayLog.sleep_time || ''}
                        onChange={(e) => handleTimeChange('sleep_time', e.target.value)}
                        className="w-full font-['Space_Mono'] text-2xl font-bold 
                          text-[#1A1A2E] bg-[#F5F4F0] rounded-xl px-4 py-3
                          border border-transparent focus:border-[#1A1A2E]
                          focus:outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-2">
                        Woke At
                      </p>
                      <input
                        type="time"
                        value={todayLog.wake_time || ''}
                        onChange={(e) => handleTimeChange('wake_time', e.target.value)}
                        className="w-full font-['Space_Mono'] text-2xl font-bold 
                          text-[#1A1A2E] bg-[#F5F4F0] rounded-xl px-4 py-3
                          border border-transparent focus:border-[#1A1A2E]
                          focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Hours + correlation strip */}
                  <div className="flex items-center justify-between 
                    bg-[#F5F4F0] rounded-xl px-4 py-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Moon size={14} className="text-[#1A1A2E]"/>
                      <p className="text-sm font-bold text-[#1A1A2E] 
                        font-['Space_Mono']">
                        {hoursSlept}h sleep
                      </p>
                    </div>
                    <span className="text-[9px] font-bold font-['Space_Mono']
                      uppercase tracking-wider px-2.5 py-1 rounded-lg"
                      style={{
                        backgroundColor: hoursSlept < 6 
                          ? '#C0392B15' 
                          : hoursSlept < 7 
                            ? '#E07B3915' 
                            : '#1A6B4A15',
                        color: hoursSlept < 6 
                          ? '#C0392B' 
                          : hoursSlept < 7 
                            ? '#E07B39' 
                            : '#1A6B4A'
                      }}>
                      {hoursSlept < 6 
                        ? 'Insufficient' 
                        : hoursSlept < 7 
                          ? 'Average' 
                          : 'Optimal'}
                    </span>
                  </div>

                  {/* Sleep habit toggles */}
                  <div className="space-y-4 mb-4">
                    <HabitRow
                      label="Slept before midnight?"
                      value={todayLog.slept_by_midnight}
                      onChange={(v) => handleToggle('slept_by_midnight', v, 10, 2)}
                      color="#1A1A2E"
                    />
                    <HabitRow
                      label="Woke by 6:30 AM?"
                      value={todayLog.woke_by_630}
                      onChange={(v) => handleToggle('woke_by_630', v, 10, 2)}
                      color="#1A1A2E"
                    />
                  </div>

                  {/* Correlation insight — only if data exists */}
                  {sleepQuestCorrelation && (
                    <div className="border-t border-[#F5F4F0] pt-3 
                      flex items-start gap-2">
                      <TrendingUp size={12} className="text-[#1A6B4A] 
                        shrink-0 mt-0.5"/>
                      <p className="text-[10px] text-[#9A9590] font-['Inter']
                        leading-relaxed">
                        On 7h+ sleep days your score is{' '}
                        <span className="font-bold text-[#1A6B4A]">
                          {sleepQuestCorrelation.diff}% higher
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Sleep chart — only if data */}
                  {sleepDetailsChartData.length > 0 && (
                    <div className="mt-3 h-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sleepDetailsChartData.slice(-7)}>
                          <Line type="monotone" dataKey="hours" 
                            stroke="#1A1A2E" strokeWidth={2} dot={false}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4 — HYGIENE & PROTOCOLS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    HYGIENE & PROTOCOLS
                  </p>
                  <span className="text-[9px] font-bold font-['Space_Mono']
                    uppercase tracking-wider px-2.5 py-1 rounded-lg"
                    style={{ 
                      backgroundColor: '#7C3AED15',
                      color: '#7C3AED'
                    }}>
                    Checks complete
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Morning */}
                    <div>
                      <p className="text-[9px] font-bold text-[#E07B39]
                        font-['Space_Mono'] uppercase tracking-widest mb-3">
                        Morning Protocol
                      </p>
                      <div className="space-y-4">
                        <HabitRow 
                          icon={<Bed size={16} className="text-[#1A6B4A]"/>}
                          label="Bed made"
                          sub="2 min. Sets the tone."
                          value={todayLog.bed_made}
                          onChange={(v) => handleToggle('bed_made', v, 5, 1)}
                          color="#1A6B4A"
                        />
                        <HabitRow
                          icon={<Bath size={16} className="text-[#1A6B4A]"/>}
                          label="Bath done"
                          value={todayLog.bath_done}
                          onChange={(v) => handleToggle('bath_done', v, 5, 1)}
                          color="#1A6B4A"
                        />
                        <HabitRow
                          icon={<Sun size={16} className="text-[#1A6B4A]"/>}
                          label="Skincare AM"
                          sub="Moisturizer + SPF"
                          value={todayLog.skincare_am}
                          onChange={(v) => handleToggle('skincare_am', v, 5, 1)}
                          color="#1A6B4A"
                        />
                      </div>
                    </div>

                    {/* Night */}
                    <div>
                      <p className="text-[9px] font-bold text-[#1A1A2E]
                        font-['Space_Mono'] uppercase tracking-widest mb-3">
                        Night Protocol
                      </p>
                      <div className="space-y-4">
                        <HabitRow
                          icon={<Brush size={16} className="text-[#1A1A2E]"/>}
                          label="Teeth brushed"
                          value={todayLog.teeth_brushed}
                          onChange={(v) => handleToggle('teeth_brushed', v, 5, 1)}
                          color="#1A1A2E"
                        />
                        <HabitRow
                          icon={<Moon size={16} className="text-[#1A1A2E]"/>}
                          label="Skincare PM"
                          sub="Cleanser + moisturizer"
                          value={todayLog.skincare_pm}
                          onChange={(v) => handleToggle('skincare_pm', v, 5, 1)}
                          color="#1A1A2E"
                        />
                        <HabitRow
                          icon={<Book size={16} className="text-[#1A1A2E]"/>}
                          label="Study table clean"
                          sub="Clean desk = clear mind"
                          value={todayLog.study_table_organised}
                          onChange={(v) => handleToggle('study_table_organised', v, 5, 1)}
                          color="#1A1A2E"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* HEATMAP — monthly performance */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    MONTHLY PERFORMANCE
                  </p>
                  <div className="flex gap-1.5">
                    {['#1A6B4A', '#E07B39', '#FFC49B', '#F0EDE8'].map((c, i) => (
                      <div key={i} className="w-2 h-2 rounded-sm" 
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                  {/* The grid */}
                  <div className="grid grid-cols-7 lg:grid-cols-10 gap-3 mb-8">
                    {Array.from({ length: 30 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (29 - i));
                      const dateStr = date.toISOString().split('T')[0];
                      const log = history.find(l => l.log_date === dateStr);
                      return (
                        <div key={i} className={clsx(
                          "aspect-square rounded-lg transition-all relative group",
                          !log ? "bg-[#F0EDE8]" : 
                           log.day_score === 100 ? "bg-[#1A6B4A]" :
                           log.day_score >= 80 ? "bg-[#E07B39]" :
                           log.day_score >= 50 ? "bg-[#FFC49B]" : "bg-[#FFE4CC]"
                        )}>
                          {log && (
                             <div className="absolute bottom-full left-1/2 
                               -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                               <div className="bg-[#1A1A2E] text-white text-[10px] 
                                 px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                                 {format(date, 'MMM d')} · {log.day_score}%
                               </div>
                             </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Stats strip */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 
                    pt-6 border-t border-[#F5F4F0]">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-1">
                        Perfect Days
                      </p>
                      <p className="text-xl font-bold font-['Space_Mono'] 
                        text-[#1A6B4A]">
                        {history.filter(l => l.day_score === 100).length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-1">
                        Gym Streak
                      </p>
                      <p className="text-xl font-bold font-['Space_Mono'] 
                        text-[#E07B39]">
                        {history.filter(l => l.gym_done).length}/30
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-1">
                        Avg Sleep
                      </p>
                      <p className="text-xl font-bold font-['Space_Mono'] 
                        text-[#1A1A2E]">
                        {history.length > 0 ? (history.reduce((s,l) => s + (l.sleep_hours || 0), 0) / history.length).toFixed(1) : 0}h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-[#9A9590]
                        font-['Space_Mono'] uppercase tracking-widest mb-1">
                        Earnings
                      </p>
                      <p className="text-xl font-bold font-['Space_Mono'] 
                        text-[#7C3AED]">
                        ₹{history.reduce((s,l) => s + (l.rupees_earned || 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
      </div>
      {/* NEW TABS CONTENT */}
      {activeSection === 'physique' && (
        <div className="flex flex-col gap-6">

          {/* GYM COUNTDOWN — show if not started yet */}
          {!gymStarted && (
            <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-bold font-['Space_Mono'] uppercase 
                tracking-widest text-white/40 mb-2">
                The Clock Is Ticking
              </p>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-5xl font-bold font-['Space_Mono'] text-[#E07B39]">
                    {daysUntilGym}
                  </p>
                  <p className="text-sm text-white/60 font-['Inter'] mt-1">
                    days until June 16 — your first day
                  </p>
                </div>
                <div className="flex-1 border-l border-white/10 pl-4">
                  <p className="text-xs text-white/60 font-['Inter'] leading-relaxed">
                    Use this time to dial in sleep, nutrition, and routine. 
                    The physique is built before you touch a weight.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-bold font-['Space_Mono'] uppercase 
                  tracking-widest text-white/40 mb-3">
                  Before June 16, Get These Ready
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Find gym near college',
                    'Buy protein powder',
                    'Get creatine (monohydrate)',
                    'Set protein daily target',
                    'Fix sleep schedule',
                    'Take starting measurements'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 
                      text-xs text-white/70 font-['Inter']">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E07B39]"/>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PHYSIQUE GOAL CARD */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
              uppercase tracking-widest mb-4">
              The Goal
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Physique', target: 'Shredded + Vascular', color: '#E07B39' },
                { label: 'Timeline', target: '2 Years', color: '#1A1A2E' },
                { label: 'Training', target: 'PPL Split', color: '#1A6B4A' },
                { label: 'Protein/day', target: 'BW × 1.8g', color: '#7C3AED' }
              ].map((g, i) => (
                <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono'] 
                    uppercase tracking-wider mb-1">{g.label}</p>
                  <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']" 
                    style={{ color: g.color }}>{g.target}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E0D8] pt-4">
              <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
                uppercase tracking-widest mb-3">
                Recommended Training Split (PPL)
              </p>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { day: 'Mon', type: 'PUSH', desc: 'Chest, Shoulders, Triceps', color: '#E07B39' },
                  { day: 'Tue', type: 'PULL', desc: 'Back, Biceps, Rear Delt', color: '#1A1A2E' },
                  { day: 'Wed', type: 'LEGS', desc: 'Quads, Hams, Calves', color: '#1A6B4A' },
                  { day: 'Thu', type: 'PUSH', desc: 'Volume increase', color: '#E07B39' },
                  { day: 'Fri', type: 'PULL', desc: 'Volume increase', color: '#1A1A2E' },
                  { day: 'Sat', type: 'LEGS', desc: 'Heavy + isolation', color: '#1A6B4A' }
                ].map((d, i) => (
                  <div key={i} className="rounded-xl p-3 text-center border border-[#E5E0D8]">
                    <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] mb-1">
                      {d.day}
                    </p>
                    <p className="text-xs font-bold font-['Space_Mono']" 
                      style={{ color: d.color }}>{d.type}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-2">
                Sunday: Rest / Active recovery / Long walk
              </p>
            </div>
          </div>

          {/* Pre-Gym Readiness Trend */}
          {readinessTrend.length >= 3 && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-widest mb-3">
                Pre-Gym Readiness — Last 7 Days
              </p>
              <div className="flex items-end gap-2 h-16">
                {readinessTrend.map((session, i) => {
                  const score = parseInt(session.ai_response) || 0
                  return (
                    <div key={i} className="flex-1 flex flex-col 
                      items-center gap-1">
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${score}%`,
                          minHeight: '4px',
                          backgroundColor: score >= 75 
                            ? '#1A6B4A' 
                            : score >= 50 
                              ? '#E07B39' 
                              : '#C0392B'
                        }}
                      />
                      <p className="text-[7px] text-[#9A9590] 
                        font-['Space_Mono']">
                        {new Date(session.session_date)
                          .toLocaleDateString('en-IN', { weekday: 'narrow' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Physique Progress Trend */}
          {physiqueChartData.length > 1 ? (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-widest">
                  Progress Trend
                </p>
                <div className="flex gap-1">
                  {Object.entries(metricConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold 
                        font-['Space_Mono'] uppercase tracking-wider transition-all
                        ${activeMetric === key 
                          ? 'text-white' 
                          : 'bg-[#F5F4F0] text-[#9A9590]'}`}
                      style={activeMetric === key 
                        ? { backgroundColor: cfg.color } 
                        : {}}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={physiqueChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, 
                    fontFamily: 'Space Mono', fill: '#9A9590' }} 
                    axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 9, fontFamily: 'Space Mono', 
                    fill: '#9A9590' }} axisLine={false} tickLine={false} 
                    width={35}/>
                  <Tooltip contentStyle={{ fontSize: 11, 
                    fontFamily: 'Space Mono', borderRadius: 8,
                    border: '1px solid #E5E0D8' }}/>
                  <Line
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={metricConfig[activeMetric].color}
                    strokeWidth={2}
                    dot={{ fill: metricConfig[activeMetric].color, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-[#F5F4F0] rounded-xl p-4 text-center">
              <p className="text-xs text-[#9A9590] font-['Inter']">
                Log 2+ measurements to see your trend chart
              </p>
            </div>
          )}

          {/* MEASUREMENTS TRACKER */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ruler size={15} className="text-[#1A1A2E]"/>
                <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                  uppercase tracking-widest">
                  Body Measurements
                </p>
              </div>
              <button
                onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                className="flex items-center gap-1.5 text-xs bg-[#1A1A2E] text-white 
                  px-3 py-1.5 rounded-lg font-bold font-['Space_Mono'] uppercase 
                  tracking-wider hover:bg-[#2a2a4e] transition-all"
              >
                <Plus size={12}/> Log Today
              </button>
            </div>

            {latestMeasurement && (
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {[
                  { label: 'Weight', value: `${latestMeasurement.weight_kg}kg`, unit: '' },
                  { label: 'Chest', value: latestMeasurement.chest_cm, unit: 'cm' },
                  { label: 'Waist', value: latestMeasurement.waist_cm, unit: 'cm' },
                  { label: 'Arms', value: latestMeasurement.arms_cm, unit: 'cm' },
                  { label: 'Forearms', value: latestMeasurement.forearms_cm, unit: 'cm' },
                  { label: 'Shoulders', value: latestMeasurement.shoulders_cm, unit: 'cm' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 text-center">
                    <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] 
                      uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">
                      {stat.value || '—'}{stat.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!latestMeasurement && (
              <div className="text-center py-8">
                <Ruler size={28} className="text-[#E5E0D8] mx-auto mb-2"/>
                <p className="text-sm text-[#9A9590] font-['Inter']">
                  No measurements yet. Log your starting point.
                </p>
              </div>
            )}

            <AnimatePresence>
              {showMeasurementForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#E5E0D8] pt-4 mt-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                      {[
                        { key: 'weight_kg', label: 'Weight (kg)', placeholder: '70.5' },
                        { key: 'chest_cm', label: 'Chest (cm)', placeholder: '95' },
                        { key: 'waist_cm', label: 'Waist (cm)', placeholder: '80' },
                        { key: 'arms_cm', label: 'Arms (cm)', placeholder: '34' },
                        { key: 'forearms_cm', label: 'Forearms (cm)', placeholder: '28' },
                        { key: 'shoulders_cm', label: 'Shoulders (cm)', placeholder: '110' }
                      ].map(field => (
                        <div key={field.key}>
                          <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono'] 
                            uppercase tracking-wider mb-1">{field.label}</p>
                          <input
                            type="number"
                            value={measurementForm[field.key]}
                            onChange={e => setMeasurementForm(prev => 
                              ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full bg-[#F5F4F0] border border-transparent 
                              focus:border-[#E07B39] rounded-lg p-2.5 text-sm 
                              font-['Space_Mono'] text-[#1A1A2E] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <textarea
                      value={measurementForm.notes}
                      onChange={e => setMeasurementForm(prev => 
                        ({ ...prev, notes: e.target.value }))}
                      placeholder="How do you look/feel today? Any observations..."
                      className="w-full bg-[#F5F4F0] border border-transparent 
                        focus:border-[#E07B39] rounded-lg p-3 text-sm font-['Inter'] 
                        text-[#1A1A2E] placeholder-[#9A9590] resize-none 
                        focus:outline-none min-h-[60px] mb-3"
                    />
                    <button
                      onClick={saveMeasurement}
                      className="bg-[#1A6B4A] text-white px-4 py-2 rounded-lg 
                        text-xs font-bold font-['Space_Mono'] uppercase tracking-wider 
                        hover:opacity-90 transition-all"
                    >
                      Save Measurements
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {physiqueLogs.length > 1 && (
              <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
                <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
                  uppercase tracking-widest mb-3">History</p>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {physiqueLogs.slice(1).map((log, i) => (
                    <div key={i} className="flex items-center justify-between 
                      bg-[#F5F4F0] rounded-lg px-3 py-2">
                      <span className="text-[10px] text-[#9A9590] font-['Space_Mono']">
                        {format(new Date(log.log_date), 'MMM d, yyyy')}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono']">
                          {log.weight_kg}kg
                        </span>
                        <span className="text-[10px] text-[#9A9590] font-['Space_Mono']">
                          Waist: {log.waist_cm}cm
                        </span>
                        <span className="text-[10px] text-[#9A9590] font-['Space_Mono']">
                          Arms: {log.arms_cm}cm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-[20px] font-extrabold text-[#1A1A2E] 
              uppercase tracking-tight">PHYSIQUE ROADMAP</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(phaseNum => (
                <PhaseCard
                  key={phaseNum}
                  phase={phaseNum}
                  milestones={milestones.filter(m => m.phase === phaseNum)}
                  gymStreak={gymStreak}
                  onToggle={toggleMilestone}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {activeSection === 'training' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Dumbbell size={18} className="text-[#1A1A2E]"/>
                <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                  uppercase tracking-widest">
                  Daily Training Log
                </p>
              </div>
              <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
                uppercase">
                {format(new Date(), 'EEEE, MMM d')}
              </p>
            </div>

            {/* Quick Add Exercise */}
            <div className="bg-[#F5F4F0] rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Exercise Name"
                  value={newExercise.name}
                  onChange={e => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border border-transparent focus:border-[#E07B39] 
                    rounded-lg px-3 py-2 text-sm font-['Inter'] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={newExercise.sets}
                  onChange={e => setNewExercise(prev => ({ ...prev, sets: e.target.value }))}
                  className="bg-white border border-transparent focus:border-[#E07B39] 
                    rounded-lg px-3 py-2 text-sm font-['Space_Mono'] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={newExercise.reps}
                  onChange={e => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                  className="bg-white border border-transparent focus:border-[#E07B39] 
                    rounded-lg px-3 py-2 text-sm font-['Space_Mono'] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={newExercise.weight}
                  onChange={e => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                  className="bg-white border border-transparent focus:border-[#E07B39] 
                    rounded-lg px-3 py-2 text-sm font-['Space_Mono'] focus:outline-none"
                />
              </div>
              <button
                onClick={saveExercise}
                className="w-full bg-[#1A1A2E] text-white py-2 rounded-lg text-xs 
                  font-bold font-['Space_Mono'] uppercase tracking-widest 
                  hover:bg-[#2a2a4e] transition-all"
              >
                ADD EXERCISE
              </button>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              {exerciseLogs.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[#E5E0D8] rounded-xl">
                  <p className="text-sm text-[#9A9590] font-['Inter'] italic">
                    No exercises logged for today. Let's get to work.
                  </p>
                </div>
              )}
              {exerciseLogs.map(exercise => (
                <div 
                  key={exercise.id}
                  className={clsx(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    exercise.is_completed 
                      ? "bg-emerald-50 border-emerald-200" 
                      : "bg-white border-[#E5E0D8] hover:border-[#1A1A2E]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleExercise(exercise.id, !exercise.is_completed)}
                      className={clsx(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        exercise.is_completed 
                          ? "bg-[#1A6B4A] border-[#1A6B4A] text-white" 
                          : "bg-white border-[#E5E0D8]"
                      )}
                    >
                      {exercise.is_completed && <Check size={14} />}
                    </button>
                    <div>
                      <p className={clsx(
                        "text-sm font-bold font-['Inter']",
                        exercise.is_completed ? "text-[#1A6B4A] line-through opacity-70" : "text-[#1A1A2E]"
                      )}>
                        {exercise.exercise_name}
                      </p>
                      <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">
                        {exercise.sets} Sets x {exercise.reps} Reps • {exercise.weight_kg} kg
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteExercise(exercise.id)}
                    className="text-[#9A9590] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-[#E07B39]">
                <Bot size={16} />
                <p className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-widest">
                  Abhishek's Exercise Chat
                </p>
              </div>
              <p className="text-sm font-['Inter'] text-white/70 mb-4 max-w-md leading-relaxed">
                Need to swap an exercise? Not sure about your form? 
                Ask your coach anything about today's routine.
              </p>
              <button 
                onClick={() => setActiveSection('coach')}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg 
                  text-[10px] font-bold font-['Space_Mono'] uppercase tracking-widest transition-all"
              >
                Start Chat →
              </button>
            </div>
            <Dumbbell className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12" />
          </div>
        </div>
      )}

      {activeSection === 'hair' && (
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={15} className="text-[#E07B39]"/>
              <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                uppercase tracking-widest">
                Face Protocol
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#FFF0E6] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[#E07B39] font-['Space_Mono'] 
                  uppercase tracking-widest mb-3">Morning (2 min)</p>
                <div className="flex flex-col gap-2">
                  {[
                    { step: '1', action: 'Wash face with cold water', note: 'No soap in morning' },
                    { step: '2', action: 'Moisturizer', note: 'Neutrogena Hydro Boost or Minimalist' },
                    { step: '3', action: 'SPF 50 sunscreen', note: 'Non-negotiable if going out' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#E07B39] text-white 
                        text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {s.step}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A2E] font-['Inter']">
                          {s.action}
                        </p>
                        <p className="text-[10px] text-[#9A9590] font-['Inter']">{s.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#EEF2FF] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[#1A1A2E] font-['Space_Mono'] 
                  uppercase tracking-widest mb-3">Night (3 min)</p>
                <div className="flex flex-col gap-2">
                  {[
                    { step: '1', action: 'Face wash', note: 'Cetaphil or Simple cleanser' },
                    { step: '2', action: 'Niacinamide serum', note: 'Minimalist 10% — reduces oil, pores' },
                    { step: '3', action: 'Moisturizer', note: 'Heavier than morning is fine' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-[#1A1A2E] text-white 
                        text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {s.step}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A2E] font-['Inter']">
                          {s.action}
                        </p>
                        <p className="text-[10px] text-[#9A9590] font-['Inter']">{s.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
              <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
                uppercase tracking-widest mb-2">
                Post-Gym Face Care
              </p>
              <p className="text-xs text-[#3D3830] font-['Inter'] leading-relaxed">
                After gym — wash face immediately with cold water + cleanser. 
                Sweat + touching face = breakouts. Don't let sweat dry on skin.
                Apply light moisturizer only, skip SPF if staying indoors.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wind size={15} className="text-[#1A6B4A]"/>
              <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                uppercase tracking-widest">
                Long Hair Protocol
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#F0FDF4] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[#1A6B4A] font-['Space_Mono'] 
                  uppercase tracking-widest mb-3">
                  Wash Routine
                </p>
                <div className="flex flex-col gap-2 text-xs font-['Inter'] text-[#3D3830]">
                  <p>• <strong>Frequency:</strong> 2-3x per week max (daily washing strips oils)</p>
                  <p>• <strong>After gym days:</strong> Rinse with water only, no shampoo</p>
                  <p>• <strong>Shampoo:</strong> Mamaearth Onion or WOW Onion — sulphate free</p>
                  <p>• <strong>Conditioner:</strong> Every wash, mid-lengths to ends only</p>
                  <p>• <strong>Cold rinse:</strong> Final rinse with cold water — seals cuticle</p>
                </div>
              </div>

              <div className="bg-[#FFF0E6] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[#E07B39] font-['Space_Mono'] 
                  uppercase tracking-widest mb-3">
                  Oil Protocol
                </p>
                <div className="flex flex-col gap-2 text-xs font-['Inter'] text-[#3D3830]">
                  <p>• <strong>Castor oil:</strong> Scalp massage 2x/week, 1hr before wash</p>
                  <p>• <strong>Coconut oil:</strong> Ends and mid-lengths — prevents split ends</p>
                  <p>• <strong>Don't:</strong> Oil before gym — sweat + oil clogs follicles</p>
                  <p>• <strong>Scalp massage:</strong> 5 min while oiling — increases blood flow</p>
                  <p>• <strong>Bhringraj oil:</strong> Best for growth, available at any medical</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E] rounded-xl p-4 text-white">
              <p className="text-[10px] font-bold text-white/40 font-['Space_Mono'] 
                uppercase tracking-widest mb-3">
                Long Hair + Gym — The Rules
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {[
                  'Always tie hair during workouts — loose hair causes breakage and distracts',
                  'Use scrunchie not elastic band — elastic causes mechanical damage at the tie point',
                  'Don\'t tie wet hair — air dry first or use low heat diffuser',
                  'Silk/satin pillowcase — cotton creates friction and breakage overnight',
                  'Trim 1cm every 3 months — removes split ends before they travel up the shaft',
                  'Protein treatment monthly — mix egg + curd + coconut oil, 30 min mask'
                ].map((tip, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E07B39] shrink-0 mt-1.5"/>
                    <p className="text-[11px] text-white/70 font-['Inter'] leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E5E0D8]">
              <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] 
                uppercase tracking-widest mb-3">
                Products (All available in India)
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { name: 'WOW Onion Shampoo', price: '₹349', type: 'Shampoo' },
                  { name: 'Mamaearth Conditioner', price: '₹249', type: 'Conditioner' },
                  { name: 'Castor Oil (Figaro)', price: '₹150', type: 'Growth oil' },
                  { name: 'Minimalist Niacinamide', price: '₹399', type: 'Face serum' }
                ].map((p, i) => (
                  <div key={i} className="bg-[#F5F4F0] rounded-xl p-3">
                    <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] mb-1">
                      {p.type}
                    </p>
                    <p className="text-xs font-bold text-[#1A1A2E] font-['Inter'] mb-1">
                      {p.name}
                    </p>
                    <p className="text-xs font-bold text-[#1A6B4A] font-['Space_Mono']">
                      {p.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
              uppercase tracking-widest mb-4">
              Today's Face & Hair Checks
            </p>
            <div className="flex flex-col gap-4">
              {[
                { id: 'skincare_am', icon: '🌅', label: 'AM Skincare done', sub: 'Moisturizer + SPF' },
                { id: 'skincare_pm', icon: '🌙', label: 'PM Skincare done', sub: 'Cleanser + niacinamide + moisturizer' },
                { id: 'bath_done', icon: '🚿', label: 'Hair washed today (if wash day)', sub: 'Or rinse after gym' },
              ].map(h => (
                <HabitRow
                  key={h.id}
                  icon={h.icon}
                  label={h.label}
                  sub={h.sub}
                  value={todayLog?.[h.id] || false}
                  onChange={(v) => handleToggle(h.id, v, 5, 1)}
                  color="#7C3AED"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'costs' && (
        <div className="flex flex-col gap-5">
          <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white">
            <p className="text-[10px] font-bold text-white/40 font-['Space_Mono'] 
              uppercase tracking-widest mb-2">
              {currentMonth}
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold font-['Space_Mono'] text-white">
                  ₹{healthCosts.reduce((s, c) => s + c.amount_inr, 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/50 font-['Inter'] mt-1">
                  total health investment this month
                </p>
              </div>
              <button
                onClick={() => setShowCostForm(!showCostForm)}
                className="flex items-center gap-2 bg-[#E07B39] text-white px-4 py-2 
                  rounded-xl text-xs font-bold font-['Space_Mono'] uppercase 
                  tracking-wider hover:opacity-90 transition-all"
              >
                <Plus size={12}/> Add Expense
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
              uppercase tracking-widest mb-4">
              Optimal Monthly Budget (Student Edition)
            </p>
            <div className="flex flex-col gap-3">
              {[
                { item: 'Gym membership (Nagpur avg)', amount: 600, category: 'Gym', essential: true },
                { item: 'Whey protein (1kg — ON/MuscleBlaze)', amount: 1500, category: 'Supplements', essential: true },
                { item: 'Creatine monohydrate (100g)', amount: 300, category: 'Supplements', essential: true },
                { item: 'Fruits (bananas, apples — daily)', amount: 600, category: 'Food', essential: true },
                { item: 'Eggs (30 per week)', amount: 500, category: 'Food', essential: true },
                { item: 'Shampoo + conditioner', amount: 400, category: 'Hair', essential: false },
                { item: 'Skincare (moisturizer + SPF)', amount: 500, category: 'Face', essential: false },
                { item: 'Castor oil + bhringraj oil', amount: 250, category: 'Hair', essential: false }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between 
                  py-2 border-b border-[#F5F4F0] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      'text-[9px] font-bold font-["Space_Mono"] uppercase px-2 py-0.5 rounded-full',
                      item.essential 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-[#F5F4F0] text-[#9A9590]'
                    )}>
                      {item.essential ? 'Essential' : 'Optional'}
                    </span>
                    <p className="text-xs font-['Inter'] text-[#1A1A2E]">{item.item}</p>
                  </div>
                  <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">
                    ₹{item.amount}
                  </p>
                </div>
              ))}
              <div className="pt-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase">
                  Total Minimum
                </p>
                <p className="text-lg font-bold text-[#E07B39] font-['Space_Mono']">
                  ₹4,650/mo
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showCostForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
                  <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                    uppercase tracking-widest mb-4">
                    Log Expense
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono'] 
                        uppercase tracking-wider mb-1">Item</p>
                      <input
                        type="text"
                        value={costForm.item}
                        onChange={e => setCostForm(prev => ({ ...prev, item: e.target.value }))}
                        placeholder="e.g. Whey protein"
                        className="w-full bg-[#F5F4F0] border border-transparent 
                          focus:border-[#E07B39] rounded-lg p-2.5 text-sm font-['Inter'] 
                          text-[#1A1A2E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono'] 
                        uppercase tracking-wider mb-1">Amount (₹)</p>
                      <input
                        type="number"
                        value={costForm.amount_inr}
                        onChange={e => setCostForm(prev => 
                          ({ ...prev, amount_inr: e.target.value }))}
                        placeholder="1500"
                        className="w-full bg-[#F5F4F0] border border-transparent 
                          focus:border-[#E07B39] rounded-lg p-2.5 text-sm 
                          font-['Space_Mono'] text-[#1A1A2E] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-[9px] font-bold text-[#9A9590] font-['Space_Mono'] 
                      uppercase tracking-wider mb-1">Category</p>
                    <div className="flex gap-2 flex-wrap">
                      {['Supplements','Food','Gym','Hair','Face','Other'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCostForm(prev => ({ ...prev, category: cat }))}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-xs font-bold font-["Space_Mono"] uppercase transition-all',
                            costForm.category === cat
                              ? 'bg-[#1A1A2E] text-white'
                              : 'bg-[#F5F4F0] text-[#9A9590] hover:bg-[#E5E0D8]'
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={saveCost}
                    className="bg-[#1A6B4A] text-white px-4 py-2 rounded-lg text-xs 
                      font-bold font-['Space_Mono'] uppercase tracking-wider 
                      hover:opacity-90 transition-all"
                  >
                    Save Expense
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {healthCosts.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
              <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                uppercase tracking-widest mb-4">
                Logged This Month
              </p>
              <div className="flex flex-col gap-2">
                {healthCosts.map((cost, i) => (
                  <div key={i} className="flex items-center justify-between 
                    py-2 border-b border-[#F5F4F0] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold font-['Space_Mono'] 
                        uppercase px-2 py-0.5 rounded-full bg-[#F5F4F0] text-[#9A9590]">
                        {cost.category}
                      </span>
                      <p className="text-xs text-[#1A1A2E] font-['Inter']">{cost.item}</p>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">
                      ₹{cost.amount_inr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'coach' && (
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-[280px] flex flex-col gap-3">
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bot size={15} className="text-[#E07B39]"/>
                <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                  uppercase tracking-widest">
                  AI Coach
                </p>
              </div>
              <p className="text-xs text-[#9A9590] font-['Inter'] mb-4 leading-relaxed">
                Personalized advice based on your actual data — 
                your score, measurements, and budget.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { type: 'weekly', label: 'Weekly Assessment', 
                    desc: 'Where you are + what to focus on' },
                  { type: 'diet', label: 'Indian Diet Plan', 
                    desc: 'Meal plan for lean muscle on ₹300/day' },
                  { type: 'hair', label: 'Hair Coach', 
                    desc: 'Long hair protocol for gym guys' },
                  { type: 'cost', label: 'Budget Optimizer', 
                    desc: 'What to buy and what to skip' }
                ].map(prompt => (
                  <button
                    key={prompt.type}
                    onClick={() => getAiCoach(prompt.type)}
                    disabled={isAiLoading}
                    className="text-left p-3 rounded-xl border border-[#E5E0D8] 
                      hover:border-[#E07B39] hover:bg-[#FFF0E6] transition-all 
                      disabled:opacity-50 group"
                  >
                    <p className="text-xs font-bold text-[#1A1A2E] font-['Inter'] 
                      group-hover:text-[#E07B39] transition-colors">
                      {prompt.label}
                    </p>
                    <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-0.5">
                      {prompt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 
              min-h-[500px] flex flex-col">
              
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F5F4F0]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg 
                      flex items-center justify-center">
                      <Bot size={16} className="text-[#E07B39]"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] 
                        uppercase tracking-wider">
                        Vegetarian Coach
                      </p>
                      <p className="text-[9px] text-emerald-600 font-bold font-['Space_Mono'] uppercase">
                        Online • Analyzing Protien
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setChatMessages([]); setAiCoachResponse(''); }}
                    className="text-[9px] font-bold text-[#9A9590] hover:text-[#1A1A2E] 
                      font-['Space_Mono'] uppercase tracking-widest"
                  >
                    Reset Chat
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-[#E5E0D8]">
                  {aiCoachResponse && chatMessages.length === 0 && (
                    <div className="bg-[#F5F4F0] rounded-2xl p-4 border-l-4 border-[#E07B39]">
                      <p className="text-sm text-[#1A1A2E] font-['Inter'] leading-relaxed whitespace-pre-wrap">
                        {aiCoachResponse}
                      </p>
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i}
                      className={clsx(
                        "flex flex-col max-w-[85%]",
                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={clsx(
                        "p-4 rounded-2xl text-sm font-['Inter'] leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-[#1A1A2E] text-white rounded-tr-none" 
                          : "bg-[#F5F4F0] text-[#1A1A2E] rounded-tl-none border border-[#E5E0D8]"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="mr-auto items-start flex flex-col max-w-[85%]">
                      <div className="bg-[#F5F4F0] p-4 rounded-2xl rounded-tl-none border border-[#E5E0D8] animate-pulse">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#9A9590] rounded-full animate-bounce"/>
                          <div className="w-1.5 h-1.5 bg-[#9A9590] rounded-full animate-bounce [animation-delay:0.2s]"/>
                          <div className="w-1.5 h-1.5 bg-[#9A9590] rounded-full animate-bounce [animation-delay:0.4s]"/>
                        </div>
                      </div>
                    </div>
                  )}

                  {chatMessages.length === 0 && !aiCoachResponse && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                      <Bot size={48} className="mb-4" />
                      <p className="text-sm font-['Inter'] text-center">
                        Ask me about your vegetarian diet, <br/>
                        today's exercises, or your physique goals.
                      </p>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about your workout or diet..."
                    className="flex-1 bg-[#F5F4F0] border border-transparent 
                      focus:border-[#E07B39] rounded-xl px-4 py-3 text-sm 
                      font-['Inter'] text-[#1A1A2E] focus:outline-none"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-[#1A1A2E] text-white p-3 rounded-xl hover:bg-[#2a2a4e] 
                      transition-all disabled:opacity-50"
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE LOOT OVERLAY */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-[#1A1A2E]/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
             <ScoreRing score={todayLog.day_score || 0} radius={20} width={3} />
             <span className="absolute font-mono text-[10px] font-black text-white">{todayLog.day_score || 0}%</span>
          </div>
          <div>
            <p className="font-mono text-[14px] font-black text-[#E8F5EF] leading-none">+{(todayLog.total_checks || 0) * 10} XP</p>
            <p className="font-mono text-[12px] font-black text-[#1A6B4A] mt-1 leading-none">+₹{(todayLog.total_checks || 0) * 4}</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white/10 rounded-lg text-[10px] font-bold text-white tracking-widest uppercase">VIEW LOOT</button>
      </div>

      {/* Floating XP Popups */}
      <div className="fixed bottom-24 right-8 pointer-events-none z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {activeXpPopups.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-[#E8F5EF] text-[#1A6B4A] px-4 py-2 rounded-full shadow-lg border border-[#1A6B4A]/20 flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="font-mono text-xs font-black uppercase">+{p.amount} XP · {p.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <MotivationalPopup 
        isOpen={showSubmitModal} 
        onClose={() => setShowSubmitModal(false)} 
        score={modalData.score} 
        earnings={modalData.earnings}
      />

      <GymChecklist
        isOpen={gymChecklistOpen}
        onComplete={(data) => {
          setGymReadinessScore(data.readinessScore)
          setGymChecklistOpen(false)
          updateLog({ gym_done: true })
          
          // Trigger Jarvis reactions manually
          triggerJarvisToast({
            type: 'success',
            title: 'GYM SESSION',
            xp: 25,
            message: `Readiness: ${data.readinessScore}% — Logged. Recovery starts now.`,
            duration: 3500
          });
          
          // Save readiness score to ai_sessions
          supabase.from('ai_sessions').insert({
            type: 'gym_readiness',
            session_date: getTodayIST(),
            user_input: JSON.stringify(data.answers),
            ai_response: data.readinessScore.toString(),
            context_snapshot: JSON.stringify({ 
              score: data.readinessScore,
              totalScore: data.totalScore
            })
          }).catch(() => {})
        }}
        onSkip={() => {
          setGymChecklistOpen(false)
          updateLog({ gym_done: true })
        }}
      />
    </div>
  );
};

// --- HELPERS & CHIPS ---

const lootList = (log) => {
  if (!log) return [];
  const items = [];
  if (log.gym_done) items.push({ label: 'Gym Done', xp: 25, rupee: 6 });
  if (log.meal_1_done) items.push({ label: 'Meal 1', xp: 8, rupee: 2 });
  if (log.meal_2_done) items.push({ label: 'Meal 2', xp: 8, rupee: 2 });
  if (log.protein_hit) items.push({ label: 'Protein Hit', xp: 10, rupee: 3 });
  if (log.no_junk_before_6pm) items.push({ label: 'No Junk', xp: 10, rupee: 3 });
  if (log.slept_by_midnight) items.push({ label: 'Early Sleep', xp: 10, rupee: 2 });
  if (log.woke_by_630) items.push({ label: 'Early Wake', xp: 10, rupee: 2 });
  if (log.bath_done) items.push({ label: 'Bath', xp: 5, rupee: 1 });
  if (log.bed_made) items.push({ label: 'Bed', xp: 5, rupee: 1 });
  if (log.teeth_brushed) items.push({ label: 'Teeth', xp: 5, rupee: 1 });
  if (log.skincare_am) items.push({ label: 'Skin AM', xp: 5, rupee: 1 });
  if (log.skincare_pm) items.push({ label: 'Skin PM', xp: 5, rupee: 1 });
  if (log.study_table_organised) items.push({ label: 'SDE Desk', xp: 5, rupee: 1 });
  return items;
};

const ScoreRing = ({ score, radius = 50, width = 6 }) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#1A6B4A' : score >= 50 ? '#E07B39' : '#C0392B';

  return (
    <svg width={(radius + width) * 2} height={(radius + width) * 2} className="transform -rotate-90">
      <circle
        cx={radius + width}
        cy={radius + width}
        r={radius}
        stroke="#E5E0D8"
        strokeWidth={width}
        fill="transparent"
      />
      <motion.circle
        cx={radius + width}
        cy={radius + width}
        r={radius}
        stroke={color}
        strokeWidth={width}
        fill="transparent"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
};

const HabitRow = ({ icon, label, sub, value, onChange, color }) => (
  <div className="group flex items-center justify-between transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#F5F4F0] flex items-center justify-center text-[20px] shadow-sm transform group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h5 className="font-body text-[14px] font-bold text-[#1A1A2E] leading-none">{label}</h5>
        {sub && <p className="text-[11px] font-medium text-[#9A9590] mt-1">{sub}</p>}
      </div>
    </div>
    
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <div className={clsx(
        "w-12 h-6 rounded-full transition-all duration-300 relative",
        value ? "" : "bg-[#E5E0D8]"
      )} style={{ backgroundColor: value ? color : undefined }}>
        <div className={clsx(
          "absolute top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 transform shadow-sm",
          value ? "translate-x-7" : "translate-x-1"
        )} />
        {value && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 4, opacity: 0 }} 
            className="absolute inset-0 bg-white/40 rounded-full" 
            style={{ pointerEvents: 'none' }}
          />
        )}
      </div>
    </label>
  </div>
);

const PhaseCard = ({ phase, milestones, gymStreak, onToggle }) => {
  const titles = ['ROUTINE LOCK', 'FOUNDATION BUILD', 'VISIBLE PROGRESS', 'HE IS BUILT DIFFERENT'];
  const targets = ['Gym 25/30 days', 'Strength Increase', 'Conditioning Focus', 'Identity Lock'];
  
  return (
    <Card className="p-6 bg-white border border-[#E5E0D8]/40 flex flex-col items-center text-center space-y-6">
       <div className="w-10 h-10 rounded-full bg-[#1A1A2E] flex items-center justify-center font-display text-white text-[18px] font-extrabold ring-4 ring-[#F5F4F0]">
         {phase}
       </div>
       <div className="space-y-1">
         <h4 className="font-display text-[14px] font-extrabold uppercase tracking-tight text-[#1A1A2E]">{titles[phase-1]}</h4>
         <p className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest">Target: {targets[phase-1]}</p>
       </div>

       {phase === 1 && (
         <div className="w-full space-y-2">
            <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${(gymStreak/30)*100}%` }} className="h-full bg-[#E07B39]" />
            </div>
         </div>
       )}

       <div className="w-full space-y-3 pt-2 text-left">
         {milestones.map(m => (
           <div 
            key={m.id} 
            onClick={() => onToggle(m.id, !m.completed)}
            className="flex items-center gap-2 cursor-pointer group"
           >
              <div className={clsx(
                "w-3.5 h-3.5 border rounded flex items-center justify-center transition-all",
                m.completed ? "bg-[#1A6B4A] border-[#1A6B4A]" : "border-[#E5E0D8] bg-white group-hover:border-[#1A1A2E]"
              )}>
                {m.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
              </div>
              <span className={clsx("text-[11px] font-medium leading-none", m.completed ? "text-[#9A9590] line-through" : "text-[#3D3830]")}>{m.text}</span>
           </div>
         ))}
       </div>

       <div className="w-full pt-4">
         <Badge 
          text={milestones.every(m => m.completed) ? 'COMPLETE' : phase === 1 ? 'IN PROGRESS' : 'LOCKED'} 
          color={milestones.every(m => m.completed) ? 'emerald' : phase === 1 ? 'orange' : 'muted'}
          className="w-full flex justify-center py-1.5 font-bold tracking-[0.1em] text-[10px]"
         />
       </div>
    </Card>
  );
};

const Badge = ({ text, color, className }) => {
  const styles = {
    emerald: 'bg-[#E8F5EF] text-[#1A6B4A]',
    orange: 'bg-[#FFF0E6] text-[#E07B39]',
    muted: 'bg-[#F5F4F0] text-[#9A9590]',
    navy: 'bg-[#F0F0FF] text-[#1A1A2E]'
  };
  return (
    <div className={clsx("rounded font-body", styles[color], className)}>
      {text}
    </div>
  );
};

const ExerciseItem = ({ ex }) => {
  const [exDone, setExDone] = React.useState(false);
  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 border-b',
        'border-[#F5F4F0] last:border-0 transition-all',
        exDone ? 'bg-[#F0FDF4]' : 'bg-white'
      )}
    >
      <button
        onClick={() => setExDone(!exDone)}
        className={clsx(
          'w-5 h-5 rounded border-2 flex items-center',
          'justify-center shrink-0 mt-0.5 transition-all',
          exDone
            ? 'bg-[#1A6B4A] border-[#1A6B4A]'
            : 'border-[#E5E0D8] bg-white'
        )}
      >
        {exDone && (
          <Check size={11} className="text-white" strokeWidth={3}/>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={clsx(
            'text-sm font-bold font-["Inter"]',
            exDone
              ? 'text-[#9A9590] line-through'
              : 'text-[#1A1A2E]'
          )}>
            {ex.name}
          </p>
          <span className="text-[10px] font-bold 
            font-['Space_Mono'] text-[#9A9590] shrink-0">
            {ex.sets} × {ex.reps}
          </span>
        </div>
        <p className="text-[10px] text-[#9A9590] 
          font-['Inter'] mt-0.5 leading-relaxed">
          {ex.note}
        </p>
      </div>
    </div>
  );
};

export default Health;
