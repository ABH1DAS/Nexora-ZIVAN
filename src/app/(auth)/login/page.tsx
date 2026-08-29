"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("abhi@zivan.health");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [loading, next, router, user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(next);
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-border bg-white/90 p-7 shadow-[0_24px_60px_rgba(15,61,53,0.1)] backdrop-blur sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Sign in to ZIVAN
      </h1>
      <p className="mt-2 text-sm text-muted">
        Demo authentication — any valid email and password (4+ characters) works.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-[#fbfefd] px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-[#fbfefd] px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-emergency-soft px-3 py-2 text-sm text-emergency-dark" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to ZIVAN?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-white p-8 text-center text-sm text-muted">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
