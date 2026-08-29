export type TimeRange = "day" | "week" | "month";
export type AnalyticsRange = "7d" | "30d" | "6m";
export type Trend = "improving" | "stable" | "attention";

export interface HealthMetrics {
  steps: number;
  stepsGoal: number;
  heartRate: number;
  spo2: number;
  sleepHours: number;
  sleepMinutes: number;
  waterLiters: number;
  waterGoal: number;
  activityMinutes: number;
  calories: number;
  wellbeingScore: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export const userProfile = {
  name: "Abhi",
  greeting: "Good morning",
};

export const todayMetrics: HealthMetrics = {
  steps: 7842,
  stepsGoal: 8000,
  heartRate: 74,
  spo2: 98,
  sleepHours: 7,
  sleepMinutes: 32,
  waterLiters: 1.7,
  waterGoal: 2,
  activityMinutes: 48,
  calories: 1840,
  wellbeingScore: 86,
};

export const activityByRange: Record<TimeRange, ChartPoint[]> = {
  day: [
    { label: "6a", value: 12 },
    { label: "9a", value: 28 },
    { label: "12p", value: 45 },
    { label: "3p", value: 62 },
    { label: "6p", value: 80 },
    { label: "9p", value: 48 },
  ],
  week: [
    { label: "Mon", value: 62 },
    { label: "Tue", value: 74 },
    { label: "Wed", value: 58 },
    { label: "Thu", value: 81 },
    { label: "Fri", value: 69 },
    { label: "Sat", value: 88 },
    { label: "Sun", value: 76 },
  ],
  month: [
    { label: "W1", value: 68 },
    { label: "W2", value: 72 },
    { label: "W3", value: 79 },
    { label: "W4", value: 84 },
  ],
};

export const analyticsSeries: Record<
  AnalyticsRange,
  {
    activity: ChartPoint[];
    sleep: ChartPoint[];
    hydration: ChartPoint[];
    mood: ChartPoint[];
    exercise: ChartPoint[];
    wellbeing: ChartPoint[];
  }
> = {
  "7d": {
    activity: [
      { label: "Mon", value: 62 },
      { label: "Tue", value: 74 },
      { label: "Wed", value: 58 },
      { label: "Thu", value: 81 },
      { label: "Fri", value: 69 },
      { label: "Sat", value: 88 },
      { label: "Sun", value: 76 },
    ],
    sleep: [
      { label: "Mon", value: 7.1 },
      { label: "Tue", value: 6.4 },
      { label: "Wed", value: 7.5 },
      { label: "Thu", value: 6.8 },
      { label: "Fri", value: 7.2 },
      { label: "Sat", value: 8.1 },
      { label: "Sun", value: 7.5 },
    ],
    hydration: [
      { label: "Mon", value: 1.8 },
      { label: "Tue", value: 2.0 },
      { label: "Wed", value: 1.5 },
      { label: "Thu", value: 1.9 },
      { label: "Fri", value: 2.1 },
      { label: "Sat", value: 1.7 },
      { label: "Sun", value: 1.7 },
    ],
    mood: [
      { label: "Mon", value: 4 },
      { label: "Tue", value: 3 },
      { label: "Wed", value: 4 },
      { label: "Thu", value: 3 },
      { label: "Fri", value: 4 },
      { label: "Sat", value: 5 },
      { label: "Sun", value: 4 },
    ],
    exercise: [
      { label: "Mon", value: 35 },
      { label: "Tue", value: 48 },
      { label: "Wed", value: 20 },
      { label: "Thu", value: 55 },
      { label: "Fri", value: 40 },
      { label: "Sat", value: 70 },
      { label: "Sun", value: 48 },
    ],
    wellbeing: [
      { label: "Mon", value: 78 },
      { label: "Tue", value: 80 },
      { label: "Wed", value: 76 },
      { label: "Thu", value: 82 },
      { label: "Fri", value: 84 },
      { label: "Sat", value: 88 },
      { label: "Sun", value: 86 },
    ],
  },
  "30d": {
    activity: [
      { label: "W1", value: 64 },
      { label: "W2", value: 70 },
      { label: "W3", value: 75 },
      { label: "W4", value: 79 },
    ],
    sleep: [
      { label: "W1", value: 6.9 },
      { label: "W2", value: 7.1 },
      { label: "W3", value: 7.0 },
      { label: "W4", value: 7.4 },
    ],
    hydration: [
      { label: "W1", value: 1.6 },
      { label: "W2", value: 1.8 },
      { label: "W3", value: 1.9 },
      { label: "W4", value: 1.8 },
    ],
    mood: [
      { label: "W1", value: 3.5 },
      { label: "W2", value: 3.8 },
      { label: "W3", value: 4.0 },
      { label: "W4", value: 4.2 },
    ],
    exercise: [
      { label: "W1", value: 180 },
      { label: "W2", value: 210 },
      { label: "W3", value: 240 },
      { label: "W4", value: 265 },
    ],
    wellbeing: [
      { label: "W1", value: 76 },
      { label: "W2", value: 80 },
      { label: "W3", value: 83 },
      { label: "W4", value: 86 },
    ],
  },
  "6m": {
    activity: [
      { label: "Mar", value: 58 },
      { label: "Apr", value: 63 },
      { label: "May", value: 68 },
      { label: "Jun", value: 72 },
      { label: "Jul", value: 77 },
      { label: "Aug", value: 81 },
    ],
    sleep: [
      { label: "Mar", value: 6.6 },
      { label: "Apr", value: 6.8 },
      { label: "May", value: 7.0 },
      { label: "Jun", value: 7.1 },
      { label: "Jul", value: 7.2 },
      { label: "Aug", value: 7.3 },
    ],
    hydration: [
      { label: "Mar", value: 1.5 },
      { label: "Apr", value: 1.6 },
      { label: "May", value: 1.7 },
      { label: "Jun", value: 1.8 },
      { label: "Jul", value: 1.8 },
      { label: "Aug", value: 1.9 },
    ],
    mood: [
      { label: "Mar", value: 3.2 },
      { label: "Apr", value: 3.5 },
      { label: "May", value: 3.7 },
      { label: "Jun", value: 3.9 },
      { label: "Jul", value: 4.1 },
      { label: "Aug", value: 4.2 },
    ],
    exercise: [
      { label: "Mar", value: 620 },
      { label: "Apr", value: 710 },
      { label: "May", value: 780 },
      { label: "Jun", value: 840 },
      { label: "Jul", value: 900 },
      { label: "Aug", value: 940 },
    ],
    wellbeing: [
      { label: "Mar", value: 70 },
      { label: "Apr", value: 74 },
      { label: "May", value: 77 },
      { label: "Jun", value: 80 },
      { label: "Jul", value: 83 },
      { label: "Aug", value: 86 },
    ],
  },
};

export const analyticsTrends: Record<
  string,
  { label: string; trend: Trend; note: string }
> = {
  activity: { label: "Activity", trend: "improving", note: "Steady weekly gains" },
  sleep: { label: "Sleep", trend: "attention", note: "Slightly below your average" },
  hydration: { label: "Hydration", trend: "stable", note: "Close to daily goals" },
  mood: { label: "Mood", trend: "improving", note: "More positive check-ins" },
  exercise: { label: "Exercise", trend: "improving", note: "Consistency is rising" },
  wellbeing: { label: "Wellbeing Score", trend: "improving", note: "Up over recent weeks" },
};

export const emergencyProfile = {
  bloodGroup: "O+",
  allergies: ["Penicillin"],
  medications: ["None currently"],
  notes: "Asthma inhaler in bag",
};
