import React, { useState, useEffect, useCallback } from 'react';
import { WaterBody, WaterBodyStatusColor } from '../types/nirikshan';
import { PARVATHIPURAM_ALL_MANDAL_WATER_BODIES } from '../data/parvathipuramMandalsWaterData';
import { 
  Plus,
  Minus,
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move
} from 'lucide-react';

export interface ParvathipuramMandalData {
  id: string;
  name: string;
  teluguName: string;
  category: 'Tribal / Hilly' | 'River Basin' | 'Urban' | 'Agricultural';
  svgPath: string;
  center: { x: number; y: number };
  statusColor: WaterBodyStatusColor;
  statusLabel: string;
  groundwaterDepthMbgl: number;
  waterBodiesCount: number;
  primaryWaterBody: string;
  primaryRiver: string;
  riverBasin: string;
  aquiferStatus: string;
  rechargeStructuresCount: number;
}

// 15 Cadastral Mandals of Parvathipuram Manyam District matching official map
export const PARVATHIPURAM_MANDALS: ParvathipuramMandalData[] = [
  // 1. Komarada (North-west, Nagavali entry from Odisha, Janjavathi dam)
  {
    id: 'komarada',
    name: 'Komarada',
    teluguName: 'కొమరాడ',
    category: 'Tribal / Hilly',
    svgPath: 'M 350,140 L 410,120 L 450,90 L 500,120 L 520,185 L 475,225 L 430,220 L 375,210 Z',
    center: { x: 440, y: 165 },
    statusColor: 'green',
    statusLabel: '3. Good Condition (Janjavathi Rubber Dam - 42.5 MCM)',
    groundwaterDepthMbgl: 4.8,
    waterBodiesCount: 44,
    primaryWaterBody: 'Janjavathi Rubber Dam & Reservoir',
    primaryRiver: 'Janjavathi / Nagavali River',
    riverBasin: 'Nagavali Upper Sub-basin',
    aquiferStatus: 'Fractured Hard-rock & Alluvium (Safe)',
    rechargeStructuresCount: 38,
  },

  // 2. Gummalakshmipuram (North-east Agency Hills, Gomukhi stream)
  {
    id: 'gummalakshmipuram',
    name: 'Gummalakshmipuram',
    teluguName: 'గుమ్మలక్ష్మీపురం',
    category: 'Tribal / Hilly',
    svgPath: 'M 500,120 L 550,70 L 640,35 L 720,80 L 760,165 L 720,200 L 610,180 L 520,185 Z',
    center: { x: 630, y: 125 },
    statusColor: 'green',
    statusLabel: '3. Good Condition (Pristine Eastern Ghats Spring Watershed)',
    groundwaterDepthMbgl: 4.2,
    waterBodiesCount: 52,
    primaryWaterBody: 'Bhadra Giri Forest Springs & Gomukhi Headwaters',
    primaryRiver: 'Gomukhi Hill Stream',
    riverBasin: 'Eastern Ghats Forest Watershed',
    aquiferStatus: 'Pristine Forest Hill Aquifer',
    rechargeStructuresCount: 46,
  },

  // 3. Kurupam (East, Konda Cheruvu, DWLR monitoring)
  {
    id: 'kurupam',
    name: 'Kurupam',
    teluguName: 'కురుపాం',
    category: 'Tribal / Hilly',
    svgPath: 'M 580,185 L 720,200 L 790,240 L 775,320 L 705,325 L 630,270 L 580,240 Z',
    center: { x: 685, y: 255 },
    statusColor: 'green',
    statusLabel: '3. Good Condition (Dense Sal Forest Recharge • DWLR 4.8 mbgl)',
    groundwaterDepthMbgl: 4.8,
    waterBodiesCount: 48,
    primaryWaterBody: 'Kurupam Palace Konda Cheruvu & CGWB DWLR',
    primaryRiver: 'Jhanjavathi Tributary',
    riverBasin: 'Nagavali Forest Catchment',
    aquiferStatus: 'High Recharge Forest Table',
    rechargeStructuresCount: 42,
  },

  // 4. Bhamini (Far East, border with Odisha & Srikakulam)
  {
    id: 'bhamini',
    name: 'Bhamini',
    teluguName: 'భామిని',
    category: 'Agricultural',
    svgPath: 'M 790,240 L 865,220 L 895,300 L 850,370 L 775,320 Z',
    center: { x: 840, y: 295 },
    statusColor: 'yellow',
    statusLabel: '4. Medium (Interstate Boundary Flow • Seasonal Silt)',
    groundwaterDepthMbgl: 7.9,
    waterBodiesCount: 28,
    primaryWaterBody: 'Bhamini Border Stream & Vamsadhara Feeder Tank',
    primaryRiver: 'Vamsadhara Basin Feeder',
    riverBasin: 'Vamsadhara Sub-basin',
    aquiferStatus: 'Semi-critical Seasonal Drawdown',
    rechargeStructuresCount: 26,
  },

  // 5. Jiyyammavalasa (Central, between Komarada, Kurupam & Garugubilli)
  {
    id: 'jiyyammavalasa',
    name: 'Jiyyammavalasa',
    teluguName: 'జియ్యమ్మవలస',
    category: 'River Basin',
    svgPath: 'M 475,225 L 580,185 L 630,270 L 595,320 L 530,310 L 485,270 Z',
    center: { x: 550, y: 260 },
    statusColor: 'blue',
    statusLabel: '5. Normal (Active Nagavali Floodplain Aquifer)',
    groundwaterDepthMbgl: 6.5,
    waterBodiesCount: 38,
    primaryWaterBody: 'Chinna Merangi Nagavali Floodplain Tank',
    primaryRiver: 'Nagavali River',
    riverBasin: 'Nagavali Middle Basin',
    aquiferStatus: 'Safe Alluvial Sand Aquifer',
    rechargeStructuresCount: 34,
  },

  // 6. Parvathipuram (District Headquarter, urban catchment, railway & highway junction)
  {
    id: 'parvathipuram',
    name: 'Parvathipuram (HQ)',
    teluguName: 'పార్వతీపురం',
    category: 'Urban',
    svgPath: 'M 380,215 L 485,220 L 490,285 L 430,320 L 370,290 L 350,245 Z',
    center: { x: 425, y: 265 },
    statusColor: 'yellow',
    statusLabel: '4. Medium (District HQ Urban Water Hub • TDS 480 ppm)',
    groundwaterDepthMbgl: 7.8,
    waterBodiesCount: 46,
    primaryWaterBody: 'Nagavali River Parvathipuram Gauge & Municipal Basin',
    primaryRiver: 'Nagavali River Corridor',
    riverBasin: 'Parvathipuram Urban Command',
    aquiferStatus: 'Moderate Urban Pumping (Semi-critical)',
    rechargeStructuresCount: 40,
  },

  // 7. Garugubilli (Home of Thotapalli Barrage 78.2 MCM)
  {
    id: 'garugubilli',
    name: 'Garugubilli',
    teluguName: 'గరుగుబిల్లి',
    category: 'River Basin',
    svgPath: 'M 490,285 L 595,320 L 610,380 L 545,410 L 480,360 L 430,320 Z',
    center: { x: 535, y: 350 },
    statusColor: 'green',
    statusLabel: '3. Good Condition (THOTAPALLI BARRAGE: 78.2 MCM Active Storage)',
    groundwaterDepthMbgl: 4.5,
    waterBodiesCount: 62,
    primaryWaterBody: 'THOTAPALLI BARRAGE (78.2 MCM - Nagavali River)',
    primaryRiver: 'Nagavali River Main Channel',
    riverBasin: 'Thotapalli Reservoir Command',
    aquiferStatus: 'High Storage Alluvium (Safe)',
    rechargeStructuresCount: 56,
  },

  // 8. Seethanagaram (South of Parvathipuram town, Suvarnamukhi connection)
  {
    id: 'seethanagaram',
    name: 'Seethanagaram',
    teluguName: 'సీతానగరం',
    category: 'Agricultural',
    svgPath: 'M 365,290 L 430,320 L 465,390 L 390,420 L 330,370 Z',
    center: { x: 400, y: 355 },
    statusColor: 'yellow',
    statusLabel: '4. Medium (Suvarnamukhi Irrigation Feeder • 8.4 mbgl)',
    groundwaterDepthMbgl: 8.4,
    waterBodiesCount: 36,
    primaryWaterBody: 'Sitanagaram Suvarnamukhi Canal Intake',
    primaryRiver: 'Suvarnamukhi River',
    riverBasin: 'Suvarnamukhi Basin',
    aquiferStatus: 'Semi-critical Drawdown',
    rechargeStructuresCount: 32,
  },

  // 9. Makkuva (West, Vengalaraya Sagaram Project)
  {
    id: 'makkuva',
    name: 'Makkuva',
    teluguName: 'మక్కువ',
    category: 'River Basin',
    svgPath: 'M 255,275 L 365,290 L 330,370 L 265,420 L 205,360 L 220,310 Z',
    center: { x: 285, y: 345 },
    statusColor: 'green',
    statusLabel: '3. Good Condition (VENGALARAYA SAGARAM DAM: 34.5 MCM Live)',
    groundwaterDepthMbgl: 5.1,
    waterBodiesCount: 42,
    primaryWaterBody: 'VENGALARAYA SAGARAM DAM (Suvarnamukhi)',
    primaryRiver: 'Suvarnamukhi River',
    riverBasin: 'Suvarnamukhi Catchment Project',
    aquiferStatus: 'High Recharge Dam Watershed (Safe)',
    rechargeStructuresCount: 44,
  },

  // 10. Salur (South-west, Vegavali river, Rompalle, NH 26)
  {
    id: 'salur',
    name: 'Salur',
    teluguName: 'సాలూరు',
    category: 'Agricultural',
    svgPath: 'M 140,360 L 255,365 L 265,420 L 235,510 L 150,500 L 105,420 Z',
    center: { x: 190, y: 440 },
    statusColor: 'red',
    statusLabel: '2. Danger Zone (Vegavati Flash Silt & Effluent TDS 1240 ppm)',
    groundwaterDepthMbgl: 9.8,
    waterBodiesCount: 48,
    primaryWaterBody: 'Vegavati Basin Silt & Municipal Effluent Sluice',
    primaryRiver: 'Vegavali River',
    riverBasin: 'Vegavali Sub-catchment',
    aquiferStatus: 'High Contamination & Silt Choke Risk',
    rechargeStructuresCount: 38,
  },

  // 11. Pachipenta (South-westernmost hill thumb, Peddagedda reservoir)
  {
    id: 'pachipenta',
    name: 'Pachipenta',
    teluguName: 'పాచిపెంట',
    category: 'Tribal / Hilly',
    svgPath: 'M 105,420 L 150,500 L 235,510 L 220,610 L 140,630 L 75,540 Z',
    center: { x: 155, y: 550 },
    statusColor: 'blue',
    statusLabel: '5. Normal (Peddagedda Reservoir Catchment • 12.8 MCM)',
    groundwaterDepthMbgl: 5.8,
    waterBodiesCount: 34,
    primaryWaterBody: 'Peddagedda Hill Reservoir & Springs',
    primaryRiver: 'Peddagedda Mountain Stream',
    riverBasin: 'Eastern Ghats Southern Foothill',
    aquiferStatus: 'Safe Mountain Aquifer',
    rechargeStructuresCount: 30,
  },

  // 12. Veera Ghattam (Veeraghattam - South-east of Garugubilli, along SH 37)
  {
    id: 'veeraghattam',
    name: 'Veera Ghattam',
    teluguName: 'వీరఘట్టం',
    category: 'River Basin',
    svgPath: 'M 545,410 L 610,380 L 690,440 L 660,510 L 595,490 L 545,440 Z',
    center: { x: 620, y: 450 },
    statusColor: 'blue',
    statusLabel: '5. Normal (Thotapalli Right Main Canal Command)',
    groundwaterDepthMbgl: 6.2,
    waterBodiesCount: 39,
    primaryWaterBody: 'Veeraghattam Nagavali Regulator & Sluice',
    primaryRiver: 'Nagavali River',
    riverBasin: 'Lower Nagavali Plain',
    aquiferStatus: 'Safe River Sand Aquifer',
    rechargeStructuresCount: 36,
  },

  // 13. Palakonda (South-east, SH 37 to Srikakulam border)
  {
    id: 'palakonda',
    name: 'Palakonda',
    teluguName: 'పాలకొండ',
    category: 'Agricultural',
    svgPath: 'M 660,510 L 750,470 L 820,535 L 770,610 L 685,580 Z',
    center: { x: 745, y: 545 },
    statusColor: 'blue',
    statusLabel: '5. Normal (Active Alluvial Command • 32 Irrigation Tanks)',
    groundwaterDepthMbgl: 6.4,
    waterBodiesCount: 45,
    primaryWaterBody: 'Palakonda Town Cheruvu & Canal System',
    primaryRiver: 'Nagavali Delta Channels',
    riverBasin: 'Palakonda Alluvial Command',
    aquiferStatus: 'Safe Alluvial Aquifer',
    rechargeStructuresCount: 40,
  },

  // 14. Seethampeta (Agency tribal hill tract, north of Palakonda)
  {
    id: 'seethampeta',
    name: 'Seethampeta',
    teluguName: 'సీతంపేట',
    category: 'Tribal / Hilly',
    svgPath: 'M 705,325 L 850,370 L 870,470 L 750,470 L 690,440 Z',
    center: { x: 775, y: 410 },
    statusColor: 'red',
    statusLabel: '2. Danger Zone (Check Dam #4 Masonry Breach & Silt Hazard)',
    groundwaterDepthMbgl: 11.8,
    waterBodiesCount: 50,
    primaryWaterBody: 'Seethampeta Check Dam #4 (Breached Bund)',
    primaryRiver: 'Polla Tribal Hill Stream',
    riverBasin: 'Seethampeta Agency Catchment',
    aquiferStatus: 'Flash Flood Scour & Debris Hazard',
    rechargeStructuresCount: 48,
  },

  // 15. Balijipeta Border (Border zone adjacent to Vizianagaram)
  {
    id: 'balijipeta_border',
    name: 'Balijipeta Border',
    teluguName: 'బలిజిపేట సరిహద్దు',
    category: 'Agricultural',
    svgPath: 'M 390,420 L 465,390 L 545,410 L 545,440 L 490,490 L 410,470 Z',
    center: { x: 470, y: 445 },
    statusColor: 'green',
    statusLabel: '3. Good Condition (Suvarnamukhi Perennial Channel Link)',
    groundwaterDepthMbgl: 4.9,
    waterBodiesCount: 31,
    primaryWaterBody: 'Suvarnamukhi Border Canal Feeder',
    primaryRiver: 'Suvarnamukhi River Feeder',
    riverBasin: 'Suvarnamukhi Basin',
    aquiferStatus: 'Safe Shallow Table',
    rechargeStructuresCount: 28,
  },
];

