import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { useSdeStore } from '../store/sdeStore';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { 
  BookOpen, 
  TrendingUp, 
  Flame, 
  Star, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
  Check,
  Award,
  Globe,
  Brain,
  Cpu,
  Microscope,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const FinanceBooks = () => {
  const { 
    books, 
    milestones, 
    curiosityNodes, 
    readingStreak, 
    loading, 
    isLoading,
    loadFinanceData, 
    startBook, 
    completeBook, 
    updateBookReview, 
    markMilestoneAchieved 
  } = useFinanceStore();

  const { chapters, loadRoadmap: loadSde } = useSdeStore();
  
  const [expandedPhases, setExpandedPhases] = useState([1]);
  const [showCompleteModal, setShowCompleteModal] = useState(null);

  useEffect(() => {
    if (!books?.length) loadFinanceData();
    if (!chapters?.length) loadSde();
  }, []);

  // Stats
  const booksRead = useMemo(() => books.filter(b => b.status === 'COMPLETED').length, [books]);
  const activePhase = useMemo(() => {
    if (booksRead >= 12) return 4;
    if (booksRead >= 9) return 3;
    if (booksRead >= 5) return 2;
    return 1;
  }, [booksRead]);

  const sdeMonth3Complete = useMemo(() => {
    const month3Chapters = chapters.filter(c => c.month_target <= 3);
    return month3Chapters.length > 0 && month3Chapters.every(c => c.completed);
  }, [chapters]);

  // Phase Lock Logic
  const getPhaseStatus = (phaseNum) => {
    if (phaseNum === 1) return { locked: false };
    if (phaseNum === 2) {
      const p1Read = books.filter(b => b.phase === 1 && b.status === 'COMPLETED').length;
      return { locked: p1Read < 3, hint: 'Complete 3 Phase 1 books' };
    }
    if (phaseNum === 3) {
      const p2Complete = books.filter(b => b.phase === 2).every(b => b.status === 'COMPLETED');
      return { locked: !p2Complete || !sdeMonth3Complete, hint: 'Phase 2 Books & SDE Month 3 complete' };
    }
    if (phaseNum === 4) {
      const p3Complete = books.filter(b => b.phase === 3).every(b => b.status === 'COMPLETED');
      return { locked: !p3Complete, hint: 'Complete Phase 3' };
    }
    return { locked: true };
  };

  const togglePhase = (p) => {
    if (expandedPhases.includes(p)) setExpandedPhases(expandedPhases.filter(idx => idx !== p));
    else setExpandedPhases([...expandedPhases, p]);
  };

  if (isLoading && !books?.length) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-[#F5F4F0] animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-24 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-24 bg-[#F5F4F0] animate-pulse rounded-2xl" />
          <div className="h-24 bg-[#F5F4F0] animate-pulse rounded-2xl" />
        </div>
        <div className="h-96 bg-[#F5F4F0] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 gap-4">
        <div>
          <p className="font-body text-[13px] text-[#9A9590] uppercase tracking-widest mb-1">Books · Income · Curiosity Arc</p>
          <h1 className="font-display text-[32px] font-extrabold text-[#1A1A2E] leading-tight uppercase tracking-tight">KNOWLEDGE</h1>
        </div>
        <div className="flex gap-3">
          <Badge text={`${booksRead} BOOKS READ`} color="emerald" icon={<CheckCircle2 className="w-4 h-4" />} />
          <Badge text={`${booksRead}/15 TOTAL`} color="navy" />
        </div>
      </header>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Books Read" 
          value={booksRead} 
          sub={`of 15 total`} 
          progress={(booksRead/15)*100} 
        />
        <StatCard 
          label="Current Phase" 
          value={`PHASE ${activePhase}`} 
          sub={['Money & Markets', 'Brain & Psychology', 'Curiosity Arc', 'Deep Science'][activePhase-1]}
          color="#E07B39"
        />
        <StatCard 
          label="Income Milestone" 
          value={`₹${milestones.find(m => m.status === 'LOCKED')?.amount_inr?.toLocaleString() || 'MAX'}`}
          sub={`Next: Achieve target`}
        />
        <StatCard 
          label="Reading Streak" 
          value={`${readingStreak} day`} 
          sub="reading streak" 
        />
      </div>

      {/* SECTION 1 — BOOKS */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-extrabold text-[#1A1A2E] uppercase tracking-tight">LIBRARY PHASES</h2>
        <div className="space-y-4">
          {[
            { num: 1, name: 'MONEY & MARKETS', color: '#E07B39' },
            { num: 2, name: 'BRAIN & PSYCHOLOGY', color: '#1A1A2E' },
            { num: 3, name: 'CURIOSITY ARC', color: '#7C3AED' },
            { num: 4, name: 'DEEP SCIENCE', color: '#C0392B', longTerm: true }
          ].map(p => (
            <PhaseSection 
              key={p.num}
              num={p.num}
              name={p.name}
              color={p.color}
              longTerm={p.longTerm}
              status={getPhaseStatus(p.num)}
              isExpanded={expandedPhases.includes(p.num)}
              onToggle={() => togglePhase(p.num)}
              books={books.filter(b => b.phase === p.num)}
              onStart={startBook}
              onComplete={setShowCompleteModal}
              onUpdateReview={updateBookReview}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2 — INCOME ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10">
        <div className="lg:col-span-8 space-y-8">
           <header>
             <h2 className="font-display text-2xl font-extrabold text-[#1A1A2E] uppercase tracking-tight">INCOME ROADMAP</h2>
             <p className="font-body text-[13px] text-[#9A9590] uppercase tracking-widest mt-1">First rupee → funded trader → startup</p>
           </header>
           
           <div className="relative pl-8 space-y-12">
              <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-[#E5E0D8]" />
              {milestones.map((m, idx) => (
                <div key={m.id} className="relative group">
                  <div className={clsx(
                    "absolute -left-8 top-8 w-10 h-10 rounded-full border-4 border-[#F5F4F0] flex items-center justify-center transition-all z-10",
                    m.status === 'ACHIEVED' ? "bg-[#1A6B4A]" : m.status === 'IN_PROGRESS' ? "bg-[#E07B39] animate-pulse" : "bg-[#9A9590]"
                  )}>
                    {m.status === 'ACHIEVED' ? <Check className="w-5 h-5 text-white" /> : <DollarSign className="w-5 h-5 text-white" />}
                  </div>
                  
                  <Card className={clsx("p-8 transition-all hover:scale-[1.01] bg-white", m.status === 'LOCKED' ? 'opacity-70' : 'border-l-[4px]')} style={{ borderLeftColor: m.status === 'ACHIEVED' ? '#1A6B4A' : m.status === 'IN_PROGRESS' ? '#E07B39' : '#E5E0D8' }}>
                    <div className="flex justify-between items-start">
                       <div>
                         {m.category === 'TRADING' && <Badge text="TRADING" color="orange" className="mb-2" />}
                         {m.amount_inr > 0 && <h3 className={clsx("font-display text-[28px] font-extrabold mb-1", m.status === 'ACHIEVED' ? 'text-[#1A6B4A]' : 'text-[#1A1A2E]')}>₹{m.amount_inr.toLocaleString()}</h3>}
                         <h4 className="font-body text-lg font-bold text-[#1A1A2E]">{m.title}</h4>
                         <p className="text-[#9A9590] text-sm italic mt-1">{m.description}</p>
                       </div>
                       
                       <div className="text-right">
                          {m.status === 'ACHIEVED' ? (
                            <div className="space-y-1">
                               <Badge text="ACHIEVED" color="emerald" />
                               <p className="font-mono text-[11px] text-[#9A9590] uppercase mt-2">{format(new Date(m.completed_at || Date.now()), 'MMM d, yyyy')}</p>
                            </div>
                          ) : idx === milestones.findIndex(ms => ms.status !== 'ACHIEVED') ? (
                            <div className="flex flex-col items-end gap-3">
                               <Badge text="CURRENT TARGET" color="orange" />
                               <Button size="sm" onClick={() => markMilestoneAchieved(m.id)} className="bg-[#1A6B4A] text-white">ACHIEVE</Button>
                            </div>
                          ) : null}
                       </div>
                    </div>
                  </Card>
                </div>
              ))}
           </div>
        </div>

        {/* SECTION 3 — CURIOSITY ARC */}
        <div className="lg:col-span-4 space-y-8">
           <header>
             <h2 className="font-display text-2xl font-extrabold text-[#1A1A2E] uppercase tracking-tight">CURIOSITY ARC</h2>
             <p className="font-body text-[13px] text-[#9A9590] uppercase tracking-widest mt-1 italic">No rush — these are for joy.</p>
           </header>

           <div className="grid grid-cols-1 gap-4">
              {curiosityNodes.map(node => (
                <CuriosityCard 
                  key={node.id} 
                  node={node} 
                  unlocked={node.unlocked || (node.title === 'Agentic AI' && sdeMonth3Complete)} 
                />
              ))}
           </div>

           <Card className="p-8 bg-[#1A1A2E] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display text-[15px] font-extrabold uppercase tracking-widest mb-4">Reading Strategy</h3>
                <ul className="space-y-4">
                  {[
                    'Never start a second book without finishing the first.',
                    'Write down 3 actionable takeaways per chapter.',
                    'Implement one financial rule immediately after reading.'
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E07B39] mt-2 shrink-0" />
                      <p className="text-[13px] text-[#9A9590] leading-relaxed italic">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
           </Card>
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
               <Card className="max-w-md p-8 bg-white border-t-8 border-[#1A6B4A] text-center">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5EF] flex items-center justify-center mx-auto mb-6">
                    <Award className="w-8 h-8 text-[#1A6B4A]" />
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-[#1A1A2E] mb-2 uppercase tracking-tight">CONQUEST COMPLETE</h3>
                  <p className="text-[#3D3830] font-body text-sm mb-6">You've successfully finished <span className="font-bold">"{showCompleteModal.title}"</span>. The wisdom is yours.</p>
                  
                  <div className="bg-[#F5F4F0] p-4 rounded-xl mb-8 flex justify-center gap-8">
                     <div className="text-center">
                       <p className="text-[10px] font-bold text-[#9A9590] uppercase mb-1">XP EARNED</p>
                       <p className="font-display text-xl font-bold text-[#1A6B4A]">+200</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-[#9A9590] uppercase mb-1">GOLD EARNED</p>
                        <p className="font-display text-xl font-bold text-[#E07B39]">₹50</p>
                     </div>
                  </div>

                  <Button 
                    className="w-full bg-[#1A1A2E] text-white py-4 font-bold tracking-widest"
                    onClick={() => {
                      completeBook(showCompleteModal.id);
                      setShowCompleteModal(null);
                    }}
                  >
                    SYNC PROGRESS
                  </Button>
               </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const StatCard = ({ label, value, sub, progress, color = "#1A1A2E" }) => (
  <Card className="p-6 bg-white flex flex-col justify-between">
    <div>
      <p className="text-[11px] font-bold text-[#9A9590] uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold" style={{ color }}>{value}</span>
      </div>
    </div>
    <div className="mt-4">
       <p className="font-mono text-[12px] text-[#9A9590] mb-2 uppercase">{sub}</p>
       {progress !== undefined && (
         <div className="h-1 bg-[#F5F4F0] rounded-full overflow-hidden">
           <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full" style={{ backgroundColor: color }} 
           />
         </div>
       )}
    </div>
  </Card>
);

const PhaseSection = ({ num, name, color, longTerm, status, isExpanded, onToggle, books, onStart, onComplete, onUpdateReview }) => (
  <div className="border border-[#E5E0D8] rounded-[14px] overflow-hidden bg-white">
     <div 
      onClick={onToggle}
      className={clsx(
        "flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors border-l-[4px]",
        isExpanded ? "border-b border-[#E5E0D8]" : ""
      )}
      style={{ borderLeftColor: color }}
     >
        <div className="flex items-center gap-6">
           <div className="w-10 h-10 rounded-full bg-[#1A1A2E] flex items-center justify-center font-display text-white text-[18px] font-extrabold">
             {num}
           </div>
           <div>
             <div className="flex items-center gap-3">
               <h3 className="font-display text-[18px] font-extrabold text-[#1A1A2E] uppercase tracking-tight">{name}</h3>
               {longTerm && <span className="text-[10px] font-bold text-[#C0392B] bg-[#FEE2E2] px-2 py-0.5 rounded italic">LONG TERM</span>}
             </div>
             <p className="text-[11px] font-bold text-[#9A9590] uppercase tracking-widest mt-1">
               {books.filter(b => b.status === 'COMPLETED').length} / {books.length} BOOKS COMPLETE
             </p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {status.locked ? (
             <div className="flex items-center gap-2 text-[#9A9590]">
               <Lock className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">{status.hint}</span>
             </div>
           ) : (
             <div className="w-full max-w-[120px] hidden md:block">
               <ProgressBar value={(books.filter(b => b.status === 'COMPLETED').length / books.length) * 100} color={color} height="6px" />
             </div>
           )}
           {isExpanded ? <ChevronUp className="text-[#9A9590]" /> : <ChevronDown className="text-[#9A9590]" />}
        </div>
     </div>

     <AnimatePresence>
       {isExpanded && (
         <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="bg-[#FBFBF9] p-2 space-y-1">
               {status.locked ? (
                 <div className="p-12 text-center text-[#9A9590] italic text-sm">
                   Phase locked. {status.hint}.
                 </div>
               ) : (
                 books.map(book => (
                   <BookCard 
                    key={book.id} 
                    book={book} 
                    onStart={onStart} 
                    onComplete={onComplete}
                    onUpdate={onUpdateReview}
                   />
                 ))
               )}
            </div>
         </motion.div>
       )}
     </AnimatePresence>
  </div>
);

const BookCard = ({ book, onStart, onComplete, onUpdate }) => {
  const isComplete = book.status === 'COMPLETED';
  const isReading = book.status === 'READING';
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border border-[#E5E0D8]/50 rounded-lg group transition-all hover:border-[#1A1A2E]/20">
       <div className="flex items-center gap-6 flex-1">
          <div className={clsx(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            isComplete ? "bg-[#1A6B4A] border-[#1A6B4A]" : "border-[#E5E0D8]"
          )}>
            {isComplete && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
          </div>
          
          <div className="flex-1 space-y-3">
             <div>
               <h4 className={clsx("font-body text-[15px] font-bold leading-tight", isComplete ? "text-[#9A9590]" : "text-[#1A1A2E]")}>
                 {book.title}
               </h4>
               <p className="text-[12px] font-medium text-[#9A9590] mt-1 italic">
                 {book.author} · <span className="bg-[#F5F4F0] px-1.5 rounded uppercase font-bold text-[10px] tracking-tighter">{book.category}</span>
               </p>
             </div>

             {isComplete && (
               <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        onClick={() => onUpdate(book.id, { rating: star })}
                        className={clsx("w-3.5 h-3.5 cursor-pointer transition-colors", star <= (book.rating || 0) ? "text-[#E07B39] fill-[#E07B39]" : "text-[#E5E0D8]")} 
                      />
                    ))}
                  </div>
                  <input 
                    type="text"
                    defaultValue={book.one_line_takeaway}
                    onBlur={(e) => onUpdate(book.id, { takeaway: e.target.value })}
                    placeholder="Write your one-line takeaway..."
                    className="w-full bg-transparent border-b border-dashed border-[#E5E0D8] text-[13px] text-[#9A9590] italic focus:border-[#1A1A2E] outline-none pb-1"
                  />
                  <p className="font-mono text-[10px] text-[#9A9590] uppercase">FINISHED {format(new Date(book.completed_at || Date.now()), 'MMM d, yyyy')}</p>
               </div>
             )}
          </div>
       </div>

       <div className="mt-4 md:mt-0 md:ml-6 shrink-0">
          {!isComplete && !isReading && (
            <button 
              onClick={() => onStart(book.id)}
              className="px-6 py-2 border-[1.5px] border-[#E5E0D8] rounded-lg font-body text-[11px] font-bold tracking-widest uppercase hover:border-[#1A1A2E] transition-colors"
            >
              START
            </button>
          )}
          {isReading && (
            <Button size="sm" onClick={() => onComplete(book)} className="bg-[#1A6B4A] text-white tracking-widest font-bold text-[11px]">MARK COMPLETE</Button>
          )}
          {isComplete && (
             <div className="px-3 py-1 bg-[#E8F5EF] text-[#1A6B4A] rounded-[4px] font-body text-[10px] font-black uppercase tracking-widest">✓ DONE</div>
          )}
       </div>
    </div>
  );
};

const CuriosityCard = ({ node, unlocked }) => {
  const Icon = node.title.includes('AI') ? Cpu : node.title.includes('Brain') ? Brain : node.title.includes('Biotech') ? Microscope : Lightbulb;
  const color = node.title.includes('AI') ? '#7C3AED' : node.title.includes('Brain') ? '#1A1A2E' : node.title.includes('Biotech') ? '#C0392B' : '#E07B39';

  return (
    <Card className={clsx(
      "p-6 transition-all border-2",
      unlocked ? "" : "opacity-60 grayscale bg-[#E5E0D8]/20"
    )} style={{ borderColor: unlocked ? color : '#E5E0D8' }}>
       <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: unlocked ? `${color}15` : '#E5E0D8' }}>
            <Icon className="w-5 h-5" style={{ color: unlocked ? color : '#9A9590' }} />
          </div>
          <h3 className={clsx("font-display text-[15px] font-extrabold uppercase tracking-tight", unlocked ? "text-[#1A1A2E]" : "text-[#9A9590]")}>{node.title}</h3>
       </div>
       <p className={clsx("text-[13px] italic mb-6 leading-relaxed", unlocked ? "text-[#3D3830]" : "text-[#9A9590]")}>{node.description}</p>
       
       {unlocked ? (
         <button className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all" style={{ color }}>
           EXPLORE →
         </button>
       ) : (
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E5E0D8] rounded font-body text-[9px] font-black text-[#9A9590] uppercase tracking-widest">
            <Lock className="w-3 h-3" /> UNLOCKS AT PHASE {node.phase_required}
         </div>
       )}
    </Card>
  );
};

const Badge = ({ text, color, icon, className }) => {
  const styles = {
    emerald: 'bg-[#E8F5EF] text-[#1A6B4A]',
    orange: 'bg-[#FFF0E6] text-[#E07B39]',
    navy: 'bg-[#F0F0FF] text-[#1A1A2E]',
    label: 'bg-[#F5F4F0] text-[#9A9590]'
  };
  return (
    <div className={clsx("px-3 py-1.5 rounded-full flex items-center gap-2 font-body text-[11px] font-black tracking-widest uppercase", styles[color], className)}>
      {icon}
      {text}
    </div>
  );
};

export default FinanceBooks;
