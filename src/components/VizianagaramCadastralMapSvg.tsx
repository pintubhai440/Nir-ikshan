import React, { useState, useEffect, useCallback } from 'react';
import { WaterBody, WaterBodyStatusColor } from '../types/nirikshan';
import { VIZIANAGARAM_ALL_MANDAL_WATER_BODIES } from '../data/vizianagaramMandalsWaterData';
import { 
  Plus,
  Minus,
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Droplet,
  Waves,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ExternalLink,
  X,
  Compass,
  MapPin,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move
} from 'lucide-react';

export interface VizianagaramMandalData {
  id: string;
  name: string;
  teluguName: string;
  category: 'Urban' | 'Rural' | 'Hilly' | 'Coastal';
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

// 28 Seamless, Fitting Cadastral Mandals of Vizianagaram District
export const VIZIANAGARAM_MANDALS: VizianagaramMandalData[] = [
  // 1. Bobbili
  {
    id: 'bobbili',
    name: 'Bobbili',
    teluguName: 'బొబ్బిలి',
    category: 'Rural',
    svgPath: 'M 290,60 L 410,55 L 435,130 L 390,175 L 320,180 L 290,120 Z',
    center: { x: 355, y: 120 },
    statusColor: 'green',
    statusLabel: 'Abundant Surface Flow (Vegavali Basin)',
    groundwaterDepthMbgl: 5.6,
    waterBodiesCount: 42,
    primaryWaterBody: 'Bobbili Fort Moat & Vegavali Weir',
    primaryRiver: 'Vegavali River',
    riverBasin: 'Vegavali Sub-basin',
    aquiferStatus: 'Safe Hard-rock Aquifer',
    rechargeStructuresCount: 38,
  },
  // 2. Badangi
  {
    id: 'badangi',
    name: 'Badangi',
    teluguName: 'బాడంగి',
    category: 'Rural',
    svgPath: 'M 410,55 L 505,80 L 515,165 L 435,175 L 435,130 Z',
    center: { x: 470, y: 130 },
    statusColor: 'blue',
    statusLabel: 'Normal Irrigation Table',
    groundwaterDepthMbgl: 6.8,
    waterBodiesCount: 28,
    primaryWaterBody: 'Badangi Pedda Cheruvu',
    primaryRiver: 'Vegavali River',
    riverBasin: 'Vegavali Sub-basin',
    aquiferStatus: 'Normal Soil Moisture',
    rechargeStructuresCount: 24,
  },
  // 3. Therlam
  {
    id: 'therlam',
    name: 'Therlam',
    teluguName: 'తెర్లాం',
    category: 'Rural',
    svgPath: 'M 505,80 L 600,105 L 610,185 L 525,185 L 515,165 Z',
    center: { x: 558, y: 140 },
    statusColor: 'blue',
    statusLabel: 'Stable Wetland Reserve',
    groundwaterDepthMbgl: 6.2,
    waterBodiesCount: 31,
    primaryWaterBody: 'Therlam Tank System',
    primaryRiver: 'Suvarnamukhi Feeder',
    riverBasin: 'Suvarnamukhi Basin',
    aquiferStatus: 'Stable Perennial Feed',
    rechargeStructuresCount: 27,
  },
  // 4. Balijipeta
  {
    id: 'balijipeta',
    name: 'Balijipeta',
    teluguName: 'బలిజిపేట',
    category: 'Rural',
    svgPath: 'M 600,105 L 670,80 L 685,155 L 610,185 Z',
    center: { x: 645, y: 135 },
    statusColor: 'green',
    statusLabel: 'Pristine Suvarnamukhi Inflow',
    groundwaterDepthMbgl: 4.9,
    waterBodiesCount: 35,
    primaryWaterBody: 'Suvarnamukhi River Channel',
    primaryRiver: 'Suvarnamukhi River',
    riverBasin: 'Suvarnamukhi River',
    aquiferStatus: 'Shallow Water Table (Safe)',
    rechargeStructuresCount: 31,
  },
  // 5. Vangara
  {
    id: 'vangara',
    name: 'Vangara',
    teluguName: 'వంగర',
    category: 'Rural',
    svgPath: 'M 590,25 L 680,30 L 670,80 L 600,105 L 585,65 Z',
    center: { x: 635, y: 65 },
    statusColor: 'green',
    statusLabel: 'Madduvalasa Catchment Active',
    groundwaterDepthMbgl: 5.2,
    waterBodiesCount: 26,
    primaryWaterBody: 'Madduvalasa Reservoir Link',
    primaryRiver: 'Suvarnamukhi / Nagavali',
    riverBasin: 'Madduvalasa Command',
    aquiferStatus: 'Active River Basin Aquifer',
    rechargeStructuresCount: 22,
  },
  // 6. Regidi Amadalavalasa
  {
    id: 'regidi',
    name: 'Regidi Amadalavalasa',
    teluguName: 'రేగిడి ఆమదాలవలస',
    category: 'Rural',
    svgPath: 'M 680,30 L 810,70 L 820,155 L 745,175 L 685,155 Z',
    center: { x: 750, y: 115 },
    statusColor: 'blue',
    statusLabel: 'Normal Groundwater Table',
    groundwaterDepthMbgl: 6.5,
    waterBodiesCount: 38,
    primaryWaterBody: 'Regidi Irrigation Canal',
    primaryRiver: 'Nagavali Basin Feed',
    riverBasin: 'Nagavali Tributary',
    aquiferStatus: 'Normal Alluvial Aquifer',
    rechargeStructuresCount: 33,
  },
  // 7. Santhakaviti
  {
    id: 'santhakaviti',
    name: 'Santhakaviti',
    teluguName: 'సంతకవిటి',
    category: 'Rural',
    svgPath: 'M 745,175 L 820,155 L 850,250 L 775,260 L 750,215 Z',
    center: { x: 795, y: 210 },
    statusColor: 'blue',
    statusLabel: 'Canal Irrigated Belt',
    groundwaterDepthMbgl: 6.9,
    waterBodiesCount: 32,
    primaryWaterBody: 'Santhakaviti Tank',
    primaryRiver: 'Champavathi Upper Canal',
    riverBasin: 'Champavathi Sub-basin',
    aquiferStatus: 'Stable Hard-rock Belt',
    rechargeStructuresCount: 29,
  },
  // 8. Rajam
  {
    id: 'rajam',
    name: 'Rajam',
    teluguName: 'రాజాం',
    category: 'Urban',
    svgPath: 'M 645,185 L 750,215 L 775,260 L 720,300 L 655,265 Z',
    center: { x: 705, y: 245 },
    statusColor: 'yellow',
    statusLabel: 'Moderate Urban Water Stress',
    groundwaterDepthMbgl: 8.4,
    waterBodiesCount: 36,
    primaryWaterBody: 'Rajam Town Cheruvu System',
    primaryRiver: 'Madduvalasa Right Canal',
    riverBasin: 'Madduvalasa Sub-command',
    aquiferStatus: 'Semi-critical Extraction',
    rechargeStructuresCount: 42,
  },
  // 9. Merakamudidam
  {
    id: 'merakamudidam',
    name: 'Merakamudidam',
    teluguName: 'మెరకముడిదం',
    category: 'Rural',
    svgPath: 'M 505,185 L 645,185 L 655,265 L 585,285 L 495,250 Z',
    center: { x: 565, y: 235 },
    statusColor: 'blue',
    statusLabel: 'Normal Soil Moisture',
    groundwaterDepthMbgl: 7.1,
    waterBodiesCount: 29,
    primaryWaterBody: 'Merakamudidam Tank',
    primaryRiver: 'Vegavali Tributary',
    riverBasin: 'Vegavali Catchment',
    aquiferStatus: 'Safe Hard-rock Zone',
    rechargeStructuresCount: 25,
  },
  // 10. Ramabhadrapuram
  {
    id: 'ramabhadrapuram',
    name: 'Ramabhadrapuram',
    teluguName: 'రామభద్రపురం',
    category: 'Rural',
    svgPath: 'M 265,180 L 380,170 L 395,245 L 320,275 L 250,240 Z',
    center: { x: 325, y: 225 },
    statusColor: 'green',
    statusLabel: 'Recharged Hill Stream Outflow',
    groundwaterDepthMbgl: 5.4,
    waterBodiesCount: 33,
    primaryWaterBody: 'Ramabhadrapuram Check Dam',
    primaryRiver: 'Vegavali River',
    riverBasin: 'Eastern Ghats Hill Stream',
    aquiferStatus: 'High Infiltration Fracture',
    rechargeStructuresCount: 36,
  },
  // 11. Mentada
  {
    id: 'mentada',
    name: 'Mentada',
    teluguName: 'మెంటాడ',
    category: 'Hilly',
    svgPath: 'M 175,270 L 275,250 L 315,315 L 245,360 L 155,330 Z',
    center: { x: 235, y: 305 },
    statusColor: 'green',
    statusLabel: 'Eastern Ghats Forest Recharge',
    groundwaterDepthMbgl: 4.8,
    waterBodiesCount: 27,
    primaryWaterBody: 'Andra Reservoir Catchment',
    primaryRiver: 'Champavathi River Origin',
    riverBasin: 'Andra Catchment Sub-basin',
    aquiferStatus: 'Pristine Forest Aquifer',
    rechargeStructuresCount: 30,
  },
  // 12. Dattirajeru
  {
    id: 'dattirajeru',
    name: 'Dattirajeru',
    teluguName: 'దత్తిరాజేరు',
    category: 'Rural',
    svgPath: 'M 380,230 L 495,250 L 480,330 L 400,335 L 380,270 Z',
    center: { x: 435, y: 285 },
    statusColor: 'blue',
    statusLabel: 'Stable Ground Aquifer',
    groundwaterDepthMbgl: 7.2,
    waterBodiesCount: 25,
    primaryWaterBody: 'Komatipalli Lake',
    primaryRiver: 'Gajapathinagaram Canal',
    riverBasin: 'Champavathi Feeder',
    aquiferStatus: 'Safe Hard-rock Aquifer',
    rechargeStructuresCount: 21,
  },
  // 13. Garividi
  {
    id: 'garividi',
    name: 'Garividi',
    teluguName: 'గరివిడి',
    category: 'Rural',
    svgPath: 'M 585,285 L 675,260 L 700,335 L 625,365 L 575,335 Z',
    center: { x: 630, y: 315 },
    statusColor: 'yellow',
    statusLabel: 'Industrial Mineral Belt Drawdown',
    groundwaterDepthMbgl: 8.8,
    waterBodiesCount: 30,
    primaryWaterBody: 'Garividi Stream Pond',
    primaryRiver: 'Garividi Drain',
    riverBasin: 'Pedda Gedda Channel',
    aquiferStatus: 'Semi-critical Drawdown',
    rechargeStructuresCount: 34,
  },
  // 14. Cheepurupalle
  {
    id: 'cheepurupalle',
    name: 'Cheepurupalle',
    teluguName: 'చీపురుపల్లి',
    category: 'Urban',
    svgPath: 'M 625,365 L 705,335 L 745,410 L 670,445 L 615,405 Z',
    center: { x: 675, y: 385 },
    statusColor: 'red',
    statusLabel: '2. Danger Zone (Critical Groundwater Depletion 14.8 mbgl, Drought Alert)',
    groundwaterDepthMbgl: 14.8,
    waterBodiesCount: 40,
    primaryWaterBody: 'Cheepurupalle Depleted Cheruvu',
    primaryRiver: 'Pedda Gedda Channel',
    riverBasin: 'Pedda Gedda Basin',
    aquiferStatus: 'Over-Exploited Deep Aquifer (Critical)',
    rechargeStructuresCount: 37,
  },
  // 15. Gajapathinagaram
  {
    id: 'gajapathinagaram',
    name: 'Gajapathinagaram',
    teluguName: 'గజపతినగరం',
    category: 'Rural',
    svgPath: 'M 360,330 L 480,330 L 475,415 L 380,420 L 350,370 Z',
    center: { x: 420, y: 375 },
    statusColor: 'grey',
    statusLabel: '1. Extinct (Pedda Cheruvu Silted Bed - Sookh Kar Mit Gaya)',
    groundwaterDepthMbgl: 12.8,
    waterBodiesCount: 37,
    primaryWaterBody: 'Pedda Cheruvu Silted Bed (Extinct)',
    primaryRiver: 'Nellimara / Champavathi Feeder',
    riverBasin: 'Champavathi River Basin',
    aquiferStatus: 'Depleted Urban Catchment Bed',
    rechargeStructuresCount: 35,
  },
  // 16. Bondapalle
  {
    id: 'bondapalle',
    name: 'Bondapalle',
    teluguName: 'బొండపల్లి',
    category: 'Rural',
    svgPath: 'M 275,350 L 360,330 L 380,420 L 305,445 L 265,400 Z',
    center: { x: 325, y: 395 },
    statusColor: 'grey',
    statusLabel: '1. Extinct (Dry Silted Tank - Sookh Kar Mit Gaya)',
    groundwaterDepthMbgl: 11.4,
    waterBodiesCount: 29,
    primaryWaterBody: 'Bondapalle Dry Tank (Extinct)',
    primaryRiver: 'Gosthani Upper Feeder',
    riverBasin: 'Gosthani-Champavathi Divide',
    aquiferStatus: 'Depleted Aquifer Bed',
    rechargeStructuresCount: 26,
  },
  // 17. Gurla
  {
    id: 'gurla',
    name: 'Gurla',
    teluguName: 'గుర్ల',
    category: 'Rural',
    svgPath: 'M 475,375 L 575,335 L 600,420 L 505,435 L 470,405 Z',
    center: { x: 530, y: 385 },
    statusColor: 'blue',
    statusLabel: 'Champavathi Live Flow Tracked',
    groundwaterDepthMbgl: 6.1,
    waterBodiesCount: 31,
    primaryWaterBody: 'Gurla River Weir',
    primaryRiver: 'Nellimara / Champavathi River',
    riverBasin: 'Champavathi Mid-Basin',
    aquiferStatus: 'Safe River Sand Aquifer',
    rechargeStructuresCount: 28,
  },
  // 18. Nellimarla
  {
    id: 'nellimarla',
    name: 'Nellimarla',
    teluguName: 'నెల్లిమర్ల',
    category: 'Rural',
    svgPath: 'M 470,430 L 580,425 L 605,495 L 520,510 L 460,470 Z',
    center: { x: 535, y: 465 },
    statusColor: 'green',
    statusLabel: 'Nellimara Barrage Water Surplus',
    groundwaterDepthMbgl: 5.7,
    waterBodiesCount: 34,
    primaryWaterBody: 'Nellimara River Barrage',
    primaryRiver: 'Nellimara / Champavathi River',
    riverBasin: 'Nellimara Barrage Command',
    aquiferStatus: 'High Storage Alluvium',
    rechargeStructuresCount: 32,
  },
  // 19. Gantyada
  {
    id: 'gantyada',
    name: 'Gantyada',
    teluguName: 'గంట్యాడ',
    category: 'Hilly',
    svgPath: 'M 240,410 L 320,435 L 335,505 L 250,505 L 210,455 Z',
    center: { x: 275, y: 465 },
    statusColor: 'green',
    statusLabel: 'Tatipudi Reservoir Command (72.5 MCM)',
    groundwaterDepthMbgl: 5.1,
    waterBodiesCount: 45,
    primaryWaterBody: 'TATIPUDI RESERVOIR (72.5 MCM)',
    primaryRiver: 'Gosthani River Basin',
    riverBasin: 'Gosthani Dam Catchment',
    aquiferStatus: 'High Recharge (Reservoir Buffer)',
    rechargeStructuresCount: 48,
  },
  // 20. Srungavarapukota (S.Kota)
  {
    id: 's_kota',
    name: 'Srungavarapukota',
    teluguName: 'శృంగవరపుకోట',
    category: 'Hilly',
    svgPath: 'M 130,445 L 220,435 L 240,535 L 165,555 L 110,495 Z',
    center: { x: 180, y: 500 },
    statusColor: 'green',
    statusLabel: 'Eastern Ghats Mountain Runoff',
    groundwaterDepthMbgl: 4.6,
    waterBodiesCount: 48,
    primaryWaterBody: 'Boddavara Forest Stream',
    primaryRiver: 'Gosthani Upper Tributaries',
    riverBasin: 'Gosthani Headwaters',
    aquiferStatus: 'Pristine Mountain Watershed',
    rechargeStructuresCount: 52,
  },
  // 21. Vizianagaram Urban / Rural
  {
    id: 'vizianagaram_hq',
    name: 'Vizianagaram Urban',
    teluguName: 'విజయనగరం అర్బన్',
    category: 'Urban',
    svgPath: 'M 335,490 L 455,465 L 475,540 L 405,560 L 325,530 Z',
    center: { x: 405, y: 515 },
    statusColor: 'red',
    statusLabel: '2. Danger Zone (Kotha Cheruvu - Severe Effluent Contamination, TDS 1180 ppm)',
    groundwaterDepthMbgl: 13.5,
    waterBodiesCount: 52,
    primaryWaterBody: 'Kotha Cheruvu (Critical Contamination & Sewage)',
    primaryRiver: 'Gosthani Urban Runoff',
    riverBasin: 'Vizianagaram Urban Catchment',
    aquiferStatus: 'Over-Exploited / Contaminated Aquifer',
    rechargeStructuresCount: 46,
  },
  // 22. Denkada
  {
    id: 'denkada',
    name: 'Denkada',
    teluguName: 'డెంకాడ',
    category: 'Rural',
    svgPath: 'M 455,530 L 520,510 L 555,575 L 480,595 L 440,560 Z',
    center: { x: 495, y: 550 },
    statusColor: 'blue',
    statusLabel: 'Champavathi Delta Inflow',
    groundwaterDepthMbgl: 6.7,
    waterBodiesCount: 26,
    primaryWaterBody: 'Denkada Anicut Stream',
    primaryRiver: 'Nellimara / Champavathi River',
    riverBasin: 'Champavathi Delta',
    aquiferStatus: 'Safe Alluvial Table',
    rechargeStructuresCount: 24,
  },
  // 23. Jami
  {
    id: 'jami',
    name: 'Jami',
    teluguName: 'జామి',
    category: 'Rural',
    svgPath: 'M 240,535 L 330,525 L 345,595 L 270,605 L 225,570 Z',
    center: { x: 290, y: 565 },
    statusColor: 'blue',
    statusLabel: 'Gosthani Valley Agriculture',
    groundwaterDepthMbgl: 6.2,
    waterBodiesCount: 30,
    primaryWaterBody: 'Jami Gosthani Bund',
    primaryRiver: 'Gosthani River',
    riverBasin: 'Gosthani Middle Basin',
    aquiferStatus: 'Safe Agricultural Valley',
    rechargeStructuresCount: 28,
  },
  // 24. Lakkavarapukota (L.Kota)
  {
    id: 'l_kota',
    name: 'Lakkavarapukota',
    teluguName: 'లక్కవరపుకోట',
    category: 'Hilly',
    svgPath: 'M 125,555 L 230,545 L 240,620 L 160,630 L 110,590 Z',
    center: { x: 180, y: 590 },
    statusColor: 'green',
    statusLabel: 'Pristine Foothill Recharge',
    groundwaterDepthMbgl: 5.3,
    waterBodiesCount: 31,
    primaryWaterBody: 'L.Kota Catchment Tank',
    primaryRiver: 'Gosthani Stream',
    riverBasin: 'Foothill Micro-catchment',
    aquiferStatus: 'Safe Fracture Recharge',
    rechargeStructuresCount: 33,
  },
  // 25. Vepada
  {
    id: 'vepada',
    name: 'Vepada',
    teluguName: 'వేపాడ',
    category: 'Rural',
    svgPath: 'M 35,550 L 125,555 L 120,630 L 40,620 Z',
    center: { x: 80, y: 585 },
    statusColor: 'blue',
    statusLabel: 'Normal Soil Moisture',
    groundwaterDepthMbgl: 6.9,
    waterBodiesCount: 22,
    primaryWaterBody: 'Vepada Irrigation Pond',
    primaryRiver: 'Sarada River Tributary',
    riverBasin: 'Sarada Basin Boundary',
    aquiferStatus: 'Normal Soil Moisture',
    rechargeStructuresCount: 20,
  },
  // 26. Kothavalasa
  {
    id: 'kothavalasa',
    name: 'Kothavalasa',
    teluguName: 'కొత్తవలస',
    category: 'Urban',
    svgPath: 'M 160,625 L 260,610 L 280,670 L 180,670 Z',
    center: { x: 220, y: 645 },
    statusColor: 'yellow',
    statusLabel: 'Industrial Corridor Demand',
    groundwaterDepthMbgl: 8.6,
    waterBodiesCount: 34,
    primaryWaterBody: 'Kothavalasa Lake System',
    primaryRiver: 'Gosthani Lower Channel',
    riverBasin: 'Gosthani Lower Plain',
    aquiferStatus: 'Semi-critical Industrial Zone',
    rechargeStructuresCount: 39,
  },
  // 27. Pusapatirega
  {
    id: 'pusapatirega',
    name: 'Pusapatirega',
    teluguName: 'పూసపాటిరేగ',
    category: 'Coastal',
    svgPath: 'M 565,475 L 675,455 L 730,545 L 630,565 L 555,515 Z',
    center: { x: 640, y: 515 },
    statusColor: 'blue',
    statusLabel: 'Coastal Estuary & Brackish Buffer',
    groundwaterDepthMbgl: 5.9,
    waterBodiesCount: 36,
    primaryWaterBody: 'Champavathi Sea Estuary',
    primaryRiver: 'Nellimara River Mouth',
    riverBasin: 'Champavathi Coastal Estuary',
    aquiferStatus: 'Coastal Salinity Buffer Zone',
    rechargeStructuresCount: 35,
  },
  // 28. Bhogapuram
  {
    id: 'bhogapuram',
    name: 'Bhogapuram',
    teluguName: 'భోగాపురం',
    category: 'Coastal',
    svgPath: 'M 515,565 L 630,560 L 665,655 L 550,660 L 480,600 Z',
    center: { x: 575, y: 610 },
    statusColor: 'blue',
    statusLabel: 'Airport Eco-Corridor Monitored',
    groundwaterDepthMbgl: 6.8,
    waterBodiesCount: 38,
    primaryWaterBody: 'Bhogapuram Coastal Aquifer',
    primaryRiver: 'Coastal Creek Network',
    riverBasin: 'Bay of Bengal Coastal Basin',
    aquiferStatus: 'Coastal Freshwater Ridge',
    rechargeStructuresCount: 40,
  },
];

interface VizianagaramCadastralMapSvgProps {
  waterBodies: WaterBody[];
  activeWaterBody: WaterBody | null;
  hoveredWaterBody: WaterBody | null;
  onSelectWaterBody: (wb: WaterBody) => void;
  onSelectMandal?: (mandal: VizianagaramMandalData) => void;
  selectedMandalId: string | null;
  viewFilter?: 'all' | 'extinct' | 'red' | 'green' | 'yellow' | 'blue';
  theme: 'light' | 'dark';
  showRivers?: boolean;
  showTanks?: boolean;
  showSensors?: boolean;
  onSwitchDistrict?: (district: string) => void;
  onLodgeComplaint?: () => void;
}

export const VizianagaramCadastralMapSvg: React.FC<VizianagaramCadastralMapSvgProps> = ({
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
  const [hoveredMandal, setHoveredMandal] = useState<VizianagaramMandalData | null>(null);
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

  // Soft clear cadastral palette with 5-color filter highlighting & instant readability
  const getMandalFill = (mandal: VizianagaramMandalData) => {
    const isSelected = selectedMandalId === mandal.id;
    const isHovered = hoveredMandal?.id === mandal.id;

    if (isSelected) return '#bae6fd'; // Bright active selection blue
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

    // Distinct alternating cadastral tones so adjacent mandals never look the same
    switch (mandal.id) {
      case 'bobbili':
      case 'therlam':
      case 'gantyada':
      case 'pusapatirega':
        return '#e0f2fe'; // soft sky
      case 'badangi':
      case 'gurla':
      case 'vepada':
        return '#fef3c7'; // soft yellow/cream
      case 'balijipeta':
      case 'gajapathinagaram':
      case 'bhogapuram':
        return '#dcfce7'; // soft emerald/mint
      case 'vangara':
      case 'nellimarla':
      case 'kothavalasa':
        return '#ffe4e6'; // soft rose
      case 'regidi':
      case 'vizianagaram_hq':
        return '#fed7aa'; // light saffron
      case 'santhakaviti':
      case 'denkada':
        return '#f3e8ff'; // soft lilac
      case 'rajam':
      case 'jami':
        return '#fef9c3'; // light lemon
      case 'merakamudidam':
      case 's_kota':
        return '#e2e8f0'; // light silver
      case 'ramabhadrapuram':
      case 'l_kota':
        return '#dbeafe'; // light periwinkle
      case 'mentada':
        return '#d1fae5'; // mint green
      case 'dattirajeru':
      case 'cheepurupalle':
        return '#ffedd5'; // soft orange
      case 'garividi':
      case 'bondapalle':
        return '#f1f5f9'; // soft slate
      default:
        return '#f8fafc';
    }
  };

  const handleMandalClick = (mandal: VizianagaramMandalData) => {
    if (onSelectMandal) onSelectMandal(mandal);
    const mandalWb = VIZIANAGARAM_ALL_MANDAL_WATER_BODIES[mandal.id];
    if (mandalWb && onSelectWaterBody) {
      onSelectWaterBody(mandalWb);
    }
    // Directly scroll down to the full telemetry dossier below the map (no popup card blocking view)
    setTimeout(() => {
      const el = document.getElementById('apwrims-dossier');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  const handleRiverClick = (riverName: string, description: string, discharge: string, level: string, danger: string) => {
    const riverWb = Object.values(VIZIANAGARAM_ALL_MANDAL_WATER_BODIES).find(
      w => w.name.toLowerCase().includes(riverName.toLowerCase()) || w.description.toLowerCase().includes(riverName.toLowerCase())
    ) || VIZIANAGARAM_ALL_MANDAL_WATER_BODIES['nellimarla'];
    if (riverWb && onSelectWaterBody) {
      onSelectWaterBody({
        ...riverWb,
        name: `${riverName} Basin Gauge`,
        description,
        liveTelemetry: {
          ...riverWb.liveTelemetry,
          dischargeCusecs: parseInt(discharge) || 240,
          waterLevelM: parseFloat(level) || 45.2,
          dangerLevelM: parseFloat(danger) || 49.0,
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
    if (regionName === 'PARVATHIPURAM MANYAM' && onSwitchDistrict) {
      onSwitchDistrict('Parvathipuram Manyam');
      return;
    }
    if (regionName === 'VISAKHAPATNAM' && onSwitchDistrict) {
      onSwitchDistrict('Visakhapatnam');
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
      {/* SVG CANVAS (FULL CLEAN VIEW WITHOUT ANY BLOCKING LEGEND)       */}
      {/* ============================================================== */}
      <svg
        viewBox="0 0 950 680"
        onMouseDown={handleMouseDown}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <defs>
          <pattern id="vzmGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(2, 132, 199, 0.08)" strokeWidth="0.8" />
          </pattern>

          <linearGradient id="vzmBayOfBengalSea" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
          </linearGradient>

          <radialGradient id="vzmWaveRipple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vzmRedRadar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vzmBlueRadar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vzmGreenRadar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="950" height="680" fill="url(#vzmGridPattern)" />

        {/* ============================================================== */}
        {/* SURROUNDING BORDER REGIONS (FULLY CLICKABLE - NO DEAD CLICKS)  */}
        {/* ============================================================== */}
        <g id="border-regions">
          {/* Odisha Border */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('ODISHA', 'Interstate Eastern Ghats boundary. Upstream catchments of Nagavali and Suvarnamukhi rivers originating in Odisha highlands.')}
          >
            <rect x="20" y="135" width="120" height="38" rx="8" fill="rgba(241, 245, 249, 0.75)" stroke="#cbd5e1" strokeWidth="1" />
            <text x="80" y="158" fill="#475569" fontSize="13" fontWeight="900" letterSpacing="3" textAnchor="middle">
              ODISHA
            </text>
          </g>

          {/* Parvathipuram Manyam Border */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('PARVATHIPURAM MANYAM', 'Parvathipuram Manyam District. Click to switch view and inspect Thotapalli Barrage and Nagavali basin.')}
          >
            <rect x="670" y="32" width="230" height="36" rx="8" fill="rgba(241, 245, 249, 0.85)" stroke="#93c5fd" strokeWidth="1.2" className="group-hover:fill-blue-50" />
            <text x="785" y="55" fill="#1e3a8a" fontSize="11" fontWeight="900" letterSpacing="2" textAnchor="middle">
              PARVATHIPURAM MANYAM ↗
            </text>
          </g>

          {/* Alluri Sitharama Raju Border */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('ALLURI SITHARAMA RAJU', 'Alluri Sitharama Raju District. Dense hill forest catchment area recharging Gosthani and Sarada river origins.')}
          >
            <rect x="15" y="355" width="195" height="36" rx="8" fill="rgba(241, 245, 249, 0.75)" stroke="#cbd5e1" strokeWidth="1" />
            <text x="112" y="378" fill="#475569" fontSize="10.5" fontWeight="900" letterSpacing="1.5" textAnchor="middle">
              ALLURI SITHARAMA RAJU
            </text>
          </g>

          {/* Anakapalli Border */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('ANAKAPALLI', 'Anakapalli District boundary. Lower Sarada river basin and agricultural recharge table.')}
          >
            <rect x="15" y="630" width="130" height="35" rx="8" fill="rgba(241, 245, 249, 0.75)" stroke="#cbd5e1" strokeWidth="1" />
            <text x="80" y="652" fill="#475569" fontSize="11" fontWeight="900" letterSpacing="2" textAnchor="middle">
              ANAKAPALLI
            </text>
          </g>

          {/* Visakhapatnam Border */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('VISAKHAPATNAM', 'Visakhapatnam District. Click to switch view and inspect Meghadrigedda reservoir and city water supply.')}
          >
            <rect x="300" y="635" width="200" height="36" rx="8" fill="rgba(241, 245, 249, 0.85)" stroke="#93c5fd" strokeWidth="1.2" className="group-hover:fill-blue-50" />
            <text x="400" y="658" fill="#1e3a8a" fontSize="11" fontWeight="900" letterSpacing="2" textAnchor="middle">
              VISAKHAPATNAM ↗
            </text>
          </g>

          {/* Srikakulam Border */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('SRIKAKULAM', 'Srikakulam District boundary. Nagavali downstream basin leading to the Bay of Bengal.')}
          >
            <rect x="815" y="355" width="125" height="35" rx="8" fill="rgba(241, 245, 249, 0.75)" stroke="#cbd5e1" strokeWidth="1" />
            <text x="877" y="377" fill="#475569" fontSize="11" fontWeight="900" letterSpacing="2" textAnchor="middle">
              SRIKAKULAM
            </text>
          </g>

          {/* Bay of Bengal Sea Area (Clickable) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleBorderClick('BAY OF BENGAL', 'Bay of Bengal Coastal Stretch of Vizianagaram. 45 km coastline stretching through Bhogapuram and Pusapatirega mandals.')}
          >
            <path
              d="M 630,565 Q 710,525 750,465 L 950,465 L 950,680 L 550,680 Z"
              fill="url(#vzmBayOfBengalSea)"
              stroke="#0284c7"
              strokeWidth="1.6"
            />
            <circle cx="820" cy="580" r="45" fill="url(#vzmWaveRipple)">
              <animate attributeName="r" values="30;60;30" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="890" cy="620" r="55" fill="url(#vzmWaveRipple)">
              <animate attributeName="r" values="40;75;40" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite" />
            </circle>

            {/* Coastline */}
            <path
              d="M 630,565 Q 710,525 750,465"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeDasharray="4 2"
              opacity="0.8"
            />

            <text
              x="810"
              y="545"
              fill="#0369a1"
              fontSize="14"
              fontWeight="900"
              letterSpacing="4"
              transform="rotate(-25, 810, 545)"
            >
              BAY OF BENGAL 🌊
            </text>
          </g>
        </g>

        {/* ============================================================== */}
        {/* 28 CADASTRAL MANDAL POLYGONS (DISTINCT HIGH CONTRAST PALETTE)  */}
        {/* ============================================================== */}
        <g id="mandal-layer">
          {VIZIANAGARAM_MANDALS.map((mandal) => {
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

                {/* Mandal Name Label (Clean White Halo + Ultra-Bold Text for Instant Readability) */}
                <text
                  x={mandal.center.x}
                  y={mandal.center.y - 7}
                  textAnchor="middle"
                  fontSize={mandal.id === 'vizianagaram_hq' ? '12.5' : '10.5'}
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

                {/* Dedicated Water Body Node on EVERY SINGLE Mandal with 5-Color Standards */}
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
          <g id="rivers-layer">
            {/* 1. Suvarnamukhi River */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Suvarnamukhi River', 'Major tributary of the Nagavali river flowing through Vangara, Balijipeta and Therlam mandals.', '140 Cusecs', '88.5 m', '92.0 m')}
            >
              {/* Invisible wide click zone */}
              <path d="M 645,25 Q 630,70 660,110 T 685,160" fill="none" stroke="transparent" strokeWidth="20" />
              {/* Visible river line */}
              <path d="M 645,25 Q 630,70 660,110 T 685,160" fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* 2. Vegavali River */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Vegavali River', 'Originates in the Eastern Ghats, flows past Bobbili Fort and Badangi to replenish local irrigation tanks.', '95 Cusecs', '92.4 m', '96.0 m')}
            >
              <path d="M 330,115 Q 395,145 465,155 T 575,175" fill="none" stroke="transparent" strokeWidth="20" />
              <path d="M 330,115 Q 395,145 465,155 T 575,175" fill="none" stroke="#0284c7" strokeWidth="3.6" strokeLinecap="round" />
            </g>

            {/* 3. Nellimara / Champavathi River */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Nellimara / Champavathi River', 'Primary river system of Vizianagaram district feeding the Nellimarla Barrage and flowing out to the Bay of Bengal.', '240 Cusecs', '45.2 m', '49.0 m')}
            >
              <path d="M 435,360 Q 480,410 545,465 Q 585,520 660,570" fill="none" stroke="transparent" strokeWidth="22" />
              <path d="M 435,360 Q 480,410 545,465 Q 585,520 660,570" fill="none" stroke="#0284c7" strokeWidth="4.8" strokeLinecap="round" />
            </g>

            {/* 4. Gosthani River Basin */}
            <g
              className="cursor-pointer group"
              onClick={() => handleRiverClick('Gosthani River', 'Perennial river originating in Ananthagiri hills, feeding Tatipudi Reservoir and supplying drinking water to Visakhapatnam & Vizianagaram.', '190 Cusecs', '72.5 m', '76.8 m')}
            >
              <path d="M 230,480 Q 290,485 320,545 Q 330,600 310,645" fill="none" stroke="transparent" strokeWidth="22" />
              <path d="M 230,480 Q 290,485 320,545 Q 330,600 310,645" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
            </g>

            {/* River Flow Animated Water Droplets */}
            <circle r="4" fill="#38bdf8" className="pointer-events-none">
              <animateMotion path="M 645,25 Q 630,70 660,110 T 685,160" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle r="3.5" fill="#38bdf8" className="pointer-events-none">
              <animateMotion path="M 330,115 Q 395,145 465,155 T 575,175" dur="4.5s" repeatCount="indefinite" />
            </circle>
            <circle r="4.5" fill="#38bdf8" className="pointer-events-none">
              <animateMotion path="M 435,360 Q 480,410 545,465 Q 585,520 660,570" dur="3.8s" repeatCount="indefinite" />
            </circle>
            <circle r="4" fill="#0284c7" className="pointer-events-none">
              <animateMotion path="M 230,480 Q 290,485 320,545 Q 330,600 310,645" dur="4.2s" repeatCount="indefinite" />
            </circle>

            {/* River Labels with Clean White Halo (100% Readable) */}
            <text 
              x="645" 
              y="115" 
              fill="#0369a1" 
              fontSize="10.5" 
              fontWeight="bold" 
              fontStyle="italic" 
              paintOrder="stroke" 
              stroke="#ffffff" 
              strokeWidth="3"
              transform="rotate(45, 645, 115)"
              className="pointer-events-none select-none"
            >
              Suvarnamukhi River 🌊
            </text>
            <text 
              x="385" 
              y="142" 
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
            <text 
              x="500" 
              y="445" 
              fill="#0369a1" 
              fontSize="11" 
              fontWeight="bold" 
              fontStyle="italic" 
              paintOrder="stroke" 
              stroke="#ffffff" 
              strokeWidth="3.5"
              transform="rotate(35, 500, 445)"
              className="pointer-events-none select-none"
            >
              Nellimara / Champavathi River 🌊
            </text>
            <text 
              x="245" 
              y="525" 
              fill="#0369a1" 
              fontSize="11" 
              fontWeight="bold" 
              fontStyle="italic" 
              paintOrder="stroke" 
              stroke="#ffffff" 
              strokeWidth="3.5"
              transform="rotate(35, 245, 525)"
              className="pointer-events-none select-none"
            >
              Gosthani River 🌊
            </text>
          </g>
        )}

        {/* ============================================================== */}
        {/* PROMINENT KEY RESERVOIRS & WATER HUBS (INTERACTIVE)            */}
        {/* ============================================================== */}
        <g id="prominent-water-bodies">
          {/* 1. TATIPUDI RESERVOIR */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = VIZIANAGARAM_MANDALS.find(item => item.id === 'gantyada');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="265" cy="485" rx="22" ry="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" filter="drop-shadow(0 2px 6px rgba(2,132,199,0.5))" />
            <circle cx="265" cy="485" r="5" fill="#38bdf8" />
            <g transform="translate(195, 452)">
              <rect width="138" height="20" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
              <text x="69" y="14" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                🌊 Tatipudi Dam (72.5 MCM)
              </text>
            </g>
          </g>

          {/* 2. PEDDA CHERUVU (FORT URBAN BASIN) */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = VIZIANAGARAM_MANDALS.find(item => item.id === 'vizianagaram_hq');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="405" cy="540" rx="16" ry="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <circle cx="405" cy="540" r="4" fill="#60a5fa" />
            <g transform="translate(350, 555)">
              <rect width="112" height="18" rx="5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
              <text x="56" y="13" fill="#ffffff" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                💧 Pedda Cheruvu (Fort)
              </text>
            </g>
          </g>

          {/* 3. ANDRA RESERVOIR */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = VIZIANAGARAM_MANDALS.find(item => item.id === 'mentada');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="225" cy="325" rx="14" ry="9" fill="#0284c7" stroke="#ffffff" strokeWidth="1.8" />
            <g transform="translate(175, 338)">
              <rect width="98" height="17" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="49" y="12" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                💧 Andra Reservoir
              </text>
            </g>
          </g>

          {/* 4. CHAMPAVATHI BARRAGE */}
          <g
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const m = VIZIANAGARAM_MANDALS.find(item => item.id === 'nellimarla');
              if (m) handleMandalClick(m);
            }}
          >
            <ellipse cx="545" cy="485" rx="15" ry="9" fill="#0284c7" stroke="#ffffff" strokeWidth="1.8" />
            <g transform="translate(490, 498)">
              <rect width="118" height="17" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="59" y="12" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                🌊 Champavathi Barrage
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
