import React from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { NetworkBadge } from '../../components/network/NetworkBadge';

export function AdminReports() {
  const data = [
    { id: 1, user: 'User 402', network: 'MTN', type: 'No Service', area: 'East Legon', status: 'pending', confidence: 'high', date: '2023-10-25' }
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Network', cell: (row) => <NetworkBadge code={row.network} /> },
    { header: 'Type', accessor: 'type' },
    { header: 'Area', accessor: 'area' },
    { header: 'Confidence', accessor: 'confidence' },
    { header: 'Status', accessor: 'status' },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manage Reports</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default AdminReports;
