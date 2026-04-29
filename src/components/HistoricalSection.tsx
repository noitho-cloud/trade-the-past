"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { HistoricalMatch } from "@/lib/types";
import { extractAssetsFromText } from "@/lib/etoro-slugs";
import { UnifiedInsight } from "./UnifiedInsight";
import { AffectedAssets, WatchlistStar, TradeButton } from "./AffectedAssets";

interface HistoricalSectionProps {
  eventId: string;
  matches: HistoricalMatch[] | null;
  eventTitle?: string;
  eventSummary?: string;
}

export function HistoricalSkeleton() {
  return (
    <section className="space-y-6">
      <div className="rounded-[16px] bg-card shadow-[var(--card-shadow)] p-[var(--space-xl)] space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-muted/20 rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/15 rounded" />
          <div className="h-4 w-5/6 bg-muted/15 rounded" />
          <div className="h-4 w-4/6 bg-muted/15 rounded" />
        </div>
      </div>
      <div className="rounded-[16px] bg-card shadow-[var(--card-shadow)] p-[var(--space-xl)] space-y-4 animate-pulse">
        <div className="h-5 w-36 bg-muted/20 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-muted/10 rounded-xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HistoricalSection({
  eventId,
  matches: serverMatches,
  eventTitle = "",
  eventSummary = "",
}: HistoricalSectionProps) {
  const [retryMatches, setRetryMatches] = useState<HistoricalMatch[] | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [retryError, setRetryError] = useState(false);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  const matches = retryMatches ?? serverMatches;
  const showError = (serverMatches === null && !retryMatches && !retryLoading) || retryError;

  const fetchMatches = useCallback(() => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setRetryError(false);
    setRetryLoading(true);

    fetch(`/api/events/${eventId}`, { signal: AbortSignal.timeout(15000) })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const eventMatches: HistoricalMatch[] =
          data.event?.historicalMatches ?? [];
        setRetryMatches(eventMatches);
        setRetryLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setRetryError(true);
          setRetryLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [eventId]);

  if (retryLoading) {
    return <HistoricalSkeleton />;
  }

  if (showError) {
    return (
      <section
        data-testid="historical-error"
        className="rounded-[16px] border border-[var(--gray-border)] bg-[var(--error-bg)] px-[var(--space-xl)] py-8 text-center"
      >
        <p className="text-sm text-[var(--red)] font-medium mb-3">
          Could not load historical data
        </p>
        <p className="text-xs text-muted mb-4">
          Something went wrong while loading historical parallels. Please try again.
        </p>
        <button
          onClick={fetchMatches}
          className="text-sm font-semibold bg-[var(--etoro-green)] text-white px-5 py-2.5 rounded-[48px]
                     hover:bg-[var(--etoro-green-hover)] active:scale-[0.98] transition-all cursor-pointer
                     focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!matches || matches.length === 0) {
    const mentionedAssets = extractAssetsFromText(`${eventTitle} ${eventSummary}`);

    return (
      <section className="space-y-6">
        <div className="rounded-[16px] bg-card shadow-[var(--card-shadow)] px-[var(--space-xl)] py-8 text-center">
          <p className="text-sm text-muted">
            No historical parallels found yet. Analysis updates throughout the day.
          </p>
        </div>

        {mentionedAssets.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold whitespace-nowrap" style={{ fontSize: "clamp(16px, 4vw, 18px)" }}>
                Mentioned Assets
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mentionedAssets.map((asset) => (
                <div
                  key={asset}
                  className="rounded-[16px] bg-card border border-[var(--card-border)] p-[var(--space-xl)] flex flex-col gap-3 shadow-[var(--card-shadow)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-[15px] leading-snug">{asset}</h3>
                    <WatchlistStar asset={asset} />
                  </div>
                  <div className="pt-1">
                    <TradeButton asset={asset} direction="up" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-[var(--etoro-green)] hover:underline inline-flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Browse events with analysis
            </Link>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <UnifiedInsight matches={matches} />
      <AffectedAssets matches={matches} />
    </section>
  );
}
