"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests, statusLabel, INITIAL_DEMO_REQUESTS } from "@/lib/ambulanceStore";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { GoogleAmbulanceMap } from "@/components/emergency/GoogleAmbulanceMap";
import { LiveTelemetryModal } from "@/components/hospital/LiveTelemetryModal";
import { BedAllocationModal } from "@/components/hospital/BedAllocationModal";
import { AmbulanceCommsDrawer } from "@/components/hospital/AmbulanceCommsDrawer";
import { BloodBankMatcher } from "@/components/hospital/BloodBankMatcher";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Activity,
  Ambulance,
  Bed,
  CheckCircle2,
  Clock,
  Droplet,
  MapPin,
  Navigation,
  Phone,
  Radio,
  Shield,
  Siren,
  UserCheck,
} from "lucide-react";

export default function LiveTrackingPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // Clinical tool modals
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);
  const [bloodOpen, setBloodOpen] = useState(false);

  useEffect(() => {
    const hospitalId = account?.hospitalId || "govt-gmch-trauma";
    return subscribeAmbulanceRequests((all) => {
      const mine = all.filter(
        (r) =>
          r.hospitalId === hospitalId &&
          !["cancelled", "declined", "ARRIVED AT HOSPITAL"].includes(r.status)
      );

      const activeList =
        mine.length > 0
          ? mine
          : INITIAL_DEMO_REQUESTS.filter(
              (r) =>
                r.hospitalId === hospitalId &&
                !["cancelled", "declined", "ARRIVED AT HOSPITAL"].includes(r.status)
            );

      setRequests(activeList);
      if (!selectedReqId && activeList.length > 0) {
        setSelectedReqId(activeList[0].id);
      }
    });
  }, [account, selectedReqId]);

  const selectedReq = requests.find((r) => r.id === selectedReqId) ?? requests[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Radio className="h-6 w-6 text-teal-600 animate-pulse" />
            Ambulance Live GPS Tracking & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time ambulance road transit, GPS coordinates, and patient on-scene verification for{" "}
            <strong>{account?.hospitalName ?? "Emergency Trauma Desk"}</strong>.
          </p>
        </div>

        {selectedReq && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
              Tracking Unit: {selectedReq.vehicleNumber ?? "AS-01-EV-4892"}
            </span>
          </div>
        )}
      </div>

      {/* Main Google Maps GPS Tracking Container */}
      {selectedReq ? (
        <div className="space-y-4">
          <GoogleAmbulanceMap
            patientCoords={selectedReq.coordinates ?? { lat: 26.1714, lng: 91.7586 }}
            patientLabel={selectedReq.locationLabel ?? "GS Road, Ulubari / Bhangagarh, Guwahati"}
            ambulanceCoords={{ lat: 26.1640, lng: 91.7670 }}
            ambulanceId={selectedReq.ambulanceId ?? "AMB-01"}
            ambulanceType={selectedReq.ambulanceType ?? "government"}
            driverName={selectedReq.driverName ?? "Rajesh Kumar (Paramedic Leader)"}
            vehicleNumber={selectedReq.vehicleNumber ?? "AS-01-EV-4892"}
            hospitalName={selectedReq.hospitalName ?? account?.hospitalName ?? "GMCH Emergency Trauma Center"}
            status={selectedReq.status}
            etaMinutes={selectedReq.etaMinutes ?? 6}
            singleHospitalOnly={true}
          />

          {/* Active Unit Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
                <Ambulance className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">
                    {selectedReq.patientName} ({selectedReq.bloodGroup ?? "O+"})
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase",
                      selectedReq.status === "AMBULANCE ARRIVED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : selectedReq.status === "PATIENT PICKED UP"
                        ? "bg-sky-100 text-sky-800 border border-sky-300"
                        : "bg-teal-100 text-teal-800 border border-teal-300"
                    )}
                  >
                    {statusLabel(selectedReq.status)}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  {selectedReq.locationLabel} · Paramedic: {selectedReq.driverName ?? "Rajesh Kumar"}
                </p>
              </div>
            </div>

            {/* Quick Actions for Hospital Operators */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTelemetryOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 transition shadow-2xs"
              >
                <Activity className="h-3.5 w-3.5 text-sky-600" />
                Live Vitals
              </button>

              <button
                type="button"
                onClick={() => setBedOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition shadow-2xs"
              >
                <Bed className="h-3.5 w-3.5 text-teal-600" />
                {selectedReq.allocatedBed ? `Bed: ${selectedReq.allocatedBed}` : "Allocate Bed"}
              </button>

              <button
                type="button"
                onClick={() => setBloodOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition shadow-2xs"
              >
                <Droplet className="h-3.5 w-3.5 text-rose-600" />
                Blood Bank
              </button>

              <button
                type="button"
                onClick={() => setCommsOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
              >
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                Radio Comms
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-[2rem] border border-dashed border-border bg-white">
          <Navigation className="h-12 w-12 text-muted/40 mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground">No Dispatched Ambulances Currently Active</h3>
          <p className="text-xs text-muted max-w-sm mt-1">
            When an emergency request is accepted and an ambulance is assigned, live satellite and road telemetry will appear here automatically.
          </p>
        </div>
      )}

      {/* Multiple Active Units Selector Grid */}
      {requests.length > 1 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            All Dispatched Hospital Units ({requests.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => {
              const isSelected = req.id === selectedReq?.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 transition-all",
                    isSelected
                      ? "border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-md"
                      : "border-border bg-white hover:border-teal-300 hover:bg-slate-50/80"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-teal-800">
                      {req.vehicleNumber ?? "AS-01-EV-4892"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase",
                        req.status === "AMBULANCE ARRIVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-teal-100 text-teal-800"
                      )}
                    >
                      {statusLabel(req.status)}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-foreground mt-2 truncate">{req.patientName}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">{req.locationLabel}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1 text-teal-700 font-semibold">
                      <Clock className="h-3 w-3" /> ETA: {req.etaMinutes ?? 6} mins
                    </span>
                    <span>Bay: {req.allocatedBed ?? "Unassigned"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clinical Tool Modals */}
      {selectedReq && (
        <>
          <LiveTelemetryModal
            isOpen={telemetryOpen}
            onClose={() => setTelemetryOpen(false)}
            request={selectedReq}
          />
          <BedAllocationModal
            isOpen={bedOpen}
            onClose={() => setBedOpen(false)}
            request={selectedReq}
          />
          <AmbulanceCommsDrawer
            isOpen={commsOpen}
            onClose={() => setCommsOpen(false)}
            request={selectedReq}
          />
          <BloodBankMatcher
            isOpen={bloodOpen}
            onClose={() => setBloodOpen(false)}
            request={selectedReq}
          />
        </>
      )}
    </div>
  );
}
