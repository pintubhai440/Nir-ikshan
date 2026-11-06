/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Field Inspector Workstation - Schedule & Task View
 * Ultra-High-End Gov-Tech Interface: Executive Typography, High-Contrast Cards,
 * Precision Telemetry Badges, and One-Click Mission Triggers.
 */

import React, { useState, useMemo } from 'react';
import { 
  ScheduledInspectionTask, 
  VerificationTaskItem,
  CompletedInspectionItem
} from './types';
import { CitizenComplaint } from '../../types/nirikshan';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Navigation, 
  FileCheck, 
  Droplet, 
  ExternalLink, 
  X,
  AlertCircle,
  Eye,
  Sparkles,
  Award,
  Activity,
  Layers,
  Wrench,
  Check,
  Compass,
  Camera,
  FileText,
  Info,
  Cpu,
  Phone,
  Mail,
  Lock,
  Search,
  Filter,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react';

import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';
import { useLanguage } from '../../context/LanguageContext';

interface InspectorTodayViewProps {
  inspector?: SupabaseFieldInspectorRow;
  scheduledTasks: ScheduledInspectionTask[];
  completedTasks?: CompletedInspectionItem[];
  verificationTasks: VerificationTaskItem[];
  complaints: CitizenComplaint[];
  onStartInspection: (task: ScheduledInspectionTask | CitizenComplaint) => void;
  onOpenVerifyTask: (task: VerificationTaskItem) => void;
  onSwitchToMap: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  queuedSyncCount: number;
  activeCategory?: 'pending' | 'completed' | 'verify';
  onCategoryChange?: (category: 'pending' | 'completed' | 'verify') => void;
  submissionBannerText?: string | null;
  onDismissBanner?: () => void;
}

