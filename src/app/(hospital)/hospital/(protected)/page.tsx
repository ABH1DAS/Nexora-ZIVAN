"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import {
  subscribeAmbulanceRequests,
  acceptAmbulanceRequest,
  declineAmbulanceRequest,
  markAmbulanceEnRoute,
  markAmbulanceArrived,
  statusLabel,
  INITIAL_DEMO_REQUESTS,
} from "@/lib/ambulanceStore";
import { hospitalAudio } from "@/lib/hospitalAudio";
import { exportRequestsToCSV } from "@/lib/exportUtils";
import { LiveTelemetryModal } from "@/components/hospital/LiveTelemetryModal";
import { BedAllocationModal } from "@/components/hospital/BedAllocationModal";
import { AmbulanceCommsDrawer } from "@/components/hospital/AmbulanceCommsDrawer";
import { BloodBankMatcher } from "@/components/hospital/BloodBankMatcher";
import { IncidentReportModal } from "@/components/hospital/IncidentReportModal";
import type { AmbulanceRequest, AmbulanceRequestStatus } from "@/data/ambulanceRequests";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bed,
  CheckCircle2,
  Clock,
  Clock3,
  Download,
  Droplet,
  FileText,
  Heart,
  MapPin,
  Maximize2,
  Monitor,
  Phone,
  Radio,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Wind,
  XCircle,
} from "lucide-react";

type FilterTab = "all" | "pending" | "active" | "resolved";

function toneForStatus(status: AmbulanceRequestStatus) {
  switch (status) {
    case "searching":
      return "bg-amber-100 text-amber-800";
    case "accepted":
      return "bg-primary-soft text-primary";
    case "en_route":
      return "bg-sky-100 text-sky-800";
    case "arrived":
      return "bg-emerald-100 text-emerald-800";
    case "declined":
    case "cancelled":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone?: "amber" | "sky" | "emerald" | "default";
}) {
  const iconTones = {
    amber: "bg-amber-100 text-amber-600 shadow-2xs shadow-amber-500/20",
    sky: "bg-accent-soft text-accent shadow-2xs shadow-accent/20",
    emerald: "bg-primary-soft text-primary shadow-2xs shadow-primary/20",
    default: "bg-slate-100 text-muted shadow-2xs",
  };

  const cardGlows = {
    amber: "shadow-[0_14px_38px_rgba(245,158,11,0.18)] hover:shadow-[0_20px_48px_rgba(245,158,11,0.28)]",
    sky: "shadow-[0_14px_38px_rgba(26,155,181,0.18)] hover:shadow-[0_20px_48px_rgba(26,155,181,0.28)]",
    emerald: "shadow-[0_14px_38px_rgba(13,143,122,0.18)] hover:shadow-[0_20px_48px_rgba(13,143,122,0.28)]",
    default: "shadow-[0_14px_38px_rgba(15,61,53,0.1)] hover:shadow-[0_20px_48px_rgba(15,61,53,0.16)]",
  };

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border-0 bg-[#eef6f4] p-5 hover:-translate-y-0.5 transition-all duration-300",
        cardGlows[tone],
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconTones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {value}
      </p>
    </div>
  );
}

