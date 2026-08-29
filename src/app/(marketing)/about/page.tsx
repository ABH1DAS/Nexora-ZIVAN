import { HealthJourney } from "@/components/HealthJourney";
import { StickyEmergencyCta } from "@/components/StickyEmergencyCta";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about ZIVAN — a health and wellbeing ecosystem for tracking, improving habits and emergency readiness.",
};

export default function AboutPage() {
  return (
    <main className="bg-atmosphere">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          About
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          ZIVAN — Your Health. Your Journey.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          ZIVAN is an all-in-one health and wellbeing ecosystem that helps people
          track, analyze, improve, challenge and reward healthier living — while
          staying connected to help when seconds matter.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              id: "contact",
              title: "Contact",
              body: "hello@zivan.health — demo contact address for this website.",
            },
            {
              id: "careers",
              title: "Careers",
              body: "We're building thoughtfully. Career openings will appear here.",
            },
            {
              id: "help",
              title: "Help Center",
              body: "Guides and FAQs will live here as the product launches.",
            },
            {
              id: "privacy",
              title: "Privacy",
              body: "Your health belongs to you. Review the privacy section on the homepage.",
            },
            {
              id: "terms",
              title: "Terms",
              body: "Product terms and disclaimers will be published before public launch.",
            },
          ].map((item) => (
            <section
              key={item.id}
              id={item.id}
              className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm"
            >
              <h2 className="font-display text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Explore the{" "}
          <Link href="/" className="font-semibold text-primary underline-offset-2 hover:underline">
            full product journey
          </Link>{" "}
          or open the{" "}
          <Link
            href="/emergency"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            emergency demo
          </Link>
          .
        </p>
      </div>
      <HealthJourney />
      <StickyEmergencyCta />
    </main>
  );
}
