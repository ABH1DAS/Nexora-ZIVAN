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
          { label: "Available", count: counts.available, color: "text-emerald-600", bg: "bg-emerald-50/90 border-emerald-200/90 hover:border-emerald-300" },
          { label: "Dispatched", count: counts.dispatched, color: "text-sky-600", bg: "bg-sky-50/90 border-sky-200/90 hover:border-sky-300" },
          { label: "Maintenance", count: counts.maintenance, color: "text-slate-500", bg: "bg-slate-50/90 border-slate-200/90 hover:border-slate-300" },
        ].map(({ label, count, color, bg }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300",
              bg,
            )}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p className={cn("mt-3 font-display text-3xl font-semibold", color)}>{count}</p>
          </div>
        ))}
      </div>

      {/* Mock demo note */}
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 p-3.5 text-sm text-slate-500 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all">
        <Radio className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        Fleet data is mock/demo. Real-time GPS integration can be connected by the backend team.
      </div>

      {/* Fleet cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {fleet.map((amb) => {
          const cfg = statusConfig[amb.status];
          return (
            <div
              key={amb.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1f2a] shadow-xs shadow-slate-900/15">
                    <Ambulance className="h-5 w-5 text-white" aria-hidden />
                  </div>
                  <div>
                    <p className="font-bold text-[#0b1f2a]">{amb.callSign}</p>
                    <p className="text-xs text-slate-500">{amb.driver}</p>
                  </div>
                </div>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs", cfg.color)}>
                  {cfg.label}
                </span>
              </div>

              {amb.currentRequest ? (
                <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/80 p-3.5 text-sm shadow-2xs">
                  <p className="font-semibold text-sky-800">{amb.currentRequest.patientName}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-sky-600">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {amb.currentRequest.locationLabel}
                  </div>
                  {amb.currentRequest.etaMinutes != null && (
                    <div className="mt-1 flex items-center gap-2 text-sky-600 font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      ETA {amb.currentRequest.etaMinutes} min
                    </div>
                  )}
                  <p className="mt-1 text-xs font-semibold uppercase text-sky-500">
                    {statusLabel(amb.currentRequest.status)}
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  {amb.status === "available" ? (
                    <><CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden /> Ready for dispatch</>
                  ) : amb.status === "returning" ? (
                    <><Ambulance className="h-4 w-4 text-violet-500" aria-hidden /> Returning to base</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-slate-400" aria-hidden /> Under maintenance</>
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
