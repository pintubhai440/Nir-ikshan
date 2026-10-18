import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink, X, ShieldCheck, Terminal, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintCount: number;
  onRefresh?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  complaintCount,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  const sampleSqlSnippet = `-- Run this in Supabase Dashboard -> SQL Editor:
CREATE TABLE IF NOT EXISTS public.citizen_complaints (
  id TEXT PRIMARY KEY,
  citizen_name TEXT NOT NULL DEFAULT 'Verified Citizen',
  citizen_phone TEXT,
  district TEXT NOT NULL,
  mandal TEXT,
  village TEXT,
  location_landmark TEXT,
  coordinates JSONB NOT NULL,
  waste_type TEXT,
  short_description TEXT NOT NULL,
  photo_url TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  assigned_nodal_officer TEXT,
  assigned_inspector TEXT,
  assigned_inspector_phone TEXT,
  assigned_engineer TEXT,
  assigned_engineer_phone TEXT,
  inspection_report JSONB,
  work_execution JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.citizen_complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON public.citizen_complaints FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON public.citizen_complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.citizen_complaints FOR UPDATE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_complaints;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Supabase Cloud Database</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isConnected ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                }`}>
                  {isConnected ? 'LIVE CONNECTED' : 'CONFIG REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Permanent centralized storage for complaints across all devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-slate-700">
          
          {/* Status Box */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">
                {isConnected 
                  ? 'Cloud Database Active & Synchronized' 
                  : 'Running in Local Fallback Mode'}
              </p>
              <p className="text-xs opacity-90 leading-relaxed">
                {isConnected 
                  ? `Every complaint lodged or updated is permanently saved in your Supabase PostgreSQL table. Live across all browsers, mobile devices, and Vercel deployments. Total synced: ${complaintCount}`
                  : 'Data is currently saved to browser storage. To enable permanent storage across all citizen phones and Vercel visitors, add your Supabase credentials in Vercel or your .env file.'}
              </p>
            </div>
          </div>

          {/* Setup Instructions for Vercel & Supabase */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How to Connect Supabase to Vercel (3 Steps):
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
              <li>
                <span className="font-bold text-slate-800">Create Free Supabase Project:</span> Go to{' '}
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and click <em>New Project</em>.
              </li>
              <li>
                <span className="font-bold text-slate-800">Run Table Schema SQL:</span> In Supabase, open{' '}
                <strong>SQL Editor</strong>, paste the schema below, and click <strong>Run</strong>.
              </li>
              <li>
                <span className="font-bold text-slate-800">Add 2 Keys in Vercel:</span> Go to Vercel Project &gt; Settings &gt; Environment Variables and add:
                <div className="mt-1.5 p-2 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-lg select-all space-y-1">
                  <div>VITE_SUPABASE_URL = https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</div>
                </div>
              </li>
            </ol>
          </div>

          {/* SQL Schema Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                Supabase SQL Setup Code (Table &amp; Realtime):
              </span>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 text-slate-300 rounded-xl font-mono text-[10px] overflow-x-auto max-h-36 leading-relaxed">
              {sampleSqlSnippet}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            {onRefresh && (
              <button
                type="button"
                onClick={() => {
                  onRefresh();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Data
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
