import { createAmbulanceRequest } from "@/lib/ambulanceStore";
import { fetchAvailableAmbulances, isSupabaseConfigured } from "@/lib/supabase";

export interface AmbulanceRequestResult {
  status: "searching" | "found" | "unavailable";
  requestId?: string;
  etaMinutes?: number;
  availableCount?: number;
  demo: true;
  note: string;
}

export interface AmbulanceService {
  requestNearby(opts?: {
    patientName?: string;
    patientPhone?: string;
    hospitalId?: string;
    locationLabel?: string;
    latitude?: number;
    longitude?: number;
    priority?: "critical" | "urgent" | "standard";
    notes?: string;
    bloodGroup?: string;
  }): Promise<AmbulanceRequestResult>;
}

export const ambulanceService: AmbulanceService = {
  async requestNearby(opts = {}) {
    if (typeof window === "undefined") {
      return {
        status: "searching" as const,
        demo: true as const,
        note: "Availability depends on connected services and regional infrastructure.",
      };
    }

    // Check how many ambulances are available at the target hospital
    let availableCount = 0;
    if (isSupabaseConfigured && opts.hospitalId) {
      const avail = await fetchAvailableAmbulances(opts.hospitalId);
      availableCount = avail.length;
    }

    const request = createAmbulanceRequest(opts);

    return {
      status: "searching" as const,
      requestId: request.id,
      availableCount,
      demo: true as const,
      note: isSupabaseConfigured
        ? "SOS dispatched to hospital — ambulance will be assigned shortly."
        : "Request sent to connected hospital dispatch. Demo only — not a real ambulance call.",
    };
  },
};
