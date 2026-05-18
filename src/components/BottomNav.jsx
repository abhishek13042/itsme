import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, Sword, User, GraduationCap, Menu } from 'lucide-react';
import { openMobileSidebar } from './Sidebar';

const BOTTOM_ITEMS = [
  { path: '/',          icon: LayoutDashboard, label: 'Home',    end: true },
  { path: '/tracker',   icon: Target,          label: 'Tracker' },
  { path: '/quests',    icon: Sword,           label: 'Quests'  },
  { path: '/character', icon: User,            label: 'Stats'   },
  { path: '/ai-track',  icon: GraduationCap,   label: 'AI'      },
];

const BottomNav = () => (
  <nav
    className="lg:hidden fixed bottom-0 left-0 right-0 w-full z-[100]"
    style={{
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1.5px solid #E5E0D8',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
  >
    <div className="flex items-center justify-around h-16 px-1">
      {BOTTOM_ITEMS.map(({ path, icon: Icon, label, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 group"
          style={({ isActive }) => ({
            color: isActive ? '#1A1A2E' : '#9A9590',
            textDecoration: 'none',
            transition: 'color 150ms ease',
          })}
        >
          {({ isActive }) => (
            <>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                style={{ background: isActive ? '#F5F4F0' : 'transparent' }}
              >
                <Icon
                  size={18}
                  color={isActive ? '#E07B39' : '#9A9590'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </span>
              <span
                className="font-['Space_Mono'] text-[8px] font-bold uppercase tracking-wider"
                style={{ color: isActive ? '#1A1A2E' : '#9A9590' }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {/* ── MORE / hamburger opens full sidebar ── */}
      <button
        onClick={openMobileSidebar}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1"
        aria-label="Open navigation menu"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-xl transition-all hover:bg-[#F5F4F0]">
          <Menu size={18} color="#9A9590" strokeWidth={2} />
        </span>
        <span className="font-['Space_Mono'] text-[8px] font-bold uppercase tracking-wider text-[#9A9590]">
          More
        </span>
      </button>
    </div>
  </nav>
);

export default BottomNav;
