"use client";

import { activityByRange, todayMetrics, type TimeRange } from "@/data/healthData";
import { cn, formatNumber } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const ranges: { id: TimeRange; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export default function DashboardHealthPage() {
  const [range, setRange] = useState<TimeRange>("week");
  const data = useMemo(() => activityByRange[range], [range]);

  const metrics = [
    {
      label: "Steps",
      value: `${formatNumber(todayMetrics.steps)} / ${formatNumber(todayMetrics.stepsGoal)}`,
    },
    { label: "Heart rate", value: `${todayMetrics.heartRate} BPM` },
    { label: "SpO₂", value: `${todayMetrics.spo2}%` },
    {
      label: "Sleep",
      value: `${todayMetrics.sleepHours}h ${todayMetrics.sleepMinutes}m`,
    },
    {
      label: "Water",
      value: `${todayMetrics.waterLiters}L / ${todayMetrics.waterGoal}L`,
    },
    { label: "Activity", value: `${todayMetrics.activityMinutes} min` },
    { label: "Calories", value: `${formatNumber(todayMetrics.calories)} kcal` },
    { label: "Wellbeing", value: `${todayMetrics.wellbeingScore} / 100` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Health dashboard
        </h1>
        <p className="mt-2 text-sm text-muted">
          Demo metrics for your signed-in experience. Not clinical measurements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-muted">{metric.label}</p>
            <p className="mt-2 font-display text-xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-semibold">Activity trend</h2>
          <div
            className="inline-flex rounded-2xl border border-border bg-[#f7fbfa] p-1"
            role="tablist"
            aria-label="Health range"
          >
            {ranges.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={range === item.id}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  range === item.id
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground",
                )}
                onClick={() => setRange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="dashActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d8f7a" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0d8f7a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5b6f6a", fontSize: 12 }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0d8f7a"
                strokeWidth={3}
                fill="url(#dashActivity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
