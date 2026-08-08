import React from 'react';
import { DataTable } from '../../components/admin/DataTable';

export function AdminUsers() {
  const data = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', reputation: 'trusted' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user', reputation: 'normal' }
  ];

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Reputation', accessor: 'reputation' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manage Users</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default AdminUsers;
