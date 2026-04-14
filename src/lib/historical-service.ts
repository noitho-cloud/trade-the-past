import type { HistoricalMatch, EventType } from "./types";
import { fetchHistoricalMatches } from "./openai-client";

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const matches = await fetchHistoricalMatches(
      title,
      type,
      summary,
      source,
      apiKey
    );

    matchCache.set(key, matches);
    return matches;
  } catch {
    return [];
  }
}
