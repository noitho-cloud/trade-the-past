import { fetchHeadlines } from "./news-client";
import { fetchRSSHeadlines } from "./rss-client";
import {
  classifyAndRank,
  selectDiverseEvents,
  type ClassifiedEvent,
} from "./event-classifier";
import { getMockEvents, getMockEventById } from "./mock-data";
import { getHistoricalMatches } from "./historical-service";
import { filterTradeableReactions } from "./etoro-slugs";
import { findHistoricalMatches } from "./historical-db";
import type { MarketEvent, MarketEventSummary, HistoricalMatch } from "./types";

export function filterMatchReactions(matches: HistoricalMatch[]): HistoricalMatch[] {
  return matches.map((m) => ({
    ...m,
    reactions: filterTradeableReactions(m.reactions),
  }));
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
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

async function fetchArticles(
  scope: "global" | "local"
): Promise<import("./news-client").RawArticle[]> {
  // 1) Try RSS feeds first (free, no key, works everywhere)
  try {
    const rssArticles = await fetchRSSHeadlines(scope);
    if (rssArticles.length > 0) return rssArticles;
  } catch {
    // RSS failed, try NewsAPI next
  }

  // 2) Fall back to NewsAPI if key is configured
  const apiKey = process.env.NEWSAPI_KEY;
  if (apiKey) {
    try {
      const newsApiArticles = await fetchHeadlines(scope, apiKey);
      if (newsApiArticles.length > 0) return newsApiArticles;
    } catch {
      // NewsAPI also failed
    }
  }

  return [];
}

export async function getEvents(
  scope: "global" | "local" = "global"
): Promise<MarketEventSummary[]> {
  const cacheKey = `events-${scope}`;
  const cached = getCached(cacheKey, eventsCache);
  if (cached) return cached;

  try {
    const articles = await fetchArticles(scope);
    if (articles.length === 0) {
      return getMockEvents(scope);
    }

    const classified = classifyAndRank(articles);
    const diverse = selectDiverseEvents(classified, 10);

    const summaries: MarketEventSummary[] = diverse.map((e, i) => {
      const dbMatches = findHistoricalMatches(e.title, e.type, e.summary || e.title);
      const allReactions = dbMatches.flatMap((m) => m.reactions);
      const tradeable = filterTradeableReactions(allReactions);
      const first = tradeable[0] ?? null;
      return {
        id: `live-${scope}-${i}-${e.date}`,
        title: e.title,
        type: e.type,
        date: e.date,
        summary: e.summary || e.title,
        imageUrl: e.imageUrl,
        source: e.source,
        keyReaction: first
          ? { asset: first.asset, direction: first.direction, day1Pct: first.day1Pct }
          : null,
      };
    });

    summaries.sort((a, b) => b.date.localeCompare(a.date));
    setCache(cacheKey, summaries, eventsCache);
    setCache(`classified-${scope}`, diverse, classifiedCache);
    return summaries;
  } catch {
    return getMockEvents(scope);
  }
}

export function warmAlternateScope(currentScope: "global" | "local"): void {
  const alternate = currentScope === "global" ? "local" : "global";
  const cached = getCached(`events-${alternate}`, eventsCache);
  if (!cached) {
    getEvents(alternate).catch(() => {});
  }
}

export async function getEventById(
  id: string,
  options?: { skipHistorical?: boolean }
): Promise<MarketEvent | undefined> {
  const skipHistorical = options?.skipHistorical ?? false;

  if (id.startsWith("live-")) {
    let allScopes: Array<"global" | "local"> = ["global", "local"];
    if (id.startsWith("live-local-")) {
      allScopes = ["local", "global"];
    }
    for (const scope of allScopes) {
      const events = await getEvents(scope);
      const summary = events.find((e) => e.id === id);
      if (!summary) continue;

      const classified = getCached(`classified-${scope}`, classifiedCache);
      const detail = classified?.find((c) => c.title === summary.title);
      const eventSummary = detail?.summary || summary.title;

      let historicalMatches: HistoricalMatch[] = [];
      if (!skipHistorical) {
        const rawMatches = await getHistoricalMatches(
          summary.title,
          summary.type,
          eventSummary,
          summary.source
        );
        historicalMatches = filterMatchReactions(rawMatches);
      }

      return {
        ...summary,
        summary: eventSummary,
        scope,
        historicalMatches,
      };
    }
    return undefined;
  }

  const mockEvent = getMockEventById(id);
  if (!mockEvent) return undefined;
  return {
    ...mockEvent,
    historicalMatches: skipHistorical
      ? []
      : filterMatchReactions(mockEvent.historicalMatches),
  };
}

export async function getEventHistoricalMatches(
  title: string,
  type: import("./types").EventType,
  summary: string,
  source: string
): Promise<HistoricalMatch[]> {
  const rawMatches = await getHistoricalMatches(title, type, summary, source);
  return filterMatchReactions(rawMatches);
}
