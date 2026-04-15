import type { HistoricalMatch, EventType } from "./types";
import { fetchHistoricalMatches } from "./openai-client";
import { findHistoricalMatches } from "./historical-db";

const matchCache = new Map<string, HistoricalMatch[]>();

function cacheKey(title: string, type: EventType): string {
  return `${type}:${title.toLowerCase().trim().slice(0, 100)}`;
}

export async function getHistoricalMatches(
  title: string,
  type: EventType,
  summary: string,
  source: string
): Promise<HistoricalMatch[]> {
  const key = cacheKey(title, type);

  const cached = matchCache.get(key);
  if (cached) return cached;

  // Try OpenAI first if key is available
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const matches = await fetchHistoricalMatches(
        title,
        type,
        summary,
        source,
        apiKey
      );
      if (matches.length > 0) {
        matchCache.set(key, matches);
        return matches;
      }
    } catch {
      // OpenAI failed (quota, timeout, etc.) -- fall through to built-in DB
    }
  }

  // Built-in historical database (always available, no API needed)
  const matches = findHistoricalMatches(title, type, summary);

  if (matches.length > 0) {
    matchCache.set(key, matches);
  }

  return matches;
}
