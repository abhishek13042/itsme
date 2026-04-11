import React from 'react';
import { clsx } from 'clsx';

const Badge = ({ text, color = 'navy' }) => {
  const colorMap = {
    navy: 'bg-navy-900 text-white',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    xp: 'bg-xp text-white',
    gold: 'bg-gold text-white'
  };

  return (
    <span className={clsx(
      "px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider",
      colorMap[color] || colorMap.navy
    )}>
      {text}
    </span>
  );
};

export default Badge;
