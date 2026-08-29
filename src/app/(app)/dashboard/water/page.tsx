"use client";

import { Button } from "@/components/ui/Button";
import { WATER_PRESETS_ML } from "@/data/devices";
import { todayMetrics } from "@/data/healthData";
import {
  addWaterEntry,
  getWaterTotalLiters,
  getWaterTotalMl,
  removeWaterEntry,
  subscribeWater,
} from "@/lib/healthMonitorStore";
import type { WaterEntry } from "@/data/devices";
import { cn } from "@/lib/utils";
import { Droplets, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function DashboardWaterPage() {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [customMl, setCustomMl] = useState("250");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeWater(setEntries), []);

  const totalMl = useMemo(() => getWaterTotalMl(), [entries]);
  const totalLiters = useMemo(() => getWaterTotalLiters(), [entries]);
  const baseline = todayMetrics.waterLiters;
  const combinedLiters = Math.round((baseline + totalLiters) * 10) / 10;
  const goal = todayMetrics.waterGoal;
  const progress = Math.min((combinedLiters / goal) * 100, 100);

  function logWater(amountMl: number, entryNote?: string) {
    if (!Number.isFinite(amountMl) || amountMl <= 0) {
      setMessage("Enter a valid water amount in ml.");
      return;
    }
    addWaterEntry(amountMl, entryNote);
    setMessage(`Logged ${amountMl} ml of water.`);
    setNote("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    logWater(Number(customMl), note);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Water intake
        </h1>
        <p className="mt-2 text-sm text-muted">
          Log detailed hydration throughout the day. Demo data stays on this
          device.
        </p>
      </div>

      {message && (
        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary-dark" role="status">
          {message}
        </p>
      )}

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted">Today&apos;s hydration</p>
            <p className="mt-1 font-display text-4xl font-bold text-primary">
              {combinedLiters}L{" "}
              <span className="text-lg font-medium text-muted">/ {goal}L</span>
            </p>
            <p className="mt-2 text-xs text-muted">
              Baseline {baseline}L + logged {(totalMl / 1000).toFixed(2)}L
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Droplets className="h-7 w-7" aria-hidden />
          </div>
        </div>
        <div
          className="mt-5 h-3 overflow-hidden rounded-full bg-primary-soft"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Water goal progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">Quick add</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {WATER_PRESETS_ML.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => logWater(amount)}
              className="rounded-2xl border border-border bg-[#f7fbfa] px-4 py-3 text-sm font-semibold transition hover:border-primary/40 hover:bg-primary-soft"
            >
              + {amount} ml
            </button>
          ))}
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_1.2fr_auto]" onSubmit={onSubmit}>
          <div>
            <label htmlFor="water-ml" className="mb-1.5 block text-sm font-semibold">
              Custom amount (ml)
            </label>
            <input
              id="water-ml"
              type="number"
              min={1}
              step={10}
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-[#fbfefd] px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="water-note" className="mb-1.5 block text-sm font-semibold">
              Detail note
            </label>
            <input
              id="water-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. After workout, with lunch"
              className="h-12 w-full rounded-2xl border border-border bg-[#fbfefd] px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">
              Log water
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">Today&apos;s log</h2>
        {entries.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No detailed entries yet. Add your first glass above.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-[#fbfefd] px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{entry.amountMl} ml</p>
                  <p className="text-xs text-muted">
                    {new Date(entry.at).toLocaleTimeString()}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted hover:bg-emergency-soft hover:text-emergency",
                  )}
                  aria-label={`Remove ${entry.amountMl} ml entry`}
                  onClick={() => {
                    removeWaterEntry(entry.id);
                    setMessage("Entry removed.");
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
