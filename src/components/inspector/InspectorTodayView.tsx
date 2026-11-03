/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Field Inspector Workstation - Schedule & Task View
 * Ultra-High-End Gov-Tech Interface: Executive Typography, High-Contrast Cards,
 * Precision Telemetry Badges, and One-Click Mission Triggers.
 */

import React, { useState } from 'react';
import { 
  ScheduledInspectionTask, 
  VerificationTaskItem,
  CompletedInspectionItem
} from './types';
import { CitizenComplaint } from '../../types/nirikshan';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Navigation, 
  FileCheck, 
  Droplet, 
  ExternalLink, 
  X,
  AlertCircle,
  Eye,
  Sparkles,
  Award,
  Activity,
  Layers,
  Wrench,
  Check
} from 'lucide-react';

import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';

interface InspectorTodayViewProps {
  inspector?: SupabaseFieldInspectorRow;
  scheduledTasks: ScheduledInspectionTask[];
  completedTasks?: CompletedInspectionItem[];
  verificationTasks: VerificationTaskItem[];
  complaints: CitizenComplaint[];
  onStartInspection: (task: ScheduledInspectionTask | CitizenComplaint) => void;
  onOpenVerifyTask: (task: VerificationTaskItem) => void;
  onSwitchToMap: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  queuedSyncCount: number;
}

