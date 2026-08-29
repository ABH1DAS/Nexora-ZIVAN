"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests, statusLabel } from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
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
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-border bg-white/70 py-20 text-center shadow-xs">
          <ShieldAlert className="h-10 w-10 text-muted/60" aria-hidden />
          <div>
            <p className="font-semibold text-foreground">No emergency requests</p>
            <p className="mt-1 text-sm text-muted">
              Trigger an SOS from the patient app to create a live demo request.
            </p>
          </div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-3.5 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted">
                <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
                Active Emergencies ({active.length})
              </h2>
              <div className="space-y-3.5">
                {active.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-6 shadow-[0_12px_36px_rgba(217,53,74,0.12)] hover:shadow-[0_18px_48px_rgba(217,53,74,0.2)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StatusDot status={req.status} />
                        <div>
                          <p className="font-semibold text-foreground">{req.patientName}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={req.priority} />
                        <span className="rounded-full border border-border bg-slate-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted shadow-2xs">
                          {statusLabel(req.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2 rounded-[1.25rem] bg-slate-50/80 p-3.5 text-sm text-muted">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {req.locationLabel}
                      </div>
                      {req.etaMinutes != null ? (
                        <div className="flex items-center gap-2 rounded-[1.25rem] border border-accent/25 bg-accent-soft p-3.5 text-sm font-semibold text-accent shadow-[0_4px_16px_rgba(26,155,181,0.15)]">
                          <Clock3 className="h-4 w-4 text-accent" aria-hidden />
                          ETA {req.etaMinutes} min · {req.acceptedBy}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-[1.25rem] bg-slate-50/80 p-3.5 text-sm text-muted">
                          <Clock3 className="h-4 w-4 text-muted/60" aria-hidden />
                          Awaiting ambulance assignment
                        </div>
                      )}
                    </div>
                    <div className="mt-3.5 flex flex-wrap gap-4 border-t border-border pt-3.5 text-xs text-muted">
                      <span>
                        Blood group: <strong className="text-foreground">{req.bloodGroup ?? "—"}</strong>
                      </span>
                      <span>
                        Allergies:{" "}
                        <strong className="text-foreground">
                          {req.allergies?.join(", ") || "None"}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">
                Resolved ({resolved.length})
              </h2>
              <div className="space-y-2.5">
                {resolved.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/90 px-4 py-3.5 text-sm shadow-[0_4px_16px_rgba(15,61,53,0.04)] hover:shadow-[0_8px_24px_rgba(13,143,122,0.12)] hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={req.status} />
                      <span className="font-semibold text-foreground">{req.patientName}</span>
                      <span className="text-muted">{req.locationLabel}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase text-muted">
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