export default function HospitalDashboardPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>(
    INITIAL_DEMO_REQUESTS.filter((r) => r.hospitalId === "city-hospital")
  );
  const [selectedId, setSelectedId] = useState<string | null>("amb_sample_01");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [notice, setNotice] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  // Clinical tool modals
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [commsDrawerOpen, setCommsDrawerOpen] = useState(false);
  const [bloodModalOpen, setBloodModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeAmbulanceRequests((all) => {
      const hospitalId = account?.hospitalId || "city-hospital";
      const mine = all.filter((r) => r.hospitalId === hospitalId);
      const activeList =
        mine.length > 0
          ? mine
          : INITIAL_DEMO_REQUESTS.filter((r) => r.hospitalId === "city-hospital");
      setRequests(activeList);
      if (!selectedId && activeList.length > 0) {
        setSelectedId(activeList[0].id);
      }
    });
    return unsub;
  }, [account, selectedId]);

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0] ?? null;

  const filtered = requests.filter((r) => {
    if (filter === "pending") return ["searching", "PENDING", "REQUEST RECEIVED"].includes(r.status);
    if (filter === "active") return ["accepted", "en_route", "HOSPITAL ACCEPTED", "AMBULANCE ASSIGNED", "AMBULANCE EN ROUTE", "AMBULANCE ON THE WAY", "AMBULANCE ARRIVED", "HELP ARRIVED", "PATIENT PICKED UP"].includes(r.status);
    if (filter === "resolved") return ["arrived", "ARRIVED AT HOSPITAL", "declined", "cancelled"].includes(r.status);
    return true;
  });

  const pendingCount = requests.filter((r) => ["searching", "PENDING", "REQUEST RECEIVED"].includes(r.status)).length;
  const activeCount = requests.filter((r) => ["accepted", "en_route", "HOSPITAL ACCEPTED", "AMBULANCE ASSIGNED", "AMBULANCE EN ROUTE", "AMBULANCE ON THE WAY", "AMBULANCE ARRIVED", "HELP ARRIVED", "PATIENT PICKED UP"].includes(r.status)).length;
  const resolvedCount = requests.filter((r) => ["arrived", "ARRIVED AT HOSPITAL", "declined", "cancelled"].includes(r.status)).length;

  function flash(msg: string, type: "success" | "info" = "success") {
    setNotice({ msg, type });
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <section className="rounded-[2rem] border-0 bg-gradient-to-br from-[#ebf5f2] via-[#e2f0ed] to-[#d6edf3] p-6 sm:p-8 shadow-[0_20px_50px_rgba(13,143,122,0.18)] hover:shadow-[0_26px_60px_rgba(13,143,122,0.25)] transition-all duration-300">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider">Operational Console</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {account.hospitalName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              Real-time emergency dispatch, incoming patient triage, and ambulance fleet coordination.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#0f2420] px-5 py-4 text-white shadow-[0_14px_35px_rgba(15,36,32,0.45)]">
            <p className="text-xs uppercase tracking-wide text-white/60 font-semibold">Active Queue</p>
            <p className="mt-1 font-display text-3xl font-bold text-emerald-400">
              🚑 {pendingCount + activeCount} units
            </p>
            <p className="mt-1 text-sm text-teal-200 font-medium">
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
      <div className="flex items-start gap-3 rounded-[1.5rem] border-0 bg-[#fcf5e8] px-5 py-3.5 text-sm text-amber-950 shadow-[0_12px_32px_rgba(245,158,11,0.16)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.24)] transition-all duration-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <div className="flex-1">
          <p className="font-semibold">Live Operational Sync Active</p>
          <p className="mt-0.5 text-xs text-amber-800">
            Emergency requests triggered from the Member App arrive here in real-time. Status changes instantly update member tracking.
          </p>
        </div>
        <button
          onClick={() => exportRequestsToCSV(requests)}
          className="flex items-center gap-1.5 rounded-xl border-0 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-[0_4px_14px_rgba(245,158,11,0.2)] hover:bg-amber-50 hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)] transition"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            "flex items-center justify-between rounded-[1.25rem] border-0 px-4 py-3 text-sm shadow-[0_10px_28px_rgba(13,143,122,0.15)] animate-in fade-in duration-200",
            notice.type === "success"
              ? "bg-primary-soft text-primary"
              : "bg-slate-100 text-slate-700",
          )}
        >
          <span>{notice.msg}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-semibold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-column layout: Request list & Detail panel */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Request list division */}
        <section
          aria-label="Ambulance requests"
          className="rounded-[2rem] border-0 bg-[#eef6f4] p-5 sm:p-6 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300 lg:col-span-2"
        >
          {/* Filter tabs */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", `All (${requests.length})`],
                  ["pending", `SOS (${pendingCount})`],
                  ["active", `Active (${activeCount})`],
                  ["resolved", `Done (${resolvedCount})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
                    filter === key
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white/80 text-muted hover:bg-primary-soft hover:text-primary hover:shadow-2xs",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-[1.5rem] border-0 bg-white/60 py-12 text-center shadow-xs">
              <Ambulance className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
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
                      "w-full rounded-[1.25rem] border-0 p-4 text-left transition-all duration-300",
                      selectedId === req.id
                        ? "bg-primary text-white shadow-[0_12px_32px_rgba(13,143,122,0.35)] -translate-y-0.5"
                        : "bg-white shadow-[0_6px_20px_rgba(15,61,53,0.07)] hover:shadow-[0_12px_30px_rgba(13,143,122,0.18)] hover:-translate-y-0.5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{req.patientName}</p>
                        <p className={cn("mt-0.5 text-xs", selectedId === req.id ? "text-white/80" : "text-muted")}>
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          {req.priority}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border-0 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs",
                          selectedId === req.id
                            ? "bg-white/20 text-white"
                            : toneForStatus(req.status),
                        )}
                      >
                        {statusLabel(req.status)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right: Request detail division */}
        <section
          aria-label="Request details"
          className="rounded-[2rem] border-0 bg-[#eef6f4] p-5 sm:p-6 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300 lg:col-span-3"
        >
          {!selected ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted">
              Select a request from the queue to view details &amp; dispatch actions.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {selected.patientName}
                    </h2>
                    <span
                      className={cn(
                        "rounded-full border-0 px-3 py-0.5 text-xs font-bold uppercase tracking-wide shadow-2xs",
                        toneForStatus(selected.status),
                      )}
                    >
                      {statusLabel(selected.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Request ID: <code className="font-mono text-foreground font-semibold">{selected.id}</code> · Priority:{" "}
                    <strong className="capitalize text-foreground font-bold">{selected.priority}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Received</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(selected.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Patient info card */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border-0 bg-white p-3.5 shadow-[0_6px_20px_rgba(15,61,53,0.06)] hover:shadow-[0_10px_26px_rgba(13,143,122,0.12)] transition">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Pickup Location</p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {selected.locationLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border-0 bg-white p-3.5 shadow-[0_6px_20px_rgba(15,61,53,0.06)] hover:shadow-[0_10px_26px_rgba(13,143,122,0.12)] transition">
                  <Phone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Patient Phone</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selected.patientPhone ?? "+91 98XXX XXXXX (Demo)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Health Profile */}
              <div className="rounded-[1.25rem] border-0 bg-white p-4.5 text-sm shadow-[0_8px_24px_rgba(15,61,53,0.08)] hover:shadow-[0_12px_32px_rgba(13,143,122,0.14)] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Emergency Health Profile</p>
                  {selected.allocatedBed && (
                    <span className="rounded-full bg-primary-soft px-3 py-0.5 text-xs font-semibold text-primary">
                      Bed: {selected.allocatedBed}
                    </span>
                  )}
                </div>
                <dl className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    ["Blood group", selected.bloodGroup ?? "—"],
                    ["Allergies", selected.allergies?.join(", ") || "—"],
                    ["Medications", selected.medications?.join(", ") || "—"],
                    ["Notes", selected.notes || "—"],
                  ].map(([dt, dd]) => (
                    <div key={dt}>
                      <dt className="text-xs text-muted">{dt}</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{dd}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ETA & Assigned Bed info */}
              {selected.etaMinutes != null && (
                <div className="flex items-center justify-between rounded-2xl border-0 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent shadow-[0_8px_24px_rgba(26,155,181,0.18)]">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0" aria-hidden />
                    ETA {selected.etaMinutes} minutes
                    {selected.acceptedBy && (
                      <span className="font-normal text-muted">· Dispatched by {selected.acceptedBy}</span>
                    )}
                  </div>
                  {selected.allocatedBed && (
                    <span className="text-xs text-foreground bg-white/70 px-2.5 py-1 rounded-xl">
                      📍 {selected.allocatedBed}
                    </span>
                  )}
                </div>
              )}

              {/* Clinical Tools & Modals Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTelemetryModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-0 bg-white p-2.5 text-xs font-semibold text-rose-800 hover:bg-rose-50 transition shadow-[0_6px_20px_rgba(217,53,74,0.12)] hover:shadow-[0_10px_28px_rgba(217,53,74,0.22)]"
                >
                  <Activity className="h-4 w-4 text-rose-600 animate-pulse" />
                  <span>Live Telemetry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBedModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-0 bg-white p-2.5 text-xs font-semibold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-[0_6px_20px_rgba(15,61,53,0.07)] hover:shadow-[0_10px_28px_rgba(13,143,122,0.18)]"
                >
                  <Bed className="h-4 w-4 text-primary" />
                  <span>Allocate Bay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommsDrawerOpen(true)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-0 bg-white p-2.5 text-xs font-semibold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-[0_6px_20px_rgba(15,61,53,0.07)] hover:shadow-[0_10px_28px_rgba(13,143,122,0.18)]"
                >
                  <Radio className="h-4 w-4 text-primary" />
                  <span>Radio Comms</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBloodModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-0 bg-white p-2.5 text-xs font-semibold text-rose-900 hover:bg-rose-50 transition shadow-[0_6px_20px_rgba(217,53,74,0.12)] hover:shadow-[0_10px_28px_rgba(217,53,74,0.22)]"
                >
                  <Droplet className="h-4 w-4 text-rose-600" />
                  <span>Blood Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-0 bg-white p-2.5 text-xs font-semibold text-foreground hover:bg-slate-50 transition shadow-[0_6px_20px_rgba(15,61,53,0.07)] hover:shadow-[0_10px_28px_rgba(15,61,53,0.14)] col-span-2 sm:col-span-1"
                >
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span>Incident Report</span>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 border-t border-black/5 pt-5">
                {selected.status === "searching" && (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        acceptAmbulanceRequest(selected.id, account.contactName, 12);
                        hospitalAudio.playDispatchChime();
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
                      hospitalAudio.playDispatchChime();
                      flash("Status updated to En Route. Member tracking live.");
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
                      hospitalAudio.playDispatchChime();
                      flash("Status updated to Arrived. Patient at ER bay.");
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Mark Arrived at ER
                  </Button>
                )}

                {["arrived", "declined", "cancelled"].includes(selected.status) && (
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    This request is complete. No further dispatch actions required.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Clinical Modals */}
      <LiveTelemetryModal
        request={selected}
        isOpen={telemetryModalOpen}
        onClose={() => setTelemetryModalOpen(false)}
      />

      <BedAllocationModal
        request={selected}
        isOpen={bedModalOpen}
        onClose={() => setBedModalOpen(false)}
      />

      <AmbulanceCommsDrawer
        request={selected}
        isOpen={commsDrawerOpen}
        onClose={() => setCommsDrawerOpen(false)}
      />

      <BloodBankMatcher
        request={selected}
        isOpen={bloodModalOpen}
        onClose={() => setBloodModalOpen(false)}
      />

      <IncidentReportModal
        request={selected}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
