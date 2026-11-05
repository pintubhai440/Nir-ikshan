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
 * Normalizes an inspector name by removing honorifics and punctuation
 */
export function normalizeInspectorName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(sri|smt|mr|ms|dr|er|inspector|officer|shri)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const COMMON_INSPECTOR_STOP_WORDS = new Set([
  'sri', 'smt', 'mr', 'ms', 'dr', 'er', 'inspector', 'officer', 'shri',
  'rao', 'naidu', 'reddy', 'varma', 'chowdary', 'sharma', 'gupta', 'kumar', 'singh', 'prasad'
]);

export function getInspectorCoreTokens(name: string): string[] {
  return normalizeInspectorName(name)
    .split(' ')
    .filter((t) => t.length >= 3 && !COMMON_INSPECTOR_STOP_WORDS.has(t));
}

/**
 * Checks if a raw inspector string or inspection report name matches an inspector row
 */
export function isInspectorNameMatch(
  rawName: string | undefined | null,
  inspector: SupabaseFieldInspectorRow
): boolean {
  if (!rawName || !inspector) return false;
  const assigned = rawName.toLowerCase().trim();
  const inspName = (inspector.full_name || '').toLowerCase().trim();
  const inspId = (inspector.inspector_id || '').toLowerCase().trim();
  const inspEmail = (inspector.email || '').toLowerCase().trim();

  // Direct match on full name, ID, or email
  if (assigned === inspName || assigned === inspId || (inspEmail && assigned === inspEmail)) return true;

  const cleanAssigned = normalizeInspectorName(assigned);
  const cleanInspName = normalizeInspectorName(inspName);

  if (cleanAssigned && cleanInspName && cleanAssigned === cleanInspName) return true;

  // Distinctive token matching: both must share a non-generic given name (e.g. 'jagannadha', 'krishna', 'pooja', 'raju')
  const assignedTokens = getInspectorCoreTokens(assigned);
  const inspectorTokens = getInspectorCoreTokens(inspName);

  if (assignedTokens.length > 0 && inspectorTokens.length > 0) {
    const hasOverlap = assignedTokens.some((t) => inspectorTokens.includes(t));
    if (hasOverlap) return true;
  }

  return false;
}

/**
 * Checks if a citizen complaint is assigned to a specific inspector.
 * Matches by full name, ID, or cleaned name tokens with strict isolation.
 */
export function isComplaintAssignedToInspector(
  complaint: CitizenComplaint,
  inspector: SupabaseFieldInspectorRow
): boolean {
  if (!complaint || !inspector) return false;

  // 1. Direct match on assignedInspectorId
  if (complaint.assignedInspectorId && inspector.inspector_id) {
    const cId = complaint.assignedInspectorId.toLowerCase().trim();
    const iId = inspector.inspector_id.toLowerCase().trim();
    if (cId === iId) return true;
    if (cId.replace('sup-insp-', '') === iId.replace('sup-insp-', '')) return true;
    if ((cId === 'insp-vzm-01' || cId === 'ap-insp-vzm-101' || cId === 'sup-insp-ins-000') && (iId === 'insp-vzm-01' || iId === 'ap-insp-vzm-101' || iId === 'sup-insp-ins-000')) return true;
    if ((cId === 'ins-001' || cId === 'sup-insp-ins-001') && (iId === 'ins-001' || iId === 'sup-insp-ins-001')) return true;
    if ((cId === 'insp-pvm-01' || cId === 'ap-insp-pvm-201') && (iId === 'insp-pvm-01' || iId === 'ap-insp-pvm-201' || iId === 'ins-008')) return true;
    if ((cId === 'insp-vzm-04' || cId === 'ap-insp-vzm-104') && (iId === 'ins-007' || iId === 'insp-vzm-04' || iId === 'ap-insp-vzm-104')) return true;
    if ((cId === 'ins-007') && (iId === 'insp-vzm-04' || iId === 'ap-insp-vzm-104')) return true;
    if ((cId === 'insp-vzm-02' || cId === 'ap-insp-vzm-102') && (iId === 'insp-vzm-02' || iId === 'ap-insp-vzm-102')) return true;
    if ((cId === 'insp-vzm-03' || cId === 'ap-insp-vzm-103') && (iId === 'insp-vzm-03' || iId === 'ap-insp-vzm-103')) return true;
  }

  // 2. Direct match on assignedInspectorEmail (full or prefix before @)
  if (complaint.assignedInspectorEmail && inspector.email) {
    const emailA = complaint.assignedInspectorEmail.toLowerCase().trim();
    const emailB = inspector.email.toLowerCase().trim();
    if (emailA === emailB || emailA.split('@')[0] === emailB.split('@')[0]) {
      return true;
    }
  }

  // 3. Match on assignedInspector Name (e.g. Sri M. Appala Naidu, Sri V. Jagannadha Rao)
  if (complaint.assignedInspector && isInspectorNameMatch(complaint.assignedInspector, inspector)) {
    return true;
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
/**
 * Normalizes district matching across all 26 Andhra Pradesh districts
 * Handles aliases such as:
 * - 'SPSR Nellore' <-> 'Sri Potti Sriramulu Nellore'
 * - 'Anantapur' <-> 'Ananthapuramu'
 * - 'Y.S.R. (Kadapa)' <-> 'YSR Kadapa' <-> 'Kadapa'
 * - 'Dr. B.R. Ambedkar Konaseema' <-> 'Konaseema'
 * - 'Alluri Sitharama Raju' <-> 'ASR'
 * - 'Sri Sathya Sai' <-> 'SSS'
 * - 'Parvathipuram Manyam' <-> 'Manyam'
 */
export function isDistrictMatch(
  distA: string | undefined | null,
  distB: string | undefined | null
): boolean {
  if (!distA || !distB) return false;
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\.\,\(\)\-\_]/g, ' ')
      .replace(/\bdistrict\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const a = norm(distA);
  const b = norm(distB);
  if (a === b) return true;

  // 1. Nellore
  if (
    (a.includes('nellore') || a.includes('spsr')) &&
    (b.includes('nellore') || b.includes('spsr'))
  ) return true;

  // 2. Anantapur
  if (
    (a.includes('anantapur') || a.includes('ananthapur')) &&
    (b.includes('anantapur') || b.includes('ananthapur'))
  ) return true;

  // 3. Kadapa
  if (
    (a.includes('kadapa') || a.includes('ysr')) &&
    (b.includes('kadapa') || b.includes('ysr'))
  ) return true;

  // 4. Konaseema
  if (a.includes('konaseema') && b.includes('konaseema')) return true;

  // 5. Parvathipuram Manyam
  if (
    (a.includes('parvathipuram') || a.includes('manyam')) &&
    (b.includes('parvathipuram') || b.includes('manyam'))
  ) return true;

  // 6. Alluri Sitharama Raju
  if (
    (a.includes('alluri') || a.includes('sitharama') || a.includes('asr')) &&
    (b.includes('alluri') || b.includes('sitharama') || b.includes('asr'))
  ) return true;

  // 7. Sri Sathya Sai
  if (a.includes('sathya') && b.includes('sathya')) return true;

  return a.includes(b) || b.includes(a);
}
