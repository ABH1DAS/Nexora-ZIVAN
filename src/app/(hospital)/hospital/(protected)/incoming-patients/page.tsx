"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { statusLabel } from "@/lib/ambulanceStore";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Activity,
  Ambulance,
  Clock,
  MapPin,
  UserCheck,
} from "lucide-react";

export default function IncomingPatientsPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) =>
      setRequests(
        all
          .filter(
            (r) =>
              r.hospitalId === account.hospitalId &&
              !["declined", "cancelled"].includes(r.status),
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
      ),
    );
  }, [account]);

  const incoming = requests.filter((r) => r.status === "searching");
  const enRoute = requests.filter((r) => ["accepted", "en_route"].includes(r.status));
  const arrived = requests.filter((r) => r.status === "arrived");

  function Section({
    title,
    items,
    emptyMsg,
    accent,
  }: {
    title: string;
    items: AmbulanceRequest[];
    emptyMsg: string;
    accent: string;
  }) {
    return (
      <section>
        <h2 className={cn("mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest", accent)}>
          {title}
          <span className="rounded-full bg-current/10 px-2 py-0.5 text-xs font-bold text-current">
            {items.length}
          </span>
        </h2>
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            {emptyMsg}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0b1f2a]">{req.patientName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {statusLabel(req.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    {req.locationLabel}
                  </div>
                  {req.etaMinutes != null && (
                    <div className="flex items-center gap-2 font-semibold text-sky-600">
                      <Clock className="h-4 w-4" aria-hidden />
                      ETA {req.etaMinutes} min
                    </div>
                  )}
                  {req.acceptedBy && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <UserCheck className="h-4 w-4 text-slate-400" aria-hidden />
                      {req.acceptedBy}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>
                    <Activity className="inline h-3.5 w-3.5 text-slate-400" aria-hidden /> Blood:{" "}
                    <strong className="text-slate-700">{req.bloodGroup ?? "—"}</strong>
                  </span>
                  <span>
                    Allergies:{" "}
                    <strong className="text-slate-700">
                      {req.allergies?.join(", ") || "None"}
                    </strong>
                  </span>
                  <span>
                    Priority:{" "}
                    <strong className={cn(
                      req.priority === "critical" ? "text-rose-600" :
                      req.priority === "urgent" ? "text-amber-600" : "text-slate-600"
                    )}>
                      {req.priority}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <Section
        title="Awaiting Dispatch"
        items={incoming}
        emptyMsg="No patients currently awaiting dispatch."
        accent="text-amber-600"
      />
      <Section
        title="En Route"
        items={enRoute}
        emptyMsg="No ambulances currently en route."
        accent="text-sky-600"
      />
      <Section
        title="Arrived"
        items={arrived}
        emptyMsg="No patients have arrived yet today."
        accent="text-emerald-600"
      />
    </div>
  );
}
