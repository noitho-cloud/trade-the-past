import { fetchHeadlines } from "./news-client";
import {
  classifyAndRank,
  selectTopEventPerDay,
  type ClassifiedEvent,
} from "./event-classifier";
import { getMockEvents, getMockEventById } from "./mock-data";
import { getHistoricalMatches } from "./historical-service";
import { filterTradeableReactions } from "./etoro-slugs";
import type { MarketEvent, MarketEventSummary, HistoricalMatch } from "./types";

function filterMatchReactions(matches: HistoricalMatch[]): HistoricalMatch[] {
  return matches.map((m) => ({
    ...m,
    reactions: filterTradeableReactions(m.reactions),
  }));
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const eventsCache = new Map<string, CacheEntry<MarketEventSummary[]>>();
const classifiedCache = new Map<string, CacheEntry<ClassifiedEvent[]>>();

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
    return getMockEvents(scope);
  }

  try {
    const articles = await fetchHeadlines(scope, apiKey);
    if (articles.length === 0) {
      return getMockEvents(scope);
    }

    const classified = classifyAndRank(articles);
    const topPerDay = selectTopEventPerDay(classified);

    const top7 = topPerDay.slice(0, 7);

    const summaries: MarketEventSummary[] = top7.map((e, i) => ({
      id: `live-${i}-${e.date}`,
      title: e.title,
      type: e.type,
      date: e.date,
      summary: e.summary || e.title,
      imageUrl: e.imageUrl,
      source: e.source,
      keyReaction: null,
    }));

    summaries.sort((a, b) => b.date.localeCompare(a.date));
    setCache(cacheKey, summaries, eventsCache);
    setCache(`classified-${scope}`, top7, classifiedCache);
    return summaries;
  } catch {
    return getMockEvents(scope);
  }
}

export async function getEventById(
  id: string
): Promise<MarketEvent | undefined> {
  if (id.startsWith("live-")) {
    const allScopes: Array<"global" | "local"> = ["global", "local"];
    for (const scope of allScopes) {
      const events = await getEvents(scope);
      const summary = events.find((e) => e.id === id);
      if (!summary) continue;

      const classified = getCached(`classified-${scope}`, classifiedCache);
      const detail = classified?.find((c) => c.title === summary.title);
      const eventSummary = detail?.summary || summary.title;

      const rawMatches = await getHistoricalMatches(
        summary.title,
        summary.type,
        eventSummary,
        summary.source
      );

      return {
        ...summary,
        summary: eventSummary,
        scope,
        historicalMatches: filterMatchReactions(rawMatches),
      };
    }
    return undefined;
  }

  const mockEvent = getMockEventById(id);
  if (!mockEvent) return undefined;
  return {
    ...mockEvent,
    historicalMatches: filterMatchReactions(mockEvent.historicalMatches),
  };
}
