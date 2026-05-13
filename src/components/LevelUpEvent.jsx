import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Star, X } from 'lucide-react'
import { getMilestoneForLevel } from '../lib/levelMilestones'

// Module-level callback
let levelUpCallback = null

export function triggerLevelUp(newLevel, jarvisLine) {
  if (levelUpCallback) levelUpCallback({ newLevel, jarvisLine })
}

const LEVEL_TITLES = {
  1: 'Initiate',
  2: 'Apprentice',
  3: 'Practitioner',
  4: 'Specialist',
  5: 'Expert',
  6: 'Senior',
  7: 'Principal',
  8: 'Architect',
  9: 'Grandmaster',
  10: 'Legend',
  11: 'Mythic',
  12: 'Transcendent',
  13: 'Omniscient',
  14: 'Eternal',
  15: 'PLAYER ONE'
}

const getTitle = (level) => {
  if (level <= 15) return LEVEL_TITLES[level] || 'Ascended'
  if (level <= 25) return 'Ascended'
  if (level <= 50) return 'Cosmic'
  return 'PLAYER INFINITE'
}

// Confetti particle
const Particle = ({ delay, x, color }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{ backgroundColor: color, left: `${x}%`, top: '40%' }}
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{
      y: [0, -120, 200],
      x: [0, (Math.random() - 0.5) * 100],
      opacity: [1, 1, 0],
      scale: [1, 1.5, 0],
      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)]
    }}
    transition={{
      duration: 1.8,
      delay,
      ease: 'easeOut'
    }}
  />
)

const LevelUpEvent = () => {
  const [event, setEvent] = useState(null)
  const [particles, setParticles] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    levelUpCallback = (config) => {
      // Generate particles
      const colors = ['#E07B39','#1A1A2E','#1A6B4A',
        '#F5F4F0','#E07B39','#7C3AED']
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.5,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      }))
      setParticles(newParticles)
      setEvent(config)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setEvent(null)
        setParticles([])
      }, 6000)
    }
    return () => { levelUpCallback = null }
  }, [])

  const handleClose = () => {
    setEvent(null)
    setParticles([])
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center 
            justify-center"
          style={{ backgroundColor: 'rgba(26,26,46,0.97)' }}
          onClick={handleClose}
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden 
            pointer-events-none">
            {particles.map(p => (
              <Particle key={p.id} {...p}/>
            ))}
          </div>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 20,
              delay: 0.1
            }}
            className="flex flex-col items-center text-center 
              px-8 relative z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Level up label */}
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[11px] font-bold text-[#E07B39] 
                font-['Space_Mono'] uppercase tracking-[0.4em] mb-6"
            >
              ⚡ Level Up ⚡
            </motion.p>

            {/* Level number */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 15, 
                delay: 0.2 
              }}
              className="relative mb-6"
            >
              {/* Glow ring */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #E07B39 0%, transparent 70%)',
                  margin: '-20px'
                }}
              />

              <div className="w-32 h-32 rounded-full bg-[#E07B39] 
                flex items-center justify-center relative z-10 shadow-2xl">
                <p className="text-5xl font-bold text-white 
                  font-['Space_Mono']">
                  {event.newLevel}
                </p>
              </div>
            </motion.div>

            {/* Milestone Unlock */}
            {getMilestoneForLevel(event.newLevel) && (() => {
              const milestone = getMilestoneForLevel(event.newLevel);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 bg-white/10 rounded-2xl px-6 py-4 
                    border border-white/20 mb-6 max-w-sm"
                >
                  <p className="text-[9px] font-bold text-white/50 
                    font-['Space_Mono'] uppercase tracking-widest mb-1">
                    Milestone Unlocked
                  </p>
                  <p className="text-lg text-white font-bold font-['Inter'] mb-1">
                    {milestone.icon} {milestone.title}
                  </p>
                  <p className="text-xs text-white/70 font-['Inter']">
                    {milestone.unlock}
                  </p>
                  <p className="text-xs text-white/50 font-['Inter'] mt-1">
                    {milestone.description}
                  </p>
                </motion.div>
              );
            })()}

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white 
                font-['Inter'] mb-2 tracking-tight"
            >
              {getTitle(event.newLevel)}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-white/50 font-['Space_Mono'] 
                uppercase tracking-widest mb-8"
            >
              Level {event.newLevel - 1} → Level {event.newLevel}
            </motion.p>

            {/* JARVIS line */}
            {event.jarvisLine && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white/5 border border-white/10 
                  rounded-2xl px-6 py-4 max-w-sm mb-8"
              >
                <p className="text-[10px] text-white/40 
                  font-['Space_Mono'] uppercase tracking-widest mb-2">
                  JARVIS
                </p>
                <p className="text-sm text-white/80 font-['Inter'] 
                  leading-relaxed italic">
                  "{event.jarvisLine}"
                </p>
              </motion.div>
            )}

            {/* Stars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex gap-2 mb-8"
            >
              {Array.from({ length: Math.min(5, event.newLevel) })
                .map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 1.1 + i * 0.1,
                    type: 'spring',
                    stiffness: 400
                  }}
                >
                  <Star size={20} className="text-[#E07B39]" 
                    fill="#E07B39"/>
                </motion.div>
              ))}
            </motion.div>

            {/* Dismiss */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={handleClose}
              className="text-[10px] font-bold text-white/30 
                font-['Space_Mono'] uppercase tracking-widest 
                hover:text-white/60 transition-colors"
            >
              Tap anywhere to continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LevelUpEvent
