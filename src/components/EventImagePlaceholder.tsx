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

function PlaceholderIcon({ type, size }: { type: EventType; size: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "earnings":
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="M7 16l4-6 4 4 5-8" />
        </svg>
      );
    case "layoffs":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="17" y1="8" x2="23" y2="14" />
          <line x1="23" y1="8" x2="17" y2="14" />
        </svg>
      );
    case "lawsuits":
      return (
        <svg {...props}>
          <path d="M12 3l9 4.5v0a1 1 0 01-1 1H4a1 1 0 01-1-1v0L12 3z" />
          <path d="M4 8.5v8" />
          <path d="M8 8.5v8" />
          <path d="M12 8.5v8" />
          <path d="M16 8.5v8" />
          <path d="M20 8.5v8" />
          <path d="M2 20h20" />
          <path d="M2 16.5h20" />
        </svg>
      );
    case "regulation":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      );
    case "interest-rates":
      return (
        <svg {...props}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      );
    case "geopolitical":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      );
    case "commodity-shocks":
      return (
        <svg {...props}>
          <path d="M12 2c1 3 4 5.5 4 8.5a4 4 0 11-8 0C8 7.5 11 5 12 2z" />
          <path d="M12 12c.5 1.5 2 2.5 2 4a2 2 0 11-4 0c0-1.5 1.5-2.5 2-4z" />
        </svg>
      );
  }
}

export function EventImagePlaceholder({
  type,
  className = "",
}: {
  type: EventType;
  className?: string;
}) {
  const isHero = className.includes("h-48");
  const iconSize = isHero ? 48 : 24;

  return (
    <div
      className={`bg-gradient-to-br ${PLACEHOLDER_COLORS[type]} flex items-center justify-center relative overflow-hidden ${className}`}
    >
      {isHero && (
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      )}
      <div className="text-foreground/20">
        <PlaceholderIcon type={type} size={iconSize} />
      </div>
    </div>
  );
}
