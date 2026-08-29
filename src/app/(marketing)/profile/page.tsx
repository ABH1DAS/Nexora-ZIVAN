import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Sign in to manage your ZIVAN personal health profile and dashboard.",
};

export default function ProfileMarketingPage() {
  return (
    <main className="bg-atmosphere">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Account
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Your personal health profile lives in the dashboard.
        </h1>
        <p className="mt-4 text-muted">
          Sign in to access your health overview, wellbeing tools, emergency prep,
          challenges and rewards.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" href="/login">
            Sign In
          </Button>
          <Button size="lg" variant="secondary" href="/signup">
            Create Account
          </Button>
          <Button size="lg" variant="outline" href="/dashboard">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
