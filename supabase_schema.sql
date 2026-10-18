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
