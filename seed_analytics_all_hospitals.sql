-- ═══════════════════════════════════════════════════════════════════════════════
--  ZIVAN HEALTH PLATFORM — BULLETPROOF ANALYTICS MOCK DATA SEED
--  Targets: GMCH, MMCH, Hayat, GNRC, AIIMS Central, City Hospital, Metro Cardiac, LifeCare
--  Run in Supabase SQL Editor: https://supabase.com/dashboard/project/zfudmwskebzdcomwqgpv/sql/new
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 0. AUTO-CREATE TABLES & ENSURE ALL COLUMNS EXIST ─────────────────────────

-- 0.1 Hospitals table & columns
CREATE TABLE IF NOT EXISTS public.hospitals (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  type                TEXT DEFAULT 'hospital',
  distance_km         NUMERIC(5,2) DEFAULT 0,
  address             TEXT,
  phone               TEXT,
  rating              NUMERIC(3,1) DEFAULT 4.5,
  accreditation       TEXT,
  total_beds          INT DEFAULT 0,
  available_beds      INT DEFAULT 0,
  icu_beds            INT DEFAULT 0,
  available_icu_beds  INT DEFAULT 0,
  accepts_emergency   BOOLEAN DEFAULT true,
  open                BOOLEAN DEFAULT true,
  specializations     TEXT[],
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospitals
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 4.5,
  ADD COLUMN IF NOT EXISTS accreditation TEXT,
  ADD COLUMN IF NOT EXISTS specializations TEXT[],
  ADD COLUMN IF NOT EXISTS total_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS icu_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS available_icu_beds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accepts_emergency BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS open BOOLEAN DEFAULT true;

-- 0.2 Ambulances table & columns
CREATE TABLE IF NOT EXISTS public.ambulances (
  id                TEXT PRIMARY KEY,
  hospital_id       TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  vehicle_number    TEXT NOT NULL,
  driver_name       TEXT NOT NULL,
  driver_phone      TEXT,
  type              TEXT DEFAULT 'Advanced Life Support (ALS)',
  status            TEXT DEFAULT 'available',
  call_sign         TEXT,
  current_latitude  DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ambulances
  ADD COLUMN IF NOT EXISTS call_sign TEXT,
  ADD COLUMN IF NOT EXISTS driver_phone TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Advanced Life Support (ALS)',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION;

-- 0.3 Emergencies table & columns
CREATE TABLE IF NOT EXISTS public.emergencies (
  id                      TEXT PRIMARY KEY,
  patient_id              TEXT,
  patient_name            TEXT,
  patient_phone           TEXT,
  blood_group             TEXT,
  allergies               TEXT[],
  medications             TEXT[],
  location_label          TEXT,
  latitude                DOUBLE PRECISION,
  longitude               DOUBLE PRECISION,
  hospital_id             TEXT,
  hospital_name           TEXT,
  status                  TEXT DEFAULT 'searching',
  priority                TEXT DEFAULT 'standard',
  ambulance_type          TEXT DEFAULT 'government',
  doctor_specialization   TEXT DEFAULT 'Emergency & Trauma',
  icu_requirement         BOOLEAN DEFAULT false,
  estimated_private_fare  TEXT,
  ambulance_id            TEXT,
  driver_name             TEXT,
  driver_phone            TEXT,
  vehicle_number          TEXT,
  estimated_arrival_time  INT,
  eta_minutes             INT,
  accepted_by             TEXT,
  allocated_bed           TEXT,
  blood_cross_matched     BOOLEAN DEFAULT false,
  handover_notes          TEXT,
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergencies
  ADD COLUMN IF NOT EXISTS patient_name TEXT,
  ADD COLUMN IF NOT EXISTS patient_phone TEXT,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT[],
  ADD COLUMN IF NOT EXISTS medications TEXT[],
  ADD COLUMN IF NOT EXISTS vitals_hr INT,
  ADD COLUMN IF NOT EXISTS vitals_bp TEXT,
  ADD COLUMN IF NOT EXISTS vitals_spo2 INT,
  ADD COLUMN IF NOT EXISTS vitals_rr INT,
  ADD COLUMN IF NOT EXISTS vitals_temp NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS location_label TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS hospital_id TEXT,
  ADD COLUMN IF NOT EXISTS hospital_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'searching',
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS ambulance_type TEXT DEFAULT 'government',
  ADD COLUMN IF NOT EXISTS doctor_specialization TEXT DEFAULT 'Emergency & Trauma',
  ADD COLUMN IF NOT EXISTS icu_requirement BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS estimated_private_fare TEXT,
  ADD COLUMN IF NOT EXISTS ambulance_id TEXT,
  ADD COLUMN IF NOT EXISTS driver_name TEXT,
  ADD COLUMN IF NOT EXISTS driver_phone TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
  ADD COLUMN IF NOT EXISTS estimated_arrival_time INT,
  ADD COLUMN IF NOT EXISTS eta_minutes INT,
  ADD COLUMN IF NOT EXISTS accepted_by TEXT,
  ADD COLUMN IF NOT EXISTS allocated_bed TEXT,
  ADD COLUMN IF NOT EXISTS blood_cross_matched BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS handover_notes TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 0.4 Blood Bank Inventory table
CREATE TABLE IF NOT EXISTS public.blood_bank_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  blood_group     TEXT NOT NULL,
  units_available INT NOT NULL DEFAULT 0,
  min_threshold   INT DEFAULT 3,
  status          TEXT DEFAULT 'adequate',
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_hospital_blood_group UNIQUE (hospital_id, blood_group)
);

-- 0.5 Hospital Staff table
CREATE TABLE IF NOT EXISTS public.hospital_staff (
  id          TEXT PRIMARY KEY,
  hospital_id TEXT,
  name        TEXT NOT NULL,
  email       TEXT,
  role        TEXT,
  phone       TEXT,
  department  TEXT,
  shift       TEXT,
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hospital_staff
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS shift TEXT;


-- ─── 1. SEED HOSPITALS MASTER DATA ──────────────────────────────────────────
INSERT INTO public.hospitals
  (id, name, type, distance_km, address, open, phone, rating, accreditation,
   total_beds, available_beds, icu_beds, available_icu_beds, accepts_emergency, specializations)
VALUES
  ('govt-gmch', 'Gauhati Medical College & Hospital (GMCH)', 'hospital', 2.1, 'Bhangagarh, Guwahati, Assam 781032', true,
   '+91 361-2529457', 4.7, 'Government Apex Medical Center', 1200, 240, 150, 28, true,
   ARRAY['24/7 Apex Trauma Center', 'Level 1 Emergency', 'ICU & NICU', 'Burn Unit', 'Blood Bank', 'Advanced Stroke Center', 'Cardiology']),

  ('govt-mmch', 'Mahendra Mohan Choudhury Hospital (MMCH)', 'hospital', 3.8, 'Panbazar, Guwahati, Assam 781001', true,
   '+91 361-2543996', 4.5, 'State District General Hospital', 450, 85, 45, 9, true,
   ARRAY['24/7 Emergency Wing', 'Maternal & Neonatal ICU', 'Orthopedic Trauma', 'Blood Bank', 'General Surgery']),

  ('pvt-hayat', 'Hayat Hospital Super Specialty', 'hospital', 4.2, 'Lalmati, NH-37, Guwahati, Assam 781029', true,
   '+91 361-7101111', 4.8, 'NABH & NABL Accredited Super Specialty', 250, 62, 40, 12, true,
   ARRAY['24/7 Rapid Cardiac Resuscitation', 'Neuro Trauma Unit', 'Level 1 ICU', 'Digital Cath Lab', 'Pediatric Emergency']),

  ('pvt-gnrc', 'GNRC Super Specialty Hospital', 'hospital', 5.6, 'Sixmile, Khanapara, Guwahati, Assam 781022', true,
   '+91 1800-345-0011', 4.8, 'NABH Accredited Comprehensive Care', 300, 78, 55, 16, true,
   ARRAY['24/7 Stroke & Neuro Emergency', 'Interventional Cardiology', 'Critical Care Center', 'Advanced Trauma Life Support']),

  ('govt-aiims-central', 'AIIMS Central Super Specialty', 'hospital', 6.8, 'Changsari, Kamrup, Assam 781101', true,
   '+91 361-2912004', 4.9, 'Institute of National Importance', 750, 160, 90, 22, true,
   ARRAY['Comprehensive Emergency', 'Cardiac Resus', 'Transplant Care', 'Advanced ICU', 'Pediatric Trauma']),

  ('city-hospital', 'City Multi-Speciality Hospital', 'hospital', 2.4, '12 Lake Avenue, Guwahati', true,
   '+91 11-2345-6789', 4.6, 'NABH Accredited', 180, 32, 20, 8, true,
   ARRAY['24/7 Emergency', 'Advanced Cardiac Care', 'Trauma Centre', 'Blood Bank', 'Radiology & CT', 'ICU & NICU']),

  ('metro-cardiac-center', 'Metro Heart & Cardiac Care Institute', 'hospital', 3.5, '45 Ring Road, Guwahati', true,
   '+91 11-3456-7891', 4.8, 'NABH Accredited Super-Speciality', 120, 25, 30, 10, true,
   ARRAY['24/7 Emergency', 'Cardiac ICU', 'Cath Lab', 'Coronary Care Unit', 'ECMO Support']),

  ('life-care-trauma', 'LifeCare Emergency & Trauma Centre', 'hospital', 1.8, '78 Highway Junction, Guwahati', true,
   '+91 11-4567-8902', 4.7, 'Level-1 Trauma Centre', 200, 45, 35, 12, true,
   ARRAY['Level-1 Trauma', '24/7 Resuscitation', 'Blood Bank', 'Emergency Surgery', 'Helipad Ready'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  distance_km = EXCLUDED.distance_km,
  address = EXCLUDED.address,
  open = EXCLUDED.open,
  phone = EXCLUDED.phone,
  rating = EXCLUDED.rating,
  total_beds = EXCLUDED.total_beds,
  available_beds = EXCLUDED.available_beds,
  icu_beds = EXCLUDED.icu_beds,
  available_icu_beds = EXCLUDED.available_icu_beds,
  accepts_emergency = EXCLUDED.accepts_emergency,
  specializations = EXCLUDED.specializations;


-- ─── 2. SEED ACTIVE AMBULANCE FLEETS FOR ALL HOSPITALS ───────────────────────
INSERT INTO public.ambulances
  (id, hospital_id, vehicle_number, driver_name, driver_phone, type, status, current_latitude, current_longitude, created_at)
VALUES
  -- GMCH Fleet
  ('amb-gmch-01', 'govt-gmch', 'AS-01-GC-1081', 'Pranjal Barman', '+91 98640 12001', 'Advanced Life Support (ALS)', 'available', 26.1585, 91.7745, NOW() - INTERVAL '10 days'),
  ('amb-gmch-02', 'govt-gmch', 'AS-01-GC-1082', 'Dipankar Sarma', '+91 98640 12002', 'Basic Life Support (BLS)', 'available', 26.1592, 91.7760, NOW() - INTERVAL '10 days'),
  ('amb-gmch-03', 'govt-gmch', 'AS-01-GC-1083', 'Ramen Das', '+91 98640 12003', 'Cardiac Mobile ICU', 'busy', 26.1620, 91.7680, NOW() - INTERVAL '10 days'),
  ('amb-gmch-04', 'govt-gmch', 'AS-01-GC-1084', 'Bikash Kalita', '+91 98640 12004', 'Advanced Trauma Response', 'available', 26.1550, 91.7790, NOW() - INTERVAL '10 days'),

  -- MMCH Fleet
  ('amb-mmch-01', 'govt-mmch', 'AS-01-MC-2001', 'Kamal Nath', '+91 98641 22001', 'Basic Life Support (BLS)', 'available', 26.1840, 91.7450, NOW() - INTERVAL '10 days'),
  ('amb-mmch-02', 'govt-mmch', 'AS-01-MC-2002', 'Nitul Boro', '+91 98641 22002', 'Advanced Life Support (ALS)', 'available', 26.1830, 91.7420, NOW() - INTERVAL '10 days'),
  ('amb-mmch-03', 'govt-mmch', 'AS-01-MC-2003', 'Hemanta Medhi', '+91 98641 22003', 'Neonatal Transport Unit', 'available', 26.1855, 91.7480, NOW() - INTERVAL '10 days'),

  -- Hayat Hospital Fleet
  ('amb-hayat-01', 'pvt-hayat', 'AS-01-HY-3001', 'Bhaskar Saikia', '+91 98642 33001', 'Cardiac ICU Mobile', 'available', 26.1280, 91.8020, NOW() - INTERVAL '10 days'),
  ('amb-hayat-02', 'pvt-hayat', 'AS-01-HY-3002', 'Mukesh Goswami', '+91 98642 33002', 'Advanced Life Support (ALS)', 'busy', 26.1310, 91.7980, NOW() - INTERVAL '10 days'),
  ('amb-hayat-03', 'pvt-hayat', 'AS-01-HY-3003', 'Subhash Chaliha', '+91 98642 33003', 'Rapid Critical Response', 'available', 26.1260, 91.8050, NOW() - INTERVAL '10 days'),

  -- GNRC Fleet
  ('amb-gnrc-01', 'pvt-gnrc', 'AS-01-GN-4001', 'Raju Talukdar', '+91 98643 44001', 'Advanced Stroke Unit', 'available', 26.1220, 91.8150, NOW() - INTERVAL '10 days'),
  ('amb-gnrc-02', 'pvt-gnrc', 'AS-01-GN-4002', 'Dhiraj Deka', '+91 98643 44002', 'Advanced Life Support (ALS)', 'available', 26.1245, 91.8180, NOW() - INTERVAL '10 days'),
  ('amb-gnrc-03', 'pvt-gnrc', 'AS-01-GN-4003', 'Parag Lahkar', '+91 98643 44003', 'Cardiac Mobile ICU', 'busy', 26.1190, 91.8100, NOW() - INTERVAL '10 days'),

  -- AIIMS Central Fleet
  ('amb-aiims-01', 'govt-aiims-central', 'AS-01-AI-5001', 'Sanjoy Mahanta', '+91 98644 55001', 'Advanced Life Support (ALS)', 'available', 26.2480, 91.7100, NOW() - INTERVAL '10 days'),
  ('amb-aiims-02', 'govt-aiims-central', 'AS-01-AI-5002', 'Utpal Dutta', '+91 98644 55002', 'Level 1 Trauma Mobile', 'available', 26.2500, 91.7120, NOW() - INTERVAL '10 days'),

  -- City Hospital Fleet
  ('amb-city-01', 'city-hospital', 'AS-01-CH-6001', 'Gaurav Bora', '+91 98645 66001', 'Advanced Life Support (ALS)', 'available', 26.1600, 91.7500, NOW() - INTERVAL '10 days'),
  ('amb-city-02', 'city-hospital', 'AS-01-CH-6002', 'Robin Roy', '+91 98645 66002', 'Basic Life Support (BLS)', 'available', 26.1620, 91.7530, NOW() - INTERVAL '10 days'),

  -- Metro Cardiac Fleet
  ('amb-metro-01', 'metro-cardiac-center', 'AS-01-MC-7001', 'Anand Chetri', '+91 98646 77001', 'Cardiac ICU Mobile', 'available', 26.1450, 91.7800, NOW() - INTERVAL '10 days'),

  -- LifeCare Trauma Fleet
  ('amb-lifecare-01', 'life-care-trauma', 'AS-01-LC-8001', 'Pankaj Tamuly', '+91 98647 88001', 'Level-1 Trauma Mobile', 'available', 26.1700, 91.7650, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  driver_name = EXCLUDED.driver_name,
  driver_phone = EXCLUDED.driver_phone,
  type = EXCLUDED.type,
  current_latitude = EXCLUDED.current_latitude,
  current_longitude = EXCLUDED.current_longitude;


-- ─── 3. SEED BLOOD BANK INVENTORY FOR ALL HOSPITALS ─────────────────────────
INSERT INTO public.blood_bank_inventory
  (hospital_id, blood_group, units_available, min_threshold, status, last_updated)
VALUES
  -- GMCH Blood Bank
  ('govt-gmch', 'A+', 24, 5, 'adequate', NOW()),
  ('govt-gmch', 'A-', 8,  3, 'adequate', NOW()),
  ('govt-gmch', 'B+', 32, 5, 'adequate', NOW()),
  ('govt-gmch', 'B-', 6,  3, 'adequate', NOW()),
  ('govt-gmch', 'O+', 45, 8, 'adequate', NOW()),
  ('govt-gmch', 'O-', 4,  3, 'low',      NOW()),
  ('govt-gmch', 'AB+', 14, 3, 'adequate', NOW()),
  ('govt-gmch', 'AB-', 2, 2, 'critical', NOW()),

  -- MMCH Blood Bank
  ('govt-mmch', 'A+', 12, 4, 'adequate', NOW()),
  ('govt-mmch', 'A-', 3,  2, 'adequate', NOW()),
  ('govt-mmch', 'B+', 18, 4, 'adequate', NOW()),
  ('govt-mmch', 'B-', 2,  2, 'critical', NOW()),
  ('govt-mmch', 'O+', 22, 5, 'adequate', NOW()),
  ('govt-mmch', 'O-', 3,  2, 'low',      NOW()),
  ('govt-mmch', 'AB+', 8, 2, 'adequate', NOW()),
  ('govt-mmch', 'AB-', 1, 2, 'critical', NOW()),

  -- Hayat Blood Bank
  ('pvt-hayat', 'A+', 15, 3, 'adequate', NOW()),
  ('pvt-hayat', 'A-', 5,  2, 'adequate', NOW()),
  ('pvt-hayat', 'B+', 20, 3, 'adequate', NOW()),
  ('pvt-hayat', 'B-', 4,  2, 'adequate', NOW()),
  ('pvt-hayat', 'O+', 28, 4, 'adequate', NOW()),
  ('pvt-hayat', 'O-', 5,  2, 'adequate', NOW()),
  ('pvt-hayat', 'AB+', 10, 2, 'adequate', NOW()),
  ('pvt-hayat', 'AB-', 3, 2, 'adequate', NOW()),

  -- GNRC Blood Bank
  ('pvt-gnrc', 'A+', 16, 3, 'adequate', NOW()),
  ('pvt-gnrc', 'A-', 4,  2, 'adequate', NOW()),
  ('pvt-gnrc', 'B+', 22, 3, 'adequate', NOW()),
  ('pvt-gnrc', 'B-', 5,  2, 'adequate', NOW()),
  ('pvt-gnrc', 'O+', 30, 4, 'adequate', NOW()),
  ('pvt-gnrc', 'O-', 6,  2, 'adequate', NOW()),
  ('pvt-gnrc', 'AB+', 9, 2, 'adequate', NOW()),
  ('pvt-gnrc', 'AB-', 2, 2, 'low',      NOW()),

  -- AIIMS Blood Bank
  ('govt-aiims-central', 'A+', 20, 4, 'adequate', NOW()),
  ('govt-aiims-central', 'A-', 6,  2, 'adequate', NOW()),
  ('govt-aiims-central', 'B+', 25, 4, 'adequate', NOW()),
  ('govt-aiims-central', 'B-', 5,  2, 'adequate', NOW()),
  ('govt-aiims-central', 'O+', 35, 5, 'adequate', NOW()),
  ('govt-aiims-central', 'O-', 7,  3, 'adequate', NOW()),
  ('govt-aiims-central', 'AB+', 12, 2, 'adequate', NOW()),
  ('govt-aiims-central', 'AB-', 3, 2, 'adequate', NOW())
ON CONFLICT (hospital_id, blood_group) DO UPDATE SET
  units_available = EXCLUDED.units_available,
  status = EXCLUDED.status,
  last_updated = EXCLUDED.last_updated;


-- ─── 4. SEED HISTORICAL & LIVE DISPATCH EMERGENCIES FOR ALL HOSPITALS ─────────
DELETE FROM public.emergencies WHERE id LIKE 'mock-emg-%';

INSERT INTO public.emergencies
  (id, patient_id, patient_name, patient_phone, blood_group, allergies, medications,
   location_label, latitude, longitude, hospital_id, hospital_name, status, priority,
   ambulance_type, doctor_specialization, icu_requirement, estimated_private_fare,
   ambulance_id, driver_name, driver_phone, vehicle_number, estimated_arrival_time, eta_minutes,
   accepted_by, allocated_bed, blood_cross_matched, handover_notes, notes, created_at, updated_at)
VALUES
  -- ─── GMCH Cases (10 Cases across past 7 days) ───
  ('mock-emg-gmch-01', 'pat-01', 'Rahul Sharma', '+91 98765 11001', 'O+', ARRAY['Penicillin'], ARRAY['Amlodipine 5mg'],
   'Ulubari Flyover Junction, Guwahati', 26.1690, 91.7610, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'arrived', 'critical', 'government', 'Apex Trauma Center', true, '₹0 (Govt Free)',
   'amb-gmch-01', 'Pranjal Barman', '+91 98640 12001', 'AS-01-GC-1081', 12, 0,
   'Dr. Bikram Goswami (ER Lead)', 'Trauma Bay Red-01', true, 'Poly-trauma victim stabilized. Oxygen saturation recovered to 96%.', 'Severe vehicular collision. Chest trauma suspected.', NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 3 hours'),

  ('mock-emg-gmch-02', 'pat-02', 'Anjali Devi', '+91 98765 11002', 'B+', ARRAY['Sulfa drugs'], ARRAY['Thyronorm 50mcg'],
   'Ganeshguri Super Market, Guwahati', 26.1510, 91.7820, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'arrived', 'urgent', 'government', 'Cardiology & Emergency', false, '₹0 (Govt Free)',
   'amb-gmch-02', 'Dipankar Sarma', '+91 98640 12002', 'AS-01-GC-1082', 15, 0,
   'Dr. Manash Kalita', 'Acute Care Bed-04', true, 'ECG confirmed non-STEMI. IV Line active.', 'Acute substernal chest discomfort radiating to jaw.', NOW() - INTERVAL '5 days 8 hours', NOW() - INTERVAL '5 days 7 hours'),

  ('mock-emg-gmch-03', 'pat-03', 'Bhaben Medhi', '+91 98765 11003', 'A+', ARRAY[]::TEXT[], ARRAY['Metformin 500mg'],
   'Beltola Bazaar, Guwahati', 26.1350, 91.7910, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'arrived', 'standard', 'government', 'General Medicine', false, '₹0 (Govt Free)',
   'amb-gmch-01', 'Pranjal Barman', '+91 98640 12001', 'AS-01-GC-1081', 18, 0,
   'Dr. Hitesh Nath', 'General Ward Bed-12', false, 'Vitals stable. IV fluids running.', 'Diabetic hypoglycemia episode.', NOW() - INTERVAL '4 days 12 hours', NOW() - INTERVAL '4 days 11 hours'),

  ('mock-emg-gmch-04', 'pat-04', 'Sunita Bora', '+91 98765 11004', 'AB+', ARRAY['Aspirin'], ARRAY[]::TEXT[],
   'Zoo Road Tiniali, Guwahati', 26.1660, 91.7770, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'arrived', 'critical', 'government', 'Apex Trauma Center', true, '₹0 (Govt Free)',
   'amb-gmch-04', 'Bikash Kalita', '+91 98640 12004', 'AS-01-GC-1084', 10, 0,
   'Dr. Bikram Goswami (ER Lead)', 'ICU Trauma Bed-02', true, 'Emergency intubation done in transit.', 'Fall from 2nd floor balcony.', NOW() - INTERVAL '3 days 6 hours', NOW() - INTERVAL '3 days 5 hours'),

  ('mock-emg-gmch-05', 'pat-05', 'Nayan Jyoti Kalita', '+91 98765 11005', 'O-', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
   'Chandmari Colony, Guwahati', 26.1850, 91.7750, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'arrived', 'urgent', 'government', 'Neurology Stroke Wing', false, '₹0 (Govt Free)',
   'amb-gmch-02', 'Dipankar Sarma', '+91 98640 12002', 'AS-01-GC-1082', 14, 0,
   'Dr. P. Barooah', 'Stroke Care Unit 03', false, 'CT Brain scheduled.', 'Sudden left-sided hemiparesis and speech slurring.', NOW() - INTERVAL '2 days 10 hours', NOW() - INTERVAL '2 days 9 hours'),

  ('mock-emg-gmch-06', 'pat-06', 'Kabita Das', '+91 98765 11006', 'A-', ARRAY['Ibuprofen'], ARRAY['Paracetamol'],
   'Paltan Bazaar, Guwahati', 26.1780, 91.7530, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'arrived', 'critical', 'government', 'Burn & Plastic Unit', true, '₹0 (Govt Free)',
   'amb-gmch-01', 'Pranjal Barman', '+91 98640 12001', 'AS-01-GC-1081', 11, 0,
   'Dr. R. Goswami', 'Burn ICU Bed-01', true, '35% superficial partial burns.', 'LPG flash burn in residential kitchen.', NOW() - INTERVAL '1 day 14 hours', NOW() - INTERVAL '1 day 13 hours'),

  ('mock-emg-gmch-07', 'pat-07', 'Manoj Singha', '+91 98765 11007', 'B-', ARRAY[]::TEXT[], ARRAY['Atorvastatin 20mg'],
   'Christian Basti, GS Road', 26.1550, 91.7720, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'en_route', 'critical', 'government', 'Apex Trauma Center', true, '₹0 (Govt Free)',
   'amb-gmch-03', 'Ramen Das', '+91 98640 12003', 'AS-01-GC-1083', 8, 4,
   'Dr. Bikram Goswami (ER Lead)', 'Resus Bay 02', true, 'Ambulance 4 mins away.', 'Motorcycle skidded on wet road. Head injury.', NOW() - INTERVAL '25 mins', NOW() - INTERVAL '5 mins'),

  ('mock-emg-gmch-08', 'pat-08', 'Gitanjali Phukan', '+91 98765 11008', 'O+', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
   'Rukminigaon, Dispur', 26.1430, 91.7960, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'accepted', 'urgent', 'government', 'Maternal Emergency', false, '₹0 (Govt Free)',
   'amb-gmch-04', 'Bikash Kalita', '+91 98640 12004', 'AS-01-GC-1084', 12, 9,
   'Dr. S. Kakati', 'Labor Suite Bed-01', false, 'Crew dispatched and en route to patient.', 'Pre-term active labor pain.', NOW() - INTERVAL '12 mins', NOW() - INTERVAL '2 mins'),

  ('mock-emg-gmch-09', 'pat-09', 'Chandan Baruah', '+91 98765 11009', 'A+', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
   'Sixmile Flyover, Guwahati', 26.1310, 91.8080, 'govt-gmch', 'Gauhati Medical College & Hospital (GMCH)',
   'declined', 'standard', 'government', 'General Medicine', false, '₹0 (Govt Free)',
   NULL, NULL, NULL, NULL, NULL, NULL,
   'Dispatch Automated', NULL, false, 'Patient requested private hospital instead.', 'Mild ankle sprain.', NOW() - INTERVAL '3 days 18 hours', NOW() - INTERVAL '3 days 17 hours'),

  -- ─── MMCH Cases (5 Cases) ───
  ('mock-emg-mmch-01', 'pat-10', 'Dhruba Jyoti Nath', '+91 98765 22001', 'B+', ARRAY[]::TEXT[], ARRAY['Telmisartan 40mg'],
   'Fancy Bazaar Riverside, Guwahati', 26.1880, 91.7390, 'govt-mmch', 'Mahendra Mohan Choudhury Hospital (MMCH)',
   'arrived', 'critical', 'government', '24/7 Emergency Wing', true, '₹0 (Govt Free)',
   'amb-mmch-02', 'Nitul Boro', '+91 98641 22002', 'AS-01-MC-2002', 9, 0,
   'Dr. Pranab Sarma', 'ICU Red Bay-01', true, 'Cardiac arrest resuscitated on field.', 'Collapsed suddenly while walking.', NOW() - INTERVAL '6 days 11 hours', NOW() - INTERVAL '6 days 10 hours'),

  ('mock-emg-mmch-02', 'pat-11', 'Rekha Begum', '+91 98765 22002', 'O+', ARRAY['Penicillin'], ARRAY[]::TEXT[],
   'Machkhowa Bus Terminus', 26.1820, 91.7340, 'govt-mmch', 'Mahendra Mohan Choudhury Hospital (MMCH)',
   'arrived', 'urgent', 'government', 'General Surgery Trauma', false, '₹0 (Govt Free)',
   'amb-mmch-01', 'Kamal Nath', '+91 98641 22001', 'AS-01-MC-2001', 11, 0,
   'Dr. B. Das', 'Surgical Ward Bed-06', false, 'Appendiceal rupture suspected.', 'Severe acute RLQ abdominal pain with fever.', NOW() - INTERVAL '5 days 4 hours', NOW() - INTERVAL '5 days 3 hours'),

  ('mock-emg-mmch-03', 'pat-12', 'Ashok Singhal', '+91 98765 22003', 'A+', ARRAY[]::TEXT[], ARRAY['Insulin Regular'],
   'Bharalumukh, Guwahati', 26.1750, 91.7280, 'govt-mmch', 'Mahendra Mohan Choudhury Hospital (MMCH)',
   'arrived', 'standard', 'government', 'General Medicine', false, '₹0 (Govt Free)',
   'amb-mmch-01', 'Kamal Nath', '+91 98641 22001', 'AS-01-MC-2001', 14, 0,
   'Dr. J. Goswami', 'Observation Ward Bed-02', false, 'Ketones negative. IV dextrose given.', 'High blood glucose 380 mg/dL with dehydration.', NOW() - INTERVAL '3 days 16 hours', NOW() - INTERVAL '3 days 15 hours'),

  ('mock-emg-mmch-04', 'pat-13', 'Parveen Sultana', '+91 98765 22004', 'AB-', ARRAY['Codeine'], ARRAY[]::TEXT[],
   'Kumarpara, Guwahati', 26.1710, 91.7360, 'govt-mmch', 'Mahendra Mohan Choudhury Hospital (MMCH)',
   'arrived', 'critical', 'government', 'Maternal & Neonatal ICU', true, '₹0 (Govt Free)',
   'amb-mmch-03', 'Hemanta Medhi', '+91 98641 22003', 'AS-01-MC-2003', 10, 0,
   'Dr. S. Akhtar', 'NICU Resus Bay', true, 'Pre-eclampsia with severe hypertension.', 'BP 185/115 mmHg. Active seizures controlled.', NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 1 hour'),

  ('mock-emg-mmch-05', 'pat-14', 'Bishal Chutia', '+91 98765 22005', 'O+', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
   'Athgaon Kabarstan Road', 26.1790, 91.7420, 'govt-mmch', 'Mahendra Mohan Choudhury Hospital (MMCH)',
   'accepted', 'urgent', 'government', '24/7 Emergency Wing', false, '₹0 (Govt Free)',
   'amb-mmch-01', 'Kamal Nath', '+91 98641 22001', 'AS-01-MC-2001', 8, 6,
   'Dr. Pranab Sarma', 'Triage Bed-03', false, 'Unit dispatched to scene.', 'Deep forearm laceration with arterial bleed.', NOW() - INTERVAL '18 mins', NOW() - INTERVAL '3 mins'),

  -- ─── Hayat Super Specialty Cases (5 Cases) ───
  ('mock-emg-hayat-01', 'pat-15', 'Vikramaditya Agarwal', '+91 98765 33001', 'B+', ARRAY['NSAIDs'], ARRAY['Rosuvastatin 10mg'],
   'Beltola Tiniali, Guwahati', 26.1360, 91.7950, 'pvt-hayat', 'Hayat Hospital Super Specialty',
   'arrived', 'critical', 'private', 'Rapid Cardiac Resuscitation', true, '₹1,500 (Covered by TPA)',
   'amb-hayat-01', 'Bhaskar Saikia', '+91 98642 33001', 'AS-01-HY-3001', 8, 0,
   'Dr. Sanjeeb Kakati (Senior Interventional Cardiologist)', 'Cath Lab Suite-01', true, 'Primary PCI performed. LAD Stented.', 'Acute anterior wall STEMI.', NOW() - INTERVAL '6 days 18 hours', NOW() - INTERVAL '6 days 17 hours'),

  ('mock-emg-hayat-02', 'pat-16', 'Sunil Kothari', '+91 98765 33002', 'O+', ARRAY[]::TEXT[], ARRAY['Telma AM'],
   'Lokhra Chariali, NH-37', 26.1150, 91.7650, 'pvt-hayat', 'Hayat Hospital Super Specialty',
   'arrived', 'critical', 'private', 'Neuro Trauma Unit', true, '₹2,200',
   'amb-hayat-02', 'Mukesh Goswami', '+91 98642 33002', 'AS-01-HY-3002', 12, 0,
   'Dr. Anupam Sarma (Neuro Surgeon)', 'Neuro ICU Bed-04', true, 'Craniotomy done. ICP monitoring on.', 'High-velocity highway accident.', NOW() - INTERVAL '4 days 21 hours', NOW() - INTERVAL '4 days 20 hours'),

  ('mock-emg-hayat-03', 'pat-17', 'Neelam Jain', '+91 98765 33003', 'A+', ARRAY['Penicillin'], ARRAY['Levothyroxine'],
   'Jayanagar, Beltola', 26.1390, 91.8010, 'pvt-hayat', 'Hayat Hospital Super Specialty',
   'arrived', 'urgent', 'private', 'Level 1 ICU', false, '₹1,200',
   'amb-hayat-03', 'Subhash Chaliha', '+91 98642 33003', 'AS-01-HY-3003', 9, 0,
   'Dr. R. Choudhury', 'HDU Bed-06', false, 'High flow nasal cannula initiated.', 'Acute COPD exacerbation with respiratory distress.', NOW() - INTERVAL '3 days 14 hours', NOW() - INTERVAL '3 days 13 hours'),

  ('mock-emg-hayat-04', 'pat-18', 'Gaurav Jhunjhunwala', '+91 98765 33004', 'AB+', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
   'Khanapara Farm Gate', 26.1260, 91.8120, 'pvt-hayat', 'Hayat Hospital Super Specialty',
   'arrived', 'standard', 'private', 'Pediatric Emergency', false, '₹800',
   'amb-hayat-01', 'Bhaskar Saikia', '+91 98642 33001', 'AS-01-HY-3001', 7, 0,
   'Dr. M. Bezbaruah', 'Pediatric Day Care 02', false, 'Nebulization given. SpO2 99%.', 'Pediatric acute asthma attack.', NOW() - INTERVAL '2 days 8 hours', NOW() - INTERVAL '2 days 7 hours'),

  ('mock-emg-hayat-05', 'pat-19', 'Tanveer Ahmed', '+91 98765 33005', 'O-', ARRAY['Sulfa'], ARRAY['Clopidogrel 75mg'],
   'Basistha Chariali, Guwahati', 26.1180, 91.8020, 'pvt-hayat', 'Hayat Hospital Super Specialty',
   'en_route', 'critical', 'private', 'Rapid Cardiac Resuscitation', true, '₹1,500',
   'amb-hayat-02', 'Mukesh Goswami', '+91 98642 33002', 'AS-01-HY-3002', 6, 3,
   'Dr. Sanjeeb Kakati (Senior Interventional Cardiologist)', 'Cath Lab Suite-01', true, 'Telemetry transmitting real-time ECG.', 'Severe crushing retrosternal pain.', NOW() - INTERVAL '15 mins', NOW() - INTERVAL '3 mins'),

  -- ─── GNRC Sixmile Cases (4 Cases) ───
  ('mock-emg-gnrc-01', 'pat-20', 'Bhupen Hazarika Roy', '+91 98765 44001', 'O+', ARRAY[]::TEXT[], ARRAY['Ecosprin 75mg'],
   'Downtown Hospital Road, Dispur', 26.1400, 91.7990, 'pvt-gnrc', 'GNRC Super Specialty Hospital',
   'arrived', 'critical', 'private', 'Stroke & Neuro Emergency', true, '₹1,800',
   'amb-gnrc-01', 'Raju Talukdar', '+91 98643 44001', 'AS-01-GN-4001', 8, 0,
   'Dr. N. C. Borah (Chief Neurologist)', 'Hyperacute Stroke Unit', true, 'IV Thrombolysis (r-tPA) administered within window.', 'Right MCA ischemic stroke within 2 hrs of onset.', NOW() - INTERVAL '5 days 14 hours', NOW() - INTERVAL '5 days 13 hours'),

  ('mock-emg-gnrc-02', 'pat-21', 'Anamika Bhattacharya', '+91 98765 44002', 'A-', ARRAY['Metronidazole'], ARRAY[]::TEXT[],
   'Hengerabari Housing, Dispur', 26.1520, 91.8040, 'pvt-gnrc', 'GNRC Super Specialty Hospital',
   'arrived', 'critical', 'private', 'Interventional Cardiology', true, '₹2,000',
   'amb-gnrc-02', 'Dhiraj Deka', '+91 98643 44002', 'AS-01-GN-4002', 10, 0,
   'Dr. B. K. Bhattacharya', 'CCU Bed-03', true, 'Temporary pacemaker inserted.', 'Complete Heart Block with bradycardia (HR 32 bpm).', NOW() - INTERVAL '4 days 19 hours', NOW() - INTERVAL '4 days 18 hours'),

  ('mock-emg-gnrc-03', 'pat-22', 'Hemjit Barman', '+91 98765 44003', 'B+', ARRAY[]::TEXT[], ARRAY[]::TEXT[],
   'Panjabari VIP Road', 26.1280, 91.8280, 'pvt-gnrc', 'GNRC Super Specialty Hospital',
   'arrived', 'urgent', 'private', 'Advanced Trauma Life Support', false, '₹1,100',
   'amb-gnrc-01', 'Raju Talukdar', '+91 98643 44001', 'AS-01-GN-4001', 11, 0,
   'Dr. P. Chetia', 'Orthopedic Resus Bed-02', false, 'Compound femur fracture splinted.', 'Two-wheeler crash.', NOW() - INTERVAL '3 days 10 hours', NOW() - INTERVAL '3 days 9 hours'),

  ('mock-emg-gnrc-04', 'pat-23', 'Pallavi Goswami', '+91 98765 44004', 'AB+', ARRAY['Penicillin'], ARRAY['Thyronorm'],
   'Survey, Beltola', 26.1380, 91.7880, 'pvt-gnrc', 'GNRC Super Specialty Hospital',
   'en_route', 'critical', 'private', 'Stroke & Neuro Emergency', true, '₹1,800',
   'amb-gnrc-03', 'Parag Lahkar', '+91 98643 44003', 'AS-01-GN-4003', 7, 3,
   'Dr. N. C. Borah (Chief Neurologist)', 'Stroke Resus Bay 01', true, 'CT room alerted for immediate scan on arrival.', 'Acute loss of consciousness.', NOW() - INTERVAL '20 mins', NOW() - INTERVAL '4 mins')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  allocated_bed = EXCLUDED.allocated_bed;


-- ─── 5. SEED HOSPITAL STAFF ──────────────────────────────────────────────────
INSERT INTO public.hospital_staff
  (id, hospital_id, name, email, role, phone, department, shift, status)
VALUES
  ('staff-gmch-01', 'govt-gmch', 'Dr. Bikram Goswami', 'dispatch@gmch.demo', 'doctor', '+91 98640 99001', 'Apex Trauma Center', 'Day / Emergency', 'active'),
  ('staff-gmch-02', 'govt-gmch', 'Ramen Das (Dispatch Lead)', 'dispatch2@gmch.demo', 'dispatcher', '+91 98640 99002', 'Central EMS Dispatch', 'Night', 'active'),
  ('staff-mmch-01', 'govt-mmch', 'Dr. Pranab Sarma', 'dispatch@mmch.demo', 'doctor', '+91 98641 99001', '24/7 Emergency Wing', 'Day', 'active'),
  ('staff-hayat-01', 'pvt-hayat', 'Dr. Sanjeeb Kakati', 'dispatch@hayat.demo', 'doctor', '+91 98642 99001', 'Cardiac Critical Care', 'Rotational', 'active'),
  ('staff-gnrc-01', 'pvt-gnrc', 'Dr. N. C. Borah', 'dispatch@gnrc.demo', 'doctor', '+91 98643 99001', 'Stroke & Neuro Center', 'Day / On Call', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  status = EXCLUDED.status;
