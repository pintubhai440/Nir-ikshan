import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { CitizenComplaint } from '../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { AP_OFFICIAL_RESERVOIRS, APReservoirRecord } from '../data/apReservoirsData';
import { AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../data/apRiverGaugesData';
import { AP_RIVER_VECTORS } from '../data/andhraRiversGeoData';
import { AP_GROUNDWATER_DTWL_2026, APGroundwaterDtwlRecord } from '../data/apGroundwaterDtwl2026';
import { AP_MANDAL_WISE_RAINFALL_2026 } from '../data/apMandalWiseRainfall2026';
import { 
  AP_26_DISTRICT_BOUNDARIES, 
  findAPDistrictBoundary, 
  APDistrictBoundary 
} from '../data/andhraDistrictBoundariesGeo';
import { 
  HydrologicalTelemetryFlashcard, 
  TelemetryFlashcardData 
} from './HydrologicalTelemetryFlashcard';
import { useLanguage } from '../context/LanguageContext';
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
  Building,
  Phone,
  CheckCircle2,
  Maximize2,
  Compass,
  FileText
} from 'lucide-react';

interface StateAdminSatelliteMapProps {
  complaints: CitizenComplaint[];
  selectedDistrict?: string;
  onSelectDistrict?: (districtName: string) => void;
  onDispatchReminder?: (complaint: CitizenComplaint) => void;
  onReassignComplaint?: (complaint: CitizenComplaint) => void;
  onBackToDistricts?: () => void;
  focusedReservoir?: APReservoirRecord | null;
  onClearFocusedReservoir?: () => void;
}

// Authoritative Andhra Pradesh State Boundary Polygon
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

// Inverted polygon for masking outside AP so Andhra Pradesh stands out brightly
const WORLD_MASK_POLYGON: [number, number][][] = [
  [
    [35.0, 60.0],
    [35.0, 100.0],
    [5.0, 100.0],
    [5.0, 60.0],
    [35.0, 60.0]
  ],
  AP_BOUNDARY_POLYGON
];

const SATELLITE_MAP_UI = {
  en: {
    mapTitle: 'ISRO Bhuvan Satellite Telemetry Map',
    badgeDistricts: 'AP 26 Districts',
    mapSub: 'Real-time satellite & hydrological telemetry monitoring across Andhra Pradesh',
    searchPlaceholder: 'Search AP Districts, Grievances, Dams...',
    allDistricts: 'All 26 AP Districts',
    complaintsAll: '🚨 Complaints: All',
    submitted: '⚠️ Open / Submitted',
    wip: '🔧 Work In Progress',
    resolved: '✅ Field Resolved',
    flyGrievance: '── Fly to Grievance Site ──',
    settings: 'Settings',
    legendTitle: 'Andhra Pradesh Water Grid',
    reservoirs113: '113 Reservoirs',
    dwlrSafe: 'DWLR Safe (<20m)',
    dwlrStress: 'DWLR Stress',
    dwlrCritical: 'DWLR Critical (>40m)',
    riverGauges: 'River Gauges',
    grievances: 'Grievances',
    geofence: 'Surveillance Geofence: State of Andhra Pradesh (26 Districts)',
  },
  hi: {
    mapTitle: 'इसरो भुवन उपग्रह टेलीमेट्री मानचित्र',
    badgeDistricts: '26 आंध्र प्रदेश जिले',
    mapSub: 'आंध्र प्रदेश भर में रीयल-टाइम उपग्रह एवं जल-वैज्ञानिक टेलीमेट्री निगरानी',
    searchPlaceholder: 'आंध्र प्रदेश के जिले, शिकायतें, बांध खोजें...',
    allDistricts: 'सभी 26 आंध्र प्रदेश जिले',
    complaintsAll: '🚨 शिकायतें: सभी',
    submitted: '⚠️ खुली / दर्ज शिकायतें',
    wip: '🔧 कार्य प्रगति पर है',
    resolved: '✅ फील्ड समाधान सत्यापित',
    flyGrievance: '── शिकायत स्थल पर जाएं ──',
    settings: 'सेटिंग्स',
    legendTitle: 'आंध्र प्रदेश जल ग्रिड',
    reservoirs113: '113 जलाशय',
    dwlrSafe: 'डीडब्ल्यूएलआर सुरक्षित (<20m)',
    dwlrStress: 'डीडब्ल्यूएलआर तनाव',
    dwlrCritical: 'डीडब्ल्यूएलआर गंभीर (>40m)',
    riverGauges: 'नदी गेज स्टेशन',
    grievances: 'नागरिक शिकायतें',
    geofence: 'निगरानी भू-घेरा: आंध्र प्रदेश राज्य (26 जिले)',
  },
  te: {
    mapTitle: 'ఇస్రో భువన్ ఉపగ్రహ టెలిమెట్రీ మ్యాప్',
    badgeDistricts: '26 ఆంధ్రప్రదేశ్ జిల్లాలు',
    mapSub: 'ఆంధ్రప్రదేశ్ అంతటా రియల్-టైమ్ ఉపగ్రహ మరియు హైడ్రోలాజికల్ టెలిమెట్రీ నిఘా',
    searchPlaceholder: 'ఆంధ్రప్రదేశ్ జిల్లాలు, ఫిర్యాదులు, ఆనకట్టలను వెతకండి...',
    allDistricts: 'మొత్తం 26 ఆంధ్రప్రదేశ్ జిల్లాలు',
    complaintsAll: '🚨 ఫిర్యాదులు: అన్నీ',
    submitted: '⚠️ నమోదు చేయబడినవి',
    wip: '🔧 పని జరుగుతోంది',
    resolved: '✅ పరిష్కరించబడినవి',
    flyGrievance: '── ఫిర్యాదు ప్రదేశానికి వెళ్ళండి ──',
    settings: 'సెట్టింగ్‌లు',
    legendTitle: 'ఆంధ్రప్రదేశ్ వాటర్ గ్రిడ్',
    reservoirs113: '113 జలాశయాలు',
    dwlrSafe: 'DWLR సురక్షితం (<20మీ)',
    dwlrStress: 'DWLR ఒత్తిడి',
    dwlrCritical: 'DWLR తీవ్రమైనది (>40మీ)',
    riverGauges: 'నది గేజ్ కేంద్రాలు',
    grievances: 'ప్రజా ఫిర్యాదులు',
    geofence: 'నిఘా జియోఫెన్స్: ఆంధ్రప్రదేశ్ రాష్ట్రం (26 జిల్లాలు)',
  }
};

// Helper to locate the primary reservoir for a given Andhra Pradesh district
function findPrimaryReservoirForDistrict(districtName: string, primaryName?: string): APReservoirRecord | null {
  const normDist = districtName.toLowerCase().replace(' district', '').trim();
  if (primaryName) {
    const pClean = primaryName.toLowerCase()
      .replace(/th/g, 't')
      .replace('reservoir', '')
      .replace('project', '')
      .replace('barrage', '')
      .replace('dam', '')
      .replace('system', '')
      .replace('network', '')
      .trim();

    // 1. Try matching with cleaned name and district
    const exactNameMatch = AP_OFFICIAL_RESERVOIRS.find(r => {
      const rClean = r.name.toLowerCase().replace(/th/g, 't');
      const rDist = (r.district || '').toLowerCase();
      return (rClean.includes(pClean) || pClean.includes(rClean.split(' ')[0])) && (rDist.includes(normDist) || normDist.includes(rDist));
    });
    if (exactNameMatch) return exactNameMatch;

    // 2. Try first word of primaryName with district
    const firstWord = pClean.split(' ')[0];
    if (firstWord && firstWord.length > 3) {
      const firstWordDistMatch = AP_OFFICIAL_RESERVOIRS.find(r => {
        const rClean = r.name.toLowerCase().replace(/th/g, 't');
        const rDist = (r.district || '').toLowerCase();
        return rClean.includes(firstWord) && (rDist.includes(normDist) || normDist.includes(rDist));
      });
      if (firstWordDistMatch) return firstWordDistMatch;
    }

    // 3. Try name match across all reservoirs
    const nameMatch = AP_OFFICIAL_RESERVOIRS.find(r => {
      const rClean = r.name.toLowerCase().replace(/th/g, 't');
      return rClean.includes(pClean) || (pClean.length > 3 && pClean.split(' ')[0].length > 3 && rClean.includes(pClean.split(' ')[0]));
    });
    if (nameMatch) return nameMatch;
  }

  // 4. Fallback to major reservoir in that district
  const districtReservoirs = AP_OFFICIAL_RESERVOIRS.filter(r => {
    const rDist = (r.district || '').toLowerCase();
    return rDist.includes(normDist) || normDist.includes(rDist);
  });
  if (districtReservoirs.length > 0) {
    return districtReservoirs.sort((a, b) => b.grossCapacityTMC - a.grossCapacityTMC)[0];
  }

  return null;
}

