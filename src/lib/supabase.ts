import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Config ────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  /** "government" | "private" | "icu" */
  type: string;
  /** "available" | "dispatched" | "returning" | "maintenance" */
  status: string;
  current_latitude?: number;
  current_longitude?: number;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseEmergencyRecord {
  id: string;

  // Patient
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  blood_group?: string;
  allergies?: string[];
  medications?: string[];

  // Location
  location_label: string;
  latitude: number;
  longitude: number;

  // Hospital
  hospital_id?: string;
  hospital_name: string;

  // Status flow:
  // PENDING → REQUEST RECEIVED → HOSPITAL ACCEPTED → AMBULANCE ASSIGNED
  // → AMBULANCE EN ROUTE → AMBULANCE ARRIVED → PATIENT PICKED UP
  // → ARRIVED AT HOSPITAL | CANCELLED
  status:
    | "PENDING"
    | "REQUEST RECEIVED"
    | "HOSPITAL ACCEPTED"
    | "AMBULANCE ASSIGNED"
    | "AMBULANCE EN ROUTE"
    | "AMBULANCE ARRIVED"
    | "PATIENT PICKED UP"
    | "ARRIVED AT HOSPITAL"
    | "CANCELLED";
  priority?: "critical" | "urgent" | "standard";

  // Medical
  ambulance_type: "government" | "private" | "icu";
  doctor_specialization: string;
  estimated_private_fare?: string;
  icu_requirement: boolean;

  // Vitals snapshot
  vitals_hr?: number;
  vitals_bp?: string;
  vitals_spo2?: number;
  vitals_rr?: number;
  vitals_temp?: number;

  // Ambulance (filled by hospital on accept)
  ambulance_id?: string;
  driver_name?: string;
  vehicle_number?: string;
  estimated_arrival_time?: number;
  eta_minutes?: number;

  // Hospital response
  accepted_by?: string;
  allocated_bed?: string;
  blood_cross_matched?: boolean;
  handover_notes?: string;
  notes?: string;

  created_at: string;
  updated_at?: string;
}

