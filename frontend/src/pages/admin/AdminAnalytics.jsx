import React from 'react';
import { Card } from '../../components/common/Card';

export function AdminAnalytics() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Platform Analytics</h1>
      <Card className="bg-surface h-96 flex items-center justify-center">
        <p className="text-slate-400">Charts would be rendered here.</p>
      </Card>
    </div>
  );
}

export default AdminAnalytics;
