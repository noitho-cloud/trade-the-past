"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredState, getStoredCodeVerifier, clearAuthParams } from "@/lib/pkce";

type CallbackState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success" };

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({ status: "loading" });

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const returnedState = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setState({ status: "error", message: `eToro returned an error: ${error}` });
        return;
      }

      if (!code || !returnedState) {
        setState({ status: "error", message: "Missing authorization code or state parameter." });
        return;
      }

      const storedState = getStoredState();
      if (returnedState !== storedState) {
        setState({ status: "error", message: "State mismatch — possible CSRF attack. Please try again." });
        clearAuthParams();
        return;
      }

      const codeVerifier = getStoredCodeVerifier();
      if (!codeVerifier) {
        setState({ status: "error", message: "Missing code verifier. Please try logging in again." });
        clearAuthParams();
        return;
      }

      try {
        const res = await fetch("/api/auth/etoro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, code_verifier: codeVerifier }),
        });

        const data = await res.json();

        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Authentication failed." });
          return;
        }

        clearAuthParams();
        setState({ status: "success" });
        router.push("/");
      } catch {
        setState({ status: "error", message: "Network error during authentication." });
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        {state.status === "loading" && (
          <>
            <div className="w-10 h-10 border-3 border-[var(--gray-border)] border-t-[var(--etoro-green)] rounded-full animate-spin mx-auto" />
            <p className="text-muted text-sm">Completing login...</p>
          </>
        )}

        {state.status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--error-bg)] flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Login Failed</h2>
            <p className="text-sm text-muted">{state.message}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-semibold text-white bg-[var(--etoro-green)] rounded-full hover:bg-[var(--etoro-green-hover)] transition-colors"
            >
              Back to Home
            </Link>
          </>
        )}

        {state.status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--etoro-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Connected to eToro</h2>
            <p className="text-sm text-muted">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
