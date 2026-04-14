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

  return (
    <div className="inline-flex items-center bg-foreground/[0.04] rounded-lg p-0.5">
      <button
        onClick={handleGlobal}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer
          ${
            scope === "global"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
      >
        Global
      </button>
      <button
        onClick={handleLocal}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer
          ${
            scope === "local"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
      >
        UK / DE / FR
      </button>
    </div>
  );
}
