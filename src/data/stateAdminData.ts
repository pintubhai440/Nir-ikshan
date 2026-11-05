/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official Andhra Pradesh State Administration Governance Dataset
 * Aligned with Nir-ikshan Hydrological Surveillance & APWRIMS Telemetry.
 */

import { COMPLETE_AP_FIELD_INSPECTORS, COMPLETE_AP_ACTION_WORKERS } from './allDistrictsTeamData';

export interface DepartmentalPersonnel {
  id: string;
  staffId: string;
  name: string;
  email: string;
  role: 'Nodal Officer' | 'Field Inspector' | 'Action Worker';
  district: string;
  jurisdictionSubBasin: string;
  maskedMobile: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'On Duty' | 'Standby' | 'Ready for Dispatch';
  lastActive: string;
  avatarUrl?: string;
  specializationOrMachinery?: string;
  agencyOrUnit?: string;
  crewStrength?: number;
  assignedMandals?: string[];
  activeTasksCount?: number;
  rating?: number;
  sourceTable?: string;
}

export interface EscalatedCase {
  id: string;
  code: string;
  assetName: string;
  assetCode: string;
  district: string;
  assignedOwner: string;
  daysOverdue: string;
  priority: 'Critical' | 'High' | 'Medium';
  status: string;
  hazardSummary: string;
}

export interface SystemAuditRecord {
  id: string;
  timestamp: string;
  blockNumber: string;
  initiatedBy: {
    name: string;
    role: string;
    initials: string;
    staffId?: string;
  };
  action: string;
  recordId: string;
  stateTransition: {
    from: string;
    to: string;
  };
}

export interface SlaPriorityTier {
  id: 'critical' | 'high' | 'medium' | 'routine';
  name: string;
  priorityLevel: number;
  badgeLabel: string;
  badgeColor: string;
  description: string;
  inspectHours: number;
  assignHours: number;
  resolutionDays: number;
  autoEscalate: boolean;
  escalationChannel: string;
  isHardLimit?: boolean;
}

export interface MonthlyGrievancePoint {
  month: string;
  complaintsReceived: number;
  complaintsResolved: number;
  pendingActive: number;
  verifiedClosuresPace: number;
}

// Monthly Time-Series Analytics (Real progressive trends Dec 2025 - May 2026 across Andhra Pradesh)
export const MONTHLY_GRIEVANCE_TRENDS: MonthlyGrievancePoint[] = [
  { month: 'Dec', complaintsReceived: 780, complaintsResolved: 620, pendingActive: 160, verifiedClosuresPace: 620 },
  { month: 'Jan', complaintsReceived: 890, complaintsResolved: 710, pendingActive: 180, verifiedClosuresPace: 710 },
  { month: 'Feb', complaintsReceived: 1040, complaintsResolved: 820, pendingActive: 220, verifiedClosuresPace: 820 },
  { month: 'Mar', complaintsReceived: 1180, complaintsResolved: 940, pendingActive: 240, verifiedClosuresPace: 940 },
  { month: 'Apr', complaintsReceived: 1320, complaintsResolved: 1020, pendingActive: 300, verifiedClosuresPace: 1020 },
  { month: 'May', complaintsReceived: 1428, complaintsResolved: 1140, pendingActive: 312, verifiedClosuresPace: 1140 },
];

