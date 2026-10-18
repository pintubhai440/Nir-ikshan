import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { CitizenComplaint } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { ANDHRA_PRADESH_26_DISTRICTS } from '../data/andhraDistrictsData';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Upload, 
  X, 
  Send, 
  User, 
  Info,
  Crosshair,
  RotateCcw,
  Map as MapIcon,
  CheckCircle2,
  Compass,
  Loader2,
  Lock,
  ShieldCheck,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LodgeComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted: (complaint: CitizenComplaint) => void;
  currentUser?: { name: string; phone: string } | null;
  isLoggedIn?: boolean;
  onOpenLoginModal?: () => void;
  onLoginSuccess?: (userData: { name: string; phone: string }) => void;
}

// Major causes of water pollution / hazard categories (Pure English, Pure Hindi, Pure Telugu)
export const HAZARD_WASTE_CATEGORIES = [
  {
    id: 'plastic',
    label: 'Plastic & Polythene Waste (Bottles & Bags)',
    labelHi: 'प्लास्टिक एवं पॉलीथीन अपशिष्ट (बोतलें व थैलियां)',
    labelTe: 'ప్లాస్టిక్ & పాలిథిన్ వ్యర్థాలు (బాటిళ్లు & సంచులు)',
    cause: 'Single-use plastic bottles, polybags, synthetic wrappers choking canal bed or inlet',
    causeHi: 'एकल-उपयोग प्लास्टिक की बोतलें, थैलियां व रैपर नहर के तल या मुहाने को अवरुद्ध कर रहे हैं',
    causeTe: 'సింగిల్ యూజ్ ప్లాస్టిక్ బాటిళ్లు, సంచులు కాలువ ప్రవాహాన్ని అడ్డుకుంటున్నాయి',
    remedy: 'Physical mechanical boom collection & municipal solid waste disposal',
    remedyHi: 'यांत्रिक बूम संग्रहण एवं ठोस अपशिष्ट निपटान',
    remedyTe: 'మెకానికల్ బూమ్ సేకరణ & మున్సిపల్ వ్యర్థాల పారవేయడం',
    icon: '🥤',
  },
  {
    id: 'chemical',
    label: 'Industrial Chemical Effluent / Factory Dye Discharge',
    labelHi: 'औद्योगिक रासायनिक अपशिष्ट / डाई रसायन बहाव',
    labelTe: 'పారిశ్రామిక రసాయన వ్యర్థాలు / ఫ్యాక్టరీ రంగు నీరు',
    cause: 'Direct untreated chemical effluent, toxic colored dye runoff, acidic toxic wash',
    causeHi: 'सीधे अनुपचारित रासायनिक अपशिष्ट, विषैला रंगीन डाई व अम्लीय जहरीला पानी',
    causeTe: 'శుద్ధి చేయని రసాయన వ్యర్థాలు, విషపూరిత రంగుల ప్రవాహం',
    remedy: 'Immediate TDS/pH laboratory testing, pipeline sealing & APPCB notice',
    remedyHi: 'तत्काल टीडीएस/पीएच परीक्षण, पाइपलाइन सील एवं प्रदूषण नियंत्रण नोटिस',
    remedyTe: 'తక్షణ TDS/pH ప్రయోగశాల పరీక్ష, పైప్‌లైన్ సీలింగ్ & APPCB నోటీసు',
    icon: '🏭',
  },
  {
    id: 'sewage',
    label: 'Domestic Raw Sewage & Septic Blackwater Drain',
    labelHi: 'घरेलू सीवेज एवं सेप्टिक गंदा पानी नाला',
    labelTe: 'గృహ మురుగునీరు & సెప్టిక్ వ్యర్థాల కాలువ',
    cause: 'Untreated municipal drain lines or septic overflows emptying into drinking water body',
    causeHi: 'अनुपचारित नाली का गंदा पानी या सेप्टिक ओवरफ्लो पेयजल स्रोत में गिरना',
    causeTe: 'శుద్ధి చేయని మురుగునీరు లేదా సెప్టిక్ ట్యాంక్ వ్యర్థాలు తాగునీటిలో కలవడం',
    remedy: 'Drain diversion, mobile suction tanker deployment & bio-remediation',
    remedyHi: 'नाली डायवर्जन, सक्शन टैंकर तैनाती एवं जैव-उपचार',
    remedyTe: 'మురుగు మళ్లింపు, సక్షన్ ట్యాంకర్ల మోహరింపు & బయో-రెమిడియేషన్',
    icon: '🚽',
  },
  {
    id: 'construction',
    label: 'Construction Debris & Bitumen Encroachment (Malba)',
    labelHi: 'निर्माण मलबा एवं डामर भराव अतिक्रमण',
    labelTe: 'భవన నిర్మాణ వ్యర్థాలు & ఆక్రమణలు (మట్టి/రాళ్ళు)',
    cause: 'Illegal dumping of concrete rubble, bricks, bitumen mix encroaching on lake perimeter',
    causeHi: 'जल निकाय की परिधि पर कंक्रीट, ईंट, मलबे का अवैध डंपिंग व अतिक्रमण',
    causeTe: 'చెరువు పరిధిలో కాంక్రీట్ శిథిలాలు, ఇటుకలు అక్రమంగా వేయడం & ఆక్రమణ',
    remedy: 'Heavy JCB earthmover clearance & cadastral boundary fencing',
    remedyHi: 'जेसीबी मशीन से मलबा हटाना एवं सीमा घेराबंदी',
    remedyTe: 'JCB యంత్రాలతో తొలగింపు & హద్దుల రక్షణ కంచె',
    icon: '🧱',
  },
  {
    id: 'biomass',
    label: 'Invasive Water Hyacinth Weeds & Algal Scum',
    labelHi: 'जलकुंभी खरपतवार एवं काई की मोटी परत',
    labelTe: 'గుర్రపు డెక్క కలుపు మొక్కలు & నాచు పొర',
    cause: 'Thick mats of invasive hyacinth choking oxygen supply, causing fish mortality',
    causeHi: 'जलकुंभी की मोटी परत से ऑक्सीजन की कमी और जलीय जीवों का संकट',
    causeTe: 'దట్టమైన గుర్రపు డెక్క ఆక్సిజన్‌ను తగ్గించి జలచరాల మరణానికి కారణమవుతోంది',
    remedy: 'De-weeding harvester deployment & aeration pump installation',
    remedyHi: 'डी-वीडिंग हार्वेस्टर मशीन द्वारा सफाई एवं वायु संचार पंप लगाना',
    remedyTe: 'కలుపు తొలగింపు యంత్రాల మోహరింపు & ఎయిరేషన్ పంపుల ఏర్పాటు',
    icon: '🌿',
  },
  {
    id: 'breach',
    label: 'Broken Sluice Gate / Canal Bund Breach Risk',
    labelHi: 'टूटा हुआ स्लूस गेट / नहर तटबंध टूटने का खतरा',
    labelTe: 'విరిగిన తూము గేటు / కాలువ గట్టు తెగిపోయే ప్రమాదం',
    cause: 'Cracked masonry in check dam, broken regulator gate, imminent flooding hazard',
    causeHi: 'चेक डैम की टूटी दीवार, क्षतिग्रस्त रेगुलेटर गेट और बाढ़ का खतरा',
    causeTe: 'చెక్ డ్యామ్ గోడ పగుళ్లు, విరిగిన గేటు మరియు వరద ముప్పు',
    remedy: 'Urgent sandbag bund fortification & irrigation engineer repair dispatch',
    remedyHi: 'रेत की बोरियों से तटबंध सुदृढ़ीकरण एवं सिंचाई इंजीनियरों द्वारा मरम्मत',
    remedyTe: 'ఇసుక బస్తాలతో గట్టు పటిష్టం & నీటిపారుదల ఇంజనీర్ల మరమ్మతు',
    icon: '🌊',
  },
  {
    id: 'dry_tank',
    label: 'Dried Up Tank Bed Encroachment & Collapsed Borewell',
    labelHi: 'सूखा तालाब तल अतिक्रमण एवं खुला असुरक्षित बोरवेल',
    labelTe: 'ఎండిన చెరువు ఆక్రమణ & ప్రమాదకర తెరిచిన బోరుబావి',
    cause: 'Completely dried public percolation tank or abandoned hazardous open borewell',
    causeHi: 'पूरी तरह सूखा सार्वजनिक रिसाव तालाब या खुला खतरनाक लावारिस बोरवेल',
    causeTe: 'పూర్తిగా ఎండిపోయిన ఊర చెరువు లేదా వదిలేసిన ప్రమాదకరమైన బోరుబావి',
    remedy: 'Protective borewell capping & tank desilting rejuvenation project',
    remedyHi: 'बोरवेल को सुरक्षित रूप से ढकना एवं तालाब का पुनर्जीवन कार्य',
    remedyTe: 'బోరుబావికి రక్షణ మూత & చెరువు పూడికతీత పునరుజ్జీవన ప్రాజెక్ట్',
    icon: '☀️',
  },
  {
    id: 'agriculture',
    label: 'Agricultural Pesticide & Fertilizer Chemical Runoff',
    labelHi: 'कृषि कीटनाशक एवं रासायनिक उर्वरक बहाव',
    labelTe: 'వ్యవసాయ పురుగుమందులు & ఎరువుల రసాయన ప్రవాహం',
    cause: 'Intensive weedicide and high-nitrogen chemical runoff poisoning public pond',
    causeHi: 'अत्यधिक खरपतवार नाशक व रासायनिक उर्वरकों से तालाब का पानी जहरीला होना',
    causeTe: 'పురుగుమందులు మరియు అధిక రసాయన ఎరువులు చెరువు నీటిని కలుషితం చేయడం',
    remedy: 'Water chemistry screening & buffer bio-swale filtration berm creation',
    remedyHi: 'जल रसायन परीक्षण एवं प्राकृतिक बायो-फिल्टर तटबंध निर्माण',
    remedyTe: 'నీటి పరీక్ష & సహజ బయో-స్వేల్ వడపోత కట్ట నిర్మాణం',
    icon: '🚜',
  },
  {
    id: 'biomedical',
    label: 'Hospital Bio-Medical Waste & Decomposing Animal Carcass',
    labelHi: 'अस्पताल बायोमेडिकल कचरा एवं मृत पशु अपशिष्ट',
    labelTe: 'ఆసుపత్రి బయో-మెడికల్ వ్యర్థాలు & మృత జంతు కళేబరాలు',
    cause: 'Infectious clinical syringes, hospital packaging or floating dead livestock',
    causeHi: 'संक्रामक सिरिंज, अस्पताल का कचरा या पानी में तैरते मृत मवेशी',
    causeTe: 'ఇన్ఫెక్షన్ కలిగించే సిరంజిలు, ఆసుపత్రి వ్యర్థాలు లేదా చనిపోయిన జంతువులు',
    remedy: 'Hazmat bio-safety removal & immediate water body disinfection protocol',
    remedyHi: 'बायो-सेफ्टी दस्ता द्वारा तुरंत सफाई एवं कीटाणुशोधन प्रक्रिया',
    remedyTe: 'బయో-సేఫ్టీ బృందంతో తొలగింపు & తక్షణ క్రిమిసంహారక చర్యలు',
    icon: '☣️',
  },
  {
    id: 'mining',
    label: 'Illegal Riverbed Sand Mining & Bank Erosion',
    labelHi: 'अवैध नदी रेत खनन एवं किनारों का कटाव',
    labelTe: 'అక్రమ నదీ ఇసుక తవ్వకాలు & నదీ గట్ల కోత',
    cause: 'Unauthorized heavy machinery riverbed excavation destabilizing water table',
    causeHi: 'भारी मशीनों से नदी तल की अवैध खुदाई जिससे भूजल स्तर गिर रहा है',
    causeTe: 'యంత్రాలతో అనుమతి లేని ఇసుక తవ్వకాలు, భూగర్భ జలాల అస్థిరత',
    remedy: 'Mining enforcement seizure & revenue inspector ground survey',
    remedyHi: 'खनन प्रवर्तन दल द्वारा जब्ती एवं राजस्व निरीक्षक द्वारा स्थल जांच',
    remedyTe: 'మైనింగ్ ఎన్‌ఫోర్స్‌మెంట్ స్వాధీనం & రెవెన్యూ తనిఖీ',
    icon: '🚜',
  },
  {
    id: 'other',
    label: 'Other Environmental Water Contamination',
    labelHi: 'अन्य पर्यावरणीय जल प्रदूषण / संकट',
    labelTe: 'ఇతర పర్యావరణ జల కాలుష్యం / ప్రమాదం',
    cause: 'Uncategorized toxic contamination, illegal discharge pipe, or public hazard',
    causeHi: 'अन्य प्रकार का विषैला प्रदूषण, अवैध निकास पाइप या जल संकट',
    causeTe: 'ఇతర రకాల కాలుష్యం, అక్రమ పైపులైన్ లేదా బహిరంగ ప్రమాదం',
    remedy: 'Multi-departmental joint inspection team dispatch',
    remedyHi: 'संयुक्त विभागीय निरीक्षण दल की तत्काल रवानगी',
    remedyTe: 'వివిధ శాఖల సంయుక్త తనిఖీ బృందం పంపడం',
    icon: '⚠️',
  },
];

