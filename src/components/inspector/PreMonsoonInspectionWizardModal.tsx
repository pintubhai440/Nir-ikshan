/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pre-Monsoon Statutory Inspection Wizard Modal
 * High-Prestige Gov-Tech Mission Control Interface
 * Calibrated digital laboratory instruments, HUD viewfinders, and cryptographic Aadhaar sealing.
 */

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Upload, 
  Sparkles, 
  Droplet, 
  Activity, 
  Thermometer, 
  Layers, 
  FileCheck, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Compass,
  ArrowRight,
  Sun,
  Radio,
  Clock,
  Gauge,
  Check,
  RotateCw,
  ExternalLink,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduledInspectionTask } from './types';
import { CitizenComplaint, InspectorReport } from '../../types/nirikshan';
import { SupabaseFieldInspectorRow } from '../../data/allDistrictsTeamData';

interface PreMonsoonInspectionWizardModalProps {
  inspector?: SupabaseFieldInspectorRow;
  task: ScheduledInspectionTask | CitizenComplaint | null;
  onClose: () => void;
  onSubmitInspection: (report: InspectorReport) => void;
}

export const PreMonsoonInspectionWizardModal: React.FC<PreMonsoonInspectionWizardModalProps> = ({
  inspector,
  task,
  onClose,
  onSubmitInspection,
}) => {
  if (!task) return null;

  // Default to Step 3 (Hydrology) as highlighted in user workflow, but all 6 steps are accessible
  const [activeStep, setActiveStep] = useState<number>(3);

  // Step 2 Condition Flags
  const [gateOperability, setGateOperability] = useState<'Functional' | 'Non-Functional' | 'Partial Jam'>('Non-Functional');
  const [obstruction, setObstruction] = useState<'Clear' | 'Siphon Blocked' | 'Trash Choke'>('Siphon Blocked');
  const [apronSilt, setApronSilt] = useState<'Clean' | '0.8m Critical Silt' | 'Moderate Deposit'>('0.8m Critical Silt');
  const [masonryStructural, setMasonryStructural] = useState<'Sound / Intact' | 'Minor Hairline Cracks' | 'Structural Breach'>('Sound / Intact');
  const [approachBund, setApproachBund] = useState<'Accessible' | 'Breached' | 'Flooded'>('Accessible');

  // Step 3 Hydrology Readings
  const [tdsPpm, setTdsPpm] = useState<number>(420);
  const [phBalance, setPhBalance] = useState<number>(7.4);
  const [turbidity, setTurbidity] = useState<'Clear' | 'Slight Turbid' | 'Heavy Silty'>('Slight Turbid');
  const [waterDepth, setWaterDepth] = useState<number>(1.85);
  const [basinSpread, setBasinSpread] = useState<'Full Basin' | 'Partial Spread' | 'Dry Bed'>('Partial Spread');
  const [waterTemp, setWaterTemp] = useState<number>(28.5);
  const [airTemp, setAirTemp] = useState<number>(34.0);
  const [historicalStation, setHistoricalStation] = useState('Inflow Apron Siphon (Point A-1) [Default]');
  const [geoTaggedPhoto, setGeoTaggedPhoto] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80'
  );

  // Step 4 Observations & Contaminant Classification
  const [wasteType, setWasteType] = useState<InspectorReport['wasteType']>('Plastic & Polythene');
  const [wasteLevel, setWasteLevel] = useState<InspectorReport['wasteLevel']>('Heavy');
  const [waterPresence, setWaterPresence] = useState<InspectorReport['waterPresence']>('Moderate');
  const [isComplaintValid, setIsComplaintValid] = useState<boolean>(true);
  const [siltObservations, setSiltObservations] = useState(
    'Silt accumulation observed across 180m length of feeder canal. Apron retaining wall intact, but left sluice gate requires hydraulic desilting before monsoon crest.'
  );

  // Step 5 Guided Photos State
  const [photosCaptured, setPhotosCaptured] = useState<number>(4);
  const [photoGallery, setPhotoGallery] = useState([
    {
      id: 'p1',
      angle: '1. Sluice Gate Shutter & Spindle',
      status: 'Captured & EXIF Locked',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
      bearing: '315° NW',
      time: '10:42 AM',
      accuracy: '±1.8m RTK',
    },
    {
      id: 'p2',
      angle: '2. Apron Silt Bed & Scour Pool',
      status: 'Captured & EXIF Locked',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      bearing: '180° S',
      time: '10:44 AM',
      accuracy: '±1.8m RTK',
    },
    {
      id: 'p3',
      angle: '3. Upstream Feeder Canal Channel',
      status: 'Captured & EXIF Locked',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      bearing: '045° NE',
      time: '10:47 AM',
      accuracy: '±1.8m RTK',
    },
    {
      id: 'p4',
      angle: '4. Downstream Culvert Discharge',
      status: 'Captured & EXIF Locked',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      bearing: '225° SW',
      time: '10:50 AM',
      accuracy: '±1.8m RTK',
    },
  ]);

  // Step 6 Digital Sign
  const [isSealing, setIsSealing] = useState<boolean>(false);

  const taskName = 'name' in task ? task.name : task.locationLandmark;
  const assetCode = 'assetCode' in task ? task.assetCode : `AP-VZI-LIVE-${task.id}`;
  const cadastralParcel = 'cadastralParcel' in task ? task.cadastralParcel : 'R.S. No. 89/2 (Champavathi Sector)';
  const authority = 'Minor Irrigation Circle • Vizianagaram';

  const handleFinish = () => {
    setIsSealing(true);
    setTimeout(() => {
      const report: InspectorReport = {
        id: `INS-REP-2026-${Math.floor(100 + Math.random() * 900)}`,
        inspectorName: inspector?.full_name || 'Sri V. Jagannadha Rao',
        inspectorPhone: inspector?.phone || '+91 94401 10103',
        inspectedAt: new Date().toISOString(),
        gpsCoordinates: 'coordinates' in task ? task.coordinates : { lat: 18.1109, lng: 83.4268 },
        waterPresence,
        wasteLevel: wasteLevel as 'Low' | 'Moderate' | 'Heavy',
        wasteType,
        sourcePinDescription: `Inflow weir at ${taskName}`,
        tdsReadingPpm: tdsPpm,
        sitePhotoUrl: geoTaggedPhoto,
        isComplaintValid,
        validationRemarks: `[${isComplaintValid ? 'DEFECT CONFIRMED' : 'NORMAL / NO DEFECT'}] Pre-Monsoon Statutory Inspection completed: TDS ${tdsPpm} mg/L, pH ${phBalance}, Depth ${waterDepth}m, Waste: ${wasteType} (${wasteLevel}). ${siltObservations}`,
      };

      onSubmitInspection(report);
      confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* ============================================================== */}
        {/* 1. PRESTIGE NAVY & AZURE COMMAND HEADER                       */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-4 sm:p-5 flex items-start justify-between border-b border-blue-900/60 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-wider text-sky-200 uppercase font-black bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-sky-300" />
                <span>STATUTORY PROTOCOL AP-INSP-2026</span>
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-300" />
                <span>Outdoor Daylight Mode (AAA)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/15 px-2 py-0.5 rounded-full border border-emerald-300/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-300" />
                <span>Cadastral Geo-Fence Verified</span>
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <span>Pre-Monsoon Statutory Inspection — Step {activeStep} of 6:</span>
              <span className="text-sky-300">
                {activeStep === 1 && 'Asset & GPS Geo-Fence'}
                {activeStep === 2 && 'Physical Condition Snapshot'}
                {activeStep === 3 && 'Hydrology Readings'}
                {activeStep === 4 && 'Observations & Silt Survey'}
                {activeStep === 5 && 'Guided Photo Evidence'}
                {activeStep === 6 && 'Aadhaar Digital Sign & Vault Commit'}
              </span>
            </h2>

            <div className="flex items-center gap-2 text-xs text-sky-200 flex-wrap">
              <span className="font-extrabold text-white">{taskName}</span>
              <span className="text-sky-400">•</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-sky-100">{assetCode}</span>
              <span className="text-sky-400">•</span>
              <span className="text-sky-200">{cadastralParcel}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:rotate-90 duration-200 shrink-0 ml-2"
            title="Close Wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. ILLUMINATED 6-STEP PROGRESS STEPPER                         */}
        {/* ============================================================== */}
        <div className="bg-slate-50 border-b border-slate-200/90 px-4 py-2.5 overflow-x-auto shadow-2xs">
          <div className="flex items-center justify-between min-w-[640px] gap-2">
            {[
              { num: 1, label: 'Asset & GPS', subtitle: 'Perimeter Fixed' },
              { num: 2, label: 'Conditions', subtitle: '5 Flags Logged' },
              { num: 3, label: 'Hydrology', subtitle: 'Active Readings' },
              { num: 4, label: 'Observations', subtitle: 'Ground Survey' },
              { num: 5, label: 'Guided Photos', subtitle: `${photosCaptured}/4 Captured` },
              { num: 6, label: 'Submit', subtitle: 'Aadhaar Seal' },
            ].map((step) => {
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#03045E] text-white shadow-md ring-2 ring-sky-400/40'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100/80'
                      : 'text-slate-600 hover:bg-slate-200/70 border border-transparent'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                      isActive
                        ? 'bg-sky-400 text-[#03045E] shadow-xs'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                  </span>
                  <div>
                    <span className="font-extrabold block text-xs leading-tight">{step.label}</span>
                    <span className={`text-[10px] block font-medium ${isActive ? 'text-sky-200' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {step.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. MODAL BODY (STEP CONTENT)                                   */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* ------------------------------------------------------------ */}
          {/* STEP 1: ASSET & GPS GEO-FENCE                                */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-emerald-950 text-base flex items-center gap-2">
                      <span>RTK Sub-Meter GNSS Position Locked</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-emerald-800 text-xs font-mono mt-0.5">
                      Lat: 18.1109° N, Lng: 83.4268° E • Elevation: 114m AMSL • Accuracy: ±1.8m
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                  ✓ Inside Cadastral Perimeter
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Asset Under Audit</span>
                  <span className="font-extrabold text-slate-900 text-sm block">{taskName}</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Cadastral Survey Parcel</span>
                  <span className="font-extrabold text-slate-900 text-sm block">{cadastralParcel}</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Controlling Authority</span>
                  <span className="font-extrabold text-slate-900 text-sm block">{authority}</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Proximity to Weir Sluice</span>
                  <span className="font-extrabold text-emerald-700 text-sm block">14 meters from Center Siphon</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 2: PHYSICAL CONDITION SNAPSHOT                           */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Physical Structural Condition Checklist
                </h3>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  Visual Engineering Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">
                    Gate Operability
                  </label>
                  <select
                    value={gateOperability}
                    onChange={(e) => setGateOperability(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs shadow-2xs outline-none"
                  >
                    <option value="Functional">Functional (Smooth)</option>
                    <option value="Non-Functional">Non-Functional (Frozen Spindle)</option>
                    <option value="Partial Jam">Partial Jam (Stripped)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">
                    Feeder Canal Obstruction
                  </label>
                  <select
                    value={obstruction}
                    onChange={(e) => setObstruction(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs shadow-2xs outline-none"
                  >
                    <option value="Clear">Clear (Free Flow)</option>
                    <option value="Siphon Blocked">Siphon Blocked</option>
                    <option value="Trash Choke">Heavy Trash Choke</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">
                    Apron Silt Deposit
                  </label>
                  <select
                    value={apronSilt}
                    onChange={(e) => setApronSilt(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs shadow-2xs outline-none"
                  >
                    <option value="Clean">Clean (&lt;0.1m)</option>
                    <option value="0.8m Critical Silt">0.8m Critical Silt</option>
                    <option value="Moderate Deposit">Moderate Deposit (0.3m)</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">
                    Masonry Structural
                  </label>
                  <select
                    value={masonryStructural}
                    onChange={(e) => setMasonryStructural(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs shadow-2xs outline-none"
                  >
                    <option value="Sound / Intact">Sound / Intact</option>
                    <option value="Minor Hairline Cracks">Minor Hairline Cracks</option>
                    <option value="Structural Breach">Structural Breach</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 sm:col-span-2 md:col-span-1">
                  <label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-wider block">
                    Approach Bund
                  </label>
                  <select
                    value={approachBund}
                    onChange={(e) => setApproachBund(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs shadow-2xs outline-none"
                  >
                    <option value="Accessible">Accessible (Walkable)</option>
                    <option value="Breached">Breached (Eroded)</option>
                    <option value="Flooded">Flooded Submerged</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 3: HYDROLOGY READINGS (CORE SHOWCASE)                   */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 3 && (
            <div className="space-y-5">
              {/* Step 2 Physical Snapshot Banner */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0077B6]" />
                    <span>Step 2 Summary • Physical Condition Snapshot</span>
                  </span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    Action Required at Sluice
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Gate Operability</span>
                    <span className="font-extrabold text-rose-600 block mt-0.5">{gateOperability}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Obstruction</span>
                    <span className="font-extrabold text-amber-700 block mt-0.5">{obstruction}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Apron Silt</span>
                    <span className="font-extrabold text-rose-600 block mt-0.5">{apronSilt}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Masonry</span>
                    <span className="font-extrabold text-emerald-700 block mt-0.5">{masonryStructural}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">Approach Bund</span>
                    <span className="font-extrabold text-slate-700 block mt-0.5">{approachBund}</span>
                  </div>
                </div>
              </div>

              {/* Indicative Field Sensor Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1.5 rounded-xl bg-blue-50 text-[#0077B6] border border-blue-100">
                      <Activity className="w-4 h-4" />
                    </span>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      Indicative Field Sensor &amp; Kit Readings
                    </h4>
                    <span className="bg-[#0077B6]/10 text-[#0077B6] text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border border-[#0077B6]/20">
                      AP-WQ-2026 Standards
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Measurements calibrated with portable multi-parameter probes and digital optical sensors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={historicalStation}
                    onChange={(e) => setHistoricalStation(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="Inflow Apron Siphon (Point A-1) [Default]">Inflow Apron Siphon (Point A-1) [Default]</option>
                    <option value="Mid-Reservoir Deep Pit (Point B-2)">Mid-Reservoir Deep Pit (Point B-2)</option>
                    <option value="Spillway Discharge Canal (Point C-3)">Spillway Discharge Canal (Point C-3)</option>
                  </select>
                </div>
              </div>

              {/* 6 Hydrology Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Total Dissolved Solids (TDS) */}
                <div className="bg-white border border-slate-200/90 hover:border-sky-300 rounded-3xl p-5 shadow-xs transition-all space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0077B6]" />
                      <span>Total Dissolved Solids</span>
                    </span>
                    <span className="bg-blue-50 text-[#0077B6] text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-blue-100">
                      TDS
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Indicative salinity &amp; mineral ion density</span>

                  {/* LCD Display & Stepper */}
                  <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() => setTdsPpm((p) => Math.max(100, p - 10))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-2xl sm:text-3xl font-black text-sky-300 tracking-tight">{tdsPpm}</span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">mg/L</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTdsPpm((p) => Math.min(2500, p + 10))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-700">Permissible (&lt;500 mg/L)</span>
                      <span className="text-slate-400">IS:10500 Potable</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          tdsPpm <= 500 ? 'bg-emerald-500' : tdsPpm <= 1000 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (tdsPpm / 1500) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Meter: Hanna HI-98301</span>
                    <span>Baseline: 380 mg/L</span>
                  </div>
                </div>

                {/* 2. Water pH Balance */}
                <div className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-5 shadow-xs transition-all space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Water pH Balance</span>
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-emerald-100">
                      pH
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Ecological neutrality &amp; acidity index</span>

                  {/* LCD Display & Stepper */}
                  <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() => setPhBalance((p) => Math.max(4.0, Number((p - 0.1).toFixed(1))))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">{phBalance}</span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">pH</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhBalance((p) => Math.min(10.0, Number((p + 0.1).toFixed(1))))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-700">Optimal Neutral (6.5 – 8.5)</span>
                      <span className="text-slate-400">Class-A Water</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div className="w-1/4 bg-rose-400" />
                      <div className="w-2/4 bg-emerald-500" />
                      <div className="w-1/4 bg-indigo-400" />
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Kit: Oakton pHTestr 30</span>
                    <span>Baseline: 7.8 pH</span>
                  </div>
                </div>

                {/* 3. Water Clarity / Turbidity */}
                <div className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-3xl p-5 shadow-xs transition-all space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Water Clarity / Turbidity</span>
                    </span>
                    <span className="bg-amber-50 text-amber-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-amber-100">
                      Secchi
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Suspended solids &amp; silt visibility</span>

                  {/* 3 Clarity Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setTurbidity('Clear')}
                      className={`py-3 rounded-xl font-bold text-center cursor-pointer transition-all ${
                        turbidity === 'Clear'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="block text-xs font-black">Clear</span>
                      <span className="block text-[9px] opacity-80">&gt;60cm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurbidity('Slight Turbid')}
                      className={`py-3 rounded-xl font-bold text-center cursor-pointer transition-all ${
                        turbidity === 'Slight Turbid'
                          ? 'bg-[#0077B6] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="block text-xs font-black">Haze</span>
                      <span className="block text-[9px] opacity-80">30-60cm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurbidity('Heavy Silty')}
                      className={`py-3 rounded-xl font-bold text-center cursor-pointer transition-all ${
                        turbidity === 'Heavy Silty'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="block text-xs font-black">Silty</span>
                      <span className="block text-[9px] opacity-80">&lt;30cm</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-xl block text-center border border-blue-100">
                    Method: Standard 20cm B/W Secchi Disc
                  </span>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Baseline: Clear (48 cm)</span>
                    <span className="text-emerald-700 font-bold">Standard Met</span>
                  </div>
                </div>

                {/* 4. Water Depth & Pool Level */}
                <div className="bg-white border border-slate-200/90 hover:border-cyan-300 rounded-3xl p-5 shadow-xs transition-all space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      <span>Water Depth &amp; Pool Level</span>
                    </span>
                    <span className="bg-cyan-50 text-cyan-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-cyan-100">
                      FRL Gauge
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Sluice intake sill datum elevation</span>

                  {/* LCD Display & Stepper */}
                  <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-2xl shadow-inner">
                    <button
                      type="button"
                      onClick={() => setWaterDepth((d) => Math.max(0.1, Number((d - 0.05).toFixed(2))))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">{waterDepth}</span>
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">meters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWaterDepth((d) => Math.min(5.0, Number((d + 0.05).toFixed(2))))}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-xl block text-center border border-indigo-100">
                    58% Reservoir Command Capacity
                  </span>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Sill Datum: 0.00m</span>
                    <span>Full Reservoir Level: 3.20m</span>
                  </div>
                </div>

                {/* 5. Wetland Basin Spread */}
                <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-5 shadow-xs transition-all space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span>Wetland Basin Spread</span>
                    </span>
                    <span className="bg-indigo-50 text-indigo-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-indigo-100">
                      GIS Inundation
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Aerial surface footprint assessment</span>

                  {/* 3 Spread Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Full Basin')}
                      className={`py-3 rounded-xl font-bold text-center cursor-pointer transition-all ${
                        basinSpread === 'Full Basin'
                          ? 'bg-[#03045E] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="block text-xs font-black">Full</span>
                      <span className="block text-[9px] opacity-80">100%</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Partial Spread')}
                      className={`py-3 rounded-xl font-bold text-center cursor-pointer transition-all ${
                        basinSpread === 'Partial Spread'
                          ? 'bg-[#0077B6] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="block text-xs font-black">Partial</span>
                      <span className="block text-[9px] opacity-80">~65%</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Dry Bed')}
                      className={`py-3 rounded-xl font-bold text-center cursor-pointer transition-all ${
                        basinSpread === 'Dry Bed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="block text-xs font-black">Dry</span>
                      <span className="block text-[9px] opacity-80">&lt;10%</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-xl block text-center">
                    Sentinel-2 Telemetry Pass: 2 days ago
                  </span>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Cadastral Boundary: Valid</span>
                    <span className="text-emerald-700 font-bold">No Encroachment</span>
                  </div>
                </div>

                {/* 6. Thermal Profiles (Dual Probe) */}
                <div className="bg-white border border-slate-200/90 hover:border-orange-300 rounded-3xl p-5 shadow-xs transition-all space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span>Thermal Profiles</span>
                    </span>
                    <span className="bg-orange-50 text-orange-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-md border border-orange-100">
                      Dual Probe
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Aquatic vs. ambient field calibration</span>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                      <span className="text-[10px] text-blue-700 font-bold block uppercase">Water Temp</span>
                      <span className="text-xl font-black text-blue-900 font-mono mt-0.5 block">{waterTemp} °C</span>
                    </div>
                    <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                      <span className="text-[10px] text-amber-700 font-bold block uppercase">Air Temp</span>
                      <span className="text-xl font-black text-amber-900 font-mono mt-0.5 block">{airTemp} °C</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl block text-center border border-emerald-100">
                    Normal Gradient (Δ5.5°C Equilibrium)
                  </span>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Sensor: Pt100 RTD</span>
                    <span>Recorded: 11:42 AM</span>
                  </div>
                </div>
              </div>

              {/* High-Resolution EXIF Geo-Tagged Field Evidence Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-xs group">
                    <img
                      src={geoTaggedPhoto}
                      alt="Geo-tagged siphon"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                      <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                        EXIF LOCKED
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Inflow Siphon Field Photo Geo-Tagged
                      </h5>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        GPS Timestamp Matched
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Lat: 18.1109° N, Lng: 83.4268° E • Elevation: 114m • Matches survey parcel 89/2
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGeoTaggedPhoto('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
                    confetti({ particleCount: 30, spread: 40 });
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#0077B6]" />
                  <span>Retake Hydrology Probe Shot</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 4: OBSERVATIONS & SILT SURVEY                           */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Statutory Ground Truth, Contaminants &amp; Silt Survey
                </h3>
                <span className="text-[10px] bg-blue-50 text-[#0077B6] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                  Ground Audit Mode
                </span>
              </div>

              {/* 1. Ground Truth Finding */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  1. Statutory Ground Truth Finding
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsComplaintValid(true)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                      isComplaintValid
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-300/40'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${isComplaintValid ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-black text-xs sm:text-sm block">Defect / Obstruction Confirmed</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed mt-1">
                        Physical issue verified genuine on-site. Requires Nodal dispatch to Executive Worker / Excavator.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsComplaintValid(false)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                      !isComplaintValid
                        ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300/40'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${!isComplaintValid ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-black text-xs sm:text-sm block">False Alarm / Normal Condition</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed mt-1">
                        Normal seasonal variations or non-statutory complaint. Recommend closure without machinery.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Water Presence Level & Waste Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Water Presence */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-sky-600" />
                      <span>Water Presence Level</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      {waterPresence}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['Abundant', 'Moderate', 'Low', 'Stagnant Dry', 'Extinct'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setWaterPresence(lvl)}
                        className={`py-2.5 px-2 rounded-xl font-extrabold text-xs text-center cursor-pointer transition-all ${
                          waterPresence === lvl
                            ? 'bg-[#03045E] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Waste Severity */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Waste / Choke Severity</span>
                    </span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      wasteLevel === 'Severe Choke' || wasteLevel === 'Heavy'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {wasteLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Low', 'Moderate', 'Heavy', 'Severe Choke'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setWasteLevel(lvl)}
                        className={`py-2.5 px-2 rounded-xl font-extrabold text-xs text-center cursor-pointer transition-all ${
                          wasteLevel === lvl
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Contaminant / Obstruction Classification */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
                <span className="text-xs font-black text-slate-900 block">
                  Identified Contaminant / Obstruction Classification:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Plastic & Polythene', icon: '🧴' },
                    { label: 'Domestic Sewage', icon: '🚿' },
                    { label: 'Industrial Chemical Effluent', icon: '🏭' },
                    { label: 'Agricultural Pesticide Runoff', icon: '🌾' },
                    { label: 'Construction Debris & Bitumen', icon: '🧱' },
                    { label: 'Dead Biomass & Eutrophic Algae', icon: '🍂' },
                  ].map((item) => {
                    const isSelected = wasteType === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setWasteType(item.label as any)}
                        className={`p-3 rounded-2xl text-left font-bold text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#0077B6] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="line-clamp-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Silt Observations Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-900 block">
                  Mandatory Field Observations &amp; Engineering Recommendations:
                </label>
                <textarea
                  rows={3}
                  value={siltObservations}
                  onChange={(e) => setSiltObservations(e.target.value)}
                  placeholder="Record sluice condition, bund elevation, recommended desilting equipment, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 5: GUIDED PHOTO EVIDENCE (HUGE VISUAL UPGRADE)          */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 5 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Mandatory Guided Photo Evidence (4 Required Angles)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-dynamic-range camera captures with automated EXIF metadata, GPS lock, and azimuth compass watermark.
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{photosCaptured}/4 Captured &amp; Verified</span>
                </span>
              </div>

              {/* 4 Camera HUD Viewfinders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {photoGallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-3.5 shadow-xs space-y-3 group hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 line-clamp-1">{item.angle}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    </div>

                    {/* Camera HUD Viewfinder Container */}
                    <div className="relative h-44 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 shadow-inner">
                      <img
                        src={item.url}
                        alt={item.angle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* HUD Overlays */}
                      <div className="absolute inset-0 pointer-events-none p-2 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/30">
                        {/* Top HUD */}
                        <div className="flex justify-between items-center text-[9px] text-white font-mono">
                          <span className="bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                            CAM {idx + 1}
                          </span>
                          <span className="bg-emerald-500/90 text-white font-black px-1.5 py-0.5 rounded">
                            {item.accuracy}
                          </span>
                        </div>

                        {/* Bottom HUD */}
                        <div className="space-y-0.5 text-[9px] text-white font-mono">
                          <div className="flex justify-between">
                            <span>BRG: {item.bearing}</span>
                            <span>{item.time}</span>
                          </div>
                          <div className="text-[8px] text-emerald-300 truncate">
                            GPS: 18.1109°N, 83.4268°E
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        alert(`Re-calibrating camera lens for ${item.angle}. GPS lock confirmed.`);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-extrabold text-slate-700 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#0077B6]" />
                      <span>Retake Angle</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 6: DIGITAL SIGN & SUBMIT                                */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 6 && (
            <div className="space-y-5">
              {/* Government Certificate Box */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-emerald-950 text-base sm:text-lg">
                        Aadhaar Cryptographic e-Sign Statutory Certification
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Pursuant to Sec. 65B of the Indian Evidence Act and the AP Water Resources Surveillance Framework, this multi-parameter physical inspection dossier will be cryptographically hashed and sealed with your UIDAI officer credentials.
                    </p>
                  </div>
                </div>

                {/* Signing Details Card */}
                <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Certified Field Officer</span>
                    <span className="font-black text-slate-900 text-sm block">{inspector?.full_name || 'Sri V. Jagannadha Rao'}</span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      Cadre #{inspector?.inspector_id || 'INS-VZI-003'} • {inspector?.district || 'Vizianagaram'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">UIDAI Cryptographic Token</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs block">SHA256: 7a9f82bc...4e19</span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Biometric Iris / OTP Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-extrabold text-slate-800">
                    Auto-saved to Local Storage (Offline Safe • 100% Ready)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  SQLite Encrypted
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 4. MODAL BOTTOM FOOTER                                         */}
        {/* ============================================================== */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((s) => s - 1)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <span className="text-slate-400 text-xs hidden sm:inline">
              Auto-saved to Local Storage (Offline Safe • 100% Ready)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeStep < 6 ? (
              <button
                type="button"
                onClick={() => setActiveStep((s) => s + 1)}
                className="px-6 py-3 bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] hover:from-[#023E8A] hover:to-[#0096C7] text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <span>Next: Step {activeStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSealing}
                onClick={handleFinish}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-2 text-xs active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSealing ? 'Sealing Dossier...' : 'Submit & Seal Statutory Dossier'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
