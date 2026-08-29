"use client";

import { Button } from "@/components/ui/Button";
import { HOSPITAL_ACCOUNTS } from "@/data/ambulanceRequests";
import {
  getHospitalSession,
  loginHospitalStaff,
} from "@/lib/ambulanceStore";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function HospitalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(HOSPITAL_ACCOUNTS[0].email);
  const [password, setPassword] = useState(HOSPITAL_ACCOUNTS[0].password);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getHospitalSession()) {
      router.replace("/hospital");
    }
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = loginHospitalStaff(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/hospital");
  }

  return (
    <div className="mx-auto max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        Hospital access
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Dispatch sign in
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Accept incoming ZIVAN ambulance assistance requests for your facility.
        Demo credentials only.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="hospital-email" className="mb-1.5 block text-sm font-semibold">
            Work email
          </label>
          <input
            id="hospital-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>
        <div>
          <label htmlFor="hospital-password" className="mb-1.5 block text-sm font-semibold">
            Password
          </label>
          <input
            id="hospital-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? "Signing in..." : "Enter dispatch console"}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Demo accounts</p>
        <ul className="mt-2 space-y-1">
          {HOSPITAL_ACCOUNTS.map((account) => (
            <li key={account.id}>
              {account.hospitalName}: {account.email} / {account.password}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
