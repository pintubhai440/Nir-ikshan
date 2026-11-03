import React, { useState } from 'react';
import { VerificationTaskItem, VerificationReadingMetric } from './types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Camera, 
  MapPin, 
  Lock, 
  Sparkles, 
  FileCheck, 
  RotateCcw, 
  Edit3, 
  ZoomIn, 
  Save, 
  UserCheck, 
  SlidersHorizontal 
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';

interface InspectorVerifyViewProps {
  inspector?: SupabaseFieldInspectorRow;
  tasks: VerificationTaskItem[];
  activeTaskId?: string;
  onSelectTask: (taskId: string) => void;
  onVerifySignOff: (taskId: string, observations: string) => void;
  onRejectRepair: (taskId: string, reason: string) => void;
  onNeedsReinspect: (taskId: string) => void;
}

export const InspectorVerifyView: React.FC<InspectorVerifyViewProps> = ({
  inspector,
  tasks,
  activeTaskId,
  onSelectTask,
  onVerifySignOff,
  onRejectRepair,
  onNeedsReinspect,
}) => {
  const selectedTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const inspectorName = inspector?.full_name || 'Inspector Smt. Pooja Reddy';

  // Editable inspection readings state
  const [readings, setReadings] = useState<VerificationReadingMetric[]>(
    selectedTask?.readings || []
  );
  const [observations, setObservations] = useState(
    selectedTask?.inspectorObservations || ''
  );
  const [isZoomSynced, setIsZoomSynced] = useState(true);
  const [simulateConflictGuard, setSimulateConflictGuard] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Update readings if selectedTask changes
  React.useEffect(() => {
    if (selectedTask) {
      setReadings(selectedTask.readings);
      setObservations(selectedTask.inspectorObservations);
      setSimulateConflictGuard(selectedTask.isSelfLoggedByCurrentUser);
    }
  }, [selectedTask?.id]);

  if (!selectedTask) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        No verification tasks currently pending.
      </div>
    );
  }

  const isLocked = simulateConflictGuard || selectedTask.isSelfLoggedByCurrentUser;

  const handleUpdateCheckValue = (index: number, val: string) => {
    setReadings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], inspectorCheckValue: val };
      return next;
    });
  };

  const handleSignOff = () => {
    if (isLocked) return;
    onVerifySignOff(selectedTask.id, observations);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleConfirmReject = () => {
    onRejectRepair(selectedTask.id, rejectReason || 'Defects found during physical verification. Work must be re-executed.');
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-5">
      {/* Statutory Header Protocol Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#0077B6]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold block">
                MANDATORY CIVIL PROTOCOL • Sec. 42A Public Water Works Act
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Statutory Verification Protocol
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Dual-Sign Audit Active</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The action worker who executed repairs cannot verify their own work. Critical priority issues{' '}
          <strong className="text-slate-900 font-semibold">
            MUST be physically inspected and certified by an independent inspector
          </strong>{' '}
          different from the one who logged the initial defect. Non-critical issues may be verified by the same inspector (tagged 'Same inspector').
        </p>
      </div>

      {/* Task Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              task.id === selectedTask.id
                ? 'bg-[#03045E] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{task.taskId}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                task.isSelfLoggedByCurrentUser
                  ? 'bg-rose-500/20 text-rose-200'
                  : 'bg-white/20 text-sky-100'
              }`}
            >
              {task.locationName.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Task Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        {/* Title & Statutory Separation Rule Status */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold bg-[#03045E] text-white px-2 py-0.5 rounded">
                Task #{selectedTask.taskId}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {selectedTask.priority}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Awaiting Physical Sign-off
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {selectedTask.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#0077B6]" />
              <span>{selectedTask.locationName}</span>
              <span className="font-mono text-slate-400">({selectedTask.assetCode})</span>
            </p>
          </div>

          {/* Statutory Separation Rule Satisfied Banner */}
          <div
            className={`p-3 rounded-xl border text-xs max-w-sm ${
              isLocked
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Statutory Conflict Detected</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Statutory Separation Rule Satisfied</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-tight">
              {isLocked
                ? `Logged by ${inspectorName} (Current User) → Statutory rule mandates independent inspector must verify.`
                : `Logged by ${selectedTask.originallyFlaggedBy} → Verification by ${inspectorName} (Independent)`}
            </p>
          </div>
        </div>

        {/* 4-Box Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Action Worker</span>
            <span className="font-bold text-slate-800 block mt-0.5">{selectedTask.actionWorkerName}</span>
            <span className="text-[11px] text-slate-500">{selectedTask.actionWorkerTeam}</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Work Execution Closed</span>
            <span className="font-bold text-slate-800 block mt-0.5">{selectedTask.workExecutionClosedDate}</span>
            <span className="text-[11px] text-slate-500">{selectedTask.executionDurationDays}-Day Run</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Catchment Basin</span>
            <span className="font-bold text-slate-800 block mt-0.5">{selectedTask.catchmentBasin}</span>
            <span className="text-[11px] text-slate-500">{selectedTask.subBasin}</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Inspector Present</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Pooja Reddy</span>
            </span>
            <span className="text-[11px] text-slate-500">GPS Lock • Accurate (±1.8m)</span>
          </div>
        </div>
      </div>

      {/* Photometric Dual-State Comparative Evidence (50/50 Audit Split) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#0077B6]" />
              <span>Photometric Dual-State Comparative Evidence</span>
            </h4>
            <span className="text-xs text-slate-400">Calibrated 50/50 Audit Split</span>
          </div>

          <button
            onClick={() => setIsZoomSynced(!isZoomSynced)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isZoomSynced
                ? 'bg-blue-50 text-[#0077B6] border border-blue-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Synchronize Zoom</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Before Fix */}
          <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-600 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>BEFORE FIX</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{selectedTask.beforeDate}</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-200 h-52 bg-slate-100">
              <img
                src={selectedTask.beforePhotoUrl}
                alt="Before Fix"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                Silt Level: {selectedTask.beforeSiltLevel}
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400">
                Logged by: {selectedTask.beforeInspectorId}
              </span>
              <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Initial Defect Assessment:</strong> "{selectedTask.beforeDefectNotes}"
              </p>
            </div>
          </div>

          {/* Right: After Repair */}
          <div className="space-y-2 border border-emerald-200 rounded-xl p-3 bg-emerald-50/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>AFTER REPAIR</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{selectedTask.afterDate}</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-emerald-300 h-52 bg-slate-100">
              <img
                src={selectedTask.afterPhotoUrl}
                alt="After Repair"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-emerald-900/80 text-emerald-100 text-[10px] font-mono px-2 py-0.5 rounded">
                Excavated: {selectedTask.afterExcavationCubicMeters}
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400">
                Executed by: {selectedTask.afterWorkerName}
              </span>
              <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Worker Closure Submission:</strong> "{selectedTask.afterWorkerClosureNotes}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Hydrological & Environmental Readings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Comparative Hydrological & Environmental Readings
            </h4>
            <p className="text-xs text-slate-400">
              Indicative Field Sensor Readings (Before vs After) — Readings are indicative and can change with rain and season.
            </p>
          </div>
        </div>

        {/* Metric Parameter Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Metric Parameter</th>
                <th className="py-2.5 px-3">Before Fix (14 Oct)</th>
                <th className="py-2.5 px-3">Worker Claim (19 Oct)</th>
                <th className="py-2.5 px-3">Inspector Field Check (Today)</th>
                <th className="py-2.5 px-3">Statutory Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {readings.map((reading, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {reading.parameter}
                  </td>
                  <td className={`py-3 px-3 font-mono ${reading.beforeStatusClass}`}>
                    {reading.beforeValue}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {reading.workerClaimValue}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={reading.inspectorCheckValue}
                        onChange={(e) => handleUpdateCheckValue(idx, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 w-28 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                      />
                      <Edit3 className="w-3 h-3 text-slate-400" />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{reading.complianceLabel}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observations Append Box */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700 block">
            Inspector Physical Inspection Observations (Optional Append)
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={2}
            placeholder="Record on-site findings: e.g. sluice spindle turn test completed, embankment compacted to standards..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          />
        </div>
      </div>

      {/* Statutory Conflict-Guard Simulator Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            STATUTORY CONFLICT-GUARD • Simulate Scenario
          </span>
          <p className="text-slate-600 max-w-xl">
            If this were a Critical Tier 1 defect originally logged by{' '}
            <strong className="text-slate-900 font-semibold">{inspectorName}</strong>, the system enforces lock:
            <br />
            <code className="text-slate-700 font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded mt-0.5 inline-block">
              "Critical issue: a different inspector must verify. Current user logged original defect." → Verify button permanently locked.
            </code>
          </p>
        </div>

        <button
          onClick={() => setSimulateConflictGuard(!simulateConflictGuard)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            simulateConflictGuard
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{simulateConflictGuard ? 'Self-Logged Lock Active' : 'Simulate Self-Logged Defect'}</span>
        </button>
      </div>

      {/* Bottom Inspector Sign-off Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <FileCheck className="w-4 h-4 text-[#0077B6]" />
          <span className="font-bold text-slate-800">Inspector Sign-off Bar</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Aadhaar e-Sign Ready</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Action 1: Reject Repair */}
          <button
            onClick={() => setIsRejectModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject Repair (Punch-list)</span>
          </button>

          {/* Action 2: Needs Re-inspection */}
          <button
            onClick={() => onNeedsReinspect(selectedTask.id)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Needs Re-inspection</span>
          </button>

          {/* Action 3: Verify & Certify Restoration */}
          <button
            disabled={isLocked}
            onClick={handleSignOff}
            className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 ${
              isLocked
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#03045E] hover:bg-[#0077B6] text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verify &amp; Certify Restoration</span>
          </button>
        </div>
      </div>

      {/* Reject Modal dialog */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-rose-600 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Issue Statutory Punch-list Rejection</span>
              </h4>
            </div>

            <p className="text-xs text-slate-600">
              State specific deficiencies observed on site that the Action Worker must rectify before re-submitting for sign-off:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Apron mortar thickness inadequate; left retaining wing wall still shows residual silt..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                Confirm Rejection &amp; Return to Worker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
