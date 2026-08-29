"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Activity,
  Bot,
  Brain,
  CheckSquare,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserRound,
  Watch,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AutoEmergencyMonitor } from "@/components/dashboard/AutoEmergencyMonitor";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/health", label: "Health Tracking", icon: Activity },
  { href: "/dashboard/wellbeing", label: "Mental Wellbeing", icon: Brain },
  { href: "/dashboard/habits", label: "Habits & Goals", icon: CheckSquare },
  { href: "/dashboard/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/dashboard/emergency", label: "SOS Emergency", icon: ShieldAlert },
  { href: "/dashboard/profile", label: "Health Profile", icon: UserRound },
  { href: "/dashboard/devices", label: "Devices", icon: Watch },
  { href: "/dashboard/challenges", label: "Challenges", icon: Trophy },
  { href: "/dashboard/rewards", label: "Rewards", icon: Gift },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-atmosphere text-sm text-muted">
        Loading your dashboard...
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Dashboard">
      {navItems.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-primary-soft hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-atmosphere">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white/80 p-5 backdrop-blur lg:flex">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight">
            ZIVAN
          </Link>
          <p className="mt-1 text-xs text-muted">Your health dashboard</p>
          <div className="mt-8 flex-1">{nav}</div>
          <div className="rounded-2xl border border-border bg-[#f7fbfa] p-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start px-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-white/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {user.plan} plan · Demo
                </p>
                <p className="font-display text-lg font-semibold sm:text-xl">
                  Hi, {user.name.split(" ")[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="emergency" href="/dashboard/emergency">
                SOS
              </Button>
              <Button size="sm" variant="secondary" href="/" className="hidden sm:inline-flex">
                Marketing site
              </Button>
            </div>
          </header>

          {open && (
            <div className="border-b border-border bg-white p-4 lg:hidden">
              {nav}
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </Button>
            </div>
          )}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
          <AutoEmergencyMonitor />
        </div>
      </div>
    </div>
  );
}
