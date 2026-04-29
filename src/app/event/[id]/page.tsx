import { cache, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { MarketEvent, MarketEventSummary, HistoricalMatch } from "@/lib/types";
import type { Metadata } from "next";
import { getEventById, getEvents, getEventHistoricalMatches } from "@/lib/event-service";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { HistoricalSection, HistoricalSkeleton } from "@/components/HistoricalSection";
import { EventHeroImage } from "@/components/EventHeroImage";
import { EventNavigation } from "@/components/EventNavigation";

export const revalidate = 300;

const fetchEvent = cache(async (id: string): Promise<MarketEvent | undefined> => {
  return getEventById(id, { skipHistorical: true });
});

const fetchAdjacentEvents = cache(async (id: string, scope: "global" | "local") => {
  const events = await getEvents(scope);
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? events[idx - 1] : null,
    next: idx < events.length - 1 ? events[idx + 1] : null,
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
  };
}

async function HistoricalDataLoader({
  eventId,
  title,
  type,
  summary,
  source,
}: {
  eventId: string;
  title: string;
  type: MarketEvent["type"];
  summary: string;
  source: string;
}) {
  let matches: HistoricalMatch[] | null;
  try {
    matches = await getEventHistoricalMatches(title, type, summary, source);
  } catch {
    matches = null;
  }
  return <HistoricalSection eventId={eventId} matches={matches} />;
}

export default async function EventDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from_scope?: string }>;
}) {
  const { id } = await params;
  const { from_scope } = await searchParams;

  let event: MarketEvent | undefined;
  let prev: MarketEventSummary | null = null;
  let next: MarketEventSummary | null = null;

  if (from_scope === "global" || from_scope === "local") {
    const [eventResult, adjacentResult] = await Promise.all([
      fetchEvent(id),
      fetchAdjacentEvents(id, from_scope),
    ]);
    event = eventResult;
    prev = adjacentResult.prev;
    next = adjacentResult.next;
  } else {
    event = await fetchEvent(id);
    if (event) {
      const scope: "global" | "local" = event.scope ?? "global";
      const adjacentResult = await fetchAdjacentEvents(id, scope);
      prev = adjacentResult.prev;
      next = adjacentResult.next;
    }
  }

  if (!event) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <Link
          href={from_scope === "local" ? "/?scope=local" : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors group rounded focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          This Week
        </Link>

        <EventHeroImage url={event.imageUrl} type={event.type} />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <EventTypeBadge type={event.type} />
            <span className="text-xs text-muted">
              {(() => {
                const WDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                const MOS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                const [y,m,d] = event.date.split("-").map(Number);
                const dt = new Date(Date.UTC(y, m-1, d, 12));
                return `${WDAYS[dt.getUTCDay()]}, ${MOS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
              })()}
            </span>
          </div>

          <h1 className="font-bold leading-[1.2] tracking-tight" style={{ fontSize: 'clamp(20px, 5vw, 28px)' }}>
            {event.title}
          </h1>

          <p className="text-sm text-muted">{event.source}</p>

          {event.summary?.trim().toLowerCase() !== event.title?.trim().toLowerCase() && (
            <p className="text-[15px] leading-relaxed text-foreground/85">
              {event.summary}
            </p>
          )}
        </div>
      </header>

      <Suspense fallback={<HistoricalSkeleton />}>
        <HistoricalDataLoader
          eventId={event.id}
          title={event.title}
          type={event.type}
          summary={event.summary}
          source={event.source}
        />
      </Suspense>

      <EventNavigation prevEvent={prev} nextEvent={next} scope={from_scope} />
    </article>
  );
}
