import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

let searchCallback = null
export function openGlobalSearch() {
  if (searchCallback) searchCallback()
}

const STATIC_PAGES = [
  { label: 'Command Center', path: '/', desc: 'Daily HQ' },
  { label: 'Quest Log', path: '/quests', desc: 'Daily quests and clusters' },
  { label: 'Character Sheet', path: '/character', desc: 'Stats, badges, brain logs' },
  { label: 'Health', path: '/health', desc: 'Habits, physique, AI coach' },
  { label: 'SDE Roadmap', path: '/sde', desc: '8-month coding roadmap' },
  { label: 'Trading', path: '/trading', desc: 'Trades and journal' },
  { label: 'AI Engineer Track', path: '/ai-track', desc: '14-month AI roadmap' },
  { label: 'Explorer', path: '/explorer', desc: 'Weekly curiosity topics' },
  { label: 'Exam Mode', path: '/exams', desc: 'Semester subjects' },
  { label: 'Finance & Books', path: '/finance', desc: 'Books and milestones' },
  { label: 'AI Planner', path: '/planner', desc: 'JARVIS AI assistant' },
  { label: 'Pomodoro', path: '/pomodoro', desc: 'Focus timer' },
  { label: 'Weekly Review', path: '/weekly', desc: 'Week summary' },
  { label: 'Settings', path: '/settings', desc: 'App configuration' },
]

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [liveQuests, setLiveQuests] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    searchCallback = () => setIsOpen(true)
    return () => { searchCallback = null }
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      return
    }
    // Load quests on open
    supabase.from('daily_quests')
      .select('id, title, domain')
      .eq('is_active', true)
      .limit(20)
      .then(({ data }) => setLiveQuests(data || []))
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const pageResults = STATIC_PAGES
      .filter(p => 
        p.label.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q)
      )
      .map(p => ({ ...p, type: 'page' }))
    
    const questResults = liveQuests
      .filter(quest => quest.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map(quest => ({ 
        label: quest.title,
        path: '/quests',
        desc: `Quest · ${quest.domain}`,
        type: 'quest'
      }))

    setResults([...pageResults, ...questResults].slice(0, 8))
  }, [query, liveQuests])

  const handleSelect = (item) => {
    navigate(item.path)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-start 
            justify-center pt-20 px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg 
              shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 
              border-b border-[#E5E0D8]">
              <Search size={16} className="text-[#9A9590] shrink-0"/>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, quests..."
                className="flex-1 text-sm text-[#1A1A2E] 
                  font-['Inter'] focus:outline-none 
                  placeholder-[#9A9590]"
              />
              <button onClick={() => setIsOpen(false)}>
                <X size={16} className="text-[#9A9590]"/>
              </button>
            </div>

            {results.length > 0 && (
              <div className="py-2 max-h-72 overflow-y-auto">
                {results.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center 
                      justify-between px-4 py-3 hover:bg-[#F5F4F0]
                      transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#1A1A2E]
                        font-['Inter']">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-[#9A9590] 
                        font-['Inter']">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight size={14} 
                      className="text-[#9A9590] shrink-0"/>
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div className="p-4">
                <p className="text-[10px] text-[#9A9590] 
                  font-['Space_Mono'] uppercase tracking-wider">
                  Type to search pages and quests
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
