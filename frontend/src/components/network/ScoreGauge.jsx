import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/score';

export function ScoreGauge({ score, status, size = 120 }) {
  const isInsufficient = status === 'insufficient_data' || score === null || score === undefined;
  const safeScore = isInsufficient ? 0 : Math.min(100, Math.max(0, score));

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const colorClass = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  let strokeColor = '#6b7280'; // default gray
  if (status === 'excellent') strokeColor = '#10b981';
  else if (status === 'good') strokeColor = '#22c55e';
  else if (status === 'fair') strokeColor = '#f59e0b';
  else if (status === 'poor') strokeColor = '#ef4444';
  else if (status === 'critical') strokeColor = '#991b1b';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Foreground progress arc */}
          {!isInsufficient && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Center text display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          {isInsufficient ? (
            <span className="text-xs font-semibold text-slate-400 px-2 leading-tight">
              No Data
            </span>
          ) : (
            <>
              <span className={`text-3xl font-extrabold tracking-tight ${colorClass}`}>
                {safeScore}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                / 100
              </span>
            </>
          )}
        </div>
      </div>

      <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${colorClass}`}>
        {statusLabel}
      </span>
    </div>
  );
}

export default ScoreGauge;
