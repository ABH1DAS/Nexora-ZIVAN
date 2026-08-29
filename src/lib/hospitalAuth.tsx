"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getHospitalSession,
  loginHospitalStaff,
  logoutHospitalStaff,
} from "@/lib/ambulanceStore";
import type { HospitalAccount } from "@/data/ambulanceRequests";

interface HospitalAuthContextValue {
  account: HospitalAccount | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const HospitalAuthContext = createContext<HospitalAuthContextValue | null>(null);

export function HospitalAuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<HospitalAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccount(getHospitalSession());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = loginHospitalStaff(email, password);
    if (result.ok) {
      setAccount(result.account);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutHospitalStaff();
    setAccount(null);
  }, []);

  const value = useMemo(
    () => ({ account, loading, login, logout }),
    [account, loading, login, logout],
  );

  return (
    <HospitalAuthContext.Provider value={value}>
      {children}
    </HospitalAuthContext.Provider>
  );
}

export function useHospitalAuth() {
  const ctx = useContext(HospitalAuthContext);
  if (!ctx) {
    throw new Error("useHospitalAuth must be used within HospitalAuthProvider");
  }
  return ctx;
}
