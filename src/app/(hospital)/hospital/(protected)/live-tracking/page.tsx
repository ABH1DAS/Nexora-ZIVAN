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
      {/* Map visualizer container */}
      <div className="relative overflow-hidden rounded-[2rem] border-0 bg-[#eef6f4] shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
        <div className="h-80 sm:h-96 w-full bg-radial from-slate-200/60 via-slate-100/50 to-slate-200/70 flex items-center justify-center p-6">
          {/* Map pins for active requests */}
          {requests.length > 0 ? (
            <div className="relative w-full h-full">
              {requests.map((req, i) => (
                <div
                  key={req.id}
                  className="absolute transition-all duration-500"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${35 + i * 10}%`,
                  }}
                >
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
                      <Ambulance className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white/95 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-foreground shadow-md border-0">
                      {req.patientName}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 w-2 -translate-y-full">
                      <div className="h-3.5 w-3.5 animate-ping rounded-full bg-accent opacity-70" />
                    </div>
                  </div>
                </div>
              ))}
              {/* Hospital base marker */}
              <div className="absolute" style={{ left: "50%", top: "50%" }}>
                <div className="flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg shadow-primary/30">
                  <MapPin className="h-4.5 w-4.5" aria-hidden />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <Navigation className="h-10 w-10 text-muted/50" aria-hidden />
              <div>
                <p className="font-semibold text-foreground">No active units to track</p>
                <p className="mt-1 text-sm text-muted">
                  Dispatched ambulances will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map overlay badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border-0 bg-white/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm">
          <Radio className="h-3.5 w-3.5 text-primary animate-pulse" aria-hidden />
          Live Tracking · {requests.length} active unit{requests.length !== 1 ? "s" : ""}
        </div>

        <div className="absolute right-4 top-4 rounded-xl border-0 bg-amber-50/95 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-md backdrop-blur-sm">
          Demo — real GPS via backend integration
        </div>
      </div>

      {/* Active units list */}
      {requests.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">
            Active Units
          </h2>
          <div className="space-y-3">
            {requests.map((req, i) => {
              const pos = getMockPosition(req, i);
              return (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border-0 bg-[#eef6f4] p-4.5 sm:p-5 shadow-[0_14px_40px_rgba(15,61,53,0.08)] hover:shadow-[0_20px_50px_rgba(13,143,122,0.18)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xs shadow-primary/25">
                      <Ambulance className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{req.patientName}</p>
                      <p className="text-xs text-muted font-mono">
                        {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.etaMinutes != null && (
                      <span className="text-sm font-semibold text-accent bg-accent-soft px-3 py-1 rounded-xl border-0 shadow-xs">
                        ETA {req.etaMinutes} min
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-full border-0 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs",
                        req.status === "en_route"
                          ? "bg-accent-soft text-accent"
                          : "bg-primary-soft text-primary",
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
