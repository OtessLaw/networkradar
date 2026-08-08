import React from 'react';
import { Card } from '../common/Card';
import { NetworkBadge } from '../network/NetworkBadge';
import { MapPin, Clock } from 'lucide-react';

export function ReportCard({ report }) {
  const { network, type, area, description, createdAt, status } = report;
  
  const statusColors = {
    pending: 'text-amber-400 bg-amber-400/10',
    verified: 'text-emerald-400 bg-emerald-400/10',
    rejected: 'text-red-400 bg-red-400/10'
  };

  return (
    <Card className="hover:bg-surface-2 transition-colors border-l-4 border-l-transparent hover:border-l-primary cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <NetworkBadge code={network} />
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status] || statusColors.pending}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      <h4 className="font-semibold text-slate-200 mb-2 capitalize">{type.replace('_', ' ')}</h4>
      
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {area}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>
      
      {description && (
        <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
      )}
    </Card>
  );
}
