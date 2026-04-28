import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffectedAssets } from "../AffectedAssets";
import { AuthProvider } from "../AuthProvider";
import { ToastProvider } from "../ToastProvider";
import type { HistoricalMatch } from "@/lib/types";
import type { ReactNode } from "react";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ connected: false }), { status: 200 })
  );
});

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}

const matches: HistoricalMatch[] = [
  {
    description: "Fed pauses rate hikes",
    year: 2006,
    whySimilar: "Both mark end of tightening cycle.",
    insight: "S&P rallied after pause.",
    reactions: [
      { asset: "S&P 500", direction: "up", day1Pct: 1.1, week1Pct: 2.3 },
      { asset: "Gold", direction: "up", day1Pct: 0.9, week1Pct: 1.8 },
    ],
  },
  {
    description: "Fed signals cuts",
    year: 2019,
    whySimilar: "Dovish pivot.",
    insight: "Led to rate cuts.",
    reactions: [
      { asset: "S&P 500", direction: "up", day1Pct: 0.8, week1Pct: 1.9 },
      { asset: "EUR/USD", direction: "up", day1Pct: 0.4, week1Pct: 1.2 },
    ],
  },
];

describe("AffectedAssets", () => {
  it("renders nothing when no matches are provided", () => {
    render(<AffectedAssets matches={[]} />, { wrapper: Wrapper });
    expect(screen.queryByText("Affected Assets")).toBeNull();
  });

  it("renders the Affected Assets heading", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    expect(screen.getByText("Affected Assets")).toBeDefined();
  });

  it("shows all unique assets from matches", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    expect(screen.getByText("S&P 500")).toBeDefined();
    expect(screen.getByText("Gold")).toBeDefined();
    expect(screen.getByText("EUR/USD")).toBeDefined();
  });

  it("deduplicates assets that appear in multiple matches", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const spElements = screen.getAllByText("S&P 500");
    expect(spElements).toHaveLength(1);
  });

  it("shows Trade and Watchlist buttons for each asset", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const tradeButtons = screen.getAllByRole("button", { name: /trade .+ on etoro/i });
    const watchlistButtons = screen.getAllByRole("button", { name: /add .+ to watchlist/i });
    expect(tradeButtons.length).toBe(3);
    expect(watchlistButtons.length).toBe(3);
  });

  it("shows direction indicators for each asset", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const bullish = screen.getAllByText("Bullish");
    expect(bullish.length).toBeGreaterThan(0);
  });

  it("does not render standalone 'on eToro' label outside buttons", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const onEtoroElements = screen.queryAllByText("on eToro");
    for (const el of onEtoroElements) {
      const parentButton = el.closest("button");
      expect(parentButton, "'on eToro' text should only appear inside a button").toBeTruthy();
    }
  });

  it("Watchlist star icon renders as SVG inside each button", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const watchlistButtons = screen.getAllByRole("button", { name: /add .+ to watchlist/i });
    for (const el of watchlistButtons) {
      expect(el.querySelector("svg")).toBeTruthy();
    }
  });

  it("asset cards have border class for dark mode definition", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const headings = screen.getAllByText(/S&P 500|Gold|EUR\/USD/);
    for (const heading of headings) {
      const card = heading.closest("[class*='rounded-[16px]']");
      expect(card, "Card wrapper should exist").toBeTruthy();
      expect(card!.className).toContain("border");
    }
  });
});
