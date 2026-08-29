"use client";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useHospitalAuth } from "@/lib/hospitalAuth";
import { HOSPITAL_ACCOUNTS } from "@/data/ambulanceRequests";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
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
    <div className="flex min-h-screen flex-col bg-atmosphere text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Logo size="sm" subtitle="Hospital Portal" priority />
        <Link
          href="/"
          className="text-sm font-semibold text-muted transition hover:text-primary"
        >
          ← Patient site
        </Link>
      </header>

      {/* Main login card */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <div className="w-full max-w-md">
          {/* Main Card Division */}
          <div className="rounded-[2rem] border border-border bg-white/90 backdrop-blur-md p-8 shadow-[0_20px_60px_rgba(13,143,122,0.16)] hover:shadow-[0_28px_70px_rgba(13,143,122,0.24)] transition-all duration-300">
            {/* Icon + heading */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-md shadow-primary/25">
                <ShieldCheck className="h-6 w-6 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Hospital Portal
                </p>
                <h1 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-foreground">
                  Staff Sign In
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Access the dispatch &amp; patient management console.
                </p>
              </div>
            </div>

            {/* Hospital verification indicator */}
            {verified && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-[0_6px_20px_rgba(5,150,105,0.15)] animate-in fade-in duration-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                Hospital account verified
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-[0_6px_20px_rgba(217,53,74,0.15)] animate-in fade-in duration-200"
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
                onChange={(v) => setPassword(v)}
                autoComplete="current-password"
                icon={Lock}
                placeholder="••••••••"
                disabled={submitting}
                rightSlot={
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:text-foreground"
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
              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary/20"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Password reset for demo accounts is disabled. Use hospital123.",
                    )
                  }
                  className="text-sm font-semibold text-primary transition hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || !email || !password}
                className="mt-2 w-full shadow-[0_8px_25px_rgba(13,143,122,0.35)] hover:shadow-[0_12px_32px_rgba(13,143,122,0.45)]"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Hospital Portal"
                )}
              </Button>
            </form>
          </div>

          {/* Demo credentials panel */}
          <div className="mt-5 rounded-[1.5rem] border border-border bg-white/80 backdrop-blur-sm p-6 shadow-[0_12px_36px_rgba(15,61,53,0.08)] hover:shadow-[0_18px_45px_rgba(13,143,122,0.14)] transition-all duration-300">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Demo Accounts
            </p>
            <div className="space-y-2.5">
              {HOSPITAL_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-left shadow-[0_4px_16px_rgba(15,61,53,0.04)] hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(13,143,122,0.16)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {acc.hospitalName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{acc.email}</p>
                  </div>
                  <span className="rounded-xl bg-primary-soft px-3 py-1 text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                    Use
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted">
              Password for all demo accounts: <code className="font-mono font-bold text-foreground">hospital123</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
