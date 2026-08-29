"use client";

import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { setBloodCrossMatch } from "@/lib/ambulanceStore";
import { hospitalAudio } from "@/lib/hospitalAudio";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Droplet,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

interface BloodBankMatcherProps {
  request: AmbulanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const BLOOD_INVENTORY: Record<string, { units: number; status: "Optimal" | "Adequate" | "Critical" }> = {
  "O+": { units: 14, status: "Optimal" },
  "O-": { units: 4, status: "Adequate" },
  "A+": { units: 18, status: "Optimal" },
  "A-": { units: 3, status: "Adequate" },
  "B+": { units: 12, status: "Optimal" },
  "B-": { units: 2, status: "Critical" },
  "AB+": { units: 8, status: "Optimal" },
  "AB-": { units: 1, status: "Critical" },
};

// Compatible donor groups for red blood cells
const COMPATIBILITY: Record<string, string[]> = {
  "O+": ["O+", "O-"],
  "O-": ["O-"],
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["O-", "O+", "B-", "B+", "A-", "A+", "AB-", "AB+"], // Universal recipient
  "AB-": ["AB-", "A-", "B-", "O-"],
};

export function BloodBankMatcher({
  request,
  isOpen,
  onClose,
}: BloodBankMatcherProps) {
  const [reserved, setReserved] = useState(request?.bloodCrossMatched ?? false);
  const [reserving, setReserving] = useState(false);

  if (!isOpen || !request) return null;

  const bloodGroup = request.bloodGroup || "O+";
  const matchingGroups = COMPATIBILITY[bloodGroup] || ["O+", "O-"];
  const directStock = BLOOD_INVENTORY[bloodGroup] || { units: 6, status: "Optimal" };

  const handleReserve = () => {
    setReserving(true);
    hospitalAudio.playDispatchChime();
    setTimeout(() => {
      setBloodCrossMatch(request.id, true);
      setReserved(true);
      setReserving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_25px_70px_rgba(15,61,53,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-slate-900 via-[#0f2420] to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 shadow-xs shadow-rose-500/40">
              <Droplet className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Blood Bank Cross-Match</h3>
              <p className="text-xs text-slate-300">
                Patient: <strong className="text-white">{request.patientName}</strong> · Group: <strong className="text-rose-400 font-bold">{bloodGroup}</strong>
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
          {/* Main Group Highlight */}
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white font-display text-xl font-bold shadow-xs">
                {bloodGroup}
              </div>
              <div>
                <p className="text-sm font-bold text-rose-950">Direct Match Units Available</p>
                <p className="text-xs text-rose-700">
                  Status: <strong className="font-semibold">{directStock.status} Inventory</strong>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-2xl font-bold text-rose-950">
                {directStock.units}
              </span>
              <span className="block text-[10px] uppercase font-bold text-rose-600">Units in Bank</span>
            </div>
          </div>

          {/* Compatible Donors Breakdown */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Compatible Donor Groups for {bloodGroup}:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(BLOOD_INVENTORY).map(([group, info]) => {
                const isCompatible = matchingGroups.includes(group);
                return (
                  <div
                    key={group}
                    className={cn(
                      "rounded-xl border p-2.5 text-center transition",
                      isCompatible
                        ? "border-emerald-300 bg-emerald-50/60 shadow-2xs"
                        : "border-slate-200 bg-slate-50 opacity-40"
                    )}
                  >
                    <span className="font-display font-bold text-sm text-foreground block">
                      {group}
                    </span>
                    <span className="text-[11px] text-muted block">
                      {info.units} units
                    </span>
                    {isCompatible && (
                      <span className="mt-1 inline-block text-[9px] font-bold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        Match
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reservation Status Alert */}
          {reserved ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">2 Units Packed Red Blood Cells (PRBC) Reserved</strong>
                <span>Reserved for {request.patientName} at ER Reception Bay. Ready for transfusion.</span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-slate-50 p-3.5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Reserving units flags the transfusion medicine team and prepares rapid infusers.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50/80 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {!reserved ? (
            <Button
              variant="emergency"
              size="sm"
              onClick={handleReserve}
              disabled={reserving}
            >
              <Droplet className="h-4 w-4" />
              {reserving ? "Reserving Units..." : "Reserve 2 Units for Trauma Bay"}
            </Button>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Units Reserved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
