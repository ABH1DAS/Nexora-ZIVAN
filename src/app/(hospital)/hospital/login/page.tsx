"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { HOSPITAL_ACCOUNTS } from "@/data/ambulanceRequests";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  icon: Icon,
  rightSlot,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  icon: React.ElementType;
  rightSlot?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-[#0b1f2a] outline-none transition",
            "placeholder:text-slate-400",
            "focus:border-[#0b1f2a] focus:bg-white focus:ring-2 focus:ring-[#0b1f2a]/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            rightSlot && "pr-11",
          )}
          required
        />
        {rightSlot && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HospitalLoginPage() {
  const { account, loading, login } = useHospitalAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && account) {
      router.replace("/hospital");
    }
  }, [loading, account, router]);

  // Auto-verify hospital domain on email blur
  function checkVerification(value: string) {
    const isKnown = HOSPITAL_ACCOUNTS.some(
      (a) => a.email === value.trim().toLowerCase(),
    );
    setVerified(isKnown);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setSubmitting(true);

    // Simulate network latency for realism
    await new Promise((res) => setTimeout(res, 600));

    const result = await login(email.trim().toLowerCase(), password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/hospital");
  }

  function fillDemo(acc: (typeof HOSPITAL_ACCOUNTS)[number]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setVerified(true);
    setError(null);
  }

  if (loading) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f6f8]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b1f2a]">
            <Building2 className="h-4 w-4 text-white" aria-hidden />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-[#0b1f2a]">
            ZIVAN
          </span>
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 transition hover:text-[#0b1f2a]"
        >
          ← Patient site
        </Link>
      </header>

      {/* Main login card */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Icon + heading */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0b1f2a]">
                <ShieldCheck className="h-6 w-6 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Hospital Portal
                </p>
                <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-[#0b1f2a]">
                  Staff Sign In
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Access the dispatch &amp; patient management console.
                </p>
              </div>
            </div>

            {/* Hospital verification indicator */}
            {verified && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                Hospital account verified
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <InputField
                id="hospital-email"
                label="Work Email / Hospital ID"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  checkVerification(v);
                }}
                autoComplete="username"
                icon={Mail}
                placeholder="dispatch@hospital.demo"
                disabled={submitting}
              />

              <InputField
                id="hospital-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                icon={Lock}
                placeholder="••••••••"
                disabled={submitting}
                rightSlot={
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                }
              />

              {/* Remember me + forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#0b1f2a]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Contact your hospital administrator to reset your password.",
                    )
                  }
                  className="text-sm font-semibold text-[#0b1f2a] transition hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !email || !password}
                className={cn(
                  "relative mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200",
                  "bg-[#0b1f2a] text-white",
                  "hover:bg-[#162f3f] active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1f2a] focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Hospital Portal"
                )}
              </button>
            </form>
          </div>

          {/* Demo credentials panel */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Demo Accounts
            </p>
            <div className="space-y-2">
              {HOSPITAL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-[#0b1f2a]/30 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0b1f2a]">
                      {acc.hospitalName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{acc.email}</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Use
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Password for all demo accounts: <code className="font-mono font-bold text-slate-600">hospital123</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
