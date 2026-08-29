"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { badges, challenges, gamification, leaderboard } from "@/data/challenges";
import { formatNumber } from "@/lib/utils";
import { Droplets, Flame, Footprints, Moon, Star } from "lucide-react";

const badgeIcons = {
  walk: Footprints,
  water: Droplets,
  sleep: Moon,
  habit: Flame,
};

export function Challenges() {
  return (
    <Section
      id="challenges"
      eyebrow="Gamification"
      title="Make Healthy Habits Addictive."
      description="Positive, wellness-focused motivation — streaks, points, badges and friendly competition."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Reveal>
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-[#fff7ed] to-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-muted">Streak</p>
              <p className="mt-2 font-display text-4xl font-bold text-foreground">
                🔥 {gamification.streak} Days
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-[1.75rem] border border-border bg-gradient-to-br from-[#f0fdf8] to-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-muted">Points</p>
              <p className="mt-2 inline-flex items-center gap-2 font-display text-4xl font-bold">
                <Star className="h-8 w-8 text-amber-500" aria-hidden />
                {formatNumber(gamification.points)} XP
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_20px_50px_rgba(15,61,53,0.06)]">
            <h3 className="font-display text-xl font-semibold">Challenges</h3>
            <ul className="mt-5 space-y-4">
              {challenges.map((challenge) => {
                const pct = Math.round((challenge.progress / challenge.total) * 100);
                return (
                  <li key={challenge.id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{challenge.title}</p>
                        <p className="text-xs text-muted">{challenge.category}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        {challenge.progress} / {challenge.total} {challenge.unit}
                      </p>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-primary-soft"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${challenge.title} progress`}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="rounded-[2rem] border border-border bg-white p-6">
            <h3 className="font-display text-xl font-semibold">Badges</h3>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {badges.map((badge) => {
                const Icon = badgeIcons[badge.icon];
                return (
                  <div
                    key={badge.id}
                    className="rounded-2xl border border-border bg-[#fbfefd] p-4 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <p className="text-sm font-semibold">{badge.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="rounded-[2rem] border border-border bg-[#0f2420] p-6 text-white">
            <h3 className="font-display text-xl font-semibold">Leaderboard</h3>
            <p className="mt-1 text-sm text-white/55">Wellness-focused preview</p>
            <ol className="mt-5 space-y-3">
              {leaderboard.map((entry) => (
                <li
                  key={entry.rank}
                  className={
                    entry.isYou
                      ? "flex items-center justify-between rounded-2xl bg-teal-400/15 px-4 py-3"
                      : "flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                  }
                >
                  <span className="text-sm">
                    <span className="mr-3 font-bold text-white/45">#{entry.rank}</span>
                    {entry.name}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatNumber(entry.points)} XP
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
