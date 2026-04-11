import React, { useState, useEffect, useMemo } from 'react';
import { useFinanceStore } from '../store/financeStore';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import { 
  BookOpen, 
  TrendingUp, 
  Flame, 
  Search, 
  Plus, 
  Star, 
  CheckCircle2, 
  Lock, 
  ChevronRight,
  Filter,
  Layers,
  Zap,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const CATEGORIES = ['All', 'Finance', 'Psychology', 'Startup', 'Marketing', 'Brain', 'Philosophy', 'Productivity'];

const FinanceBooks = () => {
  const { books, milestones, readingStreak, loading, loadFinanceData, updateBookProgress, startBook, updateMilestone } = useFinanceStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [pageInput, setPageInput] = useState('');

  useEffect(() => {
    loadFinanceData();
  }, []);

  const currentlyReading = useMemo(() => {
    return books.find(b => b.status === 'READING');
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (activeCategory === 'All') return books;
    return books.filter(b => b.category === activeCategory);
  }, [books, activeCategory]);

  const stats = useMemo(() => {
    const read = books.filter(b => b.status === 'COMPLETED').length;
    const pages = books.reduce((sum, b) => sum + (b.pages_read || 0), 0);
    const uniqueCats = new Set(books.filter(b => b.status === 'COMPLETED').map(b => b.category)).size;
    return { read, pages, uniqueCats };
  }, [books]);

  const handleUpdatePages = (e) => {
    e.preventDefault();
    if (currentlyReading && pageInput) {
      updateBookProgress(currentlyReading.id, parseInt(pageInput));
      setPageInput('');
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'finance': return '#1A6B4A';
      case 'psychology': return '#7C3AED';
      case 'startup': return '#1A1A2E';
      case 'marketing': return '#E07B39';
      case 'brain': return '#C0392B';
      default: return '#64748B';
    }
  };

  if (loading && books.length === 0) return <div className="p-8 animate-pulse text-slate-400">Loading Wisdom Library...</div>;

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-display font-extrabold text-[#1A1A2E] leading-tight mb-1 uppercase">FINANCE & BOOKS</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Knowledge compounds. Read daily.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Books Read', value: stats.read, icon: <BookOpen className="w-4 h-4" />, color: 'text-navy-600' },
          { label: 'Pages Read', value: stats.pages.toLocaleString(), icon: <Layers className="w-4 h-4" />, color: 'text-violet-600' },
          { label: 'Reading Streak', value: readingStreak, suffix: ' Days', icon: <Flame className="w-4 h-4" />, color: 'text-orange-500' },
          { label: 'Categories', value: `${stats.uniqueCats}/5`, icon: <Filter className="w-4 h-4" />, color: 'text-emerald-600' },
        ].map(stat => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx("p-1.5 rounded-lg bg-slate-50", stat.color)}>{stat.icon}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className="text-xl font-mono font-bold text-slate-900">{stat.value}<span className="text-sm font-sans text-slate-400 ml-1">{stat.suffix}</span></p>
          </Card>
        ))}
      </div>

      {/* Currently Reading Section */}
      {currentlyReading && (
        <Card className="p-0 overflow-hidden border-navy-100 shadow-xl shadow-navy-100/10">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 p-8 bg-slate-50 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100">
               <div className="w-40 h-56 bg-white rounded-lg shadow-2xl overflow-hidden relative group cursor-pointer transition-transform hover:-rotate-2">
                  <div className="absolute inset-0 bg-navy-900/10" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy-900/80 to-transparent">
                     <p className="text-white text-[10px] font-bold uppercase tracking-widest">{currentlyReading.category}</p>
                  </div>
               </div>
               <div className="mt-6 text-center">
                  <h3 className="text-lg font-display font-bold text-slate-900">{currentlyReading.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">by {currentlyReading.author}</p>
               </div>
            </div>
            
            <div className="flex-1 p-8">
               <div className="flex justify-between items-start mb-8">
                 <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                   <p className="text-xl font-display font-bold text-navy-900">
                    Page <span className="font-mono">{currentlyReading.pages_read || 0}</span> 
                    <span className="text-slate-300 font-medium mx-2">/</span> 
                    <span className="font-mono">{currentlyReading.total_pages}</span>
                   </p>
                 </div>
                 <Badge text={`${Math.floor((currentlyReading.pages_read/currentlyReading.total_pages)*100)}% Complete`} color="navy" />
               </div>

               <ProgressBar 
                value={(currentlyReading.pages_read / currentlyReading.total_pages) * 100} 
                color="navy" 
                height="12px" 
               />

               <form onSubmit={handleUpdatePages} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Read Today</label>
                    <div className="flex gap-2">
                       <input 
                        type="number"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        placeholder="+20 pages"
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold"
                       />
                       <Button type="submit" variant="primary" className="px-6 h-12 shadow-lg shadow-navy-100">+15 XP</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Review/Notes</label>
                    <textarea 
                      placeholder="Write your takeaways..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium"
                      rows={2}
                    />
                  </div>
               </form>

               <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                  <Button onClick={() => updateBookProgress(currentlyReading.id, 1000)} variant="ghost" className="text-success border-success hover:bg-green-50 uppercase tracking-widest font-bold text-[11px] h-10 px-8">
                    Mark as Complete
                  </Button>
               </div>
            </div>
          </div>
        </Card>
      )}

      {/* Book Grid */}
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {CATEGORIES.map(cat => (
             <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-5 py-2 rounded-lg text-xs font-bold tracking-widest whitespace-nowrap transition-all",
                activeCategory === cat ? "bg-navy-900 text-white shadow-lg" : "bg-white border border-slate-100 text-slate-500 hover:border-slate-300"
              )}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <Card key={book.id} className="p-0 overflow-hidden border-slate-200 hover:border-navy-200 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(book.category) }} />
                    <Badge text={book.category} color="label" />
                  </div>
                  {book.status === 'COMPLETED' && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </div>

                <h3 className="text-[15px] font-bold text-slate-900 mb-1 group-hover:text-navy-900 transition-colors">{book.title}</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">by {book.author}</p>

                {book.status === 'READING' && (
                  <div className="space-y-4 mb-6">
                     <ProgressBar value={(book.pages_read/book.total_pages)*100} height="6px" color="navy" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase text-center">{Math.floor((book.pages_read/book.total_pages)*100)}% READ</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className={clsx(
                    "px-2.5 py-1 rounded text-[9px] font-bold tracking-widest uppercase",
                    book.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                    book.status === 'READING' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                  )}>
                    {book.status.replace('_', ' ')}
                  </div>
                  
                  {book.status === 'NOT_STARTED' && (
                    <button 
                      onClick={() => startBook(book.id)}
                      className="text-[10px] font-bold text-navy-600 uppercase tracking-widest flex items-center gap-1 hover:text-navy-900"
                    >
                      Start Reading <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Income Roadmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: Milestone Timeline */}
        <div className="lg:col-span-8 space-y-8">
           <div>
             <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight uppercase">INCOME ROADMAP</h2>
             <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">First rupee → indie creator → startup</p>
           </div>
           
           <div className="space-y-8 relative">
              <div className="absolute left-[30px] top-0 bottom-0 w-0.5 bg-slate-100" />
              {milestones.map(m => (
                <div key={m.id} className="relative flex gap-10">
                   <div className={clsx(
                     "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all shadow-xl",
                     m.status === 'ACHIEVED' ? "bg-emerald-500 text-white" : 
                     m.status === 'IN_PROGRESS' ? "bg-navy-900 text-white" : "bg-white border-2 border-slate-100 text-slate-300"
                   )}>
                      <DollarSign className="w-6 h-6" />
                   </div>
                   <div className="flex-1 glass p-6 rounded-2xl border border-slate-100 hover:border-navy-200 transition-all group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-2xl font-display font-bold text-slate-900">{m.amount}</p>
                          <p className="text-sm text-slate-500 font-medium group-hover:text-slate-800 transition-colors">{m.description}</p>
                        </div>
                        <Badge 
                          text={m.status.replace('_', ' ')} 
                          color={m.status === 'ACHIEVED' ? 'success' : m.status === 'IN_PROGRESS' ? 'navy' : 'label'}
                        />
                      </div>
                      {m.date && <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Achieved: {m.date}</p>}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT: Curiosity Arc */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 border-amber-100 bg-amber-50/10">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest italic">Future Learning Arc</h3>
              </div>
              
              <div className="space-y-4">
                 {[
                   { label: 'Biotech ML — AlphaFold', icon: '🔬' },
                   { label: 'Brain & Psychology deep dive', icon: '🧠' },
                   { label: 'Agentic AI — multi-agent sys', icon: '🤖' },
                   { label: 'Startup idea validation', icon: '💡' },
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between p-4 bg-white/50 border border-slate-100 rounded-xl opacity-60 grayscale">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-slate-300" />
                   </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-amber-100 text-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Unlocks after Phase 3 complete</p>
                 <div className="space-y-2">
                    <ProgressBar value={40} color="navy" height="4px" />
                    <p className="text-[9px] font-bold text-navy-900">40% TOWARD UNLOCK</p>
                 </div>
              </div>
           </Card>

           <Card className="p-8 bg-navy-900 text-white border-none shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Reading Strategy</h3>
              <ul className="space-y-4">
                 {[
                   'Never start a second book without finishing the first.',
                   'Write down 3 actionable takeaways per chapter.',
                   'Implement one financial rule immediately after reading.'
                 ].map((tip, i) => (
                   <li key={i} className="flex gap-3">
                      <div className="w-1 h-1 rounded-full bg-xp mt-2" />
                      <p className="text-[11px] text-navy-300 leading-relaxed">{tip}</p>
                   </li>
                 ))}
              </ul>
           </Card>
        </div>
      </div>

    </div>
  );
};

export default FinanceBooks;
