import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Zap, Flame, Sun } from 'lucide-react';
import Button from './Button';

const MotivationalPopup = ({ isOpen, onClose, score, earnings }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const config = {
    perfect: {
      title: '🔥 PERFECT DAY',
      message: "Every single habit. That's not luck — that's character.",
      color: '#E07B39'
    },
    strong: {
      title: '⚡ STRONG DAY',
      message: "Almost perfect. Tomorrow you leave nothing behind.",
      color: '#1A6B4A'
    },
    building: {
      title: '📈 BUILDING',
      message: "More than yesterday. That's all that matters right now.",
      color: '#1A1A2E'
    },
    tomorrow: {
      title: '🌅 TOMORROW',
      message: "Today wasn't it. But you showed up and tracked it. Don't break tomorrow.",
      color: '#C0392B'
    }
  };

  const current = score === 100 ? config.perfect : 
                   score >= 80 ? config.strong :
                   score >= 50 ? config.building : config.tomorrow;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1A1A2E]/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-white rounded-[24px] p-10 max-w-lg w-full shadow-2xl overflow-hidden text-center"
          >
            {score === 100 && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 animate-pulse" />
            )}

            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-slate-50">
                 {score === 100 ? <Flame className="w-12 h-12 text-[#E07B39]" /> :
                  score >= 80 ? <Zap className="w-12 h-12 text-[#1A6B4A]" /> :
                  <Sun className="w-12 h-12 text-[#9A9590]" />}
              </div>
            </div>

            <h2 className="font-display text-[32px] font-extrabold mb-4" style={{ color: current.color }}>
              {current.title}
            </h2>
            <p className="font-body text-[16px] text-[#3D3830] font-medium leading-relaxed mb-8">
              {current.message}
            </p>

            <div className="bg-[#F5F4F0] rounded-2xl p-6 mb-8 flex justify-around">
               <div className="text-center">
                 <p className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest mb-1">Earned Today</p>
                 <p className="text-xl font-mono font-extrabold text-[#1A6B4A]">₹{earnings}</p>
               </div>
               <div className="w-px bg-[#E5E0D8]" />
               <div className="text-center">
                 <p className="text-[10px] font-bold text-[#9A9590] uppercase tracking-widest mb-1">Score</p>
                 <p className="text-xl font-mono font-extrabold text-[#1A1A2E]">{score}%</p>
               </div>
            </div>

            <Button 
              onClick={onClose} 
              className="w-full h-14 bg-[#1A1A2E] text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              CLOSE
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MotivationalPopup;
