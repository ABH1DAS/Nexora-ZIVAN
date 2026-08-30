"use client";

import { useAuth } from "@/lib/auth";
import { todayMetrics as defaultDemoMetrics, type HealthMetrics } from "@/data/healthData";
import { challenges as defaultDemoChallenges, gamification as defaultDemoGamification, type Challenge } from "@/data/challenges";
import {
  fetchCompleteUserData,
  fetchDailyMetrics,
  fetchWaterLogs,
  fetchHealthProfile,
  fetchEmergencyContacts,
  saveDailyMetrics,
  logWaterIntake,
  saveHealthProfile,
  addEmergencyContact,
  isSupabaseConfigured,
  type CompleteUserDataBundle,
  type SupabaseDailyMetrics,
  type SupabaseHealthProfile,
  type SupabaseEmergencyContact,
} from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export interface UserHealthMetrics {
  heartRate: number;
  restingHr: number;
  spo2: number;
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  caloriesBurned: number;
  sleepHours: number;
  sleepMinutes: number;
  sleepScore: number;
  waterLiters: number;
  waterGoal: number;
  wellbeingScore: number;
  streakDays: number;
  points: number;
}

export interface UserChallengeItem {
  id: string;
  title: string;
  category: string;
  totalTarget: number;
  progress: number;
  unit: string;
  description: string;
  badgeReward: string;
  pointsReward: number;
  completed: boolean;
}

const ZERO_METRICS: UserHealthMetrics = {
  heartRate: 0,
  restingHr: 0,
  spo2: 0,
  steps: 0,
  stepsGoal: 10000,
  activeMinutes: 0,
  caloriesBurned: 0,
  sleepHours: 0,
  sleepMinutes: 0,
  sleepScore: 0,
  waterLiters: 0,
  waterGoal: 3.0,
  wellbeingScore: 0,
  streakDays: 0,
  points: 0,
};

function getStorageKey(userId: string) {
  return `zivan_userdata_v2_${userId}`;
}

export function getUserStoredData(userId: string): {
  metrics: UserHealthMetrics;
  challenges: UserChallengeItem[];
  redeemedRewards: string[];
} {
  if (typeof window === "undefined") {
    return {
      metrics: userId === "demo-user" ? getDemoMetrics() : { ...ZERO_METRICS },
      challenges: getInitialChallenges(userId === "demo-user"),
      redeemedRewards: [],
    };
  }

  // If demo user and nothing stored, use demo baseline
  const isDemo = userId === "demo-user" || userId === "abhi@zivan.health";

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const initial = {
    metrics: isDemo ? getDemoMetrics() : { ...ZERO_METRICS },
    challenges: getInitialChallenges(isDemo),
    redeemedRewards: [],
  };

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(initial));
  } catch {}

  return initial;
}

function getDemoMetrics(): UserHealthMetrics {
  return {
    heartRate: defaultDemoMetrics.heartRate,
    restingHr: 68,
    spo2: defaultDemoMetrics.spo2,
    steps: defaultDemoMetrics.steps,
    stepsGoal: defaultDemoMetrics.stepsGoal,
    activeMinutes: defaultDemoMetrics.activityMinutes,
    caloriesBurned: defaultDemoMetrics.calories,
    sleepHours: defaultDemoMetrics.sleepHours,
    sleepMinutes: defaultDemoMetrics.sleepMinutes,
    sleepScore: 85,
    waterLiters: defaultDemoMetrics.waterLiters,
    waterGoal: defaultDemoMetrics.waterGoal,
    wellbeingScore: defaultDemoMetrics.wellbeingScore,
    streakDays: defaultDemoGamification.streak,
    points: defaultDemoGamification.points,
  };
}

function getInitialChallenges(isDemo: boolean): UserChallengeItem[] {
  return defaultDemoChallenges.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    totalTarget: c.total,
    progress: isDemo ? c.progress : 0,
    unit: c.unit,
    description: `${c.title} - ${c.total} ${c.unit} goal`,
    badgeReward: "Challenge Finisher",
    pointsReward: 150,
    completed: isDemo ? c.progress >= c.total : false,
  }));
}

