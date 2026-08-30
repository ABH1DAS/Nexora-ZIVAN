"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests, statusLabel, INITIAL_DEMO_REQUESTS } from "@/lib/ambulanceStore";
import { LiveTelemetryModal } from "@/components/hospital/LiveTelemetryModal";
import { BedAllocationModal } from "@/components/hospital/BedAllocationModal";
import { AmbulanceCommsDrawer } from "@/components/hospital/AmbulanceCommsDrawer";
import { BloodBankMatcher } from "@/components/hospital/BloodBankMatcher";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { GoogleAmbulanceMap } from "@/components/emergency/GoogleAmbulanceMap";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Activity,
  Ambulance,
  Bed,
  Clock,
  Droplet,
  MapPin,
  Radio,
  UserCheck,
} from "lucide-react";

export default function IncomingPatientsPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<AmbulanceRequest | null>(null);

  // Modals state
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);
  const [bloodOpen, setBloodOpen] = useState(false);

  useEffect(() => {
    return subscribeAmbulanceRequests((all) => {
      const hospitalId = account?.hospitalId || "govt-gmch-trauma";
      const filtered = all
        .filter(
          (r) =>
            r.hospitalId === hospitalId &&
            !["declined", "cancelled"].includes(r.status)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setRequests(
        filtered.length > 0
          ? filtered
          : INITIAL_DEMO_REQUESTS.filter(
              (r) =>
                r.hospitalId === hospitalId &&
                !["declined", "cancelled"].includes(r.status)
            )
      );
    });
  }, [account]);

  const incoming = requests.filter((r) => ["searching", "PENDING", "REQUEST RECEIVED"].includes(r.status));
  const enRoute = requests.filter((r) => ["accepted", "en_route", "AMBULANCE EN ROUTE", "AMBULANCE ASSIGNED", "HOSPITAL ACCEPTED"].includes(r.status));
  const arrived = requests.filter((r) => ["arrived", "AMBULANCE ARRIVED", "PATIENT PICKED UP"].includes(r.status));

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
          <span className="rounded-full bg-current/10 px-2.5 py-0.5 text-xs font-bold text-current">
            {items.length}
          </span>
        </h2>
        {items.length === 0 ? (
          <p className="rounded-[1.5rem] border-0 bg-[#eef6f4] px-4 py-8 text-center text-sm text-muted shadow-sm">
            {emptyMsg}
          </p>
        ) : (
          <div className="space-y-3.5">
            {items.map((req) => (
              <div
                key={req.id}
                className="rounded-[1.5rem] border-0 bg-[#eef6f4] p-5 sm:p-6 shadow-[0_16px_45px_rgba(15,61,53,0.1)] hover:shadow-[0_22px_55px_rgba(13,143,122,0.18)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-base">{req.patientName}</p>
                      {req.allocatedBed && (
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                          📍 {req.allocatedBed}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full border-0 bg-white px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted shadow-2xs">
                    {statusLabel(req.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="flex items-start gap-2 rounded-[1.25rem] border-0 bg-white p-3.5 text-muted shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {req.locationLabel}
                  </div>
                  {req.etaMinutes != null && (
                    <div className="flex items-center gap-2 rounded-[1.25rem] border-0 bg-accent-soft p-3.5 font-semibold text-accent shadow-[0_8px_24px_rgba(26,155,181,0.18)]">
                      <Clock className="h-4 w-4 text-accent" aria-hidden />
                      ETA {req.etaMinutes} min
                    </div>
                  )}
                  {req.acceptedBy && (
                    <div className="flex items-center gap-2 rounded-[1.25rem] border-0 bg-white p-3.5 text-muted shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
                      <UserCheck className="h-4 w-4 text-primary" aria-hidden />
                      {req.acceptedBy}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3.5 text-xs text-muted">
                  <div className="flex flex-wrap gap-4">
                    <span>
                      <Activity className="inline h-3.5 w-3.5 text-primary mr-1" aria-hidden /> Blood:{" "}
                      <strong className="text-foreground">{req.bloodGroup ?? "—"}</strong>
                    </span>
                    <span>
                      Allergies:{" "}
                      <strong className="text-foreground">
                        {req.allergies?.join(", ") || "None"}
                      </strong>
                    </span>
                    <span>
                      Priority:{" "}
                      <strong className={cn(
                        req.priority === "critical" ? "text-emergency" :
                        req.priority === "urgent" ? "text-amber-600" : "text-foreground"
                      )}>
                        {req.priority}
                      </strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
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
                        setBedOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-xl border-0 bg-white px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-[0_4px_14px_rgba(15,61,53,0.08)]"
                    >
                      <Bed className="h-3.5 w-3.5 text-primary" />
                      <span>{req.allocatedBed ? "Change Bed" : "Allocate Bay"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(req);
                        setCommsOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-xl border-0 bg-white px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-[0_4px_14px_rgba(15,61,53,0.08)]"
                    >
                      <Radio className="h-3.5 w-3.5 text-primary" />
                      <span>Radio</span>
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
                      <span>Blood</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  const activeTrackingReq = enRoute[0] || incoming[0] || arrived[0] || null;

  return (
    <div className="space-y-8">
      {/* Live GPS Route Map */}
      {activeTrackingReq && (
        <section className="rounded-[2rem] overflow-hidden border border-border shadow-md bg-white">
          <div className="bg-slate-900 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
              <span className="font-bold text-teal-300 uppercase tracking-wider">
                Live Incoming Route · {activeTrackingReq.patientName} ({activeTrackingReq.vehicleNumber ?? "AS-01-EV-4892"})
              </span>
            </div>
            <span className="text-[11px] text-slate-300">
              ETA: <strong className="text-amber-300">{activeTrackingReq.etaMinutes ?? 6} mins</strong> · {activeTrackingReq.locationLabel}
            </span>
          </div>
          <GoogleAmbulanceMap
            patientCoords={activeTrackingReq.coordinates ?? { lat: 26.1722, lng: 91.7594 }}
            patientLabel={activeTrackingReq.locationLabel ?? "GS Road, Ulubari, Guwahati"}
            ambulanceCoords={{ lat: 26.1640, lng: 91.7670 }}
            ambulanceId={activeTrackingReq.ambulanceId ?? "AMB-01"}
            ambulanceType={activeTrackingReq.ambulanceType ?? "government"}
            driverName={activeTrackingReq.driverName ?? "Rajesh Kumar (Paramedic Leader)"}
            vehicleNumber={activeTrackingReq.vehicleNumber ?? "AS-01-EV-4892"}
            hospitalName={activeTrackingReq.hospitalName ?? account?.hospitalName ?? "GMCH Emergency Trauma Center"}
            status={activeTrackingReq.status}
            etaMinutes={activeTrackingReq.etaMinutes ?? 6}
          />
        </section>
      )}

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

      {/* Modals */}
      <LiveTelemetryModal
        request={selectedReq}
        isOpen={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
      />

      <BedAllocationModal
        request={selectedReq}
        isOpen={bedOpen}
        onClose={() => setBedOpen(false)}
      />

      <AmbulanceCommsDrawer
        request={selectedReq}
        isOpen={commsOpen}
        onClose={() => setCommsOpen(false)}
      />

      <BloodBankMatcher
        request={selectedReq}
        isOpen={bloodOpen}
        onClose={() => setBloodOpen(false)}
      />
    </div>
  );
}

