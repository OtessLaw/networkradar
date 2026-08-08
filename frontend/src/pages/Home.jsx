import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Activity, ShieldCheck, Zap, BarChart3, AlertTriangle, MapPin } from 'lucide-react';
import { outageService } from '../services/outage.service';
import { networkService } from '../services/network.service';

export function Home() {
  const [activeOutages, setActiveOutages] = useState([]);
  const [stats, setStats] = useState({ totalMeasurements: 0, activeReports: 0, networksCovered: 3 });

  useEffect(() => {
    // Mocking initial data fetch for home page
    const fetchHomeData = async () => {
      try {
        const { data } = await outageService.getActiveOutages();
        setActiveOutages(data || []);
      } catch {
        setActiveOutages([
          { id: 1, network: 'MTN', area: 'East Legon, Accra', status: 'possible', startedAt: new Date().toISOString() }
        ]);
      }
      
      setStats({
        totalMeasurements: 145032,
        activeReports: 24,
        networksCovered: 3
      });
    };
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-950 opacity-90 z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-red-500/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-8">
            <Activity className="w-4 h-4" />
            Real-time Network Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Know Your Network <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary-light to-emerald-400 bg-clip-text text-transparent">
              Before You Connect.
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-xl text-slate-400 mx-auto mb-10">
            Community-driven monitoring for MTN, Telecel, and AT in Ghana. 
            Check live signal strength, report outages, and find the best network for your area.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/map">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                <MapPin className="w-5 h-5 mr-2" />
                Check My Area
              </Button>
            </Link>
            <Link to="/test">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Zap className="w-5 h-5 mr-2" />
                Test My Network
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-border">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Report a Problem
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-border bg-surface-2/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="py-2 md:py-0">
              <div className="text-3xl font-bold text-white">{stats.totalMeasurements.toLocaleString()}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Total Measurements</div>
            </div>
            <div className="py-2 md:py-0">
              <div className="text-3xl font-bold text-red-400">{stats.activeReports}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Active Reports Today</div>
            </div>
            <div className="py-2 md:py-0">
              <div className="text-3xl font-bold text-primary-light">{stats.networksCovered}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">Networks Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How NetworkRadar Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We combine automated tests with community reports to give you an accurate picture of network health across Ghana.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "1. Run Tests", desc: "Users perform speed and latency tests on their current network." },
              { icon: AlertTriangle, title: "2. Report Issues", desc: "Community members report outages and coverage problems." },
              { icon: Activity, title: "3. Analyze Data", desc: "Our system aggregates and verifies thousands of data points." },
              { icon: ShieldCheck, title: "4. View Status", desc: "Check the map to see real-time network health before you travel or switch." }
            ].map((step, i) => (
              <Card key={i} className="text-center bg-surface border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-light">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="py-12 bg-surface-2 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
          <p className="text-slate-400">
            Your location is fuzzed to a 500m area. We never share your identity or exact whereabouts with third parties. Data is only used to improve network transparency.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;

