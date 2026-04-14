import Link from "next/link";
import type { MarketEventSummary } from "@/lib/types";

interface EventNavigationProps {
  prevEvent: MarketEventSummary | null;
  nextEvent: MarketEventSummary | null;
  scope?: string;
}

function formatNavDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function truncateTitle(title: string, max = 40): string {
  if (title.length <= max) return title;
  return title.slice(0, max).trimEnd() + "...";
}

export function EventNavigation({
  prevEvent,
  nextEvent,
  scope,
}: EventNavigationProps) {
  if (!prevEvent && !nextEvent) return null;

  const scopeParam = scope === "local" ? "?from_scope=local" : "";

  return (
    <nav className="border-t border-[var(--gray-border)] pt-6 mt-2">
      <div className="flex items-stretch justify-between gap-4">
        {prevEvent ? (
          <Link
            href={`/event/${prevEvent.id}${scopeParam}`}
            className="group flex items-center gap-3 text-left min-w-0 flex-1 rounded-xl px-3 py-3 -mx-3 hover:bg-foreground/[0.03] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0 text-muted group-hover:text-foreground group-hover:-translate-x-0.5 transition-all"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-muted tracking-wide uppercase block">
                {formatNavDate(prevEvent.date)}
              </span>
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors block truncate">
                {truncateTitle(prevEvent.title)}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextEvent ? (
          <Link
            href={`/event/${nextEvent.id}${scopeParam}`}
            className="group flex items-center gap-3 text-right min-w-0 flex-1 justify-end rounded-xl px-3 py-3 -mx-3 hover:bg-foreground/[0.03] transition-colors"
          >
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-muted tracking-wide uppercase block">
                {formatNavDate(nextEvent.date)}
              </span>
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors block truncate">
                {truncateTitle(nextEvent.title)}
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0 text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
