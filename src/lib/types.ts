export const EVENT_TYPES = [
  "earnings",
  "layoffs",
  "lawsuits",
  "regulation",
  "interest-rates",
  "geopolitical",
  "commodity-shocks",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface MarketReaction {
  asset: string;
  direction: "up" | "down";
  day1Pct: number;
  week1Pct: number;
}

export interface HistoricalMatch {
  description: string;
  year: number;
  whySimilar: string;
  insight: string;
  reactions: MarketReaction[];
}

export interface MarketEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  scope: "global" | "local";
  historicalMatches: HistoricalMatch[];
}

export interface MarketEventSummary {
  id: string;
  title: string;
  type: EventType;
  date: string;
  summary: string;
  imageUrl: string | null;
  source: string;
}