export interface SupabaseHospitalStaff {
  id: string;
  hospital_id: string;
  name: string;
  role: "admin" | "staff" | "doctor";
  email: string;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOSPITALS
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
  if (error) { console.warn("updateHospitalBeds:", error.message); return false; }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AMBULANCES
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchAmbulancesByHospital(
  hospitalId: string
): Promise<SupabaseAmbulance[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ambulances")
    .select("*")
    .eq("hospital_id", hospitalId)
    .order("id");
  if (error) { console.warn("fetchAmbulancesByHospital:", error.message); return []; }
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

export async function updateAmbulanceStatus(
  id: string,
  status: SupabaseAmbulance["status"]
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("ambulances")
    .update({ status })
    .eq("id", id);
  if (error) { console.warn("updateAmbulanceStatus:", error.message); return false; }
  return true;
}

export function subscribeAmbulanceUpdates(
  hospitalId: string,
  onChange: (ambulance: SupabaseAmbulance) => void
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`ambulances_${hospitalId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ambulances",
        filter: `hospital_id=eq.${hospitalId}`,
      },
      (payload) => { if (payload.new) onChange(payload.new as SupabaseAmbulance); }
    )
    .subscribe();
  return () => { supabase!.removeChannel(channel); };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EMERGENCIES
// ═══════════════════════════════════════════════════════════════════════════════

export async function insertSupabaseEmergency(
  record: Partial<SupabaseEmergencyRecord>
): Promise<SupabaseEmergencyRecord | null> {
  if (!supabase) return null;
  try {
    // Build sanitized payload with only core table columns
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
      priority: record.priority || "urgent",
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
    if (record.estimated_private_fare) payload.estimated_private_fare = record.estimated_private_fare;

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

export async function fetchSupabaseEmergencies(): Promise<
  SupabaseEmergencyRecord[]
> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("emergencies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.warn("fetchSupabaseEmergencies:", error.message); return []; }
  return (data as SupabaseEmergencyRecord[]) ?? [];
}

export async function fetchEmergenciesByHospital(
  hospitalId: string
): Promise<SupabaseEmergencyRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("emergencies")
    .select("*")
    .eq("hospital_id", hospitalId)
    .not("status", "in", '("CANCELLED","ARRIVED AT HOSPITAL")')
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as SupabaseEmergencyRecord[]) ?? [];
}

export async function fetchEmergencyById(
  id: string
): Promise<SupabaseEmergencyRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("emergencies")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as SupabaseEmergencyRecord;
}

export async function updateSupabaseEmergency(
  id: string,
  updates: Partial<SupabaseEmergencyRecord>
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("emergencies")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) { console.warn("updateSupabaseEmergency:", error.message); return false; }
  return true;
}

/** Hospital accepts an SOS — marks HOSPITAL ACCEPTED and assigns ambulance */
export async function hospitalAcceptEmergency(
  emergencyId: string,
  opts: {
    acceptedBy: string;
    ambulanceId: string;
    driverName: string;
    vehicleNumber: string;
    etaMinutes: number;
    allocatedBed?: string;
  }
): Promise<boolean> {
  if (!supabase) return false;

  // 1. Update emergency
  const ok = await updateSupabaseEmergency(emergencyId, {
    status: "HOSPITAL ACCEPTED",
    accepted_by: opts.acceptedBy,
    ambulance_id: opts.ambulanceId,
    driver_name: opts.driverName,
    vehicle_number: opts.vehicleNumber,
    eta_minutes: opts.etaMinutes,
    allocated_bed: opts.allocatedBed,
  });

  // 2. Mark ambulance as dispatched
  if (ok) await updateAmbulanceStatus(opts.ambulanceId, "dispatched");

  return ok;
}

/** Progresses emergency status to next step */
export async function advanceEmergencyStatus(
  id: string,
  newStatus: SupabaseEmergencyRecord["status"]
): Promise<boolean> {
  return updateSupabaseEmergency(id, { status: newStatus });
}

/** Real-time listener — patient track their SOS, hospital sees live queue */
export function subscribeSupabaseEmergencies(
  onChange: (record: SupabaseEmergencyRecord) => void,
  hospitalId?: string
): () => void {
  if (!supabase) return () => {};

  const filter = hospitalId
    ? { event: "*" as const, schema: "public", table: "emergencies", filter: `hospital_id=eq.${hospitalId}` }
    : { event: "*" as const, schema: "public", table: "emergencies" };

  const channel = supabase
    .channel(hospitalId ? `emergencies_hospital_${hospitalId}` : "emergencies_global")
    .on("postgres_changes", filter, (payload) => {
      if (payload.new) onChange(payload.new as SupabaseEmergencyRecord);
    })
    .subscribe();

  return () => { supabase!.removeChannel(channel); };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOSPITAL STAFF
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchStaffByEmail(
  email: string
): Promise<SupabaseHospitalStaff | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("hospital_staff")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .single();
  if (error) return null;
  return data as SupabaseHospitalStaff;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PATIENT DATA SCHEMAS & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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
}

// 1. Health Profile
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

export async function saveHealthProfile(profile: SupabaseHealthProfile): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("health_profiles")
    .upsert({ ...profile, updated_at: new Date().toISOString() });
  return !error;
}

// 2. Emergency Contacts
export async function fetchEmergencyContacts(patientId = "demo-user"): Promise<SupabaseEmergencyContact[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("patient_id", patientId)
    .order("priority", { ascending: true });
  if (error) return [];
  return (data as SupabaseEmergencyContact[]) ?? [];
}

export async function addEmergencyContact(contact: SupabaseEmergencyContact): Promise<SupabaseEmergencyContact | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert([contact])
    .select()
    .single();
  if (error) return null;
  return data as SupabaseEmergencyContact;
}

export async function removeEmergencyContact(contactId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("emergency_contacts").delete().eq("id", contactId);
  return !error;
}

// 3. Daily Vitals Metrics
export async function fetchDailyMetrics(patientId = "demo-user", date = new Date().toISOString().split("T")[0]): Promise<SupabaseDailyMetrics | null> {
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
  const { error } = await supabase.from("daily_metrics").upsert(metrics);
  return !error;
}

// 4. Water Logs
export async function fetchWaterLogs(patientId = "demo-user"): Promise<SupabaseWaterLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("patient_id", patientId)
    .order("logged_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return (data as SupabaseWaterLog[]) ?? [];
}

export async function logWaterIntake(patientId: string, amountMl: number, note?: string): Promise<SupabaseWaterLog | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("water_logs")
    .insert([{ patient_id: patientId, amount_ml: amountMl, note, logged_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) return null;
  return data as SupabaseWaterLog;
}

// 5. Connected Devices
export async function fetchConnectedDevices(patientId = "demo-user"): Promise<SupabaseConnectedDevice[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("connected_devices")
    .select("*")
    .eq("patient_id", patientId);
  if (error) return [];
  return (data as SupabaseConnectedDevice[]) ?? [];
}

export async function updateConnectedDevice(device: SupabaseConnectedDevice): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("connected_devices").upsert(device);
  return !error;
}

// 6. Challenges & User Progress
export async function fetchChallenges(): Promise<SupabaseChallenge[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("challenges").select("*");
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

// 7. Rewards
export async function fetchRewards(): Promise<SupabaseReward[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("rewards").select("*");
  if (error) return [];
  return (data as SupabaseReward[]) ?? [];
}

// 8. Patient SOS List
export async function fetchPatientEmergencies(patientId = "demo-user"): Promise<SupabaseEmergencyRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("emergencies")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as SupabaseEmergencyRecord[]) ?? [];
}
