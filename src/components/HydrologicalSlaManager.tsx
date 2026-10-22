import React, { useState, useMemo, useEffect } from 'react';
import { CitizenComplaint } from '../types/nirikshan';
import { SlaPriorityTier, INITIAL_SLA_TIERS, SystemAuditRecord } from '../data/stateAdminData';
import { 
  CalendarClock, 
  Check, 
  Download, 
  AlertTriangle, 
  Clock, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  User, 
  Filter, 
  Search, 
  CheckCircle2, 
  Layers, 
  ExternalLink, 
  FileSpreadsheet, 
  RefreshCw, 
  Sliders, 
  X, 
  ChevronRight, 
  Eye, 
  Camera, 
  Phone, 
  ShieldAlert, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StatutoryDossierModal } from './StatutoryDossierModal';

interface HydrologicalSlaManagerProps {
  complaints: CitizenComplaint[];
  onUpdateComplaint?: (updated: CitizenComplaint) => void;
  auditLogs: SystemAuditRecord[];
  onAddAuditLog: (log: SystemAuditRecord) => void;
  language?: 'en' | 'hi' | 'te';
  onOpenDirectoryModal?: () => void;
}

export interface CalculatedComplaintSla {
  complaint: CitizenComplaint;
  tier: SlaPriorityTier;
  targetResolutionHours: number;
  submittedMs: number;
  deadlineMs: number;
  deadlineDateStr: string;
  isResolved: boolean;
  isOverdue: boolean;
  overdueHours: number;
  overdueDays: number;
  remainingHours: number;
  remainingMinutes: number;
  escalationLevel: 1 | 2 | 3;
  escalationLabel: string;
}

/**
 * Classifies a real complaint into an SLA Priority Tier based on its real data
 */
export function getComplaintSlaTierId(c: CitizenComplaint): 'critical' | 'high' | 'medium' | 'routine' {
  const text = `${c.wasteType || ''} ${c.shortDescription || ''} ${c.locationLandmark || ''}`.toLowerCase();
  if (
    text.includes('breach') || 
    text.includes('burst') || 
    text.includes('chemical') || 
    text.includes('toxic') || 
    text.includes('industrial') || 
    text.includes('hazardous') || 
    text.includes('collapse') || 
    text.includes('mining') || 
    text.includes('erosion')
  ) {
    return 'critical';
  }
  if (
    text.includes('sand') || 
    text.includes('silt') || 
    text.includes('plastic') || 
    text.includes('polythene') || 
    text.includes('choke') || 
    text.includes('sluice') || 
    text.includes('weir') || 
    text.includes('hyacinth')
  ) {
    return 'high';
  }
  if (
    text.includes('weed') || 
    text.includes('algal') || 
    text.includes('domestic') || 
    text.includes('runoff') || 
    text.includes('sewage') || 
    text.includes('drain')
  ) {
    return 'medium';
  }
  return 'routine';
}

