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

const BADGE_COLORS: Record<EventType, { bg: string; text: string }> = {
  "interest-rates": { bg: "rgba(14,177,46,0.1)", text: "#0EB12E" },
  earnings: { bg: "rgba(245,158,11,0.1)", text: "#B45309" },
  regulation: { bg: "rgba(59,130,246,0.1)", text: "#1D4ED8" },
  lawsuits: { bg: "rgba(59,130,246,0.1)", text: "#1D4ED8" },
  layoffs: { bg: "rgba(227,25,55,0.1)", text: "#E31937" },
  geopolitical: { bg: "rgba(139,92,246,0.1)", text: "#6D28D9" },
  "commodity-shocks": { bg: "rgba(107,114,128,0.1)", text: "#374151" },
};

export function EventTypeBadge({ type }: { type: EventType }) {
  const colors = BADGE_COLORS[type];
  return (
    <span
      className="inline-block text-[11px] font-semibold uppercase tracking-wide rounded-full"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: "4px 10px",
      }}
    >
      {BADGE_LABELS[type]}
    </span>
  );
}
