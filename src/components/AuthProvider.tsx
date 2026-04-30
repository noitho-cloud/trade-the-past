"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";

const ETORO_SSO_URL = "https://www.etoro.com/sso";

export interface ConnectResult {
  success: boolean;
  error?: string;
  warning?: string;
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface AuthContextValue {
  isConnected: boolean;
  isLoading: boolean;
  showConnectModal: boolean;
  openConnectModal: (pendingAction?: () => void) => void;
  closeConnectModal: () => void;
  connect: (apiKey: string, userKey: string) => Promise<ConnectResult>;
  disconnect: () => Promise<void>;
  ssoAvailable: boolean;
  loginWithSSO: () => Promise<void>;
  authMethod: "sso" | "apikey" | null;
}

const AuthContext = createContext<AuthContextValue>({
  isConnected: false,
  isLoading: true,
  showConnectModal: false,
  openConnectModal: () => {},
  closeConnectModal: () => {},
  connect: async () => ({ success: false }),
  disconnect: async () => {},
  ssoAvailable: false,
  loginWithSSO: async () => {},
  authMethod: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [ssoAvailable, setSsoAvailable] = useState(false);
  const [authMethod, setAuthMethod] = useState<"sso" | "apikey" | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session", { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) throw new Error("Session check failed");
        const data = (await res.json()) as {
          connected?: boolean;
          method?: string;
        };
        if (!cancelled) {
          const connected = data.connected === true;
          setIsConnected(connected);
          if (!connected) {
            setAuthMethod(null);
          } else if (data.method === "sso") {
            setAuthMethod("sso");
          } else if (data.method === "apikey") {
            setAuthMethod("apikey");
          } else {
            setAuthMethod("apikey");
          }
        }
      } catch {
        if (!cancelled) {
          setIsConnected(false);
          setAuthMethod(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadSsoConfig() {
      try {
        const res = await fetch("/api/auth/sso-config", { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) {
          if (!cancelled) setSsoAvailable(false);
          return;
        }
        const data = (await res.json()) as {
          available?: boolean;
          clientId?: string;
          redirectUri?: string;
        };
        const ok =
          data.available !== false &&
          typeof data.clientId === "string" &&
          data.clientId.length > 0 &&
          typeof data.redirectUri === "string" &&
          data.redirectUri.length > 0;
        if (!cancelled) setSsoAvailable(ok);
      } catch {
        if (!cancelled) setSsoAvailable(false);
      }
    }
    loadSsoConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithSSO = useCallback(async () => {
    const res = await fetch("/api/auth/sso-config", { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error("SSO is not available");
    const data = (await res.json()) as {
      available?: boolean;
      clientId?: string;
      redirectUri?: string;
    };
    if (
      data.available === false ||
      typeof data.clientId !== "string" ||
      !data.clientId ||
      typeof data.redirectUri !== "string" ||
      !data.redirectUri
    ) {
      throw new Error("SSO is not configured");
    }
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    sessionStorage.setItem("etoro_sso_state", state);
    sessionStorage.setItem("etoro_sso_code_verifier", codeVerifier);
    const url =
      `${ETORO_SSO_URL}?client_id=${encodeURIComponent(data.clientId)}` +
      `&redirect_uri=${encodeURIComponent(data.redirectUri)}` +
      `&response_type=code&scope=openid` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256`;
    window.location.assign(url);
  }, []);

  const connect = useCallback(async (apiKey: string, userKey: string): Promise<ConnectResult> => {
    try {
      const res = await fetch("/api/auth/etoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, userKey }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error ?? "Failed to connect" };
      }
      setIsConnected(true);
      setAuthMethod("apikey");
      setShowConnectModal(false);
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      if (action) action();
      return { success: true, warning: data.warning };
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
      return {
        success: false,
        error: isTimeout ? "Connection timed out — please try again" : "Network error — please try again",
      };
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsConnected(false);
      setAuthMethod(null);
    }
  }, []);

  const openConnectModal = useCallback((pendingAction?: () => void) => {
    pendingActionRef.current = pendingAction ?? null;
    setShowConnectModal(true);
  }, []);
  const closeConnectModal = useCallback(() => {
    pendingActionRef.current = null;
    setShowConnectModal(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConnected,
      isLoading,
      showConnectModal,
      openConnectModal,
      closeConnectModal,
      connect,
      disconnect,
      ssoAvailable,
      loginWithSSO,
      authMethod,
    }),
    [
      isConnected,
      isLoading,
      showConnectModal,
      openConnectModal,
      closeConnectModal,
      connect,
      disconnect,
      ssoAvailable,
      loginWithSSO,
      authMethod,
    ]
  );

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}
