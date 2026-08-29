import { EmergencySection } from "@/components/EmergencySection";
import { HospitalFinder } from "@/components/HospitalFinder";
import { Privacy } from "@/components/Privacy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency",
  description:
    "Explore ZIVAN's emergency ecosystem: one-tap SOS, contacts, ambulance assistance and hospital finder demos.",
};

export default function EmergencyPage() {
  return (
    <main className="bg-atmosphere">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emergency">
          Emergency
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Help, when seconds matter.
        </h1>
        <p className="mt-4 max-w-2xl text-muted" id="contacts">
          Product demonstration of SOS, emergency contacts, ambulance assistance and
          hospital notification. In a real emergency, contact local emergency services
          immediately.
        </p>
      </div>
      <EmergencySection />
      <HospitalFinder />
      <Privacy />
    </main>
  );
}
