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

export const INITIAL_DEMO_REQUESTS: AmbulanceRequest[] = [
  // 1. Critical En-Route with STEMI (City Hospital)
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
    vitals: {
      hr: 116,
      bp: "146/92",
      spo2: 92,
      rr: 24,
      temp: 37.8,
    },
    handoverNotes: "12-lead ECG confirms 3mm ST elevation in V1-V4. Aspirin 300mg chewed, Ticagrelor 180mg given. 4L/min O2 via nasal cannula. 18G IV in left ACF.",
    bloodCrossMatched: true,
    demo: true,
  },
  // 2. Critical En-Route with Major Trauma (City Hospital)
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
    notes: "28yo female involved in high-speed vehicular collision. Seatbelt sign, blunt abdominal trauma, closed right femur deformity.",
    bloodGroup: "B-",
    allergies: ["Sulfa drugs", "Latex"],
    medications: ["None"],
    etaMinutes: 8,
    acceptedBy: "Paramedic Unit Bravo-02",
    allocatedBed: "Trauma Bay 02",
    vitals: {
      hr: 126,
      bp: "98/64",
      spo2: 94,
      rr: 26,
      temp: 36.4,
    },
    handoverNotes: "C-spine immobilized with rigid collar. Pelvic binder placed. Bilateral large-bore 16G IV lines running 1000mL warm saline. Massive transfusion protocol standby requested.",
    bloodCrossMatched: false,
    demo: true,
  },
  // 3. Urgent En-Route with Severe Asthma (City Hospital)
  {
    id: "amb_sample_03",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Amitabh Banerjee",
    patientPhone: "+91 98333 44556",
    locationLabel: "Green Glen Colony, Block D-12 · Unit Charlie-03",
    coordinates: { lat: 28.6045, lng: 77.198 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "en_route",
    priority: "urgent",
    notes: "64yo male acute severe exacerbation of bronchial asthma. Tripoding with audible expiratory wheeze and speaking in single words.",
    bloodGroup: "AB+",
    allergies: ["Aspirin", "NSAIDs"],
    medications: ["Salbutamol Inhaler", "Montelukast 10mg"],
    etaMinutes: 11,
    acceptedBy: "Paramedic Unit Charlie-03",
    allocatedBed: "Cardiac Resus 01",
    vitals: {
      hr: 108,
      bp: "134/86",
      spo2: 91,
      rr: 28,
      temp: 37.1,
    },
    handoverNotes: "Nebulized Salbutamol 5mg + Ipratropium 500mcg administered x2 en-route. IV Hydrocortisone 200mg given. Non-rebreather mask at 12L/min.",
    bloodCrossMatched: true,
    demo: true,
  },
  // 4. Urgent Accepted / Pre-Term Labor (City Hospital)
  {
    id: "amb_sample_04",
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Meera Sen",
    patientPhone: "+91 98444 88990",
    locationLabel: "Sunrise Apartments, 4th Floor · Unit Delta-04",
    coordinates: { lat: 28.618, lng: 77.225 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "accepted",
    priority: "urgent",
    notes: "34yo female G2P1 at 33 weeks gestation with active uterine contractions every 3 mins and spontaneous rupture of membranes.",
    bloodGroup: "A-",
    allergies: ["None"],
    medications: ["Prenatal Vitamins", "Iron Supplement"],
    etaMinutes: 14,
    acceptedBy: "Paramedic Unit Delta-04",
    allocatedBed: "Paediatric ER 04",
    vitals: {
      hr: 94,
      bp: "124/80",
      spo2: 99,
      rr: 18,
      temp: 37.0,
    },
    handoverNotes: "Left lateral tilt position maintained. Fetal heart rate monitored via Doppler at 144 BPM. Obstetric team pre-alerted.",
    bloodCrossMatched: false,
    demo: true,
  },
  // 5. Critical Incoming SOS (Searching) (City Hospital)
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
    notes: "58yo male sudden onset right-sided hemiplegia and expressive aphasia. Last known normal 35 mins ago. Code Stroke team activation needed on arrival.",
    bloodGroup: "O-",
    allergies: ["Contrast Dye"],
    medications: ["Metformin 500mg", "Telmisartan 40mg"],
    vitals: {
      hr: 90,
      bp: "172/102",
      spo2: 97,
      rr: 19,
      temp: 36.8,
    },
    demo: true,
  },
  // 6. Urgent Incoming SOS (Searching) (City Hospital)
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
    notes: "41yo female suffered high-impact fall from stairs with visible compound deformity in right lower leg/ankle, severe pain.",
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
  // 7. Arrived Patient (Stabilized in ER Bay) (City Hospital)
  {
    id: "amb_sample_07",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Kunal Verma",
    patientPhone: "+91 98333 66778",
    locationLabel: "Market Complex, Sector 4 · Unit Echo-05",
    coordinates: { lat: 28.6092, lng: 77.201 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "arrived",
    priority: "standard",
    notes: "29yo male with 14h progressive periumbilical to right lower quadrant pain with nausea and localized tenderness at McBurney's point.",
    bloodGroup: "A+",
    allergies: ["None"],
    medications: ["None"],
    etaMinutes: 0,
    acceptedBy: "Paramedic Unit Echo-05",
    allocatedBed: "General ER 12",
    vitals: {
      hr: 78,
      bp: "120/78",
      spo2: 99,
      rr: 16,
      temp: 37.6,
    },
    handoverNotes: "Patient received in ER Bay 12. Abdominal ultrasound requested. Handed over to On-call General Surgery Registrar Dr. Sonal Patel.",
    bloodCrossMatched: true,
    demo: true,
  },
  // 8. Arrived Patient (Under ICU Observation) (City Hospital)
  {
    id: "amb_sample_08",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Sunita Roy",
    patientPhone: "+91 98666 99887",
    locationLabel: "Civil Lines, House 19 · Unit Alpha-01",
    coordinates: { lat: 28.624, lng: 77.212 },
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    status: "arrived",
    priority: "urgent",
    notes: "49yo female Type 1 Diabetic with altered sensorium, Kussmaul breathing, and blood glucose 480 mg/dL.",
    bloodGroup: "B+",
    allergies: ["Ciprofloxacin"],
    medications: ["Insulin Glargine", "Metformin"],
    etaMinutes: 0,
    acceptedBy: "Paramedic Unit Alpha-01",
    allocatedBed: "ICU Bed 03",
    vitals: {
      hr: 84,
      bp: "118/76",
      spo2: 98,
      rr: 20,
      temp: 37.2,
    },
    handoverNotes: "2000mL IV fluid hydration delivered. IV regular insulin infusion protocol started. Arterial blood gas pH 7.21, HCO3 11 mEq/L.",
    bloodCrossMatched: true,
    demo: true,
  },

  // 9. Northside Medical - Critical En Route
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
    notes: "Cardiac arrest with return of spontaneous circulation (ROSC) post-defibrillation. Requires targeted hypothermia and immediate cath lab.",
    bloodGroup: "O+",
    allergies: ["Penicillin"],
    medications: ["Metoprolol"],
    etaMinutes: 6,
    acceptedBy: "Northside Medic 1",
    allocatedBed: "Trauma Bay 01 (Resus)",
    vitals: {
      hr: 112,
      bp: "110/70",
      spo2: 95,
      rr: 22,
      temp: 37.0,
    },
    handoverNotes: "Post-cardiac arrest care initiated. Targeted temperature management ready.",
    bloodCrossMatched: true,
    demo: true,
  },
  // 10. Northside Medical - Urgent En Route
  {
    id: "amb_north_02",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: "Deepika Joshi",
    patientPhone: "+91 98222 77665",
    locationLabel: "Sector 18 Market · Northside Medic 2",
    coordinates: { lat: 28.629, lng: 77.219 },
    hospitalId: "northside",
    hospitalName: "Northside Medical",
    status: "en_route",
    priority: "urgent",
    notes: "Severe anaphylactic reaction following bee sting. Epinephrine 0.5mg IM administered.",
    bloodGroup: "A+",
    allergies: ["Insect Venom"],
    medications: ["Cetirizine"],
    etaMinutes: 9,
    acceptedBy: "Northside Medic 2",
    allocatedBed: "Trauma Bay 02",
    vitals: {
      hr: 104,
      bp: "116/74",
      spo2: 97,
      rr: 20,
      temp: 37.1,
    },
    handoverNotes: "Stridor resolved post-epinephrine. Nebulized salbutamol running.",
    bloodCrossMatched: true,
    demo: true,
  },
  // 11. Northside Medical - Pending SOS
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
    vitals: {
      hr: 82,
      bp: "130/84",
      spo2: 98,
      rr: 18,
      temp: 36.8,
    },
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
    const parsed = JSON.parse(raw) as AmbulanceRequest[];
    // If the storage only contains the old minimal 3 items, upgrade to the rich demo suite
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
