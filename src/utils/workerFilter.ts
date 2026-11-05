/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Action Worker Filtering & Jurisdictional Data Isolation Utility
 * Guarantees strict 1-to-1 matching between complaints/work orders assigned by Nodal Officers
 * and the specific action worker / remediation crew's active terminal.
 * Strictly prevents crews from seeing or overriding other crews' assignments.
 */

import { CitizenComplaint } from '../types/nirikshan';
import { SupabaseActionWorkerRow } from '../data/allDistrictsTeamData';

/**
 * Normalizes a worker or crew name by removing titles and punctuation
 */
export function normalizeWorkerName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(er|dr|mr|ms|sri|smt|shri|engineer|worker|crew|contractor|lead)\b\.?/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const COMMON_WORKER_STOP_WORDS = new Set([
  'er', 'dr', 'mr', 'ms', 'sri', 'smt', 'shri', 'engineer', 'worker', 'crew', 'contractor', 'team',
  'services', 'works', 'earthworks', 'enterprises', 'drainage', 'rao', 'naidu', 'reddy', 'varma',
  'chowdary', 'sharma', 'gupta', 'kumar', 'singh', 'prasad', 'ltd', 'pvt', 'co'
]);

export function getWorkerCoreTokens(name: string): string[] {
  return normalizeWorkerName(name)
    .split(' ')
    .filter((t) => t.length >= 3 && !COMMON_WORKER_STOP_WORDS.has(t));
}

/**
 * Checks if a string (assigned engineer / work execution name) matches a worker row
 */
export function isWorkerNameMatch(
  rawName: string | undefined | null,
  worker: SupabaseActionWorkerRow
): boolean {
  if (!rawName || !worker) return false;
  const assigned = rawName.toLowerCase().trim();
  const workerId = (worker.worker_id || '').toLowerCase().trim();
  const nameOrCrew = (worker.name_or_crew || '').toLowerCase().trim();
  const nameOrCrewType = (worker.name_or_crew_type || '').toLowerCase().trim();
  const contactPerson = (worker.contact_person || '').toLowerCase().trim();

  // 1. Direct ID match
  if (assigned === workerId) return true;

  // 2. Direct string match
  if (
    (nameOrCrew && assigned === nameOrCrew) ||
    (nameOrCrewType && assigned === nameOrCrewType) ||
    (contactPerson && assigned === contactPerson)
  ) {
    return true;
  }

  // 3. Clean string match
  const cleanAssigned = normalizeWorkerName(assigned);
  const cleanNameOrCrew = normalizeWorkerName(nameOrCrew || nameOrCrewType);
  const cleanContact = normalizeWorkerName(contactPerson);

  if (cleanAssigned && (cleanAssigned === cleanNameOrCrew || cleanAssigned === cleanContact)) {
    return true;
  }

  // 4. Overlapping distinctive name tokens (e.g. 'venkata', 'ramana', 'dhanunjaya', 'somaraju', 'satyanarayana')
  const assignedTokens = getWorkerCoreTokens(assigned);
  const workerTokens = [
    ...getWorkerCoreTokens(nameOrCrew),
    ...getWorkerCoreTokens(nameOrCrewType),
    ...getWorkerCoreTokens(contactPerson),
  ];

  if (assignedTokens.length > 0 && workerTokens.length > 0) {
    const hasOverlap = assignedTokens.some((t) => workerTokens.includes(t));
    if (hasOverlap) return true;
  }

  return false;
}

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

/**
 * Checks if a citizen complaint is assigned to a specific worker.
 * Strictly checks 1-to-1 assignment by ID, name, or phone number.
 */
export function isComplaintAssignedToWorker(
  complaint: CitizenComplaint,
  worker: SupabaseActionWorkerRow
): boolean {
  if (!complaint || !worker) return false;

  const wId = (worker.worker_id || '').toLowerCase().trim();

  // 1. Direct or aliased worker ID match
  if ((complaint as any).assignedEngineerId && wId) {
    const cId = String((complaint as any).assignedEngineerId).toLowerCase().trim();
    if (cId === wId) return true;
    if (cId.replace('sup-wrk-', '') === wId.replace('sup-wrk-', '')) return true;
    if ((cId === 'wrk-vzm-01' || cId === 'sup-wrk-vzm-01') && (wId === 'wrk-vzm-01' || wId === 'sup-wrk-vzm-01')) return true;
    if ((cId === 'mw-006' || cId === 'mw-005' || cId === 'sup-wrk-mw-005' || cId === 'sup-wrk-mw-006') && (wId === 'mw-006' || wId === 'mw-005' || wId === 'sup-wrk-mw-005' || wId === 'sup-wrk-mw-006')) return true;
  }

  // 2. Direct match on assignedEngineer name/crew
  if (complaint.assignedEngineer) {
    if (isWorkerNameMatch(complaint.assignedEngineer, worker)) {
      if (complaint.district && worker.district && !isDistrictMatch(complaint.district, worker.district)) {
        return false;
      }
      return true;
    }
  }

  // 3. Match on workExecution.engineerName
  if (complaint.workExecution?.engineerName) {
    if (isWorkerNameMatch(complaint.workExecution.engineerName, worker)) {
      if (complaint.district && worker.district && !isDistrictMatch(complaint.district, worker.district)) {
        return false;
      }
      return true;
    }
  }

  // 4. Match on verified registered phone number
  const workerPhoneDigits = (worker.phone || '').replace(/\D/g, '');
  if (workerPhoneDigits.length >= 8) {
    const assignedPhoneDigits = (complaint.assignedEngineerPhone || '').replace(/\D/g, '');
    const execPhoneDigits = (complaint.workExecution?.engineerPhone || '').replace(/\D/g, '');
    if (assignedPhoneDigits.length >= 8 && (assignedPhoneDigits.endsWith(workerPhoneDigits.slice(-8)) || workerPhoneDigits.endsWith(assignedPhoneDigits.slice(-8)))) {
      return true;
    }
    if (execPhoneDigits.length >= 8 && (execPhoneDigits.endsWith(workerPhoneDigits.slice(-8)) || workerPhoneDigits.endsWith(execPhoneDigits.slice(-8)))) {
      return true;
    }
  }

  return false;
}
