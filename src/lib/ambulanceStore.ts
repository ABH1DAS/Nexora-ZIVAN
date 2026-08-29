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
} from "@/lib/supabase";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readRequests(): AmbulanceRequest[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(AMBULANCE_REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AmbulanceRequest[];
  } catch {
    return [];
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
  updateSupabaseEmergency(id, {
    status: updated.status as any,
    driver_name: updated.driverName,
    vehicle_number: updated.vehicleNumber,
    ambulance_id: updated.ambulanceId,
    estimated_arrival_time: typeof updated.estimatedArrivalTime === "number" ? updated.estimatedArrivalTime : undefined,
    accepted_by: updated.acceptedBy,
  });

  return updated;
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
    estimatedArrivalTime?: number;
  }
) {
  return updateAmbulanceRequest(id, {
    status: "AMBULANCE ASSIGNED",
    ambulanceId: details.ambulanceId ?? `AMB-IND-${Math.floor(100 + Math.random() * 900)}`,
    driverName: details.driverName,
    vehicleNumber: details.vehicleNumber,
    estimatedArrivalTime: details.estimatedArrivalTime ?? 8,
    etaMinutes: details.estimatedArrivalTime ?? 8,
  });
}

export function markEnRoute(id: string) {
  return updateAmbulanceRequest(id, {
    status: "AMBULANCE EN ROUTE",
    distanceRemainingKm: 1.6,
    etaMinutes: 5,
  });
}

export function markArrived(id: string) {
  return updateAmbulanceRequest(id, {
    status: "AMBULANCE ARRIVED",
    distanceRemainingKm: 0,
    etaMinutes: 0,
  });
}

export function markPickedUp(id: string) {
  return updateAmbulanceRequest(id, {
    status: "PATIENT PICKED UP",
  });
}

export function markArrivedAtHospital(id: string) {
  return updateAmbulanceRequest(id, {
    status: "ARRIVED AT HOSPITAL",
  });
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

export function subscribeAmbulanceRequests(
  listener: (requests: AmbulanceRequest[]) => void,
) {
  if (!canUseStorage()) return () => undefined;

  const emit = () => listener(getAmbulanceRequests());

  const onStorage = (event: StorageEvent) => {
    if (event.key === AMBULANCE_REQUESTS_KEY) emit();
  };
  const onCustom = () => emit();

  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-ambulance-updated", onCustom);
  
  // Real-time Supabase remote subscription sync
  const unsubscribeSupabase = subscribeSupabaseEmergencies((remoteRecord) => {
    const local = readRequests();
    const idx = local.findIndex((r) => r.id === remoteRecord.id);
    if (idx >= 0) {
      local[idx] = {
        ...local[idx],
        status: remoteRecord.status as AmbulanceRequestStatus,
        driverName: remoteRecord.driver_name ?? local[idx].driverName,
        vehicleNumber: remoteRecord.vehicle_number ?? local[idx].vehicleNumber,
        ambulanceId: remoteRecord.ambulance_id ?? local[idx].ambulanceId,
        estimatedArrivalTime: remoteRecord.estimated_arrival_time ?? local[idx].estimatedArrivalTime,
        acceptedBy: remoteRecord.accepted_by ?? local[idx].acceptedBy,
      };
      writeRequests(local);
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
