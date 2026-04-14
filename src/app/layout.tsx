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
          <div className="max-w-2xl mx-auto px-6 py-5">
            <p className="text-[11px] text-muted leading-relaxed">
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
