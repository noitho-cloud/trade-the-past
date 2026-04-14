import Link from "next/link";
import type { Metadata } from "next";
import type { MarketEventSummary } from "@/lib/types";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { EventImagePlaceholder } from "@/components/EventImagePlaceholder";

export const metadata: Metadata = {
  title: "This Week — Trade the Past",
  description:
    "This week's market-moving events paired with similar historical events and market reactions.",
};

async function getEvents(): Promise<MarketEventSummary[]> {
  const { getMockEvents } = await import("@/lib/mock-data");
  return getMockEvents();
}

function formatDate(dateStr: string): { weekday: string; display: string } {
  const d = new Date(dateStr);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    display: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export default async function WeeklyView() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight">
          This Week
        </h2>
        <p className="text-muted text-sm mt-1">
          One market-moving event per day, paired with history.
        </p>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => {
          const { weekday, display } = formatDate(event.date);
          const isToday = index === 0;

          return (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className={`group block rounded-xl border transition-all duration-200
                ${
                  isToday
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
                    {isToday && (
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
                    <img
                      src={event.imageUrl}
                      alt=""
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
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
        })}
      </div>
    </div>
  );
}