export const InspectorTodayView: React.FC<InspectorTodayViewProps> = ({
  inspector,
  scheduledTasks,
  completedTasks = [],
  verificationTasks,
  complaints,
  onStartInspection,
  onOpenVerifyTask,
  onSwitchToMap,
  activeCategory: controlledCategory,
  onCategoryChange,
  submissionBannerText,
  onDismissBanner,
}) => {
  const { language } = useLanguage();
  const currentLang = (language === 'hi' || language === 'te') ? language : 'en';

  const [internalCategory, setInternalCategory] = useState<'pending' | 'completed' | 'verify'>('pending');
  const activeCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;

  const handleCategorySwitch = (cat: 'pending' | 'completed' | 'verify') => {
    setInternalCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  const [selectedCompletedDossier, setSelectedCompletedDossier] = useState<CompletedInspectionItem | null>(null);
  const [selectedPendingTask, setSelectedPendingTask] = useState<ScheduledInspectionTask | null>(null);

  const pendingVerificationCount = verificationTasks.filter(
    (v) => v.status === 'PENDING_SIGN_OFF'
  ).length;

  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskFilterSla, setTaskFilterSla] = useState<'all' | 'priority' | 'nearest'>('all');
  const [taskSortBy, setTaskSortBy] = useState<'sla' | 'distance' | 'name'>('sla');

  const filteredTasks = useMemo(() => {
    return scheduledTasks
      .filter((task) => {
        if (taskSearchQuery.trim()) {
          const q = taskSearchQuery.toLowerCase().trim();
          const matchName = task.name?.toLowerCase().includes(q);
          const matchCode = task.assetCode?.toLowerCase().includes(q);
          const matchParcel = task.cadastralParcel?.toLowerCase().includes(q);
          const matchId = task.id?.toLowerCase().includes(q);
          const matchSummary = task.pastRecordSummary?.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchParcel && !matchId && !matchSummary) return false;
        }
        if (taskFilterSla === 'priority') {
          if (task.priority !== 'Critical' && !task.scheduledWindow?.includes('24h')) return false;
        }
        if (taskFilterSla === 'nearest') {
          if (task.distanceMeters && task.distanceMeters > 1000) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (taskSortBy === 'distance') {
          return (a.distanceMeters || 0) - (b.distanceMeters || 0);
        }
        if (taskSortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [scheduledTasks, taskSearchQuery, taskFilterSla, taskSortBy]);

  return (
    <div className="space-y-6 w-full">
      {/* ============================================================== */}
      {/* 1. SLEEK SEGMENTED NAVIGATION BAR                              */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-2xl p-1 bg-slate-100 border border-slate-200/80 text-xs font-bold gap-1 flex-wrap">
          <button
            onClick={() => handleCategorySwitch('pending')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'pending'
                ? 'bg-[#03045E] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-300" />
            <span>
              {currentLang === 'hi' ? 'लंबित फ़ील्ड निरीक्षण' : currentLang === 'te' ? 'పెండింగ్ ఫీల్డ్ తనిఖీలు' : 'Pending Field Inspections'}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-extrabold ${
                activeCategory === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {scheduledTasks.length}
            </span>
          </button>

          <button
            onClick={() => handleCategorySwitch('completed')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'completed'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>
              {currentLang === 'hi' ? 'पूर्ण निरीक्षण डॉसियर' : currentLang === 'te' ? 'పూర్తయిన తనిఖీ పత్రాలు' : 'Completed Dossiers'}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-extrabold ${
                activeCategory === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {completedTasks.length}
            </span>
          </button>

          {pendingVerificationCount > 0 && (
            <button
              onClick={() => handleCategorySwitch('verify')}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === 'verify'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-300" />
              <span>
                {currentLang === 'hi' ? 'मरम्मत सत्यापन' : currentLang === 'te' ? 'మరమ్మత్తు ధృవీకరణ' : 'Repair Sign-Off'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-200 text-amber-950 font-black">
                {pendingVerificationCount}
              </span>
            </button>
          )}
        </div>

        <button
          onClick={onSwitchToMap}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-all hover:border-sky-300 shadow-2xs ml-auto sm:ml-0"
        >
          <Navigation className="w-4 h-4 text-[#0077B6]" />
          <span>
            {currentLang === 'hi' ? 'जीआईएस भूकर मानचित्र खोलें' : currentLang === 'te' ? 'జీఐఎస్ కాడాస్ట్రల్ మ్యాప్ తెరవండి' : 'Open GIS Cadastral Map'}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. ENGINEERING REPAIR CLEARANCE ALERT BANNER                    */}
      {/* ============================================================== */}
      {pendingVerificationCount > 0 && activeCategory === 'pending' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                  {currentLang === 'hi'
                    ? `${pendingVerificationCount} मरम्मत कार्य पूर्ण: सत्यापन हेतु लंबित`
                    : currentLang === 'te'
                    ? `${pendingVerificationCount} మరమ్మత్తు పనులు పూర్తయ్యాయి: ధృవీకరణ కోసం వేచి ఉంది`
                    : `${pendingVerificationCount} Repair Completed: Action Crew Awaiting Sign-Off`}
                </h4>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                {currentLang === 'hi'
                  ? 'कार्यकारी अभियंता दल ने गाद निकासी कार्य पूरा किया। कार्य आदेश बंद करने हेतु अनिवार्य भौतिक सत्यापन करें।'
                  : currentLang === 'te'
                  ? 'ఎగ్జిక్యూటివ్ ఇంజనీర్ బృందం పూడికతీత పనులను పూర్తి చేసింది. వర్క్ ఆర్డర్ ముగించడానికి భౌతిక ధృవీకరణ నిర్వహించండి.'
                  : 'Executive Engineer crew finished silt clearance and desilting. Conduct statutory physical verification to close work order.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (verificationTasks[0]) onOpenVerifyTask(verificationTasks[0]);
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <span>
              {currentLang === 'hi' ? 'सत्यापित व हस्ताक्षर करें' : currentLang === 'te' ? 'ధృవీకరించి సంతకం చేయండి' : 'Verify & Sign Off'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN TASKS CONTAINER                                        */}
      {/* ============================================================== */}
      <div className="space-y-5">
        {/* TAB 1: PENDING FIELD INSPECTIONS */}
        {activeCategory === 'pending' && (
          scheduledTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">
                {currentLang === 'hi' 
                  ? 'आपकी कतार में कोई लंबित निरीक्षण नहीं है' 
                  : currentLang === 'te' 
                  ? 'మీ క్యూలో పెండింగ్ తనిఖీలు ఏవీ లేవు' 
                  : 'No Pending Inspections in Your Queue'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {currentLang === 'hi'
                  ? 'जिला नोडल अधिकारी द्वारा आपके वर्कस्टेशन पर भेजे गए सभी शिकायत मामलों की जांच पूर्ण व सील कर दी गई है।'
                  : currentLang === 'te'
                  ? 'జిల్లా నోడల్ అధికారి ద్వారా మీ వర్క్‌స్టేషన్‌కు పంపబడిన అన్ని ఫిర్యాదు కేసుల తనిఖీ పూర్తయి సీల్ చేయబడింది.'
                  : 'All grievance cases dispatched to your workstation by the District Nodal Officer have been inspected and sealed.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search, Filter & Quick Stats Toolbar */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={taskSearchQuery}
                      onChange={(e) => setTaskSearchQuery(e.target.value)}
                      placeholder={
                        currentLang === 'hi'
                          ? 'जल निकाय नाम, भूकर क्षेत्र, आईडी द्वारा खोजें...'
                          : currentLang === 'te'
                          ? 'కేస్ పేరు, కాడాస్ట్రల్ సెక్టార్, ఐడీ ద్వారా శోధించండి...'
                          : 'Search cases by asset name, cadastral sector, ID...'
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
                    />
                    {taskSearchQuery && (
                      <button
                        onClick={() => setTaskSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setTaskFilterSla('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        taskFilterSla === 'all'
                          ? 'bg-[#03045E] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {currentLang === 'hi' ? 'सभी' : currentLang === 'te' ? 'అన్నీ' : 'All'} ({scheduledTasks.length})
                    </button>

                    <button
                      onClick={() => setTaskFilterSla('priority')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        taskFilterSla === 'priority'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>{currentLang === 'hi' ? '24 घंटे एसएलए' : currentLang === 'te' ? '24 గం. ఎస్‌ఎల్‌ఏ' : '24h SLA'}</span>
                    </button>

                    <button
                      onClick={() => setTaskFilterSla('nearest')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        taskFilterSla === 'nearest'
                          ? 'bg-[#0077B6] text-white shadow-xs'
                          : 'bg-blue-50 text-[#0077B6] hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-[#0077B6]" />
                      <span>{currentLang === 'hi' ? 'निकटवर्ती (< 1किमी)' : currentLang === 'te' ? 'సమీపంలో (< 1కి.మీ)' : 'Nearby (< 1km)'}</span>
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-semibold hidden sm:inline">
                      {currentLang === 'hi' ? 'क्रमबद्ध:' : currentLang === 'te' ? 'క్రమబద్ధీకరించు:' : 'Sort:'}
                    </span>
                    <select
                      value={taskSortBy}
                      onChange={(e) => setTaskSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="sla">{currentLang === 'hi' ? 'अति आवश्यक 24h SLA' : currentLang === 'te' ? 'అత్యవసరం 24 గం. ఎస్‌ఎల్‌ఏ' : 'Urgent 24h SLA'}</option>
                      <option value="distance">{currentLang === 'hi' ? 'निकटतम दूरी' : currentLang === 'te' ? 'సమీప దూరం' : 'Nearest Distance'}</option>
                      <option value="name">{currentLang === 'hi' ? 'नाम अनुसार (A-Z)' : currentLang === 'te' ? 'పేరు ప్రకారం (A-Z)' : 'Asset Name (A-Z)'}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                  <span>
                    {currentLang === 'hi' ? 'दिखाए जा रहे हैं ' : currentLang === 'te' ? 'చూపిస్తోంది ' : 'Showing '}
                    <strong className="text-slate-900 font-bold">{filteredTasks.length}</strong>
                    {currentLang === 'hi' ? ' कुल ' : currentLang === 'te' ? ' లో ' : ' of '}
                    <strong className="text-slate-900 font-bold">{scheduledTasks.length}</strong>
                    {currentLang === 'hi' ? ' सक्रिय निरीक्षण मामले' : currentLang === 'te' ? ' క్రియాశీల తనిఖీ కేసులు' : ' active inspection cases'}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{currentLang === 'hi' ? 'कैलिब्रेटेड फील्ड वर्कस्टेशन सक्रिय' : currentLang === 'te' ? 'క్యాలిబ్రేటెడ్ ఫీల్డ్ వర్క్‌స్టేషన్ క్రియాశీలం' : 'Calibrated Field Workstation Active'}</span>
                  </span>
                </div>
              </div>

              {/* No Results from search/filter */}
              {filteredTasks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">No inspection cases match your filter/search criteria.</p>
                  <button
                    onClick={() => {
                      setTaskSearchQuery('');
                      setTaskFilterSla('all');
                      setTaskSortBy('sla');
                    }}
                    className="text-xs text-[#0077B6] font-bold hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                /* Organized Responsive Grid: 3 columns on desktop, filling 100% width cleanly */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 w-full">
                  {filteredTasks.map((task) => {
                    const nameWords = task.name.trim().split(/\s+/);
                    const initials = nameWords.length > 1
                      ? `${nameWords[0][0]}${nameWords[1][0]}`.toUpperCase()
                      : task.name.slice(0, 2).toUpperCase();

                    const distanceText = task.distanceMeters ? `${(task.distanceMeters / 1000).toFixed(1)} km away` : '0.4 km away';
                    const jurisdictionText = task.cadastralParcel || (task.mandal ? `${task.mandal} Mandal Sector` : 'Field Inspection Zone');
                    const districtText = task.district || inspector?.district || 'Vizianagaram';
                    const hardwareText = inspector?.meter_id ? `${inspector.meter_id} (Calibrated)` : 'TDS-VZM-001 (Calibrated)';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedPendingTask(task)}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0077B6]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group p-4 sm:p-4.5 relative space-y-3 cursor-pointer"
                      >
                        {/* Top subtle blue accent gradient line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#03045E] via-[#0077B6] to-sky-400" />

                        {/* Header Block: Avatar + Badges + Title */}
                        <div className="space-y-2 pt-0.5">
                          <div className="flex items-start gap-3">
                            {/* Compact Blue Gradient Monogram Avatar */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#03045E] to-[#0077B6] text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0 tracking-wider">
                              {initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Badges Row */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-[#0077B6] bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                                  {task.assetCode}
                                </span>

                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Active</span>
                                </span>

                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  <span>24h SLA</span>
                                </span>

                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md ml-auto flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-rose-500" />
                                  <span>{distanceText}</span>
                                </span>
                              </div>

                              {/* Title & Subtitle */}
                              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-[#0077B6] transition-colors mt-1.5 line-clamp-1">
                                {task.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#0077B6] shrink-0" />
                                <span className="truncate">{jurisdictionText}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Compact Inset Specifications Box */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-700 gap-2">
                            <span className="text-slate-500 flex items-center gap-1 shrink-0">
                              <Compass className="w-3 h-3 text-[#0077B6]" />
                              <span>District / Ayacut:</span>
                            </span>
                            <span className="font-bold text-slate-800 truncate text-right">
                              {districtText} · {task.ayacutHectares || 320} Ha
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700 gap-2 pt-1 border-t border-slate-200/50">
                            <span className="text-slate-500 flex items-center gap-1 shrink-0">
                              <Cpu className="w-3 h-3 text-[#0077B6]" />
                              <span>Testing Hardware:</span>
                            </span>
                            <span className="font-mono text-[10px] font-bold text-slate-800 truncate text-right">
                              {hardwareText}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700 gap-2 pt-1 border-t border-slate-200/50">
                            <span className="text-slate-500 flex items-center gap-1 shrink-0">
                              <Navigation className="w-3 h-3 text-[#0077B6]" />
                              <span>GPS (RTK Fixed):</span>
                            </span>
                            <span className="font-mono text-[10px] font-bold text-sky-800 truncate text-right">
                              {task.coordinates ? `${task.coordinates.lat.toFixed(4)}°N, ${task.coordinates.lng.toFixed(4)}°E` : '18.5284°N, 83.2125°E'}
                            </span>
                          </div>
                        </div>

                        {/* Dual Mini Stat Tiles */}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0077B6] block">
                              SCHEDULED
                            </span>
                            <span className="text-base font-black text-[#03045E] block leading-tight mt-0.5">
                              1 Action
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium block">
                              Due Today
                            </span>
                          </div>

                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 block">
                              SLA STATUS
                            </span>
                            <span className="text-base font-black text-emerald-600 block leading-tight mt-0.5">
                              Within SLA
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium block">
                              0 Overdue
                            </span>
                          </div>
                        </div>

                        {/* Compact Grievance Memo Quote */}
                        <div className="bg-sky-50/40 border border-sky-100/70 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#03045E]">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#0077B6]" />
                              <span>Grievance Summary</span>
                            </span>
                            <span className="font-mono text-slate-400">
                              #{task.id ? task.id.slice(-6) : 'LIVE-01'}
                            </span>
                          </div>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px] font-normal">
                            {task.pastRecordSummary || 'Physical site survey and calibrated TDS water quality measurement required.'}
                          </p>
                        </div>

                        {/* Protocol Spec Strip */}
                        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 font-medium">
                          <div className="flex items-center gap-1.5 truncate">
                            <Droplet className="w-3 h-3 text-[#0077B6]" />
                            <span className="truncate">4 Photos · TDS/pH Probe · Aadhaar</span>
                          </div>
                          <span className="font-bold text-[#0077B6] font-mono shrink-0">
                            6-Step
                          </span>
                        </div>

                        {/* Contact & Cadre Lock Info */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-amber-700 font-bold text-[10px]">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>1-to-1 Cadre Lock</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            PIN: 1234
                          </span>
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 mt-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPendingTask(task);
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                            title="View Case Dossier"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>{currentLang === 'hi' ? 'विवरण' : currentLang === 'te' ? 'వివరాలు' : 'Details'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartInspection(task);
                            }}
                            className="flex-1 py-2 px-3 bg-[#0077B6] hover:bg-[#03045E] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                          >
                            <Lock className="w-3.5 h-3.5 text-sky-200" />
                            <span>{currentLang === 'hi' ? 'निरीक्षण शुरू करें' : currentLang === 'te' ? 'తనిఖీ ప్రారంభించండి' : 'Start Inspection'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-sky-200" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}

        {/* TAB 2: COMPLETED SEALED DOSSIERS */}
        {activeCategory === 'completed' && (
          <div className="space-y-4">
            {submissionBannerText && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">{submissionBannerText}</p>
                    <p className="text-[11px] text-emerald-700">The statutory physical inspection was successfully recorded, removed from your pending queue, and sealed under Completed Dossiers.</p>
                  </div>
                </div>
                {onDismissBanner && (
                  <button
                    onClick={onDismissBanner}
                    className="p-1.5 text-emerald-700 hover:text-emerald-950 rounded-lg hover:bg-emerald-100/60 cursor-pointer transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {completedTasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-black text-slate-900 text-lg">No Completed Inspections Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Open the "Pending Field Inspections" tab to start your physical surveys and submit inspection dossiers.
                </p>
              </div>
            ) : (
            <div className="space-y-4">
              {/* Header Info Strip */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                      Statutory Sealed Field Dossiers ({completedTasks.length})
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      UIDAI Aadhaar certified physical surveys with calibrated laboratory telemetry records.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-white text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs hidden sm:inline-block">
                  AP-WATER-AUDIT
                </span>
              </div>

              {/* 3-Column Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 w-full">
                {completedTasks.map((item) => {
                  const formattedName = item.name
                    .split(' ')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');

                  const nameWords = formattedName.trim().split(/\s+/);
                  const initials = nameWords.length > 1
                    ? `${nameWords[0][0]}${nameWords[1][0]}`.toUpperCase()
                    : formattedName.slice(0, 2).toUpperCase();

                  const locationText = item.cadastralParcel || (item.mandal ? `${item.district} • ${item.mandal} Mandal` : item.district);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCompletedDossier(item)}
                      className="bg-white rounded-2xl border border-emerald-200/90 hover:border-emerald-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group p-4 sm:p-4.5 relative space-y-3 cursor-pointer"
                    >
                      {/* Top emerald accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-400" />

                      {/* Header: Avatar + Badges + Title */}
                      <div className="space-y-2 pt-0.5">
                        <div className="flex items-start gap-3">
                          {/* Emerald Gradient Monogram Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-600 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0 tracking-wider">
                            {initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                {item.assetCode}
                              </span>

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Sealed</span>
                              </span>

                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md ml-auto">
                                {new Date(item.inspectedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-emerald-700 transition-colors mt-1.5 line-clamp-1">
                              {formattedName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{locationText}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inset Telemetry Box */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-700 gap-2">
                          <span className="text-slate-500 flex items-center gap-1 shrink-0">
                            <Droplet className="w-3 h-3 text-[#0077B6]" />
                            <span>Recorded TDS:</span>
                          </span>
                          <span className="font-mono text-[#0077B6] font-bold text-right">
                            {item.tdsReadingPpm} mg/L
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-700 gap-2 pt-1 border-t border-slate-200/50">
                          <span className="text-slate-500 flex items-center gap-1 shrink-0">
                            <Activity className="w-3 h-3 text-emerald-600" />
                            <span>Water Level:</span>
                          </span>
                          <span className="font-bold text-emerald-700 truncate text-right">
                            {item.waterPresence}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-700 gap-2 pt-1 border-t border-slate-200/50">
                          <span className="text-slate-500 flex items-center gap-1 shrink-0">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <span>Waste Type:</span>
                          </span>
                          <span className="font-semibold text-slate-800 truncate text-right">
                            {item.wasteType}
                          </span>
                        </div>
                      </div>

                      {/* Dual Stat Tiles */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 block">
                            STATUTORY AUDIT
                          </span>
                          <span className="text-base font-black text-emerald-600 block leading-tight mt-0.5">
                            Sealed ✓
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium block">
                            UIDAI Verified
                          </span>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#0077B6] block">
                            LAB TELEMETRY
                          </span>
                          <span className="text-base font-black text-[#03045E] block leading-tight mt-0.5">
                            {item.tdsReadingPpm} PPM
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium block">
                            Calibrated Meter
                          </span>
                        </div>
                      </div>

                      {/* Inspector Validation Findings Memo Quote */}
                      <div className="bg-sky-50/40 border border-sky-100/70 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#03045E]">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#0077B6]" />
                            <span>Inspector Findings</span>
                          </span>
                          <span className="font-mono text-slate-400">
                            #{item.id ? item.id.slice(-6) : 'AUDIT'}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px] font-normal">
                          {item.validationRemarks || 'Physical verification confirmed water body structure condition and telemetry.'}
                        </p>
                      </div>

                      {/* Aadhaar e-Sign Stamp Row */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-emerald-800 font-bold text-[10px]">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Aadhaar e-Signed</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-700 truncate max-w-[140px]">
                          {item.inspectorName}
                        </span>
                      </div>

                      {/* Footer Action Button */}
                      <div className="pt-1 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompletedDossier(item);
                          }}
                          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-100" />
                          <span>
                            {currentLang === 'hi'
                              ? 'हस्ताक्षरित आधिकारिक डॉसियर देखें'
                              : currentLang === 'te'
                              ? 'అధికారికంగా సంతకం చేసిన పత్రాన్ని చూడండి'
                              : 'View Official Signed Dossier'}
                          </span>
                          <ExternalLink className="w-3 h-3 text-emerald-100" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        )}

        {/* TAB 3: REPAIR VERIFICATIONS / REPAIR SIGN-OFF */}
        {activeCategory === 'verify' && (
          verificationTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-black text-slate-900 text-lg">No Pending Repair Sign-Offs</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                All engineering repairs completed by action crews have been inspected and signed off.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Info Strip */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                      Action Crew Repairs Awaiting Sign-Off ({verificationTasks.length})
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Civil work executed by Action Worker crews. Mandatory physical verification required before sign-off.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-white text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl shadow-2xs hidden sm:inline-block">
                  SEC-42A
                </span>
              </div>

              {/* 3-Column Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 w-full">
                {verificationTasks.map((task) => {
                  const nameWords = task.locationName.trim().split(/\s+/);
                  const initials = nameWords.length > 1
                    ? `${nameWords[0][0]}${nameWords[1][0]}`.toUpperCase()
                    : task.locationName.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenVerifyTask(task)}
                      className="bg-white rounded-2xl border border-amber-200/90 hover:border-amber-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group p-4 sm:p-4.5 relative space-y-3 cursor-pointer"
                    >
                      {/* Top amber accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400" />

                      {/* Header: Avatar + Badges + Title */}
                      <div className="space-y-2 pt-0.5">
                        <div className="flex items-start gap-3">
                          {/* Amber Gradient Monogram Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0 tracking-wider">
                            {initials}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                {task.taskId}
                              </span>

                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200">
                                {task.priority.includes('Critical') ? 'Critical' : 'Level 2'}
                              </span>

                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md ml-auto flex items-center gap-1">
                                <Wrench className="w-2.5 h-2.5 text-amber-600" />
                                <span>Sign-Off Due</span>
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight group-hover:text-amber-800 transition-colors mt-1.5 line-clamp-1">
                              {task.locationName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{task.catchmentBasin}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inset Engineering Specs Box */}
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
                            <Wrench className="w-3 h-3 text-emerald-600" />
                            <span>Remediation Work:</span>
                          </span>
                          <span className="font-mono text-emerald-800 font-bold truncate text-right">
                            {task.afterExcavationCubicMeters || '350 m³ Silt Cleared'}
                          </span>
                        </div>
                      </div>

                      {/* Dual Stat Tiles */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 block">
                            REPAIR CREW
                          </span>
                          <span className="text-base font-black text-amber-900 block leading-tight mt-0.5">
                            Completed
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium block">
                            Ready for Sign-Off
                          </span>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 block">
                            STATUTORY AUDIT
                          </span>
                          <span className="text-base font-black text-emerald-600 block leading-tight mt-0.5">
                            Sec. 42A
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium block">
                            Physical Check
                          </span>
                        </div>
                      </div>

                      {/* Worker Closure Report Memo Quote */}
                      <div className="bg-amber-50/40 border border-amber-100/70 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900">
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-600" />
                            <span>Worker Remediation Report</span>
                          </span>
                          <span className="font-mono text-slate-400">
                            #{task.taskId ? task.taskId.slice(-6) : 'TASK'}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px] font-normal">
                          {task.afterWorkerClosureNotes || 'Excavation and debris clearing completed. Water flow gradient restored.'}
                        </p>
                      </div>

                      {/* Independent Rule Strip */}
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 font-medium">
                        <div className="flex items-center gap-1.5 truncate">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Independent Inspector Verification Mandated</span>
                        </div>
                        <span className="font-bold text-amber-800 font-mono shrink-0">
                          Sec. 42A
                        </span>
                      </div>

                      {/* Footer Action Button */}
                      <div className="pt-1 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenVerifyTask(task);
                          }}
                          className="w-full py-2.5 px-3 bg-[#03045E] hover:bg-[#0077B6] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                        >
                          <Wrench className="w-3.5 h-3.5 text-sky-200" />
                          <span>
                            {currentLang === 'hi'
                              ? 'सत्यापन प्रोटोकॉल खोलें व प्रमाणित करें'
                              : currentLang === 'te'
                              ? 'ధృవీకరణ ప్రోటోకాల్‌ను తెరిచి ధృవీకరించండి'
                              : 'Open Verification Protocol & Certify'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-sky-200" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. OFFICIAL SEALED DOSSIER PREVIEW MODAL                       */}
      {/* ============================================================== */}
      {selectedCompletedDossier && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">
                    Official Statutory Inspection Dossier
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    Gov. of AP • Minor Irrigation Department
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompletedDossier(null)}
                className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Water Body / Asset</span>
                <h5 className="font-black text-slate-900 text-base">{selectedCompletedDossier.name}</h5>
                <p className="text-slate-500 font-mono text-xs">{selectedCompletedDossier.cadastralParcel || `${selectedCompletedDossier.district} • Mandal: ${selectedCompletedDossier.mandal}`}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">Recorded TDS</span>
                  <span className="text-xl font-black text-blue-950 font-mono mt-0.5 block">{selectedCompletedDossier.tdsReadingPpm} mg/L</span>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Water Presence</span>
                  <span className="text-xl font-black text-emerald-950 mt-0.5 block">{selectedCompletedDossier.waterPresence}</span>
                </div>
              </div>

              {selectedCompletedDossier.sitePhotoUrl && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">EXIF Geo-Tagged On-Site Evidence</span>
                  <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                    <img
                      src={selectedCompletedDossier.sitePhotoUrl}
                      alt="Site Evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-xl">
                      GPS: {selectedCompletedDossier.coordinates?.lat.toFixed(4)}° N, {selectedCompletedDossier.coordinates?.lng.toFixed(4)}° E
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-black text-slate-800 block text-[10px] uppercase tracking-wider">Inspector Validation Findings:</span>
                <p className="text-slate-600 leading-relaxed font-medium">{selectedCompletedDossier.validationRemarks}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider block">UIDAI Aadhaar e-Sign</span>
                  <span className="font-black text-emerald-950 text-sm">{selectedCompletedDossier.inspectorName}</span>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                  ✓ Statutory Sealed
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCompletedDossier(null)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl cursor-pointer transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. PENDING TASK COMPREHENSIVE CASE DOSSIER & SPECS MODAL       */}
      {/* ============================================================== */}
      {selectedPendingTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#03045E] to-[#0077B6] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Droplet className="w-6 h-6 text-sky-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-sky-100 text-[#0077B6] px-2.5 py-0.5 rounded-lg border border-sky-200">
                      {selectedPendingTask.assetCode}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>24h Statutory SLA</span>
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight mt-1">
                    {selectedPendingTask.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Cadastral Parcel: <strong className="text-slate-700">{selectedPendingTask.cadastralParcel}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPendingTask(null)}
                className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 text-xs">
              {/* 1. Cadastral & Geolocation Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cadastral Boundary &amp; Command Area
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Command Ayacut:</span>
                      <span className="font-bold text-slate-900">{selectedPendingTask.ayacutHectares} Hectares</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Irrigation Circle:</span>
                      <span className="font-bold text-slate-900">Minor Irrigation • AP</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Recharge Type:</span>
                      <span className="font-bold text-[#0077B6]">{selectedPendingTask.rechargeType || 'Surface Feeder Siphon'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    RTK GPS Geofence Verification
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-sky-900">Coordinates:</span>
                      <span className="font-mono font-bold text-sky-950">
                        {selectedPendingTask.coordinates?.lat.toFixed(4)}° N, {selectedPendingTask.coordinates?.lng.toFixed(4)}° E
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-sky-900">Distance to Site:</span>
                      <span className="font-bold text-emerald-700">0.4 km away (Inside Perimeter)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-sky-900">GPS Accuracy:</span>
                      <span className="font-bold text-sky-900">±1.8m (RTK Fixed Lock)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Grievance Summary & Action Required */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Grievance Summary &amp; Nodal Dispatch Directive</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950">
                    DISPATCHED
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                  {selectedPendingTask.pastRecordSummary || 'Plastic bottles & domestic runoff choking the weir. Require on-site physical GPS verification and calibrated TDS water quality measurement.'}
                </p>
                <div className="text-[11px] text-amber-800/90 pt-1 border-t border-amber-200/60 flex items-center justify-between">
                  <span>Mandated Officer: {inspector?.full_name || 'Designated Field Inspector'}</span>
                  <span className="font-bold text-rose-700">Strict 24h SLA Active</span>
                </div>
              </div>

              {/* 3. 6-Step Statutory Inspection Protocol Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Statutory 6-Step Protocol Roadmap (APWRIMS Compliant)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <div>
                      <strong className="text-slate-800 block text-xs">Asset &amp; Geo-Fence Lock</strong>
                      <p className="text-[11px] text-slate-500">Automated satellite validation inside cadastral boundary</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <div>
                      <strong className="text-slate-800 block text-xs">Structural Physical Checks</strong>
                      <p className="text-[11px] text-slate-500">Sluice gate operability, 0.8m silt deposit, masonry audit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <div>
                      <strong className="text-slate-800 block text-xs">Hydrology Lab Telemetry</strong>
                      <p className="text-[11px] text-slate-500">TDS salinity meter, pH level, depth staff gauge &amp; temperature</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                    <div>
                      <strong className="text-slate-800 block text-xs">Ground Truth &amp; Contaminants</strong>
                      <p className="text-[11px] text-slate-500">Defect confirmation and plastic/sewage/silt classification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-[10px] shrink-0">5</span>
                    <div>
                      <strong className="text-slate-800 block text-xs">4 Guided Photo Evidence</strong>
                      <p className="text-[11px] text-slate-500">Live camera/upload with EXIF, compass azimuth &amp; RTK stamp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">6</span>
                    <div>
                      <strong className="text-slate-800 block text-xs">Aadhaar Cryptographic e-Sign</strong>
                      <p className="text-[11px] text-slate-500">Tamper-proof statutory digital seal for legal evidence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPendingTask(null)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  const task = selectedPendingTask;
                  setSelectedPendingTask(null);
                  onStartInspection(task);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#03045E] to-[#0077B6] hover:from-[#023E8A] hover:to-[#0096C7] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <span>Start Physical Inspection (Open Wizard)</span>
                <ArrowRight className="w-4 h-4 text-sky-200" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
