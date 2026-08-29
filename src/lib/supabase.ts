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
    const { data, error } = await supabase
      .from("emergencies")
      .insert([record])
      .select()
      .single();
    if (error) { console.warn("insertSupabaseEmergency:", error.message); return null; }
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
