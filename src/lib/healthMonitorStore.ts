import {
  AUTO_SOS_STORAGE_KEY,
  BAND_STORAGE_KEY,
  DEFAULT_AUTO_SOS,
  FITNESS_BAND_OPTIONS,
  VITALS_STORAGE_KEY,
  WATER_STORAGE_KEY,
  type AutoEmergencySettings,
  type FitnessBand,
  type LiveVitals,
  type WaterEntry,
} from "@/data/devices";
import { todayMetrics } from "@/data/healthData";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T, eventName: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(eventName, { detail: value }));
}

export function getWaterEntries(): WaterEntry[] {
  return readJson<WaterEntry[]>(WATER_STORAGE_KEY, []).sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export function getWaterTotalMl() {
  return getWaterEntries().reduce((sum, entry) => sum + entry.amountMl, 0);
}

export function getWaterTotalLiters() {
  return Math.round((getWaterTotalMl() / 1000) * 10) / 10;
}

export function addWaterEntry(amountMl: number, note?: string): WaterEntry {
  const entry: WaterEntry = {
    id: `water_${Date.now()}`,
    amountMl,
    note: note?.trim() || undefined,
    at: new Date().toISOString(),
  };
  const next = [entry, ...getWaterEntries()];
  writeJson(WATER_STORAGE_KEY, next, "zivan-water-updated");
  return entry;
}

export function removeWaterEntry(id: string) {
  const next = getWaterEntries().filter((entry) => entry.id !== id);
  writeJson(WATER_STORAGE_KEY, next, "zivan-water-updated");
}

export function subscribeWater(listener: (entries: WaterEntry[]) => void) {
  if (!canUseStorage()) return () => undefined;
  const emit = () => listener(getWaterEntries());
  const onStorage = (event: StorageEvent) => {
    if (event.key === WATER_STORAGE_KEY) emit();
  };
  const onCustom = () => emit();
  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-water-updated", onCustom);
  emit();
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-water-updated", onCustom);
  };
}

export function getFitnessBand(): FitnessBand | null {
  return readJson<FitnessBand | null>(BAND_STORAGE_KEY, null);
}

export function connectFitnessBand(optionId: string): FitnessBand {
  const option =
    FITNESS_BAND_OPTIONS.find((item) => item.id === optionId) ??
    FITNESS_BAND_OPTIONS[0];
  const band: FitnessBand = {
    id: option.id,
    name: option.name,
    brand: option.brand,
    model: option.model,
    connected: true,
    batteryPercent: 86,
    lastSyncAt: new Date().toISOString(),
    monitoring: {
      heartRate: true,
      spo2: true,
      steps: true,
      sleep: true,
    },
  };
  writeJson(BAND_STORAGE_KEY, band, "zivan-band-updated");
  const vitals = getLiveVitals();
  setLiveVitals({
    ...vitals,
    source: "band",
    updatedAt: new Date().toISOString(),
  });
  return band;
}

export function disconnectFitnessBand() {
  if (!canUseStorage()) return;
  localStorage.removeItem(BAND_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("zivan-band-updated", { detail: null }));
}

export function subscribeBand(listener: (band: FitnessBand | null) => void) {
  if (!canUseStorage()) return () => undefined;
  const emit = () => listener(getFitnessBand());
  const onStorage = (event: StorageEvent) => {
    if (event.key === BAND_STORAGE_KEY) emit();
  };
  const onCustom = () => emit();
  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-band-updated", onCustom);
  emit();
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-band-updated", onCustom);
  };
}

export function getLiveVitals(): LiveVitals {
  return readJson<LiveVitals>(VITALS_STORAGE_KEY, {
    heartRate: todayMetrics.heartRate,
    spo2: todayMetrics.spo2,
    steps: todayMetrics.steps,
    updatedAt: new Date().toISOString(),
    source: "demo",
  });
}

export function setLiveVitals(vitals: LiveVitals) {
  writeJson(VITALS_STORAGE_KEY, vitals, "zivan-vitals-updated");
}

export function updateLiveVitals(patch: Partial<LiveVitals>) {
  const next = {
    ...getLiveVitals(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  setLiveVitals(next);
  return next;
}

export function subscribeVitals(listener: (vitals: LiveVitals) => void) {
  if (!canUseStorage()) return () => undefined;
  const emit = () => listener(getLiveVitals());
  const onStorage = (event: StorageEvent) => {
    if (event.key === VITALS_STORAGE_KEY) emit();
  };
  const onCustom = () => emit();
  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-vitals-updated", onCustom);
  emit();
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-vitals-updated", onCustom);
  };
}

export function getAutoEmergencySettings(): AutoEmergencySettings {
  return {
    ...DEFAULT_AUTO_SOS,
    ...readJson<Partial<AutoEmergencySettings>>(AUTO_SOS_STORAGE_KEY, {}),
  };
}

export function saveAutoEmergencySettings(
  settings: AutoEmergencySettings,
) {
  writeJson(AUTO_SOS_STORAGE_KEY, settings, "zivan-auto-sos-updated");
}

export function subscribeAutoEmergencySettings(
  listener: (settings: AutoEmergencySettings) => void,
) {
  if (!canUseStorage()) return () => undefined;
  const emit = () => listener(getAutoEmergencySettings());
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTO_SOS_STORAGE_KEY) emit();
  };
  const onCustom = () => emit();
  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-auto-sos-updated", onCustom);
  emit();
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-auto-sos-updated", onCustom);
  };
}

export type EmergencyTriggerReason =
  | "heart_rate_drop"
  | "spo2_drop"
  | "manual_simulation";

export function evaluateEmergencyTriggers(
  vitals: LiveVitals,
  settings: AutoEmergencySettings,
): EmergencyTriggerReason | null {
  if (!settings.enabled) return null;
  if (vitals.heartRate > 0 && vitals.heartRate <= settings.heartRateLowBpm) {
    return "heart_rate_drop";
  }
  if (vitals.spo2 > 0 && vitals.spo2 <= settings.spo2LowPercent) {
    return "spo2_drop";
  }
  return null;
}

export function triggerReasonLabel(reason: EmergencyTriggerReason) {
  switch (reason) {
    case "heart_rate_drop":
      return "Heart rate dropped below your safety threshold";
    case "spo2_drop":
      return "SpO₂ dropped below your safety threshold";
    case "manual_simulation":
      return "Manual emergency simulation";
    default:
      return "Emergency factor detected";
  }
}
