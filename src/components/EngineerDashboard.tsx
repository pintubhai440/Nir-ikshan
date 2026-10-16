import React, { useState } from 'react';
import { CitizenComplaint, WaterBody, EngineerWorkExecution } from '../types/nirikshan';
import { InteractiveAndhraMap } from './InteractiveAndhraMap';
import { 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock, 
  Camera, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Send, 
  X, 
  Phone,
  Building,
  Check,
  Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface EngineerDashboardProps {
  complaints: CitizenComplaint[];
  waterBodies: WaterBody[];
  onAcceptTask: (complaintId: string, beforePhotoUrl: string) => void;
  onBlockTask: (complaintId: string, reason: string) => void;
  onCompleteTask: (complaintId: string, afterPhotoUrl: string, workSummary: string) => void;
}

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  complaints,
  waterBodies,
  onAcceptTask,
  onBlockTask,
  onCompleteTask,
}) => {
  const { t, language } = useLanguage();
  const [selectedTaskToAccept, setSelectedTaskToAccept] = useState<CitizenComplaint | null>(null);
  const [selectedTaskToBlock, setSelectedTaskToBlock] = useState<CitizenComplaint | null>(null);
  const [selectedTaskToComplete, setSelectedTaskToComplete] = useState<CitizenComplaint | null>(null);

  // Form states
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  );
  const [blockReason, setBlockReason] = useState('');
  const [workSummary, setWorkSummary] = useState('');

  // Tasks assigned to engineers
  const assignedTasks = complaints.filter(
    (c) =>
      c.status === 'INSPECTION_COMPLETED' ||
      c.status === 'ACTION_ASSIGNED' ||
      c.status === 'WORKER_IN_PROGRESS' ||
      c.status === 'VERIFICATION_PENDING' ||
      c.workExecution !== undefined
  );

  const handleConfirmAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToAccept) return;
    onAcceptTask(selectedTaskToAccept.id, beforePhotoUrl);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setSelectedTaskToAccept(null);
  };

  const handleConfirmBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToBlock) return;
    onBlockTask(selectedTaskToBlock.id, blockReason || 'Engineer on emergency medical leave.');
    setSelectedTaskToBlock(null);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToComplete) return;
    onCompleteTask(
      selectedTaskToComplete.id,
      afterPhotoUrl,
      workSummary || 'Cleaned inlet, removed 2.4 tonnes of plastic & silt debris, restored normal flow.'
    );
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    setSelectedTaskToComplete(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Worker Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-[#1b2a4a] text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-amber-300 border border-white/10">
            <Wrench className="w-3.5 h-3.5" />
            <span>ACTION WORKER & REMEDIAL ENGINEERING ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
            {language === 'hi' ? 'एक्शन इंजीनियर मोबाइल कार्यक्षेत्र' : language === 'te' ? 'ఫీల్డ్ ఇంజనీరింగ్ వర్క్‌స్పేస్' : 'Action Engineer Mobile Workspace'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100">
            Field execution protocol: Review tasks, inspect strict deadlines, accept with "Before-Work" condition photograph, or block with reason. Upload "After-Work" proof to submit for re-inspection.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-amber-300 font-bold block">ASSIGNED JOBS</span>
            <span className="text-lg font-bold text-white">{assignedTasks.length}</span>
          </div>
          <div className="bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] text-emerald-300 font-bold block">ACTIVE IN PROGRESS</span>
            <span className="text-lg font-bold text-white">
              {assignedTasks.filter((t) => t.status === 'WORKER_IN_PROGRESS').length}
            </span>
          </div>
        </div>
      </div>

      {/* Geospatial Map for Action Worker */}
      <InteractiveAndhraMap
        waterBodies={waterBodies}
        complaints={assignedTasks}
        currentRole="engineer"
      />

      {/* Task Queue Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Wrench className="w-4 h-4" />
              </span>
              <span>Assigned Work Orders & Strict Deadlines ({assignedTasks.length})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Accept jobs before work start, attach photographic evidence, or declare reason if blocked.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedTasks.map((t) => {
            const isBlocked = t.workExecution?.status === 'BLOCKED';
            const isInProgress = t.status === 'WORKER_IN_PROGRESS';
            const isCompleted = t.workExecution?.status === 'COMPLETED' || t.status === 'VERIFICATION_PENDING';
            const isPendingAccept = !t.workExecution || t.workExecution.status === 'PENDING_ACCEPTANCE';
            const deadline = t.workExecution?.deadline || '2026-10-06';

            return (
              <div
                key={t.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between ${
                  isBlocked ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="p-4 space-y-3">
                  {/* Top Bar with Deadline Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#1b2a4a] text-white px-2 py-0.5 rounded">
                      TASK #{t.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>DEADLINE: {deadline}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{t.locationLandmark}</h4>
                    <p className="text-xs text-slate-500">{t.district} • {t.mandal}</p>
                  </div>

                  {/* Inspector Diagnostic Snippet */}
                  {t.inspectionReport && (
                    <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-lg text-[11px] text-sky-950 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span>Inspector Findings:</span>
                        <span className="text-blue-700">TDS: {t.inspectionReport.tdsReadingPpm} ppm</span>
                      </div>
                      <div>
                        <strong>Hazard:</strong> {t.inspectionReport.wasteLevel} {t.inspectionReport.wasteType}
                      </div>
                      <div>
                        <strong>Source:</strong> {t.inspectionReport.sourcePinDescription}
                      </div>
                    </div>
                  )}

                  {/* Photos Grid if present */}
                  {t.workExecution && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
                      <div>
                        <span className="font-bold text-slate-500 block mb-0.5">BEFORE WORK PHOTO</span>
                        <img
                          src={t.workExecution.beforePhotoUrl || t.photoUrl}
                          alt="Before Work"
                          className="w-full h-24 rounded object-cover border border-slate-200"
                        />
                      </div>
                      {t.workExecution.afterPhotoUrl && (
                        <div>
                          <span className="font-bold text-emerald-700 block mb-0.5">AFTER WORK PHOTO</span>
                          <img
                            src={t.workExecution.afterPhotoUrl}
                            alt="After Work"
                            className="w-full h-24 rounded object-cover border border-emerald-300"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Blocked message if blocked */}
                  {isBlocked && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900">
                      <strong>Task Blocked by Worker:</strong> {t.workExecution?.blockReason}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Option A: Pending Acceptance */}
                  {isPendingAccept && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => setSelectedTaskToBlock(t)}
                        className="flex-1 py-2 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block Task</span>
                      </button>
                      <button
                        onClick={() => setSelectedTaskToAccept(t)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Start Work</span>
                      </button>
                    </div>
                  )}

                  {/* Option B: In Progress -> Upload After Photo */}
                  {isInProgress && (
                    <button
                      onClick={() => setSelectedTaskToComplete(t)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>
                        {language === 'hi' ? 'कार्य समाप्ति का फोटो अपलोड करें एवं कार्य पूरा करें' : language === 'te' ? 'పని పూర్తయిన ఫోటోను అప్‌లోడ్ చేసి పూర్తి చేయండి' : 'Upload "After Work Photo" & Finish Job'}
                      </span>
                    </button>
                  )}

                  {/* Option C: Completed awaiting Inspector Re-Verification */}
                  {isCompleted && (
                    <div className="w-full py-2 bg-blue-50 text-blue-800 text-xs font-semibold rounded-lg text-center border border-blue-200 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Sent to Inspector for Site Re-Verification</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal 1: Accept Task with Before Photo */}
      {selectedTaskToAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Accept Job & Upload Before-Work Photo</span>
              </h4>
              <button onClick={() => setSelectedTaskToAccept(null)}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmAccept} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">{selectedTaskToAccept.locationLandmark}</span>
                <span className="text-[11px] text-slate-500">Task #{selectedTaskToAccept.id}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Kaam Shuru Karne Se Pehle Ka Photo (Before Work Condition Photo)
                </label>
                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-300">
                  <img src={beforePhotoUrl} alt="Before Work" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                    INITIAL SITE STATE
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                Accepting this task will officially start the work in progress timer. You must complete remedial action before the assigned deadline.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToAccept(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Acceptance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Block Task Reason */}
      {selectedTaskToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <span>{language === 'hi' ? 'कार्य रोकने / असमर्थता का कारण दर्ज करें' : language === 'te' ? 'పని నిలిపివేతకు కారణాన్ని తెలపండి' : 'Declare Block Reason'}</span>
              </h4>
              <button onClick={() => setSelectedTaskToBlock(null)}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmBlock} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">{selectedTaskToBlock.locationLandmark}</span>
                <span className="text-[11px] text-slate-500">Task #{selectedTaskToBlock.id}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'असमर्थता अथवा देरी का कारण' : language === 'te' ? 'ఆలస్యానికి లేదా నిలిపివేతకు కారణం' : 'Reason for Inability / Delay'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="State reason: e.g. on sanctioned medical leave / flood alert prevents safe excavation..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToBlock(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Submit Block Notice to Nodal Officer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Complete Work with After Photo */}
      {selectedTaskToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#0047ab] text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>{language === 'hi' ? 'कार्य समाप्ति का फोटो प्रमाण अपलोड करें' : language === 'te' ? 'పని పూర్తయిన ఫోటో సాక్ష్యాన్ని అప్‌లోడ్ చేయండి' : 'Upload After-Work Photo Proof'}</span>
              </h4>
              <button onClick={() => setSelectedTaskToComplete(null)}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmComplete} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">{selectedTaskToComplete.locationLandmark}</span>
                <span className="text-[11px] text-slate-500">Task #{selectedTaskToComplete.id}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Kaam Khatam Hone Ke Baad Ka Image Proof (After Work Photo)
                </label>
                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-slate-300">
                  <img src={afterPhotoUrl} alt="After Work" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                    COMPLETED REMEDIATION PROOF
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Summary of Physical Work Executed
                </label>
                <textarea
                  required
                  rows={2}
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  placeholder="e.g. Silt cleared, damaged masonry apron patched with M25 concrete, flow restored."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToComplete(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0047ab] hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send for Inspector Verification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
