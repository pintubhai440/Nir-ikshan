/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official Departmental Operational Roster for Andhra Pradesh Water Resources & Sanitation
 * Complete coverage for ALL 26 DISTRICTS of Andhra Pradesh.
 * Distinguishes Field Sanitation Inspectors from Remediation Workers & Action Engineers.
 */

import { COMPLETE_AP_FIELD_INSPECTORS, COMPLETE_AP_ACTION_WORKERS } from './allDistrictsTeamData';

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

// -----------------------------------------------------------------------------
// COMPLETE FIELD INSPECTORS FOR ALL 26 AP DISTRICTS (66 INSPECTORS TOTAL)
// -----------------------------------------------------------------------------
const baseInspectors: FieldInspectorProfile[] = COMPLETE_AP_FIELD_INSPECTORS.map((insp) => ({
  id: insp.inspector_id,
  badgeId: `AP-INSP-${insp.inspector_id.replace(/\D/g, '') || '101'}`,
  name: insp.full_name,
  phone: insp.phone,
  email: insp.email,
  district: insp.district,
  specialization: insp.meter_id 
    ? `Calibrated Digital Meter (${insp.meter_id}) • Water Quality & Silt Auditing` 
    : 'TDS Water Quality Testing & Silt Auditing',
  assignedMandals: [insp.mandal || 'Central Command'],
  activeInspectionsCount: insp.open_inspections ?? 0,
  rating: 4.9,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
}));

// Include statewide apex roving inspector
const stateInspector: FieldInspectorProfile = {
  id: 'insp-all-01',
  badgeId: 'AP-INSP-GEN-001',
  name: 'Er. R. Sudhakar Reddy',
  phone: '+91 94408 99112',
  email: 'r.sudhakar@field.ap.gov.in',
  district: 'State Level (AP)',
  specialization: 'Apex Rapid-Response Quality & Physical Re-verification',
  assignedMandals: ['State-wide Roving'],
  activeInspectionsCount: 0,
  rating: 5.0,
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
};

export const AP_FIELD_INSPECTORS_ROSTER: FieldInspectorProfile[] = [
  stateInspector,
  ...baseInspectors
];

// -----------------------------------------------------------------------------
// COMPLETE REMEDIATION WORKERS & CREWS FOR ALL 26 AP DISTRICTS (133 CREWS TOTAL)
// -----------------------------------------------------------------------------
export const AP_REMEDIATION_WORKERS_ROSTER: RemediationWorkerProfile[] = COMPLETE_AP_ACTION_WORKERS.map((w) => {
  const leadName = w.name_or_crew || w.contact_person;
  const isContractor = w.type === 'Contractor';
  const isEngineer = w.type === 'Engineer';
  const isCrew = w.type === 'Crew';

  return {
    id: w.worker_id,
    crewCode: `AP-CREW-${w.worker_id.replace(/\D/g, '') || '401'}`,
    leadName: leadName,
    designation: `${w.type}: ${w.skills} (Lead: ${w.contact_person})`,
    phone: w.phone,
    contractorAgency: isContractor 
      ? `Registered APWRIMS Earthworks Contractor (${w.district})` 
      : isEngineer
      ? `AP Minor Irrigation Mechanical Unit (${w.district})`
      : `APWRIMS Rapid Remediation Fleet (${w.district})`,
    district: w.district,
    primaryMachinery: w.skills || '1x Heavy Excavator + High-Pressure Sludge Pump',
    crewStrength: isContractor ? 12 : isCrew ? 6 : 4,
    avgHauledTonsPerDay: isContractor ? 9.5 : isCrew ? 6.2 : 4.8,
    status: (w.availability === 'Busy' ? 'On Active Site' : 'Ready for Dispatch') as any,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  };
});
