import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { CitizenComplaint } from '../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { AP_OFFICIAL_RESERVOIRS, APReservoirRecord } from '../data/apReservoirsData';
import { AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../data/apRiverGaugesData';
import { AP_RIVER_VECTORS } from '../data/andhraRiversGeoData';
import { AP_GROUNDWATER_DTWL_2026 } from '../data/apGroundwaterDtwl2026';
import { 
  Satellite, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Droplets, 
  ShieldCheck, 
  Lock, 
  Maximize2, 
  RotateCcw, 
  Eye, 
  Activity, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Phone, 
  X,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface StateAdminSatelliteMapProps {
  complaints: CitizenComplaint[];
  selectedDistrict?: string;
  onSelectDistrict?: (districtName: string) => void;
  onDispatchReminder?: (complaint: CitizenComplaint) => void;
  onReassignComplaint?: (complaint: CitizenComplaint) => void;
}

// Authoritative Andhra Pradesh Boundary Polygon
const AP_BOUNDARY_POLYGON: [number, number][] = [
  [19.12, 84.78], [18.85, 84.45], [18.35, 84.05], [18.25, 83.90],
  [17.75, 83.35], [17.65, 83.25], [17.35, 82.85], [16.95, 82.25],
  [16.70, 82.20], [16.35, 81.65], [15.90, 80.85], [15.75, 80.35],
  [15.45, 80.05], [14.85, 80.05], [14.45, 80.02], [13.80, 80.20],
  [13.50, 80.25], [13.25, 79.95], [13.15, 79.55], [12.80, 78.95],
  [12.80, 78.45], [13.35, 78.35], [13.75, 77.85], [13.80, 77.20],
  [14.25, 76.85], [14.85, 76.90], [15.25, 77.05], [15.60, 77.15],
  [15.85, 77.40], [16.05, 77.85], [15.95, 78.35], [16.20, 78.90],
  [16.55, 79.30], [16.75, 79.95], [16.95, 80.50], [17.20, 81.10],
  [17.50, 81.25], [17.85, 81.45], [18.25, 82.05], [18.55, 82.65],
  [18.75, 83.05], [19.00, 83.55], [19.15, 84.20], [19.12, 84.78]
];

// Inverted polygon for masking area outside AP
const WORLD_MASK_POLYGON: [number, number][][] = [
  // Outer rectangle covering surrounding region
  [
    [35.0, 60.0],
    [35.0, 100.0],
    [5.0, 100.0],
    [5.0, 60.0],
    [35.0, 60.0]
  ],
  // Hole: AP Boundary
  AP_BOUNDARY_POLYGON
];

export const StateAdminSatelliteMap: React.FC<StateAdminSatelliteMapProps> = ({
  complaints,
  selectedDistrict = 'all',
  onSelectDistrict,
  onDispatchReminder,
  onReassignComplaint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const riverLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Filter & Display States
  const [basemapMode, setBasemapMode] = useState<'satellite' | 'gis_light'>('satellite');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'complaints' | 'reservoirs' | 'rivers' | 'groundwater'>('all');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'complaint' | 'reservoir' | 'district' | 'gauge' | 'groundwater';
    data: any;
  } | null>(null);
  const [isLockedToAP, setIsLockedToAP] = useState<boolean>(true);
  const [filterDistrict, setFilterDistrict] = useState<string>(selectedDistrict);

  // Sync internal filterDistrict with external selectedDistrict
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== filterDistrict) {
      setFilterDistrict(selectedDistrict);
      if (selectedDistrict !== 'all' && mapInstanceRef.current) {
        const dist = ANDHRA_PRADESH_26_DISTRICTS.find(
          d => d.name.toLowerCase() === selectedDistrict.toLowerCase()
        );
        if (dist && dist.centerCoords) {
          mapInstanceRef.current.flyTo([dist.centerCoords.lat, dist.centerCoords.lng], 9.5, { duration: 1.2 });
        }
      }
    }
  }, [selectedDistrict]);

  // AP Strict Bounds
  const apBounds = useMemo(() => {
    return L.latLngBounds(
      L.latLng(12.3, 76.5), // SW
      L.latLng(19.9, 85.2)  // NE
    );
  }, []);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.25, 80.65], // Center of AP near Amaravati / Vijayawada
        zoom: 7.2,
        minZoom: 6.8,
        maxZoom: 16,
        maxBounds: apBounds,
        maxBoundsViscosity: 1.0, // Hard lock to AP
        zoomControl: false,
        attributionControl: false
      });

      // Custom Zoom Control at Top Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Rivers Layer Group
      riverLayerGroupRef.current = L.layerGroup().addTo(map);

      // Markers Layer Group
      markersLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    // Set Basemap
    if (basemapMode === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Esri World Imagery & ISRO Bhuvan'
        }
      ).addTo(map);

      labelLayerRef.current = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          opacity: 0.9
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: 'OpenStreetMap'
        }
      ).addTo(map);
    }

    // Outer Dark Mask to emphasize Andhra Pradesh
    if (maskLayerRef.current) {
      map.removeLayer(maskLayerRef.current);
    }
    maskLayerRef.current = L.polygon(WORLD_MASK_POLYGON, {
      color: 'transparent',
      fillColor: '#0b132b',
      fillOpacity: basemapMode === 'satellite' ? 0.35 : 0.25,
      stroke: false,
      interactive: false
    }).addTo(map);

    // Glowing Andhra Pradesh Boundary Highlight
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
    }
    boundaryLayerRef.current = L.polygon(AP_BOUNDARY_POLYGON, {
      color: '#00B4D8', // Vibrant Cyan highlight
      weight: 3.5,
      opacity: 0.95,
      fillColor: '#0077B6',
      fillOpacity: 0.06,
      dashArray: undefined,
      lineJoin: 'round',
      interactive: false
    }).addTo(map);

    return () => {
      // Keep map reference across re-renders
    };
  }, [basemapMode, apBounds]);

  // Lock / Unlock toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isLockedToAP) {
      map.setMaxBounds(apBounds);
      map.options.maxBoundsViscosity = 1.0;
    } else {
      map.setMaxBounds(null);
    }
  }, [isLockedToAP, apBounds]);

  // 2. Render River Flow Vectors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const riverGroup = riverLayerGroupRef.current;
    if (!map || !riverGroup) return;

    riverGroup.clearLayers();

    if (activeLayerFilter === 'all' || activeLayerFilter === 'rivers') {
      AP_RIVER_VECTORS.forEach(river => {
        const polyline = L.polyline(river.coordinates, {
          color: '#38bdf8', // Luminous sky blue
          weight: basemapMode === 'satellite' ? 4 : 3,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: undefined
        });

        polyline.bindTooltip(
          `<div class="text-xs font-bold text-[#03045E] px-1 py-0.5">${river.name} (${river.basin})</div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        polyline.addTo(riverGroup);
      });
    }
  }, [activeLayerFilter, basemapMode]);

  // 3. Render Real AP Markers (Complaints, Reservoirs, District Centers, River Gauges, Groundwater)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // A. AP 26 District Centers
    ANDHRA_PRADESH_26_DISTRICTS.forEach(dist => {
      if (filterDistrict !== 'all' && dist.name.toLowerCase() !== filterDistrict.toLowerCase()) {
        return;
      }

      // Count complaints in this district
      const distComplaints = complaints.filter(
        c => (c.district || '').toLowerCase().includes(dist.name.toLowerCase())
      );

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full bg-[#03045E]/90 text-white border-2 border-[#00B4D8] shadow-lg flex items-center justify-center font-bold text-[10px] transform hover:scale-125 transition-transform">
            ${distComplaints.length > 0 ? distComplaints.length : 'AP'}
          </div>
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 text-[#03045E] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-slate-200 pointer-events-none">
            ${dist.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'ap-district-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([dist.centerCoords.lat, dist.centerCoords.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedItem({ type: 'district', data: dist });
      });

      marker.addTo(markersGroup);
    });

    // B. Real Citizen Complaints in Andhra Pradesh
    if (activeLayerFilter === 'all' || activeLayerFilter === 'complaints') {
      complaints.forEach(complaint => {
        if (!complaint.coordinates?.lat || !complaint.coordinates?.lng) return;

        // Verify coords within AP
        const { lat, lng } = complaint.coordinates;
        if (lat < 12.0 || lat > 20.0 || lng < 76.0 || lng > 85.5) return;

        if (filterDistrict !== 'all' && !(complaint.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        const isResolved = complaint.status === 'RESOLVED';
        const isAction = complaint.status === 'WORKER_IN_PROGRESS';
        const badgeBg = isResolved ? 'bg-emerald-500' : isAction ? 'bg-amber-500' : 'bg-rose-500';

        const markerHtml = `
          <div class="relative cursor-pointer group">
            <span class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${badgeBg} opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 ${badgeBg}"></span>
            </span>
            <div class="w-9 h-9 rounded-2xl ${badgeBg} border-2 border-white shadow-xl flex items-center justify-center text-white transform hover:scale-125 transition-transform">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10h2v4h-2zm0 6h2v2h-2z"/>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-complaint-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([lat, lng], { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'complaint', data: complaint });
        });

        marker.addTo(markersGroup);
      });
    }

    // C. 113 AP Official Reservoirs
    if (activeLayerFilter === 'all' || activeLayerFilter === 'reservoirs') {
      AP_OFFICIAL_RESERVOIRS.forEach(res => {
        if (!res.geoCoords?.lat || !res.geoCoords?.lng) return;

        if (filterDistrict !== 'all' && !(res.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        const isLow = res.storagePercentage < 25;
        const colorClass = isLow ? 'bg-rose-600 border-rose-300' : 'bg-blue-600 border-sky-300';

        const markerHtml = `
          <div class="w-6 h-6 rounded-full ${colorClass} border-2 text-white shadow-md flex items-center justify-center text-[9px] font-black cursor-pointer hover:scale-125 transition-transform" title="${res.name}">
            💧
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-reservoir-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([res.geoCoords.lat, res.geoCoords.lng], { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'reservoir', data: res });
        });

        marker.addTo(markersGroup);
      });
    }

    // D. Official River Gauges
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rivers') {
      AP_OFFICIAL_RIVER_GAUGE_STATIONS.slice(0, 30).forEach(gauge => {
        if (!gauge.lat || !gauge.lng) return;

        const markerHtml = `
          <div class="w-5 h-5 rounded-md bg-cyan-600 border border-white text-white shadow-xs flex items-center justify-center text-[8px] cursor-pointer hover:scale-125 transition-transform" title="${gauge.name}">
            〰
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-gauge-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([gauge.lat, gauge.lng], { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'gauge', data: gauge });
        });

        marker.addTo(markersGroup);
      });
    }

    // E. Groundwater Telemetry (DWLR Wells)
    if (activeLayerFilter === 'all' || activeLayerFilter === 'groundwater') {
      AP_GROUNDWATER_DTWL_2026.slice(0, 35).forEach(gw => {
        if (!gw.lat || !gw.lng) return;

        const isCritical = gw.waterStatusCategory === 'Critical';
        const colorClass = isCritical ? 'bg-rose-600' : 'bg-emerald-600';

        const markerHtml = `
          <div class="w-4 h-4 rounded-full ${colorClass} border border-white shadow-xs cursor-pointer hover:scale-150 transition-transform" title="${gw.stationName}">
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-gw-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([gw.lat, gw.lng], { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'groundwater', data: gw });
        });

        marker.addTo(markersGroup);
      });
    }

  }, [activeLayerFilter, complaints, filterDistrict]);

  // Reset View to Andhra Pradesh
  const handleResetToAP = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([16.25, 80.65], 7.2, { duration: 1 });
    setFilterDistrict('all');
    if (onSelectDistrict) onSelectDistrict('all');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs relative flex flex-col w-full">
      {/* Top Map Control Bar matching Website Light & Professional Style */}
      <div className="bg-[#f0f7fb] border-b border-sky-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#03045E] to-[#0077B6] flex items-center justify-center text-white shadow-sm shrink-0">
            <Satellite className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#03045E] tracking-tight">
                Andhra Pradesh Satellite Surveillance Grid
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AP Geo-Locked</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              100% Real AP Telemetry: ISRO Bhuvan Satellite Imagery • 113 Reservoirs • Live Grievance Coordinates
            </p>
          </div>
        </div>

        {/* Right Action & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Basemap Switcher (Satellite vs Clean GIS Light) */}
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-bold shadow-2xs">
            <button
              onClick={() => setBasemapMode('satellite')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                basemapMode === 'satellite'
                  ? 'bg-[#03045E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-sky-400" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setBasemapMode('gis_light')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                basemapMode === 'gis_light'
                  ? 'bg-[#0077B6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>GIS Light</span>
            </button>
          </div>

          {/* District Quick-Select Dropdown */}
          <div className="relative">
            <select
              value={filterDistrict}
              onChange={(e) => {
                const val = e.target.value;
                setFilterDistrict(val);
                if (onSelectDistrict) onSelectDistrict(val);
                if (val !== 'all' && mapInstanceRef.current) {
                  const dist = ANDHRA_PRADESH_26_DISTRICTS.find(
                    d => d.name.toLowerCase() === val.toLowerCase()
                  );
                  if (dist && dist.centerCoords) {
                    mapInstanceRef.current.flyTo([dist.centerCoords.lat, dist.centerCoords.lng], 9.5, { duration: 1.2 });
                  }
                } else if (val === 'all') {
                  handleResetToAP();
                }
              }}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 pr-8 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0077B6] cursor-pointer appearance-none"
            >
              <option value="all">All 26 AP Districts</option>
              {ANDHRA_PRADESH_26_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>{d.name} ({d.teluguName})</option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* AP Reset Lock Button */}
          <button
            onClick={handleResetToAP}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0077B6] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Re-center and lock to Andhra Pradesh boundary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit AP</span>
          </button>
        </div>
      </div>

      {/* Layer Filter Buttons Strip */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Surveillance Layers:</span>
        </span>

        <button
          onClick={() => setActiveLayerFilter('all')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
            activeLayerFilter === 'all'
              ? 'bg-[#03045E] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Layers (Combined)
        </button>

        <button
          onClick={() => setActiveLayerFilter('complaints')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayerFilter === 'complaints'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Citizen Grievances ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveLayerFilter('reservoirs')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayerFilter === 'reservoirs'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span>113 AP Reservoirs</span>
        </button>

        <button
          onClick={() => setActiveLayerFilter('rivers')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayerFilter === 'rivers'
              ? 'bg-cyan-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-200" />
          <span>River Vectors & Gauges</span>
        </button>

        <button
          onClick={() => setActiveLayerFilter('groundwater')}
          className={`px-3 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeLayerFilter === 'groundwater'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-200" />
          <span>Groundwater DWLR</span>
        </button>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[540px] sm:h-[620px] bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-lg text-[11px] space-y-1.5 max-w-[240px] hidden sm:block">
          <div className="font-extrabold text-[#03045E] flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0077B6]" />
            <span>AP Surveillance Legend</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
            <span>Citizen Grievance / Problem</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
            <span>Official AP Reservoir (113 Total)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-4 h-1 bg-[#38bdf8] shrink-0 rounded-full"></span>
            <span>River Vectors (Krishna / Godavari / Penna)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-md bg-[#00B4D8] border border-cyan-300 shrink-0"></span>
            <span>Highlighted AP State Border</span>
          </div>
        </div>

        {/* Selected Item Detail Inspector Drawer at Bottom Right */}
        {selectedItem && (
          <div className="absolute top-4 right-4 z-30 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90%] overflow-y-auto animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                  selectedItem.type === 'complaint' ? 'bg-rose-600' :
                  selectedItem.type === 'reservoir' ? 'bg-[#0077B6]' :
                  selectedItem.type === 'district' ? 'bg-[#03045E]' : 'bg-cyan-600'
                }`}>
                  {selectedItem.type === 'complaint' ? '!' :
                   selectedItem.type === 'reservoir' ? '💧' :
                   selectedItem.type === 'district' ? 'AP' : '〰'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {selectedItem.type === 'complaint' ? 'Citizen Grievance' :
                     selectedItem.type === 'reservoir' ? 'State Reservoir Asset' :
                     selectedItem.type === 'district' ? 'District Command' : 'Telemetry Station'}
                  </span>
                  <h4 className="text-sm font-extrabold text-[#03045E] line-clamp-1">
                    {selectedItem.data.name || selectedItem.data.id || 'Selected Asset'}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content for Citizen Complaint */}
            {selectedItem.type === 'complaint' && (
              <div className="space-y-3 text-xs">
                {selectedItem.data.photoUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 relative h-36 bg-slate-100">
                    <img 
                      src={selectedItem.data.photoUrl} 
                      alt="Ground reality" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      GPS Evidence
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">Problem Description</div>
                  <p className="text-slate-800 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {selectedItem.data.shortDescription || selectedItem.data.wasteType}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Citizen</span>
                    <span className="font-bold text-slate-800">{selectedItem.data.citizenName || 'Verified Citizen'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-bold text-rose-600">{selectedItem.data.status}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                  <span className="text-[10px] font-bold text-[#0077B6] block">Assigned Nodal Officer</span>
                  <span className="font-bold text-[#03045E] text-xs">
                    {selectedItem.data.assignedNodalOfficer || 'State Water Cell'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {onDispatchReminder && (
                    <button
                      onClick={() => onDispatchReminder(selectedItem.data)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0077B6] hover:bg-[#03045E] text-white font-bold text-xs text-center transition-all cursor-pointer shadow-xs"
                    >
                      Send Directive
                    </button>
                  )}
                  {onReassignComplaint && (
                    <button
                      onClick={() => onReassignComplaint(selectedItem.data)}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Reassign
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content for Reservoir */}
            {selectedItem.type === 'reservoir' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Live Storage</span>
                    <div className="text-base font-black text-[#03045E]">
                      {selectedItem.data.currentStorageTMC} TMC
                    </div>
                    <span className="text-[10px] text-slate-500">Gross: {selectedItem.data.grossCapacityTMC} TMC</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Fill Percentage</span>
                    <div className="text-base font-black text-[#0077B6]">
                      {selectedItem.data.storagePercentage}%
                    </div>
                    <span className="text-[10px] text-slate-500">Level: {selectedItem.data.currentLevelFeet} ft</span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">District:</span>
                    <span className="font-bold text-slate-800">{selectedItem.data.district}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Basin:</span>
                    <span className="font-bold text-slate-800">{selectedItem.data.basin}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Inflow / Outflow:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedItem.data.inflowCusecs} / {selectedItem.data.outflowCusecs} cusecs
                    </span>
                  </div>
                </div>

                {selectedItem.data.bhuvanSatellite && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      ISRO Bhuvan Optical Pass
                    </span>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-700">Water Spread:</span>
                      <span className="font-bold text-emerald-900">
                        {selectedItem.data.bhuvanSatellite.waterSpreadAreaHa} Ha
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-700">NDWI Spectral Score:</span>
                      <span className="font-mono font-bold text-emerald-900">
                        {selectedItem.data.bhuvanSatellite.ndwiScore}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content for District */}
            {selectedItem.type === 'district' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#03045E] text-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-sky-200 font-bold">
                    {selectedItem.data.region} Region
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {selectedItem.data.name} District
                  </h4>
                  <div className="text-xs text-sky-200 font-telugu">
                    {selectedItem.data.teluguName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Monitored Bodies</span>
                    <span className="text-base font-black text-[#03045E]">
                      {selectedItem.data.totalWaterBodiesCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Groundwater DTWL</span>
                    <span className="text-base font-black text-emerald-600">
                      {selectedItem.data.wrisTelemetry?.groundwaterDepthMbgl} mbgl
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#0077B6] uppercase block">Officer In-Charge</span>
                  <div className="font-bold text-[#03045E]">{selectedItem.data.officerInCharge?.name}</div>
                  <div className="text-slate-500 text-[11px]">{selectedItem.data.officerInCharge?.designation}</div>
                  <div className="text-slate-700 font-mono font-bold text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0077B6]" />
                    <span>{selectedItem.data.officerInCharge?.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#0077B6]" />
          <span>Surveillance Geofence: <strong>State of Andhra Pradesh (26 Districts)</strong></span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Source: ISRO NRSC Bhuvan • APWRIMS • CWC National Grid
        </div>
      </div>
    </div>
  );
};
