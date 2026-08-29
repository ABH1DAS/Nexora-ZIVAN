"use client";

import { Button } from "@/components/ui/Button";
import { FITNESS_BAND_OPTIONS, type FitnessBand, type LiveVitals } from "@/data/devices";
import {
  connectFitnessBand,
  disconnectFitnessBand,
  getLiveVitals,
  subscribeBand,
  subscribeVitals,
  updateLiveVitals,
} from "@/lib/healthMonitorStore";
import { cn, formatNumber } from "@/lib/utils";
import {
  Activity,
  Battery,
  Bluetooth,
  Heart,
  Link2Off,
  Watch,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardDevicesPage() {
  const [band, setBand] = useState<FitnessBand | null>(null);
  const [vitals, setVitals] = useState<LiveVitals>(getLiveVitals());
  const [selected, setSelected] = useState<string>("zivan-pulse-one");
  const [message, setMessage] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => subscribeBand(setBand), []);
  useEffect(() => subscribeVitals(setVitals), []);

  useEffect(() => {
    if (!band?.connected || !simulating) return;
    const id = setInterval(() => {
      const current = getLiveVitals();
      const drift = Math.round((Math.random() - 0.5) * 4);
      updateLiveVitals({
        heartRate: Math.max(48, Math.min(120, current.heartRate + drift)),
        spo2: Math.max(92, Math.min(100, current.spo2 + Math.round((Math.random() - 0.5) * 2))),
        steps: current.steps + Math.floor(Math.random() * 8),
        source: "band",
      });
    }, 2500);
    return () => clearInterval(id);
  }, [band?.connected, simulating]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Fitness band
        </h1>
        <p className="mt-2 text-sm text-muted">
          Pair a demo wearable to monitor heart rate, SpO₂, steps and sleep.
          Automatic emergency checks use these readings when enabled.
        </p>
      </div>

      {message && (
        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary-dark" role="status">
          {message}
        </p>
      )}

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        {band?.connected ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Watch className="h-7 w-7" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-success">
                    Connected
                  </p>
                  <h2 className="font-display text-2xl font-semibold">{band.name}</h2>
                  <p className="text-sm text-muted">
                    {band.brand} · {band.model}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSimulating((v) => !v)}
                >
                  {simulating ? "Pause live demo" : "Start live demo"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    disconnectFitnessBand();
                    setSimulating(false);
                    setMessage("Fitness band disconnected.");
                  }}
                >
                  <Link2Off className="h-4 w-4" aria-hidden />
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7fbfa] p-4 text-sm">
                <p className="inline-flex items-center gap-2 text-muted">
                  <Battery className="h-4 w-4" aria-hidden />
                  Battery
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {band.batteryPercent}%
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7fbfa] p-4 text-sm">
                <p className="inline-flex items-center gap-2 text-muted">
                  <Bluetooth className="h-4 w-4" aria-hidden />
                  Last sync
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {new Date(vitals.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7fbfa] p-4 text-sm">
                <p className="text-muted">Monitoring</p>
                <p className="mt-1 font-semibold">
                  HR · SpO₂ · Steps · Sleep
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-border p-4">
                <p className="inline-flex items-center gap-2 text-sm text-muted">
                  <Heart className="h-4 w-4 text-emergency" aria-hidden />
                  Heart rate
                </p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {vitals.heartRate}{" "}
                  <span className="text-base font-medium text-muted">BPM</span>
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border p-4">
                <p className="inline-flex items-center gap-2 text-sm text-muted">
                  <Activity className="h-4 w-4 text-accent" aria-hidden />
                  SpO₂
                </p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {vitals.spo2}
                  <span className="text-base font-medium text-muted">%</span>
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border p-4">
                <p className="text-sm text-muted">Steps</p>
                <p className="mt-2 font-display text-3xl font-bold">
                  {formatNumber(vitals.steps)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              To test automatic ambulance assistance, simulate a heart-rate drop on
              the{" "}
              <Link href="/dashboard/emergency" className="font-semibold underline">
                Emergency
              </Link>{" "}
              page. Demo only — never contacts real services.
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-xl font-semibold">Add a fitness band</h2>
            <p className="mt-2 text-sm text-muted">
              Choose a demo wearable to stream heart rate and other vitals into
              ZIVAN.
            </p>
            <div className="mt-5 grid gap-3">
              {FITNESS_BAND_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 text-left transition",
                    selected === option.id
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <Watch className="h-5 w-5 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold">{option.name}</p>
                    <p className="text-xs text-muted">
                      {option.brand} · Heart rate, SpO₂, steps, sleep
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              className="mt-5"
              onClick={() => {
                connectFitnessBand(selected);
                setMessage("Fitness band connected. Live monitoring ready.");
                setSimulating(true);
              }}
            >
              <Bluetooth className="h-4 w-4" aria-hidden />
              Pair selected band
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
