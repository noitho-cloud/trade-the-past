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

export { consolidateReactions };
export type { ConsolidatedAsset };

function formatPct(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function buildTakeaway(
  matches: HistoricalMatch[],
  consolidated: ConsolidatedAsset[]
): string {
  if (matches.length === 1) {
    return matches[0].insight;
  }

  if (consolidated.length === 0) {
    return "Historical data is limited for this type of event.";
  }

  const upAssets = consolidated.filter((a) => a.week1Pct > 0);
  const downAssets = consolidated.filter((a) => a.week1Pct < 0);

  if (upAssets.length > 0 && downAssets.length === 0) {
    const top = upAssets.reduce((best, a) =>
      a.week1Pct > best.week1Pct ? a : best
    );
    return `Historical parallels suggest bullish momentum \u2014 ${top.asset} averaged ${formatPct(top.week1Pct)} over one week in similar past events.`;
  }

  if (downAssets.length > 0 && upAssets.length === 0) {
    const worst = downAssets.reduce((best, a) =>
      a.week1Pct < best.week1Pct ? a : best
    );
    return `Historical parallels suggest bearish pressure \u2014 ${worst.asset} averaged ${formatPct(worst.week1Pct)} over one week in similar past events.`;
  }

  const topUp = upAssets.reduce((best, a) =>
    a.week1Pct > best.week1Pct ? a : best
  );
  const topDown = downAssets.reduce((best, a) =>
    a.week1Pct < best.week1Pct ? a : best
  );
  return `Mixed signals \u2014 ${topUp.asset} tended up (${formatPct(topUp.week1Pct)} wk1) while ${topDown.asset} dropped (${formatPct(topDown.week1Pct)} wk1).`;
}

function buildUnifiedNarrative(matches: HistoricalMatch[]): string {
  if (matches.length === 1) {
    const m = matches[0];
    return `In a similar past event \u2014 the ${m.year} ${m.description.toLowerCase()} \u2014 ${m.insight.charAt(0).toLowerCase()}${m.insight.slice(1)}`;
  }

  const eventRefs = matches
    .map((m) => `the ${m.year} ${m.description.toLowerCase()}`)
    .join(" and ");

  const allReactions = matches.flatMap((m) => m.reactions);
  const assetMap = new Map<string, { sum: number; count: number }>();
  for (const r of allReactions) {
    const existing = assetMap.get(r.asset);
    if (existing) {
      existing.sum += r.week1Pct;
      existing.count++;
    } else {
      assetMap.set(r.asset, { sum: r.week1Pct, count: 1 });
    }
  }

  const assetSummaries: string[] = [];
  for (const [asset, data] of assetMap) {
    const avg = data.sum / data.count;
    const dir = avg >= 0 ? "gained" : "fell";
    const range = allReactions
      .filter((r) => r.asset === asset)
      .map((r) => Math.abs(r.week1Pct));
    const min = Math.min(...range);
    const max = Math.max(...range);
    if (min === max) {
      assetSummaries.push(`${asset} ${dir} ${min.toFixed(0)}\u2013${max.toFixed(0)}% in the following month`);
    } else {
      assetSummaries.push(`${asset} ${dir} ${min.toFixed(0)}\u2013${max.toFixed(0)}%`);
    }
  }

  const topAssets = assetSummaries.slice(0, 3).join(", ");

  return `In similar past events \u2014 ${eventRefs} \u2014 markets showed a clear pattern. ${topAssets} in the weeks that followed.`;
}

function ConsolidatedReactionTable({ matches }: { matches: HistoricalMatch[] }) {
  const consolidatedReactions = consolidateReactions(matches);
  return (
    <div className="bg-card rounded-[16px] border border-[var(--card-border)] shadow-[var(--card-shadow)] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--gray-border)] bg-background">
        <span className="text-xs font-semibold tracking-wide uppercase text-muted">
          Consolidated Market Reaction
        </span>
      </div>
      <MarketReactionTable reactions={consolidatedReactions} />
    </div>
  );
}

export function UnifiedInsight({ matches }: { matches: HistoricalMatch[] }) {
  if (matches.length === 0) return null;

  const consolidated = consolidateReactions(matches);
  const takeaway = buildTakeaway(matches, consolidated);
  const narrative = buildUnifiedNarrative(matches);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold whitespace-nowrap" style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>
          What History Tells Us
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-[15px] leading-relaxed text-foreground/85">
        {narrative}
      </p>

      <ConsolidatedReactionTable matches={matches} />

      <div className="bg-[var(--success-bg)] border-l-4 border-[var(--etoro-green)] rounded-r-lg px-5 py-4 space-y-2">
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
    </section>
  );
}
