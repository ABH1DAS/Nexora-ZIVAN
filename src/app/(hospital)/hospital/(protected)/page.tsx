"use client";

import { Button } from "@/components/ui/Button";
import { useHospitalAuth } from "@/lib/hospitalAuth";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import {
  acceptAmbulanceRequest,
  declineAmbulanceRequest,
  markAmbulanceArrived,
  markAmbulanceEnRoute,
  statusLabel,
  subscribeAmbulanceRequests,
} from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import {
  Activity,
  Ambulance,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  ShieldAlert,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function toneForStatus(status: AmbulanceRequest["status"]) {
  if (status === "searching") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "accepted" || status === "en_route") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "arrived") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "declined" || status === "cancelled") return "bg-rose-100 text-rose-800 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: "default" | "amber" | "sky" | "emerald" | "rose";
}) {
  const tones = {
    default: "bg-white text-foreground shadow-[0_12px_32px_rgba(15,61,53,0.08)] hover:shadow-[0_18px_42px_rgba(15,61,53,0.14)]",
    amber: "bg-amber-50/80 text-amber-900 shadow-[0_12px_32px_rgba(245,158,11,0.16)] hover:shadow-[0_18px_42px_rgba(245,158,11,0.25)]",
    sky: "bg-accent-soft/80 text-accent shadow-[0_12px_32px_rgba(26,155,181,0.18)] hover:shadow-[0_18px_42px_rgba(26,155,181,0.28)]",
    emerald: "bg-primary-soft/80 text-primary-dark shadow-[0_12px_32px_rgba(13,143,122,0.18)] hover:shadow-[0_18px_42px_rgba(13,143,122,0.28)]",
    rose: "bg-emergency-soft/80 text-emergency-dark shadow-[0_12px_32px_rgba(217,53,74,0.18)] hover:shadow-[0_18px_42px_rgba(217,53,74,0.28)]",
  };
  const iconTones = {
    default: "text-muted",
    amber: "text-amber-500",
    sky: "text-accent",
    emerald: "text-primary",
    rose: "text-emergency",
  };
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border-0 p-5 hover:-translate-y-0.5 transition-all duration-300",
        tones[tone],
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        <Icon className={cn("h-5 w-5", iconTones[tone])} aria-hidden />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export default function HospitalDashboardPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "searching" | "active" | "closed">("searching");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) => {
      const mine = all.filter((r) => r.hospitalId === account.hospitalId);
      setRequests(mine);
      setSelectedId((prev) => {
        if (prev && mine.some((r) => r.id === prev)) return prev;
        return mine[0]?.id ?? null;
      });
    });
  }, [account]);

  // Auto-dismiss notice
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filter === "all") return true;
      if (filter === "searching") return r.status === "searching";
      if (filter === "active") return ["accepted", "en_route"].includes(r.status);
      return ["arrived", "declined", "cancelled"].includes(r.status);
    });
  }, [filter, requests]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const pendingCount = requests.filter((r) => r.status === "searching").length;
  const activeCount = requests.filter((r) => ["accepted", "en_route"].includes(r.status)).length;
  const resolvedCount = requests.filter((r) => ["arrived", "declined", "cancelled"].includes(r.status)).length;

  function flash(msg: string, type: "success" | "info" = "success") {
    setNotice({ msg, type });
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-[#f3faf8] to-[#e8f6fb] p-6 sm:p-8 shadow-[0_18px_45px_rgba(13,143,122,0.12)] hover:shadow-[0_24px_55px_rgba(13,143,122,0.18)] transition-all duration-300">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Operational Console</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {account.hospitalName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              Real-time emergency dispatch, incoming patient triage, and ambulance fleet coordination.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#0f2420] px-5 py-4 text-white shadow-[0_12px_30px_rgba(15,36,32,0.35)]">
            <p className="text-xs uppercase tracking-wide text-white/60">Active Queue</p>
            <p className="mt-1 font-display text-3xl font-bold">
              🚑 {pendingCount + activeCount} units
            </p>
            <p className="mt-1 text-sm text-teal-200">
              {pendingCount} incoming SOS
            </p>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Incoming SOS" value={pendingCount} icon={ShieldAlert} tone="amber" />
        <StatCard label="Active En Route" value={activeCount} icon={Ambulance} tone="sky" />
        <StatCard label="Resolved Today" value={resolvedCount} icon={Activity} tone="emerald" />
        <StatCard label="Total Requests" value={requests.length} icon={TrendingUp} tone="default" />
      </div>

      {/* Demo banner division */}
      <div className="flex items-start gap-3 rounded-[1.5rem] border border-amber-200/90 bg-amber-50/90 px-5 py-3.5 text-sm text-amber-900 shadow-[0_10px_26px_rgba(245,158,11,0.12)] hover:shadow-[0_14px_34px_rgba(245,158,11,0.18)] hover:border-amber-300 transition-all duration-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        <span>
          Demo portal — accepting a request simulates live patient dispatch.{" "}
          <Link href="/dashboard/emergency" className="font-semibold underline underline-offset-2 hover:text-amber-950">
            Trigger a test SOS from Patient Portal →
          </Link>
        </span>
      </div>

      {/* Notice toast */}
      {notice && (
        <div
          role="status"
          className={cn(
            "rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-300",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[0_10px_30px_rgba(5,150,105,0.18)]"
              : "border-sky-200 bg-sky-50 text-sky-800 shadow-[0_10px_30px_rgba(26,155,181,0.18)]",
          )}
        >
          {notice.msg}
        </div>
      )}

      {/* Request list + detail panel divisions */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* LEFT — Request list */}
        <section className="rounded-[2rem] border border-border bg-white/90 backdrop-blur p-5 shadow-[0_16px_45px_rgba(15,61,53,0.08)] hover:shadow-[0_22px_55px_rgba(13,143,122,0.14)] transition-all duration-300">
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["searching", "Incoming"],
                ["active", "Active"],
                ["closed", "Closed"],
                ["all", "All"],
              ] as const
            ).map(([id, lbl]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200",
                  filter === id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate-100 text-muted hover:bg-primary-soft hover:text-primary hover:shadow-2xs",
                )}
              >
                {lbl}
                {id === "searching" && pendingCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-slate-50/60 px-4 py-12 text-center">
              <Ambulance className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-muted">No requests here</p>
              <p className="mt-1 text-xs text-muted/70">
                Trigger SOS from the member app to create a request for{" "}
                {account.hospitalName}.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filtered.map((req) => (
                <li key={req.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(req.id)}
                    className={cn(
                      "w-full rounded-[1.25rem] border p-4 text-left transition-all duration-200",
                      selectedId === req.id
                        ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                        : "border-border bg-white hover:border-primary/40 hover:bg-slate-50/80 hover:shadow-xs hover:-translate-y-0.5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{req.patientName}</p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            selectedId === req.id ? "text-white/70" : "text-muted",
                          )}
                        >
                          {new Date(req.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {req.priority}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs",
                          selectedId === req.id
                            ? "border-white/25 bg-white/20 text-white"
                            : toneForStatus(req.status),
                        )}
                      >
                        {statusLabel(req.status)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-2 truncate text-sm",
                        selectedId === req.id ? "text-white/80" : "text-muted",
                      )}
                    >
                      {req.locationLabel}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RIGHT — Detail panel */}
        <section className="rounded-[2rem] border border-border bg-white/90 backdrop-blur p-6 sm:p-7 shadow-[0_16px_45px_rgba(15,61,53,0.08)] hover:shadow-[0_22px_55px_rgba(13,143,122,0.14)] transition-all duration-300">
          {!selected ? (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center gap-3 text-center">
              <Ambulance className="h-10 w-10 text-slate-200" aria-hidden />
              <p className="text-sm font-semibold text-muted">
                Select a request to view patient details
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                    Request · {selected.id}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
                    {selected.patientName}
                  </h2>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-2xs",
                    toneForStatus(selected.status),
                  )}
                >
                  {statusLabel(selected.status)}
                </span>
              </div>

              {/* Location + Contact */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-border bg-slate-50/80 p-4 text-sm shadow-2xs hover:shadow-xs hover:border-primary/30 transition-all">
                  <p className="mb-1.5 flex items-center gap-2 font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden />
                    Location
                  </p>
                  <p className="text-muted">{selected.locationLabel}</p>
                  <p className="mt-1 text-xs font-mono text-muted/70">
                    {selected.coordinates.lat.toFixed(4)}, {selected.coordinates.lng.toFixed(4)}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-border bg-slate-50/80 p-4 text-sm shadow-2xs hover:shadow-xs hover:border-primary/30 transition-all">
                  <p className="mb-1.5 flex items-center gap-2 font-semibold text-foreground">
                    <Phone className="h-4 w-4 text-primary" aria-hidden />
                    Contact
                  </p>
                  <p className="text-muted">{selected.patientPhone ?? "Not provided"}</p>
                  <p className="mt-1 text-xs capitalize text-muted">
                    Priority: <span className="font-semibold text-foreground">{selected.priority}</span>
                  </p>
                </div>
              </div>

              {/* Health profile */}
              <div className="rounded-[1.25rem] border border-border bg-white p-4.5 text-sm shadow-xs hover:shadow-sm hover:border-primary/30 transition-all">
                <p className="mb-3 font-semibold text-foreground">Emergency Health Profile</p>
                <dl className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    ["Blood group", selected.bloodGroup ?? "—"],
                    ["Allergies", selected.allergies?.join(", ") || "—"],
                    ["Medications", selected.medications?.join(", ") || "—"],
                    ["Notes", selected.notes],
                  ].map(([dt, dd]) => (
                    <div key={dt}>
                      <dt className="text-xs text-muted">{dt}</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{dd}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ETA */}
              {selected.etaMinutes != null && (
                <div className="flex items-center gap-2 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent shadow-xs">
                  <Clock3 className="h-4 w-4 shrink-0" aria-hidden />
                  ETA {selected.etaMinutes} minutes
                  {selected.acceptedBy && (
                    <span className="font-normal text-muted">· {selected.acceptedBy}</span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                {selected.status === "searching" && (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        acceptAmbulanceRequest(selected.id, account.contactName, 12);
                        flash("Request accepted. Ambulance dispatched. Member SOS view will update.");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Accept &amp; Dispatch
                    </Button>
                    <Button
                      variant="emergency"
                      size="md"
                      onClick={() => {
                        declineAmbulanceRequest(selected.id, account.contactName);
                        flash("Request declined. Member notified.", "info");
                      }}
                    >
                      <XCircle className="h-4 w-4" aria-hidden />
                      Decline
                    </Button>
                  </>
                )}
                {selected.status === "accepted" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      markAmbulanceEnRoute(selected.id);
                      flash("Status updated — ambulance en route.");
                    }}
                  >
                    <Ambulance className="h-4 w-4" aria-hidden />
                    Mark En Route
                  </Button>
                )}
                {selected.status === "en_route" && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      markAmbulanceArrived(selected.id);
                      flash("Ambulance marked as arrived.");
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Mark Arrived
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
