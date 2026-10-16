import React, { useState, useRef } from 'react';
import { CitizenComplaint, InspectorReport, WaterBody } from '../types/nirikshan';
import { 
  UserCheck, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Droplet, 
  Activity, 
  Send, 
  X, 
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  RefreshCw,
  Trash2,
  Link2,
  Check,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface InspectorDashboardProps {
  complaints: CitizenComplaint[];
  waterBodies: WaterBody[];
  onSubmitInspectionReport: (complaintId: string, report: InspectorReport) => void;
  onSubmitPostWorkVerification: (
    complaintId: string,
    isSatisfactory: boolean,
    photoUrl: string,
    remarks: string
  ) => void;
}

export const InspectorDashboard: React.FC<InspectorDashboardProps> = ({
  complaints,
  waterBodies,
  onSubmitInspectionReport,
  onSubmitPostWorkVerification,
}) => {
  const { t, language } = useLanguage();
  const [selectedComplaint, setSelectedComplaint] = useState<CitizenComplaint | null>(null);
  const [selectedVerificationComplaint, setSelectedVerificationComplaint] = useState<CitizenComplaint | null>(null);

  // Hidden native file and camera refs for bulletproof triggering
  const siteFileInputRef = useRef<HTMLInputElement>(null);
  const siteCameraInputRef = useRef<HTMLInputElement>(null);
  const verificationFileInputRef = useRef<HTMLInputElement>(null);
  const verificationCameraInputRef = useRef<HTMLInputElement>(null);

  // Inspection Form States
  const [gps, setGps] = useState<{ lat: number; lng: number }>({ lat: 18.1695, lng: 83.4688 });
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [waterPresence, setWaterPresence] = useState<InspectorReport['waterPresence']>('Moderate');
  const [wasteLevel, setWasteLevel] = useState<InspectorReport['wasteLevel']>('Heavy');
  const [wasteType, setWasteType] = useState<InspectorReport['wasteType']>('Plastic & Polythene');
  const [sourcePinDescription, setSourcePinDescription] = useState('');
  const [tdsReadingPpm, setTdsReadingPpm] = useState<number>(650);
  const [sitePhotoUrl, setSitePhotoUrl] = useState<string>('');
  const [manualPhotoUrl, setManualPhotoUrl] = useState('');
  const [isDraggingSitePhoto, setIsDraggingSitePhoto] = useState(false);
  const [isComplaintValid, setIsComplaintValid] = useState(true);
  const [validationRemarks, setValidationRemarks] = useState('');

  // Post-work verification states
  const [isSatisfactory, setIsSatisfactory] = useState(true);
  const [verificationPhotoUrl, setVerificationPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  );
  const [manualVerificationUrl, setManualVerificationUrl] = useState('');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  // Filter tasks
  const pendingInspections = complaints.filter(
    (c) => c.status === 'INSPECTOR_ASSIGNED' || c.status === 'SUBMITTED'
  );
  const pendingVerifications = complaints.filter(
    (c) => c.status === 'VERIFICATION_PENDING' || (c.status === 'WORKER_IN_PROGRESS' && c.workExecution?.status === 'COMPLETED')
  );
  const completedInspections = complaints.filter(
    (c) => c.status === 'INSPECTION_COMPLETED' || c.status === 'WORKER_IN_PROGRESS' || c.status === 'RESOLVED'
  );

  const handleFetchGps = () => {
    setIsFetchingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
          setIsFetchingGps(false);
        },
        () => {
          setGps({
            lat: Number((18.15 + (Math.random() - 0.5) * 0.05).toFixed(6)),
            lng: Number((83.42 + (Math.random() - 0.5) * 0.05).toFixed(6)),
          });
          setIsFetchingGps(false);
        }
      );
    } else {
      setIsFetchingGps(false);
    }
  };

  const handleSitePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSitePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerificationPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenInspectionModal = (c: CitizenComplaint) => {
    setSelectedComplaint(c);
    setGps(c.coordinates);
    setSourcePinDescription(`Upstream inflow canal at ${c.locationLandmark}`);
    setValidationRemarks(`Site verified on ground. Citizen complaint authentic and requires immediate intervention.`);
    setSitePhotoUrl('');
    setManualPhotoUrl('');
    setIsDraggingSitePhoto(false);
  };

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST`;

    const report: InspectorReport = {
      id: `INS-REP-2026-${Math.floor(100 + Math.random() * 900)}`,
      inspectorName: selectedComplaint.assignedInspector || 'Er. M. Chaitanya Varma',
      inspectorPhone: selectedComplaint.assignedInspectorPhone || '+91 98480 33419',
      inspectedAt: timeStr,
      gpsCoordinates: gps,
      waterPresence,
      wasteLevel,
      wasteType,
      sourcePinDescription,
      tdsReadingPpm,
      sitePhotoUrl: sitePhotoUrl || selectedComplaint.photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80',
      isComplaintValid,
      validationRemarks,
    };

    onSubmitInspectionReport(selectedComplaint.id, report);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setSelectedComplaint(null);
  };

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerificationComplaint) return;

    onSubmitPostWorkVerification(
      selectedVerificationComplaint.id,
      isSatisfactory,
      verificationPhotoUrl,
      verificationRemarks || (isSatisfactory ? 'Remedial work inspected on site. Debris removed and flow restored.' : 'Defects found. Work must be re-executed.')
    );
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setSelectedVerificationComplaint(null);
  };

  return (
    <div className="space-y-6">
      {/* Inspector Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#1b2a4a] to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-emerald-300 border border-white/10">
            <UserCheck className="w-3.5 h-3.5" />
            <span>FIELD WATER QUALITY & INVESTIGATION CELL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {language === 'hi' ? 'फील्ड इंस्पेक्टर मोबाइल वर्कस्टेशन' : language === 'te' ? 'ఫీల్డ్ ఇన్స్పెక్టర్ మొబైల్ వర్క్‌స్టేషన్' : 'Field Inspector Mobile Workstation'}
          </h2>
          <p className="text-xs sm:text-sm text-sky-200">
            Mobile-optimized protocol: Log on-site GPS, assess water presence, measure machine TDS level, identify contamination source pin, and verify complaint validity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-emerald-300 font-bold block">PENDING INVESTIGATION</span>
            <span className="text-lg font-bold text-white">{pendingInspections.length}</span>
          </div>
          <div className="bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300 font-bold block">POST-WORK RE-CHECK</span>
            <span className="text-lg font-bold text-white">{pendingVerifications.length}</span>
          </div>
        </div>
      </div>

      {/* 2 Workflow Columns: 1. Inspections to Conduct | 2. Post-Work Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column 1: Pending Site Inspections */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-[#0047ab]">
                <MapPin className="w-4 h-4" />
              </span>
              <span>1. Assigned Site Inspections ({pendingInspections.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">TDS & Waste Source Protocol</span>
          </div>

          <div className="space-y-3">
            {pendingInspections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                All assigned complaints inspected! Awaiting new dispatches from Nodal Officer.
              </div>
            ) : (
              pendingInspections.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold bg-[#0047ab] text-white px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Action Required
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.locationLandmark}</h4>
                    <p className="text-[11px] text-slate-500">{c.district} • {c.mandal} • {c.village}</p>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                    "{c.shortDescription}"
                  </p>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Citizen: {c.citizenName} ({c.citizenPhone})</span>
                    <span className="font-mono">Lat: {c.coordinates.lat.toFixed(4)}°</span>
                  </div>

                  <button
                    onClick={() => handleOpenInspectionModal(c)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />
                    <span>{language === 'hi' ? 'स्थल जांच करें एवं टीडीएस रिपोर्ट भरें' : language === 'te' ? 'క్షేత్ర తనిఖీ నిర్వహించి TDS నమోదు చేయండి' : 'Conduct Field Investigation & Log TDS'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Post-Worker Verification Re-Check */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>2. Engineer Work Verification ({pendingVerifications.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Quality Sign-off</span>
          </div>

          <div className="space-y-3">
            {pendingVerifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No completed engineer jobs currently waiting for re-inspection sign-off.
              </div>
            ) : (
              pendingVerifications.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold bg-[#0047ab] text-white px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Work Completed by Engineer
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.locationLandmark}</h4>
                    <p className="text-[11px] text-slate-500">Engineer: {c.assignedEngineer}</p>
                  </div>

                  {/* Before vs After Photos */}
                  {c.workExecution && (
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div>
                        <span className="font-bold text-slate-500 block mb-0.5">BEFORE WORK</span>
                        <img
                          src={c.workExecution.beforePhotoUrl || c.photoUrl}
                          alt="Before"
                          className="w-full h-20 rounded object-cover border border-slate-200"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-700 block mb-0.5">AFTER WORK</span>
                        <img
                          src={c.workExecution.afterPhotoUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                          alt="After"
                          className="w-full h-20 rounded object-cover border border-emerald-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-2 bg-slate-50 text-[11px] text-slate-700 rounded border border-slate-100">
                    <strong>Work Summary:</strong> {c.workExecution?.workSummary || 'De-silted check dam and restored free canal flow.'}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVerificationComplaint(c);
                      setVerificationRemarks('Site verified. Water flow is normal, waste removed and water table stabilized. Case solved.');
                    }}
                    className="w-full py-2 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'hi' ? 'गुणवत्ता सत्यापन करें एवं केस बंद करें' : language === 'te' ? 'నాణ్యతను ధృవీకరించి కేసును పరిష్కరించండి' : 'Verify Quality & Close Case'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Conduct Field Inspection & TDS Machine Log Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-[#1b2a4a] text-white p-4 sm:p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-200 uppercase font-bold">
                  NIR-IKSHAN STATUTORY FIELD INSPECTION REPORT
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Field Investigation Protocol: {selectedComplaint.id}
                </h3>
                <p className="text-xs text-emerald-100">
                  {selectedComplaint.locationLandmark} ({selectedComplaint.district})
                </p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* GPS Auto-detect */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block">On-Site GPS Coordinates</label>
                  <span className="font-mono text-slate-800 font-bold text-xs">
                    Lat: {gps.lat}° N, Lng: {gps.lng}° E
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFetchGps}
                  className="px-3 py-1.5 bg-[#0047ab] text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isFetchingGps ? 'Detecting...' : 'Re-Detect GPS'}</span>
                </button>
              </div>

              {/* SECTION: Site Verified Image Upload (Mandatory Evidence) */}
              <div className="bg-emerald-50/80 border-2 border-emerald-500/40 rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/70 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-emerald-600 text-white">
                        <Camera className="w-4 h-4" />
                      </span>
                      <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                        {language === 'hi' ? 'स्थल सत्यापन फोटो अपलोड करें' : language === 'te' ? 'సైట్ ధృవీకరణ ఫోటోను అప్‌లోడ్ చేయండి' : 'Site Verified Image Upload'}
                      </h4>
                      <span className="bg-emerald-700 text-white text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold">
                        Mandatory Proof
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      {language === 'hi' ? 'नोडल अधिकारी एवं एक्शन इंजीनियर सत्यापन के लिए फील्ड जांच फोटो साक्ष्य अनिवार्य है।' : language === 'te' ? 'నోడల్ అధికారి & యాక్షన్ ఇంజనీర్ ధృవీకరణ కోసం ఫీల్డ్ తనిఖీ ఫోటో సాక్ష్యం తప్పనిసరి.' : 'Field investigation photo evidence is required for Nodal Officer & Action Engineer verification.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => siteFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'फोटो अपलोड करें' : language === 'te' ? 'ఫోటో అప్‌లోడ్ చేయండి' : 'Upload Photo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => siteCameraInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'कैमरा' : language === 'te' ? 'కెమెరా' : 'Camera'}</span>
                    </button>
                  </div>
                </div>

                {/* Native hidden inputs controlled by ref */}
                <input
                  ref={siteFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSitePhotoUpload}
                  className="sr-only"
                />
                <input
                  ref={siteCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSitePhotoUpload}
                  className="sr-only"
                />

                {/* Side-by-Side: Citizen Complaint vs Inspector Ground Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left: Citizen Complaint Photo Reference */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                        <span>1. Citizen Reported Photo</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        Reference
                      </span>
                    </div>
                    <div className="relative h-36 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={selectedComplaint.photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'}
                        alt="Citizen Report"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                        CITIZEN GRIEVANCE #{selectedComplaint.id}
                      </div>
                    </div>
                  </div>

                  {/* Right: Inspector Ground-Verified Photo */}
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>2. Inspector Site Verified Photo</span>
                      </span>
                      {sitePhotoUrl ? (
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                          ✓ Attached
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Required
                        </span>
                      )}
                    </div>

                    {sitePhotoUrl ? (
                      <div className="relative h-36 rounded-lg overflow-hidden bg-slate-900 border-2 border-emerald-500 group">
                        <img
                          src={sitePhotoUrl}
                          alt="Site Verified Evidence"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => siteFileInputRef.current?.click()}
                            className="bg-white/95 hover:bg-white text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-blue-600" />
                            <span>Change</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSitePhotoUrl('')}
                            className="bg-rose-600/90 hover:bg-rose-700 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-emerald-950/85 text-emerald-200 text-[9px] px-2 py-0.5 rounded font-mono flex items-center justify-between">
                          <span>GROUND VERIFIED • {gps.lat.toFixed(4)}°N</span>
                          <span className="text-emerald-300 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> READY
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingSitePhoto(true); }}
                        onDragLeave={() => setIsDraggingSitePhoto(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingSitePhoto(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setSitePhotoUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        onClick={() => siteFileInputRef.current?.click()}
                        className={`h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors ${
                          isDraggingSitePhoto
                            ? 'border-emerald-500 bg-emerald-100/70'
                            : 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/40'
                        }`}
                      >
                        <Camera className="w-8 h-8 text-emerald-600 mb-1.5 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-900 block">
                          Click to Upload Site Verified Image
                        </span>
                        <span className="text-[10px] text-emerald-700 mt-0.5">
                          Or drag and drop photo file here (JPG, PNG, WEBP)
                        </span>
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Upload className="w-2.5 h-2.5" />
                          <span>Tap here to browse file from device</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paste Image URL & Quick Sample Presets */}
                <div className="pt-2 border-t border-emerald-200/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder={language === 'hi' ? 'अथवा फोटो का वेब लिंक यहां चिपकाएं...' : language === 'te' ? 'లేదా సైట్ ఫోటో వెబ్ లింక్‌ను ఇక్కడ పేస్ట్ చేయండి...' : 'Or paste site verified image URL...'}
                        value={manualPhotoUrl}
                        onChange={(e) => setManualPhotoUrl(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (manualPhotoUrl.trim()) {
                          setSitePhotoUrl(manualPhotoUrl.trim());
                          setManualPhotoUrl('');
                        }
                      }}
                      disabled={!manualPhotoUrl.trim()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Set URL
                    </button>
                    {selectedComplaint.photoUrl && !sitePhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setSitePhotoUrl(selectedComplaint.photoUrl || '')}
                        className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap"
                        title="Use Citizen Photo as Ground Verification Basis"
                      >
                        Use Citizen Photo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-600">Quick Evidence Presets:</span>
                    {[
                      { label: 'Sample 1: Heavy Silt & Waste', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80' },
                      { label: 'Sample 2: Canal Inflow Drain', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80' },
                      { label: 'Sample 3: Choked Tank Bed', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80' },
                      { label: 'Sample 4: Clear Water Spring', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSitePhotoUrl(p.url)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 transition-colors cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Water Presence & Waste Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'जल की उपस्थिति / मात्रा' : language === 'te' ? 'నీటి లభ్యత / పరిమాణం' : 'Water Presence / Quantity'}
                  </label>
                  <select
                    value={waterPresence}
                    onChange={(e) => setWaterPresence(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Abundant">{language === 'hi' ? 'प्रचुर जल प्रवाह' : language === 'te' ? 'సమృద్ధిగా ప్రవాహం' : 'Abundant Flow'}</option>
                    <option value="Moderate">{language === 'hi' ? 'मध्यम प्रवाह' : language === 'te' ? 'మధ్యస్థ ప్రవాహం' : 'Moderate Flow'}</option>
                    <option value="Low">{language === 'hi' ? 'अत्यंत कम जल' : language === 'te' ? 'చాలా తక్కువ నీరు' : 'Low / Depleted'}</option>
                    <option value="Stagnant Dry">{language === 'hi' ? 'स्थिर सूखा गड्ढा' : language === 'te' ? 'నిలిచిపోయిన ఎండిన గుంట' : 'Stagnant Dry Puddle'}</option>
                    <option value="Extinct">{language === 'hi' ? 'पूर्णतः सूखा विलुप्त तल' : language === 'te' ? 'పూర్తిగా ఎండిపోయిన అంతరించిన తలం' : 'Completely Dry Extinct Bed'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'कचरे अथवा प्रदूषण का स्तर' : language === 'te' ? 'వ్యర్థాలు / కాలుష్యం స్థాయి' : 'Waste / Contamination Level'}
                  </label>
                  <select
                    value={wasteLevel}
                    onChange={(e) => setWasteLevel(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white cursor-pointer"
                  >
                    <option value="Low">{language === 'hi' ? 'हल्का कचरा' : language === 'te' ? 'తక్కువ వ్యర్థాలు' : 'Low'}</option>
                    <option value="Moderate">{language === 'hi' ? 'मध्यम कचरा' : language === 'te' ? 'మధ్యస్థ వ్యర్థాలు' : 'Moderate'}</option>
                    <option value="Heavy">{language === 'hi' ? 'भारी कचरा' : language === 'te' ? 'భారీ కాలుష్యం' : 'Heavy Contamination'}</option>
                    <option value="Severe Choke">{language === 'hi' ? 'गंभीर रुकावट व संकट' : language === 'te' ? 'తీవ్రమైన అడ్డంకి / ప్రమాదం' : 'Severe Choke / Toxic Hazard'}</option>
                  </select>
                </div>
              </div>

              {/* Waste Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'कचरे अथवा प्रदूषक का प्रकार' : language === 'te' ? 'వ్యర్థాలు / కాలుష్య కారకం రకం' : 'Type of Waste / Pollutant'}
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold bg-white cursor-pointer"
                >
                  <option value="Plastic & Polythene">{language === 'hi' ? 'प्लास्टिक एवं पॉलीथीन कचरा' : language === 'te' ? 'ప్లాస్టిక్ & పాలిథిన్ వ్యర్థాలు' : 'Plastic & Polythene Packaging'}</option>
                  <option value="Domestic Sewage">{language === 'hi' ? 'घरेलू सीवेज / गंदा पानी' : language === 'te' ? 'గృహ మురుగునీరు' : 'Domestic Sewage Outfall'}</option>
                  <option value="Industrial Chemical Effluent">{language === 'hi' ? 'औद्योगिक रसायन एवं डाई' : language === 'te' ? 'పారిశ్రామిక రసాయన వ్యర్థాలు' : 'Industrial Chemical Effluent'}</option>
                  <option value="Agricultural Pesticide Runoff">{language === 'hi' ? 'कीटनाशक एवं कृषि रासायनिक बहाव' : language === 'te' ? 'వ్యవసాయ పురుగుమందుల ప్రవాహం' : 'Agricultural Pesticide Runoff'}</option>
                  <option value="Construction Debris & Bitumen">{language === 'hi' ? 'निर्माण मलबा एवं डामर बजरी' : language === 'te' ? 'భవన నిర్మాణ వ్యర్థాలు' : 'Construction Debris & Bitumen Gravel'}</option>
                  <option value="Dead Biomass & Eutrophic Algae">{language === 'hi' ? 'सड़ा हुआ बायोमास एवं शैवाल' : language === 'te' ? 'కుళ్ళిన వ్యర్థాలు & ఆల్గే' : 'Dead Biomass & Eutrophic Algae'}</option>
                </select>
              </div>

              {/* Source Pin Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'कचरा स्रोत स्थल (कहाँ से आ रहा है)' : language === 'te' ? 'వ్యర్థాల మూలం వివరాలు' : 'Waste Source Pin Landmark'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'जैसे कपड़ा रंगाई इकाई नाला #2 / मंडी का पुलिया' : language === 'te' ? 'ఉదా: టెక్స్‌టైల్ డైయింగ్ కాలువ / మునిసిపల్ మార్కెట్' : 'e.g. Upstream textile dyeing unit ditch #2 / Municipal market culvert'}
                  value={sourcePinDescription}
                  onChange={(e) => setSourcePinDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              {/* TDS Water Level (Machine Reading) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'hi' ? 'टीडीएस वाटर लेवल मशीन रीडिंग' : language === 'te' ? 'TDS నీటి స్థాయి మెషిన్ రీడింగ్' : 'TDS Water Level Machine Reading'}</span>
                  </label>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    tdsReadingPpm < 300
                      ? 'bg-emerald-100 text-emerald-800'
                      : tdsReadingPpm <= 600
                      ? 'bg-blue-100 text-blue-800'
                      : tdsReadingPpm <= 1200
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {tdsReadingPpm} ppm ({tdsReadingPpm < 300 ? 'Pristine' : tdsReadingPpm <= 600 ? 'Acceptable' : tdsReadingPpm <= 1200 ? 'Moderate Alert' : 'Critical Hazard'})
                  </span>
                </div>

                <input
                  type="range"
                  min={50}
                  max={2500}
                  step={10}
                  value={tdsReadingPpm}
                  onChange={(e) => setTdsReadingPpm(Number(e.target.value))}
                  className="w-full accent-[#0047ab] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>50 ppm (Pure Spring)</span>
                  <span>500 ppm (BIS Safe Limit)</span>
                  <span>1200 ppm (High)</span>
                  <span>2500 ppm (Hazard)</span>
                </div>
              </div>

              {/* Complaint Validity Check */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <label className="text-[11px] font-bold text-slate-800 block">
                  {language === 'hi' ? 'नागरिक शिकायत सत्यापन एवं वैधता जांच' : language === 'te' ? 'పౌరుడి ఫిర్యాదు వాస్తవికత ధృవీకరణ' : 'Citizen Complaint Authenticity Check'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="validity"
                      checked={isComplaintValid}
                      onChange={() => setIsComplaintValid(true)}
                      className="text-emerald-600"
                    />
                    <span className="text-emerald-800">
                      {language === 'hi' ? 'शिकायत सही एवं प्रमाणित है' : language === 'te' ? 'ఫిర్యాదు నిజమైనది మరియు ధృవీకరించబడింది' : 'Authentic & Valid Complaint'}
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="validity"
                      checked={!isComplaintValid}
                      onChange={() => setIsComplaintValid(false)}
                      className="text-rose-600"
                    />
                    <span className="text-rose-800">
                      {language === 'hi' ? 'शिकायत अमान्य अथवा विवादित' : language === 'te' ? 'చెల్లనిది లేదా వివాదాస్పదమైనది' : 'Invalid / Disputed Complaint'}
                    </span>
                  </label>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Official findings & remarks for Nodal Officer and Action Engineer..."
                  value={validationRemarks}
                  onChange={(e) => setValidationRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inspection Report to Nodal Officer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Post-Work Verification Modal */}
      {selectedVerificationComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-[#1b2a4a] text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Post-Remediation Quality Sign-off: {selectedVerificationComplaint.id}</span>
              </h4>
              <button onClick={() => setSelectedVerificationComplaint(null)}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmVerification} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block">{selectedVerificationComplaint.locationLandmark}</span>
                <p className="text-slate-600">Action Worker: {selectedVerificationComplaint.assignedEngineer}</p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Was the work executed satisfactorily?</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-emerald-800">
                    <input
                      type="radio"
                      name="satisfaction"
                      checked={isSatisfactory}
                      onChange={() => setIsSatisfactory(true)}
                    />
                    <span>Yes, Problem Solved (Case Solved & Closed)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-rose-800">
                    <input
                      type="radio"
                      name="satisfaction"
                      checked={!isSatisfactory}
                      onChange={() => setIsSatisfactory(false)}
                    />
                    <span>No, Unsatisfactory (Re-open: "phir se sahi karo")</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inspector Verification Remarks</label>
                <textarea
                  rows={2}
                  required
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  placeholder="Describe ground verification: e.g. checked on site, desilting complete, water free of trash..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Post-work verification photo upload */}
              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{language === 'hi' ? 'कार्य समाप्ति उपरांत स्थल सत्यापन फोटो' : language === 'te' ? 'పని పూర్తయిన తర్వాత క్షేత్రస్థాయి ధృవీకరణ ఫోటో' : 'Post-Work Site Verification Photo'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Upload ground proof after engineer completed remediation work
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => verificationFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => verificationCameraInputRef.current?.click()}
                      className="px-2.5 py-1 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Camera</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={verificationFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVerificationPhotoUpload}
                  className="sr-only"
                />
                <input
                  ref={verificationCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleVerificationPhotoUpload}
                  className="sr-only"
                />

                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-300 bg-slate-100 group">
                  <img src={verificationPhotoUrl} alt="Verification Evidence" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => verificationFileInputRef.current?.click()}
                      className="bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-blue-600" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-black/75 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                    POST-REMEDIATION PROOF • VERIFIED
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <div className="relative flex-1">
                    <Link2 className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="Or paste post-work photo URL..."
                      value={manualVerificationUrl}
                      onChange={(e) => setManualVerificationUrl(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (manualVerificationUrl.trim()) {
                        setVerificationPhotoUrl(manualVerificationUrl.trim());
                        setManualVerificationUrl('');
                      }
                    }}
                    disabled={!manualVerificationUrl.trim()}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold rounded text-[11px] cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVerificationComplaint(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 ${
                    isSatisfactory ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSatisfactory ? 'Confirm Case Solved' : 'Send Back to Engineer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
