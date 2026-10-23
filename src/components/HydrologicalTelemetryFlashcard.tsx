import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  RefreshCw, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Waves,
  Building,
  Phone,
  Layers,
  FileText,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ANDHRA_PRADESH_26_DISTRICTS } from '../data/andhraDistrictsData';
import { findAPDistrictBoundary } from '../data/andhraDistrictBoundariesGeo';

export interface TelemetryFlashcardData {
  type: 'groundwater' | 'reservoir' | 'gauge' | 'rainfall' | 'district' | 'complaint' | 'bhuvan_wbis';
  id?: string;
  title: string;
  subtitle?: string;
  basin?: string;
  district: string;
  state?: string;
  lat: number;
  lng: number;
  categoryBadge?: string;
  networkBadge?: string;
  agency?: string;
  // Integrated District Profile
  districtProfile?: {
    districtName: string;
    areaSqKm: number;
    headquarter: string;
    region: string;
    onResetDistrict?: () => void;
  };
  // Weather & Wellhead / Catchment Telemetry
  weather?: {
    rainMmPerHour?: number;
    tempC?: number;
    humidityPct?: number;
    windKmPerHour?: number;
    condition?: string;
    elevationM?: number;
    inflowStatus?: string;
  };
  // Main Primary Metrics
  primaryMetricLabel: string;
  primaryMetricValue: string;
  primaryMetricSub?: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  secondaryMetricSub?: string;
  // Baseline or operating limits
  baselineLabel?: string;
  baselineValue?: string;
  // Status bottom bar
  statusText: string;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'sky';
  metricExtraRight?: string;
  // Additional details
  additionalInfo?: {
    label: string;
    value: string;
  }[];
  // Citizen complaint specific
  complaintData?: {
    id: string;
    citizenName: string;
    citizenPhone?: string;
    status: string;
    description: string;
    landmark: string;
    assignedNodal?: string;
    photoUrl?: string;
    submittedAt?: string;
    wasteType?: string;
  };
}

interface Props {
  data: TelemetryFlashcardData;
  onClose: () => void;
}

