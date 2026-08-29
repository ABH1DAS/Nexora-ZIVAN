export type AmbulanceRequestStatus =
  | "searching"
  | "accepted"
  | "declined"
  | "en_route"
  | "arrived"
  | "cancelled"
  | "PENDING"
  | "REQUEST RECEIVED"
  | "HOSPITAL ACCEPTED"
  | "AMBULANCE ASSIGNED"
  | "AMBULANCE EN ROUTE"
  | "AMBULANCE ON THE WAY"
  | "AMBULANCE ARRIVED"
  | "HELP ARRIVED"
  | "PATIENT PICKED UP"
  | "ARRIVED AT HOSPITAL";

export type EmergencyTimelineStep =
  | "PENDING"
  | "REQUEST RECEIVED"
  | "HOSPITAL ACCEPTED"
  | "AMBULANCE ASSIGNED"
  | "AMBULANCE EN ROUTE"
  | "AMBULANCE ARRIVED"
  | "PATIENT PICKED UP"
  | "ARRIVED AT HOSPITAL";

export function getTimelineStep(status: AmbulanceRequestStatus): EmergencyTimelineStep {
  switch (status) {
    case "PENDING":
    case "searching":
      return "PENDING";
    case "REQUEST RECEIVED":
      return "REQUEST RECEIVED";
    case "accepted":
    case "HOSPITAL ACCEPTED":
      return "HOSPITAL ACCEPTED";
    case "AMBULANCE ASSIGNED":
      return "AMBULANCE ASSIGNED";
    case "en_route":
    case "AMBULANCE EN ROUTE":
    case "AMBULANCE ON THE WAY":
      return "AMBULANCE EN ROUTE";
    case "arrived":
    case "AMBULANCE ARRIVED":
    case "HELP ARRIVED":
      return "AMBULANCE ARRIVED";
    case "PATIENT PICKED UP":
      return "PATIENT PICKED UP";
    case "ARRIVED AT HOSPITAL":
      return "ARRIVED AT HOSPITAL";
    default:
      return "PENDING";
  }
}

export type AmbulanceType = "government" | "private" | "icu";

export interface AmbulanceRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  patientId?: string;
  patientName: string;
  patientPhone?: string;
  locationLabel: string;
  coordinates: { lat: number; lng: number };
  hospitalId: string;
  hospitalName: string;
  hospitalCategory?: "government" | "private";
  status: AmbulanceRequestStatus;
  priority: "critical" | "urgent" | "standard";
  notes: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  
  // Extended SOS Fields
  ambulanceType: AmbulanceType;
  doctorSpecialization: string;
  estimatedPrivateFare?: string;
  icuRequirement: boolean;
  
  // Live Tracking Fields
  ambulanceId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  ambulanceLocation?: { lat: number; lng: number };
  estimatedArrivalTime?: number | string;
  distanceRemainingKm?: number;
  
  etaMinutes?: number;
  acceptedBy?: string;
  allocatedBed?: string;
  bloodCrossMatched?: boolean;
  handoverNotes?: string;
  vitals?: {
    hr?: number;
    bp?: string;
    spo2?: number;
    rr?: number;
    temp?: number;
  };
  demo?: boolean;
}

export interface HospitalAccount {
  id: string;
  hospitalId: string;
  hospitalName: string;
  email: string;
  password: string;
  contactName: string;
}

export const HOSPITAL_ACCOUNTS: HospitalAccount[] = [
  {
    id: "staff-aiims",
    hospitalId: "govt-aiims-central",
    hospitalName: "AIIMS Central Emergency & Trauma Center",
    email: "dispatch@aiims.demo",
    password: "hospital123",
    contactName: "AIIMS Trauma Desk",
  },
  {
    id: "staff-city",
    hospitalId: "city-hospital",
    hospitalName: "City Super-Specialty Hospital",
    email: "dispatch@cityhospital.demo",
    password: "hospital123",
    contactName: "City Dispatch Desk",
  },
  {
    id: "staff-northside",
    hospitalId: "northside",
    hospitalName: "Max Life Heart & Neurological Institute",
    email: "er@northside.demo",
    password: "hospital123",
    contactName: "Max Life ER Desk",
  },
];

export const AMBULANCE_REQUESTS_KEY = "zivan-ambulance-requests";
export const HOSPITAL_SESSION_KEY = "zivan-hospital-session";
