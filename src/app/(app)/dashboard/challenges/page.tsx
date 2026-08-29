"use client";

import { badges, challenges, gamification, leaderboard } from "@/data/challenges";
import { formatNumber } from "@/lib/utils";
import { Droplets, Flame, Footprints, Moon } from "lucide-react";

const badgeIcons = {
  walk: Footprints,
  water: Droplets,
  sleep: Moon,
  habit: Flame,
};

export default function DashboardChallengesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Challenges
        </h1>
        <p className="mt-2 text-sm text-muted">
          Positive, wellness-focused motivation with streaks and badges.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Current streak</p>
          <p className="mt-2 font-display text-3xl font-bold">
            🔥 {gamification.streak} days
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Points</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {formatNumber(gamification.points)} XP
          </p>
        </div>
      </div>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold">Active challenges</h2>
        <ul className="mt-5 space-y-5">
          {challenges.map((challenge) => {
            const pct = Math.round((challenge.progress / challenge.total) * 100);
            return (
              <li key={challenge.id}>
                <div className="mb-2 flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{challenge.title}</p>
                    <p className="text-xs text-muted">{challenge.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {challenge.progress}/{challenge.total} {challenge.unit}
                  </p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-primary-soft">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Badges</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {badges.map((badge) => {
              const Icon = badgeIcons[badge.icon];
              return (
                <div
                  key={badge.id}
                  className="rounded-2xl border border-border bg-[#fbfefd] p-4 text-center"
                >
                  <Icon className="mx-auto mb-2 h-5 w-5 text-primary" aria-hidden />
                  <p className="text-sm font-semibold">{badge.name}</p>
                </div>
              );
            })}
          </div>
        </section>
        <section className="rounded-[2rem] border border-border bg-[#0f2420] p-6 text-white shadow-sm">
          <h2 className="font-display text-xl font-semibold">Leaderboard</h2>
          <ol className="mt-4 space-y-3">
            {leaderboard.map((entry) => (
              <li
                key={entry.rank}
                className={
                  entry.isYou
                    ? "flex justify-between rounded-2xl bg-teal-400/15 px-4 py-3 text-sm"
                    : "flex justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm"
                }
              >
                <span>
                  #{entry.rank} {entry.name}
                </span>
                <span className="font-semibold">
                  {formatNumber(entry.points)} XP
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
