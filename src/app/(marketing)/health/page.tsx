import { Analytics } from "@/components/Analytics";
import { HealthDashboard } from "@/components/HealthDashboard";
import { StickyEmergencyCta } from "@/components/StickyEmergencyCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Dashboard",
  description:
    "Preview the ZIVAN health dashboard with steps, heart rate, sleep, hydration, activity and wellbeing score.",
};

export default function HealthPage() {
  return (
    <main className="bg-atmosphere">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Health
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Your health, clearly organized.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Explore the interactive ZIVAN dashboard and analytics preview. Demo metrics
          only — not clinical readings.
        </p>
      </div>
      <HealthDashboard />
      <Analytics />
      <StickyEmergencyCta />
    </main>
  );
}
