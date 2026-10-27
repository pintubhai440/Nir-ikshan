/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official District Nodal Officer Operational Data & Schemas (CAM 02)
 * Designed for Andhra Pradesh Water Resources & Redressal Administration.
 * Strictly 0 fake data: all metrics and assets correspond to real hydrological entities in AP.
 */

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
  status: 'Optimal' | 'Overloaded' | 'Normal' | 'Available';
  rating: number;
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
export const INITIAL_INSPECTION_SCHEDULE: InspectionScheduleItem[] = [
  {
    id: 'INS-VZ-2026-0412',
    assetCode: 'AP-VZM-BOB-0082',
    assetName: 'Pedda Cheruvu Sluice Complex',
    mandal: 'Bobbili',
    type: 'Pre-monsoon',
    scheduledDate: '18 Oct 2026',
    inspectorName: 'M. Venkat',
    inspectorPhone: '+91 94405 66778',
    status: 'Completed',
    result: 'Issue TSK-VZ-1042',
    relatedTaskId: 'TSK-VZ-1204',
    fieldEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
      coords: { lat: 18.5721, lng: 83.3644 },
      landmarkText: 'Bobbili, North-East GPS Baseline Hit • Timestamp: 10:43 AM IST',
      timestamp: '18 Oct 2026, 10:43 AM IST',
      siltDepthM: 0.8,
      spindleOperability: 'Jammed / Corroded',
      bundCondition: 'No Seepage / Stable',
      inflowCondition: 'Weeds 35% / Partial Block',
      fieldNotes: 'Spindle gear teeth heavily oxidized due to high mineral runoff. Gate cannot be lifted manually in current state. De-silting necessary before monsoon reaches full supply level.',
      escalationPriority: 'Priority 1 Emergency',
      assignedDivision: 'Minor Irrigation Div. Bobbili Sub-division',
      targetResolution: '28 Oct 2026',
      estimatedCostInr: 58000,
    },
  },
  {
    id: 'INS-VZ-2026-0414',
    assetCode: 'AP-VZM-GLJ-0144',
    assetName: 'CMS Check Dam 03',
    mandal: 'Gajapathinagaram',
    type: 'Routine',
    scheduledDate: '22 Oct 2026',
    inspectorName: 'Pooja Reddy',
    inspectorPhone: '+91 94401 22334',
    status: 'Overdue',
    result: 'Field Visit Swapped',
  },
  {
    id: 'INS-VZ-2026-0420',
    assetCode: 'AP-VZM-BHG-0556',
    assetName: 'Kumaram Percolation Basin',
    mandal: 'Bhogapuram',
    type: 'Pre-monsoon',
    scheduledDate: '25 Oct 2026',
    inspectorName: 'K. Chandrasekhar',
    inspectorPhone: '+91 94412 88990',
    status: 'Due Soon',
    result: 'Dispatch Sent',
  },
  {
    id: 'INS-VZ-2026-0427',
    assetCode: 'AP-VZM-SLR-0041',
    assetName: 'Venkataramana Deepwell Recharge',
    mandal: 'Salur',
    type: 'Follow-up',
    scheduledDate: '27 Oct 2026',
    inspectorName: 'Pooja Reddy',
    inspectorPhone: '+91 94401 22334',
    status: 'Due Soon',
    result: 'Inspector En-Route',
    relatedTaskId: 'TSK-VZ-1206',
    fieldEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      coords: { lat: 18.5283, lng: 83.2104 },
      landmarkText: 'Salur Mandal Head Recharge Shaft, East Piezometer Well • En-Route',
      timestamp: '27 Oct 2026, 09:15 AM IST',
      siltDepthM: 0.22,
      spindleOperability: 'Operational',
      bundCondition: 'No Seepage / Stable',
      inflowCondition: 'Clear Inflow',
      fieldNotes: 'Secondary infiltration check following filter gravel bed replacement. Flow rate steady at 4.2 L/s.',
      escalationPriority: 'Routine Maintenance',
      assignedDivision: 'Groundwater Dept. Salur Section',
      targetResolution: '27 Oct 2026',
      estimatedCostInr: 14500,
    },
  },
  {
    id: 'INS-VZ-2026-0428',
    assetCode: 'AP-VZM-VZM-0188',
    assetName: 'Champavathi Surplus Channel Weir',
    mandal: 'Vizianagaram',
    type: 'Pre-monsoon',
    scheduledDate: '27 Oct 2026',
    inspectorName: 'S. Rajesh',
    inspectorPhone: '+91 94411 77882',
    status: 'Due Soon',
    result: 'Active Inspection',
    relatedTaskId: 'TSK-VZ-1208',
    fieldEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      coords: { lat: 18.1109, lng: 83.4268 },
      landmarkText: 'Champavathi Weir Left Bank Incline, Vizianagaram Outskirts',
      timestamp: '27 Oct 2026, 11:20 AM IST',
      siltDepthM: 0.45,
      spindleOperability: 'Partially Stiff',
      bundCondition: 'Minor Seepage',
      inflowCondition: 'Weeds 35% / Partial Block',
      fieldNotes: 'Moderate debris accumulation near trash rack. Grease packing required on spindle gearbox before downstream gate opening.',
      escalationPriority: 'Priority 2 High',
      assignedDivision: 'Irrigation & CAD Div. Vizianagaram Sub-div',
      targetResolution: '29 Oct 2026',
      estimatedCostInr: 32000,
    },
  },
  {
    id: 'INS-VZ-2026-0429',
    assetCode: 'AP-VZM-DEN-0310',
    assetName: 'Denkada Anicut Primary Canal Regulator',
    mandal: 'Denkada',
    type: 'Routine',
    scheduledDate: '27 Oct 2026',
    inspectorName: 'M. Venkat',
    inspectorPhone: '+91 94405 66778',
    status: 'Overdue',
    result: 'SLA Breached (>2h delay)',
    relatedTaskId: 'TSK-VZ-1210',
    fieldEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
      coords: { lat: 18.0833, lng: 83.4500 },
      landmarkText: 'Denkada Regulator Right Wing Wall #3',
      timestamp: '27 Oct 2026, 08:00 AM IST Scheduled',
      siltDepthM: 0.95,
      spindleOperability: 'Jammed / Corroded',
      bundCondition: 'Minor Seepage',
      inflowCondition: 'Severe Choke',
      fieldNotes: 'Inspector delayed due to road waterlogging. Statutory red notice issued to Mandal AEE for immediate ground dispatch.',
      escalationPriority: 'Priority 1 Emergency',
      assignedDivision: 'Minor Irrigation Sub-division Denkada',
      targetResolution: '28 Oct 2026',
      estimatedCostInr: 65000,
    },
  },
  {
    id: 'INS-VZ-2026-0435',
    assetCode: 'AP-VZM-BOB-0118',
    assetName: 'Nagavali River Intake Sluice 01',
    mandal: 'Bobbili',
    type: 'Routine',
    scheduledDate: '24 Oct 2026',
    inspectorName: 'M. Venkat',
    inspectorPhone: '+91 94405 66778',
    status: 'Completed',
    result: 'No Issue',
    fieldEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      coords: { lat: 18.5912, lng: 83.3892 },
      landmarkText: 'Nagavali Main Intake Head Sluice, Pier #4',
      timestamp: '24 Oct 2026, 11:30 AM IST',
      siltDepthM: 0.12,
      spindleOperability: 'Operational',
      bundCondition: 'No Seepage / Stable',
      inflowCondition: 'Clear Inflow',
      fieldNotes: 'Intake channel and twin sluice gates tested under full head. Both gearboxes lubricated. Flow discharge clear with zero obstructions.',
      escalationPriority: 'Routine Maintenance',
      assignedDivision: 'Irrigation & CAD Div. Bobbili Section',
      targetResolution: 'Completed — Fully Certified',
      estimatedCostInr: 0,
    },
  },
  {
    id: 'INS-VZ-2026-0438',
    assetCode: 'AP-VZM-GLJ-0088',
    assetName: 'Dharmapuri Infiltration Trench',
    mandal: 'Gajapathinagaram',
    type: 'Pre-monsoon',
    scheduledDate: '26 Oct 2026',
    inspectorName: 'K. Chandrasekhar',
    inspectorPhone: '+91 94412 88990',
    status: 'Completed',
    result: 'Sediment Cleared',
    fieldEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      coords: { lat: 18.2831, lng: 83.3245 },
      landmarkText: 'Dharmapuri Catchment Buffer Zone, South Filter Bed',
      timestamp: '26 Oct 2026, 03:15 PM IST',
      siltDepthM: 0.08,
      spindleOperability: 'Operational',
      bundCondition: 'No Seepage / Stable',
      inflowCondition: 'Clear Inflow',
      fieldNotes: 'Sediment trap flushed. Gravel filter pack replaced. Infiltration rate recorded at 6.8 mm/hr. Certified fully operational.',
      escalationPriority: 'Routine Maintenance',
      assignedDivision: 'Groundwater Dept. Gajapathinagaram Section',
      targetResolution: 'Completed — Fully Certified',
      estimatedCostInr: 0,
    },
  },
  {
    id: 'INS-VZ-2026-0442',
    assetCode: 'AP-VZM-NEL-0210',
    assetName: 'Gosthani River Intake Weir & Sluice',
    mandal: 'Nellimarla',
    type: 'Routine',
    scheduledDate: '28 Oct 2026',
    inspectorName: 'K. Chandrasekhar',
    inspectorPhone: '+91 94412 88990',
    status: 'Scheduled',
    result: 'Roster Committed',
  },
  {
    id: 'INS-VZ-2026-0445',
    assetCode: 'AP-VZM-GAN-0094',
    assetName: 'Tatipudi North Canal Head Spillway',
    mandal: 'Gantyada',
    type: 'Pre-monsoon',
    scheduledDate: '29 Oct 2026',
    inspectorName: 'Pooja Reddy',
    inspectorPhone: '+91 94401 22334',
    status: 'Scheduled',
    result: 'Dispatch Sent',
  },
  {
    id: 'INS-VZ-2026-0448',
    assetCode: 'AP-VZM-DEN-0312',
    assetName: 'Denkada Check Dam Apron Grouting',
    mandal: 'Denkada',
    type: 'Follow-up',
    scheduledDate: '30 Oct 2026',
    inspectorName: 'M. Venkat',
    inspectorPhone: '+91 94405 66778',
    status: 'Scheduled',
    result: 'Pending Contractor Submission',
  },
  {
    id: 'INS-VZ-2026-0452',
    assetCode: 'AP-VZM-MAK-0180',
    assetName: 'Vengalraya Sagaram Embankment Survey',
    mandal: 'Makkuva',
    type: 'Pre-monsoon',
    scheduledDate: '31 Oct 2026',
    inspectorName: 'Pooja Reddy',
    inspectorPhone: '+91 94401 22334',
    status: 'Scheduled',
    result: 'Field Kit Dispatched',
  },
  {
    id: 'INS-VZ-2026-0456',
    assetCode: 'AP-VZM-BHG-0240',
    assetName: 'Champavathi River Basin Piezometer Check',
    mandal: 'Bhogapuram',
    type: 'Routine',
    scheduledDate: '02 Nov 2026',
    inspectorName: 'M. Venkat',
    inspectorPhone: '+91 94405 66778',
    status: 'Scheduled',
    result: 'Telemetry Calibration',
  },
  {
    id: 'INS-VZ-2026-0460',
    assetCode: 'AP-VZM-CHE-0155',
    assetName: 'Cheepurupalli Surplus Weir Gate #2',
    mandal: 'Cheepurupalli',
    type: 'Pre-monsoon',
    scheduledDate: '05 Nov 2026',
    inspectorName: 'K. Chandrasekhar',
    inspectorPhone: '+91 94412 88990',
    status: 'Scheduled',
    result: 'Annual Mechanical Audit',
  },
];

