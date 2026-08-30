"use client";

import { Button } from "@/components/ui/Button";
import { rewards } from "@/data/rewards";
import { useUserData } from "@/lib/userDataStore";
import { formatNumber } from "@/lib/utils";
import { CheckCircle2, Gift } from "lucide-react";
import { useState } from "react";

export default function DashboardRewardsPage() {
  const { metrics, redeemReward, redeemedRewards } = useUserData();
  const [message, setMessage] = useState<string | null>(null);

  function handleRedeem(rewardId: string, title: string, points: number) {
    const success = redeemReward(rewardId, points);
    if (success) {
      setMessage(`🎉 Successfully redeemed "${title}"! Code has been added to your profile.`);
    } else {
      setMessage(`⚠️ Not enough wellness points. Complete daily habits and challenges to earn XP!`);
    }
    setTimeout(() => setMessage(null), 4000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Rewards &amp; Wellness Perks
          </h1>
          <p className="mt-2 text-sm text-muted">
            Redeem points earned from daily healthy habits, water logging, and challenges.
          </p>
        </div>
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm shadow-sm font-semibold text-teal-950">
          Available balance:{" "}
          <span className="font-bold text-primary text-base">
            {formatNumber(metrics.points)} XP
          </span>
        </div>
      </div>

      {message && (
        <p className="rounded-2xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm font-semibold text-teal-900" role="status">
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => {
          const isRedeemed = redeemedRewards.includes(reward.id);
          const affordable = metrics.points >= reward.points;

          return (
            <article
              key={reward.id}
              className="flex flex-col rounded-[1.75rem] border border-border bg-white p-6 shadow-sm justify-between"
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Gift className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="font-display text-lg font-semibold">{reward.title}</h2>
                <p className="mt-2 text-sm text-muted">{reward.description}</p>
              </div>

              <div className="mt-5">
                <p className="text-sm font-bold text-primary">
                  {formatNumber(reward.points)} points
                </p>
                <Button
                  className="mt-3 w-full"
                  variant={isRedeemed ? "secondary" : affordable ? "primary" : "secondary"}
                  disabled={isRedeemed || !affordable}
                  onClick={() => handleRedeem(reward.id, reward.title, reward.points)}
                >
                  {isRedeemed ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Redeemed
                    </span>
                  ) : affordable ? (
                    "Redeem Perk"
                  ) : (
                    `Need ${formatNumber(reward.points - metrics.points)} more XP`
                  )}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
