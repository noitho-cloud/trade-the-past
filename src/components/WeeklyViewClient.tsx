"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { MarketEventSummary } from "@/lib/types";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { EventImagePlaceholder } from "@/components/EventImagePlaceholder";
import { ScopeToggle } from "@/components/ScopeToggle";

function EventCardSkeleton() {
  return (
    <div className="rounded-[16px] bg-card shadow-[var(--card-shadow)] animate-pulse">
      <div className="flex items-stretch">
        <div className="w-20 shrink-0 border-r border-[var(--gray-border)] py-4 flex flex-col items-center justify-center">
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
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr === today;
}

export function WeeklyViewClient({
  initialEvents,
}: {
  initialEvents: MarketEventSummary[];
}) {
  const searchParams = useSearchParams();
  const urlScope = searchParams.get("scope") === "local" ? "local" : "global";
  const [scope, setScope] = useState<"global" | "local">(urlScope);
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(urlScope !== "global");
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);
  const confirmedScope = useRef<"global" | "local">("global");
  const failedScope = useRef<"global" | "local" | null>(null);

  const fetchScope = useCallback((targetScope: "global" | "local") => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    failedScope.current = null;

    fetch(`/api/events?scope=${targetScope}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load events");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEvents(data.events);
          confirmedScope.current = targetScope;
        }
      })
      .catch(() => {
        if (!cancelled) {
          failedScope.current = targetScope;
          setScope(confirmedScope.current);
          setError("Could not load events. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleScopeChange = useCallback(
    (newScope: "global" | "local") => {
      if (newScope === scope) return;
      setScope(newScope);
      const url = new URL(window.location.href);
      if (newScope === "local") {
        url.searchParams.set("scope", "local");
      } else {
        url.searchParams.delete("scope");
      }
      window.history.replaceState({}, "", url.toString());
    },
    [scope]
  );

  const handleRetry = useCallback(() => {
    const target = failedScope.current ?? scope;
    if (target !== scope) {
      setScope(target);
    } else {
      fetchScope(target);
    }
  }, [fetchScope, scope]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (urlScope !== "global") {
        fetchScope(urlScope);
      }
      return;
    }

    return fetchScope(scope);
  }, [scope, fetchScope, urlScope]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight">
            This Week
          </h2>
          <p className="text-foreground/70 text-[15px] mt-1">
            One market-moving event per day, paired with history.
          </p>
          <p className="text-muted text-[13px] mt-1">
            Select an event to see how markets reacted to similar moments in the past.
          </p>
        </div>
        <ScopeToggle scope={scope} onChange={handleScopeChange} />
      </div>

      {error && (
        <div className="rounded-[16px] border border-[var(--gray-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--red)] flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full bg-card border border-[var(--gray-border)] hover:bg-background transition-colors cursor-pointer text-foreground"
          >
            Retry
          </button>
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
          events.map((event, index) => {
            const { weekday, display } = formatDate(event.date);
            const today = isToday(event.date);

            return (
              <Link
                key={event.id}
                href={`/event/${event.id}${scope === "local" ? "?from_scope=local" : ""}`}
                className={`card-enter group block rounded-[16px] transition-all duration-200 ease-out shadow-[var(--card-shadow)]
                  ${
                    today
                      ? "bg-card border-l-[3px] border-l-[var(--etoro-green)] hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5"
                      : "bg-card hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-0.5"
                  }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-stretch">
                  <div className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-[var(--gray-border)] py-4">
                    <span className="text-[11px] font-medium tracking-wide uppercase text-muted">
                      {weekday.slice(0, 3)}
                    </span>
                    <span className="text-lg font-semibold mt-0.5">
                      {display.split(" ")[1]}
                    </span>
                    <span className="text-[10px] text-muted uppercase tracking-wider">
                      {display.split(" ")[0]}
                    </span>
                  </div>

                  <div className="flex-1 p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {today && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-etoro-green text-white px-1.5 py-0.5 rounded-full inline-block mb-1">
                          Today
                        </span>
                      )}
                      <h3 className="font-medium leading-snug text-[15px] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted leading-relaxed mt-1 line-clamp-2">
                        {event.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <EventTypeBadge type={event.type} />
                        <span className="text-xs text-muted">
                          {event.source}
                        </span>
                        {event.keyReaction && (
                          <span
                            className={`text-[11px] font-medium ml-auto ${
                              event.keyReaction.direction === "up"
                                ? "text-etoro-green"
                                : "text-etoro-red"
                            }`}
                          >
                            {event.keyReaction.direction === "up" ? "\u25B2" : "\u25BC"}{" "}
                            {event.keyReaction.asset}{" "}
                            {event.keyReaction.day1Pct > 0 ? "+" : ""}
                            {event.keyReaction.day1Pct.toFixed(1)}%
                          </span>
                        )}
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

                    <svg
                      data-testid="card-chevron"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 self-center text-muted/50 group-hover:text-muted group-hover:translate-x-0.5 transition-all"
                    >
                      <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
      <div className="w-12 h-12 rounded-full bg-[var(--gray-bg)] flex items-center justify-center mb-4">
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
      <h3 className="text-lg font-semibold mb-1">
        No local events this week
      </h3>
      <p className="text-muted text-sm max-w-xs mb-5">
        There are no market-moving events for UK, Germany, or France right now.
        Switch to Global for worldwide coverage.
      </p>
      {scope === "local" && (
        <button
          onClick={onSwitchToGlobal}
          className="px-5 py-3 text-[16px] font-semibold rounded-[48px] bg-[var(--etoro-green)] text-white hover:bg-[var(--etoro-green-hover)] transition-colors cursor-pointer"
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
    <Image
      src={url}
      alt=""
      width={64}
      height={64}
      className="w-16 h-16 rounded-lg object-cover shrink-0"
      onError={() => setFailed(true)}
    />
  );
}
