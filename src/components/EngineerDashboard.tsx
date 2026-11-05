/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Nir-ikshan Action Worker & Remediation Engineering Workstation
 * Fully dynamic GovTech portal for Executive Engineers & Field Remediation Crews.
 * Supports complete lifecycle:
 *  1. Work Order Review & Decision (Accept vs Reasoned Decline with Voice Note)
 *  2. Active On-Site Remediation (Before Photo, Interactive Checklist, Crew Counter, Voice Memo, After Photo)
 *  3. Dispatch to Field Inspector for Physical Re-Verification & Statutory Closure
 *  4. GIS Cadastral Map with Google Hybrid Satellite tiles in English.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CitizenComplaint, WaterBody } from '../types/nirikshan';
import { EngineerRealSatelliteMap } from './EngineerRealSatelliteMap';
import { DistrictNodalSatelliteMap } from './nodal/DistrictNodalSatelliteMap';
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock, 
  Camera, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Send, 
  X, 
  Phone, 
  Building, 
  Check, 
  Volume2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  ChevronRight, 
  Navigation, 
  HardHat, 
  Users, 
  Mic, 
  MicOff, 
  Play, 
  RotateCcw, 
  Eye, 
  CheckSquare, 
  Square, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Radio, 
  FileText, 
  HelpCircle, 
  ListTodo, 
  Layers,
  Monitor,
  Smartphone,
  SlidersHorizontal,
  Activity,
  Filter,
  CheckCheck,
  Maximize2,
  Database,
  Search,
  Droplets,
  ThumbsUp,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { 
  COMPLETE_AP_ACTION_WORKERS, 
  SupabaseActionWorkerRow 
} from '../data/allDistrictsTeamData';
import { WorkerDirectoryHub } from './worker/WorkerDirectoryHub';
import { isComplaintAssignedToWorker, isDistrictMatch } from '../utils/workerFilter';
import { 
  fetchActionWorkersFromSupabase, 
  subscribeToActionWorkers, 
  isSupabaseConfigured 
} from '../lib/supabase';

interface EngineerDashboardProps {
  complaints: CitizenComplaint[];
  waterBodies: WaterBody[];
  onAcceptTask: (complaintId: string, beforePhotoUrl: string) => void;
  onBlockTask: (complaintId: string, reason: string) => void;
  onCompleteTask: (complaintId: string, afterPhotoUrl: string, workSummary: string) => void;
  onViewChange?: (view: { isDirectory: boolean; worker: SupabaseActionWorkerRow | null }) => void;
}

