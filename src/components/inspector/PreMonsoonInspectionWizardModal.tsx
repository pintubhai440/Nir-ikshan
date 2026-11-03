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
  ArrowRight
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

  const [activeStep, setActiveStep] = useState<number>(3); // Default to Step 3 Hydrology as highlighted in reference

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
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'
  );

  // Step 4 Observations
  const [siltObservations, setSiltObservations] = useState(
    'Silt accumulation observed across 180m length of feeder canal. Apron retaining wall intact, but left sluice gate requires hydraulic desilting before monsoon crest.'
  );

  // Step 5 Guided Photos
  const [photosCaptured, setPhotosCaptured] = useState<number>(2);

  // Step 6 Digital Sign
  const [aadhaarVerified, setAadhaarVerified] = useState<boolean>(true);
  const [eSignPin, setESignPin] = useState<string>('••••');

  const taskName = 'name' in task ? task.name : task.locationLandmark;
  const assetCode = 'assetCode' in task ? task.assetCode : `AP-VZM-LIVE-${task.id}`;
  const cadastralParcel = 'cadastralParcel' in task ? task.cadastralParcel : 'R.S. No. 89/2 (Bobbili)';
  const authority = 'Minor Irrigation Circle';

  const handleFinish = () => {
    const report: InspectorReport = {
      id: `INS-REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      inspectorName: inspector?.full_name || 'Smt. Pooja Reddy',
      inspectorPhone: inspector?.phone || '+91 98480 33419',
      inspectedAt: new Date().toISOString(),
      gpsCoordinates: 'coordinates' in task ? task.coordinates : { lat: 18.5721, lng: 83.3644 },
      waterPresence: 'Moderate',
      wasteLevel: 'Heavy',
      wasteType: 'Plastic & Polythene',
      sourcePinDescription: `Inflow weir at ${taskName}`,
      tdsReadingPpm: tdsPpm,
      sitePhotoUrl: geoTaggedPhoto,
      isComplaintValid: true,
      validationRemarks: `Pre-Monsoon Statutory Inspection completed: TDS ${tdsPpm} ppm, pH ${phBalance}, Depth ${waterDepth}m. ${siltObservations}`,
    };

    onSubmitInspection(report);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-[#03045E] text-white p-4 sm:p-5 flex items-start justify-between border-b border-blue-900">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono tracking-wider text-sky-200 uppercase font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                STATUTORY PROTOCOL AP-INSP-2024
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-300/30">
                Outdoor Sunlight Mode (AAA)
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white">
              Pre-Monsoon Statutory Inspection — Step {activeStep} of 6:{' '}
              {activeStep === 1 && 'Asset & GPS Geo-fence'}
              {activeStep === 2 && 'Physical Condition Snapshot'}
              {activeStep === 3 && 'Hydrology Readings'}
              {activeStep === 4 && 'Observations & Silt Survey'}
              {activeStep === 5 && 'Guided Photo Evidence'}
              {activeStep === 6 && 'Aadhaar Digital Sign & Vault Commit'}
            </h2>

            <div className="flex items-center gap-2 mt-1 text-xs text-sky-200">
              <span className="font-semibold text-white">{taskName}</span>
              <span>•</span>
              <span className="font-mono">{assetCode}</span>
              <span>•</span>
              <span>{cadastralParcel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cadastral Geo-fence Verified</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 6-Step Stepper Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] gap-2 text-xs">
            {[
              { num: 1, label: 'Asset & GPS', status: 'Completed' },
              { num: 2, label: 'Conditions', status: '5 Flags Logged' },
              { num: 3, label: 'Hydrology', status: 'Active Input' },
              { num: 4, label: 'Observations', status: 'Silt/Bund Survey' },
              { num: 5, label: 'Guided Photos', status: `${photosCaptured}/4 Captured` },
              { num: 6, label: 'Submit', status: 'Digital Sign' },
            ].map((step) => {
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#03045E] text-white shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isActive
                        ? 'bg-white text-[#03045E]'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : step.num}
                  </span>
                  <div>
                    <span className="font-bold block text-[11px] leading-tight">{step.label}</span>
                    <span className={`text-[9px] block ${isActive ? 'text-sky-200' : 'text-slate-400'}`}>
                      {step.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* STEP 1: Asset & GPS */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950 text-sm block">
                      RTK Sub-Meter GNSS Position Locked
                    </span>
                    <span className="text-emerald-800 text-xs">
                      Lat: 18.5721° N, Lng: 83.3644° E • Elevation: 114m • Accuracy: ±1.8m
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  Inside Perimeter
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Asset Name</span>
                  <span className="font-bold text-slate-800 text-sm">{taskName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Cadastral Survey Parcel</span>
                  <span className="font-bold text-slate-800 text-sm">{cadastralParcel}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Controlling Circle</span>
                  <span className="font-bold text-slate-800 text-sm">{authority}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Cadastral Proximity</span>
                  <span className="font-bold text-slate-800 text-sm">14m from Sluice Centroid</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Physical Condition Snapshot */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Step 2: Physical Structural Condition Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-slate-500 font-semibold text-[10px] uppercase block">
                    Gate Operability
                  </label>
                  <select
                    value={gateOperability}
                    onChange={(e) => setGateOperability(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Functional">Functional (Smooth)</option>
                    <option value="Non-Functional">Non-Functional (Frozen)</option>
                    <option value="Partial Jam">Partial Jam (Spindle Stripped)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-slate-500 font-semibold text-[10px] uppercase block">
                    Feeder Canal Obstruction
                  </label>
                  <select
                    value={obstruction}
                    onChange={(e) => setObstruction(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Clear">Clear (Free Flow)</option>
                    <option value="Siphon Blocked">Siphon Blocked</option>
                    <option value="Trash Choke">Heavy Trash Choke</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-slate-500 font-semibold text-[10px] uppercase block">
                    Apron Silt Deposit
                  </label>
                  <select
                    value={apronSilt}
                    onChange={(e) => setApronSilt(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Clean">Clean (&lt;0.1m)</option>
                    <option value="0.8m Critical Silt">0.8m Critical Silt</option>
                    <option value="Moderate Deposit">Moderate Deposit (0.3m)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-slate-500 font-semibold text-[10px] uppercase block">
                    Masonry Structural
                  </label>
                  <select
                    value={masonryStructural}
                    onChange={(e) => setMasonryStructural(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Sound / Intact">Sound / Intact</option>
                    <option value="Minor Hairline Cracks">Minor Hairline Cracks</option>
                    <option value="Structural Breach">Structural Breach</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="text-slate-500 font-semibold text-[10px] uppercase block">
                    Approach Bund
                  </label>
                  <select
                    value={approachBund}
                    onChange={(e) => setApproachBund(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Accessible">Accessible (Walkable)</option>
                    <option value="Breached">Breached (Eroded)</option>
                    <option value="Flooded">Flooded Submerged</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Hydrology Readings (Core Highlight from Screenshot) */}
          {activeStep === 3 && (
            <div className="space-y-4">
              {/* Step 2 Physical Snapshot Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0077B6]" />
                    <span>Step 2 Summary • Physical Condition Snapshot</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    Action Required at Sluice
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Gate Operability</span>
                    <span className="font-bold text-rose-600">{gateOperability}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Obstruction</span>
                    <span className="font-bold text-amber-700">{obstruction}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Apron Silt Deposit</span>
                    <span className="font-bold text-rose-600">{apronSilt}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Masonry Structural</span>
                    <span className="font-bold text-emerald-700">{masonryStructural}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block uppercase">Approach Bund</span>
                    <span className="font-bold text-slate-700">{approachBund}</span>
                  </div>
                </div>
              </div>

              {/* Indicative Field Sensor Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-blue-50 text-[#0077B6]">
                      <Activity className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Indicative Field Sensor &amp; Kit Readings
                    </h4>
                    <span className="bg-blue-100 text-[#0077B6] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      AP-WQ-2024 Standards
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Measurements taken with portable field kits are indicative and subject to seasonal runoff variations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={historicalStation}
                    onChange={(e) => setHistoricalStation(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none"
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
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0077B6]"></span>
                      <span>Total Dissolved Solids</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      TDS
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Indicative salinity and mineral load</span>

                  {/* Stepper */}
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setTdsPpm((p) => Math.max(100, p - 10))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <span className="text-xl font-extrabold text-slate-900 font-mono">{tdsPpm}</span>
                      <span className="text-[11px] text-slate-500 font-semibold ml-1">mg/L</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTdsPpm((p) => Math.min(2500, p + 10))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block text-center">
                    Permissible (&lt;500 mg/L)
                  </span>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Meter: Hanna HI-98301</span>
                    <span>Baseline: 380 mg/L</span>
                  </div>
                </div>

                {/* 2. Water pH Balance */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Water pH Balance</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      pH
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Ecological neutrality index</span>

                  {/* Stepper */}
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPhBalance((p) => Math.max(4.0, Number((p - 0.1).toFixed(1))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <span className="text-xl font-extrabold text-slate-900 font-mono">{phBalance}</span>
                      <span className="text-[11px] text-slate-500 font-semibold ml-1">pH</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhBalance((p) => Math.min(10.0, Number((p + 0.1).toFixed(1))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block text-center">
                    Optimal Neutral (6.5 – 8.5)
                  </span>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Instrument: Oakton pHTestr 30</span>
                    <span>Baseline: 7.8 pH</span>
                  </div>
                </div>

                {/* 3. Water Clarity / Turbidity */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Water Clarity / Turbidity</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      Secchi
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Suspended solids &amp; silt visibility</span>

                  {/* Buttons Selector */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setTurbidity('Clear')}
                      className={`p-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                        turbidity === 'Clear'
                          ? 'bg-[#03045E] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Clear &gt;60cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurbidity('Slight Turbid')}
                      className={`p-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                        turbidity === 'Slight Turbid'
                          ? 'bg-[#0077B6] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Slight Turbid
                    </button>
                    <button
                      type="button"
                      onClick={() => setTurbidity('Heavy Silty')}
                      className={`p-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                        turbidity === 'Heavy Silty'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Heavy Silty
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded block text-center">
                    Method: Standard 20cm B/W Secchi Disc
                  </span>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Baseline: Clear (48 cm)</span>
                    <span>Status: Pass</span>
                  </div>
                </div>

                {/* 4. Water Depth & Pool Level */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                      <span>Water Depth &amp; Pool Level</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      FRL Gauge
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Sluice intake sill datum</span>

                  {/* Stepper */}
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWaterDepth((d) => Math.max(0.1, Number((d - 0.05).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <span className="text-xl font-extrabold text-slate-900 font-mono">{waterDepth}</span>
                      <span className="text-[11px] text-slate-500 font-semibold ml-1">m</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWaterDepth((d) => Math.min(5.0, Number((d + 0.05).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer text-sm"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded block text-center">
                    58% Reservoir Capacity
                  </span>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Sill Datum: 0.00m</span>
                    <span>FRL: 3.20m</span>
                  </div>
                </div>

                {/* 5. Wetland Basin Spread */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>Wetland Basin Spread</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      GIS Inundation
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Aerial surface footprint assessment</span>

                  {/* Buttons Selector */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Full Basin')}
                      className={`p-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                        basinSpread === 'Full Basin'
                          ? 'bg-[#03045E] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Full 100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Partial Spread')}
                      className={`p-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                        basinSpread === 'Partial Spread'
                          ? 'bg-[#0077B6] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Partial ~65%
                    </button>
                    <button
                      type="button"
                      onClick={() => setBasinSpread('Dry Bed')}
                      className={`p-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
                        basinSpread === 'Dry Bed'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Dry &lt;10%
                    </button>
                  </div>

                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block text-center">
                    Satellite Sync: Sentinel-2 (Pass: 2 days ago)
                  </span>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Cadastral Boundary: Valid</span>
                    <span>No encroachment</span>
                  </div>
                </div>

                {/* 6. Thermal Profiles (Dual Probe) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span>Thermal Profiles</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      Dual Probe
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Aquatic vs. ambient field calibration</span>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">Water Temp</span>
                      <span className="text-base font-extrabold text-blue-700 font-mono">{waterTemp} °C</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">Air Temp</span>
                      <span className="text-base font-extrabold text-orange-600 font-mono">{airTemp} °C</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block text-center">
                    Normal Gradient (Δ5.5°C)
                  </span>

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                    <span>Sensor: Integrated Thermistor</span>
                    <span>Recorded: 11:42 AM</span>
                  </div>
                </div>
              </div>

              {/* EXIF Geo-Tagged Field Photo Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src={geoTaggedPhoto}
                      alt="Geo-tagged siphon"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                      EXIF
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs">
                        Inflow Siphon Field Photo Geo-Tagged
                      </h5>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        EXIF Matched
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Lat: 18.5721° N, Lng: 83.3644° E • Elevation: 114m • Matches survey parcel 89/2
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Camera activated. Image re-captured with on-site GPS lock.')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Retake Hydrology Probe Shot</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Observations */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Step 4: Silt Survey &amp; Visual Observations
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Mandatory Field Observations Log:
                </label>
                <textarea
                  rows={4}
                  value={siltObservations}
                  onChange={(e) => setSiltObservations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Guided Photos */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Step 5: Mandatory Guided Photo Evidence (4 Required Angles)
                </h3>
                <span className="text-xs font-semibold text-[#0077B6]">
                  {photosCaptured}/4 Captured
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { angle: '1. Sluice Gate Shutter', status: 'Captured', photo: geoTaggedPhoto },
                  { angle: '2. Apron Silt Bed', status: 'Captured', photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
                  { angle: '3. Upstream Feeder Canal', status: 'Pending', photo: '' },
                  { angle: '4. Downstream Culvert', status: 'Pending', photo: '' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center space-y-2"
                  >
                    <span className="text-[10px] font-bold text-slate-600 block">{item.angle}</span>
                    <div className="h-24 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
                      {item.photo ? (
                        <img src={item.photo} alt={item.angle} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotosCaptured((p) => Math.min(4, p + 1))}
                      className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg cursor-pointer"
                    >
                      {item.photo ? 'Retake' : 'Capture'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Digital Sign & Submit */}
          {activeStep === 6 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-base">
                      Aadhaar Cryptographic e-Sign Statutory Certification
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Under Sec. 65B Indian Evidence Act &amp; AP Water Resources Framework, this field dossier is cryptographically hashed and sealed.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Signing Officer</span>
                    <span className="font-bold text-slate-800">Smt. Pooja Reddy (Sr. Hydrologist)</span>
                    <span className="text-[10px] text-slate-500 font-mono block">Cadre #INSP-1104</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">UIDAI Token</span>
                    <span className="font-mono font-bold text-emerald-700">SHA256:7a9f...3e01</span>
                    <span className="text-[10px] text-emerald-600 block">Biometric e-Sign Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-800">
                    Auto-saved to Local Storage (Offline Safe • 100% Ready)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">SQLite Encrypted</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Stepper Navigation Bar */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((s) => s - 1)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
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
                className="px-5 py-2.5 bg-[#03045E] hover:bg-[#0077B6] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Next: Step {activeStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit &amp; Seal Statutory Dossier</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
