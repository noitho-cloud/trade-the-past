import type { EventType } from "@/lib/types";

const PLACEHOLDER_COLORS: Record<EventType, string> = {
  earnings: "from-amber-100 to-amber-50",
  layoffs: "from-rose-100 to-rose-50",
  lawsuits: "from-violet-100 to-violet-50",
  regulation: "from-blue-100 to-blue-50",
  "interest-rates": "from-emerald-100 to-emerald-50",
  geopolitical: "from-orange-100 to-orange-50",
  "commodity-shocks": "from-stone-200 to-stone-100",
};

const PLACEHOLDER_ICONS: Record<EventType, string> = {
  earnings: "Earnings",
  layoffs: "Restructuring",
  lawsuits: "Legal",
  regulation: "Policy",
  "interest-rates": "Rates",
  geopolitical: "Global",
  "commodity-shocks": "Commodities",
};

export function EventImagePlaceholder({
  type,
  className = "",
}: {
  type: EventType;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${PLACEHOLDER_COLORS[type]} flex items-center justify-center ${className}`}
    >
      <span className="text-xs font-medium tracking-widest uppercase text-foreground/30">
        {PLACEHOLDER_ICONS[type]}
      </span>
    </div>
  );
}
