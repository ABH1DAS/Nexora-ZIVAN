"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { statusLabel } from "@/lib/ambulanceStore";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Clock3,
  MapPin,
  ShieldAlert,
} from "lucide-react";

function PriorityBadge({ priority }: { priority: AmbulanceRequest["priority"] }) {
  const map = {
    critical: "bg-rose-100 text-rose-800 border-rose-200",
    urgent: "bg-amber-100 text-amber-800 border-amber-200",
    standard: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", map[priority])}>
      {priority}
    </span>
  );
}

function StatusDot({ status }: { status: AmbulanceRequest["status"] }) {
  const colors: Record<AmbulanceRequest["status"], string> = {
    searching: "bg-amber-400 animate-pulse",
    accepted: "bg-sky-400",
    en_route: "bg-sky-500 animate-pulse",
    arrived: "bg-emerald-500",
    declined: "bg-rose-400",
    cancelled: "bg-slate-300",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[status])} />;
}

export default function EmergenciesPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) =>
      setRequests(all.filter((r) => r.hospitalId === account.hospitalId)),
    );
  }, [account]);

  const active = requests.filter((r) => ["searching", "accepted", "en_route"].includes(r.status));
  const resolved = requests.filter((r) => ["arrived", "declined", "cancelled"].includes(r.status));

  return (
    <div className="space-y-6">
      {active.length === 0 && resolved.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <ShieldAlert className="h-10 w-10 text-slate-300" aria-hidden />
          <div>
            <p className="font-semibold text-slate-600">No emergency requests</p>
            <p className="mt-1 text-sm text-slate-400">
              Trigger an SOS from the patient app to create a live demo request.
            </p>
          </div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
                Active Emergencies ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StatusDot status={req.status} />
                        <div>
                          <p className="font-semibold text-[#0b1f2a]">{req.patientName}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={req.priority} />
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                          {statusLabel(req.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                        {req.locationLabel}
                      </div>
                      {req.etaMinutes != null && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
                          <Clock3 className="h-4 w-4 text-sky-400" aria-hidden />
                          ETA {req.etaMinutes} min · {req.acceptedBy}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      <span className="font-semibold">Blood:</span> {req.bloodGroup ?? "—"} ·{" "}
                      <span className="font-semibold">Allergies:</span>{" "}
                      {req.allergies?.join(", ") || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
                Resolved ({resolved.length})
              </h2>
              <div className="space-y-2">
                {resolved.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={req.status} />
                      <span className="font-semibold text-slate-700">{req.patientName}</span>
                      <span className="text-slate-400">{req.locationLabel}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase text-slate-400">
                      {statusLabel(req.status)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
