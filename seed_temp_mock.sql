-- ═══════════════════════════════════════════════════════════════════
--  ZIVAN — Upgrade Columns & Seed temp_mock Data
--  Copy and run in: https://supabase.com/dashboard/project/zfudmwskebzdcomwqgpv/sql/new
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure all columns exist on emergencies table
ALTER TABLE public.emergencies
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT[],
  ADD COLUMN IF NOT EXISTS medications TEXT[],
  ADD COLUMN IF NOT EXISTS vitals_hr INT,
  ADD COLUMN IF NOT EXISTS vitals_bp TEXT,
  ADD COLUMN IF NOT EXISTS vitals_spo2 INT,
  ADD COLUMN IF NOT EXISTS vitals_rr INT,
  ADD COLUMN IF NOT EXISTS vitals_temp NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS allocated_bed TEXT,
  ADD COLUMN IF NOT EXISTS blood_cross_matched BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS handover_notes TEXT,
  ADD COLUMN IF NOT EXISTS eta_minutes INT,
  ADD COLUMN IF NOT EXISTS accepted_by TEXT,
  ADD COLUMN IF NOT EXISTS ambulance_id TEXT,
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
  ADD COLUMN IF NOT EXISTS estimated_arrival_time INT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS ambulance_type TEXT DEFAULT 'government',
  ADD COLUMN IF NOT EXISTS doctor_specialization TEXT DEFAULT 'Emergency – Not Sure',
  ADD COLUMN IF NOT EXISTS estimated_private_fare TEXT,
  ADD COLUMN IF NOT EXISTS icu_requirement BOOLEAN DEFAULT false;

-- 2. Ensure all columns exist on hospitals table
ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS accreditation TEXT,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS total_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS icu_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_icu_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accepts_emergency BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS open BOOLEAN DEFAULT true;

-- 3. Ensure all columns exist on ambulances table
ALTER TABLE public.ambulances
  ADD COLUMN IF NOT EXISTS call_sign TEXT,
  ADD COLUMN IF NOT EXISTS driver_phone TEXT,
  ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION;

-- 4. Ensure all columns exist on hospital_staff table
ALTER TABLE public.hospital_staff
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS shift TEXT;

-- 5. Create hospital_departments table if not exists
CREATE TABLE IF NOT EXISTS public.hospital_departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  head_doctor     TEXT,
  total_beds      INT DEFAULT 0,
  available_beds  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospital_departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read departments" ON public.hospital_departments;
CREATE POLICY "Public can read departments"
  ON public.hospital_departments FOR SELECT TO anon, authenticated USING (true);


-- ═══════════════════════════════════════════════════════════════════
-- 6. SEED HOSPITALS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.hospitals
  (id, name, type, distance_km, address, open, phone, rating, accreditation,
   total_beds, available_beds, icu_beds, available_icu_beds, accepts_emergency, specializations)
