"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests, statusLabel, INITIAL_DEMO_REQUESTS } from "@/lib/ambulanceStore";
import { hospitalAudio } from "@/lib/hospitalAudio";
import { LiveTelemetryModal } from "@/components/hospital/LiveTelemetryModal";
import { BedAllocationModal } from "@/components/hospital/BedAllocationModal";
import { AmbulanceCommsDrawer } from "@/components/hospital/AmbulanceCommsDrawer";
import { BloodBankMatcher } from "@/components/hospital/BloodBankMatcher";
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
  Clock3,
  Droplet,
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
  const [requests, setRequests] = useState<AmbulanceRequest[]>(INITIAL_DEMO_REQUESTS.filter(r => r.hospitalId === "city-hospital"));
  const [time, setTime] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(hospitalAudio.isEnabled());

  // Clinical tool modals
  const [selectedReq, setSelectedReq] = useState<AmbulanceRequest | null>(null);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);
  const [bloodOpen, setBloodOpen] = useState(false);

  useEffect(() => {
    setTime(new Date());
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    return subscribeAmbulanceRequests((all) => {
      const hospitalId = account?.hospitalId || "city-hospital";
      const mine = all.filter((r) => r.hospitalId === hospitalId);
      setRequests(
        mine.length > 0
          ? mine
          : INITIAL_DEMO_REQUESTS.filter((r) => r.hospitalId === "city-hospital")
      );
    });
  }, [account]);

  const activeUnits = requests.filter((r) =>
    !["cancelled", "declined", "ARRIVED AT HOSPITAL"].includes(r.status),
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
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-[2rem] border-0 bg-gradient-to-br from-[#ebf5f2] via-[#e2f0ed] to-[#d6edf3] p-6 sm:p-8 shadow-[0_20px_50px_rgba(13,143,122,0.18)] hover:shadow-[0_26px_60px_rgba(13,143,122,0.25)] transition-all duration-300">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary uppercase tracking-wider">
                Emergency Command Center
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 border-0 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE SYNC
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {account?.hospitalName || "Hospital"} Command Center
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              Real-time emergency dispatch triage, telemetry monitoring, and trauma bed coordination.
            </p>
          </div>

          {/* Digital Clock & Audio / Fullscreen Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[1.5rem] bg-[#0f2420] px-5 py-4 text-white shadow-[0_14px_35px_rgba(15,36,32,0.45)]">
              <div className="text-right font-mono">
                <p className="text-2xl sm:text-3xl font-bold tracking-wider text-emerald-400">
                  {time ? time.toLocaleTimeString() : "--:--:--"}
                </p>
                <p className="text-xs text-teal-200 font-medium">
                  {time ? time.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSound}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border-0 shadow-[0_6px_20px_rgba(15,61,53,0.1)] transition-all",
                  soundOn
                    ? "bg-primary-soft text-primary shadow-[0_8px_24px_rgba(13,143,122,0.25)]"
                    : "bg-white text-muted"
                )}
                title={soundOn ? "Mute alert chimes" : "Unmute alert chimes"}
              >
                {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border-0 bg-white text-muted shadow-[0_6px_20px_rgba(15,61,53,0.1)] hover:bg-slate-100 hover:text-foreground transition"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Incoming Emergency Units & Hospital Resources */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* LEFT: Live Incoming Ambulances Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <Ambulance className="h-4 w-4 text-primary" />
              Incoming Emergency Units ({activeUnits.length})
            </h2>
            <span className="text-xs text-primary font-bold">Real-time live dispatches</span>
          </div>

          {activeUnits.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border-0 bg-[#eef6f4] py-20 text-center text-muted shadow-[0_14px_40px_rgba(15,61,53,0.1)]">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/80 mb-3" />
              <p className="font-semibold text-lg text-foreground">All Emergency Units Clear</p>
              <p className="text-xs text-muted mt-1">No pending or active ambulance dispatches at this moment.</p>
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
                      "rounded-[2rem] border-0 bg-[#eef6f4] p-6 transition-all duration-300",
                      isCritical
                        ? "shadow-[0_16px_45px_rgba(217,53,74,0.2)] hover:shadow-[0_22px_55px_rgba(217,53,74,0.3)]"
                        : isUrgent
                        ? "shadow-[0_16px_45px_rgba(245,158,11,0.2)] hover:shadow-[0_22px_55px_rgba(245,158,11,0.3)]"
                        : "shadow-[0_16px_45px_rgba(13,143,122,0.16)] hover:shadow-[0_22px_55px_rgba(13,143,122,0.24)]"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border-0 shadow-2xs",
                              isCritical ? "bg-rose-100 text-rose-800" :
                              isUrgent ? "bg-amber-100 text-amber-800" : "bg-primary-soft text-primary"
                            )}
                          >
                            {req.priority}
                          </span>
                          <span className="font-mono text-xs text-muted">
                            {req.id} · Dispatched: {req.acceptedBy || "City Desk"}
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                          {req.patientName}
                        </h3>
                        <p className="text-xs text-muted mt-1">
                          📍 {req.locationLabel}
                        </p>
                      </div>

                      {/* Large ETA Badge */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted block">ESTIMATED ARRIVAL</span>
                        <p className="font-display text-3xl sm:text-4xl font-bold text-primary">
                          {req.etaMinutes != null ? `${req.etaMinutes} MIN` : "ARRIVED"}
                        </p>
                        <span className="text-xs font-semibold text-accent">
                          Bay: {req.allocatedBed || "Trauma Bay 01"}
                        </span>
                      </div>
                    </div>

                    {/* Vitals HUD Row */}
                    <div className="mt-5 grid grid-cols-4 gap-3 border-t border-black/5 pt-4">
                      <div className="rounded-2xl border-0 bg-white p-2.5 text-center shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                        <span className="text-[10px] text-muted block flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3 text-rose-500" /> HR
                        </span>
                        <span className="font-mono text-lg font-bold text-foreground">{vitals.hr} <span className="text-[10px] text-muted">BPM</span></span>
                      </div>
                      <div className="rounded-2xl border-0 bg-white p-2.5 text-center shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                        <span className="text-[10px] text-muted block flex items-center justify-center gap-1">
                          <Activity className="h-3 w-3 text-sky-500" /> BP
                        </span>
                        <span className="font-mono text-lg font-bold text-foreground">{vitals.bp}</span>
                      </div>
                      <div className="rounded-2xl border-0 bg-white p-2.5 text-center shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                        <span className="text-[10px] text-muted block flex items-center justify-center gap-1">
                          <Wind className="h-3 w-3 text-emerald-500" /> SpO2
                        </span>
                        <span className="font-mono text-lg font-bold text-foreground">{vitals.spo2}%</span>
                      </div>
                      <div className="rounded-2xl border-0 bg-white p-2.5 text-center shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                        <span className="text-[10px] text-muted block">BLOOD</span>
                        <span className="font-mono text-lg font-bold text-rose-600">{req.bloodGroup || "O+"}</span>
                      </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-black/5 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setTelemetryOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border-0 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 transition shadow-[0_4px_14px_rgba(217,53,74,0.15)]"
                      >
                        <Activity className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                        <span>Telemetry</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setBedOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border-0 bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-[0_4px_14px_rgba(15,61,53,0.08)]"
                      >
                        <Bed className="h-3.5 w-3.5 text-primary" />
                        <span>{req.allocatedBed ? "Change Bay" : "Allocate Bay"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setCommsOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border-0 bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-[0_4px_14px_rgba(15,61,53,0.08)]"
                      >
                        <Radio className="h-3.5 w-3.5 text-primary" />
                        <span>Radio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setBloodOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border-0 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-50 transition shadow-[0_4px_14px_rgba(217,53,74,0.15)]"
                      >
                        <Droplet className="h-3.5 w-3.5 text-rose-600" />
                        <span>Blood</span>
                      </button>
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
          <div className="rounded-[2rem] border-0 bg-[#eef6f4] p-6 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
              <Bed className="h-4 w-4 text-primary" />
              Trauma Bays &amp; ICU Beds Occupancy
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { bay: "Trauma Bay 01", status: "Pre-allocated", color: "bg-rose-100 text-rose-900 shadow-[0_4px_16px_rgba(217,53,74,0.15)]" },
                { bay: "Trauma Bay 02", status: "Available", color: "bg-emerald-100 text-emerald-900 shadow-[0_4px_16px_rgba(5,150,105,0.15)]" },
                { bay: "ICU Bed 03", status: "Occupied", color: "bg-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,61,53,0.06)]" },
                { bay: "Cardiac Resus 01", status: "Available", color: "bg-emerald-100 text-emerald-900 shadow-[0_4px_16px_rgba(5,150,105,0.15)]" },
                { bay: "Paediatric ER 04", status: "Available", color: "bg-emerald-100 text-emerald-900 shadow-[0_4px_16px_rgba(5,150,105,0.15)]" },
                { bay: "General ER 12", status: "Occupied", color: "bg-slate-200 text-slate-800 shadow-[0_4px_16px_rgba(15,61,53,0.06)]" },
              ].map((item) => (
                <div key={item.bay} className={cn("rounded-2xl border-0 p-3.5 transition-all hover:-translate-y-0.5", item.color)}>
                  <p className="text-xs font-bold">{item.bay}</p>
                  <p className="text-[11px] font-semibold mt-0.5">{item.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Bank Rapid Match HUD */}
          <div className="rounded-[2rem] border border-rose-200/80 bg-white p-6 shadow-[0_16px_45px_rgba(217,53,74,0.12)] hover:shadow-[0_22px_55px_rgba(217,53,74,0.2)] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500" />
                Blood Bank Live Stock
              </h2>
              <span className="text-[10px] font-semibold text-rose-600">
                Live Transfusion Hub
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5 text-center">
              {[
                { g: "O+", u: 14 },
                { g: "O-", u: 4 },
                { g: "A+", u: 18 },
                { g: "A-", u: 3 },
                { g: "B+", u: 12 },
                { g: "B-", u: 2 },
                { g: "AB+", u: 8 },
                { g: "AB-", u: 1 },
              ].map((b) => {
                const isLow = b.u < 3;
                return (
                  <div
                    key={b.g}
                    className={cn(
                      "rounded-2xl border p-2.5 transition-all duration-300 hover:-translate-y-0.5",
                      isLow
                        ? "border-rose-600 bg-rose-600 text-white shadow-[0_8px_24px_rgba(217,53,74,0.35)] hover:shadow-[0_12px_32px_rgba(217,53,74,0.45)]"
                        : "border-rose-200 bg-white text-rose-600 shadow-[0_8px_24px_rgba(217,53,74,0.12)] hover:shadow-[0_12px_30px_rgba(217,53,74,0.22)] hover:border-rose-300"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold block",
                        isLow ? "text-white" : "text-rose-600"
                      )}
                    >
                      {b.g}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-mono font-semibold block mt-0.5",
                        isLow ? "text-white/90" : "text-rose-600"
                      )}
                    >
                      {b.u} {b.u === 1 ? "unit" : "units"}
                    </span>
                    <span
                      className={cn(
                        "mt-1 inline-block text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full",
                        isLow
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      {isLow ? "Low" : "Ready"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LiveTelemetryModal
        request={selectedReq}
        isOpen={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
      />

      <BedAllocationModal
        request={selectedReq}
        isOpen={bedOpen}
        onClose={() => setBedOpen(false)}
      />

      <AmbulanceCommsDrawer
        request={selectedReq}
        isOpen={commsOpen}
        onClose={() => setCommsOpen(false)}
      />

      <BloodBankMatcher
        request={selectedReq}
        isOpen={bloodOpen}
        onClose={() => setBloodOpen(false)}
      />
    </div>
  );
}
