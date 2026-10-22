/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official Departmental Operational Roster for Andhra Pradesh Water Resources & Sanitation
 * Distinguishes Field Sanitation Inspectors from Remediation Workers & Action Engineers.
 */

export interface FieldInspectorProfile {
  id: string;
  badgeId: string;
  name: string;
  phone: string;
  email: string;
  district: string;
  specialization: string;
  assignedMandals: string[];
  activeInspectionsCount: number;
  rating: number;
  avatarUrl?: string;
}

export interface RemediationWorkerProfile {
  id: string;
  crewCode: string;
  leadName: string;
  designation: string;
  phone: string;
  contractorAgency: string;
  district: string;
  primaryMachinery: string;
  crewStrength: number;
  avgHauledTonsPerDay: number;
  status: 'Ready for Dispatch' | 'On Active Site' | 'Standby';
  avatarUrl?: string;
}

export const AP_FIELD_INSPECTORS_ROSTER: FieldInspectorProfile[] = [
  {
    id: 'insp-vzm-01',
    badgeId: 'AP-INSP-VZM-101',
    name: 'Sri K. Rama Krishna',
    phone: '+91 94401 22334',
    email: 'kr.krishna@field.ap.gov.in',
    district: 'Vizianagaram',
    specialization: 'Lake Siltation & Urban Plastic Obstruction Verification',
    assignedMandals: ['Gantyada', 'Vizianagaram Urban', 'Nellimarla'],
    activeInspectionsCount: 3,
    rating: 4.9,
  },
  {
    id: 'insp-vzm-02',
    badgeId: 'AP-INSP-VZM-102',
    name: 'Sri V. Jagannadha Rao',
    phone: '+91 94405 66778',
    email: 'v.jagannadh@field.ap.gov.in',
    district: 'Vizianagaram',
    specialization: 'Riverbed Sand Mining & Embankment Erosion Auditing',
    assignedMandals: ['Bhogapuram', 'Denkada', 'Pusapatirega'],
    activeInspectionsCount: 2,
    rating: 4.8,
  },
  {
    id: 'insp-vzm-03',
    badgeId: 'AP-INSP-VZM-103',
    name: 'Smt. Pooja Reddy',
    phone: '+91 97480 11184',
    email: 'pooja.reddy@field.ap.gov.in',
    district: 'Vizianagaram',
    specialization: 'TDS Water Quality Testing & Industrial Effluent Tracing',
    assignedMandals: ['Bobbili', 'Gajapathinagaram', 'Badangi'],
    activeInspectionsCount: 4,
    rating: 4.95,
  },
  {
    id: 'insp-pvm-01',
    badgeId: 'AP-INSP-PVM-201',
    name: 'Sri M. Appala Naidu',
    phone: '+91 94403 44556',
    email: 'm.appala@field.ap.gov.in',
    district: 'Parvathipuram Manyam',
    specialization: 'Aquatic Weed Infestation & Barrage Sluice Inspection',
    assignedMandals: ['Parvathipuram', 'Bobbili Border', 'Salur'],
    activeInspectionsCount: 2,
    rating: 4.85,
  },
  {
    id: 'insp-vskp-01',
    badgeId: 'AP-INSP-VSK-301',
    name: 'Sri D. Srinivasa Rao',
    phone: '+91 94406 77889',
    email: 'd.srinivas@field.ap.gov.in',
    district: 'Visakhapatnam',
    specialization: 'Coastal Wetland Encroachment & Storm Drain Inflow',
    assignedMandals: ['Anandapuram', 'Bheemunipatnam', 'Pendurthi'],
    activeInspectionsCount: 1,
    rating: 4.75,
  },
  {
    id: 'insp-all-01',
    badgeId: 'AP-INSP-GEN-001',
    name: 'Er. R. Sudhakar Reddy',
    phone: '+91 94408 99112',
    email: 'r.sudhakar@field.ap.gov.in',
    district: 'State Level (AP)',
    specialization: 'Apex Rapid-Response Quality & Physical Re-verification',
    assignedMandals: ['State-wide Roving'],
    activeInspectionsCount: 2,
    rating: 5.0,
  },
];

export const AP_REMEDIATION_WORKERS_ROSTER: RemediationWorkerProfile[] = [
  {
    id: 'wrk-vzm-01',
    crewCode: 'AP-CREW-JCB-401',
    leadName: 'Er. T. Venkata Ramana',
    designation: 'Executive Remediation Engineer (Heavy Earthmoving Wing)',
    phone: '+91 94402 33445',
    contractorAgency: 'AP Minor Irrigation Mechanical Unit #4',
    district: 'Vizianagaram',
    primaryMachinery: '1x JCB 3DX Heavy Excavator + 2x 10-Ton Tipper Trucks',
    crewStrength: 6,
    avgHauledTonsPerDay: 4.5,
    status: 'Ready for Dispatch',
  },
  {
    id: 'wrk-vzm-02',
    crewCode: 'AP-CREW-SLU-402',
    leadName: 'Er. B. Trinadha Rao',
    designation: 'Assistant Executive Engineer (Desilting & Pumping Gang)',
    phone: '+91 94403 91102',
    contractorAgency: 'Vizianagaram Municipal Drainage Division',
    district: 'Vizianagaram',
    primaryMachinery: '2x High-Pressure Sludge Suction Tankers + Silt Baskets',
    crewStrength: 8,
    avgHauledTonsPerDay: 6.2,
    status: 'Ready for Dispatch',
  },
  {
    id: 'wrk-pvm-01',
    crewCode: 'AP-CREW-HARV-501',
    leadName: 'Er. G. Suresh Kumar',
    designation: 'Senior Action Engineer (Aquatic Bio-Clearing Unit)',
    phone: '+91 94404 55667',
    contractorAgency: 'Thotapalli Irrigation Mechanical Division',
    district: 'Parvathipuram Manyam',
    primaryMachinery: '1x Pontoon Aquatic Weed Harvester & Biomass Shredder',
    crewStrength: 5,
    avgHauledTonsPerDay: 7.8,
    status: 'Ready for Dispatch',
  },
  {
    id: 'wrk-vsk-01',
    crewCode: 'AP-CREW-BIO-601',
    leadName: 'Er. K. V. Satyanarayana',
    designation: 'Rapid Environmental Remediation Officer',
    phone: '+91 94407 12345',
    contractorAgency: 'GVMC Eco-Restoration Taskforce',
    district: 'Visakhapatnam',
    primaryMachinery: 'Floating Trash Skimmer Catamaran + 4 Tipper Vans',
    crewStrength: 10,
    avgHauledTonsPerDay: 8.5,
    status: 'Ready for Dispatch',
  },
];
