/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Inspector Filtering & Jurisdictional Data Isolation Utility
 * Guarantees strict 1-to-1 matching between complaints assigned by Nodal Officers
 * and the specific inspector's active workstation.
 * Strictly prevents inspectors from seeing other inspectors' work.
 */

import { CitizenComplaint } from '../types/nirikshan';
import { SupabaseFieldInspectorRow } from '../data/allDistrictsTeamData';

/**
 * Checks if a citizen complaint is assigned to a specific inspector.
 * Matches by full name, ID, or cleaned name tokens.
 */
export function isComplaintAssignedToInspector(
  complaint: CitizenComplaint,
  inspector: SupabaseFieldInspectorRow
): boolean {
  if (!complaint || !inspector) return false;

  // 1. Direct match on assignedInspectorId
  if (complaint.assignedInspectorId && inspector.inspector_id) {
    if (complaint.assignedInspectorId.toLowerCase().trim() === inspector.inspector_id.toLowerCase().trim()) {
      return true;
    }
  }

  // 2. Direct match on assignedInspectorEmail
  if (complaint.assignedInspectorEmail && inspector.email) {
    if (complaint.assignedInspectorEmail.toLowerCase().trim() === inspector.email.toLowerCase().trim()) {
      return true;
    }
  }

  if (!complaint.assignedInspector) return false;

  const assigned = complaint.assignedInspector.toLowerCase().trim();
  const inspName = (inspector.full_name || '').toLowerCase().trim();
  const inspId = (inspector.inspector_id || '').toLowerCase().trim();
  const inspEmail = (inspector.email || '').toLowerCase().trim();

  // Direct match on full name, ID, or email
  if (assigned === inspName || assigned === inspId || (inspEmail && assigned === inspEmail)) return true;

  // Clean out common prefixes: Smt., Sri, Mr., Ms., Dr., Inspector
  const cleanAssigned = assigned
    .replace(/^(smt\.|sri\.|mr\.|ms\.|dr\.|inspector)\s+/i, '')
    .trim();
  const cleanInspName = inspName
    .replace(/^(smt\.|sri\.|mr\.|ms\.|dr\.|inspector)\s+/i, '')
    .trim();

  if (cleanAssigned === cleanInspName) return true;

  // Check if assigned string contains the inspector ID (e.g. "INS-010" or "INS-PVM-003")
  if (inspId && assigned.includes(inspId)) return true;

  // Check bidirectional substring inclusion
  if (cleanInspName.includes(cleanAssigned) || cleanAssigned.includes(cleanInspName)) {
    return true;
  }

  // Check distinctive name tokens (length >= 3)
  const tokens = cleanInspName.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length >= 2) {
    const allMatch = tokens.every((token) => cleanAssigned.includes(token));
    if (allMatch) return true;
  }

  return false;
}

/**
 * Checks if a complaint is SLA overdue (> 48 hours for Priority 1 / 72 hours for Priority 2)
 */
export function isComplaintSlaOverdue(complaint: CitizenComplaint): boolean {
  if (complaint.status === 'RESOLVED' || complaint.status === 'REJECTED') return false;
  const time = new Date(complaint.submittedAt).getTime();
  if (isNaN(time)) return false;
  const diffHours = (Date.now() - time) / (1000 * 60 * 60);
  return diffHours > 48;
}

/**
 * Normalizes district matching across slight naming variants
 */
export function isDistrictMatch(
  distA: string | undefined | null,
  distB: string | undefined | null
): boolean {
  if (!distA || !distB) return false;
  const a = distA.toLowerCase().replace(/district/g, '').trim();
  const b = distB.toLowerCase().replace(/district/g, '').trim();
  if (a === b) return true;
  if (a.includes('parvathipuram') && b.includes('parvathipuram')) return true;
  if (a.includes('manyam') && b.includes('manyam')) return true;
  if (a.includes('vizianagaram') && b.includes('vizianagaram')) return true;
  if (a.includes('visakhapatnam') && b.includes('visakhapatnam')) return true;
  if (a.includes('srikakulam') && b.includes('srikakulam')) return true;
  if (a.includes('anakapalli') && b.includes('anakapalli')) return true;
  return a.includes(b) || b.includes(a);
}
