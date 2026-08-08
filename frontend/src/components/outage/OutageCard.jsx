import React from 'react';
import { Card } from '../common/Card';
import { NetworkBadge } from '../network/NetworkBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { MapPin, AlertTriangle, CheckCircle, Users, Activity } from 'lucide-react';

export function OutageCard({ outage }) {
  const { network, area, status, confidence, reportCount, failedTests, startedAt, resolvedAt } = outage;
  
  const isResolved = status === 'resolved';

  return (
    <Card className={`relative overflow-hidden ${isResolved ? 'opacity-75' : 'border-l-4 border-l-red-500'}`}>
      {isResolved && (
        <div className="absolute top-0 right-0 p-4">
          <CheckCircle className="w-8 h-8 text-emerald-500/20" />
        </div>
      )}
      {!isResolved && (
        <div className="absolute top-0 right-0 p-4">
          <AlertTriangle className="w-12 h-12 text-red-500/10" />
        </div>
      )}

      <div className="flex gap-3 mb-4 items-center">
        <NetworkBadge code={network} />
        {isResolved ? (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Resolved</span>
        ) : (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === 'confirmed' ? 'text-red-400 bg-red-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
            {status === 'confirmed' ? 'Confirmed Outage' : 'Possible Outage'}
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-slate-400" />
        {area}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-surface-2 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase font-medium">User Reports</span>
          </div>
          <div className="text-lg font-bold text-white">{reportCount}</div>
        </div>
        <div className="bg-surface-2 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs uppercase font-medium">Failed Tests</span>
          </div>
          <div className="text-lg font-bold text-white">{failedTests}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <ConfidenceBadge confidence={confidence} />
        <div className="text-xs text-slate-400">
          {isResolved ? `Resolved on ${new Date(resolvedAt).toLocaleDateString()}` : `Started on ${new Date(startedAt).toLocaleDateString()}`}
        </div>
      </div>
    </Card>
  );
}
