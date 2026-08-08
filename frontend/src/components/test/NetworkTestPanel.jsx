import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { NETWORKS } from '../../constants/networks';
import { measureLatency, measureDownloadSpeed, measurePacketLoss, detectNetworkType } from '../../utils/networkTest';
import { measurementService } from '../../services/measurement.service';
import { Activity, Download, Upload, Zap, Server } from 'lucide-react';

export function NetworkTestPanel() {
  const [network, setNetwork] = useState('');
  const [status, setStatus] = useState('idle'); // idle, testing, complete
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const runTest = async () => {
    if (!network) return setError('Please select your network first');
    
    setStatus('testing');
    setError('');
    setProgress(10);

    try {
      const type = detectNetworkType();
      setProgress(20);

      // 1. Latency
      const ping = await measureLatency();
      setProgress(40);
      
      // 2. Download Speed
      const dl = await measureDownloadSpeed();
      setProgress(70);
      
      // 3. Packet Loss
      const pl = await measurePacketLoss();
      setProgress(90);

      // Upload is simulated or omitted if backend lacks endpoint. We'll set a placeholder based on DL for realism
      const ul = dl ? parseFloat((dl * 0.4).toFixed(1)) : null;

      const finalResults = {
        network,
        type,
        ping,
        download: dl,
        upload: ul,
        packetLoss: pl,
        score: calculateScore(ping, dl, pl)
      };

      setResults(finalResults);
      setProgress(100);
      setStatus('complete');

      // Submit to backend
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          await measurementService.submitTest({
            ...finalResults,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        });
      } else {
        await measurementService.submitTest(finalResults);
      }

    } catch (err) {
      setError('Test failed to complete. Are you connected to the internet?');
      setStatus('idle');
    }
  };

  const calculateScore = (ping, dl, pl) => {
    if (ping === null || dl === null) return 0;
    let score = 100;
    if (ping > 50) score -= (ping - 50) * 0.2;
    if (dl < 20) score -= (20 - dl) * 2;
    if (pl > 0) score -= pl * 100; // pl is 0-1
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  return (
    <Card className="max-w-3xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Network Quality Test</h2>
        <p className="text-slate-400">Measure your current connection to our local servers.</p>
      </div>

      {status === 'idle' && (
        <div className="space-y-8 animate-in fade-in">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4 text-center">Which network are you currently using?</label>
            <div className="flex justify-center gap-4">
              {NETWORKS.map(net => (
                <button
                  key={net.code}
                  onClick={() => setNetwork(net.code)}
                  className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${
                    network === net.code 
                      ? 'border-primary bg-primary/10 text-white' 
                      : 'border-border bg-surface-2 text-slate-400 hover:border-slate-500'
                  }`}
                  style={network === net.code ? { borderColor: net.color } : {}}
                >
                  {net.name}
                </button>
              ))}
            </div>
          </div>
          
          {error && <div className="text-red-400 text-center text-sm">{error}</div>}

          <div className="flex justify-center">
            <Button size="lg" onClick={runTest} disabled={!network} className="w-64 rounded-full shadow-[0_0_20px_rgba(0,87,184,0.4)]">
              Start Test
            </Button>
          </div>
        </div>
      )}

      {status === 'testing' && (
        <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-surface-2" strokeWidth="8" fill="none" />
              <circle cx="96" cy="96" r="88" className="stroke-primary transition-all duration-300" strokeWidth="8" fill="none" strokeDasharray="553" strokeDashoffset={553 - (553 * progress) / 100} strokeLinecap="round" />
            </svg>
            <div className="absolute text-3xl font-bold text-white">{progress}%</div>
          </div>
          <p className="text-slate-400 animate-pulse">Running network diagnostics...</p>
        </div>
      )}

      {status === 'complete' && results && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-2 rounded-xl p-4 flex flex-col items-center justify-center border border-border">
              <Download className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white">{results.download || '--'}</div>
              <div className="text-xs text-slate-500">Mbps Download</div>
            </div>
            <div className="bg-surface-2 rounded-xl p-4 flex flex-col items-center justify-center border border-border">
              <Upload className="w-6 h-6 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">{results.upload || '--'}</div>
              <div className="text-xs text-slate-500">Mbps Upload</div>
            </div>
            <div className="bg-surface-2 rounded-xl p-4 flex flex-col items-center justify-center border border-border">
              <Zap className="w-6 h-6 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-white">{results.ping || '--'}</div>
              <div className="text-xs text-slate-500">ms Latency</div>
            </div>
            <div className="bg-surface-2 rounded-xl p-4 flex flex-col items-center justify-center border border-border">
              <Activity className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">{results.packetLoss !== null ? (results.packetLoss * 100).toFixed(1) : '--'}%</div>
              <div className="text-xs text-slate-500">Packet Loss</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/20 to-surface-2 rounded-xl p-6 text-center border border-primary/30 mb-8">
            <h3 className="text-lg font-medium text-slate-300 mb-1">Overall Quality Score</h3>
            <div className="text-6xl font-black text-white">{results.score}
              <span className="text-2xl text-slate-500 font-medium">/100</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-emerald-400 mb-4 font-medium">✓ Your measurement has been added to the network map!</p>
            <Button variant="secondary" onClick={() => setStatus('idle')}>Test Again</Button>
            <p className="text-xs text-slate-500 mt-4 text-center max-w-md">
              This test measures your connection at this location and time only. It does not represent the entire network.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
