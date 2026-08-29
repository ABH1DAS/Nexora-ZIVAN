"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { BookOpen, Brain, HeartHandshake, Play, Pause, RotateCcw, Sparkles, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MoodType = "happy" | "neutral" | "stressed" | "sad";

const MOOD_OPTIONS: { id: MoodType; label: string; emoji: string; stressScore: number; color: string }[] = [
  { id: "happy", label: "Happy", emoji: "😊", stressScore: 15, color: "border-emerald-300 bg-emerald-50 text-emerald-950" },
  { id: "neutral", label: "Neutral", emoji: "😐", stressScore: 35, color: "border-sky-300 bg-sky-50 text-sky-950" },
  { id: "stressed", label: "Stressed", emoji: "😰", stressScore: 80, color: "border-amber-300 bg-amber-50 text-amber-950" },
  { id: "sad", label: "Sad", emoji: "😢", stressScore: 65, color: "border-indigo-300 bg-indigo-50 text-indigo-950" },
];

const MOOD_SUGGESTIONS: Record<MoodType, { title: string; text: string; action: string }> = {
  happy: {
    title: "Sustain Your High Energy",
    text: "Wonderful mood today! Channel this positivity into a workout, connect with friends, or complete a rewarding project.",
    action: "Log 30-min Activity",
  },
  neutral: {
    title: "Gentle Mindful Reset",
    text: "You are at a peaceful baseline. Take a 5-minute break away from screens, enjoy a glass of water, and stretch.",
    action: "Take 5-min Hydration Break",
  },
  stressed: {
    title: "Decompress & Unwind",
    text: "Elevated stress detected. We recommend running our 3-minute Guided Box Breathing exercise below to regulate your heart rate.",
    action: "Start Box Breathing",
  },
  sad: {
    title: "Gentle Self-Care Support",
    text: "It is okay to feel low. Be kind to yourself today, listen to calming music, or reach out to a trusted emergency contact.",
    action: "Call Emergency Contact",
  },
};

