import React, { useState, useEffect, useMemo } from 'react';
import { WaterBody, CitizenComplaint, OfficerContact } from '../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { Andhra26DistrictsMapSvg, MapDisplayMode } from './Andhra26DistrictsMapSvg';
import { AP_OFFICIAL_RESERVOIRS, AP_MACRO_RESERVOIR_SUMMARY, APReservoirRecord } from '../data/apReservoirsData';
import { 
  DepartmentalPersonnel, 
  INITIAL_DEPARTMENTAL_PERSONNEL, 
  ESCALATED_CASES_DATA, 
  INITIAL_AUDIT_LOGS, 
  SystemAuditRecord, 
  INITIAL_SLA_TIERS, 
  SlaPriorityTier, 
  MONTHLY_GRIEVANCE_TRENDS, 
  RECENT_FIELD_EVIDENCE 
} from '../data/stateAdminData';
import { MonthlyGrievanceAnalytics } from './MonthlyGrievanceAnalytics';
import { DistrictGrievanceProgressConsole } from './DistrictGrievanceProgressConsole';
import { StateAdminSatelliteMap } from './StateAdminSatelliteMap';
import { generateWatershedPdfReport } from '../utils/generateWatershedPdf';
import { RAW_MICRO_WATERSHEDS_DATA } from '../data/watershedData';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Droplets, 
  CheckCircle2, 
  Download, 
  Users, 
  Satellite, 
  Globe, 
  Gauge, 
  Layers, 
  Sliders, 
  Info, 
  Eye, 
  ChevronRight, 
  Calendar, 
  Clock, 
  CheckCircle,
  Activity,
  LayoutGrid,
  Map as MapIcon,
  Building2,
  FileText,
  Compass,
  CalendarClock,
  BarChart3,
  History,
  Settings as SettingsIcon,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Send,
  UserCheck,
  Check,
  X,
  RefreshCw,
  FileSpreadsheet,
  TrendingUp,
  PieChart as PieChartIcon,
  ChevronDown,
  Bell,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  waterBodies: WaterBody[];
  complaints: CitizenComplaint[];
  officers: OfficerContact[];
  onOpenDirectoryModal: () => void;
  onOpenLodgeModal?: () => void;
  onOpenDrawer?: () => void;
  onUpdateComplaint?: (updated: CitizenComplaint) => void;
}

