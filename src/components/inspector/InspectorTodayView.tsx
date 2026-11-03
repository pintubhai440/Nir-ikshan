import React, { useState } from 'react';
import { 
  ScheduledInspectionTask, 
  VerificationTaskItem 
} from './types';
import { CitizenComplaint } from '../../types/nirikshan';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Camera, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  Filter, 
  Navigation, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';

import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';

interface InspectorTodayViewProps {
  inspector?: SupabaseFieldInspectorRow;
  scheduledTasks: ScheduledInspectionTask[];
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
  verificationTasks,
  complaints,
  onStartInspection,
  onOpenVerifyTask,
  onSwitchToMap,
  onTriggerSync,
  isSyncing,
  queuedSyncCount,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'routine'>('all');
  const [sortBy, setSortBy] = useState<'nearest' | 'due' | 'ayacut'>('nearest');
  const [simulateCleanDay, setSimulateCleanDay] = useState(false);

  // Strictly use scheduledTasks passed from InspectorDashboard (strictly isolated to this inspector)
  const combinedTasks: ScheduledInspectionTask[] = scheduledTasks;

  // Filtering
  const filteredTasks = combinedTasks.filter((t) => {
    if (simulateCleanDay) return false;
    if (filterType === 'critical') return t.priority === 'Critical' || t.priority === 'Overdue SLA Breach';
    if (filterType === 'routine') return t.priority === 'Routine';
    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'nearest') return a.distanceMeters - b.distanceMeters;
    if (sortBy === 'ayacut') return b.ayacutHectares - a.ayacutHectares;
    return a.id.localeCompare(b.id);
  });

  const criticalCount = combinedTasks.filter(
    (t) => t.priority === 'Critical' || t.priority === 'Overdue SLA Breach'
  ).length;
  const routineCount = combinedTasks.filter((t) => t.priority === 'Routine').length;
  const overdueCount = combinedTasks.filter((t) => t.isOverdue || t.priority === 'Overdue SLA Breach').length;
  const firstOverdue = combinedTasks.find((t) => t.isOverdue || t.priority === 'Overdue SLA Breach');

  return (
    <div className="space-y-5">
      {/* 3 Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Inspections Due Today */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase block">
              Inspections Due Today
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">
                {simulateCleanDay ? 0 : combinedTasks.length}
              </span>
              <span className="text-xs font-medium text-slate-500">Scheduled</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              {simulateCleanDay ? '0 Critical • 0 Routine' : `${criticalCount} Critical • ${routineCount} Routine`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0077B6]">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Overdue Audits */}
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-rose-600 uppercase block">
              Overdue Audits
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-rose-600">
                {simulateCleanDay ? 0 : overdueCount}
              </span>
              <span className="text-xs font-semibold text-rose-600">&gt;24h SLA Warning</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1 truncate max-w-[200px]">
              {simulateCleanDay ? 'None overdue' : (firstOverdue ? firstOverdue.name : 'All structures within SLA')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Verifications Waiting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase block">
              Verifications Waiting
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">
                {verificationTasks.filter((v) => v.status === 'PENDING_SIGN_OFF').length}
              </span>
              <span className="text-xs font-medium text-slate-500">Sign-offs Ready</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Repairs completed by Crews
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Offline Mode Active Banner */}
      <div className="bg-[#03045E] text-white rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-200 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">Offline Mode Active</span>
              <span className="bg-[#0077B6] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {queuedSyncCount} SAVED LOCAL
              </span>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">
              Completed inspections are safe on device encrypted storage. Instant auto-sync triggers upon tower handshake.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="px-4 py-2 bg-[#00B4D8] hover:bg-[#0096c7] text-[#03045E] font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing Vault...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Action Controls & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: View Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              className="px-3 py-1 rounded-lg bg-white text-[#03045E] shadow-2xs font-bold"
            >
              List View
            </button>
            <button
              onClick={onSwitchToMap}
              className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Map View
            </button>
          </div>

          {/* Filter Pills */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                filterType === 'all'
                  ? 'bg-[#03045E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types ({combinedTasks.length})
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                filterType === 'critical'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Critical / High ({criticalCount})
            </button>
            <button
              onClick={() => setFilterType('routine')}
              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                filterType === 'routine'
                  ? 'bg-[#0077B6] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Routine ({routineCount})
            </button>
          </div>
        </div>

        {/* Right: Sort & Edge Simulator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="nearest">Nearest First</option>
              <option value="due">Due Time</option>
              <option value="ayacut">Command Ayacut</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none border-l border-slate-200 pl-3">
            <input
              type="checkbox"
              checked={simulateCleanDay}
              onChange={(e) => setSimulateCleanDay(e.target.checked)}
              className="rounded border-slate-300 text-[#0077B6] focus:ring-[#0077B6] w-3.5 h-3.5"
            />
            <span>Simulate Clean Day</span>
          </label>
        </div>
      </div>

      {/* Main 2-Column Split: Left = Field Schedule | Right = Verifications Waiting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 Cols): Today's Field Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Today's Field Schedule</h3>
              <p className="text-xs text-slate-500">Scheduled physical inspections and water level surveys</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {sortedTasks.length} Assets
            </span>
          </div>

          {sortedTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">All Clear! No Pending Inspections</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {simulateCleanDay
                  ? `Simulated Clean Day active: All scheduled water structures in ${inspector?.mandal || inspector?.district || 'this jurisdiction'} are verified up to date.`
                  : `All clear for Inspector ${inspector?.full_name || 'Officer'}! No pending inspections in queue for ${inspector?.mandal || inspector?.district || 'this jurisdiction'}. Standing by for Nodal Officer dispatch.`}
              </p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const isOverdue = task.isOverdue || task.priority === 'Overdue SLA Breach';
              const isCritical = task.priority === 'Critical';

              return (
                <div
                  key={task.id}
                  className={`bg-white border rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-3.5 ${
                    isOverdue
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : isCritical
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700'
                            : isCritical
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {isOverdue ? 'Overdue SLA Breach' : task.priority}
                      </span>
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        Source: {task.sourceType}
                      </span>
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        Pre-monsoon Assurance
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#0077B6]">
                      <Navigation className="w-3 h-3" />
                      <span>{task.bearing}</span>
                    </div>
                  </div>

                  {/* Title & Asset Code */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{task.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Asset Code: {task.assetCode} • {task.cadastralParcel}
                    </p>
                  </div>

                  {/* Scheduled Window & Meta Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        Scheduled Window
                      </span>
                      <span className="font-bold text-slate-800">{task.scheduledWindow}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        Command Ayacut
                      </span>
                      <span className="font-bold text-slate-800">{task.ayacutHectares} Hectares</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        Recharge Type
                      </span>
                      <span className="font-bold text-slate-800">{task.rechargeType}</span>
                    </div>
                  </div>

                  {/* Overdue Alert Box if applicable */}
                  {isOverdue && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Statutory Notice: Overdue &gt;24h</span>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          Immediate obstruction and structural crack assessment mandated under Section 14 AP Water Basin Act.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Past Record or Photo Requirement */}
                  {task.pastRecordSummary && !isOverdue && (
                    <div className="flex items-center justify-between text-xs bg-sky-50/60 border border-sky-100 rounded-xl p-2.5 px-3 text-sky-950">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#0077B6]" />
                        <span>Past Record: {task.pastRecordSummary}</span>
                      </div>
                      {task.pastRetentionPercent && (
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          {task.pastRetentionPercent}% Retained
                        </span>
                      )}
                    </div>
                  )}

                  {/* Photo Prompt Box if applicable */}
                  {task.photoPromptRequired && (
                    <div className="border border-dashed border-sky-300 bg-sky-50/40 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-[#0077B6] shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#03045E] block">{task.photoPromptRequired}</span>
                        <span className="text-slate-500 text-[11px]">Geotag and EXIF azimuth will lock automatically</span>
                      </div>
                    </div>
                  )}

                  {/* Primary CTA */}
                  <button
                    onClick={() => onStartInspection(task)}
                    className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 ${
                      isOverdue
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : isCritical
                        ? 'bg-[#03045E] hover:bg-[#0077B6] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{isOverdue ? 'Start Overdue Audit' : 'Start Inspection Wizard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (5 Cols): Verifications Waiting */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Verifications Waiting</span>
                <span className="bg-[#0077B6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {verificationTasks.filter((v) => v.status === 'PENDING_SIGN_OFF').length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Action worker repairs requiring independent photogrammetric sign-off before statutory closure.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {verificationTasks.map((item) => {
              const isLocked = item.isSelfLoggedByCurrentUser;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-3 transition-shadow ${
                    isLocked ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLocked
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLocked ? 'Critical Priority' : 'Ready for Field Check'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{item.taskId}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.locationName}</p>
                  </div>

                  {/* Worker & Defect Origin Meta */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Action Worker:</span>
                      <span className="font-semibold text-slate-800">{item.actionWorkerName} ({item.actionWorkerTeam})</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Completed:</span>
                      <span className="font-semibold text-slate-800">{item.workExecutionClosedDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Originally Flagged By:</span>
                      <span className={`font-semibold ${isLocked ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.originallyFlaggedBy}
                      </span>
                    </div>
                  </div>

                  {/* Submitted Evidence Preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Submitted Evidence (Before vs After)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100">
                        <img
                          src={item.beforePhotoUrl}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Before Work
                        </span>
                      </div>
                      <div className="relative rounded-lg overflow-hidden border border-emerald-300 h-20 bg-slate-100">
                        <img
                          src={item.afterPhotoUrl}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-emerald-900/80 text-emerald-100 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          After Work
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Separation Rule Badge / Conflict Guard Notice */}
                  {isLocked ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1 text-xs text-rose-950">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Verification Locked for this Account</span>
                      </div>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        <strong>Statutory Dual-Control Rule:</strong> Because you raised the initial structural breach on 18 May, a different inspector must verify this repair before sign-off.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-medium">
                        Independent inspector rule satisfied. Sign-off permitted.
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  {isLocked ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>View Only (Locked)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenVerifyTask(item)}
                      className="w-full py-2.5 px-4 bg-[#03045E] hover:bg-[#0077B6] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-200" />
                      <span>Verify Repair</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
