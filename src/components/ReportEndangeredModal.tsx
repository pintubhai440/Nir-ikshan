import React, { useState, useRef } from 'react';
import { MicroWatershed, EndangeredZoneComplaint } from '../types/watershed';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Image as ImageIcon,
  Flame,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportEndangeredModalProps {
  isOpen: boolean;
  onClose: () => void;
  watersheds: MicroWatershed[];
  defaultWatershedId?: string;
  onComplaintSubmitted: (complaint: EndangeredZoneComplaint) => void;
}

export const ReportEndangeredModal: React.FC<ReportEndangeredModalProps> = ({
  isOpen,
  onClose,
  watersheds,
  defaultWatershedId,
  onComplaintSubmitted,
}) => {
  const [selectedWsId, setSelectedWsId] = useState<string>(
    defaultWatershedId || watersheds[0]?.id || 'ws-kolar-palavanhalli'
  );

  const currentWs = watersheds.find((w) => w.id === selectedWsId) || watersheds[0];

  const [hazardType, setHazardType] = useState<EndangeredZoneComplaint['hazardType']>(
    'Check Dam / Bund Breach Risk'
  );
  const [severity, setSeverity] = useState<EndangeredZoneComplaint['severity']>('CRITICAL_HAZARD');
  const [locationLandmark, setLocationLandmark] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reportedBy, setReportedBy] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [gps, setGps] = useState<{ lat: number; lng: number }>({
    lat: currentWs ? currentWs.coordinates.lat : 13.1367,
    lng: currentWs ? currentWs.coordinates.lng : 78.1292,
  });

  // Screenshot / Photo state
  const [screenshotPreview, setScreenshotPreview] = useState<string>(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleEvidencePhotos = [
    {
      label: 'Damaged Bund / Breach',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Dry Cracked Bed / Depletion',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Clogged Inlet / Silt Choke',
      url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Overdraft / Well Failure',
      url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        () => {
          // fallback simulation
          setGps({
            lat: Number((currentWs.coordinates.lat + (Math.random() - 0.5) * 0.004).toFixed(6)),
            lng: Number((currentWs.coordinates.lng + (Math.random() - 0.5) * 0.004).toFixed(6)),
          });
        }
      );
    } else {
      setGps({
        lat: Number((currentWs.coordinates.lat + (Math.random() - 0.5) * 0.004).toFixed(6)),
        lng: Number((currentWs.coordinates.lng + (Math.random() - 0.5) * 0.004).toFixed(6)),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} IST`;

    const uniqueTime = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `CMP-ENDANGERED-2026-${uniqueTime}-${randomSuffix}`;

    const newComplaint: EndangeredZoneComplaint = {
      id: ticketId,
      watershedId: currentWs.id,
      watershedName: currentWs.name,
      locationLandmark: locationLandmark || `${currentWs.district} Village Boundary`,
      gpsCoordinates: gps,
      hazardType,
      severity,
      reportedBy: reportedBy || 'Alert Citizen / Farmer',
      contactPhone: contactPhone || '+91 98000 00000',
      description,
      screenshotUrl: screenshotPreview,
      timestamp: timeString,
      assignedPanchayat: `${currentWs.district} Gram Panchayat Cell`,
      assignedNodalOfficer: `District Nodal Officer (Minor Irrigation & Ground Water)`,
      status: 'PENDING_VERIFICATION',
      inspectionNotes: 'Public hazard complaint logged via Nir-ikshan Citizen Surveillance Portal.',
    };

    onComplaintSubmitted(newComplaint);

    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f97316', '#0284c7', '#10b981'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-[#1b2a4a] text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-white p-1 rounded-md">
                <Flame className="w-4 h-4 animate-pulse" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-rose-200 uppercase font-bold">
                CITIZEN ENDANGERED WATER ZONE COMPLAINT
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Report Endangered Water Zone / Critical Hazard
            </h2>
            <p className="text-xs text-rose-100 font-medium">
              Upload a photo or screenshot evidence of dried borewells, breached bunds, illegal overdraft, or contamination.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-rose-200 hover:text-white p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Micro-Watershed & Severity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Affected Micro-Watershed
              </label>
              <select
                value={selectedWsId}
                onChange={(e) => {
                  setSelectedWsId(e.target.value);
                  const found = watersheds.find((w) => w.id === e.target.value);
                  if (found) {
                    setGps({ lat: found.coordinates.lat, lng: found.coordinates.lng });
                  }
                }}
                className="w-full text-xs text-slate-800 font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500"
              >
                {watersheds.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.district} — {ws.name.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Hazard Severity Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSeverity('CRITICAL_HAZARD')}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    severity === 'CRITICAL_HAZARD'
                      ? 'bg-rose-100 border-rose-600 text-rose-800 ring-2 ring-rose-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🔴 Critical
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('HIGH_ALERT')}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    severity === 'HIGH_ALERT'
                      ? 'bg-amber-100 border-amber-600 text-amber-800 ring-2 ring-amber-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🟠 High Risk
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('MODERATE_WATCH')}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    severity === 'MODERATE_WATCH'
                      ? 'bg-yellow-100 border-yellow-600 text-yellow-800 ring-2 ring-yellow-400'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🟡 Watch
                </button>
              </div>
            </div>
          </div>

          {/* Hazard Type Category */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Endangered Issue / Hazard Nature
            </label>
            <select
              value={hazardType}
              onChange={(e) => setHazardType(e.target.value as any)}
              className="w-full text-xs text-slate-800 font-semibold bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500"
            >
              <option value="Check Dam / Bund Breach Risk">Check Dam / Embankment Breach Hazard</option>
              <option value="Critical Dry Borewell / Well Collapse">Critical Dry Borewell / Water Table Collapse</option>
              <option value="Contaminated Toxic Water Influx">Contaminated Toxic Water / Industrial Effluent</option>
              <option value="Illegal Deep Drilling Overdraft">Illegal Commercial Borewell Rigs</option>
              <option value="Drying Up of Community Reservoir">Drying Up of Traditional Cheruvu / Tank</option>
              <option value="Encroached Water Body / Silt Choke">Encroached Feeder Channel / Silt Choke</option>
            </select>
          </div>

          {/* Screenshot / Photo Evidence Upload Section */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-600" />
                Problem Screenshot / Photo Proof (समस्या का फोटो/स्क्रीनशॉट)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#0047ab] hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload from Gallery/File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Photo Preview Frame */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-200 flex items-center justify-center shadow-inner">
              <img
                src={screenshotPreview}
                alt="Endangered Problem Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-rose-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-rose-400">
                GEO-EVIDENCE WATERMARK
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded flex items-center justify-between font-mono">
                <span>GPS: {gps.lat.toFixed(4)}°N, {gps.lng.toFixed(4)}°E</span>
                <span>Evidence Attached</span>
              </div>
            </div>

            {/* Sample photo quick pickers */}
            <div className="flex items-center gap-2 pt-1 text-[11px] overflow-x-auto scrollbar-none">
              <span className="text-slate-500 font-medium whitespace-nowrap">Or choose sample proof:</span>
              {sampleEvidencePhotos.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setScreenshotPreview(s.url)}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded text-slate-700 font-medium whitespace-nowrap text-[10px]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Landmark & Geo-Tag Stamp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Landmark / Specific Location (स्थान/लैंडमार्क)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 200m North of Govt School, near River Weir"
                value={locationLandmark}
                onChange={(e) => setLocationLandmark(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Geo-Tag Coordinates (GPS)
                </label>
                <button
                  type="button"
                  onClick={handleFetchCurrentGps}
                  className="text-[11px] font-semibold text-[#0047ab] hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-blue-600" />
                  Fetch Current GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">Lat:</span>
                  <span>{gps.lat.toFixed(6)}° N</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-sans">Lng:</span>
                  <span>{gps.lng.toFixed(6)}° E</span>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Your Name / Reporter
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Gowda"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Mobile Number for OTP & Progress Updates
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98XXX XXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              Detailed Problem Description (विस्तृत समस्या का विवरण)
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe what has happened (e.g. crack on check dam wall, dead fish in pond, dried drinking borewell, water tanker exploitation)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Statutory Notice */}
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-950 font-medium">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              <strong>Automated Government Dispatch:</strong> Submitting this report sends an immediate high-priority alert to the local <strong>Gram Panchayat President</strong>, <strong>Minor Irrigation AEE</strong>, and <strong>District Watershed Cell</strong> for mandatory site inspection within 72 hours under SFIC Theme 2 governance protocols.
            </span>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Endangered Zone Alert & Screenshot Proof</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
