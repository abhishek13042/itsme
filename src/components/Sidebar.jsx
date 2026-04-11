import React from 'react';
import { NavLink } from 'react-router-dom';
import { useXpStore } from '../store/xpStore';
import { useWalletStore } from '../store/walletStore';

const Sidebar = () => {
  const { xp, level, streakDays } = useXpStore();
  const { balance, transactions } = useWalletStore();

  // Calculations for stats
  const safeLevel = level || 1;
  const safeXp = xp || 0;

  const xpForCurrent = Math.pow((safeLevel - 1) * 10, 2);
  const xpForNext = Math.pow(safeLevel * 10, 2);
  const xpProgress = Math.max(0, safeXp - xpForCurrent);
  const xpRequiredForNext = Math.max(1, xpForNext - xpForCurrent);
  const xpPercent = Math.min(100, Math.floor((xpProgress / xpRequiredForNext) * 100));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEarned = transactions
    .filter(tx => tx.created_at.startsWith(todayStr) && (tx.type === 'earn' || tx.type === 'bonus'))
    .reduce((sum, tx) => sum + tx.amount_paise, 0) / 100;

  const walletBalance = (balance / 100).toLocaleString();

  const navGroups = [
    {
      label: 'Core',
      items: [
        { path: '/', label: 'Command Center', icon: '🏠' },
        { path: '/tracker', label: 'Tracker', icon: '📋' },
        { path: '/quests', label: 'Quest Log', icon: '⚔️' },
        { path: '/character', label: 'Character Sheet', icon: '🧠' },
      ]
    },
    {
      label: 'Roadmaps',
      items: [
        { path: '/sde', label: 'SDE Roadmap', icon: '💻' },
        { path: '/trading', label: 'Trading', icon: '📈' },
        { path: '/exams', label: 'Exam Mode', icon: '🎓' },
        { path: '/health', label: 'Health', icon: '💪' },
        { path: '/finance', label: 'Finance & Books', icon: '📚' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { path: '/planner', label: 'AI Planner', icon: '🤖' },
        { path: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
      ]
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-[260px] bg-[#1A1A2E] border-r border-white/5 flex flex-col overflow-y-auto z-50 transition-all duration-300">

      {/* Player Header */}
      <div className="px-6 pt-8 pb-6 border-b border-white/5">
        <p className="text-[9px] text-white/30 tracking-[0.12em] uppercase font-bold mb-1 font-body">Player One</p>
        <h1 className="font-display text-2xl font-extrabold text-white tracking-tight">ABHISHEK</h1>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-block px-2 py-0.5 bg-[#E07B39] text-[#1A1A2E] text-[10px] font-display font-extrabold rounded-md">
            LVL {level}
          </span>
          {streakDays > 0 && (
            <div className="bg-[#E07B39]/15 text-[#E07B39] border border-[#E07B39]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
              🔥 {streakDays}
            </div>
          )}
        </div>
      </div>

      {/* XP Bar */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex justify-between text-[11px] mb-2">
          <span className="text-white/50 font-bold font-body uppercase tracking-wider">Experience</span>
          <span className="font-mono text-white/40">
            {xpProgress}/{xpRequiredForNext}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#E07B39] rounded-full transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-0 py-6 space-y-1">
        {navGroups.map((group, groupIdx) => (
          <React.Fragment key={group.label}>
            <p className="px-6 pt-4 pb-2 text-[9px] uppercase tracking-[0.12em] text-white/30 font-semibold font-body">{group.label}</p>
            {group.items.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-white/10 text-white font-bold border-l-4 border-[#E07B39] rounded-r-lg'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
              }>
                <span className="text-base leading-none opacity-70">{item.icon}</span>
                <span className="font-body tracking-tight">{item.label}</span>
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* Wallet / Quick Stats */}
      <div className="px-6 py-6 border-t border-white/5 bg-black/20 mt-auto">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-body">Wallet Balance</p>
            <p className="font-mono text-lg font-bold text-white">
              ₹{walletBalance}
            </p>
          </div>
          <div className="text-right">
             <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1 font-body">Today</p>
             <p className="font-mono text-[11px] font-bold text-emerald-400">
               +₹{todayEarned.toLocaleString()}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
