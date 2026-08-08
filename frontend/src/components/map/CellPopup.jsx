import React from 'react';
import { Award, Zap, AlertTriangle, ShieldCheck, MapPin, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStatusLabel, getStatusColor, getStatusBg } from '../../utils/score';

export function CellPopup({ data, userLocation, gpsAccuracy }) {
  if (!data) return null;

  const allNetworks = [
    { code: 'MTN', name: 'MTN Ghana', color: '#FFD700', textColor: '#000' },
    { code: 'TELECEL', name: 'Telecel Ghana', color: '#CC0000', textColor: '#fff' },
    { code: 'AT', name: 'AT Ghana', color: '#0066CC', textColor: '#fff' },
  ];

  let networkStats = [];

  if (Array.isArray(data.networks) && data.networks.length > 0) {
    networkStats = data.networks;
  } else if (data.networkId) {
    const targetCode = data.networkId.code || 'MTN';
    networkStats = allNetworks.map(net => {
      if (net.code === targetCode) {
        return {
          code: net.code,
          name: net.name,
          color: net.color,
          score: data.score,
          status: data.status || 'insufficient_data',
          confidence: data.confidence || 'low',
          avgDownloadSpeed: data.avgDownloadSpeed || null,
          avgLatency: data.avgLatency || null,
          activeOutage: data.activeOutage || false,
        };
      }
      return {
        code: net.code,
        name: net.name,
        color: net.color,
        score: null,
        status: 'insufficient_data',
        confidence: 'insufficient',
        avgDownloadSpeed: null,
        avgLatency: null,
        activeOutage: false,
      };
    });
  } else {
    networkStats = allNetworks.map(net => ({
      code: net.code,
      name: net.name,
      color: net.color,
      score: null,
      status: 'insufficient_data',
      confidence: 'insufficient',
      avgDownloadSpeed: null,
      avgLatency: null,
      activeOutage: false,
    }));
  }

  const ranked = [...networkStats].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topNetwork = ranked.find(n => n.score !== null);

  return (
    <div className="p-4 w-[320px] sm:w-[360px] bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-xl">
      {/* Header with Deep Location Detail */}
      <div className="border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            <Crosshair className="w-3 h-3 text-emerald-400" />
            <span>{userLocation ? '🟢 Precise device location' : 'Geographic Grid Cell'}</span>
          </span>

          {gpsAccuracy && (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              ±{Math.round(gpsAccuracy)}m Accuracy
            </span>
          )}
        </div>

        <h4 className="text-base font-extrabold text-white leading-snug mt-1 flex items-start space-x-1.5">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{data.landmark || data.areaName || data.gridCellId || 'Ghana Location'}</span>
        </h4>

        {data.district && (
          <p className="text-[11px] text-slate-400 ml-5 font-medium">
            District / Municipality: <span className="text-slate-200">{data.district}</span>
          </p>
        )}

        {data.approximateLat && (
          <p className="text-[10px] text-slate-500 ml-5 font-mono">
            GPS: {data.approximateLat.toFixed(5)}, {data.approximateLng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Best Network Recommendation */}
      {topNetwork && topNetwork.score !== null && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">#1 Operator at this Location</span>
            <span className="text-xs font-extrabold text-white">
              {topNetwork.name} ({topNetwork.score}/100 Score)
            </span>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
          Side-by-Side Operators at this Spot:
        </span>

        {networkStats.map((net) => {
          const isInsufficient = net.status === 'insufficient_data' || net.score === null;
          const statusColor = getStatusColor(net.status);

          return (
            <div
              key={net.code}
              className={`p-2.5 rounded-xl border transition-all ${
                net.activeOutage
                  ? 'bg-red-500/10 border-red-500/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: net.color }}
                  ></span>
                  <span className="text-xs font-bold text-white">{net.name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {net.activeOutage && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500 text-white flex items-center space-x-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>OUTAGE</span>
                    </span>
                  )}

                  <span className={`text-xs font-black ${statusColor}`}>
                    {isInsufficient ? 'No Data' : `${net.score}/100`}
                  </span>
                </div>
              </div>

              {/* Sub-metrics */}
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                <span className={statusColor}>
                  Status: <strong>{getStatusLabel(net.status)}</strong>
                </span>
                {net.avgDownloadSpeed ? (
                  <span className="text-slate-200 font-mono">
                    ⚡ {net.avgDownloadSpeed} Mbps
                  </span>
                ) : (
                  <span className="text-slate-500">Speed: N/A</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
        <Link
          to="/test"
          className="flex-1 text-center py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Test Speed Here</span>
        </Link>
        <Link
          to="/report"
          className="flex-1 text-center py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Problem</span>
        </Link>
      </div>
    </div>
  );
}

export default CellPopup;
