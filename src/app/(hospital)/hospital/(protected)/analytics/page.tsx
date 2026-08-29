"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Ambulance,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-xs ${color}`}>
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#0b1f2a]">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400 font-medium">{sub}</p>}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) =>
      setRequests(all.filter((r) => r.hospitalId === account.hospitalId)),
    );
  }, [account]);

  const stats = useMemo(() => {
    const total = requests.length;
    const accepted = requests.filter((r) => ["accepted", "en_route", "arrived"].includes(r.status)).length;
    const declined = requests.filter((r) => r.status === "declined").length;
    const arrived = requests.filter((r) => r.status === "arrived").length;
    const pending = requests.filter((r) => r.status === "searching").length;
    const avgEta = (() => {
      const etas = requests.filter((r) => r.etaMinutes != null).map((r) => r.etaMinutes!);
      return etas.length > 0 ? Math.round(etas.reduce((s, v) => s + v, 0) / etas.length) : null;
    })();
    const byPriority = {
      critical: requests.filter((r) => r.priority === "critical").length,
      urgent: requests.filter((r) => r.priority === "urgent").length,
      standard: requests.filter((r) => r.priority === "standard").length,
    };
    const responseRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { total, accepted, declined, arrived, pending, avgEta, byPriority, responseRate };
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          sub="All time (demo)"
          icon={BarChart3}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          sub={`${stats.accepted} accepted`}
          icon={TrendingUp}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Avg ETA"
          value={stats.avgEta != null ? `${stats.avgEta} min` : "—"}
          sub="From dispatch"
          icon={Clock}
          color="bg-sky-100 text-sky-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          sub="Awaiting response"
          icon={Activity}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status breakdown division */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
            Request Status Breakdown
          </h2>
          <div className="space-y-3.5">
            <Bar label="Accepted / En Route / Arrived" value={stats.accepted} max={stats.total} color="bg-emerald-500" />
            <Bar label="Pending (Searching)" value={stats.pending} max={stats.total} color="bg-amber-400" />
            <Bar label="Declined" value={stats.declined} max={stats.total} color="bg-rose-400" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3.5 text-center">
            {[
              { label: "Accepted", val: stats.accepted, icon: CheckCircle2, color: "text-emerald-500" },
              { label: "Arrived", val: stats.arrived, icon: Ambulance, color: "text-sky-500" },
              { label: "Declined", val: stats.declined, icon: XCircle, color: "text-rose-500" },
            ].map(({ label, val, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 shadow-2xs hover:shadow-xs hover:border-slate-200 hover:-translate-y-0.5 transition-all">
                <Icon className={`mx-auto h-5 w-5 ${color}`} aria-hidden />
                <p className="mt-2 font-display text-xl font-semibold text-[#0b1f2a]">{val}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority breakdown division */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
            Priority Distribution
          </h2>
          <div className="space-y-3.5">
            <Bar label="Critical" value={stats.byPriority.critical} max={stats.total} color="bg-rose-500" />
            <Bar label="Urgent" value={stats.byPriority.urgent} max={stats.total} color="bg-amber-400" />
            <Bar label="Standard" value={stats.byPriority.standard} max={stats.total} color="bg-slate-300" />
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center text-sm text-slate-400">
            <BarChart3 className="mx-auto mb-2 h-6 w-6 text-slate-300" aria-hidden />
            Time-series charts will be available once the backend connects real data.
          </div>
        </div>
      </div>
    </div>
  );
}
