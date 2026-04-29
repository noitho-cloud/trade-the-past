"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";

export function ConnectEtoroModal() {
  const { showConnectModal, closeConnectModal, connect } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [userKey, setUserKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warning, setWarning] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setApiKey("");
    setUserKey("");
    setError("");
    setWarning("");
    setIsSubmitting(false);
    closeConnectModal();
  }, [closeConnectModal]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showConnectModal) {
      dialog.showModal();
      apiKeyRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [showConnectModal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setWarning("");
    setIsSubmitting(true);

    const result = await connect(apiKey.trim(), userKey.trim());
    if (!result.success) {
      setError(result.error ?? "Failed to connect. Please check your keys and try again.");
    } else if (result.warning) {
      setWarning(result.warning);
    }
    setIsSubmitting(false);
  }

  if (!showConnectModal) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => { if (e.target === dialogRef.current) handleClose(); }}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-32px)] max-w-md rounded-2xl bg-card border border-[var(--card-border)] shadow-xl p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Connect to eToro</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--gray-bg)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-muted -mt-2">
          Trade directly from event analysis and manage your eToro watchlist.
        </p>

        <div className="rounded-xl bg-[var(--gray-bg)] p-4 space-y-2">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted">How to get your API keys</h3>
          <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
            <li>Log in to <a href="https://www.etoro.com" target="_blank" rel="noopener noreferrer" className="text-[var(--etoro-green)] hover:underline">eToro</a></li>
            <li>Go to Settings &gt; Trading</li>
            <li>Click &quot;Create New Key&quot;</li>
            <li>Choose environment (Virtual for demo trading)</li>
            <li>Copy your Public API Key and User Key</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="etoro-api-key" className="text-sm font-medium">
              Public API Key
            </label>
            <input
              ref={apiKeyRef}
              id="etoro-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Public API Key"
              required
              maxLength={200}
              autoComplete="off"
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-background text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--etoro-green)] focus:border-transparent
                         placeholder:text-muted/50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="etoro-user-key" className="text-sm font-medium">
              User Key
            </label>
            <input
              id="etoro-user-key"
              type="password"
              value={userKey}
              onChange={(e) => setUserKey(e.target.value)}
              placeholder="Enter your User Key"
              required
              maxLength={200}
              autoComplete="off"
              className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-background text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--etoro-green)] focus:border-transparent
                         placeholder:text-muted/50"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--red)]" role="alert">{error}</p>
          )}

          {warning && (
            <p className="text-sm text-[var(--amber)]" role="status">{warning}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !apiKey.trim() || !userKey.trim()}
            className="w-full h-11 rounded-full bg-[var(--etoro-green)] text-white font-semibold text-sm
                       hover:bg-[var(--etoro-green-hover)] active:scale-[0.98] transition-all cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                       focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              "Connect"
            )}
          </button>
        </form>

        <p className="text-[11px] text-muted/60 leading-relaxed text-center">
          Your keys are encrypted server-side and stored in a secure, HTTP-only cookie. They are never exposed to client-side code.
        </p>
      </div>
    </dialog>
  );
}
