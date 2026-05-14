import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { useSdeStore } from '../store/sdeStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  BookOpen, 
  Check, 
  Lock, 
  ChevronRight, 
  DollarSign, 
  Search,
  FileText,
  Milestone,
  Lightbulb,
  Cpu,
  Brain,
  Microscope,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const FinanceBooks = () => {
  const { 
    books, 
    milestones, 
    curiosityNodes, 
    explorerBooks,
    explorerPapers,
    aiTrackBooks,
    aiTrackPapers,
    readingHistory,
    isLoadingKnowledge,
    loadFinanceData,
    markBookRead,
    markMilestoneAchieved 
  } = useFinanceStore();

  const { chapters, loadRoadmap: loadSde } = useSdeStore();
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    loadFinanceData();
    if (!chapters?.length) loadSde();
  }, []);

  if (isLoadingKnowledge && !books?.length) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-white animate-pulse rounded w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl" />)}
        </div>
        <div className="h-96 bg-white animate-pulse rounded-2xl" />
      </div>
    );
  }

  const sdeMonth3Complete = chapters?.filter(c => c.month_target <= 3).every(c => c.completed) || false;

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-6 pt-4">
        <p className="text-[10px] font-bold text-[#9A9590]
          font-['Space_Mono'] uppercase tracking-widest mb-1">
          Knowledge Store
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A2E] 
          font-['Inter']">
          Finance & Books
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-1 bg-white rounded-xl border 
        border-[#E5E0D8] p-1 w-fit mb-6 overflow-x-auto max-w-full">
        {['books', 'papers', 'milestones', 'curiosity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-lg text-[10px] font-bold shrink-0',
              'font-["Space_Mono"] uppercase tracking-wider',
              'transition-all',
              activeTab === tab
                ? 'bg-[#1A1A2E] text-white'
                : 'text-[#9A9590] hover:text-[#1A1A2E]'
            )}
          >
            {tab}
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
        >
          {activeTab === 'books' && (
            <div className="space-y-8">
              {/* SECTION 1: Finance Books */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[10px] font-bold text-[#9A9590]
                    font-['Space_Mono'] uppercase tracking-widest">
                    Finance Foundations
                  </p>
                  <span className="text-[9px] font-bold text-[#9A9590]
                    font-['Space_Mono']">
                    {books.length} books
                  </span>
                </div>
                {books.map(book => (
                  <BookItem 
                    key={book.id} 
                    book={book} 
                    isRead={readingHistory.includes(book.title)}
                    onToggle={() => markBookRead(book.title, !readingHistory.includes(book.title))}
                  />
                ))}
              </div>

              {/* SECTION 2: Explorer Books */}
              {explorerBooks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-widest">
                      Intellectual Explorer
                    </p>
                    <span className="text-[9px] font-bold text-[#9A9590]
                      font-['Space_Mono']">
                      {explorerBooks.length} books
                    </span>
                  </div>
                  {explorerBooks.map((book, idx) => (
                    <BookItem 
                      key={`exp-${idx}`} 
                      book={book} 
                      isRead={readingHistory.includes(book.title)}
                      onToggle={() => markBookRead(book.title, !readingHistory.includes(book.title))}
                    />
                  ))}
                </div>
              )}

              {/* SECTION 3: AI Track Books */}
              {aiTrackBooks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-widest">
                      AI Track Roadmap
                    </p>
                    <span className="text-[9px] font-bold text-[#9A9590]
                      font-['Space_Mono']">
                      {aiTrackBooks.length} books
                    </span>
                  </div>
                  {aiTrackBooks.map((book, idx) => (
                    <BookItem 
                      key={`ai-${idx}`} 
                      book={book} 
                      isRead={readingHistory.includes(book.title)}
                      onToggle={() => markBookRead(book.title, !readingHistory.includes(book.title))}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'papers' && (
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-[#E5E0D8] p-3 text-center">
                  <p className="text-lg font-bold text-[#1A1A2E] font-['Space_Mono']">
                    {explorerPapers.length + aiTrackPapers.length}
                  </p>
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider">
                    Total Papers
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E0D8] p-3 text-center">
                  <p className="text-lg font-bold text-[#E07B39] font-['Space_Mono']">
                    {explorerPapers.length}
                  </p>
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider">
                    Explorer
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-[#E5E0D8] p-3 text-center">
                  <p className="text-lg font-bold text-[#1A6B4A] font-['Space_Mono']">
                    {aiTrackPapers.length}
                  </p>
                  <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider">
                    AI Track
                  </p>
                </div>
              </div>

              {/* Explorer Papers */}
              {explorerPapers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-widest">
                      Explorer Research
                    </p>
                    <span className="text-[9px] font-bold text-[#9A9590]
                      font-['Space_Mono']">
                      {explorerPapers.length} papers
                    </span>
                  </div>
                  {explorerPapers.map((paper, idx) => (
                    <PaperItem key={`expp-${idx}`} paper={paper} />
                  ))}
                </div>
              )}

              {/* AI Track Papers */}
              {aiTrackPapers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-bold text-[#9A9590]
                      font-['Space_Mono'] uppercase tracking-widest">
                      AI & Deep Learning Papers
                    </p>
                    <span className="text-[9px] font-bold text-[#9A9590]
                      font-['Space_Mono']">
                      {aiTrackPapers.length} papers
                    </span>
                  </div>
                  {aiTrackPapers.map((paper, idx) => (
                    <PaperItem key={`aip-${idx}`} paper={paper} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <div className="mb-6 px-1">
                <p className="text-[10px] font-bold text-[#9A9590]
                  font-['Space_Mono'] uppercase tracking-widest">
                  Financial Evolution
                </p>
                <p className="text-sm text-[#1A1A2E] font-bold font-['Inter'] mt-1">
                  Income Roadmap
                </p>
              </div>
              <div className="relative pl-8 space-y-12">
                <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-[#E5E0D8]" />
                {milestones.map((m, idx) => (
                  <div key={m.id} className="relative group">
                    <div className={clsx(
                      "absolute -left-8 top-8 w-10 h-10 rounded-full border-4 border-[#F5F4F0] flex items-center justify-center transition-all z-10",
                      m.status === 'ACHIEVED' ? "bg-[#1A6B4A]" : m.status === 'IN_PROGRESS' ? "bg-[#E07B39] animate-pulse" : "bg-[#9A9590]"
                    )}>
                      {m.status === 'ACHIEVED' ? <Check size={18} className="text-white" /> : <DollarSign size={18} className="text-white" />}
                    </div>
                    
                    <Card className={clsx("p-6 transition-all hover:scale-[1.01] bg-white shadow-sm", m.status === 'LOCKED' ? 'opacity-70' : 'border-l-[4px]')} style={{ borderLeftColor: m.status === 'ACHIEVED' ? '#1A6B4A' : m.status === 'IN_PROGRESS' ? '#E07B39' : '#E5E0D8' }}>
                      <div className="flex justify-between items-start">
                         <div>
                           {m.category === 'TRADING' && (
                             <span className="text-[8px] font-bold bg-[#FFF0E6] text-[#E07B39] px-2 py-0.5 rounded-full mb-2 inline-block">TRADING</span>
                           )}
                           {m.amount_inr > 0 && <h3 className={clsx("text-xl font-bold font-['Space_Mono'] mb-1", m.status === 'ACHIEVED' ? 'text-[#1A6B4A]' : 'text-[#1A1A2E]')}>₹{m.amount_inr.toLocaleString()}</h3>}
                           <h4 className="text-sm font-bold text-[#1A1A2E]">{m.title}</h4>
                           <p className="text-[#9A9590] text-[11px] italic mt-1">{m.description}</p>
                         </div>
                         
                         <div className="text-right">
                            {m.status === 'ACHIEVED' ? (
                              <div className="space-y-1">
                                 <span className="text-[9px] font-bold bg-[#E8F5EF] text-[#1A6B4A] px-2 py-0.5 rounded uppercase">ACHIEVED</span>
                                 <p className="font-['Space_Mono'] text-[9px] text-[#9A9590] uppercase mt-2">{format(new Date(m.completed_at || Date.now()), 'MMM d, yyyy')}</p>
                              </div>
                            ) : idx === milestones.findIndex(ms => ms.status !== 'ACHIEVED') ? (
                              <div className="flex flex-col items-end gap-2">
                                 <span className="text-[9px] font-bold bg-[#FFF0E6] text-[#E07B39] px-2 py-0.5 rounded uppercase">TARGET</span>
                                 <button onClick={() => markMilestoneAchieved(m.id)} className="bg-[#1A6B4A] text-white text-[9px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider">ACHIEVE</button>
                              </div>
                            ) : null}
                         </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'curiosity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 mb-2 px-1">
                <p className="text-[10px] font-bold text-[#9A9590]
                  font-['Space_Mono'] uppercase tracking-widest">
                  Intellectual Horizon
                </p>
                <p className="text-sm text-[#1A1A2E] font-bold font-['Inter'] mt-1">
                  Curiosity Nodes
                </p>
              </div>
              {curiosityNodes.map(node => (
                <CuriosityCard 
                  key={node.id} 
                  node={node} 
                  unlocked={node.unlocked || (node.title === 'Agentic AI' && sdeMonth3Complete)} 
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const BookItem = ({ book, isRead, onToggle }) => (
  <div className="flex items-start justify-between gap-3 
    p-3 rounded-xl bg-white border border-[#E5E0D8] mb-2 group shadow-sm transition-all hover:border-[#1A1A2E]">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <button
        onClick={onToggle}
        className={clsx(
          'w-5 h-5 rounded border-2 flex items-center',
          'justify-center shrink-0 mt-0.5 transition-all',
          isRead
            ? 'bg-[#1A6B4A] border-[#1A6B4A]'
            : 'border-[#E5E0D8] bg-white'
        )}
      >
        {isRead && (
          <Check size={11} className="text-white" 
            strokeWidth={3}/>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-sm font-bold font-["Inter"]',
          isRead
            ? 'text-[#9A9590] line-through'
            : 'text-[#1A1A2E]'
        )}>
          {book.title}
        </p>
        {book.author && (
          <p className="text-[10px] text-[#9A9590] 
            font-['Inter'] mt-0.5">
            {book.author}
          </p>
        )}
        {book.sourceTopic && (
          <p className="text-[9px] text-[#E07B39]
            font-['Space_Mono'] uppercase tracking-wider mt-1">
            From: {book.sourceTopic}
          </p>
        )}
      </div>
    </div>
    {book.domain && (
      <span className="text-[8px] font-bold font-['Space_Mono']
        uppercase tracking-wider px-2 py-0.5 rounded-full
        bg-[#F5F4F0] text-[#9A9590] shrink-0 border border-[#E5E0D8]">
        {book.domain}
      </span>
    )}
  </div>
);

const PaperItem = ({ paper }) => (
  <div className="p-3 rounded-xl bg-white border border-[#E5E0D8] mb-2 shadow-sm transition-all hover:border-[#1A1A2E]">
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-5 h-5 rounded bg-[#F5F4F0] flex items-center justify-center shrink-0 mt-0.5">
          <FileText size={11} className="text-[#9A9590]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-['Inter'] text-[#1A1A2E]">
            {paper.title}
          </p>
          <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-0.5">
            {paper.authors || paper.author} {paper.year ? `· ${paper.year}` : ''}
          </p>
        </div>
      </div>
      <span className="text-[8px] font-bold font-['Space_Mono']
        uppercase tracking-wider px-2 py-0.5 rounded-full
        bg-[#F5F4F0] text-[#9A9590] shrink-0 border border-[#E5E0D8]">
        {paper.domain || paper.source || 'REFERENCE'}
      </span>
    </div>
    {paper.sourceTopic && (
      <p className="text-[9px] text-[#E07B39]
        font-['Space_Mono'] uppercase tracking-wider">
        Context: {paper.sourceTopic}
      </p>
    )}
  </div>
);

const CuriosityCard = ({ node, unlocked }) => {
  const Icon = node.title.includes('AI') ? Cpu : node.title.includes('Brain') ? Brain : node.title.includes('Biotech') ? Microscope : Lightbulb;
  const color = node.title.includes('AI') ? '#7C3AED' : node.title.includes('Brain') ? '#1A1A2E' : node.title.includes('Biotech') ? '#C0392B' : '#E07B39';

  return (
    <Card className={clsx(
      "p-5 transition-all border-2 bg-white",
      unlocked ? "" : "opacity-60 grayscale bg-[#E5E0D8]/20"
    )} style={{ borderColor: unlocked ? color : '#E5E0D8' }}>
       <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: unlocked ? `${color}15` : '#E5E0D8' }}>
            <Icon size={16} style={{ color: unlocked ? color : '#9A9590' }} />
          </div>
          <h3 className={clsx("text-xs font-bold uppercase tracking-tight", unlocked ? "text-[#1A1A2E]" : "text-[#9A9590]")}>{node.title}</h3>
       </div>
       <p className={clsx("text-[11px] italic mb-4 leading-relaxed", unlocked ? "text-[#3D3830]" : "text-[#9A9590]")}>{node.description}</p>
       
       {unlocked ? (
         <button className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all" style={{ color }}>
           EXPLORE →
         </button>
       ) : (
         <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-[#E5E0D8] rounded font-body text-[8px] font-black text-[#9A9590] uppercase tracking-widest">
            <Lock size={10} /> PHASE {node.phase_required}
         </div>
       )}
    </Card>
  );
};

export default FinanceBooks;
