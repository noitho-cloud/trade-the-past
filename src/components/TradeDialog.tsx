"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "./ToastProvider";

interface TradeDialogProps {
  asset: string;
  direction: "up" | "down" | "neutral";
  symbol: string;
  onClose: () => void;
}

export function TradeDialog({ asset, direction, symbol, onClose }: TradeDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("100");
  const [isDemo, setIsDemo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRealWarning, setShowRealWarning] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const MIN_AMOUNT = 1;
  const MAX_AMOUNT = 50_000;
  const isBuy = direction !== "down";
  const numAmount = Number(amount);
  const amountError =
    amount && numAmount < MIN_AMOUNT
      ? `Minimum amount is $${MIN_AMOUNT}`
      : amount && numAmount > MAX_AMOUNT
        ? `Maximum amount is $${MAX_AMOUNT.toLocaleString()}`
        : "";
  const isAmountValid = !!amount && numAmount >= MIN_AMOUNT && numAmount <= MAX_AMOUNT;

  useEffect(() => {
    dialogRef.current?.showModal();
    amountRef.current?.focus();
  }, []);

  async function handleTrade() {
    if (!isDemo && !showRealWarning) {
      setShowRealWarning(true);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/etoro/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          isBuy,
          amount: Number(amount),
          isDemo,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? `Trade failed (${res.status})`, "error");
      } else {
        toast(
          `${isDemo ? "Demo" : "Real"} ${isBuy ? "buy" : "sell"} of $${amount} ${asset} executed`,
          "success"
        );
        onClose();
      }
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
      toast(isTimeout ? "Trade timed out — please try again" : "Network error — trade not executed", "error");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
      setShowRealWarning(false);
    }
  }

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) handleClose(); }}
      className="fixed inset-0 z-50 m-auto w-[calc(100%-32px)] max-w-sm rounded-2xl bg-card border border-[var(--card-border)] shadow-xl p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Confirm Trade</h2>
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

        <div className="rounded-xl bg-[var(--gray-bg)] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{asset}</span>
            {direction === "neutral" ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-muted bg-[var(--gray-bg)] border border-[var(--border)]">
                Market Order
              </span>
            ) : (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isBuy
                  ? "text-[var(--etoro-green)] bg-[var(--success-bg)]"
                  : "text-[var(--red)] bg-[var(--error-bg)]"
              }`}>
                {isBuy ? "Buy (Bullish)" : "Sell (Bearish)"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted">
            {direction === "neutral"
              ? "No historical pattern data available. Trade based on your own analysis."
              : `Based on historical patterns, this asset tends to move ${direction} after similar events.`}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="trade-amount" className="text-sm font-medium">
            Amount (USD)
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted etoro-nums pointer-events-none select-none"
            >
              $
            </span>
            <input
              ref={amountRef}
              id="trade-amount"
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full h-10 pl-7 pr-3 rounded-lg border bg-background text-sm etoro-nums
                         focus:outline-none focus:ring-2 focus:border-transparent
                         ${amountError
                           ? "border-[var(--red)] focus:ring-[var(--red)]"
                           : "border-[var(--border)] focus:ring-[var(--etoro-green)]"}`}
            />
          </div>
          {amountError && (
            <p className="text-xs text-[var(--red)] mt-1">{amountError}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mode</span>
          <button
            type="button"
            onClick={() => { setIsDemo(!isDemo); setShowRealWarning(false); }}
            className={`relative inline-flex h-7 w-[100px] items-center rounded-full transition-colors cursor-pointer ${
              isDemo ? "bg-[var(--etoro-green)]" : "bg-[var(--red)]"
            }`}
          >
            <span className={`absolute left-2 text-[10px] font-semibold text-white/70 ${isDemo ? "" : "opacity-0"}`}>
              DEMO
            </span>
            <span className={`absolute right-2 text-[10px] font-semibold text-white/70 ${isDemo ? "opacity-0" : ""}`}>
              REAL
            </span>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isDemo ? "translate-x-1" : "translate-x-[76px]"
            }`} />
          </button>
        </div>

        {showRealWarning && (
          <div className="rounded-xl bg-[var(--error-bg)] border border-[var(--red)]/20 p-3">
            <p className="text-xs text-[var(--red)] font-medium">
              You are about to execute a real trade with real money. This action cannot be undone. Click &quot;Execute Trade&quot; again to confirm.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-11 rounded-full border border-[var(--border)] text-sm font-medium
                       hover:bg-[var(--gray-bg)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleTrade}
            disabled={isSubmitting || !isAmountValid}
            className={`flex-1 h-11 rounded-full text-white text-sm font-semibold transition-all cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                        active:scale-[0.98] ${
                          isDemo
                            ? "bg-[var(--etoro-green)] hover:bg-[var(--etoro-green-hover)]"
                            : "bg-[var(--red)] hover:bg-[var(--red-hover)]"
                        }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Executing...
              </span>
            ) : showRealWarning ? (
              "Confirm Real Trade"
            ) : (
              "Execute Trade"
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
