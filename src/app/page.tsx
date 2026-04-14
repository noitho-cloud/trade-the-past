import Link from "next/link";
import type { MarketEventSummary } from "@/lib/types";

async function getEvents(): Promise<MarketEventSummary[]> {
  const { getMockEvents } = await import("@/lib/mock-data");
  return getMockEvents();
}

export default async function WeeklyView() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-semibold">This Week</h2>
      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/event/${event.id}`}
            className="block p-4 bg-card border border-card-border rounded-lg hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-1">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <h3 className="font-medium leading-snug">{event.title}</h3>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted">
                  {event.type}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
