import React from 'react';
import { StatsCard } from '../../components/admin/StatsCard';
import { DataTable } from '../../components/admin/DataTable';
import { Users, Activity, AlertTriangle, Radio } from 'lucide-react';
import { NetworkBadge } from '../../components/network/NetworkBadge';

export function AdminDashboard() {
  const stats = [
    { title: 'Total Users', value: '12,450', icon: Users, trend: { isPositive: true, value: 12 } },
    { title: 'Active Reports', value: '45', icon: AlertTriangle, trend: { isPositive: false, value: 5 } },
    { title: 'Tests Today', value: '3,204', icon: Activity, trend: { isPositive: true, value: 8 } },
    { title: 'Active Outages', value: '2', icon: Radio, trend: { isPositive: false, value: 50 } }
  ];

  const recentReports = [
    { id: 1, user: 'User 402', network: 'MTN', type: 'No Service', area: 'East Legon', status: 'pending', date: '2023-10-25' },
    { id: 2, user: 'User 891', network: 'TELECEL', type: 'Slow Internet', area: 'Osu', status: 'verified', date: '2023-10-25' },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'User', accessor: 'user' },
    { header: 'Network', cell: (row) => <NetworkBadge code={row.network} /> },
    { header: 'Type', accessor: 'type' },
    { header: 'Area', accessor: 'area' },
    { header: 'Status', cell: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        {row.status}
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Reports</h2>
          <DataTable columns={columns} data={recentReports} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">System Health</h2>
          <div className="bg-surface rounded-lg p-6 border border-border">
            <p className="text-slate-400">All systems operational.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
