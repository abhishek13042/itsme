import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X } from 'lucide-react'
import { clsx } from 'clsx'

// Global toast state — module level so any component can trigger it
let toastCallback = null

export function triggerJarvisToast(config) {
  if (toastCallback) toastCallback(config)
}

const JarvisToast = () => {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    toastCallback = (config) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setToast(config)
      timerRef.current = setTimeout(() => {
        setToast(null)
      }, config.duration || 4000)
    }
    return () => { toastCallback = null }
  }, [])

  const typeConfig = {
    xp: { color: '#E07B39', bg: '#FFF0E6', border: '#E07B39' },
    success: { color: '#1A6B4A', bg: '#F0FDF4', border: '#1A6B4A' },
    level: { color: '#7C3AED', bg: '#F5F3FF', border: '#7C3AED' },
    info: { color: '#1A1A2E', bg: '#F5F4F0', border: '#1A1A2E' },
    warning: { color: '#C0392B', bg: '#FEF2F2', border: '#C0392B' }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div
              className="flex items-start gap-3 p-4 rounded-2xl 
                shadow-xl border max-w-[320px]"
              style={{
                backgroundColor: typeConfig[toast.type || 'info'].bg,
                borderColor: typeConfig[toast.type || 'info'].border,
                borderWidth: '1.5px'
              }}
            >
              {/* Icon */}
              <div
                className="w-7 h-7 rounded-xl flex items-center 
                  justify-center shrink-0 mt-0.5"
                style={{
                  backgroundColor: typeConfig[toast.type || 'info'].color
                }}
              >
                <Zap size={13} className="text-white"/>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-[10px] font-bold font-['Space_Mono'] 
                    uppercase tracking-widest mb-0.5"
                    style={{ color: typeConfig[toast.type || 'info'].color }}
                  >
                    {toast.title}
                  </p>
                )}
                {toast.xp && (
                  <p className="text-[10px] font-bold font-['Space_Mono'] 
                    text-[#E07B39] mb-1">
                    +{toast.xp} XP
                  </p>
                )}
                {toast.message && (
                  <p className="text-xs text-[#1A1A2E] font-['Inter'] 
                    leading-relaxed">
                    {toast.message}
                  </p>
                )}
                {/* JARVIS line loads async */}
                {toast.jarvisLine && (
                  <p className="text-[10px] text-[#9A9590] font-['Space_Mono'] 
                    italic mt-1 leading-relaxed">
                    "{toast.jarvisLine}"
                  </p>
                )}

                {toast.onAction && (
                  <button onClick={toast.onAction} 
                    className="text-[9px] font-bold text-white/80 
                      font-['Space_Mono'] uppercase tracking-wider 
                      underline mt-1 block">
                    Undo
                  </button>
                )}
              </div>

              {/* Close */}
              <button
                onClick={() => setToast(null)}
                className="text-[#9A9590] hover:text-[#1A1A2E] 
                  transition-colors shrink-0"
              >
                <X size={13}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default JarvisToast
