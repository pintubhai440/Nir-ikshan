/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official Andhra Pradesh State Administration Governance Dataset
 * Aligned with Nir-ikshan Hydrological Surveillance & APWRIMS Telemetry.
 */

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
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatarUrl?: string;
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

// Departmental Personnel Directory across Andhra Pradesh
export const INITIAL_DEPARTMENTAL_PERSONNEL: DepartmentalPersonnel[] = [
  {
    id: 'usr-01',
    staffId: 'AP-WRA-0482',
    name: 'Anil Kumar Varma',
    email: 'anil.varma@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Chittoor',
    jurisdictionSubBasin: 'Madanapalle Sub-basin & Ponnai Catchment',
    maskedMobile: '+91 98••••••12',
    phone: '9848011212',
    status: 'Active',
    lastActive: '12 mins ago',
  },
  {
    id: 'usr-02',
    staffId: 'AP-INSP-1104',
    name: 'Pooja Reddy',
    email: 'pooja.reddy@field.ap.gov.in',
    role: 'Field Inspector',
    district: 'Vizianagaram',
    jurisdictionSubBasin: 'Bobbili Tank Cluster & Champavathi Basin',
    maskedMobile: '+91 97••••••84',
    phone: '9748011184',
    status: 'Active',
    lastActive: 'Today, 09:24 AM',
  },
  {
    id: 'usr-03',
    staffId: 'AP-WRK-3012',
    name: 'S. Muralidhar',
    email: 'murali.ops@waterworks.org',
    role: 'Action Worker',
    district: 'Anantapur',
    jurisdictionSubBasin: 'Kadiri Checkdam Zone & Mudigallu Cheruvu',
    maskedMobile: '+91 94••••••55',
    phone: '9448013355',
    status: 'Active',
    lastActive: 'Yesterday',
  },
  {
    id: 'usr-04',
    staffId: 'AP-WRA-0518',
    name: 'B. Nirmala Rao',
    email: 'nirmala.rao@water.ap.gov.in',
    role: 'Nodal Officer',
    district: 'East Godavari',
    jurisdictionSubBasin: 'Rajahmundry Canals & Dowleswaram Headworks',
    maskedMobile: '+91 91••••••33',
    phone: '9148022233',
    status: 'Active',
    lastActive: '3 hours ago',
  },
  {
    id: 'usr-05',
    staffId: 'AP-INSP-0922',
    name: 'K. Chandrasekhar',
    email: 'kc.inspector@irrigation.ap.gov.in',
    role: 'Field Inspector',
    district: 'Chittoor',
    jurisdictionSubBasin: 'Kalyani Dam Watershed & Tirupati Periphery',
    maskedMobile: '+91 99••••••80',
    phone: '9948014480',
    status: 'Inactive',
    lastActive: '14 days ago',
  },
  {
    id: 'usr-06',
    staffId: 'AP-WRK-4101',
    name: 'T. Anandhan',
    email: 'anandhan.works@waterworks.org',
    role: 'Action Worker',
    district: 'East Godavari',
    jurisdictionSubBasin: 'Kakinada Rural Sluice & Yeleru Command',
    maskedMobile: '+91 96••••••09',
    phone: '9648015509',
    status: 'Active',
    lastActive: '58 mins ago',
  },
  {
    id: 'usr-07',
    staffId: 'AP-INSP-1229',
    name: 'Deepa Lakshmi',
    email: 'd.lakshmi@field.ap.gov.in',
    role: 'Field Inspector',
    district: 'Vizianagaram',
    jurisdictionSubBasin: 'Gajapathinagaram Lake & Pedda Cheruvu',
    maskedMobile: '+91 93••••••76',
    phone: '9348016676',
    status: 'Active',
    lastActive: '4 hours ago',
  },
  {
    id: 'usr-08',
    staffId: 'AP-WRA-0601',
    name: 'Dr. A. Mallikarjuna, IAS',
    email: 'collector.vskp@ap.gov.in',
    role: 'Nodal Officer',
    district: 'Visakhapatnam',
    jurisdictionSubBasin: 'Meghadrigedda & Mudasarlova Basin Command',
    maskedMobile: '+91 94••••••89',
    phone: '9440156789',
    status: 'Active',
    lastActive: 'Today, 11:15 AM',
  },
  {
    id: 'usr-09',
    staffId: 'AP-WRA-0402',
    name: 'Er. N. Subba Rao',
    email: 'nodal.vzm@nirikshan.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Vizianagaram',
    jurisdictionSubBasin: 'Tatipudi & Champavathi Command Cell',
    maskedMobile: '+91 98••••••45',
    phone: '9848012345',
    status: 'Active',
    lastActive: '25 mins ago',
  },
  {
    id: 'usr-10',
    staffId: 'AP-WRA-0711',
    name: 'Smt. P. Hemalatha',
    email: 'nodal.pvm@nirikshan.ap.gov.in',
    role: 'Nodal Officer',
    district: 'Parvathipuram Manyam',
    jurisdictionSubBasin: 'Thotapalli Barrage & Nagavali River Basin',
    maskedMobile: '+91 94••••••21',
    phone: '9490244321',
    status: 'Active',
    lastActive: '1 hour ago',
  },
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
