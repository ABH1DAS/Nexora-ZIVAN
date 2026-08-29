export interface Hospital {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy";
  distanceKm: number;
  address: string;
  open: boolean;
}

export const hospitals: Hospital[] = [
  {
    id: "city-hospital",
    name: "City Hospital",
    type: "hospital",
    distanceKm: 2.4,
    address: "12 Lake Avenue",
    open: true,
  },
  {
    id: "care-clinic",
    name: "Care Clinic",
    type: "clinic",
    distanceKm: 3.1,
    address: "88 Green Park Road",
    open: true,
  },
  {
    id: "health-pharmacy",
    name: "Health Pharmacy",
    type: "pharmacy",
    distanceKm: 1.2,
    address: "4 Market Street",
    open: true,
  },
  {
    id: "northside",
    name: "Northside Medical",
    type: "hospital",
    distanceKm: 4.6,
    address: "221 Riverfront Blvd",
    open: true,
  },
];
