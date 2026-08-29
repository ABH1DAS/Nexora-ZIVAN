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

const STORAGE_KEY = "zivan-auth-user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Plus" | "Family";
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  const persist = useCallback((next: AuthUser | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const normalized = normalizeEmail(email);
      if (!normalized || !password) {
        return { ok: false as const, error: "Enter email and password." };
      }
      if (!normalized.includes("@")) {
        return { ok: false as const, error: "Enter a valid email address." };
      }
      if (password.length < 4) {
        return { ok: false as const, error: "Password must be at least 4 characters." };
      }

      const existing = readStoredUser();
      const name =
        existing?.email === normalized
          ? existing.name
          : normalized.split("@")[0]?.replace(/[._]/g, " ") || "Member";

      persist({
        id: existing?.email === normalized ? existing.id : `user_${Date.now()}`,
        name: name
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" "),
        email: normalized,
        plan: existing?.email === normalized ? existing.plan : "Plus",
      });

      return { ok: true as const };
    },
    [persist],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedName = name.trim();
      const normalized = normalizeEmail(email);
      if (!trimmedName) {
        return { ok: false as const, error: "Enter your name." };
      }
      if (!normalized.includes("@")) {
        return { ok: false as const, error: "Enter a valid email address." };
      }
      if (password.length < 4) {
        return { ok: false as const, error: "Password must be at least 4 characters." };
      }

      persist({
        id: `user_${Date.now()}`,
        name: trimmedName,
        email: normalized,
        plan: "Free",
      });

      return { ok: true as const };
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
