"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { statusLabel } from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { useEffect, useState } from "react";
import {
  Ambulance,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  XCircle,
} from "lucide-react";

interface MockAmbulance {
  id: string;
  callSign: string;
  driver: string;
  status: "available" | "dispatched" | "returning" | "maintenance";
  currentRequest?: AmbulanceRequest;
}

const MOCK_FLEET: MockAmbulance[] = [
  { id: "amb-01", callSign: "ALPHA-1", driver: "Rajan Kumar", status: "available" },
  { id: "amb-02", callSign: "BRAVO-2", driver: "Priya Singh", status: "available" },
  { id: "amb-03", callSign: "CHARLIE-3", driver: "Arjun Mehta", status: "maintenance" },
  { id: "amb-04", callSign: "DELTA-4", driver: "Sunita Rao", status: "returning" },
];

const statusConfig = {
  available: { label: "Available", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  dispatched: { label: "Dispatched", color: "bg-sky-100 text-sky-800 border-sky-200" },
  returning: { label: "Returning", color: "bg-violet-100 text-violet-800 border-violet-200" },
  maintenance: { label: "Maintenance", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function AmbulancesPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) =>
      setRequests(all.filter((r) => r.hospitalId === account.hospitalId)),
    );
  }, [account]);

  // Assign dispatched requests to ambulances
  const activeRequests = requests.filter((r) => ["accepted", "en_route"].includes(r.status));
  const fleet: MockAmbulance[] = MOCK_FLEET.map((amb, i) => {
    const req = activeRequests[i];
    if (req) return { ...amb, status: "dispatched" as const, currentRequest: req };
    return amb;
  });

  const counts = {
    available: fleet.filter((a) => a.status === "available").length,
    dispatched: fleet.filter((a) => a.status === "dispatched").length,
    maintenance: fleet.filter((a) => a.status === "maintenance").length,
  };

  return (
    <div className="space-y-6">
      {/* Fleet summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Available", count: counts.available, color: "text-primary", bg: "bg-primary-soft/80 shadow-[0_12px_32px_rgba(13,143,122,0.18)] hover:shadow-[0_18px_42px_rgba(13,143,122,0.28)]" },
          { label: "Dispatched", count: counts.dispatched, color: "text-accent", bg: "bg-accent-soft/80 shadow-[0_12px_32px_rgba(26,155,181,0.18)] hover:shadow-[0_18px_42px_rgba(26,155,181,0.28)]" },
          { label: "Maintenance", count: counts.maintenance, color: "text-muted", bg: "bg-slate-50/80 shadow-[0_12px_32px_rgba(15,61,53,0.08)] hover:shadow-[0_18px_42px_rgba(15,61,53,0.14)]" },
        ].map(({ label, count, color, bg }) => (
          <div
            key={label}
            className={cn(
              "rounded-[1.5rem] border-0 p-5 hover:-translate-y-0.5 transition-all duration-300",
              bg,
            )}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
            <p className={cn("mt-3 font-display text-3xl font-semibold", color)}>{count}</p>
          </div>
        ))}
      </div>

      {/* Mock demo note */}
      <div className="flex items-center gap-2.5 rounded-[1.25rem] border-0 bg-[#eef6f4] p-3.5 text-sm text-muted shadow-[0_8px_24px_rgba(15,61,53,0.07)] hover:shadow-[0_12px_32px_rgba(13,143,122,0.14)] transition-all">
        <Radio className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        Fleet data is mock/demo. Real-time GPS integration can be connected by the backend team.
      </div>

      {/* Fleet cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {fleet.map((amb) => {
          const cfg = statusConfig[amb.status];
          return (
            <div
              key={amb.id}
              className="rounded-[1.5rem] border-0 bg-[#eef6f4] p-5 sm:p-6 shadow-[0_16px_45px_rgba(15,61,53,0.1)] hover:shadow-[0_22px_55px_rgba(13,143,122,0.18)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xs shadow-primary/25">
                    <Ambulance className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{amb.callSign}</p>
                    <p className="text-xs text-muted">{amb.driver}</p>
                  </div>
                </div>
                <span className={cn("rounded-full border-0 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs", cfg.color)}>
                  {cfg.label}
                </span>
              </div>

              {amb.currentRequest ? (
                <div className="mt-4 rounded-[1.25rem] border-0 bg-accent-soft p-4 text-sm shadow-[0_8px_24px_rgba(26,155,181,0.18)]">
                  <p className="font-semibold text-accent">{amb.currentRequest.patientName}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                    {amb.currentRequest.locationLabel}
                  </div>
                  {amb.currentRequest.etaMinutes != null && (
                    <div className="mt-1 flex items-center gap-2 text-accent font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      ETA {amb.currentRequest.etaMinutes} min
                    </div>
                  )}
                  <p className="mt-1 text-xs font-semibold uppercase text-accent/80">
                    {statusLabel(amb.currentRequest.status)}
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                  {amb.status === "available" ? (
                    <><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden /> Ready for dispatch</>
                  ) : amb.status === "returning" ? (
                    <><Ambulance className="h-4 w-4 text-violet-500" aria-hidden /> Returning to base</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-muted/60" aria-hidden /> Out of service</>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