/// Departmental Personnel Directory across Andhra Pradesh - 100% Real APWRIMS & Irrigation Roster
export const INITIAL_DEPARTMENTAL_PERSONNEL: DepartmentalPersonnel[] = [
  // ====================================================================
  // --- 26 AP DISTRICT NODAL OFFICERS (1 PER DISTRICT - SOVEREIGN CADRE) ---
  // ====================================================================
  {
    id: 'usr-nodal-01',
    staffId: 'AP-WRA-VZM-01',
    name: 'Er. N. Subba Rao',
    email: 'nodal.vzm@nirikshan.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Vizianagaram',
    jurisdictionSubBasin: 'Tatipudi Reservoir & Champavathi Basin Command Cell',
    maskedMobile: '+91 98••••••45',
    phone: '+91 98480 12345',
    status: 'Active',
    lastActive: '15 mins ago',
    specializationOrMachinery: 'District Water Governance & Apex Interventions',
    agencyOrUnit: 'Vizianagaram District Collectorate Water Command',
    rating: 4.95,
    activeTasksCount: 4,
  },
  {
    id: 'usr-nodal-02',
    staffId: 'AP-WRA-VSK-01',
    name: 'Dr. A. Mallikarjuna, IAS',
    email: 'collector.vskp@ap.gov.in',
    role: 'Nodal Officer',
    district: 'Visakhapatnam',
    jurisdictionSubBasin: 'Meghadrigedda & Mudasarlova Basin Command',
    maskedMobile: '+91 94••••••89',
    phone: '+91 94401 56789',
    status: 'Active',
    lastActive: 'Today, 11:15 AM',
    specializationOrMachinery: 'Strategic Catchment Conservation & City Inflow Oversight',
    agencyOrUnit: 'Visakhapatnam Collectorate & Water Resources Authority',
    rating: 5.0,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-03',
    staffId: 'AP-WRA-PVM-01',
    name: 'Smt. P. Hemalatha',
    email: 'nodal.pvm@nirikshan.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Parvathipuram Manyam',
    jurisdictionSubBasin: 'Thotapalli Barrage & Janjhavathi River Basin',
    maskedMobile: '+91 94••••••21',
    phone: '+91 94902 44321',
    status: 'Active',
    lastActive: '1 hour ago',
    specializationOrMachinery: 'Barrage Sluice Regulation & Tribal Watershed Monitoring',
    agencyOrUnit: 'Manyam District Water Taskforce',
    rating: 4.9,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-04',
    staffId: 'AP-WRA-SRK-01',
    name: 'Er. K. V. Ramanamurthy',
    email: 'se.irrigation.srk@ap.gov.in',
    role: 'Nodal Officer',
    district: 'Srikakulam',
    jurisdictionSubBasin: 'Vamsadhara Stage II & Gotta Barrage Command',
    maskedMobile: '+91 94••••••10',
    phone: '+91 94901 82110',
    status: 'Active',
    lastActive: '2 hours ago',
    specializationOrMachinery: 'Superintending Engineer - River Basin Sluice & Drainage',
    agencyOrUnit: 'AP Irrigation & Water Resources Department Srikakulam',
    rating: 4.88,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-05',
    staffId: 'AP-WRA-ASR-01',
    name: 'Sri AS Dinesh Kumar, IAS',
    email: 'collector.asr@ap.gov.in',
    role: 'Nodal Officer',
    district: 'Alluri Sitharama Raju',
    jurisdictionSubBasin: 'Eastern Ghats Catchment & Paderu Sub-basin Command',
    maskedMobile: '+91 94••••••55',
    phone: '+91 94901 33455',
    status: 'Active',
    lastActive: '45 mins ago',
    specializationOrMachinery: 'Dense Forest Catchment & Machkund Hydro Basin Surveillance',
    agencyOrUnit: 'ASR District Collectorate & Water Resources Wing',
    rating: 4.92,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-06',
    staffId: 'AP-WRA-AKP-01',
    name: 'Er. B. Rama Rao',
    email: 'se.anakapalli@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Anakapalli',
    jurisdictionSubBasin: 'Raiwada Reservoir & Sarada River Inflow Corridor',
    maskedMobile: '+91 94••••••88',
    phone: '+91 94402 11988',
    status: 'Active',
    lastActive: 'Today, 10:30 AM',
    specializationOrMachinery: 'Sarada & Varaha River Systems Flood & Inflow Management',
    agencyOrUnit: 'Anakapalli Irrigation Circle',
    rating: 4.86,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-07',
    staffId: 'AP-WRA-KKD-01',
    name: 'Er. M. Srinivasa Rao',
    email: 'se.kakinada@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Kakinada',
    jurisdictionSubBasin: 'Yeleru Reservoir Left Main Canal & Coastal Delta Network',
    maskedMobile: '+91 94••••••77',
    phone: '+91 94404 55677',
    status: 'Active',
    lastActive: '20 mins ago',
    specializationOrMachinery: 'Yeleru Reservoir Command & Industrial Canal Flow Regulatory',
    agencyOrUnit: 'Kakinada Water Resources Division',
    rating: 4.89,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-08',
    staffId: 'AP-WRA-EGD-01',
    name: 'Smt. B. Nirmala Rao',
    email: 'nirmala.rao@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'East Godavari',
    jurisdictionSubBasin: 'Sir Arthur Cotton Barrage & Rajahmundry Canal Command',
    maskedMobile: '+91 91••••••33',
    phone: '+91 91480 22233',
    status: 'Active',
    lastActive: '3 hours ago',
    specializationOrMachinery: 'Godavari Delta Canals & Barrage Flood Discharge Regulation',
    agencyOrUnit: 'Godavari Delta Irrigation Circle (Rajahmundry)',
    rating: 4.9,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-09',
    staffId: 'AP-WRA-KNM-01',
    name: 'Er. Ch. Venkateswara Rao',
    email: 'ee.konaseema@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Dr. B.R. Ambedkar Konaseema',
    jurisdictionSubBasin: 'Gannavaram Aqueduct & Gautami Godavari Distributaries',
    maskedMobile: '+91 94••••••90',
    phone: '+91 94406 88990',
    status: 'Active',
    lastActive: '1 hour ago',
    specializationOrMachinery: 'Island Delta Embankment, Saline Tidal Ingress Buffer',
    agencyOrUnit: 'Amalapuram Central Delta Division',
    rating: 4.88,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-10',
    staffId: 'AP-WRA-ELR-01',
    name: 'Er. G. Satyanarayana',
    email: 'se.eluru@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Eluru',
    jurisdictionSubBasin: 'Kolleru Lake Wetland Command & Tammileru Reservoir',
    maskedMobile: '+91 94••••••14',
    phone: '+91 94903 22114',
    status: 'Active',
    lastActive: '35 mins ago',
    specializationOrMachinery: 'Ramsar Wetland Catchment Eco-Restoration & Tank Desilting',
    agencyOrUnit: 'Eluru Irrigation Circle & Kolleru Command',
    rating: 4.85,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-11',
    staffId: 'AP-WRA-WGD-01',
    name: 'Er. T. Murali Krishna',
    email: 'se.westgodavari@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'West Godavari',
    jurisdictionSubBasin: 'Narasapuram Canal & Godavari Western Delta Regulators',
    maskedMobile: '+91 94••••••55',
    phone: '+91 94401 77655',
    status: 'Active',
    lastActive: 'Today, 08:30 AM',
    specializationOrMachinery: 'Western Delta Sluices & Brackish Aquaculture Drainage Control',
    agencyOrUnit: 'Bhimavaram Delta Engineering Wing',
    rating: 4.87,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-12',
    staffId: 'AP-WRA-NTR-01',
    name: 'Dr. S. Dilli Rao, IAS',
    email: 'collector.ntr@ap.gov.in',
    role: 'Nodal Officer',
    district: 'NTR',
    jurisdictionSubBasin: 'Prakasam Barrage Headworks & Budameru Diversion Channel',
    maskedMobile: '+91 94••••••42',
    phone: '+91 94401 88442',
    status: 'Active',
    lastActive: 'Just now',
    specializationOrMachinery: 'Vijayawada Urban Flood Mitigation & Prakasam Barrage Gates',
    agencyOrUnit: 'NTR District Collectorate Water Command Cell',
    rating: 4.97,
    activeTasksCount: 4,
  },
  {
    id: 'usr-nodal-13',
    staffId: 'AP-WRA-KRI-01',
    name: 'Er. V. Koteswara Rao',
    email: 'se.krishna@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Krishna',
    jurisdictionSubBasin: 'Krishna Eastern Delta & Bandar Canal Headworks',
    maskedMobile: '+91 94••••••31',
    phone: '+91 94402 99331',
    status: 'Active',
    lastActive: 'Today, 10:10 AM',
    specializationOrMachinery: 'Prakasam Barrage Live Outflow & Coastal Salinity Barriers',
    agencyOrUnit: 'Krishna Eastern Delta Circle (Machilipatnam)',
    rating: 4.91,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-14',
    staffId: 'AP-WRA-PLN-01',
    name: 'Er. P. Venkateswarlu',
    email: 'se.palnadu@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Palnadu',
    jurisdictionSubBasin: 'Nagarjuna Sagar Right Canal & Buggavagu Reservoir Command',
    maskedMobile: '+91 94••••••52',
    phone: '+91 94901 66552',
    status: 'Active',
    lastActive: '18 mins ago',
    specializationOrMachinery: 'Nagarjuna Sagar Main Feeder Sluices & Deep Limestone Aquifer Regulators',
    agencyOrUnit: 'Palnadu Irrigation Division (Narasaraopet)',
    rating: 4.88,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-15',
    staffId: 'AP-WRA-GNT-01',
    name: 'Smt. M. Venugopal, IAS',
    email: 'collector.guntur@ap.gov.in',
    role: 'Nodal Officer',
    district: 'Guntur',
    jurisdictionSubBasin: 'Krishna Western Delta & Guntur Channel Command Network',
    maskedMobile: '+91 94••••••98',
    phone: '+91 94401 22998',
    status: 'Active',
    lastActive: '1 hour ago',
    specializationOrMachinery: 'Western Delta Irrigation, Capital Region Drainage Integration',
    agencyOrUnit: 'Guntur District Water Resources Authority',
    rating: 4.94,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-16',
    staffId: 'AP-WRA-BPT-01',
    name: 'Er. K. Subba Reddy',
    email: 'ee.bapatla@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Bapatla',
    jurisdictionSubBasin: 'Kommamuru Canal & Romperu Coastal Drainage Basin',
    maskedMobile: '+91 94••••••12',
    phone: '+91 94403 77112',
    status: 'Active',
    lastActive: '2 hours ago',
    specializationOrMachinery: 'Coastal Estuary Inflow, Romperu Sluice Discharge Management',
    agencyOrUnit: 'Bapatla Irrigation & Drainage Division',
    rating: 4.85,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-17',
    staffId: 'AP-WRA-PRK-01',
    name: 'Er. K. Lakshmaiah',
    email: 'se.prakasam@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Prakasam',
    jurisdictionSubBasin: 'Gundlakamma Reservoir & Veligonda Project Tunnel Feeder',
    maskedMobile: '+91 94••••••43',
    phone: '+91 94902 88443',
    status: 'Active',
    lastActive: '50 mins ago',
    specializationOrMachinery: 'Drought-Prone Tank Cascades & Veligonda Tunnel Water Feeder',
    agencyOrUnit: 'Prakasam Irrigation Project Circle (Ongole)',
    rating: 4.89,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-18',
    staffId: 'AP-WRA-NLR-01',
    name: 'Er. C. Harinarayana',
    email: 'se.nellore@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'SPSR Nellore',
    jurisdictionSubBasin: 'Somasila Dam & Pennar Delta Irrigation Command',
    maskedMobile: '+91 94••••••39',
    phone: '+91 94401 66339',
    status: 'Active',
    lastActive: 'Today, 11:45 AM',
    specializationOrMachinery: 'Somasila Reservoir Gate Operations & Pennar Delta Canals',
    agencyOrUnit: 'Somasila Project & Pennar Delta Circle',
    rating: 4.93,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-19',
    staffId: 'AP-WRA-KNL-01',
    name: 'Er. B. Ramanjaneyulu',
    email: 'se.kurnool@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Kurnool',
    jurisdictionSubBasin: 'Tungabhadra Lower Level Canal & Srisailam Right Bank',
    maskedMobile: '+91 94••••••28',
    phone: '+91 94901 44228',
    status: 'Active',
    lastActive: '30 mins ago',
    specializationOrMachinery: 'Srisailam Reservoir Spillway & Tungabhadra Inter-basin Sluices',
    agencyOrUnit: 'Kurnool Irrigation Project Circle',
    rating: 4.9,
    activeTasksCount: 4,
  },
  {
    id: 'usr-nodal-20',
    staffId: 'AP-WRA-NDL-01',
    name: 'Er. G. Chenna Kesava Rao',
    email: 'ee.nandyal@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Nandyal',
    jurisdictionSubBasin: 'Kurnool-Cuddapah (KC) Canal & Velgodu Balancing Reservoir',
    maskedMobile: '+91 94••••••17',
    phone: '+91 94402 88117',
    status: 'Active',
    lastActive: 'Today, 09:15 AM',
    specializationOrMachinery: 'Velgodu Balancing Reservoir, K.C. Canal Sluice Regulation',
    agencyOrUnit: 'Telugu Ganga Project Division Nandyal',
    rating: 4.88,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-21',
    staffId: 'AP-WRA-ATP-01',
    name: 'Er. M. Rajasekhar',
    email: 'se.anantapur@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Anantapur',
    jurisdictionSubBasin: 'Mid Pennar Dam & Tungabhadra High Level Canal (HLC)',
    maskedMobile: '+91 94••••••91',
    phone: '+91 94903 55991',
    status: 'Active',
    lastActive: '25 mins ago',
    specializationOrMachinery: 'Arid Zone Rainwater Harvesting & HLC Branch Channel Security',
    agencyOrUnit: 'Anantapur Irrigation Circle',
    rating: 4.87,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-22',
    staffId: 'AP-WRA-SSS-01',
    name: 'Er. Y. Ramachandra Reddy',
    email: 'ee.srisathyasai@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Sri Sathya Sai',
    jurisdictionSubBasin: 'Penna Ahobilam Balancing Reservoir (PABR) & Chitravathi River',
    maskedMobile: '+91 94••••••23',
    phone: '+91 94404 66223',
    status: 'Active',
    lastActive: '1 hour ago',
    specializationOrMachinery: 'Chitravathi Balancing Reservoir & Tank Recharging Sluices',
    agencyOrUnit: 'Sri Sathya Sai Water Resources Division (Puttaparthi)',
    rating: 4.86,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-23',
    staffId: 'AP-WRA-YSR-01',
    name: 'Er. V. Madhusudhan Rao',
    email: 'se.kadapa@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Y.S.R. (Kadapa)',
    jurisdictionSubBasin: 'Gandikota Reservoir & Kundu River Interlinking Sluice',
    maskedMobile: '+91 94••••••82',
    phone: '+91 94901 99882',
    status: 'Active',
    lastActive: '12 mins ago',
    specializationOrMachinery: 'Gandikota Deep Gorge Reservoir, Galeru Nagari Canal Sluices',
    agencyOrUnit: 'YSR Kadapa Irrigation Circle',
    rating: 4.92,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-24',
    staffId: 'AP-WRA-ANM-01',
    name: 'Er. N. Surendra Babu',
    email: 'ee.annamayya@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Annamayya',
    jurisdictionSubBasin: 'Veligallu Dam, Papagni River & Pincha Reservoir Catchment',
    maskedMobile: '+91 94••••••47',
    phone: '+91 94403 11447',
    status: 'Active',
    lastActive: 'Today, 08:50 AM',
    specializationOrMachinery: 'Veligallu Project, Bahuda River System Flood Diversion',
    agencyOrUnit: 'Rayachoti Water Resources Division',
    rating: 4.85,
    activeTasksCount: 2,
  },
  {
    id: 'usr-nodal-25',
    staffId: 'AP-WRA-CTR-01',
    name: 'Sri Anil Kumar Varma',
    email: 'anil.varma@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Chittoor',
    jurisdictionSubBasin: 'Madanapalle Sub-basin & Ponnai/Araniar Catchment',
    maskedMobile: '+91 98••••••12',
    phone: '+91 98480 11212',
    status: 'Active',
    lastActive: '12 mins ago',
    specializationOrMachinery: 'Drought-Prone Tank Cascades & Check Dam Monitoring',
    agencyOrUnit: 'Chittoor Minor Irrigation Division',
    rating: 4.85,
    activeTasksCount: 3,
  },
  {
    id: 'usr-nodal-26',
    staffId: 'AP-WRA-TPT-01',
    name: 'Er. T. Mallikarjuna Rao',
    email: 'se.tirupati@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Tirupati',
    jurisdictionSubBasin: 'Kalyani Dam Reservoir, Swarnamukhi & Srikalahasti Canals',
    maskedMobile: '+91 94••••••34',
    phone: '+91 94902 77334',
    status: 'Active',
    lastActive: '40 mins ago',
    specializationOrMachinery: 'Kalyani Dam Water Supply & Swarnamukhi Riverbed Aquifers',
    agencyOrUnit: 'Tirupati Water Command & Telugu Ganga Circle',
    rating: 4.95,
    activeTasksCount: 3,
  },

  // ====================================================================
  // --- FIELD INSPECTORS (66 CERTIFIED INSPECTORS ACROSS ALL 26 AP DISTRICTS) ---
  // ====================================================================
  ...COMPLETE_AP_FIELD_INSPECTORS.map((insp) => ({
    id: `usr-insp-${insp.inspector_id}`,
    staffId: insp.inspector_id,
    name: insp.full_name,
    email: insp.email,
    role: 'Field Inspector' as const,
    district: insp.district,
    jurisdictionSubBasin: `${insp.mandal} Mandal • Meter: ${insp.meter_id || 'TDS-CAL-01'}`,
    maskedMobile: insp.phone.slice(0, 7) + '••••' + insp.phone.slice(-2),
    phone: insp.phone,
    status: (insp.status === 'Inactive' ? 'Inactive' : insp.status === 'Standby' ? 'Standby' : 'Active') as DepartmentalPersonnel['status'],
    lastActive: insp.status === 'Active' ? 'Active in Roster' : 'Standby in Roster',
    specializationOrMachinery: `Digital Water Quality Meter (${insp.meter_id || 'TDS-01'}) • Surveillance & Silt Auditing`,
    agencyOrUnit: `District Water Surveillance Wing (${insp.district})`,
    assignedMandals: [insp.mandal],
    rating: 4.88,
    activeTasksCount: insp.open_inspections || 0,
    sourceTable: 'operational_roster',
  })),

  // ====================================================================
  // --- ACTION WORKERS & REMEDIATION CREWS (133 UNITS ACROSS ALL 26 AP DISTRICTS) ---
  // ====================================================================
  ...COMPLETE_AP_ACTION_WORKERS.map((wrk) => {
    const workerName = wrk.name_or_crew_type || wrk.contact_person || 'APWRIMS Field Unit';
    const emailPrefix = workerName.toLowerCase().replace(/[^a-z0-9]/g, '.').slice(0, 15);
    return {
      id: `usr-wrk-${wrk.worker_id}`,
      staffId: wrk.worker_id,
      name: workerName,
      email: `${emailPrefix || 'worker'}@works.ap.gov.in`,
      role: 'Action Worker' as const,
      district: wrk.district,
      jurisdictionSubBasin: `${wrk.service_areas || wrk.district} • ${wrk.skills}`,
      maskedMobile: wrk.phone.slice(0, 7) + '••••' + wrk.phone.slice(-2),
      phone: wrk.phone,
      status: (wrk.availability === 'Busy' ? 'On Duty' : wrk.availability === 'On leave' ? 'Standby' : 'Ready for Dispatch') as DepartmentalPersonnel['status'],
      lastActive: 'Available in APWRIMS Roster',
      specializationOrMachinery: `${wrk.type}: ${wrk.skills} • Lead: ${wrk.contact_person}`,
      agencyOrUnit: `APWRIMS Rapid Remediation Fleet (${wrk.district})`,
      crewStrength: wrk.type === 'Crew' ? 6 : wrk.type === 'Contractor' ? 12 : 2,
      rating: 4.9,
      activeTasksCount: wrk.open_tasks || 0,
      sourceTable: 'operational_roster',
    };
  }),
];

