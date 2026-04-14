export default function EventLoading() {
  return (
    <article className="space-y-10 animate-pulse">
      <header className="space-y-4">
        <div className="h-4 w-24 bg-foreground/5 rounded" />

        <div className="w-full aspect-[2.4/1] rounded-xl bg-foreground/5" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-foreground/5 rounded-full" />
            <div className="h-3 w-40 bg-foreground/5 rounded" />
          </div>

          <div className="space-y-2">
            <div className="h-8 w-full bg-foreground/5 rounded" />
            <div className="h-8 w-2/3 bg-foreground/5 rounded" />
          </div>

          <div className="h-3 w-20 bg-foreground/5 rounded" />

          <div className="space-y-1.5">
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-4 w-3/4 bg-foreground/5 rounded" />
          </div>
        </div>
      </header>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-6 w-44 bg-foreground/5 rounded" />
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-4 pb-8 border-b border-border">
          <div>
            <div className="h-4 w-full bg-foreground/5 rounded" />
            <div className="h-3 w-12 bg-foreground/5 rounded mt-1.5" />
          </div>

          <div className="border-l-2 border-foreground/15 pl-4 space-y-1.5">
            <div className="h-3 w-full bg-foreground/5 rounded" />
            <div className="h-3 w-4/5 bg-foreground/5 rounded" />
          </div>

          <div className="bg-card border border-card-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-card-border bg-foreground/[0.02]">
              <div className="h-3 w-28 bg-foreground/5 rounded" />
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

          <div className="bg-foreground/[0.02] rounded-lg px-4 py-3 space-y-1.5">
            <div className="h-3 w-full bg-foreground/5 rounded" />
            <div className="h-3 w-2/3 bg-foreground/5 rounded" />
          </div>
        </div>
      </section>

      <div className="pt-2 pb-4">
        <div className="w-full h-12 bg-foreground/5 rounded-lg" />
      </div>
    </article>
  );
}
