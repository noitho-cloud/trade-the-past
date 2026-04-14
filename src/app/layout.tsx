import type { Metadata } from "next";
import { Suspense } from "react";
import { HeaderLink } from "@/components/HeaderLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade the Past",
  description:
    "Today's market events paired with historical parallels and market reactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="bg-navy sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <Suspense
              fallback={
                <span className="text-lg font-bold tracking-tight text-white">
                  Trade the Past
                </span>
              }
            >
              <HeaderLink />
            </Suspense>
            <span className="text-[11px] tracking-widest uppercase text-white/60 font-medium">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-6 py-8">{children}</div>
        </main>

        <footer className="border-t border-border mt-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
            <span className="text-sm font-bold tracking-tight text-foreground/40">
              Trade the Past
            </span>
            <div>
              <h4 className="text-xs font-semibold tracking-wide uppercase text-muted mb-1.5">
                How it works
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Trade the Past aggregates headlines from major news sources,
                identifies the most market-moving event each day, and uses
                historical pattern matching to find similar past events. Market
                reaction data shows how affected assets performed after each
                historical parallel.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-wide uppercase text-muted mb-1.5">
                Sources
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                News from Reuters, Bloomberg, Financial Times, and other major
                financial outlets. Historical data from publicly available
                market records.
              </p>
            </div>
            <hr className="border-border" />
            <p className="text-[11px] text-muted/60 leading-relaxed">
              Historical data is illustrative and based on publicly available
              records. Past performance does not indicate future results. This
              is not financial advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
