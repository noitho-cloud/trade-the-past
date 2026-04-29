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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): { weekday: string; display: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return {
    weekday: WEEKDAYS[date.getUTCDay()],
    display: `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`,
  };
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

function MethodologyHint() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[13px] text-muted hover:text-foreground underline decoration-dotted underline-offset-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none rounded"
      >
        {open ? "Hide" : "How does this work?"}
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: open ? "120px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="text-[12px] text-muted leading-relaxed mt-2 max-w-md">
          We aggregate headlines from major financial outlets, identify the most
          market-moving event each day, and use historical pattern matching to
          find similar past events. Market reaction data shows how affected
          assets performed after each historical parallel.
        </p>
      </div>
    </div>
  );
}

function EmptyDaySlot({ dateStr }: { dateStr: string }) {
  const { weekday, display } = formatDate(dateStr);
  return (
    <div className="rounded-[16px] bg-card/50 border border-[var(--gray-border)]">
      <div className="flex items-stretch">
        <div className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-[var(--gray-border)] py-4 opacity-50">
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
        <div className="flex-1 p-4 flex items-center">
          <span className="text-sm text-muted/70 italic">
            No notable local event
          </span>
        </div>
      </div>
    </div>
  );
}

const SCOPE_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const MODULE_LOAD_TIME = Date.now();

interface CacheEntry {
  data: MarketEventSummary[];
  fetchedAt: number;
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
  const scopeCache = useRef<Map<string, CacheEntry>>(
    new Map([["global", { data: initialEvents, fetchedAt: MODULE_LOAD_TIME }]])
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCachedData = useCallback((targetScope: string): MarketEventSummary[] | null => {
    const entry = scopeCache.current.get(targetScope);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt >= SCOPE_CACHE_TTL) {
      scopeCache.current.delete(targetScope);
      return null;
    }
    return entry.data;
  }, []);

  const startScopeFetch = useCallback((targetScope: "global" | "local") => {
    failedScope.current = null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    fetch(`/api/events?scope=${targetScope}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load events");
        return r.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          scopeCache.current.set(targetScope, {
            data: data.events,
            fetchedAt: Date.now(),
          });
          setEvents(data.events);
          confirmedScope.current = targetScope;
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          failedScope.current = targetScope;
          setScope(confirmedScope.current);
          setError("Could not load events. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  const fetchScopeData = useCallback((targetScope: "global" | "local") => {
    const cached = getCachedData(targetScope);
    if (cached) {
      setEvents(cached);
      confirmedScope.current = targetScope;
      setLoading(false);
      return;
    }
    return startScopeFetch(targetScope);
  }, [getCachedData, startScopeFetch]);

  const handleScopeChange = useCallback(
    (newScope: "global" | "local") => {
      if (newScope === scope) return;
      setError(null);

      const cached = getCachedData(newScope);
      if (cached) {
        setEvents(cached);
        confirmedScope.current = newScope;
        setScope(newScope);
      } else {
        setLoading(true);
        setScope(newScope);
      }

      const url = new URL(window.location.href);
      if (newScope === "local") {
        url.searchParams.set("scope", "local");
      } else {
        url.searchParams.delete("scope");
      }
      window.history.replaceState({}, "", url.toString());
    },
    [scope, getCachedData]
  );

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    const target = failedScope.current ?? scope;
    if (target !== scope) {
      setScope(target);
    } else {
      scopeCache.current.delete(target);
      fetchScopeData(target);
    }
  }, [fetchScopeData, scope]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (urlScope !== "global") {
        return startScopeFetch(urlScope);
      }
      return;
    }

    if (getCachedData(scope)) return;
    return startScopeFetch(scope);
  }, [scope, startScopeFetch, urlScope, getCachedData]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-bold tracking-tight" style={{ fontSize: 'clamp(20px, 5vw, 24px)' }}>
            This Week
          </h2>
          <p className="text-foreground/70 text-[15px] mt-1">
            One market-moving event per day, paired with history.
          </p>
          <p className="text-muted text-[13px] mt-1">
            Select an event to see how markets reacted to similar moments in the past.
          </p>
          <MethodologyHint />
        </div>
        <ScopeToggle scope={scope} onChange={handleScopeChange} />
      </div>

      {error && (
        <div className="rounded-[16px] border border-[var(--gray-border)] bg-[var(--error-bg)] px-4 py-3 text-sm text-[var(--red)] flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full bg-card border border-[var(--gray-border)] hover:bg-background transition-colors cursor-pointer text-foreground focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none"
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
          (() => {
            const eventsByDate = new Map(events.map((e) => [e.date, e]));
            const dates = scope === "local" ? getWeekDates() : [...new Set(events.map((e) => e.date))];
            const currentDay = todayStr();
            return dates.map((dateStr, index) => {
              const event = eventsByDate.get(dateStr);
              if (!event) {
                return <EmptyDaySlot key={`empty-${dateStr}`} dateStr={dateStr} />;
              }
              const { weekday, display } = formatDate(event.date);
              const today = event.date === currentDay;

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}${scope === "local" ? "?from_scope=local" : ""}`}
                  className={`card-enter group block rounded-[16px] border border-[var(--card-border)] transition-all duration-200 ease-out shadow-[var(--card-shadow)] focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none
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
                        {weekday}
                      </span>
                      <span className="text-lg font-semibold mt-0.5">
                        {display.split(" ")[1]}
                      </span>
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        {display.split(" ")[0]}
                      </span>
                    </div>

                    <div className="flex-1 p-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0" suppressHydrationWarning>
                        {today && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase bg-etoro-green text-white px-1.5 py-0.5 rounded-full inline-block mb-1">
                            Today
                          </span>
                        )}
                        <h3 className="font-medium leading-snug text-[15px] transition-colors">
                          {event.title}
                        </h3>
                        {event.summary?.trim().toLowerCase() !== event.title?.trim().toLowerCase() && (
                          <p className="text-xs text-muted leading-relaxed mt-1 line-clamp-2">
                            {event.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <EventTypeBadge type={event.type} />
                          <span className="text-xs text-muted">
                            {event.source}
                          </span>
                        </div>
                        {event.keyReaction && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-muted">Past:</span>
                            <span
                              className={`text-[13px] etoro-nums ${
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
                          </div>
                        )}
                        <span className="text-[12px] text-muted group-hover:text-[var(--etoro-green)] transition-colors mt-1.5 inline-flex items-center gap-1">
                          {event.keyReaction ? "View analysis" : "Read more"}
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
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
                        className="shrink-0 self-center text-muted/70 group-hover:text-muted group-hover:translate-x-0.5 transition-all"
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
            });
          })()
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
          className="inline-flex items-center justify-center px-5 min-h-[48px] text-[16px] font-semibold rounded-[48px] bg-[var(--etoro-green)] text-white hover:bg-[var(--etoro-green-hover)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:ring-offset-2 focus-visible:outline-none"
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
