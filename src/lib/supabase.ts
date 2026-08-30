import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── Config with Verified Fallback ─────────────────────────────────────────────
const DEFAULT_SUPABASE_URL = "https://zfudmwskebzdcomwqgpv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdWRtd3NrZWJ6ZGNvbXdxZ3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODc0MjQsImV4cCI6MjEwMzU2MzQyNH0.rPKe7S0iv6nKwtEW3PA25KXm5nHTNuh24zjrhIb7v4U";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  phone?: string;
  plan?: "Free" | "Plus" | "Family";
  avatar_url?: string;
  blood_group?: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface CompleteUserDataBundle {
  user: SupabaseUser | null;
  healthProfile: SupabaseHealthProfile | null;
  emergencyContacts: SupabaseEmergencyContact[];
  dailyMetrics: SupabaseDailyMetrics | null;
  waterLogs: SupabaseWaterLog[];
  connectedDevices: SupabaseConnectedDevice[];
  userChallenges: SupabaseUserChallenge[];
  emergencies: SupabaseEmergencyRecord[];
}

// ═══════════════════════════════════════════════════════════════════════════════
//  USER & CONNECTED TABLES INITIALIZATION & SYNC
// ═══════════════════════════════════════════════════════════════════════════════

export function getActiveUserId(): string {
  if (typeof window === "undefined") return "demo-user";
  try {
    const raw = localStorage.getItem("zivan-auth-user");
    if (!raw) return "demo-user";
    const parsed = JSON.parse(raw);
    return parsed?.id || "demo-user";
  } catch {
    return "demo-user";
  }
}

/**
 * Looks up an existing user in Supabase by email across users and health_profiles
 */
