import Link from "next/link";

export default function HospitalPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f3f6f8] text-foreground">
      <header className="border-b border-slate-200 bg-[#0b1f2a] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/hospital" className="font-display text-xl font-bold tracking-tight">
              ZIVAN Hospital Portal
            </Link>
            <p className="text-xs text-white/60">
              Ambulance request intake · Demo dispatch console
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            ZIVAN member site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
