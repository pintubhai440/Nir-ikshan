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
('usr-nodal-03', 'Smt. P. Hemalatha', 'Nodal Officer', 'AP-WRA-0711', '+91 94902 44321', 'nodal.pvm@nirikshan.ap.gov.in', 'Parvathipuram Manyam', 'Thotapalli Barrage & Nagavali River Basin', 'Active')
ON CONFLICT (id) DO NOTHING;

-- 9. Create field_inspectors table (Directly matching Supabase video)
CREATE TABLE IF NOT EXISTS public.field_inspectors (
  inspector_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT NOT NULL,
  mandal TEXT NOT NULL,
  nodal_officer_id TEXT NOT NULL,
  languages TEXT DEFAULT 'Telugu/English',
  status TEXT DEFAULT 'Active',
  meter_id TEXT,
  meter_last_calibrated DATE,
  open_inspections INTEGER DEFAULT 0,
  overdue_inspections INTEGER DEFAULT 0,
  joined_on DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.field_inspectors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view field inspectors" ON public.field_inspectors;
CREATE POLICY "Public can view field inspectors" ON public.field_inspectors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage field inspectors" ON public.field_inspectors;
CREATE POLICY "Public can manage field inspectors" ON public.field_inspectors FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.field_inspectors;

-- Seed field_inspectors
INSERT INTO public.field_inspectors (
  inspector_id, full_name, phone, email, district, mandal, nodal_officer_id, languages, status, meter_id, meter_last_calibrated, open_inspections, overdue_inspections, joined_on
) VALUES
('INS-001', 'Ravi Teja Naidu', '+91 90000 10001', 'ravi.teja@example.org', 'Vizianagaram', 'Bobbili', 'NO-VZM-01', 'Telugu/English', 'Active', 'TDS-VZM-001', '2026-04-10', 4, 0, '2025-11-20'),
('INS-002', 'Lakshmi Prasanna', '+91 90000 10002', 'lakshmi.p@example.org', 'Vizianagaram', 'Salur', 'NO-VZM-01', 'Telugu', 'Active', 'TDS-VZM-002', '2026-03-15', 6, 1, '2025-11-03'),
('INS-003', 'Srinivasa Rao Dedala', '+91 90000 10003', 'srinivasa.d@example.org', 'Vizianagaram', 'Cheepurupalli', 'NO-VZM-01', 'Telugu/Hindi', 'Active', 'TDS-VZM-003', '2026-04-01', 0, 0, '2026-01-14'),
('INS-004', 'Swathi Kumari', '+91 90000 10004', 'swathi.k@example.org', 'Vizianagaram', 'Nellimarla', 'NO-VZM-01', 'Telugu/English', 'Active', 'TDS-VZM-004', '2026-02-20', 2, 0, '2025-10-15'),
('INS-005', 'Appala Naidu Bodapati', '+91 90000 10005', 'appala.b@example.org', 'Vizianagaram', 'Gajapathinagaram', 'NO-VZM-01', 'Telugu', 'On leave', 'TDS-VZM-005', '2026-03-22', 0, 0, '2025-12-01'),
('INS-006', 'Madhavi Latha', '+91 90000 10006', 'madhavi.l@example.org', 'Vizianagaram', 'Srungavarapukota', 'NO-VZM-01', 'Telugu/Hindi', 'Active', NULL, NULL, 8, 2, '2026-02-14'),
('INS-007', 'Kiran Kumar Gola', '+91 90000 10007', 'kiran.g@example.org', 'Vizianagaram', 'Kothavalasa', 'NO-VZM-01', 'Telugu/English', 'Active', 'TDS-VZM-006', '2026-04-05', 5, 0, '2025-11-20'),
('INS-008', 'Ramesh Puppala', '+91 90000 10008', 'ramesh.p@example.org', 'Parvathipuram Manyam', 'Parvathipuram', 'NO-PVM-01', 'Telugu', 'Active', 'TDS-PVM-001', '2026-04-12', 3, 0, '2025-11-03'),
('INS-009', 'Sunitha Rani', '+91 90000 10009', 'sunitha.r@example.org', 'Parvathipuram Manyam', 'Palakonda', 'NO-PVM-01', 'Telugu/Hindi', 'Inactive', 'TDS-PVM-002', '2026-01-20', 0, 0, '2026-01-14'),
('INS-010', 'Venkata Ramana Pydi', '+91 90000 10010', 'venkata.p@example.org', 'Parvathipuram Manyam', 'Salur', 'NO-PVM-01', 'Telugu/English', 'Active', 'TDS-PVM-003', '2026-04-05', 2, 0, '2025-12-01')
ON CONFLICT (inspector_id) DO NOTHING;

-- 10. Create action_workers table (Directly matching Supabase video)
CREATE TABLE IF NOT EXISTS public.action_workers (
  worker_id TEXT PRIMARY KEY,
  name_or_crew TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Crew', -- 'Crew', 'Contractor', 'Engineer', 'Individual'
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT NOT NULL,
  service_areas TEXT NOT NULL,
  district TEXT NOT NULL,
  availability TEXT DEFAULT 'Available',
  languages TEXT DEFAULT 'Telugu',
  status TEXT DEFAULT 'Active',
  open_tasks INTEGER DEFAULT 0,
  tasks_declined INTEGER DEFAULT 0,
  no_response INTEGER DEFAULT 0,
  added_on DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.action_workers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view action workers" ON public.action_workers;
CREATE POLICY "Public can view action workers" ON public.action_workers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can manage action workers" ON public.action_workers;
CREATE POLICY "Public can manage action workers" ON public.action_workers FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_workers;

-- Seed action_workers (Matched to exact name_or_crew column)
INSERT INTO public.action_workers (
  worker_id, name_or_crew, type, contact_person, phone, skills, service_areas, district, availability, languages, status, open_tasks, tasks_declined, no_response, added_on
) VALUES
('MW-001', 'Sri Sai Cleaning Crew', 'Crew', 'Ramu Naidu', '+91 90000 20001', 'waste cleaning;desilting', 'Vizianagaram;Kothavalasa', 'Vizianagaram', 'Available', 'Telugu', 'Active', 1, 0, 0, '2025-11-10'),
('MW-002', 'Appalaraju', 'Individual', 'Appalaraju', '+91 90000 20002', 'waste cleaning', 'Bobbili', 'Vizianagaram', 'Available', 'Telugu', 'Active', 2, 1, 0, '2025-11-12'),
('MW-003', 'Godavari Earthworks', 'Contractor', 'Satya Prasad', '+91 90000 20003', 'desilting;structural repair;fencing', 'Bobbili;Cheepurupalli;Gajapathinagaram', 'Vizianagaram', 'Busy', 'Telugu;English', 'Active', 5, 0, 1, '2025-11-20'),
('MW-004', 'Eng. Padmavathi Rao', 'Engineer', 'Padmavathi Rao', '+91 90000 20004', 'structural repair;plumbing', 'Vizianagaram;Nellimarla;Srungavarapukota', 'Vizianagaram', 'Available', 'Telugu;English', 'Active', 1, 0, 0, '2025-12-05'),
('MW-005', 'Tirumala Fencing Team', 'Crew', 'Narayana Murthy', '+91 90000 20005', 'fencing', 'Gajapathinagaram;Cheepurupalli', 'Vizianagaram', 'Available', 'Telugu', 'Active', 0, 0, 0, '2026-01-08'),
('MW-006', 'Bhaskar Rao', 'Individual', 'Bhaskar Rao', '+91 90000 20006', 'plumbing;structural repair', 'Kothavalasa;Vizianagaram', 'Vizianagaram', 'On leave', 'Telugu;Hindi', 'Active', 0, 0, 0, '2026-01-15'),
('MW-007', 'Nagavali Desilting Services', 'Contractor', 'Chandra Sekhar', '+91 90000 20007', 'desilting;waste cleaning', 'Nellimarla;Srungavarapukota;Vizianagaram', 'Vizianagaram', 'Available', 'Telugu;English', 'Active', 2, 2, 1, '2026-02-02'),
('MW-008', 'Hill Area Cleaners', 'Crew', 'Gangulu', '+91 90000 20008', 'waste cleaning', 'Parvathipuram;Salur', 'Parvathipuram Manyam', 'Available', 'Telugu', 'Active', 1, 0, 0, '2025-12-10'),
('MW-009', 'Eng. Suresh Babu', 'Engineer', 'Suresh Babu', '+91 90000 20009', 'structural repair;desilting', 'Parvathipuram;Palakonda;Salur', 'Parvathipuram Manyam', 'Busy', 'Telugu;English;Hindi', 'Active', 4, 0, 0, '2025-12-18'),
('MW-010', 'Palakonda Works Co', 'Contractor', 'Dhana Lakshmi', '+91 90000 20010', 'fencing;plumbing;waste cleaning', 'Palakonda', 'Parvathipuram Manyam', 'Available', 'Telugu', 'Active', 0, 1, 2, '2026-02-20'),
('MW-011', 'Rajesh', 'Individual', 'Rajesh', '+91 90000 20011', 'waste cleaning;fencing', 'Salur', 'Parvathipuram Manyam', 'Available', 'Telugu', 'Inactive', 0, 0, 0, '2026-03-01'),
('MW-012', 'Seethampeta Rapid Crew', 'Crew', 'Kondala Rao', '+91 90000 20012', 'desilting;waste cleaning;structural repair', 'Parvathipuram;Palakonda', 'Parvathipuram Manyam', 'Available', 'Telugu;English', 'Active', 1, 3, 0, '2026-03-12')
ON CONFLICT (worker_id) DO NOTHING;

