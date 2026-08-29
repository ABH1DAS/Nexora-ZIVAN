export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

/** Configurable pricing — update this object to change plans site-wide. */
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Start tracking health and stay prepared.",
    features: [
      "Health dashboard",
      "Activity tracking",
      "Mood tracking",
      "Basic challenges",
      "Emergency contacts",
    ],
    cta: "Get Started",
  },
  {
    id: "plus",
    name: "Plus",
    price: "₹299",
    period: "month",
    description: "Deeper insights and personalized guidance.",
    features: [
      "Advanced analytics",
      "AI health assistant",
      "Personalized insights",
      "Advanced challenges",
      "Rewards access",
    ],
    highlighted: true,
    cta: "Start Plus",
  },
  {
    id: "family",
    name: "Family",
    price: "₹499",
    period: "month",
    description: "Wellness together with shared emergency readiness.",
    features: [
      "Family wellness",
      "Shared challenges",
      "Emergency contacts",
      "Family dashboard",
      "Everything in Plus",
    ],
    cta: "Start Family",
  },
];
