"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthContextValue {
  isLoggedIn: boolean;
  userId: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  userId: null,
  isLoading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) throw new Error("Session check failed");
        const data = await res.json();
        if (!cancelled) {
          setIsLoggedIn(data.authenticated);
          setUserId(data.userId ?? null);
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setUserId(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsLoggedIn(false);
      setUserId(null);
    }
  }, []);

  return (
    <AuthContext value={{ isLoggedIn, userId, isLoading, logout }}>
      {children}
    </AuthContext>
  );
}
