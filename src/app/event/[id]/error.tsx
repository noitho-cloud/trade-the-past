"use client";

import Link from "next/link";

export default function EventError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-[11px] font-medium tracking-widest uppercase text-muted mb-4">
        Error
      </span>
      <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight mb-3">
        Could not load this event
      </h2>
      <p className="text-sm text-muted max-w-sm mb-8 leading-relaxed">
        We ran into a problem loading the event details. You can try again or
        head back to the weekly view.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-lg
                     hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
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