export const InspectorTodayView: React.FC<InspectorTodayViewProps> = ({
  inspector,
  scheduledTasks,
  completedTasks = [],
  verificationTasks,
  complaints,
  onStartInspection,
  onOpenVerifyTask,
  onSwitchToMap,
}) => {
  const [activeCategory, setActiveCategory] = useState<'pending' | 'completed' | 'verify'>('pending');
  const [selectedCompletedDossier, setSelectedCompletedDossier] = useState<CompletedInspectionItem | null>(null);

  const pendingVerificationCount = verificationTasks.filter(
    (v) => v.status === 'PENDING_SIGN_OFF'
  ).length;

  return (
    <div className="space-y-6 w-full">
      {/* ============================================================== */}
      {/* 1. SLEEK SEGMENTED NAVIGATION BAR                              */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl p-1 bg-slate-100 border border-slate-200/80 text-xs font-bold gap-1 flex-wrap">
          <button
            onClick={() => setActiveCategory('pending')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'pending'
                ? 'bg-[#03045E] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-300" />
            <span>Pending Field Inspections</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-extrabold ${
                activeCategory === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {scheduledTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('completed')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'completed'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Completed Dossiers</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-extrabold ${
                activeCategory === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {completedTasks.length}
            </span>
          </button>

          {pendingVerificationCount > 0 && (
            <button
              onClick={() => setActiveCategory('verify')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === 'verify'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>Repair Sign-Off</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-200 text-amber-950 font-black">
                {pendingVerificationCount}
              </span>
            </button>
          )}
        </div>

        <button
          onClick={onSwitchToMap}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-all hover:border-sky-300 shadow-2xs ml-auto sm:ml-0"
        >
          <Navigation className="w-4 h-4 text-[#0077B6]" />
          <span>Open GIS Cadastral Map</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. ENGINEERING REPAIR CLEARANCE ALERT BANNER                    */}
      {/* ============================================================== */}
      {pendingVerificationCount > 0 && activeCategory === 'pending' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                  {pendingVerificationCount} Repair Completed: Action Crew Awaiting Sign-Off
                </h4>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Executive Engineer crew finished silt clearance and desilting. Conduct statutory physical verification to close work order.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (verificationTasks[0]) onOpenVerifyTask(verificationTasks[0]);
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <span>Verify &amp; Sign Off</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN TASKS CONTAINER                                        */}
      {/* ============================================================== */}
      <div className="space-y-5">
        {/* TAB 1: PENDING FIELD INSPECTIONS */}
        {activeCategory === 'pending' && (
          scheduledTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">
                No Pending Inspections in Your Queue
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                All grievance cases dispatched to your workstation by the District Nodal Officer have been inspected and sealed.
              </p>
            </div>
          ) : (
            scheduledTasks.map((task) => {
              return (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200/90 hover:border-sky-300 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all space-y-6 relative overflow-hidden"
                >
                  {/* Top Status & SLA Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Priority Dispatch (24h SLA Active)</span>
                      </span>

                      <span className="text-xs font-mono font-black bg-blue-50 text-[#0077B6] border border-blue-100 px-3 py-1 rounded-full">
                        {task.assetCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{task.distanceMeters ? `${(task.distanceMeters / 1000).toFixed(1)} km away` : '0.4 km away'}</span>
                    </div>
                  </div>

                  {/* Main Header & Title */}
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {task.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      Cadastral Parcel: <strong className="text-slate-800">{task.cadastralParcel}</strong> • Command Ayacut: <strong className="text-slate-800">{task.ayacutHectares} Hectares</strong>
                    </p>
                  </div>

                  {/* Grievance Summary Box */}
                  <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-slate-700 space-y-2 shadow-inner">
                    <span className="text-[11px] uppercase tracking-wider font-black text-[#03045E] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#0077B6]" />
                      <span>Citizen / Nodal Officer Grievance Summary:</span>
                    </span>
                    <p className="leading-relaxed font-medium">
                      {task.pastRecordSummary || 'Plastic bottles & domestic runoff choking the weir. Require on-site physical GPS verification and calibrated TDS water quality measurement.'}
                    </p>
                  </div>

                  {/* Protocol Action Badges */}
                  <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-sky-950 font-bold flex-wrap">
                      <Droplet className="w-4 h-4 text-[#0077B6]" />
                      <span>Physical Survey</span>
                      <span className="text-sky-300">•</span>
                      <span>4 Photo Angles</span>
                      <span className="text-sky-300">•</span>
                      <span>TDS &amp; pH Probes</span>
                      <span className="text-sky-300">•</span>
                      <span>Aadhaar Sign-off</span>
                    </div>
                    <span className="text-[10px] font-black text-[#0077B6] bg-white px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
                      6-Step Protocol
                    </span>
                  </div>

                  {/* Big Primary CTA with Glow */}
                  <button
                    onClick={() => onStartInspection(task)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] hover:from-[#023E8A] hover:to-[#0096C7] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-98"
                  >
                    <span>Start Physical Inspection</span>
                    <ArrowRight className="w-5 h-5 text-sky-200" />
                  </button>
                </div>
              );
            })
          )
        )}

        {/* TAB 2: COMPLETED SEALED DOSSIERS */}
        {activeCategory === 'completed' && (
          completedTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-black text-slate-900 text-lg">No Completed Inspections Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Open the "Pending Field Inspections" tab to start your physical surveys and submit inspection dossiers.
              </p>
            </div>
          ) : (
            completedTasks.map((item) => {
              // Ensure proper title casing for display
              const formattedName = item.name
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');

              return (
                <div
                  key={item.id}
                  className="bg-white border border-emerald-200 hover:border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Statutory Inspection Completed &amp; Sealed</span>
                      </span>
                      <span className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-full font-bold">
                        {item.assetCode}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">
                      Inspected on: {new Date(item.inspectedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 text-xl tracking-tight">{formattedName}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.cadastralParcel || `${item.district} • Mandal: ${item.mandal}`}
                      </p>
                    </div>

                    {/* Precision Laboratory Readings */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center shadow-inner">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Recorded TDS</span>
                        <span className="text-base font-black text-[#0077B6] font-mono block mt-0.5">{item.tdsReadingPpm} mg/L</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Water Level</span>
                        <span className="text-base font-black text-emerald-700 block mt-0.5">{item.waterPresence}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Waste Type</span>
                        <span className="text-base font-black text-slate-800 truncate max-w-[130px] inline-block mt-0.5">{item.wasteType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-xs text-slate-700 space-y-1 shadow-2xs">
                    <span className="font-black text-[#03045E] block uppercase tracking-wider text-[10px]">
                      Field Findings &amp; Observations:
                    </span>
                    <p className="leading-relaxed font-medium">{item.validationRemarks}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Aadhaar e-Signed by {item.inspectorName}</span>
                    </span>

                    <button
                      onClick={() => setSelectedCompletedDossier(item)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>View Official Signed Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}

        {/* TAB 3: REPAIR VERIFICATIONS */}
        {activeCategory === 'verify' && (
          <div className="space-y-4">
            {verificationTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-amber-200 hover:border-amber-300 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Worker Repair Completed — Sign-Off Required</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-0.5 rounded-full">
                    {task.taskId}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">{task.locationName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{task.catchmentBasin} • Worker: {task.actionWorkerName}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1 shadow-inner">
                  <strong className="block text-slate-900 font-black uppercase text-[10px] tracking-wider">Worker Remediation Report:</strong>
                  <p className="leading-relaxed">{task.afterWorkerClosureNotes || 'Excavation and debris clearing completed. Water gradient restored.'}</p>
                </div>

                <button
                  onClick={() => onOpenVerifyTask(task)}
                  className="w-full py-3.5 bg-[#03045E] hover:bg-[#0077B6] text-white text-xs font-black rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Open Verification Protocol &amp; Certify Resolution</span>
                  <ArrowRight className="w-4 h-4 text-sky-200" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. OFFICIAL SEALED DOSSIER PREVIEW MODAL                       */}
      {/* ============================================================== */}
      {selectedCompletedDossier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    Official Statutory Inspection Dossier
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    Gov. of AP • Minor Irrigation Department
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompletedDossier(null)}
                className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Water Body / Asset</span>
                <h5 className="font-black text-slate-900 text-base">{selectedCompletedDossier.name}</h5>
                <p className="text-slate-500 font-mono text-xs">{selectedCompletedDossier.cadastralParcel || `${selectedCompletedDossier.district} • Mandal: ${selectedCompletedDossier.mandal}`}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">Recorded TDS</span>
                  <span className="text-xl font-black text-blue-950 font-mono mt-0.5 block">{selectedCompletedDossier.tdsReadingPpm} mg/L</span>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Water Presence</span>
                  <span className="text-xl font-black text-emerald-950 mt-0.5 block">{selectedCompletedDossier.waterPresence}</span>
                </div>
              </div>

              {selectedCompletedDossier.sitePhotoUrl && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">EXIF Geo-Tagged On-Site Evidence</span>
                  <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                    <img
                      src={selectedCompletedDossier.sitePhotoUrl}
                      alt="Site Evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-xl">
                      GPS: {selectedCompletedDossier.coordinates?.lat.toFixed(4)}° N, {selectedCompletedDossier.coordinates?.lng.toFixed(4)}° E
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-black text-slate-800 block text-[10px] uppercase tracking-wider">Inspector Validation Findings:</span>
                <p className="text-slate-600 leading-relaxed font-medium">{selectedCompletedDossier.validationRemarks}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider block">UIDAI Aadhaar e-Sign</span>
                  <span className="font-black text-emerald-950 text-sm">{selectedCompletedDossier.inspectorName}</span>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                  ✓ Statutory Sealed
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCompletedDossier(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl cursor-pointer transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
