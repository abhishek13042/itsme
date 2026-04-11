import React, { useState, useEffect, useMemo } from 'react';
import { useAiStore } from '../store/aiStore';
import { useXpStore } from '../store/xpStore';
import { useWalletStore } from '../store/walletStore';
import { useQuestStore } from '../store/questStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { 
  Bot, 
  Zap, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Send,
  Calendar,
  Wallet,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  Brain
} from 'lucide-react';
import { format, isAfter, setHours } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const AIPlanner = () => {
  const { todayPlan, history, loading, loadingMessage, error, loadPlans, generateTodayPlan, submitEveningReview } = useAiStore();
  const { streakDays } = useXpStore();
  const { balance } = useWalletStore();
  const { activeQuests } = useQuestStore();

  const [reviewInput, setReviewInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const isEvening = useMemo(() => {
    return isAfter(new Date(), setHours(new Date(), 18));
  }, []);

  const handleGenerate = async () => {
    await generateTodayPlan();
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewInput.trim()) return;
    await submitEveningReview(reviewInput);
    setReviewInput('');
  };

  const prefillReview = (text) => {
    setReviewInput(prev => prev ? `${prev} ${text}` : text);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-navy-900 rounded-3xl flex items-center justify-center shadow-2xl shadow-navy-100"
        >
          <Bot className="w-12 h-12 text-white" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-lg font-display font-bold text-slate-900 tracking-tight">{loadingMessage}</p>
          <div className="flex justify-center gap-1.5">
             {[0, 1, 2].map(i => (
               <motion.div 
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-navy-400" 
               />
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">AI COACH</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Daily plan + honest evening review</p>
        </div>
        <Badge text={format(new Date(), 'EEEE, MMM do')} color="navy" />
      </div>

      {error && (
        <Card className="bg-rose-50 border-rose-100 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <p className="text-sm font-medium text-rose-600">{error}</p>
          <Button onClick={handleGenerate} variant="ghost" className="ml-auto text-rose-600">Retry</Button>
        </Card>
      )}

      {/* Morning Plan Section */}
      <section className="space-y-6">
        {!todayPlan?.morning_plan ? (
          <Card className="p-12 text-center flex flex-col items-center border-navy-100 bg-white shadow-xl shadow-navy-100/10">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-navy-900" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Good morning, Abhishek</h2>
            <p className="text-slate-500 font-medium mb-8">Ready to generate your battle plan for today?</p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <Badge text={`${activeQuests?.length || 0} quests pending`} color="label" />
              <Badge text={`Streak: ${streakDays} days`} color="amber" />
              <Badge text={`Wallet: ₹${(balance / 100).toFixed(0)}`} color="success" />
              <Badge text="Exams ahead" color="danger" />
            </div>

            <Button onClick={handleGenerate} variant="primary" className="h-14 px-10 text-base shadow-xl shadow-navy-100">
              GENERATE TODAY'S PLAN
            </Button>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-0 overflow-hidden border-navy-100 shadow-2xl">
              <div className="bg-navy-900 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">Today's Battle Plan</h2>
                </div>
                <p className="text-[10px] font-bold text-navy-400 uppercase">
                  Generated at {format(new Date(todayPlan.plan_generated_at), 'h:mm a')}
                </p>
              </div>

              <div className="p-8 space-y-8">
                {/* Top Priority */}
                <div className="bg-amber-50/50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">🎯 Top Priority Today</p>
                  <p className="text-lg font-display font-bold text-slate-900">{todayPlan.morning_plan.top_priority}</p>
                </div>

                {/* Time Blocks */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule</h3>
                  <div className="space-y-3">
                    {todayPlan.morning_plan.time_blocks.map((block, idx) => (
                      <div key={idx} className="flex items-center gap-6 p-4 rounded-xl border border-slate-50 hover:border-navy-100 transition-all group">
                        <div className="w-28 shrink-0">
                          <span className="inline-block px-3 py-1 bg-navy-50 text-navy-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                            {block.time}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{block.task}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <Badge text={block.category} color="label" />
                           <span className="text-[10px] font-mono font-bold text-xp">+{block.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivation & Warning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coach Notes</p>
                    <p className="text-sm font-medium italic text-slate-600 leading-relaxed">
                      "{todayPlan.morning_plan.motivation}"
                    </p>
                  </div>
                  {todayPlan.morning_plan.warning && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-700 leading-tight">
                        {todayPlan.morning_plan.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button onClick={() => handleGenerate()} variant="ghost" size="sm" className="text-navy-400 hover:text-navy-900 uppercase tracking-widest text-[9px] font-bold">
                  <RefreshCw className="w-3 h-3 mr-2" /> REGENERATE PLAN
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </section>

      {/* Evening Review Section */}
      <section className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1">EVENING DEBRIEF</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Dump your day. Get brutal honest feedback.</p>
          </div>
        </div>

        {!todayPlan?.evening_review ? (
          <div className={clsx("space-y-6", !isEvening && "opacity-50 grayscale pointer-events-none")}>
            <Card className="p-8">
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="space-y-3">
                  <textarea 
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    placeholder="How did today go? What did you actually do? What did you skip and why? Be honest..."
                    className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-navy-100 outline-none resize-none transition-all placeholder:text-slate-300"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => prefillReview('Solid day. Hit all major targets.')} className="px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-success hover:text-white transition-all">Solid day ✅</button>
                    <button type="button" onClick={() => prefillReview('Okay day. Procrastinated a bit on SDE.')} className="px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 hover:text-white transition-all">Okay day ⚠️</button>
                    <button type="button" onClick={() => prefillReview('Rough day. Motivation was zero, need better sleep.')} className="px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Rough day ❌</button>
                  </div>
                </div>
                <Button type="submit" variant="primary" className="w-full h-14 text-sm tracking-widest shadow-xl shadow-navy-100">
                  SUBMIT FOR REVIEW
                </Button>
              </form>
            </Card>
            {!isEvening && (
               <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Reveals at 6:00 PM</p>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Day Score */}
              <Card className="md:col-span-4 p-8 flex flex-col items-center justify-center text-center bg-white border-navy-100 shadow-xl">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Discipline Score</p>
                 <h3 className={clsx(
                   "text-7xl font-display font-bold mb-4",
                   todayPlan.evening_review.score >= 8 ? "text-success" : 
                   todayPlan.evening_review.score >= 5 ? "text-amber-500" : "text-rose-500"
                 )}>
                   {todayPlan.evening_review.score}<span className="text-xl text-slate-300">/10</span>
                 </h3>
                 <div className="space-y-4 w-full pt-6 border-t border-slate-50">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Today's Earnings</p>
                       <p className="text-lg font-mono font-bold text-success">+{todayPlan.evening_review.rupee_summary}</p>
                    </div>
                 </div>
              </Card>

              {/* Analysis */}
              <div className="md:col-span-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-6 border-l-4 border-success">
                       <h4 className="text-[10px] font-bold text-success uppercase tracking-widest mb-4">Wins</h4>
                       <ul className="space-y-2">
                         {todayPlan.evening_review.wins.map((win, i) => (
                           <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                             <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" /> {win}
                           </li>
                         ))}
                       </ul>
                    </Card>
                    <Card className="p-6 border-l-4 border-rose-500">
                       <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-4">Misses</h4>
                       <ul className="space-y-2">
                         {todayPlan.evening_review.misses.map((miss, i) => (
                           <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                             <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {miss}
                           </li>
                         ))}
                       </ul>
                    </Card>
                 </div>

                 <Card className="p-6 bg-amber-50/50 border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 italic">Biggest Bottleneck</p>
                    <p className="text-sm font-bold text-slate-900 italic">"{todayPlan.evening_review.biggest_bottleneck}"</p>
                 </Card>

                 <Card className="p-6 bg-navy-900 border-none relative overflow-hidden">
                    <div className="relative z-10">
                       <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">🎯 Focus Tomorrow On</p>
                       <p className="text-sm font-bold text-white">{todayPlan.evening_review.tomorrow_priority}</p>
                    </div>
                    <ArrowRight className="absolute right-4 bottom-4 w-8 h-8 text-navy-800" />
                 </Card>
              </div>

              {/* Honest Feedback */}
              <Card className="md:col-span-12 p-8 bg-slate-50 border-slate-100 italic">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 not-italic">Coach's Honest Feedback</p>
                 <p className="text-sm font-bold text-slate-700 leading-relaxed">
                   "{todayPlan.evening_review.honest_feedback}"
                 </p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 not-italic">— No sugarcoating. This is what you needed to hear.</p>
              </Card>
            </div>
          </motion.div>
        )}
      </section>

      {/* History */}
      <section className="space-y-6">
         <button 
           onClick={() => setShowHistory(!showHistory)}
           className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all group"
         >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Past 7 Days Review</h3>
            </div>
            <ChevronDown className={clsx("w-4 h-4 transition-transform", showHistory && "rotate-180")} />
         </button>

         <AnimatePresence>
           {showHistory && (
             <motion.div 
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               className="overflow-hidden"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                   {history.filter(p => p.evening_review).map(day => (
                     <motion.div key={day.id} className="p-5 hover:border-navy-200 transition-all group cursor-pointer border border-slate-100 rounded-2xl bg-white">
                        <div className="flex justify-between items-start mb-4">
                           <p className="text-xs font-bold text-slate-900">{format(new Date(day.plan_date), 'EEE, MMM do')}</p>
                           <span className={clsx(
                             "text-lg font-display font-bold",
                             day.day_score >= 8 ? "text-success" : "text-amber-500"
                           )}>{day.day_score}/10</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Priority</p>
                        <p className="text-[11px] font-bold text-slate-700 line-clamp-1 mb-3">{day.morning_plan.top_priority}</p>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                           <Wallet className="w-3 h-3 text-emerald-500" />
                           <span className="text-[10px] font-mono font-bold text-emerald-600">+{day.evening_review.rupee_summary}</span>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </section>

    </div>
  );
};

export default AIPlanner;
