export interface Reward {
  id: string;
  title: string;
  points: number;
  description: string;
  category: "coupon" | "discount" | "badge";
}

export const rewards: Reward[] = [
  {
    id: "wellness-200",
    title: "₹200 Wellness Coupon",
    points: 1500,
    description: "Demo partner offer for wellness products.",
    category: "coupon",
  },
  {
    id: "fitness-discount",
    title: "Fitness Store Discount",
    points: 2000,
    description: "Demo discount for selected fitness partners.",
    category: "discount",
  },
  {
    id: "premium-badge",
    title: "Premium Wellness Badge",
    points: 500,
    description: "Unlock a profile badge for consistent habits.",
    category: "badge",
  },
  {
    id: "meditation-pack",
    title: "Guided Meditation Pack",
    points: 800,
    description: "Demo content pack for mindful routines.",
    category: "coupon",
  },
];
