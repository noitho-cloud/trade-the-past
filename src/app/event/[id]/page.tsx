import Link from "next/link";
import { notFound } from "next/navigation";
import type { MarketEvent } from "@/lib/types";
import type { Metadata } from "next";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { MarketReactionTable } from "@/components/MarketReactionTable";
import { CTAButton } from "@/components/CTAButton";
import { EventImagePlaceholder } from "@/components/EventImagePlaceholder";

async function getEvent(id: string): Promise<MarketEvent | undefined> {
  const { getMockEventById } = await import("@/lib/mock-data");
  return getMockEventById(id);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.title} — Trade the Past`,
    description: event.summary,
  };
}

export default async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/"
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

        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt=""
            width={672}
            height={192}
            className="w-full h-48 object-cover rounded-xl"
          />
        ) : (
          <EventImagePlaceholder
            type={event.type}
            className="w-full h-48 rounded-xl"
          />
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <EventTypeBadge type={event.type} />
            <span className="text-xs text-muted">
              {new Date(event.date).toLocaleDateString("en-US", {
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

      {event.historicalMatches.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-xl font-semibold whitespace-nowrap">
              Similar Past Events
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          {event.historicalMatches.map((match) => (
            <div
              key={`${match.year}-${match.description.slice(0, 30)}`}
              className="space-y-4 pb-8 border-b border-border last:border-0 last:pb-0"
            >
              <div>
                <h3 className="font-medium text-[15px] leading-snug">
                  {match.description}
                </h3>
                <span className="text-sm text-muted">{match.year}</span>
              </div>

              <blockquote className="border-l-2 border-foreground/15 pl-4 text-sm text-muted italic leading-relaxed">
                {match.whySimilar}
              </blockquote>

              <div className="bg-card border border-card-border rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-card-border bg-foreground/[0.02]">
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted">
                    Market Reaction
                  </span>
                </div>
                <MarketReactionTable reactions={match.reactions} />
              </div>

              <p className="text-sm leading-relaxed text-foreground/75 bg-foreground/[0.02] rounded-lg px-4 py-3">
                {match.insight}
              </p>
            </div>
          ))}
        </section>
      )}

      <div className="pt-2 pb-4">
        <CTAButton eventType={event.type} />
      </div>
    </article>
  );
}
