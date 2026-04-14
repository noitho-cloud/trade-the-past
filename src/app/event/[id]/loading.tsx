export default function EventLoading() {
  return (
    <article className="space-y-10 animate-pulse">
      <header className="space-y-4">
        {/* Back link */}
        <div className="h-4 w-24 bg-foreground/5 rounded" />

        {/* Hero image */}
        <div className="w-full h-48 rounded-xl bg-foreground/5" />

        <div className="space-y-3">
          {/* Badge + date */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-foreground/5 rounded-full" />
            <div className="h-3 w-40 bg-foreground/5 rounded" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-full bg-foreground/5 rounded" />
            <div className="h-8 w-2/3 bg-foreground/5 rounded" />
          </div>

          {/* Source */}
          <div className="h-3 w-20 bg-foreground/5 rounded" />

          {/* Summary paragraph */}
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-4 w-3/4 bg-foreground/5 rounded" />
          </div>
        </div>
      </header>

      {/* What History Tells Us */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-48 bg-foreground/5 rounded" />
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Narrative paragraph */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-foreground/5 rounded" />
          <div className="h-4 w-full bg-foreground/5 rounded" />
          <div className="h-4 w-full bg-foreground/5 rounded" />
          <div className="h-4 w-2/3 bg-foreground/5 rounded" />
        </div>

        {/* Consolidated Market Reaction card */}
        <div className="bg-card rounded-[16px] border border-[var(--card-border)] shadow-[var(--card-shadow)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--gray-border)] bg-background">
            <div className="h-3 w-48 bg-foreground/5 rounded" />
          </div>
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-24 bg-foreground/5 rounded" />
                <div className="flex gap-4">
                  <div className="h-3 w-10 bg-foreground/5 rounded" />
                  <div className="h-3 w-10 bg-foreground/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaway callout */}
        <div className="bg-[var(--success-bg)] border-l-4 border-[var(--etoro-green)] rounded-r-lg px-5 py-4 space-y-2">
          <div className="h-3 w-28 bg-foreground/5 rounded" />
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-4 w-2/3 bg-foreground/5 rounded" />
          </div>
        </div>
      </section>

      {/* Affected Assets */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-6 w-36 bg-foreground/5 rounded" />
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[16px] bg-card border border-[var(--card-border)] p-[var(--space-xl)] flex flex-col gap-3 shadow-[var(--card-shadow)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="h-4 w-24 bg-foreground/5 rounded mb-1.5" />
                  <div className="h-5 w-16 bg-foreground/5 rounded-full" />
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <div className="h-2.5 w-8 bg-foreground/5 rounded mb-1" />
                  <div className="h-4 w-14 bg-foreground/5 rounded" />
                </div>
                <div>
                  <div className="h-2.5 w-10 bg-foreground/5 rounded mb-1" />
                  <div className="h-4 w-14 bg-foreground/5 rounded" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-foreground/5 rounded-[48px]" />
                  <div className="flex-1 h-12 bg-foreground/5 rounded-[48px]" />
                </div>
                <div className="h-3 w-16 bg-foreground/5 rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prev/Next navigation */}
      <nav className="border-t border-[var(--gray-border)] pt-6 mt-2">
        <div className="flex items-stretch justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-4 w-4 bg-foreground/5 rounded" />
            <div>
              <div className="h-3 w-16 bg-foreground/5 rounded mb-1" />
              <div className="h-4 w-32 bg-foreground/5 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="text-right">
              <div className="h-3 w-16 bg-foreground/5 rounded mb-1 ml-auto" />
              <div className="h-4 w-32 bg-foreground/5 rounded" />
            </div>
            <div className="h-4 w-4 bg-foreground/5 rounded" />
          </div>
        </div>
      </nav>
    </article>
  );
}
