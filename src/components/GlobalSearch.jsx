import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight, Zap, Target, Brain, Sword, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const ACTIONS = [
    { id: 'tasks', title: 'Daily Quests', icon: <Target size={14} />, path: '/quests', shortcut: 'Q' },
    { id: 'trading', title: 'Trading Terminal', icon: <Sword size={14} />, path: '/trading', shortcut: 'T' },
    { id: 'health', title: 'Health Protocol', icon: <Activity size={14} />, path: '/health', shortcut: 'H' },
    { id: 'character', title: 'Character Sheet', icon: <Zap size={14} />, path: '/character', shortcut: 'C' },
    { id: 'ai', title: 'AI Planner', icon: <Brain size={14} />, path: '/ai', shortcut: 'A' },
  ];

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(ACTIONS);
    } else {
      const filtered = ACTIONS.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [query]);

  const selectResult = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
            style={{ backgroundColor: 'rgba(26, 26, 46, 0.8)' }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5E0D8]"
              onClick={e => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-4 px-6 py-5 border-b border-[#F5F4F0]">
                <Search size={20} className="text-[#9A9590]" />
                <input 
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-lg font-['Inter'] text-[#1A1A2E] placeholder-[#9A9590]"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F5F4F0] rounded-lg border border-[#E5E0D8]">
                  <span className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">ESC</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    <p className="px-4 py-2 text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">Navigation</p>
                    {results.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => selectResult(res.path)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[#F5F4F0] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F4F0] group-hover:bg-white flex items-center justify-center text-[#1A1A2E] transition-colors border border-transparent group-hover:border-[#E5E0D8]">
                            {res.icon}
                          </div>
                          <span className="text-sm font-bold text-[#1A1A2E] font-['Inter']">{res.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] bg-[#F5F4F0] px-2 py-0.5 rounded border border-[#E5E0D8]">{res.shortcut}</span>
                           <ArrowRight size={14} className="text-[#9A9590] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-sm text-[#9A9590] font-['Inter']">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#F5F4F0] border-t border-[#E5E0D8] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-white border border-[#E5E0D8] flex items-center justify-center">
                       <ArrowRight size={8} className="text-[#9A9590] rotate-90" />
                    </div>
                    <span className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">Select</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="px-1 py-0.5 rounded bg-white border border-[#E5E0D8] text-[8px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">Enter</div>
                    <span className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase">Confirm</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <Command size={10} className="text-[#9A9590]" />
                   <span className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono']">PLAYER ONE OS v2.1</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search Trigger (Floating on Mobile) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-12 h-12 bg-[#1A1A2E] text-white rounded-full shadow-xl flex items-center justify-center lg:hidden z-40 border border-white/10"
      >
        <Search size={20} />
      </button>
    </>
  );
};

export default GlobalSearch;
