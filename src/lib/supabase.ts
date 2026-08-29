import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Config with Verified Production Fallback ──────────────────────────────────
const DEFAULT_SUPABASE_URL = "https://zfudmwskebzdcomwqgpv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdWRtd3NrZWJ6ZGNvbXdxZ3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODc0MjQsImV4cCI6MjEwMzU2MzQyNH0.rPKe7S0iv6nKwtEW3PA25KXm5nHTNuh24zjrhIb7v4U";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SupabaseHospital {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy";
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  total_beds: number;
  available_beds: number;
  icu_beds: number;
  available_icu_beds: number;
  accepts_emergency: boolean;
  open: boolean;
  specializations?: string[];
  created_at: string;
  updated_at?: string;
}

export interface SupabaseAmbulance {
  id: string;
  hospital_id: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone?: string;
  type: string;
  status: string;
  current_latitude?: number;
  current_longitude?: number;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseEmergencyRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  blood_group?: string;
  allergies?: string[];
  medications?: string[];
  location_label: string;
  latitude: number;
  longitude: number;
  hospital_id: string;
  hospital_name: string;
  status: string;
  priority: string;
  ambulance_type: string;
  doctor_specialization: string;
  icu_requirement?: boolean;
  estimated_private_fare?: string;
  ambulance_id?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  estimated_arrival_time?: number;
  eta_minutes?: number;
  accepted_by?: string;
  allocated_bed?: string;
  blood_cross_matched?: boolean;
  handover_notes?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseHospitalStaff {
  id: string;
  hospital_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  department?: string;
  shift?: string;
  created_at: string;
}

export interface SupabaseHealthProfile {
  patient_id: string;
  full_name: string;
  blood_group: string;
  date_of_birth?: string;
  gender?: string;
  allergies: string[];
  medications: string[];
  medical_history: string[];
  organ_donor: boolean;
  doctor_name?: string;
  doctor_phone?: string;
  emergency_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseEmergencyContact {
  id?: string;
  patient_id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: "Primary" | "Secondary";
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseDailyMetrics {
  id?: string;
  patient_id: string;
  metric_date: string;
  heart_rate: number;
  resting_hr?: number;
  spo2: number;
  steps: number;
  step_goal: number;
  active_minutes: number;
  calories_burned: number;
  sleep_hours: number;
  sleep_score: number;
  water_liters: number;
  water_goal: number;
  created_at?: string;
}

export interface SupabaseWaterLog {
  id?: string;
  patient_id: string;
  amount_ml: number;
  note?: string;
  logged_at: string;
}

export interface SupabaseConnectedDevice {
  id: string;
  patient_id: string;
  name: string;
  brand: string;
  model: string;
  connected: boolean;
  battery_percent: number;
  last_sync_at?: string;
  sync_heart_rate?: boolean;
  sync_spo2?: boolean;
  sync_steps?: boolean;
  sync_sleep?: boolean;
  created_at?: string;
}

export interface SupabaseChallenge {
  id: string;
  title: string;
  category: string;
  total_target: number;
  unit: string;
  description?: string;
  badge_reward?: string;
  points_reward?: number;
  created_at?: string;
}

export interface SupabaseUserChallenge {
  id?: string;
  patient_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  streak_days: number;
  updated_at?: string;
}

export interface SupabaseReward {
  id: string;
  title: string;
  category: string;
  points_cost: number;
  description?: string;
  discount_code?: string;
  partner_name?: string;
  active?: boolean;
  created_at?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOSPITALS & AMBULANCES
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchHospitals(): Promise<SupabaseHospital[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .order("distance_km", { ascending: true });
  if (error) { console.warn("fetchHospitals:", error.message); return []; }
  return (data as SupabaseHospital[]) ?? [];
}

export async function fetchHospitalById(
  id: string
): Promise<SupabaseHospital | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as SupabaseHospital;
}

export async function updateHospitalBeds(
  id: string,
  patch: { available_beds?: number; available_icu_beds?: number }
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("hospitals").update(patch).eq("id", id);
  return !error;
}

export async function fetchAmbulancesByHospital(
  hospitalId: string
): Promise<SupabaseAmbulance[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ambulances")
    .select("*")
    .eq("hospital_id", hospitalId)
    .order("id");
  if (error) return [];
  return (data as SupabaseAmbulance[]) ?? [];
}

export async function fetchAvailableAmbulances(
  hospitalId: string
): Promise<SupabaseAmbulance[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ambulances")
    .select("*")
    .eq("hospital_id", hospitalId)
    .eq("status", "available");
  if (error) return [];
  return (data as SupabaseAmbulance[]) ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EMERGENCIES (SOS)
// ═══════════════════════════════════════════════════════════════════════════════

export async function insertSupabaseEmergency(
  record: Partial<SupabaseEmergencyRecord>
): Promise<SupabaseEmergencyRecord | null> {
  if (!supabase) return null;
  try {
    const payload: Record<string, any> = {
      patient_id: record.patient_id || "demo-user",
      patient_name: record.patient_name || "Emergency Patient",
      patient_phone: record.patient_phone || "+91 98765 43210",
      location_label: record.location_label || "Live Location",
      latitude: record.latitude || 28.6139,
      longitude: record.longitude || 77.2090,
      hospital_id: record.hospital_id || "city-hospital",
      hospital_name: record.hospital_name || "City Hospital",
      status: record.status || "PENDING",
      priority: record.priority || "critical",
      ambulance_type: record.ambulance_type || "government",
      doctor_specialization: record.doctor_specialization || "Emergency Medicine",
      notes: record.notes || "SOS Emergency Dispatch",
    };

    if (record.ambulance_id) payload.ambulance_id = record.ambulance_id;
    if (record.driver_name) payload.driver_name = record.driver_name;
    if (record.vehicle_number) payload.vehicle_number = record.vehicle_number;
    if (record.eta_minutes !== undefined) payload.eta_minutes = record.eta_minutes;
    if (record.accepted_by) payload.accepted_by = record.accepted_by;
    if (record.icu_requirement !== undefined) payload.icu_requirement = record.icu_requirement;
    if (record.estimated_arrival_time !== undefined) payload.estimated_arrival_time = record.estimated_arrival_time;

    const { data, error } = await supabase
      .from("emergencies")
      .insert([payload])
      .select()
      .single();
    if (error) {
      console.warn("insertSupabaseEmergency:", error.message);
      return null;
    }
    return data as SupabaseEmergencyRecord;
  } catch (err) {
    console.warn("insertSupabaseEmergency exception:", err);
    return null;
  }
}

export async function fetchSupabaseEmergencies(): Promise<SupabaseEmergencyRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("emergencies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as SupabaseEmergencyRecord[]) ?? [];
}

export async function updateSupabaseEmergency(
  id: string,
  updates: Partial<SupabaseEmergencyRecord>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status) payload.status = updates.status;
    if (updates.driver_name) payload.driver_name = updates.driver_name;
    if (updates.vehicle_number) payload.vehicle_number = updates.vehicle_number;
    if (updates.ambulance_id) payload.ambulance_id = updates.ambulance_id;
    if (updates.eta_minutes !== undefined) payload.eta_minutes = updates.eta_minutes;
    if (updates.estimated_arrival_time !== undefined) payload.estimated_arrival_time = updates.estimated_arrival_time;
    if (updates.accepted_by) payload.accepted_by = updates.accepted_by;
    if (updates.notes) payload.notes = updates.notes;

    const { error } = await supabase
      .from("emergencies")
      .update(payload)
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export function subscribeSupabaseEmergencies(
  onChange: (record: SupabaseEmergencyRecord) => void,
  hospitalId?: string
): () => void {
  if (!supabase) return () => undefined;

  const filter = hospitalId
    ? { event: "*" as const, schema: "public", table: "emergencies", filter: `hospital_id=eq.${hospitalId}` }
    : { event: "*" as const, schema: "public", table: "emergencies" };

  const channel = supabase
    .channel(hospitalId ? `emergencies_hospital_${hospitalId}` : "emergencies_global")
    .on("postgres_changes", filter, (payload) => {
      if (payload.new) onChange(payload.new as SupabaseEmergencyRecord);
    })
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PATIENT DATA HELPERS (LIVE SUPABASE CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchHealthProfile(patientId = "demo-user"): Promise<SupabaseHealthProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("health_profiles")
    .select("*")
    .eq("patient_id", patientId)
    .single();
  if (error) return null;
  return data as SupabaseHealthProfile;
}

export async function saveHealthProfile(profile: Partial<SupabaseHealthProfile>): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    patient_id: profile.patient_id || "demo-user",
    full_name: profile.full_name || "Abhijeet Das",
    blood_group: profile.blood_group || "O+",
    allergies: profile.allergies || [],
    medications: profile.medications || [],
    medical_history: profile.medical_history || [],
    organ_donor: profile.organ_donor ?? true,
    doctor_name: profile.doctor_name || "Dr. Ananya Sharma",
    doctor_phone: profile.doctor_phone || "+91 98765 43210",
    emergency_notes: profile.emergency_notes || "",
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("health_profiles").upsert(payload, { onConflict: "patient_id" });
  if (error) console.warn("saveHealthProfile:", error.message);
  return !error;
}

export async function fetchEmergencyContacts(patientId = "demo-user"): Promise<SupabaseEmergencyContact[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("patient_id", patientId)
    .order("priority", { ascending: true });
  if (error) { console.warn("fetchEmergencyContacts:", error.message); return []; }
  return (data as SupabaseEmergencyContact[]) ?? [];
}

export async function addEmergencyContact(contact: {
  patient_id?: string;
  name: string;
  phone: string;
  relationship: string;
  priority?: "Primary" | "Secondary";
}): Promise<SupabaseEmergencyContact | null> {
  if (!supabase) return null;
  const payload = {
    patient_id: contact.patient_id || "demo-user",
    name: contact.name,
    phone: contact.phone,
    relationship: contact.relationship,
    priority: contact.priority || "Primary",
  };
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert([payload])
    .select()
    .single();
  if (error) {
    console.warn("addEmergencyContact error:", error.message);
    return null;
  }
  return data as SupabaseEmergencyContact;
}

export async function removeEmergencyContact(contactId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("emergency_contacts").delete().eq("id", contactId);
  return !error;
}

export async function fetchDailyMetrics(
  patientId = "demo-user",
  date = new Date().toISOString().split("T")[0]
): Promise<SupabaseDailyMetrics | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("daily_metrics")
    .select("*")
    .eq("patient_id", patientId)
    .eq("metric_date", date)
    .single();
  if (error) return null;
  return data as SupabaseDailyMetrics;
}

export async function saveDailyMetrics(metrics: Partial<SupabaseDailyMetrics>): Promise<boolean> {
  if (!supabase) return false;
  const today = new Date().toISOString().split("T")[0];
  const payload: Record<string, any> = {
    patient_id: metrics.patient_id || "demo-user",
    metric_date: metrics.metric_date || today,
    heart_rate: metrics.heart_rate || 72,
    resting_hr: metrics.resting_hr || 68,
    spo2: metrics.spo2 || 98,
    steps: metrics.steps || 6400,
    step_goal: metrics.step_goal || 10000,
    active_minutes: metrics.active_minutes || 45,
    calories_burned: metrics.calories_burned || 420,
    sleep_hours: metrics.sleep_hours || 7.5,
    sleep_score: metrics.sleep_score || 85,
    water_liters: metrics.water_liters || 2.1,
    water_goal: metrics.water_goal || 3.0,
  };
  const { error } = await supabase
    .from("daily_metrics")
    .upsert(payload, { onConflict: "patient_id,metric_date" });
  if (error) console.warn("saveDailyMetrics:", error.message);
  return !error;
}

export async function fetchWaterLogs(patientId = "demo-user"): Promise<SupabaseWaterLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("logged_at", { ascending: false })
    .limit(30);
  if (error) return [];
  return (data as SupabaseWaterLog[]) ?? [];
}

export async function logWaterIntake(
  patientId: string,
  amountMl: number,
  note?: string
): Promise<SupabaseWaterLog | null> {
  if (!supabase) return null;
  const payload = {
    patient_id: patientId || "demo-user",
    amount_ml: amountMl,
    note: note || "Water Hydration Log",
    logged_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("water_logs")
    .insert([payload])
    .select()
    .single();
  if (error) {
    console.warn("logWaterIntake error:", error.message);
    return null;
  }
  return data as SupabaseWaterLog;
}

export async function fetchConnectedDevices(patientId = "demo-user"): Promise<SupabaseConnectedDevice[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("connected_devices")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data as SupabaseConnectedDevice[]) ?? [];
}

export async function updateConnectedDevice(
  device: Partial<SupabaseConnectedDevice> & { id: string }
): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    ...device,
    patient_id: device.patient_id || "demo-user",
    last_sync_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("connected_devices").upsert(payload);
  if (error) console.warn("updateConnectedDevice:", error.message);
  return !error;
}

export async function fetchChallenges(): Promise<SupabaseChallenge[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data as SupabaseChallenge[]) ?? [];
}

export async function fetchUserChallenges(patientId = "demo-user"): Promise<SupabaseUserChallenge[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_challenges")
    .select("*")
    .eq("patient_id", patientId);
  if (error) return [];
  return (data as SupabaseUserChallenge[]) ?? [];
}

export async function updateUserChallengeProgress(
  patientId: string,
  challengeId: string,
  progress: number,
  completed = false
): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    patient_id: patientId || "demo-user",
    challenge_id: challengeId,
    progress,
    completed,
    streak_days: Math.min(progress, 7),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_challenges").upsert(payload, { onConflict: "patient_id,challenge_id" });
  return !error;
}

export async function fetchRewards(): Promise<SupabaseReward[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("points_cost", { ascending: true });
  if (error) return [];
  return (data as SupabaseReward[]) ?? [];
}
