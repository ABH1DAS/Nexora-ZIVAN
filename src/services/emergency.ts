export type EmergencyStatus = "idle" | "active" | "resolved";

export interface EmergencyState {
  status: EmergencyStatus;
  locationSharing: boolean;
  contactNotified: boolean;
  ambulance: "pending" | "searching" | "found" | "unavailable";
  hospital: "pending" | "notified" | "unavailable";
  demo: true;
}

export interface EmergencyService {
  activateSos(): Promise<EmergencyState>;
  getOfflineCapabilities(): {
    availableOffline: string[];
    requiresInternet: string[];
  };
}

export const emergencyService: EmergencyService = {
  async activateSos() {
    return {
      status: "active" as const,
      locationSharing: true,
      contactNotified: true,
      ambulance: "searching" as const,
      hospital: "pending" as const,
      demo: true as const,
    };
  },
  getOfflineCapabilities() {
    return {
      availableOffline: [
        "Emergency contacts",
        "Emergency health profile",
        "Basic emergency guidance",
      ],
      requiresInternet: [
        "Live location",
        "Ambulance availability",
        "Hospital notification",
        "Real-time tracking",
        "AI assistant",
      ],
    };
  },
};
