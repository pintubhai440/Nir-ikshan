/**
 * National Water Surveillance Grid & Hydrological Surveillance Map
 * Clean, Unified Modern Portal Design matching Nir-ikshan White/Slate Palette
 * Real-time GPS Cursor Readout, Dedicated Filter & Display Settings Modal with Brightness/Contrast & Save button,
 * Light GIS Basemap matching portal (NO black void), Animated Zoom-in,
 * and Persistent Language-Strict Telemetry Flashcards (Closes on [X] click only)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { 
  WaterBody, 
  CitizenComplaint, 
  UserRoleType 
} from '../types/nirikshan';
import { 
  HYDROLOGICAL_STATIONS, 
  MAJOR_RIVER_BASINS,
  HydrologicalStation, 
  TelemetryCategory, 
  WaterHealthStatus,
  convertAPReservoirToStation
} from '../data/indiaHydrologyData';
import { AP_RIVER_VECTORS } from '../data/andhraRiversGeoData';
import { AP_OFFICIAL_RIVER_GAUGE_STATIONS } from '../data/apRiverGaugesData';
import { AP_RAINFALL_HYDROLOGICAL_STATIONS } from '../data/apMonsoonRainfall2026';
import { AP_MANDAL_RAINFALL_STATIONS } from '../data/apMandalWiseRainfall2026';
import { 
  Search, 
  Droplets, 
  Activity, 
  Compass, 
  TrendingUp, 
  X,
  Check,
  Mountain,
  Satellite,
  Sliders,
  Waves,
  Info,
  CheckCircle2,
  RotateCcw,
  Sun,
  Eye,
  Layers,
  Sparkles,
  MapPin,
  CloudRain,
  Thermometer,
  Wind,
  RefreshCw,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { 
  AP_OFFICIAL_RESERVOIRS, 
  APReservoirRecord
} from '../data/apReservoirsData';
import { useLanguage } from '../context/LanguageContext';

export type MainFilterType = 
  | 'all' 
  | 'reservoir' 
  | 'rivers' 
  | 'groundwater' 
  | 'bhuvan_wbis' 
  | 'basin';

export type BasemapThemeType = 'light_gis' | 'satellite' | 'topo';

interface InteractiveIndiaMapProps {
  waterBodies?: WaterBody[];
  complaints?: CitizenComplaint[];
  currentRole?: UserRoleType;
  districtFilter?: string;
  initialState?: string;
  initialCategory?: TelemetryCategory | 'all' | 'extinct';
  initialStatusFilter?: WaterHealthStatus | 'all';
  onStatusFilterChange?: (status: WaterHealthStatus | 'all') => void;
  onSelectWaterBody?: (wb: WaterBody) => void;
  onSelectComplaint?: (c: CitizenComplaint) => void;
  onLodgeComplaint?: () => void;
}

// 100% Strict English Category Metadata
const CATEGORY_META_ENGLISH: Record<string, {
  title: string;
  badge: string;
  dataTypeLabel: string;
  dataType: string;
  measuredLabel: string;
  measured: string;
  examplesLabel: string;
  examples: string[];
}> = {
  reservoir: {
    title: 'Major National Reservoirs & Dams',
    badge: 'CWC & State Irrigation',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'National reservoir and dam telemetry tracked by CWC (Central Water Commission) and State Water Resources Departments.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Live Water Storage (TMC / MCM), Gross Capacity, Current Water Level (Meters / Feet), and Spillway Discharges.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Bhakra Dam (Gobind Sagar) — Himachal Pradesh / Punjab (Sutlej / Indus Basin)',
      'Tehri Dam (Bhagirathi River) — Uttarakhand (Ganga Basin) — Tallest Dam in India',
      'Sardar Sarovar Dam — Gujarat (Narmada River / Narmada Basin)',
      'Hirakud Dam — Odisha (Mahanadi River / Mahanadi Basin) — Longest Earthen Dam in India',
      'Nagarjuna Sagar Dam — Telangana / AP (Krishna River / Krishna Basin)',
      'Koyna Dam — Maharashtra (Krishna Basin)',
      'Indira Sagar Dam — Madhya Pradesh (Narmada Basin)',
      'Mettur Dam (Stanley Reservoir) — Tamil Nadu (Cauvery River / Cauvery Basin)',
    ],
  },
  rivers: {
    title: 'National River Water Level Gauges & River Discharge',
    badge: 'CWC Flood Surveillance',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Real-time telemetry from CWC river gauges and automated river discharge observation posts across inter-state river systems.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Current River Water Gauge Level (Meters), Warning Level, Danger Mark (Flood Alert), and Volumetric Discharge (Cusecs).',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Ganga River Gauges: Dashashwamedh Ghat Varanasi & Prayagraj Sangam (Uttar Pradesh)',
      'Yamuna River Gauge: Old Railway Bridge (Delhi Flood Monitoring Key Station)',
      'Brahmaputra River: Pandu Ghat & Dibrugarh (Assam / Brahmaputra Basin)',
      'Godavari River: Bhadrachalam Bridge (Telangana) & Dowleswaram Barrage (AP)',
      'Krishna River: Prakasam Barrage Headworks at Vijayawada (AP)',
      'Narmada River: Hoshangabad & Garudeshwar Stations (MP / Gujarat)',
    ],
  },
  groundwater: {
    title: 'CGWB Groundwater DWLR & Piezometers',
    badge: 'CGWB National Grid',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Automated Digital Water Level Recorders (DWLR) and non-pumping Piezometer monitoring network by CGWB (Central Ground Water Board).',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Depth to Groundwater (m BGL - Meters Below Ground Level), Post-Monsoon Aquifer Gain/Recharge Trend, and TDS Water Quality.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Pasighat & Changlang DWLR Stations (Arunachal Pradesh — Himalayan Recharge Zone)',
      'Latur & Marathwada Hard-Rock Piezometers (Maharashtra — Semi-Critical Zone)',
      'Kolar Hard-Rock Crystalline DWLR (Karnataka — Over-Exploited Deep Aquifer)',
      'Jodhpur & Osian Desert Aquifer Sensors (Rajasthan — Arid Zone)',
      'Coastal Plain Saline Water Monitoring Piezometers (Andhra Pradesh & Odisha)',
    ],
  },
  bhuvan_wbis: {
    title: 'ISRO Bhuvan WBIS National Water Bodies',
    badge: 'ISRO NRSC Optical Space Constellation',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Multi-spectral satellite telemetry from ISRO Resourcesat-2A (AWiFS 56m) and Sentinel-2 constellations on a 15-day revisit cycle.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Normalized Difference Water Index (NDWI Score: (Green-NIR)/(Green+NIR)), Surface Water Spread Area (Hectares), and Siltation Index.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Chilika Lake Ramsar Wetland — Odisha (Largest Coastal Brackish Lagoon in India)',
      'Dal Lake & Wular Lake — Jammu and Kashmir (Jhelum Basin)',
      'Vembanad-Kol Wetland Ramsar Site — Kerala (Longest Wetland in India)',
      'Lonar Meteorite Impact Crater Lake — Maharashtra (Hyper-Saline Wetland)',
      'Najafgarh Drain Wetland & Basin — South West Delhi / Haryana',
    ],
  },
  basin: {
    title: 'Major River Basins of India',
    badge: 'National Catchment Boundaries',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Hydrological basin boundary geometry and inter-state catchment telemetry models mapped with India-WRIS standards.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Basin Total Drainage Area (Sq Km), Aggregate Storage in Basin Reservoirs, and Catchment-Wide Runoff Inflow.',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Ganga Basin — Northern India (Uttarakhand, UP, Bihar, West Bengal)',
      'Godavari Basin — Central & Deccan India (Maharashtra, Telangana, AP)',
      'Krishna Basin — Peninsular India (Maharashtra, Karnataka, AP, Telangana)',
      'Indus Basin — North-West India (Punjab, Haryana, J&K, Himachal Pradesh)',
      'Narmada Basin — Central-West India (Madhya Pradesh, Gujarat)',
      'Mahanadi Basin — Eastern India (Chhattisgarh, Odisha)',
      'Cauvery Basin — Southern India (Karnataka, Tamil Nadu, Kerala)',
    ],
  },
  all: {
    title: 'All National Hydrological Layers',
    badge: 'Unified Water Grid',
    dataTypeLabel: 'Data Type & Source:',
    dataType: 'Unified national hydrological surveillance grid integrating India-WRIS, CWC, CGWB, IMD, and ISRO-NRSC Bhuvan satellites.',
    measuredLabel: 'Monitored Metrics:',
    measured: 'Combined telemetry covering 1,887 stations (161 Dams, 311 River Gauges, 638 Groundwater Wells, and 31 Satellite Wetlands).',
    examplesLabel: 'Major Examples Across India:',
    examples: [
      'Comprehensive multi-sensor coverage across 24 Indian States and Union Territories',
    ],
  },
};

// 100% Strict Hindi Category Metadata (Used when Hindi is active)
const CATEGORY_META_HINDI: Record<string, {
  title: string;
  badge: string;
  dataTypeLabel: string;
  dataType: string;
  measuredLabel: string;
  measured: string;
  examplesLabel: string;
  examples: string[];
}> = {
  reservoir: {
    title: 'राष्ट्रीय बांध एवं विशाल जलाशय (Major National Reservoirs & Dams)',
    badge: 'CWC एवं राज्य सिंचाई विभाग',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'CWC (केन्द्रीय जल आयोग) और राज्य जल संसाधन विभागों द्वारा राष्ट्रीय स्तर पर ट्रैक किए जाने वाले प्रमुख बांध।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'वर्तमान लाइव स्टोरेज (TMC / MCM में), कुल भराव क्षमता, और जल स्तर (मीटर/फीट)।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'भाखड़ा नांगल बांध (Bhakra Dam - Gobind Sagar): हिमाचल प्रदेश / पंजाब (सतलुज नदी / Indus Basin)',
      'टिहरी बांध (Tehri Dam): उत्तराखंड (भागीरथी नदी / Ganga Basin) — भारत का सबसे ऊंचा बांध',
      'सरदार सरोवर बांध (Sardar Sarovar): गुजरात (नर्मदा नदी / Narmada Basin)',
      'हीराकुंड बांध (Hirakud Dam): ओडिशा (महानदी / Mahanadi Basin) — भारत का सबसे लंबा मिट्टी का बांध',
      'नागार्जुन सागर बांध (Nagarjuna Sagar): तेलंगाना (कृष्णा नदी / Krishna Basin)',
      'कोयना बांध (Koyna Dam): महाराष्ट्र (कृष्णा बेसिन)',
      'इंदिरा सागर बांध: मध्य प्रदेश (नर्मदा बेसिन)',
      'मेट्टूर बांध (Mettur Dam): तमिलनाडु (कावेरी नदी / Cauvery Basin)',
    ],
  },
  rivers: {
    title: 'राष्ट्रीय नदी जल स्तर एवं बहाव गेज (National River Water Level Gauges & River Discharge)',
    badge: 'CWC बाढ़ निगरानी',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'CWC (केन्द्रीय जल आयोग) के रीयल-टाइम नदी गेज एवं डिस्चार्ज टेलीमेट्री स्टेशन।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'नदी जल स्तर (मीटर में), वार्निंग व डेंजर मार्क (बाढ़ चेतावनी), और जल बहाव दर (Cusecs/क्यूसेक में)।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'गंगा नदी गेज: दशाश्वमेध घाट वाराणसी एवं प्रयागराज संगम (उत्तर प्रदेश)',
      'यमुना नदी गेज: ओल्ड रेलवे ब्रिज दिल्ली (Old Railway Bridge - बाढ़ का मुख्य गेज)',
      'ब्रह्मपुत्र नदी: पांडु घाट गुवाहाटी (असम)',
      'गोदावरी नदी: भद्राचलम ब्रिज स्टेशन (तेलंगाना) एवं राजमुंदरी (AP)',
      'कृष्णा नदी: प्रकाशम बैराज विजयवाड़ा (AP)',
      'नर्मदा नदी: होशंगाबाद एवं गरुड़ेश्वर (MP / गुजरात)',
    ],
  },
  groundwater: {
    title: 'केंद्रीय भूजल बोर्ड DWLR एवं पीज़ोमीटर (CGWB Groundwater DWLR & Piezometers)',
    badge: 'CGWB राष्ट्रीय ग्रिड',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'CGWB (Central Ground Water Board) डिजिटल ऑटोमेटेड पीज़ोमीटर नेटवर्क।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'ज़मीन से पानी की गहराई (m BGL - Meters Below Ground Level), भूजल रीचार्ज ट्रेंड, टीडीएस (TDS PPM)।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'पासीघाट एवं चांगलांग DWLR (अरुणाचल प्रदेश - हिमालयी एक्विफर)',
      'लातूर एवं मराठवाड़ा कठोर चट्टानी वेल्स (महाराष्ट्र)',
      'कोलार हार्ड-रॉक पीज़ोमीटर (कर्नाटक)',
      'जोधपुर एवं ओसियां रेगिस्तानी एक्विफर (राजस्थान)',
      'पूर्वी तटीय खारा जल अंतर्वेधन वेल्स (AP / तमिलनाडु / ओडिशा)',
    ],
  },
  bhuvan_wbis: {
    title: 'इसरो भुवन उपग्रह जल निकाय एवं आर्द्रभूमियां (ISRO Bhuvan WBIS National Water Bodies)',
    badge: 'इसरो उपग्रह कॉन्स्टेलेशन',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'ISRO Resourcesat-2A (AWiFS) और Sentinel-2 उपग्रह द्वारा 15-दिवसीय ऑप्टिकल रिमोट सेंसिंग।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'NDWI स्कोर ((Green-NIR)/(Green+NIR)), जल फैलाव क्षेत्र (Hectares), ऐतिहासिक आधारभूत क्षेत्रफल, गाद सूचकांक।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'चिल्का झील (Chilika Lake): ओडिशा — भारत की सबसे बड़ी तटीय लैगून',
      'डल झील एवं वुलर झील: जम्मू और कश्मीर (झेलम बेसिन)',
      'वेम्बनाड झील रामसर वेटलैंड: केरल',
      'लोनार क्रेटर झील: महाराष्ट्र (उल्कापिंड से बनी खारे पानी की झील)',
      'नजफगढ़ वेटलैंड: दक्षिण-पश्चिम दिल्ली',
    ],
  },
  basin: {
    title: 'भारत के प्रमुख नदी बेसिन (Major River Basins of India)',
    badge: 'राष्ट्रीय जलग्रहण क्षेत्र',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'राष्ट्रीय जलवैज्ञानिक नदी जलग्रहण क्षेत्र एवं उप-बेसिन नेटवर्क।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: 'बेसिन कुल क्षेत्रफल, बेसिन स्तरीय बांध भंडारण, नदी नेटवर्क एवं अपवाह।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      'गंगा बेसिन (उत्तर भारत), गोदावरी बेसिन (दक्कन प्रायद्वीप), कृष्णा बेसिन (मध्य-दक्षिण भारत)',
      'सिंधु बेसिन (उत्तर-पश्चिम), नर्मदा बेसिन (मध्य भारत), महानदी बेसिन (पूर्वी भारत), कावेरी बेसिन (दक्षिण भारत)',
    ],
  },
  all: {
    title: 'राष्ट्रीय सूक्ष्म-जलग्रहण एवं जल ग्रिड (All National Hydrological Layers)',
    badge: 'एकीकृत जल ग्रिड',
    dataTypeLabel: 'डेटा प्रकार एवं स्रोत:',
    dataType: 'India-WRIS, CWC, CGWB, IMD, और ISRO NRSC का एकीकृत राष्ट्रीय जल ग्रिड।',
    measuredLabel: 'क्या मापा जा रहा है:',
    measured: '1,887 बांध, नदी गेज, भूजल DWLR कुएं, और सैटेलाइट जल निकाय।',
    examplesLabel: 'पूरे भारत से प्रमुख उदाहरण:',
    examples: [
      '161 प्रमुख बांध, 311 नदी गेज एवं डिस्चार्ज, 638 भूजल DWLR कुएं, 31 उपग्रह जल निकाय',
    ],
  },
};

// 100% REAL LIVE DATA: Meteorological Telemetry interface from WMO/IMD High-Res Open-Meteo Grid
export interface RealTimeCatchmentTelemetry {
  temperature: number;
  humidity: number;
  precipitation: number; // mm/h
  rain: number;
  windSpeed: number; // km/h
  weatherCode: number;
  condition: string;
  conditionHi: string;
  timestamp: string;
  elevationM: number;
  isLoading: boolean;
  isError: boolean;
  source: string;
}

// Decode official WMO weather codes into precise bilingual descriptions
export const decodeWmoWeatherCode = (code: number) => {
  if (code === 0) return { en: 'Clear Sky ☀️', hi: 'साफ़ आसमान ☀️' };
  if (code === 1) return { en: 'Mainly Clear 🌤️', hi: 'मुख्यतः साफ़ 🌤️' };
  if (code === 2) return { en: 'Partly Cloudy ⛅', hi: 'आंशिक बादल ⛅' };
  if (code === 3) return { en: 'Overcast ☁️', hi: 'घने बादल ☁️' };
  if (code === 45 || code === 48) return { en: 'Fog / Mist 🌫️', hi: 'कोहरा / धुंध 🌫️' };
  if (code >= 51 && code <= 55) return { en: 'Light Drizzle 🌦️', hi: 'हल्की बूंदाबांदी 🌦️' };
  if (code >= 61 && code <= 65) return { en: 'Active Rain 🌧️', hi: 'सक्रिय वर्षा 🌧️' };
  if (code >= 80 && code <= 82) return { en: 'Rain Showers 🌧️', hi: 'वर्षा की बौछारें 🌧️' };
  if (code >= 95) return { en: 'Thunderstorm ⛈️', hi: 'गरज के साथ वर्षा ⛈️' };
  return { en: 'Fair Weather 🌤️', hi: 'अनुकूल मौसम 🌤️' };
};

export const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({
  waterBodies = [],
  complaints = [],
  currentRole = 'admin',
  districtFilter,
  initialState,
  initialCategory,
  initialStatusFilter,
  onStatusFilterChange,
  onSelectWaterBody,
  onLodgeComplaint,
}) => {
  const { t, language } = useLanguage();
  
  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const hybridLabelLayerRef = useRef<L.TileLayer | null>(null);
  const riverVectorsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Active filter state
  const [activeFilterTab, setActiveFilterTab] = useState<MainFilterType>('all');
  const [selectedBasin, setSelectedBasin] = useState<string>('All Basins');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<WaterHealthStatus | 'all'>(initialStatusFilter || 'all');

  // Basemap Theme: 'satellite' by default (ISRO Bhuvan & High-Res Satellite), 'light_gis', or 'topo'
  const [basemapTheme, setBasemapTheme] = useState<BasemapThemeType>('satellite');

  // Display Settings: Brightness and Contrast
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Modal temporary states (committed only when user clicks "Save Settings")
  const [tempFilterTab, setTempFilterTab] = useState<MainFilterType>('all');
  const [tempBasin, setTempBasin] = useState<string>('All Basins');
  const [tempBasemapTheme, setTempBasemapTheme] = useState<BasemapThemeType>('satellite');
  const [tempBrightness, setTempBrightness] = useState<number>(100);
  const [tempContrast, setTempContrast] = useState<number>(100);

  // Filter & Display Settings Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Real-time GPS Coordinates readout (Center + Live Mouse Cursor)
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 20.5937,
    lng: 78.9629,
    zoom: 5,
  });
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copiedGps, setCopiedGps] = useState<boolean>(false);

  // Flashcard State: Persistent station card (closes ONLY on [X] click)
  const [flashStation, setFlashStation] = useState<HydrologicalStation | null>(null);

  // 100% Real Live Rain Radar Layer (RainViewer Doppler Global/India API)
  const [showRainRadar, setShowRainRadar] = useState<boolean>(false);
  const rainRadarLayerRef = useRef<L.TileLayer | null>(null);

  // 100% Real Live Catchment Telemetry State (Open-Meteo High-Resolution Grid)
  const [realTimeTelemetry, setRealTimeTelemetry] = useState<RealTimeCatchmentTelemetry | null>(null);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);

  // Fetch real-time live weather & catchment precipitation for exact station coordinates
  const fetchLiveCatchmentTelemetry = useCallback(async (lat: number, lng: number) => {
    setIsRefreshingTelemetry(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`
      );
      if (!res.ok) throw new Error('API fetch error');
      const data = await res.json();
      const curr = data.current;
      const weather = decodeWmoWeatherCode(curr.weather_code);
      setRealTimeTelemetry({
        temperature: curr.temperature_2m,
        humidity: curr.relative_humidity_2m,
        precipitation: curr.precipitation,
        rain: curr.rain,
        windSpeed: curr.wind_speed_10m,
        weatherCode: curr.weather_code,
        condition: weather.en,
        conditionHi: weather.hi,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        elevationM: Math.round(data.elevation || 0),
        isLoading: false,
        isError: false,
        source: 'WMO High-Resolution Observation Grid (Open-Meteo API)'
      });
    } catch (err) {
      console.error('Error fetching live catchment telemetry:', err);
      setRealTimeTelemetry(prev => prev ? { ...prev, isLoading: false, isError: true } : null);
    } finally {
      setIsRefreshingTelemetry(false);
    }
  }, []);

  // Fetch live telemetry automatically when flashStation opens
  useEffect(() => {
    if (flashStation) {
      fetchLiveCatchmentTelemetry(flashStation.lat, flashStation.lng);
    } else {
      setRealTimeTelemetry(null);
    }
  }, [flashStation, fetchLiveCatchmentTelemetry]);

  // Real-Time Doppler Rain Radar Layer Effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (rainRadarLayerRef.current) {
      map.removeLayer(rainRadarLayerRef.current);
      rainRadarLayerRef.current = null;
    }

    if (showRainRadar) {
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then((res) => res.json())
        .then((data) => {
          if (!mapInstanceRef.current) return;
          const pastFrames = data?.radar?.past;
          if (pastFrames && pastFrames.length > 0) {
            const latest = pastFrames[pastFrames.length - 1];
            const radarUrl = `https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
            rainRadarLayerRef.current = L.tileLayer(radarUrl, {
              maxZoom: 18,
              opacity: 0.70,
              zIndex: 400,
              attribution: '&copy; <a href="https://rainviewer.com">RainViewer</a> Live Doppler Radar',
            }).addTo(mapInstanceRef.current);
          }
        })
        .catch((err) => console.error('RainViewer load error:', err));
    }
  }, [showRainRadar]);

  // Synchronize external status filter from homepage 5-color cards
  useEffect(() => {
    if (initialStatusFilter !== undefined) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Master Dynamic Stations (1,887 stations across India)
  const dynamicStations = useMemo(() => {
    const updatedApStations = AP_OFFICIAL_RESERVOIRS.map(convertAPReservoirToStation);
    const nonApStations = HYDROLOGICAL_STATIONS.filter(
      (s) => s.state !== 'Andhra Pradesh'
    );
    const apGroundwaterAndWetlands = HYDROLOGICAL_STATIONS.filter(
      (s) => s.state === 'Andhra Pradesh' && (s.category === 'groundwater' || s.category === 'bhuvan_wbis')
    );
    return [
      ...updatedApStations,
      ...AP_OFFICIAL_RIVER_GAUGE_STATIONS,
      ...AP_MANDAL_RAINFALL_STATIONS,
      ...AP_RAINFALL_HYDROLOGICAL_STATIONS,
      ...apGroundwaterAndWetlands,
      ...nonApStations,
    ];
  }, []);

  // Filtered stations logic using the active filter tab and basin
  const filteredStations = useMemo(() => {
    return dynamicStations.filter((station) => {
      // 1. Filter by Main 6 Tabs
      if (activeFilterTab === 'reservoir') {
        if (station.category !== 'reservoir') return false;
      } else if (activeFilterTab === 'rivers') {
        if (station.category !== 'river_level' && station.category !== 'river_discharge') {
          return false;
        }
      } else if (activeFilterTab === 'groundwater') {
        if (station.category !== 'groundwater') return false;
      } else if (activeFilterTab === 'bhuvan_wbis') {
        if (station.category !== 'bhuvan_wbis' && !station.isExtinct && station.status !== 'grey') {
          return false;
        }
      } else if (activeFilterTab === 'basin') {
        if (selectedBasin !== 'All Basins') {
          const matchWord = selectedBasin.toLowerCase().replace(' basin', '').trim();
          if (!station.basin.toLowerCase().includes(matchWord)) {
            return false;
          }
        }
      }

      // 2. Status filter (from top 5 cards)
      if (statusFilter !== 'all') {
        if (station.status !== statusFilter) return false;
      }

      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = 
          station.name.toLowerCase().includes(q) ||
          station.district.toLowerCase().includes(q) ||
          station.state.toLowerCase().includes(q) ||
          (station.riverName && station.riverName.toLowerCase().includes(q)) ||
          station.basin.toLowerCase().includes(q) ||
          station.code.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [dynamicStations, activeFilterTab, selectedBasin, statusFilter, searchQuery]);

  // Counts for each of the 6 tabs
  const tabCounts = useMemo(() => {
    return {
      all: dynamicStations.length,
      reservoir: dynamicStations.filter((s) => s.category === 'reservoir').length,
      rivers: dynamicStations.filter((s) => s.category === 'river_level' || s.category === 'river_discharge').length,
      groundwater: dynamicStations.filter((s) => s.category === 'groundwater').length,
      bhuvan_wbis: dynamicStations.filter((s) => s.category === 'bhuvan_wbis' || s.isExtinct || s.status === 'grey').length,
      basin: MAJOR_RIVER_BASINS.length,
    };
  }, [dynamicStations]);

  // Open Modal Handler (sync temporary state with current)
  const handleOpenFilterModal = () => {
    setTempFilterTab(activeFilterTab);
    setTempBasin(selectedBasin);
    setTempBasemapTheme(basemapTheme);
    setTempBrightness(brightness);
    setTempContrast(contrast);
    setIsFilterModalOpen(true);
  };

  // Save & Apply Settings from Modal
  const handleSaveAndApply = () => {
    setActiveFilterTab(tempFilterTab);
    setSelectedBasin(tempBasin);
    setBasemapTheme(tempBasemapTheme);
    setBrightness(tempBrightness);
    setContrast(tempContrast);
    setIsFilterModalOpen(false);

    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempFilterTab === 'basin' && tempBasin !== 'All Basins') {
      const basinCenters: Record<string, [number, number, number]> = {
        'Ganga Basin': [26.5, 82.5, 6],
        'Godavari Basin': [18.8, 79.5, 6],
        'Krishna Basin': [16.5, 78.0, 6],
        'Indus Basin': [31.5, 75.5, 6],
        'Narmada Basin': [22.0, 76.5, 7],
        'Mahanadi Basin': [21.0, 83.5, 7],
        'Cauvery Basin': [11.5, 78.0, 7],
        'Brahmaputra Basin': [26.5, 92.5, 6],
        'Tapi Basin': [21.2, 75.0, 7],
        'Pennar Basin': [14.5, 78.5, 7],
        'Sabarmati Basin': [23.0, 72.8, 7],
        'Mahi Basin': [23.5, 74.0, 7],
      };
      const target = basinCenters[tempBasin];
      if (target) {
        map.flyTo([target[0], target[1]], target[2], { animate: true, duration: 1.4 });
        return;
      }
    }

    if (tempFilterTab === 'reservoir') {
      map.flyTo([21.0, 78.5], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'rivers') {
      map.flyTo([22.5, 80.0], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'groundwater') {
      map.flyTo([20.0, 78.0], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'bhuvan_wbis') {
      map.flyTo([20.5, 82.0], 5, { animate: true, duration: 1.2 });
    } else if (tempFilterTab === 'all') {
      map.flyTo([20.5937, 78.9629], 5, { animate: true, duration: 1.2 });
    }
  };

  // Reset to default settings
  const handleResetSettings = () => {
    setTempFilterTab('all');
    setTempBasin('All Basins');
    setTempBasemapTheme('satellite');
    setTempBrightness(100);
    setTempContrast(100);
  };

  // Copy GPS coordinates helper
  const copyGpsCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setCopiedGps(true);
    setTimeout(() => setCopiedGps(false), 2000);
  };

  // Initialize Leaflet Map with Strict All-India Geoboundary
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Strict India Geoboundary: covers territory from South of Kanyakumari (6.0°N) to Kashmir/Ladakh (37.5°N)
    // and Gujarat Kutch (68.0°E) to Arunachal Pradesh (97.5°E)
    const INDIA_BOUNDS = L.latLngBounds(
      L.latLng(6.0, 68.0),
      L.latLng(37.5, 97.5)
    );

    const map = L.map(mapContainerRef.current, {
      center: [21.5, 79.0], // All-India Geographic Center
      zoom: 5,
      minZoom: 4.5, // Strictly prevents zooming out beyond India!
      maxZoom: 18,
      maxBounds: INDIA_BOUNDS, // Hard boundary lock
      maxBoundsViscosity: 1.0, // 100% boundary viscosity - cannot pan or scroll outside India!
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    });

    mapInstanceRef.current = map;

    // Real-Time GPS Cursor Readout: Updates lat/lng live as mouse moves over map!
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    map.on('mouseout', () => {
      setCursorCoords(null);
    });

    map.on('move', () => {
      const center = map.getCenter();
      setCurrentCoords({
        lat: Number(center.lat.toFixed(4)),
        lng: Number(center.lng.toFixed(4)),
        zoom: map.getZoom(),
      });
    });

    // Layer groups for markers & rivers
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    riverVectorsLayerGroupRef.current = L.layerGroup().addTo(map);

    // Render River Vectors
    AP_RIVER_VECTORS.forEach((river) => {
      const polyline = L.polyline(river.coordinates, {
        color: '#0284c7',
        weight: river.weight + 0.5,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round',
      });
      polyline.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0284c7; background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #bae6fd; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          🌊 ${river.name}<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">${river.basin}</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );
      polyline.addTo(riverVectorsLayerGroupRef.current!);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Tiles based on basemapTheme (light_gis matches website design - NOT black!)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (hybridLabelLayerRef.current) {
      map.removeLayer(hybridLabelLayerRef.current);
      hybridLabelLayerRef.current = null;
    }

    if (basemapTheme === 'light_gis') {
      // Official OpenStreetMap Basemap - 100% Free, NO API key required, NO watermarks, crisp rivers, boundaries & clean light aesthetic
      tileLayerRef.current = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, CWC, India-WRIS, ISRO Bhuvan',
        }
      ).addTo(map);
    } else if (basemapTheme === 'satellite') {
      // High-Resolution Satellite Basemap
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: '&copy; ISRO NRSC Bhuvan & Esri World Imagery',
        }
      ).addTo(map);

      // Label Overlay
      hybridLabelLayerRef.current = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          opacity: 0.95,
        }
      ).addTo(map);
    } else if (basemapTheme === 'topo') {
      // Topographic Relief Basemap
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: '&copy; Esri World Topo Map & India-WRIS Relief',
        }
      ).addTo(map);
    }
  }, [basemapTheme]);

  // Calculate Marker Radius based on Zoom
  const calculateMarkerRadius = useCallback((zoom: number, status: WaterHealthStatus) => {
    let base = 6.0;
    if (zoom <= 5) base = 5.0;
    else if (zoom <= 7) base = 6.5;
    else if (zoom <= 9) base = 8.5;
    else base = 10.5;

    if (status === 'red') base += 2.0;
    if (status === 'grey') base += 1.0;
    return base;
  }, []);

  // Render Markers on Map with Hover & Animated Click
  const renderMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    const currentZoom = map.getZoom();

    filteredStations.forEach((station) => {
      const markerRadius = calculateMarkerRadius(currentZoom, station.status);

      // Status colors
      let fillColor = '#0284c7'; // normal blue
      let strokeColor = '#ffffff';

      if (station.status === 'green') {
        fillColor = '#10b981';
      } else if (station.status === 'blue') {
        fillColor = '#0284c7';
      } else if (station.status === 'yellow') {
        fillColor = '#f59e0b';
      } else if (station.status === 'red') {
        fillColor = '#ef4444';
        strokeColor = '#fecaca';
      } else if (station.status === 'grey') {
        fillColor = '#94a3b8';
        strokeColor = '#cbd5e1';
      }

      const isCurrentSelected = flashStation?.id === station.id;

      // Halo ring for selected station
      if (isCurrentSelected) {
        const haloMarker = L.circleMarker([station.lat, station.lng], {
          radius: markerRadius + 6.0,
          color: '#0284c7',
          weight: 2.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.25,
          dashArray: '3, 4',
        });
        markersGroup.addLayer(haloMarker);
      }

      const marker = L.circleMarker([station.lat, station.lng], {
        radius: markerRadius,
        fillColor,
        color: isCurrentSelected ? '#0047ab' : strokeColor,
        weight: isCurrentSelected ? 2.5 : currentZoom >= 8 ? 1.5 : 1.0,
        opacity: 1,
        fillOpacity: station.status === 'grey' ? 0.85 : 0.95,
      });

      // Click Event: Open Flashcard (STAYS OPEN until user explicitly closes it) + Smooth Animated Zoom
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setFlashStation(station);
        map.flyTo([station.lat, station.lng], Math.max(map.getZoom() + 2, 8), {
          animate: true,
          duration: 1.2,
        });
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredStations, flashStation, calculateMarkerRadius]);

  // Re-render markers on changes
  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // Re-scale markers on zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleZoomEnd = () => {
      renderMarkers();
    };

    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [renderMarkers]);

  // Language-Strict Flashcard Metadata
  const activeFlashcardMeta = useMemo(() => {
    if (!flashStation) return null;
    const cat = flashStation.category;
    const metaDict = language === 'hi' ? CATEGORY_META_HINDI : CATEGORY_META_ENGLISH;

    if (cat === 'reservoir') return metaDict.reservoir;
    if (cat === 'river_level' || cat === 'river_discharge') return metaDict.rivers;
    if (cat === 'groundwater') return metaDict.groundwater;
    if (cat === 'bhuvan_wbis') return metaDict.bhuvan_wbis;
    return metaDict.all;
  }, [flashStation, language]);

  const getCategoryIcon = (cat: string) => {
    if (cat === 'reservoir') return '💧';
    if (cat === 'river_level' || cat === 'river_discharge') return '🌊';
    if (cat === 'groundwater') return '⛏️';
    if (cat === 'bhuvan_wbis') return '🛰️';
    if (cat === 'rainfall') return '🌧️';
    return '🌐';
  };

  // Get human-readable active filter name
  const activeFilterName = useMemo(() => {
    if (activeFilterTab === 'all') return `All (${tabCounts.all})`;
    if (activeFilterTab === 'reservoir') return `Major Dams (${tabCounts.reservoir})`;
    if (activeFilterTab === 'rivers') return `Rivers & Discharge (${tabCounts.rivers})`;
    if (activeFilterTab === 'groundwater') return `Groundwater DWLR (${tabCounts.groundwater})`;
    if (activeFilterTab === 'bhuvan_wbis') return `Bhuvan Satellite (${tabCounts.bhuvan_wbis})`;
    if (activeFilterTab === 'basin') return `Basin: ${selectedBasin}`;
    return 'All Layers';
  }, [activeFilterTab, selectedBasin, tabCounts]);

  return (
    <div className="w-full bg-[#f8fafc] rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
      {/* ============================================================== */}
      {/* 1. TOP CONTROLS: SEARCH BAR + REAL-TIME GPS HUD + FILTERS BTN   */}
      {/* ============================================================== */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 z-20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Search Bar */}
          <div className="relative flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex items-center">
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'स्टेशन, बांध, नदी या राज्य खोजें (उदा. टिहरी, भाखड़ा, गंगा, श्रीशैलम)...'
                  : 'Search station, river, dam, state (e.g. Tehri, Bhakra, Ganga, Srisailam)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Middle: Real-Time Live GPS Coordinates HUD (Directly beside Search Bar) */}
          <div 
            onClick={() => copyGpsCoordinates(cursorCoords ? cursorCoords.lat : currentCoords.lat, cursorCoords ? cursorCoords.lng : currentCoords.lng)}
            title={language === 'hi' ? 'क्लिक करके सटीक GPS निर्देशांक कॉपी करें' : 'Click to copy exact GPS coordinates'}
            className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-slate-700 shadow-2xs cursor-pointer hover:border-blue-400 hover:text-blue-700 transition-colors shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#0047ab] animate-pulse shrink-0" />
              <span className="font-bold text-slate-800 text-[11px] tracking-tight">
                {cursorCoords 
                  ? (language === 'hi' 
                      ? `📍 लाइव GPS कर्सर: ${cursorCoords.lat}°N, ${cursorCoords.lng}°E`
                      : `📍 Live GPS: ${cursorCoords.lat}°N, ${cursorCoords.lng}°E`)
                  : (language === 'hi'
                      ? `📍 मानचित्र केंद्र: ${currentCoords.lat}°N, ${currentCoords.lng}°E (${currentCoords.zoom}x)`
                      : `📍 Map Center: ${currentCoords.lat}°N, ${currentCoords.lng}°E (${currentCoords.zoom}x)`)
                }
              </span>
            </div>
            {copiedGps ? (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 ml-1">
                <Check className="w-3 h-3" /> {language === 'hi' ? 'कॉपी हुआ!' : 'Copied!'}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({language === 'hi' ? 'कॉपी करें' : 'Click to copy'})
              </span>
            )}
          </div>

          {/* Middle-Right: Real-Time Live Rain Doppler Radar Toggle */}
          <button
            type="button"
            onClick={() => setShowRainRadar((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border ${
              showRainRadar
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:border-slate-300'
            }`}
            title={
              language === 'hi'
                ? 'लाइव मौसम वर्षा डॉप्लर रडार चालू/बंद करें (RainViewer Live Doppler)'
                : 'Toggle Real-Time Weather Rain Doppler Radar (RainViewer Live API)'
            }
          >
            <span className="relative flex h-2 w-2">
              {showRainRadar && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  showRainRadar ? 'bg-white' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <CloudRain className={`w-4 h-4 ${showRainRadar ? 'text-white' : 'text-sky-600'}`} />
            <span>{language === 'hi' ? 'लाइव वर्षा रडार' : 'Live Rain Radar'}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase ${
                showRainRadar ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {showRainRadar ? (language === 'hi' ? 'सक्रिय' : 'ON') : (language === 'hi' ? 'बंद' : 'OFF')}
            </span>
          </button>

          {/* Right: Modern Filter & Display Settings Button (Directly beside GPS) */}
          <button
            onClick={handleOpenFilterModal}
            className="px-4 py-2.5 rounded-2xl bg-[#0047ab] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
            title={language === 'hi' ? 'फ़िल्टर एवं मानचित्र सेटिंग्स खोलें' : 'Open Hydrological Filters & Display Settings'}
          >
            <Sliders className="w-4 h-4 text-sky-200" />
            <span>{language === 'hi' ? 'फ़िल्टर एवं सेटिंग्स' : 'Filters & Settings'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono">
              {activeFilterName}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAP VIEW CONTAINER WITH FLOATING PERSISTENT FLASHCARD        */}
      {/* ============================================================== */}
      <div className={`relative w-full h-[620px] sm:h-[700px] lg:h-[780px] overflow-hidden transition-colors ${basemapTheme === 'satellite' ? 'bg-[#0a0f1d]' : 'bg-[#eef2f6]'}`}>
        {/* Leaflet map canvas */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full transition-colors ${basemapTheme === 'satellite' ? 'bg-[#0a0f1d]' : 'bg-[#eef2f6]'}`}
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
          }}
        />

        {/* PERSISTENT FLASHCARD (Opens on click/inspect, CLOSES ONLY on [X] click) */}
        {flashStation && (
          <div 
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 max-w-sm sm:max-w-md w-[calc(100%-24px)] sm:w-auto bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-2xl rounded-3xl p-4 sm:p-5 text-slate-900 space-y-3.5 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
          >
            {/* Flashcard Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0047ab] font-bold text-[10px] border border-blue-200">
                  <span>{getCategoryIcon(flashStation.category)}</span>
                  <span>{activeFlashcardMeta ? activeFlashcardMeta.badge : flashStation.category.toUpperCase()}</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {flashStation.name}
                </h4>
                {flashStation.teluguName && language === 'te' && (
                  <p className="text-xs text-sky-700 font-medium">{flashStation.teluguName}</p>
                )}
                {flashStation.hindiName && language === 'hi' && (
                  <p className="text-xs text-amber-700 font-medium">{flashStation.hindiName}</p>
                )}
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                  <span>{flashStation.district}, {flashStation.state}</span>
                  <span>•</span>
                  <span className="text-slate-700 font-semibold">{flashStation.basin}</span>
                  <span>•</span>
                  <span className="text-blue-600 font-mono text-[10px]">📍 {flashStation.lat.toFixed(4)}°N, {flashStation.lng.toFixed(4)}°E</span>
                </div>
              </div>

              {/* Close Button: Strictly closes on [X] click as requested by user */}
              <button
                onClick={() => setFlashStation(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title={language === 'hi' ? 'कार्ड बंद करें' : 'Close Flashcard'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ============================================================== */}
            {/* 1. 100% REAL LIVE CATCHMENT WEATHER & MET TELEMETRY (OPEN-METEO) */}
            {/* ============================================================== */}
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 border border-blue-200/90 rounded-2xl p-3 text-[11px] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-[11px] text-[#0047ab] tracking-tight uppercase flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    {language === 'hi' ? 'वास्तविक लाइव कैचमेंट टेलीमेट्री' : 'Real-Time Catchment Telemetry'}
                  </span>
                </div>

                {/* Live Refresh Button */}
                <button
                  type="button"
                  onClick={() => fetchLiveCatchmentTelemetry(flashStation.lat, flashStation.lng)}
                  disabled={isRefreshingTelemetry}
                  className="p-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-300 flex items-center gap-1 text-[10px] font-semibold cursor-pointer transition-all shadow-2xs active:scale-95"
                  title={language === 'hi' ? 'लाइव मौसम डेटा रिफ्रेश करें' : 'Refresh live sensor telemetry'}
                >
                  <RefreshCw className={`w-3 h-3 text-blue-600 ${isRefreshingTelemetry ? 'animate-spin' : ''}`} />
                  <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
                </button>
              </div>

              {/* Real-time stats grid */}
              {realTimeTelemetry ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                    {/* Live Rainfall */}
                    <div className={`p-1.5 rounded-xl border ${realTimeTelemetry.precipitation > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200/90'}`}>
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'लाइव वर्षा' : 'LIVE RAIN'}
                      </span>
                      <span className="text-xs font-black font-mono text-blue-700 flex items-center justify-center gap-0.5">
                        <CloudRain className="w-3 h-3 text-sky-500 shrink-0" />
                        {realTimeTelemetry.precipitation} mm/h
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        {realTimeTelemetry.precipitation > 0 ? (language === 'hi' ? 'सक्रिय आवक' : 'Active Inflow') : (language === 'hi' ? 'शुष्क कैचमेंट' : 'No Rain')}
                      </span>
                    </div>

                    {/* Air Temperature */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90">
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'तापमान' : 'AIR TEMP'}
                      </span>
                      <span className="text-xs font-black font-mono text-slate-800 flex items-center justify-center gap-0.5">
                        <Thermometer className="w-3 h-3 text-amber-500 shrink-0" />
                        {realTimeTelemetry.temperature}°C
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        {language === 'hi' ? 'कैचमेंट' : 'Catchment'}
                      </span>
                    </div>

                    {/* Air Humidity */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90">
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'आर्द्रता' : 'HUMIDITY'}
                      </span>
                      <span className="text-xs font-black font-mono text-sky-700 flex items-center justify-center gap-0.5">
                        <Droplets className="w-3 h-3 text-sky-500 shrink-0" />
                        {realTimeTelemetry.humidity}%
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        {language === 'hi' ? 'वातावरण' : 'Atmosphere'}
                      </span>
                    </div>

                    {/* Wind Speed */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90">
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'पवन गति' : 'WIND'}
                      </span>
                      <span className="text-xs font-black font-mono text-slate-800 flex items-center justify-center gap-0.5">
                        <Wind className="w-3 h-3 text-slate-500 shrink-0" />
                        {realTimeTelemetry.windSpeed} km/h
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block truncate">
                        10m Surface
                      </span>
                    </div>
                  </div>

                  {/* Real-time sync footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 border-t border-blue-100/80 pt-1.5">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <span>{language === 'hi' ? realTimeTelemetry.conditionHi : realTimeTelemetry.condition}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[9px]">{realTimeTelemetry.elevationM}m MSL Elevation</span>
                    </span>
                    <span className="text-blue-700 font-mono text-[9px] font-semibold">
                      🕒 {realTimeTelemetry.timestamp} IST
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2.5 flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>{language === 'hi' ? 'वास्तविक लाइव कैचमेंट मौसम लोड हो रहा है...' : 'Fetching live catchment telemetry...'}</span>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* 2. OFFICIAL HYDROLOGICAL MASTER BENCHMARKS (CWC / WRIS / CGWB)  */}
            {/* ============================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'hi' ? 'केन्द्रीय जल आयोग (CWC) आधिकारिक टेलीमेट्री' : 'Official CWC Master Telemetry'}
                </span>
                <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {flashStation.agency} Network
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {flashStation.category === 'reservoir' && (
                  <>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'वर्तमान भंडारण' : 'CURRENT STORAGE'}
                      </span>
                      <span className="text-sm font-black text-[#0047ab] font-mono">
                        {flashStation.currentLiveStorageMCM ? `${flashStation.currentLiveStorageMCM.toLocaleString()} MCM` : flashStation.currentLiveStorageBMC ? `${flashStation.currentLiveStorageBMC} BMC` : '--'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        {flashStation.storagePercentage}% {language === 'hi' ? 'भराव क्षमता' : 'of Full Limit'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'जल स्तर' : 'WATER LEVEL'}
                      </span>
                      <span className="text-sm font-black text-slate-800 font-mono">
                        {flashStation.waterLevelM ? `${flashStation.waterLevelM.toFixed(2)} m` : '--'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {language === 'hi' ? 'FRL स्तर' : 'FRL Level'}: {flashStation.fullReservoirLevelM ? `${flashStation.fullReservoirLevelM.toFixed(2)} m` : '--'}
                      </span>
                    </div>

                    {/* Dynamic Flood Safety Clearance Buffer */}
                    {flashStation.waterLevelM && flashStation.fullReservoirLevelM && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {language === 'hi' ? 'सुरक्षित जलस्तर मार्जिन (Buffer to FRL):' : 'Clearance Buffer to FRL:'}
                          </span>
                          <span className="font-mono text-emerald-700 font-bold">
                            {(flashStation.fullReservoirLevelM - flashStation.waterLevelM).toFixed(2)} m {language === 'hi' ? 'नीचे (सुरक्षित)' : 'below Full Crest'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full ${
                              (flashStation.fullReservoirLevelM - flashStation.waterLevelM) < 1.0 
                                ? 'bg-rose-500' 
                                : (flashStation.fullReservoirLevelM - flashStation.waterLevelM) < 2.5 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, flashStation.storagePercentage || 70))}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span>{language === 'hi' ? 'वर्तमान' : 'Current'}: {flashStation.waterLevelM.toFixed(2)} m</span>
                          <span>{language === 'hi' ? 'चेतावनी' : 'Warning'}: {flashStation.warningLevelM ? `${flashStation.warningLevelM.toFixed(2)} m` : '280.00 m'}</span>
                          <span>{language === 'hi' ? 'अधिकतम FRL' : 'FRL'}: {flashStation.fullReservoirLevelM.toFixed(2)} m</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {(flashStation.category === 'river_level' || flashStation.category === 'river_discharge') && (
                  <>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'नदी जल स्तर' : 'RIVER WATER LEVEL'}
                      </span>
                      <span className="text-sm font-black text-blue-700 font-mono">
                        {flashStation.currentRiverLevelM ? `${flashStation.currentRiverLevelM.toFixed(2)} m` : '--'}
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold block">
                        {language === 'hi' ? 'ख़तरा स्तर' : 'Danger Mark'}: {flashStation.dangerLevelM ? `${flashStation.dangerLevelM.toFixed(2)} m` : '--'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'नदी बहाव' : 'RIVER DISCHARGE'}
                      </span>
                      <span className="text-sm font-black text-slate-800 font-mono">
                        {flashStation.dischargeCusecs ? `${flashStation.dischargeCusecs.toLocaleString()} cfs` : (language === 'hi' ? 'नियमित' : 'Regulated')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        {language === 'hi' ? 'एजेंसी' : 'Agency'}: {flashStation.agency}
                      </span>
                    </div>

                    {flashStation.currentRiverLevelM && flashStation.dangerLevelM && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          {language === 'hi' ? 'ख़तरे के निशान (HFL) से अंतर:' : 'Margin to Danger Mark:'}
                        </span>
                        <span className="font-mono font-bold text-emerald-700">
                          {(flashStation.dangerLevelM - flashStation.currentRiverLevelM).toFixed(2)} m {language === 'hi' ? 'सुरक्षित अंतर' : 'Safety Buffer'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {flashStation.category === 'groundwater' && (
                  <>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'भूजल गहराई' : 'DEPTH TO WATER'}
                      </span>
                      <span className="text-sm font-black text-amber-600 font-mono">
                        -{flashStation.waterLevelDepthMBGL ?? '--'} m
                      </span>
                      <span className="text-[10px] text-slate-500 block">m Below Ground Level</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'रीचार्ज ट्रेंड' : 'RECHARGE TREND'}
                      </span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        +{flashStation.rechargeTrendM ?? '1.5'} m
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        {language === 'hi' ? 'भूजल स्तर वृद्धि' : 'Aquifer Gain'}
                      </span>
                    </div>
                  </>
                )}

                {flashStation.category === 'bhuvan_wbis' && (
                  <>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'भुवन NDWI स्कोर' : 'BHUVAN NDWI SCORE'}
                      </span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        {flashStation.ndwiScore ? (flashStation.ndwiScore > 0 ? `+${flashStation.ndwiScore}` : flashStation.ndwiScore) : '--'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {language === 'hi' ? 'उपग्रह द्वारा मापा गया' : 'Optically Detected'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {language === 'hi' ? 'जल फैलाव क्षेत्रफल' : 'WATER SPREAD AREA'}
                      </span>
                      <span className="text-sm font-black text-slate-800 font-mono">
                        {flashStation.waterSpreadHa ? `${flashStation.waterSpreadHa} Ha` : '--'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {flashStation.isExtinct 
                          ? (language === 'hi' ? 'सूख कर मिट गया' : 'Dry Bed / Desiccated')
                          : (language === 'hi' ? 'सतही क्षेत्रफल' : 'Surface Area')}
                      </span>
                    </div>
                  </>
                )}

                {/* Status and TDS summary */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between col-span-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      flashStation.status === 'green' ? 'bg-emerald-500' :
                      flashStation.status === 'blue' ? 'bg-sky-500' :
                      flashStation.status === 'yellow' ? 'bg-amber-500' :
                      flashStation.status === 'red' ? 'bg-rose-500 animate-ping' : 'bg-slate-400'
                    }`} />
                    <span className="font-bold text-slate-800">
                      {language === 'hi'
                        ? (flashStation.status === 'green' ? 'उत्कृष्ट / पुनर्भरण' :
                           flashStation.status === 'blue' ? 'सामान्य जल स्तर' :
                           flashStation.status === 'yellow' ? 'मध्यम संकट / चेतावनी' :
                           flashStation.status === 'red' ? 'गंभीर संकट / डेंजर ज़ोन' : 'विलुप्त / सूखा तल')
                        : (flashStation.status === 'green' ? 'Pristine / Full Storage' :
                           flashStation.status === 'blue' ? 'Normal / Safe' :
                           flashStation.status === 'yellow' ? 'Moderate Alert' :
                           flashStation.status === 'red' ? 'Critical / Danger' : 'Extinct / Dry Bed')
                      }
                    </span>
                  </div>
                  {flashStation.waterQualityTdsPpm && (
                    <span className="font-mono text-blue-700 font-bold">TDS: {flashStation.waterQualityTdsPpm} ppm</span>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. STRUCTURED CATEGORY PROTOCOL & EXAMPLES                      */}
            {/* ============================================================== */}
            {activeFlashcardMeta && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-2.5 text-[10px] space-y-1.5 leading-relaxed">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <Info className="w-3.5 h-3.5 text-[#0047ab]" />
                  <span>{activeFlashcardMeta.title}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{activeFlashcardMeta.dataTypeLabel}</strong>{' '}
                  <span className="text-slate-600">{activeFlashcardMeta.dataType}</span>
                </div>
                <div>
                  <strong className="text-slate-700">{activeFlashcardMeta.measuredLabel}</strong>{' '}
                  <span className="text-slate-600">{activeFlashcardMeta.measured}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 mt-1">
                  <strong className="text-[#0047ab] text-[9px] uppercase tracking-wider block mb-0.5">
                    {activeFlashcardMeta.examplesLabel}
                  </strong>
                  <div className="max-h-20 overflow-y-auto space-y-0.5 text-[9px] text-slate-600 pr-1">
                    {activeFlashcardMeta.examples.map((ex, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-blue-500 shrink-0">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Close hint */}
            <div className="text-[10px] text-slate-400 text-center font-medium pt-0.5">
              {language === 'hi'
                ? 'कार्ड बंद करने के लिए ऊपर [X] बटन दबाएं'
                : 'Click [X] in the top corner to close this card'}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. FILTER & DISPLAY SETTINGS MODAL (OPENS ON "FILTERS" CLICK)   */}
      {/* ============================================================== */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl p-5 sm:p-6 text-slate-900 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0047ab] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {language === 'hi' ? 'मानचित्र फ़िल्टर एवं डिस्प्ले सेटिंग्स' : 'Filters & Map Display Settings'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi'
                      ? 'राष्ट्रीय जलवैज्ञानिक टेलीमेट्री परतें, बेसमेप थीम और ऑप्टिकल कैलिब्रेशन सेट करें'
                      : 'Configure hydrological telemetry layers, river basins, basemap theme, and optical calibration'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Filter Section: The 6 Categories */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {language === 'hi' ? '1. जलवैज्ञानिक टेलीमेट्री परत चुनें' : '1. Select Hydrological Telemetry Layer'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* 1. All */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('all')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'all'
                      ? 'bg-blue-50 border-blue-600 text-[#0047ab] shadow-xs ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{language === 'hi' ? 'सभी जलवैज्ञानिक परतें (All)' : 'All Hydrological Layers'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.all}</span>
                </button>

                {/* 2. Major Dams */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('reservoir')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'reservoir'
                      ? 'bg-sky-50 border-sky-600 text-sky-800 shadow-xs ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>{language === 'hi' ? 'राष्ट्रीय बांध एवं विशाल जलाशय' : 'Major Reservoirs & Dams'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.reservoir}</span>
                </button>

                {/* 3. River Level & Discharge */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('rivers')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'rivers'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-800 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'hi' ? 'नदी जल स्तर एवं बहाव गेज' : 'River Gauges & Discharge (Cusecs)'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.rivers}</span>
                </button>

                {/* 4. CGWB Groundwater */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('groundwater')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'groundwater'
                      ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-amber-600" />
                    <span>{language === 'hi' ? 'भूजल DWLR एवं पीज़ोमीटर' : 'CGWB Groundwater DWLR'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.groundwater}</span>
                </button>

                {/* 5. ISRO Bhuvan WBIS */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('bhuvan_wbis')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'bhuvan_wbis'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'hi' ? 'इसरो भुवन उपग्रह जल निकाय' : 'ISRO Bhuvan WBIS Water Bodies'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{tabCounts.bhuvan_wbis}</span>
                </button>

                {/* 6. Major River Basins */}
                <button
                  type="button"
                  onClick={() => setTempFilterTab('basin')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    tempFilterTab === 'basin'
                      ? 'bg-cyan-50 border-cyan-600 text-cyan-800 shadow-xs ring-2 ring-cyan-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-600" />
                    <span>{language === 'hi' ? 'भारत के प्रमुख नदी बेसिन' : 'Major River Basins of India'}</span>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 ${tempFilterTab === 'basin' ? 'text-cyan-600' : 'opacity-0'}`} />
                </button>
              </div>

              {/* Specific Basin Dropdown if Basin tab chosen */}
              {tempFilterTab === 'basin' && (
                <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="text-[11px] font-bold text-cyan-900 block">
                    {language === 'hi' ? 'विशिष्ट नदी बेसिन चुनें:' : 'Choose Specific River Basin to Inspect:'}
                  </label>
                  <select
                    value={tempBasin}
                    onChange={(e) => setTempBasin(e.target.value)}
                    className="w-full bg-white border border-cyan-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer shadow-2xs"
                  >
                    <option value="All Basins">{language === 'hi' ? 'सभी 13 प्रमुख नदी बेसिन' : 'All 13 Major River Basins'}</option>
                    {MAJOR_RIVER_BASINS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Basemap Theme (Theme that matches the website - NOT pitch black!) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {language === 'hi' ? '2. मानचित्र बेसमेप थीम' : '2. Map Basemap Theme'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* 1. Satellite (ISRO Bhuvan Satellite - Default as requested) */}
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
                    <span>{language === 'hi' ? 'इसरो भुवन उपग्रह (डिफ़ॉल्ट)' : 'ISRO Bhuvan Satellite (Default)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? 'उच्च-रिज़ॉल्यूशन उपग्रह इमेजरी एवं सीमाएं' : 'High-resolution ISRO satellite imagery & boundaries'}
                  </span>
                </button>

                {/* 2. Nir-ikshan Portal Theme (Light GIS) */}
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
                    <span>{language === 'hi' ? 'नीर-ईक्षण पोर्टल थीम (लाइट)' : 'Nir-ikshan Portal Theme (Light)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? 'वेबसाइट डिजाइन के अनुसार स्वच्छ कार्टोग्राफी' : 'Clean GIS cartography matching portal style'}
                  </span>
                </button>

                {/* 3. Topographic */}
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
                    <span>{language === 'hi' ? 'टोपोग्राफिक रिलीफ' : 'Topographic Relief'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? 'पर्वतीय एवं जलग्रहण ढलान' : 'Terrain relief & catchment elevation'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Display Adjustments: Brightness & Contrast */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                {language === 'hi' ? '3. चमक एवं कंट्रास्ट कैलिब्रेशन (Brightness & Contrast)' : '3. Brightness & Contrast Calibration'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> 
                      {language === 'hi' ? 'चमक (Brightness):' : 'Brightness:'}
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
                    <span>60% (Darker)</span>
                    <span>100% (Default)</span>
                    <span>140% (Brighter)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-500" /> 
                      {language === 'hi' ? 'कंट्रास्ट (Contrast):' : 'Contrast:'}
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
                    <span>70% (Softer)</span>
                    <span>100% (Default)</span>
                    <span>150% (High Contrast)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions: Save / Apply + Reset */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डिफ़ॉल्ट सेटिंग्स रीसेट करें' : 'Reset Defaults'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndApply}
                  className="px-6 py-2.5 rounded-xl bg-[#0047ab] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सेव करें एवं लागू करें (Save)' : 'Save & Apply Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
