"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Bell,
  Bluetooth,
  CheckCircle2,
  Cpu,
  Heart,
  Radio,
  Shield,
  Sparkles,
  Watch,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function DashboardDevicesPage() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4 sm:py-8">
      {/* Hero Coming Soon Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-teal-500/20 bg-gradient-to-br from-[#0f2420] via-[#12312b] to-[#0a1916] p-8 sm:p-12 text-white shadow-2xl">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-teal-300 backdrop-blur-md shadow-lg shadow-teal-950/50">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
            <Sparkles className="h-3.5 w-3.5" />
            COMING SOON
          </div>

          {/* Central Animated Watch Icon */}
          <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-teal-400/30 bg-gradient-to-br from-teal-500/30 to-emerald-600/30 text-teal-200 shadow-2xl backdrop-blur-xl">
            <Watch className="h-12 w-12 animate-pulse" />
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Smart Wearable & Device Sync
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-teal-100/80 sm:text-base">
            We are building next-generation direct Bluetooth &amp; cloud telemetry integration for Apple Watch, Samsung Galaxy Watch, Fitbit, WHOOP, and FDA-cleared biometric monitors.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setNotified(true)}
              className="flex items-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {notified ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  You will be notified!
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Notify Me on Launch
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Sneak Peek Features Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-xs">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-foreground">Continuous Vitals</h2>
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            Real-time optical heart rate tracking, SpO₂ blood oxygenation, and ECG rhythm anomaly detection streamed automatically.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-xs">
            <Radio className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-foreground">Automatic Crash & Fall SOS</h2>
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            Instant ambulance dispatch trigger when sudden impact, severe tachycardia, or unconsciousness is detected.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
            <Bluetooth className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-foreground">Universal Pairing</h2>
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            Seamless Bluetooth Low Energy (BLE) pairing with smartwatches, continuous glucose monitors (CGM), and BP cuffs.
          </p>
        </div>
      </div>
    </div>
  );
}
