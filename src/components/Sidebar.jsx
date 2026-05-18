import React from 'react';
import { NavLink } from 'react-router-dom';
import { useXpStore } from '../store/xpStore';
import { useWalletStore } from '../store/walletStore';
import {
  LayoutDashboard, Target, CalendarCheck, Sword, User,
  Code2, TrendingUp, BookOpen, Heart, BookMarked, Brain,
  Timer, Settings, Zap, Flame, Wallet, Compass,
  GraduationCap, BarChart2, Search, Shield, X, Menu
} from 'lucide-react';
import { openGlobalSearch } from './GlobalSearch';

// ── Mobile state singleton so App can toggle it ──
let _setMobileOpen = null;
export const openMobileSidebar = () => _setMobileOpen?.(true);

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { to: '/goals',     icon: Target,         label: 'Goals' },
      { to: '/',          icon: LayoutDashboard, label: 'Command Center', end: true },
      { to: '/tracker',   icon: CalendarCheck,   label: 'Tracker' },
      { to: '/quests',    icon: Sword,           label: 'Quest Log' },
      { to: '/character', icon: User,            label: 'Character Sheet' },
      { to: '/weekly',    icon: BarChart2,        label: 'Weekly Review' },
    ],
  },
  {
    label: 'Roadmaps',
    items: [
      { to: '/sde',     icon: Code2,       label: 'SDE Roadmap' },
      { to: '/trading', icon: TrendingUp,  label: 'Trading' },
      { to: '/exams',   icon: BookOpen,    label: 'Exam Mode' },
      { to: '/health',  icon: Heart,       label: 'Health' },
      { to: '/finance', icon: BookMarked,  label: 'Finance & Books' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/explorer', icon: Compass,       label: 'Explorer' },
      { to: '/ai-track', icon: GraduationCap, label: 'AI Track' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/pomodoro', icon: Timer,    label: 'Pomodoro' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const LEVEL_TITLES = {
  1: 'Initiate', 2: 'Apprentice', 3: 'Practitioner',
  4: 'Specialist', 5: 'Expert', 6: 'Senior',
  7: 'Principal', 8: 'Architect', 9: 'Grandmaster',
  10: 'Legend', 11: 'Mythic', 12: 'Transcendent',
  13: 'Omniscient', 14: 'Eternal', 15: 'PLAYER ONE'
};

const Sidebar = () => {
  const { xp, level, streakDays, streakShields } = useXpStore();
  const { balance, transactions } = useWalletStore();
  const [currentTime, setCurrentTime] = React.useState('');
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Expose setter for external consumers
  React.useEffect(() => { _setMobileOpen = setMobileOpen; }, []);

  React.useEffect(() => {
    const updateTime = () =>
      setCurrentTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
      }));
    updateTime();
    const iv = setInterval(updateTime, 60000);
    return () => clearInterval(iv);
  }, []);

  const playerTitle = level <= 15
    ? LEVEL_TITLES[level] || 'Ascended'
    : level <= 25 ? 'Ascended' : 'Cosmic';

  const safeLevel = (Number.isNaN(level) || !level) ? 1 : level;
  const safeXp    = xp || 0;
  const xpForCurrent      = Math.pow((safeLevel - 1) * 10, 2);
  const xpForNextValue    = Math.pow(safeLevel * 10, 2);
  const xpProgress        = Math.max(0, safeXp - xpForCurrent);
  const xpRequiredForNext = Math.max(1, xpForNextValue - xpForCurrent);
  const xpPercent         = Math.min(100, Math.floor((xpProgress / xpRequiredForNext) * 100));

  const walletBalance = Math.floor(balance / 100);
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayEarned = transactions
    .filter(tx => tx.created_at?.startsWith(todayStr) && tx.type === 'earn')
    .reduce((sum, tx) => sum + tx.amount_paise, 0) / 100;

  const close = () => setMobileOpen(false);

  const sidebarContent = (
    <aside
      style={{ fontFamily: 'Inter, sans-serif' }}
      className="h-full w-[260px] bg-white border-r border-[#E5E0D8] flex flex-col overflow-y-auto"
    >
      {/* ── PLAYER HEADER ── */}
      <div className="px-5 pt-6 pb-5 border-b border-[#E5E0D8]">
        {/* Close button — only visible on mobile */}
        <button
          onClick={close}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg text-[#9A9590] hover:text-[#1A1A2E] hover:bg-[#F5F4F0] transition-all"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <p style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#9A9590', textTransform: 'uppercase', marginBottom: '4px' }}>
          Player One
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E', letterSpacing: '-0.02em', marginBottom: '10px' }}>
          ABHISHEK
        </h1>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: '#1A1A2E', color: '#fff', fontFamily: 'Space Mono', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px' }}>
            LVL {level}
          </span>
          {streakDays > 0 && (
            <span style={{ background: '#FFF0E6', color: '#E07B39', fontFamily: 'Space Mono', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={11} color="#E07B39" />
              {streakDays}
              {streakShields > 0 && <span className="text-xs ml-1" title={`${streakShields} shields`}>🛡️</span>}
            </span>
          )}
        </div>
        <p style={{ fontFamily: 'Space Mono', fontSize: '9px', color: '#E07B39', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px', fontWeight: '700' }}>
          {playerTitle}
        </p>
      </div>

      {/* ── XP BAR ── */}
      <div className="px-5 py-4 border-b border-[#E5E0D8]">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', color: '#9A9590', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Experience</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: '11px', color: '#3D3830' }}>{xpProgress} / {xpRequiredForNext}</span>
        </div>
        <div style={{ height: '4px', background: '#E5E0D8', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${xpPercent}%`, background: '#E07B39', borderRadius: '2px', transition: 'width 600ms ease-out' }} />
        </div>
      </div>

      {/* ── WALLET ── */}
      <div className="px-5 py-3 border-b border-[#E5E0D8]">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={13} color="#9A9590" />
            <span style={{ fontSize: '11px', color: '#9A9590' }}>Wallet</span>
          </div>
          <span style={{ fontFamily: 'Space Mono', fontSize: '13px', fontWeight: '700', color: '#1A6B4A' }}>
            ₹{walletBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── NAV LINKS ── */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {NAV_GROUPS.map(group => (
          <React.Fragment key={group.label}>
            <p style={{ fontSize: '10px', color: '#9A9590', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', padding: '12px 12px 4px' }}>
              {group.label}
            </p>
            {group.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={close}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px',
                  borderLeft: isActive ? '3px solid #E07B39' : '3px solid transparent',
                  background: isActive ? '#F5F4F0' : 'transparent',
                  color: isActive ? '#1A1A2E' : '#9A9590',
                  fontSize: '13px', fontWeight: isActive ? '600' : '400',
                  textDecoration: 'none', transition: 'all 150ms ease',
                  paddingLeft: isActive ? '9px' : '12px'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} color={isActive ? '#E07B39' : '#9A9590'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* ── SEARCH ── */}
      <div className="px-3 mb-2">
        <button
          onClick={() => { close(); openGlobalSearch(); }}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-[#9A9590] hover:text-[#1A1A2E] hover:bg-[#F5F4F0] rounded-xl transition-all"
        >
          <Search size={14} />
          <span className="text-[10px] font-bold font-['Space_Mono'] uppercase tracking-wider">Search</span>
          <span className="ml-auto text-[9px] font-['Space_Mono'] text-[#9A9590] bg-[#F5F4F0] px-1.5 py-0.5 rounded">⌘K</span>
        </button>
      </div>

      {/* ── TODAY'S EARNINGS ── */}
      <div style={{ padding: '12px 20px 20px', borderTop: '1.5px solid #E5E0D8' }}>
        <p style={{ fontSize: '10px', color: '#9A9590', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Today</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={13} color="#E07B39" />
          <span style={{ fontFamily: 'Space Mono', fontSize: '13px', fontWeight: '700', color: '#1A6B4A' }}>
            +₹{todayEarned.toLocaleString()} earned
          </span>
        </div>
      </div>

      <p style={{ fontFamily: 'Space Mono', fontSize: '9px', color: '#9A9590', textAlign: 'center', padding: '4px 20px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {currentTime} IST
      </p>
    </aside>
  );

  return (
    <>
      {/* ── DESKTOP: fixed sidebar ── */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen z-50">
        {sidebarContent}
      </div>

      {/* ── MOBILE: slide-in drawer + backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[200] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          {/* Drawer panel */}
          <div className="relative z-10 h-full" style={{ animation: 'slideInLeft 0.22s ease' }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
