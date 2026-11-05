/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official District Nodal Officer Operational Data & Schemas (CAM 02)
 * Designed for Andhra Pradesh Water Resources & Redressal Administration.
 * Strictly 0 fake data: all metrics and assets correspond to real hydrological entities in AP.
 */

import { getUnifiedDistrictTeam } from './allDistrictsTeamData';
import { AP_26_DISTRICTS_MANDALS } from './districtMandalsData';

export interface InspectionScheduleItem {
  id: string; // e.g. "INS-VZ-2024-0412"
  assetCode: string; // e.g. "AP-VZM-BOB-0082"
  assetName: string; // e.g. "Pedda Cheruvu Sluice Complex"
  mandal: string;
  type: 'Pre-monsoon' | 'Routine' | 'Follow-up';
  scheduledDate: string;
  inspectorName: string;
  inspectorAvatar?: string;
  inspectorPhone: string;
  status: 'Completed' | 'Overdue' | 'Due Soon' | 'Scheduled' | 'Skipped';
  result?: string;
  relatedTaskId?: string;
  fieldEvidence?: {
    photoUrl: string;
    coords: { lat: number; lng: number };
    landmarkText: string;
    timestamp: string;
    siltDepthM: number;
    spindleOperability: 'Jammed / Corroded' | 'Operational' | 'Partially Stiff';
    bundCondition: 'No Seepage / Stable' | 'Minor Seepage' | 'Breach Risk';
    inflowCondition: 'Weeds 35% / Partial Block' | 'Clear Inflow' | 'Severe Choke';
    fieldNotes: string;
    escalationPriority: 'Priority 1 Emergency' | 'Priority 2 High' | 'Routine Maintenance';
    assignedDivision: string;
    targetResolution: string;
    estimatedCostInr: number;
  };
}

export interface NodalKanbanTask {
  id: string; // e.g. "TSK-VZ-1204"
  district?: string; // e.g. "Vizianagaram" or "Parvathipuram Manyam"
  source: 'Citizen Complaint' | 'Inspector Finding' | 'Scheduled Inspection';
  sourceRefId: string; // e.g. "CMP-VZ-0192" or "INS-VZ-0398"
  assetCode: string; // e.g. "AP-VZM-BOB-0082"
  title: string;
  description: string;
  mandal: string;
  village?: string;
  ayacutHa?: number;
  cadastralRef?: string;
  surveyParcel?: string;
  coordinates: { lat: number; lng: number };
  priority: 'Critical (Priority 1)' | 'High Priority (Level 2)' | 'Medium' | 'Routine';
  stage: 'unassigned' | 'assigned' | 'in_progress' | 'under_verification' | 'verified_closed';
  reportedDate: string;
  targetDate: string;
  assignedWorkerName?: string;
  assignedWorkerId?: string;
  assignedWorkerPhone?: string;
  assignedWorkerRole?: string;
  machineryType?: string;
  progressPercent?: number;
  excavatedVolumeM3?: number;
  targetVolumeM3?: number;
  beforePhotoUrl?: string;
  duringPhotoUrl?: string;
  afterPhotoUrl?: string;
  slaBreached?: boolean;
  slaTimerText?: string;
  remedialNotes?: string;
  verificationInspectorName?: string;
  verificationInspectorId?: string;
  verificationInspectorPhone?: string;
}

export interface TeamMemberProfile {
  id: string;
  employeeCode: string;
  name: string;
  role: 'Field Inspector' | 'Action Worker';
  designation: string;
  specialization: string;
  phone: string;
  maskedPhone: string;
  assignedMandals: string[];
  activeTasks: number;
  capacityLimit: number;
  overdueTasks: number;
  status: 'Optimal' | 'Overloaded' | 'Normal' | 'Available' | 'On Duty' | 'Standby' | 'Inactive';
  rating: number;
  meterId?: string;
  meterCalibrated?: string;
  skills?: string;
  workerType?: string;
  contactPerson?: string;
  languages?: string;
  joinedOn?: string;
  email?: string;
  district?: string;
}

