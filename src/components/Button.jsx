import React from 'react';
import { clsx } from 'clsx';

const Button = ({ children, onClick, variant = 'primary', size = 'md', loading, className, ...props }) => {
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-700 shadow-sm',
    ghost: 'bg-transparent border border-navy-900 text-navy-900 hover:bg-navy-50',
    danger: 'bg-danger text-white hover:bg-red-700 shadow-sm'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-bold'
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none font-display uppercase tracking-wider",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;
