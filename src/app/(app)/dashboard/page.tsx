"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { useUserData } from "@/lib/userDataStore";
import { formatNumber } from "@/lib/utils";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Heart,
  Moon,
  ShieldAlert,
  Siren,
  Sparkles,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { metrics, challenges, isNewUser } = useUserData();
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  if (!user) return null;

  const scoreLabel =
    metrics.wellbeingScore >= 80
      ? "Optimal"
      : metrics.wellbeingScore >= 50
      ? "Good"
      : isNewUser
      ? "New User"
      : "Needs Check-in";

  const cards = [
    {
      label: "Heart Rate",
      value: metrics.heartRate > 0 ? `${metrics.heartRate} BPM` : "Not recorded",
      hint: metrics.heartRate > 0 ? "Normal resting rhythm" : "Sync or log in health tab",
      icon: Heart,
      color: "text-rose-500 bg-rose-50 border-rose-100",
      href: "/dashboard/health",
      percent: metrics.heartRate > 0 ? `${Math.min(metrics.heartRate, 100)}%` : "0%",
    },
    {
      label: "Daily Steps",
      value: formatNumber(metrics.steps),
      hint: `Goal: ${formatNumber(metrics.stepsGoal)} steps`,
      icon: Activity,
      color: "text-teal-600 bg-teal-50 border-teal-100",
      href: "/dashboard/health",
      percent: `${Math.min(Math.round((metrics.steps / Math.max(metrics.stepsGoal, 1)) * 100), 100)}%`,
    },
    {
      label: "Sleep Quality",
      value: metrics.sleepHours > 0 ? `${metrics.sleepHours}h ${metrics.sleepMinutes}m` : "0h 0m",
      hint: metrics.sleepHours > 0 ? "Sleep target logged" : "Log sleep in habits",
      icon: Moon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      href: "/dashboard/habits",
      percent: `${Math.min(Math.round((metrics.sleepHours / 8.0) * 100), 100)}%`,
    },
    {
      label: "Hydration",
      value: `${metrics.waterLiters}L`,
      hint: `Goal: ${metrics.waterGoal}L daily`,
      icon: Droplets,
      color: "text-sky-600 bg-sky-50 border-sky-100",
      href: "/dashboard/habits",
      percent: `${Math.min(Math.round((metrics.waterLiters / Math.max(metrics.waterGoal, 1)) * 100), 100)}%`,
    },
  ];

  const recentActivities = [
    {
      title: metrics.waterLiters > 0 ? "Water Intake Recorded" : "Hydration Tracker Ready",
      category: "Hydration",
      time: metrics.waterLiters > 0 ? "Today" : "Active",
      icon: Droplets,
      badge: metrics.waterLiters > 0 ? `${metrics.waterLiters} L logged today` : "Tap below to log water",
    },
    {
      title: metrics.steps > 0 ? "Daily Step Activity" : "Step Counter Initialized",
      category: "Activity",
      time: "Today",
      icon: Activity,
      badge: `${formatNumber(metrics.steps)} / ${formatNumber(metrics.stepsGoal)} steps`,
    },
    {
      title: "Daily Mood Check-in",
      category: "Wellbeing",
      time: "Ready",
      icon: Brain,
      badge: metrics.wellbeingScore > 0 ? `Score: ${metrics.wellbeingScore}/100` : "Tap to complete first check-in",
    },
    {
      title: "Emergency SOS Safety Shield",
      category: "Emergency",
      time: "24/7 Active",
      icon: ShieldAlert,
      badge: "One-tap hospital ambulance dispatch ready",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Header & SOS Callout */}
      <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-gradient-to-br from-[#0f2420] via-[#14322c] to-[#0a1815] p-6 text-white glow-primary sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1 text-xs font-semibold text-teal-200">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" aria-hidden />
              {greeting}, {user.name.split(" ")[0]}!
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Overall Wellbeing Score:{" "}
              <span className="text-teal-300">
                {metrics.wellbeingScore > 0 ? `${metrics.wellbeingScore}/100` : "Ready to Start"}
              </span>
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-teal-100/80 sm:text-base">
              {isNewUser ? (
                <span>
                  Welcome to ZIVAN! Your new health dashboard has started from <strong>0</strong>. Log your water, habits, and vitals to build your healthy streak!
                </span>
              ) : (
                <span>
                  Your personal health data is synced to cloud. You are on a{" "}
                  <strong className="text-white">{metrics.streakDays}-day healthy streak</strong>!
                </span>
              )}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/dashboard/emergency" variant="emergency" size="lg" className="shadow-lg shadow-rose-950/40">
                <Siren className="h-5 w-5 animate-pulse" aria-hidden />
                One-Tap SOS Emergency
              </Button>
              <Button href="/dashboard/ai" variant="secondary" className="border-white/10 bg-white/15 text-white hover:bg-white/20">
                <Bot className="h-4 w-4" aria-hidden />
                Ask AI Assistant
              </Button>
              <Button href="/dashboard/wellbeing" variant="ghost" className="text-teal-200 hover:bg-white/10 hover:text-white">
                <Brain className="h-4 w-4" aria-hidden />
                Mood Check-in
              </Button>
            </div>
          </div>

          {/* Health Score Gauge Box */}
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-teal-400/30 bg-teal-900/40">
              <div className="text-center">
                <span className="font-display text-3xl font-bold text-teal-200">
                  {metrics.wellbeingScore > 0 ? metrics.wellbeingScore : "0"}
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-teal-300/70">
                  {scoreLabel}
                </span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs font-semibold text-teal-100">🔥 {metrics.streakDays} Day Streak</p>
              <p className="text-[11px] text-teal-200/60">{formatNumber(metrics.points)} Points Earned</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Access Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/emergency"
          className="group flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 transition hover:bg-rose-100/80 glow-emergency"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md group-hover:scale-105 transition">
              <Siren className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-rose-950 text-sm">One-Tap SOS</p>
              <p className="text-xs text-rose-700">Immediate Ambulance</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>

        <Link
          href="/dashboard/habits"
          className="group flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/80 p-4 transition hover:bg-sky-100/80 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md group-hover:scale-105 transition">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sky-950 text-sm">Log Water Intake</p>
              <p className="text-xs text-sky-700">{metrics.waterLiters}L / {metrics.waterGoal}L today</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>

        <Link
          href="/dashboard/wellbeing"
          className="group flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 transition hover:bg-emerald-100/80 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md group-hover:scale-105 transition">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-950 text-sm">Mood Check-in</p>
              <p className="text-xs text-emerald-700">Track daily mood</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>

        <Link
          href="/dashboard/ai"
          className="group flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 transition hover:bg-indigo-100/80 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md group-hover:scale-105 transition">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-indigo-950 text-sm">AI Health Chat</p>
              <p className="text-xs text-indigo-700">General wellness guidance</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </Link>
      </div>

      {/* 3. Health Overview Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight">Health Overview</h2>
          <Link href="/dashboard/health" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View details &amp; trends <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">{card.label}</span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="font-display text-3xl font-bold tracking-tight">{card.value}</p>
                  <p className="mt-1 text-xs text-muted font-medium">{card.hint}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary" style={{ width: card.percent }} />
                  </div>
                  <span className="text-[11px] font-semibold text-muted">{card.percent}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Recent Activity & Active Challenges */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Summary */}
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="font-display text-xl font-semibold">Recent Activity Summary</h2>
            </div>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Today</span>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.title} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-[#fbfefd] p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{act.title}</p>
                      <span className="text-[11px] text-muted">{act.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{act.badge}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Challenges & Goals */}
        <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
              <h2 className="font-display text-xl font-semibold">Active Challenges</h2>
            </div>
            <Link href="/dashboard/challenges" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          <ul className="space-y-4">
            {challenges.slice(0, 3).map((challenge) => {
              const pct = Math.min(Math.round((challenge.progress / Math.max(challenge.totalTarget, 1)) * 100), 100);
              return (
                <li key={challenge.id} className="rounded-2xl border border-border/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">{challenge.title}</span>
                    <span className="font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>{challenge.category}</span>
                    <span>{challenge.progress} / {challenge.totalTarget} {challenge.unit}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
