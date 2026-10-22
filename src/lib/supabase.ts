import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CitizenComplaint } from '../types/nirikshan';
import { DepartmentalPersonnel, INITIAL_DEPARTMENTAL_PERSONNEL } from '../data/stateAdminData';

// Support Vite import.meta.env, window globals, and safe browser localStorage (which never touches git)
const getStoredSupabaseConfig = () => {
  let url = '';
  let key = '';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      url = localStorage.getItem('nir_supabase_url') || '';
      key = localStorage.getItem('nir_supabase_anon_key') || '';
    }
  } catch {}
  return { url, key };
};

const storedConfig = getStoredSupabaseConfig();

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  storedConfig.url ||
  (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  storedConfig.key ||
  (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.trim() !== '' && 
    supabaseAnonKey && 
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Maps a database row into the TypeScript CitizenComplaint interface
 */
export function mapRowToComplaint(row: any): CitizenComplaint {
  return {
    id: row.id,
    citizenName: row.citizen_name || 'Verified Citizen',
    citizenAge: Number(row.citizen_age) || 30,
    citizenGender: row.citizen_gender || 'Other',
    citizenPhone: row.citizen_phone || '',
    state: row.state || 'Andhra Pradesh',
    district: row.district || 'Vizianagaram',
    mandal: row.mandal || '',
    village: row.village || '',
    locationLandmark: row.location_landmark || '',
    coordinates: typeof row.coordinates === 'object' && row.coordinates !== null 
      ? row.coordinates 
      : { lat: 18.1124, lng: 83.4022 },
    wasteType: row.waste_type || undefined,
    shortDescription: row.short_description || '',
    photoUrl: row.photo_url || undefined,
    submittedAt: row.submitted_at || new Date().toISOString(),
    status: row.status || 'SUBMITTED',
    assignedNodalOfficer: row.assigned_nodal_officer || 'District Nodal Officer',
    assignedInspector: row.assigned_inspector || undefined,
    assignedInspectorPhone: row.assigned_inspector_phone || undefined,
    assignedEngineer: row.assigned_engineer || undefined,
    assignedEngineerPhone: row.assigned_engineer_phone || undefined,
    inspectionReport: row.inspection_report || undefined,
    workExecution: row.work_execution || undefined,
  };
}

/**
 * Maps a CitizenComplaint interface to Supabase database columns
 */
export function mapComplaintToRow(c: CitizenComplaint) {
  return {
    id: c.id,
    citizen_name: c.citizenName,
    citizen_age: c.citizenAge,
    citizen_gender: c.citizenGender,
    citizen_phone: c.citizenPhone,
    state: c.state || 'Andhra Pradesh',
    district: c.district,
    mandal: c.mandal,
    village: c.village,
    location_landmark: c.locationLandmark,
    coordinates: c.coordinates,
    waste_type: c.wasteType || null,
    short_description: c.shortDescription,
    photo_url: c.photoUrl || null,
    submitted_at: c.submittedAt,
    status: c.status,
    assigned_nodal_officer: c.assignedNodalOfficer,
    assigned_inspector: c.assignedInspector || null,
    assigned_inspector_phone: c.assignedInspectorPhone || null,
    assigned_engineer: c.assignedEngineer || null,
    assigned_engineer_phone: c.assignedEngineerPhone || null,
    inspection_report: c.inspectionReport || null,
    work_execution: c.workExecution || null,
  };
}

/**
 * Fetch all complaints from Supabase
 */
// In-memory registry to prevent duplicate concurrent saves or redundant identical payloads to Supabase
const inFlightSaves = new Set<string>();
const lastSavedSignature = new Map<string, string>();

/**
 * Fetch all complaints from Supabase with strict ID deduplication
 */
export async function fetchComplaintsFromSupabase(): Promise<CitizenComplaint[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('citizen_complaints')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch complaints:', error.message);
      return null;
    }

    if (Array.isArray(data)) {
      // Deduplicate rows by ID — ensures zero duplicates in application state
      const uniqueMap = new Map<string, CitizenComplaint>();
      for (const row of data) {
        if (row && row.id && !uniqueMap.has(row.id)) {
          uniqueMap.set(row.id, mapRowToComplaint(row));
        }
      }
      return Array.from(uniqueMap.values());
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] Network error fetching complaints:', err);
    return null;
  }
}

