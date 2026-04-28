import type { EventType } from "./types";
import type { RawArticle } from "./news-client";

interface ClassificationRule {
  type: EventType;
  keywords: string[];
  weight: number;
}

const RULES: ClassificationRule[] = [
  {
    type: "earnings",
    keywords: [
      "earnings",
      "revenue",
      "profit",
      "quarterly results",
      "beats estimates",
      "misses estimates",
      "tops estimates",
      "eps",
      "guidance",
      "fiscal year",
      "net income",
      "q1 ",
      "q2 ",
      "q3 ",
      "q4 ",
      "first quarter",
      "second quarter",
      "third quarter",
      "fourth quarter",
      "raises guidance",
      "beats expectations",
      "report earnings",
      "results beat",
      "sales growth",
      "ipo",
      "stock jumps",
      "stock surges",
      "shares jump",
      "shares surge",
      "shares rise",
      "shares fall",
      "stock falls",
      "market cap",
    ],
    weight: 1.0,
  },
  {
    type: "layoffs",
    keywords: [
      "layoff",
      "lay off",
      "job cuts",
      "restructuring",
      "downsizing",
      "workforce reduction",
      "redundancies",
      "furlough",
      "headcount",
      "cost cutting",
      "cut jobs",
      "cutting jobs",
      "slash jobs",
      "eliminate positions",
    ],
    weight: 1.1,
  },
  {
    type: "lawsuits",
    keywords: [
      "lawsuit",
      "sued",
      "sues",
      "litigation",
      "settlement",
      "antitrust",
      "fine",
      "penalty",
      "regulatory action",
      "investigation",
      "indictment",
      "fraud",
      "class action",
      "court ruling",
      "court rules",
      "guilty",
      "verdict",
      "prosecution",
      "ftc",
      "doj",
      "sec charges",
    ],
    weight: 1.0,
  },
  {
    type: "regulation",
    keywords: [
      "regulation",
      "regulatory",
      "legislation",
      "bill passed",
      "act signed",
      "compliance",
      "ban",
      "mandate",
      "rule change",
      "policy",
      "ai act",
    ],
    weight: 1.2,
  },
  {
    type: "interest-rates",
    keywords: [
      "interest rate",
      "rate hike",
      "rate cut",
      "federal reserve",
      "fed",
      "central bank",
      "monetary policy",
      "ecb",
      "bank of england",
      "inflation",
      "basis points",
    ],
    weight: 1.3,
  },
  {
    type: "geopolitical",
    keywords: [
      "sanctions",
      "tariff",
      "trade war",
      "embargo",
      "export control",
      "geopolitical",
      "nato",
      "military",
      "strait of hormuz",
      "hormuz",
      "blockade",
      "naval",
      "invasion",
      "missile",
      "airstrike",
      "nuclear",
      "suez canal",
      "ceasefire",
      "troops",
      "houthi",
      "red sea",
      "south china sea",
      "pentagon",
      "weapons",
      "arms deal",
      "treaty",
      "escalation",
      "retaliation",
      "insurgent",
      "coup",
      "un security council",
    ],
    weight: 1.3,
  },
  {
    type: "commodity-shocks",
    keywords: [
      "oil price",
      "oil tumbles",
      "oil surges",
      "oil spikes",
      "crude",
      "brent",
      "opec",
      "commodity",
      "gold price",
      "gold hits",
      "gold surges",
      "rare earth",
      "supply chain",
      "shortage",
      "natural gas",
      "wheat",
      "copper",
      "oil supply",
      "shipping lane",
      "disruption",
      "supply disruption",
      "refinery",
      "barrel",
      "bpd",
      "production cut",
      "fuel",
      "energy crisis",
      "energy shock",
      "supply shock",
      "pipeline",
      "jet fuel",
      "gasoline",
      "oil forecast",
      "drilling",
      "north sea oil",
    ],
    weight: 1.2,
  },
];

const HIGH_AUTHORITY_SOURCES = new Set([
  "reuters",
  "bloomberg",
  "financial times",
  "wall street journal",
  "cnbc",
  "bbc news",
  "the economist",
  "associated press",
]);

export interface ClassifiedEvent {
  title: string;
  type: EventType;
  score: number;
  imageUrl: string | null;
  source: string;
  date: string;
  summary: string;
}

export function cleanDescription(
  description: string | null | undefined,
  sourceName: string,
  title: string
): string {
  if (!description || !description.trim()) return title;
  if (sourceName.startsWith("Google News")) return title;
  return description;
}

