import React, { useState } from 'react';
import { CadastralMapAssetItem } from './types';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Filter, 
  Crosshair, 
  Compass, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Camera, 
  ExternalLink,
  ShieldCheck,
  Maximize2
} from 'lucide-react';

interface InspectorCadastralMapViewProps {
  assets: CadastralMapAssetItem[];
  onLaunchInspection: (asset: CadastralMapAssetItem) => void;
}

export const InspectorCadastralMapView: React.FC<InspectorCadastralMapViewProps> = ({
  assets,
  onLaunchInspection,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || 'MAP-AST-01');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [isRecentering, setIsRecentering] = useState(false);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  const filteredAssets = assets.filter((a) => {
    if (typeFilter === 'All') return true;
    return a.type === typeFilter;
  });

  const handleRecenter = () => {
    setIsRecentering(true);
    setTimeout(() => {
      setSelectedAssetId(assets[0]?.id || '');
      setIsRecentering(false);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Top DGPS Telemetry & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DGPS Active: ±1.8m (RTK Fixed)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Compass className="w-3.5 h-3.5 text-[#0077B6]" />
            <span>Vizianagaram • Bobbili Mandal Sector 3</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Structure Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="All">All Structures ({assets.length})</option>
              <option value="Sluice Gate">Sluice Gates</option>
              <option value="Check Dam">Check Dams</option>
              <option value="Feeder Channel">Feeder Channels</option>
              <option value="Percolation Tank">Percolation Tanks</option>
              <option value="Recharge Shaft">Recharge Shafts</option>
            </select>
          </div>

          <button
            onClick={handleRecenter}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isRecentering ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* Cadastral Interactive Map Canvas */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md h-[460px]">
        {/* SVG Map Layout representing Bobbili Mandal Cadastral Map */}
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="cadastral-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            {/* Water Canal Gradient */}
            <linearGradient id="waterFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0077B6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00B4D8" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="600" fill="#0b1329" />
          <rect width="1000" height="600" fill="url(#cadastral-grid)" />

          {/* River / Canal Vectors (Vegavathi Basin Network) */}
          <path
            d="M 50,180 Q 250,220 450,190 T 750,280 T 950,250"
            fill="none"
            stroke="url(#waterFlow)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 450,190 Q 520,340 480,480 T 600,580"
            fill="none"
            stroke="url(#waterFlow)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 200,50 Q 280,180 250,300 T 150,550"
            fill="none"
            stroke="#0284c7"
            strokeWidth="5"
            strokeDasharray="6,4"
            opacity="0.6"
          />

          {/* Cadastral Survey Plots / Agricultural Ayacut Polygons */}
          <polygon
            points="320,120 440,110 470,200 350,210"
            fill="#064e3b"
            fillOpacity="0.25"
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4,2"
          />
          <text x="350" y="155" fill="#6ee7b7" fontSize="11" fontFamily="sans-serif">
            R.S. 89/2 (420 Ha)
          </text>

          <polygon
            points="480,210 650,220 620,340 470,310"
            fill="#1e3a8a"
            fillOpacity="0.25"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="4,2"
          />
          <text x="510" y="270" fill="#93c5fd" fontSize="11" fontFamily="sans-serif">
            R.S. 114/4 (260 Ha)
          </text>

          <polygon
            points="120,280 270,290 260,420 100,390"
            fill="#7f1d1d"
            fillOpacity="0.25"
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4,2"
          />
          <text x="130" y="345" fill="#fca5a5" fontSize="11" fontFamily="sans-serif">
            R.S. 45/1 (580 Ha)
          </text>

          {/* Current Inspector Position with Pulsing Radar Ring */}
          <g transform="translate(380, 205)">
            <circle r="22" fill="#38bdf8" fillOpacity="0.2" className="animate-ping" />
            <circle r="12" fill="#0284c7" fillOpacity="0.5" />
            <circle r="6" fill="#38bdf8" />
            <text x="14" y="4" fill="#bae6fd" fontSize="11" fontWeight="bold">
              YOU (Pooja Reddy)
            </text>
          </g>

          {/* Asset Markers */}
          {filteredAssets.map((asset, index) => {
            // Map coordinates to SVG coordinates
            const coordsMap: Record<string, { x: number; y: number }> = {
              'MAP-AST-01': { x: 420, y: 195 },
              'MAP-AST-02': { x: 560, y: 250 },
              'MAP-AST-03': { x: 190, y: 350 },
              'MAP-AST-04': { x: 680, y: 380 },
              'MAP-AST-05': { x: 780, y: 270 },
              'MAP-AST-06': { x: 310, y: 240 },
            };
            const pos = coordsMap[asset.id] || { x: 300 + index * 90, y: 200 + index * 40 };
            const isSelected = asset.id === selectedAssetId;

            // Pin Color
            const pinColor =
              asset.status === 'Critical'
                ? '#ef4444'
                : asset.status === 'Due'
                ? '#0284c7'
                : asset.status === 'In Progress'
                ? '#f59e0b'
                : '#10b981';

            return (
              <g
                key={asset.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedAssetId(asset.id)}
                className="cursor-pointer transition-transform hover:scale-115"
              >
                {/* Pin shadow & ring */}
                {isSelected && (
                  <circle r="18" fill={pinColor} fillOpacity="0.25" stroke={pinColor} strokeWidth="2" />
                )}
                <circle r="10" fill={pinColor} stroke="#ffffff" strokeWidth="2" />
                <circle r="4" fill="#ffffff" />

                {/* Label text */}
                <text
                  x="14"
                  y="4"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                >
                  {asset.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Legend Overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs border border-slate-700/60 rounded-xl p-2.5 text-[10px] text-slate-300 space-y-1 shadow-md">
          <span className="font-bold text-white block uppercase tracking-wider">Asset Status</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Critical / Overdue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
            <span>Inspection Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Work In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Verified Safe</span>
          </div>
        </div>
      </div>

      {/* Selected Asset Bottom Inspection Drawer */}
      {selectedAsset && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedAsset.status === 'Critical'
                      ? 'bg-rose-100 text-rose-700'
                      : selectedAsset.status === 'Due'
                      ? 'bg-blue-100 text-blue-700'
                      : selectedAsset.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedAsset.status === 'Critical' ? 'Critical Action Required' : selectedAsset.status}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedAsset.assetCode}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Inside Geo-fence Boundary ({selectedAsset.distanceMeters}m)
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{selectedAsset.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedAsset.parcelNo} • Controlling Authority: {selectedAsset.controllingAuthority}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500">Command Ayacut:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                {selectedAsset.ayacutHa} Hectares
              </span>
            </div>
          </div>

          {/* Citizen complaint snippet if present */}
          {selectedAsset.citizenReportSummary && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Linked Citizen Complaint:</span>
                <p className="text-[11px] text-amber-800 mt-0.5">"{selectedAsset.citizenReportSummary}"</p>
              </div>
              {selectedAsset.photoUrl && (
                <img
                  src={selectedAsset.photoUrl}
                  alt="Citizen proof"
                  className="w-14 h-14 rounded-lg object-cover border border-amber-200 shrink-0"
                />
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-4 h-4 text-[#0077B6]" />
              <span>Lat: {selectedAsset.lat.toFixed(4)}° N, Lng: {selectedAsset.lng.toFixed(4)}° E</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onLaunchInspection(selectedAsset)}
                className="px-5 py-2.5 bg-[#03045E] hover:bg-[#0077B6] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <span>Launch Pre-Monsoon Inspection Wizard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
