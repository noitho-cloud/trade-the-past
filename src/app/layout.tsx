import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="group">
              <h1 className="font-serif text-lg font-semibold tracking-tight">
                Trade the Past
              </h1>
            </Link>
            <span className="text-[11px] tracking-widest uppercase text-muted font-medium">
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
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-muted/70 mb-1">
                How it works
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Trade the Past aggregates headlines from major news sources,
                identifies the most market-moving event each day, and uses
                historical pattern matching to find similar past events. Market
                reaction data shows how affected assets performed after each
                historical parallel.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-muted/70 mb-1">
                Sources
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                News from Reuters, Bloomberg, Financial Times, and other major
                financial outlets. Historical data from publicly available
                market records.
              </p>
            </div>
            <hr className="border-border" />
            <p className="text-[10px] text-muted/60 leading-relaxed">
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
