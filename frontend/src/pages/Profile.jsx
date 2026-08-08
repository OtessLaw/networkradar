import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { User, Bell, Shield, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Card className="text-center p-8">
            <div className="w-24 h-24 bg-surface-2 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user.name || 'User'}</h2>
            <p className="text-sm text-slate-400 mb-4">{user.email}</p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              {user.reputation || 'Normal'} User
            </div>

            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveTab('settings')}>
                <Bell className="w-4 h-4 mr-3" /> Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-3" /> Logout
              </Button>
            </div>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <div className="flex border-b border-border mb-6">
            <button 
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reports' ? 'border-primary text-primary-light' : 'border-transparent text-slate-400'}`}
              onClick={() => setActiveTab('reports')}
            >
              My Reports
            </button>
            <button 
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tests' ? 'border-primary text-primary-light' : 'border-transparent text-slate-400'}`}
              onClick={() => setActiveTab('tests')}
            >
              My Tests
            </button>
          </div>

          <Card className="min-h-[400px] flex items-center justify-center">
            <p className="text-slate-400 text-sm">Nothing to show yet.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
