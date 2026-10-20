import React, { useState, useMemo } from 'react';
import { CitizenComplaint, OfficerContact } from '../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { DepartmentalPersonnel } from '../data/stateAdminData';
import { 
  Building2, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  UserCheck, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DistrictGrievanceProgressConsoleProps {
  complaints: CitizenComplaint[];
  selectedDistrict: DistrictTelemetry | null;
  onSelectDistrict: (district: DistrictTelemetry) => void;
  staffList: DepartmentalPersonnel[];
  onDispatchReminder: (complaint: CitizenComplaint, deadlineHours: string, note: string) => void;
  onReassignNodal: (complaint: CitizenComplaint, newOfficer: string) => void;
  onInspectComplaint?: (complaint: CitizenComplaint) => void;
}

export const DistrictGrievanceProgressConsole: React.FC<DistrictGrievanceProgressConsoleProps> = ({
  complaints,
  selectedDistrict,
  onSelectDistrict,
  staffList,
  onDispatchReminder,
  onReassignNodal,
  onInspectComplaint,
}) => {
  const [districtFilter, setDistrictFilter] = useState<string>(selectedDistrict?.name || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active modal state for dispatching directive or reassigning
  const [activeActionComplaint, setActiveActionComplaint] = useState<CitizenComplaint | null>(null);
  const [actionType, setActionType] = useState<'reminder' | 'reassign' | null>(null);
  const [memoDeadlineHours, setMemoDeadlineHours] = useState('24');
  const [memoNote, setMemoNote] = useState('');
  const [selectedNewOfficer, setSelectedNewOfficer] = useState('');

  // Synchronize when parent changes selectedDistrict
  React.useEffect(() => {
    if (selectedDistrict && selectedDistrict.name !== districtFilter && districtFilter !== 'all') {
      setDistrictFilter(selectedDistrict.name);
    }
  }, [selectedDistrict]);

  // Filter complaints based on criteria
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesDistrict = districtFilter === 'all' || c.district.toLowerCase() === districtFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesSearch = 
        !searchQuery ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.locationLandmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.wasteType && c.wasteType.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDistrict && matchesStatus && matchesSearch;
    });
  }, [complaints, districtFilter, statusFilter, searchQuery]);

  // Aggregate stats per district across all 26 AP districts
  const districtProgressSummary = useMemo(() => {
    return ANDHRA_PRADESH_26_DISTRICTS.map((dist) => {
      const distComplaints = complaints.filter(c => c.district.toLowerCase() === dist.name.toLowerCase());
      const total = distComplaints.length;
      const resolved = distComplaints.filter(c => c.status === 'RESOLVED').length;
      const open = distComplaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
      const overdue = Math.max(0, Math.round(open * 0.25));

      // Primary Nodal Officer for this district
      const assignedOfficer = staffList.find(s => s.district.toLowerCase() === dist.name.toLowerCase() && s.role === 'Nodal Officer')
        || staffList.find(s => s.role === 'Nodal Officer');

      return {
        district: dist,
        totalComplaints: total,
        resolvedCount: resolved,
        openCount: open,
        overdueCount: overdue,
        assignedOfficer: assignedOfficer?.name || 'District Nodal Officer',
        officerPhone: assignedOfficer?.phone || '9848011111',
        complaints: distComplaints,
      };
    });
  }, [complaints, staffList]);

  // Available Nodal Officers for reassignment
  const nodalOfficers = useMemo(() => {
    return staffList.filter(s => s.role === 'Nodal Officer');
  }, [staffList]);

  // Handle Dispatch Reminder Submit
  const handleConfirmReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionComplaint) return;
    onDispatchReminder(activeActionComplaint, memoDeadlineHours, memoNote);
    setActiveActionComplaint(null);
    setActionType(null);
    setMemoNote('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Handle Confirm Reassign
  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionComplaint || !selectedNewOfficer) return;
    onReassignNodal(activeActionComplaint, selectedNewOfficer);
    setActiveActionComplaint(null);
    setActionType(null);
    setSelectedNewOfficer('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Helper for progress status badge & step
  const getStatusBadge = (status: CitizenComplaint['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Step 1: Submitted (Triage)', color: 'bg-blue-100 text-[#0077B6]', step: 1 };
      case 'INSPECTOR_ASSIGNED':
        return { label: 'Step 2: Inspector Assigned', color: 'bg-amber-100 text-amber-800', step: 2 };
      case 'INSPECTION_COMPLETED':
        return { label: 'Step 3: Inspection Completed', color: 'bg-indigo-100 text-indigo-800', step: 3 };
      case 'ACTION_ASSIGNED':
      case 'WORKER_IN_PROGRESS':
        return { label: 'Step 4: Action in Progress', color: 'bg-sky-100 text-[#0077B6]', step: 4 };
      case 'VERIFICATION_PENDING':
        return { label: 'Step 5: Verification Pending', color: 'bg-purple-100 text-purple-800', step: 5 };
      case 'RESOLVED':
        return { label: 'Step 6: Verified Closed', color: 'bg-emerald-100 text-emerald-800', step: 6 };
      case 'REJECTED':
        return { label: 'Invalid / Rejected', color: 'bg-slate-100 text-slate-700', step: 0 };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700', step: 1 };
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
      
      {/* 1. Header & Purpose */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#CAF0F8] text-[#03045E] uppercase tracking-wider">
              State Admin Oversight Console
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Andhra Pradesh 26-District Hydrological Grid
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0077B6]" />
            <span>District Grievance Progress &amp; Nodal Officer Management</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of problems, progress steps, and assigned Nodal Officers across all Andhra Pradesh districts.
          </p>
        </div>

        {/* District Quick Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#0077B6]" />
            <select
              value={districtFilter}
              onChange={(e) => {
                setDistrictFilter(e.target.value);
                const d = ANDHRA_PRADESH_26_DISTRICTS.find(x => x.name.toLowerCase() === e.target.value.toLowerCase());
                if (d) onSelectDistrict(d);
              }}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">View All 26 Districts</option>
              {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>{d.name} District</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. District Performance Strip (Quick Highlights) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {districtProgressSummary.slice(0, 6).map((item) => (
          <div
            key={item.district.id}
            onClick={() => {
              setDistrictFilter(item.district.name);
              onSelectDistrict(item.district);
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              districtFilter.toLowerCase() === item.district.name.toLowerCase()
                ? 'bg-sky-50/60 border-[#0077B6] shadow-xs'
                : 'bg-slate-50/40 border-slate-200 hover:border-[#0077B6]'
            }`}
          >
            <div className="flex items-center justify-between">
              <strong className="text-xs text-slate-900 font-bold block truncate">
                {item.district.name}
              </strong>
              <span className={`w-2 h-2 rounded-full ${
                item.district.statusColor === 'green' ? 'bg-emerald-500' :
                item.district.statusColor === 'blue' ? 'bg-[#0077B6]' :
                item.district.statusColor === 'yellow' ? 'bg-amber-400' : 'bg-rose-500'
              }`}></span>
            </div>
            
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Grievances:</span>
              <span className="font-mono font-bold text-slate-800">{item.totalComplaints}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Nodal:</span>
              <span className="text-slate-600 font-medium truncate max-w-[80px]">
                {item.assignedOfficer.split(' ')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Filter and Search Bar for Complaints */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by complaint ID, citizen, problem, landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
        >
          <option value="all">Status: All Steps</option>
          <option value="SUBMITTED">Step 1: Submitted</option>
          <option value="INSPECTOR_ASSIGNED">Step 2: Inspector Assigned</option>
          <option value="INSPECTION_COMPLETED">Step 3: Inspection Completed</option>
          <option value="ACTION_ASSIGNED">Step 4: Action in Progress</option>
          <option value="RESOLVED">Step 5: Verified Closed</option>
        </select>

        <span className="text-slate-400 text-xs font-medium">
          Showing <strong>{filteredComplaints.length}</strong> active complaints
        </span>
      </div>

      {/* 4. Real Complaints List with Problem, Progress, and Nodal Officer Control */}
      {filteredComplaints.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">No Open Grievances Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {districtFilter !== 'all' 
              ? `No grievances matching your filter in ${districtFilter} District. Aquifer and telemetry are operating within normal tolerances.`
              : 'All citizen complaints are currently resolved and verified across Andhra Pradesh.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((c) => {
            const statusInfo = getStatusBadge(c.status);
            return (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-[#0077B6] bg-white transition-all space-y-3.5 shadow-2xs"
              >
                {/* Top Row: ID, District, Problem Category, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-[#03045E] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {c.id}
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0077B6]" />
                      <span>{c.district}</span>
                      <span className="text-slate-400">({c.mandal || c.village})</span>
                    </span>
                    {c.wasteType && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Problem: {c.wasteType}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Problem Description & Landmark */}
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-medium line-clamp-2 text-slate-800">
                    {c.shortDescription}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Citizen: <strong className="text-slate-600">{c.citizenName}</strong> ({c.citizenPhone})</span>
                    <span>•</span>
                    <span>Landmark: <strong className="text-slate-600">{c.locationLandmark}</strong></span>
                    <span>•</span>
                    <span>Logged: <strong className="text-slate-600">{c.submittedAt}</strong></span>
                  </div>
                </div>

                {/* 5-Step Visual Progress Tracker */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span className={statusInfo.step >= 1 ? 'text-[#0077B6]' : ''}>1. Submitted</span>
                    <span className={statusInfo.step >= 2 ? 'text-[#0077B6]' : ''}>2. Inspector</span>
                    <span className={statusInfo.step >= 3 ? 'text-[#0077B6]' : ''}>3. Inspected</span>
                    <span className={statusInfo.step >= 4 ? 'text-[#0077B6]' : ''}>4. Action</span>
                    <span className={statusInfo.step >= 6 ? 'text-emerald-600' : ''}>5. Resolved</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${
                      c.status === 'RESOLVED' ? 'bg-emerald-500 w-full' :
                      statusInfo.step === 4 ? 'bg-[#0077B6] w-3/4' :
                      statusInfo.step === 3 ? 'bg-indigo-500 w-1/2' :
                      statusInfo.step === 2 ? 'bg-amber-400 w-1/3' : 'bg-blue-400 w-1/5'
                    }`}></div>
                  </div>
                </div>

                {/* Bottom Row: Nodal Officer & State Admin Management Controls */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Assigned Nodal Officer */}
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0077B6] shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Nodal Officer:</span>
                      <strong className="text-slate-900 font-bold text-xs">
                        {c.assignedNodalOfficer || 'Er. N. Subba Rao (Irrigation Nodal Officer)'}
                      </strong>
                    </div>
                  </div>

                  {/* Actions for State Admin */}
                  <div className="flex items-center gap-2">
                    {onInspectComplaint && (
                      <button
                        onClick={() => onInspectComplaint(c)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View Full Case Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveActionComplaint(c);
                        setActionType('reminder');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Send Urgent SLA Reminder / Directive"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-700" />
                      <span>Dispatch Directive</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveActionComplaint(c);
                        setActionType('reassign');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      title="Reassign to another Nodal Officer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Reassign Nodal</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: DISPATCH SLA REMINDER / DIRECTIVE TO NODAL OFFICER          */}
      {/* ==================================================================== */}
      {actionType === 'reminder' && activeActionComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                  State Intervention Memo
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">
                  Dispatch SLA Reminder Directive
                </h4>
                <p className="text-xs text-slate-500">
                  Case ID: <strong>{activeActionComplaint.id}</strong> ({activeActionComplaint.district})
                </p>
              </div>
              <button 
                onClick={() => {
                  setActionType(null);
                  setActiveActionComplaint(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Assigned Recipient Nodal Officer
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
                  {activeActionComplaint.assignedNodalOfficer}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Mandatory SLA Resolution Deadline
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['12', '24', '48'].map((hr) => (
                    <button
                      type="button"
                      key={hr}
                      onClick={() => setMemoDeadlineHours(hr)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        memoDeadlineHours === hr 
                          ? 'bg-[#0077B6] text-white border-[#0077B6]' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {hr} Hours SLA
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Official Administrative Directive Note
                </label>
                <textarea
                  rows={3}
                  value={memoNote}
                  onChange={(e) => setMemoNote(e.target.value)}
                  placeholder="e.g. Priority directive: Deploy field inspector for immediate ground-truth verification and report within SLA..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionType(null);
                    setActiveActionComplaint(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Binding Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: REASSIGN NODAL OFFICER                                      */}
      {/* ==================================================================== */}
      {actionType === 'reassign' && activeActionComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#0077B6] font-bold uppercase">
                  Jurisdiction Transfer
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">
                  Reassign Nodal Officer
                </h4>
                <p className="text-xs text-slate-500">
                  Case ID: <strong>{activeActionComplaint.id}</strong> ({activeActionComplaint.district})
                </p>
              </div>
              <button 
                onClick={() => {
                  setActionType(null);
                  setActiveActionComplaint(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReassign} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Current Assigned Officer
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  {activeActionComplaint.assignedNodalOfficer}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Select New Responsible Nodal Officer
                </label>
                <select
                  value={selectedNewOfficer}
                  onChange={(e) => setSelectedNewOfficer(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
                >
                  <option value="">-- Choose Andhra Pradesh Nodal Officer --</option>
                  {nodalOfficers.map((no) => (
                    <option key={no.id} value={`${no.name} (${no.district} Nodal Officer)`}>
                      {no.name} - {no.district} ({no.staffId})
                    </option>
                  ))}
                  {/* Default fallback officers for Vizianagaram, Parvathipuram, Visakhapatnam */}
                  <option value="Er. N. Subba Rao (Nodal Officer & SE Irrigation Vizianagaram), Vizianagaram">
                    Er. N. Subba Rao (Vizianagaram Circle)
                  </option>
                  <option value="Smt. P. Hemalatha (Nodal Officer Parvathipuram Manyam), Parvathipuram Manyam">
                    Smt. P. Hemalatha (Parvathipuram Manyam)
                  </option>
                  <option value="Er. K. Venkata Ramana (Nodal Officer Visakhapatnam), Visakhapatnam">
                    Er. K. Venkata Ramana (Visakhapatnam Metropolitan)
                  </option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionType(null);
                    setActiveActionComplaint(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedNewOfficer}
                  className="px-5 py-2 rounded-xl bg-[#0077B6] hover:bg-[#03045E] disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Confirm Reassignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
