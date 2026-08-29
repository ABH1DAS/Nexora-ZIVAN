"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import {
  activityByRange,
  todayMetrics,
  userProfile,
  type TimeRange,
} from "@/data/healthData";
import { cn, formatNumber } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Droplets, Flame, Heart, Moon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ranges: { id: TimeRange; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function HealthDashboard() {
  const [range, setRange] = useState<TimeRange>("week");
  const reduce = useReducedMotion();
  const data = useMemo(() => activityByRange[range], [range]);

  const cards = [
    {
      label: "Steps",
      value: `${formatNumber(todayMetrics.steps)} / ${formatNumber(todayMetrics.stepsGoal)}`,
      icon: Activity,
      progress: todayMetrics.steps / todayMetrics.stepsGoal,
    },
    {
      label: "Heart Rate",
      value: `${todayMetrics.heartRate} BPM`,
      icon: Heart,
      progress: 0.74,
    },
    {
      label: "Sleep",
      value: `${todayMetrics.sleepHours}h ${todayMetrics.sleepMinutes}m`,
      icon: Moon,
      progress: 0.9,
    },
    {
      label: "Water",
      value: `${todayMetrics.waterLiters}L / ${todayMetrics.waterGoal}L`,
      icon: Droplets,
      progress: todayMetrics.waterLiters / todayMetrics.waterGoal,
    },
    {
      label: "Activity",
      value: `${todayMetrics.activityMinutes} min`,
      icon: Activity,
      progress: 0.8,
    },
    {
      label: "Calories",
      value: `${formatNumber(todayMetrics.calories)} kcal`,
      icon: Flame,
      progress: 0.72,
    },
  ];

  return (
    <Section
      id="dashboard"
      eyebrow="Product"
      title="Your health, at a glance"
      description="A calm, interactive dashboard preview of how ZIVAN brings everyday metrics together."
    >
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_30px_80px_rgba(15,61,53,0.08)]">
          <div className="border-b border-border bg-gradient-to-r from-[#f3faf8] via-white to-[#eef8fb] px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted">
                  {userProfile.greeting}, {userProfile.name} 👋
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                  Your Wellbeing Score
                </h3>
                <p className="mt-2 font-display text-4xl font-bold text-primary">
                  {todayMetrics.wellbeingScore}{" "}
                  <span className="text-lg font-medium text-muted">/ 100</span>
                </p>
              </div>
              <div
                className="inline-flex rounded-2xl border border-border bg-white p-1"
                role="tablist"
                aria-label="Dashboard time range"
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
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
            {cards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-[1.5rem] border border-border bg-[#fbfefd] p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted">{card.label}</p>
                  <card.icon className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <p className="font-display text-xl font-semibold">{card.value}</p>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-primary-soft"
                  role="progressbar"
                  aria-valuenow={Math.round(card.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${card.label} progress`}
                >
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={reduce ? false : { width: 0 }}
                    whileInView={{ width: `${Math.min(card.progress, 1) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-border px-5 py-6 sm:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold">Weekly activity</h4>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                Interactive demo
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid rgba(15,61,53,0.08)",
                      boxShadow: "0 12px 30px rgba(15,61,53,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0d8f7a"
                    strokeWidth={3}
                    fill="url(#activityFill)"
                    animationDuration={reduce ? 0 : 800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