VALUES
  ('city-hospital', 'City Hospital', 'hospital', 2.4, '12 Lake Avenue', true,
   '+91 11-2345-6789', 4.6, 'NABH Accredited', 180, 32, 20, 8, true,
   ARRAY['24/7 Emergency', 'Advanced Cardiac Care', 'Trauma Centre', 'Blood Bank', 'Radiology & CT', 'ICU & NICU']),

  ('northside', 'Northside Medical', 'hospital', 4.6, '221 Riverfront Blvd', true,
   '+91 11-8765-4321', 4.5, 'NABH Accredited', 120, 18, 12, 4, true,
   ARRAY['24/7 Emergency', 'Cardiac Resus', 'Trauma', 'Pathology Lab', 'ICU']),

  ('care-clinic', 'Care Clinic', 'clinic', 3.1, '88 Green Park Road', true,
   '+91 11-3456-7890', 4.4, 'NABH Accredited', 40, 10, 0, 0, false,
   ARRAY['Outpatient Care', 'General Medicine', 'Paediatrics']),

  ('health-pharmacy', 'Health Pharmacy', 'pharmacy', 1.2, '4 Market Street', true,
   '+91 11-4567-8901', 4.7, 'Licensed Pharmacy', 0, 0, 0, 0, false,
   ARRAY['Prescription Dispensing', 'Emergency Medicines', 'Medical Supplies'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  distance_km = EXCLUDED.distance_km,
  address = EXCLUDED.address,
  open = EXCLUDED.open,
  phone = EXCLUDED.phone,
  rating = EXCLUDED.rating,
  accreditation = EXCLUDED.accreditation,
  total_beds = EXCLUDED.total_beds,
  available_beds = EXCLUDED.available_beds,
  icu_beds = EXCLUDED.icu_beds,
  available_icu_beds = EXCLUDED.available_icu_beds,
  accepts_emergency = EXCLUDED.accepts_emergency,
  specializations = EXCLUDED.specializations;


-- ═══════════════════════════════════════════════════════════════════
-- 7. SEED AMBULANCE FLEET
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.ambulances
  (id, hospital_id, vehicle_number, call_sign, driver_name, driver_phone, type, status)
VALUES
  ('amb-01', 'city-hospital', 'DL-1A-0001', 'ALPHA-1',   'Rajan Kumar', '+91 98111 00001', 'government', 'available'),
  ('amb-02', 'city-hospital', 'DL-1A-0002', 'BRAVO-2',   'Priya Singh', '+91 98111 00002', 'government', 'dispatched'),
  ('amb-03', 'city-hospital', 'DL-1A-0003', 'CHARLIE-3', 'Arjun Mehta', '+91 98111 00003', 'icu',        'maintenance'),
  ('amb-04', 'city-hospital', 'DL-1A-0004', 'DELTA-4',   'Sunita Rao',  '+91 98111 00004', 'private',    'returning'),
  ('amb-north-01', 'northside', 'DL-2B-0011', 'NORTH-1', 'Deepak Verma', '+91 98222 00011', 'government', 'available'),
  ('amb-north-02', 'northside', 'DL-2B-0012', 'NORTH-2', 'Sanjay Rawat', '+91 98222 00012', 'icu',        'available')
ON CONFLICT (id) DO UPDATE SET
  hospital_id = EXCLUDED.hospital_id,
  vehicle_number = EXCLUDED.vehicle_number,
  call_sign = EXCLUDED.call_sign,
  driver_name = EXCLUDED.driver_name,
  driver_phone = EXCLUDED.driver_phone,
  type = EXCLUDED.type,
  status = EXCLUDED.status;


-- ═══════════════════════════════════════════════════════════════════
-- 8. SEED HOSPITAL STAFF
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.hospital_staff
  (hospital_id, name, role, department, email, phone, status, shift)
VALUES
  ('city-hospital', 'City Dispatch Desk', 'admin',      'Command Centre',     'dispatch@cityhospital.demo', '+91 11-2345-0000', 'active',   'Morning'),
  ('northside',     'Northside ER Desk',  'admin',      'Emergency',          'er@northside.demo',          '+91 11-8765-0000', 'active',   'Morning'),
  ('city-hospital', 'Dr. Amrita Sharma',  'doctor',     'Emergency',          'a.sharma@cityhospital.demo', '+91 98111 00001', 'active',   'Morning'),
  ('city-hospital', 'Vikram Nair',        'staff',      'Command Centre',     'v.nair@cityhospital.demo',   '+91 98111 00002', 'active',   'Morning'),
  ('city-hospital', 'Priya Singh',        'staff',      'ICU',                'p.singh@cityhospital.demo',  '+91 98111 00003', 'active',   'Evening'),
  ('city-hospital', 'Arjun Mehta',        'staff',      'Command Centre',     'a.mehta@cityhospital.demo',  '+91 98111 00004', 'off-duty', 'Night'),
  ('city-hospital', 'Dr. Sonal Patel',    'doctor',     'General Medicine',   's.patel@cityhospital.demo',  '+91 98111 00005', 'on-leave', '—'),
  ('city-hospital', 'Sunita Rao',         'staff',      'Trauma',             's.rao@cityhospital.demo',    '+91 98111 00006', 'active',   'Morning'),
  ('city-hospital', 'Rahul Gupta',        'admin',      'Administration',     'r.gupta@cityhospital.demo',  '+91 98111 00007', 'active',   'Morning'),
  ('northside',     'Dr. Amit Sharma',    'doctor',     'Emergency',          'amit.sharma@northside.demo', '+91 98222 00001', 'active',   'Morning')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  shift = EXCLUDED.shift;


-- ═══════════════════════════════════════════════════════════════════
-- 9. SEED HOSPITAL DEPARTMENTS
-- ═══════════════════════════════════════════════════════════════════

DELETE FROM public.hospital_departments WHERE hospital_id = 'city-hospital';

INSERT INTO public.hospital_departments
  (hospital_id, name, head_doctor, total_beds, available_beds)
VALUES
  ('city-hospital', 'Emergency / Trauma', 'Dr. Amrita Sharma', 24, 8),
  ('city-hospital', 'ICU',                'Dr. Vikram Nair',   12, 3),
  ('city-hospital', 'General Medicine',   'Dr. Sonal Patel',   60, 22),
  ('city-hospital', 'Cardiology',         'Dr. Rahul Gupta',   20, 7),
  ('city-hospital', 'Paediatrics',        'Dr. Meera Joshi',   18, 10),
  ('city-hospital', 'Orthopaedics',       'Dr. Arjun Reddy',   16, 5);


-- ═══════════════════════════════════════════════════════════════════
-- 10. SEED SAMPLE EMERGENCY SOS REQUESTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.emergencies
  (patient_id, patient_name, patient_phone, location_label, latitude, longitude,
   hospital_id, hospital_name, status, priority, ambulance_type, doctor_specialization,
   notes, blood_group, allergies, medications, eta_minutes, accepted_by,
   vitals_hr, vitals_bp, vitals_spo2, vitals_rr, vitals_temp, allocated_bed, blood_cross_matched)
VALUES
  ('patient_001', 'Rahul Sharma', '+91 98111 22334',
   'Near Lake Avenue, Block C · Demo pin', 28.6139, 77.2090,
   'city-hospital', 'City Hospital', 'AMBULANCE EN ROUTE', 'critical',
   'government', 'Cardiology',
   'Severe shortness of breath and acute chest tightness reported. Suspected Anterior STEMI.',
   'O+', ARRAY['Penicillin', 'Peanuts'], ARRAY['Amlodipine 5mg', 'Atorvastatin 20mg'],
   8, 'City Dispatch Desk', 116, '146/92', 92, 24, 37.8, 'Trauma Bay 01', true),

  ('patient_002', 'Ananya Deshmukh', '+91 98222 44556',
   'Riverfront Park, Gate 2 · Demo pin', 28.6185, 77.2150,
   'city-hospital', 'City Hospital', 'PENDING', 'urgent',
   'government', 'Orthopaedics',
   'Fall injury with visible compound deformity in right lower leg/ankle, severe pain.',
   'B+', ARRAY['Sulfa drugs'], ARRAY['Thyroxine 50mcg'],
   NULL, NULL, 88, '128/82', 98, 18, 36.9, NULL, false),

  ('patient_003', 'Kunal Verma', '+91 98333 66778',
   'Market Complex, Sector 4 · Demo pin', 28.6092, 77.2010,
   'city-hospital', 'City Hospital', 'ARRIVED AT HOSPITAL', 'standard',
   'government', 'General Medicine',
   'Acute abdominal pain, stabilized on arrival. McBurney tenderness.',
   'A+', ARRAY['None'], ARRAY['None'],
   0, 'City Dispatch Desk', 78, '120/78', 99, 16, 37.6, 'General ER 12', true);
