"use client";

import { Button } from "@/components/ui/Button";
import { WATER_PRESETS_ML } from "@/data/devices";
import { useUserData } from "@/lib/userDataStore";
import { cn } from "@/lib/utils";
import {
  Activity,
  CheckCircle2,
  Droplets,
  Flame,
  Minus,
  Moon,
  Plus,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { FormEvent, useState } from "react";

export default function DashboardHabitsPage() {
  const { metrics, logWater, logActivity, logSleep } = useUserData();
  const [customMl, setCustomMl] = useState("250");
  const [message, setMessage] = useState<string | null>(null);

  const currentWaterLiters = metrics.waterLiters;
  const waterGoal = metrics.waterGoal || 3.0;
  const waterPct = Math.min((currentWaterLiters / waterGoal) * 100, 100);

  // Exercise Goal (60 mins target)
  const exerciseGoal = 60;
  const exercisePct = Math.min((metrics.activeMinutes / exerciseGoal) * 100, 100);

  // Sleep Goal (8.0 hrs target)
  const sleepGoal = 8.0;
  const sleepHrs = metrics.sleepHours + metrics.sleepMinutes / 60;
  const sleepPct = Math.min((sleepHrs / sleepGoal) * 100, 100);

  // Combined daily progress
  const overallHabitProgress = Math.round((waterPct + exercisePct + sleepPct) / 3);

  async function handleLogWater(amountMl: number) {
    if (amountMl <= 0) return;
    await logWater(amountMl, "Glass logged in Habits");
    setMessage(`Logged +${amountMl} ml of water. Saved to cloud database!`);
    setTimeout(() => setMessage(null), 3000);
  }

  function handleCustomWater(e: FormEvent) {
    e.preventDefault();
    const val = Number(customMl);
    if (val > 0) handleLogWater(val);
  }

  async function handleAddExercise(mins: number) {
    const calories = mins * 8;
    await logActivity(mins, calories, mins * 100);
    setMessage(`Logged +${mins} mins of exercise (+${calories} kcal).`);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleSetSleep(hours: number) {
    await logSleep(hours, 0);
    setMessage(`Recorded ${hours} hours of sleep recovery.`);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-gradient-to-br from-white via-[#f0f9f7] to-[#e6f4f1] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100/70 px-3.5 py-1 text-xs font-bold text-teal-900">
              <Target className="h-3.5 w-3.5 text-teal-700" />
              Daily Habit Tracker &amp; Health Goals
            </div>
            <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Habits &amp; Daily Completion: <span className="text-primary">{overallHabitProgress}%</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Maintain your daily wellness streak by logging water intake, exercise duration, and sleep goals.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-teal-200/80 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Flame className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-slate-900">{metrics.streakDays} Days</p>
              <p className="text-xs font-semibold text-muted">Active Habit Streak 🔥</p>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900" role="status">
          {message}
        </p>
      )}

      {/* 3 Main Habits Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 1. Water Intake Tracking Card */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Droplets className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-bold">Water Intake</h2>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                {Math.round(waterPct)}% Goal
              </span>
            </div>

            <div className="mt-5 text-center">
              <p className="font-display text-4xl font-bold tracking-tight text-foreground">
                {currentWaterLiters} L <span className="text-base text-muted font-normal">/ {waterGoal} L</span>
              </p>
              <p className="mt-1 text-xs text-muted">Goal: {waterGoal}L daily hydration</p>

              {/* Progress bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300" style={{ width: `${waterPct}%` }} />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Quick Add Glass</p>
              <div className="grid grid-cols-3 gap-2">
                {WATER_PRESETS_ML.slice(0, 3).map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => handleLogWater(ml)}
                    className="rounded-xl border border-sky-200 bg-sky-50/70 p-2.5 text-xs font-bold text-sky-900 transition hover:bg-sky-100 hover:border-sky-300 cursor-pointer"
                  >
                    + {ml} ml
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleCustomWater} className="mt-5 flex gap-2">
            <input
              type="number"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              placeholder="250"
              className="h-10 w-full rounded-xl border border-border bg-[#fbfefd] px-3 text-xs outline-none focus:border-primary"
            />
            <Button type="submit" size="sm" variant="secondary">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
        </section>

        {/* 2. Exercise Goal Card */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                  <Activity className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-bold">Exercise Goal</h2>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                {Math.round(exercisePct)}% Goal
              </span>
            </div>

            <div className="mt-5 text-center">
              <p className="font-display text-4xl font-bold tracking-tight text-foreground">
                {metrics.activeMinutes} mins <span className="text-base text-muted font-normal">/ {exerciseGoal} mins</span>
              </p>
              <p className="mt-1 text-xs text-muted">Daily movement &amp; active cardio target</p>

              {/* Progress bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-600 transition-all duration-300" style={{ width: `${exercisePct}%` }} />
              </div>
            </div>

            {/* Quick Add Exercise */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Log Workout Session</p>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleAddExercise(mins)}
                    className="rounded-xl border border-teal-200 bg-teal-50/70 p-2.5 text-xs font-bold text-teal-900 transition hover:bg-teal-100 hover:border-teal-300 cursor-pointer"
                  >
                    +{mins} mins
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-slate-50 p-3 text-center text-xs text-muted">
            <span className="font-bold text-slate-800">{metrics.caloriesBurned} kcal</span> burned today
          </div>
        </section>

        {/* 3. Sleep Recovery Card */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Moon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-bold">Sleep Recovery</h2>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {Math.round(sleepPct)}% Goal
              </span>
            </div>

            <div className="mt-5 text-center">
              <p className="font-display text-4xl font-bold tracking-tight text-foreground">
                {metrics.sleepHours}h {metrics.sleepMinutes}m <span className="text-base text-muted font-normal">/ {sleepGoal}h</span>
              </p>
              <p className="mt-1 text-xs text-muted">Target: 8.0 hours restorative sleep</p>

              {/* Progress bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300" style={{ width: `${sleepPct}%` }} />
              </div>
            </div>

            {/* Quick Sleep Set */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Record Night Sleep</p>
              <div className="grid grid-cols-3 gap-2">
                {[6, 7.5, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSetSleep(h)}
                    className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-2.5 text-xs font-bold text-indigo-900 transition hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer"
                  >
                    {h} hrs
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-slate-50 p-3 text-center text-xs text-muted">
            Sleep score: <span className="font-bold text-indigo-700">{metrics.sleepScore || 0}/100</span>
          </div>
        </section>
      </div>
    </div>
  );
}
