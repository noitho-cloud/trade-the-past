import type { EventType } from "./types";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  earnings: "Earnings Report",
  layoffs: "Layoffs / Restructuring",
  lawsuits: "Lawsuit / Legal Action",
  regulation: "Regulation / Policy Change",
  "interest-rates": "Interest Rate Decision",
  geopolitical: "Geopolitical Event",
  "commodity-shocks": "Commodity Shock",
};

export function buildHistoricalMatchPrompt(
  title: string,
  type: EventType,
  summary: string,
  source: string
): { system: string; user: string } {
  const system = `You are a financial historian and market analyst. Given a current market event, find 1-3 similar historical events and describe how markets reacted.

RULES:
- Only reference real, well-documented historical events
- ONLY include assets that are tradeable on eToro. Allowed types: US/EU stocks, major ETFs, major indices (S&P 500, FTSE 100, DAX, CAC 40, Euro STOXX 50), commodities (Gold, Oil, Brent Crude, Natural Gas), crypto (Bitcoin, Ethereum), major forex pairs (EUR/USD, GBP/USD, USD/JPY)
- DO NOT include: bonds (10Y Treasury, UK Gilt), sector sub-indices (S&P 500 Energy, STOXX 600 Tech, Euro STOXX Banks), USD Index, or stocks not available on eToro (e.g. Japanese or Australian stocks)
- Provide plausible Day 1 and Week 1 percentage changes based on historical records
- Keep percentages realistic (most single-day moves are under 5% for indices)
- Write concise, factual descriptions without speculation
- The "whySimilar" field should explain the structural similarity, not just surface-level resemblance

Respond with valid JSON matching this exact schema:
{
  "matches": [
    {
      "description": "Brief description of what happened",
      "year": 2020,
      "whySimilar": "Why this is structurally similar to the current event",
      "insight": "One key takeaway about the market reaction (1-2 sentences)",
      "reactions": [
        {
          "asset": "Asset name (e.g. S&P 500, Tesla, Gold, Brent Crude, Meta, Microsoft, Nvidia, EUR/USD)",
          "direction": "up" or "down",
          "day1Pct": 1.5,
          "week1Pct": 3.2
        }
      ]
    }
  ]
}`;

  const user = `Current event:
Title: ${title}
Type: ${EVENT_TYPE_LABELS[type]}
Source: ${source}
Summary: ${summary}

Find 1-3 similar historical events with market reaction data.`;

  return { system, user };
}
