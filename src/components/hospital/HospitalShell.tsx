"use client";

import { cn } from "@/lib/utils";
import { useHospitalAuth } from "@/lib/hospitalAuth";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Activity,
  Ambulance,
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

const navSections = [
  {
    label: "Operations",
    items: [
      { href: "/hospital", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/hospital/emergencies", label: "Emergencies", icon: ShieldAlert },
      { href: "/hospital/ambulances", label: "Ambulances", icon: Ambulance },
      { href: "/hospital/live-tracking", label: "Live Tracking", icon: MapPin },
      { href: "/hospital/incoming-patients", label: "Incoming Patients", icon: Activity },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/hospital/hospital-info", label: "Hospital", icon: Building2 },
      { href: "/hospital/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/hospital/history", label: "History", icon: History },
      { href: "/hospital/staff", label: "Staff", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/hospital/notifications", label: "Notifications", icon: Bell },
      { href: "/hospital/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact = false,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
        active
          ? "bg-white text-[#0b1f2a] shadow-sm"
          : "text-white/60 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-[#0b1f2a]" : "text-white/50 group-hover:text-white",
        )}
        aria-hidden
      />
      {label}
      {active && (
        <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#0b1f2a]/40" aria-hidden />
      )}
    </Link>
  );
}

function Sidebar({
  onClose,
  pathname,
  account,
  onLogout,
}: {
  onClose?: () => void;
  pathname: string;
  account: { hospitalName: string; contactName: string; email: string } | null;
  onLogout: () => void;
}) {
  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex h-full flex-col bg-[#0b1f2a]">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div>
          <Link
            href="/hospital"
            onClick={onClose}
            className="font-display text-xl font-bold tracking-tight text-white"
          >
            ZIVAN
          </Link>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-white/40">
            Hospital Portal
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Facility badge */}
      {account && (
        <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="truncate text-xs font-bold text-white">
            {account.hospitalName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-white/50">
            {account.contactName}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Hospital portal navigation">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  exact={item.exact}
                  active={isActive(item.href, item.exact)}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-4">
        {account && (
          <div className="mb-3">
            <p className="truncate text-sm font-semibold text-white">
              {account.contactName}
            </p>
            <p className="truncate text-xs text-white/50">{account.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/60 transition hover:bg-rose-500/15 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}

function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <Link
      href="/hospital/notifications"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <Bell className="h-4 w-4" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d9354a] px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

export function HospitalShell({
  children,
  notificationCount = 0,
}: {
  children: ReactNode;
  notificationCount?: number;
}) {
  const { account, logout } = useHospitalAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/hospital/login");
  }

  // Derive current page title from pathname
  function getPageTitle() {
    for (const section of navSections) {
      for (const item of section.items) {
        const match = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        if (match) return item.label;
      }
    }
    return "Hospital Portal";
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block xl:w-64">
          <Sidebar
            pathname={pathname}
            account={account}
            onLogout={handleLogout}
          />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 w-72 shadow-2xl">
              <Sidebar
                onClose={() => setMobileOpen(false)}
                pathname={pathname}
                account={account}
                onLogout={handleLogout}
              />
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>

              {/* Page title area */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {account?.hospitalName ?? "Hospital Portal"}
                </p>
                <p className="font-display text-lg font-semibold leading-tight text-[#0b1f2a] sm:text-xl">
                  {getPageTitle()}
                </p>
              </div>
            </div>

            {/* Header right */}
            <div className="flex items-center gap-2.5">
              <NotificationBell count={notificationCount} />

              {/* Profile chip */}
              {account && (
                <div className="hidden items-center gap-2.5 sm:flex">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1f2a] text-sm font-bold text-white">
                    {account.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-semibold text-[#0b1f2a] leading-tight">
                      {account.contactName}
                    </p>
                    <p className="text-xs text-slate-500">{account.hospitalName}</p>
                  </div>
                </div>
              )}

              {/* Quick patient portal link */}
              <Link
                href="/dashboard"
                className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
              >
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Patient Portal
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
