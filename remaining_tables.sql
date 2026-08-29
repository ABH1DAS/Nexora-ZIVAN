-- ═══════════════════════════════════════════════════════════════════
--  ZIVAN — Remaining Platform Tables Schema & Seed Data
--  Copy and run in: https://supabase.com/dashboard/project/zfudmwskebzdcomwqgpv/sql/new
-- ═══════════════════════════════════════════════════════════════════


-- ─── 1. EMERGENCY CONTACTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    TEXT NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  relationship  TEXT NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'Primary', -- 'Primary' | 'Secondary'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Anyone can manage emergency contacts"
  ON public.emergency_contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 2. PATIENT HEALTH & EMERGENCY PROFILES ────────────────────────
CREATE TABLE IF NOT EXISTS public.health_profiles (
  patient_id      TEXT PRIMARY KEY,
  full_name       TEXT NOT NULL,
  blood_group     TEXT NOT NULL,
  date_of_birth   DATE,
  gender          TEXT,
  allergies       TEXT[],
  medications     TEXT[],
  medical_history TEXT[],
  organ_donor     BOOLEAN DEFAULT false,
  doctor_name     TEXT,
  doctor_phone    TEXT,
  emergency_notes TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read/write health profiles" ON public.health_profiles;
CREATE POLICY "Anyone can read/write health profiles"
  ON public.health_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 3. DAILY HEALTH & VITALS METRICS ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      TEXT NOT NULL,
  metric_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  heart_rate      INT,
  resting_hr      INT,
  spo2            INT,
  steps           INT DEFAULT 0,
  step_goal       INT DEFAULT 10000,
  active_minutes  INT DEFAULT 0,
  calories_burned INT DEFAULT 0,
  sleep_hours     NUMERIC(3,1) DEFAULT 0,
  sleep_score     INT DEFAULT 0,
  water_liters    NUMERIC(3,1) DEFAULT 0,
  water_goal      NUMERIC(3,1) DEFAULT 2.5,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_metric_date UNIQUE (patient_id, metric_date)
);

ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage daily metrics" ON public.daily_metrics;
CREATE POLICY "Anyone can manage daily metrics"
  ON public.daily_metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 4. WATER HYDRATION LOGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.water_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  TEXT NOT NULL,
  amount_ml   INT NOT NULL,
  note        TEXT,
  logged_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage water logs" ON public.water_logs;
CREATE POLICY "Anyone can manage water logs"
  ON public.water_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 5. CONNECTED HEALTH DEVICES / FITNESS BANDS ────────────────────