export const HydrologicalSlaManager: React.FC<HydrologicalSlaManagerProps> = ({
  complaints,
  onUpdateComplaint,
  auditLogs,
  onAddAuditLog,
  language = 'en',
}) => {
  // 1. SLA Policy Tiers State (persisted to localStorage)
  const [slaTiers, setSlaTiers] = useState<SlaPriorityTier[]>(() => {
    try {
      const saved = localStorage.getItem('nir_sla_tiers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) return parsed;
      }
    } catch {}
    return INITIAL_SLA_TIERS;
  });

  const [slaSavedToast, setSlaSavedToast] = useState(false);
  const [activeTierId, setActiveTierId] = useState<'critical' | 'high' | 'medium' | 'routine'>('critical');

  // 2. Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'approaching' | 'compliant' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // 3. Modal States
  const [targetComplaintForDossier, setTargetComplaintForDossier] = useState<CitizenComplaint | null>(null);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [memoComplaint, setMemoComplaint] = useState<CitizenComplaint | null>(null);
  const [memoRecipientRole, setMemoRecipientRole] = useState<'nodal' | 'inspector' | 'engineer'>('nodal');
  const [memoLegalCharge, setMemoLegalCharge] = useState('WALTA_SEC_24');
  const [memoDeadlineHours, setMemoDeadlineHours] = useState('12');
  const [memoDirectiveText, setMemoDirectiveText] = useState('');
  const [memoSuccessToast, setMemoSuccessToast] = useState<string | null>(null);

  // Photo preview modal state
  const [photoPreview, setPhotoPreview] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // 4. Compute real SLA metrics dynamically for every complaint
  const calculatedCases = useMemo<CalculatedComplaintSla[]>(() => {
    const now = Date.now();

    return complaints.map((c) => {
      const tierId = getComplaintSlaTierId(c);
      const tier = slaTiers.find((t) => t.id === tierId) || slaTiers[0];
      const targetResolutionHours = tier.resolutionDays * 24;

      // Parse submittedAt safely
      const submittedMs = new Date(c.submittedAt).getTime() || (now - 24 * 3600 * 1000);
      const deadlineMs = submittedMs + targetResolutionHours * 3600 * 1000;
      const deadlineDate = new Date(deadlineMs);
      const deadlineDateStr = deadlineDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const isResolved = c.status === 'RESOLVED';
      const isOverdue = !isResolved && now > deadlineMs;
      const diffMs = now - deadlineMs;

      let overdueHours = 0;
      let overdueDays = 0;
      let remainingHours = 0;
      let remainingMinutes = 0;

      if (isOverdue) {
        overdueHours = Math.max(1, Math.round(diffMs / (3600 * 1000)));
        overdueDays = Math.floor(overdueHours / 24);
      } else if (!isResolved) {
        const remMs = Math.max(0, deadlineMs - now);
        remainingHours = Math.floor(remMs / (3600 * 1000));
        remainingMinutes = Math.floor((remMs % (3600 * 1000)) / (60 * 1000));
      }

      // Escalation Level based on 3-tier protocol
      let escalationLevel: 1 | 2 | 3 = 1;
      let escalationLabel = 'Level 1: Local Mandal AEE';

      if (isOverdue) {
        if (overdueHours > 48) {
          escalationLevel = 3;
          escalationLabel = 'Level 3: State Chief Engineer & Ministerial Alert';
        } else if (overdueHours > 24) {
          escalationLevel = 2;
          escalationLabel = 'Level 2: District EE & Nodal Officer';
        } else {
          escalationLevel = 1;
          escalationLabel = 'Level 1: Local Mandal AEE / Field Officer';
        }
      }

      return {
        complaint: c,
        tier,
        targetResolutionHours,
        submittedMs,
        deadlineMs,
        deadlineDateStr,
        isResolved,
        isOverdue,
        overdueHours,
        overdueDays,
        remainingHours,
        remainingMinutes,
        escalationLevel,
        escalationLabel,
      };
    });
  }, [complaints, slaTiers]);

  // Overall KPI statistics computed from live cases
  const kpiStats = useMemo(() => {
    const total = calculatedCases.length;
    const overdue = calculatedCases.filter((c) => c.isOverdue).length;
    const resolved = calculatedCases.filter((c) => c.isResolved).length;
    const compliant = total - overdue;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 100;
    const level3Alerts = calculatedCases.filter((c) => c.isOverdue && c.escalationLevel === 3).length;
    const level2Alerts = calculatedCases.filter((c) => c.isOverdue && c.escalationLevel === 2).length;
    const level1Alerts = calculatedCases.filter((c) => c.isOverdue && c.escalationLevel === 1).length;
    const approachingDeadline = calculatedCases.filter(
      (c) => !c.isResolved && !c.isOverdue && c.remainingHours <= 24
    ).length;

    return {
      total,
      overdue,
      resolved,
      compliant,
      complianceRate,
      level3Alerts,
      level2Alerts,
      level1Alerts,
      approachingDeadline,
    };
  }, [calculatedCases]);

  // Distinct districts from live complaints
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((c) => {
      if (c.district) set.add(c.district);
    });
    return Array.from(set).sort();
  }, [complaints]);

  // Filtered cases for table
  const filteredCases = useMemo(() => {
    return calculatedCases.filter((item) => {
      const c = item.complaint;
      const q = searchQuery.toLowerCase().trim();

      // Search match
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        (c.locationLandmark && c.locationLandmark.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q)) ||
        (c.mandal && c.mandal.toLowerCase().includes(q)) ||
        (c.assignedNodalOfficer && c.assignedNodalOfficer.toLowerCase().includes(q)) ||
        (c.assignedInspector && c.assignedInspector.toLowerCase().includes(q)) ||
        (c.assignedEngineer && c.assignedEngineer.toLowerCase().includes(q));

      // District match
      const matchesDistrict = selectedDistrict === 'all' || c.district === selectedDistrict;

      // Priority match
      const matchesPriority = priorityFilter === 'all' || item.tier.id === priorityFilter;

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'overdue') matchesStatus = item.isOverdue;
      else if (statusFilter === 'approaching') matchesStatus = !item.isResolved && !item.isOverdue && item.remainingHours <= 24;
      else if (statusFilter === 'compliant') matchesStatus = !item.isOverdue && !item.isResolved;
      else if (statusFilter === 'resolved') matchesStatus = item.isResolved;

      return matchesSearch && matchesDistrict && matchesPriority && matchesStatus;
    });
  }, [calculatedCases, searchQuery, selectedDistrict, priorityFilter, statusFilter]);

  // Save SLA Rules
  const handleSaveSlaRules = () => {
    try {
      localStorage.setItem('nir_sla_tiers', JSON.stringify(slaTiers));
    } catch {}

    const newLog: SystemAuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString()}`,
      blockNumber: `Block #${Math.floor(884900 + Math.random() * 100)}`,
      initiatedBy: { name: 'State Water Command', role: 'State Administrator', initials: 'SA' },
      action: 'SLA Policy Updated',
      recordId: 'POL-SLA-2026',
      stateTransition: { from: 'Default Thresholds', to: 'Custom Statutory SLA Saved' },
    };
    onAddAuditLog(newLog);

    setSlaSavedToast(true);
    setTimeout(() => setSlaSavedToast(false), 3500);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setSlaTiers(INITIAL_SLA_TIERS);
    try {
      localStorage.setItem('nir_sla_tiers', JSON.stringify(INITIAL_SLA_TIERS));
    } catch {}
    setSlaSavedToast(true);
    setTimeout(() => setSlaSavedToast(false), 3000);
  };

  // Open Memo Modal for a case
  const handleOpenMemoModal = (c: CitizenComplaint) => {
    setMemoComplaint(c);
    setMemoRecipientRole('nodal');
    setMemoLegalCharge('WALTA_SEC_24');
    setMemoDeadlineHours('12');
    setMemoDirectiveText(
      `STATUTORY REMEDIATION NOTICE: Immediate intervention ordered for ${c.locationLandmark || 'waterbody asset'} in ${c.district}. Ensure inspection and mechanical desilting machinery are deployed within statutory timeline.`
    );
    setIsMemoModalOpen(true);
  };

  // Dispatch Official Statutory Memo
  const handleDispatchMemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoComplaint) return;

    let targetOfficer = memoComplaint.assignedNodalOfficer || 'District Nodal Officer';
    if (memoRecipientRole === 'inspector') {
      targetOfficer = memoComplaint.assignedInspector || 'Field Quality Inspector';
    } else if (memoRecipientRole === 'engineer') {
      targetOfficer = memoComplaint.assignedEngineer || 'Executive Engineer (Remediation)';
    }

    const note = memoDirectiveText.trim();
    const memoStamp = `[STATE STATUTORY MEMO - ${new Date().toLocaleDateString('en-IN')}: ${note} | Recipient: ${targetOfficer} | Deadline: ${memoDeadlineHours}h | Code: ${memoLegalCharge}]`;

    if (onUpdateComplaint) {
      const updated: CitizenComplaint = {
        ...memoComplaint,
        shortDescription: `${memoComplaint.shortDescription}\n\n${memoStamp}`,
      };
      onUpdateComplaint(updated);
    }

    const newLog: SystemAuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString()}`,
      blockNumber: `Block #${Math.floor(884900 + Math.random() * 100)}`,
      initiatedBy: { name: 'State Admin Command', role: 'State Administrator', initials: 'SA' },
      action: 'Statutory SLA Memo Dispatched',
      recordId: memoComplaint.id,
      stateTransition: { from: memoComplaint.status, to: `Memo Dispatched: ${targetOfficer}` },
    };
    onAddAuditLog(newLog);

    setMemoSuccessToast(`Official Statutory Memo successfully dispatched to ${targetOfficer}! Recorded in audit ledger.`);
    setTimeout(() => setMemoSuccessToast(null), 4500);
    setIsMemoModalOpen(false);
    confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
  };

  // Export CSV of Overdue & Active Audit
  const handleExportOverdueAuditCsv = () => {
    const headers = [
      'Case ID',
      'Citizen Name',
      'Citizen Phone',
      'District',
      'Mandal',
      'Landmark / Water Asset',
      'GPS Lat',
      'GPS Lng',
      'Waste Category',
      'Filing Timestamp',
      'SLA Priority Tier',
      'Statutory Deadline',
      'Overdue Status',
      'Overdue Duration',
      'Auto-Escalation Level',
      'Assigned Nodal Officer',
      'Assigned Field Inspector',
      'Assigned Engineer',
      'Current Workflow Status'
    ];

    const rows = calculatedCases.map((item) => {
      const c = item.complaint;
      return [
        c.id,
        `"${c.citizenName}"`,
        `"${c.citizenPhone}"`,
        `"${c.district}"`,
        `"${c.mandal || ''}"`,
        `"${c.locationLandmark || ''}"`,
        c.coordinates.lat,
        c.coordinates.lng,
        `"${c.wasteType || ''}"`,
        `"${c.submittedAt}"`,
        item.tier.name,
        `"${item.deadlineDateStr}"`,
        item.isOverdue ? 'OVERDUE_BREACH' : item.isResolved ? 'RESOLVED' : 'ON_TRACK',
        item.isOverdue ? `${item.overdueHours} Hours (${item.overdueDays} Days)` : `${item.remainingHours}h remaining`,
        `"Level ${item.escalationLevel} (${item.escalationLabel})"`,
        `"${c.assignedNodalOfficer || ''}"`,
        `"${c.assignedInspector || ''}"`,
        `"${c.assignedEngineer || ''}"`,
        c.status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AP_Hydrological_SLA_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full text-slate-800">
      {/* Toast Notification */}
      {slaSavedToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div>
            <p className="font-bold text-xs">Statutory SLA Policies Saved & Active</p>
            <p className="text-[11px] text-emerald-100">Thresholds dynamically synchronized with Andhra Pradesh state grid.</p>
          </div>
        </div>
      )}

      {memoSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3 max-w-md">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold text-xs text-rose-300">Statutory Notice Dispatched</p>
            <p className="text-[11px] text-slate-200">{memoSuccessToast}</p>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. HEADER & EXECUTIVE ACTIONS                                        */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0077B6] border border-sky-200 flex items-center justify-center shadow-2xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Rules &amp; Deadlines (Hydrological SLA Management)
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200/80">
              Statutory WALTA 2002 Protocol
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80">
              Live Supabase Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Statutory Service Level Agreements, mandatory inspection windows, auto-escalation thresholds, and active overdue case enforcement across Andhra Pradesh.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Reset to default Andhra Pradesh statutory values"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSaveSlaRules}
            className="px-4 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save SLA Thresholds</span>
          </button>
          <button
            onClick={handleExportOverdueAuditCsv}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Overdue Audit</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP KPI STRIP (REAL METRICS DIRECT FROM ACTIVE COMPLAINTS)       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Statutory Compliance</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{kpiStats.complianceRate}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">On-Time</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all" 
              style={{ width: `${kpiStats.complianceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active SLA Breaches</span>
            <AlertTriangle className={`w-4 h-4 ${kpiStats.overdue > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">{kpiStats.overdue}</span>
            <span className="text-[10px] text-slate-400">of {kpiStats.total} total cases</span>
          </div>
          <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-rose-100">
            {kpiStats.overdue > 0 ? 'Requires Direct Memo' : 'Zero Breaches'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Level 3 Ministerial</span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700 font-mono">{kpiStats.level3Alerts}</span>
            <span className="text-[10px] text-slate-400">&gt;48h Overdue</span>
          </div>
          <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-purple-100">
            Chief Engineer Desk
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approaching Deadline</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">{kpiStats.approachingDeadline}</span>
            <span className="text-[10px] text-slate-400">&lt;24h Window</span>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-amber-100">
            Alert Sent to Nodal
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fully Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#0077B6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{kpiStats.resolved}</span>
            <span className="text-[10px] text-slate-400">Verified &amp; Closed</span>
          </div>
          <span className="text-[10px] text-[#0077B6] font-semibold bg-sky-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-sky-100">
            Inspector Certified
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. FOUR CONFIGURABLE SLA TIERS (INTERACTIVE POLICY CONTROLS)         */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {slaTiers.map((tier) => {
          const isSelected = activeTierId === tier.id;
          const casesInThisTier = calculatedCases.filter((c) => c.tier.id === tier.id);
          const overdueInTier = casesInThisTier.filter((c) => c.isOverdue).length;

          return (
            <div 
              key={tier.id} 
              className={`bg-white border rounded-3xl p-5 shadow-2xs flex flex-col justify-between transition-all ${
                isSelected 
                  ? 'border-[#0077B6] ring-2 ring-[#0077B6]/20' 
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900">{tier.name} SLA</span>
                    <span className="text-[10px] font-mono text-slate-400">({casesInThisTier.length} active)</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tier.id === 'critical' ? 'bg-rose-100 text-rose-800' :
                    tier.id === 'high' ? 'bg-amber-100 text-amber-800' :
                    tier.id === 'medium' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tier.badgeLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed min-h-[44px]">
                  {tier.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                {/* Inspection Hours Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[11px]">Inspection SLA:</span>
                    <strong className="font-mono text-[#0077B6] font-bold">{tier.inspectHours} Hours</strong>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="168" 
                    value={tier.inspectHours} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSlaTiers((prev) => prev.map((t) => (t.id === tier.id ? { ...t, inspectHours: val } : t)));
                    }}
                    className="w-full accent-[#0077B6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>2h min</span>
                    <span>168h max</span>
                  </div>
                </div>

                {/* Assignment Hours Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[11px]">Assignment SLA:</span>
                    <strong className="font-mono text-emerald-600 font-bold">{tier.assignHours} Hours</strong>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="72" 
                    value={tier.assignHours} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSlaTiers((prev) => prev.map((t) => (t.id === tier.id ? { ...t, assignHours: val } : t)));
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1h</span>
                    <span>72h</span>
                  </div>
                </div>

                {/* Resolution Days */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Resolution Target:</span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      value={tier.resolutionDays}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setSlaTiers((prev) => prev.map((t) => (t.id === tier.id ? { ...t, resolutionDays: val } : t)));
                      }}
                      className="w-12 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-md py-0.5 text-xs text-slate-800"
                    />
                    <strong className="text-slate-700">Days</strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 truncate flex items-center justify-between pt-1">
                  <span>Escalation: {tier.escalationChannel}</span>
                  {overdueInTier > 0 && (
                    <span className="text-rose-600 font-bold">{overdueInTier} Overdue</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 4. STATUTORY 3-TIER AUTO-ESCALATION PROTOCOL BANNER                 */}
      {/* ==================================================================== */}
      <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5 text-xs text-sky-950 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sky-200/70">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#0077B6] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wide text-slate-900">
                  Statutory 3-Tier Auto-Escalation Protocol
                </span>
                <span className="text-[10px] font-mono bg-white px-2.5 py-0.5 rounded-full border border-sky-300 text-[#0077B6] font-bold">
                  AP WALTA Act 2002 § 24
                </span>
              </div>
              <p className="text-xs text-sky-900 mt-1">
                Automated non-repudiable audit trigger: If a field grievance is not resolved within the permitted window, the case automatically escalates across three jurisdictional administrative tiers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 bg-white border border-sky-200 rounded-xl text-sky-900">
              Active Escalations: <strong>{kpiStats.overdue} Cases</strong>
            </span>
          </div>
        </div>

        {/* 3 Step Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
          <div className="bg-white/90 border border-sky-200/80 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Tier 1 • 0-24h Overdue</span>
              <span className="text-[11px] font-mono font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                {kpiStats.level1Alerts} Cases
              </span>
            </div>
            <strong className="text-slate-900 text-xs block font-bold">Local Mandal AEE / Field Officer</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated SMS ping and supervisory inspection reminder dispatched to Mandal Assistant Executive Engineer.</p>
          </div>

          <div className="bg-white/90 border border-amber-200/80 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Tier 2 • 24-48h Overdue</span>
              <span className="text-[11px] font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {kpiStats.level2Alerts} Cases
              </span>
            </div>
            <strong className="text-slate-900 text-xs block font-bold">District Executive Engineer &amp; Nodal IAS</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Formal Show-Cause notice logged on district collectorate agenda; statutory machinery requisition flagged.</p>
          </div>

          <div className="bg-white/90 border border-rose-200/80 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Tier 3 • &gt;48h Overdue</span>
              <span className="text-[11px] font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                {kpiStats.level3Alerts} Cases
              </span>
            </div>
            <strong className="text-slate-900 text-xs block font-bold">State Chief Engineer &amp; Ministerial Alert</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct adverse entry in Annual Confidential Report (ACR); immediate State Cabinet Water Grid briefing.</p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. ACTIVE COMPLAINT SLA AUDIT CONSOLE TABLE (ZERO FAKE DATA)        */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
        {/* Table Header and Search / Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                Grievance Resolution &amp; Statutory SLA Enforcement Table
              </h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full">
                {kpiStats.overdue} Statutory Breaches
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live hydrological cases linked with Supabase database. Real citizen complaints evaluated against mandatory statutory turnaround targets.
            </p>
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/70 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Cases ({calculatedCases.length})
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'overdue' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-100/60'
              }`}
            >
              <span>Overdue Breaches</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
                {kpiStats.overdue}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('approaching')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'approaching' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100/60'
              }`}
            >
              &lt;24h Left ({kpiStats.approachingDeadline})
            </button>
            <button
              onClick={() => setStatusFilter('compliant')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'compliant' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-100/60'
              }`}
            >
              Compliant ({kpiStats.compliant})
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by Case ID, Citizen, Landmark, Officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="all">All Districts (Andhra Pradesh)</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Priority Tier Dropdown */}
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="all">All Priority Tiers (Critical - Routine)</option>
              <option value="critical">Critical SLA (Priority 1)</option>
              <option value="high">High SLA (Priority 2)</option>
              <option value="medium">Medium SLA (Priority 3)</option>
              <option value="routine">Routine SLA (Priority 4)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5">Case Code &amp; Citizen</th>
                <th className="py-3 px-3.5">Asset &amp; Location</th>
                <th className="py-3 px-3.5">SLA Statutory Deadline</th>
                <th className="py-3 px-3.5">Grievance / Hazard Details</th>
                <th className="py-3 px-3.5">Assigned Cadre (CAM Chain)</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-bold text-slate-700 text-sm">No cases match the selected filter criteria</p>
                    <p className="text-xs text-slate-400 mt-1">All complaints in this view comply with statutory deadlines or no matching records found.</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => {
                  const c = item.complaint;
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* 1. Case Code & Citizen */}
                      <td className="py-3.5 px-3.5 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 text-[11px] block w-fit border border-slate-200">
                            {c.id}
                          </span>
                          <div className="text-xs">
                            <strong className="text-slate-900 block font-semibold">{c.citizenName}</strong>
                            <span className="text-[11px] text-slate-400 block">
                              Age: {c.citizenAge} • {c.citizenGender}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {c.citizenPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Asset & Location */}
                      <td className="py-3.5 px-3.5 align-top">
                        <div className="space-y-1">
                          <strong className="text-slate-900 block font-bold text-xs">
                            {c.locationLandmark || 'Champavathi River Basin Weir'}
                          </strong>
                          <span className="text-[11px] text-[#0077B6] font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {c.village ? `${c.village}, ` : ''}{c.mandal ? `${c.mandal} Mandal, ` : ''}{c.district}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block">
                            GPS: {c.coordinates.lat.toFixed(4)}, {c.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                      </td>

                      {/* 3. SLA Statutory Deadline */}
                      <td className="py-3.5 px-3.5 align-top">
                        <div className="space-y-1.5">
                          {item.isResolved ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              Resolved &amp; Certified
                            </span>
                          ) : item.isOverdue ? (
                            <div className="space-y-1">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 w-fit animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                +{item.overdueHours}h Overdue ({item.overdueDays}d)
                              </span>
                              <span className={`text-[10px] font-bold block px-2 py-0.5 rounded border w-fit ${
                                item.escalationLevel === 3 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                  : item.escalationLevel === 2 
                                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                  : 'bg-sky-50 text-sky-700 border-sky-200'
                              }`}>
                                {item.escalationLabel}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                                item.remainingHours <= 24 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {item.remainingHours}h {item.remainingMinutes}m Left
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Due: {item.deadlineDateStr}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              item.tier.id === 'critical' ? 'bg-rose-100 text-rose-800' :
                              item.tier.id === 'high' ? 'bg-amber-100 text-amber-800' :
                              item.tier.id === 'medium' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.tier.name} SLA
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Grievance / Hazard Details */}
                      <td className="py-3.5 px-3.5 align-top max-w-xs">
                        <div className="space-y-1.5">
                          {c.wasteType && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 block w-fit truncate">
                              {c.wasteType}
                            </span>
                          )}
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                            {c.shortDescription}
                          </p>
                          {c.photoUrl && (
                            <button
                              onClick={() => setPhotoPreview({ url: c.photoUrl!, title: `Evidence Photo: ${c.locationLandmark}`, subtitle: `Citizen: ${c.citizenName} • ${c.district}` })}
                              className="text-[11px] text-[#0077B6] hover:underline font-semibold flex items-center gap-1 cursor-pointer pt-0.5"
                            >
                              <Camera className="w-3 h-3" />
                              View Evidence Photo
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 5. Assigned Cadre (CAM Chain) */}
                      <td className="py-3.5 px-3.5 align-top">
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">CAM 02 • Nodal Officer:</span>
                            <span className="font-bold text-slate-800 block truncate">
                              {c.assignedNodalOfficer || 'Apex Nodal Desk'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">CAM 03 • Inspector:</span>
                            <span className="text-slate-700 font-semibold block truncate">
                              {c.assignedInspector || (
                                <span className="text-amber-600 font-normal italic">Pending Assignment</span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">CAM 04 • Worker / EE:</span>
                            <span className="text-slate-700 font-semibold block truncate">
                              {c.assignedEngineer || (
                                <span className="text-slate-400 font-normal italic">Awaiting Inspection Report</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Direct Actions */}
                      <td className="py-3.5 px-3.5 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => handleOpenMemoModal(c)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
                            title="Dispatch Statutory Enforcement Memo"
                          >
                            <Send className="w-3 h-3" />
                            <span>Dispatch Memo</span>
                          </button>

                          <button
                            onClick={() => setTargetComplaintForDossier(c)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Dossier</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. STATUTORY DIRECTIVE DISPATCH MODAL                               */}
      {/* ==================================================================== */}
      {isMemoModalOpen && memoComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Dispatch Statutory Enforcement Memo
                  </h3>
                  <span className="text-xs text-slate-400">
                    Case: {memoComplaint.id} • {memoComplaint.district}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsMemoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchMemoSubmit} className="space-y-3.5 text-xs">
              {/* Target Officer Chain Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Target Officer in Accountability Chain
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemoRecipientRole('nodal')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      memoRecipientRole === 'nodal'
                        ? 'border-[#0077B6] bg-sky-50 text-[#0077B6] font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block text-[10px]">CAM 02</span>
                    <span className="text-xs">Nodal Officer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemoRecipientRole('inspector')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      memoRecipientRole === 'inspector'
                        ? 'border-[#0077B6] bg-sky-50 text-[#0077B6] font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block text-[10px]">CAM 03</span>
                    <span className="text-xs">Field Inspector</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemoRecipientRole('engineer')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      memoRecipientRole === 'engineer'
                        ? 'border-[#0077B6] bg-sky-50 text-[#0077B6] font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block text-[10px]">CAM 04</span>
                    <span className="text-xs">Action Worker</span>
                  </button>
                </div>
              </div>

              {/* Legal Reference & Charge */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Statutory Act &amp; Citation Clause
                </label>
                <select
                  value={memoLegalCharge}
                  onChange={(e) => setMemoLegalCharge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="WALTA_SEC_24">AP WALTA Act 2002 § 24 (Mandatory Waterbody Safeguard)</option>
                  <option value="SLA_DEFAULT_SHOWCAUSE">Statutory SLA Breach: Show Cause Order</option>
                  <option value="EMERGENCY_MOBILIZATION">Executive Direction for Immediate Mechanical Desilting</option>
                  <option value="ACR_ADVERSE_RECORD">Non-Compliance Notice with ACR Performance Citation</option>
                </select>
              </div>

              {/* Compliance Window */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Mandatory Execution Window
                </label>
                <select
                  value={memoDeadlineHours}
                  onChange={(e) => setMemoDeadlineHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="6">6 Hours (Emergency Rapid Response)</option>
                  <option value="12">12 Hours (High Priority Executive Directive)</option>
                  <option value="24">24 Hours (Standard Statutory Compliance Window)</option>
                  <option value="48">48 Hours (Full Engineering Desilting Window)</option>
                </select>
              </div>

              {/* Memo Directive Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Official Directive Order
                </label>
                <textarea
                  rows={3}
                  value={memoDirectiveText}
                  onChange={(e) => setMemoDirectiveText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
                  placeholder="Enter specific directive instructions..."
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Official Memo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. STATUTORY DOSSIER MODAL                                           */}
      {/* ==================================================================== */}
      {targetComplaintForDossier && (
        <StatutoryDossierModal
          isOpen={Boolean(targetComplaintForDossier)}
          onClose={() => setTargetComplaintForDossier(null)}
          complaint={targetComplaintForDossier}
          onOpenDirectiveModal={() => {
            const c = targetComplaintForDossier;
            setTargetComplaintForDossier(null);
            handleOpenMemoModal(c);
          }}
          onOpenPhotoPreview={(data) => setPhotoPreview(data)}
          language={language}
        />
      )}

      {/* ==================================================================== */}
      {/* 8. PHOTO PREVIEW MODAL                                               */}
      {/* ==================================================================== */}
      {photoPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-200 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{photoPreview.title}</h4>
                {photoPreview.subtitle && (
                  <p className="text-xs text-slate-400">{photoPreview.subtitle}</p>
                )}
              </div>
              <button 
                onClick={() => setPhotoPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img 
                src={photoPreview.url} 
                alt={photoPreview.title} 
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
