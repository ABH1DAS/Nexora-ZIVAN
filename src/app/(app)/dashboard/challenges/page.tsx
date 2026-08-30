"use client";

import { badges, leaderboard } from "@/data/challenges";
import { useUserData } from "@/lib/userDataStore";
import { formatNumber } from "@/lib/utils";
import { Droplets, Flame, Footprints, Moon, Trophy } from "lucide-react";

const badgeIcons = {
  walk: Footprints,
  water: Droplets,
  sleep: Moon,
  habit: Flame,
};

export default function DashboardChallengesPage() {
  const { metrics, challenges, isNewUser } = useUserData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Challenges &amp; Streaks
        </h1>
        <p className="mt-2 text-sm text-muted">
          Positive, wellness-focused motivation with streaks, health goals, and badges.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Current streak</p>
          <p className="mt-2 font-display text-3xl font-bold">
            🔥 {metrics.streakDays} days
          </p>
          {isNewUser && (
            <p className="mt-1 text-xs text-teal-600 font-semibold">
              Log your daily water or workout to start your day 1 streak!
            </p>
          )}
        </div>
        <div className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Total Wellness Points</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {formatNumber(metrics.points)} XP
          </p>
          <p className="mt-1 text-xs text-muted">
            Earned from completed health activities &amp; challenges
          </p>
        </div>
      </div>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-xl font-semibold">Active Challenges</h2>
          </div>
          <span className="text-xs font-bold text-primary">Live Progress</span>
        </div>

        <ul className="space-y-5">
          {challenges.map((challenge) => {
            const pct = Math.min(
              Math.round((challenge.progress / Math.max(challenge.totalTarget, 1)) * 100),
              100
            );
            return (
              <li key={challenge.id} className="rounded-2xl border border-border/70 p-4">
                <div className="mb-2 flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{challenge.title}</p>
                    <p className="text-xs text-muted">{challenge.description || challenge.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {challenge.progress}/{challenge.totalTarget} {challenge.unit}
                    </p>
                    <span className="text-[11px] font-bold text-amber-600">+{challenge.pointsReward} XP</span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
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
              const unlocked = metrics.points >= 100 || !isNewUser;
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl border p-4 text-center transition ${
                    unlocked
                      ? "border-teal-200 bg-[#fbfefd]"
                      : "border-border bg-slate-50 opacity-60"
                  }`}
                >
                  <Icon className="mx-auto mb-2 h-5 w-5 text-primary" aria-hidden />
                  <p className="text-sm font-semibold">{badge.name}</p>
                  <p className="text-[10px] text-muted mt-0.5">{unlocked ? "Unlocked" : "100+ XP required"}</p>
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
                    ? "flex justify-between rounded-2xl bg-teal-400/15 px-4 py-3 text-sm border border-teal-400/30 font-bold"
                    : "flex justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm"
                }
              >
                <span>
                  #{entry.rank} {entry.isYou ? `${entry.name} (You)` : entry.name}
                </span>
                <span className="font-mono text-teal-300">
                  {entry.isYou ? formatNumber(metrics.points) : formatNumber(entry.points)} XP
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
