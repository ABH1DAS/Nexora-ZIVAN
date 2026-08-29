"use client";

import { Button } from "@/components/ui/Button";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import type { HospitalAccount } from "@/data/ambulanceRequests";
import {
  acceptAmbulanceRequest,
  declineAmbulanceRequest,
  getHospitalSession,
  logoutHospitalStaff,
  markAmbulanceArrived,
  markAmbulanceEnRoute,
  statusLabel,
  subscribeAmbulanceRequests,
} from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import {
  Ambulance,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function toneForStatus(status: AmbulanceRequest["status"]) {
  if (status === "searching") return "bg-amber-100 text-amber-800";
  if (status === "accepted" || status === "en_route") return "bg-sky-100 text-sky-800";
  if (status === "arrived") return "bg-emerald-100 text-emerald-800";
  if (status === "declined" || status === "cancelled") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<HospitalAccount | null>(null);
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "searching" | "active" | "closed">(
    "searching",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const current = getHospitalSession();
    if (!current) {
      router.replace("/hospital/login");
      return;
    }
    setSession(current);
  }, [router]);

  useEffect(() => {
    if (!session) return;
    return subscribeAmbulanceRequests((all) => {
      const mine = all.filter((r) => r.hospitalId === session.hospitalId);
      setRequests(mine);
      setSelectedId((prev) => {
        if (prev && mine.some((r) => r.id === prev)) return prev;
        return mine[0]?.id ?? null;
      });
    });
  }, [session]);

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      if (filter === "all") return true;
      if (filter === "searching") return request.status === "searching";
      if (filter === "active") {
        return ["accepted", "en_route"].includes(request.status);
      }
      return ["arrived", "declined", "cancelled"].includes(request.status);
    });
  }, [filter, requests]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const pendingCount = requests.filter((r) => r.status === "searching").length;

  if (!session) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        Loading hospital console...
      </div>
    );
  }

  function refreshNotice(message: string) {
    setNotice(message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Connected facility
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {session.hospitalName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Signed in as {session.contactName} · {session.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {pendingCount} awaiting response
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              logoutHospitalStaff();
              router.push("/hospital/login");
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Demo portal only. Accepting a request here does not dispatch a real ambulance.
        Open the member SOS screen in another tab to create live demo requests.
        <Link href="/dashboard/emergency" className="ml-1 font-semibold underline">
          Member emergency dashboard
        </Link>
      </div>

      {notice && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["searching", "Incoming"],
                ["active", "Active"],
                ["closed", "Closed"],
                ["all", "All"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                  filter === id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <Ambulance className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No requests in this view
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Trigger SOS from the ZIVAN member app to create a demo request for{" "}
                {session.hospitalName}.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((request) => (
                <li key={request.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(request.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition",
                      selectedId === request.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{request.patientName}</p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            selectedId === request.id
                              ? "text-white/70"
                              : "text-slate-500",
                          )}
                        >
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                          selectedId === request.id
                            ? "bg-white/15 text-white"
                            : toneForStatus(request.status),
                        )}
                      >
                        {statusLabel(request.status)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-3 text-sm",
                        selectedId === request.id
                          ? "text-white/80"
                          : "text-slate-600",
                      )}
                    >
                      {request.locationLabel}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {!selected ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-500">
              Select a request to review patient and location details.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Request {selected.id}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">
                    {selected.patientName}
                  </h2>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                    toneForStatus(selected.status),
                  )}
                >
                  {statusLabel(selected.status)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <p className="mb-1 inline-flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4" aria-hidden />
                    Location
                  </p>
                  <p className="text-slate-600">{selected.locationLabel}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selected.coordinates.lat.toFixed(4)},{" "}
                    {selected.coordinates.lng.toFixed(4)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <p className="mb-1 inline-flex items-center gap-2 font-semibold">
                    <Phone className="h-4 w-4" aria-hidden />
                    Contact
                  </p>
                  <p className="text-slate-600">
                    {selected.patientPhone ?? "Not provided"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Priority: {selected.priority}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 text-sm">
                <p className="font-semibold">Emergency health profile</p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Blood group</dt>
                    <dd className="font-semibold">{selected.bloodGroup ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Allergies</dt>
                    <dd className="font-semibold">
                      {selected.allergies?.join(", ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Medications</dt>
                    <dd className="font-semibold">
                      {selected.medications?.join(", ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Notes</dt>
                    <dd className="font-semibold">{selected.notes}</dd>
                  </div>
                </dl>
              </div>

              {selected.etaMinutes != null && (
                <p className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
                  <Clock3 className="h-4 w-4" aria-hidden />
                  ETA {selected.etaMinutes} minutes
                  {selected.acceptedBy ? ` · ${selected.acceptedBy}` : ""}
                </p>
              )}

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                {selected.status === "searching" && (
                  <>
                    <Button
                      onClick={() => {
                        acceptAmbulanceRequest(
                          selected.id,
                          session.contactName,
                          12,
                        );
                        refreshNotice(
                          "Ambulance request accepted. Member SOS view will update.",
                        );
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Accept ambulance request
                    </Button>
                    <Button
                      variant="emergency"
                      onClick={() => {
                        declineAmbulanceRequest(selected.id, session.contactName);
                        refreshNotice(
                          "Request declined. Member can contact local emergency services directly.",
                        );
                      }}
                    >
                      <XCircle className="h-4 w-4" aria-hidden />
                      Decline
                    </Button>
                  </>
                )}
                {selected.status === "accepted" && (
                  <Button
                    onClick={() => {
                      markAmbulanceEnRoute(selected.id);
                      refreshNotice("Status updated to ambulance en route.");
                    }}
                  >
                    Mark en route
                  </Button>
                )}
                {selected.status === "en_route" && (
                  <Button
                    onClick={() => {
                      markAmbulanceArrived(selected.id);
                      refreshNotice("Ambulance marked as arrived.");
                    }}
                  >
                    Mark arrived
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
