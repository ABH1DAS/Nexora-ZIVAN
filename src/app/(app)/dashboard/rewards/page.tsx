"use client";

import { Button } from "@/components/ui/Button";
import { gamification } from "@/data/challenges";
import { rewards } from "@/data/rewards";
import { formatNumber } from "@/lib/utils";
import { Gift } from "lucide-react";
import { useState } from "react";

export default function DashboardRewardsPage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Rewards
          </h1>
          <p className="mt-2 text-sm text-muted">
            Demo catalog — redeeming does not process real partner offers yet.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm shadow-sm">
          Available balance:{" "}
          <span className="font-bold text-primary">
            {formatNumber(gamification.points)} XP
          </span>
        </div>
      </div>

      {message && (
        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary-dark" role="status">
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => {
          const affordable = gamification.points >= reward.points;
          return (
            <article
              key={reward.id}
              className="flex flex-col rounded-[1.75rem] border border-border bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Gift className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="font-display text-lg font-semibold">{reward.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{reward.description}</p>
              <p className="mt-4 text-sm font-bold text-primary">
                {formatNumber(reward.points)} points
              </p>
              <Button
                className="mt-4 w-full"
                variant={affordable ? "primary" : "secondary"}
                disabled={!affordable}
                onClick={() =>
                  setMessage(
                    `Demo redeem requested for “${reward.title}”. No real reward was issued.`,
                  )
                }
              >
                {affordable ? "Redeem (demo)" : "Need more points"}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
