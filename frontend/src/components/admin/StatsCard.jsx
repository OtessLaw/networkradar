import React from 'react';
import { Card } from '../common/Card';

export function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="flex items-center p-6 bg-surface">
      <div className="p-3 bg-primary/10 rounded-lg text-primary mr-4">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {trend && (
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
