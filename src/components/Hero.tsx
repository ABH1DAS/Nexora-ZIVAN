"use client";

import { Button } from "@/components/ui/Button";
import { todayMetrics } from "@/data/healthData";
import { formatNumber } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Droplets, Flame, Heart, Moon, Siren } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const sequence = [
  { label: "Steps", value: `${formatNumber(todayMetrics.steps)} Steps`, icon: Activity },
  { label: "Heart", value: `${todayMetrics.heartRate} BPM`, icon: Heart },
  { label: "SpO2", value: `${todayMetrics.spo2}% SpO₂`, icon: Activity },
  {
    label: "Sleep",
    value: `${todayMetrics.sleepHours}h ${todayMetrics.sleepMinutes}m Sleep`,
    icon: Moon,
  },
  { label: "Water", value: `${todayMetrics.waterLiters}L Water`, icon: Droplets },
  {
    label: "Score",
    value: `Wellbeing Score: ${todayMetrics.wellbeingScore}`,
    icon: Flame,
  },
];

export function Hero() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"metrics" | "journey">("metrics");

  useEffect(() => {
    if (reduce) {
      setStep(sequence.length - 1);
      setPhase("journey");
      return;
    }

    if (phase === "metrics" && step < sequence.length - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), 900);
      return () => clearTimeout(t);
    }

    if (phase === "metrics" && step === sequence.length - 1) {
      const t = setTimeout(() => setPhase("journey"), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, reduce, step]);

  return (
    <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="pointer-events-none absolute inset-0 bg-mesh" aria-hidden />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
        <div className="relative z-10">
          <p className="mb-5 inline-flex items-center rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
            Health · Wellbeing · Emergency
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Your Health.
            <br />
            Your Journey.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your ZIVAN.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Track your health, build better habits, improve your wellbeing and stay
            connected to help when you need it most.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" id="get-started">
            <Button size="lg" href="/signup">
              Get Started
            </Button>
            <Button size="lg" variant="secondary" href="/#features">
              Explore ZIVAN
            </Button>
          </div>

          <div className="mt-10 min-h-[4.5rem]" aria-live="polite">
            {phase === "metrics" ? (
              <motion.div
                key={sequence[step].label}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
              >
                {(() => {
                  const Icon = sequence[step].icon;
                  return <Icon className="h-5 w-5 text-primary" aria-hidden />;
                })()}
                <span className="font-display text-lg font-semibold text-foreground">
                  {sequence[step].value}
                </span>
              </motion.div>
            ) : (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-xl font-semibold text-primary sm:text-2xl"
              >
                Track → Analyze → Improve
              </motion.p>
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" aria-hidden />
          <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,61,53,0.12)] backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Today</p>
                <p className="font-display text-xl font-semibold">Health Overview</p>
              </div>
              <div className="rounded-2xl bg-primary-soft px-3 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Score
                </p>
                <p className="font-display text-2xl font-bold text-primary">
                  {todayMetrics.wellbeingScore}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Steps", value: formatNumber(todayMetrics.steps), icon: Activity },
                { label: "Heart rate", value: `${todayMetrics.heartRate} BPM`, icon: Heart },
                {
                  label: "Sleep",
                  value: `${todayMetrics.sleepHours}h ${todayMetrics.sleepMinutes}m`,
                  icon: Moon,
                },
                { label: "Water", value: `${todayMetrics.waterLiters}L`, icon: Droplets },
                { label: "Calories", value: `${formatNumber(todayMetrics.calories)}`, icon: Flame },
                {
                  label: "Activity",
                  value: `${todayMetrics.activityMinutes} min`,
                  icon: Activity,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-gradient-to-b from-white to-[#f3faf8] p-3.5"
                >
                  <item.icon className="mb-2 h-4 w-4 text-primary" aria-hidden />
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="mt-1 font-display text-base font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-[#0f2420] p-4 text-white">
              <div className="mb-3 flex items-center justify-between text-xs text-white/60">
                <span>Weekly activity</span>
                <span>Demo</span>
              </div>
              <div className="flex h-16 items-end gap-2">
                {[42, 58, 46, 72, 64, 88, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-300"
                    style={{ height: `${h}%` }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/emergency"
            className="absolute -right-2 top-8 z-20 flex items-center gap-2 rounded-full bg-emergency px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(217,53,74,0.45)] transition hover:bg-emergency-dark sm:-right-4 animate-float"
            aria-label="Open emergency SOS demo"
          >
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-white/70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
            <Siren className="h-4 w-4" aria-hidden />
            SOS
          </Link>
        </div>
      </div>
    </section>
  );
}
