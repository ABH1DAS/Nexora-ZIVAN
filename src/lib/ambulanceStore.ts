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

const INITIAL_DEMO_REQUESTS: AmbulanceRequest[] = [
  {
    id: "amb_sample_01",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Rahul Sharma",
    patientPhone: "+91 98111 22334",
    locationLabel: "Near Lake Avenue, Block C · Demo pin",
    coordinates: { lat: 28.6139, lng: 77.209 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "en_route",
    priority: "critical",
    notes: "Severe shortness of breath, acute chest pain radiating to left arm.",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Amlodipine 5mg"],
    etaMinutes: 7,
    acceptedBy: "City Dispatch Desk",
    allocatedBed: "Trauma Bay 01 (Resus)",
    vitals: {
      hr: 114,
      bp: "142/92",
      spo2: 93,
      rr: 24,
      temp: 37.8,
    },
    handoverNotes: "ECG shows ST-segment elevation. 300mg Aspirin administered en-route. High-flow O2 started at 4L/min.",
    bloodCrossMatched: true,
    demo: true,
  },
  {
    id: "amb_sample_02",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Ananya Deshmukh",
    patientPhone: "+91 98222 44556",
    locationLabel: "Riverfront Park, Gate 2 · Demo pin",
    coordinates: { lat: 28.6185, lng: 77.215 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "searching",
    priority: "urgent",
    notes: "Fall injury with severe swelling and deformity in right ankle.",
    bloodGroup: "B+",
    allergies: ["Sulfa drugs"],
    medications: ["Thyroxine 50mcg"],
    vitals: {
      hr: 88,
      bp: "128/82",
      spo2: 98,
      rr: 18,
      temp: 36.9,
    },
    demo: true,
  },
  {
    id: "amb_sample_03",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Kunal Verma",
    patientPhone: "+91 98333 66778",
    locationLabel: "Market Complex, Sector 4 · Demo pin",
    coordinates: { lat: 28.6092, lng: 77.201 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "arrived",
    priority: "standard",
    notes: "Acute abdominal pain, stabilized on arrival.",
    bloodGroup: "A+",
    allergies: ["None"],
    medications: ["None"],
    etaMinutes: 0,
    acceptedBy: "City Dispatch Desk",
    allocatedBed: "General Bed 12",
    vitals: {
      hr: 76,
      bp: "118/76",
      spo2: 99,
      rr: 16,
      temp: 36.7,
    },
    handoverNotes: "Ultrasound completed in ER triage. Handed over to Dr. Sonal Patel.",
    demo: true,
  },
];

function readRequests(): AmbulanceRequest[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(AMBULANCE_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(AMBULANCE_REQUESTS_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return INITIAL_DEMO_REQUESTS;
    }
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
    vitals: {
      hr: 92,
      bp: "125/80",
      spo2: 97,
      rr: 19,
      temp: 37.1,
    },
    demo: true,
  };

  const next = [request, ...readRequests()];
  writeRequests(next);
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
  return updated;
}

export function assignBedToRequest(id: string, allocatedBed: string) {
  return updateAmbulanceRequest(id, { allocatedBed });
}

export function setBloodCrossMatch(id: string, bloodCrossMatched: boolean) {
  return updateAmbulanceRequest(id, { bloodCrossMatched });
}

export function updateHandoverNotes(id: string, handoverNotes: string) {
  return updateAmbulanceRequest(id, { handoverNotes });
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
