import React, { useState } from 'react';
import { DistrictTelemetry } from '../data/andhraDistrictsData';
import { 
  Satellite, 
  Database, 
  Activity, 
  Droplet, 
  CloudRain, 
  Gauge, 
  Radio, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  User, 
  ArrowRight, 
  Download, 
  X, 
  Sparkles, 
  Compass, 
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Search
} from 'lucide-react';
import { 
  AP_DISTRICT_RAINFALL_SUMMARIES, 
  AP_MANDAL_WISE_RAINFALL_2026 
} from '../data/apMandalWiseRainfall2026';

interface DistrictTelemetryDetailDrawerProps {
  district: DistrictTelemetry;
  onClose: () => void;
  onOpenBhuvanModal?: () => void;
  onLodgeComplaint?: () => void;
}

export const DistrictTelemetryDetailDrawer: React.FC<DistrictTelemetryDetailDrawerProps> = ({
  district,
  onClose,
  onOpenBhuvanModal,
  onLodgeComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'satellite' | 'wris' | 'rainfall' | 'governance'>('satellite');
  const [mandalSearch, setMandalSearch] = useState('');
  const [isRefreshingWris, setIsRefreshingWris] = useState(false);
  const [liveApiResponse, setLiveApiResponse] = useState<any>(null);

  const districtRainfallSummary = 
    AP_DISTRICT_RAINFALL_SUMMARIES[district.name] || 
    AP_DISTRICT_RAINFALL_SUMMARIES[district.name.replace(' District', '')] ||
    Object.values(AP_DISTRICT_RAINFALL_SUMMARIES).find(s => district.name.toLowerCase().includes(s.district.toLowerCase()) || s.district.toLowerCase().includes(district.name.toLowerCase()));

  const districtMandals = AP_MANDAL_WISE_RAINFALL_2026.filter(m => 
    m.district.toLowerCase() === district.name.toLowerCase() ||
    district.name.toLowerCase().includes(m.district.toLowerCase()) ||
    m.district.toLowerCase().includes(district.name.toLowerCase().replace(' district', ''))
  );

  const filteredMandals = districtMandals.filter(m => 
    !mandalSearch || m.mandal.toLowerCase().includes(mandalSearch.toLowerCase())
  );

  const fetchLiveWris = async () => {
    setIsRefreshingWris(true);
    try {
      const res = await fetch(`/api/wris?district=${encodeURIComponent(district.name)}&type=reservoir`);
      if (res.ok) {
        const json = await res.json();
        setLiveApiResponse(json);
      }
    } catch (err) {
      console.warn('WRIS fetch error:', err);
    } finally {
      setIsRefreshingWris(false);
    }
  };

  const isAlert = district.statusColor === 'red' || district.statusColor === 'yellow';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden transition-all animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className={`p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3 ${
        district.statusColor === 'red'
          ? 'bg-gradient-to-r from-rose-950 via-red-900 to-slate-900'
          : district.statusColor === 'yellow'
          ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-[#0047ab] to-blue-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-xs">
            <Compass className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black tracking-tight text-white">
                {district.name} District
              </h3>
              <span className="text-xs font-semibold text-sky-200 bg-white/15 px-2 py-0.5 rounded">
                {district.teluguName}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                district.statusColor === 'red'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : district.statusColor === 'yellow'
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-emerald-500 text-white'
              }`}>
                {district.statusColor.toUpperCase()} • {district.statusColor === 'red' ? 'CRITICAL STRESS' : district.statusColor === 'yellow' ? 'MODERATE ALERT' : 'PRISTINE / SAFE'}
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-0.5">
              HQ: <strong>{district.headquarter}</strong> • Region: <strong>{district.region}</strong> • {district.monitoredSitesCount} Live Telemetry Stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLodgeComplaint && (
            <button
              onClick={onLodgeComplaint}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Lodge Grievance</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('satellite')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'satellite'
              ? 'border-[#0047ab] text-[#0047ab] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Satellite className="w-4 h-4 text-indigo-600" />
          <span>ISRO Bhuvan Satellite (WBIS & NDWI)</span>
        </button>

        <button
          onClick={() => setActiveTab('wris')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'wris'
              ? 'border-[#0047ab] text-[#0047ab] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-sky-600" />
          <span>India-WRIS & APWRIMS Live Telemetry</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveTab('rainfall')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rainfall'
              ? 'border-[#0047ab] text-[#0047ab] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CloudRain className="w-4 h-4 text-teal-600" />
          <span>Mandal Monsoon Rainfall ({districtMandals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'governance'
              ? 'border-[#0047ab] text-[#0047ab] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Water Security & Nodal Officer</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* TAB 1: ISRO BHUVAN SATELLITE WBIS */}
        {activeTab === 'satellite' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Satellite Mission Meta Bar */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-600 text-white font-bold font-mono text-[10px]">
                  ISRO NRSC
                </span>
                <span className="font-bold text-indigo-950">
                  {district.bhuvanSatellite.satelliteSensor}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-900 font-mono">
                  15-Day Optical Pass: {district.bhuvanSatellite.passDate}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-800 font-bold">
                  Cloud Cover: {district.bhuvanSatellite.cloudCoverPercent}%
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Soil Moisture: {district.bhuvanSatellite.soilMoistureStatus}
                </span>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {/* Water Spread Area */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                  Current Water Spread
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {district.bhuvanSatellite.waterSpreadAreaHa} <span className="text-xs font-normal text-slate-500">Ha</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Baseline: {district.bhuvanSatellite.baselineHistoricalHa} Ha
                </span>
              </div>

              {/* Area Delta */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                  10-Year Area Change
                </span>
                <div className={`text-xl sm:text-2xl font-black mt-0.5 ${
                  district.bhuvanSatellite.areaChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {district.bhuvanSatellite.areaChangePercent >= 0 ? '+' : ''}{district.bhuvanSatellite.areaChangePercent}%
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {district.bhuvanSatellite.areaChangePercent >= 0 ? 'Surface Expansion' : 'Surface Contraction'}
                </span>
              </div>

              {/* NDWI Score */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                  Bhuvan NDWI Index
                </span>
                <div className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5 font-mono">
                  +{district.bhuvanSatellite.ndwiScore}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {district.bhuvanSatellite.ndwiScore >= 0.45 ? 'Deep Clear Liquid Water' : 'Moderate / Shallow Silt Water'}
                </span>
              </div>

              {/* NDVI Catchment Score */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                  NDVI Catchment Index
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 font-mono">
                  +{district.bhuvanSatellite.ndviScore}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {district.bhuvanSatellite.ndviScore >= 0.6 ? 'Healthy Catchment Canopy' : 'Sparse Scrub / Depleted'}
                </span>
              </div>
            </div>

            {/* Satellite Orbit Chronology */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Previous Orbit (15d ago)</span>
                <p className="font-bold text-slate-800 mt-0.5">2026-09-17 • Resourcesat-2A</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Baseline reflection archived under 0% cloud cover.</p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl">
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">Current Orbit (Live)</span>
                <p className="font-bold text-blue-950 mt-0.5">{district.bhuvanSatellite.passDate} • Multi-Spectral</p>
                <p className="text-[11px] text-blue-900 mt-0.5">Automated NDWI contour extraction validated with ground truth.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Next Scheduled Orbit</span>
                <p className="font-bold text-slate-800 mt-0.5">2026-10-17 • Sentinel-2 MSI</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Upcoming high-resolution 10m pass scheduled.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INDIA-WRIS & APWRIMS LIVE TELEMETRY */}
        {activeTab === 'wris' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Live Status Bar with Refresh */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-bold text-sky-950">
                  Live APWRIMS & India-WRIS Multi-Dataset Stream
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-sky-800 text-[11px]">
                  Last Updated: {district.wrisTelemetry.lastTelemetryUpdate}
                </span>
              </div>

              <button
                onClick={fetchLiveWris}
                disabled={isRefreshingWris}
                className="px-3 py-1.5 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWris ? 'animate-spin' : ''}`} />
                <span>{isRefreshingWris ? 'Querying WRIS...' : 'Live Re-Query WRIS API'}</span>
              </button>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Reservoir Live Storage */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reservoir Storage</span>
                  </span>
                  <span className="font-mono font-bold text-blue-700 text-[11px]">
                    {district.wrisTelemetry.storagePercentage}%
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {district.wrisTelemetry.currentStorageMCM} <span className="text-xs font-normal text-slate-500">MCM</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(district.wrisTelemetry.storagePercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Cap: {district.wrisTelemetry.capacityMCM} MCM</span>
                  <span>{district.wrisTelemetry.liveStorageTMC} TMC</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 truncate">
                  {district.wrisTelemetry.primaryReservoir} ({district.wrisTelemetry.reservoirBlock})
                </p>
              </div>

              {/* CGWB DWLR Groundwater Depth */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CGWB Groundwater</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-[11px]">
                    DWLR
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {district.wrisTelemetry.groundwaterDepthMbgl} <span className="text-xs font-normal text-slate-500">mbgl</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 block">
                  {district.wrisTelemetry.groundwaterTrend}
                </span>
                <p className="text-[10px] text-slate-500">
                  Automated Digital Water Level Recorder sensor in fracture granite aquifer.
                </p>
              </div>

              {/* River Discharge & Gauge Level */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>River Telemetry</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-700 text-[11px]">
                    CWC
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {district.wrisTelemetry.riverGaugeM} <span className="text-xs font-normal text-slate-500">m</span>
                </div>
                <span className="text-[11px] font-mono text-slate-600 block">
                  Discharge: <strong>{district.wrisTelemetry.riverDischargeCusecs}</strong> Cusecs
                </span>
                <p className="text-[10px] text-slate-500 truncate">
                  {district.wrisTelemetry.riverName} • {district.wrisTelemetry.riverStation}
                </p>
              </div>

              {/* 24-Hour Rainfall */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                    <span>24h Rainfall</span>
                  </span>
                  <span className="font-mono font-bold text-sky-700 text-[11px]">
                    IMD AWS
                  </span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {district.wrisTelemetry.rainfallMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <span className={`text-[11px] font-semibold block ${
                  district.wrisTelemetry.rainfallDeparturePercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {district.wrisTelemetry.rainfallDeparturePercent >= 0 ? '+' : ''}{district.wrisTelemetry.rainfallDeparturePercent}% Departure
                </span>
                <p className="text-[10px] text-slate-500">
                  Automatic Weather Station telemetric precipitation logger.
                </p>
              </div>
            </div>

            {/* Live API Response Box (if tested) */}
            {liveApiResponse && (
              <div className="bg-slate-900 text-sky-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1 border border-sky-800">
                <span className="text-white font-bold block">✓ LIVE WRIS API 200 OK RESPONSE:</span>
                <pre>{JSON.stringify(liveApiResponse, null, 2).slice(0, 450)}...</pre>
              </div>
            )}
          </div>
        )}

        {/* TAB: MANDAL MONSOON RAINFALL TELEMETRY (01/06/2025 to 13/10/2026) */}
        {activeTab === 'rainfall' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            {/* District Aggregate Metrics */}
            {districtRainfallSummary ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">AVG RECORDED RAIN</span>
                  <span className="text-xl font-black font-mono text-teal-700 mt-0.5 block">
                    {districtRainfallSummary.avgActualMm} mm
                  </span>
                  <span className="text-[10px] text-slate-500 block">Monsoon Cumulative Actual</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">CLIMATE NORMAL</span>
                  <span className="text-xl font-black font-mono text-slate-800 mt-0.5 block">
                    {districtRainfallSummary.avgNormalMm} mm
                  </span>
                  <span className="text-[10px] text-slate-500 block">Historical Baseline (mm)</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">DEVIATION / DEPARTURE</span>
                  <span className={`text-xl font-black font-mono mt-0.5 block ${
                    districtRainfallSummary.avgDeviationPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {districtRainfallSummary.avgDeviationPercent > 0 ? '+' : ''}
                    {districtRainfallSummary.avgDeviationPercent}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Vs IMD Long-Term Mean</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">MANDALS MONITORED</span>
                  <span className="text-xl font-black font-mono text-blue-700 mt-0.5 block">
                    {districtRainfallSummary.totalMandals} Mandals
                  </span>
                  <span className="text-[10px] text-slate-500 block">100% Telemetry Coverage</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                District telemetry aggregate loading from state meteorological grid...
              </div>
            )}

            {/* Status Breakdown Chips */}
            {districtRainfallSummary && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    Large Excess: {districtRainfallSummary.largeExcess}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                    Excess: {districtRainfallSummary.excess}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Normal: {districtRainfallSummary.normal}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Deficient: {districtRainfallSummary.deficient}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                    Large Deficient: {districtRainfallSummary.largeDeficient}
                  </span>
                  {districtRainfallSummary.noRain > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                      No Rain: {districtRainfallSummary.noRain}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[10px]">Period: 01/06/2025 to 13/10/2026</span>
              </div>
            )}

            {/* Mandal Search Filter */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mandal in this district..."
                  value={mandalSearch}
                  onChange={(e) => setMandalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>
              <span className="text-slate-500 text-[11px]">
                Showing <strong>{filteredMandals.length}</strong> of {districtMandals.length} Mandals
              </span>
            </div>

            {/* Mandals Telemetry Table */}
            <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">S.No</th>
                    <th className="py-2 px-3">Mandal Name</th>
                    <th className="py-2 px-3 text-right">Actual (mm)</th>
                    <th className="py-2 px-3 text-right">Normal (mm)</th>
                    <th className="py-2 px-3 text-right">Deviation (%)</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredMandals.length > 0 ? (
                    filteredMandals.map((m, idx) => {
                      const isExcess = m.status === 'Large Excess' || m.status === 'Excess';
                      const isNormal = m.status === 'Normal';
                      const isLargeDeficient = m.status === 'Large Deficient';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-1.5 px-3 font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-slate-800">
                            {m.mandal}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-teal-700">
                            {m.actualMm}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                            {m.normalMm}
                          </td>
                          <td className={`py-1.5 px-3 text-right font-mono font-bold ${
                            m.deviationPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {m.deviationPercent > 0 ? '+' : ''}{m.deviationPercent}%
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isNormal
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isExcess
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : isLargeDeficient
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No mandal records found matching "{mandalSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WATER SECURITY & NODAL GOVERNANCE */}
        {activeTab === 'governance' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            {/* Stress Dossier Card */}
            <div className={`p-4 rounded-xl border ${
              isAlert
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {isAlert ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span className="uppercase tracking-wide font-mono text-[11px]">
                  District Stress Assessment & Catchment Condition:
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                {district.stressFactor}
              </p>
            </div>

            {/* Officer in Charge Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0047ab] text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {district.officerInCharge.name}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {district.officerInCharge.designation}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${district.officerInCharge.phone}`}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{district.officerInCharge.phone}</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-mono">
                Statutory Tracking ID: AP-WSS-2026-{district.id.toUpperCase().slice(0, 5)}
              </span>

              <div className="flex items-center gap-2">
                {onOpenBhuvanModal && (
                  <button
                    onClick={onOpenBhuvanModal}
                    className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Detailed Satellite Modal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
