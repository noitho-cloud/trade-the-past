"use client";

import { useAuth } from "./AuthProvider";

export function LoginButton() {
  const { isConnected, isLoading, openConnectModal, disconnect } = useAuth();

  if (isLoading) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[var(--gray-border)] border-t-[var(--etoro-green)] rounded-full animate-spin" />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5" title="Connected to eToro">
          <div className="w-7 h-7 rounded-full bg-[var(--etoro-green)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-[var(--etoro-green)] hidden sm:inline">Connected</span>
        </div>
        <button
          onClick={disconnect}
          className="text-[11px] text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => openConnectModal()}
      className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold text-[var(--etoro-green)] border border-[var(--etoro-green)] rounded-full
                 hover:bg-[var(--etoro-green)] hover:text-white active:scale-[0.98] transition-all cursor-pointer
                 focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      <span className="hidden sm:inline">Connect eToro</span>
      <span className="sm:hidden">Connect</span>
    </button>
  );
}
