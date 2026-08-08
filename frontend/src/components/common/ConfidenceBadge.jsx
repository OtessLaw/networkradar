import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { getConfidenceLabel } from '../../utils/score';

export function ConfidenceBadge({ confidence }) {
  const label = getConfidenceLabel(confidence);

  const configs = {
    insufficient: { bg: 'bg-slate-800 text-slate-400 border-slate-700', icon: ShieldAlert },
    low: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Shield },
    medium: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: ShieldCheck },
    high: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ShieldCheck },
    very_high: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: ShieldCheck },
  };

  const cfg = configs[confidence] || configs.insufficient;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium border ${cfg.bg}`}>
      <Icon className="w-3 h-3" />
      <span>Confidence: {label}</span>
    </span>
  );
}

export default ConfidenceBadge;
