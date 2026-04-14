import type { EventType } from "@/lib/types";

const BADGE_STYLES: Record<EventType, string> = {
  earnings: "bg-amber-50 text-amber-800 border-amber-200",
  layoffs: "bg-rose-50 text-rose-800 border-rose-200",
  lawsuits: "bg-violet-50 text-violet-800 border-violet-200",
  regulation: "bg-blue-50 text-blue-800 border-blue-200",
  "interest-rates": "bg-emerald-50 text-emerald-800 border-emerald-200",
  geopolitical: "bg-orange-50 text-orange-800 border-orange-200",
  "commodity-shocks": "bg-stone-100 text-stone-800 border-stone-300",
};

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
      className={`inline-block text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border ${BADGE_STYLES[type]}`}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
