import { NextResponse } from "next/server";
import { fetchRSSHeadlines } from "@/lib/rss-client";
import { classifyAndRank, selectDiverseEvents } from "@/lib/event-classifier";

export async function GET() {
  const articles = await fetchRSSHeadlines("global");
  const classified = classifyAndRank(articles);
  const diverse = selectDiverseEvents(classified, 10);

  return NextResponse.json({
    totalArticles: articles.length,
    articleSources: articles.reduce((acc: Record<string, number>, a) => {
      acc[a.source.name] = (acc[a.source.name] || 0) + 1;
      return acc;
    }, {}),
    totalClassified: classified.length,
    classifiedTypes: classified.reduce((acc: Record<string, number>, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {}),
    diverseCount: diverse.length,
    diverse: diverse.map(e => ({ type: e.type, title: e.title.slice(0, 80), source: e.source })),
  });
}