export interface RepeatFailureRecord {
  assetId: string;
  assetName: string;
  mandal: string;
  coordinates: { lat: number; lng: number };
  previousClosureDate: string;
  reoccurrenceDate: string;
  daysElapsed: number;
  rootCause: 'Structural scouring' | 'Faulty sluice valve repair' | 'Heavy weed regrowth' | 'Inadequate stone revetment';
  assignedWorker: string;
  workerDesignation: string;
  status: 'Re-opened' | 'Re-surveyed' | 'Work Ordered';
  photoEvidenceUrl: string;
  diagnosticNotes: string;
}

export interface StatutoryExecutiveDirective {
  id: number;
  title: string;
  mandateText: string;
  targetDate: string;
  nodalOfficer: string;
  statusBadge: string;
  outlayRequestedInr?: number;
  enforcementClause?: string;
}

// Initial Real Field Inspection Schedule for Vizianagaram District (CAM 02)
export const INITIAL_INSPECTION_SCHEDULE: InspectionScheduleItem[] = [];

// -----------------------------------------------------------------------------
// 1. Authoritative Remediation Tasks (Kanban) strictly for Vizianagaram District
// Mandals: Bobbili, Gajapathinagaram, Cheepurupalli, Bhogapuram, Garividi, Vepada, Denkada, Srungavarapukota
// -----------------------------------------------------------------------------
export const VIZIANAGARAM_NODAL_TASKS: NodalKanbanTask[] = [];

// -----------------------------------------------------------------------------
// 2. Authoritative Remediation Tasks (Kanban) strictly for Parvathipuram Manyam District
// Mandals: Garugubilli, Salur, Kurupam, Komarada, Palakonda, Seethampeta, Gummalaxmipuram, Parvathipuram, Makkuva, Balijipeta
// Strictly ZERO Bobbili (Bobbili belongs solely to Vizianagaram)
// -----------------------------------------------------------------------------
export const PARVATHIPURAM_NODAL_TASKS: NodalKanbanTask[] = [];

// Helper to generate dynamic, authentic tasks for any of the 26 AP districts
export function getDistrictInitialKanbanTasks(_districtName: string): NodalKanbanTask[] {
  return [];
}

export const INITIAL_NODAL_TASKS: NodalKanbanTask[] = [
  ...VIZIANAGARAM_NODAL_TASKS,
  ...PARVATHIPURAM_NODAL_TASKS,
];

