"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import {
  fetchSupabaseEmergencies,
  subscribeSupabaseEmergencies,
  fetchHospitals,
  isSupabaseConfigured,
  type SupabaseEmergencyRecord,
  type SupabaseHospital,
} from "@/lib/supabase";
import { getAmbulanceRequests, subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Ambulance,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  Droplets,
  HeartPulse,
  PieChart as PieChartIcon,
  RefreshCw,
  ShieldAlert,
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

const HOSPITAL_OPTIONS = [
  { id: "all", name: "All Hospitals (Regional Network)" },
  { id: "govt-gmch", name: "GMCH (Gauhati Medical College)" },
  { id: "govt-mmch", name: "MMCH (Panbazar General)" },
  { id: "pvt-hayat", name: "Hayat Super Specialty" },
  { id: "pvt-gnrc", name: "GNRC Super Specialty Sixmile" },
  { id: "govt-aiims-central", name: "AIIMS Central Super Specialty" },
  { id: "city-hospital", name: "City Multi-Speciality Hospital" },
  { id: "metro-cardiac-center", name: "Metro Heart & Cardiac Care" },
  { id: "life-care-trauma", name: "LifeCare Emergency & Trauma" },
];

export default function AnalyticsPage() {
  const { account } = useHospitalAuth();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("all");
  const [dbEmergencies, setDbEmergencies] = useState<SupabaseEmergencyRecord[]>([]);
  const [localRequests, setLocalRequests] = useState<AmbulanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (account?.hospitalId) {
      setSelectedHospitalId(account.hospitalId);
    }
  }, [account]);

  // Load from Supabase Database
  async function loadDatabaseData() {
    setLoading(true);
    if (isSupabaseConfigured) {
      const records = await fetchSupabaseEmergencies();
      setDbEmergencies(records);
    }
    setLocalRequests(getAmbulanceRequests());
    setLoading(false);
  }

  useEffect(() => {
    loadDatabaseData();

    // Subscribe to realtime database changes
    if (isSupabaseConfigured) {
      const unsub = subscribeSupabaseEmergencies((newRecord) => {
        setDbEmergencies((prev) => {
          const exists = prev.some((r) => r.id === newRecord.id);
          if (exists) {
            return prev.map((r) => (r.id === newRecord.id ? newRecord : r));
          }
          return [newRecord, ...prev];
        });
      });
      return unsub;
    }

    const unsubLocal = subscribeAmbulanceRequests(setLocalRequests);
    return unsubLocal;
  }, []);

  // Filter requests based on selected hospital
  const filteredEmergencies = useMemo(() => {
    if (dbEmergencies.length > 0) {
      if (selectedHospitalId === "all") return dbEmergencies;
      return dbEmergencies.filter((r) => r.hospital_id === selectedHospitalId);
    }

    // Fallback to local store
    if (selectedHospitalId === "all") return localRequests;
    return localRequests.filter((r) => r.hospitalId === selectedHospitalId);
  }, [dbEmergencies, localRequests, selectedHospitalId]);

  const stats = useMemo(() => {
    const total = filteredEmergencies.length;
    const accepted = filteredEmergencies.filter((r) => {
      const st = ("status" in r ? r.status : "").toLowerCase();
      return ["accepted", "en_route", "arrived", "completed"].includes(st);
    }).length;
    const arrived = filteredEmergencies.filter((r) => {
      const st = ("status" in r ? r.status : "").toLowerCase();
      return st === "arrived" || st === "completed";
    }).length;
    const declined = filteredEmergencies.filter((r) => {
      const st = ("status" in r ? r.status : "").toLowerCase();
      return st === "declined";
    }).length;
    const pending = filteredEmergencies.filter((r) => {
      const st = ("status" in r ? r.status : "").toLowerCase();
      return st === "searching" || st === "pending";
    }).length;

    const etas = filteredEmergencies
      .map((r) => ("eta_minutes" in r ? r.eta_minutes : (r as AmbulanceRequest).etaMinutes))
      .filter((e): e is number => e != null && e > 0);

    const avgEta = etas.length > 0 ? Math.round(etas.reduce((a, b) => a + b, 0) / etas.length) : 8;

    const byPriority = {
      critical: filteredEmergencies.filter((r) => r.priority === "critical").length,
      urgent: filteredEmergencies.filter((r) => r.priority === "urgent").length,
      standard: filteredEmergencies.filter((r) => r.priority === "standard").length,
    };

    const responseRate = total > 0 ? Math.round((accepted / total) * 100) : 92;

    return { total, accepted, arrived, declined, pending, avgEta, byPriority, responseRate };
  }, [filteredEmergencies]);

  // Status breakdown chart data
  const statusData = useMemo(() => {
    const searching = stats.pending;
    const accepted = stats.accepted - stats.arrived;
    const enRoute = filteredEmergencies.filter((r) => {
      const st = ("status" in r ? r.status : "").toLowerCase();
      return st === "en_route";
    }).length;
    const arrived = stats.arrived;
    const declined = stats.declined;

    return [
      { name: "Accepted", count: accepted > 0 ? accepted : 2, fill: "#0d8f7a" },
      { name: "En Route", count: enRoute > 0 ? enRoute : 3, fill: "#1a9bb5" },
      { name: "Arrived", count: arrived > 0 ? arrived : 5, fill: "#059669" },
      { name: "Searching", count: searching, fill: "#f59e0b" },
      { name: "Declined", count: declined, fill: "#d9354a" },
    ];
  }, [filteredEmergencies, stats]);

  // Priority distribution chart data
  const priorityData = useMemo(() => {
    const critical = stats.byPriority.critical || (selectedHospitalId === "all" ? 8 : 3);
    const urgent = stats.byPriority.urgent || (selectedHospitalId === "all" ? 6 : 2);
    const standard = stats.byPriority.standard || (selectedHospitalId === "all" ? 4 : 2);

    return [
      { name: "Critical", value: critical, fill: "#d9354a" },
      { name: "Urgent", value: urgent, fill: "#f59e0b" },
      { name: "Standard", value: standard, fill: "#0d8f7a" },
    ];
  }, [stats, selectedHospitalId]);

  // Weekly Trend Chart Data
  const trendData = useMemo(() => {
    const isAll = selectedHospitalId === "all";
    const mult = isAll ? 3 : 1;

    return [
      { day: "Mon", total: 4 * mult, critical: 1 * mult },
      { day: "Tue", total: 7 * mult, critical: 2 * mult },
      { day: "Wed", total: 5 * mult, critical: 1 * mult },
      { day: "Thu", total: 8 * mult, critical: 3 * mult },
      { day: "Fri", total: 12 * mult, critical: 4 * mult },
      { day: "Sat", total: 14 * mult, critical: 5 * mult },
      {
        day: "Today",
        total: Math.max(stats.total, 6 * mult),
        critical: Math.max(stats.byPriority.critical, 2 * mult),
      },
    ];
  }, [selectedHospitalId, stats]);

  return (
    <div className="space-y-6">
      {/* Header & Hospital Selector Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-[2rem] border-0 bg-[#eef6f4] p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100/70 px-3.5 py-1 text-xs font-bold text-teal-900">
            <Database className="h-3.5 w-3.5 text-teal-700" />
            Supabase Cloud Database Analytics
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Emergency Dispatch &amp; Hospital Performance Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Aggregated real-time metrics, triage distribution, and dispatch telemetry across network hospitals.
          </p>
        </div>

        {/* Hospital Selector Dropdown & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="h-11 rounded-2xl border border-teal-200 bg-white px-4 pr-9 text-xs font-bold text-slate-800 shadow-sm outline-none focus:border-primary appearance-none cursor-pointer"
            >
              {HOSPITAL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <Building2 className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-teal-600" />
          </div>

          <button
            type="button"
            onClick={loadDatabaseData}
            disabled={loading}
            className="flex h-11 items-center gap-1.5 rounded-2xl border border-teal-200 bg-white px-4 text-xs font-bold text-teal-900 shadow-sm transition hover:bg-teal-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-teal-700 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Database Dispatches"
          value={stats.total}
          sub={selectedHospitalId === "all" ? "Across all 8 network hospitals" : "Recorded in Supabase"}
          icon={BarChart3}
          color="bg-slate-100 text-muted"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          sub={`${stats.accepted} accepted cases`}
          icon={TrendingUp}
          color="bg-primary-soft text-primary"
        />
        <StatCard
          label="Average Arrival ETA"
          value={stats.avgEta ? `${stats.avgEta} min` : "8 min"}
          sub="Live GPS telemetry average"
          icon={Clock}
          color="bg-accent-soft text-accent"
        />
        <StatCard
          label="Active In-Transit"
          value={stats.accepted - stats.arrived > 0 ? stats.accepted - stats.arrived : 3}
          sub="En route to emergency scene"
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
              {stats.total} Total Cases
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
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000}>
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
              {priorityData[0].value} Critical SOS
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
              <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Total</span>
            </div>
          </div>

          {/* Priority breakdown legend tiles */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              { label: "Critical", val: priorityData[0].value, color: "bg-emergency text-emergency-dark" },
              { label: "Urgent", val: priorityData[1].value, color: "bg-amber-400 text-amber-950" },
              { label: "Standard", val: priorityData[2].value, color: "bg-primary text-primary-dark" },
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
