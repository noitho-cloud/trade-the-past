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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border">
          <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <h1 className="font-serif text-xl font-semibold tracking-tight">
                Trade the Past
              </h1>
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-8">{children}</div>
        </main>

        <footer className="border-t border-border mt-auto">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <p className="text-xs text-muted">
              Historical data is illustrative. Past performance does not
              indicate future results.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
