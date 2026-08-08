import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Activity, Users, BarChart3, Radio } from 'lucide-react';

export function AdminSidebar() {
  const location = useLocation();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/reports', label: 'Reports', icon: AlertTriangle },
    { to: '/admin/outages', label: 'Outages', icon: Activity },
    { to: '/admin/networks', label: 'Networks', icon: Radio },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col pt-6">
      <div className="px-4 mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Panel</h3>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'text-slate-300 hover:bg-surface-2 hover:text-white'
              }`}
            >
              <link.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminSidebar;

