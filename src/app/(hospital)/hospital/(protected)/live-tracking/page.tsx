"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { statusLabel } from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Ambulance, MapPin, Navigation, Radio } from "lucide-react";

// Mock GPS positions (offset from base coordinates per ambulance)
function getMockPosition(req: AmbulanceRequest, index: number) {
  return {
    lat: req.coordinates.lat + (index * 0.003 - 0.002),
    lng: req.coordinates.lng + (index * 0.003 - 0.001),
  };
}

export default function LiveTrackingPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) =>
      setRequests(
        all.filter(
          (r) =>
            r.hospitalId === account.hospitalId &&
            ["accepted", "en_route"].includes(r.status),
        ),
      ),
    );
  }, [account]);

  return (
    <div className="space-y-6">
      {/* Map placeholder */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Grid pattern background to simulate a map */}
        <div
          className="flex h-[340px] items-center justify-center sm:h-[420px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(203,213,225,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(203,213,225,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundColor: "#f1f5f9",
          }}
        >
          {/* Map pins for active requests */}
          {requests.length > 0 ? (
            <div className="relative w-full h-full">
              {requests.map((req, i) => (
                <div
                  key={req.id}
                  className="absolute"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${35 + i * 10}%`,
                  }}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#0b1f2a] shadow-lg">
                      <Ambulance className="h-5 w-5 text-white" aria-hidden />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#0b1f2a] shadow-md">
                      {req.patientName}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 w-2 -translate-y-full">
                      <div className="h-3 w-3 animate-ping rounded-full bg-sky-400 opacity-60" />
                    </div>
                  </div>
                </div>
              ))}
              {/* Hospital base marker */}
              <div className="absolute" style={{ left: "50%", top: "50%" }}>
                <div className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-lg">
                  <MapPin className="h-4 w-4 text-white" aria-hidden />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <Navigation className="h-10 w-10 text-slate-300" aria-hidden />
              <div>
                <p className="font-semibold text-slate-500">No active units to track</p>
                <p className="mt-1 text-sm text-slate-400">
                  Dispatched ambulances will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map overlay badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 backdrop-blur-sm">
          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" aria-hidden />
          Live Tracking · {requests.length} active unit{requests.length !== 1 ? "s" : ""}
        </div>

        <div className="absolute right-4 top-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          Demo — real GPS via backend integration
        </div>
      </div>

      {/* Active units list */}
      {requests.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
            Active Units
          </h2>
          <div className="space-y-3">
            {requests.map((req, i) => {
              const pos = getMockPosition(req, i);
              return (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1f2a]">
                      <Ambulance className="h-4 w-4 text-white" aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0b1f2a]">{req.patientName}</p>
                      <p className="text-xs text-slate-400">
                        {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.etaMinutes != null && (
                      <span className="text-sm font-semibold text-sky-600">
                        ETA {req.etaMinutes} min
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        req.status === "en_route"
                          ? "border-sky-200 bg-sky-100 text-sky-800"
                          : "border-slate-200 bg-slate-100 text-slate-700",
                      )}
                    >
                      {statusLabel(req.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
