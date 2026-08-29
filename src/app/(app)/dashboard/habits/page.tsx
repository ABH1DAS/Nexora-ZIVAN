"use client";

import { Button } from "@/components/ui/Button";
import { WATER_PRESETS_ML } from "@/data/devices";
import { todayMetrics } from "@/data/healthData";
import { gamification } from "@/data/challenges";
import {
  addWaterEntry,
  getWaterTotalLiters,
  getWaterTotalMl,
  removeWaterEntry,
  subscribeWater,
} from "@/lib/healthMonitorStore";
import type { WaterEntry } from "@/data/devices";
import { cn } from "@/lib/utils";
import { Activity, CheckCircle2, Droplets, Flame, Minus, Moon, Plus, Target, Trash2, Trophy, Zap } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function DashboardHabitsPage() {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [customMl, setCustomMl] = useState("250");
  const [exerciseMins, setExerciseMins] = useState(todayMetrics.activityMinutes);
  const [sleepHrs, setSleepHrs] = useState(todayMetrics.sleepHours + todayMetrics.sleepMinutes / 60);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeWater(setEntries), []);

  const totalWaterMl = useMemo(() => getWaterTotalMl(), [entries]);
  const totalWaterLiters = useMemo(() => getWaterTotalLiters(), [entries]);
  const baselineWater = todayMetrics.waterLiters;
  const currentWaterLiters = Math.min(Math.round((baselineWater + totalWaterLiters) * 10) / 10, 4.0);
  const waterGoal = todayMetrics.waterGoal;
  const waterPct = Math.min((currentWaterLiters / waterGoal) * 100, 100);

  // Exercise Goal (60 mins target)
  const exerciseGoal = 60;
  const exercisePct = Math.min((exerciseMins / exerciseGoal) * 100, 100);

  // Sleep Goal (8.0 hrs target)
  const sleepGoal = 8.0;
  const sleepPct = Math.min((sleepHrs / sleepGoal) * 100, 100);

  // Combined daily progress
  const overallHabitProgress = Math.round((waterPct + exercisePct + sleepPct) / 3);

  function logWater(amountMl: number) {
    if (amountMl <= 0) return;
    addWaterEntry(amountMl);
    setMessage(`Logged +${amountMl} ml of water.`);
    setTimeout(() => setMessage(null), 3000);
  }

  function handleCustomWater(e: FormEvent) {
    e.preventDefault();
    const val = Number(customMl);
    if (val > 0) logWater(val);
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[2.25rem] border border-border bg-gradient-to-br from-white via-[#f0f9f7] to-[#e6f4f1] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100/70 px-3.5 py-1 text-xs font-bold text-teal-900">
              <Target className="h-3.5 w-3.5 text-teal-700" />
              Daily Habit Tracker & Health Goals
            </div>
            <h1 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Habits & Daily Completion: <span className="text-primary">{overallHabitProgress}%</span>
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
              <p className="font-display text-2xl font-bold text-slate-900">{gamification.streak} Days</p>
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
              <p className="mt-1 text-xs text-muted">Baseline: {baselineWater}L · Logged: {(totalWaterMl / 1000).toFixed(2)}L</p>

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
                    onClick={() => logWater(ml)}
                    className="rounded-xl border border-sky-200 bg-sky-50/70 p-2.5 text-xs font-bold text-sky-900 transition hover:bg-sky-100 hover:border-sky-300"
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
                {exerciseMins} mins <span className="text-base text-muted font-normal">/ {exerciseGoal} mins</span>
              </p>
              <p className="mt-1 text-xs text-muted">Daily movement & active cardio target</p>

              {/* Progress bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-600 transition-all duration-300" style={{ width: `${exercisePct}%` }} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setExerciseMins((m) => Math.max(0, m - 10))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-slate-50 font-bold text-slate-700 hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700">+ / - 10 mins</span>
              <button
                type="button"
                onClick={() => setExerciseMins((m) => m + 10)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 font-bold text-teal-900 hover:bg-teal-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted">
            {exerciseMins >= exerciseGoal ? "🎉 Daily exercise goal completed!" : `${exerciseGoal - exerciseMins} mins remaining today`}
          </p>
        </section>

        {/* 3. Sleep Goal Card */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Moon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-bold">Sleep Goal</h2>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {Math.round(sleepPct)}% Goal
              </span>
            </div>

            <div className="mt-5 text-center">
              <p className="font-display text-4xl font-bold tracking-tight text-foreground">
                {sleepHrs.toFixed(1)} hrs <span className="text-base text-muted font-normal">/ {sleepGoal} hrs</span>
              </p>
              <p className="mt-1 text-xs text-muted">Restful sleep & night recovery target</p>

              {/* Progress bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300" style={{ width: `${sleepPct}%` }} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSleepHrs((h) => Math.max(0, h - 0.5))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-slate-50 font-bold text-slate-700 hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700">+ / - 30 mins</span>
              <button
                type="button"
                onClick={() => setSleepHrs((h) => h + 0.5)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 font-bold text-indigo-900 hover:bg-indigo-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-muted">
            {sleepHrs >= sleepGoal ? "😴 Optimal rest achieved!" : `${(sleepGoal - sleepHrs).toFixed(1)} hrs left to reach sleep target`}
          </p>
        </section>
      </div>

      {/* Detailed Water Log Entries List */}
      {entries.length > 0 && (
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold mb-4">Today&apos;s Hydration Log Entries</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div>
                  <p className="font-bold text-sm text-foreground">+{entry.amountMl} ml</p>
                  <p className="text-xs text-muted">{new Date(entry.at).toLocaleTimeString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeWaterEntry(entry.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  aria-label="Remove entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
