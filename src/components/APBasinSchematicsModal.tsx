import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Droplets, 
  ExternalLink, 
  Compass, 
  ArrowRight, 
  Layers, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { APReservoirRecord } from '../data/apReservoirsData';

interface SchematicNode {
  id: string;
  name: string;
  type: 'dam' | 'barrage' | 'reservoir' | 'canal' | 'outfall' | 'tributary';
  river: string;
  district: string;
  lat: number;
  lng: number;
  grossStorageTMC?: number;
  fullReservoirLevelFt?: number;
  inflowCusecs?: number;
  outflowCusecs?: number;
  description: string;
  keyRole: string;
}

interface RiverBasinSchematic {
  id: string;
  name: string;
  teluguName: string;
  catchmentAreaSqKm: number;
  majorProjectsCount: number;
  totalCapacityTMC: number;
  origin: string;
  outfall: string;
  color: string;
  nodes: SchematicNode[];
  connections: { from: string; to: string; label?: string }[];
}

export const AP_RIVER_BASIN_SCHEMATICS: RiverBasinSchematic[] = [
  {
    id: 'krishna',
    name: 'Krishna River Basin',
    teluguName: 'కృష్ణా నదీ పరీవాహక ప్రాంతం',
    catchmentAreaSqKm: 76252,
    majorProjectsCount: 18,
    totalCapacityTMC: 645.8,
    origin: 'Western Ghats (Mahabaleshwar, Maharashtra)',
    outfall: 'Bay of Bengal (Hamsaladeevi / Nagayalanka, AP)',
    color: '#0284c7', // Sky Blue
    nodes: [
      {
        id: 'res-sunkesula',
        name: 'Sunkesula Barrage',
        type: 'barrage',
        river: 'Tungabhadra',
        district: 'Kurnool',
        lat: 15.882,
        lng: 77.828,
        grossStorageTMC: 1.2,
        fullReservoirLevelFt: 960.0,
        inflowCusecs: 14200,
        outflowCusecs: 13800,
        description: 'Historic barrage diverting Tungabhadra waters to KC Canal (Kurnool-Cuddapah).',
        keyRole: 'KC Canal Headworks & Flood Regulation',
      },
      {
        id: 'res-srisailam',
        name: 'Srisailam Dam',
        type: 'dam',
        river: 'Krishna',
        district: 'Nandyal',
        lat: 16.089,
        lng: 78.898,
        grossStorageTMC: 215.8,
        fullReservoirLevelFt: 885.0,
        inflowCusecs: 24500,
        outflowCusecs: 22100,
        description: 'Apex deep gorge reservoir in the Nallamala range powering major hydro generation and feeding Rayalaseema diversions.',
        keyRole: 'Apex Multi-Purpose Reservoir & Rayalaseema Feeder',
      },
      {
        id: 'res-nagarjuna-sagar',
        name: 'Nagarjuna Sagar Dam',
        type: 'dam',
        river: 'Krishna',
        district: 'Palnadu',
        lat: 16.577,
        lng: 79.313,
        grossStorageTMC: 312.0,
        fullReservoirLevelFt: 590.0,
        inflowCusecs: 18200,
        outflowCusecs: 16400,
        description: 'World’s tallest masonry dam serving the Right Canal (Jawahar Canal) in AP and Left Canal in Telangana.',
        keyRole: 'Major Irrigation Backbone & Hydropower',
      },
      {
        id: 'res-pulichinthala',
        name: 'Pulichinthala Project (KL Rao Sagar)',
        type: 'dam',
        river: 'Krishna',
        district: 'Palnadu',
        lat: 16.757,
        lng: 80.054,
        grossStorageTMC: 45.77,
        fullReservoirLevelFt: 175.0,
        inflowCusecs: 12500,
        outflowCusecs: 11800,
        description: 'Balancing reservoir stabilizing the Krishna Delta ayacut and providing buffer storage downstream of NS Dam.',
        keyRole: 'Delta Stabilization & Flood Cushion',
      },
      {
        id: 'res-prakasam-barrage',
        name: 'Prakasam Barrage',
        type: 'barrage',
        river: 'Krishna',
        district: 'NTR / Guntur',
        lat: 16.507,
        lng: 80.605,
        grossStorageTMC: 3.07,
        fullReservoirLevelFt: 57.05,
        inflowCusecs: 19800,
        outflowCusecs: 18500,
        description: 'Terminal barrage at Vijayawada irrigating over 13 lakh acres across the Krishna Delta and supplying drinking water.',
        keyRole: 'Krishna Delta Command Headworks & Buckingham Canal Feeder',
      },
      {
        id: 'node-krishna-outfall',
        name: 'Krishna Delta Outfall (Bay of Bengal)',
        type: 'outfall',
        river: 'Krishna Delta',
        district: 'Krishna',
        lat: 15.785,
        lng: 80.95,
        description: 'Estuarine confluence where the Krishna River branches into the Bay of Bengal at Hamsaladeevi.',
        keyRole: 'Ocean Outfall & Mangrove Ecosystem',
      },
    ],
    connections: [
      { from: 'res-sunkesula', to: 'res-srisailam', label: 'Tungabhadra Confluence' },
      { from: 'res-srisailam', to: 'res-nagarjuna-sagar', label: 'Krishna Gorge Flow (110 km)' },
      { from: 'res-nagarjuna-sagar', to: 'res-pulichinthala', label: 'Downstream Runoff (65 km)' },
      { from: 'res-pulichinthala', to: 'res-prakasam-barrage', label: 'River Channel to Vijayawada (85 km)' },
      { from: 'res-prakasam-barrage', to: 'node-krishna-outfall', label: 'Delta Canals & River Course (60 km)' },
    ],
  },
  {
    id: 'godavari',
    name: 'Godavari River Basin',
    teluguName: 'గోదావరి నదీ పరీవాహక ప్రాంతం',
    catchmentAreaSqKm: 73200,
    majorProjectsCount: 16,
    totalCapacityTMC: 285.4,
    origin: 'Trimbakeshwar (Nashik, Maharashtra)',
    outfall: 'Bay of Bengal (Coringa / Antarvedi / Yanam, AP)',
    color: '#06b6d4', // Cyan
    nodes: [
      {
        id: 'node-kunavaram',
        name: 'Kunavaram Sangam (Sabari River Confluence)',
        type: 'tributary',
        river: 'Sabari & Godavari',
        district: 'Alluri Sitharama Raju',
        lat: 17.5855,
        lng: 81.2585,
        description: 'Mighty confluence where the Sabari and Sileru rivers merge into the mainstream Godavari.',
        keyRole: 'Major Upstream Catchment Influx',
      },
      {
        id: 'res-polavaram',
        name: 'Polavaram Dam Project Headworks',
        type: 'dam',
        river: 'Godavari',
        district: 'Eluru / East Godavari',
        lat: 17.253,
        lng: 81.652,
        grossStorageTMC: 194.6,
        fullReservoirLevelFt: 150.0,
        inflowCusecs: 45000,
        outflowCusecs: 42000,
        description: 'National Project on the Godavari River providing flood regulation, Right Main Canal to Krishna basin, and Left Main Canal to Visakhapatnam.',
        keyRole: 'National Water Grid Lifeline & Inter-Basin Link',
      },
      {
        id: 'node-pattiseema',
        name: 'Pattiseema Lift Irrigation Scheme',
        type: 'canal',
        river: 'Godavari',
        district: 'Eluru',
        lat: 17.15,
        lng: 81.71,
        inflowCusecs: 8500,
        outflowCusecs: 8500,
        description: 'Pioneering river interlinking scheme pumping surplus Godavari flood waters via Polavaram Right Canal into Krishna River above Prakasam Barrage.',
        keyRole: 'Godavari-Krishna Inter-Basin Transfer (80 TMC)',
      },
      {
        id: 'res-dowleswaram',
        name: 'Sir Arthur Cotton Barrage (Dowleswaram)',
        type: 'barrage',
        river: 'Godavari',
        district: 'East Godavari',
        lat: 16.942,
        lng: 81.776,
        grossStorageTMC: 2.93,
        fullReservoirLevelFt: 44.0,
        inflowCusecs: 38000,
        outflowCusecs: 36000,
        description: 'Engineering marvel built by Sir Arthur Cotton dividing the Godavari into four branches irrigating 10 lakh acres across the Godavari Delta.',
        keyRole: 'Godavari Delta Headworks (Eastern, Central, Western Deltas)',
      },
      {
        id: 'node-godavari-outfall',
        name: 'Godavari Delta Outfall (Gowthami & Vasishta)',
        type: 'outfall',
        river: 'Godavari Delta',
        district: 'Konaseema / Kakinada',
        lat: 16.58,
        lng: 82.15,
        description: 'Estuarine outfall branching into Gowthami, Vasishta, Vainateya, and Vriddha Godavari entering the Bay of Bengal.',
        keyRole: 'Coringa Mangroves & Marine Discharge',
      },
    ],
    connections: [
      { from: 'node-kunavaram', to: 'res-polavaram', label: 'Papi Hills Gorge Flow' },
      { from: 'res-polavaram', to: 'node-pattiseema', label: 'River Course & Canal Head' },
      { from: 'node-pattiseema', to: 'res-dowleswaram', label: 'River Flow to Rajahmundry (22 km)' },
      { from: 'res-dowleswaram', to: 'node-godavari-outfall', label: 'Delta Network: Gowthami & Vasishta' },
    ],
  },
  {
    id: 'pennar',
    name: 'Pennar River Basin',
    teluguName: 'పెన్నా నదీ పరీవాహక ప్రాంతం',
    catchmentAreaSqKm: 55213,
    majorProjectsCount: 22,
    totalCapacityTMC: 162.4,
    origin: 'Nandi Hills (Chikkaballapur, Karnataka)',
    outfall: 'Bay of Bengal (Utukuru / Vangallu, Nellore, AP)',
    color: '#8b5cf6', // Violet
    nodes: [
      {
        id: 'res-pabr',
        name: 'PABR (Pennar Ahobilam Balancing Reservoir)',
        type: 'reservoir',
        river: 'Pennar',
        district: 'Ananthapuramu',
        lat: 14.85,
        lng: 77.38,
        grossStorageTMC: 11.1,
        fullReservoirLevelFt: 1476.0,
        description: 'Balancing reservoir supplying drinking water to drought-prone Anantapuramu and feeding HLC canals.',
        keyRole: 'Arid Belt Water Security',
      },
      {
        id: 'res-mylavaram',
        name: 'Mylavaram Dam',
        type: 'dam',
        river: 'Pennar',
        district: 'Y.S.R Kadapa',
        lat: 14.85,
        lng: 78.33,
        grossStorageTMC: 9.96,
        fullReservoirLevelFt: 672.5,
        description: 'Regulates Pennar flows in the Jammalamadugu valley before the Gandikota canyon.',
        keyRole: 'Mid-Pennar Flow Regulation',
      },
      {
        id: 'res-gandikota',
        name: 'Gandikota Reservoir',
        type: 'reservoir',
        river: 'Pennar',
        district: 'Y.S.R Kadapa',
        lat: 14.815,
        lng: 78.287,
        grossStorageTMC: 26.85,
        fullReservoirLevelFt: 718.5,
        description: 'Spectacular canyon reservoir acting as a central balancing storage for the Galeru Nagari Sujala Sravanthi (GNSS) project.',
        keyRole: 'GNSS Strategic Storage Reservoir',
      },
      {
        id: 'res-somasila',
        name: 'Somasila Dam',
        type: 'dam',
        river: 'Pennar',
        district: 'Sri Potti Sriramulu Nellore',
        lat: 14.498,
        lng: 79.302,
        grossStorageTMC: 78.0,
        fullReservoirLevelFt: 330.0,
        inflowCusecs: 14500,
        outflowCusecs: 12000,
        description: 'Largest reservoir in the Pennar basin providing perennial irrigation to Nellore district and feeding Kandaleru via link canal.',
        keyRole: 'Pennar Basin Apex Storage & Telugu Ganga Feeder',
      },
      {
        id: 'res-kandaleru',
        name: 'Kandaleru Reservoir',
        type: 'reservoir',
        river: 'Kandaleru',
        district: 'Sri Potti Sriramulu Nellore',
        lat: 14.337,
        lng: 79.626,
        grossStorageTMC: 68.03,
        fullReservoirLevelFt: 278.9,
        description: 'Massive earthen dam reservoir receiving Somasila-Kandaleru Flood Flow Canal waters and delivering Telugu Ganga drinking water to Chennai.',
        keyRole: 'Telugu Ganga Main Storage & Chennai Supply',
      },
      {
        id: 'node-pennar-outfall',
        name: 'Pennar Estuary Outfall (Bay of Bengal)',
        type: 'outfall',
        river: 'Pennar',
        district: 'Nellore',
        lat: 14.58,
        lng: 80.17,
        description: 'Terminal mouth of the Pennar River emptying into the Bay of Bengal near Utukuru.',
        keyRole: 'Ocean Outfall & Coastal Buffer',
      },
    ],
    connections: [
      { from: 'res-pabr', to: 'res-mylavaram', label: 'Pennar River Course (80 km)' },
      { from: 'res-mylavaram', to: 'res-gandikota', label: 'Canyon Stream (25 km)' },
      { from: 'res-gandikota', to: 'res-somasila', label: 'Lower Pennar Valley (95 km)' },
      { from: 'res-somasila', to: 'res-kandaleru', label: 'Somasila-Kandaleru Link Canal' },
      { from: 'res-somasila', to: 'node-pennar-outfall', label: 'Pennar Main Course to Sea (65 km)' },
    ],
  },
  {
    id: 'vamsadhara',
    name: 'Vamsadhara River Basin',
    teluguName: 'వంశధార నదీ పరీవాహక ప్రాంతం',
    catchmentAreaSqKm: 10830,
    majorProjectsCount: 6,
    totalCapacityTMC: 28.5,
    origin: 'Kalahandi (Eastern Ghats, Odisha)',
    outfall: 'Bay of Bengal (Kalingapatnam, Srikakulam, AP)',
    color: '#10b981', // Emerald
    nodes: [
      {
        id: 'res-gotta',
        name: 'Gotta Barrage (Vamsadhara Project Stage I)',
        type: 'barrage',
        river: 'Vamsadhara',
        district: 'Srikakulam',
        lat: 18.685,
        lng: 83.948,
        grossStorageTMC: 0.65,
        fullReservoirLevelFt: 138.0,
        inflowCusecs: 9200,
        outflowCusecs: 8800,
        description: 'Key headworks diverting Vamsadhara waters into Left and Right Main Canals to irrigate 1.5 lakh acres.',
        keyRole: 'Stage-I Diversion Barrage',
      },
      {
        id: 'res-hiramandalam',
        name: 'Hiramandalam Reservoir (Vamsadhara Stage II)',
        type: 'reservoir',
        river: 'Vamsadhara Off-River',
        district: 'Srikakulam',
        lat: 18.663,
        lng: 83.957,
        grossStorageTMC: 19.05,
        fullReservoirLevelFt: 223.0,
        description: 'Off-river storage balancing reservoir fed by the 8/0 km Flood Flow Canal from Katragada side.',
        keyRole: 'Stage-II Off-Stream Storage (19 TMC)',
      },
      {
        id: 'node-vamsadhara-outfall',
        name: 'Vamsadhara River Mouth (Kalingapatnam)',
        type: 'outfall',
        river: 'Vamsadhara',
        district: 'Srikakulam',
        lat: 18.337,
        lng: 84.129,
        description: 'Historic seaport outfall where Vamsadhara discharges into the Bay of Bengal.',
        keyRole: 'Kalingapatnam Ocean Outfall',
      },
    ],
    connections: [
      { from: 'res-gotta', to: 'res-hiramandalam', label: 'Flood Flow Canal (Off-Stream Link)' },
      { from: 'res-gotta', to: 'node-vamsadhara-outfall', label: 'Vamsadhara Main Course (45 km)' },
    ],
  },
  {
    id: 'nagavali',
    name: 'Nagavali River Basin',
    teluguName: 'నాగావళి నదీ పరీవాహక ప్రాంతం',
    catchmentAreaSqKm: 9510,
    majorProjectsCount: 5,
    totalCapacityTMC: 16.2,
    origin: 'Lakhbahal (Rayagada, Odisha)',
    outfall: 'Bay of Bengal (Mofazbandar, Srikakulam, AP)',
    color: '#f59e0b', // Amber
    nodes: [
      {
        id: 'res-thotapalli',
        name: 'Thotapalli Barrage (Sardar Gouthu Latchanna Project)',
        type: 'barrage',
        river: 'Nagavali',
        district: 'Vizianagaram / Parvathipuram Manyam',
        lat: 18.788,
        lng: 83.488,
        grossStorageTMC: 2.51,
        fullReservoirLevelFt: 344.5,
        inflowCusecs: 6400,
        outflowCusecs: 5900,
        description: 'Modern barrage irrigating over 1.2 lakh acres in Vizianagaram and Srikakulam districts.',
        keyRole: 'Major Nagavali Diversion Barrage',
      },
      {
        id: 'res-madduvalasa',
        name: 'Madduvalasa Reservoir (Suvarnamukhi)',
        type: 'reservoir',
        river: 'Suvarnamukhi / Vegavathi',
        district: 'Vizianagaram',
        lat: 18.59,
        lng: 83.62,
        grossStorageTMC: 3.32,
        fullReservoirLevelFt: 213.25,
        description: 'Tributary reservoir serving the northern coastal plains and supplementing Nagavali irrigation.',
        keyRole: 'Suvarnamukhi Tributary Storage',
      },
      {
        id: 'res-narayanapuram',
        name: 'Narayanapuram Anicut',
        type: 'barrage',
        river: 'Nagavali',
        district: 'Srikakulam',
        lat: 18.47,
        lng: 83.82,
        grossStorageTMC: 0.8,
        fullReservoirLevelFt: 112.0,
        description: 'Downstream anicut on Nagavali river ensuring assured irrigation to delta tail-end mandals.',
        keyRole: 'Tail-End Delta Anicut',
      },
      {
        id: 'node-nagavali-outfall',
        name: 'Nagavali Estuary (Mofazbandar Outfall)',
        type: 'outfall',
        river: 'Nagavali',
        district: 'Srikakulam',
        lat: 18.22,
        lng: 83.95,
        description: 'Coastal outlet where Nagavali meets the Bay of Bengal near Kallepalli and Mofazbandar.',
        keyRole: 'Ocean Outfall',
      },
    ],
    connections: [
      { from: 'res-thotapalli', to: 'res-madduvalasa', label: 'Suvarnamukhi Tributary Branch' },
      { from: 'res-thotapalli', to: 'res-narayanapuram', label: 'Nagavali Main Flow (38 km)' },
      { from: 'res-narayanapuram', to: 'node-nagavali-outfall', label: 'Downstream Runoff to Coast (32 km)' },
    ],
  },
];

