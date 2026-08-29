import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * ZIVAN Supabase Shared Emergency Integration Layer & Database Schema
 * 
 * -- SQL Table Schema for 'emergencies' / 'emergency_requests':
 * CREATE TABLE public.emergencies (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   patient_id TEXT NOT NULL,
 *   patient_name TEXT NOT NULL,
 *   patient_phone TEXT,
 *   location_label TEXT NOT NULL,
 *   latitude DOUBLE PRECISION NOT NULL,
 *   longitude DOUBLE PRECISION NOT NULL,
 *   hospital_id TEXT NOT NULL,
 *   hospital_name TEXT NOT NULL,
 *   status TEXT NOT NULL DEFAULT 'PENDING',
 *   priority TEXT DEFAULT 'urgent',
 *   ambulance_type TEXT DEFAULT 'government', -- 'government' | 'private'
 *   doctor_specialization TEXT DEFAULT 'Emergency – Not Sure',
 *   estimated_private_fare TEXT,
 *   icu_requirement BOOLEAN DEFAULT false,
 *   ambulance_id TEXT,
 *   driver_name TEXT,
 *   vehicle_number TEXT,
 *   estimated_arrival_time INT,
 *   notes TEXT,
 *   eta_minutes INT,
 *   accepted_by TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

export interface SupabaseEmergencyRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  location_label: string;
  latitude: number;
  longitude: number;
  hospital_id: string;
  hospital_name: string;
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
  ambulance_type: "government" | "private";
  doctor_specialization: string;
  estimated_private_fare?: string;
  icu_requirement: boolean;
  ambulance_id?: string;
  driver_name?: string;
  vehicle_number?: string;
  estimated_arrival_time?: number;
  notes?: string;
  eta_minutes?: number;
  accepted_by?: string;
  created_at: string;
  updated_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseConfig() {
  return {
    url: supabaseUrl || "https://demo.supabase.co",
    key: supabaseAnonKey || "demo-anon-key",
    isConfigured: isSupabaseConfigured,
  };
}

/**
 * Insert new emergency record into Supabase 'emergencies' or 'emergency_requests' table
 */
export async function insertSupabaseEmergency(record: Partial<SupabaseEmergencyRecord>): Promise<SupabaseEmergencyRecord | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("emergencies")
      .insert([record])
      .select()
      .single();

    if (error) {
      // Fallback try table name 'emergency_requests'
      const { data: altData, error: altError } = await supabase
        .from("emergency_requests")
        .insert([record])
        .select()
        .single();
      if (altError) {
        console.warn("Supabase insert error:", altError.message);
        return null;
      }
      return altData as SupabaseEmergencyRecord;
    }
    return data as SupabaseEmergencyRecord;
  } catch (err) {
    console.warn("Supabase insert exception:", err);
    return null;
  }
}

/**
 * Fetch all emergency records from Supabase
 */
export async function fetchSupabaseEmergencies(): Promise<SupabaseEmergencyRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("emergencies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const { data: altData } = await supabase
        .from("emergency_requests")
        .select("*")
        .order("created_at", { ascending: false });
      return (altData as SupabaseEmergencyRecord[]) ?? [];
    }
    return (data as SupabaseEmergencyRecord[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Update emergency status or paramedic specs in Supabase
 */
export async function updateSupabaseEmergency(id: string, updates: Partial<SupabaseEmergencyRecord>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("emergencies")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      await supabase
        .from("emergency_requests")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Real-Time Postgres Changes Subscription
 */
export function subscribeSupabaseEmergencies(onChange: (record: SupabaseEmergencyRecord) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel("emergencies_live_channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "emergencies" },
      (payload) => {
        if (payload.new) {
          onChange(payload.new as SupabaseEmergencyRecord);
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "emergency_requests" },
      (payload) => {
        if (payload.new) {
          onChange(payload.new as SupabaseEmergencyRecord);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
