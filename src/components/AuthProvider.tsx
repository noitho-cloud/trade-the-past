"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";

export interface ConnectResult {
  success: boolean;
  error?: string;
  warning?: string;
}

interface AuthContextValue {
  isConnected: boolean;
  isLoading: boolean;
  showConnectModal: boolean;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  connect: (apiKey: string, userKey: string) => Promise<ConnectResult>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isConnected: false,
  isLoading: true,
  showConnectModal: false,
  openConnectModal: () => {},
  closeConnectModal: () => {},
  connect: async () => ({ success: false }),
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

  const connect = useCallback(async (apiKey: string, userKey: string): Promise<ConnectResult> => {
    try {
      const res = await fetch("/api/auth/etoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, userKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error ?? "Failed to connect" };
      }
      setIsConnected(true);
      setShowConnectModal(false);
      return { success: true, warning: data.warning };
    } catch {
      return { success: false, error: "Network error — please try again" };
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

  const value = useMemo<AuthContextValue>(
    () => ({
      isConnected,
      isLoading,
      showConnectModal,
      openConnectModal,
      closeConnectModal,
      connect,
      disconnect,
    }),
    [isConnected, isLoading, showConnectModal, openConnectModal, closeConnectModal, connect, disconnect]
  );

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}
