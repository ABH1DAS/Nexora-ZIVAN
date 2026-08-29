import { AIHealthAssistant } from "@/components/AIHealthAssistant";
import { Analytics } from "@/components/Analytics";
import { Challenges } from "@/components/Challenges";
import { EmergencySection } from "@/components/EmergencySection";
import { FeatureCards } from "@/components/FeatureCards";
import { HealthDashboard } from "@/components/HealthDashboard";
import { HealthJourney } from "@/components/HealthJourney";
import { Hero } from "@/components/Hero";
import { HospitalFinder } from "@/components/HospitalFinder";
import { MentalWellbeing } from "@/components/MentalWellbeing";
import { Pricing } from "@/components/Pricing";
import { Privacy } from "@/components/Privacy";
import { Rewards } from "@/components/Rewards";
import { StickyEmergencyCta } from "@/components/StickyEmergencyCta";
import { Testimonials } from "@/components/Testimonials";

export default function HomePage() {
  return (
    <main className="bg-atmosphere">
      <Hero />
      <FeatureCards />
      <HealthDashboard />
      <EmergencySection />
      <MentalWellbeing />
      <AIHealthAssistant />
      <Analytics />
      <Challenges />
      <Rewards />
      <HealthJourney />
      <HospitalFinder />
      <Privacy />
      <Testimonials />
      <Pricing />
      <StickyEmergencyCta />
    </main>
  );
}
