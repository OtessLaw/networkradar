import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { NETWORKS } from '../../constants/networks';
import { NetworkBadge } from '../network/NetworkBadge';
import { AlertTriangle, MapPin, WifiOff, PhoneOff, MessageSquareOff } from 'lucide-react';
import { reportService } from '../../services/report.service';

const PROBLEM_TYPES = [
  { id: 'no_service', label: 'No Service', icon: AlertTriangle },
  { id: 'internet_down', label: 'Internet Down', icon: WifiOff },
  { id: 'internet_slow', label: 'Internet Slow', icon: WifiOff },
  { id: 'calls_dropping', label: 'Calls Dropping', icon: PhoneOff },
  { id: 'no_calls', label: 'Cannot Make/Receive Calls', icon: PhoneOff },
  { id: 'sms_fail', label: 'SMS Problems', icon: MessageSquareOff },
  { id: 'momo_fail', label: 'MoMo Problems', icon: AlertTriangle },
  { id: 'other', label: 'Other', icon: AlertTriangle }
];

export function ReportForm({ onSuccess }) {
  const [formData, setFormData] = useState({ network: '', type: '', area: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.network || !formData.type || !formData.area) {
      setError('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await reportService.submitReport(formData);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Report a Network Problem</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">1. Select Network *</label>
          <div className="grid grid-cols-3 gap-4">
            {NETWORKS.map(net => (
              <button
                key={net.code}
                type="button"
                onClick={() => setFormData({ ...formData, network: net.code })}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  formData.network === net.code 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-surface-2 hover:border-slate-500'
                }`}
              >
                <div className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm" style={{ backgroundColor: net.color, color: net.textColor }}>
                  {net.code[0]}
                </div>
                <span className="font-medium text-slate-200">{net.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">2. What's the problem? *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROBLEM_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`p-3 rounded-lg border flex flex-col items-center text-center gap-2 transition-colors ${
                  formData.type === type.id
                    ? 'border-primary bg-primary/10 text-primary-light'
                    : 'border-border bg-surface-2 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                <type.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">3. Where is this happening? *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g. East Legon, Accra"
              className="block w-full pl-10 bg-surface-2 border border-border rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">4. Additional Details (Optional)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Any other details that might help?"
            className="block w-full bg-surface-2 border border-border rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );
}
