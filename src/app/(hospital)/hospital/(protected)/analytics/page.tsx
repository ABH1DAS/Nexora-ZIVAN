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
  PieChart as PieChartIcon,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ label, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border-0 bg-[#eef6f4] p-5 shadow-[0_14px_38px_rgba(15,61,53,0.1)] hover:shadow-[0_20px_48px_rgba(13,143,122,0.18)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${color} shadow-xs`}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted font-medium">{sub}</p>}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { name?: string; count?: number; fill?: string };
    color?: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const name = label || item.name || item.payload?.name;
    const value = item.value ?? item.payload?.count ?? 0;
    return (
      <div className="rounded-xl border border-border bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md text-xs">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 font-bold text-primary">
          {value} {value === 1 ? "request" : "requests"}
        </p>
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const { account } = useHospitalAuth();
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Chart dataset for Status Breakdown
  const statusData = useMemo(() => {
    const searching = requests.filter((r) => r.status === "searching").length;
    const accepted = requests.filter((r) => r.status === "accepted").length;
    const enRoute = requests.filter((r) => r.status === "en_route").length;
    const arrived = requests.filter((r) => r.status === "arrived").length;
    const declined = requests.filter((r) => r.status === "declined").length;

    return [
      { name: "Accepted", count: accepted, fill: "#0d8f7a" },
      { name: "En Route", count: enRoute, fill: "#1a9bb5" },
      { name: "Arrived", count: arrived, fill: "#059669" },
      { name: "Searching", count: searching, fill: "#f59e0b" },
      { name: "Declined", count: declined, fill: "#d9354a" },
    ];
  }, [requests]);

  // Chart dataset for Priority Distribution
  const priorityData = useMemo(() => {
    const critical = stats.byPriority.critical;
    const urgent = stats.byPriority.urgent;
    const standard = stats.byPriority.standard;

    if (stats.total === 0) {
      return [
        { name: "Critical", value: 1, fill: "#d9354a" },
        { name: "Urgent", value: 1, fill: "#f59e0b" },
        { name: "Standard", value: 2, fill: "#0d8f7a" },
      ];
    }

    return [
      { name: "Critical", value: critical, fill: "#d9354a" },
      { name: "Urgent", value: urgent, fill: "#f59e0b" },
      { name: "Standard", value: standard, fill: "#0d8f7a" },
    ];
  }, [stats]);

  // 7-day trend mockup data
  const trendData = useMemo(() => [
    { day: "Mon", total: 4, critical: 1 },
    { day: "Tue", total: 7, critical: 2 },
    { day: "Wed", total: 5, critical: 1 },
    { day: "Thu", total: 8, critical: 3 },
    { day: "Fri", total: 12, critical: 4 },
    { day: "Sat", total: 14, critical: 5 },
    { day: "Today", total: Math.max(requests.length, 6), critical: Math.max(stats.byPriority.critical, 2) },
  ], [requests, stats]);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          sub="All time (demo)"
          icon={BarChart3}
          color="bg-slate-100 text-muted"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          sub={`${stats.accepted} accepted`}
          icon={TrendingUp}
          color="bg-primary-soft text-primary"
        />
        <StatCard
          label="Avg ETA"
          value={stats.avgEta != null ? `${stats.avgEta} min` : "—"}
          sub="From dispatch"
          icon={Clock}
          color="bg-accent-soft text-accent"
        />
        <StatCard
          label="Pending SOS"
          value={stats.pending}
          sub="Awaiting response"
          icon={Activity}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Main Graphs Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Request Status Breakdown Graph */}
        <div className="rounded-[2rem] border-0 bg-[#eef6f4] p-6 sm:p-7 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
                Request Status Breakdown
              </h2>
              <p className="mt-0.5 text-xs text-muted">Real-time status count across dispatch stages</p>
            </div>
            <span className="rounded-xl bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {stats.total} Total
            </span>
          </div>

          {/* Bar Graph */}
          <div className="h-64 w-full pt-2">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,61,53,0.06)" />
                  <XAxis
                    dataKey="name"
                    stroke="#4e6660"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(15,61,53,0.1)" }}
                  />
                  <YAxis
                    stroke="#4e6660"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(15,61,53,0.1)" }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(13,143,122,0.05)" }} />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status summary pills */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Accepted", val: stats.accepted, icon: CheckCircle2, color: "text-primary" },
              { label: "Arrived", val: stats.arrived, icon: Ambulance, color: "text-accent" },
              { label: "Declined", val: stats.declined, icon: XCircle, color: "text-emergency" },
            ].map(({ label, val, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-[1.25rem] border-0 bg-white p-3 shadow-[0_6px_20px_rgba(15,61,53,0.07)] hover:shadow-[0_10px_28px_rgba(13,143,122,0.14)] hover:-translate-y-0.5 transition-all"
              >
                <Icon className={`mx-auto h-4 w-4 ${color}`} aria-hidden />
                <p className="mt-1.5 font-display text-lg font-semibold text-foreground">{val}</p>
                <p className="text-[11px] text-muted font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Priority Distribution Graph */}
        <div className="rounded-[2rem] border-0 bg-[#eef6f4] p-6 sm:p-7 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
                Priority Distribution
              </h2>
              <p className="mt-0.5 text-xs text-muted">Severity allocation of incoming emergencies</p>
            </div>
            <span className="rounded-xl bg-emergency-soft px-3 py-1 text-xs font-semibold text-emergency">
              {stats.byPriority.critical} Critical
            </span>
          </div>

          {/* Donut Pie Graph */}
          <div className="relative h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center Donut Label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <PieChartIcon className="h-5 w-5 text-primary opacity-60" aria-hidden />
              <span className="mt-1 font-display text-2xl font-bold text-foreground">
                {stats.total}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Cases</span>
            </div>
          </div>

          {/* Priority breakdown legend tiles */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              { label: "Critical", val: stats.byPriority.critical, color: "bg-emergency text-emergency-dark" },
              { label: "Urgent", val: stats.byPriority.urgent, color: "bg-amber-400 text-amber-950" },
              { label: "Standard", val: stats.byPriority.standard, color: "bg-primary text-primary-dark" },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="rounded-[1.25rem] border-0 bg-white p-3 text-center shadow-[0_6px_20px_rgba(15,61,53,0.07)] hover:shadow-[0_10px_28px_rgba(13,143,122,0.14)] transition-all"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${color.split(" ")[0]}`} />
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                </div>
                <p className="mt-1 font-display text-lg font-semibold text-foreground">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Activity Trend / Timeline Graph Section */}
      <div className="rounded-[2rem] border-0 bg-[#eef6f4] p-6 sm:p-7 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
              Weekly Emergency Response Trends
            </h2>
            <p className="mt-0.5 text-xs text-muted">Daily incoming requests vs. high-priority critical cases</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Total Dispatches
            </span>
            <span className="flex items-center gap-1.5 text-emergency">
              <span className="h-2.5 w-2.5 rounded-full bg-emergency" /> Critical SOS
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d8f7a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d8f7a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d9354a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d9354a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,61,53,0.06)" />
                <XAxis
                  dataKey="day"
                  stroke="#5b6f6a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(15,61,53,0.1)" }}
                />
                <YAxis
                  stroke="#5b6f6a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(15,61,53,0.1)" }}
                  allowDecimals={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0d8f7a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#totalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stroke="#d9354a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#critGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
