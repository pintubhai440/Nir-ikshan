import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Radio, 
  Sparkles, 
  Key, 
  Globe, 
  Layers,
  Code2,
  FileCode
} from 'lucide-react';

interface SupabaseVercelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseVercelModal: React.FC<SupabaseVercelModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sql' | 'realtime' | 'env' | 'queries'>('sql');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const SUPABASE_DDL_SCHEMA = `-- ====================================================================
-- APWRIMS NIR-IKSHAN COMPLAINTS & REAL-TIME WORKFLOW SCHEMA FOR SUPABASE
-- Run this directly in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Complaints Table (Master Grievance Record)
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY, -- e.g. 'CMP-AP-2026-403'
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT NOT NULL,
    citizen_age INTEGER,
    citizen_gender TEXT,
    state TEXT DEFAULT 'Andhra Pradesh',
    district TEXT NOT NULL,
    mandal TEXT NOT NULL,
    village TEXT NOT NULL,
    location_landmark TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    waste_type TEXT,
    short_description TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED', 
    -- Statuses: 'SUBMITTED', 'INSPECTOR_ASSIGNED', 'INSPECTION_COMPLETED', 'ACTION_ASSIGNED', 'WORKER_IN_PROGRESS', 'VERIFICATION_PENDING', 'RESOLVED', 'REJECTED'
    assigned_nodal_officer TEXT DEFAULT 'District Nodal Officer',
    assigned_inspector TEXT,
    assigned_inspector_phone TEXT,
    assigned_inspector_at TIMESTAMPTZ,
    assigned_engineer TEXT,
    assigned_engineer_phone TEXT,
    assigned_engineer_at TIMESTAMPTZ,
    machinery_deployed TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Departmental Personnel Roster (Inspectors & Action Workers)
