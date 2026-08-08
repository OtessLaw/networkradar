import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`glass rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
