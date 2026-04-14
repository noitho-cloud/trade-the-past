import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-[11px] font-medium tracking-widest uppercase text-muted mb-4">
        404
      </span>
      <h2 className="text-[24px] font-bold tracking-tight mb-3">
        Page not found
      </h2>
      <p className="text-sm text-muted max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors group"
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
  );
}
