export interface WaterEntry {
  id: string;
  amountMl: number;
  note?: string;
  at: string;
}

export interface FitnessBand {
  id: string;
  name: string;
  brand: string;
  model: string;
  connected: boolean;
  batteryPercent: number;
  lastSyncAt: string;
  monitoring: {
    heartRate: boolean;
    spo2: boolean;
    steps: boolean;
    sleep: boolean;
  };
}

export interface LiveVitals {
  heartRate: number;
  spo2: number;
  steps: number;
  updatedAt: string;
  source: "band" | "demo";
}

export interface AutoEmergencySettings {
  enabled: boolean;
  heartRateLowBpm: number;
  spo2LowPercent: number;
  confirmSeconds: number;
  hospitalId: string;
}

export const WATER_STORAGE_KEY = "zivan-water-log";
export const BAND_STORAGE_KEY = "zivan-fitness-band";
export const VITALS_STORAGE_KEY = "zivan-live-vitals";
export const AUTO_SOS_STORAGE_KEY = "zivan-auto-sos-settings";

export const WATER_PRESETS_ML = [100, 200, 250, 300, 500] as const;

export const FITNESS_BAND_OPTIONS = [
  {
    id: "zivan-pulse-one",
    name: "ZIVAN Pulse One",
    brand: "ZIVAN",
    model: "Pulse One",
  },
  {
    id: "fitlife-band-x",
    name: "FitLife Band X",
    brand: "FitLife",
    model: "Band X",
  },
  {
    id: "aura-watch-s",
    name: "Aura Watch S",
    brand: "Aura",
    model: "Watch S",
  },
] as const;

export const DEFAULT_AUTO_SOS: AutoEmergencySettings = {
  enabled: true,
  heartRateLowBpm: 45,
  spo2LowPercent: 90,
  confirmSeconds: 15,
  hospitalId: "city-hospital",
};
