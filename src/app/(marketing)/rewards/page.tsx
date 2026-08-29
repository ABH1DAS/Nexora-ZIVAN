import { Challenges } from "@/components/Challenges";
import { Rewards } from "@/components/Rewards";
import { StickyEmergencyCta } from "@/components/StickyEmergencyCta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewards",
  description:
    "Earn points, badges and demo wellness rewards by building healthy habits with ZIVAN.",
};

export default function RewardsPage() {
  return (
    <main className="bg-atmosphere">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Rewards
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Habits that pay you back.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Challenges, streaks and demo reward offers. Partner rewards are illustrative
          until real integrations are connected.
        </p>
      </div>
      <Challenges />
      <Rewards />
      <StickyEmergencyCta />
    </main>
  );
}
