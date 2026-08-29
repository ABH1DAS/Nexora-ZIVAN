"use client";

import { Button } from "@/components/ui/Button";
import { hospitals } from "@/data/hospitals";
import { emergencyProfile, todayMetrics } from "@/data/healthData";
import { useAuth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

// ─── Persistence ─────────────────────────────────────────────────────────────

const PREFS_KEY = "zivan-profile-prefs";

interface ProfilePrefs {
  displayName: string;
  phone: string;
  preferredHospitalId: string;
  ambulanceAutoDispatch: boolean;
  ambulanceContactName: string;
  ambulanceContactPhone: string;
}

function readPrefs(fallbackName: string): ProfilePrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw) as ProfilePrefs;
  } catch {
    return {
      displayName: fallbackName,
      phone: "",
      preferredHospitalId: "",
      ambulanceAutoDispatch: false,
      ambulanceContactName: "",
      ambulanceContactPhone: "",
    };
  }
}

function writePrefs(prefs: ProfilePrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardProfilePage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<ProfilePrefs | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // Hydrate after mount so localStorage is available
  useEffect(() => {
    if (user) setPrefs(readPrefs(user.name));
  }, [user]);

  const update = useCallback(
    <K extends keyof ProfilePrefs>(key: K, value: ProfilePrefs[K]) => {
      setPrefs((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  const save = useCallback(
    (section: string) => {
      if (!prefs) return;
      writePrefs(prefs);
      setSaved(section);
      setTimeout(() => setSaved(null), 2500);
    },
    [prefs],
  );

  if (!user || !prefs) return null;

  const hospitalOptions = hospitals.filter((h) => h.type === "hospital");
  const selectedHospital = hospitals.find(
    (h) => h.id === prefs.preferredHospitalId,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Personal profile
        </h1>
        <p className="mt-2 text-sm text-muted">
          Manage your account details, emergency preferences, and service settings.
        </p>
      </div>

      {/* Top row: account overview + emergency health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft font-display text-xl font-bold text-primary">
              {(prefs.displayName || user.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                {prefs.displayName || user.name}
              </h2>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Plan</dt>
              <dd className="font-semibold">{user.plan}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Wellbeing score</dt>
              <dd className="font-semibold">{todayMetrics.wellbeingScore}/100</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Steps today</dt>
              <dd className="font-semibold">{formatNumber(todayMetrics.steps)}</dd>
            </div>
          </dl>
          <Button className="mt-6" variant="secondary" href="/dashboard/settings">
            Account settings
          </Button>
        </section>

        <section className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">
            Emergency health profile
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Blood group</dt>
              <dd className="font-semibold">{emergencyProfile.bloodGroup}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Allergies</dt>
              <dd className="font-semibold text-right">
                {emergencyProfile.allergies.join(", ")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Medications</dt>
              <dd className="font-semibold text-right">
                {emergencyProfile.medications.join(", ")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Notes</dt>
              <dd className="font-semibold text-right">{emergencyProfile.notes}</dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Edit personal details */}
      <SectionCard
        title="Edit personal details"
        description="Update the name and contact info shown across ZIVAN."
      >
        <div className="space-y-4">
          <Field label="Display name" id="displayName">
            <input
              id="displayName"
              type="text"
              className={inputCls}
              placeholder="Your name"
              value={prefs.displayName}
              onChange={(e) => update("displayName", e.target.value)}
            />
          </Field>
          <Field label="Phone number" id="phone">
            <input
              id="phone"
              type="tel"
              className={inputCls}
              placeholder="+91 98XXX XXXXX"
              value={prefs.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Email" id="email">
            <input
              id="email"
              type="email"
              className={inputCls}
              value={user.email}
              disabled
              aria-describedby="email-note"
            />
            <span id="email-note" className="text-xs text-muted">
              Email is tied to your account and cannot be changed here.
            </span>
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => save("personal")}>
            Save details
          </Button>
          {saved === "personal" && (
            <span className="text-sm font-medium text-success">Saved ✓</span>
          )}
        </div>
      </SectionCard>

      {/* Hospital preference */}
      <SectionCard
        title="Hospital preference"
        description="Choose your preferred hospital for emergency dispatch and notifications."
      >
        <div className="space-y-4">
          <Field label="Preferred hospital" id="preferredHospital">
            <select
              id="preferredHospital"
              className={inputCls}
              value={prefs.preferredHospitalId}
              onChange={(e) => update("preferredHospitalId", e.target.value)}
            >
              <option value="">No preference — use nearest available</option>
              {hospitalOptions.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} · {h.distanceKm} km · {h.address}
                </option>
              ))}
            </select>
          </Field>

          {selectedHospital && (
            <div className="rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm">
              <p className="font-semibold text-primary">{selectedHospital.name}</p>
              <p className="mt-0.5 text-muted">
                {selectedHospital.address} · {selectedHospital.distanceKm} km away
              </p>
              <span
                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  selectedHospital.open
                    ? "bg-success/10 text-success"
                    : "bg-emergency-soft text-emergency"
                }`}
              >
                {selectedHospital.open ? "Open now" : "Closed"}
              </span>
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => save("hospital")}>
            Save preference
          </Button>
          {saved === "hospital" && (
            <span className="text-sm font-medium text-success">Saved ✓</span>
          )}
        </div>
      </SectionCard>

      {/* Ambulance preference */}
      <SectionCard
        title="Ambulance preference"
        description="Configure how ZIVAN handles ambulance dispatch during an emergency SOS."
      >
        <div className="space-y-5">
          {/* Auto-dispatch toggle */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Auto-dispatch on SOS</p>
              <p className="mt-0.5 text-xs text-muted">
                Automatically request an ambulance when you trigger an SOS alert,
                without requiring manual confirmation.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.ambulanceAutoDispatch}
              onClick={() =>
                update("ambulanceAutoDispatch", !prefs.ambulanceAutoDispatch)
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                prefs.ambulanceAutoDispatch ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  prefs.ambulanceAutoDispatch ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <Field label="Emergency contact name" id="ambulanceContactName">
            <input
              id="ambulanceContactName"
              type="text"
              className={inputCls}
              placeholder="Full name of your emergency contact"
              value={prefs.ambulanceContactName}
              onChange={(e) => update("ambulanceContactName", e.target.value)}
            />
          </Field>
          <Field label="Emergency contact phone" id="ambulanceContactPhone">
            <input
              id="ambulanceContactPhone"
              type="tel"
              className={inputCls}
              placeholder="+91 98XXX XXXXX"
              value={prefs.ambulanceContactPhone}
              onChange={(e) => update("ambulanceContactPhone", e.target.value)}
            />
          </Field>

          <p className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-muted">
            🚑 Ambulance dispatch is demo-only and requires connected hospital
            integrations in production. Your preferences are saved locally and
            will be used to pre-fill emergency requests.
          </p>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => save("ambulance")}>
            Save preference
          </Button>
          {saved === "ambulance" && (
            <span className="text-sm font-medium text-success">Saved ✓</span>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
