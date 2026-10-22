import React, { useState } from 'react';
import { CitizenComplaint } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { formatStepTimestamp } from '../utils/slaTimer';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Camera, 
  UserCheck, 
  Wrench, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  AlertCircle,
  Truck,
  Eye,
  FileCheck2,
  Maximize2,
  ArrowRight
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
    btnAdvance: 'Advance Stage',
    collapse: 'Collapse Timeline',
    expand: 'Expand Timeline',
    pending: 'Pending',
    visualProofAudit: 'Visual Proof Audit: Before vs After',
    tabBoth: 'Both Side-by-Side',
    tabBefore: 'Before (Citizen)',
    tabAfter: 'After (Cleaned)',
    beforeLabel: 'BEFORE: Citizen Complaint Photo',
    afterLabel: 'AFTER: Remediation Completion Proof',
    clickToZoom: 'Click to Zoom',
    noBeforePhoto: 'No Before Photo Uploaded',
    awaitingWorkerProof: 'Awaiting Worker Completion Proof',
    awaitingWorkerDesc: 'Worker/Engineer will upload photo upon site clearing',
    uploadProofNow: 'Upload Proof Now',
    officerPerson: 'Officer / Person:',
    assignedToLabel: 'Assigned To:',
    updateBtn: 'Update',
    steps: {
      s1Title: 'Citizen Filed Complaint',
      s1Sub: 'Citizen lodging with photo & GPS pin',
      s1Role: 'Complainant (Citizen)',
      s1Badge: 'Step 1: Inflow',
      s1BarTitle: '1. Citizen Lodged',
      s2Title: 'Nodal Officer Dispatches Inspector',
      s2Sub: 'Nodal Officer dispatched Field Sanitation Inspector',
      s2Role: 'Assigned By: Nodal Officer',
      s2Badge: 'Step 2: Inspector Dispatch',
      s2BarTitle: '2. Inspector Assigned',
      s3Title: 'Field Inspection & Verification Report',
      s3Sub: 'Physical GPS ground verification & water testing',
      s3Role: 'Field Inspector',
      s3Badge: 'Step 3: Ground Report',
      s3BarTitle: '3. Field Inspected',
      s4Title: 'Nodal Officer Assigns Worker & Machinery',
      s4Sub: 'Remediation crew & machinery work order issued',
      s4Role: 'Assigned By: Nodal Officer',
      s4Badge: 'Step 4: Remediation Order',
      s4BarTitle: '4. Worker Dispatched',
      s5Title: 'Work Done - Worker Proof Uploaded',
      s5Sub: 'Execution completed & After-cleaning photo proof',
      s5Role: 'Action Worker / Contractor Crew',
      s5Badge: 'Step 5: Completion Proof',
      s5BarTitle: '5. Work Done Proof',
      s6Title: 'Final Physical Inspector Re-Verification',
      s6Sub: 'Physical re-inspection & official government sign-off',
      s6Role: 'Field Inspector (Audit)',
      s6Badge: 'Step 6: Closed & Certified',
      s6BarTitle: '6. Re-Verified & Closed',
    }
  },
  hi: {
    trackerTitle: 'कार्य प्रगति एवं संपूर्ण परिचालन चक्र ट्रैकर',
    stagePrefix: 'चरण',
    of: 'कुल',
    trackerDesc: 'नागरिक द्वारा शिकायत दर्ज करने से लेकर इंस्पेक्टर द्वारा अंतिम भौतिक सत्यापन तक का संपूर्ण रियल-टाइम ऑडिट ट्रेल।',
    btnAdvance: 'अगला चरण अपडेट करें',
    collapse: 'टाइमलाइन समेटें',
    expand: 'टाइमलाइन विस्तार करें',
    pending: 'लंबित',
    visualProofAudit: 'भौतिक सबूत तुलना: सफाई से पहले vs सफाई के बाद',
    tabBoth: 'दोनों एक साथ देखें',
    tabBefore: 'पहले (नागरिक फोटो)',
    tabAfter: 'बाद में (सफाई उपरांत फोटो)',
    beforeLabel: 'पहले: नागरिक द्वारा भेजी गई प्रारंभिक फोटो',
    afterLabel: 'बाद में: वर्कर द्वारा कार्य समाप्ति का सबूत',
    clickToZoom: 'बड़ा करके देखें',
    noBeforePhoto: 'कोई प्रारंभिक फोटो उपलब्ध नहीं',
    awaitingWorkerProof: 'वर्कर/इंजीनियर द्वारा कार्य समाप्ति सबूत प्रतीक्षित',
    awaitingWorkerDesc: 'साइट से कचरा हटाने के बाद वर्कर द्वारा नई फोटो अपलोड की जाएगी',
    uploadProofNow: 'अभी सबूत अपलोड करें',
    officerPerson: 'अधिकारी / व्यक्ति:',
    assignedToLabel: 'आवंटित:',
    updateBtn: 'अपडेट करें',
    steps: {
      s1Title: 'नागरिक शिकायत दर्ज (Citizen Filed)',
      s1Sub: 'नागरिक द्वारा फोटो व जीपीएस लोकेशन के साथ शिकायत',
      s1Role: 'शिकायतकर्ता (नागरिक)',
      s1Badge: 'चरण 1: आवक',
      s1BarTitle: '1. नागरिक द्वारा दर्ज',
      s2Title: 'नोडल अधिकारी द्वारा इंस्पेक्टर नियुक्त',
      s2Sub: 'नोडल अधिकारी ने फील्ड इंस्पेक्टर को जांच के लिए भेजा',
      s2Role: 'प्रेषक: नोडल अधिकारी',
      s2Badge: 'चरण 2: इंस्पेक्टर प्रेषण',
      s2BarTitle: '2. इंस्पेक्टर नियुक्त',
      s3Title: 'फील्ड जांच एवं भौतिक रिपोर्ट',
      s3Sub: 'स्थल पर जीपीएस सत्यापन व पानी की जांच',
      s3Role: 'फील्ड इंस्पेक्टर (जांच अधिकारी)',
      s3Badge: 'चरण 3: ग्राउंड रिपोर्ट',
      s3BarTitle: '3. फील्ड जांच पूर्ण',
      s4Title: 'नोडल अधिकारी द्वारा वर्कर व मशीनरी तैनात',
      s4Sub: 'सफाई दल व जेसीबी मशीनरी का कार्य आदेश जारी',
      s4Role: 'प्रेषक: नोडल अधिकारी',
      s4Badge: 'चरण 4: सफाई आदेश',
      s4BarTitle: '4. वर्कर/मशीन तैनात',
      s5Title: 'काम पूरा - वर्कर द्वारा सबूत अपलोड',
      s5Sub: 'कचरा साफ करने के उपरांत फोटो सबूत अपलोड',
      s5Role: 'कार्यकारी वर्कर / ठेकेदार दल',
      s5Badge: 'चरण 5: कार्य पूर्णता सबूत',
      s5BarTitle: '5. काम पूरा सबूत',
      s6Title: 'इंस्पेक्टर द्वारा अंतिम भौतिक सत्यापन',
      s6Sub: 'मौके पर पुनः निरीक्षण व आधिकारिक शासकीय प्रमाणीकरण',
      s6Role: 'फील्ड इंस्पेक्टर (सत्यापन अधिकारी)',
      s6Badge: 'चरण 6: बंद एवं सत्यापित',
      s6BarTitle: '6. सत्यापित व बंद',
    }
  },
  te: {
    trackerTitle: 'పని పురోగతి & సంపూర్ణ కార్యాచరణ సైకిల్ ట్రాకర్',
    stagePrefix: 'దశ',
    of: 'మొత్తం',
    trackerDesc: 'పౌరుడి ఫిర్యాదు నమోదు నుండి ఫీల్డ్ ఇన్‌స్పెక్టర్ తుది భౌతిక తనిఖీ మరియు ధృవీకరణ వరకు పూర్తి రియల్-టైమ్ ఆడిట్ ట్రయల్.',
    btnAdvance: 'తదుపరి దశను అప్‌డేట్ చేయండి',
    collapse: 'టైమ్‌లైన్ కుదించు',
    expand: 'టైమ్‌లైన్ విస్తరించు',
    pending: 'పెండింగ్‌లో ఉంది',
    visualProofAudit: 'భౌతిక సాక్ష్యాల పోలిక: శుభ్రతకు ముందు vs తర్వాత',
    tabBoth: 'రెండూ పక్కపక్కనే',
    tabBefore: 'ముందు (పౌరుడి ఫోటో)',
    tabAfter: 'తర్వాత (శుభ్రపరిచిన ఫోటో)',
    beforeLabel: 'ముందు: పౌరుడు సమర్పించిన ప్రాథమిక ఫోటో',
    afterLabel: 'తర్వాత: వర్కర్ పని పూర్తి చేసిన సాక్ష్యం',
    clickToZoom: 'జూమ్ చేయడానికి క్లిక్ చేయండి',
    noBeforePhoto: 'మునుపటి ఫోటో అందుబాటులో లేదు',
    awaitingWorkerProof: 'వర్కర్ పని ముగింపు సాక్ష్యం కోసం వేచి ఉంది',
    awaitingWorkerDesc: 'ప్రదేశాన్ని శుభ్రం చేసిన తర్వాత వర్కర్ కొత్త ఫోటోను అప్‌లోడ్ చేస్తారు',
    uploadProofNow: 'ఇప్పుడే సాక్ష్యం అప్‌లోడ్ చేయండి',
    officerPerson: 'అధికారి / వ్యక్తి:',
    assignedToLabel: 'కేటాయించబడింది:',
    updateBtn: 'అప్‌డేట్ చేయండి',
    steps: {
      s1Title: 'పౌరుడి ఫిర్యాదు నమోదు',
      s1Sub: 'ఫోటో & GPS పిన్‌తో పౌరుడు దాఖలు చేసిన ఫిర్యాదు',
      s1Role: 'ఫిర్యాదుదారు (పౌరుడు)',
      s1Badge: 'దశ 1: నమోదు',
      s1BarTitle: '1. పౌరుడు నమోదు',
      s2Title: 'నోడల్ అధికారి ఇన్‌స్పెక్టర్‌ను కేటాయించారు',
      s2Sub: 'క్షేత్ర పరిశీలనకు ఫీల్డ్ శానిటేషన్ ఇన్‌స్పెక్టర్ పంపబడ్డారు',
      s2Role: 'కేటాయించినది: నోడల్ అధికారి',
      s2Badge: 'దశ 2: ఇన్‌స్పెక్టర్ నియామకం',
      s2BarTitle: '2. ఇన్‌స్పెక్టర్ నియామకం',
      s3Title: 'ఫీల్డ్ తనిఖీ & నివేదిక సమర్పణ',
      s3Sub: 'క్షేత్రస్థాయి GPS ధృవీకరణ మరియు నీటి నాణ్యత పరీక్ష',
      s3Role: 'ఫీల్డ్ ఇన్‌స్పెక్టర్',
      s3Badge: 'దశ 3: క్షేత్ర నివేదిక',
      s3BarTitle: '3. ఫీల్డ్ తనిఖీ పూర్తయింది',
      s4Title: 'నోడల్ అధికారి వర్కర్ & యంత్రాలను కేటాయించారు',
      s4Sub: 'శుభ్రపరిచే బృందం & యంత్రాల పని ఆదేశం జారీ చేయబడింది',
      s4Role: 'కేటాయించినది: నోడల్ అధికారి',
      s4Badge: 'దశ 4: పని ఉత్తర్వు',
      s4BarTitle: '4. వర్కర్ కేటాయింపు',
      s5Title: 'పని పూర్తయింది - వర్కర్ సాక్ష్యం అప్‌లోడ్',
      s5Sub: 'వ్యర్థాల తొలగింపు & శుభ్రపరిచిన తర్వాత ఫోటో సాక్ష్యం',
      s5Role: 'యాక్షన్ వర్కర్ / కాంట్రాక్టర్ బృందం',
      s5Badge: 'దశ 5: పూర్తి సాక్ష్యం',
      s5BarTitle: '5. పని పూర్తి సాక్ష్యం',
      s6Title: 'ఇన్‌స్పెక్టర్ ద్వారా తుది భౌతిక ధృవీకరణ',
      s6Sub: 'క్షేత్రస్థాయి పునఃపరిశీలన & అధికారిక ప్రభుత్వ ముగింపు',
      s6Role: 'ఫీల్డ్ ఇన్‌స్పెక్టర్ (ఆడిట్)',
      s6Badge: 'దశ 6: ధృవీకరించి మూసివేయబడింది',
      s6BarTitle: '6. ధృవీకరించి ముగింపు',
    }
  }
};

