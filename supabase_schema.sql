-- ==============================================================================
-- NIR-IKSHAN: CITIZEN WATER COMPLAINTS PERMANENT SUPABASE DATABASE TABLE SCHEMA
-- ==============================================================================
-- Paste this script into your Supabase Dashboard > SQL Editor and click RUN.
-- This ensures all citizen complaints are permanently preserved in PostgreSQL
-- and synced in real-time across all mobile and web users worldwide.
-- ==============================================================================

-- 1. Create citizen_complaints table
CREATE TABLE IF NOT EXISTS public.citizen_complaints (
  id TEXT PRIMARY KEY,
  citizen_name TEXT NOT NULL DEFAULT 'Verified Citizen',
  citizen_age INTEGER DEFAULT 30,
  citizen_gender TEXT DEFAULT 'Other',
  citizen_phone TEXT,
  state TEXT DEFAULT 'Andhra Pradesh',
  district TEXT NOT NULL DEFAULT 'Vizianagaram',
  mandal TEXT NOT NULL DEFAULT '',
  village TEXT NOT NULL DEFAULT '',
  location_landmark TEXT DEFAULT '',
  coordinates JSONB NOT NULL DEFAULT '{"lat": 18.1124, "lng": 83.4022}'::jsonb,
  waste_type TEXT,
  short_description TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  assigned_nodal_officer TEXT DEFAULT 'District Nodal Officer',
  assigned_inspector TEXT,
  assigned_inspector_phone TEXT,
  assigned_engineer TEXT,
  assigned_engineer_phone TEXT,
  inspection_report JSONB,
  work_execution JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create indices for instant spatial and district searches
CREATE INDEX IF NOT EXISTS idx_citizen_complaints_district ON public.citizen_complaints(district);
CREATE INDEX IF NOT EXISTS idx_citizen_complaints_status ON public.citizen_complaints(status);
CREATE INDEX IF NOT EXISTS idx_citizen_complaints_created ON public.citizen_complaints(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.citizen_complaints ENABLE ROW LEVEL SECURITY;

-- 4. Setup RLS policies so public citizens can lodge complaints and view status without restrictions
DROP POLICY IF EXISTS "Public can view all complaints" ON public.citizen_complaints;
CREATE POLICY "Public can view all complaints" 
ON public.citizen_complaints FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public can insert complaints" ON public.citizen_complaints;
CREATE POLICY "Public can insert complaints" 
ON public.citizen_complaints FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update complaint status" ON public.citizen_complaints;
CREATE POLICY "Public can update complaint status" 
ON public.citizen_complaints FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 5. Enable Supabase Realtime for instant live updates across all connected dashboards
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_complaints;

-- 6. Insert default seed data so tables are never empty
INSERT INTO public.citizen_complaints (
  id, citizen_name, citizen_age, citizen_gender, citizen_phone, district, mandal, village, location_landmark, 
  coordinates, waste_type, short_description, photo_url, submitted_at, status, assigned_nodal_officer
) VALUES 
(
  'CMP-AP-2026-101', 'Ramesh Varma', 42, 'Male', '9848012345', 'Vizianagaram', 'Bhogapuram', 'Kavulavada', 
  'Near Beach Road culvert check dam', '{"lat": 18.0245, "lng": 83.4912}'::jsonb, 'Plastic & Polythene Waste (Bottles & Bags)', 
  'Heavy single-use plastic dumping choking the culvert inlet and causing stagnant black water.',
  'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  '2026-10-16 09:30:00', 'SUBMITTED', 'Sri K. Venkata Ramana, IAS'
),
(
  'CMP-AP-2026-102', 'Sujatha Reddy', 36, 'Female', '9440156789', 'Visakhapatnam', 'Pendurthi', 'Chintagatla', 
  'Meghadrigedda reservoir upper inlet stream', '{"lat": 17.7845, "lng": 83.1892}'::jsonb, 'Industrial Chemical Effluent / Factory Dye Discharge', 
  'Toxic colored wastewater discharging into upstream reservoir feeder from industrial cluster.',
  'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80',
  '2026-10-15 14:15:00', 'INSPECTION_COMPLETED', 'Dr. A. Mallikarjuna, IAS'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Create departmental_roster table (Nodal Officers, Field Inspectors, Action Workers)
CREATE TABLE IF NOT EXISTS public.departmental_roster (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Nodal Officer', 'Field Inspector', 'Action Worker'
  badge_id TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  specialization_or_machinery TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.departmental_roster ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view departmental roster" ON public.departmental_roster;
CREATE POLICY "Public can view departmental roster" 
ON public.departmental_roster FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public can manage departmental roster" ON public.departmental_roster;
CREATE POLICY "Public can manage departmental roster" 
ON public.departmental_roster FOR ALL 
USING (true)
WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.departmental_roster;

-- 8. Insert initial real AP departmental roster for Nodal Officers, Inspectors, and Action Workers
INSERT INTO public.departmental_roster (
  id, name, role, badge_id, phone, email, district, specialization_or_machinery, status
) VALUES
('usr-nodal-01', 'Er. N. Subba Rao', 'Nodal Officer', 'AP-WRA-0402', '+91 98480 12345', 'nodal.vzm@nirikshan.ap.gov.in', 'Vizianagaram', 'Tatipudi Reservoir & Champavathi Basin Command Cell', 'Active'),
('usr-nodal-02', 'Dr. A. Mallikarjuna, IAS', 'Nodal Officer', 'AP-WRA-0601', '+91 94401 56789', 'collector.vskp@ap.gov.in', 'Visakhapatnam', 'Meghadrigedda & Mudasarlova Basin Command', 'Active'),
('usr-nodal-03', 'Smt. P. Hemalatha', 'Nodal Officer', 'AP-WRA-0711', '+91 94902 44321', 'nodal.pvm@nirikshan.ap.gov.in', 'Parvathipuram Manyam', 'Thotapalli Barrage & Nagavali River Basin', 'Active'),
('usr-insp-01', 'Sri K. Rama Krishna', 'Field Inspector', 'AP-INSP-VZM-101', '+91 94401 22334', 'kr.krishna@field.ap.gov.in', 'Vizianagaram', 'Lake Siltation, Drone Photogrammetry & Urban Plastic Obstruction Verification', 'Active'),
('usr-insp-02', 'Sri V. Jagannadha Rao', 'Field Inspector', 'AP-INSP-VZM-102', '+91 94405 66778', 'v.jagannadh@field.ap.gov.in', 'Vizianagaram', 'Riverbed Sand Mining & Embankment Erosion Auditing', 'Active'),
('usr-insp-03', 'Smt. Pooja Reddy', 'Field Inspector', 'AP-INSP-1104', '+91 97480 11184', 'pooja.reddy@field.ap.gov.in', 'Vizianagaram', 'TDS Multi-Parameter Water Testing & Industrial Chemical Effluent Tracing', 'Active'),
('usr-insp-04', 'Sri M. Appala Naidu', 'Field Inspector', 'AP-INSP-PVM-201', '+91 94403 44556', 'm.appala@field.ap.gov.in', 'Parvathipuram Manyam', 'Aquatic Weed Infestation & Barrage Sluice Structural Inspection', 'Active'),
('usr-wrk-01', 'Er. T. Venkata Ramana', 'Action Worker', 'AP-CREW-JCB-401', '+91 94402 33445', 'venkata.ramana@works.ap.gov.in', 'Vizianagaram', '1x JCB 3DX Heavy Excavator + 2x 10-Ton Tipper Trucks', 'Active'),
('usr-wrk-02', 'Er. B. Trinadha Rao', 'Action Worker', 'AP-CREW-SLU-402', '+91 94403 91102', 'trinadh.rao@works.ap.gov.in', 'Vizianagaram', '2x High-Pressure Sludge Suction Tankers + Silt Baskets', 'Active'),
('usr-wrk-03', 'Er. G. Suresh Kumar', 'Action Worker', 'AP-CREW-HARV-501', '+91 94404 55667', 'suresh.kumar@works.ap.gov.in', 'Parvathipuram Manyam', '1x Pontoon Aquatic Weed Harvester & Biomass Shredder', 'Active')
ON CONFLICT (id) DO NOTHING;