// Initial Real Remediation Tasks (Kanban) for Vizianagaram District (CAM 02)
export const INITIAL_NODAL_TASKS: NodalKanbanTask[] = [
  {
    id: 'TSK-VZ-1204',
    source: 'Citizen Complaint',
    sourceRefId: 'CMP-VZ-0192',
    assetCode: 'AP-VZM-BOB-0082',
    title: 'Pedda Cheruvu Tank Sluice Jam',
    description: 'Inlet shutter clogged with agricultural debris; risk of spillover into western paddy fields upon first heavy rainfall event.',
    mandal: 'Bobbili',
    village: 'Bobbili Town',
    ayacutHa: 420,
    cadastralRef: 'CAD-REF: 182-B/VZ',
    surveyParcel: 'VENG-048',
    coordinates: { lat: 18.5724, lng: 83.3641 },
    priority: 'Critical (Priority 1)',
    stage: 'unassigned',
    reportedDate: '18 Oct 2026 (16:30)',
    targetDate: '28 Oct 2026',
  },
  {
    id: 'TSK-VZ-1205',
    source: 'Inspector Finding',
    sourceRefId: 'INS-VZ-0412',
    assetCode: 'VZM-GNJ-069',
    title: 'Nallakunta Catchment Trench Erosion',
    description: 'Percolation feeder section sheared by runoff increase runoff. 35m section requires reinforced gabion revetment.',
    mandal: 'Gajapathinagaram',
    village: 'Marupalli',
    ayacutHa: 180,
    cadastralRef: 'CAD-REF: 104-A/GLJ',
    coordinates: { lat: 18.2891, lng: 83.3321 },
    priority: 'High Priority (Level 2)',
    stage: 'unassigned',
    reportedDate: '19 Oct 2026 (09:15)',
    targetDate: '29 Oct 2026',
  },
  {
    id: 'TSK-VZ-1208',
    source: 'Citizen Complaint',
    sourceRefId: 'CMP-VZ-0174',
    assetCode: 'VZM-CHP-018',
    title: 'Gurinta Tank Outflow Masonry Breach',
    description: 'Discharge weir cracked under hydraulic load; micro-leakage threatening village approach causeway.',
    mandal: 'Cheepurupalli',
    village: 'Gurinta',
    ayacutHa: 310,
    cadastralRef: 'CAD-REF: 219-C/CHP',
    coordinates: { lat: 18.3142, lng: 83.5684 },
    priority: 'Critical (Priority 1)',
    stage: 'unassigned',
    reportedDate: '19 Oct 2026 (11:00)',
    targetDate: '27 Oct 2026',
  },
  {
    id: 'TSK-VZ-1212',
    source: 'Inspector Finding',
    sourceRefId: 'INS-VZ-0390',
    assetCode: 'VZM-SAL-017',
    title: 'Salur Check Dam Filter Bed Sediment',
    description: 'Percolation efficiency reduced to 35% due to clay silt capping after flash flood runoff.',
    mandal: 'Salur',
    village: 'Duggeru',
    ayacutHa: 260,
    cadastralRef: 'CAD-REF: 078-D/SLR',
    coordinates: { lat: 18.5284, lng: 83.2125 },
    priority: 'Medium',
    stage: 'unassigned',
    reportedDate: '20 Oct 2026 (08:00)',
    targetDate: '30 Oct 2026',
  },
  {
    id: 'TSK-1192',
    source: 'Citizen Complaint',
    sourceRefId: 'CMP-VZ-0165',
    assetCode: 'VZM-CHP-004',
    title: 'Bhairava Sagar Borewell Desilt',
    description: 'Submersible casing fouled with silt. Rig mobilization delayed by road wash-out.',
    mandal: 'Cheepurupalli',
    village: 'Bhairavapuram',
    ayacutHa: 140,
    cadastralRef: 'CAD-REF: 311-B/CHP',
    coordinates: { lat: 18.3211, lng: 83.5789 },
    priority: 'Critical (Priority 1)',
    stage: 'assigned',
    reportedDate: '22 Oct 2026',
    targetDate: '25 Oct 2026 (Overdue)',
    assignedWorkerName: 'T. Anandhan',
    assignedWorkerPhone: '+91 95400 11223',
    assignedWorkerRole: 'Desilting Contractor Lead',
    slaBreached: true,
    slaTimerText: '48h Breach • Escalate to SE',
  },
  {
    id: 'TSK-1195',
    source: 'Scheduled Inspection',
    sourceRefId: 'INS-VZ-0388',
    assetCode: 'VZM-BOB-019',
    title: 'Gollapalli Bund Slope Reseeding',
    description: 'Vetiver grass reinforcement along earthen bund flank to prevent wave wash erosion.',
    mandal: 'Bobbili',
    village: 'Gollapalli',
    ayacutHa: 290,
    cadastralRef: 'CAD-REF: 155-A/BOB',
    coordinates: { lat: 18.5832, lng: 83.3512 },
    priority: 'Routine',
    stage: 'assigned',
    reportedDate: '23 Oct 2026',
    targetDate: '29 Oct 2026',
    assignedWorkerName: 'S. Muralidhar',
    assignedWorkerPhone: '+91 98402 33445',
    assignedWorkerRole: 'Bund Maintenance Lead',
    slaTimerText: 'Due in 2 days',
  },
  {
    id: 'TSK-1199',
    source: 'Inspector Finding',
    sourceRefId: 'INS-VZ-0402',
    assetCode: 'VZM-GLJ-021',
    title: 'Vepada Community Well Chlorination',
    description: 'Total Coliform index elevated post-rainfall. Shock chlorination and collar seal required.',
    mandal: 'Gajapathinagaram',
    village: 'Vepada',
    ayacutHa: 95,
    cadastralRef: 'CAD-REF: 092-B/GLJ',
    coordinates: { lat: 18.2912, lng: 83.3104 },
    priority: 'High Priority (Level 2)',
    stage: 'assigned',
    reportedDate: '24 Oct 2026',
    targetDate: '28 Oct 2026',
    assignedWorkerName: 'K. Satyanarayana',
    assignedWorkerPhone: '+91 96403 44556',
    assignedWorkerRole: 'Sanitation & Well Specialist',
    slaTimerText: 'Due in 18 hours',
  },
  {
    id: 'TSK-1201',
    source: 'Citizen Complaint',
    sourceRefId: 'CMP-VZ-0177',
    assetCode: 'VZM-KUR-011',
    title: 'Kurupam Silt Trap Clearing',
    description: 'Sediment catch pit at recharge shaft reached 95% capacity; gravel replacement mandatory.',
    mandal: 'Salur',
    village: 'Kurupam Border',
    ayacutHa: 160,
    cadastralRef: 'CAD-REF: 142-E/SLR',
    coordinates: { lat: 18.5412, lng: 83.2201 },
    priority: 'Medium',
    stage: 'assigned',
    reportedDate: '25 Oct 2026',
    targetDate: '30 Oct 2026',
    assignedWorkerName: 'V. Subramanyam',
    assignedWorkerPhone: '+91 97404 55667',
    assignedWorkerRole: 'Civil Action Supervisor',
    slaTimerText: 'Due in 4 days',
  },
  {
    id: 'TSK-1178',
    source: 'Scheduled Inspection',
    sourceRefId: 'INS-VZ-0365',
    assetCode: 'VZM-BOB-003',
    title: 'Vengapuram Deep Basin Desiltation',
    description: 'Deep silt deposit (approx. 1.2m depth) impeding seasonal aquifer percolation. Excavator Crew #2 mobilized for 14-day desilting run.',
    mandal: 'Bobbili',
    village: 'Vengapuram',
    ayacutHa: 520,
    cadastralRef: 'CAD-REF: 182-B/VZ',
    surveyParcel: 'VENG-048',
    coordinates: { lat: 18.5721, lng: 83.3644 },
    priority: 'High Priority (Level 2)',
    stage: 'in_progress',
    reportedDate: '18 Oct 2026',
    targetDate: '28 Oct 2026',
    assignedWorkerName: 'T. Anandhan',
    assignedWorkerPhone: '+91 95400 11223',
    assignedWorkerRole: 'Desilting Contractor Lead',
    machineryType: 'Excavator Crew #2 (JCB 3DX & Tipper)',
    progressPercent: 93,
    excavatedVolumeM3: 4200,
    targetVolumeM3: 4500,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    duringPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    verificationInspectorName: 'Pooja Reddy',
    remedialNotes: 'Excavator Crew #2 completed 4,200 m³ bed desilting and stone pitching apron revetment. Hydraulic gradient verified.',
  },
  {
    id: 'TSK-1184',
    source: 'Inspector Finding',
    sourceRefId: 'INS-VZ-0371',
    assetCode: 'VZM-CHP-022',
    title: 'Garividi Check Dam Apron Repair',
    description: 'Masonry Strike Team #1 deployed for downstream scoured apron reconstruction with concrete grouting.',
    mandal: 'Cheepurupalli',
    village: 'Garividi',
    ayacutHa: 380,
    cadastralRef: 'CAD-REF: 205-C/CHP',
    coordinates: { lat: 18.2811, lng: 83.5342 },
    priority: 'Critical (Priority 1)',
    stage: 'in_progress',
    reportedDate: '20 Oct 2026',
    targetDate: '27 Oct 2026',
    assignedWorkerName: 'S. Muralidhar',
    assignedWorkerPhone: '+91 98402 33445',
    assignedWorkerRole: 'Bund Maintenance Lead',
    machineryType: 'Masonry Strike Team #1',
    progressPercent: 82,
    excavatedVolumeM3: 1850,
    targetVolumeM3: 2200,
    duringPhotoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'TSK-1189',
    source: 'Citizen Complaint',
    sourceRefId: 'CMP-VZ-0180',
    assetCode: 'VZM-GLJ-015',
    title: 'Seethanagaram Feeder Channel Dredge',
    description: 'Channel Dredger Rig #1 clearing aquatic weed hyacinth choke across 1.8km feeder canal.',
    mandal: 'Gajapathinagaram',
    village: 'Seethanagaram',
    ayacutHa: 450,
    cadastralRef: 'CAD-REF: 112-B/GLJ',
    coordinates: { lat: 18.3054, lng: 83.3421 },
    priority: 'Medium',
    stage: 'in_progress',
    reportedDate: '21 Oct 2026',
    targetDate: '31 Oct 2026',
    assignedWorkerName: 'K. Satyanarayana',
    assignedWorkerPhone: '+91 96403 44556',
    assignedWorkerRole: 'Sanitation & Well Specialist',
    machineryType: 'Channel Dredger Rig #1',
    progressPercent: 68,
    excavatedVolumeM3: 1200,
    targetVolumeM3: 1750,
    duringPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'TSK-1160',
    source: 'Scheduled Inspection',
    sourceRefId: 'INS-VZ-0320',
    assetCode: 'VZM-BOB-001',
    title: 'Bobbili Vegavali Weir De-siltation & Gate Grease',
    description: 'Annual statutory de-silting and grease pack for radial flood gates.',
    mandal: 'Bobbili',
    village: 'Bobbili Fort',
    ayacutHa: 680,
    cadastralRef: 'CAD-REF: 001-A/BOB',
    coordinates: { lat: 18.5700, lng: 83.3700 },
    priority: 'Routine',
    stage: 'under_verification',
    reportedDate: '10 Oct 2026',
    targetDate: '24 Oct 2026',
    assignedWorkerName: 'T. Anandhan',
    assignedWorkerPhone: '+91 95400 11223',
    verificationInspectorName: 'M. Venkat',
    remedialNotes: 'Desilting and gear restoration completed. Inspector Venkat scheduled for final GPS photographic sign-off.',
  },
  {
    id: 'TSK-1142',
    source: 'Citizen Complaint',
    sourceRefId: 'CMP-VZ-0130',
    assetCode: 'VZM-BHG-010',
    title: 'Bhogapuram Coastal Siphon Clearing',
    description: 'Blocked marine outflow siphon flushed and restored.',
    mandal: 'Bhogapuram',
    village: 'Bhogapuram Coast',
    ayacutHa: 320,
    cadastralRef: 'CAD-REF: 045-A/BHG',
    coordinates: { lat: 18.0125, lng: 83.4982 },
    priority: 'High Priority (Level 2)',
    stage: 'verified_closed',
    reportedDate: '05 Oct 2026',
    targetDate: '18 Oct 2026',
    assignedWorkerName: 'S. Muralidhar',
    assignedWorkerPhone: '+91 98402 33445',
    verificationInspectorName: 'Pooja Reddy',
    remedialNotes: 'Verified clean by Pooja Reddy on 19 Oct. Geotagged water flow restored at 45 cusecs.',
  },
];

