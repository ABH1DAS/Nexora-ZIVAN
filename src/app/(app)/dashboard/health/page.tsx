"use client";

import { analyticsSeries, analyticsTrends, todayMetrics, type AnalyticsRange } from "@/data/healthData";
import { cn, formatNumber } from "@/lib/utils";
import { Activity, ArrowDownRight, ArrowUpRight, Heart, Moon, Droplets, Flame, Sparkles, TrendingUp } from "lucide-react";
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
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const series = useMemo(() => analyticsSeries[range], [range]);

  const metricCards = [
    {
      title: "Heart Rate & SpO₂",
      value: `${todayMetrics.heartRate} BPM`,
      subtitle: `SpO₂: ${todayMetrics.spo2}%`,
      trend: "improving",
      change: "+2% optimal",
      icon: Heart,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "Daily Steps",
      value: formatNumber(todayMetrics.steps),
      subtitle: `Target: ${formatNumber(todayMetrics.stepsGoal)}`,
      trend: "improving",
      change: "+12% vs last week",
      icon: Activity,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      title: "Sleep Recovery",
      value: `${todayMetrics.sleepHours}h ${todayMetrics.sleepMinutes}m`,
      subtitle: "85% Deep & REM sleep",
      trend: "attention",
      change: "-15m vs avg",
      icon: Moon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Hydration Target",
      value: `${todayMetrics.waterLiters} L`,
      subtitle: `Goal: ${todayMetrics.waterGoal} L`,
      trend: "stable",
      change: "On track",
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
            Health Analytics & Vitals
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Health Tracking & History
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
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
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

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity & Movement Chart */}
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Activity & Movement</h2>
              <p className="text-xs text-muted">Daily step volume and active minutes</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
              Avg: 7,420 steps
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.activity}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d8f7a" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0d8f7a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0d8f7a" strokeWidth={3} fill="url(#colorActivity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Recovery Duration */}
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Sleep Duration & Rest</h2>
              <p className="text-xs text-muted">Hours of restful sleep per day</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              Avg: 7.2 hrs
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series.sleep}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hydration Progress Chart */}
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Hydration Log (Liters)</h2>
              <p className="text-xs text-muted">Daily water intake comparison</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
              Goal: 2.0 L
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.hydration}>
                <defs>
                  <linearGradient id="colorHydration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={3} fill="url(#colorHydration)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Wellbeing Trend */}
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Wellbeing Score History</h2>
              <p className="text-xs text-muted">Composite physical & mental wellness rating</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Current: 86/100
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series.wellbeing}>
                <defs>
                  <linearGradient id="colorWellbeing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorWellbeing)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
