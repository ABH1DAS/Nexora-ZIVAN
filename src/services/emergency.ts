import {
  insertSupabaseEmergency,
  subscribeSupabaseEmergencies,
  updateSupabaseEmergency,
  isSupabaseConfigured,
  type SupabaseEmergencyRecord,
} from "@/lib/supabase";

export type EmergencyStatus = "idle" | "active" | "resolved";

export interface EmergencyState {
  status: EmergencyStatus;
  locationSharing: boolean;
  contactNotified: boolean;
  ambulance: "pending" | "searching" | "found" | "unavailable";
  hospital: "pending" | "notified" | "unavailable";
  demo: true;
  /** Supabase record ID if persisted */
  recordId?: string;
}

export interface EmergencyService {
  activateSos(opts?: {
    patientName?: string;
    patientPhone?: string;
    locationLabel?: string;
    latitude?: number;
    longitude?: number;
    hospitalId?: string;
    hospitalName?: string;
    ambulanceType?: "government" | "private";
    doctorSpecialization?: string;
    icuRequirement?: boolean;
    notes?: string;
  }): Promise<EmergencyState>;

  resolveEmergency(recordId: string): Promise<boolean>;

  subscribeToUpdates(
    recordId: string,
    onChange: (record: SupabaseEmergencyRecord) => void
  ): () => void;

  getOfflineCapabilities(): {
    availableOffline: string[];
    requiresInternet: string[];
  };
}

export const emergencyService: EmergencyService = {
  /**
   * Activates SOS — inserts a live record into Supabase if configured,
   * otherwise returns a safe demo state.
   */
  async activateSos(opts = {}) {
    const {
      patientName = "Demo Patient",
      patientPhone,
      locationLabel = "Current Location",
      latitude = 28.6139,
      longitude = 77.209,
      hospitalId = "city-hospital",
      hospitalName = "City General Hospital",
      ambulanceType = "government",
      doctorSpecialization = "Emergency – Not Sure",
      icuRequirement = false,
      notes,
    } = opts;

    if (isSupabaseConfigured) {
      const record = await insertSupabaseEmergency({
        patient_id: `patient_${Date.now()}`,
        patient_name: patientName,
        patient_phone: patientPhone,
        location_label: locationLabel,
        latitude,
        longitude,
        hospital_id: hospitalId,
        hospital_name: hospitalName,
        status: "PENDING",
        priority: "urgent",
        ambulance_type: ambulanceType,
        doctor_specialization: doctorSpecialization,
        icu_requirement: icuRequirement,
        notes,
      });

      return {
        status: "active" as const,
        locationSharing: true,
        contactNotified: true,
        ambulance: "searching" as const,
        hospital: "notified" as const,
        demo: true as const,
        recordId: record?.id,
      };
    }

    // Demo fallback
    return {
      status: "active" as const,
      locationSharing: true,
      contactNotified: true,
      ambulance: "searching" as const,
      hospital: "pending" as const,
      demo: true as const,
    };
  },

  /**
   * Marks an emergency as CANCELLED/resolved in Supabase.
   */
  async resolveEmergency(recordId: string) {
    if (!isSupabaseConfigured || !recordId) return false;
    return updateSupabaseEmergency(recordId, { status: "CANCELLED" });
  },

  /**
   * Subscribe to real-time status changes for a specific emergency record.
   */
  subscribeToUpdates(recordId, onChange) {
    return subscribeSupabaseEmergencies((record) => {
      if (record.id === recordId) onChange(record);
    });
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
