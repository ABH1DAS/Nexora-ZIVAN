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
  account: HospitalAccount;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  switchHospital: (hospitalId: string) => void;
}

const HospitalAuthContext = createContext<HospitalAuthContextValue | null>(null);

export function HospitalAuthProvider({ children }: { children: ReactNode }) {
  // Always initialize with active City Super-Specialty Hospital so /hospital is immediately active
  const [account, setAccount] = useState<HospitalAccount>(HOSPITAL_ACCOUNTS[1]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getHospitalSession();
    if (session) {
      setAccount(session);
    }
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
    setAccount(HOSPITAL_ACCOUNTS[1]);
  }, []);

  const switchHospital = useCallback((hospitalId: string) => {
    const found = HOSPITAL_ACCOUNTS.find((h) => h.hospitalId === hospitalId) ?? HOSPITAL_ACCOUNTS[1];
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
