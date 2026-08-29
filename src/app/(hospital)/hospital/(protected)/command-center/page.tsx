"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { hospitalAudio } from "@/lib/hospitalAudio";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bed,
  CheckCircle2,
  Clock,
  Expand,
  Heart,
  Maximize2,
  Minimize2,
  Radio,
  ShieldAlert,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";

export default function CommandCenterPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [time, setTime] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(hospitalAudio.isEnabled());

  useEffect(() => {
    setTime(new Date());
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) => {
      const mine = all.filter((r) => r.hospitalId === account.hospitalId);
      setRequests(mine);
    });
  }, [account]);

  const activeUnits = requests.filter((r) =>
    ["searching", "accepted", "en_route"].includes(r.status),
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    hospitalAudio.setEnabled(next);
    if (next) hospitalAudio.playRadioBeep();
  };

  return (
    <div className="-m-4 sm:-m-8 min-h-screen bg-[#071318] text-white p-6 sm:p-8 flex flex-col space-y-6">
      {/* Big Board Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 animate-pulse">
            <Radio className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {account?.hospitalName || "Hospital"} · ER COMMAND BOARD
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE HUD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Emergency Medicine Triage &amp; Rapid Trauma Reception Command Display
            </p>
          </div>
        </div>

        {/* Big Digital Clock & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <p className="text-3xl sm:text-4xl font-bold tracking-wider text-emerald-400">
              {time ? time.toLocaleTimeString() : "--:--:--"}
            </p>
            <p className="text-xs text-slate-400">
              {time ? time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={cn(
                "rounded-2xl p-3 border transition-all",
                soundOn
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400"
                  : "border-slate-800 bg-slate-900 text-slate-500"
              )}
              title={soundOn ? "Mute alert chimes" : "Unmute alert chimes"}
            >
              {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-slate-300 hover:bg-slate-800 hover:text-white transition"
              title="Toggle Fullscreen Monitor Mode"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Big Board Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] flex-1">
        {/* LEFT: Live Incoming Ambulances Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Ambulance className="h-4 w-4 text-primary" />
              Incoming Emergency Units ({activeUnits.length})
            </h2>
            <span className="text-xs text-emerald-400 font-mono">Auto-refreshing live stream</span>
          </div>

          {activeUnits.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/40 py-20 text-center text-slate-500">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mb-3" />
              <p className="font-semibold text-lg text-slate-300">All Emergency Units Clear</p>
              <p className="text-xs text-slate-500 mt-1">No pending or active ambulance dispatches at this moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeUnits.map((req) => {
                const isCritical = req.priority === "critical";
                const isUrgent = req.priority === "urgent";
                const vitals = req.vitals ?? { hr: 108, bp: "138/88", spo2: 95, rr: 22, temp: 37.4 };

                return (
                  <div
                    key={req.id}
                    className={cn(
                      "rounded-[2rem] border p-6 transition-all duration-300 shadow-lg",
                      isCritical
                        ? "border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 shadow-rose-950/30"
                        : isUrgent
                        ? "border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900"
                        : "border-slate-800 bg-slate-900/80"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                              isCritical ? "bg-rose-600 text-white animate-pulse" :
                              isUrgent ? "bg-amber-500 text-black" : "bg-primary text-white"
                            )}
                          >
                            {req.priority}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            {req.id} · Dispatched: {req.acceptedBy || "City Desk"}
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-2xl font-bold text-white">
                          {req.patientName}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          📍 {req.locationLabel}
                        </p>
                      </div>

                      {/* Large ETA Badge */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">ESTIMATED ARRIVAL</span>
                        <p className="font-display text-3xl sm:text-4xl font-black text-emerald-400">
                          {req.etaMinutes != null ? `${req.etaMinutes} MIN` : "ARRIVED"}
                        </p>
                        <span className="text-xs font-semibold text-primary">
                          Bay: {req.allocatedBed || "Trauma Bay 01"}
                        </span>
                      </div>
                    </div>

                    {/* Vitals HUD Row */}
                    <div className="mt-5 grid grid-cols-4 gap-3 border-t border-slate-800 pt-4">
                      <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3 text-rose-400" /> HR
                        </span>
                        <span className="font-mono text-lg font-bold text-white">{vitals.hr}</span>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                          <Activity className="h-3 w-3 text-sky-400" /> BP
                        </span>
                        <span className="font-mono text-lg font-bold text-white">{vitals.bp}</span>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
                          <Wind className="h-3 w-3 text-emerald-400" /> SpO2
                        </span>
                        <span className="font-mono text-lg font-bold text-white">{vitals.spo2}%</span>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-black/40 p-2.5 text-center">
                        <span className="text-[10px] text-slate-400 block">BLOOD</span>
                        <span className="font-mono text-lg font-bold text-rose-400">{req.bloodGroup || "O+"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Trauma Bay Occupancy & Blood Bank HUD */}
        <div className="space-y-6">
          {/* Trauma Bay Live Occupancy */}
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Bed className="h-4 w-4 text-emerald-400" />
              Trauma Bays &amp; ICU Beds Occupancy
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { bay: "Trauma Bay 01", status: "Pre-allocated", color: "border-rose-500/60 bg-rose-950/40 text-rose-400" },
                { bay: "Trauma Bay 02", status: "Available", color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-400" },
                { bay: "ICU Bed 03", status: "Occupied", color: "border-slate-700 bg-slate-800/60 text-slate-400" },
                { bay: "Cardiac Resus 01", status: "Available", color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-400" },
                { bay: "Paediatric ER 04", status: "Available", color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-400" },
                { bay: "General ER 12", status: "Occupied", color: "border-slate-700 bg-slate-800/60 text-slate-400" },
              ].map((item) => (
                <div key={item.bay} className={cn("rounded-2xl border p-3.5", item.color)}>
                  <p className="text-xs font-bold text-white">{item.bay}</p>
                  <p className="text-[11px] font-semibold mt-0.5">{item.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Bank Rapid Match HUD */}
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-rose-400" />
              Blood Bank Live Stock
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { g: "O+", u: 14 },
                { g: "O-", u: 4 },
                { g: "A+", u: 18 },
                { g: "A-", u: 3 },
                { g: "B+", u: 12 },
                { g: "B-", u: 2 },
                { g: "AB+", u: 8 },
                { g: "AB-", u: 1 },
              ].map((b) => (
                <div key={b.g} className="rounded-xl border border-slate-800 bg-black/40 p-2">
                  <span className="text-xs font-bold text-rose-400 block">{b.g}</span>
                  <span className="text-[11px] font-mono text-white">{b.u} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