export function classifyArticle(
  article: RawArticle
): { type: EventType; confidence: number } | null {
  const text = `${article.title} ${article.description || ""}`.toLowerCase();

  let bestType: EventType | null = null;
  let bestScore = 0;

  for (const rule of RULES) {
    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) matchCount++;
    }
    if (matchCount === 0) continue;

    const score = (matchCount / rule.keywords.length) * rule.weight;
    if (score > bestScore) {
      bestScore = score;
      bestType = rule.type;
    }
  }

  if (!bestType || bestScore < 0.03) return null;

  return { type: bestType, confidence: bestScore };
}

export function scoreEvent(article: RawArticle, confidence: number): number {
  let score = confidence * 10;

  const sourceName = article.source.name.toLowerCase();
  if (HIGH_AUTHORITY_SOURCES.has(sourceName)) {
    score *= 1.5;
  }

  const ageHours =
    (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours < 6) score *= 1.3;
  else if (ageHours < 24) score *= 1.1;
  else if (ageHours > 72) score *= 0.7;

  return score;
}

export function classifyAndRank(articles: RawArticle[]): ClassifiedEvent[] {
  const classified: { event: ClassifiedEvent; score: number }[] = [];

  for (const article of articles) {
    const result = classifyArticle(article);
    if (!result) continue;

    const impactScore = scoreEvent(article, result.confidence);
    classified.push({
      event: {
        title: article.title,
        type: result.type,
        score: impactScore,
        imageUrl: article.urlToImage,
        source: article.source.name,
        date: article.publishedAt.split("T")[0],
        summary: cleanDescription(article.description, article.source.name, article.title),
      },
      score: impactScore,
    });
  }

  classified.sort((a, b) => b.score - a.score);
  return classified.map((c) => c.event);
}

export function selectTopEventPerDay(
  events: ClassifiedEvent[]
): ClassifiedEvent[] {
  const byDate = new Map<string, ClassifiedEvent>();

  for (const event of events) {
    const existing = byDate.get(event.date);
    if (!existing || event.score > existing.score) {
      byDate.set(event.date, event);
    }
  }

  return Array.from(byDate.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","has","had","have","do","does","did",
  "will","would","could","should","may","might","can","shall","it","its",
  "this","that","these","those","from","by","as","if","not","no","so",
  "up","out","about","into","over","after","before","between","under",
  "says","said","new","also","more","here","why","how","what","when",
]);

function extractSignificantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function isSimilar(a: string, b: string): boolean {
  const wordsA = extractSignificantWords(a);
  const wordsB = extractSignificantWords(b);
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }

  const smaller = Math.min(wordsA.size, wordsB.size);
  return overlap / smaller >= 0.4;
}

function isDuplicate(
  candidate: ClassifiedEvent,
  existing: ClassifiedEvent[]
): boolean {
  const candidateText = `${candidate.title} ${candidate.summary || ""}`;
  for (const e of existing) {
    const existingText = `${e.title} ${e.summary || ""}`;
    if (isSimilar(candidateText, existingText)) return true;
  }
  return false;
}

/**
 * Select a diverse set of events: one per day first, then fill with
 * type diversity, dedupe similar stories.
 */
export function selectDiverseEvents(
  events: ClassifiedEvent[],
  limit: number
): ClassifiedEvent[] {
  if (events.length <= limit) return events;

  const maxPerType = Math.max(2, Math.ceil(limit / 3));
  const result: ClassifiedEvent[] = [];
  const typeCount = new Map<string, number>();
  const dateCount = new Map<string, number>();

  // Group by date
  const byDate = new Map<string, ClassifiedEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) || [];
    list.push(e);
    byDate.set(e.date, list);
  }

  // Sort dates newest first
  const sortedDates = Array.from(byDate.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // First pass: best event from each day (guarantees daily spread)
  for (const date of sortedDates) {
    if (result.length >= limit) break;
    const dayEvents = byDate.get(date)!;
    const best = dayEvents.find((e) => !isDuplicate(e, result));
    if (best) {
      result.push(best);
      typeCount.set(best.type, (typeCount.get(best.type) || 0) + 1);
      dateCount.set(date, 1);
    }
  }

  // Second pass: fill remaining with type diversity, no day gets more than 2
  for (const e of events) {
    if (result.length >= limit) break;
    if (isDuplicate(e, result)) continue;
    const tCount = typeCount.get(e.type) || 0;
    if (tCount >= maxPerType) continue;
    const dCount = dateCount.get(e.date) || 0;
    if (dCount >= 2) continue;
    result.push(e);
    typeCount.set(e.type, tCount + 1);
    dateCount.set(e.date, dCount + 1);
  }

  // Third pass: if still under limit, relax day cap
  for (const e of events) {
    if (result.length >= limit) break;
    if (isDuplicate(e, result)) continue;
    const tCount = typeCount.get(e.type) || 0;
    if (tCount >= maxPerType) continue;
    result.push(e);
    typeCount.set(e.type, tCount + 1);
  }

  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
