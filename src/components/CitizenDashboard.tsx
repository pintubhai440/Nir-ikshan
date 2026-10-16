import React, { useState } from 'react';
import { CitizenComplaint, WaterBody } from '../types/nirikshan';
import { InteractiveAndhraMap } from './InteractiveAndhraMap';
import { useLanguage } from '../context/LanguageContext';
import { 
  AlertTriangle, 
  Search, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  UserCheck,
  Wrench
} from 'lucide-react';

interface CitizenDashboardProps {
  complaints: CitizenComplaint[];
  waterBodies: WaterBody[];
  onOpenLodgeModal: () => void;
  onOpenDirectoryModal: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  complaints,
  waterBodies,
  onOpenLodgeModal,
  onOpenDirectoryModal,
}) => {
  const { t } = useLanguage();
  const [searchPhone, setSearchPhone] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<CitizenComplaint | null>(complaints[0] || null);

  const myComplaints = searchPhone.trim()
    ? complaints.filter((c) => c.citizenPhone.includes(searchPhone.trim()) || c.id.toLowerCase().includes(searchPhone.toLowerCase()))
    : complaints;

  const getStatusStepNumber = (status: CitizenComplaint['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return 1;
      case 'INSPECTOR_ASSIGNED':
        return 2;
      case 'INSPECTION_COMPLETED':
      case 'ACTION_ASSIGNED':
        return 3;
      case 'WORKER_IN_PROGRESS':
        return 4;
      case 'VERIFICATION_PENDING':
        return 5;
      case 'RESOLVED':
        return 6;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-sky-200 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('citizenHeroTag')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t('citizenHeroTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-sky-200 leading-relaxed font-normal">
            {t('citizenHeroDesc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onOpenLodgeModal}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-102 active:scale-98 animate-pulse cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('lodgeComplaint')}</span>
          </button>

          <button
            onClick={onOpenDirectoryModal}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 text-sky-300" />
            <span>{t('officersDirectory')}</span>
          </button>
        </div>
      </div>

      {/* Geospatial Map Section */}
      <InteractiveAndhraMap
        waterBodies={waterBodies}
        complaints={complaints}
        currentRole="user"
        onLodgeComplaint={onOpenLodgeModal}
      />

      {/* Citizen Complaint Status Tracker Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0047ab]" />
              <span>{t('trackStatusTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('trackStatusDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none w-56 font-semibold"
            />
          </div>
        </div>

        {/* Complaints Grid & Active Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Complaints List Column */}
          <div className="space-y-3 lg:col-span-1 max-h-[460px] overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {t('activeComplaints')} ({myComplaints.length})
            </span>

            {myComplaints.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                {t('noComplaintsFound')} "{searchPhone}".
              </div>
            ) : (
              myComplaints.map((c) => {
                const isSelected = trackedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setTrackedComplaint(c)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#0047ab] shadow-xs ring-1 ring-[#0047ab]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {c.id}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {c.submittedAt.split(' ')[0]}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 truncate">{c.locationLandmark}</h5>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{c.shortDescription}</p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-600">{c.district}</span>
                      <span className="font-bold text-[#0047ab] flex items-center gap-1">
                        <span>{c.status.replace(/_/g, ' ')}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Complaint Detailed Stepper Column */}
          {trackedComplaint && (
            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-[#0047ab] text-white px-2 py-0.5 rounded">
                        {trackedComplaint.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {trackedComplaint.district} • {trackedComplaint.mandal}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {trackedComplaint.locationLandmark}
                    </h4>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    Logged: {trackedComplaint.submittedAt}
                  </span>
                </div>

                {/* Progress Stepper Bar */}
                <div className="pt-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                    Redressal Progress Lifecycle
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    {/* Step 1 */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="text-[10px] font-bold text-emerald-600 mb-0.5">{t('stepSubmitted')}</div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto my-1" />
                      <div className="text-[10px] text-slate-600">{trackedComplaint.citizenName}</div>
                    </div>

                    {/* Step 2 */}
                    <div className={`p-2.5 rounded-lg border shadow-2xs ${
                      getStatusStepNumber(trackedComplaint.status) >= 2
                        ? 'bg-white border-blue-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-bold mb-0.5 ${
                        getStatusStepNumber(trackedComplaint.status) >= 2 ? 'text-[#0047ab]' : 'text-slate-400'
                      }`}>
                        {t('stepInspectorAssigned')}
                      </div>
                      <UserCheck className={`w-4 h-4 mx-auto my-1 ${
                        getStatusStepNumber(trackedComplaint.status) >= 2 ? 'text-[#0047ab]' : 'text-slate-400'
                      }`} />
                      <div className="text-[10px] text-slate-600 truncate">
                        {trackedComplaint.assignedInspector || 'Pending Assign'}
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`p-2.5 rounded-lg border shadow-2xs ${
                      getStatusStepNumber(trackedComplaint.status) >= 4
                        ? 'bg-white border-blue-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-bold mb-0.5 ${
                        getStatusStepNumber(trackedComplaint.status) >= 4 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {t('stepActionAssigned')}
                      </div>
                      <Wrench className={`w-4 h-4 mx-auto my-1 ${
                        getStatusStepNumber(trackedComplaint.status) >= 4 ? 'text-amber-600' : 'text-slate-400'
                      }`} />
                      <div className="text-[10px] text-slate-600 truncate">
                        {trackedComplaint.assignedEngineer || 'Awaiting Engineer'}
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className={`p-2.5 rounded-lg border shadow-2xs ${
                      trackedComplaint.status === 'RESOLVED'
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      <div className={`text-[10px] font-bold mb-0.5 ${
                        trackedComplaint.status === 'RESOLVED' ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {t('stepResolved')}
                      </div>
                      <CheckCircle2 className={`w-4 h-4 mx-auto my-1 ${
                        trackedComplaint.status === 'RESOLVED' ? 'text-emerald-600' : 'text-slate-400'
                      }`} />
                      <div className="text-[10px] text-slate-600">
                        {trackedComplaint.status === 'RESOLVED' ? 'Verified by Inspector' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Photo & Officer Findings */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Citizen Evidence Photo
                    </span>
                    <img
                      src={trackedComplaint.photoUrl}
                      alt="Citizen Proof"
                      className="w-full h-28 rounded object-cover border border-slate-200"
                    />
                    <div className="mt-1.5 text-[11px] text-slate-700">
                      <strong>Description:</strong> {trackedComplaint.shortDescription}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Inspection Findings
                    </span>
                    {trackedComplaint.inspectionReport ? (
                      <>
                        <div>
                          <strong>Inspector:</strong> {trackedComplaint.inspectionReport.inspectorName} ({trackedComplaint.inspectionReport.inspectorPhone})
                        </div>
                        <div>
                          <strong>TDS Machine Reading:</strong>{' '}
                          <span className="font-bold text-[#0047ab]">
                            {trackedComplaint.inspectionReport.tdsReadingPpm} ppm
                          </span>
                        </div>
                        <div>
                          <strong>Waste Level:</strong> {trackedComplaint.inspectionReport.wasteLevel} ({trackedComplaint.inspectionReport.wasteType})
                        </div>
                        <div>
                          <strong>Source Pin:</strong> {trackedComplaint.inspectionReport.sourcePinDescription}
                        </div>
                        <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                          {trackedComplaint.inspectionReport.validationRemarks}
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 italic py-6 text-center">
                        Field Inspector dispatched to conduct TDS and Waste Source investigation.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nodal Officer Contact Bar */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">ASSIGNED NODAL CELL</span>
                  <span className="font-bold text-slate-800">{trackedComplaint.assignedNodalOfficer}</span>
                </div>
                <button
                  onClick={onOpenDirectoryModal}
                  className="px-3 py-1.5 bg-[#0047ab] text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Contact Nodal Officer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