interface APBasinSchematicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToNode: (node: SchematicNode) => void;
  liveReservoirs?: APReservoirRecord[];
}

export const APBasinSchematicsModal: React.FC<APBasinSchematicsModalProps> = ({
  isOpen,
  onClose,
  onFlyToNode,
  liveReservoirs = [],
}) => {
  const [selectedBasinId, setSelectedBasinId] = useState<string>('krishna');

  if (!isOpen) return null;

  const currentBasin = AP_RIVER_BASIN_SCHEMATICS.find((b) => b.id === selectedBasinId) || AP_RIVER_BASIN_SCHEMATICS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Andhra Pradesh River Basin Flow Networks & Schematics
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold">
                  APWRIMS Official Flow Models
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Topological flow diagrams from upstream headworks to terminal delta barrages & ocean outfalls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Schematics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Basin Navigation Tabs */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {AP_RIVER_BASIN_SCHEMATICS.map((basin) => {
            const isActive = basin.id === selectedBasinId;
            return (
              <button
                key={basin.id}
                onClick={() => setSelectedBasinId(basin.id)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: basin.color }}></span>
                <span>{basin.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({basin.nodes.length} nodes)</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Basin Overview Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Basin Catchment</span>
              <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                {currentBasin.catchmentAreaSqKm.toLocaleString()} sq.km
              </div>
              <span className="text-[10px] text-slate-400">Total watershed extent</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Total Storage Capacity</span>
              <div className="text-base sm:text-lg font-black text-sky-400 font-mono mt-0.5">
                {currentBasin.totalCapacityTMC} TMC
              </div>
              <span className="text-[10px] text-slate-400">Gross monitored storage</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Key Project Nodes</span>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
                {currentBasin.majorProjectsCount} Projects
              </div>
              <span className="text-[10px] text-slate-400">Dams, barrages & lifts</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Terminal Ocean Outfall</span>
              <div className="text-sm sm:text-base font-bold text-indigo-300 truncate mt-0.5" title={currentBasin.outfall}>
                {currentBasin.outfall}
              </div>
              <span className="text-[10px] text-slate-400">Estuary discharge</span>
            </div>
          </div>

          {/* Interactive Flow Network Diagram */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Upstream to Downstream Topological Cascade ({currentBasin.name})
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Dam / Reservoir
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-500 ml-2"></span> Barrage
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Canal / Interlink
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2"></span> Estuary Outfall
              </div>
            </div>

            {/* Network Chain Cards */}
            <div className="space-y-4">
              {currentBasin.nodes.map((node, idx) => {
                const liveMatch = liveReservoirs.find((r) => r.id === node.id || r.name.toLowerCase().includes(node.name.toLowerCase().split(' ')[0]));
                const isLast = idx === currentBasin.nodes.length - 1;
                const connection = currentBasin.connections.find((c) => c.from === node.id);

                return (
                  <div key={node.id} className="relative">
                    {/* Node Card */}
                    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                      
                      {/* Left: Project identity & description */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Step Order Badge */}
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300 font-mono shrink-0">
                          {idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                              {node.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                              node.type === 'dam' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              node.type === 'barrage' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                              node.type === 'reservoir' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                              node.type === 'canal' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                              'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {node.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {node.district} District • {node.river}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {node.description}
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-[11px] text-sky-400 font-medium">
                            <Zap className="w-3.5 h-3.5 shrink-0" />
                            <span>Role: {node.keyRole}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Telemetry data & Fly to Map button */}
                      <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                        {/* Storage / Capacity metrics if available */}
                        {node.grossStorageTMC !== undefined && (
                          <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block">Gross Cap</span>
                            <span className="text-sm font-bold text-sky-400 font-mono">
                              {node.grossStorageTMC} TMC
                            </span>
                          </div>
                        )}

                        {liveMatch && (
                          <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                            <span className="text-[9px] uppercase font-mono text-slate-500 block">Live Storage</span>
                            <span className="text-sm font-bold text-emerald-400 font-mono">
                              {liveMatch.currentStorageTMC} TMC
                            </span>
                          </div>
                        )}

                        {/* Fly to Map Action */}
                        <button
                          onClick={() => {
                            onFlyToNode(node);
                            onClose();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-900/30 transition-all cursor-pointer whitespace-nowrap"
                          title={`Pinpoint ${node.name} on the map`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>View on Map</span>
                        </button>
                      </div>
                    </div>

                    {/* Connecting Flow Arrow to Next Node */}
                    {!isLast && (
                      <div className="flex items-center justify-center my-1.5">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                          <span>{connection?.label || 'Downstream Hydrological Flow'}</span>
                          <ChevronRight className="w-3 h-3 text-sky-400 rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">5 Official AP River Basins Integrated</span>
            <span className="text-slate-600">•</span>
            <span>Godavari, Krishna, Pennar, Vamsadhara, Nagavali</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Close Flow Diagrams
          </button>
        </div>

      </div>
    </div>
  );
};
