import React from 'react';
import { Filter } from 'lucide-react';
import { NETWORKS } from '../../constants/networks';
import { Card } from '../common/Card';

export function MapFilters({ filters, setFilters }) {
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <Card className="absolute top-4 left-4 z-[1000] w-64 shadow-2xl p-4">
      <div className="flex items-center gap-2 mb-4 text-white font-semibold">
        <Filter className="w-5 h-5" />
        Filters
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Network</label>
          <select 
            value={filters.network}
            onChange={(e) => setFilters({ ...filters, network: e.target.value })}
            className="w-full bg-surface-2 border border-border rounded-md text-sm text-slate-200 p-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Networks</option>
            {NETWORKS.map(n => (
              <option key={n.code} value={n.code}>{n.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full bg-surface-2 border border-border rounded-md text-sm text-slate-200 p-2 focus:ring-primary focus:border-primary"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

export default MapFilters;

