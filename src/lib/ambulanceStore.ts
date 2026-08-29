import {
  AMBULANCE_REQUESTS_KEY,
  HOSPITAL_ACCOUNTS,
  HOSPITAL_SESSION_KEY,
  type AmbulanceRequest,
  type AmbulanceRequestStatus,
  type AmbulanceType,
  type HospitalAccount,
} from "@/data/ambulanceRequests";
import { emergencyProfile } from "@/data/healthData";
import { hospitals } from "@/data/hospitals";
import {
  insertSupabaseEmergency,
  subscribeSupabaseEmergencies,
  updateSupabaseEmergency,
  fetchSupabaseEmergencies,
  isSupabaseConfigured,
  type SupabaseEmergencyRecord,
} from "@/lib/supabase";

export const INITIAL_DEMO_REQUESTS: AmbulanceRequest[] = [
  {
    id: "amb_sample_01",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    patientId: "patient_001",
    patientName: "Rahul Sharma",
    patientPhone: "+91 98111 22334",
    locationLabel: "Cyber Hub Gate 3, Sector 24 · Unit ALPHA-1",
    coordinates: { lat: 28.6139, lng: 77.209 },
    hospitalId: "city-hospital",
    hospitalName: "City Super-Specialty Hospital",
    hospitalCategory: "private",
    status: "AMBULANCE EN ROUTE",
    priority: "critical",
    ambulanceType: "government",
    doctorSpecialization: "Cardiology",
    notes: "52yo male presenting with acute substernal chest pain radiating to left jaw with diaphoresis. Suspected Anterior STEMI.",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Amlodipine 5mg", "Atorvastatin 20mg"],
    etaMinutes: 8,
    acceptedBy: "City Dispatch Desk",
    allocatedBed: "Trauma Bay 01",
    bloodCrossMatched: true,
    vitals: {
      hr: 116,
      bp: "146/92",
      spo2: 92,
      rr: 24,
      temp: 37.8,
    },
    ambulanceId: "AMB-01",
    driverName: "Rajan Kumar",
    vehicleNumber: "DL-1A-0001",
    driverPhone: "+91 98111 00001",
    estimatedArrivalTime: 8,
    distanceRemainingKm: 2.4,
    icuRequirement: true,
  },
  {
    id: "amb_sample_02",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    patientId: "patient_002",
    patientName: "Ananya Deshmukh",
    patientPhone: "+91 98222 44556",
    locationLabel: "Riverfront Park, Gate 2 · Patient App SOS",
    coordinates: { lat: 28.6185, lng: 77.215 },
    hospitalId: "city-hospital",
    hospitalName: "City Super-Specialty Hospital",
    hospitalCategory: "private",
    status: "PENDING",
    priority: "urgent",
    ambulanceType: "government",
    doctorSpecialization: "Orthopaedics",
    notes: "41yo female suffered high-impact fall from stairs with visible compound deformity in right lower leg/ankle, severe pain.",
    bloodGroup: "B+",
    allergies: ["Sulfa drugs"],
    medications: ["Thyroxine 50mcg"],
    etaMinutes: 12,
    vitals: {
      hr: 88,
      bp: "128/82",
      spo2: 98,
      rr: 18,
      temp: 36.9,
    },
    icuRequirement: false,
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

function readRequests(): AmbulanceRequest[] {
  if (!canUseStorage()) return INITIAL_DEMO_REQUESTS;
  try {
    const raw = localStorage.getItem(AMBULANCE_REQUESTS_KEY);
    if (!raw) return INITIAL_DEMO_REQUESTS;
    const parsed = JSON.parse(raw) as AmbulanceRequest[];
    return parsed.length > 0 ? parsed : INITIAL_DEMO_REQUESTS;
  } catch {
    return INITIAL_DEMO_REQUESTS;
  }
}

function writeRequests(requests: AmbulanceRequest[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(AMBULANCE_REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(
    new CustomEvent("zivan-ambulance-updated", { detail: requests }),
  );
}

export function getAmbulanceRequests(): AmbulanceRequest[] {
  return readRequests().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAmbulanceRequestsForHospital(hospitalId: string) {
  return getAmbulanceRequests().filter((r) => r.hospitalId === hospitalId);
}

export function getAmbulanceRequestById(id: string) {
  return getAmbulanceRequests().find((r) => r.id === id) ?? null;
}

export function createAmbulanceRequest(input?: {
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  locationLabel?: string;
  coordinates?: { lat: number; lng: number };
  hospitalId?: string;
  notes?: string;
  ambulanceType?: AmbulanceType;
  doctorSpecialization?: string;
  estimatedPrivateFare?: string;
  icuRequirement?: boolean;
}): AmbulanceRequest {
  const preferred =
    hospitals.find((h) => h.id === input?.hospitalId) ??
    hospitals.find((h) => h.category === (input?.ambulanceType === "private" ? "private" : "government")) ??
    hospitals[0];

  const now = new Date().toISOString();
  const requestId = `amb_${Date.now()}`;
  const request: AmbulanceRequest = {
    id: requestId,
    createdAt: now,
    updatedAt: now,
    patientId: input?.patientId ?? "patient_abhi_101",
    patientName: input?.patientName ?? "Abhi Sharma",
    patientPhone: input?.patientPhone ?? "+91 98765 43210",
    locationLabel: input?.locationLabel ?? "742 Evergreen Terrace, Sector 14, Central Metro",
    coordinates: input?.coordinates ?? { lat: 28.6139, lng: 77.209 },
    hospitalId: preferred.id,
    hospitalName: preferred.name,
    hospitalCategory: preferred.category,
    status: "PENDING",
    priority: "critical",
    notes: input?.notes ?? "Emergency SOS triggered. Priority dispatch requested.",
    bloodGroup: emergencyProfile.bloodGroup,
    allergies: emergencyProfile.allergies,
    medications: emergencyProfile.medications,
    
    // Extended SOS Configuration
    ambulanceType: input?.ambulanceType ?? "government",
    doctorSpecialization: input?.doctorSpecialization ?? "Emergency – Not Sure",
    estimatedPrivateFare: input?.estimatedPrivateFare ?? (preferred.category === "private" ? preferred.estimatedFare : undefined),
    icuRequirement: input?.icuRequirement ?? (preferred.icuStatus === "Available"),
    
    // Tracking initial metrics
    ambulanceId: `AMB-IND-${Math.floor(100 + Math.random() * 900)}`,
    driverName: "Rajesh Kumar (Paramedic Leader)",
    driverPhone: "+91 98112 33445",
    vehicleNumber: "DL-01-EV-4892",
    ambulanceLocation: { lat: 28.6250, lng: 77.218 },
    estimatedArrivalTime: 8,
    distanceRemainingKm: 2.8,
    etaMinutes: 8,
    demo: true,
  };

  // 1. Write to local storage & broadcast custom event
  const next = [request, ...readRequests()];
  writeRequests(next);

  // 2. Transmit to Supabase backend asynchronously
  if (isSupabaseConfigured) {
    insertSupabaseEmergency({
      id: requestId,
      patient_id: request.patientId,
      patient_name: request.patientName,
      patient_phone: request.patientPhone,
      location_label: request.locationLabel,
      latitude: request.coordinates.lat,
      longitude: request.coordinates.lng,
      hospital_id: request.hospitalId,
      hospital_name: request.hospitalName,
      status: "PENDING",
      priority: "critical",
      ambulance_type: request.ambulanceType,
      doctor_specialization: request.doctorSpecialization,
      estimated_private_fare: request.estimatedPrivateFare,
      icu_requirement: request.icuRequirement,
      ambulance_id: request.ambulanceId,
      driver_name: request.driverName,
      vehicle_number: request.vehicleNumber,
      estimated_arrival_time: typeof request.estimatedArrivalTime === "number" ? request.estimatedArrivalTime : undefined,
      notes: request.notes,
      created_at: now,
    });
  }

  return request;
}

export function updateAmbulanceRequest(
  id: string,
  patch: Partial<AmbulanceRequest>,
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

  // Sync to Supabase as well
  if (isSupabaseConfigured) {
    updateSupabaseEmergency(id, {
      status: updated.status as any,
      driver_name: updated.driverName,
      vehicle_number: updated.vehicleNumber,
      ambulance_id: updated.ambulanceId,
      estimated_arrival_time: typeof updated.estimatedArrivalTime === "number" ? updated.estimatedArrivalTime : undefined,
      accepted_by: updated.acceptedBy,
    });
  }

  return updated;
}

// Bed & Trauma helpers
export function assignBedToRequest(id: string, bed: string) {
  return updateAmbulanceRequest(id, { allocatedBed: bed });
}

export function setBloodCrossMatch(id: string, matched: boolean) {
  return updateAmbulanceRequest(id, { bloodCrossMatched: matched });
}

export function updateHandoverNotes(id: string, notes: string) {
  return updateAmbulanceRequest(id, { handoverNotes: notes });
}

// 8-step status timeline helpers
export function markRequestReceived(id: string) {
  return updateAmbulanceRequest(id, { status: "REQUEST RECEIVED" });
}

export function acceptHospital(id: string, staffName: string, etaMinutes = 10) {
  return updateAmbulanceRequest(id, {
    status: "HOSPITAL ACCEPTED",
    acceptedBy: staffName,
    etaMinutes,
    estimatedArrivalTime: etaMinutes,
  });
}

export function assignAmbulance(id: string, driverName?: string, vehicleNumber?: string) {
  return updateAmbulanceRequest(id, {
    status: "AMBULANCE ASSIGNED",
    driverName: driverName ?? "Rajesh Kumar (Paramedic Leader)",
    vehicleNumber: vehicleNumber ?? "DL-01-EV-4892",
  });
}

export function assignAmbulanceWithDetails(
  id: string,
  details: {
    ambulanceId?: string;
    driverName: string;
    vehicleNumber: string;
    driverPhone?: string;
    etaMinutes?: number;
    allocatedBed?: string;
  }
) {
  return updateAmbulanceRequest(id, {
    status: "AMBULANCE ASSIGNED",
    ambulanceId: details.ambulanceId,
    driverName: details.driverName,
    vehicleNumber: details.vehicleNumber,
    driverPhone: details.driverPhone ?? "+91 98111 00001",
    etaMinutes: details.etaMinutes ?? 8,
    estimatedArrivalTime: details.etaMinutes ?? 8,
    allocatedBed: details.allocatedBed,
  });
}

export function markEnRoute(id: string) {
  return updateAmbulanceRequest(id, { status: "AMBULANCE EN ROUTE" });
}

export function markArrived(id: string) {
  return updateAmbulanceRequest(id, { status: "AMBULANCE ARRIVED", etaMinutes: 0 });
}

export function markPickedUp(id: string) {
  return updateAmbulanceRequest(id, { status: "PATIENT PICKED UP" });
}

export function markArrivedAtHospital(id: string) {
  return updateAmbulanceRequest(id, { status: "ARRIVED AT HOSPITAL", etaMinutes: 0 });
}

// Legacy Aliases
export const acceptAmbulanceRequest = acceptHospital;
export const markAmbulanceEnRoute = markEnRoute;
export const markAmbulanceArrived = markArrived;

export function declineAmbulanceRequest(id: string, staffName: string) {
  return updateAmbulanceRequest(id, {
    status: "declined",
    acceptedBy: staffName,
  });
}

function mapSupabaseToLocal(remote: SupabaseEmergencyRecord): AmbulanceRequest {
  return {
    id: remote.id,
    createdAt: remote.created_at || new Date().toISOString(),
    updatedAt: remote.updated_at || new Date().toISOString(),
    patientId: remote.patient_id,
    patientName: remote.patient_name,
    patientPhone: remote.patient_phone || "+91 98765 43210",
    locationLabel: remote.location_label,
    coordinates: { lat: remote.latitude, lng: remote.longitude },
    hospitalId: remote.hospital_id || "city-hospital",
    hospitalName: remote.hospital_name || "City Super-Specialty Hospital",
    hospitalCategory: remote.hospital_id?.startsWith("govt") ? "government" : "private",
    status: remote.status as AmbulanceRequestStatus,
    priority: remote.priority || "critical",
    ambulanceType: (remote.ambulance_type as AmbulanceType) || "government",
    doctorSpecialization: remote.doctor_specialization || "Emergency Medicine",
    estimatedPrivateFare: remote.estimated_private_fare,
    icuRequirement: remote.icu_requirement || false,
    ambulanceId: remote.ambulance_id || "AMB-01",
    driverName: remote.driver_name || "Paramedic Leader",
    vehicleNumber: remote.vehicle_number || "DL-01-EV-4892",
    driverPhone: "+91 98111 00001",
    estimatedArrivalTime: remote.estimated_arrival_time ?? remote.eta_minutes ?? 8,
    distanceRemainingKm: 2.5,
    etaMinutes: remote.eta_minutes ?? remote.estimated_arrival_time ?? 8,
    acceptedBy: remote.accepted_by,
    allocatedBed: remote.allocated_bed,
    bloodCrossMatched: remote.blood_cross_matched,
    handoverNotes: remote.handover_notes,
    notes: remote.notes || "SOS Emergency Dispatch",
    bloodGroup: remote.blood_group || "O+",
    allergies: remote.allergies || ["Penicillin"],
    medications: remote.medications || ["Amlodipine 5mg"],
  };
}

export function subscribeAmbulanceRequests(
  listener: (requests: AmbulanceRequest[]) => void,
) {
  if (isSupabaseConfigured) {
    // Initial fetch from Supabase to sync active state
    fetchSupabaseEmergencies().then((records) => {
      if (records && records.length > 0) {
        const mapped = records.map(mapSupabaseToLocal);
        writeRequests(mapped);
        listener(mapped);
      }
    });
  }

  if (!canUseStorage()) return () => undefined;

  const emit = () => listener(getAmbulanceRequests());

  const onStorage = (event: StorageEvent) => {
    if (event.key === AMBULANCE_REQUESTS_KEY) emit();
  };
  const onCustom = () => emit();

  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-ambulance-updated", onCustom);
  
  // Real-time Supabase remote subscription sync (Postgres CDC)
  const unsubscribeSupabase = subscribeSupabaseEmergencies((remoteRecord) => {
    const local = readRequests();
    const idx = local.findIndex((r) => r.id === remoteRecord.id);
    if (idx >= 0) {
      local[idx] = {
        ...local[idx],
        ...mapSupabaseToLocal(remoteRecord),
      };
      writeRequests(local);
    } else {
      const newReq = mapSupabaseToLocal(remoteRecord);
      writeRequests([newReq, ...local]);
    }
  });

  emit();

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-ambulance-updated", onCustom);
    unsubscribeSupabase();
  };
}

export function loginHospitalStaff(
  email: string,
  password: string,
): { ok: true; account: HospitalAccount } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const account = HOSPITAL_ACCOUNTS.find(
    (item) => item.email === normalized && item.password === password,
  );
  if (!account) {
    return {
      ok: false,
      error: "Invalid hospital credentials. Use a demo dispatch account.",
    };
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

export function statusLabel(status: AmbulanceRequestStatus) {
  switch (status) {
    case "PENDING":
    case "searching":
      return "SOS Pending Dispatch";
    case "REQUEST RECEIVED":
      return "Hospital Desk Received";
    case "HOSPITAL ACCEPTED":
    case "accepted":
      return "Hospital Accepted";
    case "AMBULANCE ASSIGNED":
      return "Ambulance & Paramedic Assigned";
    case "AMBULANCE EN ROUTE":
    case "AMBULANCE ON THE WAY":
    case "en_route":
      return "Ambulance En Route";
    case "AMBULANCE ARRIVED":
    case "HELP ARRIVED":
    case "arrived":
      return "Ambulance Arrived at Scene";
    case "PATIENT PICKED UP":
      return "Patient Picked Up (In Transit)";
    case "ARRIVED AT HOSPITAL":
      return "Arrived at Emergency Room";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
