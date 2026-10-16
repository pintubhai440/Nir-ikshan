import React, { useState } from 'react';
import { CitizenComplaint } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Upload, 
  X, 
  Send, 
  User, 
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LodgeComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted: (complaint: CitizenComplaint) => void;
}

export const LodgeComplaintModal: React.FC<LodgeComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintSubmitted,
}) => {
  const { t, language } = useLanguage();
  const [citizenName, setCitizenName] = useState('');
  const [citizenAge, setCitizenAge] = useState<number | ''>('');
  const [citizenGender, setCitizenGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [district, setDistrict] = useState<'Vizianagaram' | 'Parvathipuram Manyam' | 'Visakhapatnam'>('Vizianagaram');
  const [mandal, setMandal] = useState('');
  const [locationLandmark, setLocationLandmark] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 18.1067,
    lng: 83.3956,
  });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  if (!isOpen) return null;

  const handleFetchCurrentGps = () => {
    setIsFetchingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
          });
          setIsFetchingLocation(false);
        },
        () => {
          if (district === 'Vizianagaram') {
            setCoordinates({ lat: 18.1124, lng: 83.4022 });
          } else if (district === 'Parvathipuram Manyam') {
            setCoordinates({ lat: 18.7758, lng: 83.4241 });
          } else {
            setCoordinates({ lat: 17.6868, lng: 83.2185 });
          }
          setIsFetchingLocation(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsFetchingLocation(false);
    }
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
      coordinates,
      shortDescription: shortDescription.trim(),
      photoUrl,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'SUBMITTED',
      assignedNodalOfficer: 
        district === 'Vizianagaram' ? 'Dr. B. K. Rao (IAS), Vizianagaram' :
        district === 'Parvathipuram Manyam' ? 'Smt. S. Lakshmi (IAS), Parvathipuram' :
        'Sri K. Venkat (IAS), Visakhapatnam',
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
                  {language === 'hi' ? 'मोबाइल नंबर' : language === 'te' ? 'మొబైల్ నంబర్' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="98480 12345"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
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
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
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
              <span>{language === 'hi' ? '2. जिला एवं भौगोलिक स्थान' : language === 'te' ? '2. జిల్లా మరియు భౌగోళిక స్థానం' : '2. District & Geographic Location'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'जिला' : language === 'te' ? 'జిల్లా' : 'District'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg font-semibold focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="Vizianagaram">Vizianagaram</option>
                  <option value="Parvathipuram Manyam">Parvathipuram Manyam</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
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

            {/* GPS Auto-Detect Button */}
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px]">
                <span className="font-semibold text-slate-600 block">
                  {language === 'hi' ? 'जीपीएस निर्देशांक:' : language === 'te' ? 'GPS కోఆర్డినేట్స్:' : 'GPS Coordinates:'}
                </span>
                <span className="font-mono text-slate-800 font-bold">
                  Lat: {coordinates.lat}° N, Lng: {coordinates.lng}° E
                </span>
              </div>
              <button
                type="button"
                onClick={handleFetchCurrentGps}
                disabled={isFetchingLocation}
                className="px-3 py-1.5 bg-[#0047ab] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isFetchingLocation 
                  ? (language === 'hi' ? 'जीपीएस प्राप्त कर रहे हैं...' : language === 'te' ? 'GPS లొకేషన్ తీసుకుంటోంది...' : 'Fetching GPS...') 
                  : (language === 'hi' ? 'मेरा जीपीएस स्थान प्राप्त करें' : language === 'te' ? 'నా GPS లొకేషన్ తీసుకోండి' : 'Auto-Fetch My GPS Location')}</span>
              </button>
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
                ? `यह शिकायत सीधे नोडल अधिकारी (${district}) को भेजी जाएगी, जो तुरंत जांच के लिए फील्ड इंस्पेक्टर नियुक्त करेंगे।`
                : language === 'te'
                ? `ఈ ఫిర్యాదు నేరుగా నోడల్ అధికారికి (${district}) సమర్పించబడుతుంది, వారు తక్షణమే తనిఖీకి ఫీల్డ్ ఇన్స్పెక్టర్‌ను పంపుతారు.`
                : `This complaint will be directly submitted to the Nodal Officer (${district}), who will immediately dispatch a Field Inspector to investigate.`}
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
