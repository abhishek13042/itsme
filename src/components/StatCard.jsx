import React from 'react';
import Card from './Card';
import { clsx } from 'clsx';

const StatCard = ({ label, value, sub, icon: Icon, color = 'navy', trend }) => {
  const colorMap = {
    navy: 'text-navy-900',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    xp: 'text-xp',
    gold: 'text-gold'
  };

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex justify-between items-start">
        {Icon && <Icon className={clsx("w-5 h-5", colorMap[color])} />}
        {trend && (
          <span className={clsx("text-xs font-bold", trend > 0 ? "text-success" : "text-danger")}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-display font-bold text-text-primary mt-1">{value}</h3>
        {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
      </div>
    </Card>
  );
};

export default StatCard;
