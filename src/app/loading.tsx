export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-9 w-40 bg-foreground/5 rounded" />
          <div className="h-4 w-64 bg-foreground/5 rounded mt-2" />
        </div>
        <div className="h-8 w-36 bg-foreground/5 rounded-lg" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-card-border bg-card"
          >
            <div className="flex items-stretch">
              <div className="w-20 shrink-0 border-r border-card-border py-4 flex flex-col items-center justify-center">
                <div className="h-3 w-8 bg-foreground/5 rounded" />
                <div className="h-5 w-6 bg-foreground/5 rounded mt-1" />
                <div className="h-2 w-8 bg-foreground/5 rounded mt-1" />
              </div>
              <div className="flex-1 p-4 flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-foreground/5 rounded" />
                  <div className="h-4 w-full bg-foreground/5 rounded" />
                  <div className="h-4 w-3/4 bg-foreground/5 rounded" />
                  <div className="h-5 w-20 bg-foreground/5 rounded-full mt-1" />
                </div>
                <div className="w-16 h-16 bg-foreground/5 rounded-lg shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
