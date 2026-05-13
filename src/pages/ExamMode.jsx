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
  ChevronDown,
  Plus,
  Zap,
  Target,
  Calendar,
  AlertCircle,
  Check,
  Expand,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, differenceInHours, parseISO, isFuture } from 'date-fns';
import { clsx } from 'clsx';

// Design Constants
const PALETTE = {
  navy: '#1A1A2E',
  orange: '#E07B39',
  emerald: '#1A6B4A',
  crimson: '#C0392B',
  muted: '#9A9590',
  body: '#3D3830',
  bg: '#F5F4F0',
  border: '#E5E0D8'
};

const BATTLE_PLAN = [
  { id: 'bp1', subject: 'OS', text: 'Process management (2hr)', xp: 30, color: '#C0392B' },
  { id: 'bp2', subject: 'DAA', text: 'DP patterns (2hr)', xp: 30, color: '#1A1A2E' },
  { id: 'bp3', subject: 'ML', text: 'SVM + clustering (1.5hr)', xp: 25, color: '#7C3AED' },
  { id: 'bp4', subject: 'SE', text: 'SDLC + UML (1hr)', xp: 20, color: '#1A6B4A' },
  { id: 'bp5', subject: 'DBMS', text: 'Normalization + SQL (1.5hr)', xp: 25, color: '#E07B39' },
  { id: 'bp6', subject: 'PAPER', text: 'Attempt 1 past paper', xp: 50, color: '#E07B39' },
];