/**
 * Upsert / Save complaint to Supabase with strict anti-duplicate protections:
 * 1. Checks in-flight requests to prevent double-click / rapid parallel writes
 * 2. Checks data signature to skip redundant identical network writes
 * 3. Enforces PostgreSQL upsert ON CONFLICT (id) DO UPDATE to prevent duplicate rows
 */
export async function saveComplaintToSupabase(complaint: CitizenComplaint): Promise<boolean> {
  if (!supabase || !complaint?.id) return false;

  const row = mapComplaintToRow(complaint);
  const rowSignature = JSON.stringify(row);

  // Skip redundant save if exact same data was already successfully synced
  if (lastSavedSignature.get(complaint.id) === rowSignature) {
    return true;
  }

  // Prevent parallel in-flight duplicate calls for the same ID
  if (inFlightSaves.has(complaint.id)) {
    console.warn(`[Supabase Anti-Duplicate] Save already in-flight for complaint ID: ${complaint.id}. Skipping duplicate.`);
    return true;
  }

  inFlightSaves.add(complaint.id);

  try {
    const { error } = await supabase
      .from('citizen_complaints')
      .upsert(row, { onConflict: 'id' });

    inFlightSaves.delete(complaint.id);

    if (error) {
      console.error('[Supabase] Error saving complaint:', error.message);
      return false;
    }

    // Cache the successfully saved signature
    lastSavedSignature.set(complaint.id, rowSignature);
    return true;
  } catch (err) {
    inFlightSaves.delete(complaint.id);
    console.error('[Supabase] Network exception saving complaint:', err);
    return false;
  }
}

/**
 * Subscribe to real-time complaint updates across all connected users
 */
