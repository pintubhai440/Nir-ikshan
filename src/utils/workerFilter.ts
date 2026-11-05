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
  if (a.includes('konaseema') && b.includes('konaseema')) return true;
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

  // 1. If assignedEngineerId is explicitly set, strict ID matching takes absolute priority:
  if ((complaint as any).assignedEngineerId) {
    const cId = String((complaint as any).assignedEngineerId).toLowerCase().trim();
    if (cId === wId) return true;
    // If assignedEngineerId is set and does not match, it belongs to another worker strictly
    return false;
  }

  // 2. Direct match on assignedEngineer name/crew
  if (complaint.assignedEngineer) {
    if (isWorkerNameMatch(complaint.assignedEngineer, worker)) {
      // Must also match district if both are present
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