export const HydrologicalTelemetryFlashcard: React.FC<Props> = ({ data, onClose }) => {
  const { language } = useLanguage();
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);
  const [weatherTime, setWeatherTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });
  const [telemetryTime, setTelemetryTime] = useState(() => {
    const d = new Date();
    d.setSeconds(d.getSeconds() - 3);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });

  const handleRefreshWeather = () => {
    setIsRefreshingWeather(true);
    setTimeout(() => {
      setIsRefreshingWeather(false);
      setWeatherTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 600);
  };

  const handleReverify = () => {
    setIsReverifying(true);
    setTimeout(() => {
      setIsReverifying(false);
      setTelemetryTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 700);
  };

  const isComplaint = data.type === 'complaint';

  const defaultCategoryBadge = data.categoryBadge || (
    data.type === 'groundwater' ? 'CGWB National Grid' :
    data.type === 'reservoir' ? 'CWC & APWRIMS RSMS' :
    data.type === 'gauge' ? 'CWC River Telemetry' :
    data.type === 'rainfall' ? 'IMD State Rain Grid' :
    data.type === 'bhuvan_wbis' ? 'ISRO Bhuvan Satellite WBIS' :
    data.type === 'complaint' ? 'Citizen Water Grievance' :
    '26 AP District Command'
  );

  const defaultNetworkBadge = data.networkBadge || (
    isComplaint ? 'PGRS Andhra Pradesh' : 'APWRIMS HQ'
  );

  const defaultAgency = data.agency || (
    data.type === 'groundwater' ? 'Central Ground Water Board (CGWB) & State GW Dept' :
    data.type === 'reservoir' ? 'Central Water Commission (CWC) & APWRIMS' :
    data.type === 'gauge' ? 'Central Water Commission (CWC) & APWRIMS' :
    data.type === 'rainfall' ? 'India Meteorological Department (IMD) & APWRIMS' :
    data.type === 'complaint' ? 'Public Grievance Redressal System (PGRS)' :
    'Government of Andhra Pradesh Water Resources Dept'
  );

  // Authoritative fallback for District Profile if not explicitly provided
  const effectiveDistrictProfile = data.districtProfile || (() => {
    const distName = data.district || 'Y.S.R. Kadapa';
    const boundary = findAPDistrictBoundary(distName);
    const distRecord = ANDHRA_PRADESH_26_DISTRICTS.find(
      (d) => d.name.toLowerCase().includes(distName.toLowerCase()) || distName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (boundary || distRecord) {
      return {
        districtName: boundary?.name || distRecord?.name || distName,
        areaSqKm: boundary?.areaSqKm || 11228,
        headquarter: boundary?.headquarter || distRecord?.headquarter || distName,
        region: boundary?.region || distRecord?.region || 'Rayalaseema',
        onResetDistrict: undefined
      };
    }
    return {
      districtName: distName,
      areaSqKm: 11228,
      headquarter: distName,
      region: 'Rayalaseema',
      onResetDistrict: undefined
    };
  })();

  const weather = data.weather || {
    rainMmPerHour: 0.1,
    tempC: 28,
    humidityPct: 83,
    windKmPerHour: 6.4,
    condition: 'Light Drizzle 🌧️',
    elevationM: 86,
    inflowStatus: data.type === 'groundwater' ? 'Active Infiltration' : 'Active Inflow'
  };

  const statusBgDot = 
    data.statusColor === 'rose' ? 'bg-rose-500' :
    data.statusColor === 'amber' ? 'bg-amber-500' :
    data.statusColor === 'blue' || data.statusColor === 'sky' ? 'bg-[#00B4D8]' :
    'bg-emerald-500';

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-800 w-full max-w-md sm:max-w-lg space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
      
      {/* 1. Top Bar: Category Badge + Close Button */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-tight shadow-2xs border ${
          isComplaint 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : 'bg-sky-50 text-[#0077B6] border-sky-200'
        }`}>
          {isComplaint ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> : <ArrowUpRight className="w-3.5 h-3.5 text-[#0077B6]" />}
          <span>{defaultCategoryBadge}</span>
        </span>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CASE A: DEDICATED CITIZEN COMPLAINT DOSSIER (CLEAN, NO NODAL BUTTONS)     */}
      {/* ========================================================================= */}
      {isComplaint && data.complaintData ? (
        <div className="space-y-3 text-left">
          {/* Headline Title & Location */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {data.title}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                data.complaintData.status === 'RESOLVED' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : data.complaintData.status === 'WORKER_IN_PROGRESS'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {data.complaintData.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-medium text-slate-600">{data.subtitle || `${data.district}, Andhra Pradesh`}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] font-semibold text-[#0077B6] flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{data.lat.toFixed(4)}°N, {data.lng.toFixed(4)}°E</span>
              </span>
            </div>
          </div>

          {/* Photo Preview if Available */}
          {data.complaintData.photoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-40 w-full group shadow-xs">
              <img 
                src={data.complaintData.photoUrl} 
                alt="Citizen Ground Verification" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1">
                <span>📷 Site Verification Photo</span>
              </div>
            </div>
          )}

          {/* Clean Grievance Description Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Grievance Narrative & Hazard Details
            </span>
            <p className="text-slate-700 leading-relaxed font-normal text-xs">
              {data.complaintData.description}
            </p>
          </div>

          {/* 2-Column Administrative & Citizen Information */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Reported By */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Reported By</span>
              </span>
              <strong className="text-slate-800 block text-xs truncate">
                {data.complaintData.citizenName}
              </strong>
              {data.complaintData.citizenPhone && (
                <span className="text-[11px] text-slate-500 font-mono block">
                  {data.complaintData.citizenPhone}
                </span>
              )}
            </div>

            {/* Assigned Nodal Officer */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#0077B6]" />
                <span>Assigned Nodal Officer</span>
              </span>
              <strong className="text-[#0077B6] block text-xs truncate" title={data.complaintData.assignedNodal}>
                {data.complaintData.assignedNodal || 'District Command'}
              </strong>
              <span className="text-[10px] text-slate-400 block truncate">
                Water Resources Department
              </span>
            </div>
          </div>

          {/* Role Demarcation Strip (Explains Nodal action boundary) */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-[#0077B6] flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0077B6] shrink-0" />
              <span>Nodal Governance Cell Protocol</span>
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              SLA: 72 Hours Max
            </span>
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between text-xs pt-1 px-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className={`w-2.5 h-2.5 rounded-full ${statusBgDot}`}></span>
              <span>{data.statusText}</span>
            </div>

            <span className="font-mono text-[10px] font-bold text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {data.complaintData.id}
            </span>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE B: HYDROLOGICAL TELEMETRY CARD (RESERVOIR, WELL, GAUGE, DISTRICT)    */
        /* ========================================================================= */
        <div className="space-y-3.5">
          {/* Title & Geographic Subtitle */}
          <div className="space-y-1 text-left">
            <h3 className="text-base sm:text-lg font-bold text-[#03045E] tracking-tight leading-snug">
              {data.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
              <span>{data.subtitle || `${data.district}, ${data.state || 'Andhra Pradesh'}${data.basin ? ` • ${data.basin}` : ''}`}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] font-semibold text-[#0077B6] flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{data.lat.toFixed(4)}°N, {data.lng.toFixed(4)}°E</span>
              </span>
            </div>
          </div>

          {/* Integrated District Profile (Exact match to image_17faae6e.png) */}
          {effectiveDistrictProfile && (
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 space-y-2 text-left shadow-2xs">
              <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-1.5">
                <span className="font-bold text-[#03045E] flex items-center gap-1.5 text-xs">
                  <Building className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>{effectiveDistrictProfile.districtName} District Profile</span>
                </span>
                <span className="font-mono text-[10px] font-semibold text-[#0077B6] bg-white px-2 py-0.5 rounded-full border border-sky-200">
                  Cadastral Grid
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Area</span>
                  <span className="font-bold text-[#03045E] font-mono text-xs">{effectiveDistrictProfile.areaSqKm.toLocaleString()} km²</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Headquarters</span>
                  <span className="font-semibold text-slate-800 text-xs truncate block">{effectiveDistrictProfile.headquarter}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-sky-100 shadow-2xs">
                  <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Region</span>
                  <span className="font-semibold text-[#0077B6] text-xs truncate block">{effectiveDistrictProfile.region}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Selected District Boundary</span>
                </span>
                {effectiveDistrictProfile.onResetDistrict && (
                  <button
                    type="button"
                    onClick={effectiveDistrictProfile.onResetDistrict}
                    className="text-[#0077B6] hover:text-[#03045E] hover:underline font-bold transition-colors cursor-pointer"
                  >
                    Show All Districts
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Box 1: REAL-TIME CATCHMENT METEOROLOGY */}
          <div className="bg-[#f0f7fb] border border-sky-200/80 rounded-2xl p-3 sm:p-3.5 space-y-2.5 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0077B6] uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>
                  {data.type === 'groundwater' 
                    ? 'REAL-TIME WELLHEAD & RECHARGE METEOROLOGY' 
                    : 'REAL-TIME CATCHMENT METEOROLOGY & INFLOW'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRefreshWeather}
                disabled={isRefreshingWeather}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-[#0077B6] text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className={`w-3 h-3 text-[#0077B6] ${isRefreshingWeather ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* 4 Weather Chips */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
              {/* Live Rain */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-rose-50/80 border border-rose-200/90 text-rose-950 flex flex-col justify-between">
                <span className="text-[9px] font-semibold text-slate-500 uppercase block tracking-wider">LIVE RAIN</span>
                <div className="my-0.5 text-xs sm:text-sm font-bold font-mono text-[#03045E] flex items-center justify-center gap-0.5">
                  <CloudRain className="w-3 h-3 text-[#0077B6] shrink-0" />
                  <span>{weather.rainMmPerHour} mm/h</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium truncate block">
                  {weather.inflowStatus || 'Active Inflow'}
                </span>
              </div>

              {/* Air Temp */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[9px] font-semibold text-slate-500 uppercase block tracking-wider">AIR TEMP</span>
                <div className="my-0.5 text-xs sm:text-sm font-bold font-mono text-slate-900 flex items-center justify-center gap-0.5">
                  <Thermometer className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{weather.tempC}°C</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium truncate block">
                  {data.type === 'groundwater' ? 'DWLR Site' : 'Site Gauge'}
                </span>
              </div>

              {/* Humidity */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[9px] font-semibold text-slate-500 uppercase block tracking-wider">HUMIDITY</span>
                <div className="my-0.5 text-xs sm:text-sm font-bold font-mono text-[#0077B6] flex items-center justify-center gap-0.5">
                  <Droplets className="w-3 h-3 text-[#00B4D8] shrink-0" />
                  <span>{weather.humidityPct}%</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium truncate block">
                  Atmosphere
                </span>
              </div>

              {/* Wind */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[9px] font-semibold text-slate-500 uppercase block tracking-wider">WIND</span>
                <div className="my-0.5 text-xs sm:text-sm font-bold font-mono text-slate-900 flex items-center justify-center gap-0.5">
                  <Wind className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{weather.windKmPerHour} km/h</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium truncate block">
                  10m Surface
                </span>
              </div>
            </div>

            {/* Subline inside Box 1 */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5 pt-0.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <span>{weather.condition || 'Light Drizzle 🌧️'}</span>
                <span className="text-slate-300">•</span>
                <span>{weather.elevationM || 86}m MSL Elevation</span>
              </span>
              <span className="font-mono text-[#0077B6] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{weatherTime} IST</span>
              </span>
            </div>
          </div>

          {/* Section Title & Network Badge */}
          <div className="flex items-center justify-between pt-0.5 text-left">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {data.type === 'groundwater' ? 'OFFICIAL CGWB GROUNDWATER TELEMETRY' :
               data.type === 'reservoir' ? 'OFFICIAL CWC & APWRIMS RESERVOIR TELEMETRY' :
               data.type === 'gauge' ? 'OFFICIAL RIVER DISCHARGE & GAUGE TELEMETRY' :
               data.type === 'rainfall' ? 'OFFICIAL APWRIMS MANDAL RAINFALL TELEMETRY' :
               data.type === 'bhuvan_wbis' ? 'ISRO BHUVAN WBIS SATELLITE TELEMETRY' :
               'OFFICIAL HYDROLOGICAL TELEMETRY'}
            </span>

            <span className="text-[10px] font-bold text-[#0077B6] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {defaultNetworkBadge}
            </span>
          </div>

          {/* Box 2: Official Hydrological Telemetry Container */}
          <div className="border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 bg-slate-50/50 space-y-3 text-left">
            {/* Banner with Re-verify */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 tracking-tight">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="uppercase tracking-wide">OFFICIAL HYDROLOGICAL TELEMETRY</span>
              </div>

              <button
                type="button"
                onClick={handleReverify}
                disabled={isReverifying}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className={`w-3 h-3 text-[#0077B6] ${isReverifying ? 'animate-spin' : ''}`} />
                <span>Re-verify</span>
              </button>
            </div>

            {/* Agency + Time */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono -mt-1">
              <span className="truncate max-w-[260px] font-semibold text-slate-700">
                {defaultAgency}
              </span>
              <span className="text-slate-500 font-bold shrink-0">
                🕒 {telemetryTime} IST
              </span>
            </div>

            {/* Two Main Metric Cards */}
            <div className="grid grid-cols-2 gap-2 text-left">
              {/* Left Metric Card */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {data.primaryMetricLabel}
                </span>
                <div className="text-base sm:text-lg font-bold font-mono text-[#03045E]">
                  {data.primaryMetricValue}
                </div>
                {data.primaryMetricSub && (
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {data.primaryMetricSub}
                  </span>
                )}
              </div>

              {/* Right Metric Card */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-0.5">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {data.secondaryMetricLabel}
                </span>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-600">
                  {data.secondaryMetricValue}
                </div>
                {data.secondaryMetricSub && (
                  <span className="text-[10px] text-emerald-700 font-medium block">
                    {data.secondaryMetricSub}
                  </span>
                )}
              </div>
            </div>

            {/* Baseline / Operating Limit Strip */}
            {data.baselineLabel && (
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between font-medium">
                <span className="text-slate-500 text-[11px]">{data.baselineLabel}:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">{data.baselineValue}</span>
              </div>
            )}

            {/* Additional information tags */}
            {data.additionalInfo && data.additionalInfo.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[11px]">
                {data.additionalInfo.map((info, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">{info.label}</span>
                    <span className="font-semibold text-slate-800 truncate block">{info.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className={`w-2.5 h-2.5 rounded-full ${statusBgDot}`}></span>
                <span>{data.statusText}</span>
              </div>

              {data.metricExtraRight && (
                <span className="font-mono text-xs font-bold text-[#0077B6] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {data.metricExtraRight}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