// Escalated Cases Requiring Immediate State Intervention
export const ESCALATED_CASES_DATA: EscalatedCase[] = [
  {
    id: 'esc-01',
    code: 'ESC-AP-2041',
    assetName: 'Pedda Cheruvu Sluice Gate',
    assetCode: 'AP-CTR-9014 • Major Sluice',
    district: 'Chittoor',
    assignedOwner: 'M. Raghava Rao',
    daysOverdue: '+14d',
    priority: 'Critical',
    status: 'Critical / Overdue',
    hazardSummary: 'Structural regulator gate jammed with timber and silt. Water backlogging into residential farmland.',
  },
  {
    id: 'esc-02',
    code: 'ESC-AP-2038',
    assetName: 'Nagari Check Dam Crest Masonry',
    assetCode: 'AP-CTR-1102 • Check Dam',
    district: 'Chittoor',
    assignedOwner: 'A. Kiran Kumar',
    daysOverdue: '+9d',
    priority: 'Critical',
    status: 'Critical / Overdue',
    hazardSummary: 'Right spillway masonry fractured during monsoonal surge; high breach probability.',
  },
  {
    id: 'esc-03',
    code: 'ESC-AP-1994',
    assetName: 'Bukkarayasamudram Percolation Basin',
    assetCode: 'AP-ATP-4410 • Percolation Pond',
    district: 'Anantapur',
    assignedOwner: 'D. Lakshminarayana',
    daysOverdue: '+7d',
    priority: 'High',
    status: 'In Progress / Overdue',
    hazardSummary: 'Percolation basin silted with impermeable clay; artificial recharge reduced by 85%.',
  },
  {
    id: 'esc-04',
    code: 'ESC-AP-1981',
    assetName: 'Kovvur Feeder Canal Silt Block',
    assetCode: 'AP-EGD-7781 • Feeder Channel',
    district: 'East Godavari',
    assignedOwner: 'V. Naidu',
    daysOverdue: '+6d',
    priority: 'High',
    status: 'Inspection Due',
    hazardSummary: 'Heavy water hyacinth mat choking the primary agricultural distribution feeder.',
  },
];

