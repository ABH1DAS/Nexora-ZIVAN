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
import { HOSPITAL_ACCOUNTS, type HospitalAccount } from "@/data/ambulanceRequests";

interface HospitalAuthContextValue {
  account: HospitalAccount | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; account: HospitalAccount } | { ok: false; error: string }>;
  logout: () => void;
  switchHospital: (hospitalId: string) => void;
}

const HospitalAuthContext = createContext<HospitalAuthContextValue | null>(null);

export function HospitalAuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<HospitalAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getHospitalSession();
    setAccount(session);
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

  const switchHospital = useCallback((hospitalId: string) => {
    const found = HOSPITAL_ACCOUNTS.find((h) => h.hospitalId === hospitalId) ?? HOSPITAL_ACCOUNTS[0];
    setAccount(found);
    if (typeof window !== "undefined") {
      localStorage.setItem("zivan-hospital-session", JSON.stringify(found));
    }
  }, []);

  const value = useMemo(
    () => ({ account, loading, login, logout, switchHospital }),
    [account, loading, login, logout, switchHospital],
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
