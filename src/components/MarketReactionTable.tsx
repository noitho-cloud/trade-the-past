import type { MarketReaction } from "@/lib/types";

function DirectionArrow({ direction }: { direction: "up" | "down" }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--etoro-green)] font-medium">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
          <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
        </svg>
        Up
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[var(--red)] font-medium">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
        <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
      </svg>
      Down
    </span>
  );
}

function PctCell({ value }: { value: number }) {
  const color = value >= 0 ? "text-[var(--etoro-green)]" : "text-[var(--red)]";
  const prefix = value > 0 ? "+" : "";
  return (
    <td className={`px-4 py-2.5 text-right tabular-nums ${color}`}>
      {prefix}
      {value.toFixed(1)}%
    </td>
  );
}

export function MarketReactionTable({
  reactions,
}: {
  reactions: MarketReaction[];
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-foreground/10">
            <th className="text-left px-4 py-2 text-xs font-semibold tracking-wide uppercase text-muted">
              Asset
            </th>
            <th className="text-left px-4 py-2 text-xs font-semibold tracking-wide uppercase text-muted">
              Direction
            </th>
            <th className="text-right px-4 py-2 text-xs font-semibold tracking-wide uppercase text-muted">
              Day 1
            </th>
            <th className="text-right px-4 py-2 text-xs font-semibold tracking-wide uppercase text-muted">
              Week 1
            </th>
          </tr>
        </thead>
        <tbody>
          {reactions.map((r) => (
            <tr
              key={r.asset}
              className="border-b border-foreground/5 last:border-0 even:bg-[var(--table-stripe)]"
            >
              <td className="px-4 py-2.5 font-medium">{r.asset}</td>
              <td className="px-4 py-2.5">
                <DirectionArrow direction={r.direction} />
              </td>
              <PctCell value={r.day1Pct} />
              <PctCell value={r.week1Pct} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
