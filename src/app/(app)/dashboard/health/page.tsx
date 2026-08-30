"use client";

import { analyticsSeries, type AnalyticsRange } from "@/data/healthData";
import { useUserData } from "@/lib/userDataStore";
import { cn, formatNumber } from "@/lib/utils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Heart,
  Moon,
  Droplets,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";  

const ranges: { id: AnalyticsRange; label: string }[] = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "6m", label: "6 Months" },
];

export default function DashboardHealthPage() {
  const { metrics, isNewUser } = useUserData();
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const series = useMemo(() => analyticsSeries[range], [range]);

  const chartData = useMemo(() => {
    return series.activity.map((pt) => ({
      label: pt.label,
      steps: isNewUser && metrics.steps === 0 ? 0 : pt.value * 100,
      hr: metrics.heartRate > 0 ? metrics.heartRate + (pt.value % 10 - 5) : 72,
    }));
  }, [series, isNewUser, metrics.steps, metrics.heartRate]);

  const metricCards = [
    {
      title: "Heart Rate & SpO₂",
      value: metrics.heartRate > 0 ? `${metrics.heartRate} BPM` : "Not recorded",
      subtitle: metrics.spo2 > 0 ? `SpO₂: ${metrics.spo2}%` : "SpO₂: Not synced",
      trend: "improving",
      change: metrics.heartRate > 0 ? "+2% optimal" : "Sync ready",
      icon: Heart,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "Daily Steps",
      value: formatNumber(metrics.steps),
      subtitle: `Target: ${formatNumber(metrics.stepsGoal)}`,
      trend: "improving",
      change: metrics.steps > 0 ? "+12% vs last week" : "Start walking",
      icon: Activity,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      title: "Sleep Recovery",
      value: metrics.sleepHours > 0 ? `${metrics.sleepHours}h ${metrics.sleepMinutes}m` : "0h 0m",
      subtitle: metrics.sleepScore > 0 ? `${metrics.sleepScore}% Sleep Quality` : "Target: 8h restorative",
      trend: "attention",
      change: metrics.sleepHours > 0 ? "Target logged" : "Log in habits",
      icon: Moon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Hydration Target",
      value: `${metrics.waterLiters} L`,
      subtitle: `Goal: ${metrics.waterGoal} L`,
      trend: "stable",
      change: metrics.waterLiters > 0 ? "On track" : "Log water",
      icon: Droplets,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Health Analytics &amp; Vitals
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Health Tracking &amp; History
          </h1>
          <p className="mt-1 text-sm text-muted">
            Monitor vitals, activity trends, sleep recovery and hydration metrics.
          </p>
        </div>

        {/* Time range selector */}
        <div className="inline-flex rounded-2xl border border-border bg-white p-1.5 shadow-sm">
          {ranges.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer",
                range === item.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-slate-50",
              )}
              onClick={() => setRange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Vitals Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-[1.75rem] border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">{card.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-display text-3xl font-bold tracking-tight">{card.value}</p>
                <p className="mt-1 text-xs text-muted font-medium">{card.subtitle}</p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                {card.trend === "improving" && (
                  <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> {card.change}
                  </span>
                )}
                {card.trend === "attention" && (
                  <span className="inline-flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" /> {card.change}
                  </span>
                )}
                {card.trend === "stable" && (
                  <span className="inline-flex items-center text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> {card.change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Heart Rate Area Chart */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Heart Rate Trend</h2>
              <p className="text-xs text-muted">Continuous resting and active cardiac rates</p>
            </div>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              Avg {metrics.heartRate > 0 ? metrics.heartRate : 72} BPM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 110]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2.5} fill="url(#hrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Daily Steps Bar Chart */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Step Activity</h2>
              <p className="text-xs text-muted">Daily distance &amp; physical movement logs</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              Goal: {formatNumber(metrics.stepsGoal)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="steps" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
