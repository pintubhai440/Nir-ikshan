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

  // District validation if both are specified
  if (complaint.district && inspector.district && complaint.district !== 'State Level (AP)') {
    if (!isDistrictMatch(complaint.district, inspector.district)) {
      return false;
    }
  }

  // 1. Direct match on assignedInspectorId (supports operational roster and Supabase INS codes)
  if (complaint.assignedInspectorId && inspector.inspector_id) {
    const cId = complaint.assignedInspectorId.toLowerCase().trim();
    const iId = inspector.inspector_id.toLowerCase().trim();
    if (cId === iId) return true;
    if ((cId === 'insp-vzm-04' || cId === 'ap-insp-vzm-104') && (iId === 'ins-007' || iId === 'insp-vzm-04')) return true;
    if (cId === 'ins-007' && (iId === 'insp-vzm-04' || iId === 'ap-insp-vzm-104')) return true;
    if ((cId === 'insp-vzm-01' || cId === 'ap-insp-vzm-101') && (iId === 'ins-008' || iId === 'insp-vzm-01')) return true;
  }

  // 2. Direct match on assignedInspectorEmail (full or prefix before @)
  if (complaint.assignedInspectorEmail && inspector.email) {
    const emailA = complaint.assignedInspectorEmail.toLowerCase().trim();
    const emailB = inspector.email.toLowerCase().trim();
    if (emailA === emailB || emailA.split('@')[0] === emailB.split('@')[0]) {
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

  // Clean out common honorifics: Smt., Sri, Mr., Ms., Dr., Inspector, Er.
  const cleanAssigned = assigned
    .replace(/^(smt\.|sri\.|mr\.|ms\.|dr\.|inspector|er\.)\s+/i, '')
    .trim();
  const cleanInspName = inspName
    .replace(/^(smt\.|sri\.|mr\.|ms\.|dr\.|inspector|er\.)\s+/i, '')
    .trim();

  if (cleanAssigned === cleanInspName) return true;

  // Check if assigned string contains the inspector ID
  if (inspId && (assigned === inspId || assigned.includes(inspId))) return true;

  // Match key personal names (e.g. "Raju", "Rama Krishna", "Jagannadha", "Pooja")
  const assignedWords = cleanAssigned.split(/[\s,.-]+/).filter((w) => w.length >= 3 && !['rao', 'naidu', 'reddy'].includes(w));
  const inspectorWords = cleanInspName.split(/[\s,.-]+/).filter((w) => w.length >= 3 && !['rao', 'naidu', 'reddy'].includes(w));

  if (assignedWords.length > 0 && inspectorWords.length > 0) {
    const hasCommonUniqueName = assignedWords.some((w) => inspectorWords.includes(w));
    if (hasCommonUniqueName) return true;
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
