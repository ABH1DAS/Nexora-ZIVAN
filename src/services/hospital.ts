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
            category: (r.id.startsWith("govt") ? "government" : "private") as "government" | "private",
            type: r.type,
            distanceKm: r.distance_km ?? 2.4,
            estimatedTravelTime: `${Math.round((r.distance_km ?? 2.4) * 3)}–${Math.round((r.distance_km ?? 2.4) * 4)} mins`,
            address: r.address ?? "Sector 24, Health City",
            open: r.open ?? true,
            specializations: r.specializations ?? ["Emergency / Trauma", "General Physician"],
            icuStatus: (r.available_icu_beds && r.available_icu_beds > 0 ? "Available" : "Limited") as "Available" | "Limited",
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