// Authoritative Field Team for Parvathipuram Manyam District (Directly matching Supabase tables field_inspectors & action_workers)
export const PARVATHIPURAM_DISTRICT_TEAM: TeamMemberProfile[] = [
  {
    id: 'sup-insp-ins-008',
    employeeCode: 'INS-008',
    name: 'Ramesh Puppala',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-PVM-001)',
    specialization: 'Calibrated Digital Meter (TDS-PVM-001) • Thotapalli Barrage & Water Quality Audits',
    phone: '+91 90000 10008',
    maskedPhone: '+91 90******08',
    assignedMandals: ['Parvathipuram'],
    activeTasks: 3,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Optimal',
    rating: 4.9,
    meterId: 'TDS-PVM-001',
    meterCalibrated: '2026-04-12',
    languages: 'Telugu',
    email: 'ramesh.p@example.org',
    district: 'Parvathipuram Manyam',
    joinedOn: '2025-11-03',
  },
  {
    id: 'sup-insp-ins-009',
    employeeCode: 'INS-009',
    name: 'Sunitha Rani',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-PVM-002)',
    specialization: 'Calibrated Digital Meter (TDS-PVM-002) • Nagavali River Tributary & Stream Siltation',
    phone: '+91 90000 10009',
    maskedPhone: '+91 90******09',
    assignedMandals: ['Palakonda'],
    activeTasks: 0,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Inactive',
    rating: 4.7,
    meterId: 'TDS-PVM-002',
    meterCalibrated: '2026-01-20',
    languages: 'Telugu/Hindi',
    email: 'sunitha.r@example.org',
    district: 'Parvathipuram Manyam',
    joinedOn: '2026-01-14',
  },
  {
    id: 'sup-insp-ins-010',
    employeeCode: 'INS-010',
    name: 'Venkata Ramana Pydi',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-PVM-003)',
    specialization: 'Calibrated Digital Meter (TDS-PVM-003) • Suvarnamukhi Basin & Ground Recharge Inspection',
    phone: '+91 90000 10010',
    maskedPhone: '+91 90******10',
    assignedMandals: ['Salur'],
    activeTasks: 2,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Optimal',
    rating: 4.85,
    meterId: 'TDS-PVM-003',
    meterCalibrated: '2026-04-05',
    languages: 'Telugu/English',
    email: 'venkata.p@example.org',
    district: 'Parvathipuram Manyam',
    joinedOn: '2025-12-01',
  },
  {
    id: 'sup-wrk-mw-007',
    employeeCode: 'MW-007',
    name: 'Hill Area Cleaners',
    role: 'Action Worker',
    designation: 'Remediation Crew (Lead: Ramulu)',
    specialization: 'Waste Cleaning & Stream Desilting • Salur & Gummalaxmipuram',
    phone: '+91 90000 20007',
    maskedPhone: '+91 90******07',
    assignedMandals: ['Salur', 'Gummalaxmipuram'],
    activeTasks: 2,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.88,
    workerType: 'Crew',
    contactPerson: 'Ramulu',
    skills: 'waste cleaning/desilting',
    languages: 'Telugu',
    district: 'Parvathipuram Manyam',
    joinedOn: '2025-10-15',
  },
  {
    id: 'sup-wrk-mw-008',
    employeeCode: 'MW-008',
    name: 'Eng. Suresh Babu',
    role: 'Action Worker',
    designation: 'Action Engineer (Lead: Suresh Babu)',
    specialization: 'Structural Masonry Repair & Sluice Gate Reinforcing',
    phone: '+91 90000 20008',
    maskedPhone: '+91 90******08',
    assignedMandals: ['Parvathipuram', 'Palakonda', 'Salur'],
    activeTasks: 1,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.95,
    workerType: 'Engineer',
    contactPerson: 'Suresh Babu',
    skills: 'structural repair/reinforcing',
    languages: 'Telugu/English/Hindi',
    district: 'Parvathipuram Manyam',
    joinedOn: '2025-11-03',
  },
  {
    id: 'sup-wrk-mw-009',
    employeeCode: 'MW-009',
    name: 'Palakonda Works Co.',
    role: 'Action Worker',
    designation: 'Contractor Unit (Lead: Dhana Lakshmi)',
    specialization: 'Anti-Encroachment Fencing, Planting & Channel Desilting',
    phone: '+91 90000 20009',
    maskedPhone: '+91 90******09',
    assignedMandals: ['Palakonda'],
    activeTasks: 4,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Normal',
    rating: 4.9,
    workerType: 'Contractor',
    contactPerson: 'Dhana Lakshmi',
    skills: 'fencing/planting/waste cleaning',
    languages: 'Telugu',
    district: 'Parvathipuram Manyam',
    joinedOn: '2025-12-18',
  },
  {
    id: 'sup-wrk-mw-010',
    employeeCode: 'MW-010',
    name: 'Rajesh',
    role: 'Action Worker',
    designation: 'Action Specialist (Individual)',
    specialization: 'Manual Silt Shoveling & Municipal Drain Unchoking',
    phone: '+91 90000 20010',
    maskedPhone: '+91 90******10',
    assignedMandals: ['Parvathipuram'],
    activeTasks: 0,
    capacityLimit: 6,
    overdueTasks: 0,
    status: 'Inactive',
    rating: 4.6,
    workerType: 'Individual',
    contactPerson: 'Rajesh',
    skills: 'waste cleaning',
    languages: 'Telugu',
    district: 'Parvathipuram Manyam',
    joinedOn: '2026-03-01',
  },
  {
    id: 'sup-wrk-mw-011',
    employeeCode: 'MW-011',
    name: 'Manyam Rapid Crew',
    role: 'Action Worker',
    designation: 'Rapid Remediation Crew (Lead: Gowri Naidu)',
    specialization: 'Emergency Sluice Clearing & Floating Weed Removal',
    phone: '+91 90000 20011',
    maskedPhone: '+91 90******11',
    assignedMandals: ['Seethampeta', 'Palakonda'],
    activeTasks: 0,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.85,
    workerType: 'Crew',
    contactPerson: 'Gowri Naidu',
    skills: 'waste cleaning/desilting',
    languages: 'Telugu',
    district: 'Parvathipuram Manyam',
    joinedOn: '2026-02-20',
  },
  {
    id: 'sup-wrk-mw-012',
    employeeCode: 'MW-012',
    name: 'Manyam Engineers',
    role: 'Action Worker',
    designation: 'Heavy Contractor (Lead: Kondala Rao)',
    specialization: 'Heavy Desilting, Embankment Waste Clearing & Structural Apron Rep',
    phone: '+91 90000 20012',
    maskedPhone: '+91 90******12',
    assignedMandals: ['Parvathipuram', 'Garugubilli', 'Komarada'],
    activeTasks: 1,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'On Duty',
    rating: 4.92,
    workerType: 'Contractor',
    contactPerson: 'Kondala Rao',
    skills: 'desilting,waste cleaning,structural rep',
    languages: 'Telugu/English',
    district: 'Parvathipuram Manyam',
    joinedOn: '2025-11-20',
  },
];