export function saveUserStoredData(
  userId: string,
  data: {
    metrics: UserHealthMetrics;
    challenges: UserChallengeItem[];
    redeemedRewards: string[];
  }
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("zivan-userdata-updated", { detail: { userId, data } }));
  } catch (e) {
    console.warn("saveUserStoredData error:", e);
  }
}

/**
 * React Hook for seamless real-time syncing of user-scoped metrics & challenges
 */
export function useUserData() {
  const { user } = useAuth();
  const userId = user?.id || "demo-user";
  const isDemo = userId === "demo-user" || user?.email === "abhi@zivan.health";

  const [data, setData] = useState(() => getUserStoredData(userId));
  const [loading, setLoading] = useState(true);

  // Sync with Supabase on mount/auth change
  useEffect(() => {
    let active = true;
    const local = getUserStoredData(userId);
    setData(local);

    if (isSupabaseConfigured && !isDemo) {
      fetchCompleteUserData(userId).then((bundle) => {
        if (!active) return;
        if (bundle.dailyMetrics) {
          const m = bundle.dailyMetrics;
          const mergedMetrics: UserHealthMetrics = {
            ...local.metrics,
            heartRate: m.heart_rate || local.metrics.heartRate,
            restingHr: m.resting_hr || local.metrics.restingHr,
            spo2: m.spo2 || local.metrics.spo2,
            steps: m.steps ?? local.metrics.steps,
            stepsGoal: m.step_goal || local.metrics.stepsGoal,
            activeMinutes: m.active_minutes ?? local.metrics.activeMinutes,
            caloriesBurned: m.calories_burned ?? local.metrics.caloriesBurned,
            sleepHours: m.sleep_hours ?? local.metrics.sleepHours,
            sleepScore: m.sleep_score ?? local.metrics.sleepScore,
            waterLiters: m.water_liters ?? local.metrics.waterLiters,
            waterGoal: m.water_goal || local.metrics.waterGoal,
          };
          const next = { ...local, metrics: mergedMetrics };
          setData(next);
          saveUserStoredData(userId, next);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.userId === userId) {
        setData(custom.detail.data);
      } else {
        setData(getUserStoredData(userId));
      }
    };

    window.addEventListener("zivan-userdata-updated", handler);
    window.addEventListener("storage", handler);

    return () => {
      active = false;
      window.removeEventListener("zivan-userdata-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [userId, isDemo]);

  // Actions that persist to both Supabase and Local User Storage
  const logWater = useCallback(
    async (amountMl: number, note?: string) => {
      const current = getUserStoredData(userId);
      const addedLiters = Math.round((amountMl / 1000) * 10) / 10;
      const nextLiters = Math.min(Math.round((current.metrics.waterLiters + addedLiters) * 10) / 10, 5.0);
      const nextPoints = current.metrics.points + Math.round(amountMl / 50);

      const nextMetrics: UserHealthMetrics = {
        ...current.metrics,
        waterLiters: nextLiters,
        points: nextPoints,
        streakDays: Math.max(current.metrics.streakDays, 1),
      };

      const nextData = { ...current, metrics: nextMetrics };
      saveUserStoredData(userId, nextData);
      setData(nextData);

      if (isSupabaseConfigured) {
        await logWaterIntake(userId, amountMl, note);
        await saveDailyMetrics({
          patient_id: userId,
          water_liters: nextLiters,
        });
      }
    },
    [userId]
  );

  const logActivity = useCallback(
    async (minutes: number, calories: number, stepsAdded = 0) => {
      const current = getUserStoredData(userId);
      const nextMetrics: UserHealthMetrics = {
        ...current.metrics,
        activeMinutes: current.metrics.activeMinutes + minutes,
        caloriesBurned: current.metrics.caloriesBurned + calories,
        steps: current.metrics.steps + stepsAdded,
        points: current.metrics.points + Math.round(minutes * 2),
        streakDays: Math.max(current.metrics.streakDays, 1),
      };

      const nextData = { ...current, metrics: nextMetrics };
      saveUserStoredData(userId, nextData);
      setData(nextData);

      if (isSupabaseConfigured) {
        await saveDailyMetrics({
          patient_id: userId,
          active_minutes: nextMetrics.activeMinutes,
          calories_burned: nextMetrics.caloriesBurned,
          steps: nextMetrics.steps,
        });
      }
    },
    [userId]
  );

  const logSleep = useCallback(
    async (hours: number, minutes: number) => {
      const current = getUserStoredData(userId);
      const score = Math.min(Math.round((hours / 8.0) * 100), 100);
      const nextMetrics: UserHealthMetrics = {
        ...current.metrics,
        sleepHours: hours,
        sleepMinutes: minutes,
        sleepScore: score,
        points: current.metrics.points + 20,
        streakDays: Math.max(current.metrics.streakDays, 1),
      };

      const nextData = { ...current, metrics: nextMetrics };
      saveUserStoredData(userId, nextData);
      setData(nextData);

      if (isSupabaseConfigured) {
        await saveDailyMetrics({
          patient_id: userId,
          sleep_hours: hours + minutes / 60,
          sleep_score: score,
        });
      }
    },
    [userId]
  );

  const logMood = useCallback(
    (score: number) => {
      const current = getUserStoredData(userId);
      const nextMetrics: UserHealthMetrics = {
        ...current.metrics,
        wellbeingScore: score,
        points: current.metrics.points + 15,
        streakDays: Math.max(current.metrics.streakDays, 1),
      };
      const nextData = { ...current, metrics: nextMetrics };
      saveUserStoredData(userId, nextData);
      setData(nextData);
    },
    [userId]
  );

  const logVitals = useCallback(
    async (heartRate: number, spo2: number) => {
      const current = getUserStoredData(userId);
      const nextMetrics: UserHealthMetrics = {
        ...current.metrics,
        heartRate,
        spo2,
      };
      const nextData = { ...current, metrics: nextMetrics };
      saveUserStoredData(userId, nextData);
      setData(nextData);

      if (isSupabaseConfigured) {
        await saveDailyMetrics({
          patient_id: userId,
          heart_rate: heartRate,
          spo2,
        });
      }
    },
    [userId]
  );

  const updateChallengeProgress = useCallback(
    (challengeId: string, addedProgress: number) => {
      const current = getUserStoredData(userId);
      let earnedPoints = 0;

      const nextChallenges = current.challenges.map((c) => {
        if (c.id !== challengeId) return c;
        const newProgress = Math.min(c.progress + addedProgress, c.totalTarget);
        const wasCompleted = c.completed;
        const nowCompleted = newProgress >= c.totalTarget;
        if (!wasCompleted && nowCompleted) {
          earnedPoints += c.pointsReward;
        }
        return {
          ...c,
          progress: newProgress,
          completed: nowCompleted,
        };
      });

      const nextMetrics: UserHealthMetrics = {
        ...current.metrics,
        points: current.metrics.points + earnedPoints,
      };

      const nextData = {
        ...current,
        metrics: nextMetrics,
        challenges: nextChallenges,
      };

      saveUserStoredData(userId, nextData);
      setData(nextData);
    },
    [userId]
  );

  const redeemReward = useCallback(
    (rewardId: string, cost: number): boolean => {
      const current = getUserStoredData(userId);
      if (current.metrics.points < cost) {
        return false;
      }

      const nextData = {
        ...current,
        metrics: {
          ...current.metrics,
          points: current.metrics.points - cost,
        },
        redeemedRewards: [...current.redeemedRewards, rewardId],
      };

      saveUserStoredData(userId, nextData);
      setData(nextData);
      return true;
    },
    [userId]
  );

  return {
    metrics: data.metrics,
    challenges: data.challenges,
    redeemedRewards: data.redeemedRewards,
    loading,
    isNewUser: !isDemo && data.metrics.steps === 0 && data.metrics.waterLiters === 0,
    logWater,
    logActivity,
    logSleep,
    logMood,
    logVitals,
    updateChallengeProgress,
    redeemReward,
  };
}
