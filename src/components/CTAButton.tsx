"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [showToast, setShowToast] = useState(false);

  const handleClick = useCallback(() => {
    setShowToast(true);
  }, []);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="w-full bg-foreground text-background py-3.5 px-6 rounded-lg font-medium
                   hover:bg-foreground/85 hover:scale-[1.01] active:scale-[0.99]
                   focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2
                   transition-all duration-200 ease-out cursor-pointer
                   text-[15px] tracking-tight"
      >
        {CTA_TEXT[eventType]}
      </button>

      {showToast && (
        <div
          className="mt-3 rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-muted
                     animate-[fadeIn_200ms_ease-out]"
        >
          Coming soon — asset discovery is on the way.
        </div>
      )}
    </div>
  );
}
