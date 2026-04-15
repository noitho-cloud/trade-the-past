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
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--etoro-green)] bg-[var(--success-bg)] px-2 py-0.5 rounded-full">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L9 6H1L5 1Z" fill="currentColor" />
        </svg>
        Bullish
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--red)] bg-[var(--error-bg)] px-2 py-0.5 rounded-full">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 9L1 4H9L5 9Z" fill="currentColor" />
      </svg>
      Bearish
    </span>
  );
}

function PctDisplay({ value }: { value: number }) {
  const color = value >= 0 ? "text-[var(--etoro-green)]" : "text-[var(--red)]";
  const prefix = value > 0 ? "+" : "";
  return (
    <span className={`text-sm etoro-nums ${color}`}>
      {prefix}
      {value.toFixed(1)}%
    </span>
  );
}

function AssetCard({ asset }: { asset: ConsolidatedAsset }) {
  return (
    <div className="rounded-[16px] bg-card border border-[var(--card-border)] p-[var(--space-xl)] flex flex-col gap-3 shadow-[var(--card-shadow)]">
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

      <div className="flex flex-col md:flex-row gap-2 pt-1">
        <a
          href={getEtoroTradeUrl(asset.asset)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Trade on eToro"
          className="flex-1 inline-flex flex-col items-center justify-center bg-[var(--etoro-green)] text-white font-semibold h-[48px] px-6 rounded-[48px] whitespace-nowrap
                     hover:bg-[var(--etoro-green-hover)] active:scale-[0.98] transition-all text-center focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span className="text-[15px] leading-none">Trade</span>
          <span className="text-[10px] font-normal opacity-80 leading-none mt-0.5">on eToro</span>
        </a>
        <a
          href={getEtoroWatchlistUrl(asset.asset)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center border-[1.5px] border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] text-[16px] font-semibold h-[48px] px-6 rounded-[48px]
                     hover:bg-[var(--btn-secondary-hover)] active:scale-[0.98] transition-all text-center focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none"
        >
          Watchlist
        </a>
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
        <h2 className="font-semibold whitespace-nowrap" style={{ fontSize: 'clamp(16px, 4vw, 18px)' }}>
          Affected Assets
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map((asset) => (
          <AssetCard key={asset.asset} asset={asset} />
        ))}
      </div>
    </section>
  );
}
