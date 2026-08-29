export type HospitalCategory = "government" | "private";
export type IcuStatus = "Available" | "Limited" | "Not Available";

export interface Hospital {
  id: string;
  name: string;
  category: HospitalCategory;
  type: "hospital" | "clinic" | "pharmacy";
  distanceKm: number;
  estimatedTravelTime: string;
  address: string;
  open: boolean;
  specializations: string[];
  icuStatus: IcuStatus;
  estimatedFare?: string; // For private hospitals / private ambulance estimate
}

export const hospitals: Hospital[] = [
  // ─── Government Hospitals ──────────────────────────────────────────────
  {
    id: "govt-aiims-central",
    name: "AIIMS Central Emergency & Trauma Center",
    category: "government",
    type: "hospital",
    distanceKm: 1.8,
    estimatedTravelTime: "5–8 mins",
    address: "Ring Road, Metro Zone 4",
    open: true,
    specializations: [
      "Emergency / Trauma",
      "Cardiologist",
      "Neurologist",
      "General Physician",
      "Pediatrician",
      "Orthopedic",
    ],
    icuStatus: "Available",
  },
  {
    id: "govt-safdarjung-civil",
    name: "District Civil General Hospital",
    category: "government",
    type: "hospital",
    distanceKm: 3.4,
    estimatedTravelTime: "10–14 mins",
    address: "77 Hospital Road, Sector 12",
    open: true,
    specializations: [
      "General Physician",
      "Emergency / Trauma",
      "Gynecologist",
      "Pediatrician",
    ],
    icuStatus: "Limited",
  },
  {
    id: "govt-metro-trauma",
    name: "Apex Public Medical Center",
    category: "government",
    type: "hospital",
    distanceKm: 5.2,
    estimatedTravelTime: "14–18 mins",
    address: "102 National Highway Bypass",
    open: true,
    specializations: [
      "Orthopedic",
      "General Physician",
      "Emergency / Trauma",
    ],
    icuStatus: "Available",
  },

  // ─── Private Hospitals ─────────────────────────────────────────────────
  {
    id: "city-hospital",
    name: "City Super-Specialty Hospital",
    category: "private",
    type: "hospital",
    distanceKm: 2.4,
    estimatedTravelTime: "7–10 mins",
    address: "12 Lake Avenue, Central Metro",
    open: true,
    specializations: [
      "Cardiologist",
      "Neurologist",
      "Orthopedic",
      "Emergency / Trauma",
      "General Physician",
    ],
    icuStatus: "Available",
    estimatedFare: "₹450–₹700 (Est.)",
  },
  {
    id: "northside",
    name: "Max Life Heart & Neurological Institute",
    category: "private",
    type: "hospital",
    distanceKm: 4.6,
    estimatedTravelTime: "12–15 mins",
    address: "221 Riverfront Blvd",
    open: true,
    specializations: [
      "Cardiologist",
      "Neurologist",
      "Gynecologist",
      "General Physician",
    ],
    icuStatus: "Limited",
    estimatedFare: "₹600–₹950 (Est.)",
  },
  {
    id: "pvt-fortis-care",
    name: "Fortis Medicare Emergency Center",
    category: "private",
    type: "hospital",
    distanceKm: 6.1,
    estimatedTravelTime: "16–20 mins",
    address: "45 Healthcare Park",
    open: true,
    specializations: [
      "Emergency / Trauma",
      "Orthopedic",
      "Pediatrician",
      "Cardiologist",
    ],
    icuStatus: "Available",
    estimatedFare: "₹750–₹1,200 (Est.)",
  },
  {
    id: "care-clinic",
    name: "Care Family Health Clinic",
    category: "private",
    type: "clinic",
    distanceKm: 3.1,
    estimatedTravelTime: "8–11 mins",
    address: "88 Green Park Road",
    open: true,
    specializations: ["General Physician", "Pediatrician"],
    icuStatus: "Not Available",
    estimatedFare: "₹350–₹500 (Est.)",
  },
];
