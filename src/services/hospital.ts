import { hospitals, type Hospital } from "@/data/hospitals";

export interface HospitalService {
  findNearby(): Promise<Hospital[]>;
  notifyHospital(id: string): Promise<{ notified: boolean; demo: true; note: string }>;
}

export const hospitalService: HospitalService = {
  async findNearby() {
    return hospitals;
  },
  async notifyHospital(id: string) {
    const exists = hospitals.some((h) => h.id === id);
    return {
      notified: exists,
      demo: true as const,
      note: "Hospital notification requires a connected integration for the selected facility.",
    };
  },
};
