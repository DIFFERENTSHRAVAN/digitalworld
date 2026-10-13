import React, { useState } from 'react';
import { isUsingLocalMode } from '../../services/api';
import { Database, X, ExternalLink, CheckCircle2 } from 'lucide-react';

export const LocalModeNotice: React.FC = () => {
  const isLocal = isUsingLocalMode();
  const [showModal, setShowModal] = useState(false);

  if (!isLocal) return null;

  return (
    <>
      <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between no-print">
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">Local Development Mode Active:</span>
            <span>Running with simulated database & instant local order placement.</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="font-medium underline hover:text-amber-950 flex items-center gap-1 cursor-pointer"
          >
            How to connect Supabase live DB
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-charcoal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-secondary" />
                <h3 className="font-bold text-lg text-primary">Supabase Integration Setup</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-charcoal hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-charcoal-muted leading-relaxed">
              <p>
                The app is currently running in <strong>Local Storage Mode</strong>. All features (product browsing, cart, order placement, order lookup, and shop owner admin dashboard) work locally without needing an external account.
              </p>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <p className="font-semibold text-primary text-xs uppercase tracking-wider">To connect your live Supabase database:</p>
                <ol className="list-decimal pl-4 space-y-1 text-xs">
                  <li>Create a free project at <span className="text-secondary font-mono">supabase.com</span>.</li>
                  <li>In the Supabase SQL Editor, run the SQL script found in <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">supabase/schema.sql</span>.</li>
                  <li>Run the seed script in <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">supabase/seed.sql</span>.</li>
                  <li>Copy your Project URL and Anon Key into <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">.env</span>:</li>
                </ol>
                <pre className="bg-primary text-slate-200 p-2.5 rounded-lg text-xs font-mono overflow-x-auto mt-2">
                  VITE_SUPABASE_URL=https://your-ref.supabase.co{'\n'}
                  VITE_SUPABASE_ANON_KEY=eyJhbGci...
                </pre>
              </div>

              <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Admin Demo Login: <strong>admin@digitalworld.com</strong> (Password: <strong>admin123</strong>)
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