CREATE TABLE IF NOT EXISTS public.departmental_roster (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Nodal Officer', 'Field Inspector', 'Action Worker'
    badge_id TEXT UNIQUE,
    phone TEXT NOT NULL,
    email TEXT,
    district TEXT NOT NULL,
    specialization_or_machinery TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Field Inspection Reports (Stage 3)
CREATE TABLE IF NOT EXISTS public.inspection_reports (
    id TEXT PRIMARY KEY,
    complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE,
    inspector_name TEXT NOT NULL,
    inspector_phone TEXT NOT NULL,
    inspected_at TIMESTAMPTZ DEFAULT NOW(),
    water_presence TEXT, -- 'Abundant', 'Moderate', 'Low', 'Stagnant Dry', 'Extinct'
    waste_level TEXT, -- 'Low', 'Moderate', 'Heavy', 'Severe Choke'
    tds_reading_ppm INTEGER,
    site_photo_url TEXT,
    is_complaint_valid BOOLEAN DEFAULT TRUE,
    validation_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Remediation Work Executions & Proof (Stage 4 & 5)
CREATE TABLE IF NOT EXISTS public.work_executions (
    id TEXT PRIMARY KEY,
    complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE,
    engineer_name TEXT NOT NULL,
    engineer_phone TEXT NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'ACCEPTED', -- 'ACCEPTED', 'BLOCKED', 'COMPLETED'
    before_photo_url TEXT,
    after_photo_url TEXT,
    cleared_metric_tons NUMERIC(6,2),
    work_summary TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Final Physical Verification & Resolution Logs (Stage 6)
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id TEXT REFERENCES public.complaints(id) ON DELETE CASCADE,
    verified_by_inspector TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_satisfactory BOOLEAN DEFAULT TRUE,
    verification_photo_url TEXT,
    official_seal_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. ENABLE REALTIME BROADCAST ON SUPABASE
-- (This pushes updates live to State Admin and Citizen dashboards!)
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspection_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_logs;

-- ====================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to track grievances
CREATE POLICY "Public can view complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Public can insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized can update complaints" ON public.complaints FOR UPDATE USING (true);

CREATE POLICY "Public view inspection" ON public.inspection_reports FOR SELECT USING (true);
CREATE POLICY "Insert inspection" ON public.inspection_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Public view work execution" ON public.work_executions FOR SELECT USING (true);
CREATE POLICY "Insert/Update work execution" ON public.work_executions FOR ALL USING (true);

CREATE POLICY "Public view verification" ON public.verification_logs FOR SELECT USING (true);
CREATE POLICY "Insert verification" ON public.verification_logs FOR INSERT WITH CHECK (true);
`;

  const REALTIME_REACT_SNIPPET = `// How to subscribe to Real-Time Updates in your React / Vercel App
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export function useLiveComplaints() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    // 1. Fetch initial records
    const fetchComplaints = async () => {
      const { data } = await supabase
        .from('complaints')
        .select(\`
          *,
          inspection_reports (*),
          work_executions (*),
          verification_logs (*)
        \`)
        .order('created_at', { ascending: false });
      if (data) setComplaints(data);
    };

    fetchComplaints();

    // 2. Listen to LIVE changes (INSERT, UPDATE, DELETE) in real-time
    const subscription = supabase
      .channel('realtime:complaints')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload) => {
          console.log('Realtime DB Event received:', payload);
          // Auto-refresh or update state live!
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return complaints;
}
`;

  const VERCEL_ENV_SNIPPET = `# Vercel Environment Variables (.env.local)
# Add these in your Vercel Project Settings -> Environment Variables

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional Service Role (Only if doing server-side operations via Next.js API routes)
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;

  const SAMPLE_QUERIES = `-- ====================================================================
-- USEFUL SUPABASE QUERIES FOR YOUR APP
-- ====================================================================

-- 1. Fetch all active cases with inspector & work report joined
SELECT 
    c.id,
    c.citizen_name,
    c.district,
    c.location_landmark,
    c.status,
    c.assigned_inspector,
    c.assigned_inspector_at,
    c.assigned_engineer,
    c.machinery_deployed,
    ir.waste_level AS inspected_waste_level,
    ir.tds_reading_ppm,
    we.cleared_metric_tons,
    we.after_photo_url
FROM complaints c
LEFT JOIN inspection_reports ir ON c.id = ir.complaint_id
LEFT JOIN work_executions we ON c.id = we.complaint_id
ORDER BY c.created_at DESC;

-- 2. State Admin: Count pending cases per district
SELECT 
    district,
    COUNT(*) AS total_cases,
    COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) AS resolved_cases,
    COUNT(CASE WHEN status != 'RESOLVED' THEN 1 END) AS pending_cases
FROM complaints
GROUP BY district
ORDER BY pending_cases DESC;

-- 3. Update complaint when Inspector is assigned:
UPDATE complaints
SET 
    assigned_inspector = 'Sri K. Rama Krishna',
    assigned_inspector_phone = '+91 94401 22334',
    assigned_inspector_at = NOW(),
    status = 'INSPECTOR_ASSIGNED'
WHERE id = 'CMP-AP-2026-403';
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Supabase + Vercel डेटाबेस एवं रियल-टाइम क्वेरी गाइड
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                  PostgreSQL Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                हाँ भाई! Supabase में टेबल बनाने और रियल-टाइम डेटा सिंक करने के लिए नीचे दी गई SQL रन करनी होगी।
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 bg-slate-50/70 flex gap-2 overflow-x-auto">
          {[
            { id: 'sql', label: '1. Supabase SQL Schema (DDL)', icon: Terminal, desc: 'Tables & Foreign Keys' },
            { id: 'realtime', label: '2. Real-time Subscription', icon: Radio, desc: 'Live WebSocket listener' },
            { id: 'env', label: '3. Vercel Env Setup', icon: Key, desc: '.env configuration' },
            { id: 'queries', label: '4. Useful API Queries', icon: Code2, desc: 'Joins & District stats' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white border-emerald-500 text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-black">
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
          
          {/* TAB 1: SQL SCHEMA */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-950 text-xs">
                    Supabase SQL Editor में यह स्क्रिप्ट चलाएं (Run Once in Supabase):
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    यह स्क्रिप्ट <code>complaints</code>, <code>inspection_reports</code>, <code>work_executions</code>, और <code>verification_logs</code> टेबल्स बनाएगी और रियल-टाइम पब्लिकेशन (WebSocket) ऑन करेगी ताकि Vercel पर डिप्लॉयड ऐप में तुरंत लाइव अपडेट दिखे।
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(SUPABASE_DDL_SCHEMA, 'ddl')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer text-xs"
                >
                  {copiedId === 'ddl' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'ddl' ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>supabase_schema.sql (PostgreSQL DDL)</span>
                  <span>Ready to Paste</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[350px] leading-relaxed text-emerald-400">
                  {SUPABASE_DDL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: REALTIME SUBSCRIPTION */}
          {activeTab === 'realtime' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-sky-950 text-xs">
                    Vercel Frontend में Supabase Realtime Listener (React Hook):
                  </h4>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    जैसे ही Nodal Officer इंस्पेक्टर असाइन करेगा या वर्कर फ़ोटो अपलोड करेगा, Supabase WebSocket द्वारा State Admin के पेज पर बिना रिफ्रेश किए लाइव डेटा बदल जाएगा!
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(REALTIME_REACT_SNIPPET, 'realtime')}
                  className="px-3 py-1.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer text-xs"
                >
                  {copiedId === 'realtime' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'realtime' ? 'Copied Code!' : 'Copy React Hook'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>useLiveComplaints.ts</span>
                  <span>TypeScript</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[350px] leading-relaxed text-sky-300">
                  {REALTIME_REACT_SNIPPET}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL ENV VARIABLES */}
          {activeTab === 'env' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950 text-xs">
                    Vercel Dashboard में Environment Variables सेट करें:
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Vercel project settings me <strong>Environment Variables</strong> tab me jakar <code>VITE_SUPABASE_URL</code> aur <code>VITE_SUPABASE_ANON_KEY</code> add kar dijiye.
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(VERCEL_ENV_SNIPPET, 'env')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer text-xs"
                >
                  {copiedId === 'env' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'env' ? 'Copied Env!' : 'Copy Env Config'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>.env.production</span>
                  <span>Key-Value</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[350px] leading-relaxed text-amber-300">
                  {VERCEL_ENV_SNIPPET}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLE QUERIES */}
          {activeTab === 'queries' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-purple-950 text-xs">
                    महत्वपूर्ण SQL Queries (Join & Workflow Updates):
                  </h4>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    State Admin dashboard me complaint ke sath inspector report aur worker completion proof ek sath lane ke liye niche di gayi queries ka prayog karein.
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(SAMPLE_QUERIES, 'queries')}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer text-xs"
                >
                  {copiedId === 'queries' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'queries' ? 'Copied Queries!' : 'Copy Queries'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px]">
                <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>queries.sql</span>
                  <span>SQL</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[350px] leading-relaxed text-purple-300">
                  {SAMPLE_QUERIES}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Supabase PostgreSQL + Vercel Serverless Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0077B6] text-white rounded-xl font-semibold hover:bg-[#03045E] cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
