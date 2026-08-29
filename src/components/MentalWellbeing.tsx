"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { BookOpen, Brain, Leaf, Sparkles, Wind } from "lucide-react";
import { useState } from "react";

const moods = [
  { id: "great", label: "Great", emoji: "😄" },
  { id: "good", label: "Good", emoji: "🙂" },
  { id: "okay", label: "Okay", emoji: "😐" },
  { id: "low", label: "Low", emoji: "😔" },
  { id: "stressed", label: "Stressed", emoji: "😣" },
];

const cards = [
  {
    title: "Meditation",
    description: "Short sessions for calm focus.",
    icon: Brain,
  },
  {
    title: "Breathing",
    description: "Guided patterns to settle your nervous system.",
    icon: Wind,
  },
  {
    title: "Mood tracking",
    description: "Notice patterns without judgment.",
    icon: Sparkles,
  },
  {
    title: "Journaling",
    description: "A private space for thoughts.",
    icon: BookOpen,
  },
  {
    title: "Wellness suggestions",
    description: "Gentle prompts based on your check-ins.",
    icon: Leaf,
  },
];

export function MentalWellbeing() {
  const [mood, setMood] = useState<string | null>("good");
  const reduce = useReducedMotion();

  return (
    <Section
      id="wellbeing"
      eyebrow="Mental Wellbeing"
      title="Take Care of Your Mind Too."
      description="Private, thoughtful tools for mood, breathing and reflection — designed to feel calm, never clinical."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_20px_50px_rgba(15,61,53,0.06)] sm:p-8">
            <h3 className="font-display text-2xl font-semibold">
              How are you feeling today?
            </h3>
            <div
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5"
              role="radiogroup"
              aria-label="Mood check-in"
            >
              {moods.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={mood === item.id}
                  onClick={() => setMood(item.id)}
                  className={cn(
                    "min-h-[88px] rounded-2xl border px-3 py-4 text-center transition",
                    mood === item.id
                      ? "border-primary bg-primary-soft shadow-sm"
                      : "border-border bg-[#fbfefd] hover:border-primary/30",
                  )}
                >
                  <span className="block text-2xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="mt-2 block text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              Mood check-ins stay private by default. You control what is shared.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-border bg-gradient-to-b from-[#e8f7f3] to-white p-8 text-center shadow-[0_20px_50px_rgba(15,61,53,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              3-Minute Breathing Exercise
            </p>
            <div className="relative my-10 flex h-44 w-44 items-center justify-center">
              <div
                className={cn(
                  "absolute inset-0 rounded-full bg-primary/15",
                  !reduce && "animate-breathe",
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "absolute inset-8 rounded-full bg-primary/25",
                  !reduce && "animate-breathe",
                )}
                style={{ animationDelay: "0.4s" }}
                aria-hidden
              />
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="font-display text-sm font-semibold">Breathe</span>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Inhale as the circle expands. Exhale as it softens. A simple demo of
              guided calm inside ZIVAN.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {cards.map((card, index) => (
          <Reveal key={card.title} delay={index * 0.04} className="min-w-[220px] sm:min-w-0">
            <article className="h-full rounded-[1.5rem] border border-border bg-white/90 p-5 shadow-sm">
              <card.icon className="mb-3 h-5 w-5 text-accent" aria-hidden />
              <h4 className="font-display text-lg font-semibold">{card.title}</h4>
              <p className="mt-2 text-sm text-muted">{card.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
