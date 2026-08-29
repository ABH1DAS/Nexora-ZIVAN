"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { rewards } from "@/data/rewards";
import { formatNumber } from "@/lib/utils";
import { Gift } from "lucide-react";

export function Rewards() {
  return (
    <Section
      id="rewards"
      eyebrow="Rewards"
      title="Your Healthy Habits Pay Back."
      description="Redeem points for wellness perks. Demo offers shown until real reward partners are integrated."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((reward, index) => (
          <Reveal key={reward.id} delay={index * 0.05}>
            <article className="flex h-full flex-col rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_16px_40px_rgba(15,61,53,0.06)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Gift className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-display text-lg font-semibold">{reward.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{reward.description}</p>
              <p className="mt-5 text-sm font-bold text-primary">
                {formatNumber(reward.points)} points
              </p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button size="lg" href="/rewards">
          Explore Rewards
        </Button>
      </div>
    </Section>
  );
}
