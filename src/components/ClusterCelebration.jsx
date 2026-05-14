import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'

let celebrationCallback = null

export function triggerClusterCelebration(clusterName, topicCount) {
  if (celebrationCallback) {
    celebrationCallback(clusterName, topicCount)
  }
}

const CLUSTER_COLORS = {
  'A': '#C0392B', // Foundation Red
  'B': '#E07B39', // ML Orange
  'C': '#1A6B4A'  // LLM Green
}

export default function ClusterCelebration() {
  const [celebration, setCelebration] = useState(null)

  useEffect(() => {
    celebrationCallback = (clusterName, topicCount) => {
      setCelebration({ clusterName, topicCount })
    }
    return () => { celebrationCallback = null }
  }, [])

  if (!celebration) return null

  // Detect cluster letter from name or ID
  const clusterLetter = Object.keys(CLUSTER_COLORS).find(k => 
    celebration.clusterName.includes(k)
  ) || 'A'
  const color = CLUSTER_COLORS[clusterLetter]

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center 
            justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setCelebration(null)}
        >
          {/* Particle burst */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 16) * Math.PI * 2) * 
                  (120 + Math.random() * 80),
                y: Math.sin((i / 16) * Math.PI * 2) * 
                  (120 + Math.random() * 80),
                opacity: 0,
                scale: [1, 1.5, 0]
              }}
              transition={{ 
                duration: 1.2, 
                delay: 0.2,
                ease: 'easeOut' 
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
            className="text-center px-8 py-10 rounded-3xl 
              border-2 max-w-sm w-full mx-4"
            style={{ 
              backgroundColor: '#1A1A2E',
              borderColor: color 
            }}
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-16 h-16 rounded-2xl flex items-center 
                justify-center mx-auto mb-4"
              style={{ backgroundColor: color }}
            >
              <Trophy size={32} className="text-white"/>
            </motion.div>

            <p className="text-[10px] font-bold text-white/50
              font-['Space_Mono'] uppercase tracking-widest mb-2">
              Cluster Mastered
            </p>
            <p className="text-2xl font-bold text-white 
              font-['Inter'] mb-1">
              {celebration.clusterName}
            </p>
            <p className="text-sm text-white/60 font-['Inter'] mb-6">
              {celebration.topicCount} topics mastered
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/5 rounded-xl px-4 py-3 mb-6
                border border-white/10"
            >
              <p className="text-xs text-white/70 font-['Inter']">
                This cluster is locked in. Your engineering foundations 
                are solidifying.
              </p>
            </motion.div>

            <button
              onClick={() => setCelebration(null)}
              className="w-full py-3 rounded-xl text-sm font-bold
                font-['Space_Mono'] uppercase tracking-wider
                text-white transition-all shadow-lg"
              style={{ backgroundColor: color }}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
