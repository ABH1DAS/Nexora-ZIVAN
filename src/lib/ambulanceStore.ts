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
  patientName?: string;
  hospitalId?: string;
}): AmbulanceRequest {
  const preferred =
    hospitals.find((h) => h.id === input?.hospitalId && h.type === "hospital") ??
    hospitals.find((h) => h.type === "hospital") ??
    hospitals[0];

  const now = new Date().toISOString();
  const request: AmbulanceRequest = {
    id: `amb_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    patientName: input?.patientName ?? "ZIVAN Member",
    patientPhone: "+91 98XXX XXX00",
    locationLabel: "Near Lake Avenue · Demo pin",
    coordinates: { lat: 28.6139, lng: 77.209 },
    hospitalId: preferred.id,
    hospitalName: preferred.name,
    status: "searching",
    priority: "urgent",
    notes: "SOS activated from ZIVAN. Demo ambulance assistance request.",
    bloodGroup: emergencyProfile.bloodGroup,
    allergies: emergencyProfile.allergies,
    medications: emergencyProfile.medications,
    demo: true,
  };

  const next = [request, ...readRequests()];
  writeRequests(next);
  return request;
}

export function updateAmbulanceRequest(
  id: string,
  patch: Partial<
    Pick<
      AmbulanceRequest,
      "status" | "etaMinutes" | "acceptedBy" | "notes" | "hospitalId" | "hospitalName"
    >
  >,
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

export function acceptAmbulanceRequest(
  id: string,
  staffName: string,
  etaMinutes = 12,
) {
  return updateAmbulanceRequest(id, {
    status: "accepted",
    acceptedBy: staffName,
    etaMinutes,
  });
}

export function declineAmbulanceRequest(id: string, staffName: string) {
  return updateAmbulanceRequest(id, {
    status: "declined",
    acceptedBy: staffName,
  });
}

export function markAmbulanceEnRoute(id: string) {
  return updateAmbulanceRequest(id, { status: "en_route" });
}

export function markAmbulanceArrived(id: string) {
  return updateAmbulanceRequest(id, { status: "arrived" });
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
  emit();

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-ambulance-updated", onCustom);
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
    case "searching":
      return "Awaiting hospital";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    case "en_route":
      return "Ambulance en route";
    case "arrived":
      return "Arrived";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
