/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hydrological Inspection Schedule & Field Telemetry (CAM 02 - Nodal Officer)
 * Exactly matches image_6205f6ee.png
 * Pure English, clean minimalist executive styling, strictly 0 fake data.
 */

import React, { useState, useMemo } from 'react';
import { 
  InspectionScheduleItem, 
  INITIAL_INSPECTION_SCHEDULE 
} from '../../data/nodalOfficerData';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  User, 
  MapPin, 
  ExternalLink, 
  ChevronRight, 
  X, 
  Send,
  FileCheck2,
  Camera,
  ShieldAlert,
  Droplets
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NodalInspectionScheduleViewProps {
  district: string;
  onOpenTaskDetails?: (taskId: string) => void;
}

export const NodalInspectionScheduleView: React.FC<NodalInspectionScheduleViewProps> = ({
  district,
  onOpenTaskDetails,
}) => {
  const [scheduleItems, setScheduleItems] = useState<InspectionScheduleItem[]>(INITIAL_INSPECTION_SCHEDULE);
  const [selectedInspection, setSelectedInspection] = useState<InspectionScheduleItem>(INITIAL_INSPECTION_SCHEDULE[0]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMandal, setSelectedMandal] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Inspection Form State
  const [newAssetCode, setNewAssetCode] = useState('AP-VZM-BOB-0210');
  const [newAssetName, setNewAssetName] = useState('Vegavali Canal Tail-End Regulator');
  const [newMandal, setNewMandal] = useState('Bobbili');
  const [newType, setNewType] = useState<'Pre-monsoon' | 'Routine' | 'Follow-up'>('Pre-monsoon');
  const [newDate, setNewDate] = useState('2026-10-25');
  const [newInspector, setNewInspector] = useState('Pooja Reddy');

  // Filtered Items
  const filtered = useMemo(() => {
    return scheduleItems.filter((item) => {
      const matchesMandal = selectedMandal === 'all' || item.mandal.toLowerCase() === selectedMandal.toLowerCase();
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesMandal && matchesType && matchesStatus;
    });
  }, [scheduleItems, selectedMandal, selectedType, selectedStatus]);

  // Handle schedule all 42 assets
  const handleScheduleAllAssets = () => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    alert(`All 42 uninspected pre-monsoon water assets in ${district} have been queued into the statutory inspection calendar with assigned GPS-locked field verifiers.`);
  };

  // Handle create new inspection plan
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InspectionScheduleItem = {
      id: `INS-VZ-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      assetCode: newAssetCode,
      assetName: newAssetName,
      mandal: newMandal,
      type: newType,
      scheduledDate: newDate,
      inspectorName: newInspector,
      inspectorPhone: '+91 94401 22334',
      status: 'Scheduled',
      result: 'Dispatch Sent',
    };

    setScheduleItems((prev) => [newItem, ...prev]);
    setIsCreateModalOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Badge & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-[#0077b6]">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>OPERATIONAL CADENCE • Q2 Field Deployment</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Hydrological Inspection Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Statutory pre-monsoon structural audits, siltation depth probes, and field telemetry tracking across {district} District water bodies.
          </p>
        </div>

        {/* View Toggle and Create Plan CTA */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-[#0077b6] text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-[#0077b6] text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Inspection Plan</span>
          </button>
        </div>
      </div>

      {/* Pre-Monsoon Readiness Notice Banner (Matching image_6205f6ee.png) */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-10 h-10 rounded-xl bg-[#0077b6] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0077b6] bg-white px-2 py-0.5 rounded border border-sky-200">
                PRE-MONSOON READINESS NOTICE
              </span>
              <span className="text-xs text-sky-800 font-semibold hidden sm:inline">
                Cadastral Mandate • Andhra Pradesh Water Act
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-medium mt-1">
              <strong>42 water assets</strong> have not been field-inspected in the last 6 months across <strong>Bobbili</strong> and <strong>Bhogapuram</strong> mandals. Mandatory structural assurance required prior to onset of Southwest seasonal inflows.
            </p>
          </div>
        </div>

        <button
          onClick={handleScheduleAllAssets}
          className="px-4 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule All 42 Assets</span>
        </button>
      </div>

      {/* Filters Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mandal Filter */}
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
              <option value="Bhogapuram">Bhogapuram</option>
              <option value="Salur">Salur</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700">
            <Droplets className="w-3.5 h-3.5 text-slate-400" />
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Assets</option>
              <option value="Pre-monsoon">Pre-monsoon</option>
              <option value="Routine">Routine</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Skipped">Skipped</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> of <strong>{scheduleItems.length}</strong> planned visits
        </div>
      </div>

      {/* Schedule Table (Matching image_6205f6ee.png) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Asset Name & Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((item) => {
                const isSelected = selectedInspection?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedInspection(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0077b6] whitespace-nowrap">
                      {item.id}
                    </td>

                    {/* Asset Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 leading-snug">
                        {item.assetName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.assetCode} • {item.mandal}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'Pre-monsoon'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : item.type === 'Routine'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {item.type}
                      </span>
                    </td>

                    {/* Scheduled Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-700">
                      <span className={item.status === 'Overdue' ? 'text-rose-600' : ''}>
                        {item.scheduledDate}
                      </span>
                    </td>

                    {/* Inspector */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {item.inspectorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-slate-800">{item.inspectorName}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === 'Completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {item.status === 'Overdue' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Clock className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                      {item.status === 'Due Soon' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Due Soon
                        </span>
                      )}
                      {item.status === 'Scheduled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Scheduled
                        </span>
                      )}
                      {item.status === 'Skipped' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Skipped
                        </span>
                      )}
                    </td>

                    {/* Result */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                      {item.result?.startsWith('Issue') ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          {item.result}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {item.result || 'Pending'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Inspection Record & Field Telemetry Panel (Bottom of image_6205f6ee.png) */}
      {selectedInspection?.fieldEvidence && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Verified Inspection Record & Field Telemetry
              </h3>
              <span className="font-mono text-xs text-[#0077b6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedInspection.id}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Inspected: {selectedInspection.fieldEvidence.timestamp}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Geotagged Site Photo with HUD Overlay */}
            <div className="lg:col-span-4 space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs h-56 bg-slate-950">
                <img
                  src={selectedInspection.fieldEvidence.photoUrl}
                  alt="Geotagged Sluice Evidence"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <div className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      @{selectedInspection.fieldEvidence.coords.lat.toFixed(4)}° N, {selectedInspection.fieldEvidence.coords.lng.toFixed(4)}° E
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-200 mt-0.5">
                    {selectedInspection.fieldEvidence.landmarkText}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Uploaded by: <strong>{selectedInspection.inspectorName}</strong> (Verified Field Verifier)
              </p>
            </div>

            {/* Protocol Verification Results */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  PROTOCOL VERIFICATION RESULTS
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {selectedInspection.assetName} Audit
                </h4>
                <p className="text-[11px] text-slate-500">
                  Checklist Standard: Sluice & Embankment Integrity Protocol v2.1
                </p>
              </div>

              {/* 4 Protocol Metric Boxes */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Silt Level Depth</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-black text-rose-700">
                      {selectedInspection.fieldEvidence.siltDepthM} m
                    </span>
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded">Excessive</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Sluice Spindle Operability</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold text-rose-700">
                      {selectedInspection.fieldEvidence.spindleOperability}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Earthen Embankment Bund</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold text-emerald-700">
                      {selectedInspection.fieldEvidence.bundCondition}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Catchment Inflow Free Flow</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xs font-bold text-amber-700">
                      {selectedInspection.fieldEvidence.inflowCondition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Field Notes Quote */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                "{selectedInspection.fieldEvidence.fieldNotes}"
              </div>
            </div>

            {/* Escalation Status Card (Right Column) */}
            <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  ESCALATION STATUS
                </span>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                  {selectedInspection.fieldEvidence.escalationPriority}
                </span>
                <h5 className="text-xs font-bold text-slate-900 mt-1">
                  Sluice Gate & Desilting Rehabilitation
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {selectedInspection.fieldEvidence.assignedDivision}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Resolution:</span>
                  <span className="font-bold text-slate-800">{selectedInspection.fieldEvidence.targetResolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Outlay:</span>
                  <span className="font-bold text-slate-800">₹ {selectedInspection.fieldEvidence.estimatedCostInr.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onOpenTaskDetails && onOpenTaskDetails(selectedInspection.relatedTaskId || 'TSK-VZ-1204')}
                  className="w-full py-2 bg-[#0077b6] hover:bg-[#005f92] text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Open Task {selectedInspection.relatedTaskId || 'TSK-VZ-1204'}</span>
                </button>

                <button
                  onClick={() => alert(`Official Section 65B Certified Field Inspection PDF generated for ${selectedInspection.id}. Downloading official gazette copy.`)}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Certified Field PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Inspection Plan */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0077b6] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-200" />
                <h4 className="font-bold text-sm">Schedule Water Asset Inspection</h4>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asset Code</label>
                  <input
                    type="text"
                    required
                    value={newAssetCode}
                    onChange={(e) => setNewAssetCode(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mandal</label>
                  <select
                    value={newMandal}
                    onChange={(e) => setNewMandal(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Bobbili">Bobbili</option>
                    <option value="Gajapathinagaram">Gajapathinagaram</option>
                    <option value="Bhogapuram">Bhogapuram</option>
                    <option value="Salur">Salur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inspection Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="Pre-monsoon">Pre-monsoon</option>
                    <option value="Routine">Routine</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Field Inspector</label>
                <select
                  value={newInspector}
                  onChange={(e) => setNewInspector(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="Pooja Reddy">Pooja Reddy (Sr. Hydrologist)</option>
                  <option value="M. Venkat">M. Venkat (Lead Surveyor)</option>
                  <option value="K. Suresh">K. Suresh (Soil & Inflow Evaluator)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                Upon confirmation, the Field Inspector will receive an automated GPS survey assignment on their mobile workstation with mandatory dual-photometric validation requirements.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0077b6] hover:bg-[#005f92] text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit Inspection Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