interface ParvathipuramCadastralMapSvgProps {
  waterBodies: WaterBody[];
  activeWaterBody: WaterBody | null;
  hoveredWaterBody: WaterBody | null;
  onSelectWaterBody: (wb: WaterBody) => void;
  onSelectMandal?: (mandal: ParvathipuramMandalData) => void;
  selectedMandalId: string | null;
  viewFilter?: 'all' | 'extinct' | 'red' | 'green' | 'yellow' | 'blue';
  theme: 'light' | 'dark';
  showRivers?: boolean;
  onSwitchDistrict?: (district: string) => void;
  onLodgeComplaint?: () => void;
}

export const ParvathipuramCadastralMapSvg: React.FC<ParvathipuramCadastralMapSvgProps> = ({
  waterBodies,
  activeWaterBody,
  hoveredWaterBody,
  onSelectWaterBody,
  onSelectMandal,
  selectedMandalId,
  viewFilter = 'all',
  theme,
  showRivers = true,
  onSwitchDistrict,
  onLodgeComplaint,
}) => {
  const [hoveredMandal, setHoveredMandal] = useState<ParvathipuramMandalData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoomLevel(prev => Math.max(0.6, Math.min(prev * factor, 3.5)));
  };

  // Drag Panning Handlers (Aage-Piche, Upar-Neeche)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const panStep = 80;
  const panDirection = (dir: 'up' | 'down' | 'left' | 'right') => {
    setPanOffset(prev => {
      switch (dir) {
        case 'up': return { ...prev, y: prev.y + panStep };
        case 'down': return { ...prev, y: prev.y - panStep };
        case 'left': return { ...prev, x: prev.x + panStep };
        case 'right': return { ...prev, x: prev.x - panStep };
      }
    });
  };

  // Distinct cadastral tones for adjacent mandals with 5-color filter highlighting
  const getMandalFill = (mandal: ParvathipuramMandalData) => {
    const isSelected = selectedMandalId === mandal.id;
    const isHovered = hoveredMandal?.id === mandal.id;

    if (isSelected) return '#bae6fd'; // Bright selection blue
    if (isHovered) return '#fed7aa'; // Bright hover saffron

    // If 5-Color condition filter is active, highlight matching mandals and subtly dim others
    if (viewFilter && viewFilter !== 'all') {
      const isMatch = (viewFilter === 'extinct' && mandal.statusColor === 'grey') ||
                      (viewFilter === 'red' && mandal.statusColor === 'red') ||
                      (viewFilter === 'green' && mandal.statusColor === 'green') ||
                      (viewFilter === 'yellow' && mandal.statusColor === 'yellow') ||
                      (viewFilter === 'blue' && mandal.statusColor === 'blue');
      if (!isMatch) {
        return '#f1f5f9'; // soft dim for non-matching mandals
      }
    }

    switch (mandal.id) {
      case 'komarada':
      case 'veeraghattam':
        return '#e0f2fe'; // soft sky
      case 'gummalakshmipuram':
      case 'pachipenta':
        return '#dcfce7'; // soft mint / green
      case 'kurupam':
      case 'seethanagaram':
        return '#fef3c7'; // soft yellow
      case 'bhamini':
      case 'salur':
        return '#ffe4e6'; // soft rose
      case 'jiyyammavalasa':
      case 'palakonda':
        return '#dbeafe'; // soft periwinkle
      case 'parvathipuram':
        return '#fed7aa'; // light saffron
      case 'garugubilli':
        return '#d1fae5'; // rich emerald
      case 'makkuva':
        return '#e0e7ff'; // soft indigo
      case 'seethampeta':
        return '#fee2e2'; // light red
      case 'balijipeta_border':
        return '#f1f5f9';
      default:
        return '#f8fafc';
    }
  };

  const handleMandalClick = (mandal: ParvathipuramMandalData) => {
    if (onSelectMandal) onSelectMandal(mandal);
    const mandalWb = PARVATHIPURAM_ALL_MANDAL_WATER_BODIES[mandal.id];
    if (mandalWb && onSelectWaterBody) {
      onSelectWaterBody(mandalWb);
    }
    // Directly scroll down to the full telemetry dossier below the map without any popup card blocking view
    setTimeout(() => {
      const el = document.getElementById('apwrims-dossier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  const handleRiverClick = (riverName: string, description: string, discharge: string, level: string, danger: string) => {
    const riverWb = Object.values(PARVATHIPURAM_ALL_MANDAL_WATER_BODIES).find(
      w => w.name.toLowerCase().includes(riverName.toLowerCase()) || w.description.toLowerCase().includes(riverName.toLowerCase())
    ) || PARVATHIPURAM_ALL_MANDAL_WATER_BODIES['garugubilli'];
    if (riverWb && onSelectWaterBody) {
      onSelectWaterBody({
        ...riverWb,
        name: `${riverName} Basin Gauge`,
        description,
        liveTelemetry: {
          ...riverWb.liveTelemetry,
          dischargeCusecs: parseInt(discharge) || 1850,
          waterLevelM: parseFloat(level) || 106.5,
          dangerLevelM: parseFloat(danger) || 108.0,
        }
      });
    }
    setTimeout(() => {
      const el = document.getElementById('apwrims-dossier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  const handleBorderClick = (regionName: string, info: string) => {
    if (regionName === 'VIZIANAGARAM' && onSwitchDistrict) {
      onSwitchDistrict('Vizianagaram');
      return;
    }
    setTimeout(() => {
      const el = document.getElementById('apwrims-dossier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-2xl bg-[#f8fafc]">
      {/* 5-Color Verified Condition Legend in Top-Left (Non-blocking) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-300 shadow-sm text-[11px] font-bold">
        <span className="text-slate-500 font-mono uppercase text-[10px] mr-1 hidden sm:inline">Condition:</span>
        <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span>1. Extinct</span>
        </span>
        <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>2. Danger Zone</span>
        </span>
        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>3. Good</span>
        </span>
        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>4. Medium</span>
        </span>
        <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>5. Normal</span>
        </span>
      </div>

      {/* Directional Pad and Zoom Controls on Top-Right */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 shadow-md">
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Zoom In (+)"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-700 px-1 min-w-[36px] text-center select-none">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.25))}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Zoom Out (-)"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Reset View (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Directional Pad (Aage / Piche / Upar / Neeche) */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center gap-1">
          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Move className="w-3 h-3 text-sky-600" />
            <span>Pan Map</span>
          </span>
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button
              onClick={() => panDirection('up')}
              title="Pan Up (Upar)"
              className="p-1 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <div></div>
            <button
              onClick={() => panDirection('left')}
              title="Pan Left (Piche / Baye)"
              className="p-1 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              title="Center"
              className="p-1 rounded-md bg-slate-200 text-slate-800 text-[9px] font-bold cursor-pointer"
            >
              •
            </button>
            <button
              onClick={() => panDirection('right')}
              title="Pan Right (Aage / Daye)"
              className="p-1 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div></div>
            <button
              onClick={() => panDirection('down')}
              title="Pan Down (Neeche)"
              className="p-1 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <div></div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SVG CANVAS (PARVATHIPURAM MANYAM 15-MANDAL CADASTRAL GRID)      */}
      {/* ============================================================== */}
      <svg
        viewBox="0 0 950 680"
        onMouseDown={handleMouseDown}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          <pattern id="pvmGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="0.8" />
          </pattern>
        </defs>

        <rect width="950" height="680" fill="url(#pvmGridPattern)" />

        {/* ============================================================== */}
        {/* SURROUNDING BORDER REGIONS (CLICKABLE NAVIGATION)              */}
        {/* ============================================================== */}
        <g id="pvm-border-regions">
          {/* Odisha Border (North & West) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('ODISHA', 'Interstate Eastern Ghats boundary with Odisha. Upper catchments of Nagavali, Janjavathi, and Suvarnamukhi.')}
          >
            <rect x="25" y="160" width="130" height="38" rx="8" fill="rgba(241, 245, 249, 0.8)" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="90" y="184" fill="#475569" fontSize="13" fontWeight="900" letterSpacing="3" textAnchor="middle">
              ODISHA
            </text>
          </g>

          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('ODISHA', 'Northern Interstate Eastern Ghats boundary with Odisha highlands.')}
          >
            <rect x="520" y="25" width="140" height="32" rx="8" fill="rgba(241, 245, 249, 0.8)" stroke="#cbd5e1" strokeWidth="1" />
            <text x="590" y="46" fill="#475569" fontSize="11" fontWeight="900" letterSpacing="2.5" textAnchor="middle">
              ODISHA ↗
            </text>
          </g>

          {/* Vizianagaram Border (South) - Click to Switch Back */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('VIZIANAGARAM', 'Vizianagaram District. Click to switch view and inspect 28 Mandals and Tatipudi Dam.')}
          >
            <rect x="420" y="630" width="220" height="38" rx="10" fill="rgba(241, 245, 249, 0.9)" stroke="#93c5fd" strokeWidth="1.5" className="group-hover:fill-blue-50" />
            <text x="530" y="654" fill="#1e3a8a" fontSize="11.5" fontWeight="900" letterSpacing="2" textAnchor="middle">
              VIZIANAGARAM DISTRICT ↙
            </text>
          </g>

          {/* Srikakulam Border (South-East) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('SRIKAKULAM', 'Srikakulam District downstream boundary along Nagavali and Vamsadhara river basins.')}
          >
            <rect x="805" y="580" width="130" height="36" rx="8" fill="rgba(241, 245, 249, 0.8)" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="870" y="603" fill="#475569" fontSize="11" fontWeight="900" letterSpacing="2" textAnchor="middle">
              SRIKAKULAM ↘
            </text>
          </g>
        </g>

        {/* ============================================================== */}
        {/* 15 CADASTRAL MANDAL POLYGONS                                   */}
        {/* ============================================================== */}
        <g id="pvm-mandals-layer">
          {PARVATHIPURAM_MANDALS.map((mandal) => {
            const isSelected = selectedMandalId === mandal.id;
            const isHovered = hoveredMandal?.id === mandal.id;
            const fill = getMandalFill(mandal);

            return (
              <g
                key={mandal.id}
                className="cursor-pointer transition-all duration-150"
                onClick={() => handleMandalClick(mandal)}
                onMouseEnter={() => setHoveredMandal(mandal)}
                onMouseLeave={() => setHoveredMandal(null)}
              >
                {/* Cadastral Polygon with Crisp Dark Border for clear visibility */}
                <path
                  d={mandal.svgPath}
                  fill={fill}
                  stroke={isSelected ? '#0284c7' : isHovered ? '#0f172a' : '#334155'}
                  strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.8'}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  filter={isSelected ? 'drop-shadow(0 4px 10px rgba(2, 132, 199, 0.4))' : undefined}
                />

                {/* Mandal Name Label (Clean White Halo + Ultra-Bold Text) */}
                <text
                  x={mandal.center.x}
                  y={mandal.center.y - 7}
                  textAnchor="middle"
                  fontSize={mandal.id === 'parvathipuram' ? '12.5' : '10.5'}
                  fontWeight="900"
                  fill="#0f172a"
                  paintOrder="stroke"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none select-none tracking-tight font-sans"
                >
                  {mandal.name}
                </text>

                {/* Mandal Telugu Sub-label (Clear White Halo) */}
                <text
                  x={mandal.center.x}
                  y={mandal.center.y + 6}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="800"
                  fill="#1e293b"
                  paintOrder="stroke"
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none select-none font-sans"
                >
                  {mandal.teluguName.split(' ')[0]}
                </text>

                {/* Dedicated Water Body Node with 5-Color Standards */}
                {(() => {
                  const nodeY = mandal.center.y + 20;
                  const isExtinct = mandal.statusColor === 'grey';
                  const isRed = mandal.statusColor === 'red';
                  const isGreen = mandal.statusColor === 'green';
                  const isYellow = mandal.statusColor === 'yellow';
                  const isBlue = mandal.statusColor === 'blue';

                  const pinColor = isExtinct
                    ? '#64748b'
                    : isRed
                    ? '#ef4444'
                    : isGreen
                    ? '#10b981'
                    : isYellow
                    ? '#f59e0b'
                    : '#0284c7';

                  return (
                    <g
                      transform={`translate(${mandal.center.x}, ${nodeY})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMandalClick(mandal);
                      }}
                    >
                      {/* Pulse Ring for Selected or Danger Alert */}
                      {(isSelected || isRed) && (
                        <circle cx="0" cy="0" r="14" fill="none" stroke={pinColor} strokeWidth="1.8" strokeDasharray="3 3">
                          <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Extinct Dashed Halo */}
                      {isExtinct && (
                        <circle cx="0" cy="0" r="11" fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 2" />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx="0"
                        cy="0"
                        r={isSelected ? '7' : '5.5'}
                        fill={pinColor}
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.35))"
                      />

                      {/* Icon symbol: ✕ for Extinct, ! for Danger, 💧 for Water */}
                      <text x="0" y={isExtinct ? "2" : isRed ? "2.2" : "2.5"} fontSize={isExtinct ? "6.5" : isRed ? "6" : "6"} fill="#ffffff" textAnchor="middle" className="select-none pointer-events-none font-bold">
                        {isExtinct ? '✕' : isRed ? '!' : '💧'}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </g>

        {/* ============================================================== */}
        {/* MAJOR RIVERS (ANIMATED FLOW + CLICKABLE BASINS)                */}
        {/* ============================================================== */}
        {showRivers && (
          <g id="pvm-rivers-layer">
            {/* 1. Nagavali River (The Main Arterial Lifeline) */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Nagavali River', 'Major perennial river flowing through Komarada, Jiyyammavalasa, Garugubilli (Thotapalli Barrage) and Veeraghattam to Srikakulam.', '3071 Cusecs', '106.5 m', '108.0 m')}
            >
              {/* Wide invisible click target */}
              <path d="M 480,90 Q 520,180 540,290 T 580,360 Q 640,430 720,530" fill="none" stroke="transparent" strokeWidth="24" />
              {/* Visible animated river line */}
              <path d="M 480,90 Q 520,180 540,290 T 580,360 Q 640,430 720,530" fill="none" stroke="#0284c7" strokeWidth="4.8" strokeLinecap="round" />
            </g>

            {/* 2. Suvarnamukhi River */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Suvarnamukhi River', 'Rises in Eastern Ghats hills of Makkuva, impounded at Vengalaraya Sagaram Dam, flows past Seethanagaram.', '250 Cusecs', '159.4 m', '162.0 m')}
            >
              <path d="M 230,340 Q 290,370 380,380 T 470,410" fill="none" stroke="transparent" strokeWidth="22" />
              <path d="M 230,340 Q 290,370 380,380 T 470,410" fill="none" stroke="#0284c7" strokeWidth="3.8" strokeLinecap="round" />
            </g>

            {/* 3. Vegavali River */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Vegavali River', 'Originates in Pachipenta Eastern Ghats hills, flows through Salur weir towards Bobbili and Vizianagaram.', '340 Cusecs', '9.8 m', '14.0 m')}
            >
              <path d="M 120,580 Q 170,510 200,450 T 260,490" fill="none" stroke="transparent" strokeWidth="22" />
              <path d="M 120,580 Q 170,510 200,450 T 260,490" fill="none" stroke="#0284c7" strokeWidth="3.6" strokeLinecap="round" />
            </g>

            {/* 4. Janjavathi River (Tributary with Rubber Dam) */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Janjavathi River', 'Tributary of Nagavali flowing from Odisha border into Janjavathi Rubber Dam near Komarada.', '450 Cusecs', '132.8 m', '135.0 m')}
            >
              <path d="M 370,160 Q 420,180 480,210" fill="none" stroke="transparent" strokeWidth="20" />
              <path d="M 370,160 Q 420,180 480,210" fill="none" stroke="#0284c7" strokeWidth="3.2" strokeLinecap="round" />
            </g>

            {/* Animated Flow Droplets along rivers */}
            <circle r="4.5" fill="#38bdf8" className="pointer-events-none">
              <animateMotion path="M 480,90 Q 520,180 540,290 T 580,360 Q 640,430 720,530" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle r="3.8" fill="#38bdf8" className="pointer-events-none">
              <animateMotion path="M 230,340 Q 290,370 380,380 T 470,410" dur="4.2s" repeatCount="indefinite" />
            </circle>
            <circle r="3.6" fill="#38bdf8" className="pointer-events-none">
              <animateMotion path="M 120,580 Q 170,510 200,450 T 260,490" dur="4.6s" repeatCount="indefinite" />
            </circle>

            {/* River Labels (100% Readable with crisp white halo) */}
            <text 
              x="570" 
              y="225" 
              fill="#0369a1" 
              fontSize="11" 
              fontWeight="bold" 
              fontStyle="italic" 
              paintOrder="stroke" 
              stroke="#ffffff" 
              strokeWidth="3.5"
              transform="rotate(65, 570, 225)"
              className="pointer-events-none select-none"
            >
              Nagavali River 🌊
            </text>
            <text 
              x="300" 
              y="360" 
              fill="#0369a1" 
              fontSize="10.5" 
              fontWeight="bold" 
              fontStyle="italic" 
              paintOrder="stroke" 
              stroke="#ffffff" 
              strokeWidth="3"
              className="pointer-events-none select-none"
            >
              Suvarnamukhi River 🌊
            </text>
            <text 
              x="145" 
              y="485" 
              fill="#0369a1" 
              fontSize="10.5" 
              fontWeight="bold" 
              fontStyle="italic" 
              paintOrder="stroke" 
              stroke="#ffffff" 
              strokeWidth="3"
              className="pointer-events-none select-none"
            >
              Vegavali River 🌊
            </text>
          </g>
        )}

        {/* ============================================================== */}
        {/* PROMINENT KEY RESERVOIRS & DAMS (INTERACTIVE NODES)             */}
        {/* ============================================================== */}
        <g id="pvm-prominent-reservoirs">
          {/* 1. THOTAPALLI BARRAGE (Garugubilli) */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = PARVATHIPURAM_MANDALS.find(item => item.id === 'garugubilli');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="580" cy="365" rx="22" ry="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" filter="drop-shadow(0 2px 6px rgba(2,132,199,0.5))" />
            <circle cx="580" cy="365" r="5" fill="#38bdf8" />
            <g transform="translate(505, 335)">
              <rect width="150" height="22" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
              <text x="75" y="15" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                🌊 Thotapalli Barrage (78.2 MCM)
              </text>
            </g>
          </g>

          {/* 2. VENGALARAYA SAGARAM DAM (Makkuva) */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = PARVATHIPURAM_MANDALS.find(item => item.id === 'makkuva');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="270" cy="385" rx="16" ry="11" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <circle cx="270" cy="385" r="4" fill="#60a5fa" />
            <g transform="translate(200, 400)">
              <rect width="140" height="19" rx="5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
              <text x="70" y="13.5" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                💧 Vengalaraya Dam (34.5 MCM)
              </text>
            </g>
          </g>

          {/* 3. JANJAVATHI RUBBER DAM (Komarada) */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = PARVATHIPURAM_MANDALS.find(item => item.id === 'komarada');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="430" cy="195" rx="15" ry="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <circle cx="430" cy="195" r="4" fill="#38bdf8" />
            <g transform="translate(365, 168)">
              <rect width="130" height="18" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="65" y="13" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                💧 Janjavathi Rubber Dam
              </text>
            </g>
          </g>

          {/* 4. PEDDAGEDDA RESERVOIR (Pachipenta) */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = PARVATHIPURAM_MANDALS.find(item => item.id === 'pachipenta');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="150" cy="570" rx="14" ry="9" fill="#0284c7" stroke="#ffffff" strokeWidth="1.8" />
            <g transform="translate(95, 585)">
              <rect width="115" height="17" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="57" y="12" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                💧 Peddagedda (12.8 MCM)
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
