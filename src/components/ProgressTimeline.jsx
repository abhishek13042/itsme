import React from 'react'
import { motion } from 'framer-motion'
import { Check, Lock, Circle } from 'lucide-react'
import { clsx } from 'clsx'

export default function ProgressTimeline({
  phases,
  currentPhaseId,
  getProgress,
  isLocked,
  onPhaseClick,
  compact = false
}) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-[#E5E0D8]',
      compact ? 'p-3' : 'p-5'
    )}>
      {!compact && (
        <p className="text-[10px] font-bold text-[#9A9590]
          font-['Space_Mono'] uppercase tracking-widest mb-4">
          Your Roadmap — {phases.length} Phases
        </p>
      )}
      
      {/* Horizontal timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 
          bg-[#E5E0D8] z-0"/>
        
        {/* Progress line */}
        <motion.div
          className="absolute top-4 left-4 h-0.5 z-0
            bg-[#1A1A2E]"
          initial={{ width: 0 }}
          animate={{
            width: (() => {
              const currentIdx = phases.findIndex(
                p => p.id === currentPhaseId
              )
              if (currentIdx <= 0) return '0%'
              const basePercent = (currentIdx / (phases.length - 1)) * 100
              return `${Math.min(basePercent, 95)}%`
            })()
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Phase nodes */}
        <div className="flex items-start justify-between relative z-10">
          {phases.map((phase, i) => {
            const prog = getProgress(phase.id)
            const locked = isLocked(phase)
            const isCurrent = phase.id === currentPhaseId
            const isDone = prog >= 100
            
            return (
              <div
                key={phase.id}
                className="flex flex-col items-center gap-2
                  cursor-pointer group"
                style={{ 
                  width: `${100 / phases.length}%`,
                  maxWidth: compact ? '48px' : '80px'
                }}
                onClick={() => onPhaseClick?.(phase.id)}
              >
                {/* Node */}
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center',
                  'justify-center transition-all border-2',
                  'group-hover:scale-110',
                  isDone 
                    ? 'border-transparent'
                    : isCurrent
                      ? 'border-[#1A1A2E] bg-white'
                      : locked
                        ? 'border-[#E5E0D8] bg-[#F5F4F0]'
                        : 'border-[#E5E0D8] bg-white'
                )}
                  style={isDone 
                    ? { backgroundColor: phase.color }
                    : isCurrent
                      ? { borderColor: phase.color }
                      : {}}
                >
                  {isDone ? (
                    <Check size={14} className="text-white" 
                      strokeWidth={3}/>
                  ) : locked ? (
                    <Lock size={11} className="text-[#9A9590]"/>
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: phase.color }}/>
                  ) : (
                    <Circle size={12} 
                      className="text-[#E5E0D8]"/>
                  )}
                </div>

                {/* Label */}
                {!compact && (
                  <div className="text-center">
                    <p className={clsx(
                      'text-[8px] font-bold font-["Space_Mono"]',
                      'uppercase tracking-wider leading-tight',
                      'text-center',
                      isCurrent ? 'text-[#1A1A2E]' : 'text-[#9A9590]'
                    )}>
                      {phase.name.split(' — ')[0]
                        .split(' ').slice(0, 2).join(' ')}
                    </p>
                    {prog > 0 && prog < 100 && (
                      <p className="text-[7px] font-['Space_Mono']
                        mt-0.5"
                        style={{ color: phase.color }}>
                        {prog}%
                      </p>
                    )}
                  </div>
                )}

                {/* Current indicator */}
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[7px] font-bold 
                      font-['Space_Mono'] uppercase tracking-wider
                      text-white px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: phase.color }}
                  >
                    NOW
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
