import React from 'react';
import { Card } from '../common/Card';
import { ScoreGauge } from './ScoreGauge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { NETWORK_MAP } from '../../constants/networks';
import { getStatusLabel, getStatusColor } from '../../utils/score';

export function NetworkCard({ networkCode, data }) {
  const network = NETWORK_MAP[networkCode];
  if (!network) return null;

  const { score, status, confidence, measurements, lastUpdated } = data || {};
  const isInsufficient = status === 'insufficient_data' || score == null;

  return (
    <Card className="flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
        <div style={{ color: network.color }} className="text-6xl font-black">{network.code}</div>
      </div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{network.name}</h3>
          <div className={`text-sm font-medium ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </div>
        </div>
        <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl" style={{ backgroundColor: network.color, color: network.textColor }}>
          {network.code[0]}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
        <ScoreGauge score={isInsufficient ? null : score} status={status} size={140} />
      </div>

      <div className="mt-4 flex justify-between items-end relative z-10">
        <div className="flex flex-col gap-2">
          <ConfidenceBadge confidence={confidence || 'insufficient'} />
          <span className="text-xs text-slate-500">{measurements || 0} recent tests</span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-slate-500">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
        )}
      </div>
    </Card>
  );
}
