"use client";

import { useEffect, useState } from "react";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialMatches.length > 0) return;

    let cancelled = false;

    async function fetchMatches() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (cancelled) return;

        const eventMatches: HistoricalMatch[] =
          data.event?.historicalMatches ?? [];

        if (eventMatches.length > 0) {
          setMatches(eventMatches);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchMatches();
    return () => {
      cancelled = true;
    };
  }, [eventId, initialMatches]);

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

  if (error || matches.length === 0) {
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