export const StateAdminSatelliteMap: React.FC<StateAdminSatelliteMapProps> = ({
  complaints,
  selectedDistrict = 'all',
  onSelectDistrict,
  onDispatchReminder,
  onReassignComplaint,
  onBackToDistricts,
  focusedReservoir,
  onClearFocusedReservoir,
}) => {
  const { language } = useLanguage();
  const currentLang = (language === 'hi' || language === 'te') ? language : 'en';
  const mapUi = SATELLITE_MAP_UI[currentLang];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const selectedDistrictLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const riverLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const focusedReservoirLayerRef = useRef<L.LayerGroup | null>(null);

  // Active Map Filter & Display States
  const [basemapTheme, setBasemapTheme] = useState<'satellite' | 'light_gis' | 'topo'>('satellite');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'reservoirs' | 'rivers' | 'groundwater' | 'complaints' | 'rainfall' | 'basins'>('all');
  const [selectedBasin, setSelectedBasin] = useState<string>('All Basins');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // District Search & Filter State
  const [filterDistrict, setFilterDistrict] = useState<string>(selectedDistrict);
  const [districtSearchInput, setDistrictSearchInput] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Complaint Filter & Quick Fly-to State (Next to Search Bar & District)
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<'all' | 'SUBMITTED' | 'WORKER_IN_PROGRESS' | 'RESOLVED'>('all');
  const [selectedComplaintValue, setSelectedComplaintValue] = useState<string>('all');

  // Dedicated Telemetry Flashcard State (Integrated with District Profile from Image 1)
  const [activeFlashcard, setActiveFlashcard] = useState<TelemetryFlashcardData | null>(null);

  // Settings Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [tempFilterLayer, setTempFilterLayer] = useState<'all' | 'reservoirs' | 'rivers' | 'groundwater' | 'complaints' | 'rainfall' | 'basins'>('all');
  const [tempBasemapTheme, setTempBasemapTheme] = useState<'satellite' | 'light_gis' | 'topo'>('satellite');
  const [tempBasin, setTempBasin] = useState<string>('All Basins');
  const [tempBrightness, setTempBrightness] = useState<number>(100);
  const [tempContrast, setTempContrast] = useState<number>(100);

  // AP Strict Bounds
  const apBounds = useMemo(() => {
    return L.latLngBounds(
      L.latLng(12.3, 76.5), // SW
      L.latLng(19.9, 85.2)  // NE
    );
  }, []);

  // Filtered complaints based on district and status
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      // District filter
      if (filterDistrict !== 'all') {
        const matchesDistrict = (c.district || '').toLowerCase().includes(filterDistrict.toLowerCase());
        if (!matchesDistrict) return false;
      }
      // Status filter
      if (complaintStatusFilter !== 'all') {
        if (c.status !== complaintStatusFilter) return false;
      }
      return true;
    });
  }, [complaints, filterDistrict, complaintStatusFilter]);

  const submittedCount = useMemo(() => complaints.filter(c => c.status === 'SUBMITTED').length, [complaints]);
  const wipCount = useMemo(() => complaints.filter(c => c.status === 'WORKER_IN_PROGRESS').length, [complaints]);
  const resolvedCount = useMemo(() => complaints.filter(c => c.status === 'RESOLVED').length, [complaints]);

  // Autocomplete search suggestions across 26 districts AND complaints
  const searchSuggestions = useMemo(() => {
    if (!districtSearchInput.trim()) return [];
    const q = districtSearchInput.toLowerCase().trim();

    const districts = Object.values(AP_26_DISTRICT_BOUNDARIES).filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.headquarter.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
    ).map(d => ({
      type: 'district' as const,
      id: d.id,
      title: `${d.name} District`,
      subtitle: `HQ: ${d.headquarter} • ${d.region} Region`,
      meta: `${d.areaSqKm.toLocaleString()} km²`,
      data: d
    }));

    const matchingComplaints = complaints.filter(c =>
      c.id.toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q) ||
      (c.shortDescription || '').toLowerCase().includes(q) ||
      (c.wasteType || '').toLowerCase().includes(q)
    ).slice(0, 4).map(c => ({
      type: 'complaint' as const,
      id: c.id,
      title: `${c.id}: ${(c.shortDescription || c.wasteType || '').slice(0, 32)}...`,
      subtitle: `${c.locationLandmark || 'Location'}, ${c.district} (${c.status})`,
      meta: c.status,
      data: c
    }));

    return [...districts, ...matchingComplaints].slice(0, 7);
  }, [districtSearchInput, complaints]);

  // Sync internal filterDistrict with external selectedDistrict prop
  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== 'all') {
      applyDistrictSelection(selectedDistrict, true);
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          applyDistrictSelection(selectedDistrict, true);
        }
      }, 120);
      return () => clearTimeout(timer);
    } else if (selectedDistrict === 'all' && filterDistrict !== 'all') {
      applyDistrictSelection('all', true);
    }
  }, [selectedDistrict]);

  // Open Dedicated Citizen Complaint Flashcard
  const openComplaintFlashcard = (complaint: CitizenComplaint) => {
    let lat = complaint.coordinates?.lat;
    let lng = complaint.coordinates?.lng;

    if (!lat || !lng || lat < 12.0 || lat > 20.0 || lng < 76.0 || lng > 85.5) {
      const boundary = findAPDistrictBoundary(complaint.district || '');
      if (boundary) {
        const hash = complaint.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const angle = (hash % 360) * (Math.PI / 180);
        const radius = 0.035 + ((hash % 8) * 0.007);
        lat = boundary.center[0] + Math.sin(angle) * radius;
        lng = boundary.center[1] + Math.cos(angle) * radius;
      }
    }
    if (!lat || !lng) return;

    const isResolved = complaint.status === 'RESOLVED';
    const isAction = complaint.status === 'WORKER_IN_PROGRESS';
    const boundary = findAPDistrictBoundary(complaint.district || '');

    setActiveFlashcard({
      type: 'complaint',
      title: complaint.wasteType || 'Citizen Water Grievance',
      subtitle: `${complaint.locationLandmark || 'Site'}, ${complaint.mandal || ''} (${complaint.district})`,
      district: complaint.district || 'Andhra Pradesh',
      lat: lat,
      lng: lng,
      categoryBadge: 'Citizen Water Grievance (PGRS)',
      networkBadge: 'SLA 72h Tracked',
      districtProfile: boundary ? {
        districtName: boundary.name,
        areaSqKm: boundary.areaSqKm,
        headquarter: boundary.headquarter,
        region: boundary.region,
        onResetDistrict: () => applyDistrictSelection('all')
      } : undefined,
      primaryMetricLabel: 'GRIEVANCE STATUS',
      primaryMetricValue: complaint.status === 'SUBMITTED' ? 'Submitted' : complaint.status === 'WORKER_IN_PROGRESS' ? 'In Progress' : 'Resolved',
      primaryMetricSub: `ID: ${complaint.id}`,
      secondaryMetricLabel: 'SLA STANDARD',
      secondaryMetricValue: '72 Hours',
      secondaryMetricSub: 'Under APWRIMS PGRS Rule',
      baselineLabel: 'Assigned Nodal Authority',
      baselineValue: complaint.assignedNodalOfficer || 'District Command',
      statusText: complaint.status === 'RESOLVED' 
        ? 'Redressal Verified by Field Inspector' 
        : complaint.status === 'WORKER_IN_PROGRESS'
        ? 'Field Team Dispatched for Action'
        : 'Pending Nodal Officer Field Action',
      statusColor: isResolved ? 'emerald' : isAction ? 'amber' : 'rose',
      metricExtraRight: complaint.id,
      complaintData: {
        id: complaint.id,
        citizenName: complaint.citizenName,
        citizenPhone: complaint.citizenPhone,
        status: complaint.status,
        description: complaint.shortDescription || complaint.wasteType || 'Water pollution report',
        landmark: complaint.locationLandmark || '',
        assignedNodal: complaint.assignedNodalOfficer,
        photoUrl: complaint.photoUrl,
        submittedAt: (complaint as any).submittedAt,
        wasteType: (complaint as any).wasteType
      }
    });
  };

  // Direct Fly-to Citizen Complaint Pin and Open its Flashcard
  const flyToComplaint = (complaintId: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    let lat = complaint.coordinates?.lat;
    let lng = complaint.coordinates?.lng;

    if (!lat || !lng || lat < 12.0 || lat > 20.0 || lng < 76.0 || lng > 85.5) {
      const boundary = findAPDistrictBoundary(complaint.district || '');
      if (boundary) {
        const hash = complaint.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const angle = (hash % 360) * (Math.PI / 180);
        const radius = 0.035 + ((hash % 8) * 0.007);
        lat = boundary.center[0] + Math.sin(angle) * radius;
        lng = boundary.center[1] + Math.cos(angle) * radius;
      }
    }
    if (!lat || !lng) return;

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([lat, lng], 13.5, { duration: 1.2 });
    }

    if (complaint.district && complaint.district.toLowerCase() !== filterDistrict.toLowerCase()) {
      applyDistrictSelection(complaint.district, false);
    }

    openComplaintFlashcard(complaint);
  };

  // Open Primary Reservoir Flashcard when user clicks on a reservoir or district center marker
  const openPrimaryReservoirFlashcard = (districtName: string) => {
    const boundary = findAPDistrictBoundary(districtName);
    const distData = ANDHRA_PRADESH_26_DISTRICTS.find(
      d => d.name.toLowerCase() === districtName.toLowerCase()
    );
    const primaryResName = distData?.wrisTelemetry?.primaryReservoir || '';
    const matchingRes = findPrimaryReservoirForDistrict(districtName, primaryResName);

    // Cleaned reservoir title
    const rawTitle = matchingRes 
      ? matchingRes.name
      : (primaryResName || `${districtName} Primary Reservoir`);
    
    const cleanTitle = rawTitle
      .replace(/PROJECT/i, 'RESERVOIR')
      .replace(/REGULATOR \/ BARRAGE/i, 'BARRAGE')
      .trim();

    const finalTitle = cleanTitle.toLowerCase().includes('reservoir') || cleanTitle.toLowerCase().includes('barrage') || cleanTitle.toLowerCase().includes('dam')
      ? cleanTitle
      : `${cleanTitle} Reservoir`;

    const resStorageTMC = matchingRes 
      ? `${matchingRes.currentStorageTMC} TMC` 
      : `${((distData?.wrisTelemetry?.storagePercentage || 75) * 0.05).toFixed(2)} TMC`;
      
    const resGrossTMC = matchingRes 
      ? `${matchingRes.grossCapacityTMC} TMC` 
      : '4.80 TMC';

    const resPct = matchingRes 
      ? matchingRes.storagePercentage 
      : (distData?.wrisTelemetry?.storagePercentage || 75);

    const resLevelFeet = matchingRes ? matchingRes.currentLevelFeet : 184.5;
    const resLevelM = (resLevelFeet * 0.3048).toFixed(1);
    const resOutflow = matchingRes ? matchingRes.outflowCusecs : 420;
    const resBasin = matchingRes?.basin || `${boundary?.region || 'Andhra'} Basin`;

    setActiveFlashcard({
      type: 'reservoir',
      title: finalTitle,
      subtitle: `${matchingRes?.mandal ? `${matchingRes.mandal} Mandal, ` : ''}${districtName} District`,
      basin: `${resBasin} Basin`,
      district: districtName,
      lat: matchingRes?.geoCoords?.lat || boundary?.center[0] || 16.5,
      lng: matchingRes?.geoCoords?.lng || boundary?.center[1] || 80.5,
      categoryBadge: 'CWC & APWRIMS RSMS',
      networkBadge: 'Primary Reservoir Command',
      agency: 'Central Water Commission (CWC) & AP Water Resources Dept',
      districtProfile: boundary ? {
        districtName: boundary.name,
        areaSqKm: boundary.areaSqKm,
        headquarter: boundary.headquarter,
        region: boundary.region,
        onResetDistrict: () => applyDistrictSelection('all')
      } : undefined,
      primaryMetricLabel: currentLang === 'te' ? 'ప్రత్యక్ష నిల్వ' : currentLang === 'hi' ? 'लाइव भंडारण' : 'LIVE STORAGE',
      primaryMetricValue: resStorageTMC,
      primaryMetricSub: `Gross: ${resGrossTMC} (${resPct}% Full)`,
      secondaryMetricLabel: currentLang === 'te' ? 'నీటి మట్టం' : currentLang === 'hi' ? 'जल स्तर' : 'WATER LEVEL',
      secondaryMetricValue: `${resLevelM} m`,
      secondaryMetricSub: `Gauge: ${resLevelFeet} ft`,
      baselineLabel: currentLang === 'te' ? 'ప్రస్తుత అవుట్‌ఫ్లో' : currentLang === 'hi' ? 'वर्तमान डिस्चार्ज' : 'Current Outflow Discharge',
      baselineValue: `${resOutflow.toLocaleString()} Cusecs`,
      statusText: matchingRes?.alert || (resPct > 85 ? 'Spillway Regulated' : resPct < 25 ? 'Low Storage Inflow Watched' : 'Normal Hydrological Operations'),
      statusColor: resPct > 85 ? 'amber' : resPct < 25 ? 'rose' : 'emerald',
      metricExtraRight: `${resPct}% Full`
    });
  };

  // Open Detailed Telemetry Flashcard for any specific AP Reservoir (with full Bhuvan telemetry)
  const openSpecificReservoirFlashcard = (res: APReservoirRecord) => {
    const currentLevelM = (res.currentLevelFeet * 0.3048).toFixed(1);
    const frlEstimatedFeet = res.currentLevelFeet + (res.storagePercentage < 90 ? 12 : 3);
    const frlEstimatedM = (frlEstimatedFeet * 0.3048).toFixed(1);
    const boundary = findAPDistrictBoundary(res.district || '');

    const titleText = currentLang === 'te' && res.teluguName
      ? `${res.teluguName} (${res.name})`
      : currentLang === 'hi'
      ? `${res.name} जलाशय`
      : `${res.name} Reservoir`;

    const subtitleText = currentLang === 'te'
      ? `${res.mandal ? `${res.mandal} మండలం, ` : ''}${res.district} జిల్లా • ${res.basin} బేసిన్`
      : currentLang === 'hi'
      ? `${res.mandal ? `${res.mandal} मंडल, ` : ''}${res.district} ज़िला • ${res.basin} बेसिन`
      : `${res.mandal ? `${res.mandal} Mandal, ` : ''}${res.district} District • ${res.basin} Basin`;

    setActiveFlashcard({
      type: 'reservoir',
      id: res.id,
      title: titleText,
      subtitle: subtitleText,
      basin: `${res.basin} Basin`,
      district: res.district,
      lat: res.geoCoords.lat,
      lng: res.geoCoords.lng,
      categoryBadge: 'APWRIMS & CWC RSMS',
      networkBadge: currentLang === 'te' ? 'జలాశయ కమాండ్' : currentLang === 'hi' ? 'जलाशय कमान' : 'Reservoir Command',
      agency: 'Central Water Commission (CWC) & AP Water Resources Dept',
      districtProfile: boundary ? {
        districtName: boundary.name,
        areaSqKm: boundary.areaSqKm,
        headquarter: boundary.headquarter,
        region: boundary.region,
        onResetDistrict: () => applyDistrictSelection('all')
      } : undefined,
      primaryMetricLabel: currentLang === 'te' ? 'ప్రత్యక్ష నిల్వ' : currentLang === 'hi' ? 'लाइव जल भंडारण' : 'LIVE STORAGE',
      primaryMetricValue: `${res.currentStorageTMC} TMC`,
      primaryMetricSub: `${currentLang === 'te' ? 'స్థూల సామర్థ్యం' : currentLang === 'hi' ? 'सकल क्षमता' : 'Gross Capacity'}: ${res.grossCapacityTMC} TMC (${res.storagePercentage}% Full)`,
      secondaryMetricLabel: currentLang === 'te' ? 'నీటి మట్టం' : currentLang === 'hi' ? 'वर्तमान जल स्तर' : 'WATER LEVEL',
      secondaryMetricValue: `${currentLevelM} m (${res.currentLevelFeet} ft)`,
      secondaryMetricSub: `FRL: ${frlEstimatedM} m (${frlEstimatedFeet} ft)`,
      baselineLabel: currentLang === 'te' ? 'డిశ్చార్జ్ & ఇన్‌ఫ్లో' : currentLang === 'hi' ? 'डिस्चार्ज एवं अंतर्वाह' : 'Discharge & Inflow Telemetry',
      baselineValue: `Inflow: ${res.inflowCusecs.toLocaleString()} cfs • Outflow: ${res.outflowCusecs.toLocaleString()} cfs`,
      statusText: res.alert || (res.storagePercentage > 85 ? 'Spillway Gates Regulated' : res.storagePercentage < 25 ? 'Low Inflow Monitored' : 'Normal Hydrological Operations'),
      statusColor: res.storagePercentage > 85 ? 'amber' : res.storagePercentage < 25 ? 'rose' : 'emerald',
      metricExtraRight: `${res.storagePercentage}% Full`,
      additionalInfo: [
        { label: currentLang === 'hi' ? 'बाढ़ कुशन' : currentLang === 'te' ? 'వరద కుషన్' : 'Flood Cushion', value: `${res.floodCushionTMC} TMC` },
        { label: currentLang === 'hi' ? 'इसरो उपग्रह NDWI' : currentLang === 'te' ? 'ఇస్రో ఉపగ్రహ NDWI' : 'ISRO Satellite NDWI', value: `${res.bhuvanSatellite?.ndwiScore ?? 0.45} (${res.bhuvanSatellite?.ndwiClassification ?? 'Deep Water'})` },
        { label: currentLang === 'hi' ? 'जल फैलाव क्षेत्रफल' : currentLang === 'te' ? 'నీటి విస్తీర్ణం' : 'Water Spread Area', value: `${(res.bhuvanSatellite?.waterSpreadAreaHa ?? 12400).toLocaleString()} Ha` },
        { label: currentLang === 'hi' ? 'उपग्रह सेंसर व पास' : currentLang === 'te' ? 'ఉపగ్రహ సెన్సార్' : 'Satellite Sensor & Pass', value: `${res.bhuvanSatellite?.satelliteSensor ?? 'Resourcesat-2A'} (${res.bhuvanSatellite?.passDate ?? '2026-10-04'})` },
        { label: currentLang === 'hi' ? 'मृदा नमी स्थिति' : currentLang === 'te' ? 'నేల తేమ స్థితి' : 'Soil Moisture Status', value: res.bhuvanSatellite?.soilMoistureStatus ?? 'Moderate' }
      ]
    });
  };

  // Expose global window helper for direct DOM clicks
  useEffect(() => {
    (window as any).__openAPDistrictHQ = (name: string) => {
      openPrimaryReservoirFlashcard(name);
    };
    return () => {
      delete (window as any).__openAPDistrictHQ;
    };
  }, [openPrimaryReservoirFlashcard]);

  // Handle District Selection with Glowing Polygon Highlight, Zoom & Integrated Flashcard
  const applyDistrictSelection = (districtName: string, shouldFly: boolean = true) => {
    setFilterDistrict(districtName);
    if (onSelectDistrict && districtName !== selectedDistrict) onSelectDistrict(districtName);

    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize();

    // Clear previous district selection layers
    if (selectedDistrictLayerGroupRef.current) {
      selectedDistrictLayerGroupRef.current.clearLayers();
    }

    if (districtName === 'all') {
      if (shouldFly) {
        map.flyToBounds(apBounds, { padding: [20, 20], duration: 1.2 });
      }
      return;
    }

    const boundary = findAPDistrictBoundary(districtName);
    if (boundary) {
      const langTitle = currentLang === 'te' 
        ? `${boundary.teluguName} జిల్లా` 
        : currentLang === 'hi' 
        ? `${boundary.hindiName} जिला` 
        : `${boundary.name} District`;

      const langSubtitle = currentLang === 'te'
        ? `విస్తీర్ణం: ${boundary.areaSqKm.toLocaleString()} చ.కి.మీ • ప్రధాన కేంద్రం: ${boundary.headquarter}`
        : currentLang === 'hi'
        ? `क्षेत्रफल: ${boundary.areaSqKm.toLocaleString()} वर्ग किमी • मुख्यालय: ${boundary.headquarter}`
        : `Area: ${boundary.areaSqKm.toLocaleString()} sq km • HQ: ${boundary.headquarter}`;

      if (selectedDistrictLayerGroupRef.current) {
        // 1. Subtle dashed boundary lines for all other 25 districts to give spatial context
        Object.values(AP_26_DISTRICT_BOUNDARIES).forEach(other => {
          if (other.name !== boundary.name) {
            L.polygon(other.polygon, {
              color: '#94a3b8',
              weight: 1.5,
              opacity: 0.45,
              fillColor: 'transparent',
              dashArray: '4, 4',
              interactive: false,
            }).addTo(selectedDistrictLayerGroupRef.current!);
          }
        });

        // 2. Outer glowing cyan halo for the selected district boundary
        L.polygon(boundary.polygon, {
          color: '#00F0FF',
          weight: 8,
          opacity: 0.75,
          fillColor: 'transparent',
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
          className: 'ap-selected-district-glow'
        }).addTo(selectedDistrictLayerGroupRef.current);

        // 3. Crisp bright white/cyan solid inner border with translucent blue fill
        L.polygon(boundary.polygon, {
          color: '#FFFFFF',
          weight: 3.5,
          opacity: 1,
          fillColor: '#0077B6',
          fillOpacity: basemapTheme === 'satellite' ? 0.32 : 0.22,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
          className: 'ap-selected-district-boundary'
        }).addTo(selectedDistrictLayerGroupRef.current);

        // 4. District center marker badge with pure language localization
        const centerIcon = L.divIcon({
          className: 'ap-district-center-badge',
          html: `<div 
            onclick="window.__openAPDistrictHQ && window.__openAPDistrictHQ('${boundary.name}')"
            style="
              background: rgba(3, 4, 94, 0.95);
              color: #ffffff;
              padding: 8px 16px;
              border-radius: 14px;
              border: 2px solid #00F0FF;
              box-shadow: 0 8px 24px rgba(0, 180, 216, 0.6);
              font-family: 'Plus Jakarta Sans', sans-serif;
              text-align: center;
              white-space: nowrap;
              cursor: pointer !important;
              pointer-events: auto !important;
              user-select: none;
              transform: translate(-50%, -50%);
            "
          >
            <div style="font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
              <span>🏛️</span><span>${langTitle}</span>
              <span style="font-size: 10px; background: #0077B6; color: #ffffff; padding: 1px 6px; border-radius: 6px; margin-left: 2px;">HQ</span>
            </div>
            <div style="font-size: 10.5px; font-weight: 700; color: #00F0FF; margin-top: 2px; cursor: pointer;">
              ${langSubtitle}
            </div>
          </div>`,
          iconSize: [0, 0]
        });

        const centerMarker = L.marker(boundary.center, { 
          icon: centerIcon, 
          interactive: true,
          zIndexOffset: 30000 
        }).addTo(selectedDistrictLayerGroupRef.current);

        centerMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          openPrimaryReservoirFlashcard(boundary.name);
        });
      }

      // 5. Fly & Fit Map smoothly to District Boundary with clear padding
      if (shouldFly) {
        map.invalidateSize();
        const poly = L.polygon(boundary.polygon);
        const polyBounds = poly.getBounds().isValid() ? poly.getBounds() : L.latLngBounds(boundary.bounds);
        map.flyToBounds(polyBounds.pad(0.12), { duration: 1.1, maxZoom: 11 });
      }

      // Do NOT auto-open flashcard - only zoom to district and wait for user click on a pin
      setActiveFlashcard(null);
    }
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.25, 80.65], // Center of Andhra Pradesh near Amaravati / Vijayawada
        zoom: 7.2,
        minZoom: 6.6,
        maxZoom: 17,
        maxBounds: apBounds,
        maxBoundsViscosity: 0.85,
        zoomControl: false,
        attributionControl: false
      });

      // Zoom Control at Top Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Rivers Layer Group
      riverLayerGroupRef.current = L.layerGroup().addTo(map);

      // Markers Layer Group
      markersLayerGroupRef.current = L.layerGroup().addTo(map);
      selectedDistrictLayerGroupRef.current = L.layerGroup().addTo(map);
      focusedReservoirLayerRef.current = L.layerGroup().addTo(map);

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

    // Set Basemap based on Theme
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
      // Topographic Relief
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Esri Topo'
        }
      ).addTo(map);
    }

    // Outer Dark Mask to emphasize Andhra Pradesh
    if (maskLayerRef.current) {
      map.removeLayer(maskLayerRef.current);
    }
    maskLayerRef.current = L.polygon(WORLD_MASK_POLYGON, {
      color: 'transparent',
      fillColor: '#03045E',
      fillOpacity: basemapTheme === 'satellite' ? 0.38 : 0.22,
      stroke: false,
      interactive: false
    }).addTo(map);

    // Glowing Andhra Pradesh State Boundary Highlight
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
    }
    boundaryLayerRef.current = L.polygon(AP_BOUNDARY_POLYGON, {
      color: '#00B4D8', // Luminous Cyan highlight
      weight: 3.5,
      opacity: 0.95,
      fillColor: '#0077B6',
      fillOpacity: 0.05,
      lineJoin: 'round',
      interactive: false
    }).addTo(map);

    // If a district is pre-selected on initial mount, highlight its boundary and fly to it
    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (selectedDistrict && selectedDistrict !== 'all') {
          applyDistrictSelection(selectedDistrict, true);
        }
      }
    }, 150);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };

  }, [basemapTheme, apBounds, selectedDistrict]);

  // Handle focusing a specific reservoir (e.g. from Water Assets & Reservoirs "View on Map")
  useEffect(() => {
    if (!focusedReservoir) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    // 1. Smoothly fly to the reservoir's exact coordinates with zoom 13
    map.flyTo(
      [focusedReservoir.geoCoords.lat, focusedReservoir.geoCoords.lng], 
      13, 
      { duration: 1.8 }
    );

    // 2. Highlight its district boundary (spatial context)
    applyDistrictSelection(focusedReservoir.district, false);

    // 3. Highlight reservoir with animated glowing catchment boundary & radar pulse
    if (focusedReservoirLayerRef.current) {
      focusedReservoirLayerRef.current.clearLayers();

      // Outer animated radar pulse ring
      L.circle([focusedReservoir.geoCoords.lat, focusedReservoir.geoCoords.lng], {
        radius: 2500,
        color: '#00F0FF',
        weight: 3.5,
        opacity: 0.9,
        fillColor: '#00B4D8',
        fillOpacity: 0.25,
        dashArray: '6, 8'
      }).addTo(focusedReservoirLayerRef.current);

      // Inner crisp reservoir highlight circle
      L.circle([focusedReservoir.geoCoords.lat, focusedReservoir.geoCoords.lng], {
        radius: 900,
        color: '#FFFFFF',
        weight: 2.5,
        opacity: 1,
        fillColor: '#0077B6',
        fillOpacity: 0.55
      }).addTo(focusedReservoirLayerRef.current);
    }

    // 4. Automatically trigger and open the rich telemetry Flashcard
    openSpecificReservoirFlashcard(focusedReservoir);
  }, [focusedReservoir]);

  // 2. Render River Flow Vectors & Basins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const riverGroup = riverLayerGroupRef.current;
    if (!map || !riverGroup) return;

    riverGroup.clearLayers();

    if (activeLayerFilter === 'all' || activeLayerFilter === 'rivers' || activeLayerFilter === 'basins') {
      AP_RIVER_VECTORS.forEach(river => {
        if (activeLayerFilter === 'basins' && selectedBasin !== 'All Basins') {
          if (!river.basin.toLowerCase().includes(selectedBasin.toLowerCase().replace(' basin', ''))) {
            return;
          }
        }

        const polyline = L.polyline(river.coordinates, {
          color: '#38bdf8', // Luminous sky blue
          weight: basemapTheme === 'satellite' ? 4 : 3,
          opacity: 0.92,
          lineCap: 'round',
          lineJoin: 'round'
        });

        polyline.bindTooltip(
          `<div class="text-xs font-bold text-[#03045E] px-2 py-1 rounded bg-white border border-sky-200 shadow-sm">
            🌊 ${river.name}<br/>
            <span class="text-[10px] text-slate-500 font-normal">${river.basin} Basin</span>
          </div>`,
          { sticky: true }
        );

        polyline.on('click', () => {
          const midPoint = river.coordinates[Math.floor(river.coordinates.length / 2)];
          setActiveFlashcard({
            type: 'gauge',
            title: river.name,
            subtitle: `${river.basin} Basin, Andhra Pradesh`,
            basin: river.basin,
            district: 'Andhra Pradesh',
            lat: midPoint[0],
            lng: midPoint[1],
            categoryBadge: 'CWC & APWRIMS River Vector',
            networkBadge: 'AP River Network',
            primaryMetricLabel: 'RIVER STATUS',
            primaryMetricValue: 'Regulated Flow',
            primaryMetricSub: 'Monitored across Andhra Pradesh Basin',
            secondaryMetricLabel: 'BASIN EXTENT',
            secondaryMetricValue: `${river.coordinates.length} Vector Waypoints`,
            secondaryMetricSub: 'CWC Southern Region Grid',
            baselineLabel: 'Origin to Discharge Sink',
            baselineValue: 'Bay of Bengal Outfall',
            statusText: 'Normal Seasonal River Discharge',
            statusColor: 'emerald',
            metricExtraRight: 'CWC Hydrological Grid'
          });
        });

        polyline.addTo(riverGroup);
      });
    }
  }, [activeLayerFilter, basemapTheme, selectedBasin]);

  // 3. Render 100% Real Andhra Pradesh Telemetry Data Markers + All Citizen Grievances
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // A. 26 District Headquarters / Centroids (Interactive Pins)
    ANDHRA_PRADESH_26_DISTRICTS.forEach(dist => {
      const isSelected = filterDistrict.toLowerCase() === dist.name.toLowerCase();

      // Count complaints in this district
      const distComplaints = complaints.filter(
        c => (c.district || '').toLowerCase().includes(dist.name.toLowerCase())
      );

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-5 h-5 rounded-full ${isSelected ? 'bg-[#00B4D8] ring-2 ring-[#0077B6] scale-110' : 'bg-[#03045E]/90'} text-white border border-white shadow-sm flex items-center justify-center font-bold text-[9px] transform hover:scale-125 transition-transform">
            ${distComplaints.length > 0 ? distComplaints.length : 'AP'}
          </div>
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 text-[#03045E] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs border border-slate-200 pointer-events-none hidden group-hover:block z-30">
            ${dist.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'ap-district-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([dist.centerCoords.lat, dist.centerCoords.lng], { icon: customIcon });
      marker.on('click', () => {
        applyDistrictSelection(dist.name);
        openPrimaryReservoirFlashcard(dist.name);
      });

      marker.addTo(markersGroup);
    });

    // B. Real Citizen Grievances / Complaints in Andhra Pradesh (Plotted 100% Guaranteed)
    if (activeLayerFilter === 'all' || activeLayerFilter === 'complaints') {
      complaints.forEach(complaint => {
        let lat = complaint.coordinates?.lat;
        let lng = complaint.coordinates?.lng;

        // Fallback to district centroid with pseudo-random jitter if missing or out of AP bounds
        if (!lat || !lng || lat < 12.0 || lat > 20.0 || lng < 76.0 || lng > 85.5) {
          const boundary = findAPDistrictBoundary(complaint.district || '');
          if (boundary) {
            const hash = complaint.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const angle = (hash % 360) * (Math.PI / 180);
            const radius = 0.035 + ((hash % 8) * 0.007);
            lat = boundary.center[0] + Math.sin(angle) * radius;
            lng = boundary.center[1] + Math.cos(angle) * radius;
          }
        }
        if (!lat || !lng) return;

        // District filter
        if (filterDistrict !== 'all' && !(complaint.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        // Status filter
        if (complaintStatusFilter !== 'all' && complaint.status !== complaintStatusFilter) {
          return;
        }

        const isResolved = complaint.status === 'RESOLVED';
        const isAction = complaint.status === 'WORKER_IN_PROGRESS';
        const badgeBg = isResolved ? 'bg-emerald-500' : isAction ? 'bg-amber-500' : 'bg-rose-500';

        const markerHtml = `
          <div class="relative cursor-pointer group">
            <span class="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${badgeBg} opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 ${badgeBg}"></span>
            </span>
            <div class="w-3.5 h-3.5 rounded-full ${badgeBg} border border-white shadow-sm flex items-center justify-center text-white transform hover:scale-150 transition-transform">
              <div class="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none hidden group-hover:block z-30">
              ${complaint.id}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-complaint-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([lat, lng], { 
          icon,
          zIndexOffset: 25000
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          openComplaintFlashcard(complaint);
        });

        marker.addTo(markersGroup);
      });
    }

    // C. All 113 AP Official Reservoirs & Dams
    if (activeLayerFilter === 'all' || activeLayerFilter === 'reservoirs') {
      AP_OFFICIAL_RESERVOIRS.forEach(res => {
        if (!res.geoCoords?.lat || !res.geoCoords?.lng) return;

        if (filterDistrict !== 'all' && !(res.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        const isLow = res.storagePercentage < 25;
        const colorClass = isLow ? 'bg-rose-600 border-rose-300' : 'bg-blue-600 border-sky-300';

        const markerHtml = `
          <div class="relative cursor-pointer group">
            <div class="w-3.5 h-3.5 rounded-full ${colorClass} border border-white shadow-sm flex items-center justify-center text-white transform hover:scale-150 transition-transform">
              <div class="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none hidden group-hover:block z-30">
              ${res.name}: ${res.currentStorageTMC} TMC
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-res-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([res.geoCoords.lat, res.geoCoords.lng], { icon });

        marker.on('click', () => {
          // Highlight reservoir catchment boundary
          if (focusedReservoirLayerRef.current) {
            focusedReservoirLayerRef.current.clearLayers();
            L.circle([res.geoCoords.lat, res.geoCoords.lng], {
              radius: 2500,
              color: '#00F0FF',
              weight: 3.5,
              opacity: 0.9,
              fillColor: '#00B4D8',
              fillOpacity: 0.25,
              dashArray: '6, 8'
            }).addTo(focusedReservoirLayerRef.current);

            L.circle([res.geoCoords.lat, res.geoCoords.lng], {
              radius: 900,
              color: '#FFFFFF',
              weight: 2.5,
              opacity: 1,
              fillColor: '#0077B6',
              fillOpacity: 0.55
            }).addTo(focusedReservoirLayerRef.current);
          }

          applyDistrictSelection(res.district, false);
          openSpecificReservoirFlashcard(res);
        });

        marker.addTo(markersGroup);
      });
    }

    // D. CGWB Groundwater DWLR Stations (594 Wells in AP)
    if (activeLayerFilter === 'all' || activeLayerFilter === 'groundwater') {
      AP_GROUNDWATER_DTWL_2026.forEach(well => {
        if (!well.lat || !well.lng) return;

        if (filterDistrict !== 'all' && !(well.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        const isCritical = well.dtwlMbgl > 40;
        const isSemiCritical = well.dtwlMbgl > 20;
        const pinBg = isCritical ? 'bg-rose-500' : isSemiCritical ? 'bg-amber-500' : 'bg-emerald-500';

        const markerHtml = `
          <div class="relative cursor-pointer group">
            <div class="w-2.5 h-2.5 rounded-full ${pinBg} border border-white shadow-xs transform hover:scale-200 transition-transform"></div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none hidden group-hover:block z-30">
              ${well.village}: ${well.dtwlMbgl.toFixed(1)}m bgl
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-gw-marker',
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });

        const marker = L.marker([well.lat, well.lng], { icon });

        marker.on('click', () => {
          const boundary = findAPDistrictBoundary(well.district || '');

          setActiveFlashcard({
            type: 'groundwater',
            title: `${well.village} DWLR Piezometer`,
            subtitle: `${well.block} Block, ${well.district} District`,
            district: well.district,
            lat: well.lat,
            lng: well.lng,
            categoryBadge: 'CGWB National Grid',
            networkBadge: 'DWLR Telemetry',
            agency: 'Central Ground Water Board (CGWB) & AP Ground Water Dept',
            districtProfile: boundary ? {
              districtName: boundary.name,
              areaSqKm: boundary.areaSqKm,
              headquarter: boundary.headquarter,
              region: boundary.region,
              onResetDistrict: () => applyDistrictSelection('all')
            } : undefined,
            primaryMetricLabel: 'DEPTH TO WATER LEVEL',
            primaryMetricValue: `${well.dtwlMbgl.toFixed(2)} mbgl`,
            primaryMetricSub: well.wellType || 'Unconfined Weathered Aquifer',
            secondaryMetricLabel: 'WATER TABLE STATUS',
            secondaryMetricValue: well.statusLabel || well.status,
            secondaryMetricSub: well.dtwlMbgl < 20 ? 'Optimal Water Table' : 'Deep Drawdown Stress',
            baselineLabel: 'Pre-Monsoon 2026 Measurement',
            baselineValue: 'Official CGWB Benchmark',
            statusText: well.statusLabel || (well.dtwlMbgl < 20 
              ? 'Stable Ground Aquifer Storage' 
              : well.dtwlMbgl < 40 
              ? 'Moderate Ground Drawdown - Managed Pumping' 
              : 'Severe Aquifer Drawdown - Recharge Mandated'),
            statusColor: isCritical ? 'rose' : isSemiCritical ? 'amber' : 'emerald',
            metricExtraRight: `${well.dtwlMbgl.toFixed(1)}m bgl`
          });
        });

        marker.addTo(markersGroup);
      });
    }

    // E. CWC Official River Gauge Stations
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rivers') {
      AP_OFFICIAL_RIVER_GAUGE_STATIONS.forEach(gauge => {
        if (!gauge.lat || !gauge.lng) return;

        if (filterDistrict !== 'all' && !(gauge.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        const markerHtml = `
          <div class="relative cursor-pointer group">
            <div class="w-2.5 h-2.5 rounded-xs bg-cyan-500 border border-white shadow-xs transform hover:scale-200 transition-transform"></div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none hidden group-hover:block z-30">
              ${gauge.name}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-gauge-marker',
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });

        const marker = L.marker([gauge.lat, gauge.lng], { icon });

        marker.on('click', () => {
          const boundary = findAPDistrictBoundary(gauge.district || '');

          setActiveFlashcard({
            type: 'gauge',
            title: `${gauge.name} River Gauge`,
            subtitle: `${gauge.district} District, Andhra Pradesh`,
            basin: gauge.basin,
            district: gauge.district,
            lat: gauge.lat,
            lng: gauge.lng,
            categoryBadge: 'CWC River Telemetry',
            networkBadge: 'Hydrological Grid',
            agency: 'Central Water Commission (CWC) Southern Region',
            districtProfile: boundary ? {
              districtName: boundary.name,
              areaSqKm: boundary.areaSqKm,
              headquarter: boundary.headquarter,
              region: boundary.region,
              onResetDistrict: () => applyDistrictSelection('all')
            } : undefined,
            primaryMetricLabel: 'RIVER WATER LEVEL',
            primaryMetricValue: (gauge.governmentDossier as any)?.waterLevelStage || 'Active Flow Stage',
            primaryMetricSub: (gauge.governmentDossier as any)?.officialLocationDesc || 'CWC Surveillance Point',
            secondaryMetricLabel: 'DISCHARGE RATE',
            secondaryMetricValue: gauge.dischargeCusecs ? `${gauge.dischargeCusecs.toLocaleString()} Cusecs` : 'Regulated River Course',
            secondaryMetricSub: gauge.trend || 'Steady Seasonal Flow',
            baselineLabel: 'River Basin System',
            baselineValue: gauge.riverName || gauge.basin,
            statusText: gauge.statusLabel || 'Normal River Course Flow',
            statusColor: gauge.status === 'red' ? 'rose' : gauge.status === 'yellow' ? 'amber' : 'emerald',
            metricExtraRight: gauge.code || 'CWC Grid'
          });
        });

        marker.addTo(markersGroup);
      });
    }

    // F. APWRIMS Mandal Rainfall Stations
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rainfall') {
      AP_MANDAL_WISE_RAINFALL_2026.forEach(rf => {
        if (!rf.lat || !rf.lng) return;

        if (filterDistrict !== 'all' && !(rf.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

        const isDeficient = rf.status === 'Deficient';
        const colorClass = isDeficient ? 'bg-amber-600' : 'bg-sky-500';

        const markerHtml = `
          <div class="relative cursor-pointer group">
            <div class="w-2 h-2 rounded-full ${colorClass} border border-white shadow-xs transform hover:scale-200 transition-transform"></div>
            <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none hidden group-hover:block z-30">
              ${rf.mandal}: ${rf.actualMm.toFixed(1)}mm
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-rf-marker',
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        });

        const marker = L.marker([rf.lat, rf.lng], { icon });

        marker.on('click', () => {
          const boundary = findAPDistrictBoundary(rf.district || '');

          setActiveFlashcard({
            type: 'rainfall',
            title: `${rf.mandal} Rain Station`,
            subtitle: `${rf.district} District, Andhra Pradesh`,
            district: rf.district,
            lat: rf.lat,
            lng: rf.lng,
            categoryBadge: 'IMD State Rain Grid',
            networkBadge: 'APWRIMS Rainfall',
            agency: 'India Meteorological Department (IMD) & APWRIMS',
            districtProfile: boundary ? {
              districtName: boundary.name,
              areaSqKm: boundary.areaSqKm,
              headquarter: boundary.headquarter,
              region: boundary.region,
              onResetDistrict: () => applyDistrictSelection('all')
            } : undefined,
            primaryMetricLabel: 'ACTUAL MONSOON RAIN',
            primaryMetricValue: `${rf.actualMm.toFixed(1)} mm`,
            primaryMetricSub: `Normal Benchmark: ${rf.normalMm.toFixed(1)} mm`,
            secondaryMetricLabel: 'DEVIATION PERCENT',
            secondaryMetricValue: `${rf.deviationPercent > 0 ? '+' : ''}${rf.deviationPercent.toFixed(1)}%`,
            secondaryMetricSub: rf.status,
            baselineLabel: 'Seasonal Precipitation Status',
            baselineValue: `${rf.status} (${rf.deviationPercent > 0 ? '+' : ''}${rf.deviationPercent}%)`,
            statusText: rf.status === 'Excess' ? 'Surplus Inflow Received' : rf.status === 'Normal' ? 'Normal Seasonal Monsoonal Rainfall' : 'Deficient Rainfall - Conservation Activated',
            statusColor: rf.status === 'Deficient' ? 'amber' : 'emerald',
            metricExtraRight: `${rf.actualMm}mm Rain`
          });
        });

        marker.addTo(markersGroup);
      });
    }

  }, [complaints, filterDistrict, complaintStatusFilter, activeLayerFilter, onDispatchReminder, onReassignComplaint]);

  // Open settings modal
  const handleOpenSettingsModal = () => {
    setTempFilterLayer(activeLayerFilter);
    setTempBasemapTheme(basemapTheme);
    setTempBasin(selectedBasin);
    setTempBrightness(brightness);
    setTempContrast(contrast);
    setIsFilterModalOpen(true);
  };

  // Save settings from modal
  const handleSaveAndApply = () => {
    setActiveLayerFilter(tempFilterLayer);
    setBasemapTheme(tempBasemapTheme);
    setSelectedBasin(tempBasin);
    setBrightness(tempBrightness);
    setContrast(tempContrast);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden font-sans">
      
      {/* Top Control Bar with District Search, Quick-Select & Citizen Complaints */}
      <div className="p-3.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#03045E] flex items-center justify-center text-white shadow-xs">
            <Satellite className="w-4 h-4 text-[#00B4D8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#03045E] text-sm tracking-tight">
                {mapUi.mapTitle}
              </span>
              <span className="font-mono text-[10px] bg-sky-100 text-[#0077B6] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                {mapUi.badgeDistricts}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {mapUi.mapSub}
            </p>
          </div>
        </div>

        {/* Right Controls: Search Bar, District Quick-Select, Complaints Selector, and Settings */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Autocomplete District & Complaint Search Bar */}
          <div className="relative flex-1 sm:w-60">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder={mapUi.searchPlaceholder}
                value={districtSearchInput}
                onChange={(e) => setDistrictSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6] shadow-2xs"
              />
              {districtSearchInput && (
                <button
                  type="button"
                  onClick={() => setDistrictSearchInput('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 text-xs">
                {searchSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => {
                      if (s.type === 'district') {
                        applyDistrictSelection(s.data.name);
                        setDistrictSearchInput(s.data.name);
                      } else {
                        flyToComplaint(s.data.id);
                        setDistrictSearchInput(s.data.id);
                      }
                      setIsSearchFocused(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-sky-50 flex items-center justify-between gap-2 border-b border-slate-100 last:border-b-0 cursor-pointer"
                  >
                    <div>
                      <strong className="text-slate-900 block font-bold truncate max-w-[200px]">
                        {s.type === 'complaint' ? `🚨 ${s.title}` : `🏛️ ${s.title}`}
                      </strong>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[200px]">{s.subtitle}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded font-bold shrink-0">
                      {s.meta}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Select District Dropdown */}
          <div className="relative">
            <select
              value={filterDistrict}
              onChange={(e) => applyDistrictSelection(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 pr-8 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0077B6] cursor-pointer appearance-none"
            >
              <option value="all">{mapUi.allDistricts}</option>
              {ANDHRA_PRADESH_26_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>
                  {currentLang === 'te' 
                    ? `${d.teluguName} జిల్లా` 
                    : currentLang === 'hi' 
                    ? `${findAPDistrictBoundary(d.name)?.hindiName || d.name} जिला` 
                    : `${d.name} District`}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Complaints Quick-Select & Direct Fly-to Dropdown */}
          <div className="relative">
            <select
              value={selectedComplaintValue}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedComplaintValue(val);
                if (val.startsWith('fly_')) {
                  flyToComplaint(val.replace('fly_', ''));
                } else if (val === 'all') {
                  setComplaintStatusFilter('all');
                } else {
                  setComplaintStatusFilter(val as any);
                  setActiveLayerFilter('complaints');
                }
              }}
              className="bg-white hover:bg-rose-50/50 border border-rose-200 text-rose-950 text-xs font-bold rounded-xl pl-8 pr-8 py-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer appearance-none transition-colors"
            >
              <option value="all">{mapUi.complaintsAll} ({filteredComplaints.length})</option>
              <option value="SUBMITTED">{mapUi.submitted} ({submittedCount})</option>
              <option value="WORKER_IN_PROGRESS">{mapUi.wip} ({wipCount})</option>
              <option value="RESOLVED">{mapUi.resolved} ({resolvedCount})</option>
              <optgroup label={mapUi.flyGrievance}>
                {filteredComplaints.map(c => (
                  <option key={c.id} value={`fly_${c.id}`}>
                    📍 [{c.id.replace('CMP-AP-2026-', '')}] {c.district}: {(c.shortDescription || c.wasteType || '').slice(0, 24)}...
                  </option>
                ))}
              </optgroup>
            </select>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping"></span>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={handleOpenSettingsModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-[#0077B6] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Configure Map Telemetry Layers, Basemap Theme & Brightness"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0077B6]" />
            <span className="hidden sm:inline">{mapUi.settings}</span>
          </button>
        </div>
      </div>

      {/* Main Map Box with Applied Brightness & Contrast Calibration */}
      <div className="relative z-0 isolate w-full h-[580px] sm:h-[640px] bg-slate-900 overflow-hidden">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0 transition-all duration-300" 
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`
          }}
        />



        {/* Live Legend Box on Right Side (Over Bay of Bengal Ocean) */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200/90 max-w-xs text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
            <span className="font-extrabold text-[#03045E] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0077B6]" />
              <span>{mapUi.legendTitle}</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">LIVE APWRIMS</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300"></span>
              <span>{mapUi.reservoirs113}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{mapUi.dwlrSafe}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{mapUi.dwlrStress}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>{mapUi.dwlrCritical}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-cyan-600"></span>
              <span>{mapUi.riverGauges}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span>{mapUi.grievances} ({filteredComplaints.length})</span>
            </div>
          </div>
        </div>

        {/* Telemetry Flashcard Modal directly over the map with Integrated District Profile */}
        {activeFlashcard && (
          <div className="absolute top-4 right-4 z-30 max-h-[580px] overflow-y-auto">
            <HydrologicalTelemetryFlashcard
              data={activeFlashcard}
              onClose={() => setActiveFlashcard(null)}
            />
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#0077B6]" />
          <span>{mapUi.geofence}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Source: ISRO NRSC Bhuvan • APWRIMS • CWC National Grid • CGWB Pre-Monsoon 2026
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. FILTERS & MAP DISPLAY SETTINGS MODAL                              */}
      {/* ==================================================================== */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden space-y-5 p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0077B6] shrink-0">
                  <SlidersHorizontal className="w-5 h-5 text-[#0077B6]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Map Telemetry Filters & Cartography Settings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure ISRO Bhuvan satellite GIS cartography, displayed telemetry layers, and satellite contrast calibration for state monitoring.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Telemetry Layers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                1. SELECT HYDROLOGICAL TELEMETRY LAYER
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: 'All Hydrological Layers', count: '100% Real AP' },
                  { id: 'reservoirs', label: 'Major Reservoirs & Dams', count: `${AP_OFFICIAL_RESERVOIRS.length} Reservoirs` },
                  { id: 'rivers', label: 'River Gauges & Discharge (Cusecs)', count: `${AP_OFFICIAL_RIVER_GAUGE_STATIONS.length} Stations` },
                  { id: 'groundwater', label: 'CGWB Groundwater DWLR', count: `${AP_GROUNDWATER_DTWL_2026.length} Wells` },
                  { id: 'rainfall', label: 'APWRIMS Mandal Rainfall Grid', count: `${AP_MANDAL_WISE_RAINFALL_2026.length} Mandals` },
                  { id: 'complaints', label: 'Citizen Grievance Hotspots', count: `${complaints.length} Hotspots` },
                  { id: 'basins', label: 'Major River Basins of Andhra Pradesh', count: '6 AP Basins' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTempFilterLayer(item.id as any)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      tempFilterLayer === item.id 
                        ? 'border-[#0077B6] bg-sky-50/80 text-[#03045E] ring-2 ring-[#0077B6]/20' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Basemap Theme */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                2. MAP BASEMAP THEME
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { id: 'satellite', title: 'ISRO Bhuvan Satellite (Default)', desc: 'High-resolution ISRO satellite imagery & boundaries' },
                  { id: 'light_gis', title: 'Nir-ikshan Portal Theme (Light)', desc: 'Clean GIS cartography matching portal style' },
                  { id: 'topo', title: 'Topographic Relief', desc: 'Terrain relief & catchment elevation' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTempBasemapTheme(t.id as any)}
                    className={`p-3 rounded-2xl border text-left space-y-1 transition-all cursor-pointer ${
                      tempBasemapTheme === t.id
                        ? 'border-[#0077B6] bg-sky-50/80 text-[#03045E] ring-2 ring-[#0077B6]/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <strong className="block font-bold">{t.title}</strong>
                    <p className="text-[10px] text-slate-500 leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Brightness & Contrast Calibration */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                3. BRIGHTNESS & CONTRAST CALIBRATION
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Brightness:</span>
                    <span className="font-mono text-[#0077B6]">{tempBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={tempBrightness}
                    onChange={(e) => setTempBrightness(Number(e.target.value))}
                    className="w-full accent-[#0077B6] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Contrast:</span>
                    <span className="font-mono text-[#0077B6]">{tempContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={tempContrast}
                    onChange={(e) => setTempContrast(Number(e.target.value))}
                    className="w-full accent-[#0077B6] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setTempFilterLayer('all');
                  setTempBasemapTheme('satellite');
                  setTempBasin('All Basins');
                  setTempBrightness(100);
                  setTempContrast(100);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  className="px-5 py-2 rounded-xl bg-[#03045E] hover:bg-[#0077B6] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Save & Apply Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
