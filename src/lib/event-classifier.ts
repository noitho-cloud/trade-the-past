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
  if (sourceName.toLowerCase().includes("google news")) return title;
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

/**
 * Select a diverse set of events: spread across types, dedupe by title
 * similarity, cap any single type at maxPerType.
 */
export function selectDiverseEvents(
  events: ClassifiedEvent[],
  limit: number
): ClassifiedEvent[] {
  if (events.length <= limit) return events;

  const maxPerType = Math.max(2, Math.ceil(limit / 4));
  const result: ClassifiedEvent[] = [];
  const typeCount = new Map<string, number>();
  const usedTitles = new Set<string>();

  const titleKey = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);

  const byType = new Map<string, ClassifiedEvent[]>();
  for (const e of events) {
    const list = byType.get(e.type) || [];
    list.push(e);
    byType.set(e.type, list);
  }

  // First pass: one from each type (round-robin)
  for (const [, list] of byType) {
    if (result.length >= limit) break;
    const best = list[0];
    if (best) {
      result.push(best);
      typeCount.set(best.type, 1);
      usedTitles.add(titleKey(best.title));
    }
  }

  // Second pass: fill remaining, respecting maxPerType cap
  for (const e of events) {
    if (result.length >= limit) break;
    const tk = titleKey(e.title);
    if (usedTitles.has(tk)) continue;
    const count = typeCount.get(e.type) || 0;
    if (count >= maxPerType) continue;
    result.push(e);
    typeCount.set(e.type, count + 1);
    usedTitles.add(tk);
  }

  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
