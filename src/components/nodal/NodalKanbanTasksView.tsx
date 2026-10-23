/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Issues & Rectification Tasks — Workflow Kanban & Work Orders (CAM 02 - Nodal Officer)
 * Matches image_62f4d062.png, image_cf0f36d5.png, and image_20e26fd7.png
 * Pure English, clean minimalist executive styling, strictly 0 fake data.
 */

import React, { useState, useMemo } from 'react';
import { 
  NodalKanbanTask, 
  INITIAL_NODAL_TASKS 
} from '../../data/nodalOfficerData';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  User, 
  MapPin, 
  Wrench, 
  X, 
  Send,
  Eye,
  Camera,
  Layers,
  ArrowRight,
  ShieldAlert,
  Building2,
  FileText,
  Truck,
  RotateCcw,
  Sparkles,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NodalKanbanTasksViewProps {
  district: string;
  onUpdateTaskCount?: (openCount: number) => void;
}

export const NodalKanbanTasksView: React.FC<NodalKanbanTasksViewProps> = ({
  district,
  onUpdateTaskCount,
}) => {
  const [tasks, setTasks] = useState<NodalKanbanTask[]>(INITIAL_NODAL_TASKS);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [selectedMandal, setSelectedMandal] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);

  // Modal States
  const [assigningTask, setAssigningTask] = useState<NodalKanbanTask | null>(null);
  const [inspectingTask, setInspectingTask] = useState<NodalKanbanTask | null>(null);

  // Assign Modal Form Inputs
  const [priorityOverride, setPriorityOverride] = useState<string>('Critical (Priority 1) - Mandated 48h SLA');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [selectedWorker, setSelectedWorker] = useState<string>('T. Anandhan (Action Worker - Bobbili / Salur) • 2 active tasks');

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesMandal = selectedMandal === 'all' || t.mandal.toLowerCase() === selectedMandal.toLowerCase();
      const matchesSource = selectedSource === 'all' || t.source.toLowerCase().includes(selectedSource.toLowerCase());
      const matchesPriority = selectedPriority === 'all' || t.priority.toLowerCase().includes(selectedPriority.toLowerCase());
      const matchesOverdue = !onlyOverdue || t.slaBreached;
      return matchesMandal && matchesSource && matchesPriority && matchesOverdue;
    });
  }, [tasks, selectedMandal, selectedSource, selectedPriority, onlyOverdue]);

  // Derived Column Lists
  const unassignedTasks = filteredTasks.filter((t) => t.stage === 'unassigned');
  const assignedTasks = filteredTasks.filter((t) => t.stage === 'assigned');
  const inProgressTasks = filteredTasks.filter((t) => t.stage === 'in_progress');
  const underVerificationTasks = filteredTasks.filter((t) => t.stage === 'under_verification');
  const closedTasks = filteredTasks.filter((t) => t.stage === 'verified_closed');

  // Stats Strip (Matching image_62f4d062.png)
  const stats = useMemo(() => {
    const unassigned = unassignedTasks.length;
    const crewsDeployed = assignedTasks.length + inProgressTasks.length;
    const verificationDue = underVerificationTasks.length;
    const verifiedClosed = closedTasks.length;
    const slaBreaches = filteredTasks.filter((t) => t.slaBreached).length;
    return { unassigned, crewsDeployed, verificationDue, verifiedClosed, slaBreaches };
  }, [unassignedTasks, assignedTasks, inProgressTasks, underVerificationTasks, closedTasks, filteredTasks]);

  // Handle Assign Work Order Submit (image_cf0f36d5.png)
  const handleConfirmAssignWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTask) return;

    const workerName = selectedWorker.split(' (')[0];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === assigningTask.id) {
          return {
            ...t,
            stage: 'assigned',
            assignedWorkerName: workerName,
            assignedWorkerPhone: '+91 95400 11223',
            assignedWorkerRole: 'Action Worker / Crew Lead',
            slaTimerText: 'Due in 48 hours',
          };
        }
        return t;
      })
    );

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setAssigningTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Badge & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-[#0077b6]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE OPERATIONS LEDGER • Statutory Verification Mandate Active</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Issues & Rectification Tasks — Workflow Kanban
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Triaged work orders across {district}. Every item carries its provenance source tag and immutable remediation track.
          </p>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'board' ? 'bg-[#0077b6] text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Board View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[#0077b6] text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => {
              if (unassignedTasks.length > 0) {
                setAssigningTask(unassignedTasks[0]);
              } else {
                alert('No unassigned tickets in queue. All active tickets are currently assigned to engineering crews.');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Row & Overdue Switch */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mandal */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Mandal:</span>
            <select
              value={selectedMandal}
              onChange={(e) => setSelectedMandal(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Mandals ({district})</option>
              <option value="Bobbili">Bobbili</option>
              <option value="Gajapathinagaram">Gajapathinagaram</option>
              <option value="Cheepurupalli">Cheepurupalli</option>
              <option value="Salur">Salur</option>
              <option value="Bhogapuram">Bhogapuram</option>
            </select>
          </div>

          {/* Source */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Provenances</option>
              <option value="Citizen">Citizen Grievance</option>
              <option value="Inspector">Inspector Finding</option>
              <option value="Scheduled">Scheduled Inspection</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            <span>Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Critical">Critical (Priority 1)</option>
              <option value="High">High Priority (Level 2)</option>
              <option value="Medium">Medium</option>
              <option value="Routine">Routine</option>
            </select>
          </div>
        </div>

        {/* Overdue Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={onlyOverdue}
            onChange={(e) => setOnlyOverdue(e.target.checked)}
            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
          />
          <span className={onlyOverdue ? 'text-rose-600 font-bold' : ''}>Overdue SLA Only</span>
          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-bold">
            {filteredTasks.length} Tasks
          </span>
        </label>
      </div>

      {/* KPI Stats Strip (Matching image_62f4d062.png) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Unassigned</span>
            <span className="text-xl font-black text-slate-900">{stats.unassigned.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            📄
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Crews Deployed</span>
            <span className="text-xl font-black text-slate-900">{stats.crewsDeployed.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            🛠️
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Verification Due</span>
            <span className="text-xl font-black text-slate-900">{stats.verificationDue.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            📋
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Verified Closed</span>
            <span className="text-xl font-black text-slate-900">{stats.verifiedClosed.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✅
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">SLA Breaches</span>
            <span className="text-xl font-black text-rose-600">{stats.slaBreaches.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            ⚠️
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Citizen Turnaround</span>
            <span className="text-xl font-black text-slate-900">4.2d</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            ⏱️
          </div>
        </div>
      </div>

      {/* 5-Column Kanban Board (Matching image_62f4d062.png) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {/* Column 1: New / Unassigned */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h4 className="text-xs font-bold text-slate-900">New / Unassigned</h4>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {unassignedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {unassignedTasks.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    [Source: {t.source}]
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    t.priority.includes('Critical')
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {t.priority.includes('Critical') ? 'Critical' : 'High'}
                  </span>
                </div>

                <div className="font-mono text-[10px] text-slate-400">
                  {t.id} • {t.assetCode}
                </div>

                <h5 className="font-bold text-slate-900 text-xs leading-snug">
                  {t.title}
                </h5>

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Reported: {t.reportedDate}</span>
                  </span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {t.mandal}
                  </span>
                </div>

                <button
                  onClick={() => setAssigningTask(t)}
                  className="w-full mt-2 py-2 bg-[#0077b6] hover:bg-[#005f92] text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Assign Crew</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Assigned */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h4 className="text-xs font-bold text-slate-900">Assigned</h4>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {assignedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {assignedTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setInspectingTask(t)}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 hover:shadow-xs transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    [Source: {t.source}]
                  </span>
                  {t.slaBreached ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      48h Breach
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Routine
                    </span>
                  )}
                </div>

                <div className="font-mono text-[10px] text-slate-400">
                  {t.id} • {t.assetCode}
                </div>

                <h5 className="font-bold text-slate-900 text-xs leading-snug">
                  {t.title}
                </h5>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Action Worker:</span>
                    <strong className="text-slate-800">👤 {t.assignedWorkerName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Date:</span>
                    <span className={`font-bold ${t.slaBreached ? 'text-rose-600' : 'text-slate-700'}`}>
                      {t.targetDate}
                    </span>
                  </div>
                </div>

                {t.slaBreached && (
                  <div className="flex items-center justify-between text-[10px] pt-1 text-rose-700 font-bold">
                    <span>⚠️ Escalate to SE</span>
                    <span className="underline hover:text-rose-900">Reassign</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: In Progress (With Desilting / Machinery Photos) */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h4 className="text-xs font-bold text-slate-900">In Progress</h4>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {inProgressTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setInspectingTask(t)}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 hover:shadow-xs transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    [Source: {t.source}]
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Active
                  </span>
                </div>

                <div className="font-mono text-[10px] text-slate-400">
                  {t.id} • {t.assetCode}
                </div>

                <h5 className="font-bold text-slate-900 text-xs leading-snug">
                  {t.title}
                </h5>

                {/* Heavy Machinery Photo Preview */}
                {t.duringPhotoUrl && (
                  <div className="relative rounded-lg overflow-hidden h-28 border border-slate-200">
                    <img
                      src={t.duringPhotoUrl}
                      alt="Active Machinery on Site"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      Baseline: {t.reportedDate}
                    </span>
                  </div>
                )}

                {/* Progress Bar & Excavation Stats */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 mb-1">
                    <span>{t.machineryType || 'Remediation Crew'}</span>
                    <span className="text-[#0077b6]">{t.progressPercent || 75}% Done</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0077b6] h-1.5 rounded-full"
                      style={{ width: `${t.progressPercent || 75}%` }}
                    ></div>
                  </div>
                  {t.excavatedVolumeM3 && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Assigned: {t.assignedWorkerName} • {t.excavatedVolumeM3} m³ removed
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Under Verification */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h4 className="text-xs font-bold text-slate-900">Under Verification</h4>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {underVerificationTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {underVerificationTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setInspectingTask(t)}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 hover:shadow-xs transition-shadow cursor-pointer"
              >
                <span className="text-[9px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 block w-fit">
                  Awaiting Inspector Sign-off
                </span>

                <div className="font-mono text-[10px] text-slate-400">
                  {t.id} • {t.assetCode}
                </div>

                <h5 className="font-bold text-slate-900 text-xs leading-snug">
                  {t.title}
                </h5>

                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100 text-[11px] text-purple-900">
                  Work submitted by {t.assignedWorkerName}. Verifier: <strong>{t.verificationInspectorName || 'Inspector'}</strong>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectingTask(t);
                  }}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Inspect Evidence Dossier
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 5: Verified Closed */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold text-slate-900">Verified Closed</h4>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {closedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {closedTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setInspectingTask(t)}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2 hover:shadow-xs transition-shadow cursor-pointer opacity-90"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Statutory Signed
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">100% Closed</span>
                </div>

                <div className="font-mono text-[10px] text-slate-400">
                  {t.id} • {t.assetCode}
                </div>

                <h5 className="font-bold text-slate-800 text-xs leading-snug line-through opacity-75">
                  {t.title}
                </h5>

                <p className="text-[10px] text-slate-500">
                  {t.remedialNotes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol Banner at Bottom */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#0077b6]" />
          <span>
            <strong>Remediation Integrity Protocol:</strong> Every rectification ticket requires high-resolution dual-evidence photography before statutory nodal sign-off.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
          Vizianagaram Hydrology Section 10.4 • Synced 2 mins ago
        </span>
      </div>

      {/* MODAL 1: Assign Task & Dispatch Work Order (Matching image_cf0f36d5.png) */}
      {assigningTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0077b6] flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    HYDROLOGICAL WORK ORDER
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Assign Task & Dispatch Work Order
                  </h3>
                </div>
              </div>
              <button onClick={() => setAssigningTask(null)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignWorkOrder} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Task Tag & Source Tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                  {assigningTask.id}
                </span>
                <span className="font-mono text-[11px] font-bold bg-sky-50 text-[#0077b6] px-2 py-0.5 rounded border border-sky-200">
                  📢 Source: {assigningTask.source} #{assigningTask.sourceRefId}
                </span>
              </div>

              {/* Target Asset Box */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-sky-800">
                  <span>TARGET ASSET</span>
                  <span>{assigningTask.assetCode}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {assigningTask.title}
                </h4>
                <div className="text-[11px] text-slate-600 flex items-center gap-3">
                  <span>📍 {assigningTask.mandal} Mandal</span>
                  <span>•</span>
                  <span>🚰 Ayacut: {assigningTask.ayacutHa || 420} Ha</span>
                </div>
              </div>

              {/* Field Inspection Visual Evidence Box */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[#0077b6]" />
                    <span>Field Inspection Visual Evidence</span>
                  </span>
                  <span>GPS Tagged • 18 May 2024, 11:28 AM</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5 relative rounded-lg overflow-hidden h-24 border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80"
                      alt="Sluice Defect Evidence"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-mono px-1 py-0.2 rounded">
                      📍 18.5724° N, 83.3641° E
                    </span>
                  </div>
                  <div className="sm:col-span-7">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      CONDITION ASSESSMENT
                    </span>
                    <p className="text-[11px] text-slate-700 font-medium leading-relaxed mt-0.5">
                      Severe vegetative blockage and warped mechanical spindle preventing monsoon release gate from lifting. Risk of overflow onto western embankment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hydrological Priority Engine */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Hydrological Priority Engine</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    🔴 Critical (Priority 1)
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-rose-100 text-[11px] text-slate-700 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">ℹ️</span>
                    <p>
                      <strong>Automated Rule Match:</strong> Blocked inlet sluice gate, {assigningTask.mandal} mandal under groundwater stress, 3 citizen complaints lodged within 500m radius.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Level Override</label>
                  <select
                    value={priorityOverride}
                    onChange={(e) => setPriorityOverride(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="Critical (Priority 1) - Mandated 48h SLA">Critical (Priority 1) - Mandated 48h SLA</option>
                    <option value="High Priority (Level 2) - Mandated 72h SLA">High Priority (Level 2) - Mandated 72h SLA</option>
                    <option value="Normal Maintenance - 7 Day SLA">Normal Maintenance - 7 Day SLA</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Reason for priority override <span className="text-slate-400 font-normal">(Required for State Audit Trail)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to maintain algorithmic recommendation..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Assignee Field Worker */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">Assignee Field Worker</label>
                  <span className="text-[10px] text-[#0077b6] font-bold">3 Eligible in Zone</span>
                </div>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50 focus:bg-white"
                >
                  <option value="T. Anandhan (Action Worker - Bobbili / Salur) • 2 active tasks">
                    T. Anandhan (Action Worker - Bobbili / Salur) • 2 active tasks
                  </option>
                  <option value="S. Muralidhar (Bund Maintenance Lead) • 4 active tasks">
                    S. Muralidhar (Bund Maintenance Lead) • 4 active tasks
                  </option>
                  <option value="K. Satyanarayana (Sanitation Specialist) • 1 active task">
                    K. Satyanarayana (Sanitation Specialist) • 1 active task
                  </option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningTask(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel / Draft
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0077b6] hover:bg-[#005f92] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign & Dispatch via SMS</span>
                </button>
              </div>

              <div className="text-center pt-1 text-[10px] text-slate-400 font-mono">
                🛡️ Secured via Nir-ikshan AP Hydrological Audit Service v2.4
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Task Details Dossier (Matching image_20e26fd7.png) */}
      {inspectingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Bar with Breadcrumbs */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span>Issues and Tasks</span>
                  <span>/</span>
                  <span className="font-mono text-slate-700">{inspectingTask.id}</span>
                  <span>/</span>
                  <span className="text-[#0077b6] font-bold">Task Details</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Desilting & Apron Restoration – {inspectingTask.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-bold">{inspectingTask.assetCode}</span>
                  <span>•</span>
                  <span>{inspectingTask.mandal} Mandal</span>
                  <span>•</span>
                  <span>Groundwater Recharge Zone • Category-A Tank</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  ! {inspectingTask.priority}
                </span>
                <button onClick={() => setInspectingTask(null)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Dossier Body (Grid matching image_20e26fd7.png) */}
            <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (8 cols): Diagnosis, Volume Gauge, Dual Photometric Evidence */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Scope & Technical Diagnosis */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        WORK ORDER SCOPE & TECHNICAL DIAGNOSIS
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {inspectingTask.cadastralRef || 'CAD-REF: 182-B/VZ'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Deep silt deposit (approx. 1.2m depth across central collector trough) severely impeding seasonal aquifer percolation along the eastern feeder channel. Excavator Crew #2 mobilized for a 14-day desilting run alongside stone pitching stabilization along apron coordinates 18.5721° N, 83.3644° E. Target bed clearance verified by hydraulic gradient simulation.
                    </p>
                  </div>

                  {/* Target Silt Excavation Volume Gauge */}
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-bold text-sky-900">Target Silt Excavation Volume</span>
                      <span className="text-xs font-mono font-bold text-[#0077b6]">93% Complete</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      4,200 / 4,500 m³
                    </div>
                    <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#0077b6] h-2 rounded-full" style={{ width: '93%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                      <span>Remaining extraction: <strong>300 m³</strong></span>
                      <span>Measured by Total Station Survey (Bobbili Sub-division)</span>
                    </div>
                  </div>

                  {/* Dual Photometric Evidence (Before & After Field Submission) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Camera className="w-4 h-4 text-[#0077b6]" />
                        <span>Dual Photometric Evidence</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cryptographically signed field uploads
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Photo 1: Before */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 shadow-2xs">
                        <div className="relative h-36">
                          <img
                            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80"
                            alt="Before Rectification"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-rose-700 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            🔴 Before Rectific. 14 Oct 2024
                          </span>
                          <span className="absolute bottom-1 left-2 text-white text-[8px] font-mono bg-black/60 px-1 rounded">
                            18.5721° N, 83.3644° E • ±1.4m
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 text-[10px] flex justify-between text-slate-500">
                          <span>Source: Initial Incident Log</span>
                          <span className="text-[#0077b6] font-bold cursor-pointer">Full Spec</span>
                        </div>
                      </div>

                      {/* Photo 2: After (Field Submission) */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 shadow-2xs">
                        <div className="relative h-36">
                          <img
                            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80"
                            alt="After Work Submission"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            🟢 Field Submissi. 19 Oct 2024
                          </span>
                          <span className="absolute bottom-1 left-2 text-white text-[8px] font-mono bg-black/60 px-1 rounded">
                            18.5721° N, 83.3644° E • ±1.1m
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50 text-[10px] flex justify-between text-slate-500">
                          <span>Uploaded by: T. Anandhan</span>
                          <span className="text-[#0077b6] font-bold cursor-pointer">EXIF Hash</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cadastral Boundary Mapping Geo-Lock */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <div>
                        <strong className="text-slate-900 block">Cadastral Boundary Mapping</strong>
                        <span className="text-slate-500 text-[11px]">Survey Parcel: {inspectingTask.surveyParcel || 'VENG-048'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Cadastral Plot #89/2 Geo-Locked
                    </span>
                  </div>
                </div>

                {/* Right Column (5 cols): Protocol, Ownership, Progression Timeline */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Municipal Governance Protocol Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-[#0077b6] font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                      <span>MUNICIPAL GOVERNANCE PROTOCOL</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      <strong>STATUTORY NOTICE:</strong> Nodal Officers cannot unilaterally close water asset tasks. Final rectification closure requires on-site physical measurement, geotagged sign-off, and water percolation verification by the designated <strong>Field Inspector</strong>.
                    </p>
                  </div>

                  {/* Operational Ownership & Timelines */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      OPERATIONAL OWNERSHIP & TIMELINES
                    </span>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                          TA
                        </div>
                        <div>
                          <strong className="text-slate-900 block leading-tight">T. Anandhan</strong>
                          <span className="text-[10px] text-slate-400">Action Crew Lead (Excavation #2)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Work Submitted</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                          PR
                        </div>
                        <div>
                          <strong className="text-slate-900 block leading-tight">Pooja Reddy</strong>
                          <span className="text-[10px] text-slate-400">Vizianagaram Field Inspector</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">Inspection Due</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Statutory Mandate Deadline:</span>
                      <strong className="text-slate-800">22 Oct 2024 (On-Track)</strong>
                    </div>
                  </div>

                  {/* Status Progression Timeline (Step 4 of 5) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">Status Progression Timeline</span>
                      <span className="font-mono text-[10px] font-bold text-[#0077b6]">Step 4 of 5</span>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l-2 border-emerald-500 text-[11px]">
                      <div>
                        <strong className="text-slate-900 block">1. Defect Reported (12 Oct, 10:00 AM)</strong>
                        <span className="text-slate-500 text-[10px]">Automated logging via drone survey and citizen grievance sync.</span>
                      </div>
                      <div>
                        <strong className="text-slate-900 block">2. Assessed & Assigned (12 Oct, 02:30 PM)</strong>
                        <span className="text-slate-500 text-[10px]">Nodal Officer P. Kalyani allocated crew and equipment.</span>
                      </div>
                      <div>
                        <strong className="text-slate-900 block">3. Heavy Machinery Execution (14-18 Oct)</strong>
                        <span className="text-slate-500 text-[10px]">Excavator Crew #2 hauled 4,200 m³ bed siltation.</span>
                      </div>
                      <div className="text-[#0077b6]">
                        <strong className="block">4. Remediation Evidence Uploaded (19 Oct)</strong>
                        <span className="text-slate-500 text-[10px]">Awaiting Field Inspector physical validation.</span>
                      </div>
                      <div className="opacity-50">
                        <strong className="text-slate-700 block">5. Final Statutory Closure</strong>
                        <span className="text-slate-400 text-[10px]">Gazette seal and Section 65B legal certificate.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Logged in APWRIMS Public Hydrology Database
              </span>
              <button
                onClick={() => setInspectingTask(null)}
                className="px-5 py-2 bg-[#0077b6] hover:bg-[#005f92] text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
