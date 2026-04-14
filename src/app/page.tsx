import type { Metadata } from "next";
import type { MarketEventSummary } from "@/lib/types";
import { WeeklyViewClient } from "@/components/WeeklyViewClient";

export const metadata: Metadata = {
  title: "This Week — Trade the Past",
  description:
    "This week's market-moving events paired with similar historical events and market reactions.",
};

export const dynamic = "force-dynamic";

async function fetchEvents(): Promise<MarketEventSummary[]> {
  const { getEvents } = await import("@/lib/event-service");
  return getEvents("global");
}

export default async function WeeklyView() {
  const events = await fetchEvents();
  return <WeeklyViewClient initialEvents={events} />;
}
