import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

export function OutageBanner() {
  const [activeAlert, setActiveAlert] = useState(null);
  const { on } = useSocket();

  useEffect(() => {
    const unsubDetected = on('outage:detected', (data) => {
      if (data?.outage) {
        setActiveAlert({
          id: data.outage._id,
          network: data.outage.networkId?.name || 'Mobile Network',
          area: data.outage.area || 'Ghana',
          status: data.outage.status,
        });
      }
    });

    const unsubUpdated = on('outage:updated', (data) => {
      if (data?.outage && data.outage.status === 'confirmed_community') {
        setActiveAlert({
          id: data.outage._id,
          network: data.outage.networkId?.name || 'Mobile Network',
          area: data.outage.area || 'Ghana',
          status: 'confirmed_community',
        });
      }
    });

    return () => {
      unsubDetected?.();
      unsubUpdated?.();
    };
  }, [on]);

  if (!activeAlert) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 shadow-lg relative z-50 animate-bounce-short">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 text-sm font-medium">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
          </div>
          <div>
            <span className="font-bold">Real-time Outage Alert:</span>{' '}
            <span>
              {activeAlert.network} is experiencing a{' '}
              <span className="underline font-bold uppercase">{activeAlert.status.replace('_', ' ')}</span>{' '}
              around {activeAlert.area}.
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 hover:bg-white/20 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default OutageBanner;
