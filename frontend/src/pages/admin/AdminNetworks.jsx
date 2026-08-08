import React from 'react';
import { NetworkBadge } from '../../components/network/NetworkBadge';
import { Card } from '../../components/common/Card';
import { NETWORKS } from '../../constants/networks';

export function AdminNetworks() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Network Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {NETWORKS.map(net => (
          <Card key={net.code} className="bg-surface">
            <NetworkBadge code={net.code} className="mb-4" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Score</span>
                <span className="text-white font-bold">85/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reports Today</span>
                <span className="text-white font-bold">12</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminNetworks;