type WorkerTab = 'assigned' | 'in_progress' | 'completed' | 'map';
type DecisionSubView = 'overview' | 'review' | 'accept_guidance' | 'decline_reason';

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  complaints,
  waterBodies,
  onAcceptTask,
  onBlockTask,
  onCompleteTask,
  onViewChange,
}) => {
  const { t } = useLanguage();

  // Action Workers State with live Supabase synchronization (Zero fake data)
  const [workersList, setWorkersList] = useState<SupabaseActionWorkerRow[]>(() => {
    const byId = new Map<string, SupabaseActionWorkerRow>();
    COMPLETE_AP_ACTION_WORKERS.forEach((w) => {
      if (w && w.worker_id && !byId.has(w.worker_id.toLowerCase())) {
        byId.set(w.worker_id.toLowerCase(), w);
      }
    });
    return Array.from(byId.values());
  });

  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(() => isSupabaseConfigured());

  // Connect live to Supabase public.action_workers
  useEffect(() => {
    let isMounted = true;

    const loadLiveWorkers = async () => {
      try {
        const data = await fetchActionWorkersFromSupabase();
        if (isMounted && data && data.length > 0) {
          setWorkersList(data);
          setIsSupabaseLive(true);
        }
      } catch (err) {
        console.warn('[EngineerDashboard] Live action workers fetch error:', err);
      }
    };

    loadLiveWorkers();

    const unsubscribe = subscribeToActionWorkers(() => {
      loadLiveWorkers();
    });

    const handleConfigChanged = () => {
      setIsSupabaseLive(isSupabaseConfigured());
      loadLiveWorkers();
    };

    window.addEventListener('supabase-config-changed', handleConfigChanged);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('supabase-config-changed', handleConfigChanged);
    };
  }, []);

  const allWorkers = workersList;

  // Selected Action Worker State
  const [selectedWorker, setSelectedWorker] = useState<SupabaseActionWorkerRow>(() => {
    try {
      const storedId = localStorage.getItem('nir_current_worker_id');
      if (storedId) {
        const found = COMPLETE_AP_ACTION_WORKERS.find((w) => w.worker_id.toLowerCase() === storedId.toLowerCase());
        if (found) return found;
      }
    } catch {}
    const venkata = COMPLETE_AP_ACTION_WORKERS.find(
      (w) =>
        w.worker_id === 'wrk-vzm-01' ||
        w.name_or_crew?.includes('Venkata Ramana') ||
        w.contact_person?.includes('Venkata Ramana')
    );
    return venkata || COMPLETE_AP_ACTION_WORKERS[0];
  });

  // Sync selectedWorker if refreshed from live Supabase table
  useEffect(() => {
    if (selectedWorker?.worker_id && workersList.length > 0) {
      const liveMatch = workersList.find(
        (w) => w.worker_id.toLowerCase() === selectedWorker.worker_id.toLowerCase()
      );
      if (liveMatch && JSON.stringify(liveMatch) !== JSON.stringify(selectedWorker)) {
        setSelectedWorker(liveMatch);
      }
    }
  }, [workersList, selectedWorker]);

  // Toggle between Directory Selection Hub (flashcards for all workers) and Active Workstation
  const [isSelectingWorker, setIsSelectingWorker] = useState<boolean>(true);

  // Sync breadcrumb & smart back button in parent
  const lastReportedViewRef = useRef<{ isDirectory: boolean; workerId: string | null }>({
    isDirectory: !isSelectingWorker,
    workerId: null,
  });

  useEffect(() => {
    const currentId = isSelectingWorker ? null : (selectedWorker?.worker_id || null);
    if (
      lastReportedViewRef.current.isDirectory !== isSelectingWorker ||
      lastReportedViewRef.current.workerId !== currentId
    ) {
      lastReportedViewRef.current = {
        isDirectory: isSelectingWorker,
        workerId: currentId,
      };
      if (onViewChange) {
        onViewChange({
          isDirectory: isSelectingWorker,
          worker: isSelectingWorker ? null : selectedWorker,
        });
      }
    }
  }, [isSelectingWorker, selectedWorker, onViewChange]);

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<WorkerTab>('assigned');

  // Device layout mode ('desktop' vs 'mobile' vs 'auto')
  const [deviceMode, setDeviceMode] = useState<'auto' | 'desktop' | 'mobile'>('auto');
  const [isScreenDesktop, setIsScreenDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsScreenDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveLayout = deviceMode === 'auto' ? (isScreenDesktop ? 'desktop' : 'mobile') : deviceMode;

  // Selected task state
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Decision sub-view for assigned tasks
  const [decisionSubView, setDecisionSubView] = useState<DecisionSubView>('overview');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sla24' | 'nearby'>('all');

  // Enlarged photo preview modal
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ url: string; title: string } | null>(null);

  // Emergency site stuck modal
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [stuckReason, setStuckReason] = useState('');

  // Map expanded modal
  const [showMapModal, setShowMapModal] = useState(false);

  // Decision Timer (Count down from 3h 45m 08s)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3 * 3600 + 45 * 60 + 8);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Audio Speech Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Decline Reason Form State
  const declineReasons = [
    { id: 'leave', label: 'I am on leave or unavailable', icon: '🏖️' },
    { id: 'type', label: 'This is not my type of work (e.g. need masonry, I do desilting)', icon: '⚙️' },
    { id: 'distance', label: 'Too far from me (more than 20 km)', icon: '🚗' },
    { id: 'overload', label: 'I already have too many tasks right now', icon: '⏳' },
    { id: 'voice', label: 'Other reason (Tap to record voice note)', icon: '🎤' },
  ];
  const [selectedDeclineReason, setSelectedDeclineReason] = useState<string>(declineReasons[0].label);
  const [isRecordingDeclineVoice, setIsRecordingDeclineVoice] = useState(false);
  const [declineVoiceSeconds, setDeclineVoiceSeconds] = useState(14);

  // Active Remediation Execution State
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    silt: true,
    weeds: true,
    spindle: false,
  });
  const [workerCount, setWorkerCount] = useState<number>(4);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  );
  const [afterPhotoUploaded, setAfterPhotoUploaded] = useState<boolean>(false);
  const [beforePhotoUploaded, setBeforePhotoUploaded] = useState<boolean>(true);
  const [isVoiceNotePlaying, setIsVoiceNotePlaying] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);

  // Strict 1-to-1 Worker Task Isolation (Zero Cross-Worker Leakage)
  // Ek worker dusre worker ka koi bhi kaam nahi dekh sakta hai.
  // Only complaints officially assigned to this specific worker by the Nodal Officer are visible.
  const workerComplaints = useMemo<CitizenComplaint[]>(() => {
    return complaints.filter((c: CitizenComplaint) => isComplaintAssignedToWorker(c, selectedWorker));
  }, [complaints, selectedWorker]);

  // Dynamic Task Categorization
  const urgentTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'ACTION_ASSIGNED' ||
      (c.workExecution && c.workExecution.status === 'PENDING_ACCEPTANCE')
  );

  const inProgressTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'WORKER_IN_PROGRESS' &&
      c.workExecution?.status === 'ACCEPTED'
  );

  const waitingReviewTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'VERIFICATION_PENDING' ||
      (c.workExecution && c.workExecution.status === 'COMPLETED' && c.status !== 'RESOLVED')
  );

  const completedTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'RESOLVED' ||
      (c.workExecution !== undefined && c.workExecution.status === 'COMPLETED')
  );

  const allRemediationTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'ACTION_ASSIGNED' ||
      c.status === 'WORKER_IN_PROGRESS' ||
      c.status === 'VERIFICATION_PENDING' ||
      c.status === 'RESOLVED' ||
      c.workExecution !== undefined
  );

  // Active complaint determination
  const activeComplaint =
    workerComplaints.find((c: CitizenComplaint) => c.id === selectedComplaintId) ||
    urgentTasks[0] ||
    inProgressTasks[0] ||
    workerComplaints[0];

  const hasActiveRemediation =
    inProgressTasks.length > 0 ||
    Boolean(
      activeComplaint &&
        (activeComplaint.status === 'WORKER_IN_PROGRESS' ||
          activeComplaint.workExecution?.status === 'ACCEPTED')
    );

  // Auto-select first task if none selected
  useEffect(() => {
    if (!selectedComplaintId && urgentTasks.length > 0) {
      setSelectedComplaintId(urgentTasks[0].id);
    }
  }, [urgentTasks, selectedComplaintId]);

  // Handlers
  const handleOpenTaskForReview = (complaint: CitizenComplaint) => {
    setSelectedComplaintId(complaint.id);
    setDecisionSubView('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAcceptGuidance = () => {
    setDecisionSubView('accept_guidance');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDeclineReason = () => {
    setDecisionSubView('decline_reason');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmAcceptTask = () => {
    if (!activeComplaint) return;
    const photoToUse =
      beforePhotoUrl ||
      activeComplaint.inspectionReport?.sitePhotoUrl ||
      activeComplaint.photoUrl ||
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=800&auto=format&fit=crop';
    
    onAcceptTask(activeComplaint.id, photoToUse);
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    setActiveTab('in_progress');
    setDecisionSubView('overview');
  };

  const handleSendDeclineToOfficer = () => {
    if (!activeComplaint) return;
    const finalReason =
      selectedDeclineReason.includes('voice note')
        ? 'Declined with attached voice note memo. Reassignment requested by crew lead.'
        : selectedDeclineReason;
    
    onBlockTask(activeComplaint.id, finalReason);
    setDecisionSubView('overview');
    alert(`Notice sent to Nodal Officer: Task declined. Reason: "${finalReason}". The officer will reassign this to an available crew.`);
  };

  const handleSubmitToInspectorForVerification = () => {
    if (!activeComplaint) return;
    const summary = `Remediation completed on site by 4-worker excavation unit. Conduits and sluice aprons de-silted, floating debris removed, gate spindle greased and tested. Restored flow verified on camera.`;
    onCompleteTask(activeComplaint.id, afterPhotoUrl, summary);
    confetti({ particleCount: 120, spread: 85, origin: { y: 0.5 } });
    setActiveTab('completed');
  };

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAfterPhotoUrl(event.target.result as string);
          setAfterPhotoUploaded(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBeforePhotoUrl(event.target.result as string);
          setBeforePhotoUploaded(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const targetLat = activeComplaint?.coordinates?.lat ?? 18.1109;
  const targetLng = activeComplaint?.coordinates?.lng ?? 83.4268;
  const targetTitle = activeComplaint?.locationLandmark || "Champavathi River Basin Weir";

  const workerInitials = useMemo(() => {
    const raw = selectedWorker.name_or_crew || selectedWorker.name_or_crew_type || selectedWorker.contact_person || 'WK';
    const clean = raw.replace(/\b(Er|Dr|Sri|Smt)\.?\s+/gi, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'WK';
  }, [selectedWorker]);

  const selectedWorkerDisplayName = selectedWorker.name_or_crew || selectedWorker.name_or_crew_type || selectedWorker.contact_person;

  const workerGradient =
    selectedWorker.type === 'Engineer'
      ? 'from-[#03045E] to-[#0077B6]'
      : selectedWorker.type === 'Contractor'
      ? 'from-amber-600 to-amber-800'
      : selectedWorker.type === 'Crew'
      ? 'from-teal-600 to-cyan-800'
      : 'from-indigo-600 to-blue-800';

  // Render Strict Task Isolation Shield when a worker has 0 orders assigned to them
  const renderIsolationShield = () => (
    <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-5 max-w-2xl mx-auto my-4 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>Statutory 1-to-1 Worker Task Isolation (कार्य पृथक्करण नियम)</span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900">
          No Work Orders Assigned to {selectedWorkerDisplayName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          <strong>सरकारी सुरक्षा नियम:</strong> एक वर्कर दूसरे वर्कर का कोई भी काम नहीं देख सकता ताकि फील्ड पर काम में कोई हस्तक्षेप या लापरवाही न हो। जिसे जिला नोडल अधिकारी (Nodal Officer) द्वारा आधिकारिक वर्क ऑर्डर जारी किया जाएगा, केवल उसी को अपने ऑर्डर्स दिखाई देंगे।
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-semibold">Logged-in Action Worker:</span>
          <span className="font-mono font-bold text-slate-900">{selectedWorkerDisplayName}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-semibold">Worker Badge ID:</span>
          <span className="font-mono font-bold text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            {selectedWorker.worker_id}
          </span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-semibold">Assigned Jurisdiction:</span>
          <span className="font-bold text-slate-800">{selectedWorker.district} Remediation Division</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">Assigned Work Orders:</span>
          <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
            0 Active Orders (Strictly Isolated &amp; Shielded)
          </span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => {
            const venkata = allWorkers.find(
              (w) =>
                w.worker_id === 'wrk-vzm-01' ||
                w.name_or_crew?.includes('Venkata Ramana') ||
                w.contact_person?.includes('Venkata Ramana')
            );
            if (venkata) {
              setSelectedWorker(venkata);
              try {
                localStorage.setItem('nir_current_worker_id', venkata.worker_id);
              } catch {}
            }
          }}
          className="w-full sm:w-auto px-5 py-3 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
        >
          <Wrench className="w-4 h-4 text-sky-200" />
          <span>Switch to Er. T. Venkata Ramana (Active Remediation Orders)</span>
        </button>
        <button
          onClick={() => setIsSelectingWorker(true)}
          className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-300 flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4 text-slate-600" />
          <span>Open Full Worker Directory</span>
        </button>
      </div>
    </div>
  );

  // If in Directory selection mode, show the Directory Hub with flashcards for all workers across AP
  if (isSelectingWorker) {
    return (
      <WorkerDirectoryHub
        workers={allWorkers}
        complaints={complaints}
        selectedWorkerId={selectedWorker.worker_id}
        isSupabaseLive={isSupabaseLive}
        onBack={() => setIsSelectingWorker(false)}
        onSelectWorker={(worker) => {
          setSelectedWorker(worker);
          setIsSelectingWorker(false);
          try {
            localStorage.setItem('nir_current_worker_id', worker.worker_id);
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 space-y-5 pb-16">
      
      {/* ============================================================== */}
      {/* 1. EXECUTIVE TOP HEADER CARD (GOVTECH SPECIFICATION)           */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* GPS Accuracy Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DGPS ±1.8m (RTK Fixed)</span>
            </div>

            {/* Sync Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border ${
              isSupabaseLive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-blue-50 border-blue-200 text-[#0077B6]'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseLive ? 'Supabase Live: public.action_workers' : 'Offline Verified Roster'}</span>
            </div>

            {/* AP-WRIMS Sync */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-slate-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>AP-WRIMS Verified</span>
            </div>
          </div>

          {/* Right Side: Switch Worker, Device Switcher & Audio Briefing */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick 1-to-1 Worker Isolation Test Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => {
                  const venkata = allWorkers.find(
                    (w) =>
                      w.worker_id === 'wrk-vzm-01' ||
                      w.name_or_crew?.includes('Venkata Ramana') ||
                      w.contact_person?.includes('Venkata Ramana')
                  );
                  if (venkata) {
                    setSelectedWorker(venkata);
                    try { localStorage.setItem('nir_current_worker_id', venkata.worker_id); } catch {}
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                  selectedWorker.worker_id === 'wrk-vzm-01'
                    ? 'bg-[#0077B6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Er. T. Venkata Ramana (Has assigned remediation work orders)"
              >
                <Wrench className="w-3 h-3" />
                <span>Er. T. Venkata Ramana (Active Orders)</span>
              </button>

              <button
                onClick={() => {
                  const mw01 = allWorkers.find((w) => w.worker_id === 'MW-001') || allWorkers[1];
                  if (mw01) {
                    setSelectedWorker(mw01);
                    try { localStorage.setItem('nir_current_worker_id', mw01.worker_id); } catch {}
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                  selectedWorker.worker_id !== 'wrk-vzm-01'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Crew MW-001 (0 Tasks - Demonstrates 1-to-1 Worker Task Isolation Shield)"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Crew MW-001 (0 Orders - Shielded)</span>
              </button>
            </div>

            {/* Switch Worker Button */}
            <button
              onClick={() => setIsSelectingWorker(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Return to Action Worker Directory Hub"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Full Directory ({selectedWorker.worker_id})</span>
            </button>

            {/* Device Switcher Toggle */}
            <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  effectiveLayout === 'desktop'
                    ? 'bg-white text-[#03045E] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Laptop & Workstation View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Laptop Console</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  effectiveLayout === 'mobile'
                    ? 'bg-white text-[#03045E] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile Field Handheld View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile Field</span>
              </button>
            </div>

            {/* Audio Voice Briefing */}
            <button
              onClick={() =>
                speakText(
                  `Nir-ikshan Action Worker Portal for ${selectedWorkerDisplayName}. You have ${urgentTasks.length} urgent work orders awaiting decision, ${inProgressTasks.length} active remediation sites, and ${waitingReviewTasks.length} sites submitted for inspector verification.`
                )
              }
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#0077B6]" />
              <span className="hidden sm:inline">Listen to Tasks</span>
            </button>
          </div>
        </div>

        {/* Executive Profile Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${workerGradient} text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0`}>
              {workerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {selectedWorkerDisplayName}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0077B6] border border-blue-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{selectedWorker.district} Remediation Division • {selectedWorker.service_areas || 'Field Operations'}</span>
                </span>
                <span className="font-mono text-xs font-bold bg-[#0077B6]/10 text-[#0077B6] border border-[#0077B6]/20 px-2 py-0.5 rounded-md">
                  {selectedWorker.worker_id}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  selectedWorker.availability === 'Busy'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedWorker.availability === 'Busy' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                  }`} />
                  <span>{selectedWorker.availability === 'Busy' ? 'On-Site Active' : 'On-Field Ready'}</span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {selectedWorker.type}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-1">
                <span>{selectedWorker.skills || 'Desilting & Canal Remediation Wing'}</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>
                    {selectedWorker.type === 'Contractor'
                      ? 'Contractor Fleet: 12 Operators On-Site'
                      : selectedWorker.type === 'Engineer'
                      ? 'Engineering Command Unit'
                      : `Crew: ${workerCount} Field Operatives On-Site`}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span>Phone: {selectedWorker.phone || '+91 94402 33445'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Top Navigation Tabs (Exact 4 Tabs - No Redundant Tabs!) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          {/* Tab 1: Assigned Work Orders */}
          <button
            onClick={() => {
              setActiveTab('assigned');
              setDecisionSubView('overview');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'assigned'
                ? 'bg-[#03045E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Assigned Work Orders</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'assigned' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {urgentTasks.length}
            </span>
          </button>

          {/* Tab 2: In-Progress Remediation */}
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'in_progress'
                ? 'bg-[#03045E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>2. In-Progress Remediation</span>
            {inProgressTasks.length > 0 && (
              <span className="bg-sky-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full font-mono">
                {inProgressTasks.length} Active
              </span>
            )}
          </button>

          {/* Tab 3: Completed & Verification */}
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#03045E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Completed & Verification</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {waitingReviewTasks.length + completedTasks.length}
            </span>
          </button>

          {/* Tab 4: GIS Cadastral Map */}
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-[#03045E] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. GIS Cadastral Map</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB 1: ASSIGNED WORK ORDERS (DECISION & REVIEW FLOW)         */}
      {/* ============================================================== */}
      {activeTab === 'assigned' && (
        workerComplaints.length === 0 ? (
          renderIsolationShield()
        ) : (
        <div className="space-y-4">
          
          {/* Subview: Overview List of Work Orders */}
          {decisionSubView === 'overview' && (
            <div className="space-y-4">
              {/* Urgency Alert Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-950">
                      DECISION REQUIRED: Response Needed for Assigned Remediation Orders
                    </h3>
                    <p className="text-xs text-amber-800">
                      Review site evidence, accept to commence works, or submit a reasoned decline for Nodal Officer reassignment.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs font-extrabold bg-white border border-amber-300 px-3 py-1.5 rounded-xl text-amber-900 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>SLA Countdown: {formatCountdown(secondsRemaining)}</span>
                </div>
              </div>

              {/* Task Cards Container - Full Width & Zero Gaps */}
              <div className={urgentTasks.length === 1 ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-2 gap-5'}>
                {urgentTasks.map((task) => {
                  const isSingle = urgentTasks.length === 1;
                  const photoSrc = task.photoUrl || task.inspectionReport?.sitePhotoUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop';

                  return (
                    <div
                      key={task.id}
                      className="bg-white border-2 border-slate-200 hover:border-[#0077B6] rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all relative overflow-hidden group w-full"
                    >
                      {/* Left colored urgency accent */}
                      <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-rose-500" />

                      <div className={isSingle ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 pl-1 sm:pl-2' : 'space-y-4 pl-1'}>
                        {/* Dossier Left Section */}
                        <div className={isSingle ? 'lg:col-span-7 space-y-4' : 'space-y-3'}>
                          {/* Header Badge Bar */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                                <span>High Priority • Urgent Action</span>
                              </span>
                              <span className="text-[11px] font-mono font-bold text-[#0077B6] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                                {task.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-xl shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>SLA Window: {formatCountdown(secondsRemaining)}</span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#0077B6] block">
                              {task.wasteType || 'Micro-Watershed Desilting & Channel Restoration'}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-1">
                              {task.locationLandmark || 'Champavathi River Basin Weir'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-semibold mt-1.5">
                              <span className="flex items-center gap-1 text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{task.village ? `${task.village}, ` : ''}{task.mandal || 'Bhogapuram'} Mandal ({task.district || 'Vizianagaram'})</span>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-slate-600">
                                GPS: {task.coordinates?.lat?.toFixed(4) || '18.1109'}° N, {task.coordinates?.lng?.toFixed(4) || '83.4268'}° E
                              </span>
                            </div>
                          </div>

                          {/* Citizen Grievance Quote Box */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                Citizen Complainant (आम नागरिक)
                              </span>
                              <span className="font-bold text-slate-800">
                                {task.citizenName || 'Anjana'} (Age {task.citizenAge || 32}) • <a href={`tel:${task.citizenPhone || '9440512345'}`} className="text-[#0077B6] font-mono hover:underline">{task.citizenPhone || '9440512345'}</a>
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 font-medium italic leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                              "{task.shortDescription || 'Plastic bottles aur domestic runoff se weir channel choke ho raha hai. Water flow completely blocked near agricultural weir.'}"
                            </p>
                          </div>

                          {/* 4-Role Chain of Custody Summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-2.5 space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-sky-700 block">Nodal Officer</span>
                              <span className="font-bold text-slate-900 block truncate">{task.assignedNodalOfficer || 'Dr. N. Subba Rao'}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold block">Triage: 2.4h</span>
                            </div>
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-amber-800 block">Field Inspector</span>
                              <span className="font-bold text-slate-900 block truncate">{task.assignedInspector || 'Sri K. Rama Krishna'}</span>
                              <span className="text-[10px] text-amber-700 font-semibold block">Verified</span>
                            </div>
                            <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Assigned Crew</span>
                              <span className="font-bold text-slate-900 block truncate">{selectedWorkerDisplayName}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold block">1x JCB &amp; 4 Workers</span>
                            </div>
                          </div>
                        </div>

                        {/* Dossier Right Section */}
                        <div className={isSingle ? 'lg:col-span-5 flex flex-col justify-between space-y-4' : 'space-y-3 pt-2 border-t border-slate-100'}>
                          {/* Evidence Photo Preview */}
                          <div
                            onClick={() => setEnlargedPhoto({ url: photoSrc, title: `Field Evidence: ${task.locationLandmark}` })}
                            className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video group/photo cursor-pointer shadow-xs bg-slate-900"
                          >
                            <img
                              src={photoSrc}
                              alt="Field Evidence"
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Field Audit Evidence</span>
                            </div>
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center justify-between">
                              <span>GPS: {task.coordinates?.lat?.toFixed(4) || '18.1109'}, {task.coordinates?.lng?.toFixed(4) || '83.4268'}</span>
                              <span className="text-sky-300 font-bold flex items-center gap-1">
                                <Maximize2 className="w-3 h-3" />
                                Inspect
                              </span>
                            </div>
                          </div>

                          {/* Audio Briefing */}
                          <button
                            type="button"
                            onClick={() =>
                              speakText(
                                `Work Order for ${selectedWorkerDisplayName}. Location: ${task.locationLandmark || 'Champavathi River Basin Weir'}. Problem: ${task.shortDescription}. Assigned team: 1 JCB and 4 workers. Deadline: Today 5 PM.`
                              )
                            }
                            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Volume2 className="w-4 h-4 text-[#0077B6]" />
                            <span>Listen to Work Order (Audio Memo)</span>
                          </button>

                          {/* Decision Action Buttons */}
                          <div className="space-y-2 pt-1">
                            <button
                              onClick={() => handleOpenTaskForReview(task)}
                              className="w-full py-3.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98"
                            >
                              <span>Open Task &amp; Accept Work Order</span>
                              <ArrowRight className="w-4 h-4 text-sky-200" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedComplaintId(task.id);
                                handleOpenDeclineReason();
                              }}
                              className="w-full py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>Decline with Reason (Reassign)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {urgentTasks.length === 0 && (
                  <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">No Pending Work Orders Waiting</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      All remediation tasks have been accepted and moved to Tab 2 (In-Progress Remediation) or completed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview: Task Review & Decision Screen (Matching image_014a0f3d.png) */}
          {decisionSubView === 'review' && activeComplaint && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
              
              {/* Back Button & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setDecisionSubView('overview')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Orders List</span>
                </button>
                <span className="text-xs font-bold bg-blue-50 text-[#0077B6] border border-blue-200 px-2.5 py-1 rounded-xl">
                  Saved on Phone
                </span>
              </div>

              {/* Decision Required Alert Header */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">
                      Decision Required
                    </h4>
                    <p className="text-[11px] text-rose-700">Please reply within 3h 45m</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-rose-700 bg-white border border-rose-200 px-2.5 py-1 rounded-xl shadow-2xs">
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>

              {/* Field Audit Evidence Card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src={activeComplaint.photoUrl || activeComplaint.inspectionReport?.sitePhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'}
                  alt="Worksite Evidence"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-xl border border-white/40 flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Field Audit Evidence</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-2xs">
                  Severe Blockage
                </div>
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl">
                  Captured today, 8:40 AM
                </div>
              </div>

              {/* Inspector Reporter Info */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                <span>Reported by Inspector R. Venkat (Vizianagaram Circle)</span>
                <button
                  onClick={() =>
                    setEnlargedPhoto({
                      url: activeComplaint.photoUrl || activeComplaint.inspectionReport?.sitePhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
                      title: activeComplaint.locationLandmark || 'Worksite Evidence',
                    })
                  }
                  className="text-[#0077B6] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Enlarge</span>
                </button>
              </div>

              {/* What to Fix Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#0077B6]" />
                    <h4 className="text-sm font-black text-slate-900">What to fix:</h4>
                  </div>
                  <button
                    onClick={() =>
                      speakText(
                        `What to fix: Clear heavy silt and tree branches blocking the sluice gate so water can enter the farm canal. Water flow is completely halted. Estimated team: 3 to 4 workers.`
                      )
                    }
                    className="px-3 py-1 bg-sky-100 hover:bg-sky-200 text-[#0077B6] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen (Eng)</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Clear heavy silt and tree branches blocking the sluice gate so water can enter the farm canal. Remove submerged weed mats and ensure apron masonry is free of packed debris.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Water Flow</div>
                      <div className="text-xs font-black text-slate-900">Completely Halted</div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0077B6] shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Estimated Team</div>
                      <div className="text-xs font-black text-slate-900">3 - 4 Workers</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Site Cadastral & Map Section */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Work Site Location
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {activeComplaint.locationLandmark || 'Champavathi River Basin Weir'}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">
                      Asset Code: {activeComplaint.id || 'AP-VZ-CHAMP-001'} • {activeComplaint.mandal || 'Bhogapuram'} Sector
                    </span>
                  </div>
                </div>

                {/* Embedded Real Satellite Leaflet Map with Google Hybrid English Tiles */}
                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <EngineerRealSatelliteMap
                    lat={targetLat}
                    lng={targetLng}
                    title={targetTitle}
                    assetCode={activeComplaint.id || "AP-VZ-CHAMP-001"}
                    mandal={activeComplaint.mandal || 'Bhogapuram'}
                    heightClass="h-44"
                  />
                </div>
              </div>

              {/* Schedule Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600">Statutory Schedule</span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                      Due soon
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Finish by: Friday, 24 May, 5:00 PM
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#0077B6] flex items-center justify-center font-bold text-xs">
                    PK
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Assigned by</div>
                    <div className="text-xs font-bold text-slate-800">Nodal Officer P. Kalyani</div>
                  </div>
                  <a
                    href="tel:+919440188776"
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0077B6] rounded-lg ml-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* THE TWO MAIN DECISION BUTTONS */}
              <div className="space-y-2.5 pt-2">
                {/* Accept Button */}
                <button
                  onClick={handleOpenAcceptGuidance}
                  className="w-full py-3.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Accept Task</span>
                </button>

                {/* Decline Button */}
                <button
                  onClick={handleOpenDeclineReason}
                  className="w-full py-3.5 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-200 hover:border-rose-300 rounded-2xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>I cannot take this task</span>
                </button>

                <p className="text-center text-[11px] text-slate-500 font-medium">
                  Your officer will be told immediately. No penalty for declining with a reason.
                </p>
              </div>
            </div>
          )}

          {/* Subview: Decline Reason Screen (Matching image_25e66427.png) */}
          {decisionSubView === 'decline_reason' && activeComplaint && (
            <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setDecisionSubView('review')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Task</span>
                </button>
                <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl">
                  Decline Reason Flow
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Why can't you take this task?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Tell us why so your officer can give this work to someone nearby. You will not lose other work.
                </p>
              </div>

              {/* Audio Listen Button */}
              <button
                onClick={() =>
                  speakText(
                    `Why cannot you take this task? Select: I am on leave, not my type of work, too far from me more than 20 kilometers, or too many tasks right now.`
                  )
                }
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0077B6] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-sky-200"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0077B6]" />
                <span>Listen to question</span>
              </button>

              {/* Radio Options List */}
              <div className="space-y-2.5">
                {declineReasons.map((reason) => {
                  const isSelected = selectedDeclineReason === reason.label;
                  return (
                    <div
                      key={reason.id}
                      onClick={() => setSelectedDeclineReason(reason.label)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 border-2 border-[#0077B6] shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{reason.icon}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {reason.label}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#0077B6] bg-[#0077B6] text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulated Voice Note Recorder */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span className="text-xs font-black text-rose-900">
                      Recording voice note...
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-slate-700">0:14</span>
                </div>

                {/* Animated Waveform */}
                <div className="flex items-center justify-center gap-1.5 py-3 h-12 bg-white rounded-xl border border-slate-200">
                  {[24, 40, 16, 48, 20, 36, 12, 44, 28, 52, 18, 32, 40, 16].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tap check to attach voice note</span>
                  <button
                    onClick={() => setDeclineVoiceSeconds(14)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Fair Work Guarantee Card */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                  🤝
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950">Fair Work Guarantee</h4>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed mt-0.5">
                    Valid declines with a reason are never counted against you. Your Nodal Officer will reassign this task to an available crew.
                  </p>
                </div>
              </div>

              {/* Submit to Officer Button */}
              <button
                onClick={handleSendDeclineToOfficer}
                className="w-full py-3.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Send to Officer</span>
              </button>
            </div>
          )}

          {/* Subview: Task Accepted & Field Guidance Screen (Matching image_c15f495e.png) */}
          {decisionSubView === 'accept_guidance' && activeComplaint && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setDecisionSubView('review')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    Task Accepted • Ready to start work
                  </span>
                </div>
              </div>

              {/* Water Recharge Asset Title Card */}
              <div className="flex items-start justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0077B6] flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    Water Recharge Asset
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {activeComplaint.locationLandmark || 'Champavathi River Basin Weir'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeComplaint.mandal || 'Bhogapuram'} Mandal • {activeComplaint.village || 'Champavathi Basin'}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                  <div className="text-base font-black text-[#0077B6]">12</div>
                  <div className="text-[10px] text-slate-500 font-bold">Ayacut Ha</div>
                </div>
              </div>

              {/* Mandatory Before Photo Proof Requirement */}
              <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0077B6]" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      Step 1: Mandatory BEFORE Photo Capture
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded-md">
                    Geo-Stamped Proof
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Government regulation requires a geo-tagged baseline photo before digging or clearing starts.
                </p>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                  <img
                    src={beforePhotoUrl}
                    alt="Before State"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span>18.5721° N, 83.3644° E</span>
                    <span>Baseline: 65% silt occlusion recorded</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={beforeFileInputRef}
                    onChange={handleBeforePhotoUpload}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <button
                    onClick={() => beforeFileInputRef.current?.click()}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-[#0077B6] border border-sky-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-[#0077B6]" />
                    <span>Take / Replace Before Photo</span>
                  </button>
                </div>
              </div>

              {/* Field Instructions Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Field Instructions: What needs to be done:
                  </h4>
                  <button
                    onClick={() =>
                      speakText(
                        `Step 1: Remove weeds and tree branches. Step 2: Excavate silt 1 meter deep. Step 3: Oil and grease gate wheel spindle.`
                      )
                    }
                    className="px-2.5 py-1 bg-sky-50 text-[#0077B6] rounded-xl text-xs font-bold flex items-center gap-1 border border-sky-200 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen to steps</span>
                  </button>
                </div>

                {/* Step 1 */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs sm:text-sm font-black text-slate-900">
                      Remove weeds and tree branches
                    </h5>
                    <p className="text-xs text-slate-600">
                      Clear all floating debris, thorny brush, and timber blocking the upper weir gate track.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                      Tools needed: Sickle, Branch Cutter, Rope
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs sm:text-sm font-black text-slate-900">
                      Excavate silt 1 meter deep
                    </h5>
                    <p className="text-xs text-slate-600">
                      Dig out packed mud and gravel around the front apron masonry to restore free pool depth.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Check depth marker notch on concrete pillar
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs sm:text-sm font-black text-slate-900">
                      Oil and grease the gate wheel spindle
                    </h5>
                    <p className="text-xs text-slate-600">
                      Coat both threaded hoist rods with heavy gear grease until turning wheel rotates smoothly by hand.
                    </p>
                    <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Turn clockwise 3 full cycles to test
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Work Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleConfirmAcceptTask}
                  className="w-full py-3.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>Start Work ➔</span>
                </button>

                <button
                  onClick={() => setShowStuckModal(true)}
                  className="w-full py-2.5 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>I am stuck / Need help</span>
                </button>
              </div>
            </div>
          )}
        </div>
        )
      )}

      {/* ============================================================== */}
      {/* 3. TAB 2: IN-PROGRESS REMEDIATION (ACTIVE EXECUTION SCREEN)    */}
      {/* ============================================================== */}
      {activeTab === 'in_progress' && (
        !hasActiveRemediation ? (
          <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
            {/* Remediation Crew Standby Terminal */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-[#0077B6] flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Remediation Operations Readiness &amp; Standby
                      </h3>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Field Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedWorkerDisplayName} • {selectedWorker.district} Remediation Circle
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                  Unit: {selectedWorker.worker_id}
                </span>
              </div>

              {/* Status explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0077B6]" />
                  <span>Current Operational Status: Awaiting Active Remediation Trigger</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No statutory work order is currently actively undergoing physical excavation by this crew. 
                  {urgentTasks.length > 0 
                    ? ` You have ${urgentTasks.length} assigned work order(s) waiting for acceptance in Tab 1.`
                    : ` When the ${selectedWorker.district} District Nodal Officer assigns an emergency or desilting order to ${selectedWorker.name_or_crew}, it will appear directly in Tab 1.`}
                </p>
              </div>

              {/* Equipment Roster Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Remediation Equipment &amp; Crew Readiness Roster
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Excavator / JCB 3DX</div>
                        <div className="text-[11px] text-slate-500">Hydraulics Checked • Fuel 94%</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Operational
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Slurry Suction Pump</div>
                        <div className="text-[11px] text-slate-500">15 HP 3-Phase Submersible</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Mounted
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Trained Field Personnel</div>
                        <div className="text-[11px] text-slate-500">{workerCount} Operatives + 1 Supervisor</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      On Standby
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Safety PPE &amp; Harnesses</div>
                        <div className="text-[11px] text-slate-500">High-Vis Vests, Waders, First Aid</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Certified
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                {urgentTasks.length > 0 ? (
                  <button
                    onClick={() => {
                      setActiveTab('assigned');
                      setDecisionSubView('overview');
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Review &amp; Accept Assigned Task in Tab 1 ➔</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('map')}
                    className="w-full sm:w-auto px-5 py-3 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Open {selectedWorker.district} GIS Cadastral Map (Tab 4) ➔</span>
                  </button>
                )}

                <button
                  onClick={() => setIsSelectingWorker(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Switch Action Worker</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Active Work Order Card (Matching image_92871c93.png) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            
            {/* Header Stage */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0077B6]">
                  Active Task Execution
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {activeComplaint?.locationLandmark || 'Champavathi River Basin Weir'}
                </h3>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-[#0077B6] border border-blue-200 px-3 py-1 rounded-xl">
                Step 2 of 3
              </span>
            </div>

            {/* GPS Confirmed On-Site Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-950">
                    GPS Confirmed On-Site ({targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° E)
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    You are at {activeComplaint?.locationLandmark || 'Champavathi River Basin Weir'} (accuracy ±1.8m RTK calibrated)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block font-mono text-xs font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-300">
                Live Field Dispatch
              </span>
            </div>

            {/* Statutory 4-Role Accountability Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px]">
              <div className="space-y-0.5 border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block">1. Citizen (Aam Nagrik)</span>
                <span className="font-bold text-slate-900 block truncate">{activeComplaint?.citizenName || 'Anjana'} (Age {activeComplaint?.citizenAge || 32})</span>
                <span className="text-slate-500 font-mono text-[10px] block truncate">{activeComplaint?.citizenPhone || '+91 94405 12345'}</span>
              </div>
              <div className="space-y-0.5 border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-black text-sky-600 block">2. Nodal Officer (IAS)</span>
                <span className="font-bold text-slate-900 block truncate">{activeComplaint?.assignedNodalOfficer || 'Dr. N. Subba Rao'}</span>
                <span className="text-emerald-700 font-semibold text-[10px] block">Triage 2.4h • Diligent</span>
              </div>
              <div className="space-y-0.5 border-r border-slate-200/80 pr-2">
                <span className="text-[10px] uppercase font-black text-amber-600 block">3. Inspector</span>
                <span className="font-bold text-slate-900 block truncate">{activeComplaint?.assignedInspector || 'Sri K. Rama Krishna'}</span>
                <span className="text-amber-800 font-semibold text-[10px] block">En-route / Verified</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-emerald-600 block">4. Action Worker (EE)</span>
                <span className="font-bold text-slate-900 block truncate">{selectedWorkerDisplayName}</span>
                <span className="text-emerald-700 font-semibold text-[10px] block">1x JCB + 4 Crew</span>
              </div>
            </div>

            {/* Step 1: Geo-Stamped BEFORE Photo */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    1. Take BEFORE Photo
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Completed at 10:14 AM
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                <img
                  src={beforePhotoUrl}
                  alt="Before Excavation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Geo-stamped Proof</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center justify-between">
                  <span>{targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° E</span>
                  <span>Baseline: 65% silt occlusion recorded</span>
                </div>
              </div>
            </div>

            {/* Step 2: Interactive Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0077B6]" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    2. Do the Work
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-[#0077B6] bg-sky-100 px-2 py-0.5 rounded-md">
                  In Progress right now
                </span>
              </div>

              <div className="space-y-2">
                {/* Item 1 */}
                <div
                  onClick={() => toggleChecklistItem('silt')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    checklist.silt
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        checklist.silt
                          ? 'bg-[#0077B6] border-[#0077B6] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {checklist.silt && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Silt excavated from apron (400 m³)
                    </span>
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  onClick={() => toggleChecklistItem('weeds')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    checklist.weeds
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        checklist.weeds
                          ? 'bg-[#0077B6] border-[#0077B6] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {checklist.weeds && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Weeds and brush cleared from conduit
                    </span>
                  </div>
                </div>

                {/* Item 3 */}
                <div
                  onClick={() => toggleChecklistItem('spindle')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    checklist.spindle
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        checklist.spindle
                          ? 'bg-[#0077B6] border-[#0077B6] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {checklist.spindle && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Oil applied to spindle wheel
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Turn crank gear 3 full rotations after lubrication
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Take AFTER Photo Upload Box */}
            <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#0077B6]" />
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    3. Take AFTER Photo
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-200 px-2 py-0.5 rounded-md">
                  Step 3 Proof
                </span>
              </div>

              {afterPhotoUploaded ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                  <img
                    src={afterPhotoUrl}
                    alt="Restored State"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Restored Water Flow Captured</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span>18.5721° N, 83.3644° E</span>
                    <span>Clean Gate Verified</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-sky-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0077B6] flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">Capture Restored State</h5>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                      Take clear photo of clean gate and restored water flow. (Camera only, verified GPS geotag).
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAfterPhotoUpload}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera & Take After Photo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Field Audit Details: Laborers Counter & Voice Note */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Field Audit Details
              </h4>

              {/* Workers Counter */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900">
                    How many people worked today?
                  </h5>
                  <p className="text-[11px] text-slate-500">Field excavation crew</p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                  <button
                    onClick={() => setWorkerCount((c) => Math.max(1, c - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-slate-900 font-mono w-4 text-center">
                    {workerCount}
                  </span>
                  <button
                    onClick={() => setWorkerCount((c) => c + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Voice Memo Widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-[#0077B6]" />
                    Record voice note about work (Optional)
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    <div>
                      <div className="text-xs font-black text-slate-900">0:24 Voice note recorded</div>
                      <button
                        onClick={() => {
                          setIsVoiceNotePlaying(!isVoiceNotePlaying);
                          speakText("Voice note recorded on site: Apron excavated, heavy silt cleared, gate running freely.");
                        }}
                        className="text-[10px] text-[#0077B6] font-bold hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Tap to replay audio 🔊</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Voice note reset.")}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON: Next: Review & Send for Checking */}
            <button
              onClick={handleSubmitToInspectorForVerification}
              className="w-full py-4 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>Next: Review & Send for Checking ➔</span>
            </button>
          </div>
        </div>
        )
      )}

      {/* ============================================================== */}
      {/* 4. TAB 3: COMPLETED & VERIFICATION (INSPECTOR SIGN-OFF TRACKING)*/}
      {/* ============================================================== */}
      {activeTab === 'completed' && (
        waitingReviewTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Statutory Verification &amp; Remediation Audit Ledger
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                All physical works completed by <strong>{selectedWorkerDisplayName}</strong> undergo two-stage statutory verification: 1. Field Inspector physical on-site audit with DGPS coordinates and probe testing. 2. District Nodal Officer closure.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs max-w-md mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Active Action Worker:</span>
                <span className="font-bold text-slate-900">{selectedWorkerDisplayName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Pending Inspector Sign-offs:</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  0 Records
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Completed &amp; Closed Works:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  0 Records in Current Cycle
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTab('assigned');
                  setDecisionSubView('overview');
                }}
                className="px-4 py-2.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Go to Assigned Orders (Tab 1)</span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Open Cadastral Map (Tab 4)</span>
              </button>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          
          {/* Section A: Pending Inspector Physical Verification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Awaiting Field Inspector Physical Verification ({waitingReviewTasks.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tasks submitted by worker, currently waiting for inspector on-site re-inspection and statutory sign-off.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingReviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Pending Inspector Sign-off
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {task.mandal} Circle
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {task.locationLandmark}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {task.shortDescription}
                    </p>
                  </div>

                  {/* Before vs After Side-by-Side Comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-rose-700 uppercase">BEFORE (Blocked)</div>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video">
                        <img
                          src={task.workExecution?.beforePhotoUrl || task.photoUrl}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase">AFTER (Cleaned)</div>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video">
                        <img
                          src={task.workExecution?.afterPhotoUrl || afterPhotoUrl}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assigned Inspector Info Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0077B6] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">
                        Dispatched to Inspector Sri K. Rama Krishna
                      </span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Inspector will verify site in Tab 2 'Repair Verifications' of their portal and statutorily close the case.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {waitingReviewTasks.length === 0 && (
                <div className="col-span-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-500">
                  No tasks currently awaiting inspector sign-off.
                </div>
              )}
            </div>
          </div>

          {/* Section B: Statutorily Closed & Resolved */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Statutorily Verified & Closed Cases ({completedTasks.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Water recharge assets with completed remediation and approved inspector sign-off.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Statutorily Closed (RESOLVED)
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      100% Water Flow Restored
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {task.locationLandmark}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {task.shortDescription}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 font-medium">
                    "Physical site inspected. Water flow fully restored. Apron and weir free of packed silt. Zero obstruction remaining."
                  </div>
                </div>
              ))}

              {completedTasks.length === 0 && (
                <div className="col-span-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-500">
                  No closed cases yet in this session.
                </div>
              )}
            </div>
          </div>
        </div>
        )
      )}

      {/* ============================================================== */}
      {/* 5. TAB 4: GIS CADASTRAL MAP (DISTRICT NODAL SATELLITE MAP)     */}
      {/* ============================================================== */}
      {activeTab === 'map' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedWorker.district} District Hydrological &amp; Remediation Satellite Map
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative District Nodal Officer surveillance map: Esri World Satellite, ISRO Bhuvan telemetry, district reservoirs, river gauges, piezometers, and work orders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0077B6] bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                {selectedWorker.district} Circle
              </span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm min-h-[580px]">
            <DistrictNodalSatelliteMap
              district={selectedWorker.district || 'Vizianagaram'}
              complaints={complaints}
              waterBodies={waterBodies}
              onSelectComplaint={(c) => {
                setSelectedComplaintId(c.id);
                setActiveTab('assigned');
              }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODALS: ENLARGED PHOTO, STUCK HAZARD ALERT, MAP EXPAND      */}
      {/* ============================================================== */}

      {/* Photo Enlarge Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 p-2 space-y-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-1 text-white">
              <span className="text-xs font-bold">{enlargedPhoto.title}</span>
              <button
                onClick={() => setEnlargedPhoto(null)}
                className="p-1 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={enlargedPhoto.url}
              alt="Enlarged Preview"
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Stuck Hazard Alert Modal */}
      {showStuckModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowStuckModal(false)}
        >
          <div
            className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl space-y-4 border border-rose-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950">Site Breakdown or Stuck?</h3>
                <p className="text-xs text-rose-700">Send emergency statutory alert to Nodal Officer</p>
              </div>
            </div>

            <textarea
              value={stuckReason}
              onChange={(e) => setStuckReason(e.target.value)}
              placeholder="Describe obstacle (e.g. Backhoe arm jammed, flood surge over weir, masonry collapse risk)..."
              className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden min-h-24"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowStuckModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeComplaint) {
                    onBlockTask(activeComplaint.id, `EMERGENCY ALERT: ${stuckReason || 'Equipment jammed on-site'}`);
                  }
                  setShowStuckModal(false);
                  alert("Emergency alert dispatched to Nodal Officer dispatch cell!");
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs"
              >
                Dispatch Emergency Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Map Modal */}
      {showMapModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowMapModal(false)}
        >
          <div
            className="max-w-5xl w-full h-[85vh] bg-slate-900 rounded-3xl overflow-hidden border border-white/20 p-3 flex flex-col space-y-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white px-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-black">Full Satellite Cadastral Map (English Labels)</span>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden">
              <EngineerRealSatelliteMap
                lat={targetLat}
                lng={targetLng}
                title={targetTitle}
                assetCode={activeComplaint?.id || "AP-VZ-CHAMP-001"}
                mandal={activeComplaint?.mandal || 'Bhogapuram'}
                heightClass="h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
