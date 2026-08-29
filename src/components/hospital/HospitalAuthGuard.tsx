"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function HospitalAuthGuard({ children }: { children: ReactNode }) {
  const { account, loading } = useHospitalAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !account) {
      router.replace("/hospital/login");
    }
  }, [loading, account, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-atmosphere">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted">
            Verifying hospital credentials…
          </p>
        </div>
      </div>
    );
  }

  if (!account) {
    return null; // redirect in progress
  }

  return <>{children}</>;
}
