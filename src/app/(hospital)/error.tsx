"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function HospitalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hospital Portal Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b1f2a] p-6 text-white text-center">
      <div className="max-w-md w-full rounded-[2rem] bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-5">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Hospital Dashboard Recovery
        </h2>
        <p className="mt-2 text-sm text-white/70">
          The operational console encountered a recoverable display issue. All live patient dispatch telemetry remains safe.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Operational Console
          </Button>

          <Link
            href="/hospital"
            className="rounded-2xl border border-white/10 bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
