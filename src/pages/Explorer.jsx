import React, { useState, useEffect, useRef } from 'react'
import { useExplorerStore } from '../store/explorerStore'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import {
  Brain, Globe, Zap, BookOpen, FlaskConical,
  Lightbulb, ChevronDown, ChevronUp, Plus,
  Check, RefreshCw, Sparkles, ArrowRight,
  FileText, Archive, BarChart3, ExternalLink, Save, Cpu
} from 'lucide-react'

const domainConfig = {
  'Psychology':           { color: '#E07B39', bg: '#FFF0E6', icon: Brain },
  'Neuroscience':         { color: '#1A1A2E', bg: '#EEF2FF', icon: FlaskConical },
  'Cognitive Science':    { color: '#1A6B4A', bg: '#F0FDF4', icon: Lightbulb },
  'Geopolitics':          { color: '#C0392B', bg: '#FEF2F2', icon: Globe },
  'Artificial Intelligence': { color: '#7C3AED', bg: '#F5F3FF', icon: Cpu }
}

const Explorer = () => {
  const [activeTab, setActiveTab] = useState('current')
  const [brainDropInput, setBrainDropInput] = useState('')
  const [showBrainDrops, setShowBrainDrops] = useState(false)
  const [expandedConcept, setExpandedConcept] = useState(null)
  const [showPapers, setShowPapers] = useState(false)
  const [showBooks, setShowBooks] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [notesSaved, setNotesSaved] = useState(true)
  const notesTimer = useRef(null)
  const inputRef = useRef(null)

  const {
    weeklyTopic, dailyConcepts, books, papers,
    currentTopicId, currentNotes, topicArchive,
    brainDrops, readItems, knowledgeDepth,
    isGenerating, isSavingNotes, lastGenerated,
    loadSavedTopic, generateWeeklyTopic, addBrainDrop,
    loadBrainDrops, markRead, saveNotes, exportToGoogleDocs,
    loadArchive, loadKnowledgeDepth, viewArchivedTopic
  } = useExplorerStore()

  useEffect(() => {
    loadSavedTopic()
    loadBrainDrops()
    loadArchive()
    loadKnowledgeDepth()
  }, [])

  useEffect(() => {
    setNotesValue(currentNotes || '')
  }, [currentNotes])

  const handleBrainDrop = async () => {
    if (!brainDropInput.trim()) return
    await addBrainDrop(brainDropInput.trim(), weeklyTopic?.title || 'General')
    setBrainDropInput('')
  }

  const handleNotesChange = (val) => {
    setNotesValue(val)
    setNotesSaved(false)
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => {
      saveNotes(val)
      setNotesSaved(true)
    }, 1500)
  }

  const renderCurrentTab = () => {
    if (!weeklyTopic && !isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-20 h-20 bg-white rounded-3xl border border-[#E5E0D8] flex items-center justify-center shadow-sm">
            <Brain size={36} className="text-[#E07B39]" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#1A1A2E] font-['Inter'] mb-2">
              Your mind is hungry. Feed it.
            </p>
            <p className="text-sm text-[#9A9590] font-['Inter'] max-w-sm">
              Generate your first weekly topic — a deep dive into Psychology, 
              Neuroscience, Cognitive Science, Geopolitics, or AI.
            </p>
          </div>
          <button
            onClick={generateWeeklyTopic}
            className="bg-[#E07B39] text-white px-8 py-3 rounded-xl font-bold font-['Space_Mono'] uppercase tracking-wider hover:opacity-90 transition-all text-sm"
          >
            Start Exploring
          </button>
        </div>
      )
    }

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 bg-[#1A1A2E] rounded-2xl flex items-center justify-center animate-pulse">
            <Brain size={24} className="text-[#E07B39]" />
          </div>
          <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-wider">
            Curating your rabbit hole...
          </p>
          <p className="text-xs text-[#9A9590] font-['Inter']">
            Igniting curiosity with Groq Llama 3.3...
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-5">
          {/* DOMAIN BADGE + BIG QUESTION CARD */}
          <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              {(() => {
                const cfg = domainConfig[weeklyTopic.domain] || domainConfig['Psychology']
                const Icon = cfg.icon
                return (
                  <span className="flex items-center gap-2 text-xs font-bold font-['Space_Mono'] uppercase tracking-widest"
                    style={{ color: cfg.color }}>
                    <Icon size={14} />
                    {weeklyTopic.domain}
                  </span>
                )
              })()}
            </div>
            <p className="text-[10px] font-['Space_Mono'] uppercase tracking-widest text-white/40 mb-2">
              This Week's Big Question
            </p>
            <p className="text-lg font-bold font-['Inter'] leading-snug text-white">
              "{weeklyTopic.bigQuestion}"
            </p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/60 font-['Inter'] leading-relaxed">
                {weeklyTopic.whyItMatters}
              </p>
            </div>
          </div>

          {/* IGNITION HOOK */}
          {weeklyTopic?.ignitionHook && (
            <div className="bg-[#FFF0E6] rounded-xl border border-orange-100 p-4 flex gap-3">
              <Zap size={16} className="text-[#E07B39] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-[#E07B39] font-['Space_Mono'] uppercase tracking-wider mb-1">
                  Why You Need This Now
                </p>
                <p className="text-sm text-[#3D3830] font-['Inter'] leading-relaxed">
                  {weeklyTopic.ignitionHook}
                </p>
              </div>
            </div>
          )}

          {/* DAILY CONCEPTS */}
          <div>
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-3">
              5 Concepts This Week
            </p>
            <div className="flex flex-col gap-3">
              {dailyConcepts.map((concept, i) => {
                const isRead = readItems.has(concept.title)
                const isExpanded = expandedConcept === i
                return (
                  <motion.div
                    key={i}
                    layout
                    className={clsx(
                      'bg-white rounded-xl border transition-all cursor-pointer',
                      isRead ? 'border-[#1A6B4A]/30' : 'border-[#E5E0D8]',
                      'hover:border-[#E07B39]/40'
                    )}
                  >
                    <div
                      className="flex items-center justify-between p-4"
                      onClick={() => setExpandedConcept(isExpanded ? null : i)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-["Space_Mono"] shrink-0',
                          isRead ? 'bg-[#1A6B4A] text-white' : 'bg-[#F5F4F0] text-[#9A9590]'
                        )}>
                          {isRead ? <Check size={12} /> : i + 1}
                        </div>
                        <span className={clsx(
                          'text-[9px] font-bold font-["Space_Mono"] uppercase px-1.5 py-0.5 rounded hidden sm:inline-block',
                          concept.depthLevel === 'Advanced' ? 'bg-purple-50 text-purple-600' :
                          concept.depthLevel === 'Intermediate' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-blue-50 text-blue-600'
                        )}>
                          {concept.depthLevel || 'Foundation'}
                        </span>
                        <p className={clsx(
                          'text-sm font-bold font-["Inter"]',
                          isRead ? 'text-[#9A9590] line-through' : 'text-[#1A1A2E]'
                        )}>
                          {concept.title}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={14} className="text-[#9A9590]" /> : <ChevronDown size={14} className="text-[#9A9590]" />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4"
                        >
                          <div className="border-t border-[#E5E0D8] pt-4">
                            <p className="text-sm text-[#3D3830] font-['Inter'] leading-relaxed mb-3">
                              {concept.summary}
                            </p>
                            <div className="bg-[#FFF0E6] rounded-lg p-3 mb-3">
                              <p className="text-[10px] font-bold text-[#E07B39] font-['Space_Mono'] uppercase tracking-wider mb-1">
                                Why this matters for you
                              </p>
                              <p className="text-xs text-[#3D3830] font-['Inter']">
                                {concept.whyForYou}
                              </p>
                            </div>
                            {!isRead && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markRead(concept.title) }}
                                className="text-xs bg-[#1A6B4A] text-white px-3 py-1.5 rounded-lg font-bold font-['Space_Mono'] uppercase tracking-wider hover:opacity-90 flex items-center gap-1"
                              >
                                <Check size={11} /> Mark Read
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* RESEARCH PAPERS */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <button
              onClick={() => setShowPapers(!showPapers)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FlaskConical size={15} className="text-[#1A1A2E]" />
                <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-widest">
                  Research Papers ({papers.length})
                </p>
              </div>
              {showPapers ? <ChevronUp size={14} className="text-[#9A9590]" /> : <ChevronDown size={14} className="text-[#9A9590]" />}
            </button>

            <AnimatePresence>
              {showPapers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 mt-4 pt-4 border-t border-[#E5E0D8]"
                >
                  {papers.map((paper, i) => (
                    <div key={i} className="bg-[#F5F4F0] rounded-xl p-4">
                      <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] mb-1">
                        {paper.title}
                      </p>
                      <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] mb-2">
                        {paper.authors} • {paper.journal} • {paper.year}
                      </p>
                      <p className="text-xs text-[#3D3830] font-['Inter'] leading-relaxed">
                        {paper.plainSummary}
                      </p>
                      {paper.mindblowFactor && (
                        <div className="mt-2 bg-[#1A1A2E] rounded-lg px-3 py-2 flex gap-2 items-start">
                          <Zap size={11} className="text-[#E07B39] shrink-0 mt-0.5" />
                          <p className="text-[10px] text-white/80 font-['Inter'] leading-relaxed">
                            {paper.mindblowFactor}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOOKS */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <button
              onClick={() => setShowBooks(!showBooks)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-[#1A1A2E]" />
                <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-widest">
                  Recommended Books ({books.length})
                </p>
              </div>
              {showBooks ? <ChevronUp size={14} className="text-[#9A9590]" /> : <ChevronDown size={14} className="text-[#9A9590]" />}
            </button>

            <AnimatePresence>
              {showBooks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#E5E0D8]"
                >
                  {books.map((book, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#F5F4F0] rounded-xl">
                      <div className="w-8 h-8 bg-[#1A1A2E] rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen size={14} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']">{book.title}</p>
                        <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] mb-1">{book.author}</p>
                        <p className="text-xs text-[#3D3830] font-['Inter'] leading-relaxed">{book.why}</p>
                        <span className={clsx(
                          'inline-block mt-2 text-[9px] font-bold font-["Space_Mono"] uppercase tracking-wider px-2 py-0.5 rounded-full',
                          book.difficulty === 'Accessible' ? 'bg-green-50 text-green-700' :
                          book.difficulty === 'Dense' ? 'bg-red-50 text-red-700' :
                          'bg-yellow-50 text-yellow-700'
                        )}>
                          {book.difficulty}
                        </span>
                        {book.readThisIf && (
                          <p className="text-[10px] text-[#9A9590] font-['Inter'] mt-1 italic">
                            {book.readThisIf}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ROADMAP POSITION */}
          {weeklyTopic?.roadmapPosition && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-4">
                Roadmap Position
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9A9590] font-['Inter']">Phase</p>
                  <span className={clsx(
                    'text-[10px] font-bold font-["Space_Mono"] uppercase px-2 py-1 rounded-lg',
                    weeklyTopic.roadmapPosition.phase === 'Awakening' ? 'bg-orange-50 text-orange-600' :
                    weeklyTopic.roadmapPosition.phase === 'Foundation' ? 'bg-blue-50 text-blue-600' :
                    weeklyTopic.roadmapPosition.phase === 'Deepening' ? 'bg-purple-50 text-purple-600' :
                    'bg-emerald-50 text-emerald-700'
                  )}>
                    {weeklyTopic.roadmapPosition.phase}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider mb-1">Core Skill Being Built</p>
                  <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']">{weeklyTopic.roadmapPosition.coreSkill}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F5F4F0] rounded-xl p-3">
                    <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider mb-1">Prerequisite</p>
                    <p className="text-xs text-[#1A1A2E] font-['Inter']">{weeklyTopic.roadmapPosition.prerequisite || 'None'}</p>
                  </div>
                  <div className="bg-[#F5F4F0] rounded-xl p-3">
                    <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase tracking-wider mb-1">Opens Up Next</p>
                    <p className="text-xs text-[#1A1A2E] font-['Inter']">{weeklyTopic.roadmapPosition.leadsTo || 'TBD'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESEARCH NOTES EDITOR */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#1A1A2E]" />
                <p className="text-xs font-bold text-[#1A1A2E] font-['Space_Mono'] uppercase tracking-widest">
                  My Research Notes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-[9px] font-bold font-["Space_Mono"] uppercase tracking-wider transition-all',
                  notesSaved ? 'text-[#1A6B4A]' : 'text-[#9A9590]'
                )}>
                  {notesSaved ? 'Saved ✓' : 'Saving...'}
                </span>
              </div>
            </div>
            <textarea
              value={notesValue}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder={`Write your notes, thoughts, and insights about "${weeklyTopic?.title}"...\n\nThis is your permanent research log — it saves automatically and stays forever even after you generate a new topic.`}
              className="w-full bg-[#F5F4F0] border border-transparent focus:border-[#E07B39] rounded-xl p-4 text-sm font-['Inter'] text-[#1A1A2E] placeholder-[#9A9590] resize-none focus:outline-none transition-all min-h-[200px] leading-relaxed"
            />
            <button
              onClick={() => exportToGoogleDocs(weeklyTopic, dailyConcepts, papers, books, notesValue, brainDrops)}
              className="mt-3 flex items-center gap-2 text-xs font-bold font-['Space_Mono'] uppercase tracking-wider text-[#9A9590] hover:text-[#1A1A2E] transition-colors"
            >
              <ExternalLink size={12} />
              Copy & Open in Google Docs
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-[340px] lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
          {/* BRAIN DROP INPUT */}
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-[#E07B39]" />
              <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
                Brain Drop
              </p>
            </div>
            <p className="text-xs text-[#9A9590] font-['Inter'] mb-3">
              A thought just hit you? Drop it here instantly.
            </p>
            <textarea
              ref={inputRef}
              value={brainDropInput}
              onChange={e => setBrainDropInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBrainDrop() } }}
              placeholder="What's firing in your brain right now..."
              className="w-full bg-[#F5F4F0] border border-transparent focus:border-[#E07B39] rounded-xl p-3 text-sm font-['Inter'] text-[#1A1A2E] placeholder-[#9A9590] resize-none focus:outline-none transition-all min-h-[80px]"
            />
            <button
              onClick={handleBrainDrop}
              disabled={!brainDropInput.trim()}
              className="w-full mt-2 bg-[#E07B39] text-white py-2.5 rounded-xl text-xs font-bold font-['Space_Mono'] uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus size={13} /> Drop It
            </button>
          </div>

          {/* PAST BRAIN DROPS */}
          {brainDrops.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <button
                onClick={() => setShowBrainDrops(!showBrainDrops)}
                className="w-full flex items-center justify-between mb-1"
              >
                <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
                  Past Drops ({brainDrops.length})
                </p>
                {showBrainDrops ? <ChevronUp size={13} className="text-[#9A9590]" /> : <ChevronDown size={13} className="text-[#9A9590]" />}
              </button>

              <AnimatePresence>
                {showBrainDrops && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 mt-3"
                  >
                    {brainDrops.map((drop, i) => (
                      <div key={i} className="bg-[#F5F4F0] rounded-xl p-3 border-l-4 border-[#E07B39]">
                        <p className="text-xs text-[#1A1A2E] font-['Inter'] leading-relaxed">{drop.content}</p>
                        <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] mt-1 uppercase">
                          {drop.topic_title} • {drop.created_at ? format(new Date(drop.created_at), 'MMM d') : ''}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* PROGRESS CARD */}
          <div className="bg-[#F5F4F0] rounded-2xl border border-[#E5E0D8] p-5">
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest mb-3">
              This Week
            </p>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#3D3830] font-['Inter']">Concepts read</p>
              <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">
                {readItems.size} / {dailyConcepts.length}
              </p>
            </div>
            <div className="h-1.5 bg-white rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#1A6B4A] rounded-full transition-all"
                style={{ width: `${dailyConcepts.length ? (readItems.size / dailyConcepts.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#3D3830] font-['Inter']">Brain drops</p>
              <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">{brainDrops.length}</p>
            </div>
            {lastGenerated && (
              <p className="text-[9px] text-[#9A9590] font-['Space_Mono'] uppercase mt-3">
                Generated {format(new Date(lastGenerated), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderArchiveTab = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
          {topicArchive.length} explorations on record
        </p>
      </div>

      {topicArchive.length === 0 && (
        <div className="text-center py-16">
          <Archive size={32} className="text-[#E5E0D8] mx-auto mb-3" />
          <p className="text-sm text-[#9A9590] font-['Inter']">
            No archived topics yet. Complete your first exploration.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {topicArchive.map((entry, i) => {
          const cfg = domainConfig[entry.domain] || domainConfig['Psychology']
          const Icon = cfg.icon
          const readCount = (entry.read_concepts || []).length
          const totalConcepts = (entry.concepts || []).length
          const isCompleted = entry.completed
          const hasNotes = entry.notes && entry.notes.trim().length > 0

          return (
            <div
              key={entry.id}
              className={clsx(
                'bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all group',
                isCompleted ? 'border-[#1A6B4A]/30' : 'border-[#E5E0D8]'
              )}
              onClick={() => {
                viewArchivedTopic(entry)
                setActiveTab('current')
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg }}>
                    <Icon size={15} style={{ color: cfg.color }} />
                  </div>
                  <span className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-wider"
                    style={{ color: cfg.color }}>
                    {entry.domain}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNotes && (
                    <span className="text-[9px] font-bold font-['Space_Mono'] uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      Notes
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[9px] font-bold font-['Space_Mono'] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] leading-snug mb-1 group-hover:text-[#E07B39] transition-colors">
                {entry.topic_data?.title || 'Untitled'}
              </p>
              <p className="text-xs text-[#9A9590] font-['Inter'] leading-relaxed mb-3 line-clamp-2">
                {entry.topic_data?.bigQuestion || ''}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-['Space_Mono'] text-[#9A9590]">
                    {readCount}/{totalConcepts} read
                  </span>
                  <div className="w-16 h-1 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A6B4A] rounded-full"
                      style={{ width: `${totalConcepts ? (readCount / totalConcepts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-[#9A9590] font-['Space_Mono']">
                  {entry.created_at ? format(new Date(entry.created_at), 'MMM d, yyyy') : ''}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderDepthTab = () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold text-[#1A1A2E] font-['Inter'] mb-1">
          Your Knowledge Map
        </p>
        <p className="text-xs text-[#9A9590] font-['Inter']">
          Every topic you explore, every concept you read, every brain drop you save
          builds your depth score. This is your intellectual fingerprint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {knowledgeDepth.map((kd, i) => {
          const cfg = domainConfig[kd.domain] || domainConfig['Psychology']
          const Icon = cfg.icon
          const maxScore = 500
          const pct = Math.min(100, Math.floor((kd.depth_score / maxScore) * 100))
          const phase = pct < 20 ? 'Awakening' : pct < 50 ? 'Foundation' : pct < 80 ? 'Deepening' : 'Mastery'

          return (
            <div key={kd.id} className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg }}>
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E] font-['Inter']">{kd.domain}</p>
                    <p className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-wider"
                      style={{ color: cfg.color }}>
                      {phase}
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-[#1A1A2E] font-['Space_Mono']">
                  {kd.depth_score}
                </span>
              </div>

              <div className="h-2 bg-[#F5F4F0] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: cfg.color
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">{kd.topics_explored}</p>
                  <p className="text-[9px] text-[#9A9590] font-['Inter'] uppercase tracking-wide">Topics</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">{kd.concepts_read}</p>
                  <p className="text-[9px] text-[#9A9590] font-['Inter'] uppercase tracking-wide">Concepts</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1A1A2E] font-['Space_Mono']">{kd.brain_drops}</p>
                  <p className="text-[9px] text-[#9A9590] font-['Inter'] uppercase tracking-wide">Drops</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* TOTAL DEPTH SUMMARY */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white">
        <p className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-widest text-white/40 mb-2">
          Total Intellectual Output
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Topics Explored', value: knowledgeDepth.reduce((s, k) => s + (k.topics_explored || 0), 0) },
            { label: 'Concepts Read', value: knowledgeDepth.reduce((s, k) => s + (k.concepts_read || 0), 0) },
            { label: 'Brain Drops', value: knowledgeDepth.reduce((s, k) => s + (k.brain_drops || 0), 0) },
            { label: 'Total Depth Score', value: knowledgeDepth.reduce((s, k) => s + (k.depth_score || 0), 0) }
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl font-bold font-['Space_Mono'] text-white">{stat.value}</p>
              <p className="text-[10px] text-white/40 font-['Inter'] uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#E07B39]" />
            <p className="text-[10px] font-bold text-[#9A9590] font-['Space_Mono'] uppercase tracking-widest">
              Explorer — Weekly Rabbit Hole
            </p>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-['Inter'] tracking-tight">
            {weeklyTopic ? weeklyTopic.title : 'Ready to explore?'}
          </h1>
          {weeklyTopic && (
            <p className="text-sm text-[#9A9590] font-['Inter'] mt-1 max-w-xl">
              {weeklyTopic.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={generateWeeklyTopic}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-[#1A1A2E] text-white px-4 py-2.5 rounded-xl text-xs font-bold font-['Space_Mono'] uppercase tracking-wider hover:bg-[#2a2a4e] transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Generating...' : 'New Topic'}
        </button>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-[#E5E0D8] p-1 w-fit">
        {[
          { id: 'current', label: 'Current', icon: Brain },
          { id: 'archive', label: 'Archive', icon: Archive },
          { id: 'depth', label: 'Knowledge Depth', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-["Space_Mono"] uppercase tracking-wider transition-all',
                activeTab === tab.id
                  ? 'bg-[#1A1A2E] text-white'
                  : 'text-[#9A9590] hover:text-[#1A1A2E]'
              )}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'current' && renderCurrentTab()}
      {activeTab === 'archive' && renderArchiveTab()}
      {activeTab === 'depth' && renderDepthTab()}
    </div>
  )
}

export default Explorer
