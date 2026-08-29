export interface Challenge {
  id: string;
  title: string;
  progress: number;
  total: number;
  unit: string;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: "walk" | "water" | "sleep" | "habit";
  earned: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isYou?: boolean;
}

export const gamification = {
  streak: 12,
  points: 2840,
};

export const challenges: Challenge[] = [
  {
    id: "walk-7",
    title: "7-Day Walking Challenge",
    progress: 6,
    total: 7,
    unit: "days",
    category: "Fitness",
  },
  {
    id: "hydrate",
    title: "Hydration Streak",
    progress: 4,
    total: 5,
    unit: "days",
    category: "Habits",
  },
  {
    id: "mindful",
    title: "Mindful Mornings",
    progress: 3,
    total: 7,
    unit: "days",
    category: "Wellbeing",
  },
];

export const badges: Badge[] = [
  { id: "walk", name: "Walking Streak", icon: "walk", earned: true },
  { id: "water", name: "Hydration Hero", icon: "water", earned: true },
  { id: "sleep", name: "Sleep Champion", icon: "sleep", earned: true },
  { id: "habit", name: "Habit Builder", icon: "habit", earned: true },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Maya K.", points: 4120 },
  { rank: 2, name: "Rohan S.", points: 3890 },
  { rank: 3, name: "You", points: 2840, isYou: true },
  { rank: 4, name: "Priya N.", points: 2710 },
  { rank: 5, name: "Arjun P.", points: 2550 },
];
