import React, { useState } from 'react';
import { ANDHRA_PRADESH_26_DISTRICTS, STATE_COMMAND_HUB, TELEMETRY_NETWORK_BEAMS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { AP_OFFICIAL_RESERVOIRS, APReservoirRecord } from '../data/apReservoirsData';
import { AP_DISTRICT_RAINFALL_SUMMARIES } from '../data/apMandalWiseRainfall2026';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export type MapDisplayMode = 
  | 'cadastral'       // Alternating Saffron & Gold Cadastral (matching reference image)
  | 'surveillance'    // Dark Futuristic Cyber Grid (video animation style)
  | 'ndwi_satellite'  // ISRO Bhuvan NDWI Satellite False Color (water cyan/blue, land dark)
  | 'wris_storage'    // Live India-WRIS Reservoir Storage % Heatmap
  | 'dwlr_groundwater' // CGWB Groundwater Table Depth Heatmap
  | 'rainfall';       // AP Monsoon Cumulative Rainfall & Departure Heatmap

interface Andhra26DistrictsMapSvgProps {
  selectedDistrictId?: string;
  onSelectDistrict: (district: DistrictTelemetry) => void;
  viewFilter: 'all' | 'alerts' | 'active';
  theme: 'light' | 'dark';
  hoveredDistrictId: string | null;
  setHoveredDistrictId: (id: string | null) => void;
  showTelemetryBeams?: boolean;
  showSatelliteScan?: boolean;
  mapDisplayMode?: MapDisplayMode;
  showRivers?: boolean;
  showReservoirs?: boolean;
  selectedReservoirId?: string;
  onSelectReservoir?: (reservoir: APReservoirRecord) => void;
}

// Major Andhra Pradesh River Network Paths (Connecting across districts to Bay of Bengal)
const ANDHRA_RIVERS = [
  {
    name: 'Godavari River (గౌతమి & వశిష్ట)',
    path: 'M 610,190 Q 640,230 650,265 T 665,290 Q 680,315 715,325 T 750,340 M 665,290 Q 675,325 690,360 T 725,385',
    color: '#00d2ff',
    width: 3.5,
  },
  {
    name: 'Krishna River (కృష్ణా నది)',
    path: 'M 210,380 Q 260,395 315,395 T 385,360 Q 430,340 480,355 T 495,365 Q 520,380 545,415 T 575,445',
    color: '#0284c7',
    width: 3.2,
  },
  {
    name: 'Pennar River (పెన్నా నది)',
    path: 'M 195,520 Q 240,535 280,560 T 340,580 Q 370,595 395,615 T 450,635 T 470,645',
    color: '#38bdf8',
    width: 2.8,
  },
  {
    name: 'Tungabhadra River (తుంగభద్ర)',
    path: 'M 170,410 Q 200,415 235,425 T 315,395',
    color: '#06b6d4',
    width: 2.2,
  },
  {
    name: 'Nagavali & Vamsadhara (నాగావళి & వంశధార)',
    path: 'M 790,65 Q 820,85 850,110 T 890,140 T 935,160',
    color: '#0ea5e9',
    width: 2.4,
  },
];

// Flagship Key Landmark Reservoirs that have permanent non-overlapping clean tags
const FLAGSHIP_RESERVOIR_IDS = new Set([
  'srisailam',
  'nagarjuna_sagar',
  'sir_arthur_cotton',
  'prakasam_barrage',
  'somasila',
  'gandikota',
  'yeleru',
  'donkarayi',
  'kalyani_dam',
  'thotapalli'
]);

export const Andhra26DistrictsMapSvg: React.FC<Andhra26DistrictsMapSvgProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  viewFilter,
  theme,
  hoveredDistrictId,
  setHoveredDistrictId,
  showTelemetryBeams = true,
  showSatelliteScan = true,
  mapDisplayMode = 'cadastral',
  showRivers = true,
  showReservoirs = true,
  selectedReservoirId,
  onSelectReservoir,
}) => {
  const [hoveredReservoir, setHoveredReservoir] = useState<APReservoirRecord | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Orange/Amber alternating list matching reference image
  const orangeDistricts = [
    'parvathipuram', 'alluri_sitharama_raju', 'anakapalli', 'east_godavari', 
    'eluru', 'konaseema', 'ntr', 'palnadu', 'bapatla', 'nandyal', 
    'sri_sathya_sai', 'annamayya', 'tirupati'
  ];

  const getDistrictFill = (district: DistrictTelemetry) => {
    const isSelected = selectedDistrictId === district.id;
    const isHovered = hoveredDistrictId === district.id;

    // View filter overrides: Alerts / Active
    if (viewFilter === 'alerts') {
      if (district.alertCount > 0 || district.statusColor === 'red' || district.statusColor === 'yellow') {
        return district.statusColor === 'red' ? '#ef4444' : '#f59e0b';
      }
      return theme === 'light' ? '#e2e8f0' : '#1e293b';
    }

    if (viewFilter === 'active') {
      if (district.statusColor === 'green' || district.statusColor === 'blue') {
        return district.statusColor === 'green' ? '#10b981' : '#0284c7';
      }
      return theme === 'light' ? '#e2e8f0' : '#1e293b';
    }

    // Dynamic Display Modes
    if (mapDisplayMode === 'ndwi_satellite') {
      if (isSelected) return '#38bdf8';
      if (isHovered) return '#7dd3fc';
      const ndwi = district.bhuvanSatellite.ndwiScore;
      if (ndwi >= 0.55) return '#0369a1';
      if (ndwi >= 0.45) return '#0284c7';
      if (ndwi >= 0.35) return '#0d9488';
      return '#334155';
    }

    if (mapDisplayMode === 'wris_storage') {
      if (isSelected) return '#38bdf8';
      if (isHovered) return '#67e8f9';
      const pct = district.wrisTelemetry.storagePercentage;
      if (pct >= 85) return '#059669';
      if (pct >= 75) return '#0284c7';
      if (pct >= 60) return '#d97706';
      return '#dc2626';
    }

    if (mapDisplayMode === 'dwlr_groundwater') {
      if (isSelected) return '#38bdf8';
      if (isHovered) return '#93c5fd';
      const depth = district.wrisTelemetry.groundwaterDepthMbgl;
      if (depth <= 4.5) return '#0284c7';
      if (depth <= 6.5) return '#10b981';
      if (depth <= 9.0) return '#f59e0b';
      return '#e11d48';
    }

    if (mapDisplayMode === 'rainfall') {
      if (isSelected) return '#38bdf8';
      if (isHovered) return '#67e8f9';
      const summary = AP_DISTRICT_RAINFALL_SUMMARIES[district.name] || 
        AP_DISTRICT_RAINFALL_SUMMARIES[district.name.replace(' District', '')] ||
        Object.values(AP_DISTRICT_RAINFALL_SUMMARIES).find(s => district.name.toLowerCase().includes(s.district.toLowerCase()) || s.district.toLowerCase().includes(district.name.toLowerCase()));
      if (summary) {
        if (summary.avgDeviationPercent >= 20) return '#0284c7'; // Blue (Excess)
        if (summary.avgDeviationPercent >= -19) return '#10b981'; // Green (Normal)
        if (summary.avgDeviationPercent >= -59) return '#eab308'; // Yellow (Deficient)
        return '#ef4444'; // Red (Large Deficient)
      }
      return '#0d9488';
    }

    if (mapDisplayMode === 'surveillance') {
      if (isSelected) return '#38bdf8';
      if (isHovered) return '#0ea5e9';
      return district.statusColor === 'red' ? '#7f1d1d' : district.statusColor === 'yellow' ? '#78350f' : district.statusColor === 'green' ? '#064e3b' : '#0c4a6e';
    }

    // Default 4-Color Hydrological Water Scheme (as explicitly requested by user):
    // RED: "jo excint hone wala hai usko red karo"
    // BLUE: "blue colour normal rakho"
    // YELLOW: "yellow medium jaha water hai"
    // GREEN: "green jaha sabse ache hai"
    if (district.statusColor === 'red') {
      return isSelected ? '#b91c1c' : isHovered ? '#f87171' : '#ef4444';
    }
    if (district.statusColor === 'yellow') {
      return isSelected ? '#b45309' : isHovered ? '#fbbf24' : '#eab308';
    }
    if (district.statusColor === 'blue') {
      return isSelected ? '#0369a1' : isHovered ? '#38bdf8' : '#0284c7';
    }
    if (district.statusColor === 'green') {
      return isSelected ? '#047857' : isHovered ? '#34d399' : '#10b981';
    }

    return '#0284c7';
  };

  const selectedDistrictData = ANDHRA_PRADESH_26_DISTRICTS.find((d) => d.id === selectedDistrictId);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Floating Zoom & Pan Controls on Top-Right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg text-white">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.25))}
          className="p-1.5 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-sky-300" />
        </button>
        <span className="text-[10px] font-mono px-1 font-bold text-slate-300">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
          className="p-1.5 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-sky-300" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4 text-emerald-300" />
        </button>
      </div>

      <svg
        viewBox="0 0 1020 870"
        className="w-full h-full"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          background: 'transparent',
        }}
      >
        <defs>
          {/* Animated radar sweep filter */}
          <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0047ab" stopOpacity="0" />
          </linearGradient>

          {/* Central Hub Pulsing Glow */}
          <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="reservoirGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>{`
          .district-polygon {
            transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
          }
          .district-polygon:hover {
            filter: brightness(1.15) drop-shadow(0 2px 8px rgba(0, 71, 171, 0.4));
          }
          .radar-ping-ring {
            animation: radarPing 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
            transform-origin: center;
          }
          @keyframes radarPing {
            0% {
              r: 8px;
              opacity: 1;
              stroke-width: 2px;
            }
            100% {
              r: 38px;
              opacity: 0;
              stroke-width: 0.5px;
            }
          }
          .river-flow-line {
            stroke-dasharray: 8 6;
            animation: riverFlow 20s linear infinite;
          }
          @keyframes riverFlow {
            from { stroke-dashoffset: 200; }
            to { stroke-dashoffset: 0; }
          }
          .target-reticle {
            animation: rotateReticle 12s linear infinite;
            transform-origin: center;
          }
          @keyframes rotateReticle {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Scalable Container for Smooth Zoom */}
        <g
          id="map-scalable-canvas"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: '500px 450px',
            transition: 'transform 0.25s ease-out',
          }}
        >
          {/* 1. Surrounding Ocean (Bay of Bengal Label) */}
          <g id="bay-of-bengal" className="select-none pointer-events-none opacity-40">
            <text x="730" y="490" fontSize="24" fontWeight="900" fill="#0284c7" letterSpacing="6">
              BAY OF BENGAL
            </text>
            <text x="745" y="520" fontSize="14" fontWeight="bold" fill="#0284c7" letterSpacing="4">
              (బంగాళాఖాతం)
            </text>
          </g>

          {/* 2. Interstate Boundaries */}
          <g id="neighboring-state-borders" className="pointer-events-none select-none text-[11px] font-mono text-slate-400">
            <text x="440" y="240" fill={theme === 'light' ? '#64748b' : '#94a3b8'}>
              TELANGANA BORDER (తెలంగాణ)
            </text>
            <text x="95" y="470" fill={theme === 'light' ? '#64748b' : '#94a3b8'}>
              KARNATAKA BORDER (కర్ణాటక)
            </text>
            <text x="260" y="820" fill={theme === 'light' ? '#64748b' : '#94a3b8'}>
              TAMIL NADU BORDER (తమిళనాడు)
            </text>
            <text x="740" y="70" fill={theme === 'light' ? '#64748b' : '#94a3b8'}>
              ODISHA BORDER (ఒడిశా)
            </text>
          </g>

          {/* 3. RADAR SCANNER SWEEP ANIMATION */}
          {showSatelliteScan && (
            <g id="radar-satellite-scanner" className="pointer-events-none">
              <circle
                cx={STATE_COMMAND_HUB.svgX}
                cy={STATE_COMMAND_HUB.svgY}
                r="460"
                fill="none"
                stroke="rgba(56, 189, 248, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            </g>
          )}

          {/* 4. THE 26 DISTRICT POLYGONS */}
          <g id="andhra-26-districts-polygons">
            {ANDHRA_PRADESH_26_DISTRICTS.map((dist) => {
              const isSelected = selectedDistrictId === dist.id;
              const isHovered = hoveredDistrictId === dist.id;
              const fill = getDistrictFill(dist);
              const strokeColor = isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#ffffff';
              const strokeWidth = isSelected ? '3.2' : isHovered ? '2.4' : '1.4';

              return (
                <g key={dist.id} className="cursor-pointer">
                  {/* District Cadastral Polygon */}
                  <path
                    d={dist.svgPath}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="district-polygon"
                    onClick={() => onSelectDistrict(dist)}
                    onMouseEnter={() => setHoveredDistrictId(dist.id)}
                    onMouseLeave={() => setHoveredDistrictId(null)}
                  />

                  {/* District Center Capital Dot */}
                  <circle
                    cx={dist.svgCenter.x}
                    cy={dist.svgCenter.y}
                    r={isSelected ? '4.5' : '2.5'}
                    fill={isSelected ? '#38bdf8' : '#ffffff'}
                    stroke="#000000"
                    strokeWidth="0.8"
                    className="pointer-events-none"
                  />

                  {/* Clean District Name & Telugu Name Tag (offset slightly so pins breathe) */}
                  <g className="pointer-events-none select-none">
                    <text
                      x={dist.svgCenter.x}
                      y={dist.svgCenter.y - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="800"
                      fill="#ffffff"
                      stroke="rgba(0,0,0,0.75)"
                      strokeWidth="2.2"
                      paintOrder="stroke"
                    >
                      {dist.name}
                    </text>
                    {mapDisplayMode === 'rainfall' && (() => {
                      const rainSummary = AP_DISTRICT_RAINFALL_SUMMARIES[dist.name] || 
                        AP_DISTRICT_RAINFALL_SUMMARIES[dist.name.replace(' District', '')] ||
                        Object.values(AP_DISTRICT_RAINFALL_SUMMARIES).find(s => dist.name.toLowerCase().includes(s.district.toLowerCase()) || s.district.toLowerCase().includes(dist.name.toLowerCase()));
                      if (!rainSummary) return null;
                      return (
                        <text
                          x={dist.svgCenter.x}
                          y={dist.svgCenter.y + 14}
                          textAnchor="middle"
                          fontSize="7.5"
                          fontWeight="700"
                          fill="#f8fafc"
                          stroke="rgba(0,0,0,0.85)"
                          strokeWidth="1.8"
                          paintOrder="stroke"
                        >
                          {rainSummary.avgActualMm}mm ({rainSummary.avgDeviationPercent > 0 ? '+' : ''}{rainSummary.avgDeviationPercent}%)
                        </text>
                      );
                    })()}
                  </g>
                </g>
              );
            })}
          </g>

          {/* 5. MAJOR ANDHRA PRADESH RIVER FLOW VECTORS */}
          {showRivers && (
            <g id="andhra-rivers-network" className="pointer-events-none">
              {ANDHRA_RIVERS.map((river, idx) => (
                <g key={idx}>
                  <path
                    d={river.path}
                    fill="none"
                    stroke={river.color}
                    strokeWidth={river.width}
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <path
                    d={river.path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={river.width * 0.6}
                    strokeLinecap="round"
                    className="river-flow-line"
                    opacity="0.9"
                  />
                </g>
              ))}
            </g>
          )}

          {/* 6. MAJOR DAMS & BARRAGES (Official APWRIMS Real-Time Telemetry Pins) */}
          {showReservoirs && (
            <g id="major-reservoirs-group">
              {AP_OFFICIAL_RESERVOIRS.map((res) => {
                const isSelected = selectedReservoirId === res.id;
                const isHovered = hoveredReservoir?.id === res.id;
                const isFlagship = FLAGSHIP_RESERVOIR_IDS.has(res.id);
                const hasAlert = res.inflowCusecs > 10000 || res.storagePercentage > 85;

                return (
                  <g
                    key={res.id}
                    className="cursor-pointer"
                    filter="url(#reservoirGlow)"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectReservoir) onSelectReservoir(res);
                    }}
                    onMouseEnter={() => setHoveredReservoir(res)}
                    onMouseLeave={() => setHoveredReservoir(null)}
                  >
                    {/* Pulsing Ring for Selected or Spill/Inflow Alert */}
                    {(isSelected || hasAlert || isHovered) && (
                      <circle
                        cx={res.mapCoords.x}
                        cy={res.mapCoords.y}
                        r={isSelected ? '18' : '14'}
                        className="radar-ping-ring"
                        stroke={hasAlert ? '#ef4444' : '#38bdf8'}
                        fill="none"
                      />
                    )}

                    {/* Outer Pin Body */}
                    <circle
                      cx={res.mapCoords.x}
                      cy={res.mapCoords.y}
                      r={isSelected ? '6.5' : isHovered ? '6' : '4.5'}
                      fill={isSelected ? '#0284c7' : hasAlert ? '#dc2626' : '#0369a1'}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2' : '1.4'}
                    />
                    <circle
                      cx={res.mapCoords.x}
                      cy={res.mapCoords.y}
                      r={isSelected ? '3' : '2'}
                      fill="#38bdf8"
                    />

                    {/* Clean Tag: Rendered ONLY for Flagship Landmark Dams to avoid clutter! */}
                    {isFlagship && !isHovered && !isSelected && (
                      <g className="pointer-events-none select-none">
                        <rect
                          x={res.mapCoords.x + 7}
                          y={res.mapCoords.y - 7}
                          width={res.name.split(' ')[0].length * 5.2 + 20}
                          height="12"
                          rx="3"
                          fill="rgba(11, 27, 54, 0.88)"
                          stroke="rgba(56, 189, 248, 0.45)"
                          strokeWidth="0.8"
                        />
                        <text
                          x={res.mapCoords.x + 10}
                          y={res.mapCoords.y + 2}
                          fontSize="7"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {res.name.split(' ')[0]} ({res.currentStorageTMC} TMC)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Elevated Floating HUD Chip for Hovered or Selected Reservoir (Never clips!) */}
              {(hoveredReservoir || (selectedReservoirId && AP_OFFICIAL_RESERVOIRS.find(r => r.id === selectedReservoirId))) && (() => {
                const activeRes = hoveredReservoir || AP_OFFICIAL_RESERVOIRS.find(r => r.id === selectedReservoirId);
                if (!activeRes) return null;

                const chipX = Math.min(Math.max(activeRes.mapCoords.x - 70, 20), 820);
                const chipY = Math.max(activeRes.mapCoords.y - 38, 25);

                return (
                  <g className="pointer-events-none select-none transition-all" filter="url(#hubGlow)">
                    <rect
                      x={chipX}
                      y={chipY}
                      width="190"
                      height="32"
                      rx="6"
                      fill="rgba(15, 23, 42, 0.96)"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <text x={chipX + 8} y={chipY + 13} fontSize="8.5" fontWeight="bold" fill="#ffffff">
                      {activeRes.name.split('(')[0]}
                    </text>
                    <text x={chipX + 8} y={chipY + 24} fontSize="7.5" fill="#38bdf8" fontFamily="monospace">
                      Storage: {activeRes.currentStorageTMC} TMC ({activeRes.storagePercentage}%) • Lvl: {activeRes.currentLevelFeet} ft
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* 7. TELEMETRY NETWORK BEAMS */}
          {showTelemetryBeams && (
            <g id="telemetry-network-group" className="pointer-events-none">
              {TELEMETRY_NETWORK_BEAMS.map((beam, idx) => {
                const fromCoord =
                  beam.from === 'amaravati_hq'
                    ? { x: STATE_COMMAND_HUB.svgX, y: STATE_COMMAND_HUB.svgY }
                    : ANDHRA_PRADESH_26_DISTRICTS.find((d) => d.id === beam.from)?.svgCenter;

                const toCoord = ANDHRA_PRADESH_26_DISTRICTS.find((d) => d.id === beam.to)?.svgCenter;

                if (!fromCoord || !toCoord) return null;

                const isDirectToSelected = selectedDistrictId === beam.to || selectedDistrictId === beam.from;

                return (
                  <g key={idx}>
                    <line
                      x1={fromCoord.x}
                      y1={fromCoord.y}
                      x2={toCoord.x}
                      y2={toCoord.y}
                      stroke={isDirectToSelected ? '#38bdf8' : beam.stroke}
                      strokeWidth={isDirectToSelected ? '2.5' : '1.2'}
                      opacity={isDirectToSelected ? '0.95' : '0.40'}
                    />
                    <line
                      x1={fromCoord.x}
                      y1={fromCoord.y}
                      x2={toCoord.x}
                      y2={toCoord.y}
                      stroke="#ffffff"
                      strokeWidth={isDirectToSelected ? '2.2' : '1.2'}
                      strokeDasharray="4 8"
                      className="river-flow-line"
                      opacity={isDirectToSelected ? '0.95' : '0.45'}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 8. AMARAVATI STATE CENTRAL COMMAND HUB */}
          <g id="state-command-hub" className="cursor-pointer" filter="url(#hubGlow)">
            <circle cx={STATE_COMMAND_HUB.svgX} cy={STATE_COMMAND_HUB.svgY} className="radar-ping-ring" stroke="#38bdf8" fill="none" />
            <circle cx={STATE_COMMAND_HUB.svgX} cy={STATE_COMMAND_HUB.svgY} r="16" fill="rgba(2, 132, 199, 0.25)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={STATE_COMMAND_HUB.svgX} cy={STATE_COMMAND_HUB.svgY} r="8" fill="#0047ab" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx={STATE_COMMAND_HUB.svgX} cy={STATE_COMMAND_HUB.svgY} r="3" fill="#38bdf8" />

            <g className="pointer-events-none">
              <rect
                x={STATE_COMMAND_HUB.svgX - 58}
                y={STATE_COMMAND_HUB.svgY + 12}
                width="116"
                height="16"
                rx="4"
                fill="#0047ab"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <text
                x={STATE_COMMAND_HUB.svgX}
                y={STATE_COMMAND_HUB.svgY + 23}
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill="#ffffff"
                letterSpacing="0.5"
              >
                AMARAVATI COMMAND (అమరావతి)
              </text>
            </g>
          </g>

          {/* 9. SELECTED DISTRICT TARGETING RETICLE */}
          {selectedDistrictData && (
            <g className="pointer-events-none" transform={`translate(${selectedDistrictData.svgCenter.x}, ${selectedDistrictData.svgCenter.y})`}>
              <circle
                r="22"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="8 6"
                className="target-reticle"
              />
              <line x1="-28" y1="0" x2="-20" y2="0" stroke="#38bdf8" strokeWidth="1.8" />
              <line x1="20" y1="0" x2="28" y2="0" stroke="#38bdf8" strokeWidth="1.8" />
              <line x1="0" y1="-28" x2="0" y2="-20" stroke="#38bdf8" strokeWidth="1.8" />
              <line x1="0" y1="20" x2="0" y2="28" stroke="#38bdf8" strokeWidth="1.8" />
            </g>
          )}

          {/* 10. Hover Card HUD Tooltip (Only shown when not hovering a reservoir to prevent overlap) */}
          {hoveredDistrictId && !hoveredReservoir && (() => {
            const hovered = ANDHRA_PRADESH_26_DISTRICTS.find((d) => d.id === hoveredDistrictId);
            if (!hovered) return null;

            const tooltipX = Math.min(Math.max(hovered.svgCenter.x - 95, 20), 790);
            const tooltipY = Math.max(hovered.svgCenter.y - 110, 25);

            return (
              <g className="pointer-events-none select-none transition-all">
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width="200"
                  height="96"
                  rx="8"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#38bdf8"
                  strokeWidth="1.4"
                  filter="drop-shadow(0 6px 16px rgba(0,0,0,0.45))"
                />
                <text x={tooltipX + 10} y={tooltipY + 18} fontSize="11" fontWeight="800" fill="#ffffff">
                  {hovered.name} ({hovered.teluguName})
                </text>
                <text x={tooltipX + 10} y={tooltipY + 32} fontSize="8.5" fill="#94a3b8" fontFamily="monospace">
                  HQ: {hovered.headquarter} • {hovered.region}
                </text>

                <line x1={tooltipX + 10} y1={tooltipY + 38} x2={tooltipX + 190} y2={tooltipY + 38} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

                <text x={tooltipX + 10} y={tooltipY + 52} fontSize="9" fill="#38bdf8" fontWeight="bold">
                  Bhuvan NDWI: {hovered.bhuvanSatellite.ndwiScore} ({hovered.bhuvanSatellite.waterSpreadAreaHa} Ha)
                </text>
                <text x={tooltipX + 10} y={tooltipY + 66} fontSize="9" fill="#34d399" fontWeight="bold">
                  Storage: {hovered.wrisTelemetry.storagePercentage}% ({hovered.wrisTelemetry.currentStorageMCM} MCM)
                </text>
                <text x={tooltipX + 10} y={tooltipY + 80} fontSize="8.5" fill="#f59e0b">
                  DWLR: {hovered.wrisTelemetry.groundwaterDepthMbgl} mbgl ({hovered.wrisTelemetry.groundwaterTrend})
                </text>
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
};
