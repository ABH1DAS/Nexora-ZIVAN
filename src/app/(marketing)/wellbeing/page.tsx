import { MentalWellbeing } from "@/components/MentalWellbeing";
import { StickyEmergencyCta } from "@/components/StickyEmergencyCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wellbeing",
  description:
    "Take care of your mind with mood check-ins, breathing exercises, meditation and private journaling in ZIVAN.",
};

export default function WellbeingPage() {
  return (
    <main className="bg-atmosphere">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Wellbeing
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Space for your mind.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Mood, breathing and reflection tools designed for privacy and calm.
        </p>
      </div>
      <MentalWellbeing />
      <StickyEmergencyCta />
    </main>
  );
}
