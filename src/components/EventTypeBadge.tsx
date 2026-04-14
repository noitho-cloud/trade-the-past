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

export function EventTypeBadge({ type }: { type: EventType }) {
  return (
    <span
      className="inline-block text-[12px] font-semibold px-2 py-1 rounded-full bg-[var(--gray-bg)] text-[var(--gray-text)] border border-[var(--gray-border)]"
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
