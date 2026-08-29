export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  items: string[];
  icon: "heart" | "brain" | "droplet" | "footprints" | "bot" | "trophy";
}

export const features: FeatureCard[] = [
  {
    id: "monitoring",
    title: "Health Monitoring",
    description: "Keep everyday vitals and activity in one calm view.",
    items: ["Heart rate", "SpO₂", "Steps", "Calories", "Activity", "Sleep"],
    icon: "heart",
  },
  {
    id: "mental",
    title: "Mental Wellbeing",
    description: "Private tools for mood, stress and mindful moments.",
    items: [
      "Mood check-ins",
      "Stress tracking",
      "Breathing exercises",
      "Meditation",
      "Private journal",
    ],
    icon: "brain",
  },
  {
    id: "habits",
    title: "Healthy Habits",
    description: "Build routines that stick without feeling pressured.",
    items: [
      "Hydration",
      "Sleep goals",
      "Exercise",
      "Medication reminders",
      "Wellness challenges",
    ],
    icon: "droplet",
  },
  {
    id: "fitness",
    title: "Fitness",
    description: "Track movement and progress at your own pace.",
    items: ["Walking", "Running", "Exercise goals", "Progress tracking"],
    icon: "footprints",
  },
  {
    id: "ai",
    title: "AI Health Assistant",
    description: "Understand trends and get general wellbeing guidance.",
    items: ["Trend explanations", "Habit suggestions", "Sleep insights"],
    icon: "bot",
  },
  {
    id: "rewards",
    title: "Challenges & Rewards",
    description: "Earn points for maintaining healthy habits.",
    items: ["Daily streaks", "Wellness challenges", "Badges", "Reward points"],
    icon: "trophy",
  },
];

export const testimonials = [
  {
    id: "1",
    quote:
      "ZIVAN makes my daily health information feel simple instead of overwhelming.",
    name: "Ananya R.",
    role: "Product designer",
  },
  {
    id: "2",
    quote:
      "I love that emergency contacts and my health profile are ready if I ever need them.",
    name: "Kabir M.",
    role: "Teacher",
  },
  {
    id: "3",
    quote:
      "The challenges keep me consistent without making health feel like a contest.",
    name: "Neha S.",
    role: "Software engineer",
  },
];

export const journeySteps = [
  {
    id: "track",
    title: "TRACK",
    description: "Collect daily health and activity information.",
  },
  {
    id: "analyze",
    title: "ANALYZE",
    description: "Understand patterns and trends.",
  },
  {
    id: "improve",
    title: "IMPROVE",
    description: "Receive personalized wellness suggestions.",
  },
  {
    id: "challenge",
    title: "CHALLENGE",
    description: "Build consistency through challenges.",
  },
  {
    id: "reward",
    title: "REWARD",
    description: "Earn points, badges and rewards.",
  },
];
