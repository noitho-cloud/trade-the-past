"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { MarketEventSummary } from "@/lib/types";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { EventImagePlaceholder } from "@/components/EventImagePlaceholder";
import { ScopeToggle } from "@/components/ScopeToggle";

function EventCardSkeleton() {
  return (
    <div className="rounded-xl border border-card-border bg-card animate-pulse">
      <div className="flex items-stretch">
        <div className="w-20 shrink-0 border-r border-card-border py-4 flex flex-col items-center justify-center">
          <div className="h-3 w-8 bg-foreground/5 rounded" />
          <div className="h-5 w-6 bg-foreground/5 rounded mt-1" />
          <div className="h-2 w-8 bg-foreground/5 rounded mt-1" />
        </div>
        <div className="flex-1 p-4 flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-foreground/5 rounded" />
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-4 w-3/4 bg-foreground/5 rounded" />
            <div className="h-5 w-20 bg-foreground/5 rounded-full mt-1" />
          </div>
          <div className="w-16 h-16 bg-foreground/5 rounded-lg shrink-0" />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): { weekday: string; display: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    display: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export function WeeklyViewClient({
  initialEvents,
}: {
  initialEvents: MarketEventSummary[];
}) {
  const [scope, setScope] = useState<"global" | "local">("global");
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  const handleScopeChange = useCallback(
    (newScope: "global" | "local") => {
      if (newScope === scope) return;
      setScope(newScope);
    },
    [scope]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/events?scope=${scope}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load events");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setEvents(data.events);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight">
            This Week
          </h2>
          <p className="text-muted text-sm mt-1">
            One market-moving event per day, paired with history.
          </p>
        </div>
        <ScopeToggle scope={scope} onChange={handleScopeChange} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <EventCardSkeleton key={`skel-${i}`} />
          ))
        ) : events.length === 0 ? (
          <EmptyState
            scope={scope}
            onSwitchToGlobal={() => handleScopeChange("global")}
          />
        ) : (
          events.map((event) => {
            const { weekday, display } = formatDate(event.date);
            const today = isToday(event.date);

            return (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className={`group block rounded-xl border transition-all duration-200
                  ${
                    today
                      ? "bg-card border-foreground/15 shadow-sm hover:shadow-md"
                      : "bg-card border-card-border hover:border-foreground/15 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-stretch">
                  <div className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-card-border py-4">
                    <span className="text-[11px] font-medium tracking-wide uppercase text-muted">
                      {weekday.slice(0, 3)}
                    </span>
                    <span className="text-lg font-serif font-semibold mt-0.5">
                      {display.split(" ")[1]}
                    </span>
                    <span className="text-[10px] text-muted uppercase tracking-wider">
                      {display.split(" ")[0]}
                    </span>
                  </div>

                  <div className="flex-1 p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {today && (
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-foreground/40 mb-1 block">
                          Today
                        </span>
                      )}
                      <h3 className="font-medium leading-snug text-[15px] group-hover:text-foreground/80 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <EventTypeBadge type={event.type} />
                        <span className="text-xs text-muted">
                          {event.source}
                        </span>
                      </div>
                    </div>

                    {event.imageUrl ? (
                      <EventImage
                        url={event.imageUrl}
                        type={event.type}
                      />
                    ) : (
                      <EventImagePlaceholder
                        type={event.type}
                        className="w-16 h-16 rounded-lg shrink-0"
                      />
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState({
  scope,
  onSwitchToGlobal,
}: {
  scope: "global" | "local";
  onSwitchToGlobal: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-foreground/[0.04] flex items-center justify-center mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
      <h3 className="font-serif text-lg font-semibold mb-1">
        No local events this week
      </h3>
      <p className="text-muted text-sm max-w-xs mb-5">
        There are no market-moving events for UK, Germany, or France right now.
        Switch to Global for worldwide coverage.
      </p>
      {scope === "local" && (
        <button
          onClick={onSwitchToGlobal}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          Switch to Global
        </button>
      )}
    </div>
  );
}

function EventImage({
  url,
  type,
}: {
  url: string;
  type: MarketEventSummary["type"];
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <EventImagePlaceholder
        type={type}
        className="w-16 h-16 rounded-lg shrink-0"
      />
    );
  }

  return (
    <img
      src={url}
      alt=""
      width={64}
      height={64}
      className="w-16 h-16 rounded-lg object-cover shrink-0"
      onError={() => setFailed(true)}
    />
  );
}
