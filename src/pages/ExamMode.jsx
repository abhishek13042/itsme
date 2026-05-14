import React, { useState, useEffect, useMemo } from 'react';
import { useExamStore } from '../store/examStore';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { 
  Clock, BookOpen, CheckCircle2, AlertTriangle, TrendingUp, ChevronRight,
  ChevronDown, Plus, Zap, Target, Calendar, AlertCircle, Check, Expand, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, differenceInHours, parseISO, isFuture } from 'date-fns';
import { clsx } from 'clsx';

const ExamMode = () => {
  const { 
    semesters, activeSem, subjects, checklists, isLoading, loadSemesters, 
    switchSemester, updateSubjectReadiness, updateMarks, toggleChecklistItem,
    addChecklistItem, updateSemesterDates
  } = useExamStore();

  const [activeTab, setActiveTab] = useState(5);
  const [editingDates, setEditingDates] = useState(false);

  useEffect(() => { if (!semesters?.length) loadSemesters(); }, []);
  useEffect(() => { if (activeSem) setActiveTab(activeSem.sem_number); }, [activeSem]);

  const overallReadiness = useMemo(() => {
    if (!subjects.length) return 0;
    return Math.floor(subjects.reduce((sum, s) => sum + s.readiness, 0) / subjects.length);
  }, [subjects]);

  const handleTabSwitch = (sem) => {
    const found = semesters.find(s => s.sem_number === sem);
    if (found) switchSemester(found.id); else setActiveTab(sem);
  };

  if (isLoading && !semesters?.length) return <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F5F4F0]"><div className="w-8 h-8 border-2 border-[#1A1A2E]/10 border-t-[#E07B39] rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-1">Academic Hub</p>
          <h1 className="text-3xl font-bold text-[#1A1A2E] font-['Inter']">Exam Mode</h1>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E5E0D8] p-1 rounded-xl">
          {[4, 5, 6, 7, 8].map(num => (
            <button key={num} onClick={() => handleTabSwitch(num)}
              className={clsx("px-4 py-2 text-[10px] font-bold uppercase rounded-lg transition-all",
                activeTab === num ? "bg-[#1A1A2E] text-white shadow-md" : "text-[#9A9590] hover:text-[#1A1A2E]")}>
              Sem {num}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
          {activeSem?.sem_number !== activeTab ? (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] border-dashed p-12 text-center">
              <p className="text-sm text-[#9A9590] font-['Inter']">Semester {activeTab} is currently inactive.</p>
            </div>
          ) : (
            <>
              {/* TOP ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1A1A2E] rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 font-['Space_Mono'] uppercase tracking-widest mb-2">Days to End Sem</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold font-['Space_Mono'] text-[#E07B39]">
                        {activeSem?.end_sem_date ? differenceInDays(parseISO(activeSem.end_sem_date), new Date()) : '??'}
                      </span>
                      <span className="text-sm font-bold font-['Space_Mono'] text-white/60">DAYS</span>
                    </div>
                  </div>
                  <Target size={40} className="text-white/10" />
                </div>

                <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-2">Target Grade</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold font-['Space_Mono'] text-[#1A1A2E]">{activeSem?.target_cgpa || '9.0'}</span>
                      <span className="text-sm font-bold font-['Space_Mono'] text-[#9A9590]">CGPA</span>
                    </div>
                  </div>
                  <TrendingUp size={40} className="text-[#F5F4F0]" />
                </div>
              </div>

              {/* SUBJECT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(subject => (
                  <div key={subject.id} className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-sm hover:border-[#1A1A2E]/20 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase" style={{ backgroundColor: subject.color }}>{subject.short_name}</span>
                        <h4 className="font-bold text-[#1A1A2E] mt-1 text-sm">{subject.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold font-['Space_Mono']" style={{ color: subject.readiness > 80 ? '#1A6B4A' : '#E07B39' }}>{subject.readiness}%</p>
                        <p className="text-[8px] text-[#9A9590] font-bold uppercase">Ready</p>
                      </div>
                    </div>
                    
                    <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden mb-6">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${subject.readiness}%` }} className="h-full" style={{ backgroundColor: subject.color }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-bold text-[#9A9590] uppercase mb-1">Mid Sem</p>
                        <p className="text-sm font-bold font-['Space_Mono'] text-[#1A1A2E]">{subject.mid_marks_obtained || 0}/{subject.mid_marks_total || 30}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-[#9A9590] uppercase mb-1">Internal</p>
                        <p className="text-sm font-bold font-['Space_Mono'] text-[#1A1A2E]">{subject.internal_marks_obtained || 0}/{subject.internal_marks_total || 25}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ExamMode;
