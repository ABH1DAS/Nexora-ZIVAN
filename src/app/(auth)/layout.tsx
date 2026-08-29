import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-atmosphere">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground"
        >
          ZIVAN
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-muted transition hover:text-foreground"
        >
          Back to home
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        {children}
      </main>
    </div>
  );
}