CREATE TABLE IF NOT EXISTS public.connected_devices (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT NOT NULL,
  name            TEXT NOT NULL,
  brand           TEXT NOT NULL,
  model           TEXT NOT NULL,
  connected       BOOLEAN DEFAULT false,
  battery_percent INT DEFAULT 100,
  last_sync_at    TIMESTAMPTZ DEFAULT NOW(),
  sync_heart_rate BOOLEAN DEFAULT true,
  sync_spo2       BOOLEAN DEFAULT true,
  sync_steps      BOOLEAN DEFAULT true,
  sync_sleep      BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.connected_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage connected devices" ON public.connected_devices;
CREATE POLICY "Anyone can manage connected devices"
  ON public.connected_devices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 6. CHALLENGES & GAMIFICATION ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenges (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL, -- 'Fitness' | 'Habits' | 'Wellbeing'
  total_target  INT NOT NULL,
  unit          TEXT NOT NULL,
  description   TEXT,
  badge_reward  TEXT,
  points_reward INT DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read challenges" ON public.challenges;
CREATE POLICY "Anyone can read challenges"
  ON public.challenges FOR SELECT TO anon, authenticated USING (true);

-- User challenge progress
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    TEXT NOT NULL,
  challenge_id  TEXT REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress      INT DEFAULT 0,
  completed     BOOLEAN DEFAULT false,
  streak_days   INT DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_challenge UNIQUE (patient_id, challenge_id)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage user challenges" ON public.user_challenges;
CREATE POLICY "Anyone can manage user challenges"
  ON public.user_challenges FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 7. REWARDS CATALOG & CLAIMS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rewards (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL, -- 'coupon' | 'discount' | 'badge'
  points_cost     INT NOT NULL,
  description     TEXT,
  discount_code   TEXT,
  partner_name    TEXT,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read rewards" ON public.rewards;
CREATE POLICY "Anyone can read rewards"
  ON public.rewards FOR SELECT TO anon, authenticated USING (true);

-- User claimed rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    TEXT NOT NULL,
  reward_id     TEXT REFERENCES public.rewards(id) ON DELETE CASCADE,
  claimed_at    TIMESTAMPTZ DEFAULT NOW(),
  status        TEXT DEFAULT 'claimed' -- 'claimed' | 'redeemed' | 'expired'
);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage user rewards" ON public.user_rewards;
CREATE POLICY "Anyone can manage user rewards"
  ON public.user_rewards FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- ─── 8. HOSPITAL BLOOD BANK INVENTORY ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.blood_bank_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  blood_group     TEXT NOT NULL,
  units_available INT NOT NULL DEFAULT 0,
  min_threshold   INT DEFAULT 3,
  status          TEXT DEFAULT 'adequate', -- 'critical' | 'low' | 'adequate'
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_hospital_blood_group UNIQUE (hospital_id, blood_group)
);

ALTER TABLE public.blood_bank_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read blood bank inventory" ON public.blood_bank_inventory;
CREATE POLICY "Anyone can read blood bank inventory"
  ON public.blood_bank_inventory FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated can update blood bank inventory" ON public.blood_bank_inventory;
CREATE POLICY "Authenticated can update blood bank inventory"
  ON public.blood_bank_inventory FOR UPDATE TO authenticated USING (true);


-- ═══════════════════════════════════════════════════════════════════
--  REALTIME PUBLICATION FOR REMAINING TABLES
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_metrics;
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_bank_inventory;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


-- ═══════════════════════════════════════════════════════════════════
--  SEED DATA FOR REMAINING TABLES
-- ═══════════════════════════════════════════════════════════════════

-- 1. Seed Emergency Contacts
INSERT INTO public.emergency_contacts
  (patient_id, name, phone, relationship, priority)
VALUES
  ('demo-user', 'Dr. Ananya Sharma', '+91 98765 43210', 'Family Doctor', 'Primary'),
  ('demo-user', 'Rajesh Kumar',      '+91 98123 45678', 'Spouse',        'Primary'),
  ('demo-user', 'Priya Roy',          '+91 97111 22334', 'Sister',        'Secondary');

-- 2. Seed Health Profile
INSERT INTO public.health_profiles
  (patient_id, full_name, blood_group, date_of_birth, gender, allergies, medications, medical_history, organ_donor, doctor_name, doctor_phone, emergency_notes)
VALUES
  ('demo-user', 'Abhijeet Das', 'O+', '1998-05-14', 'Male',
   ARRAY['Penicillin', 'Peanuts'],
   ARRAY['Amlodipine 5mg', 'Vitamin D3'],
   ARRAY['Mild Asthma (childhood)', 'Hypertension Stage 1'],
   true, 'Dr. Ananya Sharma', '+91 98765 43210',
   'Carries inhaler in bag. Keep hydrated during intense cardio.')
ON CONFLICT (patient_id) DO NOTHING;

-- 3. Seed Daily Metrics
INSERT INTO public.daily_metrics
  (patient_id, metric_date, heart_rate, resting_hr, spo2, steps, step_goal, active_minutes, calories_burned, sleep_hours, sleep_score, water_liters, water_goal)
VALUES
  ('demo-user', CURRENT_DATE, 74, 62, 98, 8420, 10000, 48, 2150, 7.5, 88, 2.2, 2.5)
ON CONFLICT (patient_id, metric_date) DO UPDATE SET
  heart_rate = EXCLUDED.heart_rate,
  steps = EXCLUDED.steps,
  water_liters = EXCLUDED.water_liters;

-- 4. Seed Connected Devices
INSERT INTO public.connected_devices
  (id, patient_id, name, brand, model, connected, battery_percent)
VALUES
  ('zivan-pulse-one', 'demo-user', 'ZIVAN Pulse One', 'ZIVAN',   'Pulse One', true,  88),
  ('fitlife-band-x',  'demo-user', 'FitLife Band X',  'FitLife', 'Band X',    false, 65),
  ('aura-watch-s',    'demo-user', 'Aura Watch S',    'Aura',    'Watch S',   false, 92)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Challenges Catalog
INSERT INTO public.challenges
  (id, title, category, total_target, unit, description, badge_reward, points_reward)
VALUES
  ('walk-7',   '7-Day Walking Challenge', 'Fitness',   7, 'days', 'Hit 8,000 steps daily for 7 consecutive days.', 'walk',  250),
  ('hydrate',  'Hydration Streak',        'Habits',    5, 'days', 'Log at least 2.0L of water 5 days in a row.',   'water', 150),
  ('mindful',  'Mindful Mornings',        'Wellbeing', 7, 'days', 'Complete 5-minute breathing exercise daily.',   'habit', 200)
ON CONFLICT (id) DO NOTHING;

-- Seed User Challenge Progress
INSERT INTO public.user_challenges
  (patient_id, challenge_id, progress, completed, streak_days)
VALUES
  ('demo-user', 'walk-7',  6, false, 6),
  ('demo-user', 'hydrate', 4, false, 4),
  ('demo-user', 'mindful', 3, false, 3)
ON CONFLICT (patient_id, challenge_id) DO NOTHING;

-- 6. Seed Rewards Catalog
INSERT INTO public.rewards
  (id, title, category, points_cost, description, discount_code, partner_name)
VALUES
  ('wellness-200',     '₹200 Wellness Coupon',   'coupon',   1500, 'Demo partner offer for wellness products.', 'ZIVAN200', 'Apollo Pharmacy'),
  ('fitness-discount', 'Fitness Store Discount', 'discount', 2000, 'Demo discount for selected fitness partners.', 'FIT30', 'Decathlon'),
  ('premium-badge',    'Premium Wellness Badge', 'badge',     500, 'Unlock a profile badge for consistent habits.', 'BADGE-PRO', 'ZIVAN'),
  ('meditation-pack',  'Guided Meditation Pack', 'coupon',    800, 'Demo content pack for mindful routines.', 'ZEN-PACK', 'Headspace')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Hospital Blood Bank Stock (City Hospital)
INSERT INTO public.blood_bank_inventory
  (hospital_id, blood_group, units_available, min_threshold, status)
VALUES
  ('city-hospital', 'O+',  14, 3, 'adequate'),
  ('city-hospital', 'O-',   4, 3, 'adequate'),
  ('city-hospital', 'A+',  18, 3, 'adequate'),
  ('city-hospital', 'A-',   3, 3, 'low'),
  ('city-hospital', 'B+',  12, 3, 'adequate'),
  ('city-hospital', 'B-',   2, 3, 'critical'),
  ('city-hospital', 'AB+',  8, 3, 'adequate'),
  ('city-hospital', 'AB-',  1, 3, 'critical')
ON CONFLICT (hospital_id, blood_group) DO UPDATE SET
  units_available = EXCLUDED.units_available,
  status = EXCLUDED.status;