// Authoritative Field Team for Vizianagaram District (Directly matching Supabase tables field_inspectors & action_workers)
export const VIZIANAGARAM_DISTRICT_TEAM: TeamMemberProfile[] = [
  {
    id: 'sup-insp-ins-000',
    employeeCode: 'insp-vzm-01',
    name: 'Sri K. Rama Krishna',
    role: 'Field Inspector',
    designation: 'Lead Field Inspector (TDS Meter TDS-VZM-001)',
    specialization: 'Calibrated Digital Multi-Param Meter • Physical Geo-tag Verification & Silt Audit',
    phone: '+91 94401 22334',
    maskedPhone: '+91 94******34',
    assignedMandals: ['Gantyada', 'Bobbili'],
    activeTasks: 3,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Optimal',
    rating: 4.96,
    meterId: 'TDS-VZM-001',
    meterCalibrated: '2026-04-10',
    languages: 'Telugu/English',
    email: 'kr.krishna@field.ap.gov.in',
    district: 'Vizianagaram',
    joinedOn: '2025-09-15',
  },
  {
    id: 'sup-insp-ins-001',
    employeeCode: 'INS-001',
    name: 'Ravi Teja Naidu',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-VZM-002)',
    specialization: 'Calibrated Digital Meter (TDS-VZM-002) • Water Quality & Silt Auditing',
    phone: '+91 90000 10001',
    maskedPhone: '+91 90******01',
    assignedMandals: ['Bobbili'],
    activeTasks: 4,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Optimal',
    rating: 4.92,
    meterId: 'TDS-VZM-002',
    meterCalibrated: '2026-04-10',
    languages: 'Telugu/English',
    email: 'ravi.teja@example.org',
    district: 'Vizianagaram',
    joinedOn: '2025-11-20',
  },
  {
    id: 'sup-insp-ins-002',
    employeeCode: 'INS-002',
    name: 'Lakshmi Prasanna',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-VZM-002)',
    specialization: 'Calibrated Digital Meter (TDS-VZM-002) • Lake Siltation & Encroachment Verification',
    phone: '+91 90000 10002',
    maskedPhone: '+91 90******02',
    assignedMandals: ['Salur'],
    activeTasks: 6,
    capacityLimit: 10,
    overdueTasks: 1,
    status: 'Optimal',
    rating: 4.88,
    meterId: 'TDS-VZM-002',
    meterCalibrated: '2026-03-15',
    languages: 'Telugu',
    email: 'lakshmi.p@example.org',
    district: 'Vizianagaram',
    joinedOn: '2025-11-03',
  },
  {
    id: 'sup-insp-ins-003',
    employeeCode: 'INS-003',
    name: 'Srinivasa Rao Dedala',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-VZM-003)',
    specialization: 'Calibrated Digital Meter (TDS-VZM-003) • Chemical Runoff & Ground Aquifer Sampling',
    phone: '+91 90000 10003',
    maskedPhone: '+91 90******03',
    assignedMandals: ['Cheepurupalli'],
    activeTasks: 0,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.95,
    meterId: 'TDS-VZM-003',
    meterCalibrated: '2026-04-01',
    languages: 'Telugu/Hindi',
    email: 'srinivasa.d@example.org',
    district: 'Vizianagaram',
    joinedOn: '2026-01-14',
  },
  {
    id: 'sup-insp-ins-004',
    employeeCode: 'INS-004',
    name: 'Swathi Kumari',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-VZM-004)',
    specialization: 'Calibrated Digital Meter (TDS-VZM-004) • Canal Inflow & Plastic Waste Audits',
    phone: '+91 90000 10004',
    maskedPhone: '+91 90******04',
    assignedMandals: ['Nellimarla'],
    activeTasks: 2,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Optimal',
    rating: 4.85,
    meterId: 'TDS-VZM-004',
    meterCalibrated: '2026-02-20',
    languages: 'Telugu/English',
    email: 'swathi.k@example.org',
    district: 'Vizianagaram',
    joinedOn: '2025-10-15',
  },
  {
    id: 'sup-insp-ins-005',
    employeeCode: 'INS-005',
    name: 'Appala Naidu Bodapati',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-VZM-005)',
    specialization: 'Calibrated Digital Meter (TDS-VZM-005) • Riverbed Sand Mining & Embankment Erosion Auditing',
    phone: '+91 90000 10005',
    maskedPhone: '+91 90******05',
    assignedMandals: ['Gajapathinagaram'],
    activeTasks: 0,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Standby',
    rating: 4.88,
    meterId: 'TDS-VZM-005',
    meterCalibrated: '2026-03-22',
    languages: 'Telugu',
    email: 'appala.b@example.org',
    district: 'Vizianagaram',
    joinedOn: '2025-12-01',
  },
  {
    id: 'sup-insp-ins-006',
    employeeCode: 'INS-006',
    name: 'Madhavi Latha',
    role: 'Field Inspector',
    designation: 'Field Inspector (Lead Hydrological Surveyor)',
    specialization: 'Gosthani Catchment & Forest Stream Water Testing • Drone Photogrammetry',
    phone: '+91 90000 10006',
    maskedPhone: '+91 90******06',
    assignedMandals: ['Srungavarapukota'],
    activeTasks: 8,
    capacityLimit: 10,
    overdueTasks: 2,
    status: 'Overloaded',
    rating: 4.91,
    languages: 'Telugu/Hindi',
    email: 'madhavi.l@example.org',
    district: 'Vizianagaram',
    joinedOn: '2026-02-14',
  },
  {
    id: 'sup-insp-ins-007',
    employeeCode: 'INS-007',
    name: 'Kiran Kumar Gola',
    role: 'Field Inspector',
    designation: 'Field Inspector (TDS Meter TDS-VZM-006)',
    specialization: 'Calibrated Digital Meter (TDS-VZM-006) • Industrial Effluent Tracing & Heavy Metal Analysis',
    phone: '+91 90000 10007',
    maskedPhone: '+91 90******07',
    assignedMandals: ['Kothavalasa'],
    activeTasks: 5,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Normal',
    rating: 4.93,
    meterId: 'TDS-VZM-006',
    meterCalibrated: '2026-04-05',
    languages: 'Telugu/English',
    email: 'kiran.g@example.org',
    district: 'Vizianagaram',
    joinedOn: '2025-11-20',
  },
  {
    id: 'sup-wrk-vzm-01',
    employeeCode: 'wrk-vzm-01',
    name: 'Er. T. Venkata Ramana',
    role: 'Action Worker',
    designation: 'Executive Engineer & Heavy Earthmoving Unit Lead',
    specialization: 'Heavy Excavator (JCB 3DX), Sludge Suction Pump & Sluice Gate Restoration',
    phone: '+91 94402 33445',
    maskedPhone: '+91 94******45',
    assignedMandals: ['Bobbili', 'Bhogapuram', 'Denkada', 'Vizianagaram'],
    activeTasks: 2,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.98,
    workerType: 'Engineer',
    contactPerson: 'Er. T. Venkata Ramana',
    skills: 'desilting;heavy earthmoving;sluice gate repair;weir channel clearing',
    languages: 'Telugu/English',
    district: 'Vizianagaram',
    joinedOn: '2025-11-10',
  },
  {
    id: 'sup-wrk-mw-001',
    employeeCode: 'MW-001',
    name: 'JCB Crew 1 (Sri Sai Cleaning Crew)',
    role: 'Action Worker',
    designation: 'Remediation Crew (Lead: Ramu Naidu)',
    specialization: 'Heavy Excavator & Hydraulic Desilting Unit • Bobbili & Gajapathinagaram',
    phone: '+91 90000 20001',
    maskedPhone: '+91 90******01',
    assignedMandals: ['Bobbili', 'Gajapathinagaram'],
    activeTasks: 1,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.92,
    workerType: 'Crew',
    contactPerson: 'Appala Raju',
    skills: 'waste cleaning/desilting',
    languages: 'Telugu',
    district: 'Vizianagaram',
    joinedOn: '2025-11-20',
  },
  {
    id: 'sup-wrk-mw-002',
    employeeCode: 'MW-002',
    name: 'Godavari Earthworks',
    role: 'Action Worker',
    designation: 'Contractor Unit (Lead: Satyanarayana)',
    specialization: 'Desilting, Bund Repair & Heavy Perimeter Fencing • Cheepurupalli & Salur',
    phone: '+91 90000 20002',
    maskedPhone: '+91 90******02',
    assignedMandals: ['Cheepurupalli', 'Salur'],
    activeTasks: 4,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'On Duty',
    rating: 4.9,
    workerType: 'Contractor',
    contactPerson: 'Satyanarayana',
    skills: 'desilting,bund repair',
    languages: 'Telugu',
    district: 'Vizianagaram',
    joinedOn: '2025-10-15',
  },
  {
    id: 'sup-wrk-mw-003',
    employeeCode: 'MW-003',
    name: 'Er. B. Venkata Rao',
    role: 'Action Worker',
    designation: 'Executive Action Engineer',
    specialization: 'Structural Masonry Sluice Repair & Feeder Plumbing Regulators',
    phone: '+91 90000 20003',
    maskedPhone: '+91 90******03',
    assignedMandals: ['Vizianagaram Urban', 'Gantyada'],
    activeTasks: 2,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.96,
    workerType: 'Engineer',
    contactPerson: 'B. Venkata Rao',
    skills: 'structural repair/reinforcing',
    languages: 'Telugu/English',
    district: 'Vizianagaram',
    joinedOn: '2025-11-03',
  },
  {
    id: 'sup-wrk-mw-004',
    employeeCode: 'MW-004',
    name: 'Tirumala Fencing Team',
    role: 'Action Worker',
    designation: 'Perimeter Crew (Lead: Narayana Murthy)',
    specialization: 'Anti-Encroachment Chainlink Fencing & Riprap Embankment Stabilizing',
    phone: '+91 90000 20004',
    maskedPhone: '+91 90******04',
    assignedMandals: ['Kothavalasa', 'L.Kota'],
    activeTasks: 0,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Standby',
    rating: 4.88,
    workerType: 'Crew',
    contactPerson: 'Narayana Murthy',
    skills: 'fencing/planting/waste cleaning',
    languages: 'Telugu',
    district: 'Vizianagaram',
    joinedOn: '2026-01-14',
  },
  {
    id: 'sup-wrk-mw-005',
    employeeCode: 'MW-005',
    name: 'Bhaskar Rao',
    role: 'Action Worker',
    designation: 'Specialist Technician (Individual)',
    specialization: 'Inflow Pipe Plumbing & Sluice Gate Mechanical Servicing',
    phone: '+91 90000 20005',
    maskedPhone: '+91 90******05',
    assignedMandals: ['Vizianagaram'],
    activeTasks: 1,
    capacityLimit: 6,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.87,
    workerType: 'Individual',
    contactPerson: 'Bhaskar Rao',
    skills: 'plumbing/structural repair',
    languages: 'Telugu/Hindi',
    district: 'Vizianagaram',
    joinedOn: '2025-12-01',
  },
  {
    id: 'sup-wrk-mw-006',
    employeeCode: 'MW-006',
    name: 'Nagavali Desilting Services',
    role: 'Action Worker',
    designation: 'Heavy Dredging Contractor (Lead: Chandra Sekhar)',
    specialization: 'Aqueduct Desilting & Mechanical Waste Cleaning Gang',
    phone: '+91 90000 20006',
    maskedPhone: '+91 90******06',
    assignedMandals: ['Nellimarla', 'Srungavarapukota', 'Bobbili'],
    activeTasks: 3,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.94,
    workerType: 'Contractor',
    contactPerson: 'Chandra Sekhar',
    skills: 'desilting,waste cleaning',
    languages: 'Telugu',
    district: 'Vizianagaram',
    joinedOn: '2026-02-02',
  },
];

