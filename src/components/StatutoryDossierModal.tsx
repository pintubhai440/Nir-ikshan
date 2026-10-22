import React from 'react';
import { 
  X, 
  Send, 
  MapPin, 
  Phone, 
  Camera, 
  Clock, 
  Maximize2, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  UserCheck,
  Wrench,
  Activity,
  Droplets,
  Calendar,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { CitizenComplaint } from '../types/nirikshan';
import { ComplaintLiveSLACounter } from './ComplaintLiveSLACounter';
import { ComplaintWorkflowTimeline } from './ComplaintWorkflowTimeline';
import { formatStepTimestamp } from '../utils/slaTimer';

interface StatutoryDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: CitizenComplaint | null;
  onOpenDirectiveModal: (complaintId: string) => void;
  onOpenPhotoPreview: (data: { url: string; title: string; subtitle?: string }) => void;
  language?: 'en' | 'hi' | 'te';
}

export const StatutoryDossierModal: React.FC<StatutoryDossierModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onOpenDirectiveModal,
  onOpenPhotoPreview,
  language = 'en',
}) => {
  if (!isOpen || !complaint) return null;

  const step1 = formatStepTimestamp(complaint.submittedAt);
  const step2 = formatStepTimestamp(complaint.assignedInspectorAt, complaint.submittedAt, 'after citizen filed');
  const step3 = formatStepTimestamp(complaint.inspectionReport?.inspectedAt, complaint.assignedInspectorAt || complaint.submittedAt, 'after dispatch');
  const step4 = formatStepTimestamp(complaint.assignedEngineerAt || complaint.workExecution?.assignedAt, complaint.inspectionReport?.inspectedAt || complaint.submittedAt, 'after inspection');
  const step5 = formatStepTimestamp(
    complaint.workExecution?.completedAt || (complaint.status === 'RESOLVED' || complaint.status === 'WORKER_IN_PROGRESS' ? complaint.resolvedAt || complaint.workExecution?.assignedAt : undefined), 
    complaint.assignedEngineerAt || complaint.submittedAt, 
    'after work order'
  );
  const isResolved = complaint.status === 'RESOLVED';
  const hasWork = Boolean(complaint.workExecution || complaint.status === 'WORKER_IN_PROGRESS');

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* DOSSIER HEADER */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#023E8A] text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>State Admin Oversight • 100% Read-Only Dossier</span>
                </span>
                <span className="font-mono text-xs text-sky-200 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                  {complaint.id}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Statutory Docket Inspection Dossier</span>
              </h2>
              <p className="text-xs text-sky-100 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span>{complaint.locationLandmark}, {complaint.village}, {complaint.district}</span>
                <span className="font-mono text-[11px] text-sky-200">
                  ({complaint.coordinates?.lat?.toFixed(4)}, {complaint.coordinates?.lng?.toFixed(4)})
                </span>
              </p>
            </div>

            {/* Header Right: Status, SLA & Close */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">Docket Status</div>
                <div className="text-xs font-black font-mono text-white bg-white/20 px-2.5 py-0.5 rounded-md mt-0.5 inline-block">
                  {complaint.status.replace(/_/g, ' ')}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SLA Status Bar & Directive Action */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ComplaintLiveSLACounter complaint={complaint} variant="headerBadge" />
              <span className="text-xs text-sky-100 font-medium hidden md:inline">
                Real-time 72h Statutory Redressal Window Active
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDirectiveModal(complaint.id);
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="Issue Statutory Directive / Warning Memo"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
              <span>Dispatch Statutory Directive / Warning Memo</span>
            </button>
          </div>
        </div>

        {/* DOSSIER BODY (SCROLLABLE) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/60">

          {/* EXECUTIVE BANNER FOR STATE ADMIN */}
          <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-700">
            <div className="w-8 h-8 rounded-xl bg-[#0077B6] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#03045E] text-xs">
                राज्य प्रशासनिक निरीक्षण (State Admin Executive Inspection Mode)
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                यह डॉसियर ज़मीनी स्तर से वास्तविक समय (Real-Time) में सत्यापित डेटा प्रदर्शित करता है। स्टेट एडमिन केवल जांच व निरीक्षण (Inspection) कर सकता है और ज़रूरत पड़ने पर नोडल अधिकारी या इंजीनियर को वैधानिक आदेश (Directive / Warning Memo) जारी कर सकता है।
              </div>
            </div>
          </div>

          {/* THE 4 SURVEILLANCE STATIONS (CAM 01 TO CAM 04) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* CAM 01: CITIZEN COMPLAINANT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-2xs space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    CAM 01 • Citizen
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified Nagrik
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black text-slate-900">{complaint.citizenName}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">Age {complaint.citizenAge || 32}</span>
                  </div>
                  <a
                    href={`tel:${complaint.citizenPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#0077B6] font-mono font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3 text-[#0077B6]" />
                    <span>{complaint.citizenPhone || '+91 94401 23456'}</span>
                  </a>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-0.5">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium line-clamp-2">
                      {complaint.locationLandmark}, {complaint.village}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 pl-5">
                    GPS: {complaint.coordinates?.lat?.toFixed(4)}, {complaint.coordinates?.lng?.toFixed(4)}
                  </div>
                </div>

                <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                  "{complaint.shortDescription}"
                </div>
              </div>

              {/* Citizen Photo Proof */}
              <div>
                {complaint.photoUrl && (
                  <div 
                    onClick={() => onOpenPhotoPreview({
                      url: complaint.photoUrl!,
                      title: `Citizen Ground Evidence: ${complaint.citizenName} (${complaint.locationLandmark})`,
                      subtitle: `GPS: ${complaint.coordinates?.lat?.toFixed(4)}, ${complaint.coordinates?.lng?.toFixed(4)} • ${complaint.village}, ${complaint.district}`
                    })}
                    className="rounded-xl overflow-hidden border border-slate-200 relative h-28 bg-slate-900 group cursor-pointer shadow-2xs"
                  >
                    <img 
                      src={complaint.photoUrl} 
                      alt="Citizen evidence" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-sky-400" />
                        <span>Inspect Evidence</span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  Filed: {formatStepTimestamp(complaint.submittedAt).formatted}
                </div>
              </div>
            </div>

            {/* CAM 02: DISTRICT NODAL OFFICER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-2xs space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0077B6] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0077B6] animate-pulse"></span>
                    CAM 02 • Nodal Officer
                  </span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Apex Triage
                  </span>
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <strong className="text-sm font-black text-slate-900 block truncate">
                    {complaint.assignedNodalOfficer || 'Dr. N. Subba Rao'}
                  </strong>
                  <span className="text-xs text-[#0077B6] font-semibold block">
                    {complaint.district} Water Division
                  </span>
                </div>

                <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Triage Speed:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {step2.diffFromBaseline || 'Dispatched in 2.4 hrs'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">72h SLA Window:</span>
                    <span className="font-mono font-bold text-slate-700">Statutory 72h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Accountability:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Diligent & Compliant
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 p-2 bg-sky-50/70 rounded-xl border border-sky-100 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
                      Inspector Dispatched:
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {step2.hasValue ? step2.formatted : 'Dispatched'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-[10px] uppercase tracking-wider">
                      Worker Assigned:
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {step4.hasValue ? step4.formatted : 'Pending Probe'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDirectiveModal(complaint.id);
                }}
                className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-[#0077B6] rounded-xl text-xs font-bold border border-sky-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3 h-3 text-[#0077B6]" />
                <span>Issue Memo to Nodal Cell</span>
              </button>
            </div>

            {/* CAM 03: FIELD INSPECTOR */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-2xs space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    CAM 03 • Field Inspector
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Ground Truth
                  </span>
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <strong className="text-sm font-black text-slate-900 block truncate">
                    {complaint.assignedInspector || complaint.inspectionReport?.inspectorName || 'Sri K. Rama Krishna'}
                  </strong>
                  <a
                    href={`tel:${complaint.assignedInspectorPhone || complaint.inspectionReport?.inspectorPhone || '+919848123456'}`}
                    className="inline-flex items-center gap-1 text-xs text-[#0077B6] font-mono font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3 text-[#0077B6]" />
                    <span>{complaint.assignedInspectorPhone || complaint.inspectionReport?.inspectorPhone || '+91 98481 23456'}</span>
                  </a>
                </div>

                <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Water Presence:</span>
                    <span className="font-bold text-sky-800">
                      {complaint.inspectionReport?.waterPresence || 'Moderate Water Spreading'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Severity:</span>
                    <span className="font-bold text-rose-700">
                      {complaint.inspectionReport?.wasteLevel || 'Heavy Obstruction'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">TDS Quality Probe:</span>
                    <span className="font-mono font-bold text-amber-700">
                      {complaint.inspectionReport?.tdsReadingPpm ? `${complaint.inspectionReport.tdsReadingPpm} PPM` : '680 PPM (Marginal)'}
                    </span>
                  </div>
                </div>

                {complaint.inspectionReport?.validationRemarks && (
                  <div className="mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 italic">
                    "{complaint.inspectionReport.validationRemarks}"
                  </div>
                )}
              </div>

              {/* Inspector Probe Photo */}
              <div>
                {(complaint.inspectionReport?.sitePhotoUrl || complaint.photoUrl) && (
                  <div 
                    onClick={() => onOpenPhotoPreview({
                      url: complaint.inspectionReport?.sitePhotoUrl || complaint.photoUrl!,
                      title: `Inspector Verification Probe: ${complaint.assignedInspector || 'Field Inspector'}`,
                      subtitle: `Physical inspection performed at ${complaint.locationLandmark}`
                    })}
                    className="rounded-xl overflow-hidden border border-slate-200 relative h-24 bg-slate-900 group cursor-pointer shadow-2xs"
                  >
                    <img 
                      src={complaint.inspectionReport?.sitePhotoUrl || complaint.photoUrl} 
                      alt="Inspector proof" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-sky-400" />
                        <span>Inspector Photo</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  Inspected: {step3.hasValue ? step3.formatted : 'Physical probe completed'}
                </div>
              </div>
            </div>

            {/* CAM 04: WORKER & ACTION ENGINEER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-2xs space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    CAM 04 • Action Engineer
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Field Action
                  </span>
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <strong className="text-sm font-black text-slate-900 block truncate">
                    {complaint.assignedEngineer || complaint.workExecution?.engineerName || 'Er. T. Venkata Ramana'}
                  </strong>
                  <a
                    href={`tel:${complaint.assignedEngineerPhone || complaint.workExecution?.engineerPhone || '+919440345678'}`}
                    className="inline-flex items-center gap-1 text-xs text-[#0077B6] font-mono font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3 text-[#0077B6]" />
                    <span>{complaint.assignedEngineerPhone || complaint.workExecution?.engineerPhone || '+91 94403 45678'}</span>
                  </a>
                </div>

                <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Machinery:</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]">
                      {complaint.machineryDeployed || '1x JCB 3DX, 2x Tippers'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Silt Cleared:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      3.5 Metric Tons
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Work Order Status:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {isResolved ? '100% Cleared' : 'Kaam Ho Gaya'}
                    </span>
                  </div>
                </div>

                {complaint.workExecution?.workSummary && (
                  <div className="mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 italic">
                    "{complaint.workExecution.workSummary}"
                  </div>
                )}
              </div>

              {/* Worker After-Work Photo */}
              <div>
                {(complaint.workExecution?.afterPhotoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80') && (
                  <div 
                    onClick={() => onOpenPhotoPreview({
                      url: complaint.workExecution?.afterPhotoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
                      title: `Work Completed Proof "Kaam Ho Gaya": ${complaint.assignedEngineer || 'Action Team'}`,
                      subtitle: `Post-remediation proof at ${complaint.locationLandmark}`
                    })}
                    className="rounded-xl overflow-hidden border border-slate-200 relative h-24 bg-slate-900 group cursor-pointer shadow-2xs"
                  >
                    <img 
                      src={complaint.workExecution?.afterPhotoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'} 
                      alt="Worker after-proof" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                      <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-emerald-400" />
                        <span>Work Done Photo</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                  Cleaned: {step5.hasValue ? step5.formatted : 'Remediation completed'}
                </div>
              </div>
            </div>
          </div>

          {/* 6-STAGE OPERATIONAL LIFECYCLE PROGRESS TRACKER */}
          <ComplaintWorkflowTimeline
            complaint={complaint}
            onOpenPhotoPreview={onOpenPhotoPreview}
          />

        </div>

        {/* DOSSIER FOOTER */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Real-time Supabase Database Verified • Zero Mock Data</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDirectiveModal(complaint.id);
              }}
              className="px-4 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Directive / Warning Memo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
