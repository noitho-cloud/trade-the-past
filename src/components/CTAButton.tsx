import type { EventType } from "@/lib/types";

const CTA_TEXT: Record<EventType, string> = {
  earnings: "View affected assets",
  layoffs: "View affected assets",
  lawsuits: "View affected assets",
  regulation: "Explore this sector",
  "interest-rates": "View rate-sensitive assets",
  geopolitical: "Explore affected markets",
  "commodity-shocks": "View commodity positions",
};

export function CTAButton({ eventType }: { eventType: EventType }) {
  return (
    <button
      className="w-full bg-foreground text-background py-3.5 px-6 rounded-lg font-medium
                 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer
                 text-[15px] tracking-tight"
    >
      {CTA_TEXT[eventType]}
    </button>
  );
}
