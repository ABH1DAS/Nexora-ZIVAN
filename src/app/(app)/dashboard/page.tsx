"use client";

import { Button } from "@/components/ui/Button";
import { challenges, gamification } from "@/data/challenges";
import { todayMetrics } from "@/data/healthData";
import { useAuth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import {
  Activity,
  Droplets,
  Flame,
  Heart,
  Moon,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  if (!user) return null;

  const cards = [
    {
      label: "Steps",
      value: formatNumber(todayMetrics.steps),
      hint: `Goal ${formatNumber(todayMetrics.stepsGoal)}`,
      icon: Activity,
      href: "/dashboard/health",
    },
    {
      label: "Heart rate",
      value: `${todayMetrics.heartRate} BPM`,
      hint: "Resting range demo",
      icon: Heart,
      href: "/dashboard/health",
    },
    {
      label: "Sleep",
      value: `${todayMetrics.sleepHours}h ${todayMetrics.sleepMinutes}m`,
      hint: "Last night",
      icon: Moon,
      href: "/dashboard/health",
    },
    {
      label: "Water",
      value: `${todayMetrics.waterLiters}L`,
      hint: `Goal ${todayMetrics.waterGoal}L`,
      icon: Droplets,
      href: "/dashboard/water",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-[#f3faf8] to-[#e8f6fb] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted">Good to see you</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Your wellbeing score is {todayMetrics.wellbeingScore}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
              Track daily health, check in on your mind, stay emergency-ready, and
              keep your streak going — all in one place.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#0f2420] px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/60">Streak</p>
            <p className="mt-1 font-display text-3xl font-bold">
              🔥 {gamification.streak} days
            </p>
            <p className="mt-1 text-sm text-teal-200">
              {formatNumber(gamification.points)} XP
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/dashboard/health">Open health</Button>
          <Button variant="secondary" href="/dashboard/water">
            Log water
          </Button>
          <Button variant="secondary" href="/dashboard/devices">
            Add band
          </Button>
          <Button variant="outline" href="/dashboard/emergency">
            Emergency prep
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted">{card.label}</p>
              <card.icon className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <p className="font-display text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="font-display text-xl font-semibold">Active challenges</h2>
          </div>
          <ul className="space-y-4">
            {challenges.slice(0, 2).map((challenge) => {
              const pct = Math.round((challenge.progress / challenge.total) * 100);
              return (
                <li key={challenge.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{challenge.title}</span>
                    <span className="text-primary">
                      {challenge.progress}/{challenge.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="secondary" className="mt-5" href="/dashboard/challenges">
            View all challenges
          </Button>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden />
            <h2 className="font-display text-xl font-semibold">Today&apos;s focus</h2>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 rounded-2xl bg-[#f7fbfa] px-4 py-3">
              <Flame className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              Reach your remaining step goal —{" "}
              {formatNumber(Math.max(todayMetrics.stepsGoal - todayMetrics.steps, 0))}{" "}
              steps left.
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-[#f7fbfa] px-4 py-3">
              <Droplets className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
              Drink another {(todayMetrics.waterGoal - todayMetrics.waterLiters).toFixed(1)}L
              to hit hydration.
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-[#f7fbfa] px-4 py-3">
              <Moon className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              Keep a consistent bedtime to support sleep recovery.
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted">
            Suggestions are general wellbeing guidance — not medical advice.
          </p>
        </div>
      </section>
    </div>
  );
}