const ExamMode = () => {
  const { 
    semesters, 
    activeSem, 
    subjects, 
    checklists, 
    loading,
    isLoading,
    loadSemesters, 
    switchSemester,
    updateSubjectReadiness,
    updateMarks,
    toggleChecklistItem,
    addChecklistItem,
    updateSemesterDates
  } = useExamStore();

  const [activeTab, setActiveTab] = useState(5); // Default display SEM 5
  const [editingDates, setEditingDates] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState(new Set());

  useEffect(() => {
    if (!semesters?.length) loadSemesters();
  }, []);

  useEffect(() => {
    if (activeSem) setActiveTab(activeSem.sem_number);
  }, [activeSem]);

  const overallReadiness = useMemo(() => {
    if (!subjects.length) return 0;
    return Math.floor(subjects.reduce((sum, s) => sum + s.readiness, 0) / subjects.length);
  }, [subjects]);

  const handleTabSwitch = (sem) => {
    const found = semesters.find(s => s.sem_number === sem);
    if (found) {
      switchSemester(found.id);
    } else {
      setActiveTab(sem);
    }
  };

  const getDayCountdown = (dateStr) => {
    if (!dateStr) return null;
    const date = parseISO(dateStr);
    const days = differenceInDays(date, new Date());
    const hours = differenceInHours(date, new Date()) % 24;
    return { days, hours };
  };

  if (isLoading && !semesters?.length) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-[#F5F4F0] animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-56 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-56 bg-[#F5F4F0] animate-pulse rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-72 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-72 bg-[#F5F4F0] animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-[28px] font-extrabold text-[#1A1A2E] leading-none uppercase tracking-tight">EXAM MODE</h1>
          <p className="font-body text-[13px] text-[#9A9590] mt-1">Semester tracker · Marks · Prep</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-[#FFF0EE] rounded-full border border-[#C0392B]/10">
          <motion.div 
            animate={{ opacity: [1, 0, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" 
          />
          <span className="font-body text-[12px] font-bold text-[#C0392B] uppercase tracking-wider">
            SEM {activeSem?.sem_number} — ACTIVE
          </span>
        </div>
      </header>

      {/* SEMESTER TABS */}
      <div className="flex border-b border-[#E5E0D8] gap-8">
        {[4, 5, 6, 7, 8].map(num => (
          <button
            key={num}
            onClick={() => handleTabSwitch(num)}
            className={clsx(
              "pb-4 text-[13px] font-bold uppercase tracking-widest transition-all relative group",
              activeTab === num ? "text-[#1A1A2E]" : "text-[#9A9590]"
            )}
          >
            SEM {num}
            {num === 5 && (
              <span className="ml-2 py-0.5 px-1 bg-[#FFF0E6] text-[#E07B39] text-[9px] rounded font-black">ACTIVE</span>
            )}
            {activeTab === num && (
              <motion.div layoutId="sem-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E07B39]" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {activeSem?.sem_number !== activeTab ? (
            <FutureSemEmptyState sem={activeTab} />
          ) : (
            <>
              {/* TOP ROW: COUNTDOWN + TARGET */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CountdownCard 
                  activeSem={activeSem} 
                  onEdit={() => setEditingDates(true)} 
                />
                <TargetCard 
                  activeSem={activeSem} 
                  onUpdate={(val) => console.log('Update target cgpa', val)} 
                />
              </div>

              {/* SUBJECT GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(subject => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject}
                    checklist={checklists[subject.id] || []}
                    onUpdateReadiness={updateSubjectReadiness}
                    onUpdateMarks={updateMarks}
                    onToggleItem={toggleChecklistItem}
                    onAddItem={addChecklistItem}
                  />
                ))}
              </div>

              {/* OVERALL PROGRESS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <SemesterOverview 
                    subjects={subjects} 
                    overallReadiness={overallReadiness} 
                  />
                </div>
                <div>
                  <TodayBattlePlan 
                    checkedTasks={checkedTasks}
                    onToggle={(id) => setCheckedTasks(prev => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    })}
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Date Editor Modal Mock */}
      <AnimatePresence>
        {editingDates && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[14px] p-8 w-full max-w-md border border-[#E5E0D8] shadow-2xl"
            >
              <h3 className="font-display text-xl font-extrabold mb-6">SET SEMESTER DATES</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#9A9590] uppercase tracking-widest block mb-2">Mid Sem Date</label>
                  <input 
                    type="date" 
                    defaultValue={activeSem?.mid_sem_date}
                    className="w-full h-12 bg-white border border-[#E5E0D8] rounded-xl px-4 font-mono text-sm"
                    onChange={(e) => updateSemesterDates(activeSem.id, { mid_sem_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#9A9590] uppercase tracking-widest block mb-2">End Sem Date</label>
                  <input 
                    type="date" 
                    defaultValue={activeSem?.end_sem_date}
                    className="w-full h-12 bg-white border border-[#E5E0D8] rounded-xl px-4 font-mono text-sm"
                    onChange={(e) => updateSemesterDates(activeSem.id, { end_sem_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => setEditingDates(false)} className="flex-1 h-12 bg-[#1A1A2E] font-bold">SAVE DATES</Button>
                <Button variant="ghost" onClick={() => setEditingDates(false)} className="flex-1 h-12 font-bold border-[#E5E0D8]">CANCEL</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const CountdownCard = ({ activeSem, onEdit }) => {
  const endSem = useMemo(() => {
    if (!activeSem?.end_sem_date) return null;
    const date = parseISO(activeSem.end_sem_date);
    const now = new Date();
    const days = differenceInDays(date, now);
    const hours = differenceInHours(date, now) % 24;
    return { days, hours };
  }, [activeSem]);

  const midSem = useMemo(() => {
    if (!activeSem?.mid_sem_date) return null;
    const date = parseISO(activeSem.mid_sem_date);
    if (!isFuture(date)) return null;
    return differenceInDays(date, new Date());
  }, [activeSem]);

  return (
    <Card className="min-h-[220px] p-8 border-l-[4px] border-l-[#C0392B] bg-white relative">
      <div className="flex justify-between items-start">
        <h3 className="font-body text-[11px] font-bold text-[#9A9590] uppercase tracking-widest">END SEM IN</h3>
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 text-[10px] font-bold border-[#E5E0D8] tracking-widest uppercase">SET DATES</Button>
      </div>

      <div className="mt-4">
        {endSem ? (
          <div className="flex items-baseline gap-4">
            <span className="font-display text-[56px] font-extrabold text-[#C0392B] leading-none">{endSem.days}</span>
            <span className="font-body text-[16px] font-bold text-[#1A1A2E] uppercase">DAYS</span>
            <span className="font-mono text-[14px] text-[#9A9590]">{endSem.hours} HOURS</span>
          </div>
        ) : (
          <p className="font-body text-[13px] text-[#9A9590] mt-4 italic">No end sem date configured</p>
        )}
      </div>

      {midSem !== null && (
        <div className="absolute bottom-6 right-8 px-3 py-1 bg-[#FFF0E6] text-[#E07B39] text-[11px] font-black rounded-full border border-[#E07B39]/10">
          MID SEM IN {midSem} DAYS
        </div>
      )}
    </Card>
  );
};

const TargetCard = ({ activeSem }) => (
  <Card className="min-h-[220px] p-8 border-l-[4px] border-l-[#1A1A2E] bg-white">
    <h3 className="font-body text-[11px] font-bold text-[#9A9590] uppercase tracking-widest">SEM TARGET</h3>
    <div className="mt-4 flex flex-col justify-between h-full">
      <div>
        <span className="font-display text-[48px] font-extrabold text-[#1A1A2E] leading-none">{activeSem?.target_cgpa || '9.0'}</span>
        <span className="font-display text-[24px] font-extrabold text-[#1A1A2E] ml-2">CGPA</span>
      </div>
      <div className="mt-auto space-y-2">
        <p className="text-[12px] font-medium text-[#9A9590] uppercase tracking-tight">Enter SGPA after results</p>
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="0.0" 
            className="w-24 h-10 bg-[#F5F4F0] border-none rounded-lg px-3 font-mono text-sm focus:ring-1 focus:ring-[#1A1A2E]" 
          />
          <Button size="sm" className="h-10 bg-[#1A1A2E] px-4 font-bold text-[11px] tracking-widest">SAVE</Button>
        </div>
      </div>
    </div>
  </Card>
);

const SubjectCard = ({ subject, checklist, onUpdateReadiness, onUpdateMarks, onToggleItem, onAddItem }) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set(['mid_prep']));

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const getReadinessColor = (val) => {
    if (val < 40) return '#C0392B';
    if (val < 70) return '#E07B39';
    return '#1A6B4A';
  };

  const statusInfo = useMemo(() => {
    const val = subject.readiness;
    if (val <= 30) return { label: 'NOT STARTED', color: '#C0392B', bg: '#FFF0EE' };
    if (val <= 60) return { label: 'STUDYING', color: '#E07B39', bg: '#FFF0E6' };
    if (val <= 85) return { label: 'IN PROGRESS', color: '#1A1A2E', bg: '#F0F0FF' };
    return { label: 'EXAM READY', color: '#1A6B4A', bg: '#E8F5EF' };
  }, [subject.readiness]);

  return (
    <Card className="p-0 overflow-hidden bg-white hover:border-[#1A1A2E]/20 transition-all group divide-y divide-[#E5E0D8]/40">
      {/* CARD HEADER */}
      <div className="p-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: subject.color }} />
        <div className="flex justify-between items-start">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-tighter" style={{ backgroundColor: subject.color }}>
                 {subject.short_name}
               </span>
               {subject.has_lab && (
                 <span className="px-1.5 py-0.5 bg-[#FFF0E6] text-[#E07B39] text-[9px] font-black rounded tracking-widest uppercase">LAB</span>
               )}
             </div>
             <h4 className="font-body text-[15px] font-semibold text-[#1A1A2E] leading-tight">{subject.name}</h4>
          </div>
        </div>
      </div>

      {/* MARKS SECTION */}
      <div className="p-6 grid grid-cols-3 gap-2">
        <MarksField 
          label="MID SEM" 
          value={subject.mid_marks_obtained || 0} 
          total={subject.mid_marks_total || 30}
          onUpdate={(v) => onUpdateMarks(subject.id, 'mid_marks_obtained', v)}
        />
        <MarksField 
          label="INTERNAL" 
          value={subject.internal_marks_obtained || 0} 
          total={subject.internal_marks_total || 25}
          onUpdate={(v) => onUpdateMarks(subject.id, 'internal_marks_obtained', v)}
        />
        <MarksField 
          label="END SEM" 
          value={subject.end_marks_obtained || 0} 
          total={subject.end_marks_total || 100}
          isEndSem
          onUpdate={(v) => onUpdateMarks(subject.id, 'end_marks_obtained', v)}
        />
      </div>

      {/* READINESS SECTION */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest">READINESS</p>
            <span className="font-display text-[28px] font-extrabold leading-none" style={{ color: getReadinessColor(subject.readiness) }}>{subject.readiness}%</span>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-black" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.label}
          </div>
        </div>
        <input 
          type="range"
          min="0" max="100"
          value={subject.readiness}
          onChange={(e) => onUpdateReadiness(subject.id, parseInt(e.target.value))}
          className="w-full h-1.5 bg-[#F5F4F0] rounded-full appearance-none cursor-pointer accent-[#1A1A2E]"
        />
      </div>

      {/* CHECKLISTS SECTION */}
      <div className="p-4 space-y-2">
        <ChecklistGroup 
          id="mid_notes" 
          label="📝 MID SEM NOTES" 
          items={checklist.filter(i => i.type === 'mid_notes')}
          isOpen={expandedGroups.has('mid_notes')}
          toggle={() => toggleGroup('mid_notes')}
          onToggleItem={(id, c) => onToggleItem(id, subject.id, c)}
        />
        <ChecklistGroup 
          id="mid_prep" 
          label="📖 MID SEM PREP" 
          items={checklist.filter(i => i.type === 'mid_prep')}
          isOpen={expandedGroups.has('mid_prep')}
          toggle={() => toggleGroup('mid_prep')}
          onToggleItem={(id, c) => onToggleItem(id, subject.id, c)}
        />
        <ChecklistGroup 
          id="end_notes" 
          label="📝 END SEM NOTES" 
          items={checklist.filter(i => i.type === 'end_notes')}
          isOpen={expandedGroups.has('end_notes')}
          toggle={() => toggleGroup('end_notes')}
          onToggleItem={(id, c) => onToggleItem(id, subject.id, c)}
        />
        <ChecklistGroup 
          id="end_prep" 
          label="📖 END SEM PREP" 
          items={checklist.filter(i => i.type === 'end_prep')}
          isOpen={expandedGroups.has('end_prep')}
          toggle={() => toggleGroup('end_prep')}
          onToggleItem={(id, c) => onToggleItem(id, subject.id, c)}
        />

        {subject.has_lab && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-[#E5E0D8]/60 border-l-[4px] border-l-[#E07B39]">
             <div className="flex justify-between items-center mb-3">
               <span className="text-[10px] font-black text-[#E07B39] uppercase tracking-widest">LAB TRACKER</span>
               <span className="text-[10px] text-[#9A9590] uppercase font-bold">Due in 12 days</span>
             </div>
             <div className="space-y-2">
               {['File submitted', 'Viva prepared', 'Attendance OK'].map(task => (
                 <label key={task} className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-3.5 h-3.5 border border-[#E5E0D8] rounded flex items-center justify-center group-hover:border-[#1A1A2E]">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[12px] font-medium text-[#3D3830]">{task}</span>
                 </label>
               ))}
             </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const MarksField = ({ label, value, total, onUpdate, isEndSem }) => {
  const percent = (value / total) * 100;
  const getColor = () => {
    if (percent >= 70) return '#1A6B4A';
    if (percent >= 50) return '#E07B39';
    return '#C0392B';
  };

  return (
    <div className="space-y-1">
      <p className="text-[8px] font-bold text-[#9A9590] uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1">
        <input 
          type="number"
          value={value}
          onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
          className="w-full bg-transparent font-mono text-[18px] font-bold p-0 border-none focus:ring-0 leading-none"
          style={{ color: getColor() }}
        />
        <span className="font-mono text-[10px] text-[#9A9590]">/ {total}</span>
      </div>
    </div>
  );
};

const ChecklistGroup = ({ label, items, isOpen, toggle, onToggleItem }) => (
  <div className="space-y-2">
    <button 
      onClick={toggle}
      className="w-full flex justify-between items-center py-2 px-1 hover:bg-[#F5F4F0] rounded-lg transition-all"
    >
      <h5 className="font-body text-[11px] font-bold text-[#1A1A2E] tracking-tight">{label}</h5>
      <ChevronDown className={clsx("w-3.5 h-3.5 text-[#9A9590] transition-transform", isOpen ? "rotate-180" : "")} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden px-1"
        >
          <div className="space-y-2 pb-2">
            {items.map(item => (
              <label 
                key={item.id} 
                className="flex items-center group cursor-pointer"
              >
                <div 
                  onClick={() => onToggleItem(item.id, !item.completed)}
                  className={clsx(
                  "w-4 h-4 rounded-md border-[1.5px] mr-3 flex items-center justify-center transition-all",
                  item.completed ? "bg-[#1A6B4A] border-[#1A6B4A]" : "border-[#E5E0D8] bg-white group-hover:border-[#1A1A2E]"
                )}>
                  {item.completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                <span className={clsx(
                  "font-body text-[13px] leading-none transition-all",
                  item.completed ? "text-[#9A9590] line-through decoration-[#9A9590]/50" : "text-[#3D3830] font-medium"
                )}>
                  {item.item_text}
                </span>
                {item.deadline && (
                  <span className="ml-auto text-[10px] font-mono text-[#E07B39] font-bold">in 2d</span>
                )}
              </label>
            ))}
            <button className="flex items-center gap-2 text-[11px] font-bold text-[#9A9590] hover:text-[#1A1A2E] mt-2 group">
              <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              ADD ITEM
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SemesterOverview = ({ subjects, overallReadiness }) => (
  <Card className="p-8 border-l-[4px] border-l-[#1A1A2E] bg-white space-y-8">
    <div className="flex justify-between items-center">
      <h3 className="font-body text-[11px] font-bold text-[#9A9590] uppercase tracking-widest">SEMESTER OVERVIEW</h3>
      <div className="flex items-center gap-3">
        <span className="font-display text-[24px] font-extrabold text-[#1A1A2E]">OVERALL: {overallReadiness}%</span>
        <div className="w-2.5 h-2.5 rounded-full bg-[#1A6B4A]" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
      {subjects.map(s => (
        <div key={s.id} className="space-y-2">
           <div className="flex justify-between items-end">
             <span className="text-[11px] font-black text-[#1A1A2E] font-body tracking-tight uppercase leading-none">{s.short_name}</span>
             <span className="font-mono text-[11px] text-[#9A9590] leading-none">{s.readiness}%</span>
           </div>
           <div className="h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${s.readiness}%` }}
               className="h-full" 
               style={{ backgroundColor: s.color }} 
             />
           </div>
        </div>
      ))}
    </div>
  </Card>
);

const TodayBattlePlan = ({ checkedTasks, onToggle }) => (
  <Card className="p-8 bg-white border border-[#E5E0D8]">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="font-display text-[16px] font-extrabold text-[#1A1A2E] uppercase">BATTLE PLAN</h3>
        <p className="text-[12px] text-[#9A9590] mt-1">Daily Prep Checklist</p>
      </div>
      <Zap className="w-6 h-6 text-[#E07B39] fill-[#E07B39]" />
    </div>

    <div className="space-y-3">
      {BATTLE_PLAN.map(task => (
        <div 
          key={task.id} 
          onClick={() => onToggle(task.id)}
          className={clsx(
            "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
            checkedTasks.has(task.id) ? "bg-[#E8F5EF]/40 border-[#E8F5EF]" : "bg-[#F5F4F0]/50 border-transparent hover:border-[#E5E0D8]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              checkedTasks.has(task.id) ? "bg-[#1A6B4A] border-[#1A6B4A]" : "bg-white border-[#E5E0D8]"
            )}>
              {checkedTasks.has(task.id) && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-1 py-0.5 text-[8px] font-black text-white rounded" style={{ backgroundColor: task.color }}>{task.subject}</span>
                <p className={clsx("text-[13px] font-medium leading-none", checkedTasks.has(task.id) && "text-[#9A9590] line-through")}>{task.text}</p>
              </div>
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#9A9590] font-bold">+{task.xp}XP</span>
        </div>
      ))}

      {checkedTasks.size === BATTLE_PLAN.length && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-[#E8F5EF] text-[#1A6B4A] rounded-xl text-center border border-[#1A6B4A]/10"
        >
          <p className="text-[12px] font-black uppercase tracking-widest">🏆 BONUS UNLOCKED +₹50</p>
        </motion.div>
      )}
    </div>
  </Card>
);

const FutureSemEmptyState = ({ sem }) => (
  <Card className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[#E5E0D8]">
    <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mb-6">
      <AlertCircle className="w-8 h-8 text-[#9A9590]" />
    </div>
    <h3 className="font-display text-2xl font-extrabold text-[#1A1A2E] leading-none uppercase">SEM {sem} — UPCOMING</h3>
    <p className="text-[13px] text-[#9A9590] mt-3 font-medium max-w-sm">
      Activates automatically 30 days before your exam date. Would you like to set up the syllabus manually?
    </p>
    <div className="mt-8 flex gap-4">
      <Button className="h-12 px-8 bg-[#1A1A2E] font-bold tracking-widest uppercase">SET UP SEM {sem}</Button>
      <Button variant="ghost" className="h-12 px-8 border-[#E5E0D8] font-bold tracking-widest uppercase">VIEW TARGETS</Button>
    </div>
  </Card>
);

export default ExamMode;
