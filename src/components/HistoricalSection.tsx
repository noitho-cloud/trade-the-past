"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { HistoricalMatch } from "@/lib/types";
import { UnifiedInsight } from "./UnifiedInsight";
import { AffectedAssets } from "./AffectedAssets";

interface HistoricalSectionProps {
  eventId: string;
  initialMatches: HistoricalMatch[];
}

export function HistoricalSection({
  eventId,
  initialMatches,
}: HistoricalSectionProps) {
  const [matches, setMatches] = useState<HistoricalMatch[]>(initialMatches);
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [fetchError, setFetchError] = useState(false);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

  const fetchMatches = useCallback(() => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setFetchError(false);
    setLoading(true);

    fetch(`/api/events/${eventId}`, { signal: AbortSignal.timeout(15000) })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const eventMatches: HistoricalMatch[] =
          data.event?.historicalMatches ?? [];
        setMatches(eventMatches);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [eventId]);

  useEffect(() => {
    if (initialMatches.length > 0) return;

    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    fetch(`/api/events/${eventId}`, { signal: AbortSignal.timeout(15000) })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const eventMatches: HistoricalMatch[] =
          data.event?.historicalMatches ?? [];
        setMatches(eventMatches);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [initialMatches, eventId]);

  if (loading) {
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

  if (fetchError) {
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

  if (matches.length === 0) {
    return (
      <section className="rounded-[16px] bg-card shadow-[var(--card-shadow)] px-[var(--space-xl)] py-8 text-center">
        <p className="text-sm text-muted">
          No historical parallels found for this event.
        </p>
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
