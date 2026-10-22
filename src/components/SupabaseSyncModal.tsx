import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Terminal, 
  RefreshCw,
  Key,
  Radio,
  Sparkles,
  Link2,
  Trash2,
  Layers,
  Activity
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  getStoredSupabaseConfig, 
  getEffectiveSupabaseConfig,
  setSupabaseCredentials, 
  clearSupabaseCredentials 
} from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

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
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'schema' | 'guide'>('connect');

  const config = getEffectiveSupabaseConfig();
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState(config.key || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [liveCounts, setLiveCounts] = useState<{ complaints: number; inspectors: number; workers: number } | null>(null);

  const isConnected = isSupabaseConfigured();

  useEffect(() => {
    if (isOpen) {
      const current = getEffectiveSupabaseConfig();
      setInputUrl(current.url || '');
      setInputKey(current.key || '');
      setStatusMessage(null);
    }
  }, [isOpen]);

  const sampleSqlSnippet = `-- ====================================================================
-- NIR-IKSHAN COMPLAINTS & REAL-TIME CADRE SCHEMA FOR SUPABASE
-- Run this in Supabase Dashboard -> SQL Editor (https://supabase.com)
-- ====================================================================

-- 1. Citizen Complaints Master Table
CREATE TABLE IF NOT EXISTS public.citizen_complaints (
  id TEXT PRIMARY KEY,
  citizen_name TEXT NOT NULL DEFAULT 'Verified Citizen',
  citizen_age INTEGER DEFAULT 30,
  citizen_gender TEXT DEFAULT 'Other',
  citizen_phone TEXT,
  state TEXT NOT NULL DEFAULT 'Andhra Pradesh',
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

-- 2. Field Inspectors Table
CREATE TABLE IF NOT EXISTS public.field_inspectors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  inspector_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  mandal TEXT,
  nodal_officer_id TEXT,
  languages TEXT DEFAULT 'Telugu/English',
  status TEXT DEFAULT 'Active',
  meter_id TEXT,
  open_inspections INTEGER DEFAULT 0,
  overdue_inspections INTEGER DEFAULT 0,
  joined_on DATE DEFAULT CURRENT_DATE
);

-- 3. Action Remediation Workers Table
CREATE TABLE IF NOT EXISTS public.action_workers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  worker_id TEXT UNIQUE NOT NULL,
  name_or_crew_type TEXT NOT NULL,
  type TEXT DEFAULT 'Crew',
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT DEFAULT 'waste cleaning/desilting',
  service_areas TEXT,
  district TEXT NOT NULL,
  nodal_officer_id TEXT,
  availability TEXT DEFAULT 'Available',
  languages TEXT DEFAULT 'Telugu/English',
  status TEXT DEFAULT 'Active',
  open_tasks INTEGER DEFAULT 0,
  tasks_declined INTEGER DEFAULT 0,
  no_response INTEGER DEFAULT 0,
  added_on DATE DEFAULT CURRENT_DATE
);

-- 4. Enable Row Level Security (RLS) & Allow Live Access
ALTER TABLE public.citizen_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_inspectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select complaints" ON public.citizen_complaints FOR SELECT USING (true);
CREATE POLICY "Allow public insert complaints" ON public.citizen_complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update complaints" ON public.citizen_complaints FOR UPDATE USING (true);

CREATE POLICY "Allow public select inspectors" ON public.field_inspectors FOR SELECT USING (true);
CREATE POLICY "Allow public insert inspectors" ON public.field_inspectors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update inspectors" ON public.field_inspectors FOR UPDATE USING (true);

CREATE POLICY "Allow public select workers" ON public.action_workers FOR SELECT USING (true);
CREATE POLICY "Allow public insert workers" ON public.action_workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update workers" ON public.action_workers FOR UPDATE USING (true);

-- 5. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.field_inspectors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_workers;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Connecting to Supabase and verifying tables...' });

    try {
      const res = await setSupabaseCredentials(inputUrl, inputKey);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        if (res.counts) {
          setLiveCounts(res.counts);
        }
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Connection test failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setInputUrl('');
    setInputKey('');
    setLiveCounts(null);
    setStatusMessage({ type: 'info', text: 'Credentials removed from this browser session.' });
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-emerald-700 text-white p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs text-white border border-white/20 shadow-xs">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  {language === 'hi' ? 'लाइव सुपाबेस डेटाबेस कंसोल' : language === 'te' ? 'లైవ్ సుపాబేస్ డేటాబేస్ కన్సోల్' : 'Live Supabase Database Console'}
                </h3>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isConnected 
                    ? 'bg-emerald-400/25 text-emerald-100 border border-emerald-300/40 shadow-xs' 
                    : 'bg-amber-400/25 text-amber-100 border border-amber-300/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {isConnected 
                    ? (language === 'hi' ? '100% लाइव कनेक्टेड' : language === 'te' ? 'లైవ్ కనెక్ట్ చేయబడింది' : '100% LIVE CONNECTED') 
                    : (language === 'hi' ? 'कॉन्फिग आवश्यक' : language === 'te' ? 'కాన్ఫిగ్ అవసరం' : 'CONFIG REQUIRED')}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5 font-medium">
                {language === 'hi' 
                  ? 'शून्य फेक डेटा • सीधा पोस्टग्रेसक्यूएल लाइव डेटा सिंक' 
                  : language === 'te' 
                  ? 'సున్నా ఫేక్ డేటా • పోస్ట్‌గ్రేస్ లైవ్ డేటా సింక్' 
                  : 'Zero Fake Data • Direct PostgreSQL Live Telemetry Stream'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-white text-[#0077B6] border-t-2 border-[#0077B6] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'लाइव कनेक्शन' : language === 'te' ? 'లైవ్ కనెక్షన్' : 'Live Connection'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-white text-[#0077B6] border-t-2 border-[#0077B6] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'SQL स्कीमा' : language === 'te' ? 'SQL స్కీమా' : 'SQL Schema'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-white text-[#0077B6] border-t-2 border-[#0077B6] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'गाइड' : language === 'te' ? 'గైడ్' : 'Vercel Guide'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-700 text-xs sm:text-sm">
          
          {/* TAB 1: CONNECT */}
          {activeTab === 'connect' && (
            <div className="space-y-4">
              {/* Status Box */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                isConnected 
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-2xs' 
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-sm">
                      {isConnected 
                        ? (language === 'hi' ? 'लाइव सुपाबेस डेटाबेस सक्रिय एवं समन्वित' : 'Live Supabase Database Active & Synchronized') 
                        : (language === 'hi' ? 'सुपाबेस क्रेडेंशियल दर्ज करें' : 'Enter Your Live Supabase Credentials')}
                    </p>
                    {isConnected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-200/60 text-emerald-800 font-bold">
                        RT-DAS ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {isConnected 
                      ? (language === 'hi'
                          ? `आपका पोर्टल सीधे आपके सुपाबेस प्रोजेक्ट से जुड़ा हुआ है। दर्ज की गई कोई भी शिकायत, फील्ड इंस्पेक्टर और एक्शन वर्कर सीधे क्लाउड पर स्टोर होते हैं। कुल सक्रिय शिकायतें: ${complaintCount}`
                          : `Connected live to your Supabase PostgreSQL tables. All grievances, field inspectors, and action crews are read directly from and saved to the cloud. Total active records: ${complaintCount}`)
                      : (language === 'hi'
                          ? 'अपने वर्सेल या सुपाबेस प्रोजेक्ट का URL और Anon Key यहाँ डालें। यह तुरंत आपके लाइव डेटा को फेच कर लेगा और कोई फेक डेटा नहीं दिखेगा।'
                          : 'Paste your Supabase Project URL and Anon Key below to establish a direct live connection to your PostgreSQL database. Zero fake or mocked data.')}
                  </p>

                  {liveCounts && (
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-200/70 text-center">
                      <div className="p-1.5 rounded-lg bg-white/70">
                        <span className="text-[10px] text-slate-500 block">Complaints</span>
                        <span className="text-xs font-bold text-emerald-700">{liveCounts.complaints}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/70">
                        <span className="text-[10px] text-slate-500 block">Inspectors</span>
                        <span className="text-xs font-bold text-purple-700">{liveCounts.inspectors}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/70">
                        <span className="text-[10px] text-slate-500 block">Action Workers</span>
                        <span className="text-xs font-bold text-sky-700">{liveCounts.workers}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toast */}
              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  statusMessage.type === 'error' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  'bg-sky-100 text-[#0077B6] border border-sky-300'
                }`}>
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleConnect} className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{language === 'hi' ? 'सुपाबेस प्रोजेक्ट URL (VITE_SUPABASE_URL)' : 'Supabase Project URL (VITE_SUPABASE_URL)'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. https://your-project.supabase.co</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://xyzcompany.supabase.co"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077B6] shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{language === 'hi' ? 'सुपाबेस एनॉन की (VITE_SUPABASE_ANON_KEY)' : 'Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY)'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Starts with eyJhbGciOi...</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077B6] shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'डिस्कनेक्ट करें' : 'Disconnect'}</span>
                    </button>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>
                      {isSubmitting 
                        ? (language === 'hi' ? 'कनेक्ट हो रहा है...' : 'Connecting...') 
                        : (language === 'hi' ? 'कनेक्ट एवं लाइव डेटा सिंक करें' : 'Connect & Sync Live Data')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between gap-3">
                <span className="text-xs text-sky-900 font-medium">
                  {language === 'hi' 
                    ? 'यदि आपने अभी तक सुपाबेस में टेबल नहीं बनाई हैं, तो यह SQL स्क्रिप्ट Supabase SQL Editor में चलाएं:' 
                    : 'Execute this SQL script once in your Supabase SQL Editor to provision complaints and personnel tables:'}
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-[10px] overflow-x-auto max-h-[320px] leading-relaxed">
                {sampleSqlSnippet}
              </pre>
            </div>
          )}

          {/* TAB 3: GUIDE */}
          {activeTab === 'guide' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How to Connect Supabase to Vercel (3 Steps):</span>
              </h4>

              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
                <li>
                  <span className="font-bold text-slate-800">Create Free Supabase Project:</span> Go to{' '}
                  <a 
                    href="https://supabase.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#0077B6] font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and click <em>New Project</em>.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Run Table Schema SQL:</span> In Supabase, open{' '}
                  <strong>SQL Editor</strong>, paste the schema from the SQL Schema tab, and click <strong>Run</strong>.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Add 2 Keys in Vercel:</span> Go to Vercel Project &gt; Settings &gt; Environment Variables and add:
                  <div className="mt-1.5 p-2 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-xl select-all space-y-1">
                    <div>VITE_SUPABASE_URL = https://your-project.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</div>
                  </div>
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>APWRIMS Live Telemetry Stream Active</span>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={() => {
                  onRefresh();
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'लाइव रिफ्रेश' : 'Refresh Telemetry'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              {language === 'hi' ? 'पूर्ण' : 'Done'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
