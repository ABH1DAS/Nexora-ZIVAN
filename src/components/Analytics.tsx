"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import {
  analyticsSeries,
  analyticsTrends,
  type AnalyticsRange,
  type Trend,
} from "@/data/healthData";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";

const ranges: { id: AnalyticsRange; label: string }[] = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "6m", label: "6 Months" },
];

const metrics = [
  { key: "activity", color: "#0d8f7a" },
  { key: "sleep", color: "#1a9bb5" },
  { key: "hydration", color: "#0ea5e9" },
  { key: "mood", color: "#059669" },
  { key: "exercise", color: "#0f766e" },
  { key: "wellbeing", color: "#14b8a6" },
] as const;

function TrendBadge({ trend }: { trend: Trend }) {
  if (trend === "improving") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        Improving
      </span>
    );
  }
  if (trend === "attention") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
        Needs attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      Stable
    </span>
  );
}

export function Analytics() {
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [active, setActive] = useState<(typeof metrics)[number]["key"]>("wellbeing");
  const reduce = useReducedMotion();
  const series = useMemo(() => analyticsSeries[range][active], [active, range]);

  return (
    <Section
      id="analytics"
      eyebrow="Insights"
      title="Personal Health Analytics"
      description="Beautiful charts that highlight patterns over time — without diagnostic language."
    >
      <Reveal>
        <div className="rounded-[2rem] border border-border bg-white p-5 shadow-[0_24px_60px_rgba(15,61,53,0.07)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="inline-flex rounded-2xl border border-border bg-[#f7fbfa] p-1"
              role="tablist"
              aria-label="Analytics range"
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Demo analytics data
            </p>
          </div>

          <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 scrollbar-hide">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => setActive(metric.key)}
                className={cn(
                  "shrink-0 rounded-2xl border px-4 py-3 text-left transition",
                  active === metric.key
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-[#fbfefd] hover:border-primary/30",
                )}
              >
                <p className="text-sm font-semibold capitalize">{metric.key}</p>
                <div className="mt-2">
                  <TrendBadge trend={analyticsTrends[metric.key].trend} />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,61,53,0.06)" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5b6f6a", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5b6f6a", fontSize: 12 }}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(15,61,53,0.08)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metrics.find((m) => m.key === active)?.color}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  animationDuration={reduce ? 0 : 700}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-4 text-sm text-muted">
            <span className="font-semibold text-foreground">
              {analyticsTrends[active].label}:
            </span>{" "}
            {analyticsTrends[active].note}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
