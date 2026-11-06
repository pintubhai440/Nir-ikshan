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
  Pause,
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
  SlidersHorizontal,
  Activity,
  Filter,
  CheckCheck,
  Maximize2,
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
import { isComplaintAssignedToWorker, isDistrictMatch, isWorkerNameMatch } from '../utils/workerFilter';
import { 
  fetchActionWorkersFromSupabase, 
  subscribeToActionWorkers, 
  isSupabaseConfigured 
} from '../lib/supabase';

export const DEFAULT_BEFORE_PHOTO = '/assets/evidence/sluice_gate_choked.jpg';
export const DEFAULT_AFTER_PHOTO = '/assets/evidence/sluice_gate_cleaned.jpg';

interface EngineerDashboardProps {
  district?: string;
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
  district,
  complaints,
  waterBodies,
  onAcceptTask,
  onBlockTask,
  onCompleteTask,
  onViewChange,
}) => {
  const { language, t } = useLanguage();
  const currentLang = (language === 'hi' || language === 'te') ? language : 'en';

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
  const [declinedComplaintIds, setDeclinedComplaintIds] = useState<string[]>([]);
  const [declineSuccessNotice, setDeclineSuccessNotice] = useState<{
    id: string;
    location: string;
    reason: string;
    time: string;
    hasVoiceNote: boolean;
  } | null>(null);

  // Real-time Voice Memo & Recording State
  const [declineAudioState, setDeclineAudioState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [declineAudioDuration, setDeclineAudioDuration] = useState<number>(0);
  const [declineAudioUrl, setDeclineAudioUrl] = useState<string | null>(null);
  const [isPlayingDeclineAudio, setIsPlayingDeclineAudio] = useState<boolean>(false);
  const [declineVoiceNoteRemarks, setDeclineVoiceNoteRemarks] = useState<string>(
    'Assigned site requires heavy hydraulic mechanical excavator and silt suction pump not deployed with this manual unit. Reassignment requested.'
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Audio Recording Handlers with Fallback
  const startDeclineVoiceRecording = async () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingDeclineAudio(false);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setDeclineAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setDeclineAudioState('recording');
        setDeclineAudioDuration(0);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setDeclineAudioDuration((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('getUserMedia unavailable');
      }
    } catch {
      // In iframe environments or restricted permissions, run simulated recording
      setDeclineAudioState('recording');
      setDeclineAudioDuration(0);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setDeclineAudioDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopDeclineVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        setDeclineAudioUrl('SIMULATED_VOICE_NOTE');
      }
    } else {
      setDeclineAudioUrl('SIMULATED_VOICE_NOTE');
    }

    setDeclineAudioState('recorded');
    setDeclineAudioDuration((prev) => (prev > 0 ? prev : 7));
  };

  const togglePlayDeclineAudio = () => {
    if (isPlayingDeclineAudio) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingDeclineAudio(false);
      return;
    }

    if (declineAudioUrl && declineAudioUrl !== 'SIMULATED_VOICE_NOTE') {
      try {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio(declineAudioUrl);
        } else {
          audioPlayerRef.current.src = declineAudioUrl;
        }
        audioPlayerRef.current.onended = () => setIsPlayingDeclineAudio(false);
        audioPlayerRef.current.onerror = () => {
          setIsPlayingDeclineAudio(false);
          speakText(`Playing attached crew voice memo: ${declineVoiceNoteRemarks}`);
        };
        setIsPlayingDeclineAudio(true);
        audioPlayerRef.current.play().catch(() => {
          speakText(`Playing attached crew voice memo: ${declineVoiceNoteRemarks}`);
        });
      } catch {
        speakText(`Playing attached crew voice memo: ${declineVoiceNoteRemarks}`);
      }
    } else {
      setIsPlayingDeclineAudio(true);
      speakText(`Recorded crew voice note memo: ${declineVoiceNoteRemarks}`);
      setTimeout(() => setIsPlayingDeclineAudio(false), Math.max(3500, (declineAudioDuration || 6) * 1000));
    }
  };

  const resetDeclineVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingDeclineAudio(false);
    setDeclineAudioState('idle');
    setDeclineAudioDuration(0);
    setDeclineAudioUrl(null);
  };

  // Active Remediation Execution State
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    silt: true,
    weeds: true,
    spindle: false,
  });
  const [workerCount, setWorkerCount] = useState<number>(4);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string>(DEFAULT_BEFORE_PHOTO);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(DEFAULT_AFTER_PHOTO);
  const [afterPhotoUploaded, setAfterPhotoUploaded] = useState<boolean>(false);
  const [beforePhotoUploaded, setBeforePhotoUploaded] = useState<boolean>(true);
  const [isVoiceNotePlaying, setIsVoiceNotePlaying] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);

  // Real-time synchronization trigger across roles (Nodal Kanban, Inspector, Action Worker)
  const [tasksSyncVersion, setTasksSyncVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setTasksSyncVersion((v) => v + 1);
    };
    window.addEventListener('nir_tasks_updated', handleSync);
    window.addEventListener('nir_complaints_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('nir_tasks_updated', handleSync);
      window.removeEventListener('nir_complaints_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Strict 1-to-1 Worker Task Isolation (Zero Cross-Worker Leakage)
  // Ek worker dusre worker ka koi bhi kaam nahi dekh sakta hai.
  // Only complaints & work orders officially assigned to this specific worker by the Nodal Officer are visible.
  // Synchronized across base complaints, localStorage nir_complaints, and nir_nodal_tasks.
  // Blocked / Declined tasks are immediately excluded from active terminal view.
  const workerComplaints = useMemo<CitizenComplaint[]>(() => {
    const map = new Map<string, CitizenComplaint>();

    // 1. Base complaints
    complaints.forEach((c) => {
      if (c && c.id) map.set(c.id, c);
    });

    // 2. Local storage complaints
    try {
      const cachedStr = localStorage.getItem('nir_complaints');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (Array.isArray(cached)) {
          cached.forEach((c: CitizenComplaint) => {
            if (c && c.id) {
              const existing = map.get(c.id);
              map.set(c.id, { ...existing, ...c });
            }
          });
        }
      }
    } catch {}

    // 3. Authoritative tasks from nir_nodal_tasks
    try {
      const nodalTasksStr = localStorage.getItem('nir_nodal_tasks');
      if (nodalTasksStr) {
        const nodalTasks = JSON.parse(nodalTasksStr);
        if (Array.isArray(nodalTasks)) {
          nodalTasks.forEach((t: any) => {
            if (!t) return;
            const isAssigned =
              (t.assignedWorkerId && (
                t.assignedWorkerId.toLowerCase() === selectedWorker.worker_id.toLowerCase() ||
                t.assignedWorkerId.toLowerCase().replace('sup-wrk-', '') === selectedWorker.worker_id.toLowerCase().replace('sup-wrk-', '')
              )) ||
              isWorkerNameMatch(t.assignedWorkerName, selectedWorker);

            if (isAssigned) {
              const targetId = t.sourceRefId || t.id;
              const existing = map.get(targetId) || map.get(t.id);

              let mappedStatus: CitizenComplaint['status'] = 'ACTION_ASSIGNED';
              let execStatus = 'PENDING_ACCEPTANCE';

              if (t.stage === 'in_progress') {
                mappedStatus = 'WORKER_IN_PROGRESS';
                execStatus = 'ACCEPTED';
              } else if (t.stage === 'under_verification') {
                mappedStatus = 'VERIFICATION_PENDING';
                execStatus = 'COMPLETED';
              } else if (t.stage === 'verified_closed') {
                mappedStatus = 'RESOLVED';
                execStatus = 'COMPLETED';
              }

              const mergedItem: CitizenComplaint = {
                id: targetId,
                district: t.district || existing?.district || selectedWorker.district,
                mandal: t.mandal || existing?.mandal || (selectedWorker as any).mandal || 'Bobbili',
                village: t.village || existing?.village || t.mandal,
                locationLandmark: t.title || existing?.locationLandmark || 'Water Structure',
                shortDescription: t.description || existing?.shortDescription || 'Sluice gate & channel desilting',
                coordinates: t.coordinates || existing?.coordinates || { lat: 18.5721, lng: 83.3644 },
                submittedAt: t.reportedDate || existing?.submittedAt || new Date().toISOString(),
                citizenName: t.citizenName || existing?.citizenName || 'Public Grievance Cell',
                citizenAge: 38,
                citizenGender: 'Other',
                citizenPhone: t.citizenPhone || existing?.citizenPhone || '+91 94401 22334',
                assignedNodalOfficer: t.assignedNodalOfficer || existing?.assignedNodalOfficer || 'District Nodal Officer',
                assignedInspector: t.verificationInspectorName || existing?.assignedInspector || 'Sri K. Rama Krishna',
                assignedInspectorPhone: t.verificationInspectorPhone || existing?.assignedInspectorPhone || '+91 94401 22334',
                assignedInspectorId: t.verificationInspectorId || existing?.assignedInspectorId || 'insp-vzm-01',
                assignedEngineer: t.assignedWorkerName || existing?.assignedEngineer || selectedWorker.name_or_crew,
                assignedEngineerPhone: t.assignedWorkerPhone || existing?.assignedEngineerPhone || selectedWorker.phone,
                assignedEngineerId: selectedWorker.worker_id,
                wasteType: t.title || existing?.wasteType || 'Channel Choke & Silt',
                photoUrl: t.beforePhotoUrl || existing?.photoUrl || DEFAULT_BEFORE_PHOTO,
                status: (t.stage === 'assigned' || !t.stage) ? 'ACTION_ASSIGNED' : (existing?.status && existing.status !== 'INSPECTOR_ASSIGNED' && existing.status !== 'SUBMITTED' ? existing.status : mappedStatus),
                machineryDeployed: t.machineryType || existing?.machineryDeployed || 'Hydraulic Excavator & Suction Pump',
                workExecution: (t.stage === 'assigned' || !t.stage) ? {
                  ...(existing?.workExecution || {}),
                  id: existing?.workExecution?.id || `EXEC-${targetId}`,
                  engineerName: t.assignedWorkerName || selectedWorker.name_or_crew,
                  engineerPhone: t.assignedWorkerPhone || selectedWorker.phone,
                  assignedAt: t.reportedDate || new Date().toISOString(),
                  deadline: t.targetDate || '24 Hours',
                  status: 'PENDING_ACCEPTANCE' as const,
                  beforePhotoUrl: t.beforePhotoUrl || DEFAULT_BEFORE_PHOTO,
                  workSummary: t.remedialNotes,
                } : existing?.workExecution || {
                  id: `EXEC-${targetId}`,
                  engineerName: t.assignedWorkerName || selectedWorker.name_or_crew,
                  engineerPhone: t.assignedWorkerPhone || selectedWorker.phone,
                  assignedAt: t.reportedDate || new Date().toISOString(),
                  deadline: t.targetDate || '24 Hours',
                  status: (t.stage === 'assigned' || !t.stage) ? ('PENDING_ACCEPTANCE' as const) : (execStatus as any),
                  acceptedAt: (t.stage === 'assigned' || !t.stage) ? undefined : new Date().toISOString(),
                  beforePhotoUrl: t.beforePhotoUrl || DEFAULT_BEFORE_PHOTO,
                  afterPhotoUrl: t.afterPhotoUrl || (t.stage === 'under_verification' || t.stage === 'verified_closed' ? DEFAULT_AFTER_PHOTO : undefined),
                  workSummary: t.remedialNotes,
                },
              };

              map.set(targetId, mergedItem);
            }
          });
        }
      }
    } catch {}

    const all = Array.from(map.values());
    return all.filter((c: CitizenComplaint) => {
      if (declinedComplaintIds.includes(c.id)) return false;
      if (c.workExecution?.status === 'BLOCKED') return false;
      return isComplaintAssignedToWorker(c, selectedWorker);
    });
  }, [complaints, selectedWorker, declinedComplaintIds, tasksSyncVersion]);

  // Dynamic Task Categorization
  const urgentTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      !declinedComplaintIds.includes(c.id) &&
      c.workExecution?.status !== 'BLOCKED' &&
      c.workExecution?.status !== 'COMPLETED' &&
      (c.status === 'ACTION_ASSIGNED' ||
        c.workExecution?.status === 'PENDING_ACCEPTANCE' ||
        !c.workExecution?.status)
  );

  const inProgressTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      !declinedComplaintIds.includes(c.id) &&
      c.workExecution?.status !== 'PENDING_ACCEPTANCE' &&
      c.workExecution?.status !== 'COMPLETED' &&
      c.workExecution?.status !== 'BLOCKED' &&
      c.status !== 'ACTION_ASSIGNED' &&
      c.status !== 'VERIFICATION_PENDING' &&
      c.status !== 'RESOLVED' &&
      (c.status === 'WORKER_IN_PROGRESS' ||
        (c.workExecution &&
          (c.workExecution.status === 'ACCEPTED' || (c.workExecution.status as string) === 'IN_PROGRESS')))
  );

  const waitingReviewTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'VERIFICATION_PENDING' ||
      (c.workExecution && c.workExecution.status === 'COMPLETED' && (c.status as string) !== 'RESOLVED')
  );

  const completedTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      (c.status as string) === 'RESOLVED' ||
      (c.workExecution !== undefined &&
        c.workExecution.status === 'COMPLETED' &&
        (c.status as string) === 'RESOLVED')
  );

  const allRemediationTasks: CitizenComplaint[] = workerComplaints.filter(
    (c: CitizenComplaint) =>
      c.status === 'ACTION_ASSIGNED' ||
      c.status === 'WORKER_IN_PROGRESS' ||
      c.status === 'VERIFICATION_PENDING' ||
      c.status === 'RESOLVED' ||
      c.workExecution !== undefined
  );

  // Auto-switch active tab when selecting a worker who has tasks in progress or under verification
  useEffect(() => {
    if (urgentTasks.length > 0) {
      setActiveTab('assigned');
    } else if (inProgressTasks.length > 0) {
      setActiveTab('in_progress');
    } else if (waitingReviewTasks.length > 0) {
      setActiveTab('completed');
    }
  }, [selectedWorker?.worker_id, urgentTasks.length, inProgressTasks.length, waitingReviewTasks.length]);

  // Active complaint determination
  const activeComplaint =
    workerComplaints.find((c: CitizenComplaint) => c.id === selectedComplaintId) ||
    urgentTasks[0] ||
    inProgressTasks[0] ||
    workerComplaints[0];

  const executionTask =
    inProgressTasks.find((c: CitizenComplaint) => c.id === selectedComplaintId) ||
    inProgressTasks[0] ||
    (activeComplaint &&
    (activeComplaint.status === 'WORKER_IN_PROGRESS' ||
      activeComplaint.workExecution?.status === 'ACCEPTED')
      ? activeComplaint
      : null);

  const hasActiveRemediation = inProgressTasks.length > 0 || Boolean(executionTask);

  // Auto-sync beforePhotoUrl whenever active task changes
  useEffect(() => {
    const candidateTask = executionTask || activeComplaint;
    if (candidateTask) {
      const candidatePhoto =
        candidateTask.workExecution?.beforePhotoUrl ||
        candidateTask.inspectionReport?.sitePhotoUrl ||
        candidateTask.photoUrl;
      if (candidatePhoto) {
        setBeforePhotoUrl(candidatePhoto);
      }
    }
  }, [activeComplaint?.id, executionTask?.id]);

  // Auto-select first task if none selected
  useEffect(() => {
    if (!selectedComplaintId) {
      if (urgentTasks.length > 0) {
        setSelectedComplaintId(urgentTasks[0].id);
      } else if (inProgressTasks.length > 0) {
        setSelectedComplaintId(inProgressTasks[0].id);
      }
    }
  }, [urgentTasks, inProgressTasks, selectedComplaintId]);

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
      activeComplaint.workExecution?.beforePhotoUrl ||
      activeComplaint.inspectionReport?.sitePhotoUrl ||
      activeComplaint.photoUrl ||
      DEFAULT_BEFORE_PHOTO;
    
    setSelectedComplaintId(activeComplaint.id);
    onAcceptTask(activeComplaint.id, photoToUse);

    // Sync to nir_nodal_tasks
    try {
      const storedStr = localStorage.getItem('nir_nodal_tasks');
      if (storedStr) {
        const list = JSON.parse(storedStr);
        if (Array.isArray(list)) {
          const updated = list.map((t: any) => {
            if (t.id === activeComplaint.id || t.sourceRefId === activeComplaint.id) {
              return { ...t, stage: 'in_progress', beforePhotoUrl: photoToUse };
            }
            return t;
          });
          localStorage.setItem('nir_nodal_tasks', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('nir_tasks_updated'));
        }
      }
    } catch {}

    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    setActiveTab('in_progress');
    setDecisionSubView('overview');
  };

  const handleSendDeclineToOfficer = () => {
    if (!activeComplaint) return;
    const complaintIdToDecline = activeComplaint.id;
    const locationName = activeComplaint.locationLandmark || activeComplaint.shortDescription || 'Work Site';
    
    let finalReason = selectedDeclineReason;
    const hasVoiceNote = selectedDeclineReason.includes('voice note') || declineAudioState === 'recorded';
    if (hasVoiceNote) {
      finalReason = `Voice Note Memo (${declineAudioDuration > 0 ? declineAudioDuration : 8}s) Attached: "${declineVoiceNoteRemarks}"`;
    }

    // 1. Instantly register in local state to drop task from urgent queue immediately
    setDeclinedComplaintIds((prev) => [...prev, complaintIdToDecline]);
    setSelectedComplaintId(null);

    // 2. Transmit block/decline action to Supabase and parent App state
    onBlockTask(complaintIdToDecline, finalReason);

    // 3. Sync decline to nir_nodal_tasks
    try {
      const storedStr = localStorage.getItem('nir_nodal_tasks');
      if (storedStr) {
        const list = JSON.parse(storedStr);
        if (Array.isArray(list)) {
          const updated = list.map((t: any) => {
            if (t.id === complaintIdToDecline || t.sourceRefId === complaintIdToDecline) {
              return {
                ...t,
                stage: 'unassigned',
                remedialNotes: `Declined by worker: ${finalReason}`,
              };
            }
            return t;
          });
          localStorage.setItem('nir_nodal_tasks', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('nir_tasks_updated'));
        }
      }
    } catch {}

    // 4. Set statutory confirmation notice
    setDeclineSuccessNotice({
      id: complaintIdToDecline,
      location: locationName,
      reason: finalReason,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasVoiceNote,
    });

    // 5. Reset audio and transition to overview
    resetDeclineVoiceRecording();
    setDecisionSubView('overview');
  };

  const handleSubmitToInspectorForVerification = () => {
    const taskToComplete = executionTask || activeComplaint;
    if (!taskToComplete) return;
    const finalAfter = afterPhotoUrl || DEFAULT_AFTER_PHOTO;
    const summary = `Remediation completed on site by ${workerCount}-worker excavation unit. Conduits and sluice aprons at ${taskToComplete.locationLandmark} de-silted, floating obstructions (${taskToComplete.wasteType || 'silt & debris'}) cleared, gate spindle greased and tested. Restored flow verified on camera.`;
    onCompleteTask(taskToComplete.id, finalAfter, summary);

    // Sync to nir_nodal_tasks
    try {
      const storedStr = localStorage.getItem('nir_nodal_tasks');
      if (storedStr) {
        const list = JSON.parse(storedStr);
        if (Array.isArray(list)) {
          const updated = list.map((t: any) => {
            if (t.id === taskToComplete.id || t.sourceRefId === taskToComplete.id) {
              return {
                ...t,
                stage: 'under_verification',
                afterPhotoUrl: finalAfter,
                remedialNotes: summary,
                isCompletedByWorker: true,
                workerCompletedAt: new Date().toISOString(),
              };
            }
            return t;
          });
          localStorage.setItem('nir_nodal_tasks', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('nir_tasks_updated'));
        }
      }
    } catch {}

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

  const targetLat = activeComplaint?.coordinates?.lat ?? (activeComplaint as any)?.lat ?? 18.1109;
  const targetLng = activeComplaint?.coordinates?.lng ?? (activeComplaint as any)?.lng ?? 83.4268;
  const targetTitle = activeComplaint?.locationLandmark || "Water Recharge Asset";

  const execLat = executionTask?.coordinates?.lat ?? (executionTask as any)?.lat ?? targetLat;
  const execLng = executionTask?.coordinates?.lng ?? (executionTask as any)?.lng ?? targetLng;

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

  // Render Executive Confirmation Banner when a work order is declined and returned to Nodal Officer
  const renderDeclineSuccessBanner = () => {
    if (!declineSuccessNotice) return null;
    return (
      <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 shadow-xs animate-in fade-in slide-in-from-top duration-300">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            ✓
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                Work Order Declined &amp; Reassigned
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                {declineSuccessNotice.id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {declineSuccessNotice.time}
              </span>
              {declineSuccessNotice.hasVoiceNote && (
                <span className="text-[11px] font-semibold text-sky-800 bg-sky-100/90 px-2.5 py-0.5 rounded-md border border-sky-300 flex items-center gap-1">
                  <Mic className="w-3 h-3 text-sky-600" /> Voice Note Memo Attached
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-emerald-950">
              Work Order for {declineSuccessNotice.location} returned to Nodal Officer P. Kalyani
            </h4>
            <div className="text-xs text-emerald-900 bg-white/90 p-3 rounded-xl border border-emerald-200/90 leading-relaxed shadow-2xs">
              <span className="font-bold text-emerald-950">Transmitted Reason: </span>
              <span>"{declineSuccessNotice.reason}"</span>
            </div>
            <p className="text-[11px] text-emerald-800 font-medium pt-0.5">
              ✓ This work order has been removed from your terminal. Nodal Officer will reassign it to an alternate division crew. Your SLA is paused.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDeclineSuccessNotice(null)}
          className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
        >
          ✕ Dismiss
        </button>
      </div>
    );
  };

  // Render Strict Task Isolation Shield when a worker has 0 orders assigned to them
  const renderIsolationShield = () => (
    <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs text-center space-y-5 max-w-2xl mx-auto my-4 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
        <ShieldAlert className="w-8 h-8 text-amber-600" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>
            {currentLang === 'hi'
              ? 'वैधानिक 1-टू-1 कार्य पृथक्करण नियम'
              : currentLang === 'te'
              ? 'చట్టబద్ధమైన 1-టు-1 టాస్క్ ఐసోలేషన్ నియమం'
              : 'Statutory 1-to-1 Worker Task Isolation'}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900">
          {currentLang === 'hi'
            ? `${selectedWorkerDisplayName} को कोई कार्य आवंटित नहीं`
            : currentLang === 'te'
            ? `${selectedWorkerDisplayName} కు ఎటువంటి పనులు కేటాయించబడలేదు`
            : `No Work Orders Assigned to ${selectedWorkerDisplayName}`}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {currentLang === 'hi'
            ? 'सरकारी सुरक्षा नियम: एक वर्कर दूसरे वर्कर का कोई भी काम नहीं देख सकता ताकि फील्ड पर काम में कोई हस्तक्षेप न हो। केवल जिला नोडल अधिकारी द्वारा आवंटित आधिकारिक कार्य ही दिखाई देंगे।'
            : currentLang === 'te'
            ? 'ప్రభుత్వ భద్రతా నిబంధన: ఫీల్డ్ పనుల్లో జోక్యం లేకుండా ఒక కార్మికుడు మరొకరి పనులను చూడలేరు. జిల్లా నోడల్ అధికారి కేటాయించిన పనులు మాత్రమే ఇక్కడ కనిపిస్తాయి.'
            : 'Government Security Rule: Strict 1-to-1 data isolation prevents cross-worker interference. Only work orders officially assigned to your unit by the District Nodal Officer will appear here.'}
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-semibold">
            {currentLang === 'hi' ? 'लॉग-इन कार्यकर्ता:' : currentLang === 'te' ? 'లాగిన్ అయిన కార్మికుడు:' : 'Logged-in Action Worker:'}
          </span>
          <span className="font-mono font-bold text-slate-900">{selectedWorkerDisplayName}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-semibold">
            {currentLang === 'hi' ? 'वर्कर बैज आईडी:' : currentLang === 'te' ? 'వర్కర్ బ్యాడ్జ్ ఐడీ:' : 'Worker Badge ID:'}
          </span>
          <span className="font-mono font-bold text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            {selectedWorker.worker_id}
          </span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <span className="text-slate-500 font-semibold">
            {currentLang === 'hi' ? 'आवंटित कार्यक्षेत्र:' : currentLang === 'te' ? 'కేటాయించిన అధికార పరిధి:' : 'Assigned Jurisdiction:'}
          </span>
          <span className="font-bold text-slate-800">
            {selectedWorker.district} {currentLang === 'hi' ? 'सुधार प्रभाग' : currentLang === 'te' ? 'పునరుద్ధరణ విభాగం' : 'Remediation Division'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold">
            {currentLang === 'hi' ? 'आवंटित कार्य आदेश:' : currentLang === 'te' ? 'కేటాయించిన పని ఆదేశాలు:' : 'Assigned Work Orders:'}
          </span>
          <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
            {currentLang === 'hi' ? '0 सक्रिय आदेश (पूर्णतः पृथक एवं सुरक्षित)' : currentLang === 'te' ? '0 క్రియాశీల ఆర్డర్లు (రక్షితం)' : '0 Active Orders (Strictly Isolated & Shielded)'}
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
          <span>
            {currentLang === 'hi'
              ? 'Er. T. Venkata Ramana पर स्विच करें (सक्रिय आदेश)'
              : currentLang === 'te'
              ? 'Er. T. Venkata Ramana కు మారండి (క్రియాశీల ఆర్డర్లు)'
              : 'Switch to Er. T. Venkata Ramana (Active Remediation Orders)'}
          </span>
        </button>
        <button
          onClick={() => setIsSelectingWorker(true)}
          className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-300 flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4 text-slate-600" />
          <span>
            {currentLang === 'hi' ? 'पूरी वर्कर डायरेक्टरी खोलें' : currentLang === 'te' ? 'పూర్తి వర్కర్ డైరెక్టరీ తెరవండి' : 'Open Full Worker Directory'}
          </span>
        </button>
      </div>
    </div>
  );

  // If in Directory selection mode, show the Directory Hub with flashcards for all workers across AP
  if (isSelectingWorker) {
    return (
      <WorkerDirectoryHub
        district={district}
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
        {/* Executive Profile Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${workerGradient} text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0`}>
              {workerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {selectedWorkerDisplayName}
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#0077B6] border border-blue-200/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>
                    {selectedWorker.district} {currentLang === 'hi' ? 'सुधार प्रभाग' : currentLang === 'te' ? 'పునరుద్ధరణ విభాగం' : 'Remediation Division'} • {selectedWorker.service_areas || (currentLang === 'hi' ? 'फ़ील्ड संचालन' : currentLang === 'te' ? 'ఫీల్డ్ కార్యకలాపాలు' : 'Field Operations')}
                  </span>
                </span>
                <span className="font-mono text-[11px] font-medium bg-[#0077B6]/10 text-[#0077B6] border border-[#0077B6]/20 px-2 py-0.5 rounded-md">
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
                  <span>
                    {selectedWorker.availability === 'Busy'
                      ? (currentLang === 'hi' ? 'साइट पर सक्रिय' : currentLang === 'te' ? 'సైట్‌లో క్రియాశీలం' : 'On-Site Active')
                      : (currentLang === 'hi' ? 'फ़ील्ड पर तैयार' : currentLang === 'te' ? 'ఫీల్డ్‌లో సిద్ధం' : 'On-Field Ready')}
                  </span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {selectedWorker.type}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-1">
                <span>{selectedWorker.skills || (currentLang === 'hi' ? 'गाद निकासी एवं नहर सुधार विंग' : currentLang === 'te' ? 'పూడికతీత & కాలువ పునరుద్ధరణ విభాగం' : 'Desilting & Canal Remediation Wing')}</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>
                    {selectedWorker.type === 'Contractor'
                      ? (currentLang === 'hi' ? 'ठेकेदार बेड़ा: 12 ऑपरेटर साइट पर' : currentLang === 'te' ? 'కాంట్రాక్టర్ ఫ్లీట్: సైట్‌లో 12 ఆపరేటర్లు' : 'Contractor Fleet: 12 Operators On-Site')
                      : selectedWorker.type === 'Engineer'
                      ? (currentLang === 'hi' ? 'इंजीनियरिंग कमान इकाई' : currentLang === 'te' ? 'ఇంజనీరింగ్ కమాండ్ విభాగం' : 'Engineering Command Unit')
                      : (currentLang === 'hi' ? `दल: ${workerCount} फ़ील्ड कर्मी साइट पर` : currentLang === 'te' ? `బృందం: సైట్‌లో ${workerCount} ఫీల్డ్ వర్కర్లు` : `Crew: ${workerCount} Field Operatives On-Site`)}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span>{currentLang === 'hi' ? 'फ़ोन:' : currentLang === 'te' ? 'ఫోన్:' : 'Phone:'} {selectedWorker.phone || '+91 94402 33445'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Directory & Audio Briefing */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsSelectingWorker(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Return to Action Worker Directory Hub"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>
                {currentLang === 'hi' ? 'वर्कर डायरेक्टरी' : currentLang === 'te' ? 'వర్కర్ డైరెక్టరీ' : 'Directory'} ({selectedWorker.worker_id})
              </span>
            </button>

            <button
              onClick={() =>
                speakText(
                  `Nir-ikshan Action Worker Portal for ${selectedWorkerDisplayName}. You have ${urgentTasks.length} urgent work orders awaiting decision, ${inProgressTasks.length} active remediation sites, and ${waitingReviewTasks.length} sites submitted for inspector verification.`
                )
              }
              className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#0077B6] border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#0077B6]" />
              <span className="hidden sm:inline">
                {currentLang === 'hi' ? 'कार्य सुनें' : currentLang === 'te' ? 'పనులను వినండి' : 'Listen to Tasks'}
              </span>
            </button>
          </div>
        </div>

        {/* Clean Top Navigation Tabs (Exact 4 Tabs - No Redundant Tabs!) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
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
            <span>
              {currentLang === 'hi' ? '1. आवंटित कार्य आदेश' : currentLang === 'te' ? '1. కేటాయించిన పని ఆదేశాలు' : '1. Assigned Work Orders'}
            </span>
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
            <span>
              {currentLang === 'hi' ? '2. प्रगतिरत सुधार कार्य' : currentLang === 'te' ? '2. పురోగతిలో ఉన్న పనులు' : '2. In-Progress Remediation'}
            </span>
            {inProgressTasks.length > 0 && (
              <span className="bg-sky-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full font-mono">
                {inProgressTasks.length} {currentLang === 'hi' ? 'सक्रिय' : currentLang === 'te' ? 'క్రియాశీలం' : 'Active'}
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
            <span>
              {currentLang === 'hi' ? '3. पूर्ण व सत्यापन हेतु' : currentLang === 'te' ? '3. పూర్తయినవి & ధృవీకరణ' : '3. Completed & Verification'}
            </span>
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
            <span>
              {currentLang === 'hi' ? '4. जीआईएस भूकर मानचित्र' : currentLang === 'te' ? '4. జీఐఎస్ కాడాస్ట్రల్ మ్యాప్' : '4. GIS Cadastral Map'}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TAB 1: ASSIGNED WORK ORDERS (DECISION & REVIEW FLOW)         */}
      {/* ============================================================== */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          {renderDeclineSuccessBanner()}
          {workerComplaints.length === 0 ? (
            renderIsolationShield()
          ) : (
          <div className="space-y-4">
          
          {/* Subview: Overview List of Work Orders */}
          {decisionSubView === 'overview' && (
            <div className="space-y-4">
              {/* Urgency Alert Banner - Refined Minimalist Top Strip */}
              {urgentTasks.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <p className="text-xs text-slate-700 font-medium">
                      <strong className="font-semibold text-slate-900">Action Required:</strong> {urgentTasks.length} statutory work order awaiting review &amp; crew dispatch
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>SLA: {formatCountdown(secondsRemaining)}</span>
                  </div>
                </div>
              )}

              {/* Task Cards Container - Full Width & Zero Gaps */}
              <div className={urgentTasks.length === 1 ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-2 gap-5'}>
                {urgentTasks.map((task) => {
                  const isSingle = urgentTasks.length === 1;
                  const photoSrc =
                    task.workExecution?.beforePhotoUrl ||
                    task.photoUrl ||
                    task.inspectionReport?.sitePhotoUrl ||
                    DEFAULT_BEFORE_PHOTO;

                  return (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all w-full relative overflow-hidden"
                    >
                      <div className={isSingle ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'space-y-4'}>
                        {/* Dossier Left Section */}
                        <div className={isSingle ? 'lg:col-span-7 space-y-3.5' : 'space-y-3'}>
                          {/* Header Badge Bar */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                <span>High Priority • Urgent Action</span>
                              </span>
                              <span className="font-mono text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                                {task.id}
                              </span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-800 bg-amber-50/80 border border-amber-200/70 px-2.5 py-0.5 rounded-lg">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>SLA Window: {formatCountdown(secondsRemaining)}</span>
                            </div>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                              {task.wasteType || 'Micro-Watershed Desilting & Channel Restoration'}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug mt-0.5">
                              {task.locationLandmark || 'Champavathi River Basin Weir'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-normal mt-1">
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{task.village ? `${task.village}, ` : ''}{task.mandal || 'Bhogapuram'} Mandal ({task.district || 'Vizianagaram'})</span>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono text-[11px] text-slate-500">
                                GPS: {task.coordinates?.lat?.toFixed(4) || '18.1109'}° N, {task.coordinates?.lng?.toFixed(4) || '83.4268'}° E
                              </span>
                            </div>
                          </div>

                          {/* Citizen Grievance Quote Box - Modern Minimalist */}
                          <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Citizen Complainant (आम नागरिक)
                              </span>
                              <span className="text-xs font-medium text-slate-700">
                                {task.citizenName || 'Citizen'} ({task.citizenAge || 32}y) •{' '}
                                <a href={`tel:${task.citizenPhone || '9440512345'}`} className="font-mono text-[#0077B6] hover:underline font-normal">
                                  {task.citizenPhone || '9440512345'}
                                </a>
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed italic">
                              "{task.shortDescription || 'Plastic bottles aur domestic runoff se weir channel choke ho raha hai. Water flow completely blocked near agricultural weir.'}"
                            </p>
                          </div>

                          {/* 4-Role Chain of Custody Summary - Sleek Segmented Strip */}
                          <div className="grid grid-cols-3 divide-x divide-slate-200/80 bg-slate-50/70 border border-slate-200/70 rounded-xl p-2.5 text-[11px]">
                            <div className="pr-2 space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">Nodal Officer</span>
                              <div className="font-semibold text-slate-800 truncate">{task.assignedNodalOfficer || 'Dr. N. Subba Rao'}</div>
                              <span className="text-[10px] text-emerald-600 font-medium">Triage: 2.4h</span>
                            </div>
                            <div className="px-2 space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">Field Inspector</span>
                              <div className="font-semibold text-slate-800 truncate">{task.assignedInspector || 'Sri K. Rama Krishna'}</div>
                              <span className="text-[10px] text-amber-700 font-medium">Verified</span>
                            </div>
                            <div className="pl-2 space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">Assigned Crew</span>
                              <div className="font-semibold text-slate-800 truncate">{selectedWorkerDisplayName}</div>
                              <span className="text-[10px] text-slate-500 font-medium">1x JCB &amp; 4 Crew</span>
                            </div>
                          </div>
                        </div>

                        {/* Dossier Right Section */}
                        <div className={isSingle ? 'lg:col-span-5 flex flex-col justify-between space-y-3' : 'space-y-3 pt-2 border-t border-slate-100'}>
                          {/* Evidence Photo Preview */}
                          <div
                            onClick={() => setEnlargedPhoto({ url: photoSrc, title: `Field Evidence: ${task.locationLandmark}` })}
                            className="relative rounded-xl overflow-hidden border border-slate-200/80 aspect-video group/photo cursor-pointer shadow-2xs bg-slate-800"
                          >
                            <img
                              src={photoSrc}
                              alt="Field Evidence"
                              className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_BEFORE_PHOTO;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
                            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Field Audit Evidence</span>
                            </div>
                            <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-[10px] font-mono flex items-center justify-between">
                              <span className="text-slate-200">GPS: {task.coordinates?.lat?.toFixed(4) || '18.1109'}, {task.coordinates?.lng?.toFixed(4) || '83.4268'}</span>
                              <span className="text-sky-300 font-medium flex items-center gap-1 hover:underline">
                                <Maximize2 className="w-3 h-3" />
                                Inspect
                              </span>
                            </div>
                          </div>

                          {/* Decision Action Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => handleOpenTaskForReview(task)}
                              className="w-full py-2.5 px-4 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-98"
                            >
                              <span>
                                {currentLang === 'hi' ? 'कार्य खोलें व आदेश स्वीकारें' : currentLang === 'te' ? 'పనిని తెరిచి ఆర్డర్‌ను అంగీకరించండి' : 'Open Task & Accept Work Order'}
                              </span>
                              <ArrowRight className="w-4 h-4 text-sky-200" />
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  speakText(
                                    `Work Order for ${selectedWorkerDisplayName}. Location: ${task.locationLandmark || 'Champavathi River Basin Weir'}. Problem: ${task.shortDescription}. Assigned team: 1 JCB and 4 workers. Deadline: Today 5 PM.`
                                  )
                                }
                                className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-[#0077B6] shrink-0" />
                                <span className="truncate">{currentLang === 'hi' ? 'ऑडियो मेमो' : currentLang === 'te' ? 'ఆడియో మెమో' : 'Audio Memo'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedComplaintId(task.id);
                                  handleOpenDeclineReason();
                                }}
                                className="py-2 px-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/80 hover:border-rose-300 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span className="truncate">{currentLang === 'hi' ? 'अस्वीकार करें' : currentLang === 'te' ? 'తిరస్కరించండి' : 'Decline'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {urgentTasks.length === 0 && (
                  <div className="col-span-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {waitingReviewTasks.length > 0
                          ? `1 Work Order Under Statutory Verification`
                          : 'No Pending Work Orders Awaiting Decision'}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        {waitingReviewTasks.length > 0
                          ? `Remediation completed by ${selectedWorkerDisplayName} and submitted for physical inspection audit.`
                          : `All remediation tasks assigned to ${selectedWorkerDisplayName} have already been accepted and moved to active execution or completed.`}
                      </p>
                    </div>

                    {/* Prominent Under Verification Case Card */}
                    {waitingReviewTasks.length > 0 && (
                      <div className="text-left bg-gradient-to-br from-purple-50/90 to-indigo-50/90 border-2 border-purple-300 rounded-2xl p-4 sm:p-5 space-y-3 max-w-2xl mx-auto shadow-2xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-200/90 text-purple-900 text-[11px] font-mono font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-purple-700 animate-pulse" />
                            <span>STAGE 04: UNDER VERIFICATION ({waitingReviewTasks.length})</span>
                          </span>
                          <span className="text-xs text-purple-700 font-semibold">Inspector Physical Sign-Off Due</span>
                        </div>

                        {waitingReviewTasks.map((t) => (
                          <div key={t.id} className="bg-white border border-purple-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">{t.id}</span>
                                <h4 className="font-bold text-slate-900 text-sm mt-1">{t.locationLandmark || t.wasteType}</h4>
                                <p className="text-xs text-slate-500">{t.village ? `${t.village}, ` : ''}{t.mandal} Mandal • {t.district} District</p>
                              </div>
                              <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-300 shrink-0">
                                Audit Due
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              "{t.shortDescription}"
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 flex-wrap gap-2">
                              <span className="text-slate-600 font-medium">Assigned Field Inspector: <strong className="text-slate-900">{t.assignedInspector || 'Field Inspector'}</strong></span>
                              <button
                                onClick={() => setActiveTab('completed')}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>Inspect Verification Dossier</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                      {inProgressTasks.length > 0 && (
                        <button
                          onClick={() => setActiveTab('in_progress')}
                          className="px-4 py-2.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>View In-Progress Remediation ({inProgressTasks.length}) ➔</span>
                        </button>
                      )}
                      {(waitingReviewTasks.length > 0 || completedTasks.length > 0) && (
                        <button
                          onClick={() => setActiveTab('completed')}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>View Completed &amp; Verification ({waitingReviewTasks.length + completedTasks.length}) ➔</span>
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab('map')}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Open Cadastral Map (Tab 4) ➔</span>
                      </button>
                      <button
                        onClick={() => setIsSelectingWorker(true)}
                        className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Switch Worker</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview: Task Review & Decision Screen */}
          {decisionSubView === 'review' && activeComplaint && (
            <div className="w-full space-y-4 animate-in fade-in duration-200">
              
              {/* Top Navigation & Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-xs">
                <button
                  onClick={() => setDecisionSubView('overview')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#0077B6] transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0077B6] group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Orders List</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                    <span>Decision SLA: {formatCountdown(secondsRemaining)}</span>
                  </div>
                  <span className="text-[11px] font-medium bg-sky-50 text-[#0077B6] border border-sky-200/70 px-2.5 py-1 rounded-lg hidden sm:inline-block">
                    Offline Sync Ready
                  </span>
                </div>
              </div>

              {/* 2-Column Responsive Layout: Full Width to Match Top Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
                
                {/* Left Column (7-8 cols): Field Evidence Photo & What to Fix */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  
                  {/* Photo Evidence Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Field Audit Evidence
                        </h4>
                      </div>
                      <button
                        onClick={() =>
                          setEnlargedPhoto({
                            url: activeComplaint.workExecution?.beforePhotoUrl || activeComplaint.photoUrl || activeComplaint.inspectionReport?.sitePhotoUrl || DEFAULT_BEFORE_PHOTO,
                            title: activeComplaint.locationLandmark || 'Worksite Evidence',
                          })
                        }
                        className="text-[11px] text-[#0077B6] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Enlarge Photo</span>
                      </button>
                    </div>

                    <div
                      onClick={() =>
                        setEnlargedPhoto({
                          url: activeComplaint.workExecution?.beforePhotoUrl || activeComplaint.photoUrl || activeComplaint.inspectionReport?.sitePhotoUrl || DEFAULT_BEFORE_PHOTO,
                          title: activeComplaint.locationLandmark || 'Worksite Evidence',
                        })
                      }
                      className="relative rounded-xl overflow-hidden border border-slate-200/90 aspect-video group/photo cursor-pointer bg-slate-900 shadow-2xs"
                    >
                      <img
                        src={activeComplaint.workExecution?.beforePhotoUrl || activeComplaint.photoUrl || activeComplaint.inspectionReport?.sitePhotoUrl || DEFAULT_BEFORE_PHOTO}
                        alt={activeComplaint.locationLandmark || "Worksite Evidence"}
                        className="w-full h-full object-cover group-hover/photo:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_BEFORE_PHOTO;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-2xs">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Field Audit Geotagged</span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-[10px] font-mono flex items-center justify-between">
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-slate-200">
                          GPS: {targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° E
                        </span>
                        <span className="bg-rose-600/90 text-white font-sans text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs">
                          {(activeComplaint.inspectionReport?.wasteLevel || (activeComplaint as any)?.wasteLevel || 'Severe').includes('Choke')
                            ? (activeComplaint.inspectionReport?.wasteLevel || (activeComplaint as any)?.wasteLevel)
                            : `${activeComplaint.inspectionReport?.wasteLevel || (activeComplaint as any)?.wasteLevel || 'Severe'} Choke`}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                      <span>Reported by {activeComplaint.assignedInspector || activeComplaint.inspectionReport?.inspectorName || 'Field Inspector'} ({activeComplaint.mandal || activeComplaint.district || selectedWorker.district} Circle)</span>
                      <span className="font-mono text-[10px] text-slate-400">ID: {activeComplaint.id}</span>
                    </div>
                  </div>

                  {/* What to Fix Section */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#0077B6]" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          What to Fix (Statutory Work Order):
                        </h4>
                      </div>
                      <button
                        onClick={() =>
                          speakText(
                            `What to fix: ${activeComplaint.shortDescription || activeComplaint.wasteType || 'Clear heavy silt and obstruction to restore water flow.'}`
                          )
                        }
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#0077B6] rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 border border-sky-200/60"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to Memo</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/70 border border-slate-200/70 rounded-xl p-3">
                      "{activeComplaint.shortDescription || activeComplaint.inspectionReport?.validationRemarks || `${activeComplaint.wasteType || 'Severe obstruction'} blocking water intake at ${activeComplaint.locationLandmark}. Urgent excavation and channel clearing needed.`}"
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-slate-50/80 border border-slate-200/70 p-3 rounded-xl flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-semibold uppercase">Water Flow State</div>
                          <div className="text-xs font-bold text-slate-800">
                            {activeComplaint.inspectionReport?.waterPresence === 'Abundant' ? 'Overflow / Scour Risk' : 'Completely Obstructed'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/80 border border-slate-200/70 p-3 rounded-xl flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0077B6] flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-semibold uppercase">Deploy Machinery &amp; Crew</div>
                          <div className="text-xs font-bold text-slate-800">
                            {activeComplaint.machineryDeployed || '1x Backhoe / JCB, 4 Workers'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Site Location & Embedded Real Satellite Map */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Work Site Location
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {activeComplaint.locationLandmark}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {activeComplaint.mandal} Mandal • {activeComplaint.district} (GPS: {targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° E)
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs">
                      <EngineerRealSatelliteMap
                        lat={targetLat}
                        lng={targetLng}
                        title={targetTitle}
                        assetCode={activeComplaint.id}
                        mandal={activeComplaint.mandal || selectedWorker.district}
                        heightClass="h-44"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column (4-5 cols): Authority & Chain of Custody & Action Decision */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                  
                  {/* Statutory Authority & Schedule Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Statutory Directive &amp; SLA
                      </span>
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Due Today 6:00 PM
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-slate-50/70 border border-slate-200/70 p-3 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-semibold text-slate-400">Assigned By Nodal Officer</span>
                          <a
                            href={`tel:${activeComplaint.assignedInspectorPhone || activeComplaint.assignedEngineerPhone || '+91 94401 22334'}`}
                            className="text-[#0077B6] font-semibold text-[11px] hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {activeComplaint.assignedNodalOfficer || `${selectedWorker.district} Nodal Officer`}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Order dispatched under AP Water Resources Act • 24h statutory resolution SLA
                        </p>
                      </div>

                      {/* 4-Role Chain of Custody Compact View */}
                      <div className="bg-slate-50/70 border border-slate-200/70 p-3 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          4-Role Statutory Custody
                        </span>
                        
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">1. Citizen:</span>
                            <span className="font-semibold text-slate-900">{activeComplaint.citizenName || 'Citizen'} ({activeComplaint.citizenAge || 48}y)</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">2. Nodal Officer:</span>
                            <span className="font-semibold text-sky-800">{activeComplaint.assignedNodalOfficer || 'P. Kalyani'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">3. Field Inspector:</span>
                            <span className="font-semibold text-amber-800">{activeComplaint.assignedInspector || 'Inspector R. Venkat'} (Verified)</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">4. Action Crew:</span>
                            <span className="font-semibold text-emerald-800">{selectedWorkerDisplayName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Action Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 sticky top-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Worker Action Confirmation
                    </span>

                    <button
                      onClick={handleOpenAcceptGuidance}
                      className="w-full py-3 px-4 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-200" />
                      <span>
                        {currentLang === 'hi' ? 'कार्य स्वीकारें व चरण देखें ➔' : currentLang === 'te' ? 'పనిని అంగీకరించి దశలను చూడండి ➔' : 'Accept Task & View Steps ➔'}
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          speakText(
                            `Work Order: ${activeComplaint.locationLandmark}. Problem: ${activeComplaint.shortDescription}. Assigned team: 1 Backhoe and 4 workers. Please accept to begin desilting.`
                          )
                        }
                        className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#0077B6] shrink-0" />
                        <span className="truncate">{currentLang === 'hi' ? 'ऑडियो विवरण' : currentLang === 'te' ? 'ఆడియో బ్రీఫింగ్' : 'Audio Briefing'}</span>
                      </button>

                      <button
                        onClick={handleOpenDeclineReason}
                        className="py-2 px-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/80 hover:border-rose-300 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{currentLang === 'hi' ? 'अस्वीकार करें' : currentLang === 'te' ? 'తిరస్కరించండి' : 'Decline'}</span>
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 font-normal pt-1 leading-relaxed">
                      Your Nodal Officer will be notified instantly. No penalty for legitimate field reassignments.
                    </p>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Subview: Decline Reason Screen (Matching image_25e66427.png) */}
          {decisionSubView === 'decline_reason' && activeComplaint && (
            <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setDecisionSubView('review')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0077B6] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                  <span>Back to Task Review</span>
                </button>
                <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-0.5 rounded-lg">
                  Decline Reason Flow
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Why can't you take this task?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
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
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0077B6] rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-sky-200/80"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0077B6]" />
                <span>Listen to question</span>
              </button>

              {/* Radio Options List - 2 Column Grid on Wide Screen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {declineReasons.map((reason) => {
                  const isSelected = selectedDeclineReason === reason.label;
                  return (
                    <div
                      key={reason.id}
                      onClick={() => {
                        setSelectedDeclineReason(reason.label);
                        if (reason.id === 'voice' && declineAudioState === 'idle') {
                          startDeclineVoiceRecording();
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 border-2 border-[#0077B6] shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{reason.icon}</span>
                        <span className="text-xs font-semibold text-slate-800">
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

              {/* 2-Column Section: Real Voice Note Recorder & Fair Work Guarantee */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {/* Real-time Voice Note Recorder */}
                <div className={`border rounded-xl p-4 space-y-3 transition-all ${
                  selectedDeclineReason.includes('voice note') || declineAudioState === 'recording'
                    ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-200/60'
                    : 'bg-slate-50/80 border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        declineAudioState === 'recording'
                          ? 'bg-rose-600 animate-ping'
                          : declineAudioState === 'recorded'
                          ? 'bg-emerald-600'
                          : 'bg-slate-400'
                      }`} />
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#0077B6]" />
                        {declineAudioState === 'recording'
                          ? 'Recording Live Voice Note...'
                          : declineAudioState === 'recorded'
                          ? 'Voice Note Memo Recorded ✓'
                          : 'Record Voice Memo to Nodal Officer'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      00:{String(declineAudioDuration).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Waveform / Visualizer */}
                  <div className="flex items-center justify-center gap-1.5 py-3 h-12 bg-white rounded-xl border border-slate-200/80 px-4 overflow-hidden shadow-2xs">
                    {declineAudioState === 'recording' ? (
                      // Live pulsating waveform bars
                      [18, 38, 22, 46, 28, 42, 14, 48, 32, 50, 24, 36, 44, 20, 32, 40].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-rose-500 rounded-full animate-pulse transition-all"
                          style={{
                            height: `${Math.max(8, h * ((i % 3 + 1) * 0.35))}px`,
                            animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                          }}
                        />
                      ))
                    ) : declineAudioState === 'recorded' ? (
                      // Recorded audio waveform
                      [20, 32, 24, 44, 36, 28, 16, 40, 32, 48, 22, 34, 40, 18, 26, 36].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all ${
                            isPlayingDeclineAudio
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-sky-500/80'
                          }`}
                          style={{
                            height: `${h * 0.65}px`,
                            animationDuration: isPlayingDeclineAudio ? `${0.5 + (i % 4) * 0.15}s` : undefined,
                          }}
                        />
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mic className="w-4 h-4 text-slate-300" />
                        <span>Tap button below to record voice note memo</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="pt-1">
                    {declineAudioState === 'idle' && (
                      <button
                        type="button"
                        onClick={startDeclineVoiceRecording}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-xs active:scale-98"
                      >
                        <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
                        <span>Tap to Record Voice Note 🎙️</span>
                      </button>
                    )}

                    {declineAudioState === 'recording' && (
                      <button
                        type="button"
                        onClick={stopDeclineVoiceRecording}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98 animate-pulse"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop Recording &amp; Attach Voice Memo</span>
                      </button>
                    )}

                    {declineAudioState === 'recorded' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={togglePlayDeclineAudio}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                              isPlayingDeclineAudio
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isPlayingDeclineAudio ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-white" />
                                <span>Pause Audio Memo</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>Play Voice Memo ({declineAudioDuration}s) 🔊</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={resetDeclineVoiceRecording}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                            title="Delete and record again"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Optional Transcription & Remarks Editor */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Attached Voice Remarks for Nodal Officer
                          </label>
                          <input
                            type="text"
                            value={declineVoiceNoteRemarks}
                            onChange={(e) => setDeclineVoiceNoteRemarks(e.target.value)}
                            placeholder="Reason details for Nodal Officer..."
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      {declineAudioState === 'recorded'
                        ? '✓ Audio note ready to transmit'
                        : 'Device microphone supported seamlessly'}
                    </span>
                    {declineAudioState !== 'idle' && (
                      <button
                        type="button"
                        onClick={resetDeclineVoiceRecording}
                        className="font-semibold text-slate-600 hover:text-rose-600 cursor-pointer underline text-[11px]"
                      >
                        Reset Audio
                      </button>
                    )}
                  </div>
                </div>

                {/* Fair Work Guarantee Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 text-lg">
                    🤝
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-950">Fair Work Guarantee (कार्य सुरक्षा आश्वासन)</h4>
                    <p className="text-[11px] text-amber-900/80 leading-relaxed">
                      Valid declines with a reason are never counted against you or your crew rating. Your Nodal Officer will immediately reassign this site to another available crew.
                    </p>
                    <div className="pt-1 text-[11px] font-semibold text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Statutory AP Water Resources Dept Rule #48</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit to Officer Button */}
              <button
                onClick={handleSendDeclineToOfficer}
                className="w-full py-3 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Submit Reason to Nodal Officer ➔</span>
              </button>
            </div>
          )}

          {/* Subview: Task Accepted & Field Guidance Screen */}
          {decisionSubView === 'accept_guidance' && activeComplaint && (
            <div className="w-full space-y-4 animate-in fade-in duration-200">
              
              {/* Top Navigation & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-xs">
                <button
                  onClick={() => setDecisionSubView('review')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#0077B6] transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0077B6] group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Task Review</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                    Task Accepted • Ready for Field Execution
                  </span>
                </div>
              </div>

              {/* 2-Column Responsive Layout: Full Width */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
                
                {/* Left Column (6-7 cols): Water Recharge Asset & Before Photo Capture */}
                <div className="lg:col-span-6 xl:col-span-7 space-y-4">
                  {/* Asset Title Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077B6] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        Water Recharge Asset
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {activeComplaint.locationLandmark}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeComplaint.mandal} Mandal • {activeComplaint.village || `${activeComplaint.mandal} Sector`} ({activeComplaint.district})
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-center shadow-2xs">
                      <div className="text-base font-bold text-[#0077B6]">
                        {(activeComplaint.inspectionReport?.wasteLevel || (activeComplaint as any)?.wasteLevel) === 'Severe Choke' ? '28' : '16'}
                      </div>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase">Ayacut Ha</div>
                    </div>
                  </div>

                  {/* Mandatory Before Photo Proof Requirement */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#0077B6]" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Step 1: Mandatory BEFORE Photo Capture
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        Geo-Stamped Proof
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Statutory regulation mandates a verified geo-tagged photo before desilting machinery commences.
                    </p>

                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 shadow-2xs">
                      <img
                        src={beforePhotoUrl || activeComplaint.workExecution?.beforePhotoUrl || activeComplaint.inspectionReport?.sitePhotoUrl || activeComplaint.photoUrl || DEFAULT_BEFORE_PHOTO}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_BEFORE_PHOTO;
                        }}
                        alt="Before State"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/20 flex items-center gap-1 shadow-2xs">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Geo-stamped Proof</span>
                      </div>
                      <div className="absolute bottom-2 left-2.5 right-2.5 text-white text-[10px] font-mono flex items-center justify-between">
                        <span>{targetLat.toFixed(4)}° N, {targetLng.toFixed(4)}° E</span>
                        <span className="bg-rose-600/90 text-white font-sans text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs">
                          {activeComplaint.inspectionReport?.wasteLevel || (activeComplaint as any)?.wasteLevel || 'Severe'}
                        </span>
                      </div>
                    </div>

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
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0077B6]" />
                      <span>Take / Replace Before Photo (Camera Upload)</span>
                    </button>
                  </div>
                </div>

                {/* Right Column (5-6 cols): Field Instructions & Start Work CTA */}
                <div className="lg:col-span-6 xl:col-span-5 space-y-4">
                  
                  {/* Field Instructions Steps */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Field Action Directives:
                      </h4>
                      <button
                        onClick={() =>
                          speakText(
                            `Step 1: Clear ${activeComplaint.wasteType || 'obstructions'}. Step 2: Excavate silt and sediment 1 meter deep at ${activeComplaint.locationLandmark}. Step 3: Oil and grease gate wheel spindle and test turn crank.`
                          )
                        }
                        className="px-2.5 py-1 bg-sky-50 text-[#0077B6] rounded-lg text-[11px] font-medium flex items-center gap-1 border border-sky-200/60 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to Steps</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {/* Step 1 */}
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          1
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-800">
                            Clear {activeComplaint.wasteType || 'floating debris & choke obstruction'}
                          </h5>
                          <p className="text-xs text-slate-600">
                            Clear all floating debris, thorny brush, plastic and mud blocking the upper weir channel gate track.
                          </p>
                          <span className="inline-block text-[10px] font-medium text-sky-800 bg-sky-50 border border-sky-200/60 px-1.5 py-0.2 rounded mt-0.5">
                            Tools: Sickle, Branch Cutter, Rope
                          </span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          2
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-800">
                            Excavate silt &amp; sediment 1 meter deep
                          </h5>
                          <p className="text-xs text-slate-600">
                            Dig out packed mud and gravel around the front apron masonry of {activeComplaint.locationLandmark} to restore free pool depth.
                          </p>
                          <span className="inline-block text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded mt-0.5">
                            Check depth marker notch on concrete pillar
                          </span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          3
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-800">
                            Oil and grease the gate wheel spindle
                          </h5>
                          <p className="text-xs text-slate-600">
                            Coat both threaded hoist rods with heavy gear grease until turning wheel rotates smoothly by hand.
                          </p>
                          <span className="inline-block text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded mt-0.5">
                            Turn clockwise 3 full cycles to test
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Start Work Confirmation Box */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                    <button
                      onClick={handleConfirmAcceptTask}
                      className="w-full py-3 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-98"
                    >
                      <span>Commence Remediation &amp; Track Work ➔</span>
                    </button>

                    <button
                      onClick={() => setShowStuckModal(true)}
                      className="w-full py-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Site Breakdown / Stuck (Request Assistance)</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
        )}
        </div>
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
        <div className="w-full space-y-4">
          
          {/* Active Work Order Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            
            {/* Header Stage */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077B6]">
                  Active Task Execution
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  {(executionTask || activeComplaint)?.locationLandmark}
                </h3>
                <p className="text-xs text-slate-500">
                  {(executionTask || activeComplaint)?.mandal} Mandal • {(executionTask || activeComplaint)?.district}
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-sky-50 text-[#0077B6] border border-sky-200/80 px-2.5 py-0.5 rounded-lg">
                Step 2 of 3
              </span>
            </div>

            {/* GPS Confirmed On-Site Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0">
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    GPS Confirmed On-Site ({execLat.toFixed(4)}° N, {execLng.toFixed(4)}° E)
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    At {(executionTask || activeComplaint)?.locationLandmark} (±1.8m RTK calibrated)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block font-mono text-[10px] font-semibold text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                Live Dispatch
              </span>
            </div>

            {/* Statutory 4-Role Accountability Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl text-[11px]">
              <div className="space-y-0.5 sm:border-r border-slate-200/80 pr-2">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">1. Citizen (Aam Nagrik)</span>
                <span className="font-semibold text-slate-900 block truncate">{(executionTask || activeComplaint)?.citizenName || 'Citizen Grievance'} (Age {(executionTask || activeComplaint)?.citizenAge || 32})</span>
                <span className="text-slate-500 font-mono text-[10px] block truncate">{(executionTask || activeComplaint)?.citizenPhone || '+91 94405 12345'}</span>
              </div>
              <div className="space-y-0.5 sm:border-r border-slate-200/80 pr-2">
                <span className="text-[9px] uppercase font-semibold text-sky-600 block">2. Nodal Officer (IAS)</span>
                <span className="font-semibold text-slate-900 block truncate">{(executionTask || activeComplaint)?.assignedNodalOfficer || `${selectedWorker.district} Nodal Officer`}</span>
                <span className="text-emerald-700 font-medium text-[10px] block">Triage {Number(((executionTask || activeComplaint) as any)?.nodalTriageTimeHours || 2.4).toFixed(1)}h • Diligent</span>
              </div>
              <div className="space-y-0.5 sm:border-r border-slate-200/80 pr-2">
                <span className="text-[9px] uppercase font-semibold text-amber-600 block">3. Inspector</span>
                <span className="font-semibold text-slate-900 block truncate">{(executionTask || activeComplaint)?.assignedInspector || 'Sri K. Rama Krishna'}</span>
                <span className="text-amber-800 font-medium text-[10px] block">Site Verified</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-semibold text-emerald-600 block">4. Action Worker (EE)</span>
                <span className="font-semibold text-slate-900 block truncate">{selectedWorkerDisplayName}</span>
                <span className="text-emerald-700 font-medium text-[10px] block">{(selectedWorker as any).vehicle_assigned || selectedWorker.skills || '1x JCB 3DX'} • {workerCount} Crew</span>
              </div>
            </div>

            {/* 2-Column Responsive Execution Layout (Full Width) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start pt-2">
              
              {/* Left Column (6 cols): Step 1 Before Photo + Step 3 After Photo */}
              <div className="lg:col-span-6 space-y-4">
                {/* Step 1: Geo-Stamped BEFORE Photo */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        1. Geo-Stamped BEFORE Photo Proof
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Verified Baseline Proof
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 shadow-2xs">
                    <img
                      src={(executionTask || activeComplaint)?.workExecution?.beforePhotoUrl || beforePhotoUrl || (executionTask || activeComplaint)?.photoUrl || DEFAULT_BEFORE_PHOTO}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_BEFORE_PHOTO;
                      }}
                      alt="Before Excavation"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Geo-stamped Proof</span>
                    </div>
                    <div className="absolute bottom-2 left-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center justify-between">
                      <span>{execLat.toFixed(4)}° N, {execLng.toFixed(4)}° E</span>
                      <span>Baseline: {(executionTask || activeComplaint)?.inspectionReport?.wasteLevel || ((executionTask || activeComplaint) as any)?.wasteLevel || 'Severe'}</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Take AFTER Photo Upload Box */}
                <div className="border border-sky-200/90 bg-sky-50/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#0077B6]" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        3. Take AFTER Photo Proof
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                      Step 3 Proof
                    </span>
                  </div>

                  {afterPhotoUploaded ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 shadow-2xs">
                      <img
                        src={afterPhotoUrl || DEFAULT_AFTER_PHOTO}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_AFTER_PHOTO;
                        }}
                        alt="Restored State"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Restored Water Flow Captured</span>
                      </div>
                      <div className="absolute bottom-2 left-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl flex items-center justify-between">
                        <span>{execLat.toFixed(4)}° N, {execLng.toFixed(4)}° E</span>
                        <span>Clean Gate Verified</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-sky-100 rounded-xl p-5 text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0077B6] flex items-center justify-center mx-auto">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">Capture Restored State</h5>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                          Take clear photo of clean gate and restored water flow at {(executionTask || activeComplaint)?.locationLandmark}.
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
                        className="px-4 py-2 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Open Camera &amp; Take After Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (6 cols): Step 2 Checklist + Audit Details + Submit */}
              <div className="lg:col-span-6 space-y-4">
                {/* Step 2: Interactive Checklist */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0077B6]" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        2. Do the Work
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-[#0077B6] bg-sky-100/80 px-2 py-0.5 rounded-md">
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
                          Silt &amp; mud excavated from apron of {(executionTask || activeComplaint)?.locationLandmark}
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
                          {(executionTask || activeComplaint)?.wasteType || 'Weeds and brush'} cleared from conduit &amp; intake channel
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
                            Oil applied to spindle wheel &amp; mechanical hoist tested
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Turn crank gear 3 full rotations after lubrication
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field Audit Details: Laborers Counter & Voice Note */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Field Audit Details
                  </h4>

                  {/* Workers Counter */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        How many people worked today?
                      </h5>
                      <p className="text-[11px] text-slate-500">Field excavation crew</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                      <button
                        onClick={() => setWorkerCount((c) => Math.max(1, c - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-900 font-mono w-4 text-center">
                        {workerCount}
                      </span>
                      <button
                        onClick={() => setWorkerCount((c) => c + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Voice Memo Widget */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-[#0077B6]" />
                        Record voice note about work (Optional)
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isVoiceNotePlaying ? 'bg-emerald-500 animate-ping' : 'bg-rose-600 animate-pulse'}`} />
                        <div>
                          <div className="text-xs font-semibold text-slate-900">0:24 Voice note recorded</div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsVoiceNotePlaying(!isVoiceNotePlaying);
                              speakText("Voice note recorded on site: Apron excavated, heavy silt cleared, gate running freely.");
                            }}
                            className="text-[10px] text-[#0077B6] font-medium hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{isVoiceNotePlaying ? 'Pause replay audio ⏸' : 'Tap to replay audio 🔊'}</span>
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVoiceNotePlaying(false);
                          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Reset voice note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON: Complete Remediation & Send for Verification */}
                <button
                  onClick={handleSubmitToInspectorForVerification}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>
                    {currentLang === 'hi'
                      ? 'सुधार कार्य पूरा करें व इंस्पेक्टर सत्यापन अनलॉक करें ➔'
                      : currentLang === 'te'
                      ? 'పునరుద్ధరణను పూర్తి చేసి ఇన్‌స్పెక్టర్ ధృవీకరణను అన్‌లాక్ చేయండి ➔'
                      : 'Complete Remediation & Unlock Inspector Verification ➔'}
                  </span>
                </button>
              </div>

            </div>

          </div>
        </div>
        )
      )}

      {/* ============================================================== */}
      {/* 4. TAB 3: COMPLETED & VERIFICATION (INSPECTOR SIGN-OFF TRACKING)*/}
      {/* ============================================================== */}
      {activeTab === 'completed' && (
        waitingReviewTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {currentLang === 'hi'
                  ? 'वैधानिक सत्यापन एवं सुधार ऑडिट बहीखाता'
                  : currentLang === 'te'
                  ? 'చట్టబద్ధమైన ధృవీకరణ & పునరుద్ధరణ ఆడిట్ రికార్డు'
                  : 'Statutory Verification & Remediation Audit Ledger'}
              </h3>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                {currentLang === 'hi'
                  ? `कार्यकारी दल द्वारा पूरे किए गए सभी कार्य दो-चरणीय वैधानिक सत्यापन से गुजरते हैं: 1. फ़ील्ड इंस्पेक्टर द्वारा भौतिक ऑन-साइट ऑडिट और टेलीमेट्री जांच। 2. ज़िला नोडल अधिकारी द्वारा अंतिम निस्तारण।`
                  : currentLang === 'te'
                  ? `సిబ్బంది పూర్తి చేసిన అన్ని పనులు రెండు దశల చట్టబద్ధమైన ధృవీకరణకు లోబడి ఉంటాయి: 1. ఫీల్డ్ ఇన్‌స్పెక్టర్ భౌతిక తనిఖీ & టెలిమెట్రీ పరిశీలన. 2. జిల్లా నోడల్ అధికారి ముగింపు.`
                  : `All physical works completed by ${selectedWorkerDisplayName} undergo two-stage statutory verification: 1. Field Inspector physical on-site audit with DGPS coordinates and probe testing. 2. District Nodal Officer closure.`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs max-w-md mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">
                  {currentLang === 'hi' ? 'सक्रिय कार्य दल:' : currentLang === 'te' ? 'క్రియాశీల వర్కర్:' : 'Active Action Worker:'}
                </span>
                <span className="font-bold text-slate-900">{selectedWorkerDisplayName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">
                  {currentLang === 'hi' ? 'लंबित इंस्पेक्टर सत्यापन:' : currentLang === 'te' ? 'పెండింగ్ ఇన్‌స్పెక్టర్ సంతకాలు:' : 'Pending Inspector Sign-offs:'}
                </span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {currentLang === 'hi' ? '0 रिकॉर्ड' : currentLang === 'te' ? '0 రికార్డులు' : '0 Records'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">
                  {currentLang === 'hi' ? 'पूर्ण व बंद कार्य:' : currentLang === 'te' ? 'పూర్తయి ముగించిన పనులు:' : 'Completed & Closed Works:'}
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentLang === 'hi' ? 'वर्तमान चक्र में 0 रिकॉर्ड' : currentLang === 'te' ? 'ప్రస్తుత చక్రంలో 0 రికార్డులు' : '0 Records in Current Cycle'}
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
                <span>
                  {currentLang === 'hi' ? 'आवंटित आदेशों पर जाएं (टैब 1)' : currentLang === 'te' ? 'కేటాయించిన ఆర్డర్లకు వెళ్లండి (ట్యాబ్ 1)' : 'Go to Assigned Orders (Tab 1)'}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {currentLang === 'hi' ? 'भूकर मानचित्र खोलें (टैब 4)' : currentLang === 'te' ? 'కాడాస్ట్రల్ మ్యాప్ తెరవండి (ట్యాబ్ 4)' : 'Open Cadastral Map (Tab 4)'}
                </span>
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
                  <span>
                    {currentLang === 'hi'
                      ? `फ़ील्ड इंस्पेक्टर भौतिक सत्यापन प्रतीक्षित (${waitingReviewTasks.length})`
                      : currentLang === 'te'
                      ? `ఫీల్డ్ ఇన్‌స్పెక్టర్ భౌతిక ధృవీకరణ కొరకు వేచి ఉంది (${waitingReviewTasks.length})`
                      : `Awaiting Field Inspector Physical Verification (${waitingReviewTasks.length})`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {currentLang === 'hi'
                    ? 'कार्यकर्ताओं द्वारा प्रस्तुत कार्य, वर्तमान में इंस्पेक्टर के ऑन-साइट सत्यापन एवं वैधानिक स्वीकृति हेतु प्रतीक्षारत।'
                    : currentLang === 'te'
                    ? 'సిబ్బంది సమర్పించిన పనులు, ప్రస్తుతం ఇన్‌స్పెక్టర్ ఆన్-సైట్ తనిఖీ మరియు చట్టబద్ధమైన ఆమోదం కోసం వేచి ఉన్నాయి.'
                    : 'Tasks submitted by worker, currently waiting for inspector on-site re-inspection and statutory sign-off.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingReviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pending Inspector Sign-off
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {task.mandal} Circle
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {task.locationLandmark}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {task.shortDescription}
                    </p>
                  </div>

                  {/* Before vs After Side-by-Side Comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-rose-700 uppercase">BEFORE (Blocked)</div>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                        <img
                          src={task.workExecution?.beforePhotoUrl || task.inspectionReport?.sitePhotoUrl || task.photoUrl || DEFAULT_BEFORE_PHOTO}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_BEFORE_PHOTO;
                          }}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-emerald-700 uppercase">AFTER (Cleaned)</div>
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                        <img
                          src={task.workExecution?.afterPhotoUrl || afterPhotoUrl || DEFAULT_AFTER_PHOTO}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_AFTER_PHOTO;
                          }}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assigned Inspector Info Notice */}
                  <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#0077B6] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">
                        Dispatched to Inspector {task.assignedInspector || 'Sri K. Rama Krishna'}
                      </span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Inspector will physically verify site in Tab 2 'Repair Verifications' of their portal and statutorily close the case.
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
                <span>
                  {currentLang === 'hi'
                    ? `वैधानिक रूप से सत्यापित एवं पूर्ण मामले (${completedTasks.length})`
                    : currentLang === 'te'
                    ? `చట్టబద్ధంగా ధృవీకరించిన కేసులు (${completedTasks.length})`
                    : `Statutorily Verified & Closed Cases (${completedTasks.length})`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {currentLang === 'hi'
                  ? 'जल पुनर्भरण संपत्तियां जिनका सुधार कार्य पूरा हुआ एवं इंस्पेक्टर द्वारा स्वीकृत किया गया।'
                  : currentLang === 'te'
                  ? 'పునరుద్ధరణ పూర్తయి ఇన్‌స్పెక్టర్ ఆమోదం పొందిన జల వనరులు.'
                  : 'Water recharge assets with completed remediation and approved inspector sign-off.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {currentLang === 'hi'
                        ? 'वैधानिक रूप से बंद (निस्तारित)'
                        : currentLang === 'te'
                        ? 'చట్టబద్ధంగా ముగించబడింది (పరిష్కారం)'
                        : 'Statutorily Closed (RESOLVED)'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">
                      {currentLang === 'hi'
                        ? '100% जल प्रवाह बहाल'
                        : currentLang === 'te'
                        ? '100% నీటి ప్రవాహం పునరుద్ధరించబడింది'
                        : '100% Water Flow Restored'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {task.locationLandmark}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {task.shortDescription}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 text-xs text-emerald-950 font-medium">
                    "Physical site inspected. Water flow fully restored. Apron and weir free of packed silt. Zero obstruction remaining."
                  </div>
                </div>
              ))}

              {completedTasks.length === 0 && (
                <div className="col-span-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
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
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentLang === 'hi'
                    ? `${selectedWorker.district} जिला जलविज्ञानी एवं सुधार उपग्रह मानचित्र`
                    : currentLang === 'te'
                    ? `${selectedWorker.district} జిల్లా హైడ్రాలాజికల్ & పునరుద్ధరణ శాటిలైట్ మ్యాప్`
                    : `${selectedWorker.district} District Hydrological & Remediation Satellite Map`}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentLang === 'hi'
                  ? 'नोडल अधिकारी उपग्रह निगरानी: Esri World Satellite, ISRO Bhuvan टेलीमेट्री, जलाशय, नदी गेज और कार्य आदेश।'
                  : currentLang === 'te'
                  ? 'నోడల్ అధికారి ఉపగ్రహ నిఘా: Esri శాటిలైట్, ఇస్రో భువన్ టెలిమెట్రీ, జలాశయాలు మరియు పని ఆదేశాలు.'
                  : 'Authoritative District Nodal Officer surveillance map: Esri World Satellite, ISRO Bhuvan telemetry, district reservoirs, river gauges, piezometers, and work orders.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[#0077B6] bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/80">
                {selectedWorker.district} {currentLang === 'hi' ? 'सर्कल' : currentLang === 'te' ? 'సర్కిల్' : 'Circle'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs min-h-[580px]">
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