export default function DashboardWellbeingPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType>("happy");
  const [journalNote, setJournalNote] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Guided Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [phase, setPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [seconds, setSeconds] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  const activeSuggestion = MOOD_SUGGESTIONS[selectedMood];
  const activeMoodInfo = MOOD_OPTIONS.find((m) => m.id === selectedMood)!;

  // Box Breathing Timer logic (4s Inhale -> 4s Hold -> 4s Exhale)
  useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setSeconds((prevSec) => {
        if (prevSec > 1) return prevSec - 1;

        // Switch phase when seconds reach 0
        if (phase === "Inhale") {
          setPhase("Hold");
          return 4;
        } else if (phase === "Hold") {
          setPhase("Exhale");
          return 4;
        } else {
          setPhase("Inhale");
          setCycleCount((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, phase]);

  function handleSaveCheckin() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "zivan-mood-checkin",
        JSON.stringify({
          mood: selectedMood,
          note: journalNote,
          timestamp: new Date().toISOString(),
        }),
      );
    }
    setSavedMessage("Your daily mood check-in has been recorded.");
    setTimeout(() => setSavedMessage(null), 3000);
  }

  function resetBreathing() {
    setBreathingActive(false);
    setPhase("Inhale");
    setSeconds(4);
    setCycleCount(0);
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
          <Brain className="h-3.5 w-3.5" aria-hidden />
          Mental Health & Emotional Wellness
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Mental Wellbeing & Relaxation
        </h1>
        <p className="mt-1 text-sm text-muted">
          Daily mood check-ins, stress level analytics, and guided breathing exercises.
        </p>
      </div>

      {/* Mood Check-In & Stress Level Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Mood Check-In Card */}
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Daily Mood Check-In</h2>
            <span className="text-xs font-semibold text-muted">How are you feeling right now?</span>
          </div>

          {/* 4 Mood Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MOOD_OPTIONS.map((item) => {
              const selected = selectedMood === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMood(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all",
                    selected
                      ? `${item.color} shadow-md scale-[1.02]`
                      : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100",
                  )}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="mt-2 text-sm font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Optional Journaling Note */}
          <div className="mt-6">
            <label htmlFor="mood-note" className="block text-xs font-bold uppercase tracking-wider text-muted">
              Optional Mood Notes & Reflections
            </label>
            <textarea
              id="mood-note"
              rows={3}
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              placeholder="What factors contributed to your mood today? Write your thoughts..."
              className="mt-2 w-full rounded-2xl border border-border bg-[#fbfefd] p-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button onClick={handleSaveCheckin}>
              Save Mood Check-In
            </Button>
            {savedMessage && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {savedMessage}
              </span>
            )}
          </div>
        </section>

        {/* Stress & Wellbeing Level Gauge Card */}
        <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white to-[#f7faf9] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Stress & Balance Indicator</h2>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <p className="mt-1 text-xs text-muted">Real-time estimation based on mood check-in</p>

            <div className="mt-6 rounded-2xl border border-border/80 bg-white p-5 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Stress Index</p>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
                {activeMoodInfo.stressScore}%
              </p>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    activeMoodInfo.stressScore <= 25 && "bg-emerald-500",
                    activeMoodInfo.stressScore > 25 && activeMoodInfo.stressScore <= 50 && "bg-sky-500",
                    activeMoodInfo.stressScore > 50 && "bg-amber-500",
                  )}
                  style={{ width: `${activeMoodInfo.stressScore}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-600">
                {activeMoodInfo.stressScore <= 30 ? "Optimal Low Stress" : activeMoodInfo.stressScore <= 60 ? "Moderate Tension" : "Elevated Stress"}
              </p>
            </div>
          </div>

          {/* Personalized Wellness Suggestion */}
          <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/80 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4" /> Personalized Suggestion
            </p>
            <h3 className="mt-1 font-bold text-sm text-teal-950">{activeSuggestion.title}</h3>
            <p className="mt-1 text-xs text-teal-800/90 leading-relaxed">{activeSuggestion.text}</p>
          </div>
        </section>
      </div>

      {/* Guided Breathing / Relaxation Tool */}
      <section className="overflow-hidden rounded-[2.25rem] border border-teal-900/20 bg-gradient-to-br from-[#0f2420] via-[#15342d] to-[#0b1b18] p-6 text-white shadow-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1 text-xs font-semibold text-teal-200">
              <Wind className="h-4 w-4 text-teal-300" aria-hidden />
              Guided Box Breathing Activity
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
              3-Minute Relaxation & Stress Reset
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-teal-100/80">
              Box breathing helps calm your nervous system, reduce heart rate, and regain emotional clarity. Follow the expanding rhythm.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {!breathingActive ? (
                <Button onClick={() => setBreathingActive(true)} size="lg" className="bg-teal-400 text-teal-950 hover:bg-teal-300">
                  <Play className="h-5 w-5 fill-current" /> Start Breathing Exercise
                </Button>
              ) : (
                <Button onClick={() => setBreathingActive(false)} variant="secondary" size="lg" className="border-white/20 bg-white/10 text-white">
                  <Pause className="h-5 w-5" /> Pause
                </Button>
              )}
              <Button onClick={resetBreathing} variant="ghost" className="text-teal-200 hover:bg-white/10">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-6 text-xs text-teal-200/70">
              <span>Rhythm: 4s Inhale · 4s Hold · 4s Exhale</span>
              <span>Cycles completed: <strong className="text-teal-200">{cycleCount}</strong></span>
            </div>
          </div>

          {/* Animated Breathing Circle Display */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-teal-400/20 bg-teal-950/40 shadow-[0_0_50px_rgba(20,184,166,0.15)]">
              {/* Pulsing Ring */}
              <div
                className={cn(
                  "absolute rounded-full border-4 border-teal-400/60 bg-teal-400/10 transition-all duration-1000",
                  breathingActive && phase === "Inhale" && "h-44 w-44 scale-110 border-teal-300 bg-teal-400/25",
                  breathingActive && phase === "Hold" && "h-44 w-44 scale-110 border-amber-300 bg-amber-400/25",
                  breathingActive && phase === "Exhale" && "h-28 w-28 scale-90 border-teal-500 bg-teal-500/10",
                  !breathingActive && "h-36 w-36 border-teal-400/40",
                )}
              />
              <div className="relative z-10 text-center">
                <span className="block font-display text-4xl font-bold text-white">{seconds}s</span>
                <span className="mt-1 block text-sm font-bold uppercase tracking-widest text-teal-300">
                  {breathingActive ? phase : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
