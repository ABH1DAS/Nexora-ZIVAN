"use client";

import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { assignBedToRequest } from "@/lib/ambulanceStore";
import { hospitalAudio } from "@/lib/hospitalAudio";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Bed,
  CheckCircle2,
  HeartPulse,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

interface BedAllocationModalProps {
  request: AmbulanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAllocated?: (bed: string) => void;
}

const AVAILABLE_BEDS = [
  { id: "bay-01", name: "Trauma Bay 01 (Resus)", dept: "Emergency Trauma", type: "Critical", equipment: "Ventilator + Defibrillator" },
  { id: "bay-02", name: "Trauma Bay 02", dept: "Emergency Trauma", type: "Urgent", equipment: "Multi-parameter Monitor" },
  { id: "icu-03", name: "ICU Bed 03 (Negative Pressure)", dept: "Intensive Care Unit", type: "Critical", equipment: "Invasive Hemodynamic Monitor" },
  { id: "icu-05", name: "ICU Bed 05", dept: "Intensive Care Unit", type: "Critical", equipment: "Ventilator + Syringe Pumps" },
  { id: "ccu-01", name: "Cardiac Care Unit 01", dept: "Cardiology", type: "Urgent", equipment: "Continuous 12-Lead ECG" },
  { id: "gen-12", name: "General Observation Bed 12", dept: "Emergency Ward", type: "Standard", equipment: "Basic Telemetry" },
  { id: "peds-04", name: "Paediatric ER Bay 04", dept: "Paediatrics", type: "Urgent", equipment: "Paediatric Crash Cart" },
];

export function BedAllocationModal({
  request,
  isOpen,
  onClose,
  onAllocated,
}: BedAllocationModalProps) {
  const [selectedBed, setSelectedBed] = useState<string>(
    request?.allocatedBed ?? "Trauma Bay 01 (Resus)",
  );
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = () => {
    assignBedToRequest(request.id, selectedBed);
    hospitalAudio.playDispatchChime();
    setConfirmed(true);
    if (onAllocated) onAllocated(selectedBed);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border-0 bg-[#eef6f4] shadow-[0_25px_70px_rgba(13,143,122,0.28)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-0 bg-gradient-to-r from-slate-900 via-[#0f2420] to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-xs shadow-primary/40">
              <Bed className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Allocate ER / Trauma Bay</h3>
              <p className="text-xs text-slate-300">
                Patient: <strong className="text-white">{request.patientName}</strong> ({request.priority.toUpperCase()} priority)
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

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-muted font-medium">
            Select an available trauma bay or inpatient ICU bed to prepare the reception team:
          </p>

          <div className="space-y-2.5">
            {AVAILABLE_BEDS.map((bed) => {
              const isSelected = selectedBed === bed.name;
              return (
                <div
                  key={bed.id}
                  onClick={() => setSelectedBed(bed.name)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between rounded-2xl border-0 p-4 transition-all duration-200",
                    isSelected
                      ? "bg-primary-soft shadow-[0_8px_24px_rgba(13,143,122,0.2)] ring-2 ring-primary"
                      : "bg-white hover:bg-white/90 shadow-[0_4px_16px_rgba(15,61,53,0.06)] hover:shadow-[0_8px_24px_rgba(13,143,122,0.14)]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl",
                      isSelected ? "bg-primary text-white" : "bg-slate-100 text-muted"
                    )}>
                      <Bed className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{bed.name}</p>
                      <p className="text-xs text-muted">{bed.dept} · {bed.equipment}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      bed.type === "Critical" ? "bg-emergency-soft text-emergency" :
                      bed.type === "Urgent" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {bed.type}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bay Readiness Checklist */}
          <div className="rounded-[1.25rem] border border-border bg-slate-50/70 p-4 space-y-2 text-xs text-muted">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Automated Prep Protocols on Allocation:
            </p>
            <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
              <li>Trauma reception monitor auto-connects to paramedic telemetry stream.</li>
              <li>Bed capacity decrements in live department dashboard.</li>
              <li>Charge nurse notification dispatched to floor pager system.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50/80 px-6 py-4">
          <div className="text-xs text-muted">
            Selected: <strong className="text-foreground">{selectedBed}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirm} disabled={confirmed}>
              {confirmed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  Allocated!
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Confirm Allocation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