export const LodgeComplaintModal: React.FC<LodgeComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintSubmitted,
  currentUser,
  isLoggedIn = false,
  onOpenLoginModal,
  onLoginSuccess,
}) => {
  const { language } = useLanguage();

  // Pure Multi-Language Translator: 100% Pure English, Pure Hindi, and Pure Telugu
  const tr = (en: string, hi: string, te: string) => {
    if (language === 'hi') return hi;
    if (language === 'te') return te;
    return en;
  };
  
  // Tab state: If user is not logged in, prompt login first; else show complaint form
  const [activeTab, setActiveTab] = useState<'login_required' | 'form'>('form');

  // Sync active tab with login state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!isLoggedIn) {
        setActiveTab('login_required');
      } else {
        setActiveTab('form');
      }
    }
  }, [isOpen, isLoggedIn]);

  // Inline Quick Login State (so user can login seamlessly without leaving modal)
  const [inlineName, setInlineName] = useState(currentUser?.name || '');
  const [inlinePhone, setInlinePhone] = useState(currentUser?.phone || '');
  const [inlineOtpStep, setInlineOtpStep] = useState<'phone' | 'otp'>('phone');
  const [inlineOtp, setInlineOtp] = useState(['', '', '', '']);
  const [inlineGeneratedOtp, setInlineGeneratedOtp] = useState('4402');
  const [inlineError, setInlineError] = useState('');
  const [inlineLoading, setInlineLoading] = useState(false);

  // Form Fields State
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [citizenAge, setCitizenAge] = useState<number | ''>(32);
  const [citizenGender, setCitizenGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || '');

  // Keep synced with currentUser if logged in
  useEffect(() => {
    if (isOpen && currentUser) {
      if (currentUser.name) setCitizenName(currentUser.name);
      if (currentUser.phone) setCitizenPhone(currentUser.phone);
      if (currentUser.name && !inlineName) setInlineName(currentUser.name);
      if (currentUser.phone && !inlinePhone) setInlinePhone(currentUser.phone);
    }
  }, [isOpen, currentUser]);

  const [district, setDistrict] = useState<string>('Vizianagaram');
  const [mandal, setMandal] = useState('Gantyada');
  const [locationLandmark, setLocationLandmark] = useState('Champavathi River Basin Weir');
  const [shortDescription, setShortDescription] = useState('Heavy plastic bottle choke and untreated domestic runoff near the main weir channel.');
  const [wasteType, setWasteType] = useState<string>('Plastic & Polythene Waste (Bottles & Bags)');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop');
  const [showWastePrompt, setShowWastePrompt] = useState(false);
  const wasteDropdownRef = useRef<HTMLSelectElement | null>(null);

  // GPS Coordinates & Status State (Default Vizianagaram District Center)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 18.1124,
    lng: 83.4022,
  });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{
    type: 'success' | 'info' | 'loading';
    message: string;
  } | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize or re-center interactive mini-map with SATELLITE IMAGERY ONLY
  useEffect(() => {
    if (!isOpen || activeTab !== 'form') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    if (!showMiniMap) return;

    // Small delay to ensure modal DOM is mounted and visible
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        return;
      }

      try {
        const map = L.map(mapContainerRef.current, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });

        // High-Resolution Esri World Imagery (Satellite from space - 100% Free)
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Satellite',
          }
        ).addTo(map);

        // English Reference Boundaries & Place Labels
        L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: '',
            opacity: 0.95,
          }
        ).addTo(map);

        const customHazardIcon = L.divIcon({
          html: `
            <div style="
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <div style="
                position: absolute;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.5);
                animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: #dc2626;
                border: 2.5px solid #ffffff;
                color: #ffffff;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.6);
                font-weight: bold;
              ">⚠️</div>
            </div>
          `,
          className: 'hazard-pin-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([coordinates.lat, coordinates.lng], {
          icon: customHazardIcon,
          draggable: true,
        }).addTo(map);

        marker.bindTooltip(
          '📍 Drag pin or click anywhere on satellite map to set site',
          { direction: 'top', offset: [0, -14], permanent: false }
        );

        // Update coordinates when marker is dragged
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          const newLat = Number(pos.lat.toFixed(4));
          const newLng = Number(pos.lng.toFixed(4));
          setCoordinates({ lat: newLat, lng: newLng });
          setGpsFeedback({
            type: 'success',
            message: `Pin set on satellite map: ${newLat}° N, ${newLng}° E`,
          });
        });

        // Click on map to move marker and update coordinates
        map.on('click', (e) => {
          const newLat = Number(e.latlng.lat.toFixed(4));
          const newLng = Number(e.latlng.lng.toFixed(4));
          marker.setLatLng([newLat, newLng]);
          setCoordinates({ lat: newLat, lng: newLng });
          setGpsFeedback({
            type: 'success',
            message: `Location set on satellite map: ${newLat}° N, ${newLng}° E`,
          });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (err) {
        console.error('Mini satellite map error:', err);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, activeTab, showMiniMap]);

  // Sync marker position when coordinates change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
    }
  }, [coordinates.lat, coordinates.lng]);

  if (!isOpen) return null;

  // Handle District Change & auto-update coordinates to district center
  const handleDistrictChange = (distName: string) => {
    setDistrict(distName);
    const found = ANDHRA_PRADESH_26_DISTRICTS.find(
      (d) => d.name.toLowerCase() === distName.toLowerCase()
    );
    if (found?.centerCoords) {
      const newCoord = { lat: found.centerCoords.lat, lng: found.centerCoords.lng };
      setCoordinates(newCoord);
      setGpsFeedback({
        type: 'info',
        message: `Applied ${found.name} district center coordinates (${newCoord.lat}° N, ${newCoord.lng}° E)`,
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([newCoord.lat, newCoord.lng], 12, { duration: 1 });
      }
    }
  };

  // Reset coordinates to currently selected district center
  const handleResetToDistrictCenter = () => {
    const found = ANDHRA_PRADESH_26_DISTRICTS.find(
      (d) => d.name.toLowerCase() === district.toLowerCase()
    );
    const defaultCoord = found?.centerCoords || { lat: 18.1124, lng: 83.4022 };
    setCoordinates(defaultCoord);
    setGpsFeedback({
      type: 'info',
      message: `Reset coordinates to ${district} district center (${defaultCoord.lat}° N, ${defaultCoord.lng}° E)`,
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([defaultCoord.lat, defaultCoord.lng], 12, { duration: 1 });
    }
  };

  // Auto-Fetch My GPS Location with Browser Geolocation & Safe Fallbacks
  const handleFetchCurrentGps = () => {
    setIsFetchingLocation(true);
    setGpsFeedback({
      type: 'loading',
      message: 'Accessing device GPS receiver for high-precision satellite coordinates...',
    });

    const applyCoords = (lat: number, lng: number, sourceLabel: string) => {
      const roundedLat = Number(lat.toFixed(4));
      const roundedLng = Number(lng.toFixed(4));
      setCoordinates({ lat: roundedLat, lng: roundedLng });
      setIsFetchingLocation(false);
      setGpsFeedback({
        type: 'success',
        message: `✓ High-precision GPS acquired via ${sourceLabel}: ${roundedLat}° N, ${roundedLng}° E`,
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([roundedLat, roundedLng], 14, { duration: 1.2 });
      }
    };

    const fallbackToDistrictCenter = (reason?: string) => {
      setIsFetchingLocation(false);
      const found = ANDHRA_PRADESH_26_DISTRICTS.find(
        (d) => d.name.toLowerCase() === district.toLowerCase()
      );
      const defaultCoord = found?.centerCoords || { lat: 18.1124, lng: 83.4022 };
      setCoordinates(defaultCoord);
      setGpsFeedback({
        type: 'info',
        message: `Device GPS restricted (${reason || 'permission denied'}). Applied ${district} district coordinates. You can edit Lat/Lng directly or click on the satellite map to pin.`,
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([defaultCoord.lat, defaultCoord.lng], 12, { duration: 1 });
      }
    };

    if (!('geolocation' in navigator)) {
      fallbackToDistrictCenter('Browser does not support Geolocation API');
      return;
    }

    const tryBrowserGeolocation = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          applyCoords(
            position.coords.latitude,
            position.coords.longitude,
            highAccuracy ? 'Device GPS' : 'Network Geolocation'
          );
        },
        (error) => {
          if (highAccuracy) {
            tryBrowserGeolocation(false);
          } else {
            fallbackToDistrictCenter(error.message);
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 5000 : 8000,
          maximumAge: 10000,
        }
      );
    };

    tryBrowserGeolocation(true);
  };

  // Handle file upload & actively prompt user to select waste type from dropdown
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setShowWastePrompt(true);
        // Scroll or focus waste dropdown so user specifies what type of trash it is
        setTimeout(() => {
          if (wasteDropdownRef.current) {
            wasteDropdownRef.current.focus();
            wasteDropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample proof photos with matching automatic waste type selection
  const sampleProofPhotos = [
    { 
      label: 'Plastic Waste Inflow', 
      wasteCategory: 'Plastic & Polythene Waste (Bottles & Bags)',
      url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop' 
    },
    { 
      label: 'Industrial Chemical Dumping', 
      wasteCategory: 'Industrial Chemical Effluent / Factory Dye Discharge',
      url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&auto=format&fit=crop' 
    },
    { 
      label: 'Domestic Sewage Drain', 
      wasteCategory: 'Domestic Raw Sewage & Septic Blackwater Drain',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop' 
    },
    { 
      label: 'Dry Tank Bed Encroachment', 
      wasteCategory: 'Dried Up Tank Bed Encroachment & Collapsed Borewell',
      url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop' 
    },
  ];

  const handleSelectSamplePhoto = (sample: typeof sampleProofPhotos[0]) => {
    setPhotoUrl(sample.url);
    setWasteType(sample.wasteCategory);
    setShowWastePrompt(true);
  };

  // Helper to determine Nodal Officer for the district
  const getNodalOfficer = (distName: string) => {
    const found = ANDHRA_PRADESH_26_DISTRICTS.find(
      (d) => d.name.toLowerCase() === distName.toLowerCase()
    );
    if (found?.officerInCharge) {
      return `${found.officerInCharge.name} (${found.officerInCharge.designation}), ${distName}`;
    }
    if (distName === 'Vizianagaram') return 'Dr. B. K. Rao (IAS), Vizianagaram';
    if (distName === 'Parvathipuram Manyam') return 'Smt. S. Lakshmi (IAS), Parvathipuram';
    if (distName === 'Visakhapatnam') return 'Sri K. Venkat (IAS), Visakhapatnam';
    return `District Nodal Officer (IAS), ${distName}`;
  };

  // Handle Quick Inline OTP Login
  const handleRequestInlineOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim()) {
      setInlineError('Please enter your full citizen name');
      return;
    }
    const cleanPhone = inlinePhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setInlineError('Please enter a valid 10-digit mobile number');
      return;
    }

    setInlineError('');
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setInlineGeneratedOtp(randomCode);
    setInlineOtpStep('otp');
    setInlineOtp(['', '', '', '']);
  };

  const handleVerifyInlineOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineLoading(true);
    setInlineError('');

    const enteredOtp = inlineOtp.join('');
    if (enteredOtp.length === 4) {
      setTimeout(() => {
        const userData = {
          name: inlineName.trim() || 'Verified Citizen',
          phone: inlinePhone.trim() || '9848012345',
        };
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        setCitizenName(userData.name);
        setCitizenPhone(userData.phone);
        setInlineLoading(false);
        setActiveTab('form');
      }, 400);
    } else {
      setInlineLoading(false);
      setInlineError('Please enter the 4-digit verification OTP');
    }
  };

  // Submit Complaint
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Must be logged in to lodge complaint
    if (!isLoggedIn) {
      setActiveTab('login_required');
      return;
    }

    const newId = `CMP-AP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newComplaint: CitizenComplaint = {
      id: newId,
      citizenName: citizenName.trim() || currentUser?.name || 'Verified Citizen',
      citizenAge: Number(citizenAge) || 32,
      citizenGender,
      citizenPhone: citizenPhone.trim() || currentUser?.phone || '9848012345',
      district,
      mandal: mandal.trim() || 'Headquarters Mandal',
      village: locationLandmark.trim() || 'Main Village',
      locationLandmark: locationLandmark.trim(),
      coordinates: {
        lat: Number(coordinates.lat) || 18.1124,
        lng: Number(coordinates.lng) || 83.4022,
      },
      wasteType,
      shortDescription: shortDescription.trim(),
      photoUrl,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'SUBMITTED',
      assignedNodalOfficer: getNodalOfficer(district),
    };

    onComplaintSubmitted(newComplaint);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] p-4 sm:p-5 flex items-start justify-between text-white shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-500 text-white shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-sky-200 uppercase font-bold">
                NIR-IKSHAN CITIZEN WATER COMPLAINT
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Lodge Water Body Hazard Complaint
            </h2>
            <p className="text-[11px] sm:text-xs text-sky-200">
              Report toxic waste, chokes, dry collapsed wells or dam breaches directly to your District Nodal Officer.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Dedicated Tabs: Tab 1 (Login Required) & Tab 2 (Complaint Form) */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('login_required')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login_required'
                ? 'bg-white text-[#03045E] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-[#03045E]'
            }`}
          >
            {isLoggedIn ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {isLoggedIn ? 'Account Verified' : '1. Login Required'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isLoggedIn) {
                setActiveTab('form');
              } else {
                setActiveTab('login_required');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-[#03045E] shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-[#03045E]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>2. Complaint Form</span>
            {!isLoggedIn && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                Login First
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: LOGIN REQUIRED VIEW (When citizen is not logged in)       */}
        {/* ============================================================== */}
        {activeTab === 'login_required' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
            {/* High-visibility Warning Notice Banner */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                    CITIZEN AUTHENTICATION MANDATORY
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-950">
                    Please Login First to Lodge Complaint
                  </h3>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Under Government of Andhra Pradesh Water Security Guidelines, grievances cannot be lodged anonymously. 
                    Your verified mobile number connects your report directly to the District Nodal Officer and ensures only you can view your personal complaint on the hazard map.
                  </p>
                </div>
              </div>

              {/* 3 Pillars of Security */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Private Map View</span>
                  </span>
                  <p className="text-[10px] text-slate-600">
                    Only your complaints appear on your map. Nobody else can see your filed report.
                  </p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Real-Time SMS</span>
                  </span>
                  <p className="text-[10px] text-slate-600">
                    Receive SMS alerts when an on-site Field Inspector tests TDS and takes action.
                  </p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-950 flex items-center gap-1 text-[11px]">
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>Photo Proof</span>
                  </span>
                  <p className="text-[10px] text-slate-600">
                    Inspect before-and-after photo evidence certified by Action Engineers.
                  </p>
                </div>
              </div>
            </div>

            {/* If user is already logged in, show status & unlock button */}
            {isLoggedIn && currentUser ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-sm">Account Verified & Active</h4>
                      <p className="text-xs text-emerald-800">
                        Logged in as <strong>{currentUser.name}</strong> ({currentUser.phone})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Proceed to Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Inline Mobile OTP Form for Instant Frictionless Login */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#0077B6]" />
                    <span>Quick Mobile OTP Verification</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLoginModal) onOpenLoginModal();
                    }}
                    className="text-[11px] font-bold text-[#0077B6] hover:underline cursor-pointer"
                  >
                    Open Full Login Screen
                  </button>
                </div>

                {inlineError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
                    ⚠️ {inlineError}
                  </div>
                )}

                {inlineOtpStep === 'phone' ? (
                  <form onSubmit={handleRequestInlineOtp} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Full Citizen Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Naidu"
                          value={inlineName}
                          onChange={(e) => setInlineName(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          10-Digit Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="98480 12345"
                          value={inlinePhone}
                          onChange={(e) => setInlinePhone(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Send OTP to Mobile</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyInlineOtp} className="space-y-3">
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between text-xs text-sky-900">
                      <div>
                        <span>OTP sent to: <strong>{inlinePhone}</strong></span>
                        <div className="text-[10px] text-sky-700 font-mono">Demo OTP: {inlineGeneratedOtp}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = inlineGeneratedOtp.split('');
                          setInlineOtp(digits);
                        }}
                        className="px-2.5 py-1 bg-[#0077B6] text-white rounded-lg text-[10px] font-bold hover:bg-[#03045E] cursor-pointer"
                      >
                        Auto-Fill OTP
                      </button>
                    </div>

                    <div className="flex justify-center gap-2 py-1">
                      {inlineOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`inline-otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.slice(-1);
                            const updated = [...inlineOtp];
                            updated[idx] = val;
                            setInlineOtp(updated);
                            if (val && idx < 3) {
                              document.getElementById(`inline-otp-${idx + 1}`)?.focus();
                            }
                          }}
                          className="w-11 h-12 text-center text-lg font-bold font-mono border-2 border-slate-300 focus:border-[#0077B6] rounded-xl focus:ring-2 focus:ring-[#0077B6]/30 bg-white"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInlineOtpStep('phone')}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        disabled={inlineLoading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {inlineLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Verify OTP & Unlock Complaint Form</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: COMPLAINT FORM (Unlocked & 100% Pure English)            */}
        {/* ============================================================== */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
            
            {/* User Basic Info Row */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0077B6]" />
                  <span>1. Citizen Verification Details</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Citizen Account</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Naidu"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Mobile Number (Tracking & Private Map)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98480 12345"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min={14}
                    max={100}
                    placeholder="32"
                    value={citizenAge}
                    onChange={(e) => setCitizenAge(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Gender
                  </label>
                  <select
                    value={citizenGender}
                    onChange={(e) => setCitizenGender(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 font-semibold bg-white cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* District & Geographic Location */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0077B6]" />
                <span>2. District & Geographic Location</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-semibold focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
                  >
                    <optgroup label="Andhra Pradesh (26 Districts)">
                      {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </optgroup>
                    <option value="Other">Other / Outside AP</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Mandal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gantyada / Nellimarla"
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Village & Nearby Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Champavathi River Bridge, Near Irrigation Canal Sluice"
                  value={locationLandmark}
                  onChange={(e) => setLocationLandmark(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* GPS Coordinates & Interactive SATELLITE Map Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#0077B6]" />
                      <span>GPS Coordinates (Satellite View)</span>
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Auto-fetch, type coordinates directly, or click/drag anywhere on the satellite map to pin.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Auto-Fetch GPS Button */}
                    <button
                      type="button"
                      onClick={handleFetchCurrentGps}
                      disabled={isFetchingLocation}
                      className="px-2.5 py-1.5 bg-[#0077B6] hover:bg-[#03045E] active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isFetchingLocation ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Crosshair className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isFetchingLocation ? 'Detecting GPS...' : 'Auto-Fetch My GPS Location'}
                      </span>
                    </button>

                    {/* Reset to district center */}
                    <button
                      type="button"
                      onClick={handleResetToDistrictCenter}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset coordinates to selected district center"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>District Center</span>
                    </button>

                    {/* Toggle Mini-Map Collapse */}
                    <button
                      type="button"
                      onClick={() => setShowMiniMap((prev) => !prev)}
                      className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0077B6] rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <MapIcon className="w-3 h-3" />
                      <span>{showMiniMap ? 'Hide Map' : 'Show Map'}</span>
                    </button>
                  </div>
                </div>

                {/* Editable Latitude and Longitude input fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Latitude (°N)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={coordinates.lat}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setCoordinates((prev) => ({ ...prev, lat: isNaN(val) ? 0 : val }));
                        }}
                        className="w-full text-xs font-mono font-bold p-2 pl-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                        placeholder="e.g. 18.1124"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] font-mono font-bold text-slate-400">°N</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Longitude (°E)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        required
                        value={coordinates.lng}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setCoordinates((prev) => ({ ...prev, lng: isNaN(val) ? 0 : val }));
                        }}
                        className="w-full text-xs font-mono font-bold p-2 pl-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                        placeholder="e.g. 83.4022"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] font-mono font-bold text-slate-400">°E</span>
                    </div>
                  </div>
                </div>

                {/* Status feedback banner */}
                {gpsFeedback && (
                  <div
                    className={`text-[11px] p-2.5 rounded-xl flex items-start gap-2 animate-in fade-in duration-200 ${
                      gpsFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : gpsFeedback.type === 'loading'
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {gpsFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : gpsFeedback.type === 'loading' ? (
                      <Loader2 className="w-4 h-4 text-blue-600 shrink-0 animate-spin mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 leading-snug">
                      <span>{gpsFeedback.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGpsFeedback(null)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Pure SATELLITE Mini-Map with Click-to-Pin (Esri World Imagery + English Reference Labels) */}
                {showMiniMap && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-600 px-0.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>🛰️ High-Resolution Satellite Map: Click or drag pin anywhere to set exact site</span>
                      </span>
                      <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        [{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}]
                      </span>
                    </div>
                    <div
                      ref={mapContainerRef}
                      className="h-48 sm:h-56 w-full rounded-2xl border border-slate-300 overflow-hidden relative shadow-inner z-0"
                      style={{ minHeight: '190px' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. Photo Proof of Hazard & Waste Type Selection (Major Cause) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-rose-600" />
                  <span>3. Photo Evidence & Waste Type Identification</span>
                </span>
                <label className="text-[11px] font-bold text-white bg-[#0077B6] hover:bg-[#03045E] px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Hazard Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Mandatory Prompt Banner when photo is uploaded or selected */}
              {showWastePrompt && (
                <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <h5 className="font-extrabold text-amber-950">
                      Photo Uploaded! Please Select Major Waste Cause Below
                    </h5>
                    <p className="text-[11px] text-amber-900 leading-snug">
                      To help the District Nodal Officer dispatch the correct remediation team, select the primary cause of contamination shown in your photo from the dropdown below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWastePrompt(false)}
                    className="text-amber-700 hover:text-amber-950 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Photo Preview Card */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 shadow-inner">
                <img src={photoUrl} alt="Complaint Evidence" className="w-full h-full object-cover" />
                <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-md border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>GEOTAGGED EVIDENCE</span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[11px] font-bold px-3 py-1 rounded-lg border border-amber-400/30 shadow-sm">
                  {wasteType}
                </div>
              </div>

              {/* Quick sample photo selector with auto-category sync */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Or select a sample photo for testing (auto-syncs waste type):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {sampleProofPhotos.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSamplePhoto(s)}
                      className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                        photoUrl === s.url
                          ? 'bg-[#03045E] text-white border-[#03045E] shadow-xs'
                          : 'bg-white hover:bg-blue-50 hover:text-[#0077B6] text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Major Waste Cause Dropdown (Mandatory user selection as requested) */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>What type of waste / problem is this? (Major Cause)</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Mandatory Selection
                  </span>
                </div>

                <div className="relative">
                  <select
                    ref={wasteDropdownRef}
                    required
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    className="w-full text-xs p-3 pr-8 border-2 border-[#0077B6]/40 hover:border-[#0077B6] rounded-xl font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs cursor-pointer transition-colors"
                  >
                    {HAZARD_WASTE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.label} className="font-semibold text-slate-800 py-1.5">
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Detailed Explanation of Selected Hazard Category */}
                {(() => {
                  const selectedCat = HAZARD_WASTE_CATEGORIES.find((c) => c.label === wasteType);
                  return selectedCat ? (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-950 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-extrabold text-[#0077B6]">
                        <span className="text-base">{selectedCat.icon}</span>
                        <span>{selectedCat.label}</span>
                      </div>
                      <p className="text-slate-700 leading-snug">
                        <strong>Primary Cause:</strong> {selectedCat.cause}
                      </p>
                      <p className="text-[#03045E] font-semibold leading-snug">
                        <strong>Action Protocol:</strong> {selectedCat.remedy}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* 4. Short Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                4. Problem Description & Critical Observations
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the issue in detail: e.g. textile dye dumping into canal, broken weir wall, single-use plastic clogging drinking water tank..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-500 bg-white leading-relaxed"
              />
            </div>

            {/* Submission Dispatch Info */}
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-[11px] text-sky-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>
                  This complaint will be officially dispatched to the <strong>District Nodal Officer ({getNodalOfficer(district)})</strong>.
                  Upon submission, your complaint marker will appear exclusively on your private map view.
                </span>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Complaint & Get Tracking ID</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
