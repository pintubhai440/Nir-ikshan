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
  SlidersHorizontal,
  Wrench,
  ArrowRight,
  Compass
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
  const inspectorName = inspector?.full_name || 'Field Inspector';

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
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
          <Wrench className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Ground Remediation In-Progress
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            No work orders are currently awaiting post-repair sign-off.
          </p>
        </div>

        {/* Statutory Governance Rule Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/90 to-sky-50/70 border border-blue-200 rounded-2xl text-left text-xs text-blue-950 space-y-3">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Statutory Governance Protocol: Re-Verification Lock</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-xs">
            Post-work physical verification is strictly locked until the assigned <strong>Action Worker (Engineer / Contractor)</strong> completes the ground physical repairs, uploads the <strong>After-Work Photo</strong>, and marks the task as complete in their terminal.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-blue-800 pt-1 border-t border-blue-200/60">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">1. Nodal Assigned ✓</span>
            <span>➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">2. Initial Check Done ✓</span>
            <span>➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse">3. Worker Action Active ⚙</span>
            <span>➔</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-300 font-semibold">4. Re-Verification (Here)</span>
          </div>
        </div>
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

      {/* 1. Verification Tasks Flashcards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800">
            Select Verification Case ({tasks.length} Active in Queue):
          </span>
          <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold">
            Sec. 42A Independent Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 w-full">
          {tasks.map((task) => {
            const isSelected = task.id === selectedTask.id;
            const nameWords = task.locationName.trim().split(/\s+/);
            const initials = nameWords.length > 1
              ? `${nameWords[0][0]}${nameWords[1][0]}`.toUpperCase()
              : task.locationName.slice(0, 2).toUpperCase();

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group p-4 sm:p-4.5 relative space-y-3 cursor-pointer ${
                  isSelected
                    ? 'border-[#0077B6] ring-2 ring-[#0077B6]/30 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Top accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#03045E] via-[#0077B6] to-sky-400'
                      : 'bg-slate-200 group-hover:bg-[#0077B6]'
                  }`}
                />

                {/* Header: Avatar + Badges + Title */}
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-start gap-3">
                    {/* Monogram Avatar */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs shrink-0 tracking-wider text-white ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#03045E] to-[#0077B6]'
                          : 'bg-gradient-to-br from-slate-700 to-slate-900'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {task.taskId}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200">
                          {task.priority.includes('Critical') ? 'Critical' : 'Level 2'}
                        </span>

                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#0077B6] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-auto flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0077B6] animate-pulse" />
                            <span>Active Case</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-[#0077B6] transition-colors mt-1.5 line-clamp-1">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#0077B6] shrink-0" />
                        <span className="truncate">{task.locationName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inset Specs Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-700 gap-2">
                    <span className="text-slate-500 flex items-center gap-1 shrink-0">
                      <UserCheck className="w-3 h-3 text-[#0077B6]" />
                      <span>Action Worker:</span>
                    </span>
                    <span className="font-bold text-slate-900 truncate text-right">
                      {task.actionWorkerName} ({task.actionWorkerTeam})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 gap-2 pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Closed Date:</span>
                    </span>
                    <span className="font-semibold text-slate-800 truncate text-right">
                      {task.workExecutionClosedDate} ({task.executionDurationDays}d Run)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 gap-2 pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500 flex items-center gap-1 shrink-0">
                      <Compass className="w-3 h-3 text-emerald-600" />
                      <span>Catchment Basin:</span>
                    </span>
                    <span className="font-semibold text-slate-800 truncate text-right">
                      {task.catchmentBasin}
                    </span>
                  </div>
                </div>

                {/* Dual Stat Tiles */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 block">
                      CIVIL REPAIR
                    </span>
                    <span className="text-base font-black text-amber-900 block leading-tight mt-0.5">
                      Completed
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block">
                      {task.afterExcavationCubicMeters || '350 m³ Cleared'}
                    </span>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 block">
                      DUAL-SIGN
                    </span>
                    <span className="text-base font-black text-emerald-600 block leading-tight mt-0.5">
                      Satisfied
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block">
                      Sec. 42A Law
                    </span>
                  </div>
                </div>

                {/* Footer Selection Button */}
                <div className="pt-1 mt-auto">
                  {isSelected ? (
                    <div className="w-full py-2.5 px-3 bg-[#0077B6] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-200" />
                      <span>Selected Active Protocol</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task.id);
                      }}
                      className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Select Case For Field Audit</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Statutory Rule Status Banner for Active Task */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isLocked
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`p-2 rounded-xl text-white shadow-2xs ${
              isLocked ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </span>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm">
              {isLocked
                ? 'Statutory Conflict Detected (Independent Audit Required)'
                : 'Statutory Separation Rule Satisfied (Civil Protocol Sec. 42A)'}
            </h4>
            <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
              {isLocked
                ? `Initial defect logged by ${selectedTask.originallyFlaggedBy} → Dual-sign rule mandates an independent inspector sign-off.`
                : `Work executed by ${selectedTask.actionWorkerName} (${selectedTask.actionWorkerTeam}) → Field inspection verification by ${inspectorName}`}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-200 text-emerald-900">
          GPS Lock ±1.8m
        </span>
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
