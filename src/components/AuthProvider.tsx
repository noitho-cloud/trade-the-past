"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface AuthContextValue {
  isConnected: boolean;
  isLoading: boolean;
  showConnectModal: boolean;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  connect: (apiKey: string, userKey: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isConnected: false,
  isLoading: true,
  showConnectModal: false,
  openConnectModal: () => {},
  closeConnectModal: () => {},
  connect: async () => false,
  disconnect: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) throw new Error("Session check failed");
        const data = await res.json();
        if (!cancelled) {
          setIsConnected(data.connected === true);
        }
      } catch {
        if (!cancelled) {
          setIsConnected(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  const connect = useCallback(async (apiKey: string, userKey: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/etoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, userKey }),
      });
      if (!res.ok) return false;
      setIsConnected(true);
      setShowConnectModal(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsConnected(false);
    }
  }, []);

  const openConnectModal = useCallback(() => setShowConnectModal(true), []);
  const closeConnectModal = useCallback(() => setShowConnectModal(false), []);

  return (
    <AuthContext value={{
      isConnected,
      isLoading,
      showConnectModal,
      openConnectModal,
      closeConnectModal,
      connect,
      disconnect,
    }}>
      {children}
    </AuthContext>
  );
}
