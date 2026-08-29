export type AmbulanceRequestStatus =
  | "searching"
  | "accepted"
  | "declined"
  | "en_route"
  | "arrived"
  | "cancelled";

export interface AmbulanceRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  patientName: string;
  patientPhone?: string;
  locationLabel: string;
  coordinates: { lat: number; lng: number };
  hospitalId: string;
  hospitalName: string;
  status: AmbulanceRequestStatus;
  priority: "critical" | "urgent" | "standard";
  notes: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  etaMinutes?: number;
  acceptedBy?: string;
  demo: true;
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
    id: "staff-city",
    hospitalId: "city-hospital",
    hospitalName: "City Hospital",
    email: "dispatch@cityhospital.demo",
    password: "hospital123",
    contactName: "City Dispatch Desk",
  },
  {
    id: "staff-northside",
    hospitalId: "northside",
    hospitalName: "Northside Medical",
    email: "er@northside.demo",
    password: "hospital123",
    contactName: "Northside ER Desk",
  },
];

export const AMBULANCE_REQUESTS_KEY = "zivan-ambulance-requests";
export const HOSPITAL_SESSION_KEY = "zivan-hospital-session";
