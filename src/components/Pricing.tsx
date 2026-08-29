"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { pricingPlans } from "@/data/pricing";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Plans"
      title="Choose your pace"
      description="Configurable plans for individuals and families. No real payments are processed on this demo site."
      align="center"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <Reveal key={plan.id} delay={index * 0.05}>
            <article
              className={cn(
                "flex h-full flex-col rounded-[2rem] border p-7 shadow-[0_18px_40px_rgba(15,61,53,0.06)]",
                plan.highlighted
                  ? "border-primary bg-gradient-to-b from-primary-soft to-white"
                  : "border-border bg-white",
              )}
            >
              {plan.highlighted && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <p className="mt-6 font-display text-4xl font-bold">
                {plan.price}
                <span className="ml-1 text-base font-medium text-muted">
                  / {plan.period}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={plan.highlighted ? "primary" : "secondary"}
                href="/signup"
              >
                {plan.cta}
              </Button>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
