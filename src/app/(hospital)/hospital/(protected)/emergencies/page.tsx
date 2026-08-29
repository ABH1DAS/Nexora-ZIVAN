"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests, statusLabel, INITIAL_DEMO_REQUESTS } from "@/lib/ambulanceStore";
import { LiveTelemetryModal } from "@/components/hospital/LiveTelemetryModal";
import { BloodBankMatcher } from "@/components/hospital/BloodBankMatcher";
import { cn } from "@/lib/utils";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Clock3,
  Droplet,
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
  const isPulsing = ["searching", "PENDING", "REQUEST RECEIVED", "AMBULANCE EN ROUTE", "en_route"].includes(status);
  const isGreen = ["arrived", "AMBULANCE ARRIVED", "HELP ARRIVED", "ARRIVED AT HOSPITAL"].includes(status);
  const isRed = ["declined", "cancelled"].includes(status);
  const color = isRed ? "bg-rose-400" : isGreen ? "bg-emerald-500" : "bg-teal-500";

  return <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", color, isPulsing && "animate-pulse")} />;
}

export default function EmergenciesPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>(
    INITIAL_DEMO_REQUESTS.filter((r) => r.hospitalId === "city-hospital")
  );
  const [selectedReq, setSelectedReq] = useState<AmbulanceRequest | null>(null);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [bloodOpen, setBloodOpen] = useState(false);

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

  const active = requests.filter((r) => !["arrived", "ARRIVED AT HOSPITAL", "declined", "cancelled"].includes(r.status));
  const resolved = requests.filter((r) => ["arrived", "ARRIVED AT HOSPITAL", "declined", "cancelled"].includes(r.status));

  return (
    <div className="space-y-6">
      {active.length === 0 && resolved.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border-0 bg-[#eef6f4] py-20 text-center shadow-[0_14px_40px_rgba(15,61,53,0.1)]">
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
                    className="rounded-[1.5rem] border-0 bg-[#eef6f4] p-5 sm:p-6 shadow-[0_16px_45px_rgba(217,53,74,0.16)] hover:shadow-[0_22px_55px_rgba(217,53,74,0.26)] hover:-translate-y-0.5 transition-all duration-300"
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
                        <span className="rounded-full border-0 bg-white px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted shadow-2xs">
                          {statusLabel(req.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2 rounded-[1.25rem] border-0 bg-white p-3.5 text-sm text-muted shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {req.locationLabel}
                      </div>
                      {req.etaMinutes != null ? (
                        <div className="flex items-center gap-2 rounded-[1.25rem] border-0 bg-accent-soft p-3.5 text-sm font-semibold text-accent shadow-[0_8px_24px_rgba(26,155,181,0.18)]">
                          <Clock3 className="h-4 w-4 text-accent" aria-hidden />
                          ETA {req.etaMinutes} min · {req.acceptedBy}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-[1.25rem] border-0 bg-white p-3.5 text-sm text-muted shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                          <Clock3 className="h-4 w-4 text-muted/60" aria-hidden />
                          Awaiting ambulance assignment
                        </div>
                      )}
                    </div>
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3.5 text-xs text-muted">
                      <div className="flex flex-wrap gap-4">
                        <span>
                          Blood group: <strong className="text-foreground">{req.bloodGroup ?? "—"}</strong>
                        </span>
                        <span>
                          Allergies:{" "}
                          <strong className="text-foreground">
                            {req.allergies?.join(", ") || "None"}
                          </strong>
                        </span>
                        {req.allocatedBed && (
                          <span>
                            Allocated Bay: <strong className="text-primary">{req.allocatedBed}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReq(req);
                            setTelemetryOpen(true);
                          }}
                          className="flex items-center gap-1 rounded-xl border-0 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-50 transition shadow-[0_4px_14px_rgba(217,53,74,0.15)]"
                        >
                          <Activity className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                          <span>Telemetry</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReq(req);
                            setBloodOpen(true);
                          }}
                          className="flex items-center gap-1 rounded-xl border-0 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-900 hover:bg-rose-50 transition shadow-[0_4px_14px_rgba(217,53,74,0.15)]"
                        >
                          <Droplet className="h-3.5 w-3.5 text-rose-600" />
                          <span>Blood Match</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3.5 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                Resolved Emergencies ({resolved.length})
              </h2>
              <div className="space-y-3">
                {resolved.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border-0 bg-[#eef6f4] px-5 py-4 text-sm shadow-[0_10px_28px_rgba(15,61,53,0.08)] hover:shadow-[0_14px_36px_rgba(13,143,122,0.14)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={req.status} />
                      <span className="font-semibold text-foreground">{req.patientName}</span>
                      <span className="text-muted text-xs">· {req.locationLabel}</span>
                    </div>
                    <span className="rounded-full border-0 bg-white px-3 py-0.5 text-xs font-semibold uppercase text-muted shadow-2xs">
                      {statusLabel(req.status)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Modals */}
      <LiveTelemetryModal
        request={selectedReq}
        isOpen={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
      />

      <BloodBankMatcher
        request={selectedReq}
        isOpen={bloodOpen}
        onClose={() => setBloodOpen(false)}
      />
    </div>
  );
}