export const ComplaintWorkflowTimeline: React.FC<ComplaintWorkflowTimelineProps> = ({
  complaint,
  onOpenWorkflowAction,
  onOpenPhotoPreview
}) => {
  const { language } = useLanguage();
  const langKey = (language === 'hi' || language === 'te') ? language : 'en';
  const txt = TIMELINE_TEXT[langKey];

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activePhotoTab, setActivePhotoTab] = useState<'before' | 'after' | 'both'>('both');

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

  // Formatting helpers
  const formatTimestamp = (rawDate?: string) => {
    if (!rawDate) return txt.pending;
    try {
      const d = new Date(rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T'));
      if (isNaN(d.getTime())) return rawDate;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST';
    } catch {
      return rawDate;
    }
  };

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
      title: txt.steps.s1Title,
      subtitle: txt.steps.s1Sub,
      actorRole: txt.steps.s1Role,
      actorName: complaint.citizenName || 'Public Citizen',
      phone: complaint.citizenPhone,
      timestamp: s1Stamp.formatted,
      timeOnly: s1Stamp.timeOnly,
      dateOnly: s1Stamp.dateOnly,
      diff: undefined,
      isCompleted: true,
      isActive: currentStep === 1,
      badge: txt.steps.s1Badge,
      barTitle: txt.steps.s1BarTitle,
      color: 'emerald',
      summary: `Reported ${complaint.wasteType || 'pollution'} at ${complaint.locationLandmark}, ${complaint.village}.`,
      proofPhoto: complaint.photoUrl,
      proofPhotoLabel: 'Citizen Ground Photo'
    },
    {
      stepNumber: 2,
      title: txt.steps.s2Title,
      subtitle: txt.steps.s2Sub,
      actorRole: txt.steps.s2Role,
      actorName: complaint.assignedNodalOfficer || 'District Nodal Officer',
      assignedTo: complaint.assignedInspector || 'Field Inspector Dispatched',
      phone: complaint.assignedInspectorPhone || '+91 94401 22334',
      timestamp: hasInspectorAssigned ? s2Stamp.formatted : txt.pending,
      timeOnly: hasInspectorAssigned ? s2Stamp.timeOnly : '--:--',
      dateOnly: hasInspectorAssigned ? s2Stamp.dateOnly : txt.pending,
      diff: hasInspectorAssigned ? s2Stamp.diffFromBaseline : undefined,
      isCompleted: hasInspectorAssigned,
      isActive: currentStep === 2,
      badge: txt.steps.s2Badge,
      barTitle: txt.steps.s2BarTitle,
      color: 'sky',
      summary: `Mandated on-ground physical inspection within 24h statutory SLA directive.`,
    },
    {
      stepNumber: 3,
      title: txt.steps.s3Title,
      subtitle: txt.steps.s3Sub,
      actorRole: txt.steps.s3Role,
      actorName: complaint.inspectionReport?.inspectorName || complaint.assignedInspector || 'Sri K. Rama Krishna',
      phone: complaint.inspectionReport?.inspectorPhone || complaint.assignedInspectorPhone,
      timestamp: hasInspectionDone ? s3Stamp.formatted : txt.pending,
      timeOnly: hasInspectionDone ? s3Stamp.timeOnly : '--:--',
      dateOnly: hasInspectionDone ? s3Stamp.dateOnly : txt.pending,
      diff: hasInspectionDone ? s3Stamp.diffFromBaseline : undefined,
      isCompleted: hasInspectionDone,
      isActive: currentStep === 3,
      badge: txt.steps.s3Badge,
      barTitle: txt.steps.s3BarTitle,
      color: 'purple',
      summary: complaint.inspectionReport 
        ? `Verified genuine. Severity: ${complaint.inspectionReport.wasteLevel}, TDS: ${complaint.inspectionReport.tdsReadingPpm || 'N/A'} ppm. Remarks: ${complaint.inspectionReport.validationRemarks}`
        : 'Awaiting field inspector physical site inspection and GPS validation.',
      proofPhoto: complaint.inspectionReport?.sitePhotoUrl,
      proofPhotoLabel: 'Inspector Site Verification Photo'
    },
    {
      stepNumber: 4,
      title: txt.steps.s4Title,
      subtitle: txt.steps.s4Sub,
      actorRole: txt.steps.s4Role,
      actorName: complaint.assignedNodalOfficer || 'District Nodal Officer',
      assignedTo: complaint.workExecution?.engineerName || complaint.assignedEngineer || 'Remediation Action Engineer',
      phone: complaint.workExecution?.engineerPhone || complaint.assignedEngineerPhone || '+91 94402 33445',
      timestamp: hasWorkerAssigned ? s4Stamp.formatted : txt.pending,
      timeOnly: hasWorkerAssigned ? s4Stamp.timeOnly : '--:--',
      dateOnly: hasWorkerAssigned ? s4Stamp.dateOnly : txt.pending,
      diff: hasWorkerAssigned ? s4Stamp.diffFromBaseline : undefined,
      isCompleted: hasWorkerAssigned,
      isActive: currentStep === 4,
      badge: txt.steps.s4Badge,
      barTitle: txt.steps.s4BarTitle,
      color: 'amber',
      summary: complaint.machineryDeployed || complaint.workExecution?.workSummary
        ? `Machinery: ${complaint.machineryDeployed || 'JCB 3DX & Sanitation Gang'}. Target: ${s4Stamp.dateOnly}`
        : 'Remediation crew allocation in progress.',
    },
    {
      stepNumber: 5,
      title: txt.steps.s5Title,
      subtitle: txt.steps.s5Sub,
      actorRole: txt.steps.s5Role,
      actorName: complaint.workExecution?.engineerName || complaint.assignedEngineer || 'Field Execution Team',
      phone: complaint.workExecution?.engineerPhone || complaint.assignedEngineerPhone,
      timestamp: hasWorkerProofUploaded ? s5Stamp.formatted : txt.pending,
      timeOnly: hasWorkerProofUploaded ? s5Stamp.timeOnly : '--:--',
      dateOnly: hasWorkerProofUploaded ? s5Stamp.dateOnly : txt.pending,
      diff: hasWorkerProofUploaded ? s5Stamp.diffFromBaseline : undefined,
      isCompleted: hasWorkerProofUploaded,
      isActive: currentStep === 5,
      badge: txt.steps.s5Badge,
      barTitle: txt.steps.s5BarTitle,
      color: 'indigo',
      summary: complaint.workExecution?.workSummary || 'Clearing completed: de-silted waterway and plastic waste removed. Uploaded proof for re-verification.',
      proofPhoto: complaint.workExecution?.afterPhotoUrl || (hasWorkerProofUploaded ? complaint.photoUrl : undefined),
      proofPhotoLabel: 'Worker Completion ("After") Photo'
    },
    {
      stepNumber: 6,
      title: txt.steps.s6Title,
      subtitle: txt.steps.s6Sub,
      actorRole: txt.steps.s6Role,
      actorName: complaint.inspectionReport?.inspectorName || complaint.assignedInspector || 'Sri K. Rama Krishna',
      phone: complaint.inspectionReport?.inspectorPhone || complaint.assignedInspectorPhone,
      timestamp: isFullyResolved ? s6Stamp.formatted : txt.pending,
      timeOnly: isFullyResolved ? s6Stamp.timeOnly : '--:--',
      dateOnly: isFullyResolved ? s6Stamp.dateOnly : txt.pending,
      diff: isFullyResolved ? s6Stamp.diffFromBaseline : undefined,
      isCompleted: isFullyResolved,
      isActive: currentStep === 6,
      badge: txt.steps.s6Badge,
      barTitle: txt.steps.s6BarTitle,
      color: 'emerald',
      summary: isFullyResolved
        ? 'Field Inspector physically verified that remediation is 100% satisfactory. Officially closed on State Water Portal.'
        : 'Pending physical spot re-inspection by field inspector to confirm resolution.',
      proofPhoto: complaint.inspectionReport?.postWorkVerification?.verificationPhotoUrl,
      proofPhotoLabel: 'Official Resolution Audit Seal'
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

      {/* Expanded Detailed Audit Trail */}
      {isExpanded && (
        <div className="space-y-3 pt-2">
          {/* Visual Proof Comparison Panel if citizen or worker proof exists */}
          {(complaint.photoUrl || complaint.workExecution?.afterPhotoUrl) && (
            <div className="p-3 sm:p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Camera className="w-4 h-4 text-[#0077B6]" />
                  <span>{txt.visualProofAudit}</span>
                </div>
                
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                  <button
                    onClick={() => setActivePhotoTab('both')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${activePhotoTab === 'both' ? 'bg-[#0077B6] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {txt.tabBoth}
                  </button>
                  <button
                    onClick={() => setActivePhotoTab('before')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${activePhotoTab === 'before' ? 'bg-[#0077B6] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {txt.tabBefore}
                  </button>
                  <button
                    onClick={() => setActivePhotoTab('after')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${activePhotoTab === 'after' ? 'bg-[#0077B6] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {txt.tabAfter}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Before Photo */}
                {(activePhotoTab === 'both' || activePhotoTab === 'before') && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {txt.beforeLabel}
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">{formatTimestamp(complaint.submittedAt)}</span>
                    </div>
                    {complaint.photoUrl ? (
                      <div 
                        onClick={() => onOpenPhotoPreview?.({
                          url: complaint.photoUrl!,
                          title: `Citizen Initial Evidence: ${complaint.citizenName}`,
                          subtitle: `${complaint.locationLandmark}, ${complaint.village} (${complaint.wasteType || 'Pollution'})`
                        })}
                        className="rounded-xl overflow-hidden border border-slate-300 relative aspect-video h-44 bg-slate-900 group cursor-pointer shadow-xs"
                      >
                        <img src={complaint.photoUrl} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/5 flex items-center justify-center">
                          <span className="bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <Maximize2 className="w-3 h-3 text-sky-400" />
                            <span>{txt.clickToZoom}</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video h-44 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400">
                        {txt.noBeforePhoto}
                      </div>
                    )}
                  </div>
                )}

                {/* After Photo */}
                {(activePhotoTab === 'both' || activePhotoTab === 'after') && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {txt.afterLabel}
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        {hasWorkerProofUploaded ? formatTimestamp(complaint.workExecution?.completedAt || complaint.submittedAt) : txt.pending}
                      </span>
                    </div>
                    {complaint.workExecution?.afterPhotoUrl || (hasWorkerProofUploaded && isFullyResolved) ? (
                      <div 
                        onClick={() => onOpenPhotoPreview?.({
                          url: complaint.workExecution?.afterPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop',
                          title: `Worker Remediation Proof: ${complaint.workExecution?.engineerName || 'Action Engineer'}`,
                          subtitle: `Waste Cleared: 3.1+ tons • Embankment Restored`
                        })}
                        className="rounded-xl overflow-hidden border border-emerald-300 relative aspect-video h-44 bg-slate-900 group cursor-pointer shadow-xs"
                      >
                        <img 
                          src={complaint.workExecution?.afterPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop'} 
                          alt="After remediation" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/5 flex items-center justify-center">
                          <span className="bg-emerald-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <Maximize2 className="w-3 h-3 text-emerald-300" />
                            <span>{txt.clickToZoom}</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video h-44 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 flex flex-col items-center justify-center text-center p-4 text-xs text-amber-900 shadow-2xs">
                        <Clock className="w-5 h-5 text-amber-500 mb-1.5 animate-pulse" />
                        <span className="font-bold text-xs">{txt.awaitingWorkerProof}</span>
                        <span className="text-[11px] text-amber-700 mt-1 max-w-xs">{txt.awaitingWorkerDesc}</span>
                        <span className="mt-2.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold font-mono">
                          Ground Worker Action In Progress
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Node List */}
          <div className="space-y-2.5">
            {steps.map((st) => (
              <div 
                key={st.stepNumber}
                className={`p-3 rounded-xl border transition-colors ${
                  st.isActive 
                    ? 'bg-sky-50/50 border-[#0077B6]' 
                    : st.isCompleted 
                    ? 'bg-slate-50/50 border-slate-200 hover:bg-slate-50' 
                    : 'bg-white border-dashed border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono mt-0.5 ${
                      st.isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : st.isActive
                        ? 'bg-[#0077B6] text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {st.isCompleted ? '✓' : st.stepNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-xs font-black text-slate-900">{st.title}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          st.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {st.actorRole}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span><strong>{txt.officerPerson}</strong> {st.actorName}</span>
                        {st.assignedTo && (
                          <span className="text-[#0077B6]">
                            <strong>{txt.assignedToLabel}</strong> {st.assignedTo}
                          </span>
                        )}
                        {st.phone && (
                          <a href={`tel:${st.phone}`} className="text-slate-500 hover:text-[#0077B6] font-mono text-[10px] inline-flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {st.phone}
                          </a>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1 italic">
                        {st.summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-700 font-bold justify-end">
                      <Clock className="w-3 h-3 text-[#0077B6]" />
                      <span>{st.timestamp}</span>
                    </div>

                    {st.diff && (
                      <div className="mt-0.5 flex justify-end">
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200/90 px-1.5 py-0.5 rounded">
                          <span>⏱️</span>
                          <span>{st.diff}</span>
                        </span>
                      </div>
                    )}

                    <div className="mt-1 flex justify-end">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        st.isCompleted 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : st.isActive
                          ? 'bg-sky-100 text-[#0077B6] border border-sky-200 animate-pulse'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {st.isCompleted ? '✓ Verified Log' : st.isActive ? 'Active Stage' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
