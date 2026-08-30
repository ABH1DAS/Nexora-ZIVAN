"use client";

import { Button } from "@/components/ui/Button";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import type { AutoEmergencySettings, LiveVitals } from "@/data/devices";
import { hospitals } from "@/data/hospitals";
import { useAuth } from "@/lib/auth";
import {
  createAmbulanceRequest,
  statusLabel,
  subscribeAmbulanceRequests,
} from "@/lib/ambulanceStore";
import {
  evaluateEmergencyTriggers,
  getAutoEmergencySettings,
  getFitnessBand,
  getLiveVitals,
  saveAutoEmergencySettings,
  subscribeAutoEmergencySettings,
  subscribeBand,
  subscribeVitals,
  triggerReasonLabel,
  updateLiveVitals,
  type EmergencyTriggerReason,
} from "@/lib/healthMonitorStore";
import { cn } from "@/lib/utils";
import { AlertTriangle, ExternalLink, Phone, Siren } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function DashboardEmergencyPage() {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [request, setRequest] = useState<AmbulanceRequest | null>(null);
  const [settings, setSettings] = useState<AutoEmergencySettings>(
    getAutoEmergencySettings(),
  );
  const [vitals, setVitals] = useState<LiveVitals>(getLiveVitals());
  const [bandConnected, setBandConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingReason, setPendingReason] = useState<EmergencyTriggerReason | null>(
    null,
  );
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const lastTriggerRef = useRef<string | null>(null);

  useEffect(() => subscribeVitals(setVitals), []);
  useEffect(() => subscribeAutoEmergencySettings(setSettings), []);
  useEffect(
    () =>
      subscribeBand((band) => {
        setBandConnected(Boolean(band?.connected));
      }),
    [],
  );

  useEffect(() => {
    if (!request?.id) return;
    const id = request.id;
    return subscribeAmbulanceRequests((all) => {
      setRequest(all.find((item) => item.id === id) ?? null);
    });
  }, [request?.id]);

  useEffect(() => {
    if (!settings.enabled || !bandConnected || countdown !== null) return;
    const reason = evaluateEmergencyTriggers(vitals, settings);
    if (!reason) return;
    const key = `${reason}-${vitals.heartRate}-${vitals.spo2}`;
    if (lastTriggerRef.current === key) return;
    lastTriggerRef.current = key;
    setPendingReason(reason);
    setCountdown(settings.confirmSeconds);
    setAutoMessage(triggerReasonLabel(reason));
  }, [bandConnected, countdown, settings, vitals]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      const created = createAmbulanceRequest({
        patientName: user?.name ?? "ZIVAN Member",
        hospitalId: settings.hospitalId,
      });
      setRequest(created);
      setActive(true);
      setCountdown(null);
      setAutoMessage(
        `Automatic ambulance request sent to hospital dispatch (${pendingReason ? triggerReasonLabel(pendingReason) : "emergency factor"}). Demo only.`,
      );
      setPendingReason(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, pendingReason, settings.hospitalId, user?.name]);

  const ambulanceTone =
    !request || request.status === "searching"
      ? "busy"
      : request.status === "declined" || request.status === "cancelled"
        ? "pending"
        : "ok";

  const hospitalTone =
    !request || request.status === "searching"
      ? "pending"
      : request.status === "declined"
        ? "pending"
        : "ok";

  const rows = [
    { label: "Location", value: active ? "Sharing" : "Ready", tone: "ok" as const },
    {
      label: "Emergency contact",
      value: active ? "Notified" : "Configured",
      tone: "ok" as const,
    },
    {
      label: "Ambulance",
      value: !active
        ? "Standby"
        : request
          ? statusLabel(request.status)
          : "Searching...",
      tone: !active ? ("pending" as const) : ambulanceTone,
    },
    {
      label: "Hospital",
      value: !active
        ? "Standby"
        : request?.status === "searching"
          ? "Awaiting acceptance"
          : request?.status === "declined"
            ? "Declined"
            : request
              ? `${request.hospitalName} connected`
              : "Pending",
      tone: !active ? ("pending" as const) : hospitalTone,
    },
  ];

  function activateSos() {
    const created = createAmbulanceRequest({
      patientName: user?.name ?? "ZIVAN Member",
      hospitalId: settings.hospitalId,
    });
    setRequest(created);
    setActive(true);
    setCountdown(null);
    setPendingReason(null);
  }

  function cancelAutoCall() {
    setCountdown(null);
    setPendingReason(null);
    setAutoMessage("Automatic ambulance request cancelled.");
    updateLiveVitals({
      heartRate: Math.max(vitals.heartRate, settings.heartRateLowBpm + 20),
      spo2: Math.max(vitals.spo2, settings.spo2LowPercent + 5),
      source: bandConnected ? "band" : "demo",
    });
  }

  function simulateHeartRateDrop() {
    if (!bandConnected) {
      setAutoMessage("Connect a fitness band first from Devices.");
      return;
    }
    lastTriggerRef.current = null;
    updateLiveVitals({
      heartRate: Math.max(30, settings.heartRateLowBpm - 5),
      source: "band",
    });
    setAutoMessage("Simulated heart-rate drop sent to auto-emergency monitor.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Emergency center
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Manual SOS plus automatic ambulance assistance when band vitals cross
          your safety thresholds. Demo only — call local emergency services in a
          real emergency.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Automatic calling is a product demonstration with a cancel countdown. It
        does not contact real emergency services. In a real emergency, please call your local
        emergency helpline immediately.
      </div>

      {autoMessage && (
        <p className="rounded-2xl border border-border bg-white px-4 py-3 text-sm" role="status">
          {autoMessage}
        </p>
      )}

      {countdown !== null && (
        <section className="rounded-[2rem] border-2 border-emergency bg-emergency-soft p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emergency">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Automatic ambulance request
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-emergency-dark">
                Sending in {countdown}s
              </h2>
              <p className="mt-1 text-sm text-emergency-dark/80">
                {pendingReason ? triggerReasonLabel(pendingReason) : "Emergency factor detected"}
                . Cancel if you are safe.
              </p>
            </div>
            <Button variant="emergency" size="lg" onClick={cancelAutoCall}>
              Cancel auto request
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Automatic emergency ambulance
            </h2>
            <p className="mt-1 text-sm text-muted">
              Uses fitness-band heart rate and SpO₂. Requires a connected band.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={settings.enabled}
              onChange={(e) => {
                const next = { ...settings, enabled: e.target.checked };
                setSettings(next);
                saveAutoEmergencySettings(next);
              }}
            />
            Enabled
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[#f7fbfa] p-4">
            <p className="text-xs text-muted">Band status</p>
            <p className="mt-1 font-semibold">
              {bandConnected ? "Connected" : "Not connected"}
            </p>
            {!bandConnected && (
              <Link
                href="/dashboard/devices"
                className="mt-2 inline-block text-xs font-semibold text-primary underline"
              >
                Add fitness band
              </Link>
            )}
          </div>
          <div className="rounded-2xl bg-[#f7fbfa] p-4">
            <p className="text-xs text-muted">Live heart rate</p>
            <p className="mt-1 font-display text-2xl font-bold">{vitals.heartRate} BPM</p>
          </div>
          <div className="rounded-2xl bg-[#f7fbfa] p-4">
            <p className="text-xs text-muted">Live SpO₂</p>
            <p className="mt-1 font-display text-2xl font-bold">{vitals.spo2}%</p>
          </div>
          <div className="rounded-2xl bg-[#f7fbfa] p-4">
            <p className="text-xs text-muted">Countdown</p>
            <p className="mt-1 font-semibold">{settings.confirmSeconds} seconds</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="hr-threshold" className="mb-1.5 block text-sm font-semibold">
              Low heart-rate trigger (BPM)
            </label>
            <input
              id="hr-threshold"
              type="number"
              min={30}
              max={70}
              value={settings.heartRateLowBpm}
              onChange={(e) => {
                const next = {
                  ...settings,
                  heartRateLowBpm: Number(e.target.value) || settings.heartRateLowBpm,
                };
                setSettings(next);
                saveAutoEmergencySettings(next);
              }}
              className="h-11 w-full rounded-2xl border border-border bg-[#fbfefd] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="spo2-threshold" className="mb-1.5 block text-sm font-semibold">
              Low SpO₂ trigger (%)
            </label>
            <input
              id="spo2-threshold"
              type="number"
              min={80}
              max={95}
              value={settings.spo2LowPercent}
              onChange={(e) => {
                const next = {
                  ...settings,
                  spo2LowPercent: Number(e.target.value) || settings.spo2LowPercent,
                };
                setSettings(next);
                saveAutoEmergencySettings(next);
              }}
              className="h-11 w-full rounded-2xl border border-border bg-[#fbfefd] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="hospital-target" className="mb-1.5 block text-sm font-semibold">
              Preferred hospital
            </label>
            <select
              id="hospital-target"
              value={settings.hospitalId}
              onChange={(e) => {
                const next = { ...settings, hospitalId: e.target.value };
                setSettings(next);
                saveAutoEmergencySettings(next);
              }}
              className="h-11 w-full rounded-2xl border border-border bg-[#fbfefd] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {hospitals
                .filter((h) => h.type === "hospital")
                .map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="emergency" onClick={simulateHeartRateDrop}>
            <Siren className="h-4 w-4" aria-hidden />
            Simulate heart-rate drop
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (!bandConnected) {
                setAutoMessage("Connect a fitness band first from Devices.");
                return;
              }
              lastTriggerRef.current = null;
              updateLiveVitals({
                spo2: Math.max(70, settings.spo2LowPercent - 3),
                source: "band",
              });
              setAutoMessage("Simulated SpO₂ drop sent to auto-emergency monitor.");
            }}
          >
            Simulate SpO₂ drop
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-rose-200 bg-[#1a0c10] p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">
            Emergency mode
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {active ? "SOS ACTIVE" : "SOS READY"}
          </h2>
          <ul className="mt-5 space-y-3">
            {rows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-white/70">{row.label}</span>
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      row.tone === "ok" && "bg-emerald-400",
                      row.tone === "busy" && "bg-amber-400",
                      row.tone === "pending" && "bg-white/35",
                    )}
                    aria-hidden
                  />
                  {row.value}
                </span>
              </li>
            ))}
          </ul>

          {request?.etaMinutes != null &&
            ["accepted", "en_route", "arrived"].includes(request.status) && (
              <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                ETA {request.etaMinutes} min · accepted by{" "}
                {request.acceptedBy ?? request.hospitalName}
              </p>
            )}

          <div className="mt-5 grid gap-3">
            <Button variant="emergency" onClick={activateSos}>
              {active ? "SOS simulation running" : "Activate SOS manually"}
            </Button>
            <Button
              variant="secondary"
              className="border-white/10 bg-white/10 text-white hover:bg-white/15"
              onClick={() => window.alert("Demo: Call emergency services")}
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call emergency services
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              href="/hospital/login"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open hospital portal
            </Button>
            {active && (
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  setActive(false);
                  setRequest(null);
                }}
              >
                End demo
              </Button>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">How auto-ambulance works</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted">
            <li>1. Pair a fitness band under Devices.</li>
            <li>2. Keep automatic emergency monitoring enabled.</li>
            <li>3. If heart rate or SpO₂ crosses your threshold, a countdown starts.</li>
            <li>4. Cancel if safe, or let it send a demo ambulance request to the hospital portal.</li>
          </ol>
          {request && (
            <div className="mt-6 rounded-2xl border border-border bg-[#fbfefd] p-4 text-sm">
              <p className="font-semibold">Latest request</p>
              <p className="mt-1 text-muted">
                {request.hospitalName} · {statusLabel(request.status)}
              </p>
              <p className="mt-1 text-xs text-muted">ID: {request.id}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
