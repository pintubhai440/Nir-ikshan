import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CitizenComplaint } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Landmark, 
  MapPin, 
  Clock, 
  Pause, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Check, 
  ArrowUpRight,
  PlusCircle,
  FileText,
  AlertCircle,
  Wrench,
  ShieldAlert
} from 'lucide-react';

export interface GovtScheme {
  id: string;
  name: string;
  hindiName: string;
  teluguName: string;
  nodalMinistry: string;
  portalUrl: string;
  category: 'Drinking Water' | 'Groundwater' | 'Irrigation' | 'Rejuvenation' | 'State AP Mission';
  description: string;
  hindiDescription: string;
  teluguDescription: string;
  keyMetric: string;
  keyMetricLabel: string;
  coverageArea: string;
  launchYear: number;
  helpline?: string;
  highlightPoints: string[];
  logoIcon: string;
}

// 100% REAL OFFICIAL GOVERNMENT SCHEMES & MISSIONS (Zero Synthetic/Mock URLs)
export const OFFICIAL_GOVT_WATER_SCHEMES: GovtScheme[] = [
  {
    id: 'scheme-jjm',
    name: 'Jal Jeevan Mission (Har Ghar Jal)',
    hindiName: 'जल जीवन मिशन (हर घर जल)',
    teluguName: 'జల్ జీవన్ మిషన్ (హర్ ఘర్ జల్)',
    nodalMinistry: 'Dept of Drinking Water & Sanitation, Ministry of Jal Shakti',
    portalUrl: 'https://jaljeevanmission.gov.in/',
    category: 'Drinking Water',
    description: 'National mission ensuring functional household tap connection (FHTC) providing 55 LPCD safe drinking water to every rural home.',
    hindiDescription: 'भारत के प्रत्येक ग्रामीण परिवार को 55 लीटर प्रति व्यक्ति प्रतिदिन सुरक्षित पेयजल उपलब्ध कराने हेतु राष्ट्रीय मिशन।',
    teluguDescription: 'భారతదేశంలోని ప్రతి గ్రామీణ గృహానికి రోజుకు తలసరి 55 లీటర్ల సురక్షిత తాగునీటి కుళాయి కనెక్షన్ అందించే జాతీయ పథకం.',
    keyMetric: '15.2+ Cr',
    keyMetricLabel: 'Rural Tap Connections',
    coverageArea: 'All 28 States & UTs',
    launchYear: 2019,
    helpline: '1800-180-1551',
    highlightPoints: [
      'Field Testing Kits (FTK) distributed to women in every village for local water testing',
      'Village Water & Sanitation Committee (VWSC) community monitoring',
      'Solar-powered piped water supply schemes in remote tribal settlements'
    ],
    logoIcon: '🚰',
  },
  {
    id: 'scheme-abhy',
    name: 'Atal Bhujal Yojana (Atal Jal)',
    hindiName: 'अटल भूजल योजना (अटल जल)',
    teluguName: 'అటల్ భూజల్ యోజన',
    nodalMinistry: 'Central Ground Water Board (CGWB) & Ministry of Jal Shakti',
    portalUrl: 'https://ataljal.mowr.gov.in/',
    category: 'Groundwater',
    description: 'World Bank-supported community-led groundwater management scheme focused on behavioral change and aquifer recharge in stressed units.',
    hindiDescription: 'भूजल संकटग्रस्त क्षेत्रों में सामुदायिक भागीदारी, भूजल मानचित्रण और जल बजटिंग के माध्यम से सतत जल प्रबंधन।',
    teluguDescription: 'భూగర్భ జలాల కొరత ఉన్న ప్రాంతాలలో సమాజ భాగస్వామ్యం మరియు రీఛార్జ్ పద్ధతుల ప్రోత్సాహం.',
    keyMetric: '8,220',
    keyMetricLabel: 'Panchayats Active',
    coverageArea: '7 Water-Stressed States',
    launchYear: 2020,
    helpline: '011-23383562',
    highlightPoints: [
      'Incentive-based payouts to states for demand-side water conservation',
      'Digital Water Level Recorders (DWLR) installed for automated monitoring',
      'Farmers trained in micro-irrigation and crop water budgeting'
    ],
    logoIcon: '💧',
  },
  {
    id: 'scheme-pmksy',
    name: 'PM Krishi Sinchayee Yojana (PMKSY)',
    hindiName: 'प्रधानमंत्री कृषि सिंचाई योजना',
    teluguName: 'ప్రధాన మంత్రి కృషి సించాయి యోజన',
    nodalMinistry: 'Ministry of Jal Shakti & Dept of Agriculture',
    portalUrl: 'https://pmksy.gov.in/',
    category: 'Irrigation',
    description: '"Har Khet Ko Pani" and "Per Drop More Crop" through precision micro-irrigation, check dams, and watershed development.',
    hindiDescription: '"हर खेत को पानी" और "पर ड्रॉप मोर क्रॉप" के तहत सूक्ष्म सिंचाई और वाटरशेड विकास योजना।',
    teluguDescription: '"హర్ ఖేత్ కో పానీ" మరియు "పర్ డ్రాప్ మోర్ క్రాప్" ద్వారా సాగునీటి విస్తరణ.',
    keyMetric: '88.5+ L Ha',
    keyMetricLabel: 'Micro-Irrigation Coverage',
    coverageArea: 'All Agricultural Districts',
    launchYear: 2015,
    helpline: '1800-180-1551',
    highlightPoints: [
      'Up to 55% subsidy for small & marginal farmers on drip & sprinkler irrigation',
      'Accelerated Irrigation Benefits Programme (AIBP) for fast-tracking canals',
      'Renovation and desiltation of traditional minor irrigation tanks'
    ],
    logoIcon: '🌾',
  },
  {
    id: 'scheme-amrit-sarovar',
    name: 'Mission Amrit Sarovar',
    hindiName: 'मिशन अमृत सरोवर',
    teluguName: 'మిషన్ అమృత్ సరోవర్',
    nodalMinistry: 'Ministry of Rural Development & Ministry of Panchayati Raj',
    portalUrl: 'https://amritsarovar.gov.in/',
    category: 'Rejuvenation',
    description: 'National mission developing and rejuvenating at least 75 Amrit Sarovars (water bodies) in each district with a minimum pond area of 1 acre.',
    hindiDescription: 'प्रत्येक जिले में कम से कम 75 अमृत सरोवरों (तालाबों) का कायाकल्प कर भूजल स्तर बढ़ाने की पहल।',
    teluguDescription: 'ప్రతి జిల్లాలో కనీసం 75 చెరువులను పునరుద్ధరించి భూగర్భ జలాలను పెంచే కార్యక్రమం.',
    keyMetric: '68,000+',
    keyMetricLabel: 'Ponds Rejuvenated',
    coverageArea: '750+ Districts Across India',
    launchYear: 2022,
    helpline: '011-23382230',
    highlightPoints: [
      'ISRO Bhuvan satellite GIS geo-tagging for every Amrit Sarovar site',
      'Dense native tree plantation along bunds to prevent bank erosion',
      'Community stewardship through Gram Sabhas and water user groups'
    ],
    logoIcon: '🏞️',
  },
  {
    id: 'scheme-ysr-jalakala',
    name: 'YSR Jalakala (Andhra Pradesh)',
    hindiName: 'वाईएसआर जलकला (आंध्र प्रदेश)',
    teluguName: 'వైఎస్సార్ జలకళ (ఆంధ్రప్రదేశ్)',
    nodalMinistry: 'Panchayat Raj & Rural Development, Govt of Andhra Pradesh',
    portalUrl: 'https://ysrjalakala.ap.gov.in/',
    category: 'State AP Mission',
    description: 'Andhra Pradesh flagship state scheme providing free borewell drilling, hydrogeological surveys, and rainwater recharge pits to farmers.',
    hindiDescription: 'आंध्र प्रदेश के छोटे व सीमांत किसानों को मुफ्त बोरवेल ड्रिलिंग, भूजल सर्वेक्षण और रीचार्ज पिट।',
    teluguDescription: 'ఆంధ్రప్రదేశ్ రైతులకు ఉచిత బోర్‌వెల్ డ్రిల్లింగ్ మరియు రీఛార్జ్ పిట్‌లను అందించే రాష్ట్ర పథకం.',
    keyMetric: '2.1+ Lakh',
    keyMetricLabel: 'Free Borewells Surveyed',
    coverageArea: 'All 26 AP Districts',
    launchYear: 2020,
    helpline: '1902 (AP Spandana Toll Free)',
    highlightPoints: [
      'Geophysical survey conducted by Groundwater Dept scientists before drilling',
      'Mandatory recharge percolation pit constructed adjacent to every borewell',
      'Subsidized solar pump sets in remote upland mandals'
    ],
    logoIcon: '🚜',
  },
  {
    id: 'scheme-india-wris',
    name: 'India-WRIS / National Water Grid',
    hindiName: 'इंडिया-वारिस राष्ट्रीय जल ग्रिड',
    teluguName: 'ఇండియా-వారిస్ జాతీయ జల సమాచార కేంద్రం',
    nodalMinistry: 'National Water Informatics Centre (NWIC), Ministry of Jal Shakti',
    portalUrl: 'https://indiawris.gov.in/',
    category: 'Groundwater',
    description: 'Apex digital platform providing single-window real-time telemetry for 150+ national reservoirs, river discharge stations, and DWLR aquifers.',
    hindiDescription: 'भारत के सभी जलाशयों, नदी गेज स्टेशनों और भूजल स्तरों का एकल-खिड़की रियल-टाइम जलवैज्ञानिक सर्विलांस पोर्टल।',
    teluguDescription: 'జలాశయాలు, నదీ ప్రవాహాలు మరియు భూగర్భ జల మట్టాల రియల్-టైమ్ సమాచార పోర్టల్.',
    keyMetric: '1,887+',
    keyMetricLabel: 'Live Telemetry Gauges',
    coverageArea: 'All Major River Basins',
    launchYear: 2010,
    helpline: '011-20863004',
    highlightPoints: [
      'Daily Reservoir Storage Bulletins published at 08:30 AM IST',
      'Real-time data integration with CGWB, IMD, ISRO-NRSC, and State WRDs',
      'GIS shapefile downloads and API gateways for hydrological research'
    ],
    logoIcon: '🌐',
  }
];

