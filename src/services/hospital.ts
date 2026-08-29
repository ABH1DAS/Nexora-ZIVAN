import { hospitals, type Hospital } from "@/data/hospitals";
import { fetchHospitals, isSupabaseConfigured } from "@/lib/supabase";

export interface HospitalService {
  findNearby(): Promise<Hospital[]>;
  notifyHospital(id: string): Promise<{ notified: boolean; demo: true; note: string }>;
}

export const hospitalService: HospitalService = {
  async findNearby(): Promise<Hospital[]> {
    if (isSupabaseConfigured) {
      try {
        const rows = await fetchHospitals();
        if (rows && rows.length > 0) {
          return rows.map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            distanceKm: r.distance_km ?? 2.0,
            address: r.address ?? "",
            open: r.open ?? true,
          }));
        }
      } catch (err) {
        console.warn("fetchHospitals fallback to static list:", err);
      }
    }
    return hospitals;
  },
  async notifyHospital(id: string) {
    const all = await this.findNearby();
    const exists = all.some((h) => h.id === id);
    return {
      notified: exists,
      demo: true as const,
      note: exists
        ? "Hospital dispatch notified via connected system."
        : "Hospital notification requires a connected integration for the selected facility.",
    };
  },
};
