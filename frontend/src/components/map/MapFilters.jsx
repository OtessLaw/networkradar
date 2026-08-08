import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Check, SlidersHorizontal } from 'lucide-react';
import { NETWORKS } from '../../constants/networks';

export function MapFilters({ filters, setFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    { value: 'all', label: 'All Quality' },
    { value: 'excellent', label: 'Excellent', color: 'text-emerald-400 border-emerald-500/30' },
    { value: 'good', label: 'Good', color: 'text-green-400 border-green-500/30' },
    { value: 'fair', label: 'Fair', color: 'text-amber-400 border-amber-500/30' },
    { value: 'poor', label: 'Poor', color: 'text-red-400 border-red-500/30' },
  ];

  return (
    <div 
      className="absolute top-4 right-4 z-[2000] pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Collapsible Bar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass bg-slate-950/95 backdrop-blur-xl border border-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer hover:border-blue-500/50"
      >
        <SlidersHorizontal className="w-4 h-4 text-blue-400" />
        <span>Filter Networks & Quality</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Expandable Filter Panel */}
      {isOpen && (
        <div className="mt-2 w-72 glass bg-slate-950/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 space-y-4 font-sans animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Map Display Filters</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Network Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Operator
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setFilters({ ...filters, network: 'all' })}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  filters.network === 'all'
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                All Networks
              </button>

              {NETWORKS.map((n) => {
                const isSelected = filters.network === n.code;
                return (
                  <button
                    key={n.code}
                    onClick={() => setFilters({ ...filters, network: n.code })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                      isSelected
                        ? 'bg-slate-800 border-slate-600 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: n.color }}
                    ></span>
                    <span>{n.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Status Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Signal Quality
            </label>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => {
                const isSelected = filters.status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setFilters({ ...filters, status: s.value })}
                    className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-400 text-white font-bold'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapFilters;
