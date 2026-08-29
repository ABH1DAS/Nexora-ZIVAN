"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { features } from "@/data/features";
import {
  Activity,
  Bot,
  Brain,
  Droplets,
  Footprints,
  Heart,
  Trophy,
} from "lucide-react";

const icons = {
  heart: Heart,
  brain: Brain,
  droplet: Droplets,
  footprints: Footprints,
  bot: Bot,
  trophy: Trophy,
};

export function FeatureCards() {
  return (
    <Section
      id="features"
      eyebrow="Platform"
      title="Everything You Need for a Healthier Life"
      description="An all-in-one ecosystem for everyday health, mental wellbeing, habits, fitness and emergency readiness."
    >
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = icons[feature.icon];
          return (
            <Reveal key={feature.id} delay={index * 0.05} className="min-w-[280px] sm:min-w-0">
              <article className="flex h-full flex-col rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,61,53,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,61,53,0.1)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/85">
                      <Activity className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
