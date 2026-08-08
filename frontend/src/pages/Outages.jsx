import React, { useState, useEffect } from 'react';
import { OutageCard } from '../components/outage/OutageCard';
import { EmptyState } from '../components/common/EmptyState';
import { Spinner } from '../components/common/Spinner';
import { Activity } from 'lucide-react';
import { outageService } from '../services/outage.service';
import { useSocket } from '../hooks/useSocket';

export function Outages() {
  const [activeTab, setActiveTab] = useState('active');
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on } = useSocket();

  const fetchOutages = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'active' 
        ? await outageService.getActiveOutages()
        : await outageService.getResolvedOutages();
      setOutages(res.data || []);
    } catch (err) {
      // Mock data
      setOutages([
        { id: 1, network: 'MTN', area: 'East Legon, Accra', status: 'confirmed', confidence: 'high', reportCount: 45, failedTests: 120, startedAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, network: 'TELECEL', area: 'Kumasi Central', status: 'possible', confidence: 'medium', reportCount: 12, failedTests: 30, startedAt: new Date(Date.now() - 1800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutages();

    const offOutage = on('outage:updated', () => {
      fetchOutages();
    });

    return () => offOutage();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Outages & Disruptions</h1>
        <div className="flex border-b border-border">
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary text-primary-light' : 'border-transparent text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('active')}
          >
            Active Outages
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resolved' ? 'border-primary text-primary-light' : 'border-transparent text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20"><Spinner /></div>
      ) : outages.length === 0 ? (
        <EmptyState 
          icon={Activity} 
          title="No outages found" 
          description={activeTab === 'active' ? "All networks appear to be running normally." : "No recently resolved outages."} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outages.map(o => <OutageCard key={o.id} outage={o} />)}
        </div>
      )}
    </div>
  );
}

export default Outages;

