"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { statusLabel } from "@/lib/ambulanceStore";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Clock, History, MapPin, Search, SlidersHorizontal } from "lucide-react";

function toneForStatus(status: AmbulanceRequest["status"]) {
  if (status === "searching") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "accepted" || status === "en_route") return "bg-sky-100 text-sky-800 border-sky-200";
  if (status === "arrived") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  return "bg-rose-100 text-rose-800 border-rose-200";
}

export default function HistoryPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AmbulanceRequest["status"]>("all");

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) =>
      setRequests(
        all
          .filter((r) => r.hospitalId === account.hospitalId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      ),
    );
  }, [account]);

  const filtered = requests.filter((r) => {
    const matchSearch =
      search === "" ||
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.locationLabel.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses: Array<{ value: "all" | AmbulanceRequest["status"]; label: string }> = [
    { value: "all", label: "All" },
    { value: "arrived", label: "Arrived" },
    { value: "declined", label: "Declined" },
    { value: "cancelled", label: "Cancelled" },
    { value: "searching", label: "Pending" },
  ];

  return (
    <div className="space-y-5">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            placeholder="Search by patient name, location, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0b1f2a] focus:ring-2 focus:ring-[#0b1f2a]/10"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <div className="flex flex-wrap gap-1.5">
            {statuses.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilterStatus(value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                  filterStatus === value
                    ? "bg-[#0b1f2a] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <History className="h-10 w-10 text-slate-300" aria-hidden />
          <div>
            <p className="font-semibold text-slate-500">No records found</p>
            <p className="mt-1 text-sm text-slate-400">
              {search ? "Try a different search term." : "No ambulance requests have been made yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> record{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.map((req) => (
              <li key={req.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0b1f2a]">{req.patientName}</p>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", toneForStatus(req.status))}>
                      {statusLabel(req.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="font-mono">{req.id}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden /> {req.locationLabel}
                    </span>
                    <span className="capitalize">{req.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {req.etaMinutes != null && (
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> {req.etaMinutes} min ETA
                    </span>
                  )}
                  <span>{new Date(req.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
