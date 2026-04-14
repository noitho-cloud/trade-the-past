import type { HistoricalMatch } from "@/lib/types";
import { getEtoroTradeUrl, getEtoroWatchlistUrl } from "@/lib/etoro-slugs";

interface ConsolidatedAsset {
  asset: string;
  direction: "up" | "down";
  day1Pct: number;
  week1Pct: number;
}

function consolidateAssets(matches: HistoricalMatch[]): ConsolidatedAsset[] {
  const assetMap = new Map<
    string,
    { day1Sum: number; week1Sum: number; count: number }
  >();

  for (const match of matches) {
    for (const r of match.reactions) {
      const existing = assetMap.get(r.asset);
      if (existing) {
        existing.day1Sum += r.day1Pct;
        existing.week1Sum += r.week1Pct;
        existing.count++;
      } else {
        assetMap.set(r.asset, {
          day1Sum: r.day1Pct,
          week1Sum: r.week1Pct,
          count: 1,
        });
      }
    }
  }

  return Array.from(assetMap.entries()).map(([asset, data]) => {
    const avgDay1 = Math.round((data.day1Sum / data.count) * 10) / 10;
    const avgWeek1 = Math.round((data.week1Sum / data.count) * 10) / 10;
    return {
      asset,
      direction: avgDay1 >= 0 ? "up" : "down",
      day1Pct: avgDay1,
      week1Pct: avgWeek1,
    };
  });
}

function DirectionBadge({ direction }: { direction: "up" | "down" }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9 6H1L5 1Z" fill="currentColor" />
        </svg>
        Bullish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 9L1 4H9L5 9Z" fill="currentColor" />
      </svg>
      Bearish
    </span>
  );
}

function PctDisplay({ value }: { value: number }) {
  const color = value >= 0 ? "text-emerald-700" : "text-red-600";
  const prefix = value > 0 ? "+" : "";
  return (
    <span className={`text-sm font-semibold tabular-nums ${color}`}>
      {prefix}
      {value.toFixed(1)}%
    </span>
  );
}

function EtoroLabel() {
  return (
    <span className="text-[10px] text-muted tracking-wide">on eToro</span>
  );
}

function AssetCard({ asset }: { asset: ConsolidatedAsset }) {
  return (
    <div className="rounded-lg border border-card-border bg-card p-4 flex flex-col gap-3 hover:border-foreground/15 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-[15px] leading-snug">
            {asset.asset}
          </h3>
          <DirectionBadge direction={asset.direction} />
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted block">
            Day 1
          </span>
          <PctDisplay value={asset.day1Pct} />
        </div>
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted block">
            Week 1
          </span>
          <PctDisplay value={asset.week1Pct} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex gap-2">
          <a
            href={getEtoroTradeUrl(asset.asset)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-foreground text-background text-xs font-medium py-2 px-3 rounded-md
                       hover:bg-foreground/85 active:scale-[0.98] transition-all text-center"
          >
            Trade
          </a>
          <a
            href={getEtoroWatchlistUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-foreground/20 text-foreground text-xs font-medium py-2 px-3 rounded-md
                       hover:bg-foreground/5 active:scale-[0.98] transition-all text-center"
          >
            Watchlist
          </a>
        </div>
        <div className="text-center">
          <EtoroLabel />
        </div>
      </div>
    </div>
  );
}

export function AffectedAssets({ matches }: { matches: HistoricalMatch[] }) {
  if (matches.length === 0) return null;

  const assets = consolidateAssets(matches);
  if (assets.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-xl font-semibold whitespace-nowrap">
          Affected Assets
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map((asset) => (
          <AssetCard key={asset.asset} asset={asset} />
        ))}
      </div>
    </section>
  );
}
