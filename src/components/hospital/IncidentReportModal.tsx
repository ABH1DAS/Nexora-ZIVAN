"use client";

import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Heart,
  MapPin,
  Printer,
  ShieldAlert,
  User,
  X,
} from "lucide-react";

interface IncidentReportModalProps {
  request: AmbulanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IncidentReportModal({
  request,
  isOpen,
  onClose,
}: IncidentReportModalProps) {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const vitals = request.vitals ?? {
    hr: 108,
    bp: "138/88",
    spo2: 95,
    rr: 22,
    temp: 37.4,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border-0 bg-white shadow-[0_25px_70px_rgba(13,143,122,0.28)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-0 bg-gradient-to-r from-slate-900 via-[#0f2420] to-slate-900 px-6 py-4 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Emergency Incident Summary Report</h3>
              <p className="text-xs text-slate-300">
                Official Clinical Dispatch Record · ID: <code className="font-mono text-emerald-400">{request.id}</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="overflow-y-auto p-8 space-y-6 bg-white text-foreground print:p-0">
          {/* Hospital Header */}
          <div className="flex items-start justify-between border-b border-black/5 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-display text-xl font-bold text-foreground">
                  {request.hospitalName}
                </span>
              </div>
              <p className="text-xs text-muted font-medium">Emergency Medicine &amp; Trauma Command Directorate</p>
              <p className="text-[11px] text-muted/80">Accredited Emergency Dispatch &amp; Ambulance Services</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-semibold text-slate-700">
                CASE: {request.id}
              </span>
              <p className="mt-1 text-xs text-muted">
                Generated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Patient Details & Triage Classification */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border-0 bg-[#eef6f4] p-3 shadow-xs">
              <span className="text-[11px] text-muted block">Patient Name</span>
              <p className="font-bold text-foreground text-sm">{request.patientName}</p>
            </div>
            <div className="rounded-xl border-0 bg-rose-50 p-3 shadow-xs">
              <span className="text-[11px] text-rose-800 block">Triage Priority</span>
              <p className="font-bold text-emergency text-sm uppercase">{request.priority}</p>
            </div>
            <div className="rounded-xl border-0 bg-[#eef6f4] p-3 shadow-xs">
              <span className="text-[11px] text-muted block">Blood Group</span>
              <p className="font-bold text-rose-600 text-sm">{request.bloodGroup || "O+"}</p>
            </div>
            <div className="rounded-xl border-0 bg-[#eef6f4] p-3 shadow-xs">
              <span className="text-[11px] text-muted block">Allocated Bay</span>
              <p className="font-bold text-primary text-sm">{request.allocatedBed || "Trauma Bay 01"}</p>
            </div>
          </div>

          {/* Vitals at Dispatch */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted mb-2.5">
              En-Route Recorded Physiological Vitals:
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-xl border-0 bg-[#eef6f4] p-2.5 shadow-2xs">
                <span className="text-[10px] text-muted block">Heart Rate</span>
                <span className="font-display font-bold text-sm text-foreground">{vitals.hr} BPM</span>
              </div>
              <div className="rounded-xl border-0 bg-[#eef6f4] p-2.5 shadow-2xs">
                <span className="text-[10px] text-muted block">Blood Pressure</span>
                <span className="font-display font-bold text-sm text-foreground">{vitals.bp}</span>
              </div>
              <div className="rounded-xl border-0 bg-[#eef6f4] p-2.5 shadow-2xs">
                <span className="text-[10px] text-muted block">Oxygen SpO2</span>
                <span className="font-display font-bold text-sm text-foreground">{vitals.spo2}%</span>
              </div>
              <div className="rounded-xl border-0 bg-[#eef6f4] p-2.5 shadow-2xs">
                <span className="text-[10px] text-muted block">Core Temp</span>
                <span className="font-display font-bold text-sm text-foreground">{vitals.temp}°C</span>
              </div>
            </div>
          </div>

          {/* Incident Timeline & Clinical Notes */}
          <div className="space-y-3">
            <div className="rounded-xl border-0 bg-[#eef6f4] p-3.5 text-xs space-y-1.5 shadow-xs">
              <span className="font-bold text-foreground block">Incident Location &amp; Dispatch Dispatcher:</span>
              <p className="text-muted">
                📍 {request.locationLabel} · Dispatched Unit: <strong>{request.acceptedBy || "City Dispatch Desk"}</strong>
              </p>
            </div>

            <div className="rounded-xl border-0 bg-[#eef6f4] p-3.5 text-xs space-y-1.5 shadow-xs">
              <span className="font-bold text-foreground block">Paramedic Incident Observations:</span>
              <p className="text-muted leading-relaxed">{request.notes}</p>
            </div>

            {request.handoverNotes && (
              <div className="rounded-xl border-0 bg-primary-soft/70 p-3.5 text-xs space-y-1.5 shadow-xs">
                <span className="font-bold text-primary block">Clinical Handover &amp; Administered Interventions:</span>
                <p className="text-muted leading-relaxed">{request.handoverNotes}</p>
              </div>
            )}
          </div>

          {/* Physician Sign-Off */}
          <div className="pt-4 border-t border-black/5 flex justify-between items-end text-xs">
            <div>
              <p className="text-muted">Attending Emergency Physician Signature:</p>
              <div className="h-10 border-b border-dashed border-slate-300 w-48 mt-2" />
              <p className="text-[11px] text-muted/80 mt-1">MD, Emergency Medicine / Trauma</p>
            </div>
            <div className="text-right text-muted text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Certified Clinical Record
              </span>
              <p>ZIVAN Trauma Command System</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-black/5 bg-[#eef6f4] px-6 py-4 print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
