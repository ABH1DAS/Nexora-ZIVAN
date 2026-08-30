"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { type AmbulanceRequest } from "@/data/ambulanceRequests";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ambulance,
  ChevronDown,
  ChevronUp,
  MapPin,
  Maximize2,
  Minimize2,
  Radio,
  ShieldAlert,
  X,
  ArrowRight,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HospitalEmergencyBubble() {
  const { account } = useHospitalAuth();
  const [activeRequests, setActiveRequests] = useState<AmbulanceRequest[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    return subscribeAmbulanceRequests((all) => {
      const active = all.filter((r) => {
        const isTarget = !account || r.hospitalId === account.hospitalId || !r.hospitalId;
        const isActive =
          r.status !== "cancelled" &&
          r.status !== "declined" &&
          r.status !== "ARRIVED AT HOSPITAL";
        return isTarget && isActive;
      });
      setActiveRequests(active);
    });
  }, [account]);

  if (activeRequests.length === 0 || isDismissed) {
    return null;
  }

  const latest = activeRequests[0];
  const totalCount = activeRequests.length;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-bounce">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.7)] border-2 border-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title={`${totalCount} Active Emergency SOS Alert(s) - Click to expand`}
        >
          <span className="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping" />
          <ShieldAlert className="relative h-7 w-7 text-white" />
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-rose-600 shadow-md">
            {totalCount}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Active emergency alert notification" className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-[400px] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-rose-500/50 bg-slate-950/95 text-white shadow-[0_12px_40px_rgba(225,29,72,0.4)] backdrop-blur-xl">
        {/* Top Emergency Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse" />

        {/* Ambient background blob */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-600/20 blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-rose-950/40">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              Emergency SOS Alert ({totalCount})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title="Minimize to floating bubble"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              title="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>👤 {latest.patientName}</span>
                {latest.priority && (
                  <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-black uppercase text-rose-300">
                    {latest.priority}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-slate-300 flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                <span className="truncate">{latest.locationLabel}</span>
              </p>
            </div>

            {latest.etaMinutes != null && (
              <div className="flex flex-col items-end shrink-0">
                <span className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs font-black text-amber-300 font-mono">
                  ETA: {latest.etaMinutes}m
                </span>
              </div>
            )}
          </div>

          {latest.notes && (
            <div className="rounded-xl bg-slate-900/90 border border-white/5 p-2.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
              <span className="text-rose-300 font-bold">Chief Complaint: </span>
              {latest.notes}
            </div>
          )}

          {/* Telemetry info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
            <span className="flex items-center gap-1 text-teal-300 font-bold">
              <Ambulance className="h-3.5 w-3.5" />
              {latest.vehicleNumber || "Ambulance Dispatched"}
            </span>
            <span className="text-slate-400 capitalize">
              Status: <b className="text-white">{latest.status}</b>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/hospital/live-tracking"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500 transition shadow-md shadow-rose-900/40"
            >
              <MapPin className="h-3.5 w-3.5" />
              Live Tracking
            </Link>
            <Link
              href="/hospital/incoming-patients"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-slate-800/90 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <HeartPulse className="h-3.5 w-3.5 text-teal-400" />
              View Triage
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
