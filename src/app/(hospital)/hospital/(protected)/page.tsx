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
    default: "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300",
    amber: "bg-amber-50/90 border-amber-200/90 text-amber-900 hover:border-amber-300",
    sky: "bg-sky-50/90 border-sky-200/90 text-sky-900 hover:border-sky-300",
    emerald: "bg-emerald-50/90 border-emerald-200/90 text-emerald-900 hover:border-emerald-300",
    rose: "bg-rose-50/90 border-rose-200/90 text-rose-900 hover:border-rose-300",
  };
  const iconTones = {
    default: "text-slate-400",
    amber: "text-amber-500",
    sky: "text-sky-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
  };
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300",
        tones[tone],
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest opacity-65">{label}</p>
        <Icon className={cn("h-5 w-5", iconTones[tone])} aria-hidden />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
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
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Incoming" value={pendingCount} icon={ShieldAlert} tone="amber" />
        <StatCard label="Active" value={activeCount} icon={Ambulance} tone="sky" />
        <StatCard label="Resolved Today" value={resolvedCount} icon={Activity} tone="emerald" />
        <StatCard label="Total" value={requests.length} icon={TrendingUp} tone="default" />
      </div>

      {/* Demo banner division */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3.5 text-sm text-amber-900 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        <span>
          Demo portal — accepting a request does not dispatch a real ambulance.{" "}
          <Link href="/dashboard/emergency" className="font-semibold underline underline-offset-2 hover:text-amber-950">
            Trigger a test SOS →
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
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-sky-200 bg-sky-50 text-sky-800",
          )}
        >
          {notice.msg}
        </div>
      )}

      {/* Request list + detail panel divisions */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* LEFT — Request list */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
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
                    ? "bg-[#0b1f2a] text-white shadow-sm"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900 hover:shadow-xs",
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
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-12 text-center">
              <Ambulance className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-slate-600">No requests here</p>
              <p className="mt-1 text-xs text-slate-400">
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
                      "w-full rounded-xl border p-4 text-left transition-all duration-200",
                      selectedId === req.id
                        ? "border-[#0b1f2a] bg-[#0b1f2a] text-white shadow-md shadow-slate-900/15"
                        : "border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white hover:shadow-sm hover:-translate-y-0.5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{req.patientName}</p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            selectedId === req.id ? "text-white/60" : "text-slate-400",
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
                            ? "border-white/20 bg-white/15 text-white"
                            : toneForStatus(req.status),
                        )}
                      >
                        {statusLabel(req.status)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-2 truncate text-sm",
                        selectedId === req.id ? "text-white/70" : "text-slate-500",
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
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
          {!selected ? (
            <div className="flex h-full min-h-[340px] flex-col items-center justify-center gap-3 text-center">
              <Ambulance className="h-10 w-10 text-slate-200" aria-hidden />
              <p className="text-sm font-semibold text-slate-400">
                Select a request to view patient details
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Request · {selected.id}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#0b1f2a]">
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
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm shadow-2xs hover:shadow-xs hover:border-slate-200 transition-all">
                  <p className="mb-1.5 flex items-center gap-2 font-semibold text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
                    Location
                  </p>
                  <p className="text-slate-600">{selected.locationLabel}</p>
                  <p className="mt-1 text-xs font-mono text-slate-400">
                    {selected.coordinates.lat.toFixed(4)}, {selected.coordinates.lng.toFixed(4)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm shadow-2xs hover:shadow-xs hover:border-slate-200 transition-all">
                  <p className="mb-1.5 flex items-center gap-2 font-semibold text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                    Contact
                  </p>
                  <p className="text-slate-600">{selected.patientPhone ?? "Not provided"}</p>
                  <p className="mt-1 text-xs capitalize text-slate-400">
                    Priority: <span className="font-semibold text-slate-600">{selected.priority}</span>
                  </p>
                </div>
              </div>

              {/* Health profile */}
              <div className="rounded-xl border border-slate-200/80 p-4 text-sm shadow-xs hover:shadow-sm hover:border-slate-300 transition-all">
                <p className="mb-3 font-semibold text-slate-700">Emergency Health Profile</p>
                <dl className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    ["Blood group", selected.bloodGroup ?? "—"],
                    ["Allergies", selected.allergies?.join(", ") || "—"],
                    ["Medications", selected.medications?.join(", ") || "—"],
                    ["Notes", selected.notes],
                  ].map(([dt, dd]) => (
                    <div key={dt}>
                      <dt className="text-xs text-slate-400">{dt}</dt>
                      <dd className="mt-0.5 font-semibold text-slate-700">{dd}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ETA */}
              {selected.etaMinutes != null && (
                <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 shadow-xs">
                  <Clock3 className="h-4 w-4 shrink-0" aria-hidden />
                  ETA {selected.etaMinutes} minutes
                  {selected.acceptedBy && (
                    <span className="font-normal text-sky-600">· {selected.acceptedBy}</span>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                {selected.status === "searching" && (
                  <>
                    <Button
                      variant="hospital"
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
                    variant="hospital"
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
                    variant="hospital"
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