export async function fetchUserByEmail(
  email: string
): Promise<{ id: string; name: string; email: string; password?: string; phone?: string; bloodGroup?: string; plan?: "Free" | "Plus" | "Family" } | null> {
  if (!supabase) return null;
  const normalized = email.trim().toLowerCase();

  try {
    // 1. Try querying users table
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalized)
      .maybeSingle();

    if (userData && !userErr) {
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        bloodGroup: userData.blood_group,
        plan: (userData.plan as "Free" | "Plus" | "Family") || "Plus",
      };
    }

    // 2. Try looking up in health_profiles by constructed id
    const possibleId = `user_${normalized.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const { data: hpData } = await supabase
      .from("health_profiles")
      .select("*")
      .eq("patient_id", possibleId)
      .maybeSingle();

    if (hpData) {
      return {
        id: hpData.patient_id,
        name: hpData.full_name,
        email: normalized,
        phone: hpData.doctor_phone,
        bloodGroup: hpData.blood_group,
        plan: "Plus",
      };
    }

    // 3. Fallback check for demo-user
    if (normalized === "abhi@zivan.health" || normalized === "demo@zivan.health") {
      const { data: demoHp } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("patient_id", "demo-user")
        .maybeSingle();

      if (demoHp) {
        return {
          id: "demo-user",
          name: demoHp.full_name || "Abhijeet Das",
          email: normalized,
          password: "demo1234",
          phone: demoHp.doctor_phone || "+91 98765 43210",
          bloodGroup: demoHp.blood_group || "O+",
          plan: "Plus",
        };
      }
    }

    return null;
  } catch (err) {
    console.warn("fetchUserByEmail exception:", err);
    return null;
  }
}

/**
 * Creates and initializes all connected tables for a newly signed-up user in Supabase,
 * including saving credentials in the users table.
 */
export async function createInitialUserData(
  userId: string,
  name: string,
  email: string,
  options?: {
    password?: string;
    phone?: string;
    bloodGroup?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    plan?: "Free" | "Plus" | "Family";
  }
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const phone = options?.phone || "+91 98765 43210";
    const bloodGroup = options?.bloodGroup || "O+";
    const contactName = options?.emergencyContactName || "";
    const contactPhone = options?.emergencyContactPhone || "";
    const plan = options?.plan || "Free";
    const isDemo = userId === "demo-user" || email.trim().toLowerCase() === "abhi@zivan.health";

    // 1. Save credentials in Users Table
    const userPayload: Record<string, any> = {
      id: userId,
      email: email.trim().toLowerCase(),
      name,
      phone,
      plan,
      blood_group: bloodGroup,
      created_at: now,
      updated_at: now,
    };
    if (options?.password) {
      userPayload.password = options.password;
    }
    
    const { error: userInsertErr } = await supabase
      .from("users")
      .upsert(userPayload, { onConflict: "id" });
      
    if (userInsertErr) {
      console.warn("Note on public.users table insert:", userInsertErr.message);
    }

    // 2. Health Profile (User Clinical Profile)
    await supabase.from("health_profiles").upsert(
      {
        patient_id: userId,
        full_name: name,
        blood_group: bloodGroup,
        date_of_birth: isDemo ? "1998-05-14" : "",
        gender: isDemo ? "Male" : "",
        allergies: isDemo ? ["Penicillin", "Dust Mites"] : [],
        medications: isDemo ? ["Vitamin D3 1000IU"] : [],
        medical_history: isDemo ? ["Mild Seasonal Allergies"] : [],
        organ_donor: true,
        doctor_name: isDemo ? "Dr. Ananya Sharma" : contactName,
        doctor_phone: isDemo ? "+91 98765 43210" : contactPhone,
        emergency_notes: isDemo ? "Initial member registration" : "",
        created_at: now,
        updated_at: now,
      },
      { onConflict: "patient_id" }
    );

    // 3. Emergency Contacts for this user (only if provided)
    if (contactName && contactPhone) {
      await supabase.from("emergency_contacts").insert([
        {
          patient_id: userId,
          name: contactName,
          phone: contactPhone,
          relationship: "Primary Contact",
          priority: "Primary",
        },
      ]);
    } else if (isDemo) {
      await supabase.from("emergency_contacts").insert([
        {
          patient_id: userId,
          name: "Dr. Ananya Sharma",
          phone: "+91 98765 43210",
          relationship: "Family Doctor",
          priority: "Primary",
        },
      ]);
    }

    // 4. Initial Daily Metrics (Start from 0 for new real users)
    await supabase.from("daily_metrics").upsert(
      {
        patient_id: userId,
        metric_date: today,
        heart_rate: isDemo ? 72 : 0,
        resting_hr: isDemo ? 68 : 0,
        spo2: isDemo ? 98 : 0,
        steps: isDemo ? 6420 : 0,
        step_goal: 10000,
        active_minutes: isDemo ? 45 : 0,
        calories_burned: isDemo ? 420 : 0,
        sleep_hours: isDemo ? 7.5 : 0,
        sleep_score: isDemo ? 85 : 0,
        water_liters: isDemo ? 2.1 : 0,
        water_goal: 3.0,
      },
      { onConflict: "patient_id,metric_date" }
    );

    // 5. Initial Water Log (Only for demo user)
    if (isDemo) {
      await supabase.from("water_logs").insert([
        {
          patient_id: userId,
          amount_ml: 500,
          note: "Morning Hydration (Demo Day)",
          logged_at: now,
        },
      ]);
    }

    return true;
  } catch (err) {
    console.warn("createInitialUserData exception:", err);
    return false;
  }
}

/**
 * Fetches all connected tables in a unified bundle for a specific user ID
 */
export async function fetchCompleteUserData(
  userId = getActiveUserId()
): Promise<CompleteUserDataBundle> {
  const empty: CompleteUserDataBundle = {
    user: null,
    healthProfile: null,
    emergencyContacts: [],
    dailyMetrics: null,
    waterLogs: [],
    connectedDevices: [],
    userChallenges: [],
    emergencies: [],
  };

  if (!supabase) return empty;

  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      profileRes,
      contactsRes,
      metricsRes,
      waterRes,
      devicesRes,
      challengesRes,
      emergenciesRes,
    ] = await Promise.all([
      supabase.from("health_profiles").select("*").eq("patient_id", userId).single(),
      supabase.from("emergency_contacts").select("*").eq("patient_id", userId).order("priority", { ascending: true }),
      supabase.from("daily_metrics").select("*").eq("patient_id", userId).eq("metric_date", today).single(),
      supabase.from("water_logs").select("*").eq("patient_id", userId).order("logged_at", { ascending: false }).limit(30),
      supabase.from("connected_devices").select("*").eq("patient_id", userId).order("created_at", { ascending: true }),
      supabase.from("user_challenges").select("*").eq("patient_id", userId),
      supabase.from("emergencies").select("*").eq("patient_id", userId).order("created_at", { ascending: false }),
    ]);

    const hp = profileRes.data as SupabaseHealthProfile | null;
    const user: SupabaseUser | null = hp
      ? {
          id: hp.patient_id,
          name: hp.full_name,
          email: `${hp.patient_id}@zivan.health`,
          blood_group: hp.blood_group,
          phone: hp.doctor_phone,
          plan: "Plus",
        }
      : null;

    return {
      user,
      healthProfile: hp,
      emergencyContacts: (contactsRes.data as SupabaseEmergencyContact[]) ?? [],
      dailyMetrics: (metricsRes.data as SupabaseDailyMetrics) ?? null,
      waterLogs: (waterRes.data as SupabaseWaterLog[]) ?? [],
      connectedDevices: (devicesRes.data as SupabaseConnectedDevice[]) ?? [],
      userChallenges: (challengesRes.data as SupabaseUserChallenge[]) ?? [],
      emergencies: (emergenciesRes.data as SupabaseEmergencyRecord[]) ?? [],
    };
  } catch (err) {
    console.warn("fetchCompleteUserData exception:", err);
    return empty;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PATIENT HEALTH PROFILE (USER ROOT)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchHealthProfile(
  patientId = getActiveUserId()
): Promise<SupabaseHealthProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("health_profiles")
      .select("*")
      .eq("patient_id", patientId)
      .single();
    if (error) return null;
    return data as SupabaseHealthProfile;
  } catch {
    return null;
  }
}

export async function saveHealthProfile(
  profile: Partial<SupabaseHealthProfile>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const patientId = profile.patient_id || getActiveUserId();
    const payload = {
      patient_id: patientId,
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
    const { error } = await supabase
      .from("health_profiles")
      .upsert(payload, { onConflict: "patient_id" });
    if (error) console.warn("saveHealthProfile:", error.message);
    return !error;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EMERGENCY CONTACTS
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchEmergencyContacts(
  patientId = getActiveUserId()
): Promise<SupabaseEmergencyContact[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("patient_id", patientId)
      .order("priority", { ascending: true });
    if (error) { console.warn("fetchEmergencyContacts:", error.message); return []; }
    return (data as SupabaseEmergencyContact[]) ?? [];
  } catch {
    return [];
  }
}

export async function addEmergencyContact(contact: {
  patient_id?: string;
  name: string;
  phone: string;
  relationship: string;
  priority?: "Primary" | "Secondary";
}): Promise<SupabaseEmergencyContact | null> {
  if (!supabase) return null;
  try {
    const payload = {
      patient_id: contact.patient_id || getActiveUserId(),
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
  } catch {
    return null;
  }
}

export async function removeEmergencyContact(contactId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", contactId);
    return !error;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DAILY METRICS
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchDailyMetrics(
  patientId = getActiveUserId(),
  date = new Date().toISOString().split("T")[0]
): Promise<SupabaseDailyMetrics | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("patient_id", patientId)
      .eq("metric_date", date)
      .single();
    if (error) return null;
    return data as SupabaseDailyMetrics;
  } catch {
    return null;
  }
}

export async function saveDailyMetrics(
  metrics: Partial<SupabaseDailyMetrics>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const today = new Date().toISOString().split("T")[0];
    const payload: Record<string, any> = {
      patient_id: metrics.patient_id || getActiveUserId(),
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
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  WATER / HYDRATION LOGS
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchWaterLogs(
  patientId = getActiveUserId()
): Promise<SupabaseWaterLog[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("water_logs")
      .select("*")
      .eq("patient_id", patientId)
      .order("logged_at", { ascending: false })
      .limit(30);
    if (error) return [];
    return (data as SupabaseWaterLog[]) ?? [];
  } catch {
    return [];
  }
}

export async function logWaterIntake(
  patientId = getActiveUserId(),
  amountMl: number,
  note?: string
): Promise<SupabaseWaterLog | null> {
  if (!supabase) return null;
  try {
    const payload = {
      patient_id: patientId || getActiveUserId(),
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
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONNECTED DEVICES
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchConnectedDevices(
  patientId = getActiveUserId()
): Promise<SupabaseConnectedDevice[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("connected_devices")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data as SupabaseConnectedDevice[]) ?? [];
  } catch {
    return [];
  }
}

export async function updateConnectedDevice(
  device: Partial<SupabaseConnectedDevice> & { id: string }
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      ...device,
      patient_id: device.patient_id || getActiveUserId(),
      last_sync_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("connected_devices").upsert(payload);
    if (error) console.warn("updateConnectedDevice:", error.message);
    return !error;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EMERGENCIES (SOS)
// ═══════════════════════════════════════════════════════════════════════════════

export async function insertSupabaseEmergency(
  record: Partial<SupabaseEmergencyRecord>
): Promise<SupabaseEmergencyRecord | null> {
  if (!supabase) return null;
  try {
    const patientId = record.patient_id || getActiveUserId();
    const payload: Record<string, any> = {
      patient_id: patientId,
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

export async function fetchSupabaseEmergencies(
  patientId?: string
): Promise<SupabaseEmergencyRecord[]> {
  if (!supabase) return [];
  try {
    let query = supabase
      .from("emergencies")
      .select("*")
      .order("created_at", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as SupabaseEmergencyRecord[]) ?? [];
  } catch {
    return [];
  }
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
  patientId?: string
): () => void {
  if (!supabase || typeof window === "undefined") return () => undefined;

  try {
    const filter = patientId
      ? { event: "*" as const, schema: "public", table: "emergencies", filter: `patient_id=eq.${patientId}` }
      : { event: "*" as const, schema: "public", table: "emergencies" };

    const channelName = `emergencies_pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", filter, (payload) => {
        try {
          if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
            onChange(payload.new as SupabaseEmergencyRecord);
          }
        } catch {
          // ignore
        }
      })
      .subscribe();

    return () => {
      try {
        supabase!.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch {
    return () => undefined;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOSPITALS & AMBULANCES
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchHospitals(): Promise<SupabaseHospital[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("distance_km", { ascending: true });
    if (error) { console.warn("fetchHospitals:", error.message); return []; }
    return (data as SupabaseHospital[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchHospitalById(
  id: string
): Promise<SupabaseHospital | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as SupabaseHospital;
  } catch {
    return null;
  }
}

export async function fetchAmbulancesByHospital(
  hospitalId: string
): Promise<SupabaseAmbulance[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("ambulances")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("id");
    if (error) return [];
    return (data as SupabaseAmbulance[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchAvailableAmbulances(
  hospitalId: string
): Promise<SupabaseAmbulance[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("ambulances")
      .select("*")
      .eq("hospital_id", hospitalId)
      .eq("status", "available");
    if (error) return [];
    return (data as SupabaseAmbulance[]) ?? [];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CHALLENGES & REWARDS
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchChallenges(): Promise<SupabaseChallenge[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data as SupabaseChallenge[]) ?? [];
  } catch {
    return [];
  }
}

export async function fetchUserChallenges(
  patientId = getActiveUserId()
): Promise<SupabaseUserChallenge[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("patient_id", patientId);
    if (error) return [];
    return (data as SupabaseUserChallenge[]) ?? [];
  } catch {
    return [];
  }
}

export async function updateUserChallengeProgress(
  patientId = getActiveUserId(),
  challengeId: string,
  progress: number,
  completed = false
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      patient_id: patientId || getActiveUserId(),
      challenge_id: challengeId,
      progress,
      completed,
      streak_days: Math.min(progress, 7),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_challenges").upsert(payload, { onConflict: "patient_id,challenge_id" });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchRewards(): Promise<SupabaseReward[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("active", true)
      .order("points_cost", { ascending: true });
    if (error) return [];
    return (data as SupabaseReward[]) ?? [];
  } catch {
    return [];
  }
}
