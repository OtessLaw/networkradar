import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Navbar } from './Navbar';

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
