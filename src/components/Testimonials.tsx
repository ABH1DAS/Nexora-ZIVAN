"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { testimonials } from "@/data/features";

export function Testimonials() {
  return (
    <Section
      id="testimonials"
      eyebrow="Stories"
      title="Built for everyday health"
      description="Placeholder testimonials for development — clearly marked as demo content, not real customer claims."
    >
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Demo content only. These quotes are placeholders and do not represent verified
        customer reviews.
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <Reveal key={item.id} delay={index * 0.05}>
            <figure className="flex h-full flex-col rounded-[1.75rem] border border-border bg-white p-6 shadow-sm">
              <blockquote className="flex-1 text-base leading-relaxed text-foreground/90">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft font-display font-bold text-primary"
                  aria-hidden
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">{item.role} · Placeholder</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
