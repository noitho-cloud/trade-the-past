import Link from "next/link";
import { notFound } from "next/navigation";
import type { MarketEvent } from "@/lib/types";
import type { Metadata } from "next";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { UnifiedInsight } from "@/components/UnifiedInsight";
import { AffectedAssets } from "@/components/AffectedAssets";
import { EventHeroImage } from "@/components/EventHeroImage";

export const dynamic = "force-dynamic";

async function fetchEvent(id: string): Promise<MarketEvent | undefined> {
  const { getEventById } = await import("@/lib/event-service");
  return getEventById(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.title} — Trade the Past`,
    description: event.summary,
  };
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
  const event = await fetchEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <Link
          href={from_scope === "local" ? "/?scope=local" : "/"}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors group"
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
              {new Date(event.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-serif text-[28px] md:text-[32px] font-semibold leading-[1.2] tracking-tight">
            {event.title}
          </h1>

          <p className="text-sm text-muted">{event.source}</p>

          <p className="text-[15px] leading-relaxed text-foreground/85">
            {event.summary}
          </p>
        </div>
      </header>

      {event.historicalMatches.length > 0 ? (
        <>
          <UnifiedInsight matches={event.historicalMatches} />
          <AffectedAssets matches={event.historicalMatches} />
        </>
      ) : (
        <section className="rounded-lg border border-card-border bg-card px-6 py-8 text-center">
          <p className="text-sm text-muted">
            Historical analysis is being generated. Check back shortly.
          </p>
        </section>
      )}
    </article>
  );
}
