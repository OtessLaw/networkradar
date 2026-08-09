import React, { useEffect, useRef } from 'react';
import { Award, Zap, AlertTriangle, MapPin, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { getStatusLabel, getStatusColor } from '../../utils/score';
import { getAreaNetworkIntelligence } from '../../utils/geo';

export function CellPopup({ data, userLocation, gpsAccuracy }) {
  const containerRef = useRef(null);

  // Prevent Leaflet map from capturing wheel/drag/touch scroll events on the operator card
  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableScrollPropagation(containerRef.current);
      L.DomEvent.disableClickPropagation(containerRef.current);
    }
  }, []);

  if (!data) return null;

  const lat = data.approximateLat || (userLocation ? userLocation.latitude : 5.6037);
  const lng = data.approximateLng || (userLocation ? userLocation.longitude : -0.1870);

  const areaIntel = getAreaNetworkIntelligence(lat, lng);

  const allNetworks = [
    {
      code: 'MTN',
      name: 'MTN Ghana',
      color: '#FFD700',
      textColor: '#000',
      score: data.score || areaIntel.mtn.score,
      status: data.status && data.status !== 'insufficient_data' ? data.status : areaIntel.mtn.status,
      speed: data.avgDownloadSpeed ? `${data.avgDownloadSpeed} Mbps` : areaIntel.mtn.speed,
      ping: data.avgLatency ? `${data.avgLatency} ms` : areaIntel.mtn.ping,
      verdict: areaIntel.mtn.simpleVerdict,
    },
    {
      code: 'TELECEL',
      name: 'Telecel Ghana',
      color: '#CC0000',
      textColor: '#fff',
      score: areaIntel.telecel.score,
      status: areaIntel.telecel.status,
      speed: areaIntel.telecel.speed,
      ping: areaIntel.telecel.ping,
      verdict: areaIntel.telecel.simpleVerdict,
    },
    {
      code: 'AT',
      name: 'AT Ghana',
      color: '#0066CC',
      textColor: '#fff',
      score: areaIntel.at.score,
      status: areaIntel.at.status,
      speed: areaIntel.at.speed,
      ping: areaIntel.at.ping,
      verdict: areaIntel.at.simpleVerdict,
    },
  ];

  const ranked = [...allNetworks].sort((a, b) => b.score - a.score);
  const topNetwork = ranked[0];

  return (
    <div
      ref={containerRef}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="p-4 w-[310px] sm:w-[360px] max-h-[78vh] overflow-y-auto custom-scrollbar bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 backdrop-blur-xl touch-pan-y pointer-events-auto"
    >
      {/* Header with Location Detail */}
      <div className="border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            <Crosshair className="w-3 h-3 text-emerald-400" />
            <span>{userLocation ? '🟢 Precise standing location' : 'Geographic Grid Cell'}</span>
          </span>

          {gpsAccuracy && (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              ±{Math.round(gpsAccuracy)}m Accuracy
            </span>
          )}
        </div>

        <h4 className="text-base font-extrabold text-white leading-snug mt-1 flex items-start space-x-1.5">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{data.landmark || data.areaName || data.gridCellId || areaIntel.townName || 'Ghana Location'}</span>
        </h4>

        {data.district && (
          <p className="text-[11px] text-slate-400 ml-5 font-medium">
            District / Area: <span className="text-slate-200">{data.district}</span>
          </p>
        )}

        <p className="text-[10px] text-slate-500 ml-5 font-mono">
          GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>

      {/* Best Network Recommendation */}
      {topNetwork && (
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

        {allNetworks.map((net) => {
          const statusColor = getStatusColor(net.status);

          return (
            <div
              key={net.code}
              className="p-2.5 rounded-xl border bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all space-y-1"
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
                  <span className={`text-xs font-black ${statusColor}`}>
                    {net.score}/100
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 font-medium leading-snug">{net.verdict}</p>

              {/* Sub-metrics */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className={statusColor}>
                  Status: <strong>{getStatusLabel(net.status)}</strong>
                </span>
                <span className="text-slate-200 font-mono">
                  ⚡ {net.speed} • {net.ping}
                </span>
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
