import React, { useState } from 'react';
import { CitizenComplaint, WaterBody, OfficerContact } from '../types/nirikshan';
import { InteractiveAndhraMap } from './InteractiveAndhraMap';
import { 
  Building2, 
  AlertTriangle, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  Send,
  X,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface NodalOfficerDashboardProps {
  district: 'Vizianagaram' | 'Parvathipuram Manyam' | 'Visakhapatnam' | string;
  complaints: CitizenComplaint[];
  waterBodies: WaterBody[];
  officers: OfficerContact[];
  onAssignInspector: (complaintId: string, inspectorName: string, inspectorPhone: string) => void;
  onAssignEngineer: (complaintId: string, engineerName: string, engineerPhone: string, deadline: string) => void;
}

export const NodalOfficerDashboard: React.FC<NodalOfficerDashboardProps> = ({
  district,
  complaints,
  waterBodies,
  officers,
  onAssignInspector,
  onAssignEngineer,
}) => {
  const { t, language } = useLanguage();
  const [selectedComplaintForInspector, setSelectedComplaintForInspector] = useState<CitizenComplaint | null>(null);
  const [selectedComplaintForEngineer, setSelectedComplaintForEngineer] = useState<CitizenComplaint | null>(null);

  // Filter staff by district
  const districtInspectors = officers.filter(
    (o) => o.role === 'Inspector' && (o.district === district || o.district === 'State Level (AP)')
  );
  const districtEngineers = officers.filter(
    (o) => o.role === 'Action Engineer' && (o.district === district || o.district === 'State Level (AP)')
  );

  const [selectedInspectorId, setSelectedInspectorId] = useState<string>(
    districtInspectors[0]?.id || ''
  );
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>(
    districtEngineers[0]?.id || ''
  );
  const [engineerDeadline, setEngineerDeadline] = useState('2026-10-08');

  // Filter complaints strictly for this district
  const districtComplaints = complaints.filter((c) => c.district === district);
  const districtWaterBodies = waterBodies.filter((w) => w.district === district);

  // Status counters
  const pendingInspectionCount = districtComplaints.filter((c) => c.status === 'SUBMITTED').length;
  const inInspectionCount = districtComplaints.filter((c) => c.status === 'INSPECTOR_ASSIGNED').length;
  const readyForEngineerCount = districtComplaints.filter((c) => c.status === 'INSPECTION_COMPLETED').length;
  const inActionCount = districtComplaints.filter((c) => c.status === 'WORKER_IN_PROGRESS').length;
  const resolvedCount = districtComplaints.filter((c) => c.status === 'RESOLVED').length;

  const handleConfirmAssignInspector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintForInspector) return;

    const inspector = districtInspectors.find((i) => i.id === selectedInspectorId) || districtInspectors[0];
    if (inspector) {
      onAssignInspector(selectedComplaintForInspector.id, inspector.name, inspector.phone);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    setSelectedComplaintForInspector(null);
  };

  const handleConfirmAssignEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintForEngineer) return;

    const engineer = districtEngineers.find((e) => e.id === selectedEngineerId) || districtEngineers[0];
    if (engineer) {
      onAssignEngineer(
        selectedComplaintForEngineer.id,
        engineer.name,
        engineer.phone,
        engineerDeadline
      );
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    setSelectedComplaintForEngineer(null);
  };

  return (
    <div className="space-y-6">
      {/* Nodal Officer Banner */}
      <div className="bg-gradient-to-r from-[#1b2a4a] via-[#0047ab] to-sky-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-sky-200 border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-sky-300" />
            <span>DISTRICT NODAL WATER REDRESSAL CELL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {district} District Nodal Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-sky-200">
            Jurisdiction: <span className="underline font-bold">{district} District Territory Only</span>. Rapid citizen grievance triage, inspector field dispatches, and action worker work orders.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-sky-200 font-bold block">NEW UNASSIGNED</span>
            <span className="text-lg font-bold text-amber-300">{pendingInspectionCount}</span>
          </div>
          <div className="bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-sky-200 font-bold block">INSPECTIONS ACTIVE</span>
            <span className="text-lg font-bold text-sky-200">{inInspectionCount}</span>
          </div>
          <div className="bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-sky-200 font-bold block">WORKERS IN FIELD</span>
            <span className="text-lg font-bold text-rose-300">{inActionCount}</span>
          </div>
          <div className="bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-center">
            <span className="text-[10px] text-sky-200 font-bold block">RESOLVED</span>
            <span className="text-lg font-bold text-emerald-400">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Geospatial Map Restricted Exclusively to this District */}
      <InteractiveAndhraMap
        waterBodies={districtWaterBodies}
        complaints={districtComplaints}
        currentRole={
          district === 'Vizianagaram' 
            ? 'nodal_vizianagaram' 
            : district === 'Visakhapatnam'
            ? 'nodal_visakhapatnam'
            : 'nodal_parvathipuram'
        }
        districtFilter={district}
      />

      {/* District Complaints Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{district} Citizen Complaints Triage Queue</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Review citizen complaints, immediately assign Field Inspectors to verify situation, and deploy Action Engineers.
            </p>
          </div>
        </div>

        {/* Complaints Table/Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {districtComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold bg-[#0047ab] text-white px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    c.status === 'SUBMITTED'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : c.status === 'INSPECTOR_ASSIGNED'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : c.status === 'INSPECTION_COMPLETED'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : c.status === 'WORKER_IN_PROGRESS'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {c.locationLandmark}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mandal: <strong>{c.mandal}</strong> • Village: {c.village}
                  </p>
                </div>

                {/* Citizen Details */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <div>
                    <strong>Reporter:</strong> {c.citizenName} ({c.citizenAge}y, {c.citizenGender})
                  </div>
                  <div>
                    <strong>Phone:</strong> <a href={`tel:${c.citizenPhone}`} className="text-[#0047ab] font-bold underline">{c.citizenPhone}</a>
                  </div>
                  <div className="pt-1 text-slate-800 italic">
                    "{c.shortDescription}"
                  </div>
                </div>

                {/* Photo Preview if any */}
                {c.photoUrl && (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-200">
                    <img src={c.photoUrl} alt="Citizen Evidence" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      GPS: {c.coordinates.lat.toFixed(4)}°N, {c.coordinates.lng.toFixed(4)}°E
                    </span>
                  </div>
                )}

                {/* Inspection Report Snippet if completed */}
                {c.inspectionReport && (
                  <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-lg text-[11px] space-y-1 text-sky-950">
                    <div className="font-bold flex items-center justify-between">
                      <span>Inspector Findings:</span>
                      <span className="text-emerald-700">TDS: {c.inspectionReport.tdsReadingPpm} ppm</span>
                    </div>
                    <div>
                      <strong>Waste:</strong> {c.inspectionReport.wasteLevel} ({c.inspectionReport.wasteType})
                    </div>
                    <div>
                      <strong>Origin:</strong> {c.inspectionReport.sourcePinDescription}
                    </div>
                    <div className="text-emerald-800 font-semibold italic">
                      "{c.inspectionReport.validationRemarks}"
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* 1. If SUBMITTED -> Assign Inspector immediately */}
                {c.status === 'SUBMITTED' && (
                  <button
                    onClick={() => setSelectedComplaintForInspector(c)}
                    className="w-full py-2 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {language === 'hi' ? 'फील्ड इंस्पेक्टर नियुक्त करें' : language === 'te' ? 'ఫీల్డ్ ఇన్స్పెక్టర్‌ను కేటాయించండి' : 'Assign Field Inspector'}
                    </span>
                  </button>
                )}

                {/* 2. If INSPECTOR_ASSIGNED -> Waiting for inspection report */}
                {c.status === 'INSPECTOR_ASSIGNED' && (
                  <div className="w-full py-2 bg-blue-50 text-blue-800 text-xs font-semibold rounded-lg text-center border border-blue-200 flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Inspector {c.assignedInspector} on Field...</span>
                  </div>
                )}

                {/* 3. If INSPECTION_COMPLETED -> Assign Action Engineer */}
                {c.status === 'INSPECTION_COMPLETED' && (
                  <button
                    onClick={() => setSelectedComplaintForEngineer(c)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Deploy Action Engineer / Worker</span>
                  </button>
                )}

                {/* 4. If WORKER_IN_PROGRESS */}
                {c.status === 'WORKER_IN_PROGRESS' && (
                  <div className="w-full py-2 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg text-center border border-amber-200">
                    Engineer {c.assignedEngineer} executing remedial works
                  </div>
                )}

                {/* 4b. If VERIFICATION_PENDING */}
                {c.status === 'VERIFICATION_PENDING' && (
                  <div className="w-full py-2 bg-indigo-50 text-indigo-900 text-xs font-semibold rounded-lg text-center border border-indigo-200 flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>वर्कर ने सबूत अपलोड किया • इंस्पेक्टर का भौतिक सत्यापन प्रतीक्षारत</span>
                  </div>
                )}

                {/* 5. If RESOLVED */}
                {c.status === 'RESOLVED' && (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg text-center border border-emerald-200 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Remediated & Closed</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Assign Inspector Modal */}
      {selectedComplaintForInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#0047ab] text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Assign Field Inspector • {district}</span>
              </h4>
              <button onClick={() => setSelectedComplaintForInspector(null)}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignInspector} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">COMPLAINT TICKET:</span>
                <span className="font-bold text-slate-900">{selectedComplaintForInspector.id}</span>
                <p className="text-slate-600 mt-1">{selectedComplaintForInspector.locationLandmark}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Field Inspector</label>
                <select
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                >
                  {districtInspectors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} ({ins.phone}) — {ins.officeAddress.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-200">
                The Inspector will receive an instant dispatch alert to visit the GPS coordinates, test water TDS with machine, identify waste source, and submit an evidence report.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintForInspector(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Inspector Immediately</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Action Engineer Modal */}
      {selectedComplaintForEngineer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>Deploy Action Engineer / Worker • {district}</span>
              </h4>
              <button onClick={() => setSelectedComplaintForEngineer(null)}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignEngineer} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">COMPLAINT & SITE:</span>
                <span className="font-bold text-slate-900">{selectedComplaintForEngineer.id}</span>
                <p className="text-slate-600 mt-1">{selectedComplaintForEngineer.locationLandmark}</p>
                {selectedComplaintForEngineer.inspectionReport && (
                  <p className="text-rose-700 font-bold mt-1">
                    Hazard: {selectedComplaintForEngineer.inspectionReport.wasteType} (TDS: {selectedComplaintForEngineer.inspectionReport.tdsReadingPpm} ppm)
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Action Engineer / Execution Wing</label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                >
                  {districtEngineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} ({eng.phone}) — {eng.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Strict Completion Deadline (tumko es tarik tak kaam karna hai)
                </label>
                <input
                  type="date"
                  required
                  value={engineerDeadline}
                  onChange={(e) => setEngineerDeadline(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-rose-50 text-rose-900 rounded-lg border border-rose-200">
                The Action Engineer must accept the task on their mobile dashboard, take a "Before Work Photo", complete the physical cleanup / repair before the deadline, and upload an "After Work Photo" for re-verification.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaintForEngineer(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Issue Execution Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
