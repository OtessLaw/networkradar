import React from 'react';
import { AlertCircle } from 'lucide-react';

export function EmptyState({ icon: Icon = AlertCircle, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-xl">
      <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
