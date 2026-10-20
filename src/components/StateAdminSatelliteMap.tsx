import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { CitizenComplaint } from '../types/nirikshan';
import { ANDHRA_PRADESH_26_DISTRICTS, DistrictTelemetry } from '../data/andhraDistrictsData';
import { AP_OFFICIAL_RESERVOIRS, APReservoirRecord } from '../data/apReservoirsData';
import { AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../data/apRiverGaugesData';
import { AP_RIVER_VECTORS } from '../data/andhraRiversGeoData';
import { AP_GROUNDWATER_DTWL_2026, APGroundwaterDtwlRecord } from '../data/apGroundwaterDtwl2026';
import { AP_MANDAL_WISE_RAINFALL_2026 } from '../data/apMandalWiseRainfall2026';
import { useLanguage } from '../context/LanguageContext';
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
  Filter,
  CloudRain,
  SlidersHorizontal,
  Sun,
  Check,
  TrendingUp,
  Mountain,
  Waves,
  Sparkles
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

const AP_DISTRICTS_HINDI: Record<string, string> = {
  'srikakulam': 'श्रीकाकुलम',
  'parvathipuram-manyam': 'पार्वतीपुरम मान्यम',
  'vizianagaram': 'विजयनगरम',
  'visakhapatnam': 'विशाखापट्टनम',
  'alluri-sitharama-raju': 'अल्लूरी सीताराम राजू',
  'anakapalli': 'अनाकापल्ली',
  'kakinada': 'काकीनाडा',
  'east-godavari': 'पूर्वी गोदावरी',
  'dr-br-ambedkar-konaseema': 'डॉ. बी.आर. अंबेडकर कोनासीमा',
  'eluru': 'एलुरु',
  'west-godavari': 'पश्चिमी गोदावरी',
  'ntr': 'एनटीआर',
  'krishna': 'कृष्णा',
  'palnadu': 'पलनाडु',
  'guntur': 'गुंटूर',
  'bapatla': 'बापटला',
  'prakasam': 'प्रकाशम',
  'sri-potti-sriramulu-nellore': 'श्री पोट्टी श्रीरामुलु नेल्लोर',
  'kurnool': 'कर्नूल',
  'nandyal': 'नंद्याल',
  'anantapuramu': 'अनंतपुर',
  'sri-sathya-sai': 'श्री सत्य साई',
  'ysr-kadapa': 'वाईएसआर कडप्पा',
  'annamayya': 'अन्नमय्या',
  'chittoor': 'चित्तूर',
  'tirupati': 'तिरुपति',
};

const MAP_TEXT = {
  en: {
    headerTitle: 'Andhra Pradesh Satellite Surveillance Grid',
    geoLocked: 'AP Geo-Locked',
    telemetrySummary: '100% Real AP Telemetry: ISRO Bhuvan Satellite Imagery • 113 Reservoirs • 594 DWLR Wells • CWC River Gauges',
    settingsBtn: 'Filters & Map Settings',
    allDistricts: 'All 26 AP Districts',
    fitAp: 'Fit AP',
    legendTitle: 'Andhra Pradesh Water Grid',
    liveApwrims: 'LIVE APWRIMS',
    reservoirsCount: '113 Reservoirs',
    dwlrSafe: 'DWLR Safe (<20m)',
    dwlrStress: 'DWLR Stress',
    dwlrCritical: 'DWLR Critical (>40m)',
    riverGauges: 'River Gauges',
    grievances: 'Active Grievances',
    inspectorTitle: 'Telemetry Station Inspector',
    issueSlaDirective: 'Issue SLA Directive',
    reassign: 'Reassign',
    currentStorage: 'Current Storage',
    grossCapacity: 'Gross',
    fillPercentage: 'Fill Percentage',
    inflow: 'Inflow',
    currentLevel: 'Current Water Level',
    frl: 'Full Reservoir Level (FRL)',
    spillwayStatus: 'Spillway Status',
    monitoredBodies: 'Monitored Bodies',
    groundwaterDtwl: 'Groundwater DTWL',
    officerInCharge: 'Officer In-Charge',
    modalTitle: 'Map Telemetry Filters & Cartography Settings',
    modalDesc: 'Configure ISRO Bhuvan satellite GIS cartography, displayed telemetry layers, and satellite contrast calibration for state monitoring.',
    section1: '1. SELECT HYDROLOGICAL TELEMETRY LAYER',
    layerAll: 'All Hydrological Layers',
    layerReservoirs: 'Major Reservoirs & Dams',
    layerRivers: 'River Gauges & Discharge (Cusecs)',
    layerGroundwater: 'CGWB Groundwater DWLR',
    layerComplaints: 'Citizen Grievance Hotspots',
    layerBasins: 'Major River Basins of Andhra Pradesh',
    chooseBasin: 'Choose Specific River Basin to Inspect:',
    allBasins: 'All Major AP River Basins',
    section2: '2. MAP BASEMAP THEME',
    themeSatellite: 'ISRO Bhuvan Satellite (Default)',
    themeSatelliteDesc: 'High-resolution ISRO satellite imagery & boundaries',
    themeLightGis: 'Nir-ikshan Portal Theme (Light)',
    themeLightGisDesc: 'Clean GIS cartography matching portal style',
    themeTopo: 'Topographic Relief',
    themeTopoDesc: 'Terrain relief & catchment elevation',
    section3: '3. BRIGHTNESS & CONTRAST CALIBRATION',
    brightness: 'Brightness:',
    contrast: 'Contrast:',
    darker: '60% (Darker)',
    defaultVal: '100% (Default)',
    brighter: '140% (Brighter)',
    softer: '70% (Softer)',
    highContrast: '150% (High contrast)',
    resetDefaults: 'Reset Defaults',
    cancel: 'Cancel',
    saveApply: 'Save & Apply Settings',
    surveillanceGeofence: 'Surveillance Geofence',
    stateAp: 'State of Andhra Pradesh (26 Districts)',
    sourceCreds: 'Source: ISRO NRSC Bhuvan • APWRIMS • CWC National Grid',
  },
  hi: {
    headerTitle: 'आंध्र प्रदेश उपग्रह निगरानी ग्रिड',
    geoLocked: 'एपी भू-सीमाबद्ध',
    telemetrySummary: '100% वास्तविक एपी टेलीमेट्री: इसरो भुवन उपग्रह इमेजरी • 113 जलाशय • 594 डीडब्ल्यूएलआर कुएं • सीडब्ल्यूसी नदी गेज',
    settingsBtn: 'फ़िल्टर एवं मानचित्र सेटिंग्स',
    allDistricts: 'सभी 26 एपी जिले',
    fitAp: 'एपी पर केंद्रित करें',
    legendTitle: 'आंध्र प्रदेश जल ग्रिड',
    liveApwrims: 'लाइव APWRIMS',
    reservoirsCount: '113 जलाशय',
    dwlrSafe: 'डीडब्ल्यूएलआर सुरक्षित (<20m)',
    dwlrStress: 'डीडब्ल्यूएलआर तनाव',
    dwlrCritical: 'डीडब्ल्यूएलआर संकट (>40m)',
    riverGauges: 'नदी गेज',
    grievances: 'सक्रिय शिकायतें',
    inspectorTitle: 'टेलीमेट्री स्टेशन निरीक्षक',
    issueSlaDirective: 'एसएलए निर्देश जारी करें',
    reassign: 'पुनः सौंपें',
    currentStorage: 'वर्तमान भंडारण',
    grossCapacity: 'कुल क्षमता',
    fillPercentage: 'भरण प्रतिशत',
    inflow: 'आवक प्रवाह',
    currentLevel: 'वर्तमान जल स्तर',
    frl: 'पूर्ण जलाशय स्तर (FRL)',
    spillwayStatus: 'स्पिलवे स्थिति',
    monitoredBodies: 'निगरानी अधीन जल निकाय',
    groundwaterDtwl: 'भूजल गहराई (DTWL)',
    officerInCharge: 'प्रभारी अधिकारी',
    modalTitle: 'मानचित्र टेलीमेट्री फ़िल्टर एवं कार्टोग्राफी सेटिंग्स',
    modalDesc: 'राज्य निगरानी के लिए इसरो भुवन उपग्रह जीआईएस कार्टोग्राफी, प्रदर्शित टेलीमेट्री परतें और उपग्रह कंट्रास्ट कॉन्फ़िगर करें।',
    section1: '1. हाइड्रोलॉजिकल टेलीमेट्री परत का चयन करें',
    layerAll: 'सभी हाइड्रोलॉजिकल परतें',
    layerReservoirs: 'प्रमुख जलाशय एवं बांध',
    layerRivers: 'नदी गेज एवं डिस्चार्ज (क्यूसेक)',
    layerGroundwater: 'सीजीडब्ल्यूबी भूजल डीडब्ल्यूएलआर',
    layerComplaints: 'नागरिक शिकायत हॉटस्पॉट',
    layerBasins: 'आंध्र प्रदेश के प्रमुख नदी बेसिन',
    chooseBasin: 'विशिष्ट नदी बेसिन का चयन करें:',
    allBasins: 'सभी प्रमुख एपी नदी बेसिन',
    section2: '2. मानचित्र आधार थीम',
    themeSatellite: 'इसरो भुवन उपग्रह (डिफ़ॉल्ट)',
    themeSatelliteDesc: 'उच्च-रिज़ॉल्यूशन इसरो उपग्रह इमेजरी और सीमाएं',
    themeLightGis: 'निरीक्षण पोर्टल थीम (लाइट)',
    themeLightGisDesc: 'पोर्टल शैली से मेल खाती स्वच्छ जीआईएस कार्टोग्राफी',
    themeTopo: 'स्थलाकृतिक बेसिन रिलीफ',
    themeTopoDesc: 'भूभाग रिलीफ एवं जलग्रहण ऊंचाई',
    section3: '3. चमक एवं कंट्रास्ट अंशांकन',
    brightness: 'चमक:',
    contrast: 'कंट्रास्ट:',
    darker: '60% (गहरा)',
    defaultVal: '100% (डिफ़ॉल्ट)',
    brighter: '140% (उज्ज्वल)',
    softer: '70% (सौम्य)',
    highContrast: '150% (उच्च कंट्रास्ट)',
    resetDefaults: 'डिफ़ॉल्ट पर रीसेट करें',
    cancel: 'रद्द करें',
    saveApply: 'सेटिंग्स सहेजें एवं लागू करें',
    surveillanceGeofence: 'निगरानी जियोफेंस',
    stateAp: 'आंध्र प्रदेश राज्य (26 जिले)',
    sourceCreds: 'स्रोत: इसरो एनआरएससी भुवन • एपीडब्ल्यूआरआईएमएस • सीडब्ल्यूसी नेशनल ग्रिड',
  },
  te: {
    headerTitle: 'ఆంధ్రప్రదేశ్ ఉపగ్రహ నిఘా గ్రిడ్',
    geoLocked: 'ఏపీ జియో-లాక్ చేయబడింది',
    telemetrySummary: '100% వాస్తవ ఏపీ టెలిమెట్రీ: ఇస్రో భువన్ ఉపగ్రహ చిత్రాలు • 113 జలాశయాలు • 594 DWLR బావులు • CWC నదీ గేజ్‌లు',
    settingsBtn: 'ఫిల్టర్లు & మ్యాప్ సెట్టింగ్‌లు',
    allDistricts: 'అన్ని 26 ఏపీ జిల్లాలు',
    fitAp: 'ఏపీకి రీసెట్',
    legendTitle: 'ఆంధ్రప్రదేశ్ జల గ్రిడ్',
    liveApwrims: 'లైవ్ APWRIMS',
    reservoirsCount: '113 జలాశయాలు',
    dwlrSafe: 'సురక్షిత భూగర్భ జలాలు (<20మీ)',
    dwlrStress: 'భూగర్భ జల ఒత్తిడి',
    dwlrCritical: 'తీవ్ర సంక్షోభం (>40మీ)',
    riverGauges: 'నదీ గేజ్‌లు',
    grievances: 'క్రియాశీల ఫిర్యాదులు',
    inspectorTitle: 'టెలిమెట్రీ స్టేషన్ ఇన్‌స్పెక్టర్',
    issueSlaDirective: 'SLA ఆదేశం జారీ చేయండి',
    reassign: 'మరొకరికి కేటాయించండి',
    currentStorage: 'ప్రస్తుత నిల్వ',
    grossCapacity: 'స్థూల సామర్థ్యం',
    fillPercentage: 'నిల్వ శాతం',
    inflow: 'ఇన్‌ఫ్లో',
    currentLevel: 'ప్రస్తుత నీటి మట్టం',
    frl: 'పూర్తి జలాశయ మట్టం (FRL)',
    spillwayStatus: 'స్పిల్‌వే స్థితి',
    monitoredBodies: 'పర్యవేక్షించబడుతున్న జలాశయాలు',
    groundwaterDtwl: 'భూగర్భ జల మట్టం (DTWL)',
    officerInCharge: 'ఇన్‌చార్జ్ అధికారి',
    modalTitle: 'మ్యాప్ టెలిమెట్రీ ఫిల్టర్లు & కార్టోగ్రఫీ సెట్టింగ్‌లు',
    modalDesc: 'రాష్ట్ర పర్యవేక్షణ కోసం ఇస్రో భువన్ శాటిలైట్ GIS కార్టోగ్రఫీ, టెలిమెట్రీ పొరలు మరియు కాంట్రాస్ట్‌ను కాన్ఫిగర్ చేయండి.',
    section1: '1. హైడ్రోలాజికల్ టెలిమెట్రీ పొరను ఎంచుకోండి',
    layerAll: 'అన్ని హైడ్రోలాజికల్ పొరలు',
    layerReservoirs: 'ప్రధాన జలాశయాలు & ఆనకట్టలు',
    layerRivers: 'నదీ గేజ్‌లు & డిశ్చార్జ్ (క్యూసెక్కులు)',
    layerGroundwater: 'CGWB భూగర్భ జలాల DWLR బావులు',
    layerComplaints: 'పౌర ఫిర్యాదుల హాట్‌స్పాట్‌లు',
    layerBasins: 'ఆంధ్రప్రదేశ్ ప్రధాన నదీ పరివాహక ప్రాంతాలు',
    chooseBasin: 'పరిశీలించడానికి నిర్దిష్ట నదీ పరివాహక ప్రాంతాన్ని ఎంచుకోండి:',
    allBasins: 'అన్ని ప్రధాన ఏపీ నదీ పరివాహక ప్రాంతాలు',
    section2: '2. మ్యాప్ బేస్‌మ్యాప్ థీమ్',
    themeSatellite: 'ఇస్రో భువన్ శాటిలైట్ (డిఫాల్ట్)',
    themeSatelliteDesc: 'హై-రిజల్యూషన్ ఇస్రో ఉపగ్రహ చిత్రాలు & సరిహద్దులు',
    themeLightGis: 'నిరీక్షణ పోర్టల్ థీమ్ (లైట్)',
    themeLightGisDesc: 'పోర్టల్ శైలికి సరిపోయే క్లీన్ GIS కార్టోగ్రఫీ',
    themeTopo: 'టోపోగ్రాఫిక్ రిలీఫ్',
    themeTopoDesc: 'భూభాగం మరియు నదీ పరివాహక ఎత్తు',
    section3: '3. ప్రకాశం & కాంట్రాస్ట్ క్యాలిబ్రేషన్',
    brightness: 'ప్రకాశం:',
    contrast: 'కాంట్రాస్ట్:',
    darker: '60% (చీకటిగా)',
    defaultVal: '100% (డిఫాల్ట్)',
    brighter: '140% (ప్రకాశవంతంగా)',
    softer: '70% (మృదువుగా)',
    highContrast: '150% (అధిక కాంట్రాస్ట్)',
    resetDefaults: 'డిఫాల్ట్‌లకు రీసెట్ చేయండి',
    cancel: 'రద్దు చేయండి',
    saveApply: 'సెట్టింగ్‌లను సేవ్ చేసి వర్తింపజేయండి',
    surveillanceGeofence: 'నిఘా జియోఫెన్స్',
    stateAp: 'ఆంధ్రప్రదేశ్ రాష్ట్రం (26 జిల్లాలు)',
    sourceCreds: 'మూలం: ఇస్రో ఎన్‌ఆర్‌ఎస్‌సి భువన్ • APWRIMS • CWC నేషనల్ గ్రిడ్',
  }
};

export const StateAdminSatelliteMap: React.FC<StateAdminSatelliteMapProps> = ({
  complaints,
  selectedDistrict = 'all',
  onSelectDistrict,
  onDispatchReminder,
  onReassignComplaint,
}) => {
  const { language } = useLanguage();
  const currentLang = (language as 'en' | 'hi' | 'te') || 'en';
  const mapText = MAP_TEXT[currentLang] || MAP_TEXT.en;

  const getDistrictDisplayName = (d: DistrictTelemetry) => {
    if (currentLang === 'te') return d.teluguName || d.name;
    if (currentLang === 'hi') return AP_DISTRICTS_HINDI[d.id] || d.name;
    return d.name;
  };

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const riverLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Active Map Filter & Display States
  const [basemapTheme, setBasemapTheme] = useState<'satellite' | 'light_gis' | 'topo'>('satellite');
  const [activeLayerFilter, setActiveLayerFilter] = useState<'all' | 'reservoirs' | 'rivers' | 'groundwater' | 'complaints' | 'rainfall' | 'basins'>('all');
  const [selectedBasin, setSelectedBasin] = useState<string>('All Basins');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Settings Modal State (Matching User Images 1 & 2)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [tempFilterLayer, setTempFilterLayer] = useState<'all' | 'reservoirs' | 'rivers' | 'groundwater' | 'complaints' | 'rainfall' | 'basins'>('all');
  const [tempBasemapTheme, setTempBasemapTheme] = useState<'satellite' | 'light_gis' | 'topo'>('satellite');
  const [tempBasin, setTempBasin] = useState<string>('All Basins');
  const [tempBrightness, setTempBrightness] = useState<number>(100);
  const [tempContrast, setTempContrast] = useState<number>(100);

  // Selected item on map for side drawer
  const [selectedItem, setSelectedItem] = useState<{
    type: 'complaint' | 'reservoir' | 'district' | 'gauge' | 'groundwater' | 'rainfall';
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

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.25, 80.65], // Center of Andhra Pradesh near Amaravati / Vijayawada
        zoom: 7.2,
        minZoom: 6.8,
        maxZoom: 16,
        maxBounds: apBounds,
        maxBoundsViscosity: 1.0, // Hard lock to AP
        zoomControl: false,
        attributionControl: false
      });

      // Zoom Control at Top Right
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
      fillOpacity: basemapTheme === 'satellite' ? 0.40 : 0.25,
      stroke: false,
      interactive: false
    }).addTo(map);

    // Glowing Andhra Pradesh Boundary Highlight
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

  }, [basemapTheme, apBounds]);

  // Lock / Unlock toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isLockedToAP) {
      map.setMaxBounds(apBounds);
      map.options.maxBoundsViscosity = 1.0;
    } else {
      map.setMaxBounds(undefined);
    }
  }, [isLockedToAP, apBounds]);

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
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        });

        polyline.bindTooltip(
          `<div class="text-xs font-bold text-[#03045E] px-1 py-0.5">${river.name} (${river.basin})</div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        polyline.addTo(riverGroup);
      });
    }
  }, [activeLayerFilter, basemapTheme, selectedBasin]);

  // 3. Render 100% Real Andhra Pradesh Telemetry Data Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // A. AP 26 District Centers (Highlighted & interactive)
    ANDHRA_PRADESH_26_DISTRICTS.forEach(dist => {
      if (filterDistrict !== 'all' && dist.name.toLowerCase() !== filterDistrict.toLowerCase()) {
        return;
      }

      // Count real complaints in this district
      const distComplaints = complaints.filter(
        c => (c.district || '').toLowerCase().includes(dist.name.toLowerCase())
      );

      const isSelected = filterDistrict.toLowerCase() === dist.name.toLowerCase();

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-[#00B4D8] ring-4 ring-[#0077B6]/40 scale-125' : 'bg-[#03045E]/90'} text-white border-2 border-[#00B4D8] shadow-lg flex items-center justify-center font-bold text-[10px] transform hover:scale-125 transition-transform">
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
            <div class="w-8 h-8 rounded-2xl ${badgeBg} border-2 border-white shadow-xl flex items-center justify-center text-white transform hover:scale-125 transition-transform">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10h2v4h-2zm0 6h2v2h-2z"/>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-complaint-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
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

    // D. 31 Official AP River Gauges & Cusecs Discharge
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rivers') {
      AP_OFFICIAL_RIVER_GAUGE_STATIONS.forEach(gauge => {
        if (!gauge.lat || !gauge.lng) return;

        if (filterDistrict !== 'all' && !(gauge.district || '').toLowerCase().includes(filterDistrict.toLowerCase())) {
          return;
        }

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

    // E. 594 Groundwater Telemetry Stations (CGWB DWLR Wells)
    if (activeLayerFilter === 'all' || activeLayerFilter === 'groundwater') {
      const gwPool = filterDistrict !== 'all'
        ? AP_GROUNDWATER_DTWL_2026.filter(gw => (gw.district || '').toLowerCase().includes(filterDistrict.toLowerCase()))
        : AP_GROUNDWATER_DTWL_2026.slice(0, 250);

      gwPool.forEach(gw => {
        if (!gw.lat || !gw.lng) return;

        const isCritical = gw.status === 'red' || gw.statusColor === 'red';
        const isSemiCritical = gw.status === 'yellow' || gw.statusColor === 'yellow';
        const colorClass = isCritical ? 'bg-rose-600' : isSemiCritical ? 'bg-amber-500' : 'bg-emerald-500';
        const stationLabel = `${gw.village}, ${gw.block} (${gw.district}): ${gw.dtwlMbgl} mbgl`;

        const markerHtml = `
          <div class="w-3.5 h-3.5 rounded-full ${colorClass} border border-white shadow-xs cursor-pointer hover:scale-150 transition-transform" title="${stationLabel}">
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-gw-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([gw.lat, gw.lng], { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'groundwater', data: gw });
        });

        marker.addTo(markersGroup);
      });
    }

    // F. Rainfall Telemetry (APWRIMS Mandal Weather Stations)
    if (activeLayerFilter === 'all' || activeLayerFilter === 'rainfall') {
      const rainPool = filterDistrict !== 'all'
        ? AP_MANDAL_WISE_RAINFALL_2026.filter(r => (r.district || '').toLowerCase().includes(filterDistrict.toLowerCase()))
        : AP_MANDAL_WISE_RAINFALL_2026.slice(0, 150);

      rainPool.forEach(rain => {
        if (!rain.lat || !rain.lng) return;

        const isExcess = rain.status === 'Excess' || rain.status === 'Large Excess';
        const isDeficient = rain.status === 'Deficient' || rain.status === 'Large Deficient';
        const bgBadge = isExcess ? 'bg-sky-600' : isDeficient ? 'bg-amber-600' : 'bg-blue-600';

        const markerHtml = `
          <div class="w-4 h-4 rounded-full ${bgBadge} border border-white text-white shadow-xs flex items-center justify-center text-[8px] font-bold cursor-pointer hover:scale-150 transition-transform" title="${rain.mandal} (${rain.district}): ${rain.actualMm}mm">
            🌧
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'ap-rain-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([rain.lat, rain.lng], { icon });
        marker.on('click', () => {
          setSelectedItem({ type: 'rainfall', data: rain });
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

  // Open Settings Modal & initialize temp state
  const handleOpenSettingsModal = () => {
    setTempFilterLayer(activeLayerFilter);
    setTempBasemapTheme(basemapTheme);
    setTempBasin(selectedBasin);
    setTempBrightness(brightness);
    setTempContrast(contrast);
    setIsFilterModalOpen(true);
  };

  // Save & Apply Settings from Modal
  const handleSaveAndApply = () => {
    setActiveLayerFilter(tempFilterLayer);
    setBasemapTheme(tempBasemapTheme);
    setSelectedBasin(tempBasin);
    setBrightness(tempBrightness);
    setContrast(tempContrast);
    setIsFilterModalOpen(false);
  };

  // Reset Defaults in Modal
  const handleResetSettings = () => {
    setTempFilterLayer('all');
    setTempBasemapTheme('satellite');
    setTempBasin('All Basins');
    setTempBrightness(100);
    setTempContrast(100);
  };

  // Hydrological Layer Counts for Modal
  const telemetryCounts = useMemo(() => {
    const totalReservoirs = AP_OFFICIAL_RESERVOIRS.length;
    const totalGauges = AP_OFFICIAL_RIVER_GAUGE_STATIONS.length;
    const totalWells = AP_GROUNDWATER_DTWL_2026.length;
    const totalComplaints = complaints.length;
    const totalAll = totalReservoirs + totalGauges + totalWells + totalComplaints;
    return {
      all: totalAll,
      reservoirs: totalReservoirs,
      rivers: totalGauges,
      groundwater: totalWells,
      complaints: totalComplaints,
    };
  }, [complaints]);

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
                {mapText.headerTitle}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{mapText.geoLocked}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {mapText.telemetrySummary}
            </p>
          </div>
        </div>

        {/* Right Action & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Main "Filters & Map Display Settings" Button */}
          <button
            onClick={handleOpenSettingsModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-[#0077B6] text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            title="Configure Map Telemetry Layers, Basemap Theme & Brightness"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#0077B6]" />
            <span>{mapText.settingsBtn}</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </button>

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
              <option value="all">{mapText.allDistricts}</option>
              {ANDHRA_PRADESH_26_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>{getDistrictDisplayName(d)}</option>
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
            <span className="hidden sm:inline">{mapText.fitAp}</span>
          </button>
        </div>
      </div>

      {/* Main Map Box with Applied Brightness & Contrast Calibration */}
      <div className="relative w-full h-[540px] sm:h-[600px] bg-slate-900 overflow-hidden">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-0 transition-all duration-300" 
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`
          }}
        />

        {/* Live Legend Box on Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200/90 max-w-xs text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
            <span className="font-extrabold text-[#03045E] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0077B6]" />
              <span>{mapText.legendTitle}</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">{mapText.liveApwrims}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300"></span>
              <span>{mapText.reservoirsCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{mapText.dwlrSafe}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{mapText.dwlrStress}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>{mapText.dwlrCritical}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-cyan-600"></span>
              <span>{mapText.riverGauges}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span>{mapText.grievances}</span>
            </div>
          </div>
        </div>

        {/* Selected Item Telemetry Drawer (Slides in on right when marker clicked) */}
        {selectedItem && (
          <div className="absolute top-4 right-4 z-30 w-80 sm:w-96 max-h-[500px] overflow-y-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in fade-in slide-in-from-right-4 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded">
                {mapText.inspectorTitle}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content for Complaint */}
            {selectedItem.type === 'complaint' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-rose-700">{selectedItem.data.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold">
                      {selectedItem.data.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedItem.data.shortDescription || selectedItem.data.wasteType}
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    {selectedItem.data.locationLandmark}, {selectedItem.data.mandal || ''} ({selectedItem.data.district})
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Citizen:</span>
                    <span className="font-semibold text-slate-800">{selectedItem.data.citizenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Nodal:</span>
                    <span className="font-semibold text-[#0077B6]">{selectedItem.data.assignedNodalOfficer || 'State Command'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SLA Priority:</span>
                    <span className="font-mono font-bold text-rose-600">{selectedItem.data.priority || 'High'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {onDispatchReminder && (
                    <button
                      onClick={() => onDispatchReminder(selectedItem.data)}
                      className="flex-1 py-2 rounded-xl bg-[#03045E] hover:bg-[#0077B6] text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{mapText.issueSlaDirective}</span>
                    </button>
                  )}
                  {onReassignComplaint && (
                    <button
                      onClick={() => onReassignComplaint(selectedItem.data)}
                      className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {mapText.reassign}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content for Reservoir */}
            {selectedItem.type === 'reservoir' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#03045E] text-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-sky-200 font-bold">
                    {selectedItem.data.basin}
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {currentLang === 'te' && selectedItem.data.teluguName ? selectedItem.data.teluguName : selectedItem.data.name}
                  </h4>
                  <div className="text-xs text-sky-200">
                    {selectedItem.data.district} {currentLang === 'hi' ? 'जिला' : currentLang === 'te' ? 'జిల్లా' : 'District'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">{mapText.currentStorage}</span>
                    <span className="text-base font-black text-[#03045E]">
                      {selectedItem.data.currentStorageTmc} TMC
                    </span>
                    <span className="text-[10px] text-slate-500">{mapText.grossCapacity}: {selectedItem.data.grossCapacityTmc} TMC</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">{mapText.fillPercentage}</span>
                    <span className={`text-base font-black ${selectedItem.data.storagePercentage < 25 ? 'text-rose-600' : 'text-blue-600'}`}>
                      {selectedItem.data.storagePercentage}%
                    </span>
                    <span className="text-[10px] text-slate-500">{mapText.inflow}: {selectedItem.data.inflowCusecs || 0} cfs</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{mapText.currentLevel}:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedItem.data.currentWaterLevelM || '42.5'} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{mapText.frl}:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedItem.data.fullReservoirLevelM || '45.0'} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{mapText.spillwayStatus}:</span>
                    <span className={`font-bold ${selectedItem.data.floodStatus === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedItem.data.floodStatus || 'Regulated'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Content for District */}
            {selectedItem.type === 'district' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#03045E] text-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-sky-200 font-bold">
                    {selectedItem.data.region}
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {currentLang === 'te' 
                      ? `${selectedItem.data.teluguName || selectedItem.data.name} జిల్లా`
                      : currentLang === 'hi'
                      ? `${AP_DISTRICTS_HINDI[selectedItem.data.id] || selectedItem.data.name} जिला`
                      : `${selectedItem.data.name} District`}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">{mapText.monitoredBodies}</span>
                    <span className="text-base font-black text-[#03045E]">
                      {selectedItem.data.totalWaterBodiesCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">{mapText.groundwaterDtwl}</span>
                    <span className="text-base font-black text-emerald-600">
                      {selectedItem.data.wrisTelemetry?.groundwaterDepthMbgl} mbgl
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 space-y-1">
                  <span className="text-[10px] font-bold text-[#0077B6] uppercase block">{mapText.officerInCharge}</span>
                  <div className="font-bold text-[#03045E]">{selectedItem.data.officerInCharge?.name}</div>
                  <div className="text-slate-500 text-[11px]">{selectedItem.data.officerInCharge?.designation}</div>
                  <div className="text-slate-700 font-mono font-bold text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0077B6]" />
                    <span>{selectedItem.data.officerInCharge?.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Groundwater Telemetry */}
            {selectedItem.type === 'groundwater' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#0077B6] text-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-sky-200 font-bold">
                    {selectedItem.data.agency || 'CGWB'} Station
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {selectedItem.data.village}, {selectedItem.data.block}
                  </h4>
                  <div className="text-xs text-sky-200">
                    {selectedItem.data.district} District
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Water Table (DTWL)</span>
                    <span className="text-base font-black text-[#03045E]">
                      {selectedItem.data.dtwlMbgl} mbgl
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Aquifer Status</span>
                    <span className={`text-xs font-black ${selectedItem.data.status === 'red' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedItem.data.statusLabel || selectedItem.data.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Well Station Type</span>
                  <div className="font-semibold">{selectedItem.data.wellType}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Telemetry Date: {selectedItem.data.date}</div>
                </div>
              </div>
            )}

            {/* Content for River Gauge */}
            {selectedItem.type === 'gauge' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-cyan-700 text-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-cyan-200 font-bold">
                    CWC &amp; APWRIMS River Gauge
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {selectedItem.data.name}
                  </h4>
                  <div className="text-xs text-cyan-200">
                    River: {selectedItem.data.riverName || 'Major River'} ({selectedItem.data.district || 'Andhra Pradesh'})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Water Level</span>
                    <span className="text-base font-black text-slate-900">
                      {selectedItem.data.waterLevelM || selectedItem.data.currentRiverLevelM || '14.2'} m
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Discharge Flow</span>
                    <span className="text-base font-black text-[#0077B6]">
                      {selectedItem.data.dischargeCusecs ? `${selectedItem.data.dischargeCusecs.toLocaleString()} cfs` : 'Regulated'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Warning Level:</span>
                    <span className="font-mono font-bold text-amber-600">{selectedItem.data.warningLevelM || '18.0'} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Danger Mark:</span>
                    <span className="font-mono font-bold text-rose-600">{selectedItem.data.dangerLevelM || '21.0'} m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Rainfall Station */}
            {selectedItem.type === 'rainfall' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-blue-700 text-white space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-sky-200 font-bold">
                    Mandal Monsoon Rainfall Telemetry
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {selectedItem.data.mandal} Mandal
                  </h4>
                  <div className="text-xs text-sky-200">
                    {selectedItem.data.district} District
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Actual Rainfall</span>
                    <span className="text-base font-black text-[#0077B6]">
                      {selectedItem.data.actualMm} mm
                    </span>
                    <span className="text-[10px] text-slate-500">Normal: {selectedItem.data.normalMm} mm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block">Monsoon Status</span>
                    <span className={`text-xs font-black ${
                      selectedItem.data.status?.includes('Excess') ? 'text-sky-600' :
                      selectedItem.data.status?.includes('Deficient') ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedItem.data.status} ({selectedItem.data.deviationPercent > 0 ? '+' : ''}{selectedItem.data.deviationPercent}%)
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                  <span>Source: Andhra Pradesh State Hydro-Met Telemetry Network (IMD AWS)</span>
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
          <span>{mapText.surveillanceGeofence}: <strong>{mapText.stateAp}</strong></span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          {mapText.sourceCreds}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. FILTERS & MAP DISPLAY SETTINGS MODAL (Matching User Images 1 & 2) */}
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
                    {mapText.modalTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {mapText.modalDesc}
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

            {/* 1. SELECT HYDROLOGICAL TELEMETRY LAYER (Matching Image 1) */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {mapText.section1}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* A. All Hydrological Layers */}
                <button
                  type="button"
                  onClick={() => setTempFilterLayer('all')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterLayer === 'all'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{mapText.layerAll}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{telemetryCounts.all}</span>
                </button>

                {/* B. Major Reservoirs & Dams */}
                <button
                  type="button"
                  onClick={() => setTempFilterLayer('reservoirs')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterLayer === 'reservoirs'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span>{mapText.layerReservoirs}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{telemetryCounts.reservoirs}</span>
                </button>

                {/* C. River Gauges & Discharge */}
                <button
                  type="button"
                  onClick={() => setTempFilterLayer('rivers')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterLayer === 'rivers'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-800 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>{mapText.layerRivers}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{telemetryCounts.rivers}</span>
                </button>

                {/* D. CGWB Groundwater DWLR */}
                <button
                  type="button"
                  onClick={() => setTempFilterLayer('groundwater')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterLayer === 'groundwater'
                      ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-amber-600" />
                    <span>{mapText.layerGroundwater}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{telemetryCounts.groundwater}</span>
                </button>

                {/* E. Citizen Grievances / Hotspots */}
                <button
                  type="button"
                  onClick={() => setTempFilterLayer('complaints')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterLayer === 'complaints'
                      ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-rose-600" />
                    <span>{mapText.layerComplaints}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{telemetryCounts.complaints}</span>
                </button>

                {/* F. Major River Basins */}
                <button
                  type="button"
                  onClick={() => setTempFilterLayer('basins')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterLayer === 'basins'
                      ? 'bg-cyan-50 border-cyan-600 text-cyan-800 shadow-xs ring-2 ring-cyan-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-600" />
                    <span>{mapText.layerBasins}</span>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${tempFilterLayer === 'basins' ? 'text-cyan-600' : 'opacity-0'}`} />
                </button>
              </div>

              {/* Specific Basin Dropdown if Basins chosen */}
              {tempFilterLayer === 'basins' && (
                <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-cyan-900 block">
                    {mapText.chooseBasin}
                  </label>
                  <select
                    value={tempBasin}
                    onChange={(e) => setTempBasin(e.target.value)}
                    className="w-full bg-white border border-cyan-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer shadow-2xs"
                  >
                    <option value="All Basins">{mapText.allBasins}</option>
                    <option value="Godavari Basin">{currentLang === 'hi' ? 'गोदावरी नदी बेसिन' : currentLang === 'te' ? 'గోదావరి నదీ పరివాహక ప్రాంతం' : 'Godavari River Basin'}</option>
                    <option value="Krishna Basin">{currentLang === 'hi' ? 'कृष्णा नदी बेसिन' : currentLang === 'te' ? 'కృష్ణా నదీ పరివాహక ప్రాంతం' : 'Krishna River Basin'}</option>
                    <option value="Pennar Basin">{currentLang === 'hi' ? 'पेन्नार नदी बेसिन' : currentLang === 'te' ? 'పెన్నా నదీ పరివాహక ప్రాంతం' : 'Pennar River Basin'}</option>
                    <option value="Nagavali & Vamsadhara">{currentLang === 'hi' ? 'नागावली एवं वंसधारा बेसिन' : currentLang === 'te' ? 'నాగావళి & వంశధార పరివాహక ప్రాంతం' : 'Nagavali & Vamsadhara Basin'}</option>
                  </select>
                </div>
              )}
            </div>

            {/* 2. MAP BASEMAP THEME (Matching Image 1) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {mapText.section2}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* A. Satellite (ISRO Bhuvan Satellite - Default) */}
                <button
                  type="button"
                  onClick={() => setTempBasemapTheme('satellite')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    tempBasemapTheme === 'satellite'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mapText.themeSatellite}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {mapText.themeSatelliteDesc}
                  </span>
                </button>

                {/* B. Nir-ikshan Portal Theme (Light GIS) */}
                <button
                  type="button"
                  onClick={() => setTempBasemapTheme('light_gis')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    tempBasemapTheme === 'light_gis'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mapText.themeLightGis}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {mapText.themeLightGisDesc}
                  </span>
                </button>

                {/* C. Topographic Relief */}
                <button
                  type="button"
                  onClick={() => setTempBasemapTheme('topo')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    tempBasemapTheme === 'topo'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mapText.themeTopo}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {mapText.themeTopoDesc}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. BRIGHTNESS & CONTRAST CALIBRATION (Matching Image 2) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {mapText.section3}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> 
                      {mapText.brightness}
                    </span>
                    <span className="font-mono text-blue-700">{tempBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={tempBrightness}
                    onChange={(e) => setTempBrightness(Number(e.target.value))}
                    className="w-full accent-[#0047ab] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>{mapText.darker}</span>
                    <span>{mapText.defaultVal}</span>
                    <span>{mapText.brighter}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> 
                      {mapText.contrast}
                    </span>
                    <span className="font-mono text-blue-700">{tempContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    value={tempContrast}
                    onChange={(e) => setTempContrast(Number(e.target.value))}
                    className="w-full accent-[#0047ab] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>{mapText.softer}</span>
                    <span>{mapText.defaultVal}</span>
                    <span>{mapText.highContrast}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions: Save / Apply + Reset (Matching Image 2) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{mapText.resetDefaults}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {mapText.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  className="px-6 py-2.5 rounded-xl bg-[#0047ab] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{mapText.saveApply}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
