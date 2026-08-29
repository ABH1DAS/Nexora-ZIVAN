"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-atmosphere p-6 text-center">
      <div className="max-w-md w-full rounded-[2rem] bg-white border border-border p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-5">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted">
          An unexpected error occurred while loading this page. You can try refreshing or returning to the home screen.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Link
            href="/"
            className="rounded-2xl border border-border bg-slate-50 py-3 text-sm font-semibold text-foreground transition hover:bg-slate-100"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
