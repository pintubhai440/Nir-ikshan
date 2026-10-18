import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CitizenComplaint } from '../types/nirikshan';

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
      return data.map(mapRowToComplaint);
    }
    return [];
  } catch (err) {
    console.warn('[Supabase] Network error fetching complaints:', err);
    return null;
  }
}

/**
 * Upsert / Save complaint to Supabase
 */
export async function saveComplaintToSupabase(complaint: CitizenComplaint): Promise<boolean> {
  if (!supabase) return false;

  try {
    const row = mapComplaintToRow(complaint);
    const { error } = await supabase
      .from('citizen_complaints')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error saving complaint:', error.message);
      return false;
    }
    return true;
  } catch (err) {
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
