"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(`eToro login was denied: ${errorParam}`);
        setStatus("error");
        return;
      }

      if (!code || !state) {
        setError("Missing authorization code or state parameter.");
        setStatus("error");
        return;
      }

      const storedState = sessionStorage.getItem("etoro_sso_state");
      const codeVerifier = sessionStorage.getItem("etoro_sso_code_verifier");

      if (!storedState || state !== storedState) {
        setError("State mismatch — possible CSRF attack. Please try logging in again.");
        setStatus("error");
        return;
      }

      if (!codeVerifier) {
        setError("Missing code verifier. Please try logging in again.");
        setStatus("error");
        return;
      }

      sessionStorage.removeItem("etoro_sso_state");
      sessionStorage.removeItem("etoro_sso_code_verifier");

      try {
        const res = await fetch("/api/auth/sso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, code_verifier: codeVerifier }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError((data as { error?: string }).error || "Login failed. Please try again.");
          setStatus("error");
          return;
        }

        setStatus("success");
        await refreshSession();
        setTimeout(() => router.push("/"), 1000);
      } catch {
        setError("Network error during login. Please try again.");
        setStatus("error");
      }
    }

    handleCallback();
  }, [searchParams, router, refreshSession]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm text-center space-y-4">
        {status === "processing" && (
          <>
            <div className="w-12 h-12 mx-auto border-2 border-[var(--gray-border)] border-t-[var(--etoro-green)] rounded-full animate-spin" />
            <p className="text-sm text-muted">Completing login with eToro...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--etoro-green)] flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-medium">Connected to eToro!</p>
            <p className="text-xs text-muted">Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--red)]/10 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--red)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p className="text-sm text-[var(--red)]">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center h-9 px-4 text-sm font-medium text-[var(--etoro-green)] border border-[var(--etoro-green)] rounded-full hover:bg-[var(--etoro-green)] hover:text-white transition-all cursor-pointer"
            >
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-[var(--gray-border)] border-t-[var(--etoro-green)] rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
