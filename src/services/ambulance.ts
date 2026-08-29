import { createAmbulanceRequest } from "@/lib/ambulanceStore";

export interface AmbulanceService {
  requestNearby(patientName?: string): Promise<{
    status: "searching" | "found" | "unavailable";
    requestId?: string;
    etaMinutes?: number;
    demo: true;
    note: string;
  }>;
}

export const ambulanceService: AmbulanceService = {
  async requestNearby(patientName?: string) {
    if (typeof window === "undefined") {
      return {
        status: "searching" as const,
        demo: true as const,
        note: "Availability depends on connected services and regional infrastructure.",
      };
    }

    const request = createAmbulanceRequest({ patientName });
    return {
      status: "searching" as const,
      requestId: request.id,
      demo: true as const,
      note: "Request sent to connected hospital dispatch. Demo only — not a real ambulance call.",
    };
  },
};
