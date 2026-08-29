"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests, statusLabel } from "@/lib/ambulanceStore";
import { exportRequestsToCSV } from "@/lib/exportUtils";
import { IncidentReportModal } from "@/components/hospital/IncidentReportModal";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Clock,
  Download,
  FileText,
  History,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";

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
  const [selectedReportReq, setSelectedReportReq] = useState<AmbulanceRequest | null>(null);

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
      {/* Search + filter bar + CSV Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            placeholder="Search by patient name, location, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-2xl border-0 bg-white pl-10 pr-4 text-sm text-foreground shadow-[0_4px_16px_rgba(15,61,53,0.06)] outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportRequestsToCSV(filtered, `hospital-history-${filterStatus}.csv`)}
            className="flex h-11 items-center gap-1.5 rounded-2xl border-0 bg-white px-4 text-xs font-semibold text-foreground shadow-[0_4px_16px_rgba(15,61,53,0.06)] hover:bg-primary-soft hover:text-primary transition"
          >
            <Download className="h-4 w-4 text-primary" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilterStatus(value)}
                  className={cn(
                    "rounded-full border-0 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200",
                    filterStatus === value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-muted hover:bg-primary-soft hover:text-primary hover:shadow-2xs",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border-0 bg-[#eef6f4] py-16 text-center shadow-[0_14px_40px_rgba(15,61,53,0.1)]">
          <History className="h-10 w-10 text-muted/60" aria-hidden />
          <div>
            <p className="font-semibold text-foreground">No records found</p>
            <p className="mt-1 text-sm text-muted">
              {search ? "Try a different search term." : "No ambulance requests have been made yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border-0 bg-[#eef6f4] shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
          <div className="flex items-center justify-between border-b border-black/5 bg-white/40 px-6 py-4">
            <p className="text-xs text-muted font-medium">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> record{filtered.length !== 1 ? "s" : ""}
            </p>
            <span className="text-xs text-muted font-medium">Click report icon for printable summary</span>
          </div>
          <ul className="divide-y divide-black/5">
            {filtered.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4.5 transition-all duration-200 hover:bg-white/60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{req.patientName}</p>
                    <span className={cn("rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-2xs", toneForStatus(req.status))}>
                      {statusLabel(req.status)}
                    </span>
                    {req.allocatedBed && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {req.allocatedBed}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="font-mono">{req.id}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" aria-hidden /> {req.locationLabel}
                    </span>
                    <span className="capitalize font-semibold text-foreground">{req.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  {req.etaMinutes != null && (
                    <span className="flex items-center gap-1 font-semibold text-accent bg-accent-soft px-3 py-1 rounded-xl border border-accent/20 shadow-[0_2px_10px_rgba(26,155,181,0.15)]">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> {req.etaMinutes} min ETA
                    </span>
                  )}
                  <span>{new Date(req.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedReportReq(req)}
                    className="flex items-center gap-1 rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-primary-soft hover:text-primary transition shadow-2xs"
                    title="View printable clinical incident report"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Report</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Incident Report Modal */}
      <IncidentReportModal
        request={selectedReportReq}
        isOpen={Boolean(selectedReportReq)}
        onClose={() => setSelectedReportReq(null)}
      />
    </div>
  );
}

