import React from 'react';
import { Link } from 'react-router-dom';
import { Signal, Shield, Globe, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Signal className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">NetworkRadar GH</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              "Know Your Network Before You Connect." Real-time mobile network quality monitoring and crowd-sourced reporting across Ghana.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/map" className="hover:text-blue-400 transition-colors">Live Coverage Map</Link></li>
              <li><Link to="/networks" className="hover:text-blue-400 transition-colors">Compare MTN, Telecel, AT</Link></li>
              <li><Link to="/test" className="hover:text-blue-400 transition-colors">Run Speed & Ping Test</Link></li>
              <li><Link to="/outages" className="hover:text-blue-400 transition-colors">Outage Dashboard</Link></li>
              <li><Link to="/report" className="hover:text-blue-400 transition-colors">Report Problem</Link></li>
            </ul>
          </div>

          {/* Supported Networks */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Networks Covered</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700]"></span>
                <span className="text-slate-300">MTN Ghana</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CC0000]"></span>
                <span className="text-slate-300">Telecel Ghana</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0066CC]"></span>
                <span className="text-slate-300">AT Ghana (AirtelTigo)</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Transparency */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Privacy First</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              We never store your exact GPS coordinates. All measurements are aggregated into 500m geographic cells to protect user identity.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>Opt-in location only</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NetworkRadar Ghana. Built for Ghana 🇬🇭.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Powered by real measurements</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
