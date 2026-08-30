"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { createAmbulanceRequest } from "@/lib/ambulanceStore";
import {
  evaluateEmergencyTriggers,
  getAutoEmergencySettings,
  getFitnessBand,
  getLiveVitals,
  subscribeAutoEmergencySettings,
  subscribeBand,
  subscribeVitals,
  triggerReasonLabel,
  updateLiveVitals,
  type EmergencyTriggerReason,
} from "@/lib/healthMonitorStore";
import type { AutoEmergencySettings, LiveVitals } from "@/data/devices";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Global dashboard monitor: when a connected band reports unsafe vitals,
 * starts a cancelable countdown then creates a demo ambulance request.
 */
export function AutoEmergencyMonitor() {
  const { user } = useAuth();
  const pathname = usePathname();
  const onEmergencyPage = pathname.startsWith("/dashboard/emergency");

  const [settings, setSettings] = useState<AutoEmergencySettings>(
    getAutoEmergencySettings(),
  );
  const [vitals, setVitals] = useState<LiveVitals>(getLiveVitals());
  const [bandConnected, setBandConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reason, setReason] = useState<EmergencyTriggerReason | null>(null);
  const lastTriggerRef = useRef<string | null>(null);

  useEffect(() => subscribeVitals(setVitals), []);
  useEffect(() => subscribeAutoEmergencySettings(setSettings), []);
  useEffect(
    () =>
      subscribeBand((band) => setBandConnected(Boolean(band?.connected))),
    [],
  );

  useEffect(() => {
    // Emergency page owns its own countdown UI to avoid duplicates.
    if (onEmergencyPage || !settings.enabled || !bandConnected || countdown !== null) {
      return;
    }
    const detected = evaluateEmergencyTriggers(vitals, settings);
    if (!detected) return;
    const key = `${detected}-${vitals.heartRate}-${vitals.spo2}`;
    if (lastTriggerRef.current === key) return;
    lastTriggerRef.current = key;
    setReason(detected);
    setCountdown(settings.confirmSeconds);
  }, [bandConnected, countdown, onEmergencyPage, settings, vitals]);

  useEffect(() => {
    if (onEmergencyPage || countdown === null) return;
    if (countdown <= 0) {
      createAmbulanceRequest({
        patientName: user?.name ?? "ZIVAN Member",
        hospitalId: settings.hospitalId,
      });
      setCountdown(null);
      setReason(null);
      return;
    }
    const timer = setTimeout(
      () => setCountdown((value) => (value === null ? null : value - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [countdown, onEmergencyPage, settings.hospitalId, user?.name]);

  if (onEmergencyPage || countdown === null) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-[1.5rem] border-2 border-emergency bg-white p-4 shadow-[0_20px_60px_rgba(217,53,74,0.25)] sm:inset-x-auto sm:right-6 sm:bottom-6"
      role="alertdialog"
      aria-labelledby="auto-sos-title"
      aria-describedby="auto-sos-desc"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emergency-soft text-emergency">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p id="auto-sos-title" className="font-display text-lg font-semibold text-emergency-dark">
            Auto ambulance in {countdown}s
          </p>
          <p id="auto-sos-desc" className="mt-1 text-sm text-muted">
            {reason ? triggerReasonLabel(reason) : "Emergency factor detected"}. Demo
            only — cancel if you are safe.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="emergency"
              size="sm"
              onClick={() => {
                setCountdown(null);
                setReason(null);
                updateLiveVitals({
                  heartRate: Math.max(
                    getLiveVitals().heartRate,
                    settings.heartRateLowBpm + 20,
                  ),
                  spo2: Math.max(
                    getLiveVitals().spo2,
                    settings.spo2LowPercent + 5,
                  ),
                  source: getFitnessBand()?.connected ? "band" : "demo",
                });
              }}
            >
              Cancel
            </Button>
            <Button size="sm" variant="secondary" href="/dashboard/emergency">
              Open emergency
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