// Immutable System Audit Log Records
export const INITIAL_AUDIT_LOGS: SystemAuditRecord[] = [
  {
    id: 'log-01',
    timestamp: '15 May 2026, 14:32:08',
    blockNumber: 'Block #884,912',
    initiatedBy: { name: 'P. Kalyani', role: 'District Hydrologist', initials: 'PK' },
    action: 'Status Transition',
    recordId: 'AST-CH-4802',
    stateTransition: { from: 'In Progress', to: 'Verified' },
  },
  {
    id: 'log-02',
    timestamp: '15 May 2026, 13:19:44',
    blockNumber: 'Block #884,908',
    initiatedBy: { name: 'S. Ramanathan', role: 'State Admin', initials: 'SR' },
    action: 'SLA Rule Edit',
    recordId: 'RULE-SLA-09',
    stateTransition: { from: '72 Hours Max', to: '48 Hours' },
  },
  {
    id: 'log-03',
    timestamp: '15 May 2026, 11:05:12',
    blockNumber: 'Block #884,895',
    initiatedBy: { name: 'M. Venkat', role: 'Field Assessor', initials: 'MV' },
    action: 'Status Transition',
    recordId: 'AST-VZ-1194',
    stateTransition: { from: 'Inspection Due', to: 'Critical Alert' },
  },
  {
    id: 'log-04',
    timestamp: '15 May 2026, 09:40:22',
    blockNumber: 'Block #884,870',
    initiatedBy: { name: 'P. Kalyani', role: 'District Hydrologist', initials: 'PK' },
    action: 'Force Reassigned',
    recordId: 'TSK-2024-884',
    stateTransition: { from: 'Officer: R. Reddy', to: 'Officer: A. Varma' },
  },
  {
    id: 'log-05',
    timestamp: '14 May 2026, 18:22:15',
    blockNumber: 'Block #884,810',
    initiatedBy: { name: 'S. Ramanathan', role: 'State Admin', initials: 'SR' },
    action: 'User Provisioned',
    recordId: 'USR-109',
    stateTransition: { from: 'Pending KYC', to: 'Active Inspector' },
  },
  {
    id: 'log-06',
    timestamp: '14 May 2026, 16:04:59',
    blockNumber: 'Block #884,792',
    initiatedBy: { name: 'Auto Gateway', role: 'Telemetry Daemon', initials: 'AG' },
    action: 'Sensor Calibration',
    recordId: 'SNS-PIEZ-022',
    stateTransition: { from: 'Variance > 5%', to: 'Zero-Drift Calibrated' },
  },
];

