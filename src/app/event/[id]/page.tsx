import Link from "next/link";
import { notFound } from "next/navigation";
import type { MarketEvent } from "@/lib/types";
import type { Metadata } from "next";

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
    <article className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Back to This Week
        </Link>
        <div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted mb-2">
            {event.type}
          </span>
          <h1 className="font-serif text-3xl font-semibold leading-tight">
            {event.title}
          </h1>
          <p className="text-sm text-muted mt-2">
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            &middot; {event.source}
          </p>
        </div>
        <p className="text-base leading-relaxed">{event.summary}</p>
      </header>

      {event.historicalMatches.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-serif text-xl font-semibold border-b border-border pb-2">
            Similar Past Events
          </h2>
          {event.historicalMatches.map((match) => (
            <div key={`${match.year}-${match.description.slice(0, 30)}`} className="space-y-3">
              <h3 className="font-medium">
                {match.description}{" "}
                <span className="text-muted font-normal">({match.year})</span>
              </h3>
              <p className="text-sm text-muted italic">{match.whySimilar}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-card-border rounded">
                  <thead>
                    <tr className="bg-foreground/3">
                      <th className="text-left px-3 py-2 font-medium">
                        Asset
                      </th>
                      <th className="text-left px-3 py-2 font-medium">
                        Direction
                      </th>
                      <th className="text-right px-3 py-2 font-medium">
                        Day 1
                      </th>
                      <th className="text-right px-3 py-2 font-medium">
                        Week 1
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.reactions.map((r) => (
                      <tr key={r.asset} className="border-t border-card-border">
                        <td className="px-3 py-2">{r.asset}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              r.direction === "up"
                                ? "text-green-700"
                                : "text-red-700"
                            }
                          >
                            {r.direction === "up" ? "Up" : "Down"}
                          </span>
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${r.day1Pct >= 0 ? "text-green-700" : "text-red-700"}`}
                        >
                          {r.day1Pct > 0 ? "+" : ""}
                          {r.day1Pct.toFixed(1)}%
                        </td>
                        <td
                          className={`px-3 py-2 text-right ${r.week1Pct >= 0 ? "text-green-700" : "text-red-700"}`}
                        >
                          {r.week1Pct > 0 ? "+" : ""}
                          {r.week1Pct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm leading-relaxed">{match.insight}</p>
            </div>
          ))}
        </section>
      )}

      <div className="pt-4">
        <button className="w-full bg-accent text-accent-foreground py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer">
          View affected assets
        </button>
      </div>
    </article>
  );
}
