import type { HistoricalMatch, MarketReaction } from "@/lib/types";
import { MarketReactionTable } from "./MarketReactionTable";

interface ConsolidatedAsset extends MarketReaction {
  occurrences: number;
}

function consolidateReactions(matches: HistoricalMatch[]): ConsolidatedAsset[] {
  const assetMap = new Map<string, { total: MarketReaction; count: number }>();

  for (const match of matches) {
    for (const r of match.reactions) {
      const existing = assetMap.get(r.asset);
      if (existing) {
        existing.total.day1Pct += r.day1Pct;
        existing.total.week1Pct += r.week1Pct;
        existing.count++;
      } else {
        assetMap.set(r.asset, {
          total: { ...r },
          count: 1,
        });
      }
    }
  }

  return Array.from(assetMap.values()).map(({ total, count }) => ({
    asset: total.asset,
    direction: total.day1Pct / count >= 0 ? "up" : "down",
    day1Pct: Math.round((total.day1Pct / count) * 10) / 10,
    week1Pct: Math.round((total.week1Pct / count) * 10) / 10,
    occurrences: count,
  }));
}

function buildNarrative(matches: HistoricalMatch[]): string {
  if (matches.length === 1) {
    return `${matches[0].whySimilar} ${matches[0].insight}`;
  }

  const similarities = matches.map((m) => m.whySimilar).join(" ");
  const insights = matches.map((m) => m.insight).join(" ");
  return `${similarities} ${insights}`;
}

function buildTakeaway(matches: HistoricalMatch[]): string {
  if (matches.length === 1) {
    return matches[0].insight;
  }

  const directions = new Set(
    matches.flatMap((m) => m.reactions.map((r) => r.direction))
  );
  const dominantDirection =
    directions.size === 1 ? [...directions][0] : "mixed";

  if (dominantDirection === "up") {
    return "Historical precedents suggest a broadly positive market reaction to this type of event.";
  } else if (dominantDirection === "down") {
    return "Historical precedents suggest a broadly negative market reaction to this type of event.";
  }
  return "Historical precedents show mixed market reactions, with different asset classes moving in different directions.";
}

export function UnifiedInsight({ matches }: { matches: HistoricalMatch[] }) {
  if (matches.length === 0) return null;

  const consolidatedReactions = consolidateReactions(matches);
  const narrative = buildNarrative(matches);
  const takeaway = buildTakeaway(matches);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-xl font-semibold whitespace-nowrap">
          What History Tells Us
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-[15px] leading-relaxed text-foreground/85">
        {narrative}
      </p>

      <div className="bg-card border border-card-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-card-border bg-foreground/[0.02]">
          <span className="text-xs font-semibold tracking-wide uppercase text-muted">
            Consolidated Market Reaction
          </span>
        </div>
        <MarketReactionTable reactions={consolidatedReactions} />
      </div>

      <div className="bg-foreground/[0.06] border-l-4 border-foreground/25 rounded-r-lg px-5 py-4 space-y-2">
        <h3 className="text-xs font-semibold tracking-wide uppercase text-muted flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Key Takeaway
        </h3>
        <p className="text-sm font-medium leading-relaxed text-foreground/90">
          {takeaway}
        </p>
      </div>

      <div className="text-xs text-muted leading-relaxed">
        <span className="font-medium">Based on: </span>
        {matches.map((m, i) => (
          <span key={`${m.year}-${m.description.slice(0, 20)}`}>
            {m.description} ({m.year})
            {i < matches.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    </section>
  );
}
