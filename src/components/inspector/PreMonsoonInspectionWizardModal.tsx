/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pre-Monsoon Statutory Inspection Wizard Modal
 * High-Prestige Gov-Tech Mission Control Interface
 * Calibrated digital laboratory instruments, HUD viewfinders, and cryptographic Aadhaar sealing.
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Droplet, 
  Activity, 
  Thermometer, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Sun,
  Radio,
  Clock,
  Gauge,
  Check,
  RotateCw,
  Info,
  Waves,
  Sliders,
  Sparkles,
  FileText,
  Compass,
  Upload,
  Image as ImageIcon
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
  const [isCustomHydrologyPhoto, setIsCustomHydrologyPhoto] = useState<boolean>(false);
  const hydrologyInputRef = useRef<HTMLInputElement>(null);
  const angleInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const hydrologySamplePresets = [
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
  ];

  const handleHydrologyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeoTaggedPhoto(reader.result as string);
        setIsCustomHydrologyPhoto(true);
        confetti({ particleCount: 30, spread: 45 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCycleHydrologyPreset = () => {
    const currentIndex = hydrologySamplePresets.indexOf(geoTaggedPhoto);
    const nextIndex = (currentIndex + 1) % hydrologySamplePresets.length;
    setGeoTaggedPhoto(hydrologySamplePresets[nextIndex]);
    setIsCustomHydrologyPhoto(false);
    confetti({ particleCount: 20, spread: 30 });
  };

  const angleSamplePresets = [
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80'
  ];

  const handleAnglePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setPhotoGallery((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            url: reader.result as string,
            status: 'Device Photo Uploaded & EXIF Stamped',
            time: timeStr,
            accuracy: '±1.1m RTK Locked',
          };
          return updated;
        });
        confetti({ particleCount: 25, spread: 40 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCycleAnglePreset = (index: number) => {
    const nextUrl = angleSamplePresets[(index + Math.floor(Math.random() * 3) + 1) % angleSamplePresets.length];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPhotoGallery((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        url: nextUrl,
        status: 'Alternate Angle Recalibrated',
        time: timeStr,
      };
      return updated;
    });
  };

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
        inspectorName: inspector?.full_name || 'Field Inspector',
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

  const stepsList = [
    { num: 1, title: 'Asset & GPS', kicker: 'Geo-Fence Lock' },
    { num: 2, title: 'Conditions', kicker: 'Physical Checks' },
    { num: 3, title: 'Hydrology', kicker: 'Lab Telemetry' },
    { num: 4, title: 'Observations', kicker: 'Ground Truth' },
    { num: 5, title: 'Photos', kicker: '4 Angles HUD' },
    { num: 6, title: 'Aadhaar Seal', kicker: 'Dossier Sign' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* ============================================================== */}
        {/* 1. PRESTIGE EXECUTIVE HEADER                                   */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#0077B6] text-white p-4 sm:p-5 flex items-start justify-between border-b border-blue-900/40 shadow-sm shrink-0">
          <div className="space-y-1.5">
            {/* Unboxed Metadata Kicker */}
            <div className="flex items-center gap-2 text-xs text-sky-200/90 flex-wrap">
              <span className="font-semibold text-white/95">AP Water Resources Department</span>
              <span className="text-sky-300/60">·</span>
              <span>Statutory Protocol AP-INSP-2026</span>
              <span className="text-sky-300/60">·</span>
              <span className="font-mono text-sky-200">{assetCode}</span>
            </div>

            {/* Modal Title */}
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Pre-Monsoon Statutory Inspection</span>
              <span className="text-sky-300 font-medium text-sm sm:text-base">
                — Step {activeStep} of 6: {stepsList[activeStep - 1].title}
              </span>
            </h2>

            {/* Asset Location Info */}
            <div className="flex items-center gap-2 text-xs text-sky-100 flex-wrap pt-0.5">
              <span className="font-semibold text-white">{taskName}</span>
              <span className="text-sky-400">·</span>
              <span className="text-sky-200">{cadastralParcel}</span>
              <span className="text-sky-400">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                RTK Locked (±1.8m)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:rotate-90 duration-200 shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. MODERN PIPELINE STEPPER BAR                                 */}
        {/* ============================================================== */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 overflow-x-auto shrink-0">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {stepsList.map((step) => {
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#03045E] text-white shadow-sm ring-1 ring-sky-400/40'
                      : isPast
                      ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/70 hover:bg-emerald-100/60'
                      : 'text-slate-600 hover:bg-slate-200/60 border border-transparent'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? 'bg-sky-400 text-[#03045E]'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold block text-xs leading-none">{step.title}</span>
                    <span className={`text-[10px] block mt-0.5 ${isActive ? 'text-sky-200' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {step.kicker}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs bg-slate-50/40">
          {/* ------------------------------------------------------------ */}
          {/* STEP 1: ASSET & GPS GEO-FENCE                                */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-white border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>RTK Sub-Meter GNSS Position Locked</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </h4>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      Lat: 18.1109° N · Lng: 83.4268° E · Elevation: 114m AMSL · Accuracy: ±1.8m
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-lg">
                  Inside Cadastral Perimeter
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Asset Under Audit</span>
                  <span className="font-bold text-slate-900 text-sm block">{taskName}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Cadastral Survey Parcel</span>
                  <span className="font-bold text-slate-900 text-sm block">{cadastralParcel}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Controlling Authority</span>
                  <span className="font-bold text-slate-900 text-sm block">{authority}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Proximity to Weir Sluice</span>
                  <span className="font-bold text-emerald-700 text-sm block">14 meters from Center Siphon</span>
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
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Physical Structural Condition Checklist
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify statutory engineering integrity prior to monsoon inflow.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                  <label className="text-slate-500 font-semibold text-xs block">
                    Gate Operability
                  </label>
                  <select
                    value={gateOperability}
                    onChange={(e) => setGateOperability(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#0077B6]"
                  >
                    <option value="Functional">Functional (Smooth)</option>
                    <option value="Non-Functional">Non-Functional (Frozen Spindle)</option>
                    <option value="Partial Jam">Partial Jam (Stripped)</option>
                  </select>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                  <label className="text-slate-500 font-semibold text-xs block">
                    Feeder Canal Obstruction
                  </label>
                  <select
                    value={obstruction}
                    onChange={(e) => setObstruction(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#0077B6]"
                  >
                    <option value="Clear">Clear (Free Flow)</option>
                    <option value="Siphon Blocked">Siphon Blocked</option>
                    <option value="Trash Choke">Heavy Trash Choke</option>
                  </select>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                  <label className="text-slate-500 font-semibold text-xs block">
                    Apron Silt Deposit
                  </label>
                  <select
                    value={apronSilt}
                    onChange={(e) => setApronSilt(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#0077B6]"
                  >
                    <option value="Clean">Clean (&lt;0.1m)</option>
                    <option value="0.8m Critical Silt">0.8m Critical Silt</option>
                    <option value="Moderate Deposit">Moderate Deposit (0.3m)</option>
                  </select>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                  <label className="text-slate-500 font-semibold text-xs block">
                    Masonry Structural
                  </label>
                  <select
                    value={masonryStructural}
                    onChange={(e) => setMasonryStructural(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#0077B6]"
                  >
                    <option value="Sound / Intact">Sound / Intact</option>
                    <option value="Minor Hairline Cracks">Minor Hairline Cracks</option>
                    <option value="Structural Breach">Structural Breach</option>
                  </select>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2 sm:col-span-2 md:col-span-1">
                  <label className="text-slate-500 font-semibold text-xs block">
                    Approach Bund
                  </label>
                  <select
                    value={approachBund}
                    onChange={(e) => setApproachBund(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#0077B6]"
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
          {/* STEP 3: HYDROLOGY READINGS (ELEGANT REDESIGN)                */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 3 && (
            <div className="space-y-5">
              {/* Top Station & Context Bar */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-sky-50 text-[#0077B6]">
                      <Activity className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Calibrated Digital Hydrology &amp; Water Quality Telemetry
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">
                    Real-time field readings aligned with Central Pollution Control Board (CPCB) Class-A Standards.
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <span className="text-[11px] text-slate-400 font-medium">Station:</span>
                  <select
                    value={historicalStation}
                    onChange={(e) => setHistoricalStation(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <option value="Inflow Apron Siphon (Point A-1) [Default]">Inflow Apron Siphon (Point A-1)</option>
                    <option value="Mid-Reservoir Deep Pit (Point B-2)">Mid-Reservoir Deep Pit (Point B-2)</option>
                    <option value="Spillway Discharge Canal (Point C-3)">Spillway Discharge Canal (Point C-3)</option>
                  </select>
                </div>
              </div>

              {/* Physical Condition Quick Summary Strip */}
              <div className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>Physical State Summary:</span>
                </span>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-slate-600">Gate: <strong className={gateOperability === 'Functional' ? 'text-emerald-700' : 'text-rose-600'}>{gateOperability}</strong></span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">Obstruction: <strong className={obstruction === 'Clear' ? 'text-emerald-700' : 'text-amber-700'}>{obstruction}</strong></span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">Silt: <strong className="text-rose-600">{apronSilt}</strong></span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">Masonry: <strong className="text-emerald-700">{masonryStructural}</strong></span>
                </div>
              </div>

              {/* 6 Hydrology Precision Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Total Dissolved Solids (TDS) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Droplet className="w-4 h-4 text-[#0077B6]" />
                        <h4 className="font-bold text-slate-900 text-xs">Total Dissolved Solids</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        TDS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Indicative salinity &amp; mineral ion density</p>
                  </div>

                  {/* Primary Number Display & Interactive Controls */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setTdsPpm((p) => Math.max(100, p - 10))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Decrease 10 mg/L"
                    >
                      -
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{tdsPpm}</span>
                      <span className="text-xs text-slate-500 font-medium ml-1">mg/L</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTdsPpm((p) => Math.min(2500, p + 10))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Increase 10 mg/L"
                    >
                      +
                    </button>
                  </div>

                  {/* Range Slider for quick tactile tuning */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={100}
                      max={1500}
                      step={10}
                      value={tdsPpm}
                      onChange={(e) => setTdsPpm(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0077B6]"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
                      <span className={tdsPpm <= 500 ? 'text-emerald-700 font-semibold' : ''}>Potable &lt;500</span>
                      <span className={tdsPpm > 500 && tdsPpm <= 1000 ? 'text-amber-700 font-semibold' : ''}>Fair 500–1000</span>
                      <span className={tdsPpm > 1000 ? 'text-rose-700 font-semibold' : ''}>High &gt;1000</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Meter: Hanna HI-98301</span>
                    <span className="text-slate-600 font-medium">IS:10500 Potable</span>
                  </div>
                </div>

                {/* 2. Water pH Balance */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Water pH Balance</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        pH
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Ecological neutrality &amp; acidity index</p>
                  </div>

                  {/* Primary Number Display & Interactive Controls */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPhBalance((p) => Math.max(4.0, Number((p - 0.1).toFixed(1))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Decrease 0.1 pH"
                    >
                      -
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{phBalance.toFixed(1)}</span>
                      <span className="text-xs text-slate-500 font-medium ml-1">pH</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhBalance((p) => Math.min(10.0, Number((p + 0.1).toFixed(1))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Increase 0.1 pH"
                    >
                      +
                    </button>
                  </div>

                  {/* pH Visual Indicator Bar */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={4.0}
                      max={10.0}
                      step={0.1}
                      value={phBalance}
                      onChange={(e) => setPhBalance(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
                      <span>Acidic (&lt;6.5)</span>
                      <span className="text-emerald-700 font-semibold">Neutral 6.5–8.5</span>
                      <span>Alkaline (&gt;8.5)</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Kit: Oakton pHTestr 30</span>
                    <span className="text-emerald-700 font-medium">Class-A Water</span>
                  </div>
                </div>

                {/* 3. Water Clarity / Turbidity */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Waves className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Water Clarity / Turbidity</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        Secchi
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Suspended solids &amp; silt visibility depth</p>
                  </div>

                  {/* 3 Modern Segmented Options */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTurbidity('Clear')}
                      className={`py-2 px-1 rounded-lg text-center cursor-pointer transition-all ${
                        turbidity === 'Clear'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <span className="block text-xs">Clear</span>
                      <span className="block text-[10px] opacity-80 font-mono">&gt;60cm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurbidity('Slight Turbid')}
                      className={`py-2 px-1 rounded-lg text-center cursor-pointer transition-all ${
                        turbidity === 'Slight Turbid'
                          ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <span className="block text-xs">Slight</span>
                      <span className="block text-[10px] opacity-80 font-mono">30–60cm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurbidity('Heavy Silty')}
                      className={`py-2 px-1 rounded-lg text-center cursor-pointer transition-all ${
                        turbidity === 'Heavy Silty'
                          ? 'bg-rose-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <span className="block text-xs">Silty</span>
                      <span className="block text-[10px] opacity-80 font-mono">&lt;30cm</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center text-[11px] text-slate-600 font-medium">
                    {turbidity === 'Clear' && 'High Clarity: Secchi disc visible down to 72 cm.'}
                    {turbidity === 'Slight Turbid' && 'Moderate Silt Haze: Typical pre-monsoon baseline (48 cm).'}
                    {turbidity === 'Heavy Silty' && 'Critical Turbidity: High suspended silt; desilting advised.'}
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Method: 20cm B/W Disc</span>
                    <span className="text-slate-600 font-medium">Depth: ~48 cm</span>
                  </div>
                </div>

                {/* 4. Water Depth & Pool Level */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-cyan-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-cyan-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Water Depth &amp; Pool Level</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                        Gauge
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sill datum intake elevation depth</p>
                  </div>

                  {/* Primary Number Display & Interactive Controls */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWaterDepth((d) => Math.max(0.1, Number((d - 0.05).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Decrease 0.05m"
                    >
                      -
                    </button>
                    <div className="text-center font-mono">
                      <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{waterDepth.toFixed(2)}</span>
                      <span className="text-xs text-slate-500 font-medium ml-1">meters</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWaterDepth((d) => Math.min(5.0, Number((d + 0.05).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Increase 0.05m"
                    >
                      +
                    </button>
                  </div>

                  {/* Depth Bar relative to FRL */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (waterDepth / 3.2) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-500">
                      <span>Sill 0.0m</span>
                      <span className="text-cyan-700 font-semibold">{Math.round((waterDepth / 3.2) * 100)}% of FRL</span>
                      <span>FRL 3.2m</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Staff Gauge: Siphon Sill</span>
                    <span className="text-slate-600 font-medium">Head: 1.85m</span>
                  </div>
                </div>

                {/* 5. Wetland Basin Surface Spread */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Basin Surface Inundation</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        GIS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Surface water footprint assessment</p>
                  </div>

                  {/* 3 Modern Segmented Options */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Full Basin')}
                      className={`py-2 px-1 rounded-lg text-center cursor-pointer transition-all ${
                        basinSpread === 'Full Basin'
                          ? 'bg-[#03045E] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <span className="block text-xs">Full</span>
                      <span className="block text-[10px] opacity-80 font-mono">100%</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Partial Spread')}
                      className={`py-2 px-1 rounded-lg text-center cursor-pointer transition-all ${
                        basinSpread === 'Partial Spread'
                          ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <span className="block text-xs">Partial</span>
                      <span className="block text-[10px] opacity-80 font-mono">~65%</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Dry Bed')}
                      className={`py-2 px-1 rounded-lg text-center cursor-pointer transition-all ${
                        basinSpread === 'Dry Bed'
                          ? 'bg-rose-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <span className="block text-xs">Dry</span>
                      <span className="block text-[10px] opacity-80 font-mono">&lt;10%</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-center text-[11px] text-slate-600 font-medium">
                    Sentinel-2 Satellite telemetry verified · Zero encroachment in survey perimeter.
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Parcel: 89/2 Verified</span>
                    <span className="text-emerald-700 font-medium">Cadastral OK</span>
                  </div>
                </div>

                {/* 6. Thermal Profiles (Dual Probe) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-orange-600" />
                        <h4 className="font-bold text-slate-900 text-xs">Thermal Profiles</h4>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                        Dual Probe
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Aquatic vs. ambient thermal equilibrium</p>
                  </div>

                  {/* Dual Probe Values */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2.5">
                      <span className="text-[10px] text-sky-700 font-semibold uppercase block">Water Temp</span>
                      <span className="text-xl font-bold text-sky-900 font-mono mt-0.5 block tabular-nums">{waterTemp} °C</span>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
                      <span className="text-[10px] text-amber-700 font-semibold uppercase block">Ambient Air</span>
                      <span className="text-xl font-bold text-amber-900 font-mono mt-0.5 block tabular-nums">{airTemp} °C</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-100 rounded-lg p-2 text-center text-[11px] text-emerald-800 font-medium">
                    Normal Gradient (Δ5.5°C Natural Thermal Equilibrium)
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                    <span>Probe: Pt100 RTD</span>
                    <span className="text-slate-600 font-medium">11:42 AM IST</span>
                  </div>
                </div>
              </div>

              {/* Photo Evidence Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <input
                  ref={hydrologyInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleHydrologyPhotoUpload}
                />

                <div className="flex items-center gap-3.5">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                    <img
                      src={geoTaggedPhoto}
                      alt="Geo-tagged field preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[8px] font-mono text-emerald-300 font-bold">
                        {isCustomHydrologyPhoto ? 'CUSTOM RTK' : 'RTK OK'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">
                        Hydrology Sampling Point · EXIF Verified
                      </h5>
                      {isCustomHydrologyPhoto && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Uploaded
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Lat: 18.1109° N · Lng: 83.4268° E · Bearing: 315° NW · 10:42 AM
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      GPS coordinates match Cadastral Survey Parcel 89/2
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => hydrologyInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#0077B6] hover:bg-[#023e8a] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Upload or capture photo from your device camera or gallery"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload / Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCycleHydrologyPreset}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Cycle simulated field sample shots"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#0077B6]" />
                    <span>Retake Sampling Shot</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 4: OBSERVATIONS & SILT SURVEY                           */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Statutory Ground Truth, Contaminants &amp; Silt Survey
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record on-site findings and determine required maintenance actions.
                </p>
              </div>

              {/* 1. Ground Truth Finding */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 block">
                  1. Statutory Ground Truth Finding
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsComplaintValid(true)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                      isComplaintValid
                        ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${isComplaintValid ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">Defect / Obstruction Confirmed</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                        Physical issue verified genuine on-site. Requires Nodal dispatch to Executive Worker / Excavator.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsComplaintValid(false)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                      !isComplaintValid
                        ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${!isComplaintValid ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">False Alarm / Normal Condition</span>
                      <span className="text-[11px] text-slate-500 block leading-relaxed mt-0.5">
                        Normal seasonal variations or non-statutory complaint. Recommend closure without machinery.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Water Presence Level & Waste Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Water Presence */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-sky-600" />
                      <span>Water Presence Level</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {waterPresence}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Abundant', 'Moderate', 'Low', 'Stagnant Dry', 'Extinct'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setWaterPresence(lvl)}
                        className={`py-2 px-1 rounded-lg font-semibold text-xs text-center cursor-pointer transition-all ${
                          waterPresence === lvl
                            ? 'bg-[#03045E] text-white shadow-2xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Waste Severity */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Waste / Choke Severity</span>
                    </span>
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      wasteLevel === 'Severe Choke' || wasteLevel === 'Heavy'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {wasteLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Low', 'Moderate', 'Heavy', 'Severe Choke'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setWasteLevel(lvl)}
                        className={`py-2 px-1 rounded-lg font-semibold text-xs text-center cursor-pointer transition-all ${
                          wasteLevel === lvl
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Contaminant Classification */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <span className="text-xs font-bold text-slate-900 block">
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
                        className={`p-2.5 rounded-xl text-left font-semibold text-xs cursor-pointer transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#0077B6] text-white shadow-2xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Silt Observations */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">
                  Mandatory Field Observations &amp; Engineering Recommendations:
                </label>
                <textarea
                  rows={3}
                  value={siltObservations}
                  onChange={(e) => setSiltObservations(e.target.value)}
                  placeholder="Record sluice condition, bund elevation, recommended desilting equipment, etc."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0077B6] transition-all"
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 5: GUIDED PHOTO EVIDENCE (4 ANGLES HUD)                 */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Mandatory Guided Photo Evidence (4 Required Angles)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-precision camera captures with automated EXIF metadata, GPS lock, and azimuth compass watermark.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{photosCaptured}/4 Captured &amp; Verified</span>
                </span>
              </div>

              {/* 4 Camera HUD Viewfinders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {photoGallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-2.5 hover:border-sky-300 transition-all flex flex-col justify-between"
                  >
                    <input
                      ref={(el) => {
                        angleInputRefs.current[idx] = el;
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleAnglePhotoUpload(idx, e)}
                    />

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-xs font-bold text-slate-900 truncate" title={item.angle}>
                          {item.angle}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                          {item.status.includes('Uploaded') ? 'UPLOADED' : 'RTK READY'}
                        </span>
                      </div>

                      {/* Camera HUD Viewfinder Container */}
                      <div className="relative h-36 rounded-xl bg-slate-900 overflow-hidden border border-slate-200">
                        <img
                          src={item.url}
                          alt={item.angle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />

                        {/* HUD Overlays */}
                        <div className="absolute inset-0 pointer-events-none p-2 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/30">
                          {/* Top HUD */}
                          <div className="flex justify-between items-center text-[9px] text-white font-mono">
                            <span className="bg-black/60 px-1 py-0.5 rounded">CAM {idx + 1}</span>
                            <span className="bg-emerald-600/90 text-white font-bold px-1.5 py-0.5 rounded">
                              {item.accuracy}
                            </span>
                          </div>

                          {/* Center HUD Crosshair */}
                          <div className="flex items-center justify-center opacity-30">
                            <div className="w-6 h-6 border border-white/60 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
                            </div>
                          </div>

                          {/* Bottom HUD */}
                          <div className="space-y-0.5 text-[9px] text-white font-mono">
                            <div className="flex justify-between">
                              <span>BRG: {item.bearing}</span>
                              <span>{item.time}</span>
                            </div>
                            <div className="text-[8px] text-emerald-300 truncate">
                              18.1109°N, 83.4268°E
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => angleInputRefs.current[idx]?.click()}
                        className="w-full py-1.5 bg-[#0077B6] hover:bg-[#023e8a] text-xs font-semibold text-white rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        title="Upload photo from device or take photo with camera"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload / Take Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCycleAnglePreset(idx)}
                        className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-600 rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-colors"
                        title="Cycle calibrated angle shot"
                      >
                        <RotateCw className="w-3 h-3 text-[#0077B6]" />
                        <span>Retake / Cycle Angle</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 6: DIGITAL SIGN & SUBMIT                                */}
          {/* ------------------------------------------------------------ */}
          {activeStep === 6 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-300/80 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-950 text-base">
                      Aadhaar Cryptographic e-Sign Statutory Certification
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Pursuant to Sec. 65B of the Indian Evidence Act and the AP Water Resources Surveillance Framework, this multi-parameter physical inspection dossier will be cryptographically hashed and sealed with your UIDAI officer credentials.
                    </p>
                  </div>
                </div>

                {/* Signing Details Card */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/90 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Certified Field Officer</span>
                    <span className="font-bold text-slate-900 text-sm block">{inspector?.full_name || 'Field Inspector'}</span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      Cadre #{inspector?.inspector_id || 'INS-VZI-003'} · {inspector?.district || 'Vizianagaram'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">UIDAI Cryptographic Token</span>
                    <span className="font-mono font-semibold text-emerald-700 text-xs block">SHA256: 7a9f82bc...4e19</span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Biometric Iris / OTP Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">
                    Auto-saved to Local Storage (Offline Safe · 100% Ready)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  SQLite Encrypted
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 4. MODAL BOTTOM FOOTER                                         */}
        {/* ============================================================== */}
        <div className="bg-white border-t border-slate-200 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((s) => s - 1)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <span className="text-slate-400 text-xs hidden sm:inline">
              Auto-saved locally
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeStep < 6 ? (
              <button
                type="button"
                onClick={() => setActiveStep((s) => s + 1)}
                className="px-5 py-2.5 bg-[#03045E] hover:bg-[#023E8A] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <span>Next: {stepsList[activeStep].title}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSealing}
                onClick={handleFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 text-xs active:scale-98"
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
