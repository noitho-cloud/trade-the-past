"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureException } from "@/lib/error-reporter";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { boundary: "root", digest: error.digest });
  }, [error]);
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-[11px] font-medium tracking-widest uppercase text-muted mb-4">
        Error
      </span>
      <h2 className="text-[24px] font-bold tracking-tight mb-3">
        Something went wrong
      </h2>
      <p className="text-sm text-muted max-w-sm mb-8 leading-relaxed">
        An unexpected error occurred. You can try again or head back to the
        weekly view.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="text-[16px] font-semibold bg-[var(--etoro-green)] text-white px-5 py-3 rounded-[48px]
                     hover:bg-[var(--etoro-green-hover)] active:scale-[0.99] transition-all cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to This Week
        </Link>
      </div>
    </div>
  );
}
