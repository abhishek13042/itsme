import React from 'react';
import { clsx } from 'clsx';

const Card = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white border border-border-default rounded-card shadow-card p-5 transition-all duration-200",
        onClick && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
