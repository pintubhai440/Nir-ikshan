import React, { useState } from 'react';
import { CitizenComplaint } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { formatStepTimestamp } from '../utils/slaTimer';
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Sparkles 
} from 'lucide-react';

interface ComplaintWorkflowTimelineProps {
  complaint: CitizenComplaint;
  onOpenWorkflowAction?: (stepToTrigger?: number) => void;
  onOpenPhotoPreview?: (data: { url: string; title: string; subtitle?: string }) => void;
}

const TIMELINE_TEXT = {
  en: {
    trackerTitle: 'End-to-End Operational Lifecycle Tracker',
    stagePrefix: 'Stage',
    of: 'of',
    trackerDesc: 'Complete real-time audit trail from initial citizen complaint to final physical inspector verification & certification.',
    collapse: 'Collapse Timeline',
    expand: 'Expand Timeline',
    pending: 'Pending',
    steps: {
      s1BarTitle: '1. Citizen Lodged',
      s2BarTitle: '2. Inspector Assigned',
      s3BarTitle: '3. Field Inspected',
      s4BarTitle: '4. Worker Dispatched',
      s5BarTitle: '5. Work Done Proof',
      s6BarTitle: '6. Re-Verified & Closed',
    }
  },
  hi: {
    trackerTitle: 'कार्य प्रगति एवं संपूर्ण परिचालन चक्र ट्रैकर',
    stagePrefix: 'चरण',
    of: 'कुल',
    trackerDesc: 'नागरिक द्वारा शिकायत दर्ज करने से लेकर इंस्पेक्टर द्वारा अंतिम भौतिक सत्यापन तक का संपूर्ण रियल-टाइम ऑडिट ट्रेल।',
    collapse: 'टाइमलाइन समेटें',
    expand: 'टाइमलाइन विस्तार करें',
    pending: 'लंबित',
    steps: {
      s1BarTitle: '1. नागरिक द्वारा दर्ज',
      s2BarTitle: '2. इंस्पेक्टर नियुक्त',
      s3BarTitle: '3. फील्ड जांच पूर्ण',
      s4BarTitle: '4. वर्कर/मशीन तैनात',
      s5BarTitle: '5. काम पूरा सबूत',
      s6BarTitle: '6. सत्यापित व बंद',
    }
  },
  te: {
    trackerTitle: 'పని పురోగతి & సంపూర్ణ కార్యాచరణ సైకిల్ ట్రాకర్',
    stagePrefix: 'దశ',
    of: 'మొత్తం',
    trackerDesc: 'పౌరుడి ఫిర్యాదు నమోదు నుండి ఫీల్డ్ ఇన్‌స్పెక్టర్ తుది భౌతిక తనిఖీ మరియు ధృవీకరణ వరకు పూర్తి రియల్-టైమ్ ఆడిట్ ట్రయల్.',
    collapse: 'టైమ్‌లైన్ కుదించు',
    expand: 'టైమ్‌లైన్ విస్తరించు',
    pending: 'పెండింగ్‌లో ఉంది',
    steps: {
      s1BarTitle: '1. పౌరుడు నమోదు',
      s2BarTitle: '2. ఇన్‌స్పెక్టర్ నియామకం',
      s3BarTitle: '3. ఫీల్డ్ తనిఖీ పూర్తయింది',
      s4BarTitle: '4. వర్కర్ కేటాయింపు',
      s5BarTitle: '5. పని పూర్తి సాక్ష్యం',
      s6BarTitle: '6. ధృవీకరించి ముగింపు',
    }
  }
};

