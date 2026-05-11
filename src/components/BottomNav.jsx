import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Swords, User, Settings, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';

const BottomNav = () => {
  const items = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/tracker', icon: Target, label: 'Tracker' },
    { path: '/quests', icon: Swords, label: 'Quests' },
    { path: '/character', icon: User, label: 'Stats' },
    { path: '/ai-track', icon: GraduationCap, label: 'AI Track' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-border-default md:hidden flex justify-around items-center h-16 px-2 z-50">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
              isActive ? "text-navy-900" : "text-text-secondary"
            )
          }
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
