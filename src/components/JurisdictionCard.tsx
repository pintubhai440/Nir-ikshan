import React, { useState } from 'react';
import { 
  Droplets, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Waves, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { HydrologicalJurisdiction } from './AdminDashboard';

interface JurisdictionCardProps {
  jurisdiction: HydrologicalJurisdiction;
  language: 'en' | 'hi' | 'te';
  districtHindiNames: Record<string, string>;
  onOpenModal: (j: HydrologicalJurisdiction) => void;
  onInspectDams: (j: HydrologicalJurisdiction) => void;
}

export const JurisdictionCard: React.FC<JurisdictionCardProps> = ({
  jurisdiction: j,
  language,
  districtHindiNames,
  onOpenModal,
  onInspectDams,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fillPct = j.criticalTmcCapacity > 0 
    ? Number(((j.currentLiveTmc / j.criticalTmcCapacity) * 100).toFixed(1)) 
    : 0;

  const localizedName = language === 'hi' ? j.nameHi : language === 'te' ? j.teluguName : j.name;
  const secondaryName = language === 'te' ? j.name : language === 'hi' ? j.name : j.teluguName;
  const localizedHq = language === 'hi' ? j.headquartersHi : language === 'te' ? j.headquartersTe : j.headquarters;
  const localizedEngineer = language === 'hi' ? j.chiefEngineerHi : language === 'te' ? j.chiefEngineerTe : j.chiefEngineer;
  const localizedBarrage = language === 'hi' ? j.primaryBarrageHi : language === 'te' ? j.primaryBarrageTe : j.primaryBarrage;
  const localizedStatus = language === 'hi' ? j.statusHi : language === 'te' ? j.statusTe : j.status;
  const localizedDescription = language === 'hi' ? j.descriptionHi : language === 'te' ? j.descriptionTe : j.description;
  const localizedCanals = language === 'hi' && j.majorCanalsHi 
    ? j.majorCanalsHi 
    : language === 'te' && j.majorCanalsTe 
    ? j.majorCanalsTe 
    : (j.majorCanals || []);

  // Determine Basin classification styling
  const basinInfo = (() => {
    if (j.id.includes('krishna') || j.id.includes('rayalaseema') || j.id.includes('tungabhadra')) {
      return {
        label: language === 'hi' ? 'कृष्णा नदी बेसिन' : language === 'te' ? 'కృష్ణా నదీ పరీవాహకం' : 'Krishna River Basin',
        accentBorder: 'border-t-4 border-t-[#0077B6]',
        badgeBg: 'bg-blue-50 text-[#0077B6] border-blue-200/80',
        progressGradient: 'from-blue-500 to-[#0077B6]',
      };
    }
    if (j.id.includes('godavari') || j.id.includes('interbasin')) {
      return {
        label: language === 'hi' ? 'गोदावरी नदी बेसिन' : language === 'te' ? 'గోదావరి నదీ పరీవాహకం' : 'Godavari River Basin',
        accentBorder: 'border-t-4 border-t-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        progressGradient: 'from-emerald-500 to-teal-600',
      };
    }
    if (j.id.includes('pennar') || j.id.includes('kunderu')) {
      return {
        label: language === 'hi' ? 'पेन्ना व कुंदेरू बेसिन' : language === 'te' ? 'పెన్నా & కుందేరు బేసిన్' : 'Pennar & Kunderu Basin',
        accentBorder: 'border-t-4 border-t-indigo-600',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        progressGradient: 'from-indigo-500 to-purple-600',
      };
    }
    return {
      label: language === 'hi' ? 'उत्तर तटीय बेसिन' : language === 'te' ? 'ఉత్తరాంధ్ర నదులు' : 'North Coastal Basins',
      accentBorder: 'border-t-4 border-t-teal-600',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      progressGradient: 'from-teal-500 to-cyan-600',
    };
  })();

  const isEmerald = j.statusColor === 'emerald';
  const isSky = j.statusColor === 'sky';
  const isAmber = j.statusColor === 'amber';

  const statusBg = isEmerald 
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
    : isSky 
    ? 'bg-sky-50 text-sky-800 border-sky-200' 
    : isAmber 
    ? 'bg-amber-50 text-amber-800 border-amber-200' 
    : 'bg-indigo-50 text-indigo-800 border-indigo-200';

  const dotColor = isEmerald ? 'bg-emerald-500' : isSky ? 'bg-sky-500' : isAmber ? 'bg-amber-500' : 'bg-indigo-500';

  return (
    <div 
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${basinInfo.accentBorder}`}
    >
      <div className="p-5 sm:p-5.5 space-y-4">
        {/* Row 1: Badges & Live Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${basinInfo.badgeBg}`}>
              {basinInfo.label}
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
              {j.id.replace('jur-', 'AP-WRD-')}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {localizedHq}
            </span>
          </div>

          <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${statusBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
            <span>{localizedStatus}</span>
          </div>
        </div>

        {/* Row 2: Title and Subtitle */}
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
            {localizedName}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {secondaryName}
          </p>
        </div>

        {/* Row 3: Water Storage Hero Card */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'hi' ? 'लाइव जल भंडारण' : language === 'te' ? 'ప్రత్యక్ష నిల్వ' : 'Current Live Storage'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-[#0077B6] font-mono">{j.currentLiveTmc}</span>
                <span className="text-xs font-bold text-slate-400 font-mono">/ {j.criticalTmcCapacity} TMC</span>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-base font-black font-mono ${
                fillPct >= 70 ? 'text-emerald-600' : fillPct >= 45 ? 'text-[#0077B6]' : 'text-amber-600'
              }`}>
                {fillPct}%
              </div>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
                {language === 'hi' ? 'भंडारण स्तर' : language === 'te' ? 'నిల్వ శాతం' : 'Capacity Stored'}
              </span>
            </div>
          </div>

          {/* Smooth Storage Bar */}
          <div className="w-full bg-slate-200/90 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${basinInfo.progressGradient}`}
              style={{ width: `${Math.min(100, Math.max(5, fillPct))}%` }}
            />
          </div>

          {/* Bottom Micro Metrics */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Droplets className="w-3 h-3 text-[#0077B6]" />
              {j.monitoredReservoirs} {language === 'hi' ? 'जलाशय व बैराज' : language === 'te' ? 'రిజర్వాయర్లు' : 'Monitored Dams'}
            </span>
            <span className="font-mono font-semibold text-slate-600">
              {language === 'hi' ? 'वार्षिक प्रवाह:' : language === 'te' ? 'వార్షిక ప్రవాహం:' : 'Yield:'} {j.annualYieldTmc || 0} TMC
            </span>
          </div>
        </div>

        {/* Row 4: Clean Unified Key Metrics Bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-200/80 bg-slate-50/50 border border-slate-100 rounded-xl py-2 px-1 text-center">
          <div className="px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'hi' ? 'जलग्रहण' : language === 'te' ? 'క్యాచ్‌మెంట్' : 'Catchment'}
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate">
              {j.catchmentAreaSqKm}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'hi' ? 'कृषि आयकट' : language === 'te' ? 'ఆయకట్టు' : 'Ayacut'}
            </span>
            <span className="font-mono font-bold text-purple-700 text-xs mt-0.5 block truncate">
              {j.irrigationAyacutLakhAcres || 0} L.Acres
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {language === 'hi' ? 'कवर ज़िले' : language === 'te' ? 'జిల్లాలు' : 'Command'}
            </span>
            <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
              {j.coveredDistricts.length} {language === 'hi' ? 'ज़िले' : language === 'te' ? 'జిల్లాలు' : 'Districts'}
            </span>
          </div>
        </div>

        {/* Row 5: Primary Dam & Flood Control Banner */}
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/70 flex items-start gap-2.5">
          <Waves className="w-4 h-4 text-[#0077B6] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#0077B6] uppercase tracking-wider block">
              {language === 'hi' ? 'प्रमुख बैराज / बाढ़ नियामक' : language === 'te' ? 'ప్రధాన బ్యారేజ్ / వరద నియంత్రణ' : 'Primary Barrage & Flood Regulator'}
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
              {localizedBarrage}
            </p>
          </div>
        </div>

        {/* Row 6: Covered Districts */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{language === 'hi' ? 'कवर किए गए 26 ज़िले' : language === 'te' ? 'కవర్ చేయబడిన జిల్లాలు' : 'Command Districts'}</span>
            <span className="text-slate-500 font-mono">({j.coveredDistricts.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {j.coveredDistricts.map(d => (
              <span 
                key={d}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
              >
                {language === 'hi' && districtHindiNames[d] ? districtHindiNames[d] : d}
              </span>
            ))}
          </div>
        </div>

        {/* Expandable Canal Network & Description Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#0077B6] hover:text-[#03045E] transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {isExpanded 
                ? (language === 'hi' ? 'नहरें व विवरण छिपाएं' : language === 'te' ? 'కాలువలు & వివరణ దాచు' : 'Hide Canals & Details')
                : (language === 'hi' ? 'नहर नेटवर्क एवं विवरण देखें' : language === 'te' ? 'కాలువల నెట్‌వర్క్ & వివరాలు' : 'View Canal Network & Details')}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
              {localizedCanals && localizedCanals.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'प्रमुख नहर नेटवर्क' : language === 'te' ? 'ప్రధాన కాలువల నెట్‌వర్క్' : 'Major Canal Network'}
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px] text-slate-700">
                    {localizedCanals.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
                        <span className="text-blue-500 font-bold">&bull;</span> {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                {localizedDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Chief Engineer Contact & Clean Actions */}
      <div className="bg-slate-50/70 border-t border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0077B6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {j.chiefEngineer.replace(/^(Er\.|Dr\.)\s*/, '').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                {language === 'hi' ? 'अध्यक्ष मुख्य अभियंता' : language === 'te' ? 'ప్రధాన చీఫ్ ఇంజనీర్' : 'Presiding Chief Engineer'}
              </span>
              <span className="font-bold text-xs text-slate-900 truncate block">
                {localizedEngineer}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`tel:${j.phone}`}
              className="p-1.5 rounded-xl bg-white hover:bg-[#0077B6] hover:text-white text-slate-600 border border-slate-200/80 transition-colors shadow-2xs"
              title={`Call ${j.chiefEngineer}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
            <a
              href={`mailto:${j.email}`}
              className="p-1.5 rounded-xl bg-white hover:bg-[#0077B6] hover:text-white text-slate-600 border border-slate-200/80 transition-colors shadow-2xs"
              title={`Email ${j.email}`}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Clean Unified Action Row */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onOpenModal(j)}
            className="flex-1 py-2 px-3 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? 'तकनीकी डोजियर' : language === 'te' ? 'సాంకేతిక డాసియర్' : 'Open Technical Dossier'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onInspectDams(j)}
            className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title={language === 'hi' ? 'जलाशय संपत्तियां में देखें' : language === 'te' ? 'రిజర్వాయర్ ఆస్తులలో చూడండి' : 'Inspect Basin Dams'}
          >
            <Droplets className="w-3.5 h-3.5 text-[#0077B6]" />
            <span>{language === 'hi' ? 'बांध टेलीमेट्री' : language === 'te' ? 'డ్యామ్‌ల డేటా' : 'Dams Telemetry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