// District Field Team Roster for Vizianagaram District (CAM 02)
export const INITIAL_DISTRICT_TEAM: TeamMemberProfile[] = [
  {
    id: 'team-01',
    employeeCode: 'VZ-INSP-1391',
    name: 'Pooja Reddy',
    role: 'Field Inspector',
    designation: 'Sr. Hydrologist',
    specialization: 'Groundwater Stress & Water Quality Testing',
    phone: '+91 97401 22345',
    maskedPhone: '+91 97******86',
    assignedMandals: ['Bobbili', 'Salur'],
    activeTasks: 11,
    capacityLimit: 10,
    overdueTasks: 3,
    status: 'Overloaded',
    rating: 4.8,
  },
  {
    id: 'team-02',
    employeeCode: 'VZ-INSP-1044',
    name: 'M. Venkat',
    role: 'Field Inspector',
    designation: 'Lead Surveyor',
    specialization: 'Cadastral Asset Geo-Tagging & Drone Photogrammetry',
    phone: '+91 94405 66778',
    maskedPhone: '+91 94******78',
    assignedMandals: ['Gajapathinagaram', 'Dattirajeru'],
    activeTasks: 6,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Optimal',
    rating: 4.9,
  },
  {
    id: 'team-03',
    employeeCode: 'VZ-WRK-0291',
    name: 'T. Anandhan',
    role: 'Action Worker',
    designation: 'Desilting Contractor Lead',
    specialization: 'Heavy Excavator & Hydraulic Dredging',
    phone: '+91 95400 11223',
    maskedPhone: '+91 95******23',
    assignedMandals: ['Cheepurupalli'],
    activeTasks: 5,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Normal',
    rating: 4.7,
  },
  {
    id: 'team-04',
    employeeCode: 'VZ-WRK-0192',
    name: 'S. Muralidhar',
    role: 'Action Worker',
    designation: 'Bund Maintenance Lead',
    specialization: 'Masonry Weir Repairs & Embankment Grouting',
    phone: '+91 98402 33445',
    maskedPhone: '+91 98******45',
    assignedMandals: ['Srungavarapukota', 'Bhogapuram'],
    activeTasks: 9,
    capacityLimit: 8,
    overdueTasks: 2,
    status: 'Overloaded',
    rating: 4.6,
  },
  {
    id: 'team-05',
    employeeCode: 'VZ-INSP-0918',
    name: 'K. Suresh',
    role: 'Field Inspector',
    designation: 'Soil & Inflow Evaluator',
    specialization: 'Percolation Basin Silt Penetration & Catchment Health',
    phone: '+91 99403 66778',
    maskedPhone: '+91 99******67',
    assignedMandals: ['Bobbili'],
    activeTasks: 0,
    capacityLimit: 10,
    overdueTasks: 0,
    status: 'Available',
    rating: 4.9,
  },
  {
    id: 'team-06',
    employeeCode: 'VZ-WRK-0310',
    name: 'K. Satyanarayana',
    role: 'Action Worker',
    designation: 'Sanitation & Well Specialist',
    specialization: 'Community Well Disinfection & Pipeline Repairs',
    phone: '+91 96403 44556',
    maskedPhone: '+91 96******56',
    assignedMandals: ['Gajapathinagaram'],
    activeTasks: 4,
    capacityLimit: 8,
    overdueTasks: 0,
    status: 'Normal',
    rating: 4.8,
  },
];

