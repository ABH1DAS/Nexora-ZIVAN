"use client";

import Link from "next/link";
import { Siren } from "lucide-react";

export function StickyEmergencyCta() {
  return (
    <Link
      href="/emergency"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-emergency px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(217,53,74,0.4)] transition hover:bg-emergency-dark md:bottom-8 md:right-8"
      aria-label="Open emergency SOS demo"
    >
      <Siren className="h-4 w-4" aria-hidden />
      SOS
    </Link>
  );
}
