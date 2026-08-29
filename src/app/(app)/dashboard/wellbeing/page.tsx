"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Brain, Leaf, Wind } from "lucide-react";
import { useState } from "react";

const moods = [
  { id: "great", label: "Great", emoji: "😄" },
  { id: "good", label: "Good", emoji: "🙂" },
  { id: "okay", label: "Okay", emoji: "😐" },
  { id: "low", label: "Low", emoji: "😔" },
  { id: "stressed", label: "Stressed", emoji: "😣" },
];

export default function DashboardWellbeingPage() {
  const [mood, setMood] = useState("good");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Mental wellbeing
        </h1>
        <p className="mt-2 text-sm text-muted">
          Private check-ins and calming tools. You control what is shared.
        </p>
      </div>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">
          How are you feeling today?
        </h2>
        <div
          className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5"
          role="radiogroup"
          aria-label="Mood"
        >
          {moods.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={mood === item.id}
              onClick={() => {
                setMood(item.id);
                setSaved(false);
              }}
              className={cn(
                "min-h-[88px] rounded-2xl border px-3 py-4 text-center transition",
                mood === item.id
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:border-primary/30",
              )}
            >
              <span className="block text-2xl" aria-hidden>
                {item.emoji}
              </span>
              <span className="mt-2 block text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        <label htmlFor="journal" className="mt-6 block text-sm font-semibold">
          Private note (optional)
        </label>
        <textarea
          id="journal"
          rows={4}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          className="mt-2 w-full rounded-2xl border border-border bg-[#fbfefd] px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Write freely. Stored locally in this demo."
        />
        <button
          type="button"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
          onClick={() => {
            localStorage.setItem(
              "zivan-mood-checkin",
              JSON.stringify({ mood, note, at: new Date().toISOString() }),
            );
            setSaved(true);
          }}
        >
          Save check-in
        </button>
        {saved && (
          <p className="mt-3 text-sm text-success" role="status">
            Check-in saved on this device.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Breathing", desc: "3-minute calm reset", icon: Wind },
          { title: "Meditation", desc: "Short guided focus", icon: Brain },
          { title: "Journal", desc: "Private reflections", icon: BookOpen },
          { title: "Suggestions", desc: "Gentle next steps", icon: Leaf },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm"
          >
            <item.icon className="mb-3 h-5 w-5 text-accent" aria-hidden />
            <h3 className="font-display text-lg font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
