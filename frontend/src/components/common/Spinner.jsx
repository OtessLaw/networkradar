import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-slate-600 border-t-primary rounded-full animate-spin`}></div>
    </div>
  );
}