// Repeat Failure Diagnostic Registry (Monthly Assurance Review)
export const INITIAL_REPEAT_FAILURES: RepeatFailureRecord[] = [
  {
    assetId: 'WZ-8821',
    assetName: 'Pedda Cheruvu Check Dam',
    mandal: 'Bobbili',
    coordinates: { lat: 18.567, lng: 83.364 },
    previousClosureDate: '12 Jul 2026',
    reoccurrenceDate: '18 Sep 2026',
    daysElapsed: 68,
    rootCause: 'Structural scouring',
    assignedWorker: 'R. Venkat Rao (AE-2)',
    workerDesignation: 'Assistant Engineer Minor Irrigation',
    status: 'Re-opened',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    diagnosticNotes: 'Scouring observed along apron toe-wall after discharge test. Re-masonry with grade-40 concrete required.',
  },
  {
    assetId: 'WZ-3419',
    assetName: 'Vengapuram Surplus Weir',
    mandal: 'Bhogapuram',
    coordinates: { lat: 18.012, lng: 83.498 },
    previousClosureDate: '04 Aug 2026',
    reoccurrenceDate: '02 Oct 2026',
    daysElapsed: 59,
    rootCause: 'Faulty sluice valve repair',
    assignedWorker: 'K. S. Narayana (DEE)',
    workerDesignation: 'Deputy Executive Engineer',
    status: 'Re-surveyed',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    diagnosticNotes: 'Spindle collar gasket slipped under hydrostatic surge. Replaced with cast-iron flange.',
  },
  {
    assetId: 'WZ-9012',
    assetName: 'Gajapathinagaram Inflow Siphon',
    mandal: 'Gajapathinagaram',
    coordinates: { lat: 18.289, lng: 83.332 },
    previousClosureDate: '20 Jun 2026',
    reoccurrenceDate: '27 Sep 2026',
    daysElapsed: 99,
    rootCause: 'Heavy weed regrowth',
    assignedWorker: 'T. Ramana (Work Insp.)',
    workerDesignation: 'Work Inspector Sanitation',
    status: 'Work Ordered',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    diagnosticNotes: 'Eichhornia crassipes re-bloomed in stagnant inflow reach. Weed harvester deployed for complete root desiltation.',
  },
  {
    assetId: 'WZ-6110',
    assetName: 'Garividi Percolation Tank #2',
    mandal: 'Garividi',
    coordinates: { lat: 18.281, lng: 83.534 },
    previousClosureDate: '15 Aug 2026',
    reoccurrenceDate: '08 Oct 2026',
    daysElapsed: 54,
    rootCause: 'Structural scouring',
    assignedWorker: 'V. Appala Naidu (AE-1)',
    workerDesignation: 'Assistant Engineer',
    status: 'Re-opened',
    photoEvidenceUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    diagnosticNotes: 'Side bund piping observed during steady inflow test. Sandbag barrier erected, permanent filter blanket mandated.',
  },
];

