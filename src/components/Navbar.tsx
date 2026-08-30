"use client";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Building2, ExternalLink, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/health", label: "Health" },
  { href: "/wellbeing", label: "Wellbeing" },
  { href: "/#emergency", label: "Emergency" },
  { href: "/#features", label: "Features" },
  { href: "/rewards", label: "Rewards" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/80 bg-white/80 shadow-sm backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Logo size="sm" priority />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-primary-soft hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Hospital Portal Link Button */}
          <Link
            href="/hospital/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600/30 bg-teal-50/80 px-3.5 py-2 text-xs font-bold text-teal-950 transition hover:bg-teal-100 hover:border-teal-500 shadow-2xs hover:scale-105 active:scale-95"
            title="Access Hospital & Emergency Dispatch Portal"
          >
            <Building2 className="h-3.5 w-3.5 text-teal-700" />
            <span>Hospital Portal</span>
            <ExternalLink className="h-3 w-3 text-teal-600 opacity-60" />
          </Link>

          {!loading && user ? (
            <>
              <Button variant="ghost" size="sm" href="/dashboard">
                Dashboard
              </Button>
              <Button size="sm" href="/dashboard/profile">
                {user.name.split(" ")[0]}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" href="/login">
                Sign In
              </Button>
              <Button size="sm" href="/signup">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white/70 text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-border bg-white/95 backdrop-blur-xl lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-primary-soft"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Hospital Portal Link Button on Mobile */}
          <li className="mt-1">
            <Link
              href="/hospital/login"
              className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-950 hover:bg-teal-100"
              onClick={() => setOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-700" />
                Hospital Portal
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
            </Link>
          </li>

          <li className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
            {!loading && user ? (
              <>
                <Button variant="secondary" href="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Button>
                <Button href="/dashboard/profile" onClick={() => setOpen(false)}>
                  {user.name.split(" ")[0]}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" href="/login" onClick={() => setOpen(false)}>
                  Sign In
                </Button>
                <Button href="/signup" onClick={() => setOpen(false)}>
                  Get Started
                </Button>
              </>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