export function subscribeToComplaints(
  onInsert: (complaint: CitizenComplaint) => void,
  onUpdate: (complaint: CitizenComplaint) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('complaints-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'citizen_complaints',
      },
      (payload) => {
        if (payload.new) {
          onInsert(mapRowToComplaint(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'citizen_complaints',
      },
      (payload) => {
        if (payload.new) {
          onUpdate(mapRowToComplaint(payload.new));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Normalizes role string to standard DepartmentalPersonnel role union
 */
function normalizePersonnelRole(roleStr: any): 'Nodal Officer' | 'Field Inspector' | 'Action Worker' {
  const r = String(roleStr || '').toLowerCase().trim();
  if (r.includes('inspect') || r.includes('field')) {
    return 'Field Inspector';
  }
  if (r.includes('work') || r.includes('action') || r.includes('crew') || r.includes('engineer') || r.includes('remediation')) {
    return 'Action Worker';
  }
  return 'Nodal Officer';
}

/**
 * Maps a database row from Supabase into DepartmentalPersonnel
 */
export function mapRowToPersonnel(row: any): DepartmentalPersonnel {
  const role = normalizePersonnelRole(row.role || row.assigned_role || row.designation);
  const rawPhone = String(row.phone || row.mobile || row.contact_number || '+91 94401 22334');
  const cleanDigits = rawPhone.replace(/\D/g, '');
  const maskedMobile = row.masked_mobile || 
    (cleanDigits.length >= 4 
      ? `+91 ${cleanDigits.slice(0, 2)}••••••${cleanDigits.slice(-2)}` 
      : '+91 94••••••10');

  return {
    id: String(row.id || `usr-${Date.now()}`),
    staffId: String(row.badge_id || row.staff_id || row.badgeId || row.staffId || `AP-${role === 'Field Inspector' ? 'INSP' : role === 'Action Worker' ? 'WRK' : 'WRA'}-${row.id || '101'}`),
    name: String(row.name || row.lead_name || row.full_name || 'Departmental Officer'),
    email: String(row.email || `${String(row.name || 'officer').toLowerCase().replace(/[^a-z0-9]/g, '.')}@water.ap.gov.in`),
    role,
    district: String(row.district || 'Vizianagaram'),
    jurisdictionSubBasin: String(row.jurisdiction_sub_basin || row.sub_basin || row.specialization_or_machinery || `${row.district || 'Andhra Pradesh'} Watershed Command`),
    maskedMobile,
    phone: rawPhone,
    status: (row.status === 'Inactive' ? 'Inactive' : (row.status || 'Active')) as any,
    lastActive: String(row.last_active || row.updated_at ? 'Active today' : 'Recently active'),
    avatarUrl: row.avatar_url || row.photo_url || undefined,
    specializationOrMachinery: row.specialization_or_machinery || row.specialization || row.primary_machinery || undefined,
    agencyOrUnit: row.agency_or_unit || row.contractor_agency || undefined,
    crewStrength: row.crew_strength ? Number(row.crew_strength) : undefined,
    assignedMandals: Array.isArray(row.assigned_mandals) ? row.assigned_mandals : undefined,
    rating: Number(row.rating) || 4.9,
    activeTasksCount: Number(row.active_tasks_count) || undefined,
    sourceTable: 'supabase',
  };
}

/**
 * Maps DepartmentalPersonnel to Supabase database columns
 */
export function mapPersonnelToRow(p: DepartmentalPersonnel) {
  return {
    id: p.id,
    name: p.name,
    role: p.role,
    badge_id: p.staffId,
    phone: p.phone,
    email: p.email,
    district: p.district,
    specialization_or_machinery: p.specializationOrMachinery || p.jurisdictionSubBasin,
    status: p.status,
  };
}

/**
 * Fetch all real personnel from Supabase:
 * Checks 'departmental_roster', 'departmental_personnel', 'profiles', 
 * and aggregates assigned inspectors & action workers from 'citizen_complaints'.
 * Seamlessly merges with the verified AP operational roster.
 */
/**
 * Fetch all real personnel from Supabase:
 * 1. Queries user's 'field_inspectors' table directly
 * 2. Queries user's 'action_workers' table directly
 * 3. Queries 'departmental_roster' and 'departmental_personnel' tables
 * 4. Extracts assigned personnel from 'citizen_complaints'
 * 5. Guarantees all 26 Andhra Pradesh districts have their official Nodal Officer (1 per district)
 */
export async function fetchPersonnelFromSupabase(): Promise<DepartmentalPersonnel[]> {
  const mergedMap = new Map<string, DepartmentalPersonnel>();

  // 1. Seed base verified Andhra Pradesh operational roster (includes all 26 District Nodal Officers)
  for (const p of INITIAL_DEPARTMENTAL_PERSONNEL) {
    const key = `${p.role.toLowerCase()}-${p.name.toLowerCase().trim()}`;
    mergedMap.set(key, { ...p, sourceTable: 'official_ap_roster' });
  }

  if (!supabase) {
    return Array.from(mergedMap.values());
  }

  try {
    // 2. Query user's real 'field_inspectors' table from Supabase
    try {
      const { data: fieldData, error: fieldErr } = await supabase
        .from('field_inspectors')
        .select('*');

      if (!fieldErr && Array.isArray(fieldData) && fieldData.length > 0) {
        for (const row of fieldData) {
          if (row?.full_name || row?.name) {
            const name = String(row.full_name || row.name).trim();
            const rawPhone = String(row.phone || '+91 90000 10001');
            const cleanDigits = rawPhone.replace(/\D/g, '');
            const maskedMobile = cleanDigits.length >= 4 
              ? `+91 ${cleanDigits.slice(0, 2)}••••••${cleanDigits.slice(-2)}` 
              : '+91 90••••••01';

            const district = String(row.district || 'Vizianagaram');
            const mandal = String(row.mandal || '');
            const staffId = String(row.inspector_id || row.id || `INS-${Math.floor(100 + Math.random() * 900)}`);
            const statusRaw = String(row.status || 'Active').toLowerCase();
            const status: 'Active' | 'On Duty' | 'Standby' | 'Inactive' = 
              statusRaw === 'on leave' || statusRaw === 'standby' ? 'Standby' :
              statusRaw === 'inactive' ? 'Inactive' : 'Active';

            const p: DepartmentalPersonnel = {
              id: `sup-insp-${staffId}`,
              staffId,
              name,
              email: String(row.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.org`),
              role: 'Field Inspector',
              district,
              jurisdictionSubBasin: mandal ? `${mandal} Mandal • Meter ${row.meter_id || 'TDS-AP'}` : `${district} Catchment`,
              maskedMobile,
              phone: rawPhone,
              status,
              lastActive: 'Active in Supabase',
              specializationOrMachinery: row.meter_id 
                ? `Calibrated Digital Meter (${row.meter_id}) • Water Quality & Silt Auditing` 
                : 'TDS Multi-Parameter Water Testing & Field Auditing',
              agencyOrUnit: `District Water Surveillance Wing (${row.nodal_officer_id || 'NO-' + district.slice(0, 3).toUpperCase() + '-01'})`,
              assignedMandals: mandal ? [mandal] : undefined,
              activeTasksCount: Number(row.open_inspections) || 0,
              rating: 4.9,
              sourceTable: 'supabase',
            };

            const key = `field inspector-${name.toLowerCase()}`;
            mergedMap.set(key, p);
          }
        }
      }
    } catch (e) {
      console.warn('[Supabase] Note on field_inspectors table:', e);
    }

    // 3. Query user's real 'action_workers' table from Supabase
    try {
      const { data: workerData, error: workerErr } = await supabase
        .from('action_workers')
        .select('*');

      if (!workerErr && Array.isArray(workerData) && workerData.length > 0) {
        for (const row of workerData) {
          const crewName = String(row.name_or_crew_type || row.contact_person || row.name || 'Remediation Crew').trim();
          const contactPerson = String(row.contact_person || crewName).trim();
          const rawPhone = String(row.phone || '+91 90000 20001');
          const cleanDigits = rawPhone.replace(/\D/g, '');
          const maskedMobile = cleanDigits.length >= 4 
            ? `+91 ${cleanDigits.slice(0, 2)}••••••${cleanDigits.slice(-2)}` 
            : '+91 90••••••01';

          const district = String(row.district || 'Vizianagaram');
          const serviceAreas = String(row.service_areas || row.mandal || district);
          const staffId = String(row.worker_id || row.id || `MW-${Math.floor(100 + Math.random() * 900)}`);
          const workerType = String(row.type || 'Crew');
          const skills = String(row.skills || 'waste cleaning/desilting');
          const availRaw = String(row.availability || row.status || 'Available').toLowerCase();
          const status: 'Active' | 'On Duty' | 'Standby' | 'Inactive' = 
            availRaw === 'busy' ? 'On Duty' :
            availRaw === 'on leave' || availRaw === 'standby' ? 'Standby' :
            availRaw === 'inactive' ? 'Inactive' : 'Active';

          const p: DepartmentalPersonnel = {
            id: `sup-worker-${staffId}`,
            staffId,
            name: crewName,
            email: `${contactPerson.toLowerCase().replace(/[^a-z0-9]/g, '.')}@works.ap.gov.in`,
            role: 'Action Worker',
            district,
            jurisdictionSubBasin: serviceAreas ? `${serviceAreas} Command Area` : `${district} Catchment`,
            maskedMobile,
            phone: rawPhone,
            status,
            lastActive: `${row.availability || 'Available'} in Supabase`,
            specializationOrMachinery: `${workerType}: ${skills} • Lead: ${contactPerson}`,
            agencyOrUnit: workerType === 'Contractor' 
              ? `Registered APWRIMS Earthworks Contractor (${row.nodal_officer_id || district})`
              : workerType === 'Engineer' 
              ? `AP Minor Irrigation Mechanical Unit (${row.nodal_officer_id || district})`
              : `APWRIMS Rapid Remediation Fleet (${row.nodal_officer_id || district})`,
            crewStrength: workerType === 'Contractor' ? 12 : workerType === 'Crew' ? 6 : undefined,
            activeTasksCount: Number(row.open_tasks) || 0,
            rating: 4.9,
            sourceTable: 'supabase',
          };

          const key = `action worker-${crewName.toLowerCase()}`;
          mergedMap.set(key, p);
        }
      }
    } catch (e) {
      console.warn('[Supabase] Note on action_workers table:', e);
    }

    // 4. Query departmental_roster table if available
    try {
      const { data: rosterData, error: rosterErr } = await supabase
        .from('departmental_roster')
        .select('*');

      if (!rosterErr && Array.isArray(rosterData) && rosterData.length > 0) {
        for (const row of rosterData) {
          if (row?.name) {
            const mapped = mapRowToPersonnel(row);
            const key = `${mapped.role.toLowerCase()}-${mapped.name.toLowerCase().trim()}`;
            mergedMap.set(key, mapped);
          }
        }
      }
    } catch {}

    // 5. Query departmental_personnel table if available
    try {
      const { data: staffData, error: staffErr } = await supabase
        .from('departmental_personnel')
        .select('*');

      if (!staffErr && Array.isArray(staffData) && staffData.length > 0) {
        for (const row of staffData) {
          if (row?.name) {
            const mapped = mapRowToPersonnel(row);
            const key = `${mapped.role.toLowerCase()}-${mapped.name.toLowerCase().trim()}`;
            mergedMap.set(key, mapped);
          }
        }
      }
    } catch {}

    // 6. Query citizen_complaints table to reflect any active field officer task counts
    try {
      const { data: complaintsData, error: compErr } = await supabase
        .from('citizen_complaints')
        .select('assigned_nodal_officer, assigned_inspector, assigned_engineer, district');

      if (!compErr && Array.isArray(complaintsData) && complaintsData.length > 0) {
        for (const row of complaintsData) {
          if (row.assigned_nodal_officer) {
            const key = `nodal officer-${row.assigned_nodal_officer.toLowerCase().trim()}`;
            if (mergedMap.has(key)) {
              mergedMap.get(key)!.activeTasksCount = (mergedMap.get(key)!.activeTasksCount || 0) + 1;
            }
          }
          if (row.assigned_inspector) {
            const key = `field inspector-${row.assigned_inspector.toLowerCase().trim()}`;
            if (mergedMap.has(key)) {
              mergedMap.get(key)!.activeTasksCount = (mergedMap.get(key)!.activeTasksCount || 0) + 1;
            }
          }
          if (row.assigned_engineer) {
            const key = `action worker-${row.assigned_engineer.toLowerCase().trim()}`;
            if (mergedMap.has(key)) {
              mergedMap.get(key)!.activeTasksCount = (mergedMap.get(key)!.activeTasksCount || 0) + 1;
            }
          }
        }
      }
    } catch {}
  } catch (err) {
    console.warn('[Supabase Personnel] Error fetching from database:', err);
  }

  return Array.from(mergedMap.values());
}

/**
 * Upsert / Save personnel record to Supabase tables:
 * - If Field Inspector -> saves directly to user's 'field_inspectors' table!
 * - If Action Worker -> saves directly to user's 'action_workers' table!
 * - If Nodal Officer -> saves to 'departmental_roster' / 'departmental_personnel' table!
 */
export async function savePersonnelToSupabase(p: DepartmentalPersonnel): Promise<boolean> {
  if (!supabase || !p?.id) return false;

  let savedSuccessfully = false;

  // 1. If Field Inspector -> write to user's 'field_inspectors' table
  if (p.role === 'Field Inspector') {
    try {
      const mandalName = p.assignedMandals?.[0] || p.jurisdictionSubBasin?.split(' ')?.[0] || 'Central';
      const districtShort = p.district.slice(0, 3).toUpperCase();
      const inspRow = {
        inspector_id: p.staffId,
        full_name: p.name,
        phone: p.phone,
        email: p.email,
        district: p.district,
        mandal: mandalName,
        nodal_officer_id: `NO-${districtShort}-01`,
        languages: 'Telugu/English',
        status: p.status === 'Standby' ? 'On leave' : p.status === 'Inactive' ? 'Inactive' : 'Active',
        meter_id: `TDS-${districtShort}-${Math.floor(100 + Math.random() * 900)}`,
        open_inspections: p.activeTasksCount || 0,
        overdue_inspections: 0,
        joined_on: new Date().toISOString().split('T')[0],
      };

      const { error: inspErr } = await supabase
        .from('field_inspectors')
        .upsert(inspRow, { onConflict: 'inspector_id' });

      if (!inspErr) {
        savedSuccessfully = true;
      }
    } catch (e) {
      console.warn('[Supabase] Note saving to field_inspectors:', e);
    }
  }

  // 2. If Action Worker -> write to user's 'action_workers' table
  if (p.role === 'Action Worker') {
    try {
      const districtShort = p.district.slice(0, 3).toUpperCase();
      const isContractor = p.agencyOrUnit?.toLowerCase().includes('contract') || p.name.toLowerCase().includes('earthwork');
      const isEngineer = p.name.toLowerCase().startsWith('eng') || p.agencyOrUnit?.toLowerCase().includes('engineer');
      const workerType = isContractor ? 'Contractor' : isEngineer ? 'Engineer' : 'Crew';

      const workerRow = {
        worker_id: p.staffId,
        name_or_crew_type: p.name,
        type: workerType,
        contact_person: p.name,
        phone: p.phone,
        skills: p.specializationOrMachinery || 'waste cleaning/desilting',
        service_areas: p.jurisdictionSubBasin || p.district,
        district: p.district,
        nodal_officer_id: `NO-${districtShort}-01`,
        availability: p.status === 'On Duty' ? 'Busy' : p.status === 'Standby' ? 'On leave' : 'Available',
        languages: 'Telugu/English',
        status: p.status === 'Inactive' ? 'Inactive' : 'Active',
        open_tasks: p.activeTasksCount || 0,
        tasks_declined: 0,
        no_response: 0,
        added_on: new Date().toISOString().split('T')[0],
      };

      const { error: workerErr } = await supabase
        .from('action_workers')
        .upsert(workerRow, { onConflict: 'worker_id' });

      if (!workerErr) {
        savedSuccessfully = true;
      }
    } catch (e) {
      console.warn('[Supabase] Note saving to action_workers:', e);
    }
  }

  // 3. Always also persist to central departmental_roster or departmental_personnel
  try {
    const row = mapPersonnelToRow(p);
    const { error: err1 } = await supabase
      .from('departmental_roster')
      .upsert(row, { onConflict: 'id' });

    if (!err1) return true;

    const { error: err2 } = await supabase
      .from('departmental_personnel')
      .upsert(row, { onConflict: 'id' });

    if (!err2) return true;
  } catch (err) {
    console.error('[Supabase Personnel] Error saving to roster tables:', err);
  }

  return savedSuccessfully;
}

/**
 * Seed all verified Andhra Pradesh Departmental Roster to Supabase
 */
export async function seedDepartmentalRosterToSupabase(
  roster: DepartmentalPersonnel[]
): Promise<{ success: boolean; count: number }> {
  if (!supabase) return { success: false, count: 0 };

  let successCount = 0;

  for (const person of roster) {
    const ok = await savePersonnelToSupabase(person);
    if (ok) successCount++;
  }

  return { success: successCount > 0, count: successCount };
}

/**
 * Subscribe to real-time changes on departmental roster across all tables
 */
export function subscribeToPersonnel(
  onChanged: () => void
): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('personnel-realtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'field_inspectors' },
      () => onChanged()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'action_workers' },
      () => onChanged()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'departmental_roster' },
      () => onChanged()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'departmental_personnel' },
      () => onChanged()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'citizen_complaints' },
      () => onChanged()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
