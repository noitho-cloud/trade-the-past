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

function hasContradictoryReactions(matches: HistoricalMatch[]): boolean {
  if (matches.length < 2) return false;

  const assetDirections = new Map<string, Set<string>>();

  for (const match of matches) {
    for (const r of match.reactions) {
      const sign = r.day1Pct >= 0 ? "up" : "down";
      const existing = assetDirections.get(r.asset);
      if (existing) {
        existing.add(sign);
      } else {
        assetDirections.set(r.asset, new Set([sign]));
      }
    }
  }

  for (const directions of assetDirections.values()) {
    if (directions.size > 1) return true;
  }
  return false;
}

function ConsolidatedReactionTable({ matches }: { matches: HistoricalMatch[] }) {
  const consolidatedReactions = consolidateReactions(matches);
  return (
    <div className="bg-white rounded-[16px] shadow-[0_0_13px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--gray-border)] bg-[var(--gray-bg)]">
        <span className="text-xs font-semibold tracking-wide uppercase text-muted">
          Consolidated Market Reaction
        </span>
      </div>
      <MarketReactionTable reactions={consolidatedReactions} />
    </div>
  );
}

function PerMatchReactionTables({ matches }: { matches: HistoricalMatch[] }) {
  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div
          key={`${match.year}-${match.description.slice(0, 20)}`}
          className="bg-white rounded-[16px] shadow-[0_0_13px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-[var(--gray-border)] bg-[var(--gray-bg)]">
            <span className="text-xs font-semibold tracking-wide uppercase text-muted">
              {match.year}
            </span>
            <span className="text-xs text-muted ml-1.5">
              — {match.description}
            </span>
          </div>
          <MarketReactionTable reactions={match.reactions} />
        </div>
      ))}
    </div>
  );
}

export function UnifiedInsight({ matches }: { matches: HistoricalMatch[] }) {
  if (matches.length === 0) return null;

  const narrative = buildNarrative(matches);
  const takeaway = buildTakeaway(matches);
  const showPerMatch = hasContradictoryReactions(matches);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-[18px] font-semibold whitespace-nowrap">
          What History Tells Us
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-[15px] leading-relaxed text-foreground/85">
        {narrative}
      </p>

      {showPerMatch ? (
        <PerMatchReactionTables matches={matches} />
      ) : (
        <ConsolidatedReactionTable matches={matches} />
      )}

      <div className="bg-[#E8F5E9] border-l-4 border-[var(--etoro-green)] rounded-r-lg px-5 py-4 space-y-2">
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
