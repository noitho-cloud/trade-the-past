import { fetchHeadlines } from "./news-client";
import { classifyAndRank, selectTopEventPerDay } from "./event-classifier";
import { getMockEvents, getMockEventById } from "./mock-data";
import type { MarketEvent, MarketEventSummary } from "./types";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const eventsCache = new Map<string, CacheEntry<MarketEventSummary[]>>();

function getCached<T>(key: string, cache: Map<string, CacheEntry<T>>): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, cache: Map<string, CacheEntry<T>>): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function getEvents(
  scope: "global" | "local" = "global"
): Promise<MarketEventSummary[]> {
  const cacheKey = `events-${scope}`;
  const cached = getCached(cacheKey, eventsCache);
  if (cached) return cached;

  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    return getMockEvents();
  }

  try {
    const articles = await fetchHeadlines(scope, apiKey);
    if (articles.length === 0) {
      return getMockEvents();
    }

    const classified = classifyAndRank(articles);
    const topPerDay = selectTopEventPerDay(classified);

    const summaries: MarketEventSummary[] = topPerDay.slice(0, 7).map((e, i) => ({
      id: `live-${i}-${e.date}`,
      title: e.title,
      type: e.type,
      date: e.date,
      imageUrl: e.imageUrl,
      source: e.source,
    }));

    setCache(cacheKey, summaries, eventsCache);
    return summaries;
  } catch {
    return getMockEvents();
  }
}

export async function getEventById(
  id: string
): Promise<MarketEvent | undefined> {
  // For live events, return a partial event (matches added later by historical-matching)
  if (id.startsWith("live-")) {
    const allScopes: Array<"global" | "local"> = ["global", "local"];
    for (const scope of allScopes) {
      const events = await getEvents(scope);
      const summary = events.find((e) => e.id === id);
      if (summary) {
        return {
          ...summary,
          summary: summary.title,
          scope,
          historicalMatches: [],
        };
      }
    }
    return undefined;
  }

  return getMockEventById(id);
}
