"use client";

import { useCallback } from "react";

export function ScopeToggle({
  scope,
  onChange,
}: {
  scope: "global" | "local";
  onChange: (scope: "global" | "local") => void;
}) {
  const handleGlobal = useCallback(() => onChange("global"), [onChange]);
  const handleLocal = useCallback(() => onChange("local"), [onChange]);

  const active =
    "bg-[var(--card)] text-foreground shadow-sm";
  const inactive =
    "bg-transparent text-[var(--gray-text)] hover:text-foreground";

  return (
    <div className="inline-flex items-center h-9 bg-[var(--gray-border)] rounded-full p-0.5">
      <button
        onClick={handleGlobal}
        className={`px-3 h-full text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer ${
          scope === "global" ? active : inactive
        }`}
      >
        Global
      </button>
      <button
        onClick={handleLocal}
        className={`px-3 h-full text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer ${
          scope === "local" ? active : inactive
        }`}
      >
        UK / DE / FR
      </button>
    </div>
  );
}
