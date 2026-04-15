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
      "eps",
      "guidance",
      "fiscal year",
      "net income",
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
    ],
    weight: 1.1,
  },
  {
    type: "lawsuits",
    keywords: [
      "lawsuit",
      "sued",
      "litigation",
      "settlement",
      "antitrust",
      "fine",
      "penalty",
      "regulatory action",
      "investigation",
      "indictment",
      "fraud",
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
      "conflict",
      "geopolitical",
      "summit",
      "diplomatic",
      "nato",
      "military",
      "strait",
      "hormuz",
      "blockade",
      "naval",
      "shipping",
      "maritime",
      "war",
      "invasion",
      "attack",
      "missile",
      "drone",
      "nuclear",
      "suez",
      "gulf",
      "border",
      "closure",
      "occupation",
      "fleet",
      "carrier",
      "threat",
      "deploy",
      "troops",
      "ceasefire",
      "airstrike",
      "iran",
      "china",
      "russia",
      "ukraine",
      "taiwan",
      "north korea",
      "middle east",
      "israel",
      "gaza",
      "houthi",
      "red sea",
      "south china sea",
      "pentagon",
      "weapons",
      "arms",
      "treaty",
      "alliance",
      "escalation",
      "tension",
      "retaliation",
      "proxy",
      "insurgent",
      "coup",
      "regime",
      "election",
      "trump",
      "biden",
      "president",
      "prime minister",
      "un security council",
      "g7",
      "g20",
      "brics",
    ],
    weight: 1.5,
  },
  {
    type: "commodity-shocks",
    keywords: [
      "oil price",
      "crude",
      "opec",
      "commodity",
      "gold price",
      "rare earth",
      "supply chain",
      "shortage",
      "natural gas",
      "wheat",
      "copper",
      "oil supply",
      "shipping lane",
      "route",
      "disruption",
      "supply disruption",
      "refinery",
      "barrel",
      "bpd",
      "production cut",
      "fuel",
      "energy crisis",
      "supply shock",
      "pipeline",
    ],
    weight: 1.4,
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
  description: string | null,
  sourceName: string,
  title: string
): string {
  if (!description || description.trim() === "") return title;
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

    const score = (Math.min(matchCount, 5) / 5) * rule.weight;
    if (score > bestScore) {
      bestScore = score;
      bestType = rule.type;
    }
  }

  if (!bestType || bestScore < 0.01) return null;

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
