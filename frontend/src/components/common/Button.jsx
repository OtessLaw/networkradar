import React from 'react';

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-surface-2 text-slate-100 hover:bg-border focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-surface-2 focus:ring-slate-500'
  };
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg'
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[props.size || 'md']} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
