import React, { useState, useEffect, useMemo } from 'react';
import { useExamStore } from '../store/examStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight,
  Plus,
  Zap,
  Star,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInSeconds, intervalToDuration } from 'date-fns';
import { clsx } from 'clsx';
import { awardXP } from '../lib/xpEngine';
import { rewards } from '../lib/rewards';

const HEADER_COLOR = '#C0392B';

const ExamMode = () => {
  const { subjects, examDate, pastPapers, loadExamData, updateReadiness, updateNotes, logPastPaper } = useExamStore();
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [checkedTasks, setCheckedTasks] = useState(new Set());
  const [showTips, setShowTips] = useState(true);

  const BATTLE_PLAN = [
    { id: 't1', text: 'OS: Process management + scheduling (2hr)', xp: 30, rupee: 8 },
    { id: 't2', text: 'DAA: DP patterns — coin change, LCS (2hr)', xp: 30, rupee: 8 },
    { id: 't3', text: 'ML: SVM + clustering revision (1.5hr)', xp: 25, rupee: 6 },
    { id: 't4', text: 'SE: SDLC models + UML diagrams (1hr)', xp: 20, rupee: 5 },
    { id: 't5', text: 'DBMS: Normalization + SQL queries (1.5hr)', xp: 25, rupee: 6 },
    { id: 't6', text: 'Attempt 1 full past paper', xp: 50, rupee: 15 },
  ];

  useEffect(() => {
    const init = async () => {
      await loadExamData();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!examDate) return;
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= examDate) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }
      const diff = differenceInSeconds(examDate, now);
      const duration = intervalToDuration({ start: now, end: examDate });
      setTimeLeft(duration);
    }, 1000);
    return () => clearInterval(timer);
  }, [examDate]);

  const overallReadiness = useMemo(() => {
    if (!subjects.length) return 0;
    return Math.floor(subjects.reduce((sum, s) => sum + s.readiness, 0) / subjects.length);
  }, [subjects]);

  const getReadinessColor = (val) => {
    if (val < 40) return '#C0392B';
    if (val < 70) return '#E07B39';
    return '#1A6B4A';
  };

  const getStatus = (val) => {
    if (val <= 30) return { label: 'NOT STARTED', color: 'danger' };
    if (val <= 60) return { label: 'STUDYING', color: 'amber' };
    if (val <= 85) return { label: 'IN PROGRESS', color: 'navy' };
    return { label: 'EXAM READY', color: 'success' };
  };

  const handleTaskToggle = async (task) => {
    if (checkedTasks.has(task.id)) return;
    
    const newChecked = new Set(checkedTasks);
    newChecked.add(task.id);
    setCheckedTasks(newChecked);

    await awardXP(task.xp, `exam_study:${task.text}`);
    await rewards.earnReward(task.rupee * 100, `Study: ${task.text}`, 'exam');

    if (newChecked.size === BATTLE_PLAN.length) {
       await awardXP(100, 'battle_plan_master');
       await rewards.earnReward(5000, 'Battle Plan Bonus', 'exam_bonus');
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-slate-400">Loading Exam Vault...</div>;

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight" style={{ color: HEADER_COLOR }}>EXAM MODE</h1>
          <div className="flex items-center gap-2 mt-2">
            <motion.div 
               animate={{ opacity: [1, 0.4, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"
            />
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
              {timeLeft ? `Active — ${timeLeft.days} Days Remaining` : 'Exams Complete'}
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400">Target Date: {examDate ? format(examDate, 'LLLL d, yyyy') : 'Loading...'}</p>
      </div>

      {/* Countdown Card */}
      <Card className="bg-slate-900 border-none shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Clock className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10 py-10 flex flex-col items-center">
          <div className="flex gap-6">
            {[
              { val: timeLeft?.days || 0, label: 'Days' },
              { val: timeLeft?.hours || 0, label: 'Hours' },
              { val: timeLeft?.minutes || 0, label: 'Minutes' },
              { val: timeLeft?.seconds || 0, label: 'Seconds' },
            ].map(unit => (
              <div key={unit.label} className="text-center">
                <div className="w-24 h-24 bg-navy-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-navy-700">
                  <span className="text-5xl font-display font-bold" style={{ color: HEADER_COLOR }}>
                    {unit.val.toString().padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mt-3">{unit.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-navy-300 text-sm font-medium tracking-wide">
            Exams begin <span className="text-white border-b border-navy-600 pb-0.5">{examDate ? format(examDate, 'MMMM d, yyyy') : 'April 30, 2025'}</span>
          </p>
        </div>
      </Card>

      {/* Overall Readiness */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight uppercase">Overall Readiness</h2>
          <p className="text-3xl font-mono font-bold" style={{ color: getReadinessColor(overallReadiness) }}>{overallReadiness}%</p>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${overallReadiness}%` }}
            transition={{ duration: 1 }}
            className="h-full" 
            style={{ backgroundColor: getReadinessColor(overallReadiness) }} 
          />
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => {
          const status = getStatus(subject.readiness);
          return (
            <Card key={subject.id} className="p-0 overflow-hidden border-slate-200 group hover:border-navy-900 transition-all">
              <div className="flex">
                <div className="w-1.5" style={{ backgroundColor: subject.color }} />
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest mb-1.5 inline-block">
                        {subject.short_name}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{subject.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Readiness</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-display font-bold transition-colors" style={{ color: getReadinessColor(subject.readiness) }}>
                        {subject.readiness}%
                      </span>
                      <Badge text={status.label} color={status.color} />
                    </div>
                    <input 
                      type="range"
                      min="0" max="100"
                      value={subject.readiness}
                      onChange={(e) => updateReadiness(subject.id, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-navy-900 mt-4"
                    />
                  </div>

                  <div className="space-y-4">
                    <textarea 
                      placeholder="Add study notes..."
                      value={subject.notes || ''}
                      onBlur={(e) => updateNotes(subject.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-navy-100 transition-all font-medium"
                      rows={2}
                    />
                    <div className="flex gap-2">
                       <button onClick={() => updateReadiness(subject.id, Math.min(100, subject.readiness + 10))} className="flex-1 bg-white border border-slate-100 py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-all">+10%</button>
                       <button onClick={() => updateReadiness(subject.id, Math.min(100, subject.readiness + 25))} className="flex-1 bg-white border border-slate-100 py-2 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-all">+25%</button>
                       <button onClick={() => updateReadiness(subject.id, 90)} className="flex-1 bg-navy-50 text-navy-600 py-2 rounded-lg text-[10px] font-bold hover:bg-navy-100 transition-all tracking-widest">READY</button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Today's Battle Plan */}
      <Card className="p-8 border-navy-100 bg-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Today's Battle Plan</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Complete all for <span className="text-success font-bold">+₹50 bonus</span></p>
          </div>
          <div className="text-right">
             <p className="text-xl font-display font-bold text-navy-900">{checkedTasks.size} / {BATTLE_PLAN.length}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks Done</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BATTLE_PLAN.map(task => (
            <motion.div 
              key={task.id}
              whileHover={{ x: 5 }}
              onClick={() => handleTaskToggle(task)}
              className={clsx(
                "p-4 rounded-xl border transition-all flex items-start justify-between cursor-pointer",
                checkedTasks.has(task.id) ? "bg-green-50/50 border-green-100" : "bg-slate-50 border-slate-100 hover:border-navy-200"
              )}
            >
              <div className="flex gap-4">
                <div className={clsx(
                  "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  checkedTasks.has(task.id) ? "bg-success border-success text-white" : "border-slate-300 bg-white"
                )}>
                  {checkedTasks.has(task.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div>
                   <p className={clsx("text-sm font-medium", checkedTasks.has(task.id) ? "text-slate-400 line-through" : "text-slate-800")}>{task.text}</p>
                   <div className="flex gap-2 mt-1.5">
                     <span className="text-[9px] font-bold text-xp uppercase tracking-widest">+{task.xp}xp</span>
                     <span className="text-[9px] font-bold text-success uppercase tracking-widest">+₹{task.rupee}</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Analytics & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Past Paper Tracker */}
        <Card className="p-0 overflow-hidden border-slate-200">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Past Paper Tracker</h3>
             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold tracking-widest uppercase"><Download className="w-3 h-3 mr-2" /> Get Papers</Button>
           </div>
           <div className="p-4">
             <table className="w-full">
                <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-center">Attempted</th>
                    <th className="px-4 py-3 text-right">Best Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map(s => {
                    const subjectPapers = pastPapers.filter(p => p.subject === s.short_name);
                    return (
                      <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{s.name}</td>
                        <td className="px-4 py-3 text-center text-xs font-mono font-bold">{subjectPapers.length} / 5</td>
                        <td className="px-4 py-3 text-right text-xs font-mono font-bold text-navy-600">
                          {subjectPapers.length > 0 ? `${Math.max(...subjectPapers.map(p => p.score))}%` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
           </div>
        </Card>

        {/* Exam Tips */}
        <div className="space-y-4">
          <div 
            onClick={() => setShowTips(!showTips)}
            className="p-6 bg-navy-900 text-white rounded-2xl cursor-pointer flex justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest">20-Day Strategy</h3>
              </div>
              <p className="text-xs text-navy-300 font-medium">Maximize retention and speed</p>
            </div>
            <button className={clsx("transition-transform duration-300", showTips ? "rotate-90" : "")}><ChevronRight /></button>
          </div>
          <AnimatePresence>
            {showTips && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  {[
                    { days: 'Days 1-7', text: 'Cover all subjects once (high-level concept maps)' },
                    { days: 'Days 8-14', text: 'Deep dive weak subjects & numerical priority' },
                    { days: 'Days 15-18', text: 'Past papers ONLY (timed sessions)' },
                    { days: 'Days 19-20', text: 'Light revision + sleep management' },
                  ].map(step => (
                    <Card key={step.days} className="p-4 border-slate-100 bg-white">
                      <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-1 rounded w-20 text-center uppercase tracking-tighter shrink-0">{step.days}</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.text}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default ExamMode;
