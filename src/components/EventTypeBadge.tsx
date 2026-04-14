import type { EventType } from "@/lib/types";

const BADGE_LABELS: Record<EventType, string> = {
  earnings: "Earnings",
  layoffs: "Layoffs",
  lawsuits: "Legal",
  regulation: "Regulation",
  "interest-rates": "Rates",
  geopolitical: "Geopolitical",
  "commodity-shocks": "Commodities",
};

const BADGE_STYLES: Record<EventType, { bg: string; textVar: string }> = {
  "interest-rates": { bg: "rgba(14,177,46,0.1)", textVar: "var(--badge-text-rates)" },
  earnings: { bg: "rgba(245,158,11,0.1)", textVar: "var(--badge-text-earnings)" },
  regulation: { bg: "rgba(59,130,246,0.1)", textVar: "var(--badge-text-regulation)" },
  lawsuits: { bg: "rgba(59,130,246,0.1)", textVar: "var(--badge-text-lawsuits)" },
  layoffs: { bg: "rgba(227,25,55,0.1)", textVar: "var(--badge-text-layoffs)" },
  geopolitical: { bg: "rgba(139,92,246,0.1)", textVar: "var(--badge-text-geopolitical)" },
  "commodity-shocks": { bg: "rgba(107,114,128,0.1)", textVar: "var(--badge-text-commodities)" },
};

export function EventTypeBadge({ type }: { type: EventType }) {
  const style = BADGE_STYLES[type];
  return (
    <span
      className="inline-block text-[11px] font-semibold uppercase tracking-wide rounded-full"
      style={{
        backgroundColor: style.bg,
        color: style.textVar,
        padding: "4px 10px",
      }}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
