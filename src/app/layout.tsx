import type { Metadata } from "next";
import { Suspense } from "react";
import { HeaderLink } from "@/components/HeaderLink";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider } from "@/components/AuthProvider";
import { LoginButton } from "@/components/LoginButton";
import { ConnectEtoroModal } from "@/components/ConnectEtoroModal";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export const metadata: Metadata = {
  title: {
    template: "%s — Trade the Past",
    default: "Trade the Past",
  },
  description:
    "Today's market events paired with historical parallels and market reactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://marketing.etorostatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://marketing.etorostatic.com/cache1/fonts/etoro/eToro-VF-v0.7.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
          <ToastProvider>
          <header className="bg-[var(--header-bg)] sticky top-0 z-10">
            <div className="max-w-[720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <Suspense
                fallback={
                  <span className="text-lg font-bold tracking-tight text-[var(--header-text)]">Trade the Past</span>
                }
              >
                <HeaderLink />
              </Suspense>
              <div className="flex items-center gap-2">
                <LoginButton />
                <ThemeToggle />
              </div>
            </div>
            <div className="border-b border-[var(--border)]" />
          </header>

          <main className="flex-1">
            <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
          </main>

          <footer className="border-t border-border mt-auto">
            <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
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
                  News aggregated from Reuters, CNBC, BBC, Yahoo Finance, and
                  other major financial outlets via Google News. Historical data
                  from publicly available market records.
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
          <ConnectEtoroModal />
          </ToastProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