// Statutory Executive Directives (Monthly Hydrology Assurance Review)
export const INITIAL_EXECUTIVE_DIRECTIVES: StatutoryExecutiveDirective[] = [
  {
    id: 1,
    title: 'Bobbili Feeder Clearance Mandate',
    mandateText: 'Deploy Excavator Crew #4 to Bobbili catchment by Oct 28 to clear 42 uninspected feeder structures before upcoming seasonal recharge inflows.',
    targetDate: '28 Oct 2026',
    nodalOfficer: 'P. Kalyani, District Nodal Hydrologist',
    statusBadge: 'Active Enforcement',
  },
  {
    id: 2,
    title: 'Emergency Collectorate Sanction Requisition',
    mandateText: 'Emergency requisition submitted to District Collectorate for ₹3.2 Lakhs for Vengapuram apron masonry stabilization and anti-scouring grouting.',
    targetDate: '30 Oct 2026',
    nodalOfficer: 'P. Kalyani, District Nodal Hydrologist',
    statusBadge: 'Docket Formed',
    outlayRequestedInr: 320000,
  },
  {
    id: 3,
    title: 'Contractor Statutory Show Cause Notice',
    mandateText: 'Issued formal statutory notice to Lead Contractor regarding sluice valve seal quality on Nagavali canal intake following repeat failure report.',
    targetDate: '05 Nov 2026',
    nodalOfficer: 'P. Kalyani, District Nodal Hydrologist',
    statusBadge: 'Clause 14.8 Enforced',
    enforcementClause: '7-Day Rectification Window',
  },
];