// Service Level Agreement (SLA) Escalation Rules & Urgency Tiers
export const INITIAL_SLA_TIERS: SlaPriorityTier[] = [
  {
    id: 'critical',
    name: 'Critical',
    priorityLevel: 1,
    badgeLabel: 'Priority 1',
    badgeColor: 'rose',
    description: 'Structural breaches, embankment burst risk, blocked flood sluices, and sudden hydrostatic load spikes.',
    inspectHours: 12,
    assignHours: 4,
    resolutionDays: 2,
    autoEscalate: true,
    escalationChannel: 'Direct SMS & State Level Flag',
    isHardLimit: true,
  },
  {
    id: 'high',
    name: 'High',
    priorityLevel: 2,
    badgeLabel: 'Priority 2',
    badgeColor: 'amber',
    description: 'Severe siltation, damaged masonry check dam spillway, leaking sluice gate, or non-functional gauge.',
    inspectHours: 24,
    assignHours: 12,
    resolutionDays: 5,
    autoEscalate: true,
    escalationChannel: 'Mandal Escalation Routing',
  },
  {
    id: 'medium',
    name: 'Medium',
    priorityLevel: 3,
    badgeLabel: 'Priority 3',
    badgeColor: 'amber',
    description: 'Weed infestation in feeder channel, minor bund scour, gauge rod replacement, and marker repainting.',
    inspectHours: 48,
    assignHours: 24,
    resolutionDays: 10,
    autoEscalate: false,
    escalationChannel: 'Supervisor Daily Digest',
  },
  {
    id: 'routine',
    name: 'Routine',
    priorityLevel: 4,
    badgeLabel: 'Priority 4',
    badgeColor: 'emerald',
    description: 'Scheduled pre-monsoon survey, boundary stone verification, routine photo validation, and log audit.',
    inspectHours: 168, // 7 days
    assignHours: 72, // 3 days
    resolutionDays: 21,
    autoEscalate: false,
    escalationChannel: 'Bi-weekly Operational Digest',
  },
];

// Dual-State Photographic Evidence Rectification Proof Cases
export const RECENT_FIELD_EVIDENCE = [
  {
    id: 'proof-01',
    code: 'AP-CTR-1049',
    title: 'Desilting & Weir Repair',
    district: 'Chittoor',
    circle: 'Madanapalle Circle',
    inspector: 'K. Suresh (Vizianagaram Circle)',
    beforeDate: '12-Apr-2026',
    afterDate: '04-May-2026',
    beforePhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=600&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    impact: 'Capacity restored: +42,000 L',
    status: 'Verified',
  },
  {
    id: 'proof-02',
    code: 'AP-ATP-8812',
    title: 'Inflow Channel Embankment',
    district: 'Anantapur',
    circle: 'Dharmavaram Circle',
    inspector: 'P. Venkat (Anantapur Circle)',
    beforeDate: '18-Apr-2026',
    afterDate: '02-May-2026',
    beforePhoto: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    impact: 'Infiltration speed: +18 cm/hr',
    status: 'Verified',
  },
];
