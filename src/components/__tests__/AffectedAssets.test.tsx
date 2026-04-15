import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffectedAssets } from "../AffectedAssets";
import { AuthProvider } from "../AuthProvider";
import type { HistoricalMatch } from "@/lib/types";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
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
    const { container } = render(<AffectedAssets matches={[]} />, { wrapper: Wrapper });
    expect(container.innerHTML).toBe("");
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

  it("shows Trade on eToro and Watchlist buttons for each asset", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const tradeButtons = screen.getAllByRole("link", { name: /trade on etoro/i });
    const watchlistButtons = screen.getAllByText("Watchlist");
    expect(tradeButtons.length).toBe(3);
    expect(watchlistButtons.length).toBe(3);
  });

  it("shows direction indicators for each asset", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const cards = screen.getAllByRole("link", { name: /trade on etoro/i });
    expect(cards.length).toBe(3);
  });

  it("links Trade button to eToro", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const tradeLinks = screen.getAllByRole("link", { name: /trade on etoro/i });
    const firstTradeLink = tradeLinks[0];
    expect(firstTradeLink).toBeDefined();
    expect(firstTradeLink.getAttribute("href")).toContain("etoro.com/markets/");
    expect(firstTradeLink.getAttribute("target")).toBe("_blank");
  });

  it("Trade and Watchlist buttons have h-[48px] for correct eToro height", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const tradeLinks = screen.getAllByRole("link", { name: /trade on etoro/i });
    const watchlistLinks = screen.getAllByText("Watchlist");
    for (const el of [...tradeLinks, ...watchlistLinks]) {
      expect(el.className).toContain("h-[48px]");
    }
  });

  it("does not render standalone 'on eToro' label below buttons", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const onEtoroElements = screen.queryAllByText("on eToro");
    for (const el of onEtoroElements) {
      const parentLink = el.closest("a");
      expect(parentLink, "'on eToro' text should only appear inside a link button").toBeTruthy();
    }
  });

  it("Watchlist button has 1.5px border", () => {
    render(<AffectedAssets matches={matches} />, { wrapper: Wrapper });
    const watchlistLinks = screen.getAllByText("Watchlist");
    for (const el of watchlistLinks) {
      expect(el.className).toContain("border-[1.5px]");
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
