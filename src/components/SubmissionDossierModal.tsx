import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  GitBranch, 
  Camera, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Radio, 
  Cpu, 
  Globe, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { UserRoleType } from '../types/nirikshan';

interface SubmissionDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScreen: (role: UserRoleType) => void;
}

export const SubmissionDossierModal: React.FC<SubmissionDossierModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScreen
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'workflow' | 'screenshots'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const ARCHITECTURE_MERMAID = `flowchart TB
    subgraph ClientLayer["🖥️ Presentation & Client Geospatial Layer"]
        C1["Public Citizen Portal<br/>(GPS Geotag, Mobile Web, Hindi/Telugu/English)"]
        C2["Field Inspector App<br/>(TDS Sensor, Physical Verification, Geo-Proof)"]
        C3["Action Engineer Hub<br/>(Machinery Dispatch, Before/After Evidence)"]
        C4["26 District Nodal Hub<br/>(Section 10 Statutory Geofence, 9 Command Flashcards)"]
        C5["State Apex Dashboard<br/>(Macro Analytics, Inter-District Allocation)"]
    end

    subgraph CoreEngine["⚙️ Nir-ikshan Core Processing Engine"]
        E1["Role-Based Access Control (RBAC) & District Security Boundary"]
        E2["72-Hour Hydrological SLA & Escalation Engine"]
        E3["Water Body Geofence & Boundary Polygon Parser"]
        E4["Multi-Criteria Grievance Deduplication Engine"]
    end

    subgraph GeospatialGIS["🛰️ High-Resolution Geospatial Mapping Engine"]
        G1["Leaflet GIS Engine"]
        G2["Esri World Satellite High-Res Imagery Layer"]
        G3["Bhuvan ISRO Hydrological Vector Overlays"]
        G4["Interactive SVG Cadastral District Boundary Engine"]
    end

    subgraph TelemetryLayer["📡 State & National Live Telemetry Feeds"]
        T1["APWRIMS Real-time Reservoir Levels (TMC & Inflow)"]
        T2["IMD AWS Mandal-wise Rainfall Gauge Telemetry"]
        T3["CGWB / DWLR Groundwater Piezometer Telemetry (m bgl)"]
        T4["CWC River Basin Flood Alert & Gauge Stations"]
    end

    subgraph DataStorage["🗄️ Persistence & Cryptographic Audit Trail"]
        D1["Supabase PostgreSQL (Real-time Webhook & Subscription)"]
        D2["citizen_complaints (Status, GPS, SLA Timers)"]
        D3["water_bodies (Cadastral Khasra, Area Ha, Depletion)"]
        D4["action_audit_logs (Immutable Official Chain of Custody)"]
        D5["Local Storage Client Fallback (Zero-Data-Loss Offline Sync)"]
    end

    C1 & C2 & C3 & C4 & C5 --> E1
    E1 --> E2 & E3 & E4
    E3 --> G1
    G1 --> G2 & G3 & G4
    E2 & E4 --> D1
    D1 --> D2 & D3 & D4
    D1 -.-> D5
    T1 & T2 & T3 & T4 --> E2 & G1`;

  const WORKFLOW_MERMAID = `sequenceDiagram
    autonumber
    actor Citizen as 👤 Citizen / Local User
    participant Portal as 🌐 Nir-ikshan Portal
    participant Engine as ⚙️ SLA & Routing Engine
    actor Inspector as 🔍 Field Inspector
    actor Engineer as 🚜 Action Engineer
    actor Nodal as 🏛️ District Nodal Officer
    participant DB as 🗄️ Supabase Audit Ledger

    Citizen->>Portal: 1. Capture Photo + Live GPS Coordinates
    Portal->>Engine: 2. Submit Grievance (Encroachment/Sewage/Drying)
    Engine->>DB: 3. Create Ticket (Unique Token ID & 72-hr SLA Timer Starts)
    Engine->>Inspector: 4. Auto-route to Mandal Field Inspector (24h SLA)
    
    Note over Inspector: Physical Site Verification
    Inspector->>Portal: 5. Measure TDS (ppm), Mark Contamination & Upload Geo-photo
    Inspector->>Engine: 6. Submit Verified Inspection Report
    Engine->>Nodal: 7. Alert Nodal Officer & Trigger Engineer Work Order

    Note over Engineer: Remediation & Machinery Dispatch
    Engineer->>Portal: 8. Deploy Desilting/Earthmovers, Log Action Photos
    Engineer->>Engine: 9. Submit "Before vs After" Evidence

    Note over Nodal: Statutory Review & Approval
    Nodal->>Engine: 10. Audit Water Quality Index & Sign Off Resolution
    Engine->>DB: 11. Record Cryptographic Audit Log & Mark Redressed
    Engine->>Citizen: 12. Notify Citizen via Live Token & Portal Status Update`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
                Supporting Materials Dossier
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold">
                Submission Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Nir-ikshan Supporting Documentation</span>
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 font-medium mt-1">
              Complete submission package for System Architecture, Workflow Lifecycle, and Prototype Screenshots.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0"
            title="Close Dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation matching user's 3 checklist items */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 pt-3 flex gap-2 sm:gap-3 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-[#0077B6] text-[#0077B6] bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-[#0077B6]" />
            <span>1. System Architecture Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-[#0077B6] text-[#0077B6] bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4 text-[#0077B6]" />
            <span>2. Workflow Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('screenshots')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'screenshots'
                ? 'border-[#0077B6] text-[#0077B6] bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-[#0077B6]" />
            <span>3. Prototype Screenshots Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: SYSTEM ARCHITECTURE DIAGRAM */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 border border-blue-200/80 p-4 rounded-2xl">
                <div>
                  <h3 className="text-base font-extrabold text-[#03045E] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#0077B6]" />
                    <span>Multi-Tier High-Availability System Architecture</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    End-to-end architectural flow connecting 5 user roles, GIS engine, AP hydrological telemetry, and Supabase ledger.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(ARCHITECTURE_MERMAID, 'arch-mermaid')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {copiedKey === 'arch-mermaid' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'arch-mermaid' ? 'Copied Mermaid!' : 'Copy Mermaid Code'}</span>
                </button>
              </div>

              {/* Visual Architecture Representation */}
              <div className="space-y-4">
                
                {/* Layer 1: Client & User Interface */}
                <div className="border border-sky-200 bg-sky-50/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-600" />
                      Layer 1: Presentation & Role-Based Client Layer (React 19 + TypeScript + Tailwind)
                    </span>
                    <span className="text-[10px] font-bold bg-sky-200/60 text-sky-900 px-2 py-0.5 rounded-md">Client-Side SPA</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">1. Citizen Portal</div>
                      <div className="text-[11px] text-slate-500 mt-1">GPS geotagged complaints, photo uploads, OTP login, live ticket tracking.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">2. Field Inspector</div>
                      <div className="text-[11px] text-slate-500 mt-1">24h site verification, TDS/pH water testing, contamination categorization.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">3. Action Engineer</div>
                      <div className="text-[11px] text-slate-500 mt-1">Machinery dispatch, desilting earthmovers, before/after proof capture.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">4. 26 District Nodals</div>
                      <div className="text-[11px] text-slate-500 mt-1">Section 10 geofenced statutory isolation, 9 operational command flashcards.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">5. State Apex Admin</div>
                      <div className="text-[11px] text-slate-500 mt-1">Statewide executive water audit, inter-district resources, statutory PDF export.</div>
                    </div>
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="flex justify-center -my-2 text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Layer 2: Geospatial & Core Engine */}
                <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      Layer 2: Core Processing & Geospatial GIS Engine
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-md">Spatial & Business Logic</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                      <div className="text-xs font-bold text-indigo-950">🛰️ Leaflet & Esri Imagery Engine</div>
                      <div className="text-[11px] text-slate-500 mt-1">High-resolution satellite tiles, live cadastral polygon rendering, dynamic water body zoom.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                      <div className="text-xs font-bold text-indigo-950">⏱️ 72-Hour SLA Engine</div>
                      <div className="text-[11px] text-slate-500 mt-1">Automated statutory countdown, 24h inspector alert, escalation triggers to Nodal Officer.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                      <div className="text-xs font-bold text-indigo-950">🔍 AI Deduplication & Clustering</div>
                      <div className="text-[11px] text-slate-500 mt-1">Proximity-based complaint grouping within 100m radius to prevent duplicate spam.</div>
                    </div>
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="flex justify-center -my-2 text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Layer 3: External Telemetry & API Feeds */}
                <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-amber-600" />
                      Layer 3: Andhra Pradesh State Telemetry & IoT Sensor Feeds
                    </span>
                    <span className="text-[10px] font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-md">Live Sensors</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">APWRIMS Hydrology</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Reservoir storage in TMC, gross inflows/outflows, live percentage capacity.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">IMD AWS Rainfall</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Mandal-level 24h precipitation gauges, seasonal variance against normal.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">CGWB DWLR Piezometers</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Groundwater depth monitoring (meters below ground level) across 26 districts.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">Bhuvan ISRO WBIS</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Satellite water spread boundary verification and seasonal water surface extent.</div>
                    </div>
                  </div>
                </div>

                {/* Connecting Arrow */}
                <div className="flex justify-center -my-2 text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Layer 4: Persistence & Immutable Audit */}
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600" />
                      Layer 4: Supabase PostgreSQL Persistence & Cryptographic Audit Ledger
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md">Storage & Auditing</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">citizen_complaints</div>
                      <div className="text-[11px] text-slate-500 mt-1">Real-time status updates, SLA elapsed timestamps, GPS coordinates, photo links.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">water_bodies</div>
                      <div className="text-[11px] text-slate-500 mt-1">Cadastral survey numbers, Khasra records, notified water area, depletion index.</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">action_audit_logs</div>
                      <div className="text-[11px] text-slate-500 mt-1">Tamper-proof chronological trail of officer approvals, inspection data, and resolutions.</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Mermaid Raw Code Box */}
              <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                  <span className="font-mono text-sky-400 text-xs font-bold">architecture_diagram.mermaid</span>
                  <button
                    onClick={() => copyToClipboard(ARCHITECTURE_MERMAID, 'arch-code')}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === 'arch-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'arch-code' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300 max-h-48">
                  {ARCHITECTURE_MERMAID}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW DIAGRAM */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-2xl">
                <div>
                  <h3 className="text-base font-extrabold text-[#03045E] flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-emerald-600" />
                    <span>Statutory 4-Stage Grievance Redressal & Audit Workflow</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Clear chronological pipeline guaranteeing 72-hour redressal SLA from citizen complaint to verified field resolution.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(WORKFLOW_MERMAID, 'workflow-mermaid')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {copiedKey === 'workflow-mermaid' ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'workflow-mermaid' ? 'Copied Mermaid!' : 'Copy Mermaid Code'}</span>
                </button>
              </div>

              {/* 4-Stage Chronological Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Stage 1 */}
                <div className="bg-white border-2 border-sky-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl">
                    STAGE 01
                  </div>
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0077B6] flex items-center justify-center font-bold text-sm mb-3">
                      1
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Citizen Grievance Lodged</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Citizen captures water body issue via camera with mandatory GPS geotag. Portal verifies location inside AP boundaries and starts 72-hour statutory timer.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> SLA Starts: 00:00h
                    </span>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="bg-white border-2 border-indigo-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl">
                    STAGE 02
                  </div>
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
                      2
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">24h Field Inspection</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Mandal Field Inspector reaches physical spot, verifies cadastral boundaries, tests TDS/pH levels, logs waste type, and submits geo-tagged verification report.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Mandatory SLA: 24h
                    </span>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl">
                    STAGE 03
                  </div>
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
                      3
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Action Execution & Remediation</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Action Engineer deploys municipal earthmovers, desludging machinery, or encroachment fencing. Logs "Before vs After" proof and materials used.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Execution SLA: 48h
                    </span>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="bg-white border-2 border-emerald-400 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl">
                    STAGE 04
                  </div>
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
                      4
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Redressal Verified & Audit Logged</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      District Nodal Officer approves resolution, citizen gets instant status update via unique tracking token, and cryptographic log is permanently sealed in PostgreSQL.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Total SLA: 72h
                    </span>
                  </div>
                </div>

              </div>

              {/* Mermaid Workflow Code Box */}
              <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                  <span className="font-mono text-emerald-400 text-xs font-bold">workflow_sequence.mermaid</span>
                  <button
                    onClick={() => copyToClipboard(WORKFLOW_MERMAID, 'wf-code')}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === 'wf-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'wf-code' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300 max-h-48">
                  {WORKFLOW_MERMAID}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PROTOTYPE SCREENSHOTS GUIDE */}
          {activeTab === 'screenshots' && (
            <div className="space-y-6">
              <div className="bg-purple-50/60 border border-purple-200/80 p-4 rounded-2xl">
                <h3 className="text-base font-extrabold text-[#03045E] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span>Prototype Screenshots & Photographs Capture Guide</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Here are the 5 essential high-impact prototype screens you should take screenshots of for the hackathon submission form:
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Screen 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Screenshot 1</span>
                      <h4 className="font-bold text-slate-900 text-sm">State & National Water Surveillance Dashboard</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Shows the full interactive national/state map, AP reservoir telemetry (TMC capacity), IMD rainfall bars, and executive water health metrics.
                    </p>
                    <div className="text-[11px] text-[#0077B6] font-mono bg-blue-50 px-2 py-0.5 rounded inline-block">
                      Caption: "Real-time Andhra Pradesh Water Resources & Hydrological Telemetry Portal (Portal Home)"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToScreen('overview');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#03045E] hover:bg-[#0077B6] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Jump to Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Screen 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-emerald-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Screenshot 2</span>
                      <h4 className="font-bold text-slate-900 text-sm">District Nodal Satellite Command & Glowing Geofence</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      High-resolution satellite imagery with official district glowing boundary, clean telemetry dots, bottom-right telemetry legend, and 9 command flashcards.
                    </p>
                    <div className="text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded inline-block">
                      Caption: "High-Resolution District Satellite Map with Cadastral Geofencing and Section 10 Isolation"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToScreen('nodal_vizianagaram');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Jump to Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Screen 3 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-amber-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Screenshot 3</span>
                      <h4 className="font-bold text-slate-900 text-sm">Citizen Grievance Redressal & GPS Geotagging</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Citizen reporting portal with mobile OTP verification, geotagged evidence camera, category selection, and real-time SLA countdown clock.
                    </p>
                    <div className="text-[11px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded inline-block">
                      Caption: "Citizen Portal with Geotagged Complaint Lodging and Real-Time 72-Hour SLA Tracking"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToScreen('user');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Jump to Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Screen 4 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Screenshot 4</span>
                      <h4 className="font-bold text-slate-900 text-sm">Field Inspector On-Site Verification & Water Quality Lab</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Shows the inspector dashboard with TDS sensor ppm measurement, contamination level, multi-angle field photos, and statutory sign-off.
                    </p>
                    <div className="text-[11px] text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded inline-block">
                      Caption: "Field Inspector Verification Console with In-Situ TDS Testing & Encroachment Flagging"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToScreen('inspector');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Jump to Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Screen 5 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-cyan-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-100 text-cyan-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Screenshot 5</span>
                      <h4 className="font-bold text-slate-900 text-sm">Action Engineer Heavy Remediation & Work Order Execution</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Field engineering portal showing dispatched earthmovers, desludging excavators, before-and-after work proof, and resource expenditure.
                    </p>
                    <div className="text-[11px] text-cyan-700 font-mono bg-cyan-50 px-2 py-0.5 rounded inline-block">
                      Caption: "Action Worker & Engineering Execution Hub with Before/After Remediation Proof"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToScreen('engineer');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Jump to Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All 3 supporting materials are fully implemented and live in the Nir-ikshan portal.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
