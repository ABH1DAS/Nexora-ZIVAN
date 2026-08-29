"use client";

import { Button } from "@/components/ui/Button";
import type { AmbulanceRequest, HospitalAccount } from "@/data/ambulanceRequests";
import {
  acceptHospital,
  assignAmbulanceWithDetails,
  declineAmbulanceRequest,
  getHospitalSession,
  logoutHospitalStaff,
  markArrived,
  markArrivedAtHospital,
  markEnRoute,
  markPickedUp,
  markRequestReceived,
  statusLabel,
  subscribeAmbulanceRequests,
} from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Heart,
  LogOut,
  MapPin,
  Phone,
  ShieldAlert,
  Siren,
  Stethoscope,
  UserCheck,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function toneForStatus(status: AmbulanceRequest["status"]) {
  if (status === "PENDING" || status === "searching") return "bg-rose-100 text-rose-900 border-rose-300 animate-pulse";
  if (status === "REQUEST RECEIVED") return "bg-amber-100 text-amber-900 border-amber-300";
  if (status === "HOSPITAL ACCEPTED" || status === "accepted") return "bg-indigo-100 text-indigo-900 border-indigo-300";
  if (status === "AMBULANCE ASSIGNED") return "bg-purple-100 text-purple-900 border-purple-300";
  if (status === "AMBULANCE EN ROUTE" || status === "en_route") return "bg-sky-100 text-sky-900 border-sky-300";
  if (status === "AMBULANCE ARRIVED" || status === "arrived") return "bg-teal-100 text-teal-900 border-teal-300";
  if (status === "PATIENT PICKED UP") return "bg-slate-900 text-amber-300 border-amber-500";
  if (status === "ARRIVED AT HOSPITAL") return "bg-emerald-600 text-white border-emerald-700";
  if (status === "declined" || status === "cancelled") return "bg-slate-200 text-slate-700 border-slate-300";
  return "bg-slate-100 text-slate-700";
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<HospitalAccount | null>(null);
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "completed">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals state
  const [viewDetailModal, setViewDetailModal] = useState<AmbulanceRequest | null>(null);
  const [assignAmbulanceModal, setAssignAmbulanceModal] = useState<AmbulanceRequest | null>(null);

  // Ambulance assignment form state
  const [assignUnitId, setAssignUnitId] = useState("");
  const [assignDriverName, setAssignDriverName] = useState("");
  const [assignVehicleNumber, setAssignVehicleNumber] = useState("");
  const [assignEtaMins, setAssignEtaMins] = useState("8");

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
      // Show requests matched to this hospital OR general pending SOS calls
      const mine = all.filter((r) => r.hospitalId === session.hospitalId || r.status === "PENDING" || r.status === "searching");
      setRequests(mine);
      setSelectedId((prev) => {
        if (prev && mine.some((r) => r.id === prev)) return prev;
        return mine[0]?.id ?? null;
      });
    });
  }, [session]);

  const pendingRequests = useMemo(() => {
    return requests.filter((r) => ["PENDING", "searching", "REQUEST RECEIVED"].includes(r.status));
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((request) => {
      if (filter === "all") return true;
      if (filter === "pending") return ["PENDING", "searching", "REQUEST RECEIVED"].includes(request.status);
      if (filter === "active") {
        return ["HOSPITAL ACCEPTED", "accepted", "AMBULANCE ASSIGNED", "AMBULANCE EN ROUTE", "en_route", "AMBULANCE ARRIVED", "arrived", "PATIENT PICKED UP"].includes(request.status);
      }
      return ["ARRIVED AT HOSPITAL", "declined", "cancelled"].includes(request.status);
    });
  }, [filter, requests]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;

  if (!session) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        Loading hospital ER console...
      </div>
    );
  }

  function refreshNotice(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 4000);
  }

  function handleOpenAssignModal(req: AmbulanceRequest) {
    setAssignAmbulanceModal(req);
    setAssignUnitId(req.ambulanceId ?? `AMB-IND-${Math.floor(100 + Math.random() * 900)}`);
    setAssignDriverName(req.driverName ?? "Rajesh Kumar (Paramedic Leader)");
    setAssignVehicleNumber(req.vehicleNumber ?? "DL-01-EV-4892");
    setAssignEtaMins(String(req.estimatedArrivalTime ?? 8));
  }

  function handleSaveAmbulanceAssignment() {
    if (!assignAmbulanceModal) return;
    assignAmbulanceWithDetails(assignAmbulanceModal.id, {
      ambulanceId: assignUnitId,
      driverName: assignDriverName,
      vehicleNumber: assignVehicleNumber,
      estimatedArrivalTime: Number(assignEtaMins) || 8,
    });
    refreshNotice(`Assigned Ambulance Unit ${assignUnitId} (${assignVehicleNumber}) to ${assignAmbulanceModal.patientName}.`);
    setAssignAmbulanceModal(null);
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800">
            <Siren className="h-4 w-4 text-rose-600 animate-pulse" />
            Supabase Shared ER Dispatch Console
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            {session.hospitalName}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Signed in as {session.contactName} ({session.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 animate-bounce" />
            {pendingRequests.length} Active Pending SOS Calls
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              logoutHospitalStaff();
              router.push("/hospital/login");
            }}
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {notice && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900" role="status">
          ✓ {notice}
        </p>
      )}

      {/* ─── 🚨 NEW EMERGENCY REQUESTS PROMINENT SECTION ─── */}
      <section className="rounded-[2.25rem] border-2 border-rose-500 bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg animate-pulse">
              <Siren className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                🚨 NEW EMERGENCY REQUESTS ({pendingRequests.length})
              </h2>
              <p className="text-xs text-rose-200">
                Real-time emergency dispatches received from ZIVAN Patient Portal.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/40">
            Supabase Live Sync Connected
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-xs text-slate-400">
            No incoming pending emergency requests. Trigger an SOS from the Patient Portal to see real-time dispatch alerts here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex flex-col justify-between rounded-2xl border border-rose-500/40 bg-slate-900/90 p-5 shadow-lg space-y-4 backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-rose-300 font-bold uppercase">#{req.id.slice(-6)}</span>
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                      {statusLabel(req.status)}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-bold text-white">{req.patientName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-rose-400" /> {new Date(req.createdAt).toLocaleTimeString()}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="truncate"><strong className="text-slate-400">Location:</strong> {req.locationLabel}</p>
                    <p><strong className="text-slate-400">Ambulance:</strong> <span className="capitalize font-bold text-teal-300">{req.ambulanceType ?? "government"}</span></p>
                    <p><strong className="text-slate-400">Specialist:</strong> <span className="font-bold text-amber-300">{req.doctorSpecialization ?? "Emergency – Not Sure"}</span></p>
                    <p><strong className="text-slate-400">Hospital:</strong> {req.hospitalName}</p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewDetailModal(req)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      acceptHospital(req.id, session.contactName, 8);
                      refreshNotice(`Accepted emergency request for ${req.patientName}.`);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-500 shadow-md transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Main Console Split View */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Column: Request Filter & List */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {(
              [
                ["pending", "Pending Dispatch"],
                ["active", "En Route / Active"],
                ["completed", "Completed / Admitted"],
                ["all", "All Records"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                  filter === id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs">
              <Ambulance className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 font-bold text-slate-700">No emergency requests in this view</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((request) => (
                <li key={request.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(request.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all",
                      selectedId === request.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{request.patientName}</span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase",
                            request.ambulanceType === "private" ? "bg-indigo-500 text-white" : "bg-emerald-500 text-white"
                          )}>
                            {request.ambulanceType ?? "government"}
                          </span>
                        </div>
                        <p className={cn("text-xs mt-1", selectedId === request.id ? "text-slate-300" : "text-slate-500")}>
                          Specialist: <strong>{request.doctorSpecialization ?? "Emergency – Not Sure"}</strong>
                        </p>
                      </div>

                      <span className={cn(
                        "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        selectedId === request.id ? "bg-white/20 text-white border-white/30" : toneForStatus(request.status)
                      )}>
                        {statusLabel(request.status)}
                      </span>
                    </div>

                    <p className={cn("mt-2 text-xs truncate", selectedId === request.id ? "text-slate-200" : "text-slate-600")}>
                      📍 {request.locationLabel}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right Column: Selected Request Timeline & Paramedic Assignment Controls */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          {!selected ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-xs font-semibold text-slate-400">
              Select an emergency dispatch request from the left column to view details.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Top Banner */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Dispatch ID #{selected.id ? selected.id.slice(-6) : "101"}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-slate-900">{selected.patientName}</h2>
                  <p className="text-xs text-slate-500">
                    Received: {new Date(selected.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <span className={cn("rounded-full border px-3 py-1 text-xs font-bold uppercase", toneForStatus(selected.status))}>
                  {statusLabel(selected.status)}
                </span>
              </div>

              {/* Extended SOS Details Grid */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-slate-500 font-medium block">Ambulance Category</span>
                  <strong className="text-slate-900 font-bold capitalize text-sm">{selected.ambulanceType ?? "government"} Ambulance</strong>
                  {selected.estimatedPrivateFare && (
                    <p className="mt-1 text-indigo-900 font-bold">Fare: {selected.estimatedPrivateFare}</p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-slate-500 font-medium block">Required Doctor Specialization</span>
                  <strong className="text-teal-800 font-bold text-sm">{selected.doctorSpecialization ?? "Emergency – Not Sure"}</strong>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-slate-500 font-medium block">Patient Location</span>
                  <strong className="text-slate-900 font-bold">{selected.locationLabel}</strong>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {selected.coordinates.lat.toFixed(4)}, {selected.coordinates.lng.toFixed(4)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-slate-500 font-medium block">Patient Contact</span>
                  <strong className="text-slate-900 font-bold">{selected.patientPhone ?? "+91 98765 43210"}</strong>
                  <p className="mt-0.5 text-rose-700 font-bold">Blood Group: {selected.bloodGroup ?? "O+"}</p>
                </div>
              </div>

              {/* Paramedic & Vehicle Specs Banner */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-teal-950 flex items-center gap-2">
                    <Ambulance className="h-4 w-4 text-teal-700" /> Assigned Paramedic Unit & Vehicle
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(selected)}
                    className="rounded-lg bg-teal-700 px-3 py-1 text-[11px] font-bold text-white hover:bg-teal-800"
                  >
                    [ASSIGN AMBULANCE]
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-teal-900">
                  <div>Unit ID: <strong className="font-mono font-bold">{selected.ambulanceId ?? "AMB-01"}</strong></div>
                  <div>Paramedic Leader: <strong>{selected.driverName ?? "Rajesh Kumar"}</strong></div>
                  <div>Vehicle Reg No: <strong className="font-mono font-bold">{selected.vehicleNumber ?? "DL-01-EV-4892"}</strong></div>
                  <div>ETA: <strong className="font-bold">{selected.estimatedArrivalTime ?? 8} mins</strong></div>
                </div>
              </div>

              {/* 8-Step Timeline Advancement Console */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Advance Timeline Status</h4>

                <div className="flex flex-wrap gap-2">
                  {/* Step 1: Mark Request Received */}
                  {["PENDING", "searching"].includes(selected.status) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        markRequestReceived(selected.id);
                        refreshNotice("Marked request as RECEIVED by Hospital ER desk.");
                      }}
                    >
                      Step 2: Mark Request Received
                    </Button>
                  )}

                  {/* Step 2: Accept Hospital */}
                  {["PENDING", "searching", "REQUEST RECEIVED"].includes(selected.status) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        acceptHospital(selected.id, session.contactName, 8);
                        refreshNotice("Accepted hospital emergency request.");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Step 3: Accept Hospital Request
                    </Button>
                  )}

                  {/* Step 3: Assign Ambulance Modal Trigger */}
                  {["HOSPITAL ACCEPTED", "accepted"].includes(selected.status) && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenAssignModal(selected)}
                    >
                      <UserPlus className="h-4 w-4" /> Step 4: [ASSIGN AMBULANCE]
                    </Button>
                  )}

                  {/* Step 4: Mark En Route */}
                  {["AMBULANCE ASSIGNED"].includes(selected.status) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        markEnRoute(selected.id);
                        refreshNotice("Ambulance dispatched en route to patient pin.");
                      }}
                    >
                      Step 5: Mark Ambulance En Route
                    </Button>
                  )}

                  {/* Step 5: Mark Ambulance Arrived */}
                  {["AMBULANCE EN ROUTE", "en_route"].includes(selected.status) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        markArrived(selected.id);
                        refreshNotice("Ambulance marked as arrived at patient scene.");
                      }}
                    >
                      Step 6: Mark Ambulance Arrived
                    </Button>
                  )}

                  {/* Step 6: Mark Patient Picked Up */}
                  {["AMBULANCE ARRIVED", "arrived"].includes(selected.status) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        markPickedUp(selected.id);
                        refreshNotice("Patient picked up and onboard ambulance.");
                      }}
                    >
                      Step 7: Mark Patient Picked Up
                    </Button>
                  )}

                  {/* Step 7: Mark Arrived at Hospital */}
                  {["PATIENT PICKED UP"].includes(selected.status) && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => {
                        markArrivedAtHospital(selected.id);
                        refreshNotice("Patient safely admitted to Hospital Emergency Room.");
                      }}
                    >
                      Step 8: Mark Arrived at ER Room (Complete)
                    </Button>
                  )}

                  {/* Decline Option */}
                  {!["ARRIVED AT HOSPITAL", "declined", "cancelled"].includes(selected.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => {
                        declineAmbulanceRequest(selected.id, session.contactName);
                        refreshNotice("Request declined.");
                      }}
                    >
                      <XCircle className="h-4 w-4" /> Decline
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ─── MODAL: VIEW DETAILS ─── */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2.25rem] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-600" /> Emergency Patient Details
              </h3>
              <button type="button" onClick={() => setViewDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-200">
                <div className="flex justify-between font-bold text-sm">
                  <span>{viewDetailModal.patientName}</span>
                  <span className="text-rose-600">{statusLabel(viewDetailModal.status)}</span>
                </div>
                <p>Phone: <strong>{viewDetailModal.patientPhone ?? "+91 98765 43210"}</strong></p>
                <p>Location: <strong>{viewDetailModal.locationLabel}</strong></p>
                <p>GPS: <strong className="font-mono">{viewDetailModal.coordinates.lat}, {viewDetailModal.coordinates.lng}</strong></p>
              </div>

              <div className="rounded-2xl bg-teal-50 p-4 space-y-2 border border-teal-200 text-teal-950">
                <p>Requested Ambulance: <strong className="capitalize">{viewDetailModal.ambulanceType ?? "government"} Ambulance</strong></p>
                <p>Specialist Needed: <strong>{viewDetailModal.doctorSpecialization ?? "Emergency – Not Sure"}</strong></p>
                <p>Target Hospital: <strong>{viewDetailModal.hospitalName}</strong></p>
                {viewDetailModal.notes && <p>Notes: <em>{viewDetailModal.notes}</em></p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setViewDetailModal(null)} variant="secondary" size="sm">
                Close
              </Button>
              {["PENDING", "searching", "REQUEST RECEIVED"].includes(viewDetailModal.status) && (
                <Button
                  size="sm"
                  onClick={() => {
                    acceptHospital(viewDetailModal.id, session.contactName, 8);
                    refreshNotice(`Accepted emergency request for ${viewDetailModal.patientName}.`);
                    setViewDetailModal(null);
                  }}
                >
                  Accept Request
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: ASSIGN AMBULANCE ─── */}
      {assignAmbulanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.25rem] border-2 border-indigo-500 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display text-lg font-bold text-indigo-950 flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-indigo-600" /> [ASSIGN AMBULANCE]
              </h3>
              <button type="button" onClick={() => setAssignAmbulanceModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Assign paramedic team & vehicle details for <strong>{assignAmbulanceModal.patientName}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ambulance Unit ID</label>
                <input
                  type="text"
                  value={assignUnitId}
                  onChange={(e) => setAssignUnitId(e.target.value)}
                  placeholder="e.g. AMB-IND-402"
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Driver / Paramedic Leader Name</label>
                <input
                  type="text"
                  value={assignDriverName}
                  onChange={(e) => setAssignDriverName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar (Paramedic Leader)"
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  value={assignVehicleNumber}
                  onChange={(e) => setAssignVehicleNumber(e.target.value)}
                  placeholder="e.g. DL-01-EV-4892"
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Arrival Time (ETA Minutes)</label>
                <input
                  type="number"
                  value={assignEtaMins}
                  onChange={(e) => setAssignEtaMins(e.target.value)}
                  placeholder="8"
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveAmbulanceAssignment} className="flex-1">
                Save & Assign Ambulance
              </Button>
              <Button onClick={() => setAssignAmbulanceModal(null)} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