export const ComplaintWorkflowTimeline: React.FC<ComplaintWorkflowTimelineProps> = ({
  complaint,
}) => {
  const { language } = useLanguage();
  const langKey = (language === 'hi' || language === 'te') ? language : 'en';
  const txt = TIMELINE_TEXT[langKey];

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const hasInspectorAssigned = Boolean(
    complaint.assignedInspector || 
    complaint.inspectionReport || 
    complaint.status !== 'SUBMITTED'
  );

  const hasInspectionDone = Boolean(
    complaint.inspectionReport && 
    (complaint.status === 'INSPECTION_COMPLETED' || 
     complaint.status === 'ACTION_ASSIGNED' || 
     complaint.status === 'WORKER_IN_PROGRESS' || 
     complaint.status === 'VERIFICATION_PENDING' || 
     complaint.status === 'RESOLVED')
  );

  const hasWorkerAssigned = Boolean(
    (complaint.assignedEngineer || complaint.workExecution) && 
    (complaint.status === 'ACTION_ASSIGNED' || 
     complaint.status === 'WORKER_IN_PROGRESS' || 
     complaint.status === 'VERIFICATION_PENDING' || 
     complaint.status === 'RESOLVED')
  );

  const hasWorkerProofUploaded = Boolean(
    complaint.workExecution?.afterPhotoUrl || 
    complaint.status === 'VERIFICATION_PENDING' || 
    complaint.status === 'RESOLVED'
  );

  const isFullyResolved = complaint.status === 'RESOLVED';

  // Compute current active milestone index (1 to 6)
  let currentStep = 1;
  if (isFullyResolved) currentStep = 6;
  else if (hasWorkerProofUploaded) currentStep = 5;
  else if (hasWorkerAssigned) currentStep = 4;
  else if (hasInspectionDone) currentStep = 3;
  else if (hasInspectorAssigned) currentStep = 2;

  // Exact Timestamps & Relative Delays across the full 6-step statutory chain
  const s1Stamp = formatStepTimestamp(complaint.submittedAt);
  const s2Stamp = formatStepTimestamp(
    complaint.assignedInspectorAt || (hasInspectorAssigned ? complaint.submittedAt : undefined),
    complaint.submittedAt,
    'after filing'
  );
  const s3Stamp = formatStepTimestamp(
    complaint.inspectionReport?.inspectedAt || (hasInspectionDone ? complaint.assignedInspectorAt || complaint.submittedAt : undefined),
    complaint.assignedInspectorAt || complaint.submittedAt,
    'from dispatch'
  );
  const s4Stamp = formatStepTimestamp(
    complaint.workExecution?.assignedAt || complaint.assignedEngineerAt || (hasWorkerAssigned ? complaint.inspectionReport?.inspectedAt : undefined),
    complaint.inspectionReport?.inspectedAt || complaint.assignedInspectorAt || complaint.submittedAt,
    'from verification'
  );
  const s5Stamp = formatStepTimestamp(
    complaint.workExecution?.completedAt || (hasWorkerProofUploaded ? complaint.submittedAt : undefined),
    complaint.workExecution?.assignedAt || complaint.assignedEngineerAt || complaint.inspectionReport?.inspectedAt,
    'work duration'
  );
  const s6Stamp = formatStepTimestamp(
    complaint.inspectionReport?.postWorkVerification?.verifiedAt || complaint.resolvedAt || (isFullyResolved ? complaint.submittedAt : undefined),
    complaint.workExecution?.completedAt || complaint.workExecution?.assignedAt,
    'final sign-off'
  );

  const steps = [
    {
      stepNumber: 1,
      timeOnly: s1Stamp.timeOnly,
      diff: undefined,
      isCompleted: true,
      isActive: currentStep === 1,
      barTitle: txt.steps.s1BarTitle,
    },
    {
      stepNumber: 2,
      timeOnly: hasInspectorAssigned ? s2Stamp.timeOnly : '--:--',
      diff: hasInspectorAssigned ? s2Stamp.diffFromBaseline : undefined,
      isCompleted: hasInspectorAssigned,
      isActive: currentStep === 2,
      barTitle: txt.steps.s2BarTitle,
    },
    {
      stepNumber: 3,
      timeOnly: hasInspectionDone ? s3Stamp.timeOnly : '--:--',
      diff: hasInspectionDone ? s3Stamp.diffFromBaseline : undefined,
      isCompleted: hasInspectionDone,
      isActive: currentStep === 3,
      barTitle: txt.steps.s3BarTitle,
    },
    {
      stepNumber: 4,
      timeOnly: hasWorkerAssigned ? s4Stamp.timeOnly : '--:--',
      diff: hasWorkerAssigned ? s4Stamp.diffFromBaseline : undefined,
      isCompleted: hasWorkerAssigned,
      isActive: currentStep === 4,
      barTitle: txt.steps.s4BarTitle,
    },
    {
      stepNumber: 5,
      timeOnly: hasWorkerProofUploaded ? s5Stamp.timeOnly : txt.pending,
      diff: hasWorkerProofUploaded ? s5Stamp.diffFromBaseline : undefined,
      isCompleted: hasWorkerProofUploaded,
      isActive: currentStep === 5,
      barTitle: txt.steps.s5BarTitle,
    },
    {
      stepNumber: 6,
      timeOnly: isFullyResolved ? s6Stamp.timeOnly : txt.pending,
      diff: isFullyResolved ? s6Stamp.diffFromBaseline : undefined,
      isCompleted: isFullyResolved,
      isActive: currentStep === 6,
      barTitle: txt.steps.s6BarTitle,
    }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
      {/* Tracker Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0077B6]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                {txt.trackerTitle}
              </h4>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 font-mono">
                {txt.stagePrefix} {currentStep} {txt.of} 6
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {txt.trackerDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            title={isExpanded ? txt.collapse : txt.expand}
          >
            <span className="text-[11px]">{isExpanded ? txt.collapse : txt.expand}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 6-Step Visual Horizontal Stepper Bar */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((st) => {
            const isDone = st.isCompleted;
            const isCurrent = st.isActive;

            return (
              <div
                key={st.stepNumber}
                className={`p-2.5 rounded-xl border transition-all relative ${
                  isCurrent 
                    ? 'bg-sky-50/80 border-[#0077B6] ring-2 ring-sky-200 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200/80 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-[#0077B6] text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {st.stepNumber}
                  </span>

                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping inline-block" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-400" />
                  )}
                </div>

                <div className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-snug">
                  {st.barTitle}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono mt-1 gap-1">
                  <span className="text-slate-600 truncate">{st.isCompleted ? st.timeOnly : txt.pending}</span>
                  {st.diff && (
                    <span className="text-[9px] font-black font-mono px-1 py-0.2 rounded bg-sky-100 text-[#0077B6] shrink-0" title={st.diff}>
                      {st.diff.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
