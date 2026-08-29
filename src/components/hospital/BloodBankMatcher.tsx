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
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_25px_70px_rgba(217,53,74,0.22)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-slate-900 via-[#0f2420] to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 shadow-lg shadow-rose-500/40">
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
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl border p-4.5 transition-all duration-300",
              directStock.units >= 3
                ? "border-rose-200 bg-white text-rose-600 shadow-[0_12px_32px_rgba(217,53,74,0.18)] hover:shadow-[0_18px_42px_rgba(217,53,74,0.28)]"
                : "border-rose-600 bg-rose-600 text-white shadow-[0_14px_36px_rgba(217,53,74,0.35)] hover:shadow-[0_20px_48px_rgba(217,53,74,0.45)]"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl font-bold shadow-xs",
                  directStock.units >= 3
                    ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-[0_4px_14px_rgba(217,53,74,0.15)]"
                    : "bg-white text-rose-600 shadow-[0_4px_14px_rgba(255,255,255,0.3)]"
                )}
              >
                {bloodGroup}
              </div>
              <div>
                <p className={cn("text-sm font-bold", directStock.units >= 3 ? "text-rose-700" : "text-white")}>
                  Direct Match Blood Stock
                </p>
                <p className={cn("text-xs font-medium", directStock.units >= 3 ? "text-rose-600/80" : "text-white/80")}>
                  Status: {directStock.units >= 3 ? "Available In Bank" : "CRITICAL / LOW STOCK"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn("font-display text-2xl font-bold block", directStock.units >= 3 ? "text-rose-600" : "text-white")}>
                {directStock.units}
              </span>
              <span className={cn("block text-[10px] uppercase font-bold", directStock.units >= 3 ? "text-rose-600" : "text-white/90")}>
                Units in Bank
              </span>
            </div>
          </div>

          {/* Compatible Donors Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Blood Inventory &amp; Compatibility ({bloodGroup}):
              </p>
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="h-2 w-2 rounded-full border border-rose-400 bg-white shadow-[0_0_8px_rgba(217,53,74,0.4)]" /> Available (Red Text)
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(217,53,74,0.6)]" /> Low/Out (Red BG)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {Object.entries(BLOOD_INVENTORY).map(([group, info]) => {
                const isCompatible = matchingGroups.includes(group);
                const isLowOrOut = info.units < 3;

                return (
                  <div
                    key={group}
                    className={cn(
                      "rounded-2xl border p-3 text-center transition-all duration-300 hover:-translate-y-0.5",
                      isLowOrOut
                        ? "border-rose-600 bg-rose-600 text-white shadow-[0_8px_24px_rgba(217,53,74,0.3)] hover:shadow-[0_12px_32px_rgba(217,53,74,0.45)]"
                        : "border-rose-200 bg-white text-rose-600 shadow-[0_8px_24px_rgba(217,53,74,0.12)] hover:shadow-[0_12px_30px_rgba(217,53,74,0.22)] hover:border-rose-300",
                      !isCompatible && "opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "font-display font-bold text-base block leading-tight",
                        isLowOrOut ? "text-white" : "text-rose-600"
                      )}
                    >
                      {group}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-semibold block mt-0.5",
                        isLowOrOut ? "text-white/90" : "text-rose-600"
                      )}
                    >
                      {info.units} {info.units === 1 ? "unit" : "units"}
                    </span>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      {isLowOrOut ? (
                        <span className="text-[9px] font-bold uppercase bg-white/20 text-white px-1.5 py-0.5 rounded-full border border-white/30">
                          Low Stock
                        </span>
                      ) : isCompatible ? (
                        <span className="text-[9px] font-bold uppercase text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
                          Match
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-rose-500">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reservation Status Alert */}
          {reserved ? (
            <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 shadow-[0_10px_28px_rgba(5,150,105,0.15)] animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">2 Units Packed Red Blood Cells (PRBC) Reserved</strong>
                <span>Reserved for {request.patientName} at ER Reception Bay. Ready for transfusion.</span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-slate-50 p-3.5 text-xs text-muted shadow-[0_4px_16px_rgba(15,61,53,0.04)]">
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
