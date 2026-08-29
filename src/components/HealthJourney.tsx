"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { journeySteps } from "@/data/features";
import { motion, useReducedMotion } from "framer-motion";

export function HealthJourney() {
  const reduce = useReducedMotion();

  return (
    <Section
      id="journey"
      eyebrow="Signature Flow"
      title="Your Health Journey"
      description="The ZIVAN loop — continuous improvement without overwhelm."
      align="center"
      className="overflow-hidden"
    >
      <div className="relative mx-auto max-w-4xl">
        <div
          className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 md:block"
          aria-hidden
        />
        <ol className="space-y-6">
          {journeySteps.map((step, index) => (
            <Reveal key={step.id} delay={index * 0.06}>
              <li className="relative grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div
                  className={
                    index % 2 === 0
                      ? "md:text-right"
                      : "md:col-start-3 md:text-left"
                  }
                >
                  <motion.article
                    whileHover={reduce ? undefined : { y: -4 }}
                    className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_18px_40px_rgba(15,61,53,0.06)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </motion.article>
                </div>
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-primary text-sm font-bold text-white shadow-lg md:col-start-2 md:row-start-1">
                  {index + 1}
                </div>
                {index % 2 !== 0 && <div className="hidden md:block" />}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
