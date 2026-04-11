import React from 'react';
import { clsx } from 'clsx';

const ProgressBar = ({ value = 0, color = 'xp', height = '6px', animated = true, label }) => {
  const colorMap = {
    navy: 'bg-navy-700',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    xp: 'bg-xp',
    gold: 'bg-gold'
  };

  return (
    <div className="w-full">
      {label && <div className="text-xs font-bold mb-1">{label}</div>}
      <div 
        className="w-full bg-border-default rounded-full overflow-hidden" 
        style={{ height }}
      >
        <div
          className={clsx(
            colorMap[color] || colorMap.xp,
            "h-full rounded-full transition-all duration-1000 ease-out"
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
