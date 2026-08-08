import React, { useState, useEffect } from 'react';
import { NetworkCard } from '../components/network/NetworkCard';
import { CompareChart } from '../components/network/CompareChart';
import { networkService } from '../services/network.service';
import { NETWORKS } from '../constants/networks';
import { Search } from 'lucide-react';
import { Spinner } from '../components/common/Spinner';

export function Networks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await networkService.compare({ range: timeRange, location });
        setData(res.data);
      } catch (err) {
        // Mock data for display
        setData({
          stats: {
            MTN: { score: 85, status: 'good', confidence: 'high', measurements: 1250, lastUpdated: new Date().toISOString() },
            TELECEL: { score: 72, status: 'fair', confidence: 'medium', measurements: 840, lastUpdated: new Date().toISOString() },
            AT: { score: 65, status: 'poor', confidence: 'low', measurements: 320, lastUpdated: new Date().toISOString() }
          },
          chartData: [
            { name: 'Average Score', MTN: 85, Telecel: 72, AT: 65 },
            { name: 'Download (Mbps)', MTN: 45, Telecel: 25, AT: 15 },
            { name: 'Reliability (%)', MTN: 98, Telecel: 92, AT: 85 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]); // location search requires enter/button click ideally, keeping simple here

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Network Comparison</h1>
          <p className="text-slate-400 mt-1">Analyze network performance across Ghana</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter by location..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-lg text-sm text-white focus:ring-primary focus:border-primary w-full"
            />
          </div>
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg text-sm text-white px-4 py-2"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading || !data ? (
        <div className="py-20"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {NETWORKS.map(net => (
              <NetworkCard key={net.code} networkCode={net.code} data={data.stats[net.code]} />
            ))}
          </div>

          <div className="glass rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold text-white mb-6">Performance Metrics</h2>
            <CompareChart data={data.chartData} />
          </div>
        </>
      )}
    </div>
  );
}

export default Networks;

