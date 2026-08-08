import React, { useState } from 'react';
import { ReportForm } from '../components/report/ReportForm';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export function Report() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!submitted ? (
        <ReportForm onSuccess={() => setSubmitted(true)} />
      ) : (
        <div className="max-w-2xl mx-auto text-center py-16 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Report Submitted!</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Thank you for helping us map network issues in Ghana. Your report is being processed.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setSubmitted(false)}>Report Another Issue</Button>
            <Link to="/map">
              <Button variant="secondary">View Map</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Report;

