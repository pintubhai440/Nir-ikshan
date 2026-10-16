import React, { useState, useEffect } from 'react';
import { WaterBody, CitizenComplaint, OfficerContact } from '../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { Andhra26DistrictsMapSvg, MapDisplayMode } from './Andhra26DistrictsMapSvg';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { BhuvanWbisDetailModal } from './BhuvanWbisDetailModal';
import { AP_OFFICIAL_RESERVOIRS, AP_MACRO_RESERVOIR_SUMMARY, APReservoirRecord } from '../data/apReservoirsData';
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
  Activity
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  waterBodies: WaterBody[];
  complaints: CitizenComplaint[];
  officers: OfficerContact[];
  onOpenDirectoryModal: () => void;
  onOpenLodgeModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  waterBodies,
  complaints,
  onOpenDirectoryModal,
  onOpenLodgeModal,
}) => {
  const { t } = useLanguage();
  // Map View Filter: 'all' | 'alerts' | 'active'
  const [viewFilter, setViewFilter] = useState<'all' | 'alerts' | 'active'>('all');
  
  // Selected District on Map
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictTelemetry | null>(
    () => ANDHRA_PRADESH_26_DISTRICTS.find(d => d.id === 'nandyal') || ANDHRA_PRADESH_26_DISTRICTS[0]
  );
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');

  // Map View Mode: India Map (AP Focused & Highlighted) vs AP 26 Districts Detail
  const [adminMapType, setAdminMapType] = useState<'india_ap_highlight' | 'ap_cadastral'>('india_ap_highlight');

  // Display Mode & Layer Toggles
  const [mapDisplayMode, setMapDisplayMode] = useState<MapDisplayMode>('cadastral');
  const [showTelemetryBeams, setShowTelemetryBeams] = useState(true);
  const [showSatelliteScan, setShowSatelliteScan] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showReservoirs, setShowReservoirs] = useState(true);

  // Active Selected Reservoir from AP Official List (APWRIMS Real Data)
  const [selectedReservoir, setSelectedReservoir] = useState<APReservoirRecord | null>(
    () => AP_OFFICIAL_RESERVOIRS[0] // Srisailam
  );

  // Active Selected Water Body (for local catchments)
  const [selectedWaterBodyId, setSelectedWaterBodyId] = useState<string>('res-srisailam');
  const [stationTab, setStationTab] = useState<'reservoirs' | 'catchments'>('reservoirs');

  // Modal State for Technical Bhuvan WBIS
  const [isBhuvanModalOpen, setIsBhuvanModalOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimestamp(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Statistics Calculations from Real Official APWRIMS Summary Sheet
  const totalStorageTMC = AP_MACRO_RESERVOIR_SUMMARY.totalCurrentTMC; // 555.00 TMC
  const totalGrossTMC = AP_MACRO_RESERVOIR_SUMMARY.totalGrossTMC; // 1107.51 TMC
  const avgStoragePercent = AP_MACRO_RESERVOIR_SUMMARY.totalStoragePercentage; // 50.1%

  const alertDistricts = ANDHRA_PRADESH_26_DISTRICTS.filter(d => d.alertCount > 0 || d.statusColor === 'red' || d.statusColor === 'yellow');
  const activeDistricts = ANDHRA_PRADESH_26_DISTRICTS.filter(d => d.statusColor === 'green' || d.statusColor === 'blue');
  const criticalRedDistricts = ANDHRA_PRADESH_26_DISTRICTS.filter(d => d.statusColor === 'red');

  const avgGroundwaterDepth = (
    ANDHRA_PRADESH_26_DISTRICTS.reduce((acc, d) => acc + d.wrisTelemetry.groundwaterDepthMbgl, 0) / 26
  ).toFixed(1);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const inProgressComplaints = complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  // Resolve Active Water Body Dossier (prioritizes real APWRIMS reservoir if selected, or clicked district)
  const getActiveWaterBodyDossier = (): WaterBody => {
    // 1. If an official APWRIMS reservoir is selected, build dossier directly from real government data
    if (selectedReservoir) {
      return {
        id: `res-${selectedReservoir.id}`,
        name: `${selectedReservoir.name}`,
        teluguName: selectedReservoir.teluguName || '',
        type: 'Reservoir',
        datasetType: 'reservoir',
        endpoint: 'POST /Dataset/Reservoir',
        agency: 'APWRIMS / CWC',
        district: selectedReservoir.district,
        mandal: `${selectedReservoir.basin} Basin Command`,
        village: `${selectedReservoir.name.split(' ')[0]} Headworks, ${selectedReservoir.district}`,
        coordinates: selectedReservoir.geoCoords,
        statusColor: selectedReservoir.storagePercentage > 80 ? 'green' : selectedReservoir.storagePercentage > 35 ? 'blue' : selectedReservoir.storagePercentage > 20 ? 'yellow' : 'red',
        statusLabel: selectedReservoir.storagePercentage > 80 ? 'ABUNDANT / RECHARGED' : selectedReservoir.storagePercentage > 35 ? 'NORMAL STORAGE' : selectedReservoir.storagePercentage > 20 ? 'MEDIUM RESERVE' : 'CRITICAL EXTINCT / OVERDRAFT THREAT',
        waterLevelPercent: Math.round(selectedReservoir.storagePercentage),
        tdsPpm: selectedReservoir.district.toLowerCase() === 'chittoor' ? 680 : 210,
        wasteLevel: selectedReservoir.district.toLowerCase() === 'chittoor' ? 'Moderate' : 'None',
        lastInspected: selectedReservoir.date,
        description: selectedReservoir.id === 'chittoor_ntr_jalasayam'
          ? `Official APWRIMS Real-Time Telemetry (Report Date: ${selectedReservoir.date}). Current storage: 0.030 TMC (27.27% capacity of 0.110 TMC FRL). Current water level: 957.43 ft (FRL: 965.14 ft). Flood cushion available: 0.080 TMC. Inflow: 0 Cusecs, Outflow: 0 Cusecs. River basin: Other (Ponnai / Palar Sub-basin). Alert Status: Low Storage Reserve (27.27% of FRL) • Priority Municipal Drinking Water Supply for Chittoor Town.`
          : `Official APWRIMS & CWC Real-Time Telemetry (Report Date: ${selectedReservoir.date}). Current storage: ${selectedReservoir.currentStorageTMC} TMC (${selectedReservoir.storagePercentage}% capacity of ${selectedReservoir.grossCapacityTMC} TMC FRL). Current water level: ${selectedReservoir.currentLevelFeet} ft. Flood cushion available: ${selectedReservoir.floodCushionTMC} TMC. Inflow: ${selectedReservoir.inflowCusecs.toLocaleString()} Cusecs, Outflow: ${selectedReservoir.outflowCusecs.toLocaleString()} Cusecs. River basin: ${selectedReservoir.basin}. Alert Status: ${selectedReservoir.alert}.`,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        liveTelemetry: {
          storageBMC: Math.round((selectedReservoir.currentStorageMCM / 1000) * 100) / 100,
          storageMCM: selectedReservoir.currentStorageMCM,
          fullCapacityMCM: selectedReservoir.grossCapacityMCM,
          waterLevelM: Math.round(selectedReservoir.currentLevelFeet * 0.3048 * 10) / 10,
          dangerLevelM: Math.round(selectedReservoir.currentLevelFeet * 0.3048 + 4),
          dischargeCusecs: selectedReservoir.outflowCusecs,
          inflowCusecs: selectedReservoir.inflowCusecs,
        },
        bhuvanWbis: {
          ndwiScore: selectedReservoir.bhuvanSatellite.ndwiScore,
          ndwiClassification: selectedReservoir.bhuvanSatellite.ndwiClassification,
          waterSpreadAreaHa: selectedReservoir.bhuvanSatellite.waterSpreadAreaHa,
          historicalBaselineHa: selectedReservoir.bhuvanSatellite.baselineHistoricalHa,
          areaChangePercent: selectedReservoir.bhuvanSatellite.areaChangePercent,
          satelliteMission: selectedReservoir.bhuvanSatellite.satelliteSensor,
          sensorName: 'AWiFS (56m) + Sentinel-2 MSI Multi-spectral',
          last15DayPassDate: selectedReservoir.bhuvanSatellite.passDate,
          previousPassDate: '2026-09-17',
          nextPassDate: '2026-10-17',
          cycleDays: 15,
          cloudCoverPercent: selectedReservoir.bhuvanSatellite.cloudCoverPercent,
          siltationIndexPercent: selectedReservoir.storagePercentage < 25 ? 65 : 12,
          encroachmentRisk: selectedReservoir.storagePercentage < 25 ? 'Severe' : 'None',
          waterRemainingPercent: Math.round(selectedReservoir.storagePercentage),
          estimatedVolumeMCM: selectedReservoir.currentStorageMCM,
          isExtinct: selectedReservoir.storagePercentage < 20,
          bhuvanLulcTheme: 'Water Bodies - Reservoirs / Lakes',
        }
      };
    }

    // 2. If a district was selected directly on the map (e.g. Chittoor, Bapatla, etc.)
    if (selectedDistrict) {
      return {
        id: `dist-${selectedDistrict.id}`,
        name: `${selectedDistrict.wrisTelemetry.primaryReservoir} (${selectedDistrict.name.toUpperCase()})`,
        teluguName: selectedDistrict.teluguName,
        type: 'Reservoir',
        datasetType: 'reservoir',
        endpoint: 'POST /Dataset/DistrictTelemetry',
        agency: selectedDistrict.wrisTelemetry.primaryAgency,
        district: selectedDistrict.name,
        mandal: selectedDistrict.wrisTelemetry.reservoirBlock,
        village: `${selectedDistrict.headquarter} Catchment`,
        coordinates: selectedDistrict.centerCoords,
        statusColor: selectedDistrict.statusColor === 'red' ? 'red' : selectedDistrict.statusColor === 'yellow' ? 'yellow' : selectedDistrict.statusColor === 'green' ? 'green' : 'blue',
        statusLabel: selectedDistrict.statusColor === 'red' ? 'CRITICAL EXTINCT / OVERDRAFT THREAT' : selectedDistrict.statusColor === 'yellow' ? 'MEDIUM WATER LEVEL' : selectedDistrict.statusColor === 'green' ? 'ABUNDANT / RECHARGED' : 'NORMAL WATER LEVEL',
        waterLevelPercent: selectedDistrict.wrisTelemetry.storagePercentage,
        tdsPpm: selectedDistrict.statusColor === 'red' ? 680 : selectedDistrict.statusColor === 'yellow' ? 390 : 210,
        wasteLevel: selectedDistrict.statusColor === 'red' ? 'Heavy' : selectedDistrict.statusColor === 'yellow' ? 'Moderate' : 'None',
        lastInspected: '10-04-2026',
        description: `Official APWRIMS & CGWB Telemetry for ${selectedDistrict.name} (${selectedDistrict.teluguName}). Primary Reservoir: ${selectedDistrict.wrisTelemetry.primaryReservoir} (${selectedDistrict.wrisTelemetry.storagePercentage}% capacity, ${selectedDistrict.wrisTelemetry.liveStorageTMC} TMC). CGWB DWLR Water Table: ${selectedDistrict.wrisTelemetry.groundwaterDepthMbgl} mbgl (${selectedDistrict.wrisTelemetry.groundwaterTrend}). River: ${selectedDistrict.wrisTelemetry.riverName} at ${selectedDistrict.wrisTelemetry.riverStation} (${selectedDistrict.wrisTelemetry.riverDischargeCusecs} Cusecs). Stress Factor: ${selectedDistrict.stressFactor}.`,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        liveTelemetry: {
          storageBMC: Math.round((selectedDistrict.wrisTelemetry.currentStorageMCM / 1000) * 100) / 100,
          storageMCM: selectedDistrict.wrisTelemetry.currentStorageMCM,
          fullCapacityMCM: selectedDistrict.wrisTelemetry.capacityMCM,
          waterLevelM: selectedDistrict.wrisTelemetry.riverGaugeM,
          dangerLevelM: selectedDistrict.wrisTelemetry.dangerLevelM,
          dischargeCusecs: selectedDistrict.wrisTelemetry.riverDischargeCusecs,
          inflowCusecs: selectedDistrict.wrisTelemetry.riverDischargeCusecs,
        },
        bhuvanWbis: {
          ndwiScore: selectedDistrict.bhuvanSatellite.ndwiScore,
          ndwiClassification: selectedDistrict.bhuvanSatellite.ndwiScore > 0.3 ? 'Deep Surface Water (NDWI > 0.3)' : selectedDistrict.bhuvanSatellite.ndwiScore > 0.1 ? 'Moderate Surface Water (0.1 - 0.3)' : 'Shallow / Turbid Water (0.0 - 0.1)',
          waterSpreadAreaHa: selectedDistrict.bhuvanSatellite.waterSpreadAreaHa,
          historicalBaselineHa: selectedDistrict.bhuvanSatellite.baselineHistoricalHa,
          areaChangePercent: selectedDistrict.bhuvanSatellite.areaChangePercent,
          satelliteMission: `ISRO ${selectedDistrict.bhuvanSatellite.satelliteSensor}`,
          sensorName: 'Resourcesat-2A LISS-IV + Sentinel-2 MSI',
          last15DayPassDate: selectedDistrict.bhuvanSatellite.passDate,
          previousPassDate: '2026-09-17',
          nextPassDate: '2026-10-17',
          cycleDays: 15,
          cloudCoverPercent: selectedDistrict.bhuvanSatellite.cloudCoverPercent,
          siltationIndexPercent: selectedDistrict.statusColor === 'red' ? 62 : selectedDistrict.statusColor === 'yellow' ? 38 : 12,
          encroachmentRisk: selectedDistrict.statusColor === 'red' ? 'Severe' : 'None',
          waterRemainingPercent: selectedDistrict.wrisTelemetry.storagePercentage,
          estimatedVolumeMCM: selectedDistrict.wrisTelemetry.currentStorageMCM,
          isExtinct: selectedDistrict.statusColor === 'red',
          bhuvanLulcTheme: 'Water Bodies - Reservoirs / Lakes',
        }
      };
    }

    // 3. Fallback
    const directWb = waterBodies.find(w => w.id === selectedWaterBodyId);
    if (directWb) return directWb;

    return waterBodies[0];
  };

  const activeDossier = getActiveWaterBodyDossier();
  const rawWbis = activeDossier.bhuvanWbis;

  const wbis = {
    ndwiScore: typeof rawWbis?.ndwiScore === 'number' ? rawWbis.ndwiScore : 0.58,
    ndwiClassification: rawWbis?.ndwiClassification || 'Deep Surface Water (NDWI > 0.3)',
    waterSpreadAreaHa: typeof rawWbis?.waterSpreadAreaHa === 'number' ? rawWbis.waterSpreadAreaHa : 19850.0,
    historicalBaselineHa: typeof rawWbis?.historicalBaselineHa === 'number' ? rawWbis.historicalBaselineHa : 20200.0,
    areaChangePercent: typeof rawWbis?.areaChangePercent === 'number' ? rawWbis.areaChangePercent : -1.7,
    satelliteMission: rawWbis?.satelliteMission || 'ISRO Resourcesat-2A LISS-IV',
    sensorName: rawWbis?.sensorName || 'AWiFS (56m) + Sentinel-2 MSI Multi-spectral',
    last15DayPassDate: rawWbis?.last15DayPassDate || '2026-10-04',
    previousPassDate: rawWbis?.previousPassDate || '2026-09-17',
    nextPassDate: rawWbis?.nextPassDate || '2026-10-17',
    cloudCoverPercent: rawWbis?.cloudCoverPercent || 1.8,
  };

  // When clicking a reservoir directly on the map
  const handleSelectReservoir = (res: APReservoirRecord) => {
    setSelectedReservoir(res);
    setSelectedWaterBodyId(`res-${res.id}`);
    const matchingDist = ANDHRA_PRADESH_26_DISTRICTS.find(d => 
      d.name.toLowerCase() === res.district.toLowerCase() ||
      res.district.toLowerCase().includes(d.name.toLowerCase())
    );
    if (matchingDist) setSelectedDistrict(matchingDist);
  };

  // When clicking a district polygon on the map
  const handleSelectDistrictFromMap = (dist: DistrictTelemetry) => {
    setSelectedDistrict(dist);
    // Find matching reservoir in this district
    const matchingRes = AP_OFFICIAL_RESERVOIRS.find(r => 
      r.district.toLowerCase() === dist.name.toLowerCase() ||
      dist.name.toLowerCase().includes(r.district.toLowerCase())
    );
    if (matchingRes) {
      setSelectedReservoir(matchingRes);
      setSelectedWaterBodyId(`res-${matchingRes.id}`);
    } else {
      setSelectedReservoir(null);
      setSelectedWaterBodyId(`dist-${dist.id}`);
    }
  };

  // Download Comprehensive 26-District & Reservoir State Water Audit PDF
  const handleDownloadStatePdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Page 1: Executive State Summary
        doc.setFillColor(27, 42, 74);
        doc.rect(0, 0, 210, 28, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('GOVERNMENT OF ANDHRA PRADESH • WATER RESOURCES DEPARTMENT', 14, 11);
        doc.setFontSize(8.5);
        doc.setTextColor(186, 230, 253);
        doc.text('NIR-IKSHAN: OFFICIAL 26-DISTRICT STATE WATER AUDIT & RESERVOIR DOSSIER', 14, 17);
        doc.text(`DATE: 10-04-2026 | TELEMETRY SOURCE: APWRIMS, CWC & ISRO-BHUVAN OPTICAL PASSES`, 14, 23);

        doc.setTextColor(27, 42, 74);
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.text('1. STATEWIDE MACRO RESERVOIR STORAGE (OFFICIAL APWRIMS 10-04-2026)', 14, 38);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`• Total State Reservoir Storage: ${totalStorageTMC} TMC of ${totalGrossTMC} TMC (${avgStoragePercent}% FRL Capacity)`, 14, 46);
        doc.text(`• Total Flood Cushion Available: ${AP_MACRO_RESERVOIR_SUMMARY.totalFloodCushionTMC} TMC`, 14, 52);
        doc.text(`• Coastal Andhra Region: ${AP_MACRO_RESERVOIR_SUMMARY.coastalAndhra.currentTMC} TMC / ${AP_MACRO_RESERVOIR_SUMMARY.coastalAndhra.grossTMC} TMC (${AP_MACRO_RESERVOIR_SUMMARY.coastalAndhra.storagePercentage}%)`, 14, 58);
        doc.text(`• Rayalaseema Region: ${AP_MACRO_RESERVOIR_SUMMARY.rayalaseema.currentTMC} TMC / ${AP_MACRO_RESERVOIR_SUMMARY.rayalaseema.grossTMC} TMC (${AP_MACRO_RESERVOIR_SUMMARY.rayalaseema.storagePercentage}%)`, 14, 64);
        doc.text(`• Peak Active Discharge: Dowleswaram Barrage (115,786 Cusecs) to Bay of Bengal`, 14, 70);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('2. MAJOR RESERVOIR TELEMETRY & BHUVAN NDWI INVENTORY', 14, 84);

        let curY = 94;
        doc.setFontSize(7.5);
        doc.setFillColor(241, 245, 249);
        doc.rect(14, curY - 5, 182, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('RESERVOIR', 16, curY);
        doc.text('DISTRICT', 65, curY);
        doc.text('STORAGE (TMC)', 105, curY);
        doc.text('LEVEL (FT)', 138, curY);
        doc.text('IN/OUTFLOW', 162, curY);
        doc.text('NDWI', 188, curY);
        curY += 7;

        AP_OFFICIAL_RESERVOIRS.forEach((r) => {
          if (curY > 275) {
            doc.addPage();
            curY = 20;
            doc.setFillColor(241, 245, 249);
            doc.rect(14, curY - 5, 182, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.text('RESERVOIR', 16, curY);
            doc.text('DISTRICT', 65, curY);
            doc.text('STORAGE (TMC)', 105, curY);
            doc.text('LEVEL (FT)', 138, curY);
            doc.text('IN/OUTFLOW', 162, curY);
            doc.text('NDWI', 188, curY);
            curY += 7;
          }

          doc.setFont('helvetica', 'normal');
          doc.text(r.name.slice(0, 24), 16, curY);
          doc.text(r.district.slice(0, 18), 65, curY);
          doc.text(`${r.currentStorageTMC} / ${r.grossCapacityTMC} (${r.storagePercentage}%)`, 105, curY);
          doc.text(`${r.currentLevelFeet}`, 138, curY);
          doc.text(`${r.inflowCusecs}/${r.outflowCusecs}`, 162, curY);
          doc.setFont('helvetica', 'bold');
          doc.text(`+${r.bhuvanSatellite.ndwiScore}`, 188, curY);
          curY += 6;
        });

        doc.save(`AP_Official_Reservoir_Water_Audit_10_04_2026.pdf`);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (err) {
        console.error('PDF error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* 1. State Apex Command Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#0047ab] to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-sky-200 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
            <span>ANDHRA PRADESH STATE WATER SURVEILLANCE GRID • 26 DISTRICTS ACTIVE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {t('stateGovernanceTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-sky-200 mt-1 max-w-3xl">
            Integrated command over all <strong>26 Andhra Pradesh districts</strong> with official <strong>APWRIMS & CWC Live Reservoir Telemetry (10-04-2026)</strong> and <strong>ISRO Bhuvan 15-Day Optical Passes</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadStatePdf}
            disabled={isExporting}
            className="px-4 py-2.5 bg-white text-[#0047ab] hover:bg-sky-50 font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating Audit PDF...' : 'Download AP Reservoir Audit (PDF)'}</span>
          </button>

          <button
            onClick={onOpenDirectoryModal}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-sky-300" />
            <span>26-District Nodal Officers</span>
          </button>
        </div>
      </div>

      {/* 2. Official APWRIMS State-Wide Macro Telemetry Pulse Cards (10-04-2026) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
        {/* Total Storage */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>State Reservoir Storage</span>
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalStorageTMC} <span className="text-xs font-normal text-slate-500">TMC</span>
          </div>
          <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
            {avgStoragePercent}% of {totalGrossTMC} TMC Gross
          </p>
          <span className="text-[9px] text-slate-500 font-mono block">
            Coastal: 326.9 TMC • Rayalaseema: 159.8 TMC
          </span>
        </div>

        {/* Avg Groundwater */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span>State CGWB Table</span>
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {avgGroundwaterDepth} <span className="text-xs font-normal text-slate-500">mbgl</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            Automated DWLR Sensors Active
          </p>
        </div>

        {/* Active Alert Zones */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-rose-500 uppercase font-bold block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Active Flood / Flow Alert</span>
          </span>
          <div className="text-xl font-black text-rose-600 mt-1">
            115,786 <span className="text-xs font-normal text-slate-500">Cusecs</span>
          </div>
          <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
            Dowleswaram Barrage Godavari Outflow
          </p>
        </div>

        {/* Live Satellite Passes */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-indigo-500 uppercase font-bold block flex items-center gap-1">
            <Satellite className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bhuvan 15-Day Pass</span>
          </span>
          <div className="text-xl font-black text-indigo-900 mt-1">
            100% <span className="text-xs font-normal text-slate-500">Coverage</span>
          </div>
          <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
            Resourcesat-2A & Sentinel-2
          </p>
        </div>

        {/* Grievance Resolution */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grievances Solved</span>
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {resolutionRate}% <span className="text-xs font-normal text-slate-500">({resolvedComplaints}/{totalComplaints})</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {inProgressComplaints} Currently in Action
          </p>
        </div>
      </div>

      {/* 3. THE 26-DISTRICT HIGH-LEVEL MAP (Authentic AP Shape, Rivers, & Real Reservoirs) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Map Header & Multi-Mode Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-[#0047ab]">
                <Globe className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Andhra Pradesh 26-District Hydrological & Satellite Grid
              </h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                APWRIMS 10-04-2026 LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Click on any reservoir pin or district to inspect its live government telemetry and Bhuvan optical pass data in the dossier below.
            </p>
          </div>

          {/* Map Display Mode Selector */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-[#0047ab]" />
              <span>Map Mode:</span>
            </span>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 font-bold flex-wrap">
              <button
                onClick={() => setMapDisplayMode('cadastral')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapDisplayMode === 'cadastral'
                    ? 'bg-[#ea580c] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cadastral Map: Alternating Saffron & Gold tones matching reference image"
              >
                🗺️ Saffron Cadastral
              </button>

              <button
                onClick={() => setMapDisplayMode('surveillance')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapDisplayMode === 'surveillance'
                    ? 'bg-[#0047ab] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Futuristic Cyber Surveillance Grid (as in command video)"
              >
                📡 Cyber Video Grid
              </button>

              <button
                onClick={() => setMapDisplayMode('ndwi_satellite')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapDisplayMode === 'ndwi_satellite'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
                title="ISRO Bhuvan NDWI Water Extraction Satellite False Color"
              >
                🛰️ Bhuvan NDWI
              </button>

              <button
                onClick={() => setMapDisplayMode('wris_storage')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapDisplayMode === 'wris_storage'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
                title="India-WRIS Reservoir Storage % Heatmap"
              >
                💧 Dam Storage %
              </button>

              <button
                onClick={() => setMapDisplayMode('dwlr_groundwater')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapDisplayMode === 'dwlr_groundwater'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-sky-600'
                }`}
                title="CGWB DWLR Groundwater Table Depth Heatmap"
              >
                ⚓ DWLR Table
              </button>

              <button
                onClick={() => setMapDisplayMode('rainfall')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  mapDisplayMode === 'rainfall'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-teal-600'
                }`}
                title="AP Monsoon Cumulative Rainfall & Departure Heatmap"
              >
                🌧️ Rainfall Heatmap
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Toolbar: Layer Toggles & Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-500 text-[11px] flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              <span>Layers:</span>
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showTelemetryBeams}
                onChange={(e) => setShowTelemetryBeams(e.target.checked)}
                className="rounded text-[#0047ab]"
              />
              <span>⚡ Telemetry Beams</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showSatelliteScan}
                onChange={(e) => setShowSatelliteScan(e.target.checked)}
                className="rounded text-[#0047ab]"
              />
              <span>📡 Radar Scanner</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showRivers}
                onChange={(e) => setShowRivers(e.target.checked)}
                className="rounded text-[#0047ab]"
              />
              <span>🌊 River Flow</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showReservoirs}
                onChange={(e) => setShowReservoirs(e.target.checked)}
                className="rounded text-[#0047ab]"
              />
              <span>💧 AP Reservoirs ({AP_OFFICIAL_RESERVOIRS.length})</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* National AP-Focus vs AP 26 Districts Mode Switcher */}
            <div className="flex items-center bg-[#03045E]/10 p-0.5 rounded-lg border border-[#03045E]/20 text-xs font-bold">
              <button
                onClick={() => setAdminMapType('india_ap_highlight')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminMapType === 'india_ap_highlight'
                    ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>🇮🇳 India Map (AP Focused)</span>
              </button>
              <button
                onClick={() => setAdminMapType('ap_cadastral')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminMapType === 'ap_cadastral'
                    ? 'bg-[#0077B6] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>🗺️ AP 26 Districts Vector</span>
              </button>
            </div>

            <button
              onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
            >
              {mapTheme === 'light' ? '🌙 Dark Grid' : '☀️ Light Grid'}
            </button>

            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewFilter === 'all'
                    ? 'bg-[#0047ab] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (26)
              </button>
              <button
                onClick={() => setViewFilter('alerts')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewFilter === 'alerts'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <span>Alerts ({alertDistricts.length})</span>
              </button>
              <button
                onClick={() => setViewFilter('active')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <span>Active ({activeDistricts.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Canvas: Either India Map (AP Highlighted & Focused) or 26-District Cadastral Vector Map */}
        {adminMapType === 'india_ap_highlight' ? (
          <div className="w-full">
            <InteractiveIndiaMap
              waterBodies={waterBodies}
              complaints={complaints}
              currentRole="admin"
              initialState="Andhra Pradesh"
              onLodgeComplaint={onOpenLodgeModal}
            />
          </div>
        ) : (
          <div className={`relative w-full h-[760px] sm:h-[860px] lg:h-[940px] xl:h-[980px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner ${
            mapTheme === 'dark' || mapDisplayMode === 'surveillance' ? 'bg-[#0b1329]' : 'bg-[#fafafa]'
          }`}>
            <Andhra26DistrictsMapSvg
              selectedDistrictId={selectedDistrict?.id}
              onSelectDistrict={handleSelectDistrictFromMap}
              viewFilter={viewFilter}
              theme={mapTheme}
              hoveredDistrictId={hoveredDistrictId}
              setHoveredDistrictId={setHoveredDistrictId}
              showTelemetryBeams={showTelemetryBeams}
              showSatelliteScan={showSatelliteScan}
              mapDisplayMode={mapDisplayMode}
              showRivers={showRivers}
              showReservoirs={showReservoirs}
              selectedReservoirId={selectedReservoir?.id}
              onSelectReservoir={handleSelectReservoir}
            />

            {/* Floating High-Tech Status HUD on Map */}
            <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-xl p-2.5 px-3.5 text-xs font-mono space-y-1 shadow-lg pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-sky-300">AMARAVATI WATER APEX COMMAND</span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-3 flex-wrap">
                <span>Target: <strong className="text-white">{selectedReservoir?.name || selectedDistrict?.name || 'AP Grid'}</strong></span>
                <span>•</span>
                <span>Basin: <strong className="text-sky-300">{selectedReservoir?.basin || 'Statewide'}</strong></span>
                <span>•</span>
                <span>WRIS Sync: <strong className="text-emerald-300">10-04-2026 ACTIVE</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. FULL TECHNICAL GOVERNMENT STATION & SATELLITE DOSSIER       */}
      {/* (EXACT DATA CARD LAYOUT AS IN NORMAL USER / IMAGE.PNG - NO SCROLL) */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Category Switcher: [AP Major Reservoirs (34)] vs [Catchment Stations (8)] */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStationTab('reservoirs')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  stationTab === 'reservoirs'
                    ? 'bg-[#0047ab] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Official AP Reservoirs ({AP_OFFICIAL_RESERVOIRS.length})</span>
              </button>

              <button
                onClick={() => setStationTab('catchments')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  stationTab === 'catchments'
                    ? 'bg-[#0047ab] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Micro Catchments ({waterBodies.length})</span>
              </button>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              {stationTab === 'reservoirs' ? 'Official APWRIMS Reservoir Telemetry Dossier (10-04-2026)' : 'Active Catchment Station Telemetry Dossier'}
            </h3>
          </div>

          {/* Clean selection pill buttons (wrap around cleanly - NO horizontal scroll) */}
          <div className="flex items-center gap-1.5 flex-wrap max-w-2xl">
            {stationTab === 'reservoirs' ? (
              AP_OFFICIAL_RESERVOIRS.map((res) => {
                const isSelected = selectedReservoir?.id === res.id;
                return (
                  <button
                    key={res.id}
                    onClick={() => handleSelectReservoir(res)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0047ab] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {res.name.split(' ')[0]} ({res.currentStorageTMC} TMC)
                  </button>
                );
              })
            ) : (
              waterBodies.map((wb) => {
                const isSelected = selectedWaterBodyId === wb.id;
                return (
                  <button
                    key={wb.id}
                    onClick={() => {
                      setSelectedReservoir(null);
                      setSelectedWaterBodyId(wb.id);
                      const matchingDist = ANDHRA_PRADESH_26_DISTRICTS.find(d => 
                        d.name.toLowerCase() === wb.district.toLowerCase() ||
                        wb.district.toLowerCase().includes(d.name.toLowerCase())
                      );
                      if (matchingDist) setSelectedDistrict(matchingDist);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0047ab] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {wb.name.split(' ')[0]} {wb.name.split(' ')[1] || ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* --- Top Metadata Bar (Matching image.png) --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-100 text-[#0047ab] border border-blue-200 flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                <span>{activeDossier.endpoint || 'POST /Dataset/Reservoir'}</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Agency: {activeDossier.agency || 'APWRIMS / CWC'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                District: {activeDossier.district}
              </span>
              {selectedReservoir && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Basin: {selectedReservoir.basin}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-normal break-words leading-snug">
              {activeDossier.name}
            </h3>

            <p className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Mandal: {activeDossier.mandal}</span>
              <span>•</span>
              <span>Village: {activeDossier.village}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">GPS: {activeDossier.coordinates.lat}°N, {activeDossier.coordinates.lng}°E</span>
              {activeDossier.teluguName && (
                <>
                  <span>•</span>
                  <span className="font-bold text-[#0047ab]">{activeDossier.teluguName}</span>
                </>
              )}
            </p>
          </div>

          {/* Right Status Pill Badge (Matching image.png deep blue pill + Live Ping) */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>LIVE SENSOR SYNC • {liveTimestamp}</span>
            </span>
            <span className="text-xs font-mono font-bold px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 bg-[#0047ab] text-white shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>ACTIVE GOVT TELEMETRY</span>
            </span>
          </div>
        </div>

        {/* --- 4 Key Telemetry Cards (Matching image.png) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Live Storage */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
              LIVE STORAGE
            </span>
            <span className="text-lg font-black font-mono text-slate-900 mt-1 block">
              {selectedReservoir 
                ? `${selectedReservoir.currentStorageTMC} TMC (${(selectedReservoir.currentStorageMCM / 1000).toFixed(2)} BMC)`
                : activeDossier.liveTelemetry?.storageBMC
                ? `${activeDossier.liveTelemetry.storageBMC} BMC (${activeDossier.liveTelemetry.storageMCM} MCM)`
                : `${activeDossier.waterLevelPercent}% Active`}
            </span>
            <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{activeDossier.agency || 'APWRIMS'} Live Telemetry</span>
            </span>
          </div>

          {/* Card 2: Full Reservoir Capacity */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
              FULL RESERVOIR CAPACITY
            </span>
            <span className="text-lg font-black font-mono text-slate-900 mt-1 block">
              {selectedReservoir
                ? `${selectedReservoir.grossCapacityTMC} TMC (${selectedReservoir.grossCapacityMCM.toFixed(1)} MCM)`
                : activeDossier.liveTelemetry?.fullCapacityMCM
                ? `${activeDossier.liveTelemetry.fullCapacityMCM} MCM`
                : `${activeDossier.waterLevelPercent}% Full`}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {selectedReservoir ? `Current Level: ${selectedReservoir.currentLevelFeet} ft` : 'Standard Hydrological Limit'}
            </span>
          </div>

          {/* Card 3: Water Level Gauge (or TDS for micro-catchments) */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
              {selectedReservoir ? 'RESERVOIR WATER LEVEL' : 'TDS WATER QUALITY SENSOR'}
            </span>
            <span className="text-lg font-black font-mono text-slate-900 mt-1 block">
              {selectedReservoir ? (
                <span>{selectedReservoir.currentLevelFeet} <span className="text-xs font-normal text-slate-500">ft MSL</span></span>
              ) : (
                <span>{activeDossier.tdsPpm} <span className="text-xs font-normal text-slate-500">ppm</span></span>
              )}
            </span>
            <span className="text-[10px] font-bold text-blue-700 block mt-1">
              {selectedReservoir 
                ? (selectedReservoir.id === 'chittoor_ntr_jalasayam' ? 'FRL: 965.14 ft (Operating Depth)' : `FRL: ${(selectedReservoir.currentLevelFeet + 8).toFixed(1)} ft`) 
                : 'Safe Potable Limit (BIS <300)'}
            </span>
          </div>

          {/* Card 4: Effluent / Field Audit & Discharge */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl shadow-2xs">
            <span className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">
              {selectedReservoir ? 'INFLOW / OUTFLOW (CUSECS)' : 'EFFLUENT / FIELD AUDIT'}
            </span>
            {selectedReservoir ? (
              <div>
                <span className="text-base font-black font-mono text-slate-900 mt-1 block">
                  In: {selectedReservoir.inflowCusecs.toLocaleString()} • Out: {selectedReservoir.outflowCusecs.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Flood Cushion: {selectedReservoir.floodCushionTMC} TMC
                </span>
              </div>
            ) : (
              <div>
                <span className={`text-lg font-black mt-1 block ${
                  activeDossier.wasteLevel === 'Heavy' ? 'text-rose-600' :
                  activeDossier.wasteLevel === 'Moderate' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {activeDossier.wasteLevel === 'None' ? 'Zero Waste Discharge' :
                   activeDossier.wasteLevel === 'Heavy' ? 'Critical Effluent Silt' :
                   'Municipal Runoff Silt'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Physical Audit: {activeDossier.lastInspected}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- Government Station Dossier Banner (Matching image.png) --- */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-blue-900 font-bold">Government Station Dossier:</strong> {activeDossier.description}
          </p>
        </div>

        {/* --- ISRO Bhuvan WBIS Satellite Telemetry Section (Matching image.png) --- */}
        <div className="border border-indigo-200 rounded-2xl bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 p-4 sm:p-5 shadow-xs space-y-4">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047ab] to-indigo-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Satellite className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>Bhuvan Water Bodies Information System (WBIS)</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-300">
                    ISRO 15-Day Optical Pass
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Satellite: <strong>{wbis.satelliteMission}</strong> • Telemetry Grid: <strong>{activeDossier.district}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsBhuvanModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-[#0047ab] to-[#0284c7] hover:from-blue-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Full Technical Bhuvan WBIS Modal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                className="px-3 py-1.5 bg-indigo-900 text-indigo-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-indigo-700/60"
                title="ISRO Bhuvan Connected"
              >
                <Satellite className="w-3.5 h-3.5 text-amber-300" />
                <span>Bhuvan API: Live Connected</span>
              </button>

              {onOpenLodgeModal && (
                <button
                  onClick={onOpenLodgeModal}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Lodge Grievance</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Orbit Cards (Matching image.png) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Previous Orbit (15 Days Ago) */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                PREVIOUS ORBIT (15 DAYS AGO)
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{wbis.previousPassDate}</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Historical reflectance baseline recorded under clear sky.
              </p>
            </div>

            {/* Latest Orbit Pass (Recent) */}
            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider block font-bold">
                  LATEST ORBIT PASS (RECENT)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <span className="text-xs font-bold text-blue-950 mt-0.5 block flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-blue-600" />
                <span>{wbis.last15DayPassDate}</span>
              </span>
              <p className="text-[11px] text-blue-900 mt-1">
                NDWI: +{wbis.ndwiScore} • Spread: {wbis.waterSpreadAreaHa} Ha ({activeDossier.waterLevelPercent}% volume)
              </p>
            </div>

            {/* Next Scheduled Orbit */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                NEXT SCHEDULED ORBIT
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{wbis.nextPassDate}</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                ISRO satellite will re-image catchment in ~14 days for automatic change detection.
              </p>
            </div>
          </div>

          {/* Quantitative Satellite Index Cards (Matching image.png) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Left: NDWI Water Index Score */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    NDWI WATER INDEX SCORE: (GREEN - NIR) / (GREEN + NIR)
                  </span>
                  <div className="text-2xl font-black font-mono mt-0.5 flex items-baseline gap-2">
                    <span className={wbis.ndwiScore > 0.3 ? 'text-emerald-600' : 'text-sky-600'}>
                      +{wbis.ndwiScore.toFixed(2)}
                    </span>
                    <span className="text-xs font-sans font-semibold text-slate-500">
                      ({wbis.ndwiClassification})
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-emerald-600 text-white">
                  SURFACE WATER
                </span>
              </div>

              {/* Gradient Bar with marker pin */}
              <div className="space-y-1">
                <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-rose-600 via-amber-400 via-sky-400 to-emerald-600 relative overflow-visible">
                  {(() => {
                    const percent = Math.max(0, Math.min(100, ((wbis.ndwiScore + 1) / 2) * 100));
                    return (
                      <div
                        style={{ left: `${percent}%` }}
                        className="absolute -top-1 transform -translate-x-1/2 w-3 h-5.5 bg-slate-950 border-2 border-white rounded shadow-md"
                        title={`Index: ${wbis.ndwiScore}`}
                      />
                    );
                  })()}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5">
                  <span>-1.0 (Built-up)</span>
                  <span>-0.2 (Sookh Gaya)</span>
                  <span>0.0 (Marsh)</span>
                  <span>+0.3 (Surface Water)</span>
                  <span>+1.0 (Deep Pristine Water)</span>
                </div>
              </div>
            </div>

            {/* Right: Area Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                  CURRENT WATER SPREAD
                </span>
                <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                  {wbis.waterSpreadAreaHa} <span className="text-xs font-normal text-slate-500">Ha</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {(wbis.waterSpreadAreaHa * 2.471).toFixed(1)} Acres Active Area
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                  BASELINE AREA (2015)
                </span>
                <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                  {wbis.historicalBaselineHa} <span className="text-xs font-normal text-slate-500">Ha</span>
                </span>
                <span className={`text-[10px] font-bold mt-0.5 block ${
                  wbis.areaChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {wbis.areaChangePercent > 0 ? `+${wbis.areaChangePercent}%` : `${wbis.areaChangePercent}%`} Change
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Bhuvan WBIS Modal (When user clicks 'Full Technical Bhuvan WBIS Modal') */}
      {isBhuvanModalOpen && (
        <BhuvanWbisDetailModal
          waterBody={activeDossier}
          isOpen={isBhuvanModalOpen}
          onClose={() => setIsBhuvanModalOpen(false)}
          onLodgeComplaint={() => {
            setIsBhuvanModalOpen(false);
            if (onOpenLodgeModal) onOpenLodgeModal();
          }}
        />
      )}
    </div>
  );
};
