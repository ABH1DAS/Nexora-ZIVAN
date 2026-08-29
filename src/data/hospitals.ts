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
  estimatedFare?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  totalBeds?: number;
  availableBeds?: number;
  phone?: string;
}

export const hospitals: Hospital[] = [
  // ─── Government Hospitals (Nearby 26.1722, 91.7594) ──────────────────────────
  {
    id: "govt-gmch-trauma",
    name: "GMCH Emergency Trauma Center",
    category: "government",
    type: "hospital",
    distanceKm: 2.1,
    estimatedTravelTime: "5–7 mins",
    address: "Narakasur Hilltop, Bhangagarh, Guwahati, Assam 781032",
    open: true,
    specializations: [
      "Emergency / Trauma",
      "Cardiologist",
      "Neurologist",
      "Orthopedic",
      "General Physician",
      "Pediatrician",
    ],
    icuStatus: "Available",
    coordinates: { lat: 26.1557, lng: 91.7706 },
    totalBeds: 350,
    availableBeds: 45,
    phone: "+91 361 252 9457",
  },
  {
    id: "govt-bbci-center",
    name: "Dr. B. Borooah Medical Center",
    category: "government",
    type: "hospital",
    distanceKm: 1.4,
    estimatedTravelTime: "4–6 mins",
    address: "Gopinath Nagar, AK Azad Road, Guwahati, Assam 781016",
    open: true,
    specializations: [
      "Emergency Medicine",
      "General Physician",
      "Oncology",
      "Cardiologist",
    ],
    icuStatus: "Available",
    coordinates: { lat: 26.1601, lng: 91.7554 },
    totalBeds: 180,
    availableBeds: 19,
    phone: "+91 361 247 0179",
  },
  {
    id: "govt-mmch-civil",
    name: "MMCH District Civil Hospital",
    category: "government",
    type: "hospital",
    distanceKm: 2.3,
    estimatedTravelTime: "6–9 mins",
    address: "MG Road, Panbazar, Guwahati, Assam 781001",
    open: true,
    specializations: [
      "General Physician",
      "Emergency / Trauma",
      "Gynecologist",
      "Pediatrician",
    ],
    icuStatus: "Available",
    coordinates: { lat: 26.1882, lng: 91.7450 },
    totalBeds: 200,
    availableBeds: 24,
    phone: "+91 361 254 0400",
  },

  // ─── Private Super-Specialty Hospitals (Nearby 26.1722, 91.7594) ─────────────
  {
    id: "pvt-gnrc-dispur",
    name: "GNRC Super-Specialty Hospital",
    category: "private",
    type: "hospital",
    distanceKm: 3.4,
    estimatedTravelTime: "7–10 mins",
    address: "GNRC Complex, Dispur, GS Road, Guwahati, Assam 781006",
    open: true,
    specializations: [
      "Neurologist",
      "Cardiologist",
      "Orthopedic",
      "Emergency / Trauma",
      "General Physician",
    ],
    icuStatus: "Available",
    estimatedFare: "₹450–₹650 (Est.)",
    coordinates: { lat: 26.1424, lng: 91.7905 },
    totalBeds: 220,
    availableBeds: 28,
    phone: "+91 361 222 7700",
  },
  {
    id: "pvt-hayat-hospital",
    name: "Hayat Super Specialty Hospital",
    category: "private",
    type: "hospital",
    distanceKm: 2.9,
    estimatedTravelTime: "6–9 mins",
    address: "Lal Ganesh, Kahilipara, Guwahati, Assam 781019",
    open: true,
    specializations: [
      "Emergency / Trauma",
      "Orthopedic",
      "Pediatrician",
      "Cardiologist",
      "General Physician",
    ],
    icuStatus: "Available",
    estimatedFare: "₹400–₹600 (Est.)",
    coordinates: { lat: 26.1512, lng: 91.7820 },
    totalBeds: 160,
    availableBeds: 21,
    phone: "+91 361 710 4444",
  },
  {
    id: "pvt-dispur-hospital",
    name: "Dispur Hospital",
    category: "private",
    type: "hospital",
    distanceKm: 3.3,
    estimatedTravelTime: "7–10 mins",
    address: "Ganeshguri, Dispur, Guwahati, Assam 781006",
    open: true,
    specializations: [
      "General Physician",
      "Orthopedic",
      "Pediatrician",
      "Gynecologist",
    ],
    icuStatus: "Limited",
    estimatedFare: "₹350–₹500 (Est.)",
    coordinates: { lat: 26.1435, lng: 91.7880 },
    totalBeds: 130,
    availableBeds: 16,
    phone: "+91 361 226 2154",
  },
  {
    id: "pvt-apollo-excelcare",
    name: "Apollo Excelcare Hospital",
    category: "private",
    type: "hospital",
    distanceKm: 4.5,
    estimatedTravelTime: "10–13 mins",
    address: "NH-37, Paschim Boragaon, Guwahati, Assam 781033",
    open: true,
    specializations: [
      "Cardiologist",
      "Neurologist",
      "Emergency / Trauma",
      "Orthopedic",
      "General Physician",
    ],
    icuStatus: "Available",
    estimatedFare: "₹600–₹900 (Est.)",
    coordinates: { lat: 26.1360, lng: 91.7370 },
    totalBeds: 250,
    availableBeds: 32,
    phone: "+91 361 234 7700",
  },
];
