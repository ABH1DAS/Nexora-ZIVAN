"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1f2a] focus-visible:ring-offset-2",
          checked ? "bg-[#0b1f2a]" : "bg-slate-200",
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 pr-4 text-sm text-[#0b1f2a] shadow-xs outline-none placeholder:text-slate-400",
            "focus:border-[#0b1f2a] focus:bg-white focus:ring-2 focus:ring-[#0b1f2a]/10 hover:border-slate-300 transition-all",
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

  // Security prefs
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionAlert, setSessionAlert] = useState(true);

  // Display prefs
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  function handleSave() {
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
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
              tab === value
                ? "bg-[#0b1f2a] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100/90 hover:text-[#0b1f2a] hover:shadow-2xs",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:block">{label}</span>
            {tab !== value && (
              <ChevronRight className="ml-auto hidden h-3.5 w-3.5 text-slate-300 lg:block" aria-hidden />
            )}
          </button>
        ))}
      </nav>

      {/* Panel */}
      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.07)] transition-all duration-300">
        {tab === "profile" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#0b1f2a]">
                Hospital Profile
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage your facility and contact information.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-2xs">
              <strong className="text-[#0b1f2a]">Facility:</strong> {account?.hospitalName}
              <span className="ml-2 text-xs text-slate-400">(ID: {account?.hospitalId})</span>
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
              <h2 className="font-display text-lg font-semibold text-[#0b1f2a]">
                Notification Preferences
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Choose what events trigger alerts.
              </p>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 shadow-2xs">
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
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 shadow-2xs">
              <Volume2 className="h-4 w-4 text-slate-400" aria-hidden />
              Push notification support requires backend integration.
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#0b1f2a]">Security</h2>
              <p className="mt-1 text-sm text-slate-400">
                Account security and access controls.
              </p>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 shadow-2xs">
              <Toggle label="Two-Factor Authentication" description="Require OTP on every sign-in" checked={twoFactor} onChange={setTwoFactor} />
              <Toggle label="Session Activity Alerts" description="Alert when a new login occurs" checked={sessionAlert} onChange={setSessionAlert} />
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">Change Password</p>
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
              <h2 className="font-display text-lg font-semibold text-[#0b1f2a]">Display</h2>
              <p className="mt-1 text-sm text-slate-400">
                Appearance and layout preferences.
              </p>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 shadow-2xs">
              <Toggle
                label="Dark Mode"
                description="Use dark theme for the portal"
                checked={darkMode}
                onChange={setDarkMode}
              />
              <Toggle
                label="Compact View"
                description="Reduce padding for denser information display"
                checked={compactView}
                onChange={setCompactView}
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 shadow-2xs">
              <Sun className="h-4 w-4 shrink-0" aria-hidden />
              Dark mode and compact view are UI preference placeholders. Full theming is a Phase 2 feature.
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="hospital"
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
