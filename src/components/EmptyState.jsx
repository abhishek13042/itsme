import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-6">
        {Icon ? <Icon className="w-8 h-8 text-text-secondary" /> : <div className="text-4xl">🌑</div>}
      </div>
      <h3 className="text-xl font-display font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
