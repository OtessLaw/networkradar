import React from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { NetworkBadge } from '../../components/network/NetworkBadge';

export function AdminOutages() {
  const data = [
    { id: 1, network: 'MTN', area: 'East Legon', status: 'confirmed', startedAt: '2023-10-25T10:00:00Z', resolvedAt: null }
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Network', cell: (row) => <NetworkBadge code={row.network} /> },
    { header: 'Area', accessor: 'area' },
    { header: 'Status', accessor: 'status' },
    { header: 'Started', cell: (row) => new Date(row.startedAt).toLocaleString() },
    { header: 'Resolved', cell: (row) => row.resolvedAt ? new Date(row.resolvedAt).toLocaleString() : '-' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manage Outages</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default AdminOutages;
