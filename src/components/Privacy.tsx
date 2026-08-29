"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { emergencyService } from "@/services/emergency";
import { Check, Circle, Lock, Shield, UserCog } from "lucide-react";

const pillars = [
  {
    title: "Secure authentication",
    description: "Sign-in designed to protect access to your account.",
    icon: Lock,
  },
  {
    title: "Protected health information",
    description: "Sensitive details are treated with careful access controls.",
    icon: Shield,
  },
  {
    title: "User-controlled sharing",
    description: "You decide what is shared, with whom, and when.",
    icon: UserCog,
  },
  {
    title: "Emergency sharing permissions",
    description: "Emergency access is permission-based and intentional.",
    icon: Shield,
  },
  {
    title: "Secure data storage",
    description: "Data is stored with industry-standard protections.",
    icon: Lock,
  },
  {
    title: "Privacy controls & deletion",
    description: "Manage preferences and request account deletion.",
    icon: UserCog,
  },
];

export function Privacy() {
  const offline = emergencyService.getOfflineCapabilities();

  return (
    <>
      <Section
        id="privacy"
        eyebrow="Trust"
        title="Your Health Belongs to You."
        description="ZIVAN is built around control, clarity and careful sharing — especially when emergency access matters."
      >
        <Reveal>
          <div className="mb-10 overflow-hidden rounded-[2rem] border border-border bg-white p-6 shadow-[0_20px_50px_rgba(15,61,53,0.06)] sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
              <div className="rounded-2xl bg-primary-soft px-5 py-4 font-display text-lg font-semibold text-primary">
                Your Data
              </div>
              <span className="text-2xl text-primary" aria-hidden>
                →
              </span>
              <div className="rounded-2xl bg-[#0f2420] px-5 py-4 font-display text-lg font-semibold text-white">
                Your Control
              </div>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-muted">
              We avoid unsupported security claims. Trust comes from clear permissions,
              transparent controls and responsible design.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="h-full rounded-[1.5rem] border border-border bg-white p-5 shadow-sm">
                <item.icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        id="offline"
        className="pt-0"
        eyebrow="Emergency-first"
        title="Offline Emergency Support"
        description="Some critical information stays available even with poor connectivity."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="rounded-[1.75rem] border border-border bg-white p-6">
              <h3 className="font-display text-xl font-semibold">Available Offline</h3>
              <ul className="mt-5 space-y-3">
                {offline.availableOffline.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-success" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="rounded-[1.75rem] border border-border bg-[#f7fbfa] p-6">
              <h3 className="font-display text-xl font-semibold">Requires Internet</h3>
              <ul className="mt-5 space-y-3">
                {offline.requiresInternet.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted">
                    <Circle className="h-3.5 w-3.5 text-muted" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
