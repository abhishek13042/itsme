import React, { useEffect } from 'react';
import { usePomodoroStore } from '../store/pomodoroStore';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  Timer, RotateCcw, ChevronRight, Zap, Coffee,
  Play, Pause, Settings, Trophy, Target
} from 'lucide-react';

const Pomodoro = () => {
  const {
    timers,
    statsToday,
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    addTimer,
    removeTimer,
    isRunning: storeRunning,
    expectedEndAt
  } = usePomodoroStore();

  const [localTimeLeft, setLocalTimeLeft] = useState(0);

  // Primary timer is the first one in the list
  const activeTimer = timers[0];
  const isFocusMode = activeTimer ? !activeTimer.isBreak : true;
  const sessionsCompleted = statsToday?.completedCount || 0;
  
  // Progress calculation
  const totalDuration = activeTimer 
    ? (activeTimer.isBreak ? activeTimer.breakDuration : activeTimer.duration) 
    : 25 * 60;
  
  // Mode from store is usually 'pomodoro'
  const currentMode = activeTimer?.modeId || 'pomodoro';

  useEffect(() => {
    let interval;
    if (storeRunning && expectedEndAt) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((expectedEndAt - Date.now()) / 1000));
        setLocalTimeLeft(remaining);
        
        // Tab Title update
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.title = `${mins}:${secs < 10 ? '0' : ''}${secs} — ${isFocusMode ? 'Focus' : 'Break'}`;

        if (remaining === 0) {
          usePomodoroStore.getState().completePhase(activeTimer.id);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      setLocalTimeLeft(activeTimer?.timeLeft || totalDuration);
      document.title = "Player One";
    }

    return () => {
      clearInterval(interval);
      document.title = "Player One";
    };
  }, [storeRunning, expectedEndAt, activeTimer?.id, isFocusMode]);

  // Handle visibility change to resync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && storeRunning && expectedEndAt) {
        const remaining = Math.max(0, Math.ceil((expectedEndAt - Date.now()) / 1000));
        setLocalTimeLeft(remaining);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [storeRunning, expectedEndAt]);

  const progress = localTimeLeft / totalDuration;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartPause = () => {
    if (!activeTimer) {
      addTimer('pomodoro');
      return;
    }
    if (storeRunning) {
      pauseTimer(activeTimer.id);
    } else {
      startTimer(activeTimer.id);
    }
  };

  const handleReset = () => {
    if (activeTimer) resetTimer(activeTimer.id);
  };

  const handleSkip = () => {
    if (activeTimer) skipPhase(activeTimer.id);
  };

  const handleSetMode = (modeId) => {
    if (activeTimer) {
      removeTimer(activeTimer.id);
    }
    addTimer(modeId);
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-lg mx-auto">
        
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer size={14} className="text-[#E07B39]"/>
            <p className="text-[10px] font-bold text-[#9A9590] 
              font-['Space_Mono'] uppercase tracking-widest">
              Focus Engine
            </p>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] 
            font-['Inter'] tracking-tight">
            Pomodoro
          </h1>
        </div>

        {/* ── TIMER DISPLAY ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] p-8 mb-6 shadow-sm flex flex-col items-center justify-center">
          
          {/* Mode indicator */}
          <div className={clsx(
            'text-[10px] font-bold font-["Space_Mono"] uppercase',
            'tracking-widest mb-6 px-4 py-1.5 rounded-full shadow-sm',
            isFocusMode
              ? 'bg-[#1A1A2E] text-white'
              : 'bg-[#F0FDF4] text-[#1A6B4A]'
          )}>
            {isFocusMode ? '⚡ Focus Session' : '☕ Break Time'}
          </div>

          {/* Timer ring */}
          <div className="relative w-56 h-56 mb-8">
            <svg className="w-full h-full transform -rotate-90" 
              viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none"
                stroke="#F5F4F0" strokeWidth="4"/>
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={isFocusMode ? '#1A1A2E' : '#1A6B4A'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 45 * (1 - progress)
                }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center 
              justify-center">
              <p className="text-5xl font-bold text-[#1A1A2E] 
                font-['Space_Mono'] tabular-nums tracking-tighter">
                {formatTime(localTimeLeft)}
              </p>
              <p className="text-[10px] text-[#9A9590] font-['Space_Mono']
                uppercase tracking-widest mt-1">
                {isFocusMode ? 'remaining' : 'break'}
              </p>
            </div>
          </div>
 
          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              title="Reset Timer"
              className="p-3.5 rounded-2xl bg-[#F5F4F0] text-[#9A9590] 
                hover:text-[#1A1A2E] hover:shadow-md transition-all border border-transparent hover:border-[#E5E0D8]"
            >
              <RotateCcw size={20}/>
            </button>
            <button
              onClick={handleStartPause}
              className={clsx(
                'px-10 py-4 rounded-2xl text-sm font-bold',
                'font-["Space_Mono"] uppercase tracking-wider',
                'transition-all shadow-lg transform hover:scale-[1.02] active:scale-95',
                storeRunning
                  ? 'bg-[#C0392B] text-white hover:bg-[#A93226]'
                  : 'bg-[#1A1A2E] text-white hover:bg-[#2a2a4e]'
              )}
            >
              {storeRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={handleSkip}
              title="Skip Phase"
              className="p-3.5 rounded-2xl bg-[#F5F4F0] text-[#9A9590] 
                hover:text-[#1A1A2E] hover:shadow-md transition-all border border-transparent hover:border-[#E5E0D8]"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
        </div>

        {/* ── SESSION TYPE SELECTOR ── */}
        <div className="flex items-center gap-1.5 bg-white rounded-2xl 
          border border-[#E5E0D8] p-1.5 w-fit mx-auto mb-8 shadow-sm">
          {[
            { id: 'pomodoro', label: 'Pomodoro', duration: 25 },
            { id: 'deep_work', label: 'Deep Work', duration: 45 },
            { id: 'flow', label: 'Flow', duration: 60 }
          ].map(option => (
            <button
              key={option.id}
              onClick={() => handleSetMode(option.id)}
              className={clsx(
                'px-4 py-2 rounded-xl text-[10px] font-bold',
                'font-["Space_Mono"] uppercase tracking-wider transition-all',
                currentMode === option.id
                  ? 'bg-[#1A1A2E] text-white shadow-sm'
                  : 'text-[#9A9590] hover:text-[#1A1A2E] hover:bg-[#F5F4F0]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* ── SESSIONS COMPLETED ROW ── */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <p className="text-[10px] text-[#9A9590] font-['Space_Mono']
            uppercase tracking-widest">
            Sessions Completed:
          </p>
          <div className="flex gap-2">
            {Array.from({ length: Math.max(4, sessionsCompleted) })
              .map((_, i) => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ scale: i < sessionsCompleted ? [1, 1.2, 1] : 1 }}
                className={clsx(
                  'w-3.5 h-3.5 rounded-full transition-all duration-500',
                  i < sessionsCompleted
                    ? 'bg-[#1A1A2E] shadow-sm'
                    : 'bg-[#E5E0D8]'
                )}
              />
            ))}
          </div>
          <p className="text-base font-bold text-[#1A1A2E] 
            font-['Space_Mono']">
            {sessionsCompleted}
          </p>
        </div>

        {/* ── FOCUS TIPS CARD ── */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] 
          p-6 shadow-sm border-t-4 border-t-[#E07B39]">
          <p className="text-[10px] font-bold text-[#9A9590] 
            font-['Space_Mono'] uppercase tracking-widest mb-4">
            Protocol for Focus Sessions
          </p>
          <div className="flex flex-col gap-3">
            {[
              'Phone face down, all notifications silenced',
              'Single task focus — decide it before starting',
              'If distracted, capture the thought and refocus',
              'Stay hydrated — keep water on your desk'
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E07B39] 
                  shrink-0 mt-1.5 shadow-sm"/>
                <p className="text-xs text-[#3D3830] font-['Inter'] 
                  leading-relaxed font-medium">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
