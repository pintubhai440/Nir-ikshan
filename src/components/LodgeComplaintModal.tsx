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
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LodgeComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted: (complaint: CitizenComplaint) => void;
  currentUser?: { name: string; phone: string } | null;
}

export const LodgeComplaintModal: React.FC<LodgeComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintSubmitted,
  currentUser,
}) => {
  const { t, language } = useLanguage();
  const [citizenName, setCitizenName] = useState(currentUser?.name || '');
  const [citizenAge, setCitizenAge] = useState<number | ''>('');
  const [citizenGender, setCitizenGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || '');

  // Keep synced with currentUser if logged in
  useEffect(() => {
    if (isOpen && currentUser) {
      if (!citizenName && currentUser.name) setCitizenName(currentUser.name);
      if (!citizenPhone && currentUser.phone) setCitizenPhone(currentUser.phone);
    }
  }, [isOpen, currentUser]);

  const [district, setDistrict] = useState<string>('Vizianagaram');
  const [mandal, setMandal] = useState('');
  const [locationLandmark, setLocationLandmark] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop');
  
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

  // Initialize or re-center interactive mini-map with ONLY Street Map
  useEffect(() => {
    if (!isOpen) {
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
          zoom: 12,
          zoomControl: true,
          attributionControl: false,
        });

        // 100% Reliable, Free, High-Quality Street Map (Esri World Street Map - No API key required!)
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Streets',
          }
        ).addTo(map);

        const customHazardIcon = L.divIcon({
          html: `
            <div style="
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <div style="
                position: absolute;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.45);
                animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #dc2626;
                border: 2px solid #ffffff;
                color: #ffffff;
                font-size: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 8px rgba(0,0,0,0.6);
                font-weight: bold;
              ">⚠️</div>
            </div>
          `,
          className: 'hazard-pin-marker',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([coordinates.lat, coordinates.lng], {
          icon: customHazardIcon,
          draggable: true,
        }).addTo(map);

        marker.bindTooltip(
          language === 'hi' 
            ? '📍 खींचें या स्ट्रीट मैप पर कहीं भी क्लिक करें' 
            : language === 'te' 
            ? '📍 స్ట్రీట్ మ్యాప్‌పై పిన్ చేయండి' 
            : '📍 Drag pin or click anywhere on street map',
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
            message: language === 'hi' 
              ? `स्ट्रीट मैप पर पिन सेट किया गया: ${newLat}° N, ${newLng}° E` 
              : language === 'te'
              ? `స్ట్రీట్ మ్యాప్‌పై పిన్ సెట్ చేయబడింది: ${newLat}° N, ${newLng}° E`
              : `Point pinned on street map: ${newLat}° N, ${newLng}° E`,
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
            message: language === 'hi' 
              ? `नक्शे से चुना गया स्थान: ${newLat}° N, ${newLng}° E` 
              : language === 'te'
              ? `మ్యాప్‌లో ఎంచుకున్న స్థానం: ${newLat}° N, ${newLng}° E`
              : `Location selected on street map: ${newLat}° N, ${newLng}° E`,
          });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Force a resize after tile load
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } catch (err) {
        console.error('Mini map initialization error:', err);
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
  }, [isOpen, showMiniMap, language]);

  // Sync marker position and map center when coordinates change
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
        message: language === 'hi' 
          ? `${found.name} जिला केंद्र के निर्देशांक लागू किए गए (${newCoord.lat}° N, ${newCoord.lng}° E)` 
          : language === 'te'
          ? `${found.name} జిల్లా కేంద్రం కోఆర్డినేట్స్ వర్తింపజేయబడ్డాయి (${newCoord.lat}° N, ${newCoord.lng}° E)`
          : `Applied ${found.name} district center coordinates (${newCoord.lat}° N, ${newCoord.lng}° E)`,
      });

      // Fly map smoothly to newly selected district center
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
      message: language === 'hi'
        ? `${district} जिला केंद्र पर रीसेट किया गया (${defaultCoord.lat}° N, ${defaultCoord.lng}° E)`
        : language === 'te'
        ? `${district} జిల్లా కేంద్రానికి రీసెట్ చేయబడింది (${defaultCoord.lat}° N, ${defaultCoord.lng}° E)`
        : `Reset to ${district} center coordinates (${defaultCoord.lat}° N, ${defaultCoord.lng}° E)`,
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([defaultCoord.lat, defaultCoord.lng], 12, { duration: 1 });
    }
  };

  // GPS Auto-Fetch: Live Device GPS or clean District fallback (No random external IP)
  const handleFetchCurrentGps = () => {
    setIsFetchingLocation(true);
    setGpsFeedback({
      type: 'loading',
      message: language === 'hi' 
        ? 'लाइव जीपीएस सिग्नल खोज रहे हैं...' 
        : language === 'te'
        ? 'లైవ్ GPS సంకేతాలను శోధిస్తోంది...'
        : 'Detecting live GPS signal from device...',
    });

    const tryBrowserGeolocation = (highAccuracy: boolean) => {
      if (!('geolocation' in navigator)) {
        fallbackToDistrict('Geolocation not supported in browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          const acc = Math.round(pos.coords.accuracy || 15);
          setCoordinates({ lat, lng });
          setIsFetchingLocation(false);
          setGpsFeedback({
            type: 'success',
            message: language === 'hi'
              ? `🟢 लाइव जीपीएस प्राप्त हुआ: ${lat}° N, ${lng}° E (सटीकता: ±${acc}m)`
              : language === 'te'
              ? `🟢 లైవ్ GPS కనుగొనబడింది: ${lat}° N, ${lng}° E (ఖచ్చితత్వం: ±${acc}m)`
              : `🟢 Live GPS Locked: ${lat}° N, ${lng}° E (Accuracy: ±${acc}m)`,
          });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
          }
        },
        (err) => {
          if (highAccuracy) {
            // High accuracy timed out, retry with standard cellular/wifi
            tryBrowserGeolocation(false);
          } else {
            fallbackToDistrict(err.message);
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 5000 : 7000,
          maximumAge: 30000,
        }
      );
    };

    const fallbackToDistrict = (reason?: string) => {
      // Fallback directly to chosen District center coordinates
      const currentDistObj = ANDHRA_PRADESH_26_DISTRICTS.find(
        (d) => d.name.toLowerCase() === district.toLowerCase()
      );
      const defaultCoord = currentDistObj?.centerCoords || { lat: 18.1124, lng: 83.4022 };
      setCoordinates(defaultCoord);
      setIsFetchingLocation(false);
      setGpsFeedback({
        type: 'info',
        message: language === 'hi'
          ? `⚠️ डिवाइस जीपीएस अनुपलब्ध। ${district} जिला केंद्र निर्देशांक लागू किए गए। आप मान टाइप कर सकते हैं या नक्शे पर क्लिक कर सकते हैं।`
          : language === 'te'
          ? `⚠️ పరికర GPS అందుబాటులో లేదు. ${district} జిల్లా కేంద్రం కోఆర్డినేట్స్ వర్తింపజేయబడ్డాయి.`
          : `⚠️ Browser GPS unavailable (${reason || 'permission blocked'}). Applied ${district} district coordinates. You can edit Lat/Lng directly or click on the map to pin.`,
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([defaultCoord.lat, defaultCoord.lng], 12, { duration: 1 });
      }
    };

    tryBrowserGeolocation(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleProofPhotos = [
    { label: language === 'hi' ? 'प्लास्टिक कचरा' : language === 'te' ? 'ప్లాస్టిక్ వ్యర్థాలు' : 'Plastic Waste Inflow', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop' },
    { label: language === 'hi' ? 'रासायनिक प्रदूषण' : language === 'te' ? 'రసాయన కాలుష్యం' : 'Industrial Chemical Dumping', url: 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&auto=format&fit=crop' },
    { label: language === 'hi' ? 'टूटा बांध / गेट' : language === 'te' ? 'విరిగిన ఆనకట్ట' : 'Broken Sluice Gate / Canal', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop' },
    { label: language === 'hi' ? 'सूखा तालाब' : language === 'te' ? 'ఎండిన జలాశయం' : 'Dry Tank Encroachment', url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop' },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newId = `CMP-AP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newComplaint: CitizenComplaint = {
      id: newId,
      citizenName: citizenName.trim(),
      citizenAge: Number(citizenAge) || 30,
      citizenGender,
      citizenPhone: citizenPhone.trim(),
      district,
      mandal: mandal.trim() || 'Headquarters Mandal',
      village: locationLandmark.trim() || 'Main Village',
      locationLandmark: locationLandmark.trim(),
      coordinates: {
        lat: Number(coordinates.lat) || 18.1124,
        lng: Number(coordinates.lng) || 83.4022,
      },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] p-4 sm:p-5 flex items-start justify-between text-white shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-500 text-white">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-sky-200 uppercase font-bold">
                {language === 'hi' ? 'नीर-ईक्षण नागरिक जल शिकायत' : language === 'te' ? 'నీర్-ఈక్షణ్ పౌర సమస్య నివేదిక' : 'NIR-IKSHAN CITIZEN WATER COMPLAINT'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {language === 'hi' ? 'जल संकट / प्रदूषण शिकायत दर्ज करें' : language === 'te' ? 'నీటి కాలుష్య లేదా సంక్షోభ ఫిర్యాదు చేయండి' : 'Lodge Water Body Hazard Complaint'}
            </h2>
            <p className="text-[11px] sm:text-xs text-sky-200">
              {language === 'hi' ? 'विषाक्त अपशिष्ट, नाले में रुकावट या सूखे कुओं की रिपोर्ट सीधे अपने जिला नोडल अधिकारी को भेजें।' : language === 'te' ? 'వ్యర్థాలు, మురుగు అడ్డంకులు లేదా ఎండిపోయిన బావుల గురించి నేరుగా జిల్లా నోడల్ అధికారికి తెలియజేయండి.' : 'Report toxic waste, chokes, dry collapsed wells or dam breaches directly to your District Nodal Officer.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={language === 'hi' ? 'बंद करें' : language === 'te' ? 'మూసివేయి' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* User Basic Info Row */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0047ab]" />
              <span>{language === 'hi' ? '1. नागरिक का विवरण' : language === 'te' ? '1. పౌరుడి వివరాలు' : '1. Citizen Details'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'पूरा नाम' : language === 'te' ? 'పూర్తి పేరు' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'जैसे रमेश नायडू' : language === 'te' ? 'ఉదా: రమేష్ నాయుడు' : 'e.g. Ramesh Naidu'}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'मोबाइल नंबर (ट्रैकिंग हेतु)' : language === 'te' ? 'మొబైల్ సంఖ్య (ట్రాకింగ్ కొరకు)' : 'Mobile Number (for tracking)'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="98480 12345"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'आयु' : language === 'te' ? 'వయస్సు' : 'Age'}
                </label>
                <input
                  type="number"
                  required
                  min={14}
                  max={100}
                  placeholder="35"
                  value={citizenAge}
                  onChange={(e) => setCitizenAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'लिंग' : language === 'te' ? 'లింగం' : 'Gender'}
                </label>
                <select
                  value={citizenGender}
                  onChange={(e) => setCitizenGender(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-semibold bg-white cursor-pointer"
                >
                  <option value="Male">{language === 'hi' ? 'पुरुष' : language === 'te' ? 'పురుషుడు' : 'Male'}</option>
                  <option value="Female">{language === 'hi' ? 'महिला' : language === 'te' ? 'మహిళ' : 'Female'}</option>
                  <option value="Other">{language === 'hi' ? 'अन्य' : language === 'te' ? 'ఇతర' : 'Other'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* District & Location */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0047ab]" />
              <span>{language === 'hi' ? '2. जिला एवं भौगोलिक स्थान' : language === 'te' ? '2. जिल्हा మరియు భౌగోళిక స్థానం' : '2. District & Geographic Location'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'जिला' : language === 'te' ? 'జిల్లా' : 'District'}
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-semibold focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <optgroup label={language === 'hi' ? 'आंध्र प्रदेश के जिले' : language === 'te' ? 'ఆంధ్రప్రదేశ్ జిల్లాలు' : 'Andhra Pradesh Districts'}>
                    {ANDHRA_PRADESH_26_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {language === 'te' && d.teluguName ? `${d.name} (${d.teluguName})` : d.name}
                      </option>
                    ))}
                  </optgroup>
                  <option value="Other">{language === 'hi' ? 'अन्य / आंध्र प्रदेश से बाहर' : language === 'te' ? 'ఇతర / ఏపీ వెలుపల' : 'Other / Outside AP'}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'मंडल' : language === 'te' ? 'మండలం' : 'Mandal'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nellimarla / Salur / Gantyada"
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {language === 'hi' ? 'ग्राम एवं पहचान स्थल' : language === 'te' ? 'గ్రామం మరియు సమీప ల్యాండ్‌మార్క్' : 'Village & Landmark'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'hi' ? 'जैसे चंपावती नदी पुल के पास' : language === 'te' ? 'ఉదా: చంపావతి నది వంతెన సమీపంలో' : 'e.g. Near Champavathi River Bridge'}
                value={locationLandmark}
                onChange={(e) => setLocationLandmark(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* GPS Coordinates & Interactive Street Map Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'hi' ? 'जीपीएस निर्देशांक' : language === 'te' ? 'GPS కోఆర్డినేట్స్' : 'GPS Coordinates (Lat / Lng)'}</span>
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {language === 'hi' 
                      ? 'ऑटो-फेच करें, मान टाइप करें या नीचे स्ट्रीट मैप पर क्लिक करके सटीक स्थान पिन करें।' 
                      : language === 'te'
                      ? 'ఆటో-ఫెచ్ చేయండి లేదా నేరుగా స్ట్రీట్ మ్యాప్‌పై క్లిక్ చేసి పిన్ చేయండి.'
                      : 'Auto-fetch, type coordinates directly, or click/drag anywhere on the street map to pin.'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Auto-Fetch GPS Button */}
                  <button
                    type="button"
                    onClick={handleFetchCurrentGps}
                    disabled={isFetchingLocation}
                    className="px-2.5 py-1.5 bg-[#0047ab] hover:bg-blue-700 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isFetchingLocation ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Crosshair className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isFetchingLocation
                        ? (language === 'hi' ? 'खोज रहे हैं...' : language === 'te' ? 'శోధిస్తోంది...' : 'Detecting GPS...')
                        : (language === 'hi' ? 'मेरा GPS स्थान प्राप्त करें' : language === 'te' ? 'నా GPS లొకేషన్ తీసుకోండి' : 'Auto-Fetch My GPS Location')}
                    </span>
                  </button>

                  {/* Reset to district center */}
                  <button
                    type="button"
                    onClick={handleResetToDistrictCenter}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title={language === 'hi' ? 'चुने गए जिले के केंद्र पर रीसेट करें' : 'Reset coordinates to selected district center'}
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>{language === 'hi' ? 'जिला केंद्र' : language === 'te' ? 'జిల్లా కేంద్రం' : 'District Center'}</span>
                  </button>

                  {/* Toggle Mini-Map Collapse */}
                  <button
                    type="button"
                    onClick={() => setShowMiniMap((prev) => !prev)}
                    className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0077B6] rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <MapIcon className="w-3 h-3" />
                    <span>{showMiniMap ? (language === 'hi' ? 'नक्शा छुपाएं' : language === 'te' ? 'మ్యాప్ దాచు' : 'Hide Map') : (language === 'hi' ? 'नक्शा दिखाएं' : language === 'te' ? 'మ్యాప్ చూపు' : 'Show Map')}</span>
                  </button>
                </div>
              </div>

              {/* Editable Latitude and Longitude input fields */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                    {language === 'hi' ? 'अक्षांश / Latitude (°N)' : language === 'te' ? 'అక్షాంశం (°N)' : 'Latitude (°N)'}
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
                      className="w-full text-xs font-mono font-bold p-2 pl-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                      placeholder="e.g. 18.1124"
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-mono font-bold text-slate-400">°N</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                    {language === 'hi' ? 'देशांतर / Longitude (°E)' : language === 'te' ? 'రేఖాంశం (°E)' : 'Longitude (°E)'}
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
                      className="w-full text-xs font-mono font-bold p-2 pl-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                      placeholder="e.g. 83.4022"
                    />
                    <span className="absolute right-2 top-2 text-[10px] font-mono font-bold text-slate-400">°E</span>
                  </div>
                </div>
              </div>

              {/* Status feedback banner */}
              {gpsFeedback && (
                <div
                  className={`text-[11px] p-2 rounded-lg flex items-start gap-2 animate-in fade-in duration-200 ${
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
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Interactive Street Mini-Map with Click-to-Pin (ONLY Streets, No API Key Error!) */}
              {showMiniMap && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-600 px-0.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>
                        {language === 'hi' 
                          ? '🗺️ स्ट्रीट मैप: सटीक स्थान हेतु नक्शे पर कहीं भी क्लिक करें या पिन खींचें' 
                          : language === 'te'
                          ? '🗺️ స్ట్రీట్ మ్యాప్: ఖచ్చితమైన ప్రదేశం కోసం మ్యాప్‌పై క్లిక్ చేయండి'
                          : '🗺️ Street Map: Click or drag pin anywhere on map to set exact site'}
                      </span>
                    </span>
                    <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      [{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}]
                    </span>
                  </div>
                  <div
                    ref={mapContainerRef}
                    className="h-48 sm:h-56 w-full rounded-xl border border-slate-300 overflow-hidden relative shadow-inner z-0"
                    style={{ minHeight: '190px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {language === 'hi' ? 'समस्या का संक्षिप्त विवरण' : language === 'te' ? 'సమస్య యొక్క సంక్షిప్త వివరణ' : 'Short Description of Problem'}
            </label>
            <textarea
              required
              rows={3}
              placeholder={language === 'hi' ? 'समस्या का वर्णन करें: जैसे नहर में रंगाई का कचरा, टूटा तटबंध या प्लास्टिक प्रदूषण...' : language === 'te' ? 'సమస్యను వివరించండి: కాల్వలో రసాయనాలు వేయడం, చెరువు కట్ట తెగిపోవడం లేదా చెత్త పేరుకుపోవడం...' : 'Describe the issue: e.g. textile dye dumping into canal, broken weir wall, plastic choking drinking water tank...'}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Screenshot / Photo Proof Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-rose-600" />
                <span>{language === 'hi' ? 'समस्या का फोटो प्रमाण' : language === 'te' ? 'సమస్య యొక్క ఫోటో సాక్ష్యం' : 'Photo Proof of Hazard'}</span>
              </label>
              <label className="text-[11px] font-bold text-[#0047ab] hover:underline cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>{language === 'hi' ? 'फोटो अपलोड करें' : language === 'te' ? 'ఫైల్ అప్‌లోడ్ చేయండి' : 'Upload File'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-100">
              <img src={photoUrl} alt="Complaint Evidence" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                GEOTAGGED EVIDENCE
              </div>
            </div>

            {/* Quick sample photo selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {language === 'hi' ? 'नमूना फोटो:' : language === 'te' ? 'నమూనా ఫోటోలు:' : 'Sample photos:'}
              </span>
              {sampleProofPhotos.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(s.url)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 whitespace-nowrap cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submission Dispatch Info */}
          <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-[11px] text-sky-950 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <span>
              {language === 'hi' 
                ? `यह शिकायत सीधे नोडल अधिकारी (${getNodalOfficer(district)}) को भेजी जाएगी, जो तुरंत जांच के लिए फील्ड इंस्पेक्टर नियुक्त करेंगे।`
                : language === 'te'
                ? `ఈ ఫిర్యాదు నేరుగా నోడల్ అధికారికి (${getNodalOfficer(district)}) సమర్పించబడుతుంది, వారు తక్షణమే తనిఖీకి ఫీల్డ్ ఇన్స్పెక్టర్‌ను పంపుతారు.`
                : `This complaint will be directly submitted to the Nodal Officer (${getNodalOfficer(district)}), who will immediately dispatch a Field Inspector to investigate.`}
            </span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : language === 'te' ? 'రద్దు చేయి' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'hi' ? 'शिकायत दर्ज करें और ट्रैकिंग आईडी पाएं' : language === 'te' ? 'ఫిర్యాదు సమర్పించి ట్రాకింగ్ ఐడీ పొందండి' : 'Submit Complaint & Get Tracking ID'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