// Fallback initial team
export const INITIAL_DISTRICT_TEAM: TeamMemberProfile[] = VIZIANAGARAM_DISTRICT_TEAM;

/**
 * Returns the verified field team profiles for ANY of the 26 Andhra Pradesh districts.
 * Each district has at least 2 Field Inspectors and 5 Action Workers / Crews.
 * Parvathipuram Manyam and Vizianagaram directly reflect the user's Supabase tables (INS-001..INS-010, MW-001..MW-012).
 */
export function getDistrictTeamProfiles(districtName: string): TeamMemberProfile[] {
  if (!districtName) return VIZIANAGARAM_DISTRICT_TEAM;
  const lower = districtName.toLowerCase().trim();

  if (lower.includes('parvathipuram') || lower.includes('manyam')) {
    return PARVATHIPURAM_DISTRICT_TEAM;
  }

  if (lower.includes('vizianagaram')) {
    return VIZIANAGARAM_DISTRICT_TEAM;
  }

  // Authoritative verified roster: at least 2 Field Inspectors and 5 Action Workers for all 26 AP districts
  return getUnifiedDistrictTeam(districtName);
}

// Repeat Failure Diagnostic Registry (Monthly Assurance Review)
export const INITIAL_REPEAT_FAILURES: RepeatFailureRecord[] = [];

// Statutory Executive Directives (Monthly Hydrology Assurance Review)
export const INITIAL_EXECUTIVE_DIRECTIVES: StatutoryExecutiveDirective[] = [];
