import {
  AMBULANCE_REQUESTS_KEY,
  HOSPITAL_ACCOUNTS,
  HOSPITAL_SESSION_KEY,
  type AmbulanceRequest,
  type AmbulanceRequestStatus,
  type HospitalAccount,
} from "@/data/ambulanceRequests";
import { emergencyProfile } from "@/data/healthData";
import { hospitals } from "@/data/hospitals";
import {
  insertSupabaseEmergency,
  fetchEmergenciesByHospital,
  updateSupabaseEmergency,
  hospitalAcceptEmergency,
  advanceEmergencyStatus,
  fetchAvailableAmbulances,
  subscribeSupabaseEmergencies,
  isSupabaseConfigured,
  type SupabaseEmergencyRecord,
} from "@/lib/supabase";

function canUseStorage() {
  return typeof window !== "undefined";
}

// ─── Map Supabase record → local AmbulanceRequest shape ───────────────────────
function supabaseToLocal(r: SupabaseEmergencyRecord): AmbulanceRequest {
  const statusMap: Record<string, AmbulanceRequestStatus> = {
    "PENDING":              "searching",
    "REQUEST RECEIVED":     "searching",
    "HOSPITAL ACCEPTED":    "accepted",
    "AMBULANCE ASSIGNED":   "accepted",
    "AMBULANCE EN ROUTE":   "en_route",
    "AMBULANCE ARRIVED":    "arrived",
    "PATIENT PICKED UP":    "arrived",
    "ARRIVED AT HOSPITAL":  "arrived",
    "CANCELLED":            "cancelled",
  };
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at ?? r.created_at,
    patientName: r.patient_name,
    patientPhone: r.patient_phone,
    locationLabel: r.location_label,
    coordinates: { lat: r.latitude, lng: r.longitude },
    hospitalId: r.hospital_id ?? "",
    hospitalName: r.hospital_name,
    status: statusMap[r.status] ?? "searching",
    priority: r.priority ?? "urgent",
    notes: r.notes ?? "",
    bloodGroup: r.blood_group,
    allergies: r.allergies,
    medications: r.medications,
    etaMinutes: r.eta_minutes,
    acceptedBy: r.accepted_by,
    allocatedBed: r.allocated_bed,
    bloodCrossMatched: r.blood_cross_matched,
    handoverNotes: r.handover_notes,
    vitals: r.vitals_hr
      ? {
          hr: r.vitals_hr!,
          bp: r.vitals_bp!,
          spo2: r.vitals_spo2!,
          rr: r.vitals_rr!,
          temp: r.vitals_temp!,
        }
      : undefined,
    demo: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DEMO REQUESTS (fallback when Supabase is not yet populated)
// ═══════════════════════════════════════════════════════════════════════════════

export const INITIAL_DEMO_REQUESTS: AmbulanceRequest[] = [
  {
    id: "amb_sample_01",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Rahul Sharma",
    patientPhone: "+91 98111 22334",
    locationLabel: "Cyber Hub Gate 3, Sector 24 · Unit Alpha-01",
    coordinates: { lat: 28.6139, lng: 77.209 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "en_route",
    priority: "critical",
    notes: "52yo male presenting with acute substernal chest pain radiating to left jaw with diaphoresis. Suspected Anterior STEMI.",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Amlodipine 5mg", "Atorvastatin 20mg"],
    etaMinutes: 5,
    acceptedBy: "Paramedic Unit Alpha-01",
    allocatedBed: "Trauma Bay 01 (Resus)",
    vitals: { hr: 116, bp: "146/92", spo2: 92, rr: 24, temp: 37.8 },
    handoverNotes: "12-lead ECG confirms 3mm ST elevation in V1-V4. Aspirin 300mg chewed, Ticagrelor 180mg given.",
    bloodCrossMatched: true,
    demo: true,
  },
  {
    id: "amb_sample_02",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Priya Nair",
    patientPhone: "+91 98777 11223",
    locationLabel: "Ring Road Flyover, Pillar 142 · Unit Bravo-02",
    coordinates: { lat: 28.6215, lng: 77.218 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "en_route",
    priority: "critical",
    notes: "28yo female involved in high-speed vehicular collision. Blunt abdominal trauma, closed right femur deformity.",
    bloodGroup: "B-",
    allergies: ["Sulfa drugs", "Latex"],
    medications: ["None"],
    etaMinutes: 8,
    acceptedBy: "Paramedic Unit Bravo-02",
    allocatedBed: "Trauma Bay 02",
    vitals: { hr: 126, bp: "98/64", spo2: 94, rr: 26, temp: 36.4 },
    handoverNotes: "C-spine immobilized. Pelvic binder placed. Bilateral 16G IV lines running.",
    bloodCrossMatched: false,
    demo: true,
  },
  {
    id: "amb_sample_05",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Vikram Malhotra",
    patientPhone: "+91 98555 33221",
    locationLabel: "Tech Park Avenue, Tower B Lobby · Patient App SOS",
    coordinates: { lat: 28.6112, lng: 77.2045 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "searching",
    priority: "critical",
    notes: "58yo male sudden onset right-sided hemiplegia and expressive aphasia. Code Stroke team activation needed.",
    bloodGroup: "O-",
    allergies: ["Contrast Dye"],
    medications: ["Metformin 500mg", "Telmisartan 40mg"],
    vitals: { hr: 90, bp: "172/102", spo2: 97, rr: 19, temp: 36.8 },
    demo: true,
  },
  {
    id: "amb_sample_06",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Ananya Deshmukh",
    patientPhone: "+91 98222 44556",
    locationLabel: "Riverfront Park, Gate 2 · Patient App SOS",
    coordinates: { lat: 28.6185, lng: 77.215 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "searching",
    priority: "urgent",
    notes: "41yo female high-impact fall from stairs. Visible compound deformity in right lower leg/ankle.",
    bloodGroup: "B+",
    allergies: ["Sulfa drugs"],
    medications: ["Thyroxine 50mcg"],
    vitals: { hr: 88, bp: "128/82", spo2: 98, rr: 18, temp: 36.9 },
    demo: true,
  },
  {
    id: "amb_north_01",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Rohan Kapoor",
    patientPhone: "+91 98111 88999",
    locationLabel: "North Highway Junction · Northside Medic 1",
    coordinates: { lat: 28.635, lng: 77.228 },
    hospitalId: "northside",
    hospitalName: "Northside Medical",
    status: "en_route",
    priority: "critical",
    notes: "Cardiac arrest with ROSC post-defibrillation. Requires targeted hypothermia and immediate cath lab.",
    bloodGroup: "O+",
    allergies: ["Penicillin"],
    medications: ["Metoprolol"],
    etaMinutes: 6,
    acceptedBy: "Northside Medic 1",
    allocatedBed: "Trauma Bay 01 (Resus)",
    vitals: { hr: 112, bp: "110/70", spo2: 95, rr: 22, temp: 37.0 },
    handoverNotes: "Post-cardiac arrest care initiated. Targeted temperature management ready.",
    bloodCrossMatched: true,
    demo: true,
  },
  {
    id: "amb_north_03",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Sameer Saxena",
    patientPhone: "+91 98333 11224",
    locationLabel: "City Sports Complex · Member App SOS",
    coordinates: { lat: 28.632, lng: 77.225 },
    hospitalId: "northside",
    hospitalName: "Northside Medical",
    status: "searching",
    priority: "urgent",
    notes: "Head injury during sports match with brief loss of consciousness and vomiting.",
    bloodGroup: "B+",
    allergies: ["None"],
    medications: ["None"],
    vitals: { hr: 82, bp: "130/84", spo2: 98, rr: 18, temp: 36.8 },
    demo: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function readRequests(): AmbulanceRequest[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(AMBULANCE_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(AMBULANCE_REQUESTS_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return INITIAL_DEMO_REQUESTS;
    }
    const parsed = JSON.parse(raw) as AmbulanceRequest[];
    if (parsed.length <= 3) {
      localStorage.setItem(AMBULANCE_REQUESTS_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return INITIAL_DEMO_REQUESTS;
    }
    return parsed;
  } catch {
    return [];
  }
}

function writeRequests(requests: AmbulanceRequest[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(AMBULANCE_REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent("zivan-ambulance-updated", { detail: requests }));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  READ
// ═══════════════════════════════════════════════════════════════════════════════

export function getAmbulanceRequests(): AmbulanceRequest[] {
  return readRequests().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAmbulanceRequestsForHospital(hospitalId: string) {
  return getAmbulanceRequests().filter((r) => r.hospitalId === hospitalId);
}

export function getAmbulanceRequestById(id: string) {
  return getAmbulanceRequests().find((r) => r.id === id) ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CREATE — Patient sends SOS (returns immediate object & syncs to Supabase)
// ═══════════════════════════════════════════════════════════════════════════════

export function createAmbulanceRequest(input?: {
  patientName?: string;
  patientPhone?: string;
  hospitalId?: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  priority?: AmbulanceRequest["priority"];
  notes?: string;
  bloodGroup?: string;
  vitals?: AmbulanceRequest["vitals"];
}): AmbulanceRequest {
  const preferred =
    hospitals.find((h) => h.id === input?.hospitalId && h.type === "hospital") ??
    hospitals.find((h) => h.type === "hospital") ??
    hospitals[0];

  const now = new Date().toISOString();
  const tempId = `amb_${Date.now()}`;

  const request: AmbulanceRequest = {
    id: tempId,
    createdAt: now,
    updatedAt: now,
    patientName: input?.patientName ?? "ZIVAN Member",
    patientPhone: input?.patientPhone ?? "+91 98XXX XXX00",
    locationLabel: input?.locationLabel ?? "Near Lake Avenue · SOS",
    coordinates: { lat: input?.latitude ?? 28.6139, lng: input?.longitude ?? 77.209 },
    hospitalId: preferred.id,
    hospitalName: preferred.name,
    status: "searching",
    priority: input?.priority ?? "urgent",
    notes: input?.notes ?? "SOS activated from ZIVAN app.",
    bloodGroup: input?.bloodGroup ?? emergencyProfile.bloodGroup,
    allergies: emergencyProfile.allergies,
    medications: emergencyProfile.medications,
    vitals: input?.vitals ?? { hr: 92, bp: "125/80", spo2: 97, rr: 19, temp: 37.1 },
    demo: true,
  };

  const next = [request, ...readRequests()];
  writeRequests(next);

  // Background sync to Supabase
  if (isSupabaseConfigured) {
    insertSupabaseEmergency({
      patient_id: `patient_${Date.now()}`,
      patient_name: request.patientName,
      patient_phone: request.patientPhone,
      blood_group: request.bloodGroup,
      allergies: request.allergies,
      medications: request.medications,
      location_label: request.locationLabel,
      latitude: request.coordinates.lat,
      longitude: request.coordinates.lng,
      hospital_id: preferred.id,
      hospital_name: preferred.name,
      status: "PENDING",
      priority: request.priority,
      ambulance_type: "government",
      doctor_specialization: "Emergency – Not Sure",
      icu_requirement: false,
      notes: request.notes,
      vitals_hr: request.vitals?.hr,
      vitals_bp: request.vitals?.bp,
      vitals_spo2: request.vitals?.spo2,
      vitals_rr: request.vitals?.rr,
      vitals_temp: request.vitals?.temp,
    }).then((record) => {
      if (record) {
        const local = supabaseToLocal(record);
        const current = readRequests();
        const idx = current.findIndex((r) => r.id === tempId);
        if (idx >= 0) {
          current[idx] = local;
        } else {
          current.unshift(local);
        }
        writeRequests(current);
      }
    });
  }

  return request;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════════════════════════════════════════

export function updateAmbulanceRequest(
  id: string,
  patch: Partial<AmbulanceRequest>
): AmbulanceRequest | null {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index < 0) return null;
  const updated: AmbulanceRequest = {
    ...requests[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  requests[index] = updated;
  writeRequests(requests);
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOSPITAL ACTIONS — Patient SOS Acceptance & Workflow
// ═══════════════════════════════════════════════════════════════════════════════

export function acceptAmbulanceRequest(
  id: string,
  staffName: string,
  etaMinutes = 12,
  ambulanceId?: string
): AmbulanceRequest | null {
  // Update local immediately
  const res = updateAmbulanceRequest(id, { status: "accepted", acceptedBy: staffName, etaMinutes });

  // Sync to Supabase in background
  if (isSupabaseConfigured) {
    if (ambulanceId) {
      fetchAvailableAmbulances(getAmbulanceRequestById(id)?.hospitalId ?? "").then((avail) => {
        const amb = avail.find((a) => a.id === ambulanceId) ?? avail[0];
        if (amb) {
          hospitalAcceptEmergency(id, {
            acceptedBy: staffName,
            ambulanceId: amb.id,
            driverName: amb.driver_name,
            vehicleNumber: amb.vehicle_number,
            etaMinutes,
          });
        }
      });
    } else {
      updateSupabaseEmergency(id, {
        status: "HOSPITAL ACCEPTED",
        accepted_by: staffName,
        eta_minutes: etaMinutes,
      });
    }
  }

  return res;
}

export function declineAmbulanceRequest(
  id: string,
  staffName: string
): AmbulanceRequest | null {
  const res = updateAmbulanceRequest(id, { status: "declined", acceptedBy: staffName });
  if (isSupabaseConfigured) {
    updateSupabaseEmergency(id, { status: "CANCELLED", accepted_by: staffName });
  }
  return res;
}

export function markAmbulanceEnRoute(id: string): AmbulanceRequest | null {
  const res = updateAmbulanceRequest(id, { status: "en_route" });
  if (isSupabaseConfigured) {
    advanceEmergencyStatus(id, "AMBULANCE EN ROUTE");
  }
  return res;
}

export function markAmbulanceArrived(id: string): AmbulanceRequest | null {
  const res = updateAmbulanceRequest(id, { status: "arrived" });
  if (isSupabaseConfigured) {
    advanceEmergencyStatus(id, "AMBULANCE ARRIVED");
  }
  return res;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CLINICAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export function assignBedToRequest(id: string, allocatedBed: string) {
  if (isSupabaseConfigured) {
    updateSupabaseEmergency(id, { allocated_bed: allocatedBed });
  }
  return updateAmbulanceRequest(id, { allocatedBed });
}

export function setBloodCrossMatch(id: string, bloodCrossMatched: boolean) {
  if (isSupabaseConfigured) {
    updateSupabaseEmergency(id, { blood_cross_matched: bloodCrossMatched });
  }
  return updateAmbulanceRequest(id, { bloodCrossMatched });
}

export function updateHandoverNotes(id: string, handoverNotes: string) {
  if (isSupabaseConfigured) {
    updateSupabaseEmergency(id, { handover_notes: handoverNotes });
  }
  return updateAmbulanceRequest(id, { handoverNotes });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SUBSCRIBE — Real-time updates (Supabase + Local events)
// ═══════════════════════════════════════════════════════════════════════════════

export function subscribeAmbulanceRequests(
  listener: (requests: AmbulanceRequest[]) => void,
  hospitalId?: string
): () => void {
  let unsubSupabase = () => {};

  if (isSupabaseConfigured) {
    unsubSupabase = subscribeSupabaseEmergencies((record) => {
      const local = supabaseToLocal(record);
      const current = readRequests();
      const idx = current.findIndex((r) => r.id === local.id);
      if (idx >= 0) {
        current[idx] = local;
      } else {
        current.unshift(local);
      }
      writeRequests(current);
      listener(getAmbulanceRequests());
    }, hospitalId);

    // Initial fetch from Supabase
    if (hospitalId) {
      fetchEmergenciesByHospital(hospitalId).then((records) => {
        if (records && records.length > 0) {
          const mapped = records.map(supabaseToLocal);
          const current = readRequests();
          const merged = [
            ...mapped,
            ...current.filter((c) => !mapped.some((m) => m.id === c.id)),
          ];
          writeRequests(merged);
          listener(getAmbulanceRequests());
        }
      });
    }
  }

  if (!canUseStorage()) return unsubSupabase;

  const emit = () => listener(getAmbulanceRequests());
  const onStorage = (event: StorageEvent) => {
    if (event.key === AMBULANCE_REQUESTS_KEY) emit();
  };
  const onCustom = () => emit();

  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-ambulance-updated", onCustom);
  emit();

  return () => {
    unsubSupabase();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-ambulance-updated", onCustom);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HOSPITAL AUTH
// ═══════════════════════════════════════════════════════════════════════════════

export function loginHospitalStaff(
  email: string,
  password: string
): { ok: true; account: HospitalAccount } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const account = HOSPITAL_ACCOUNTS.find(
    (item) => item.email === normalized && item.password === password
  );
  if (!account) {
    return { ok: false, error: "Invalid hospital credentials. Use a demo dispatch account." };
  }
  if (canUseStorage()) {
    localStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(account));
  }
  return { ok: true, account };
}

export function getHospitalSession(): HospitalAccount | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(HOSPITAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HospitalAccount;
  } catch {
    return null;
  }
}

export function logoutHospitalStaff() {
  if (!canUseStorage()) return;
  localStorage.removeItem(HOSPITAL_SESSION_KEY);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STATUS LABELS
// ═══════════════════════════════════════════════════════════════════════════════

export function statusLabel(status: AmbulanceRequestStatus) {
  switch (status) {
    case "searching":  return "Awaiting hospital";
    case "accepted":   return "Accepted";
    case "declined":   return "Declined";
    case "en_route":   return "Ambulance en route";
    case "arrived":    return "Arrived";
    case "cancelled":  return "Cancelled";
    default:           return status;
  }
}
