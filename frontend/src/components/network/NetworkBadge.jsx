import React from 'react';
import { NETWORK_MAP } from '../../constants/networks';

export function NetworkBadge({ code, className = '' }) {
  const network = NETWORK_MAP[code];
  if (!network) return null;

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold shadow-sm ${className}`}
      style={{ backgroundColor: network.color, color: network.textColor }}
    >
      {network.name}
    </span>
  );
}
