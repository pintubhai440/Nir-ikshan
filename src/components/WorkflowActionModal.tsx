import React, { useState, useEffect } from 'react';
import { CitizenComplaint, InspectorReport, EngineerWorkExecution } from '../types/nirikshan';
import { useLanguage } from '../context/LanguageContext';
import { 
  AP_FIELD_INSPECTORS_ROSTER, 
  AP_REMEDIATION_WORKERS_ROSTER,
  FieldInspectorProfile,
  RemediationWorkerProfile 
} from '../data/operationalRosterData';
import { 
  X, 
  CheckCircle2, 
  UserCheck, 
  Wrench, 
  Camera, 
  FileCheck2, 
  Calendar, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Truck,
  Droplets,
  ShieldCheck,
  Eye,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkflowActionModalProps {
  complaint: CitizenComplaint | null;
  isOpen: boolean;
  initialStep?: number;
  onClose: () => void;
  onUpdateComplaint: (updated: CitizenComplaint) => void;
}

const MODAL_TEXT = {
  en: {
    modalTitle: 'Operational Workflow Dispatch & Tracking',
    citizenLabel: 'Citizen:',
    cancel: 'Cancel',
    engineBadge: 'Statutory 72h APWRIMS Lifecycle Engine',
    tabs: [
      { num: 2, label: '2. Nodal Assigns Inspector', desc: 'Dispatched Inspector', icon: UserCheck },
      { num: 3, label: '3. Field Inspection', desc: 'GPS Ground Report', icon: Eye },
      { num: 4, label: '4. Nodal Assigns Worker & Machinery', desc: 'Crew & Equipment Dispatched', icon: Truck },
      { num: 5, label: '5. Work Done Proof', desc: 'Cleaning Proof Uploaded', icon: Camera },
      { num: 6, label: '6. Final Verification', desc: 'Inspector Physical Sign-off', icon: ShieldCheck },
    ],
    step2: {
      title: 'Step 2: Nodal Officer Assigns Field Inspector',
      desc: 'District Nodal Officer selects registered inspector from roster to conduct physical verification within 24h statutory SLA directive.',
      selectInspector: 'Select Field Inspector from Registered Department Roster:',
      phone: 'Phone:',
      district: 'District:',
      specialization: 'Specialization:',
      instructions: 'Nodal Officer Official Instructions / SLA Directive:',
      defaultNote: 'Urgent field verification ordered under 24h statutory APWRIMS directive. Perform GPS cross-check and water quality TDS test.',
      btn: 'Dispatch Field Inspector',
    },
    step3: {
      title: 'Step 3: Field Inspector Ground Inspection & Report',
      desc: 'Inspector physically visits site, cross-checks GPS location, performs water quality TDS test, and files official report.',
      waterPresence: 'Water Presence at Site:',
      wasteLevel: 'Waste / Silt Severity Level:',
      tds: 'TDS Water Quality Reading (PPM):',
      validity: 'Is Citizen Complaint Valid & Genuine?',
      validYes: '✓ Yes, Genuine Complaint',
      validNo: '✗ Fake / Invalid',
      photo: 'Field Verification Photographic Evidence (Site Photo URL):',
      samples: 'Quick Samples:',
      sampleChoke: 'Sample Plastic Choke',
      sampleWeed: 'Sample Weed Infestation',
      findings: 'Field Inspector Technical Findings & Recommendations:',
      defaultRemarks: 'Physical field inspection verified genuine. Water body requires rapid mechanical clearing of debris and weed choke.',
      btn: 'Submit Field Inspection Report',
    },
    step4: {
      title: 'Step 4: Nodal Officer Assigns Remediation Worker & Machinery',
      desc: 'Following validated inspection report, Nodal Officer allocates specialized contractor crew and heavy machinery for clearing.',
      selectWorker: 'Select Action Worker / Remediation Engineer Crew:',
      contractor: 'Contractor:',
      phone: 'Phone:',
      machinery: 'Machinery:',
      crewSize: 'Crew Size:',
      workers: 'workers',
      machineryDeployed: 'Machinery & Equipment Deployed:',
      deadline: 'Strict SLA Completion Deadline:',
      instructions: 'Work Order Execution Instructions:',
      defaultNote: 'Deploy mechanical equipment immediately to clear choked waterways and deposit silt at designated disposal bund.',
      btn: 'Issue Work Order to Crew',
    },
    step5: {
      title: 'Step 5: Worker Submits Work Done Proof ("Kaam Ho Gaya")',
      desc: 'Action Worker/Engineer uploads "After" cleaning photo proof and logs tons of waste/silt removed from the site.',
      clearedTons: 'Total Silt & Debris Cleared (Metric Tons):',
      workerLead: 'Worker Lead / Engineer:',
      afterPhoto: 'Cleaned Water Body "After" Proof Photo URL:',
      samples: 'Sample Clean Photos:',
      cleanLake: 'Clean Lake Catchment',
      restoredBasin: 'Restored Reservoir Basin',
      preview: 'Preview: "After" Proof Image',
      summary: 'Work Completion Summary / Action Report:',
      defaultSummary: 'Clearing completed: 3.5 metric tons of plastic waste and invasive weeds excavated and cleared. Waterway flowing freely.',
      btn: 'Submit Work Proof for Re-Verification',
    },
    step6: {
      title: 'Step 6: Field Inspector Final Physical Re-Verification & Closure',
      desc: 'Inspector physically re-visits site to verify cleaning is 100% satisfactory before officially closing docket on State Water Portal.',
      signoff: 'Inspector Physical Spot Verification Sign-off:',
      certifyPrefix: 'certify that I physically visited the GPS site and verify that the remediation is genuine and 100% satisfactory.',
      photo: 'Inspector Final Verification Photo URL:',
      remarks: 'Final Official Resolution Dossier Remarks:',
      defaultRemarks: 'Final on-ground physical inspection conducted. Remediation verified 100% compliant with environmental standards. Officially closing grievance docket.',
      btn: 'Verify & Officially Resolve Docket',
    }
  },
  hi: {
    modalTitle: 'कार्य प्रगति एवं अधिकारी आवंटन (वर्कफ्लो ट्रैकिंग)',
    citizenLabel: 'नागरिक:',
    cancel: 'रद्द करें',
    engineBadge: 'वैधानिक 72 घंटे एपीव्रिम्स जीवनचक्र प्रणाली',
    tabs: [
      { num: 2, label: '2. नोडल ने इंस्पेक्टर नियुक्त किया', desc: 'इंस्पेक्टर प्रेषण', icon: UserCheck },
      { num: 3, label: '3. फील्ड जांच रिपोर्ट', desc: 'जीपीएस ग्राउंड रिपोर्ट', icon: Eye },
      { num: 4, label: '4. नोडल ने वर्कर तैनात किया', desc: 'मशीनरी व दल प्रेषण', icon: Truck },
      { num: 5, label: '5. काम पूरा - सबूत अपलोड', desc: 'सफाई उपरांत फोटो', icon: Camera },
      { num: 6, label: '6. इंस्पेक्टर द्वारा सत्यापन', desc: 'अंतिम भौतिक जांच व समाधान', icon: ShieldCheck },
    ],
    step2: {
      title: 'चरण 2: नोडल अधिकारी द्वारा फील्ड इंस्पेक्टर की नियुक्ति',
      desc: 'जिला नोडल अधिकारी आधिकारिक रोस्टर में से पंजीकृत फील्ड इंस्पेक्टर को चुनकर 24 घंटे के अंदर भौतिक जीपीएस सत्यापन का आदेश जारी करता है।',
      selectInspector: 'विभागीय रोस्टर से फील्ड इंस्पेक्टर का चयन करें:',
      phone: 'फोन:',
      district: 'ज़िला:',
      specialization: 'विशेषज्ञता:',
      instructions: 'नोडल अधिकारी आधिकारिक निर्देश / एसएलए आदेश:',
      defaultNote: 'एपीव्रिम्स वैधानिक 24 घंटे नियम के अंतर्गत तत्काल फील्ड निरीक्षण का आदेश। जीपीएस सत्यापन और टीडीएस जल गुणवत्ता माप अनिवार्य।',
      btn: 'फील्ड इंस्पेक्टर को आदेश जारी करें',
    },
    step3: {
      title: 'चरण 3: फील्ड इंस्पेक्टर द्वारा ग्राउंड जांच और रिपोर्ट सबमिट',
      desc: 'फील्ड इंस्पेक्टर मौके पर जाकर जीपीएस लोकेशन क्रॉस-चेक करता है, जल गुणवत्ता/टीडीएस मापता है और आधिकारिक रिपोर्ट दर्ज करता है।',
      waterPresence: 'स्थल पर जल स्तर की स्थिति:',
      wasteLevel: 'कचरा / गाद गंभीरता स्तर:',
      tds: 'टीडीएस जल गुणवत्ता माप (PPM):',
      validity: 'क्या नागरिक शिकायत वास्तविक एवं वैध है?',
      validYes: '✓ हाँ, वास्तविक शिकायत',
      validNo: '✗ फर्जी / अमान्य',
      photo: 'फील्ड भौतिक सत्यापन फोटो सबूत (URL):',
      samples: 'नमूना फोटो:',
      sampleChoke: 'प्लास्टिक रुकावट नमूना',
      sampleWeed: 'जलकुंभी रुकावट नमूना',
      findings: 'फील्ड इंस्पेक्टर की तकनीकी रिपोर्ट एवं अनुशंसाएं:',
      defaultRemarks: 'भौतिक फील्ड निरीक्षण में शिकायत वास्तविक पाई गई। जल निकाय से भारी कचरा और सिल्ट हटाने हेतु तत्काल मशीनरी की आवश्यकता है।',
      btn: 'फील्ड जांच रिपोर्ट सबमिट करें',
    },
    step4: {
      title: 'चरण 4: नोडल अधिकारी द्वारा वर्कर टीम व मशीनरी का आवंटन',
      desc: 'इंस्पेक्टर की रिपोर्ट मिलने के बाद नोडल अधिकारी सफाई हेतु विशेष ठेकेदार दल और जेसीबी मशीनरी तैनात करता है।',
      selectWorker: 'कार्यकारी वर्कर / सफाई इंजीनियर टीम चुनें:',
      contractor: 'ठेकेदार एजेंसी:',
      phone: 'फोन:',
      machinery: 'मशीनरी:',
      crewSize: 'टीम संख्या:',
      workers: 'वर्कर',
      machineryDeployed: 'तैनात मशीनरी व उपकरण:',
      deadline: 'कार्य पूर्ण करने की अंतिम समय-सीमा (SLA):',
      instructions: 'कार्य आदेश निष्पादन निर्देश:',
      defaultNote: 'जल निकासी को तुरंत सुचारू करने हेतु यांत्रिक उपकरण तैनात करें और निकाली गई गाद को अधिकृत बांध पर सुरक्षित डालें।',
      btn: 'वर्कर को वर्क-ऑर्डर जारी करें',
    },
    step5: {
      title: 'चरण 5: वर्कर द्वारा काम पूरा करने का सबूत ("काम हो गया")',
      desc: 'वर्कर/इंजीनियर सफाई पूरी करने के बाद साफ जगह की "After" फोटो अपलोड करता है और हटाया गया कचरा दर्ज करता है।',
      clearedTons: 'हटाया गया कुल कचरा/गाद (मीट्रिक टन):',
      workerLead: 'वर्कर प्रमुख / इंजीनियर:',
      afterPhoto: 'सफाई के बाद जल निकाय की फोटो URL:',
      samples: 'साफ जल निकाय के नमूने:',
      cleanLake: 'स्वच्छ जलाशय',
      restoredBasin: 'पुनर्स्थापित जल बेसिन',
      preview: 'पूर्वावलोकन: सफाई उपरांत फोटो',
      summary: 'कार्य पूर्णता विवरण / रिपोर्ट:',
      defaultSummary: 'सफाई कार्य सफलतापूर्वक पूर्ण: 3.5 मीट्रिक टन प्लास्टिक कचरा व जलकुंभी हटाई गई। जल प्रवाह निर्बाध रूप से चालू।',
      btn: 'सबूत सबमिट करें - पुनः सत्यापन हेतु भेजें',
    },
    step6: {
      title: 'चरण 6: फील्ड इंस्पेक्टर द्वारा अंतिम भौतिक सत्यापन एवं समाधान',
      desc: 'फील्ड इंस्पेक्टर दोबारा मौके पर जाकर पुष्टि करता है कि काम संतोषजनक रूप से पूरा हुआ है, फिर पोर्टल पर केस आधिकारिक रूप से बंद होता है।',
      signoff: 'फील्ड इंस्पेक्टर भौतिक स्थल सत्यापन प्रमाणीकरण:',
      certifyPrefix: 'प्रमाणित करता हूँ कि मैंने जीपीएस स्थल पर स्वयं जाकर देखा है कि कार्य 100% संतोषजनक व पर्यावरण मानकों के अनुरूप पूर्ण हुआ है।',
      photo: 'इंस्पेक्टर अंतिम सत्यापन फोटो URL:',
      remarks: 'अंतिम आधिकारिक समाधान टिप्पणी:',
      defaultRemarks: 'अंतिम भौतिक स्थल निरीक्षण पूर्ण। सफाई कार्य शत-प्रतिशत मानकों के अनुरूप पाया गया। शिकायत को आधिकारिक रूप से समाधानित घोषित किया जाता है।',
      btn: 'सत्यापन प्रमाणित कर केस बंद करें',
    }
  },
  te: {
    modalTitle: 'పని పురోగతి & అధికారి కేటాయింపు (వర్క్‌ఫ్లో డిస్పాచ్)',
    citizenLabel: 'పౌరుడు:',
    cancel: 'రద్దు చేయండి',
    engineBadge: 'చట్టబద్ధమైన 72 గంటల APWRIMS లైఫ్‌సైకిల్ ఇంజిన్',
    tabs: [
      { num: 2, label: '2. నోడల్ ఇన్‌స్పెక్టర్‌ను కేటాయించారు', desc: 'ఇన్‌స్పెక్టర్ నియామకం', icon: UserCheck },
      { num: 3, label: '3. ఫీల్డ్ తనిఖీ నివేదిక', desc: 'GPS క్షేత్ర నివేదిక', icon: Eye },
      { num: 4, label: '4. నోడల్ వర్కర్‌ను కేటాయించారు', desc: 'యంత్రాలు & సిబ్బంది', icon: Truck },
      { num: 5, label: '5. పని పూర్తి సాక్ష్యం అప్‌లోడ్', desc: 'శుభ్రపరిచిన ఫోటో', icon: Camera },
      { num: 6, label: '6. తుది భౌతిక ధృవీకరణ', desc: 'ఇన్‌స్పెక్టర్ ధృవీకరణ & ముగింపు', icon: ShieldCheck },
    ],
    step2: {
      title: 'దశ 2: నోడల్ అధికారి ఫీల్డ్ ఇన్‌స్పెక్టర్ నియామకం',
      desc: 'జిల్లా నోడల్ అధికారి అధికారిక రోస్టర్ నుండి నమోదిత ఫీల్డ్ శానిటేషన్ ఇన్‌స్పెక్టర్‌ను 24 గంటల్లో భౌతిక తనిఖీ కోసం ఎంపిక చేస్తారు.',
      selectInspector: 'శాఖా రోస్టర్ నుండి ఫీల్డ్ ఇన్‌స్పెక్టర్‌ను ఎంచుకోండి:',
      phone: 'ఫోన్:',
      district: 'జిల్లా:',
      specialization: 'నైపుణ్యం:',
      instructions: 'నోడల్ అధికారి అధికారిక ఆదేశాలు / SLA మార్గదర్శకాలు:',
      defaultNote: 'APWRIMS చట్టబద్ధమైన 24 గంటల ఆదేశాల ప్రకారం తక్షణ క్షేత్ర తనిఖీకి ఆదేశం. GPS తనిఖీ మరియు TDS నీటి నాణ్యత పరీక్ష తప్పనిసరి.',
      btn: 'ఫీల్డ్ ఇన్‌స్పెక్టర్‌కు ఉత్తర్వు జారీ చేయండి',
    },
    step3: {
      title: 'దశ 3: ఫీల్డ్ ఇన్‌స్పెక్టర్ క్షేత్ర తనిఖీ & నివేదిక సమర్పణ',
      desc: 'ఇన్‌స్పెక్టర్ క్షేత్రస్థాయికి వెళ్లి GPS సరిపోల్చి, TDS నీటి నాణ్యతను పరీక్షించి అధికారిక నివేదికను దాఖలు చేస్తారు.',
      waterPresence: 'ప్రదేశంలో నీటి లభ్యత:',
      wasteLevel: 'వ్యర్థాలు / పూడిక తీవ్రత స్థాయి:',
      tds: 'TDS నీటి నాణ్యత రీడింగ్ (PPM):',
      validity: 'పౌరుడి ఫిర్యాదు వాస్తవమైనదా & సరైనదా?',
      validYes: '✓ అవును, సరైన ఫిర్యాదు',
      validNo: '✗ నకిలీ / చెల్లదు',
      photo: 'క్షేత్ర ధృవీకరణ ఫోటో సాక్ష్యం (ఫోటో URL):',
      samples: 'నమూనాలు:',
      sampleChoke: 'ప్లాస్టిక్ అడ్డంకి నమూనా',
      sampleWeed: 'గుర్రపుడెక్క నమూనా',
      findings: 'ఫీల్డ్ ఇన్‌స్పెక్టర్ సాంకేతిక నివేదిక & సిఫార్సులు:',
      defaultRemarks: 'భౌతిక తనిఖీలో ఫిర్యాదు నిజమని తేలింది. నీటి ప్రవాహానికి అడ్డుగా ఉన్న చెత్తను తొలగించడానికి తక్షణమే యంత్రాలు అవసరం.',
      btn: 'ఫీల్డ్ తనిఖీ నివేదిక సమర్పించండి',
    },
    step4: {
      title: 'దశ 4: నోడల్ అధికారి వర్కర్ బృందం & యంత్రాల కేటాయింపు',
      desc: 'ఇన్‌స్పెక్టర్ నివేదిక ఆధారంగా, నోడల్ అధికారి ప్రత్యేక కాంట్రాక్టర్ బృందాన్ని మరియు JCB యంత్రాలను శుభ్రత కోసం కేటాయిస్తారు.',
      selectWorker: 'యాక్షన్ వర్కర్ / శానిటేషన్ ఇంజనీర్ బృందాన్ని ఎంచుకోండి:',
      contractor: 'కాంట్రాక్టర్ ఏజెన్సీ:',
      phone: 'ఫోన్:',
      machinery: 'యంత్రాలు:',
      crewSize: 'సిబ్బంది పరిమాణం:',
      workers: 'కార్మికులు',
      machineryDeployed: 'మోహరించిన యంత్రాలు & సామగ్రి:',
      deadline: 'ఖచ్చితమైన పని ముగింపు గడువు (SLA):',
      instructions: 'పని అమలు మార్గదర్శకాలు:',
      defaultNote: 'కాలువలోని వ్యర్థాలను వెంటనే తొలగించి, పూడికను నియమిత ప్రదేశంలో డంప్ చేయడానికి యంత్రాలను మోహరించండి.',
      btn: 'వర్కర్ బృందానికి వర్క్ ఆర్డర్ జారీ చేయండి',
    },
    step5: {
      title: 'దశ 5: వర్కర్ పని పూర్తయిన సాక్ష్యం సమర్పణ ("పని పూర్తయింది")',
      desc: 'పని ముగిసిన తర్వాత శుభ్రపరిచిన నీటి వనరు ఫోటోను మరియు తొలగించిన చెత్త వివరాలను వర్కర్ అప్‌లోడ్ చేస్తారు.',
      clearedTons: 'తొలగించిన మొత్తం వ్యర్థాలు (మెట్రిక్ టన్నులు):',
      workerLead: 'వర్కర్ లీడ్ / ఇంజనీర్:',
      afterPhoto: 'శుభ్రపరిచిన తర్వాత నీటి వనరు ఫోటో URL:',
      samples: 'శుభ్రమైన ఫోటో నమూనాలు:',
      cleanLake: 'శుభ్రమైన చెరువు',
      restoredBasin: 'పునరుద్ధరించిన రిజర్వాయర్ బేసిన్',
      preview: 'ముందస్తు వీక్షణ: శుభ్రపరిచిన ఫోటో',
      summary: 'పని ముగింపు నివేదిక:',
      defaultSummary: 'పని విజయవంతంగా పూర్తయింది: 3.5 మెట్రిక్ టన్నుల ప్లాస్టిక్ వ్యర్థాలు మరియు గుర్రపుడెక్క తొలగించబడ్డాయి. నీటి ప్రవాహం సజావుగా ఉంది.',
      btn: 'సాక్ష్యం సమర్పించండి - తనిఖీకి పంపండి',
    },
    step6: {
      title: 'దశ 6: ఇన్‌స్పెక్టర్ తుది భౌతిక పునఃపరిశీలన & పరిష్కారం',
      desc: 'ఇన్‌స్పెక్టర్ స్వయంగా క్షేత్రానికి వెళ్లి పని సంతృప్తికరంగా పూర్తయిందని ధృవీకరించిన తర్వాత కేసును పోర్టల్‌లో అధికారికంగా ముగిస్తారు.',
      signoff: 'ఇన్‌స్పెక్టర్ భౌతిక ధృవీకరణ సంతకం:',
      certifyPrefix: 'వ్యక్తిగతంగా GPS ప్రదేశాన్ని సందర్శించి పని 100% సంతృప్తికరంగా పూర్తయిందని ధృవీకరిస్తున్నాను.',
      photo: 'ఇన్‌స్పెక్టర్ తుది ధృవీకరణ ఫోటో URL:',
      remarks: 'తుది పరిష్కార వ్యాఖ్యలు:',
      defaultRemarks: 'తుది భౌతిక తనిఖీ పూర్తయింది. పర్యావరణ ప్రమాణాల ప్రకారం పని సంతృప్తికరంగా ఉందని ధృవీకరించడమైనది. కేసు అధికారికంగా పరిష్కరించబడింది.',
      btn: 'ధృవీకరించి కేసును అధికారికంగా పరిష్కరించండి',
    }
  }
};

export const WorkflowActionModal: React.FC<WorkflowActionModalProps> = ({
  complaint,
  isOpen,
  initialStep = 2,
  onClose,
  onUpdateComplaint
}) => {
  if (!isOpen || !complaint) return null;

  const { language } = useLanguage();
  const langKey = (language === 'hi' || language === 'te') ? language : 'en';
  const txt = MODAL_TEXT[langKey];

  // Active step selected in modal (2, 3, 4, 5, or 6)
  const [activeStepTab, setActiveStepTab] = useState<number>(initialStep >= 2 ? initialStep : 2);

  // Form states for Step 2: Assign Inspector
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>(
    AP_FIELD_INSPECTORS_ROSTER.find(i => i.name === complaint.assignedInspector)?.id || AP_FIELD_INSPECTORS_ROSTER[0].id
  );
  const [inspectorNotes, setInspectorNotes] = useState<string>(txt.step2.defaultNote);

  // Form states for Step 3: Inspector Report
  const [inspectionWasteLevel, setInspectionWasteLevel] = useState<'Low' | 'Moderate' | 'Heavy' | 'Severe Choke'>(
    complaint.inspectionReport?.wasteLevel || 'Heavy'
  );
  const [inspectionWaterPresence, setInspectionWaterPresence] = useState<'Abundant' | 'Moderate' | 'Low' | 'Stagnant Dry' | 'Extinct'>(
    complaint.inspectionReport?.waterPresence || 'Moderate'
  );
  const [inspectionTds, setInspectionTds] = useState<number>(
    complaint.inspectionReport?.tdsReadingPpm || 640
  );
  const [inspectionPhotoUrl, setInspectionPhotoUrl] = useState<string>(
    complaint.inspectionReport?.sitePhotoUrl || complaint.photoUrl || 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop'
  );
  const [isComplaintValid, setIsComplaintValid] = useState<boolean>(
    complaint.inspectionReport?.isComplaintValid !== undefined ? complaint.inspectionReport.isComplaintValid : true
  );
  const [inspectionRemarks, setInspectionRemarks] = useState<string>(
    complaint.inspectionReport?.validationRemarks || txt.step3.defaultRemarks
  );

  // Form states for Step 4: Assign Worker & Machinery
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    AP_REMEDIATION_WORKERS_ROSTER.find(w => w.leadName === complaint.assignedEngineer)?.id || AP_REMEDIATION_WORKERS_ROSTER[0].id
  );
  const [machineryType, setMachineryType] = useState<string>(
    complaint.machineryDeployed || '1x JCB 3DX Heavy Backhoe Loader + 2 Tippers'
  );
  const [workerDeadline, setWorkerDeadline] = useState<string>(
    complaint.workExecution?.deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [workerNotes, setWorkerNotes] = useState<string>(txt.step4.defaultNote);

  // Form states for Step 5: Worker Proof Upload
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    complaint.workExecution?.afterPhotoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop'
  );
  const [clearedTons, setClearedTons] = useState<string>('3.5');
  const [workExecutionSummary, setWorkExecutionSummary] = useState<string>(
    complaint.workExecution?.workSummary || txt.step5.defaultSummary
  );

  // Form states for Step 6: Inspector Final Verification
  const [verificationPhotoUrl, setVerificationPhotoUrl] = useState<string>(
    complaint.inspectionReport?.postWorkVerification?.verificationPhotoUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop'
  );
  const [isSatisfactory, setIsSatisfactory] = useState<boolean>(true);
  const [finalRemarks, setFinalRemarks] = useState<string>(txt.step6.defaultRemarks);

  const selectedInspector = AP_FIELD_INSPECTORS_ROSTER.find(i => i.id === selectedInspectorId) || AP_FIELD_INSPECTORS_ROSTER[0];
  const selectedWorker = AP_REMEDIATION_WORKERS_ROSTER.find(w => w.id === selectedWorkerId) || AP_REMEDIATION_WORKERS_ROSTER[0];

  const handleApplyStep = (targetStep: number) => {
    const nowIso = new Date().toISOString();
    const updated: CitizenComplaint = { ...complaint };

    if (targetStep === 2) {
      // Step 2: Assign Inspector
      updated.assignedInspector = selectedInspector.name;
      updated.assignedInspectorPhone = selectedInspector.phone;
      updated.assignedInspectorAt = nowIso;
      updated.status = 'INSPECTOR_ASSIGNED';
    } else if (targetStep === 3) {
      // Step 3: Submit Inspector Report
      const newReport: InspectorReport = {
        id: complaint.inspectionReport?.id || `IR-${Date.now().toString().slice(-4)}`,
        inspectorName: selectedInspector.name,
        inspectorPhone: selectedInspector.phone,
        inspectedAt: nowIso,
        gpsCoordinates: complaint.coordinates,
        waterPresence: inspectionWaterPresence,
        wasteLevel: inspectionWasteLevel,
        wasteType: 'Plastic & Polythene',
        sourcePinDescription: `${complaint.locationLandmark} field verification site`,
        tdsReadingPpm: Number(inspectionTds),
        sitePhotoUrl: inspectionPhotoUrl,
        isComplaintValid: isComplaintValid,
        validationRemarks: inspectionRemarks,
      };
      updated.assignedInspector = selectedInspector.name;
      updated.assignedInspectorPhone = selectedInspector.phone;
      updated.inspectionReport = newReport;
      updated.status = isComplaintValid ? 'INSPECTION_COMPLETED' : 'REJECTED';
    } else if (targetStep === 4) {
      // Step 4: Assign Worker / Engineer
      const newWork: EngineerWorkExecution = {
        id: complaint.workExecution?.id || `WE-${Date.now().toString().slice(-4)}`,
        engineerName: selectedWorker.leadName,
        engineerPhone: selectedWorker.phone,
        assignedAt: nowIso,
        deadline: workerDeadline,
        status: 'ACCEPTED',
        startedAt: nowIso,
        beforePhotoUrl: complaint.photoUrl || inspectionPhotoUrl,
        workSummary: workerNotes,
      };
      updated.assignedEngineer = selectedWorker.leadName;
      updated.assignedEngineerPhone = selectedWorker.phone;
      updated.assignedEngineerAt = nowIso;
      updated.machineryDeployed = machineryType;
      updated.workExecution = newWork;
      updated.status = 'WORKER_IN_PROGRESS';
    } else if (targetStep === 5) {
      // Step 5: Worker Marks Finished & Uploads Proof
      const currentWork = updated.workExecution || {
        id: `WE-${Date.now().toString().slice(-4)}`,
        engineerName: selectedWorker.leadName,
        engineerPhone: selectedWorker.phone,
        assignedAt: nowIso,
        deadline: workerDeadline,
        status: 'ACCEPTED',
      };
      updated.workExecution = {
        ...currentWork,
        status: 'COMPLETED',
        completedAt: nowIso,
        afterPhotoUrl: afterPhotoUrl,
        workSummary: `${workExecutionSummary} [Cleared ${clearedTons} metric tons]`,
      };
      updated.status = 'VERIFICATION_PENDING';
    } else if (targetStep === 6) {
      // Step 6: Final Inspector Verification & Resolved
      const currentReport = updated.inspectionReport || {
        id: `IR-${Date.now().toString().slice(-4)}`,
        inspectorName: selectedInspector.name,
        inspectorPhone: selectedInspector.phone,
        inspectedAt: nowIso,
        gpsCoordinates: complaint.coordinates,
        waterPresence: 'Abundant',
        wasteLevel: 'Low',
        wasteType: 'Plastic & Polythene',
        sourcePinDescription: complaint.locationLandmark,
        tdsReadingPpm: 240,
        sitePhotoUrl: inspectionPhotoUrl,
        isComplaintValid: true,
        validationRemarks: 'Remediation completed successfully',
      };

      updated.inspectionReport = {
        ...currentReport,
        postWorkVerification: {
          verifiedAt: nowIso,
          isSatisfactory: isSatisfactory,
          verificationPhotoUrl: verificationPhotoUrl,
          remarks: finalRemarks,
        }
      };
      updated.resolvedAt = nowIso;
      updated.status = isSatisfactory ? 'RESOLVED' : 'WORKER_IN_PROGRESS';
    }

    onUpdateComplaint(updated);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/70 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#0077B6] bg-sky-100/80 px-2.5 py-0.5 rounded-lg border border-sky-200">
                {complaint.id}
              </span>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {txt.modalTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {txt.citizenLabel} <strong className="text-slate-800 capitalize">{complaint.citizenName}</strong> • {complaint.locationLandmark}, {complaint.district}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Operational Stage Tabs */}
        <div className="px-4 pt-2.5 border-b border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 pb-2">
            {txt.tabs.map(tab => (
              <button
                key={tab.num}
                onClick={() => setActiveStepTab(tab.num)}
                className={`px-3 py-1.5 rounded-xl text-left border transition-all cursor-pointer shrink-0 ${
                  activeStepTab === tab.num
                    ? 'bg-white border-[#0077B6] text-[#0077B6] shadow-xs ring-1 ring-sky-200'
                    : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-slate-800 text-xs">
          
          {/* STEP 2: ASSIGN INSPECTOR */}
          {activeStepTab === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-[#0077B6] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {txt.step2.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {txt.step2.desc}
                  </p>
                </div>
              </div>

              {/* Inspector Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step2.selectInspector}
                </label>
                <select
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  {AP_FIELD_INSPECTORS_ROSTER.map(insp => (
                    <option key={insp.id} value={insp.id}>
                      {insp.name} ({insp.badgeId}) • {insp.district} • {insp.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inspector Preview Card */}
              {selectedInspector && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-xs">{selectedInspector.name}</strong>
                    <span className="font-mono text-[10px] bg-sky-100 text-[#0077B6] px-2 py-0.5 rounded font-bold">
                      {selectedInspector.badgeId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {txt.step2.phone} <span className="font-mono font-bold text-slate-800">{selectedInspector.phone}</span> • {txt.step2.district} {selectedInspector.district}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {txt.step2.specialization} {selectedInspector.specialization}
                  </div>
                </div>
              )}

              {/* Directive Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step2.instructions}
                </label>
                <textarea
                  rows={3}
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleApplyStep(2)}
                  className="w-full py-2.5 bg-[#0077B6] hover:bg-[#03045E] text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{txt.step2.btn}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FIELD INSPECTION REPORT */}
          {activeStepTab === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-3">
                <Eye className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {txt.step3.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {txt.step3.desc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step3.waterPresence}
                  </label>
                  <select
                    value={inspectionWaterPresence}
                    onChange={(e) => setInspectionWaterPresence(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="Abundant">Abundant Flow</option>
                    <option value="Moderate">Moderate Water Spread</option>
                    <option value="Low">Low / Drying</option>
                    <option value="Stagnant Dry">Stagnant Dry Mud</option>
                    <option value="Extinct">Completely Extinct</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step3.wasteLevel}
                  </label>
                  <select
                    value={inspectionWasteLevel}
                    onChange={(e) => setInspectionWasteLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="Low">Low (Minor debris)</option>
                    <option value="Moderate">Moderate (Channel impeded)</option>
                    <option value="Heavy">Heavy (Major obstruction)</option>
                    <option value="Severe Choke">Severe Choke (Total Blockage)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step3.tds}
                  </label>
                  <input
                    type="number"
                    value={inspectionTds}
                    onChange={(e) => setInspectionTds(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step3.validity}
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700">
                      <input 
                        type="radio" 
                        name="validity" 
                        checked={isComplaintValid} 
                        onChange={() => setIsComplaintValid(true)} 
                      />
                      <span>{txt.step3.validYes}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-600">
                      <input 
                        type="radio" 
                        name="validity" 
                        checked={!isComplaintValid} 
                        onChange={() => setIsComplaintValid(false)} 
                      />
                      <span>{txt.step3.validNo}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Inspection Photo URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step3.photo}
                </label>
                <input
                  type="text"
                  value={inspectionPhotoUrl}
                  onChange={(e) => setInspectionPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">{txt.step3.samples}</span>
                  <button
                    type="button"
                    onClick={() => setInspectionPhotoUrl('https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop')}
                    className="text-[10px] text-[#0077B6] hover:underline cursor-pointer"
                  >
                    {txt.step3.sampleChoke}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionPhotoUrl('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop')}
                    className="text-[10px] text-[#0077B6] hover:underline cursor-pointer"
                  >
                    {txt.step3.sampleWeed}
                  </button>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step3.findings}
                </label>
                <textarea
                  rows={2}
                  value={inspectionRemarks}
                  onChange={(e) => setInspectionRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleApplyStep(3)}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{txt.step3.btn}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ASSIGN WORKER & MACHINERY */}
          {activeStepTab === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {txt.step4.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {txt.step4.desc}
                  </p>
                </div>
              </div>

              {/* Worker Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step4.selectWorker}
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                >
                  {AP_REMEDIATION_WORKERS_ROSTER.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.leadName} ({w.crewCode}) • {w.district} • {w.primaryMachinery}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Worker Info */}
              {selectedWorker && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{selectedWorker.leadName}</strong>
                    <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                      {selectedWorker.crewCode}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {txt.step4.contractor} {selectedWorker.contractorAgency} • {txt.step4.phone} <span className="font-mono font-bold text-slate-800">{selectedWorker.phone}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {txt.step4.machinery} <strong>{selectedWorker.primaryMachinery}</strong> • {txt.step4.crewSize} {selectedWorker.crewStrength} {txt.step4.workers}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step4.machineryDeployed}
                  </label>
                  <input
                    type="text"
                    value={machineryType}
                    onChange={(e) => setMachineryType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step4.deadline}
                  </label>
                  <input
                    type="datetime-local"
                    value={workerDeadline}
                    onChange={(e) => setWorkerDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step4.instructions}
                </label>
                <textarea
                  rows={2}
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleApplyStep(4)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <Truck className="w-4 h-4" />
                  <span>{txt.step4.btn}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: WORK DONE PROOF UPLOAD */}
          {activeStepTab === 5 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Camera className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {txt.step5.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {txt.step5.desc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step5.clearedTons}
                  </label>
                  <input
                    type="text"
                    value={clearedTons}
                    onChange={(e) => setClearedTons(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                    placeholder="e.g. 3.5 tons"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block text-xs mb-1">
                    {txt.step5.workerLead}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={complaint.assignedEngineer || selectedWorker.leadName}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              {/* After Photo URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step5.afterPhoto}
                </label>
                <input
                  type="text"
                  value={afterPhotoUrl}
                  onChange={(e) => setAfterPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">{txt.step5.samples}</span>
                  <button
                    type="button"
                    onClick={() => setAfterPhotoUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop')}
                    className="text-[10px] text-[#0077B6] hover:underline cursor-pointer"
                  >
                    {txt.step5.cleanLake}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAfterPhotoUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop')}
                    className="text-[10px] text-[#0077B6] hover:underline cursor-pointer"
                  >
                    {txt.step5.restoredBasin}
                  </button>
                </div>
              </div>

              {/* Photo Preview Thumbnail */}
              {afterPhotoUrl && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-300 relative bg-slate-900">
                  <img src={afterPhotoUrl} alt="After Preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {txt.step5.preview}
                  </div>
                </div>
              )}

              {/* Work Execution Summary */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step5.summary}
                </label>
                <textarea
                  rows={2}
                  value={workExecutionSummary}
                  onChange={(e) => setWorkExecutionSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleApplyStep(5)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{txt.step5.btn}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: FINAL INSPECTOR VERIFICATION */}
          {activeStepTab === 6 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {txt.step6.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {txt.step6.desc}
                  </p>
                </div>
              </div>

              {/* Inspector Sign-off Checklist */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 text-xs">
                  {txt.step6.signoff}
                </div>
                <label className="flex items-start gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isSatisfactory}
                    onChange={(e) => setIsSatisfactory(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>
                    I, <strong>{complaint.assignedInspector || selectedInspector.name}</strong>, {txt.step6.certifyPrefix} ({complaint.locationLandmark})
                  </span>
                </label>
              </div>

              {/* Verification Photo URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step6.photo}
                </label>
                <input
                  type="text"
                  value={verificationPhotoUrl}
                  onChange={(e) => setVerificationPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                />
              </div>

              {/* Final Remarks */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  {txt.step6.remarks}
                </label>
                <textarea
                  rows={2}
                  value={finalRemarks}
                  onChange={(e) => setFinalRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleApplyStep(6)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{txt.step6.btn}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            {txt.engineBadge}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
          >
            {txt.cancel}
          </button>
        </div>

      </div>
    </div>
  );
};