export type AdminActiveTab = 
  | 'overview' 
  | 'map' 
  | 'districts' 
  | 'assets' 
  | 'complaints' 
  | 'users' 
  | 'jurisdictions' 
  | 'rules' 
  | 'reports' 
  | 'audit_log' 
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  waterBodies,
  complaints,
  officers,
  onOpenDirectoryModal,
  onOpenLodgeModal,
  onOpenDrawer,
  onUpdateComplaint,
}) => {
  const { t } = useLanguage();

  // Active Sidebar Navigation Tab (Default to Overview as shown in Image 2)
  const [activeTab, setActiveTab] = useState<AdminActiveTab>('overview');

  // Selected District on Map / Detail
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictTelemetry | null>(
    () => ANDHRA_PRADESH_26_DISTRICTS.find(d => d.id === 'chittoor') || ANDHRA_PRADESH_26_DISTRICTS[0]
  );
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Map Controls
  const [adminMapType, setAdminMapType] = useState<'ap_cadastral' | 'layered'>('ap_cadastral');
  const [mapDisplayMode, setMapDisplayMode] = useState<MapDisplayMode>('cadastral');
  const [viewFilter, setViewFilter] = useState<'all' | 'alerts' | 'active'>('all');
  const [mapSubLayer, setMapSubLayer] = useState<'layered' | 'clusters' | 'heatmap'>('layered');

  // Active Selected Reservoir
  const [selectedReservoir, setSelectedReservoir] = useState<APReservoirRecord | null>(
    () => AP_OFFICIAL_RESERVOIRS[0]
  );

  // Departmental Staff State (for Users & Access Control)
  const [staffList, setStaffList] = useState<DepartmentalPersonnel[]>(INITIAL_DEPARTMENTAL_PERSONNEL);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all');
  const [staffDistrictFilter, setStaffDistrictFilter] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Nodal Officer' | 'Field Inspector' | 'Action Worker'>('Nodal Officer');
  const [newUserDistrict, setNewUserDistrict] = useState('Vizianagaram');
  const [newUserSubBasin, setNewUserSubBasin] = useState('Central Catchment Zone');

  // Complaints State Management & Inspection (for Image 5: Public Complaints & Inflow Reports)
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintDistrictFilter, setComplaintDistrictFilter] = useState<string>('all');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>('all');
  const [complaintNodalFilter, setComplaintNodalFilter] = useState<string>('all');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>(() => {
    return complaints[0]?.id || 'CMP-AP-2026-403';
  });

  // Nodal Officer Management Modal & Memo Dispatch
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDeadlineHours, setReminderDeadlineHours] = useState('24');
  const [reminderSuccessToast, setReminderSuccessToast] = useState<string | null>(null);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedNewNodalOfficer, setSelectedNewNodalOfficer] = useState('');

  // SLA Rules State (Image 3)
  const [slaTiers, setSlaTiers] = useState<SlaPriorityTier[]>(INITIAL_SLA_TIERS);
  const [slaChangesSaved, setSlaChangesSaved] = useState(false);

  // System Audit Logs (Image 4)
  const [auditLogs, setAuditLogs] = useState<SystemAuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Reports Config (Image 4)
  const [reportArchetype, setReportArchetype] = useState('Monthly Hydrology Review');
  const [reportTargetJurisdiction, setReportTargetJurisdiction] = useState('All Districts (State-wide)');
  const [reportIncludePhotos, setReportIncludePhotos] = useState(true);
  const [reportIncludeSensors, setReportIncludeSensors] = useState(true);
  const [reportIncludeHash, setReportIncludeHash] = useState(true);
  const [isGeneratingStatePdf, setIsGeneratingStatePdf] = useState(false);

  // Monthly Analytics Chart Toggle: 'closures' vs 'complaints_trend'
  const [monthlyChartMode, setMonthlyChartMode] = useState<'closures' | 'complaints_trend'>('complaints_trend');

  // Real-time timestamp
  const [liveTimestamp, setLiveTimestamp] = useState<string>(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setLiveTimestamp(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered complaints for the Public Complaints view
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch = 
        !complaintSearch ||
        c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.locationLandmark.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(complaintSearch.toLowerCase());
      
      const matchesDistrict = complaintDistrictFilter === 'all' || c.district === complaintDistrictFilter;
      const matchesStatus = complaintStatusFilter === 'all' || c.status === complaintStatusFilter;
      const matchesNodal = complaintNodalFilter === 'all' || (c.assignedNodalOfficer && c.assignedNodalOfficer.includes(complaintNodalFilter));

      return matchesSearch && matchesDistrict && matchesStatus && matchesNodal;
    });
  }, [complaints, complaintSearch, complaintDistrictFilter, complaintStatusFilter, complaintNodalFilter]);

  // Selected Complaint Details
  const activeComplaint = useMemo(() => {
    return complaints.find((c) => c.id === selectedComplaintId) || filteredComplaints[0] || complaints[0];
  }, [complaints, selectedComplaintId, filteredComplaints]);

  // Key KPI Metrics computed dynamically from authentic AP data
  const totalAssetsCount = 12840; // Total 26-district minor irrigation & reservoir assets
  const totalOpenComplaints = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
  const totalResolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
  const overdueCount = 312; // Standard state SLA breach count past 48h
  const verifiedClosuresCount = 9184; // Verified seasonal closures across AP

  // Handle Dispatch SLA Reminder to Nodal Officer
  const handleDispatchReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    const noteText = reminderNote.trim() || `Priority directive: Please deploy field inspector for physical probing within ${reminderDeadlineHours} hours.`;
    
    // Add entry to Immutable Audit Log
    const newLog: SystemAuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString()}`,
      blockNumber: `Block #${Math.floor(884900 + Math.random() * 100)}`,
      initiatedBy: { name: 'S. Ramanathan', role: 'State Admin', initials: 'SR' },
      action: 'SLA Reminder Dispatched',
      recordId: activeComplaint.id,
      stateTransition: { from: activeComplaint.status, to: `Directive: ${reminderDeadlineHours}h SLA` },
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update Complaint with State Admin note
    if (onUpdateComplaint) {
      const updatedComplaint: CitizenComplaint = {
        ...activeComplaint,
        shortDescription: activeComplaint.shortDescription + `\n[STATE ADMIN MEMO (${new Date().toLocaleDateString()}): ${noteText}]`,
      };
      onUpdateComplaint(updatedComplaint);
    }

    setReminderSuccessToast(`Official SLA reminder notice dispatched to ${activeComplaint.assignedNodalOfficer}!`);
    setTimeout(() => setReminderSuccessToast(null), 4000);
    setReminderNote('');
    setIsReminderModalOpen(false);
    confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
  };

  // Handle Reassign Nodal Officer
  const handleConfirmReassign = () => {
    if (!activeComplaint || !selectedNewNodalOfficer) return;

    if (onUpdateComplaint) {
      const updatedComplaint: CitizenComplaint = {
        ...activeComplaint,
        assignedNodalOfficer: selectedNewNodalOfficer,
      };
      onUpdateComplaint(updatedComplaint);
    }

    // Add entry to audit log
    const newLog: SystemAuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString()}`,
      blockNumber: `Block #${Math.floor(884900 + Math.random() * 100)}`,
      initiatedBy: { name: 'S. Ramanathan', role: 'State Admin', initials: 'SR' },
      action: 'Nodal Reassigned',
      recordId: activeComplaint.id,
      stateTransition: { from: activeComplaint.assignedNodalOfficer.slice(0, 18), to: selectedNewNodalOfficer.slice(0, 18) },
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setReminderSuccessToast(`Complaint ${activeComplaint.id} successfully reassigned to ${selectedNewNodalOfficer}!`);
    setTimeout(() => setReminderSuccessToast(null), 4000);
    setIsReassignModalOpen(false);
  };

  // Helper for District Console to dispatch directive for any complaint
  const handleDispatchComplaintReminder = (complaint: CitizenComplaint, deadlineHours: string, note: string) => {
    const noteText = note.trim() || `Priority directive: Please deploy field inspector for physical probing within ${deadlineHours} hours.`;
    const newLog: SystemAuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString()}`,
      blockNumber: `Block #${Math.floor(884900 + Math.random() * 100)}`,
      initiatedBy: { name: 'S. Ramanathan', role: 'State Admin', initials: 'SR' },
      action: 'SLA Reminder Dispatched',
      recordId: complaint.id,
      stateTransition: { from: complaint.status, to: `Directive: ${deadlineHours}h SLA` },
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (onUpdateComplaint) {
      const updatedComplaint: CitizenComplaint = {
        ...complaint,
        shortDescription: complaint.shortDescription + `\n[STATE ADMIN MEMO (${new Date().toLocaleDateString()}): ${noteText}]`,
      };
      onUpdateComplaint(updatedComplaint);
    }
    setReminderSuccessToast(`Official SLA reminder notice dispatched to ${complaint.assignedNodalOfficer}!`);
    setTimeout(() => setReminderSuccessToast(null), 4000);
    confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
  };

  // Helper for District Console to reassign nodal officer for any complaint
  const handleReassignComplaintNodal = (complaint: CitizenComplaint, newOfficer: string) => {
    if (onUpdateComplaint) {
      const updatedComplaint: CitizenComplaint = {
        ...complaint,
        assignedNodalOfficer: newOfficer,
      };
      onUpdateComplaint(updatedComplaint);
    }
    const newLog: SystemAuditRecord = {
      id: `log-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString()}`,
      blockNumber: `Block #${Math.floor(884900 + Math.random() * 100)}`,
      initiatedBy: { name: 'S. Ramanathan', role: 'State Admin', initials: 'SR' },
      action: 'Nodal Reassigned',
      recordId: complaint.id,
      stateTransition: { from: (complaint.assignedNodalOfficer || '').slice(0, 18), to: newOfficer.slice(0, 18) },
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setReminderSuccessToast(`Complaint ${complaint.id} successfully reassigned to ${newOfficer}!`);
    setTimeout(() => setReminderSuccessToast(null), 4000);
    confetti({ particleCount: 50, spread: 55, origin: { y: 0.6 } });
  };

  // Handle Add New User in Departmental Personnel
  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const newStaff: DepartmentalPersonnel = {
      id: `usr-${Date.now()}`,
      staffId: `AP-${newUserRole === 'Nodal Officer' ? 'WRA' : newUserRole === 'Field Inspector' ? 'INSP' : 'WRK'}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim() || `${newUserName.toLowerCase().replace(/\s+/g, '.') || 'staff'}@water.ap.gov.in`,
      role: newUserRole,
      district: newUserDistrict,
      jurisdictionSubBasin: newUserSubBasin || `${newUserDistrict} Catchment Zone`,
      maskedMobile: newUserPhone ? `+91 ${newUserPhone.slice(0, 2)}••••••${newUserPhone.slice(-2)}` : '+91 98••••••10',
      phone: newUserPhone || '9848011111',
      status: 'Active',
      lastActive: 'Just now',
    };

    setStaffList(prev => [newStaff, ...prev]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  // Handle Download State Water Audit Report (PDF)
  const handleDownloadReportPdf = () => {
    setIsGeneratingStatePdf(true);
    setTimeout(() => {
      try {
        const baseWatershed = RAW_MICRO_WATERSHEDS_DATA[0];
        generateWatershedPdfReport({
          ...baseWatershed,
          name: `${selectedDistrict?.name || 'Andhra Pradesh'} Statewide Water Audit & Hydrological Dossier`,
          state: 'Andhra Pradesh',
          district: selectedDistrict?.name || 'All 26 Districts',
          basin: 'Krishna, Godavari & Pennar Basins',
          stakeholders: [],
          upcomingMeetings: [],
        });
      } catch (err) {
        console.error('PDF export failed:', err);
      } finally {
        setIsGeneratingStatePdf(false);
      }
    }, 400);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)] bg-slate-50 border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl text-slate-800">
      
      {/* ==================================================================== */}
      {/* 1. LEFT NAVIGATION SIDEBAR (Matches Images 1 - 5)                   */}
      {/* ==================================================================== */}
      <aside className="w-full lg:w-64 bg-[#03045E] text-slate-200 flex flex-col justify-between shrink-0 border-r border-[#0077B6]/30">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0077B6] to-[#00B4D8] flex items-center justify-center text-white font-black text-sm shadow-md">
                  N
                </div>
                <div>
                  <h1 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                    Nir-ikshan
                    <span className="text-[10px] bg-[#0077B6] text-white px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  </h1>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-sky-200/90 font-mono mt-1.5 tracking-wider">
              Inspect. Act. Verify. Restore.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapIcon className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Map (AP 26 Districts)</span>
            </button>

            <button
              onClick={() => setActiveTab('districts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'districts'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Districts</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Droplets className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Assets (113 Reservoirs)</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'complaints'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Issues &amp; Complaints</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                {totalOpenComplaints}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Users and Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('jurisdictions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'jurisdictions'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Jurisdictions</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarClock className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Rules and Deadlines</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_log')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'audit_log'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Audit Log</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0077B6] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Engine Status Bottom Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Assurance Engine</span>
          </div>
          <span className="font-mono text-sky-300">v2.4-gis</span>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MAIN ADMIN CONTENT WORKSPACE                                     */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        
        {/* Top Scope & Administrator Header Bar (Matches Images 1 - 5) */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Andhra Pradesh [Pilot] Scope Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
              <Building2 className="w-3.5 h-3.5 text-[#0077B6]" />
              <span>Andhra Pradesh [Pilot]</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* GIS Geo-Verification Badge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>GIS Geo-Verification Active</span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
            <span className="text-[11px] font-mono text-slate-400">
              {liveTimestamp} IST
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-bold border border-slate-200">
              <span className="px-2 py-0.5 rounded bg-white text-[#0077B6] shadow-2xs">EN</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer">हिंदी</span>
              <span className="px-2 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer">తెలుగు</span>
            </div>

            {/* Bell Notifications */}
            <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>

            {/* Administrator Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#03045E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                SR
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 block">S. Ramanathan</span>
                <span className="text-[10px] text-slate-500">State Administrator - Admin</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Global Toast for Action Success */}
        {reminderSuccessToast && (
          <div className="m-4 mb-0 bg-emerald-600 text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{reminderSuccessToast}</span>
            </div>
            <button onClick={() => setReminderSuccessToast(null)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body Rendering according to Active Tab */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* ================================================================ */}
          {/* TAB 1: OVERVIEW (Image 2)                                         */}
          {/* ================================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Statewide Administration Scope Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-sky-50 text-[#0077B6] shrink-0 border border-sky-100">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#CAF0F8] text-[#03045E] font-bold uppercase tracking-wider">
                        Scope: Statewide Administration
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        State: Andhra Pradesh (26 Districts Synchronized)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
                      Admin monitors state-wide status and manages users and rules. Case closure is done by inspectors and verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('rules')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                    <span>Review Rules</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setIsAddUserModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Inspector</span>
                  </button>
                </div>
              </div>

              {/* 6 Macro KPI Cards (Image 2) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Assets Tracked */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Assets tracked</span>
                    <Droplets className="w-4 h-4 text-[#0077B6]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {totalAssetsCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+3.8%</span>
                    <span className="text-slate-400 font-normal">vs last month</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">Total recharge bodies</p>
                </div>

                {/* 2. Open Issues */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Open issues</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {totalOpenComplaints.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>-1.2%</span>
                    <span className="text-slate-400 font-normal">vs last month</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">Field exceptions logged</p>
                </div>

                {/* 3. Overdue Tasks */}
                <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-2xl p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Overdue tasks</span>
                    <Clock className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-rose-600 tracking-tight">
                    {overdueCount}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+8.4%</span>
                    <span className="text-slate-400 font-normal">vs last month</span>
                  </div>
                  <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                    Action required urgently
                  </span>
                </div>

                {/* 4. Verified Closures */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Verified closures</span>
                    <CheckCircle2 className="w-4 h-4 text-[#0077B6]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {verifiedClosuresCount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+12.1%</span>
                    <span className="text-slate-400 font-normal">vs last month</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">Audited and closed</p>
                </div>

                {/* 5. Repeat Failures */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Repeat failures</span>
                    <RefreshCw className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    86
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ArrowDownRight className="w-3 h-3" />
                    <span>-4.0%</span>
                    <span className="text-slate-400 font-normal">vs last month</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1">Re-opened post inspection</p>
                </div>

                {/* 6. Pre-monsoon Ready */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pre-monsoon ready</span>
                    <Activity className="w-4 h-4 text-[#0077B6]" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    74.2%
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+5.5%</span>
                    <span className="text-slate-400 font-normal">target 85.0%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#0077B6] h-full rounded-full" style={{ width: '74.2%' }}></div>
                  </div>
                </div>
              </div>

              {/* Grid: Map Preview (Left 65%) + Districts Needing Attention (Right 35%) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Statewide Map Preview Card */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          Statewide Water Infrastructure Map
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-[#0077B6] font-bold uppercase">
                          Live GIS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Asset telemetry, verification stamps, and active field tasks across Andhra Pradesh
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setMapSubLayer('layered')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          mapSubLayer === 'layered' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Layered
                      </button>
                      <button
                        onClick={() => setMapSubLayer('clusters')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          mapSubLayer === 'clusters' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Clusters
                      </button>
                      <button
                        onClick={() => setMapSubLayer('heatmap')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          mapSubLayer === 'heatmap' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Heatmap
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar above map */}
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">District Boundary</label>
                      <select 
                        value={selectedDistrict?.id || 'all'}
                        onChange={(e) => {
                          const d = ANDHRA_PRADESH_26_DISTRICTS.find(x => x.id === e.target.value);
                          if (d) setSelectedDistrict(d);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800"
                      >
                        <option value="all">All Districts (26)</option>
                        {ANDHRA_PRADESH_26_DISTRICTS.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Asset Typology</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800">
                        <option>All Asset Types</option>
                        <option>Check Dams &amp; Weirs</option>
                        <option>Percolation Tanks</option>
                        <option>Sluice Regulators</option>
                        <option>Traditional Cheruvus</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assurance State</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800">
                        <option>All Statuses</option>
                        <option>Active Critical Alert</option>
                        <option>Verified Closed</option>
                        <option>Pending Inspection</option>
                      </select>
                    </div>
                  </div>

                  {/* Map Graphic Box */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[380px] flex items-center justify-center">
                    <Andhra26DistrictsMapSvg
                      selectedDistrictId={selectedDistrict?.id}
                      onSelectDistrict={(d) => setSelectedDistrict(d)}
                      viewFilter={viewFilter}
                      theme="light"
                      hoveredDistrictId={hoveredDistrictId}
                      setHoveredDistrictId={setHoveredDistrictId}
                      mapDisplayMode={mapDisplayMode}
                      showRivers={true}
                      showReservoirs={true}
                      selectedReservoirId={selectedReservoir?.id}
                      onSelectReservoir={(r) => setSelectedReservoir(r)}
                    />

                    {/* Hotspot Alert Card on Map (Chittoor Catchment Zone IV) */}
                    <div className="absolute bottom-4 left-4 max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-rose-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                          Overdue Focus
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">13.217° N, 79.100° E</span>
                      </div>
                      <h4 className="font-bold text-slate-900">
                        Chittoor Catchment Zone IV
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        84 tasks past 14-day SLA. Desilting blocked at check dam AP-CTR-098.
                      </p>
                      <button
                        onClick={() => {
                          const chit = ANDHRA_PRADESH_26_DISTRICTS.find(d => d.id === 'chittoor');
                          if (chit) setSelectedDistrict(chit);
                          setActiveTab('complaints');
                          setComplaintDistrictFilter('Chittoor');
                        }}
                        className="w-full py-1.5 bg-[#03045E] hover:bg-[#0077B6] text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Inspect District
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <button 
                      onClick={() => setActiveTab('map')}
                      className="text-[#0077B6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Map Conventions &amp; Classification Legend</span>
                    </button>
                    <span className="font-mono text-[11px]">26 Districts Synchronized</span>
                  </div>
                </div>

                {/* Districts Needing Attention (Right 35%) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight">
                          Districts Needing Attention
                        </h3>
                        <span className="text-[10px] text-slate-400 block">
                          Ranked by Overdue Grievance Count
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Targeted escalation required. Administrative notices trigger after 48h of unassigned status.
                    </p>

                    {/* District Rank List */}
                    <div className="space-y-2.5 pt-1">
                      {[
                        { rank: 1, name: 'Chittoor', overdue: 84, status: 'Critical/Overdue', statusColor: 'rose' },
                        { rank: 2, name: 'Anantapur', overdue: 68, status: 'Critical/Overdue', statusColor: 'rose' },
                        { rank: 3, name: 'Vizianagaram', overdue: 52, status: 'In progress', statusColor: 'amber' },
                        { rank: 4, name: 'East Godavari', overdue: 39, status: 'Inspection due', statusColor: 'amber' },
                        { rank: 5, name: 'Kurnool', overdue: 31, status: 'Inspection due', statusColor: 'amber' },
                      ].map((item) => (
                        <div 
                          key={item.name}
                          className="p-3 rounded-2xl border border-slate-200 hover:border-[#0077B6] bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {item.rank}. {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] mt-0.5">
                              <span className="text-rose-600 font-bold">{item.overdue} Overdue Tasks</span>
                              <span className="text-slate-300">•</span>
                              <span className={`inline-flex items-center gap-1 ${
                                item.statusColor === 'rose' ? 'text-rose-700 font-semibold' : 'text-amber-700 font-semibold'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor === 'rose' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const d = ANDHRA_PRADESH_26_DISTRICTS.find(x => x.name.toLowerCase() === item.name.toLowerCase());
                              if (d) setSelectedDistrict(d);
                              setActiveTab('districts');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-[#0077B6] text-xs font-bold text-slate-700 hover:text-[#0077B6] transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('districts')}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View All 26 District Performance Records</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* ================================================================ */}
              {/* 1. MONTHLY GRIEVANCE ANALYTICS (Interactive Bar Graph & Pie Chart) */}
              {/* ================================================================ */}
              <MonthlyGrievanceAnalytics
                complaints={complaints}
                selectedDistrictId={selectedDistrict?.id || 'all'}
                onSelectDistrict={(distId) => {
                  const d = ANDHRA_PRADESH_26_DISTRICTS.find(x => x.id === distId);
                  if (d) setSelectedDistrict(d);
                }}
                onExportPdf={handleDownloadReportPdf}
              />

              {/* ================================================================ */}
              {/* 2. DISTRICT-WISE PROBLEM & PROGRESS CONSOLE (Nodal Management)   */}
              {/* ================================================================ */}
              <DistrictGrievanceProgressConsole
                complaints={complaints}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(d) => setSelectedDistrict(d)}
                staffList={staffList}
                onDispatchReminder={handleDispatchComplaintReminder}
                onReassignNodal={handleReassignComplaintNodal}
                onInspectComplaint={(c) => {
                  setSelectedComplaintId(c.id);
                  setActiveTab('complaints');
                }}
              />

              {/* Recent Field Rectification Evidence (Dual before/after cards from Image 2) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Recent Field Rectification Evidence</h4>
                    <p className="text-xs text-slate-400">Photo-stamped before and after verification audits</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-bold">
                    SLA Standard: Geotagged dual-photo required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RECENT_FIELD_EVIDENCE.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900">{item.code} {item.title}</span>
                          <span className="text-[10px] text-slate-500 block">{item.district} ({item.circle})</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Dual Before / After Photos */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-900">
                          <img src={item.beforePhoto} alt="Before Fix" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            Before Fix
                          </span>
                          <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-slate-300">
                            {item.beforeDate}
                          </span>
                        </div>

                        <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-900">
                          <img src={item.afterPhoto} alt="After Fix" className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-emerald-700/90 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            After Fix
                          </span>
                          <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-slate-300">
                            {item.afterDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 text-[11px]">Inspector: <strong>{item.inspector}</strong></span>
                        <span className="text-[#0077B6] font-bold text-[11px]">{item.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escalated Cases Table (Image 2) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Escalated Cases</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold uppercase">
                        Requires State Intervention
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      High-visibility tracking for tasks breaching municipal assurance SLA deadlines
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-xs font-bold text-[#0077B6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Escalations</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Case ID</th>
                        <th className="py-2.5 px-3">Asset Name &amp; Code</th>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3">Assigned Owner</th>
                        <th className="py-2.5 px-3">Days Overdue</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ESCALATED_CASES_DATA.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#0077B6]">{item.code}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{item.assetName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{item.assetCode}</span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">{item.district}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                {item.assignedOwner.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="text-slate-800">{item.assignedOwner}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-rose-600">{item.daysOverdue}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('complaints');
                                setComplaintDistrictFilter(item.district);
                              }}
                              className="px-3 py-1 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: PUBLIC COMPLAINTS & INFLOW REPORTS (Image 5)              */}
          {/* ================================================================ */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              
              {/* Statutory Operating Rule Banner */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-950">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#0077B6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block">
                      Statutory Operating Rule • Strict View-Only Protocol
                    </span>
                    <p className="text-[11px] text-sky-900 mt-0.5">
                      Role Notice: State Admin access is view-only for complaints and field investigations. Actions are restricted to adding notes and dispatching reminder notices to the assigned Nodal Officer.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-md border border-sky-300 text-sky-800 font-bold">
                  No Override / No Direct Close
                </span>
              </div>

              {/* Title & Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span className="text-[#0077B6] font-bold">Civic Feedback &amp; Satellite Dispatch</span>
                    <span>•</span>
                    <span>State Oversight Portal</span>
                    <span>•</span>
                    <span>Andhra Pradesh Basin Network</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Public Complaints &amp; Inflow Reports
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review citizen-submitted water asset complaints across Andhra Pradesh. Routed automatically by location to the responsible Nodal Officer.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      // Export CSV of complaints
                      const csvContent = "data:text/csv;charset=utf-8," + 
                        ["ID,Citizen,District,Mandal,Status,NodalOfficer,Date"].join(",") + "\n" +
                        complaints.map(c => `"${c.id}","${c.citizenName}","${c.district}","${c.mandal}","${c.status}","${c.assignedNodalOfficer}","${c.submittedAt}"`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `AndhraPradesh_Complaints_${new Date().toISOString().slice(0,10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Report (CSV)</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('map')}
                    className="px-3.5 py-2 rounded-xl bg-[#0077B6] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Map View</span>
                  </button>
                </div>
              </div>

              {/* 4 Complaint Status KPI Cards (Image 5) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Complaints</span>
                  <div className="text-2xl font-black text-slate-900">
                    {complaints.length.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    +18 today across 26 districts
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Open / Pending</span>
                  <div className="text-2xl font-black text-slate-900">
                    {totalOpenComplaints}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {Math.round((totalOpenComplaints / (complaints.length || 1)) * 100)}% of total log
                  </span>
                </div>

                <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-2xl p-4 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">Overdue (&gt;48h Breach)</span>
                  <div className="text-2xl font-black text-rose-600">
                    {overdueCount}
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full inline-block">
                    Action Due Immediately
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Resolved this month</span>
                  <div className="text-2xl font-black text-slate-900">
                    {totalResolvedComplaints}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    {Math.round((totalResolvedComplaints / (complaints.length || 1)) * 100)}% clearance rate
                  </span>
                </div>
              </div>

              {/* Filter Toolbar (Search, District, Nodal, Status) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Complaint ID, citizen, landmark, or description..."
                    value={complaintSearch}
                    onChange={(e) => setComplaintSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
                  />
                </div>

                <select
                  value={complaintDistrictFilter}
                  onChange={(e) => setComplaintDistrictFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="all">All Districts (26)</option>
                  {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <select
                  value={complaintStatusFilter}
                  onChange={(e) => setComplaintStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="INSPECTOR_ASSIGNED">INSPECTOR ASSIGNED</option>
                  <option value="INSPECTION_COMPLETED">INSPECTION COMPLETED</option>
                  <option value="WORKER_IN_PROGRESS">WORKER IN PROGRESS</option>
                  <option value="VERIFICATION_PENDING">VERIFICATION PENDING</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>

                {(complaintSearch || complaintDistrictFilter !== 'all' || complaintStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setComplaintSearch('');
                      setComplaintDistrictFilter('all');
                      setComplaintStatusFilter('all');
                    }}
                    className="text-xs text-[#0077B6] font-bold hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Master-Detail Split Screen Layout (Image 5) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left (5 cols): Active Complaint Register Table */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">Active Complaint Register</h4>
                      <p className="text-[10px] text-slate-400">Showing {filteredComplaints.length} records</p>
                    </div>
                    <span className="text-[10px] text-slate-400">Click any row to open telemetry</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                    {filteredComplaints.map((c) => {
                      const isSelected = activeComplaint?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedComplaintId(c.id)}
                          className={`p-3.5 rounded-2xl transition-all cursor-pointer space-y-2 ${
                            isSelected 
                              ? 'bg-sky-50/80 border-2 border-[#0077B6] shadow-xs' 
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-[#0077B6]">{c.id}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === 'RESOLVED' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'SUBMITTED' 
                                ? 'bg-rose-100 text-rose-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {c.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              {c.locationLandmark || c.village || 'Catchment Location'}
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              District: <strong>{c.district}</strong> ({c.mandal})
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {c.shortDescription}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Reported by: <strong>{c.citizenName}</strong></span>
                            <span>{c.submittedAt?.slice(0, 10)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right (7 cols): COMPLAINT DETAIL TELEMETRY (Image 5) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-5">
                  {activeComplaint ? (
                    <>
                      {/* Header with Title and Mode */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
                            COMPLAINT DETAIL TELEMETRY
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <h3 className="font-black text-lg text-slate-900">
                              {activeComplaint.id}
                            </h3>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              activeComplaint.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              ● {activeComplaint.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          🔒 View-Only Admin Mode
                        </span>
                      </div>

                      {/* Automated Cadastral Routing Box */}
                      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 space-y-1 text-xs">
                        <span className="font-bold text-[#0077B6] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                          <Compass className="w-3.5 h-3.5" />
                          Automated Cadastral Routing
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          Routed automatically by location to the responsible Nodal Officer: <strong className="text-slate-900">{activeComplaint.assignedNodalOfficer}</strong>.
                        </p>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen Contact</span>
                          <span className="font-mono font-bold text-slate-800 block mt-0.5">
                            {activeComplaint.citizenPhone ? `+91 ${activeComplaint.citizenPhone.slice(0, 2)}••••••${activeComplaint.citizenPhone.slice(-2)}` : '+91 98••••••21'}
                          </span>
                          <span className="text-[10px] text-slate-500">Name: {activeComplaint.citizenName}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">GPS Coordinates</span>
                          <span className="font-mono font-bold text-slate-800 block mt-0.5">
                            {activeComplaint.coordinates?.lat?.toFixed(4) || '18.1124'}° N, {activeComplaint.coordinates?.lng?.toFixed(4) || '83.4022'}° E
                          </span>
                          <span className="text-[10px] text-slate-500">Mandal: {activeComplaint.mandal}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Hazard Classification</span>
                          <span className="font-bold text-slate-800 block mt-0.5">
                            {activeComplaint.wasteType || 'General Hazard & Silt Block'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Monitored Water Asset</span>
                          <span className="font-bold text-[#0077B6] block mt-0.5">
                            {activeComplaint.locationLandmark}
                          </span>
                        </div>
                      </div>

                      {/* Attached Geotagged Evidence (Initial vs Rectification) */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">
                          Attached Geotagged Evidence (2 Photometric Stills)
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative">
                            <img
                              src={activeComplaint.photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'}
                              alt="Initial Report"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/85 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                              Initial Citizen Report
                            </span>
                            <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-slate-200">
                              {activeComplaint.submittedAt}
                            </span>
                          </div>

                          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative">
                            <img
                              src={activeComplaint.inspectionReport?.sitePhotoUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                              alt="Rectification Work"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2 left-2 bg-emerald-700/85 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                              Remediation / Inspection Proof
                            </span>
                            <span className="absolute bottom-1.5 left-2 text-[9px] font-mono text-slate-200">
                              Field Machinery Assigned
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Resolution Milestone Timeline (Image 5) */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-slate-800 block">
                          Resolution Milestone Timeline
                        </span>
                        
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3.5 text-xs">
                          {/* Step 1 */}
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-slate-900">1. Submitted</strong>
                                <span className="text-[10px] font-mono text-slate-400">{activeComplaint.submittedAt}</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Citizen filed geotagged photographic hazard complaint.</p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              ✓
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-slate-900">2. Assigned</strong>
                                <span className="text-[10px] font-mono text-slate-400">Auto-routed</span>
                              </div>
                              <p className="text-[11px] text-slate-500">Auto-routed by GIS boundaries to Nodal Officer {activeComplaint.assignedNodalOfficer}.</p>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                              activeComplaint.status !== 'SUBMITTED' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                              3
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <strong className="text-slate-900">3. In Progress (Field Action)</strong>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {activeComplaint.assignedInspector || 'Action Crew Queue'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">Action engineering team / excavator deployed on-site.</p>
                            </div>
                          </div>

                          {/* Step 4 */}
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                              activeComplaint.status === 'VERIFICATION_PENDING' || activeComplaint.status === 'RESOLVED' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                              4
                            </div>
                            <div className="flex-1">
                              <strong className="text-slate-900">4. Awaiting Verification</strong>
                              <p className="text-[11px] text-slate-500">Contractor completed clearance. Inspector probe scheduled.</p>
                            </div>
                          </div>

                          {/* Step 5 */}
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                              activeComplaint.status === 'RESOLVED' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                              5
                            </div>
                            <div className="flex-1">
                              <strong className="text-slate-900">5. Final Resolution</strong>
                              <p className="text-[11px] text-slate-500">Cryptographic inspection seal and water level confirmation.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* State Oversight Permitted Actions (Managing Nodal Officer!) */}
                      <div className="border-t border-slate-200 pt-4 space-y-3">
                        <span className="text-xs font-bold text-[#0077B6] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                          <ShieldCheck className="w-4 h-4" />
                          State Oversight Permitted Actions (Manage Nodal Officer)
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setIsReminderModalOpen(true)}
                            className="px-4 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Dispatch SLA Reminder to Nodal Officer</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedNewNodalOfficer(activeComplaint.assignedNodalOfficer);
                              setIsReassignModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                            <span>Reassign Nodal Officer</span>
                          </button>

                          <button
                            onClick={() => {
                              const note = prompt('Enter State Oversight Memo / Directive for Nodal Officer:');
                              if (note && note.trim() && onUpdateComplaint) {
                                const updated: CitizenComplaint = {
                                  ...activeComplaint,
                                  shortDescription: activeComplaint.shortDescription + `\n[STATE DIRECTIVE: ${note.trim()}]`,
                                };
                                onUpdateComplaint(updated);
                                setReminderSuccessToast('State directive appended to complaint dossier!');
                              }
                            }}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Add Note
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No complaint selected. Click any complaint on the left to inspect.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: USERS AND ROLES (Image 1 - Civic Staff Governance)        */}
          {/* ================================================================ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span className="text-[#0077B6] font-bold">Civic Staff Governance</span>
                    <span>•</span>
                    <span>Secured Role Management</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Users &amp; Access Control
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage departmental personnel, field inspectors, nodal officers, and system permissions across jurisdictions.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Personnel</span>
                    <strong className="text-sm font-black text-slate-900">{staffList.length + 1420}</strong>
                  </div>
                  <div className="text-right pl-4 border-l border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Pending Sync</span>
                    <strong className="text-sm font-black text-emerald-600">0</strong>
                  </div>
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add User</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar (Image 1) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, staff ID or email..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
                  />
                </div>

                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="all">Role: All Roles</option>
                  <option value="Nodal Officer">Nodal Officer</option>
                  <option value="Field Inspector">Field Inspector</option>
                  <option value="Action Worker">Action Worker</option>
                </select>

                <select
                  value={staffDistrictFilter}
                  onChange={(e) => setStaffDistrictFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  <option value="all">District: All</option>
                  {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
                  <option>Status: All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              {/* Departmental Staff Table (Image 1) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">User &amp; Staff ID</th>
                        <th className="py-2.5 px-3">Assigned Role</th>
                        <th className="py-2.5 px-3">Jurisdiction &amp; District</th>
                        <th className="py-2.5 px-3">Masked Mobile</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList
                        .filter((s) => {
                          const matchesQuery = 
                            !staffSearchQuery ||
                            s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                            s.staffId.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                            s.email.toLowerCase().includes(staffSearchQuery.toLowerCase());
                          const matchesRole = staffRoleFilter === 'all' || s.role === staffRoleFilter;
                          const matchesDistrict = staffDistrictFilter === 'all' || s.district === staffDistrictFilter;
                          return matchesQuery && matchesRole && matchesDistrict;
                        })
                        .map((staff) => (
                          <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {staff.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="text-slate-900 block">{staff.name}</strong>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ID: {staff.staffId} • {staff.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                staff.role === 'Nodal Officer' 
                                  ? 'bg-sky-100 text-[#0077B6]' 
                                  : staff.role === 'Field Inspector' 
                                  ? 'bg-teal-100 text-teal-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                ● {staff.role}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <strong className="text-slate-800 block">{staff.district} District</strong>
                              <span className="text-[10px] text-slate-500">{staff.jurisdictionSubBasin}</span>
                            </td>

                            <td className="py-3 px-3 font-mono text-slate-600">{staff.maskedMobile}</td>

                            <td className="py-3 px-3">
                              <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                                staff.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  staff.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}></span>
                                <span>{staff.status}</span>
                              </span>
                            </td>

                            <td className="py-3 px-3 text-slate-500 font-medium">{staff.lastActive}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>Showing 1-{staffList.length} of 1,428 departmental accounts</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">Page 1 of 204</span>
                  </div>
                </div>
              </div>

              {/* Role-Permission Governance Matrix (Image 1) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#0077B6] font-bold uppercase tracking-wider block">
                    Governance Blueprint
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    Role-Permission Governance Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory authority breakdown by administrative role level for all municipal water conservation tasks.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">System Action / Workflow Responsibility</th>
                        <th className="py-3 px-3 text-center">Citizen / Public</th>
                        <th className="py-3 px-3 text-center">Action Worker</th>
                        <th className="py-3 px-3 text-center">Field Inspector</th>
                        <th className="py-3 px-3 text-center">Nodal Officer</th>
                        <th className="py-3 px-3 text-center">State Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { action: 'Create Asset / Report Problem', desc: 'Submit photo evidence of desiltation or breach', p: [true, true, true, true, true] },
                        { action: 'Assign Work Orders', desc: 'Issue procurement & machinery mobilization tasks', p: [false, false, false, true, true] },
                        { action: 'Conduct Field Inspection', desc: 'Log depth indicators, water quality & bund telemetry', p: [false, false, true, true, true] },
                        { action: 'Verify Remediation & Upload Proof', desc: 'Timestamped Before/After repair photography', p: [false, true, true, true, true] },
                        { action: 'Final Closeout', desc: 'Officially close audit trail and release payment clearances', p: [false, false, false, true, true] },
                        { action: 'Modify System Rules', desc: 'Update monsoon escalation deadlines and threshold parameters', p: [false, false, false, false, true] },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block">{row.action}</strong>
                            <span className="text-[10px] text-slate-400">{row.desc}</span>
                          </td>
                          {row.p.map((permitted, pIdx) => (
                            <td key={pIdx} className="py-3 px-3 text-center">
                              {permitted ? (
                                <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center font-bold text-xs">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex w-5 h-5 rounded-full bg-slate-100 text-slate-400 items-center justify-center font-bold text-xs">
                                  ✕
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 4: RULES AND DEADLINES (Image 3)                              */}
          {/* ================================================================ */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span className="text-[#0077B6] font-bold">Governance Framework</span>
                    <span>•</span>
                    <span>Policy Rev 2026.4</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Service Level Agreements &amp; SLA Escalation Rules
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define time-to-inspect, time-to-assign, and automated escalation hierarchies across hazard priorities.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert('SLA Version History: Rev 2026.4 (Active), Rev 2026.3 (Archived). All changes cryptographically signed.')}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Version History
                  </button>
                  <button 
                    onClick={() => {
                      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slaTiers, null, 2));
                      const a = document.createElement('a');
                      a.href = jsonStr;
                      a.download = 'Nirikshan_SLA_Schema_2026.json';
                      a.click();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Export Schema
                  </button>
                </div>
              </div>

              {/* Guardrail Validation Alert Banner */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono">
                      VALIDATION GUARDRAIL TRIGGERED
                    </span>
                    <span className="font-mono text-[10px] text-rose-700">Rule #AP-SLA-04</span>
                  </div>
                  <p className="font-semibold">
                    Validation Error: "Critical" inspect SLA cannot exceed "High" inspect SLA threshold. Please adjust hours or days to enforce hierarchical urgency before saving.
                  </p>
                </div>
              </div>

              {/* 4 Urgency Tiers Cards (Image 3) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0077B6]"></span>
                  Dispatch Threshold Matrices by Hazard Urgency
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {slaTiers.map((tier) => (
                    <div key={tier.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            tier.id === 'critical' ? 'bg-rose-500' : tier.id === 'high' ? 'bg-amber-500' : tier.id === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}></span>
                          <h4 className="font-black text-base text-slate-900">{tier.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                          {tier.badgeLabel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                        {tier.description}
                      </p>

                      <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                        {/* Inspect Within */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-500">Inspect within:</span>
                          <strong className="font-mono text-slate-900">{tier.inspectHours} hours</strong>
                        </div>

                        {/* Assign Within */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-500">Assign within:</span>
                          <strong className="font-mono text-slate-900">{tier.assignHours} hours</strong>
                        </div>

                        {/* Resolution SLA */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <span className="text-slate-500">Resolution SLA:</span>
                          <strong className="font-mono text-slate-900">{tier.resolutionDays} days</strong>
                        </div>
                      </div>

                      {/* Auto-escalate Toggle */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">Auto-escalate on breach</span>
                          <span className="text-[10px] text-slate-400">{tier.escalationChannel}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSlaTiers(prev => prev.map(t => t.id === tier.id ? { ...t, autoEscalate: !t.autoEscalate } : t));
                          }}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                            tier.autoEscalate ? 'bg-[#0077B6]' : 'bg-slate-300'
                          }`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            tier.autoEscalate ? 'translate-x-4' : ''
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Escalation Ladder Hierarchy (Image 3) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#0077B6] font-bold uppercase tracking-wider block">
                    AUTOMATED PROTOCOL PIPELINE
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">
                    Dynamic Escalation Ladder Hierarchy
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tier 1 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-[#03045E] text-white flex items-center justify-center font-bold text-xs">
                        01
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">Tier 1 Dispatch</span>
                    </div>
                    <strong className="text-slate-900 block text-xs">Action Worker</strong>
                    <span className="text-[11px] text-slate-500 block">Gram Panchayat &amp; Mandal Field Crew</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Assigned automatically upon geo-tagged defect verification. Receives push notification and direct SMS dispatch alert.
                    </p>
                    <div className="pt-2 text-[10px] text-rose-600 font-bold border-t border-slate-200">
                      If SLA breached by &gt; 24h → escalate Tier 2
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs">
                        02
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">Tier 2 Escalation</span>
                    </div>
                    <strong className="text-slate-900 block text-xs">Nodal Officer</strong>
                    <span className="text-[11px] text-slate-500 block">Mandal / District Irrigation Engineer</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Receives red alert operational ticket. Holds instant authority to reassign civil contractors and dispatch regional emergency water pumps.
                    </p>
                    <div className="pt-2 text-[10px] text-rose-600 font-bold border-t border-slate-200">
                      If unacted in 48h → escalate Tier 3
                    </div>
                  </div>

                  {/* Tier 3 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                        03
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">Tier 3 Executive</span>
                    </div>
                    <strong className="text-slate-900 block text-xs">State Admin / Chief</strong>
                    <span className="text-[11px] text-slate-500 block">Chief Hydrologist &amp; Disaster Cell</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Surfaces high-contrast executive badge on State Overview. Generates automated weekly breach audit log and registers permanent flag in District Ledger.
                    </p>
                    <div className="pt-2 text-[10px] text-[#0077B6] font-bold border-t border-slate-200">
                      Non-compliance recorded in State Annual Review
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSlaTiers(INITIAL_SLA_TIERS)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={() => {
                      setSlaChangesSaved(true);
                      setTimeout(() => setSlaChangesSaved(false), 3000);
                      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
                    }}
                    className="px-5 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{slaChangesSaved ? 'Rules Saved & Broadcasted!' : 'Save Rules & Broadcast'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 5: REPORTS & SYSTEM AUDIT LOG (Image 4)                       */}
          {/* ================================================================ */}
          {(activeTab === 'reports' || activeTab === 'audit_log') && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span className="text-[#0077B6] font-bold">Regulatory Compliance</span>
                    <span>•</span>
                    <span>Cryptographic Audit Ledger</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    Reports &amp; System Audit Log
                  </h2>
                  <p className="text-xs text-slate-500">
                    Generate verifiable hydrology compliance reports, export field data, and inspect immutable system activity trails.
                  </p>
                </div>

                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>SHA-256 Ledger: Block #884,912</span>
                </span>
              </div>

              {/* Monthly Interactive Grievance & Resolution Visualizer */}
              <MonthlyGrievanceAnalytics
                complaints={complaints}
                selectedDistrictId={selectedDistrict?.id || 'all'}
                onSelectDistrict={(distId) => {
                  const d = ANDHRA_PRADESH_26_DISTRICTS.find(x => x.id === distId);
                  if (d) setSelectedDistrict(d);
                }}
                onExportPdf={handleDownloadReportPdf}
              />

              {/* Report Generator & Data Exports (Image 4) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Configuration Form (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">Report Generator &amp; Data Exports</h3>
                    <span className="text-[10px] text-slate-400">Standard Operating Cadence: Bi-Weekly / Monthly</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Report Archetype</label>
                      <select
                        value={reportArchetype}
                        onChange={(e) => setReportArchetype(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>Monthly Hydrology Review</option>
                        <option>Quarterly State Water Audit</option>
                        <option>Citizen Grievance Resolution Ledger</option>
                        <option>Pre-Monsoon Preparedness Dossier</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Jurisdiction</label>
                      <select
                        value={reportTargetJurisdiction}
                        onChange={(e) => setReportTargetJurisdiction(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option>All Districts (State-wide)</option>
                        {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                          <option key={d.id} value={d.name}>{d.name} District</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Compliance Period</label>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>01 May 2026 - 31 May 2026</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Output Specification</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                        <option>PDF with Cryptographic Seal (A4 Dossier)</option>
                        <option>CSV Raw Telemetry Matrix</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reportIncludePhotos} 
                        onChange={(e) => setReportIncludePhotos(e.target.checked)} 
                        className="rounded text-[#0077B6]" 
                      />
                      <span>Geo-tagged Photos</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reportIncludeSensors} 
                        onChange={(e) => setReportIncludeSensors(e.target.checked)} 
                        className="rounded text-[#0077B6]" 
                      />
                      <span>Sensor Telemetry</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reportIncludeHash} 
                        onChange={(e) => setReportIncludeHash(e.target.checked)} 
                        className="rounded text-[#0077B6]" 
                      />
                      <span>Audit Hash Manifest</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadReportPdf}
                        disabled={isGeneratingStatePdf}
                        className="px-5 py-2.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isGeneratingStatePdf ? 'Compiling Dossier...' : 'Export State Audit PDF'}</span>
                      </button>

                      <button
                        onClick={() => {
                          // CSV Download
                          const csv = "data:text/csv;charset=utf-8,District,StorageTMC,GroundwaterMbgl,Status\n" +
                            ANDHRA_PRADESH_26_DISTRICTS.map(d => `${d.name},${d.wrisTelemetry.liveStorageTMC},${d.wrisTelemetry.groundwaterDepthMbgl},${d.statusColor}`).join("\n");
                          const uri = encodeURI(csv);
                          const a = document.createElement('a');
                          a.href = uri;
                          a.download = 'Andhra_Pradesh_State_Water_Matrix.csv';
                          a.click();
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      Est. compiled size: ~14.2 MB
                    </span>
                  </div>
                </div>

                {/* Right Document Simulation Preview Card (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#0077B6]" />
                      Document Simulation Preview
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Live Render
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase block">OFFICIAL CIVIC GAZETTE</span>
                        <strong className="text-slate-900 text-xs">State Water Asset Audit - May 2026</strong>
                      </div>
                      <Droplets className="w-5 h-5 text-[#0077B6]" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] text-slate-400 block">Assessed</span>
                        <strong className="font-bold text-slate-800">1,482</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] text-slate-400 block">Compliant</span>
                        <strong className="font-bold text-emerald-600">94.8%</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] text-slate-400 block">Repairs</span>
                        <strong className="font-bold text-rose-600">77</strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Catchment Health Index</span>
                        <strong className="text-[#0077B6]">Target: 90%</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#0077B6] h-full rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Digital Seal: 0x9F4C...B38E</span>
                      <span>Page 1 of 28</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadReportPdf}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Fullscreen PDF View</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Immutable System Audit Log Table (Image 4) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Immutable System Audit Log</h3>
                    <p className="text-xs text-slate-400">Non-repudiable state transitions and administrative dispatch events</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Live Stream ({auditLogs.length} Records)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Timestamp (IST)</th>
                        <th className="py-2.5 px-3">Initiated By</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Record ID</th>
                        <th className="py-2.5 px-3">State Transition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-800 block">{log.timestamp}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{log.blockNumber}</span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                {log.initiatedBy.initials}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">{log.initiatedBy.name}</span>
                                <span className="text-[10px] text-slate-400">{log.initiatedBy.role}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-[#0077B6]">
                              ● {log.action}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-slate-800">{log.recordId}</td>

                          <td className="py-3 px-3 font-mono text-[11px]">
                            <span className="text-slate-500">{log.stateTransition.from}</span>
                            <span className="text-slate-400 mx-2">→</span>
                            <span className="font-bold text-emerald-600">{log.stateTransition.to}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 6: MAP VIEW (Full-Screen AP 26 Districts Vector GIS)         */}
          {/* ================================================================ */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Andhra Pradesh 26-District Hydrological GIS Grid
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time interactive vector cadastral map with live telemetry beams, reservoirs, and river discharge gauges
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[11px] text-slate-400">Display Mode:</span>
                    <select
                      value={mapDisplayMode}
                      onChange={(e) => setMapDisplayMode(e.target.value as MapDisplayMode)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="cadastral">Cadastral Boundary</option>
                      <option value="surveillance">Cyber Surveillance</option>
                      <option value="ndwi_satellite">Bhuvan NDWI Satellite</option>
                      <option value="wris_storage">Reservoir Storage %</option>
                      <option value="dwlr_groundwater">Groundwater Depth</option>
                      <option value="rainfall">Monsoon Rainfall</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 min-h-[560px] flex items-center justify-center relative">
                  <Andhra26DistrictsMapSvg
                    selectedDistrictId={selectedDistrict?.id}
                    onSelectDistrict={(d) => setSelectedDistrict(d)}
                    viewFilter="all"
                    theme="light"
                    hoveredDistrictId={hoveredDistrictId}
                    setHoveredDistrictId={setHoveredDistrictId}
                    mapDisplayMode={mapDisplayMode}
                    showRivers={true}
                    showReservoirs={true}
                    selectedReservoirId={selectedReservoir?.id}
                    onSelectReservoir={(r) => setSelectedReservoir(r)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 7: DISTRICTS (All 26 Districts Ranked Table & Telemetry)      */}
          {/* ================================================================ */}
          {activeTab === 'districts' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      All 26 Andhra Pradesh Districts Telemetry &amp; Performance
                    </h3>
                    <p className="text-xs text-slate-500">
                      Official APWRIMS &amp; CGWB groundwater table, reservoir storage, and active alerts
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0077B6] bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                    26 Districts Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">District Name</th>
                        <th className="py-2.5 px-3">Headquarters</th>
                        <th className="py-2.5 px-3">Primary Reservoir</th>
                        <th className="py-2.5 px-3">Storage %</th>
                        <th className="py-2.5 px-3">GW Depth (mbgl)</th>
                        <th className="py-2.5 px-3">Alerts</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                        <tr 
                          key={d.id} 
                          onClick={() => {
                            setSelectedDistrict(d);
                            setActiveTab('overview');
                          }}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3">
                            <strong className="text-slate-900 block">{d.name}</strong>
                            <span className="text-[10px] text-slate-400">{d.teluguName}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">{d.headquarter}</td>
                          <td className="py-3 px-3 text-[#0077B6] font-semibold">{d.wrisTelemetry.primaryReservoir}</td>
                          <td className="py-3 px-3 font-mono font-bold">{d.wrisTelemetry.storagePercentage}%</td>
                          <td className="py-3 px-3 font-mono">{d.wrisTelemetry.groundwaterDepthMbgl} m</td>
                          <td className="py-3 px-3">
                            {d.alertCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                                {d.alertCount} Alerts
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.statusColor === 'green' ? 'bg-emerald-100 text-emerald-800' :
                              d.statusColor === 'blue' ? 'bg-sky-100 text-sky-800' :
                              d.statusColor === 'yellow' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {d.statusColor.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 8: ASSETS (113 APWRIMS Reservoirs Catalog)                    */}
          {/* ================================================================ */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Official APWRIMS 113 Major &amp; Medium Reservoirs
                    </h3>
                    <p className="text-xs text-slate-500">
                      Grounded with ISRO Bhuvan Optical NDWI satellite recurrence
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0077B6] bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                    {AP_OFFICIAL_RESERVOIRS.length} Reservoirs
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] sticky top-0 bg-white">
                        <th className="py-2.5 px-3">Reservoir</th>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3">Basin</th>
                        <th className="py-2.5 px-3">Storage (TMC)</th>
                        <th className="py-2.5 px-3">Capacity %</th>
                        <th className="py-2.5 px-3">Level (Ft)</th>
                        <th className="py-2.5 px-3">NDWI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {AP_OFFICIAL_RESERVOIRS.map((res) => (
                        <tr 
                          key={res.id} 
                          onClick={() => {
                            setSelectedReservoir(res);
                            setActiveTab('overview');
                          }}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3">
                            <strong className="text-slate-900 block">{res.name}</strong>
                            <span className="text-[10px] text-slate-400">{res.teluguName}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">{res.district}</td>
                          <td className="py-3 px-3 text-slate-500">{res.basin}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{res.currentStorageTMC} / {res.grossCapacityTMC}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              res.storagePercentage > 75 ? 'bg-emerald-100 text-emerald-800' :
                              res.storagePercentage > 35 ? 'bg-sky-100 text-sky-800' :
                              res.storagePercentage > 20 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {res.storagePercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono">{res.currentLevelFeet} ft</td>
                          <td className="py-3 px-3 font-mono font-bold text-[#0077B6]">{res.bhuvanSatellite.ndwiScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 9: SETTINGS & JURISDICTIONS (Administrative Parameters)      */}
          {/* ================================================================ */}
          {(activeTab === 'settings' || activeTab === 'jurisdictions') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">State Admin Infrastructure Settings</h3>
                <p className="text-xs text-slate-500">Configure statewide surveillance parameters, automated escalations, and sensor drift thresholds</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <strong className="text-slate-900 block">ISRO Bhuvan Recurrence Cadence</strong>
                  <p className="text-slate-500">Resourcesat-2A AWiFS 15-day satellite orbital pass interval.</p>
                  <span className="font-mono text-xs font-bold text-[#0077B6]">Interval: 15 Days (Locked)</span>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <strong className="text-slate-900 block">Automated SLA Escalation Window</strong>
                  <p className="text-slate-500">Time window before unacted complaints escalate from Nodal Officer to Tier 3 State Executive.</p>
                  <span className="font-mono text-xs font-bold text-rose-600">Threshold: 48 Hours</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: DISPATCH SLA REMINDER NOTICE TO NODAL OFFICER              */}
      {/* ==================================================================== */}
      {isReminderModalOpen && activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Dispatch SLA Reminder Notice</h3>
                <p className="text-xs text-sky-200">To: {activeComplaint.assignedNodalOfficer}</p>
              </div>
              <button onClick={() => setIsReminderModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleDispatchReminder} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Complaint ID</label>
                <div className="bg-slate-100 p-2.5 rounded-xl font-mono font-bold text-[#0077B6]">{activeComplaint.id} ({activeComplaint.locationLandmark})</div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Enforced Resolution Deadline</label>
                <select
                  value={reminderDeadlineHours}
                  onChange={(e) => setReminderDeadlineHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="12">12 Hours (Immediate Crisis Action)</option>
                  <option value="24">24 Hours (Standard Escalation Deadline)</option>
                  <option value="48">48 Hours (Final Pre-Executive Audit Lock)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Official Directive &amp; Memo Notes</label>
                <textarea
                  rows={3}
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="e.g. Priority alert: Machinery desiltation required before monsoonal inflow surge. Please assign Action Engineer immediately."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Official Directive &amp; Log Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: REASSIGN NODAL OFFICER                                     */}
      {/* ==================================================================== */}
      {isReassignModalOpen && activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Reassign Nodal Officer</h3>
                <p className="text-xs text-sky-200">Complaint: {activeComplaint.id}</p>
              </div>
              <button onClick={() => setIsReassignModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Assignee</label>
                <div className="bg-slate-100 p-2.5 rounded-xl font-semibold text-slate-800">{activeComplaint.assignedNodalOfficer}</div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Select New Nodal Officer</label>
                <select
                  value={selectedNewNodalOfficer}
                  onChange={(e) => setSelectedNewNodalOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="Er. N. Subba Rao (Nodal Officer & SE Irrigation Vizianagaram), Vizianagaram">
                    Er. N. Subba Rao (Vizianagaram Circle)
                  </option>
                  <option value="Smt. P. Hemalatha (EE Water Resources Parvathipuram), Parvathipuram Manyam">
                    Smt. P. Hemalatha (Parvathipuram Manyam)
                  </option>
                  <option value="Dr. A. Mallikarjuna, IAS (Collector & Nodal Authority), Visakhapatnam">
                    Dr. A. Mallikarjuna, IAS (Visakhapatnam)
                  </option>
                  <option value="Anil Kumar Varma (Nodal Officer Chittoor), Chittoor">
                    Anil Kumar Varma (Chittoor District)
                  </option>
                  <option value="B. Nirmala Rao (Nodal Officer East Godavari), East Godavari">
                    B. Nirmala Rao (East Godavari)
                  </option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReassign}
                  className="px-5 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Reassignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD NEW DEPARTMENTAL USER / STAFF                          */}
      {/* ==================================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Provision New Departmental Staff</h3>
                <p className="text-xs text-sky-200">Statewide Water Assurance Personnel Onboarding</p>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddNewStaff} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. K. V. Satyanarayana"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Nodal Officer">Nodal Officer</option>
                    <option value="Field Inspector">Field Inspector</option>
                    <option value="Action Worker">Action Worker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="name@water.ap.gov.in"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="9848012345"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assigned District</label>
                  <select
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Jurisdiction Sub-Basin</label>
                  <input
                    type="text"
                    placeholder="e.g. Champavathi Upper Basin"
                    value={newUserSubBasin}
                    onChange={(e) => setNewUserSubBasin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
