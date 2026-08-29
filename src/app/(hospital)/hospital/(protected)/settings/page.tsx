"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  ChevronRight,
  Lock,
  Mail,
  Moon,
  Phone,
  Save,
  Shield,
  Smartphone,
  Sun,
  Volume2,
} from "lucide-react";

type SettingsTab = "profile" | "notifications" | "security" | "display";

const tabs: { value: SettingsTab; label: string; icon: React.ElementType }[] = [
  { value: "profile", label: "Profile", icon: Building2 },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: Shield },
  { value: "display", label: "Display", icon: Sun },
];

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function InputRow({ label, value, type = "text", onChange, icon: Icon }: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" aria-hidden />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 w-full rounded-2xl border-0 bg-white pr-4 text-sm text-foreground shadow-[0_4px_14px_rgba(15,61,53,0.06)] outline-none placeholder:text-muted",
            "focus:ring-2 focus:ring-primary/20 transition-all",
            Icon ? "pl-10" : "pl-4",
          )}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { account } = useHospitalAuth();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile state
  const [contactName, setContactName] = useState(account?.contactName ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [phone, setPhone] = useState("+91 98XXX XXXXX");

  // Notification prefs
  const [notifSOS, setNotifSOS] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifSound, setNotifSound] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlert, setSessionAlert] = useState(true);

  // Display
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDarkMode(localStorage.getItem("zivan-hospital-dark") === "true");
      setCompactView(localStorage.getItem("zivan-hospital-compact") === "true");
    }
  }, []);

  const handleToggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("zivan-hospital-dark", val ? "true" : "false");
      window.dispatchEvent(new Event("zivan-hospital-display-updated"));
    }
  };

  const handleToggleCompactView = (val: boolean) => {
    setCompactView(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("zivan-hospital-compact", val ? "true" : "false");
      window.dispatchEvent(new Event("zivan-hospital-display-updated"));
    }
  };

  function handleSave() {
    if (typeof window !== "undefined") {
      localStorage.setItem("zivan-hospital-dark", darkMode ? "true" : "false");
      localStorage.setItem("zivan-hospital-compact", compactView ? "true" : "false");
      window.dispatchEvent(new Event("zivan-hospital-display-updated"));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Tab nav */}
      <nav className="flex shrink-0 flex-row gap-1 lg:w-52 lg:flex-col">
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              tab === value
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:bg-primary-soft hover:text-primary hover:shadow-2xs",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:block">{label}</span>
            {tab !== value && (
              <ChevronRight className="ml-auto hidden h-3.5 w-3.5 text-muted/60 lg:block" aria-hidden />
            )}
          </button>
        ))}
      </nav>

      {/* Panel */}
      <div className="min-w-0 flex-1 rounded-[2rem] border-0 bg-[#eef6f4] p-6 sm:p-8 shadow-[0_18px_48px_rgba(15,61,53,0.12)] hover:shadow-[0_24px_58px_rgba(13,143,122,0.18)] transition-all duration-300">
        {tab === "profile" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Hospital Profile
              </h2>
              <p className="mt-1 text-sm text-muted">
                Manage your facility and contact information.
              </p>
            </div>
            <div className="rounded-[1.25rem] border-0 bg-white px-4 py-3.5 text-sm text-muted shadow-[0_4px_16px_rgba(15,61,53,0.06)]">
              <strong className="text-foreground">Facility:</strong> {account?.hospitalName}
              <span className="ml-2 text-xs text-muted/70 font-mono">(ID: {account?.hospitalId})</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputRow label="Contact Name" value={contactName} onChange={setContactName} icon={Building2} />
              <InputRow label="Work Email" value={email} type="email" onChange={setEmail} icon={Mail} />
              <InputRow label="Phone" value={phone} type="tel" onChange={setPhone} icon={Phone} />
              <InputRow label="Mobile" value="+91 70XXX XXXXX" type="tel" onChange={() => {}} icon={Smartphone} />
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Notification Preferences
              </h2>
              <p className="mt-1 text-sm text-muted">
                Choose what events trigger alerts.
              </p>
            </div>
            <div className="divide-y divide-black/5 rounded-[1.25rem] border-0 bg-white px-4 shadow-[0_6px_20px_rgba(15,61,53,0.06)]">
              <Toggle label="SOS / Emergency Requests" description="New ambulance requests from patients" checked={notifSOS} onChange={setNotifSOS} />
              <Toggle label="Status Updates" description="Accepted, en route, arrived events" checked={notifStatus} onChange={setNotifStatus} />
              <Toggle label="Email Notifications" description="Send summaries to work email" checked={notifEmail} onChange={setNotifEmail} />
              <Toggle
                label="Sound Alerts"
                description="Play audio for critical requests"
                checked={notifSound}
                onChange={setNotifSound}
              />
            </div>
            <div className="flex items-center gap-2 rounded-[1.25rem] border-0 bg-white px-4 py-3 text-sm text-muted shadow-[0_4px_14px_rgba(15,61,53,0.06)]">
              <Volume2 className="h-4 w-4 text-primary" aria-hidden />
              Push notification support requires backend integration.
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Security</h2>
              <p className="mt-1 text-sm text-muted">
                Account security and access controls.
              </p>
            </div>
            <div className="divide-y divide-black/5 rounded-[1.25rem] border-0 bg-white px-4 shadow-[0_6px_20px_rgba(15,61,53,0.06)]">
              <Toggle label="Two-Factor Authentication" description="Require OTP on every sign-in" checked={twoFactor} onChange={setTwoFactor} />
              <Toggle label="Session Activity Alerts" description="Alert when a new login occurs" checked={sessionAlert} onChange={setSessionAlert} />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Change Password</p>
              <div className="space-y-3">
                <InputRow label="Current Password" value="" type="password" onChange={() => {}} icon={Lock} />
                <InputRow label="New Password" value="" type="password" onChange={() => {}} icon={Lock} />
                <InputRow label="Confirm New Password" value="" type="password" onChange={() => {}} icon={Lock} />
              </div>
            </div>
          </div>
        )}

        {tab === "display" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Display</h2>
              <p className="mt-1 text-sm text-muted">
                Appearance and layout preferences.
              </p>
            </div>
            <div className="divide-y divide-black/5 rounded-[1.25rem] border-0 bg-white px-4 shadow-[0_6px_20px_rgba(15,61,53,0.06)]">
              <Toggle
                label="Dark Mode"
                description="Use dark theme for the hospital portal"
                checked={darkMode}
                onChange={handleToggleDarkMode}
              />
              <Toggle
                label="Compact View"
                description="Reduce padding for denser information display"
                checked={compactView}
                onChange={handleToggleCompactView}
              />
            </div>
            <div className="flex items-center gap-2 rounded-[1.25rem] border-0 bg-emerald-100/70 px-4 py-3 text-sm text-emerald-900 shadow-[0_4px_16px_rgba(5,150,105,0.1)]">
              <Sun className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
              <span>
                Theme preferences are active and saved directly to your browser session.
              </span>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-5">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" aria-hidden />
            Save Changes
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-in fade-in duration-200">
              <ChevronRight className="h-4 w-4" aria-hidden />
              Saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
