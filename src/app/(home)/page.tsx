import { Suspense } from "react";
import { after } from "next/server";
import type { Metadata } from "next";
import type { MarketEventSummary } from "@/lib/types";
import { WeeklyViewClient } from "@/components/WeeklyViewClient";

export const metadata: Metadata = {
  title: "This Week",
  description:
    "This week's market-moving events paired with similar historical events and market reactions.",
};

export const revalidate = 60;

async function fetchEvents(): Promise<MarketEventSummary[]> {
  const { getEvents } = await import("@/lib/event-service");
  return getEvents("global");
}

export default async function WeeklyView() {
  const events = await fetchEvents();

  after(async () => {
    const { warmAlternateScope } = await import("@/lib/event-service");
    warmAlternateScope("global");
  });

  return (
    <Suspense>
      <WeeklyViewClient initialEvents={events} />
    </Suspense>
  );
}