interface CitizenRecentActionsAndSchemesProps {
  complaints: CitizenComplaint[];
  onSelectComplaint: (complaint: CitizenComplaint) => void;
  onOpenLodgeModal?: () => void;
}

export const CitizenRecentActionsAndSchemes: React.FC<CitizenRecentActionsAndSchemesProps> = ({
  complaints,
  onSelectComplaint,
  onOpenLodgeModal,
}) => {
  const { language } = useLanguage();

  const tr = (en: string, hi: string, te: string) => {
    if (language === 'hi') return hi;
    if (language === 'te') return te;
    return en;
  };

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIONS' | 'SCHEMES'>('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSchemeModal, setSelectedSchemeModal] = useState<GovtScheme | null>(null);

  // 100% REAL DYNAMIC COMPLAINTS: Sorted newest first. Zero fake/mock data!
  // As soon as anyone lodges a complaint, it appears here immediately!
  const realComplaintsList = useMemo(() => {
    return [...complaints].sort((a, b) => {
      const tA = new Date((a.submittedAt || '').replace(' ', 'T')).getTime() || 0;
      const tB = new Date((b.submittedAt || '').replace(' ', 'T')).getTime() || 0;
      return tB - tA;
    });
  }, [complaints]);

  type StreamItem = 
    | { type: 'COMPLAINT'; data: CitizenComplaint }
    | { type: 'SCHEME'; data: GovtScheme }
    | { type: 'PROMPT'; id: string };

  const streamItems: StreamItem[] = useMemo(() => {
    const complaintItems: StreamItem[] = realComplaintsList.map(c => ({ type: 'COMPLAINT', data: c }));
    const schemeItems: StreamItem[] = OFFICIAL_GOVT_WATER_SCHEMES.map(s => ({ type: 'SCHEME', data: s }));

    // If no complaints have been lodged yet in the database, insert an interactive "Lodge First Grievance" prompt card
    if (complaintItems.length === 0) {
      complaintItems.push({ type: 'PROMPT', id: 'prompt-first-complaint' });
    }

    if (activeTab === 'ACTIONS') return complaintItems;
    if (activeTab === 'SCHEMES') return schemeItems;

    // Interleave complaints and schemes evenly
    const combined: StreamItem[] = [];
    const maxLen = Math.max(complaintItems.length, schemeItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (complaintItems[i]) combined.push(complaintItems[i]);
      if (schemeItems[i]) combined.push(schemeItems[i]);
    }
    return combined;
  }, [realComplaintsList, activeTab]);

  // Ensure each track has at least 8 items so it easily spans the full viewport width
  const loopedItems = useMemo(() => {
    if (streamItems.length === 0) return [];
    let list = [...streamItems];
    while (list.length < 8) {
      list = [...list, ...streamItems];
    }
    return list;
  }, [streamItems]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);

  // Smooth continuous auto-gliding with infinite wrap & manual scroll responsiveness
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let animId: number;
    let isInteracting = false;
    let interactionTimeout: any = null;

    const tick = () => {
      if (
        !isPausedRef.current && 
        !isHoveredRef.current && 
        !isDraggingRef.current && 
        !isInteracting
      ) {
        const half = scroller.scrollWidth / 2;
        if (half > 0) {
          scroller.scrollLeft += 0.85; // smooth 60fps right-to-left glide
          if (scroller.scrollLeft >= half) {
            scroller.scrollLeft -= half;
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Keep infinite wrap seamless during manual mousewheel / trackpad / touch scroll
    const onScroll = () => {
      const half = scroller.scrollWidth / 2;
      if (half > 0) {
        if (scroller.scrollLeft >= half) {
          scroller.scrollLeft -= half;
        } else if (scroller.scrollLeft <= 0) {
          scroller.scrollLeft += half;
        }
      }
    };

    // Pause auto-glide briefly when user actively touches or uses mousewheel
    const onUserInteraction = () => {
      isInteracting = true;
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        isInteracting = false;
      }, 1500);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('wheel', onUserInteraction, { passive: true });
    scroller.addEventListener('touchstart', onUserInteraction, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(interactionTimeout);
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('wheel', onUserInteraction);
      scroller.removeEventListener('touchstart', onUserInteraction);
    };
  }, [loopedItems]);

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.pageX - scroller.offsetLeft;
    dragScrollLeftRef.current = scroller.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    e.preventDefault();
    const x = e.pageX - scroller.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.6;
    scroller.scrollLeft = dragScrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const scrollAmount = 320;
      scroller.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleOpenSchemePortal = (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#f0f7fb] to-[#e6f2fa] border border-sky-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xs space-y-3 sm:space-y-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200/25 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      {/* Header Strip - Compact & Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-sky-200/70 pb-3 relative z-10">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>{tr('Live Grievance Stream & Schemes', 'लाइव शिकायत प्रवाह एवं योजनाएं', 'లైవ్ ఫిర్యాదుల ప్రవాహం & పథకాలు')}</span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#03045E] tracking-tight flex items-center gap-1.5">
            <span>{tr('Recent Actions & Government Water Schemes', 'हाल की कार्रवाई व सरकारी जल योजनाएं', 'ఇటీవలి చర్యలు & ప్రభుత్వ జల పథకాలు')}</span>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug font-normal line-clamp-1">
            {tr(
              'Real-time status of citizen water complaints alongside official Government of India & AP Water Schemes.',
              'नागरिकों द्वारा दर्ज जल शिकायतों की रियल-टाइम स्थिति एवं भारत सरकार व आंध्र प्रदेश की आधिकारिक योजनाएं।',
              'పౌరుల నీటి ఫిర్యాదుల రియల్-టైమ్ స్థితి మరియు అధికారిక ప్రభుత్వ జల పథకాలు.'
            )}
          </p>
        </div>

        {/* Filter Tabs & Floating Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <div className="flex items-center bg-white p-0.5 rounded-xl border border-sky-200 shadow-2xs text-[11px]">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#03045E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#03045E]'
              }`}
            >
              {tr('⚡ All', '⚡ सभी', '⚡ అన్నీ')}
            </button>
            <button
              onClick={() => setActiveTab('ACTIONS')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'ACTIONS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{tr('Complaints', 'शिकायतें', 'ఫిర్యాదులు')}</span>
            </button>
            <button
              onClick={() => setActiveTab('SCHEMES')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'SCHEMES'
                  ? 'bg-[#0077B6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0077B6]'
              }`}
            >
              <Landmark className="w-3 h-3" />
              <span>{tr('Schemes', 'योजनाएं', 'పథకాలు')}</span>
            </button>
          </div>

          {/* Glide Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-sky-200 transition-colors shadow-2xs cursor-pointer"
            title={isPaused ? 'Resume floating animation' : 'Pause floating animation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Manual Scroll Arrows */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleManualScroll('left')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-sky-200 transition-colors shadow-2xs cursor-pointer"
              title="Glide left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleManualScroll('right')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-sky-200 transition-colors shadow-2xs cursor-pointer"
              title="Glide right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* THE SCROLLABLE & CONTINUOUSLY AUTO-GLIDING RIGHT-TO-LEFT CONTAINER */}
      <div 
        ref={scrollerRef}
        id="floating-marquee-scroller"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; handleMouseUp(); }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full overflow-x-auto no-scrollbar py-1 select-none flex gap-3 sm:gap-4 cursor-grab active:cursor-grabbing"
      >
        {/* Soft edge fade overlays */}
        <div className="pointer-events-none sticky left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-[#f0f7fb] to-transparent z-10 shrink-0" />

        {/* Set 1 */}
        <div className="flex shrink-0 gap-3 sm:gap-4">
          {loopedItems.map((item, idx) => (
            <CompactFlashcardItem
              key={`set1-${item.type}-${idx}`}
              item={item}
              onSelectComplaint={onSelectComplaint}
              onOpenLodgeModal={onOpenLodgeModal}
              onOpenSchemeModal={setSelectedSchemeModal}
              onOpenSchemePortal={handleOpenSchemePortal}
              language={language}
              tr={tr}
            />
          ))}
        </div>

        {/* Set 2 - Identical duplicate for seamless infinite loop */}
        <div aria-hidden="true" className="flex shrink-0 gap-3 sm:gap-4">
          {loopedItems.map((item, idx) => (
            <CompactFlashcardItem
              key={`set2-${item.type}-${idx}`}
              item={item}
              onSelectComplaint={onSelectComplaint}
              onOpenLodgeModal={onOpenLodgeModal}
              onOpenSchemeModal={setSelectedSchemeModal}
              onOpenSchemePortal={handleOpenSchemePortal}
              language={language}
              tr={tr}
            />
          ))}
        </div>

        <div className="pointer-events-none sticky right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-[#e6f2fa] to-transparent z-10 shrink-0" />
      </div>



      {/* Bottom Subtitle Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] sm:text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>
            {tr(
              'Hover over any card to pause. Dynamic live data: Any newly lodged complaint appears here in real-time.',
              'रोकने के लिए कार्ड पर माउस लाएं। लाइव डेटा: नई शिकायत दर्ज होते ही यहां तुरंत दिखेगी।',
              'ఆపడానికి కార్డ్‌పై మౌస్ ఉంచండి. లైవ్ డేటా: కొత్త ఫిర్యాదు నమోదు కాగానే ఇక్కడ కనిపిస్తుంది.'
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-emerald-700 font-bold">
            {realComplaintsList.length} {tr('Real Grievances', 'दर्ज शिकायतें', 'ఫిర్యాదులు')}
          </span>
          <span>•</span>
          <span className="text-[#0077B6] font-bold">
            {OFFICIAL_GOVT_WATER_SCHEMES.length} {tr('Govt Portals', 'सरकारी पोर्टल', 'పోర్టల్స్')}
          </span>
        </div>
      </div>

      {/* IN-APP SCHEME DETAIL MODAL */}
      {selectedSchemeModal && (
        <div 
          onClick={() => setSelectedSchemeModal(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-sky-200 space-y-3.5 p-4 sm:p-5"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                  {selectedSchemeModal.logoIcon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-[#0077B6] font-mono">
                      {selectedSchemeModal.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      Est. {selectedSchemeModal.launchYear}
                    </span>
                  </div>
                  <h4 className="font-black text-[#03045E] text-base sm:text-lg tracking-tight mt-0.5">
                    {language === 'hi' ? selectedSchemeModal.hindiName : language === 'te' ? selectedSchemeModal.teluguName : selectedSchemeModal.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedSchemeModal.nodalMinistry}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors shrink-0 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                {language === 'hi' ? selectedSchemeModal.hindiDescription : language === 'te' ? selectedSchemeModal.teluguDescription : selectedSchemeModal.description}
              </div>

              {/* Key Metrics Strip */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    {tr('Target / National Impact', 'राष्ट्रीय प्रभाव / लक्ष्य', 'జాతీయ ప్రభావం')}
                  </span>
                  <span className="text-base font-black text-[#03045E] font-mono block mt-0.5">
                    {selectedSchemeModal.keyMetric}
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium">
                    {selectedSchemeModal.keyMetricLabel}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    {tr('Coverage Area', 'कवरेज क्षेत्र', 'పరిధి')}
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 block mt-0.5">
                    {selectedSchemeModal.coverageArea}
                  </span>
                  {selectedSchemeModal.helpline && (
                    <span className="text-[10px] font-mono font-bold text-[#0077B6] mt-0.5 block">
                      📞 {selectedSchemeModal.helpline}
                    </span>
                  )}
                </div>
              </div>

              {/* Core Features */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-800 block">
                  {tr('Key Mandates & Citizen Entitlements:', 'प्रमुख विशेषताएं एवं नागरिक सुविधाएं:', 'ముఖ్యమైన ప్రయోజనాలు:')}
                </span>
                <ul className="space-y-1">
                  {selectedSchemeModal.highlightPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <span className="font-mono text-slate-400 truncate max-w-[200px]">
                {selectedSchemeModal.portalUrl.replace('https://', '')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSchemeModal(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {tr('Close', 'बंद करें', 'మూసివేయి')}
                </button>
                <button
                  onClick={() => handleOpenSchemePortal(selectedSchemeModal.portalUrl)}
                  className="px-3.5 py-1.5 bg-[#0077B6] hover:bg-[#03045E] text-white font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>{tr('Visit Portal', 'पोर्टल खोलें', 'పోర్టల్ తెరవండి')}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// COMPACT DYNAMIC FLASHCARD COMPONENT (FOR MOBILE & DESKTOP)
// =====================================================================
interface CompactFlashcardItemProps {
  item: 
    | { type: 'COMPLAINT'; data: CitizenComplaint }
    | { type: 'SCHEME'; data: GovtScheme }
    | { type: 'PROMPT'; id: string };
  onSelectComplaint: (complaint: CitizenComplaint) => void;
  onOpenLodgeModal?: () => void;
  onOpenSchemeModal: (scheme: GovtScheme) => void;
  onOpenSchemePortal: (url: string) => void;
  language: string;
  tr: (en: string, hi: string, te: string) => string;
}

const CompactFlashcardItem: React.FC<CompactFlashcardItemProps> = ({
  item,
  onSelectComplaint,
  onOpenLodgeModal,
  onOpenSchemeModal,
  onOpenSchemePortal,
  language,
  tr,
}) => {
  // -------------------------------------------------------------
  // CASE 1: REAL USER GRIEVANCE (DYNAMIC REAL DATA)
  // -------------------------------------------------------------
  if (item.type === 'COMPLAINT') {
    const c = item.data;
    const isResolved = c.status === 'RESOLVED';
    const isProofUploaded = Boolean(c.workExecution?.afterPhotoUrl || c.status === 'VERIFICATION_PENDING');
    const isWorkerActive = c.status === 'WORKER_IN_PROGRESS' || c.status === 'ACTION_ASSIGNED';
    const isInspectionDone = Boolean(c.inspectionReport || c.status === 'INSPECTION_COMPLETED');
    const isInspectorAssigned = c.status === 'INSPECTOR_ASSIGNED';

    // Dynamic Status Badge & Colors based on real progress
    const statusMeta = isResolved
      ? { label: tr('100% Resolved & Verified', '१००% समाधान एवं सत्यापित', '100% పరిష్కారం & ధృవీకరణ'), color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 }
      : isProofUploaded
      ? { label: tr('Proof Uploaded • Re-Verifying', 'सफाई फोटो अपलोड • पुनः सत्यापन', 'ఫోటో అప్‌లోడ్ అయింది'), color: 'bg-teal-100 text-teal-800 border-teal-300', icon: ShieldAlert }
      : isWorkerActive
      ? { label: tr('Remediation Squad on Field', 'सफाई कार्य दल मौके पर', 'సహాయక బృందం ఫీల్డ్‌లో ఉంది'), color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Wrench }
      : isInspectionDone
      ? { label: tr('Site Surveyed by Inspector', 'इंस्पेक्टर द्वारा स्थल जांच पूर्ण', 'సైట్ తనిఖీ పూర్తయింది'), color: 'bg-purple-100 text-purple-800 border-purple-300', icon: FileText }
      : isInspectorAssigned
      ? { label: tr('Inspector Dispatched (24h SLA)', 'इंस्पेक्टर मौके पर रवाना', 'ఇన్స్పెక్టర్ బయలుదేరారు'), color: 'bg-sky-100 text-[#0077B6] border-sky-300', icon: Clock }
      : { label: tr('Newly Lodged • In Triage', 'नई शिकायत दर्ज • समीक्षा जारी', 'కొత్త ఫిర్యాదు • పరిశీలనలో'), color: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertCircle };

    const StatusIcon = statusMeta.icon;
    const photo = c.workExecution?.afterPhotoUrl || c.inspectionReport?.sitePhotoUrl || c.photoUrl;

    return (
      <div className="w-[275px] sm:w-[305px] md:w-[325px] bg-white rounded-xl sm:rounded-2xl border border-sky-200 hover:border-emerald-500 p-3 sm:p-3.5 space-y-2 shrink-0 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group flex flex-col justify-between">
        <div className="space-y-2">
          {/* Top Row: Dynamic Badge + Case ID */}
          <div className="flex items-center justify-between gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border font-mono truncate max-w-[210px] ${statusMeta.color}`}>
              <StatusIcon className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{statusMeta.label}</span>
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">
              {c.id.split('-').slice(-2).join('-')}
            </span>
          </div>

          {/* Title / Landmark */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black text-[#03045E] group-hover:text-[#0077B6] transition-colors line-clamp-1 leading-snug">
              {c.locationLandmark}
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
              <span className="truncate">{c.village || c.mandal}, {c.district}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[9px]">{c.coordinates?.lat?.toFixed(2)}°, {c.coordinates?.lng?.toFixed(2)}°</span>
            </div>
          </div>

          {/* Photographic Evidence Thumbnail if available */}
          {photo && (
            <div className="relative h-20 sm:h-22 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs">
              <img 
                src={photo} 
                alt="Ground Evidence"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-emerald-400 text-[8.5px] font-mono font-bold flex items-center gap-1 shadow">
                <Check className="w-2 h-2" />
                <span>{isResolved ? tr('Cleaned Proof', 'सफाई प्रमाण', 'క్లీనింగ్ నిరూపణ') : tr('Ground Evidence', 'धरातलीय साक्ष्य', 'క్షేత్ర సాక్ష్యం')}</span>
              </div>
              {c.inspectionReport?.tdsReadingPpm && (
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-sky-900/90 text-white text-[8.5px] font-mono font-bold shadow">
                  TDS: {c.inspectionReport.tdsReadingPpm} ppm
                </div>
              )}
            </div>
          )}

          {/* Summary / Description */}
          <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-snug bg-slate-50 p-1.5 rounded-lg border border-slate-200/70">
            {c.workExecution?.workSummary || c.inspectionReport?.validationRemarks || c.shortDescription}
          </p>

          {/* Accountability Credits */}
          <div className="text-[9px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 font-mono">
            <span className="truncate max-w-[140px]">
              By: <strong className="text-slate-800">{c.citizenName}</strong>
            </span>
            <span className="truncate max-w-[140px] text-right">
              {c.assignedInspector ? (
                <>Insp: <strong className="text-slate-800">{c.assignedInspector.split(' ').slice(0, 2).join(' ')}</strong></>
              ) : (
                <span className="text-amber-700">Triage in Progress</span>
              )}
            </span>
          </div>
        </div>

        {/* View Details Button -> Jumps to full complaint dossier */}
        <button
          onClick={() => onSelectComplaint(c)}
          className="mt-1.5 w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-all hover:scale-101 cursor-pointer"
        >
          <span>{tr('View Case Dossier', 'पूरी रिपोर्ट देखें', 'పూర్తి నివేదిక చూడండి')}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CASE 2: PROMPT TO LODGE FIRST COMPLAINT IF LIST IS EMPTY
  // -------------------------------------------------------------
  if (item.type === 'PROMPT') {
    return (
      <div className="w-[275px] sm:w-[305px] md:w-[325px] bg-gradient-to-br from-white to-sky-50 rounded-xl sm:rounded-2xl border border-dashed border-sky-300 p-3 sm:p-3.5 space-y-2 shrink-0 shadow-2xs flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-100 text-[#0077B6] font-mono">
              <PlusCircle className="w-2.5 h-2.5" />
              <span>{tr('Civic Participation', 'नागरिक सहभागिता', 'పౌర భాగస్వామ్యం')}</span>
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0077B6] flex items-center justify-center mx-auto text-lg shadow-2xs">
              💧
            </div>
            <h4 className="text-xs sm:text-[13px] font-black text-[#03045E]">
              {tr('Report a Local Water Issue', 'स्थानीय जल समस्या दर्ज करें', 'స్థానిక నీటి సమస్యను నివేదించండి')}
            </h4>
            <p className="text-[10.5px] text-slate-500 leading-snug">
              {tr(
                'Choked weir, dry percolation tank, or contaminated drinking source? Lodge your grievance for statutory 72h SLA redressal.',
                'चोक्ड वियर, सूखा तालाब या दूषित पानी? 72 घंटे में समाधान हेतु शिकायत दर्ज करें।',
                'కాలువ పూడిక లేదా కలుషిత నీటి సమస్య ఉందా? 72 గంటల్లో పరిష్కారానికి నమోదు చేయండి.'
              )}
            </p>
          </div>
        </div>

        {onOpenLodgeModal && (
          <button
            onClick={onOpenLodgeModal}
            className="w-full py-1.5 px-2.5 rounded-lg bg-[#0077B6] hover:bg-[#03045E] text-white font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <span>{tr('Report Problem Now', 'अभी शिकायत दर्ज करें', 'ఇప్పుడే సమస్యను నివేదించండి')}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // CASE 3: OFFICIAL GOVERNMENT WATER SCHEME
  // -------------------------------------------------------------
  const s = item.data;
  return (
    <div className="w-[275px] sm:w-[305px] md:w-[325px] bg-white rounded-xl sm:rounded-2xl border border-sky-200 hover:border-[#0077B6] p-3 sm:p-3.5 space-y-2 shrink-0 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group flex flex-col justify-between">
      <div className="space-y-2">
        {/* Top Row: Category & Emblem */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-100 text-[#0077B6] border border-sky-300 font-mono shadow-2xs truncate">
            <Landmark className="w-2.5 h-2.5 shrink-0 text-[#0077B6]" />
            <span className="truncate">{s.category}</span>
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">
            Govt of India / AP
          </span>
        </div>

        {/* Scheme Title & Ministry */}
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sm shrink-0 shadow-2xs mt-0.5">
            {s.logoIcon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-[13px] font-black text-[#03045E] group-hover:text-[#0077B6] transition-colors line-clamp-1 leading-snug">
              {language === 'hi' ? s.hindiName : language === 'te' ? s.teluguName : s.name}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
              {s.nodalMinistry}
            </p>
          </div>
        </div>

        {/* Objective */}
        <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-snug bg-sky-50/50 p-1.5 rounded-lg border border-sky-100">
          {language === 'hi' ? s.hindiDescription : language === 'te' ? s.teluguDescription : s.description}
        </p>

        {/* Impact Metric Strip */}
        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 flex items-center justify-between text-[10px]">
          <div>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
              {s.keyMetricLabel}
            </span>
            <span className="text-xs sm:text-[13px] font-black text-[#03045E] font-mono">
              {s.keyMetric}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Coverage
            </span>
            <span className="text-[10px] font-bold text-slate-700">
              {s.coverageArea.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Compact Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          onClick={() => onOpenSchemeModal(s)}
          className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Info className="w-3 h-3 text-slate-500" />
          <span>{tr('Guidelines', 'दिशानिर्देश', 'మార్గదర్శకాలు')}</span>
        </button>

        <button
          onClick={() => onOpenSchemePortal(s.portalUrl)}
          className="py-1.5 px-2 rounded-lg bg-[#0077B6] hover:bg-[#03045E] text-white font-bold text-[10.5px] shadow-2xs flex items-center justify-center gap-1 transition-all hover:scale-101 cursor-pointer"
        >
          <span>{tr('Official Portal', 'सरकारी पोर्टल', 'పోర్టల్')}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
