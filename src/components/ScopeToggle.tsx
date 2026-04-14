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
    <div className="inline-flex items-center bg-[var(--gray-border)] rounded-full p-0.5">
      <button
        onClick={handleGlobal}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer
          ${
            scope === "global"
              ? "bg-navy text-white shadow-sm"
              : "text-[var(--gray-text)] hover:text-[var(--text-dark)]"
          }`}
      >
        Global
      </button>
      <button
        onClick={handleLocal}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer
          ${
            scope === "local"
              ? "bg-navy text-white shadow-sm"
              : "text-[var(--gray-text)] hover:text-[var(--text-dark)]"
          }`}
      >
        UK / DE / FR
      </button>
    </div>
  );
}
