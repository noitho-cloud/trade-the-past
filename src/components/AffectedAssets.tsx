"use client";

import { useState, useRef } from "react";
import type { HistoricalMatch } from "@/lib/types";
import { getEtoroSymbol } from "@/lib/etoro-slugs";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";
import { TradeDialog } from "./TradeDialog";

interface ConsolidatedAsset {
  asset: string;
  direction: "up" | "down";
  day1Pct: number;
  week1Pct: number;
}

function consolidateAssets(matches: HistoricalMatch[]): ConsolidatedAsset[] {
  const assetMap = new Map<
    string,
    { day1Sum: number; week1Sum: number; count: number }
  >();

  for (const match of matches) {
    for (const r of match.reactions) {
      const existing = assetMap.get(r.asset);
      if (existing) {
        existing.day1Sum += r.day1Pct;
        existing.week1Sum += r.week1Pct;
        existing.count++;
      } else {
        assetMap.set(r.asset, {
          day1Sum: r.day1Pct,
          week1Sum: r.week1Pct,
          count: 1,
        });
      }
    }
  }

  return Array.from(assetMap.entries()).map(([asset, data]) => {
    const avgDay1 = Math.round((data.day1Sum / data.count) * 10) / 10;
    const avgWeek1 = Math.round((data.week1Sum / data.count) * 10) / 10;
    return {
      asset,
      direction: avgDay1 >= 0 ? "up" : "down",
      day1Pct: avgDay1,
      week1Pct: avgWeek1,
    };
  });
}

function DirectionBadge({ direction }: { direction: "up" | "down" }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--etoro-green)] bg-[var(--success-bg)] px-2 py-0.5 rounded-full">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9 6H1L5 1Z" fill="currentColor" />
        </svg>
        Bullish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--red)] bg-[var(--error-bg)] px-2 py-0.5 rounded-full">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 9L1 4H9L5 9Z" fill="currentColor" />
      </svg>
      Bearish
    </span>
  );
}

function PctDisplay({ value }: { value: number }) {
  const color = value >= 0 ? "text-[var(--etoro-green)]" : "text-[var(--red)]";
  const prefix = value > 0 ? "+" : "";
  return (
    <span className={`text-sm etoro-nums ${color}`}>
      {prefix}
      {value.toFixed(1)}%
    </span>
  );
}

export function WatchlistStar({ asset }: { asset: string }) {
  const { isConnected, openConnectModal } = useAuth();
  const { toast } = useToast();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);

  async function executeAdd() {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    try {
      const res = await fetch("/api/etoro/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: getEtoroSymbol(asset) }),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        setIsAdded(true);
        toast(`${asset} added to watchlist`, "success");
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Failed to add to watchlist", "error");
      }
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
      toast(isTimeout ? "Watchlist request timed out — please try again" : "Network error — could not update watchlist", "error");
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }

  function handleClick() {
    if (!isConnected) {
      openConnectModal(() => { executeAdd(); });
      return;
    }
    executeAdd();
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isAdded}
      aria-label={isAdded ? `${asset} added to watchlist` : `Add ${asset} to watchlist`}
      title={isAdded ? "Added to watchlist" : "Add to watchlist"}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full
                 transition-all cursor-pointer disabled:cursor-default
                 focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none
                 ${isAdded
                   ? "text-[var(--amber)] bg-[var(--amber)]/10"
                   : "text-muted hover:text-[var(--amber)] hover:bg-[var(--amber)]/10 active:scale-[0.92]"}`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isAdded ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
    </button>
  );
}

export function TradeButton({ asset, direction }: { asset: string; direction: "up" | "down" | "neutral" }) {
  const { isConnected, openConnectModal } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  function handleClick() {
    if (!isConnected) {
      openConnectModal(() => setShowDialog(true));
      return;
    }
    setShowDialog(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={`Trade ${asset} on eToro`}
        className="w-full inline-flex flex-col items-center justify-center bg-[var(--etoro-green)] text-white font-semibold h-[44px] px-6 rounded-[48px] whitespace-nowrap
                   hover:bg-[var(--etoro-green-hover)] active:scale-[0.98] transition-all text-center cursor-pointer
                   focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="text-[14px] leading-none">Trade</span>
        <span className="text-[10px] font-normal opacity-80 leading-none mt-0.5">on eToro</span>
      </button>
      {showDialog && (
        <TradeDialog
          asset={asset}
          direction={direction}
          symbol={getEtoroSymbol(asset)}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}

function AssetCard({ asset }: { asset: ConsolidatedAsset }) {
  return (
    <div className="rounded-[16px] bg-card border border-[var(--card-border)] p-[var(--space-xl)] flex flex-col gap-3 shadow-[var(--card-shadow)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-[15px] leading-snug">
            {asset.asset}
          </h3>
          <DirectionBadge direction={asset.direction} />
        </div>
        <WatchlistStar asset={asset.asset} />
      </div>

      <div className="flex gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted block">
            1 Day After
          </span>
          <PctDisplay value={asset.day1Pct} />
        </div>
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted block">
            1 Week After
          </span>
          <PctDisplay value={asset.week1Pct} />
        </div>
      </div>

      <div className="pt-1">
        <TradeButton asset={asset.asset} direction={asset.direction} />
      </div>
    </div>
  );
}

export function AffectedAssets({ matches }: { matches: HistoricalMatch[] }) {
  if (matches.length === 0) return null;

  const assets = consolidateAssets(matches);
  if (assets.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold whitespace-nowrap" style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>
          Affected Assets
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {assets.map((asset) => (
          <div key={asset.asset} className="w-full md:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]">
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>
    </section>
  );
}
