import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const GYM_QUESTIONS = [
  {
    id: 'sleep_ok',
    question: 'How is your sleep recovery?',
    options: [
      { label: 'Poor — under 6h', value: 1 },
      { label: 'Okay — 6-7h', value: 2 },
      { label: 'Good — 7-8h', value: 3 },
      { label: 'Great — 8h+', value: 4 }
    ]
  },
  {
    id: 'energy_level',
    question: 'Current energy level?',
    options: [
      { label: 'Low — drag myself', value: 1 },
      { label: 'Medium — doable', value: 2 },
      { label: 'High — ready', value: 3 },
      { label: 'Peak — locked in', value: 4 }
    ]
  },
  {
    id: 'motivation',
    question: 'Mental readiness?',
    options: [
      { label: 'Not feeling it', value: 1 },
      { label: 'Going anyway', value: 2 },
      { label: 'Want to train', value: 3 },
      { label: 'Hungry for it', value: 4 }
    ]
  }
]

export default function GymChecklist({ onComplete, onSkip, isOpen }) {
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)

  const currentQ = GYM_QUESTIONS[step]
  const totalScore = Object.values(answers)
    .reduce((sum, v) => sum + v, 0)
  const maxScore = GYM_QUESTIONS.length * 4
  const readinessPercent = Math.round((totalScore / maxScore) * 100)

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)

    if (step < GYM_QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      // All answered
      const finalScore = Object.values(newAnswers)
        .reduce((sum, v) => sum + v, 0)
      const finalPercent = Math.round((finalScore / maxScore) * 100)
      onComplete({ 
        answers: newAnswers, 
        readinessScore: finalPercent,
        totalScore: finalScore
      })
      // Reset for next time
      setStep(0)
      setAnswers({})
    }
  }

  const getReadinessMessage = () => {
    if (readinessPercent >= 75) return { 
      msg: 'You\'re ready. Train hard.', 
      color: '#1A6B4A' 
    }
    if (readinessPercent >= 50) return { 
      msg: 'You\'re good enough. Show up.', 
      color: '#E07B39' 
    }
    return { 
      msg: 'Low energy. Still going — that\'s the discipline.', 
      color: '#C0392B' 
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end 
            justify-center px-4 pb-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.25 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[9px] font-bold text-[#9A9590]
                  font-['Space_Mono'] uppercase tracking-widest mb-0.5">
                  Pre-Gym Check · {step + 1}/{GYM_QUESTIONS.length}
                </p>
                <div className="flex gap-1 mt-1">
                  {GYM_QUESTIONS.map((_, i) => (
                    <div key={i}
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: i <= step ? '24px' : '8px',
                        backgroundColor: i <= step 
                          ? '#1A6B4A' 
                          : '#E5E0D8'
                      }}
                    />
                  ))}
                </div>
              </div>
              <button onClick={() => { setStep(0); setAnswers({}); onSkip(); }}
                className="text-[#9A9590] hover:text-[#1A1A2E]">
                <X size={18}/>
              </button>
            </div>

            <p className="text-base font-bold text-[#1A1A2E]
              font-['Inter'] mb-4">
              {currentQ.question}
            </p>

            <div className="space-y-2">
              {currentQ.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full flex items-center justify-between
                    p-3.5 rounded-xl bg-[#F5F4F0] hover:bg-[#E5E0D8]
                    text-sm text-[#1A1A2E] font-['Inter'] 
                    transition-all text-left"
                >
                  {opt.label}
                  <span className="text-[#9A9590] text-xs 
                    font-['Space_Mono']">
                    {opt.value}/4
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setStep(0); setAnswers({}); onSkip(); }}
              className="w-full mt-3 py-2 text-[10px] text-[#9A9590]
                font-['Space_Mono'] uppercase tracking-wider"
            >
              Skip Check — Just Log Gym
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
