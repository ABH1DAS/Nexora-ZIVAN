"use client";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emergencyShare, setEmergencyShare] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted">
          Privacy and preference controls for your demo account.
        </p>
      </div>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold">Preferences</h2>
        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>
              <span className="block font-semibold">Wellness reminders</span>
              <span className="text-muted">Hydration, sleep and habit nudges</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={notifications}
              onChange={(e) => {
                setNotifications(e.target.checked);
                setSaved(false);
              }}
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm">
            <span>
              <span className="block font-semibold">Emergency sharing</span>
              <span className="text-muted">
                Allow authorized sharing during SOS
              </span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={emergencyShare}
              onChange={(e) => {
                setEmergencyShare(e.target.checked);
                setSaved(false);
              }}
            />
          </label>
        </div>
        <Button
          className="mt-6"
          onClick={() => {
            localStorage.setItem(
              "zivan-settings",
              JSON.stringify({ notifications, emergencyShare }),
            );
            setSaved(true);
          }}
        >
          Save preferences
        </Button>
        {saved && (
          <p className="mt-3 text-sm text-success" role="status">
            Preferences saved on this device.
          </p>
        )}
      </section>

      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <p className="mt-2 text-sm text-muted">
          Signed in as <strong>{user.email}</strong> ({user.plan} plan). Demo auth
          only — no cloud account backend is connected.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Sign out
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (
                window.confirm(
                  "Delete this demo account from this browser? This cannot be undone locally.",
                )
              ) {
                logout();
                localStorage.removeItem("zivan-settings");
                localStorage.removeItem("zivan-mood-checkin");
                router.push("/signup");
              }
            }}
          >
            Delete demo account
          </Button>
        </div>
      </section>
    </div>
  );
}
