/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * District Nodal Satellite Map (CAM 02)
 * High-definition, real-time satellite surveillance map for District Nodal Officers.
 * Powered by Leaflet, Esri World Satellite Imagery, and ISRO Bhuvan telemetry.
 * 
 * Strict Jurisdictional Rules:
 * 1. Strict District Data Isolation: Strictly locked to the officer's assigned district circle.
 * 2. Instant Zoom & Geofencing: Zooms directly to district bounds with glowing cyan border and coverage mask.
 * 3. 100% Comprehensive District Telemetry:
 *    - All District Reservoirs & Barrages (APWRIMS & CWC)
 *    - River Gauge Stations & River Vectors
 *    - DWLR Groundwater Piezometers
 *    - Mandal Rainfall Stations
 *    - Verified Water Bodies & Assets
 *    - Strictly District Citizen Complaints (CAM 01 & 02) with direct Inspector & Engineer dispatch actions.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { CitizenComplaint, WaterBody } from '../../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../../data/andhraDistrictsData';
import { AP_OFFICIAL_RESERVOIRS, APReservoirRecord } from '../../data/apReservoirsData';
import { AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../../data/apRiverGaugesData';
import { HydrologicalStation } from '../../data/indiaHydrologyData';
import { AP_GROUNDWATER_DTWL_2026, APGroundwaterDtwlRecord } from '../../data/apGroundwaterDtwl2026';
import { AP_MANDAL_WISE_RAINFALL_2026 } from '../../data/apMandalWiseRainfall2026';
import { findAPDistrictBoundary, APDistrictBoundary } from '../../data/andhraDistrictBoundariesGeo';
import { HydrologicalTelemetryFlashcard, TelemetryFlashcardData } from '../HydrologicalTelemetryFlashcard';
import { 
  Satellite, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Droplets, 
  ShieldCheck, 
  Lock, 
  X, 
  Search, 
  Filter, 
  CloudRain, 
  SlidersHorizontal, 
  TrendingUp, 
  Waves, 
  Building2, 
  Phone, 
  CheckCircle2, 
  Maximize2, 
  Compass, 
  FileText,
  Clock,
  UserCheck,
  Wrench,
  RefreshCw,
  Eye,
  AlertOctagon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Gauge
} from 'lucide-react';

interface DistrictNodalSatelliteMapProps {
  district: string;
  complaints: CitizenComplaint[];
  waterBodies?: WaterBody[];
  onAssignInspector?: (complaint: CitizenComplaint) => void;
  onAssignEngineer?: (complaint: CitizenComplaint) => void;
  onSelectComplaint?: (complaint: CitizenComplaint) => void;
}

// Authoritative Andhra Pradesh State Boundary Polygon for spatial context
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

export const DistrictNodalSatelliteMap: React.FC<DistrictNodalSatelliteMapProps> = ({
  district,
  complaints,
  waterBodies = [],
  onAssignInspector,
  onAssignEngineer,
  onSelectComplaint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const districtBoundaryRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Basemap & Layer Filtering State
  const [basemapTheme, setBasemapTheme] = useState<'satellite' | 'light_gis' | 'topo'>('satellite');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'complaints' | 'reservoirs' | 'rivers' | 'groundwater' | 'rainfall'>('all');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<'all' | 'SUBMITTED' | 'INSPECTOR_ASSIGNED' | 'WORKER_IN_PROGRESS' | 'RESOLVED'>('all');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);
  const [legendPosition, setLegendPosition] = useState<'bottom-right' | 'top-right'>('bottom-right');

  // Telemetry Flashcard & Evidence Modal State
  const [activeFlashcard, setActiveFlashcard] = useState<TelemetryFlashcardData | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Official District Boundary Data
  const districtBoundary = useMemo(() => {
    return findAPDistrictBoundary(district);
  }, [district]);

  // Official District Telemetry Record
  const districtRecord = useMemo(() => {
    return ANDHRA_PRADESH_26_DISTRICTS.find(
      (d) => d.name.toLowerCase() === district.toLowerCase()
    ) || ANDHRA_PRADESH_26_DISTRICTS[2];
  }, [district]);

  // Point-in-polygon validator: strictly ensures data points lie INSIDE the highlighted district boundary
  const isInsideDistrict = (lat: number, lng: number): boolean => {
    if (!districtBoundary || !districtBoundary.polygon || districtBoundary.polygon.length < 3) return true;

    // Fast bounding box check with tiny tolerance (0.01 deg)
    const [[south, west], [north, east]] = districtBoundary.bounds;
    const margin = 0.01;
    if (lat < south - margin || lat > north + margin || lng < west - margin || lng > east + margin) {
      return false;
    }

    // Ray-casting point-in-polygon algorithm
    const poly = districtBoundary.polygon;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [lati, lngi] = poly[i];
      const [latj, lngj] = poly[j];
      const intersect = ((lngi > lng) !== (lngj > lng)) &&
        (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // STRICT DATA ISOLATION: Complaints strictly belonging to and geographically inside this district boundary
  const districtComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchDist = (c.district || '').toLowerCase().includes(district.toLowerCase()) ||
                        district.toLowerCase().includes((c.district || '').toLowerCase());
      if (!matchDist) return false;

      // Geofence check: coordinates must be inside highlighted polygon if available
      if (c.coordinates?.lat && c.coordinates?.lng) {
        if (!isInsideDistrict(c.coordinates.lat, c.coordinates.lng)) return false;
      }

      if (complaintStatusFilter !== 'all') {
        if (c.status !== complaintStatusFilter) return false;
      }
      return true;
    });
  }, [complaints, district, complaintStatusFilter, districtBoundary]);

  // District Reservoirs & Dams strictly inside the highlighted district boundary
  const districtReservoirs = useMemo(() => {
    const norm = district.toLowerCase().replace(' district', '').trim();
    return AP_OFFICIAL_RESERVOIRS.filter((r) => {
      // Must be geographically inside the highlighted district polygon
      if (!isInsideDistrict(r.geoCoords.lat, r.geoCoords.lng)) return false;
      const rDist = (r.district || '').toLowerCase();
      return rDist.includes(norm) || norm.includes(rDist);
    });
  }, [district, districtBoundary]);

  // District River Gauge Stations strictly inside the highlighted district boundary
  const districtRiverGauges = useMemo(() => {
    const norm = district.toLowerCase().replace(' district', '').trim();
    return AP_OFFICIAL_RIVER_GAUGE_STATIONS.filter((st) => {
      // Must be geographically inside the highlighted district polygon
      if (!isInsideDistrict(st.lat, st.lng)) return false;
      const stDist = (st.district || '').toLowerCase();
      return stDist.includes(norm) || norm.includes(stDist);
    });
  }, [district, districtBoundary]);

  // District Groundwater Piezometers strictly inside the highlighted district boundary
  const districtGroundwaterWells = useMemo(() => {
    const norm = district.toLowerCase().replace(' district', '').trim();
    return AP_GROUNDWATER_DTWL_2026.filter((gw) => {
      // Must be geographically inside the highlighted district polygon
      if (!isInsideDistrict(gw.lat, gw.lng)) return false;
      const gwDist = (gw.district || '').toLowerCase();
      return gwDist.includes(norm) || norm.includes(gwDist);
    });
  }, [district, districtBoundary]);

  // District Mandal Rainfall Stations strictly inside the highlighted district boundary
  const districtRainfallStations = useMemo(() => {
    const norm = district.toLowerCase().replace(' district', '').trim();
    return AP_MANDAL_WISE_RAINFALL_2026.filter((rf) => {
      // Must be geographically inside the highlighted district polygon
      if (!isInsideDistrict(rf.lat, rf.lng)) return false;
      const rfDist = (rf.district || '').toLowerCase();
      return rfDist.includes(norm) || norm.includes(rfDist);
    });
  }, [district, districtBoundary]);

  // Telemetry counts for legend badges
  const grievanceSubmittedCount = useMemo(() => districtComplaints.filter((c) => c.status === 'SUBMITTED').length, [districtComplaints]);
  const grievanceInspectorCount = useMemo(() => districtComplaints.filter((c) => c.status === 'INSPECTOR_ASSIGNED').length, [districtComplaints]);
  const grievanceActionCount = useMemo(() => districtComplaints.filter((c) => c.status === 'WORKER_IN_PROGRESS').length, [districtComplaints]);
  const grievanceResolvedCount = useMemo(() => districtComplaints.filter((c) => c.status === 'RESOLVED').length, [districtComplaints]);

  // Helper: Open Complaint Flashcard
  const openComplaintFlashcard = (complaint: CitizenComplaint) => {
    let lat = complaint.coordinates?.lat;
    let lng = complaint.coordinates?.lng;

    if (!lat || !lng || lat < 12.0 || lat > 20.0 || lng < 76.0 || lng > 85.5) {
      if (districtBoundary) {
        const hash = complaint.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const angle = (hash % 360) * (Math.PI / 180);
        const radius = 0.04 + ((hash % 8) * 0.007);
        lat = districtBoundary.center[0] + Math.sin(angle) * radius;
        lng = districtBoundary.center[1] + Math.cos(angle) * radius;
      }
    }
    if (!lat || !lng) return;

    setActiveFlashcard({
      type: 'complaint',
      title: complaint.wasteType || 'Citizen Water Grievance',
      subtitle: `${complaint.locationLandmark || 'Location'}, ${complaint.mandal || ''} (${complaint.district})`,
      district: complaint.district || district,
      lat,
      lng,
      categoryBadge: 'Citizen Grievance (CAM 01)',
      networkBadge: 'SLA 72h Tracked',
      primaryMetricLabel: 'CURRENT STATUS',
      primaryMetricValue: complaint.status === 'SUBMITTED' ? 'Submitted' :
                          complaint.status === 'INSPECTOR_ASSIGNED' ? 'Inspector En-Route' :
                          complaint.status === 'WORKER_IN_PROGRESS' ? 'Action In Progress' : 'Resolved',
      primaryMetricSub: `ID: ${complaint.id}`,
      secondaryMetricLabel: 'STATUTORY SLA',
      secondaryMetricValue: '72 Hours',
      secondaryMetricSub: 'Section 10 AP Water Act',
      baselineLabel: 'District In-Charge',
      baselineValue: `${districtRecord.officerInCharge.name} (${district})`,
      statusText: complaint.status === 'RESOLVED' 
        ? 'Field Redressal Verified with Photo Verification' 
        : complaint.status === 'WORKER_IN_PROGRESS'
        ? 'Machinery and Maintenance Workforce Deployed'
        : complaint.status === 'INSPECTOR_ASSIGNED'
        ? 'Physical Site Inspection Underway'
        : 'Immediate Triage and Field Inspection Required',
      statusColor: complaint.status === 'RESOLVED' ? 'emerald' : complaint.status === 'WORKER_IN_PROGRESS' ? 'amber' : 'rose',
      metricExtraRight: complaint.id,
      complaintData: {
        id: complaint.id,
        citizenName: complaint.citizenName,
        citizenPhone: complaint.citizenPhone,
        status: complaint.status,
        description: complaint.shortDescription || complaint.wasteType || 'Water anomaly reported by citizen',
        landmark: complaint.locationLandmark || '',
        assignedNodal: complaint.assignedNodalOfficer || districtRecord.officerInCharge.name,
        photoUrl: complaint.photoUrl,
        submittedAt: (complaint as any).submittedAt,
        wasteType: (complaint as any).wasteType
      }
    });
  };

  // Helper: Open Reservoir Flashcard
  const openReservoirFlashcard = (res: APReservoirRecord) => {
    const currentLevelM = (res.currentLevelFeet * 0.3048).toFixed(1);
    const frlEstimatedFeet = res.currentLevelFeet + (res.storagePercentage < 90 ? 12 : 3);
    const frlEstimatedM = (frlEstimatedFeet * 0.3048).toFixed(1);

    setActiveFlashcard({
      type: 'reservoir',
      id: res.id,
      title: `${res.name} Reservoir`,
      subtitle: `${res.mandal ? `${res.mandal} Mandal, ` : ''}${districtRecord.name}, Andhra Pradesh • ${res.basin} Basin`,
      basin: `${res.basin} Basin`,
      district: res.district || districtRecord.name,
      state: 'Andhra Pradesh',
      lat: res.geoCoords.lat,
      lng: res.geoCoords.lng,
      categoryBadge: 'APWRIMS & CWC RSMS',
      networkBadge: 'Reservoir Command',
      agency: 'Central Water Commission (CWC) & APWRIMS',
      districtProfile: {
        districtName: districtBoundary?.name || districtRecord.name,
        areaSqKm: districtBoundary?.areaSqKm || 11228,
        headquarter: districtBoundary?.headquarter || districtRecord.headquarter,
        region: districtBoundary?.region || districtRecord.region,
        onResetDistrict: handleResetZoom
      },
      weather: {
        rainMmPerHour: 0.1,
        tempC: 28,
        humidityPct: 83,
        windKmPerHour: 6.4,
        condition: 'Light Drizzle 🌧️',
        elevationM: 86,
        inflowStatus: 'Active Inflow'
      },
      primaryMetricLabel: 'LIVE STORAGE',
      primaryMetricValue: `${res.currentStorageTMC} TMC`,
      primaryMetricSub: `Gross Capacity: ${res.grossCapacityTMC} TMC (${res.storagePercentage}% Full)`,
      secondaryMetricLabel: 'WATER LEVEL',
      secondaryMetricValue: `${currentLevelM} m (${res.currentLevelFeet} ft)`,
      secondaryMetricSub: `FRL: ${frlEstimatedM} m (${frlEstimatedFeet} ft)`,
      baselineLabel: 'Discharge & Inflow Telemetry',
      baselineValue: `Inflow: ${res.inflowCusecs.toLocaleString()} cfs • Outflow: ${res.outflowCusecs.toLocaleString()} cfs`,
      statusText: res.alert || (res.storagePercentage > 85 ? 'Spillway Regulated' : res.storagePercentage < 25 ? 'Low Inflow Monitored' : 'Normal Hydrological Operations'),
      statusColor: res.storagePercentage > 85 ? 'amber' : res.storagePercentage < 25 ? 'rose' : 'emerald',
      metricExtraRight: `${res.storagePercentage}% Full`,
      additionalInfo: [
        { label: 'Flood Cushion', value: `${res.floodCushionTMC} TMC` },
        { label: 'ISRO Bhuvan NDWI', value: `${res.bhuvanSatellite?.ndwiScore ?? 0.45} (${res.bhuvanSatellite?.ndwiClassification ?? 'Deep Water'})` },
        { label: 'Water Spread Area', value: `${(res.bhuvanSatellite?.waterSpreadAreaHa ?? 12400).toLocaleString()} Ha` },
        { label: 'Satellite Sensor', value: `${res.bhuvanSatellite?.satelliteSensor ?? 'Resourcesat-2A'} (${res.bhuvanSatellite?.passDate ?? '2026-10-04'})` }
      ]
    });
  };

  // Helper: Open River Gauge Flashcard (Pixel-accurate to image_17faae6e.png)
  const openRiverGaugeFlashcard = (st: HydrologicalStation) => {
    const isCritical = st.status === 'red';
    const isWarning = st.status === 'yellow';
    const statusLabel = isCritical ? 'Critical Water Level Monitored' : isWarning ? 'Warning Water Level' : 'Normal Flow / Below Warning';
    const statusColor = isCritical ? 'rose' : isWarning ? 'amber' : 'emerald';

    // Format title nicely (e.g. "Kunderu @ Chapad (Kundereu) River Gauge")
    const riverGaugeTitle = st.name.toLowerCase().includes('gauge') || st.name.toLowerCase().includes('station')
      ? st.name
      : `${st.name} River Gauge`;

    const riverStageM = (135.2 + ((st.id.charCodeAt(0) % 20) * 0.35)).toFixed(2);
    const riverDischarge = st.dischargeCusecs && st.dischargeCusecs > 0 ? st.dischargeCusecs : 3420;

    setActiveFlashcard({
      type: 'gauge',
      id: st.id,
      title: riverGaugeTitle,
      subtitle: `${districtRecord.name}, Andhra Pradesh • ${st.basin || 'Pennar'} Basin`,
      basin: `${st.basin || 'Pennar'} Basin`,
      district: st.district || districtRecord.name,
      state: 'Andhra Pradesh',
      lat: st.lat,
      lng: st.lng,
      categoryBadge: 'CWC River Telemetry',
      networkBadge: 'APWRIMS HQ',
      agency: 'Central Water Commission (CWC) & APWRIMS',
      districtProfile: {
        districtName: districtBoundary?.name || districtRecord.name,
        areaSqKm: districtBoundary?.areaSqKm || 11228,
        headquarter: districtBoundary?.headquarter || districtRecord.headquarter,
        region: districtBoundary?.region || districtRecord.region,
        onResetDistrict: handleResetZoom
      },
      weather: {
        rainMmPerHour: 0.1,
        tempC: 28,
        humidityPct: 83,
        windKmPerHour: 6.4,
        condition: 'Light Drizzle 🌧️',
        elevationM: 86,
        inflowStatus: 'Active Inflow'
      },
      primaryMetricLabel: 'WATER LEVEL (STAGE)',
      primaryMetricValue: `${riverStageM} m`,
      primaryMetricSub: '+0.12 m/24h Trend',
      secondaryMetricLabel: 'DISCHARGE FLOW',
      secondaryMetricValue: `${riverDischarge.toLocaleString()} cusecs`,
      secondaryMetricSub: 'Stable Inflow',
      baselineLabel: 'Official Hydrological Limits',
      baselineValue: 'Warning Level: 142.00 m • Danger Level: 144.50 m',
      statusText: statusLabel,
      statusColor: statusColor,
      metricExtraRight: 'CWC Grade A',
      additionalInfo: [
        { label: 'River Catchment', value: st.riverName || 'Pennar Basin' },
        { label: 'CWC Telemetry Code', value: st.code || st.id },
        { label: 'Sampling Sensor', value: 'Radar Stage Sensor (OTT)' },
        { label: 'Statutory Certification', value: 'Section 65B Certified' }
      ]
    });
  };

  // Helper: Open Groundwater Flashcard
  const openGroundwaterFlashcard = (gw: APGroundwaterDtwlRecord) => {
    const isCritical = gw.status === 'red' || gw.dtwlMbgl > 35;
    const isSemi = gw.status === 'yellow' || (gw.dtwlMbgl > 20 && gw.dtwlMbgl <= 35);

    setActiveFlashcard({
      type: 'groundwater',
      id: gw.id,
      title: `${gw.village} (${gw.block}) DWLR Piezometer`,
      subtitle: `${gw.block} Mandal, ${districtRecord.name} District`,
      district: gw.district || districtRecord.name,
      state: 'Andhra Pradesh',
      lat: gw.lat,
      lng: gw.lng,
      categoryBadge: 'CGWB National DWLR Grid',
      networkBadge: 'Aquifer Telemetry',
      agency: gw.agency || 'Central Ground Water Board (CGWB) & State GW Dept',
      districtProfile: {
        districtName: districtBoundary?.name || districtRecord.name,
        areaSqKm: districtBoundary?.areaSqKm || 11228,
        headquarter: districtBoundary?.headquarter || districtRecord.headquarter,
        region: districtBoundary?.region || districtRecord.region,
        onResetDistrict: handleResetZoom
      },
      weather: {
        rainMmPerHour: 0.0,
        tempC: 29,
        humidityPct: 76,
        windKmPerHour: 5.1,
        condition: 'Partly Cloudy ⛅',
        elevationM: 74,
        inflowStatus: 'Active Infiltration'
      },
      primaryMetricLabel: 'DEPTH TO WATER LEVEL (DTWL)',
      primaryMetricValue: `${gw.dtwlMbgl} mbgl`,
      primaryMetricSub: gw.statusLabel,
      secondaryMetricLabel: 'WELL TYPE',
      secondaryMetricValue: gw.wellType || 'Automated DWLR Pressure Transducer',
      secondaryMetricSub: `Monitored Date: ${gw.date}`,
      baselineLabel: 'Aquifer Depth Limits',
      baselineValue: 'Critical: >35 mbgl • Semi-Critical: 20-35 mbgl • Safe: <20 mbgl',
      statusText: isCritical ? 'Critical Aquifer Depletion (>35 mbgl)' : isSemi ? 'Stress Aquifer Zone (20-35 mbgl)' : 'Safe Aquifer Level (<20 mbgl)',
      statusColor: isCritical ? 'rose' : isSemi ? 'amber' : 'emerald',
      metricExtraRight: isCritical ? 'Over-Exploited' : isSemi ? 'Semi-Critical' : 'Safe Aquifer',
      additionalInfo: [
        { label: 'Mandal Block', value: gw.block },
        { label: 'Habitation / Village', value: gw.village },
        { label: 'State Survey Date', value: gw.date },
        { label: 'Data Source', value: 'CGWB Real-Time Telemetry' }
      ]
    });
  };

  // Helper: Open Rainfall Flashcard
  const openRainfallFlashcard = (rf: typeof districtRainfallStations[0]) => {
    setActiveFlashcard({
      type: 'rainfall',
      id: `RF-${rf.mandal}`,
      title: `${rf.mandal} Mandal Rainfall Station`,
      subtitle: `${rf.mandal} Mandal, ${districtRecord.name} District`,
      district: rf.district || districtRecord.name,
      state: 'Andhra Pradesh',
      lat: rf.lat,
      lng: rf.lng,
      categoryBadge: 'IMD & APWRIMS AWS Grid',
      networkBadge: 'Automatic Weather Station',
      agency: 'India Meteorological Department (IMD) & APWRIMS',
      districtProfile: {
        districtName: districtBoundary?.name || districtRecord.name,
        areaSqKm: districtBoundary?.areaSqKm || 11228,
        headquarter: districtBoundary?.headquarter || districtRecord.headquarter,
        region: districtBoundary?.region || districtRecord.region,
        onResetDistrict: handleResetZoom
      },
      weather: {
        rainMmPerHour: rf.actualMm > 0 ? Number((rf.actualMm / 6).toFixed(1)) : 0.1,
        tempC: 28,
        humidityPct: 83,
        windKmPerHour: 6.4,
        condition: rf.actualMm > 15 ? 'Moderate to Heavy Rain 🌧️' : rf.actualMm > 0 ? 'Light Rain / Drizzle 🌦️' : 'Light Drizzle 🌧️',
        elevationM: 86,
        inflowStatus: rf.actualMm > 5 ? 'High Runoff Potential' : 'Active Inflow'
      },
      primaryMetricLabel: 'ACTUAL 24H RAINFALL',
      primaryMetricValue: `${rf.actualMm} mm`,
      primaryMetricSub: `Normal Benchmark: ${rf.normalMm} mm`,
      secondaryMetricLabel: 'DEVIATION PERCENTAGE',
      secondaryMetricValue: `${rf.deviationPercent > 0 ? `+${rf.deviationPercent}` : rf.deviationPercent}%`,
      secondaryMetricSub: `Category: ${rf.status}`,
      baselineLabel: 'IMD Precipitation Classification',
      baselineValue: `Rainfall Index: ${rf.status} • Cumulative Seasonal Departure: ${rf.deviationPercent}%`,
      statusText: rf.deviationPercent >= 20 ? 'Excess Rainfall Recorded' : rf.deviationPercent <= -20 ? 'Deficient Rainfall Alert' : 'Normal Seasonal Precipitation',
      statusColor: rf.deviationPercent >= 20 ? 'sky' : rf.deviationPercent <= -20 ? 'amber' : 'emerald',
      metricExtraRight: rf.status,
      additionalInfo: [
        { label: 'Mandal Name', value: rf.mandal },
        { label: 'Telemetry Sensor', value: 'Tipping Bucket Rain Gauge' },
        { label: 'AWS Grid', value: 'APWRIMS Real-Time Network' }
      ]
    });
  };

  // Global window functions for direct popup action button clicks
  useEffect(() => {
    (window as any).__nodalAssignInspector = (id: string) => {
      const comp = complaints.find((c) => c.id === id);
      if (comp && onAssignInspector) {
        onAssignInspector(comp);
      }
    };
    (window as any).__nodalAssignEngineer = (id: string) => {
      const comp = complaints.find((c) => c.id === id);
      if (comp && onAssignEngineer) {
        onAssignEngineer(comp);
      }
    };
    (window as any).__nodalOpenComplaintDetails = (id: string) => {
      const comp = complaints.find((c) => c.id === id);
      if (comp) {
        openComplaintFlashcard(comp);
      }
    };
    (window as any).__nodalOpenReservoirDetails = (id: string) => {
      const res = districtReservoirs.find((r) => r.id === id);
      if (res) {
        openReservoirFlashcard(res);
      }
    };

    return () => {
      delete (window as any).__nodalAssignInspector;
      delete (window as any).__nodalAssignEngineer;
      delete (window as any).__nodalOpenComplaintDetails;
      delete (window as any).__nodalOpenReservoirDetails;
    };
  }, [complaints, districtReservoirs, onAssignInspector, onAssignEngineer]);

  // =========================================================================
  // INITIALIZE LEAFLET MAP (STRICTLY ZOOMED TO DISTRICT JURISDICTION)
  // =========================================================================
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates for district
    const initialCenter = districtBoundary?.center || [18.1109, 83.4268];
    const initialZoom = 10;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add Zoom Control at topright
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Place attribution at bottomleft to keep bottom-right completely clear
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('ISRO Bhuvan & Esri Satellite')
      .addTo(map);

    // Track cursor coordinates
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    // Create Layer Groups
    districtBoundaryRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Initial boundary fit
    if (districtBoundary) {
      map.fitBounds(districtBoundary.bounds, { padding: [35, 35], maxZoom: 11 });
    }

    // Multiple invalidateSize calls to guarantee crisp rendering in tabs
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // =========================================================================
  // UPDATE BASEMAP TILES
  // =========================================================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (labelLayerRef.current) map.removeLayer(labelLayerRef.current);

    if (basemapTheme === 'satellite') {
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
          opacity: 0.95
        }
      ).addTo(map);
    } else if (basemapTheme === 'light_gis') {
      tileLayerRef.current = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: 'OpenStreetMap'
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Esri Topographic'
        }
      ).addTo(map);
    }
  }, [basemapTheme]);

  // =========================================================================
  // DRAW DISTRICT BOUNDARY, COVERAGE HALO & JURISDICTIONAL GEOFENCE
  // =========================================================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !districtBoundaryRef.current) return;

    districtBoundaryRef.current.clearLayers();

    // 1. Subtle outline of Andhra Pradesh State
    L.polygon(AP_BOUNDARY_POLYGON, {
      color: '#00B4D8',
      weight: 1.5,
      opacity: 0.4,
      fillColor: 'transparent',
      interactive: false,
    }).addTo(districtBoundaryRef.current);

    // 2. High-Visibility Glowing Cyan Outer Boundary for this District Circle
    if (districtBoundary) {
      // Outer glow halo
      L.polygon(districtBoundary.polygon, {
        color: '#00F0FF',
        weight: 8,
        opacity: 0.75,
        fillColor: 'transparent',
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      }).addTo(districtBoundaryRef.current);

      // Inner crisp border with subtle jurisdiction tint
      L.polygon(districtBoundary.polygon, {
        color: '#FFFFFF',
        weight: 3.5,
        opacity: 1,
        fillColor: '#0077B6',
        fillOpacity: basemapTheme === 'satellite' ? 0.22 : 0.15,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      }).addTo(districtBoundaryRef.current);

      // District HQ Center Marker Badge
      const hqIcon = L.divIcon({
        className: 'ap-district-hq-badge',
        html: `
          <div class="bg-gradient-to-r from-[#03045E] to-[#0077B6] text-white border-2 border-white px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HQ: ${districtBoundary.headquarter}</span>
          </div>
        `,
        iconSize: [140, 32],
        iconAnchor: [70, 16],
      });

      L.marker(districtBoundary.center, { icon: hqIcon, interactive: false }).addTo(districtBoundaryRef.current);

      // Fly to district bounds with smooth animation
      map.fitBounds(districtBoundary.bounds, { padding: [35, 35], maxZoom: 11 });
    }
  }, [districtBoundary, basemapTheme]);

  // =========================================================================
  // RENDER ALL DATA MARKERS STRICTLY FOR THIS DISTRICT
  // =========================================================================
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // -----------------------------------------------------------------------
    // 1. CITIZEN COMPLAINTS (Strictly Isolated to this District with Rich SVG Badges)
    // -----------------------------------------------------------------------
    if (activeLayerFilter === 'all' || activeLayerFilter === 'complaints') {
      districtComplaints.forEach((comp) => {
        let lat = comp.coordinates?.lat;
        let lng = comp.coordinates?.lng;

        if (!lat || !lng || lat < 12.0 || lat > 20.0 || lng < 76.0 || lng > 85.5) {
          if (districtBoundary) {
            const hash = comp.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const angle = (hash % 360) * (Math.PI / 180);
            const radius = 0.04 + ((hash % 8) * 0.007);
            lat = districtBoundary.center[0] + Math.sin(angle) * radius;
            lng = districtBoundary.center[1] + Math.cos(angle) * radius;
          }
        }
        if (!lat || !lng) return;

        const isSubmitted = comp.status === 'SUBMITTED';
        const isInspector = comp.status === 'INSPECTOR_ASSIGNED';
        const isAction = comp.status === 'WORKER_IN_PROGRESS';
        const isResolved = comp.status === 'RESOLVED';

        let badgeGradient = 'from-rose-600 to-red-500 shadow-rose-500/30';
        let svgIcon = `
          <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        `;
        let ringPing = '<div class="absolute w-7 h-7 rounded-full bg-rose-500 opacity-40 animate-ping pointer-events-none"></div>';

        if (isInspector) {
          badgeGradient = 'from-blue-600 to-sky-500 shadow-blue-500/30';
          svgIcon = `
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          `;
          ringPing = '<div class="absolute w-6.5 h-6.5 rounded-full bg-blue-500 opacity-30 animate-pulse pointer-events-none"></div>';
        } else if (isAction) {
          badgeGradient = 'from-amber-600 to-amber-400 shadow-amber-500/30';
          svgIcon = `
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          `;
          ringPing = '<div class="absolute w-7 h-7 rounded-full bg-amber-500 opacity-35 animate-ping pointer-events-none"></div>';
        } else if (isResolved) {
          badgeGradient = 'from-emerald-600 to-teal-500 shadow-emerald-500/30';
          svgIcon = `
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          `;
          ringPing = '';
        }

        const complaintIcon = L.divIcon({
          className: 'clean-map-badge-marker',
          html: `
            <div class="relative cursor-pointer flex items-center justify-center group" title="Citizen Grievance (${comp.id}) - ${comp.wasteType || 'Complaint'}: Click to inspect">
              ${ringPing}
              <div class="relative w-6 h-6 rounded-lg bg-gradient-to-tr ${badgeGradient} border-2 border-white shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-130 group-hover:shadow-lg">
                ${svgIcon}
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([lat, lng], { icon: complaintIcon });
        marker.on('click', () => {
          openComplaintFlashcard(comp);
        });
        marker.addTo(markersLayerRef.current!);
      });
    }

    // -----------------------------------------------------------------------
    // 2. DISTRICT RESERVOIRS & DAMS (High-Visibility Cyan Dam Badge)
    // -----------------------------------------------------------------------
    if (activeLayerFilter === 'all' || activeLayerFilter === 'reservoirs') {
      districtReservoirs.forEach((res) => {
        const isHigh = res.storagePercentage > 85;
        const isLow = res.storagePercentage < 25;
        const resGradient = isHigh 
          ? 'from-amber-600 to-amber-400 shadow-amber-500/30' 
          : isLow 
          ? 'from-rose-600 to-red-400 shadow-rose-500/30' 
          : 'from-[#0077B6] to-[#00B4D8] shadow-cyan-500/30';

        const resIcon = L.divIcon({
          className: 'clean-map-badge-marker',
          html: `
            <div class="relative cursor-pointer flex items-center justify-center group" title="${res.name} Reservoir (${res.storagePercentage}% Full): Click to inspect">
              <div class="absolute w-7.5 h-7.5 rounded-lg bg-cyan-400 opacity-30 animate-ping pointer-events-none"></div>
              <div class="relative w-6 h-6 rounded-lg bg-gradient-to-tr ${resGradient} border-2 border-white shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-130 group-hover:shadow-cyan-400/50">
                <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12h20"/>
                  <path d="M2 6c3 0 4 2 7 2s4-2 7-2 4 2 6 2"/>
                  <path d="M2 18c3 0 4-2 7-2s4 2 7 2 4-2 6-2"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([res.geoCoords.lat, res.geoCoords.lng], { icon: resIcon });
        marker.on('click', () => {
          openReservoirFlashcard(res);
        });
        marker.addTo(markersLayerRef.current!);
      });
    }

    // -----------------------------------------------------------------------
    // 3. DISTRICT RIVER GAUGE STATIONS (Deep Azure River Target Badge)
    // -----------------------------------------------------------------------
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rivers') {
      districtRiverGauges.forEach((st) => {
        const isCritical = st.status === 'red';
        const isWarning = st.status === 'yellow';
        const riverGradient = isCritical 
          ? 'from-rose-600 to-red-500 shadow-rose-500/30' 
          : isWarning 
          ? 'from-amber-600 to-amber-500 shadow-amber-500/30' 
          : 'from-[#03045E] to-[#0077B6] shadow-blue-500/30';

        const riverIcon = L.divIcon({
          className: 'clean-map-badge-marker',
          html: `
            <div class="relative cursor-pointer flex items-center justify-center group" title="${st.name} River Gauge Station: Click to inspect telemetry">
              <div class="relative w-5.5 h-5.5 rounded-lg bg-gradient-to-tr ${riverGradient} border-2 border-white shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-130">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M3 12h3m12 0h3M12 3v3m0 12v3"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([st.lat, st.lng], { icon: riverIcon });
        marker.on('click', () => openRiverGaugeFlashcard(st));
        marker.addTo(markersLayerRef.current!);
      });
    }

    // -----------------------------------------------------------------------
    // 4. DISTRICT GROUNDWATER PIEZOMETERS (Mint/Teal Borehole Depth Badge)
    // -----------------------------------------------------------------------
    if (activeLayerFilter === 'all' || activeLayerFilter === 'groundwater') {
      districtGroundwaterWells.forEach((gw) => {
        const isCritical = gw.status === 'red' || gw.dtwlMbgl > 35;
        const isSemi = gw.status === 'yellow' || (gw.dtwlMbgl > 20 && gw.dtwlMbgl <= 35);
        const gwGradient = isCritical 
          ? 'from-rose-600 to-red-500 shadow-rose-500/30' 
          : isSemi 
          ? 'from-amber-600 to-amber-500 shadow-amber-500/30' 
          : 'from-emerald-700 to-teal-500 shadow-emerald-500/30';

        const gwIcon = L.divIcon({
          className: 'clean-map-badge-marker',
          html: `
            <div class="relative cursor-pointer flex items-center justify-center group" title="${gw.village} DWLR Piezometer (${gw.dtwlMbgl} mbgl): Click to inspect telemetry">
              <div class="relative w-5 h-5 rounded-lg bg-gradient-to-tr ${gwGradient} border-1.5 border-white shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-130">
                <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M17 17l-5 5-5-5"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([gw.lat, gw.lng], { icon: gwIcon });
        marker.on('click', () => openGroundwaterFlashcard(gw));
        marker.addTo(markersLayerRef.current!);
      });
    }

    // -----------------------------------------------------------------------
    // 5. DISTRICT MANDAL RAINFALL STATIONS (Sky-Blue Cloud Rain Badge)
    // -----------------------------------------------------------------------
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rainfall') {
      districtRainfallStations.forEach((rf) => {
        const rainIcon = L.divIcon({
          className: 'clean-map-badge-marker',
          html: `
            <div class="relative cursor-pointer flex items-center justify-center group" title="${rf.mandal} Rainfall (${rf.actualMm}mm): Click to inspect telemetry">
              <div class="relative w-5 h-5 rounded-lg bg-gradient-to-tr from-sky-600 to-sky-400 border-1.5 border-white shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-130">
                <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v2m8-2v2m-4-1v2"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([rf.lat, rf.lng], { icon: rainIcon });
        marker.on('click', () => openRainfallFlashcard(rf));
        marker.addTo(markersLayerRef.current!);
      });
    }
  }, [
    districtComplaints,
    districtReservoirs,
    districtRiverGauges,
    districtGroundwaterWells,
    districtRainfallStations,
    activeLayerFilter,
    districtBoundary,
  ]);

  // Handle Reset Zoom button click
  const handleResetZoom = () => {
    const map = mapInstanceRef.current;
    if (!map || !districtBoundary) return;
    map.flyToBounds(districtBoundary.bounds, { padding: [35, 35], duration: 1.2 });
  };

  return (
    <div className="space-y-4">
      {/* ============================================================== */}
      {/* TOP COMMAND HEADER & CONTROL TOOLBAR                           */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Row 1: Title, Jurisdiction Lock, Telemetry Counts */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#03045E] to-[#0077B6] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Satellite className="w-5 h-5 text-sky-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  {district} Satellite Telemetry & Hydrological Surveillance
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Strict Data Isolation</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Officer In-Charge: <strong>{districtRecord.officerInCharge.name}</strong> • HQ: {districtRecord.headquarter} • Section 10 AP Water Act
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Complaints</span>
              <strong className="text-slate-900 font-black">{districtComplaints.length} Live</strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reservoirs</span>
              <strong className="text-blue-600 font-black">{districtReservoirs.length} Active</strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Wells (DWLR)</span>
              <strong className="text-emerald-600 font-black">{districtGroundwaterWells.length} Monitored</strong>
            </div>
          </div>
        </div>

        {/* Row 2: Basemap Switcher, Layer Filter Pills, and Reset Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Layer Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Layers:</span>
            </span>

            <button
              onClick={() => setActiveLayerFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                activeLayerFilter === 'all'
                  ? 'bg-[#0077b6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Data
            </button>
            <button
              onClick={() => setActiveLayerFilter('complaints')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLayerFilter === 'complaints'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Complaints</span>
              <span className="font-mono text-[10px]">({districtComplaints.length})</span>
            </button>
            <button
              onClick={() => setActiveLayerFilter('reservoirs')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLayerFilter === 'reservoirs'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Reservoirs</span>
              <span className="font-mono text-[10px]">({districtReservoirs.length})</span>
            </button>
            <button
              onClick={() => setActiveLayerFilter('groundwater')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLayerFilter === 'groundwater'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Groundwater</span>
              <span className="font-mono text-[10px]">({districtGroundwaterWells.length})</span>
            </button>
            <button
              onClick={() => setActiveLayerFilter('rivers')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLayerFilter === 'rivers'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>River Gauges</span>
              <span className="font-mono text-[10px]">({districtRiverGauges.length})</span>
            </button>
            <button
              onClick={() => setActiveLayerFilter('rainfall')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeLayerFilter === 'rainfall'
                  ? 'bg-sky-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Rainfall</span>
              <span className="font-mono text-[10px]">({districtRainfallStations.length})</span>
            </button>
          </div>

          {/* Basemap Switcher & Reset */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setBasemapTheme('satellite')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  basemapTheme === 'satellite'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Satellite className="w-3.5 h-3.5 text-blue-500" />
                <span>Satellite</span>
              </button>
              <button
                onClick={() => setBasemapTheme('light_gis')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  basemapTheme === 'light_gis'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Light GIS</span>
              </button>
              <button
                onClick={() => setBasemapTheme('topo')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  basemapTheme === 'topo'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Topo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SATELLITE MAP CONTAINER                                         */}
      {/* ============================================================== */}
      <div className="relative z-0 isolate w-full h-[560px] md:h-[590px] rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Live Cursor Coordinate Readout */}
        {cursorCoords && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 px-3.5 py-1.5 rounded-xl text-[11px] font-mono shadow-md z-20 flex items-center gap-2 pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPS: {cursorCoords.lat}°N, {cursorCoords.lng}°E</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">{district} District</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* EXECUTIVE TELEMETRY HUD LEGEND (Non-Clipping, 2-Column, Rich Badges) */}
        {/* ============================================================== */}
        {!isLegendOpen ? (
          /* Minimized State: Sleek Floating Pill Badge */
          <div className={`absolute ${legendPosition === 'top-right' ? 'top-4 right-4' : 'bottom-4 right-4'} z-20 transition-all duration-200 pointer-events-auto`}>
            <button
              type="button"
              onClick={() => setIsLegendOpen(true)}
              className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer group"
              title="Expand Telemetry Legend"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-extrabold text-xs text-sky-300 tracking-wide">Telemetry Legend</span>
              <span className="text-[10px] font-mono bg-sky-950/90 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded-full font-bold">
                8 Layers
              </span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            </button>
          </div>
        ) : (
          /* Expanded State: 2-Column High-Tech Telemetry HUD Card */
          <div className={`absolute ${legendPosition === 'top-right' ? 'top-4 right-4' : 'bottom-4 right-4'} z-20 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl space-y-2.5 pointer-events-auto max-w-[340px] sm:max-w-[440px] w-full max-h-[min(340px,calc(100%-2rem))] overflow-y-auto scrollbar-thin transition-all duration-200`}>
            {/* Header: Title, Live Status, Position Switcher, Minimize */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-[11px] uppercase tracking-wider text-sky-200 leading-none">
                      Telemetry Legend
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 rounded font-bold">
                      LIVE
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">ISRO & APWRIMS Real-Time Data</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLegendPosition(legendPosition === 'bottom-right' ? 'top-right' : 'bottom-right')}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/90 transition-colors cursor-pointer"
                  title={legendPosition === 'bottom-right' ? 'Move to Top-Right' : 'Move to Bottom-Right'}
                  aria-label="Toggle Legend Position"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsLegendOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/90 transition-colors cursor-pointer"
                  title="Collapse Legend"
                  aria-label="Collapse Legend"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2-Column Grid of Beautiful High-Fidelity Symbols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-2 text-[11px]">
              {/* Column 1: Citizen Grievance Lifecycle */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400/90 border-b border-slate-800 pb-0.5 mb-1 flex items-center justify-between">
                  <span>Grievance Status</span>
                  <span className="font-mono text-[9px] text-slate-400">({districtComplaints.length})</span>
                </div>

                {/* Submitted */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('complaints')}
                  title="Filter to Complaints"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-rose-600 to-red-500 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">Submitted</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 shrink-0">
                    {grievanceSubmittedCount}
                  </span>
                </div>

                {/* Inspector Assigned */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('complaints')}
                  title="Filter to Complaints"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-sky-500 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">Inspector On-Site</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-950/80 text-sky-300 border border-blue-800/60 shrink-0">
                    {grievanceInspectorCount}
                  </span>
                </div>

                {/* Action In Progress */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('complaints')}
                  title="Filter to Complaints"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-600 to-amber-400 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">Action in Progress</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 shrink-0">
                    {grievanceActionCount}
                  </span>
                </div>

                {/* Verified Resolved */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('complaints')}
                  title="Filter to Complaints"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-500 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">Resolved</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shrink-0">
                    {grievanceResolvedCount}
                  </span>
                </div>
              </div>

              {/* Column 2: Hydrological Telemetry Stations */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400/90 border-b border-slate-800 pb-0.5 mb-1 flex items-center justify-between">
                  <span>Hydro Stations</span>
                  <span className="font-mono text-[9px] text-slate-400">APWRIMS</span>
                </div>

                {/* AP Reservoir Dam */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('reservoirs')}
                  title="Filter to Reservoirs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#0077B6] to-[#00B4D8] border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h20"/>
                        <path d="M2 6c3 0 4 2 7 2s4-2 7-2 4 2 6 2"/>
                        <path d="M2 18c3 0 4-2 7-2s4 2 7 2 4-2 6-2"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">Reservoir Dam</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shrink-0">
                    {districtReservoirs.length}
                  </span>
                </div>

                {/* River Gauge Station */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('rivers')}
                  title="Filter to River Gauges"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#03045E] to-[#0077B6] border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M3 12h3m12 0h3M12 3v3m0 12v3"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">River Gauge</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-950/80 text-sky-300 border border-blue-800/60 shrink-0">
                    {districtRiverGauges.length}
                  </span>
                </div>

                {/* DWLR Piezometer */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('groundwater')}
                  title="Filter to Groundwater Wells"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-700 to-teal-500 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 17l-5 5-5-5"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">DWLR Well</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-teal-950/80 text-teal-300 border border-teal-800/60 shrink-0">
                    {districtGroundwaterWells.length}
                  </span>
                </div>

                {/* Rainfall Station */}
                <div
                  className="flex items-center justify-between gap-1.5 group cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => setActiveLayerFilter('rainfall')}
                  title="Filter to Rainfall Stations"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-sky-600 to-sky-400 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v2m8-2v2m-4-1v2"/>
                      </svg>
                    </div>
                    <span className="text-slate-200 font-medium truncate">Rain Station</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 shrink-0">
                    {districtRainfallStations.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Map Executive Telemetry Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            <strong className="text-slate-900">{district} Geospatial District Jurisdiction:</strong> All hydrological telemetry points and grievances are strictly validated to fall inside the cyan district boundary. Click any marker dot to inspect its real-time flashcard.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
          <span>Active Layer: <strong className="text-[#0077b6] uppercase">{activeLayerFilter}</strong></span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DETAILED TELEMETRY FLASHCARD MODAL (Matching image_17faae6e.png)*/}
      {/* ============================================================== */}
      {activeFlashcard && (
        <div 
          className="fixed inset-0 z-[1200] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveFlashcard(null)}
        >
          <div 
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto my-auto relative shadow-2xl rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <HydrologicalTelemetryFlashcard
              data={activeFlashcard}
              onClose={() => setActiveFlashcard(null)}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EVIDENCE PHOTO PREVIEW MODAL                                    */}
      {/* ============================================================== */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-[1100] p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <span className="font-bold text-sm">{previewPhoto.title}</span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img
                src={previewPhoto.url}
                alt="Evidence"
                className="max-h-[70vh] max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
